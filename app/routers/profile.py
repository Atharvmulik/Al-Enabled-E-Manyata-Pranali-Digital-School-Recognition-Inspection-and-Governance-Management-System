"""
app/routers/profile.py
─────────────────────────────────────────────────────────────────────────────
All endpoints for the 9-step School Profile Page — backed by Firestore.
Validation is intentionally disabled for development/testing purposes.

NEW in this version:
  - Profile document upload via Cloudinary (per-section, mandatory)
  - GET  /profile/documents              → list all uploaded profile docs
  - POST /profile/upload-document        → upload a profile document
  - DELETE /profile/documents/{doc_id}   → delete a profile document
  - GET  /profile/pdf                    → generate & download profile PDF
  - Transportation step fixed: fitness_cert and permit are now file uploads
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from firebase_admin import firestore
from typing import List, Optional
import uuid
import io
import os
import re
import logging
from app.models import create_notification
from datetime import datetime, timezone

from app.routers.auth import get_current_user
from app.cloudinary_service import upload_file
from cloudinary.uploader import destroy

from app.models import (
    get_db,
    school_ref, sub_col, sub_doc,
    default_meta,
    default_basic_details, default_receipts_expenditure,
    default_legal_details, default_location, default_infrastructure,
    default_staff_summary, default_safety, default_vocational_education,
    default_teacher, default_non_teaching_staff,
    default_vocational_staff, default_student,
    COL_SCHOOLS,
    SUB_TEACHERS, SUB_NON_TEACHING, SUB_VOC_STAFF,
    SUB_STUDENTS, SUB_SECTION_CONFIGS, SUB_GRANTS, SUB_ASSISTANCE,
    SUB_VOC_ROWS, SUB_VOC_LABS, SUB_ANGANWADI,
    SUB_SEC_156, SUB_SEC_157, SUB_HS_LABS,
    SUB_DIGITAL_EQUIP, SUB_DIGITAL_FACILITIES, SUB_DOCUMENTS,
    update_step_completion,
)
from app.schemas import (
    BasicDetailsSchema, ReceiptsExpenditureSchema, LegalDetailsSchema,
    LocationSchema, InfrastructureSchema, StaffSchema, SafetySchema,
    StudentCapacitySchema, StudentProfileSchema, VocationalEducationSchema,
    FullProfileSubmitSchema, MessageResponse, ProfileStatusResponse,
    TeacherDetailSchema, NonTeachingStaffSchema, VocationalStaffSchema,
    StaffCountRow, StaffRequiredRow,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/profile", tags=["School Profile"])

# ─────────────────────────────────────────────────────────────────────────────
# Sub-collection name for profile documents
# (add  SUB_PROFILE_DOCUMENTS = "profile_documents"  to models.py constants)
# ─────────────────────────────────────────────────────────────────────────────
SUB_PROFILE_DOCUMENTS = "profile_documents"

# ─────────────────────────────────────────────────────────────────────────────
# Allowed MIME types & max size (mirrors registration.py)
# ─────────────────────────────────────────────────────────────────────────────
ALLOWED_MIME_TYPES = {"application/pdf", "image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024   # 5 MB

# ─────────────────────────────────────────────────────────────────────────────
# Document type catalogue
# Each entry: document_type → human-readable label
# Grouped by which profile step/condition triggers the upload requirement.
# ─────────────────────────────────────────────────────────────────────────────
PROFILE_DOCUMENT_LABELS = {
    # Basic Details (Step 1)
    "registration_certificate":     "Registration Certificate",
    "trust_certificate":            "Trust/Society Certificate",
    "land_document": "Land Document / Lease Deed",
    "noc_certificate": "NOC Certificate",
    "building_approval": "Building Approval",
    "recognition_certificate":      "Current Recognition Certificate(s)",
    "smc_member_list":              "List of SMC/SDMC Members",
    "school_development_plan":      "School Development Plan",
    "fit_india_certificate":        "Fit India Certificate",
    "cumulative_record_sample":     "Sample Cumulative Record / Progress Report",
    "safety_access_plan":           "Safety Access Plan (No All-Weather Road)",
    # Receipts & Expenditure (Step 2)
    "water_quality_test_report":    "Water Quality Test Report",
    # Infrastructure (Step 5)
    "structural_stability_cert":    "Structural Stability Certificate",
    "building_fitness_cert":        "Building Fitness Certificate (PWD)",
    "building_repair_plan":         "Building Repair Plan / Quote",
    "hostel_fire_safety_cert":      "Hostel Fire Safety Certificate",
    "hostel_fssai_license":         "Hostel Food Safety (FSSAI) License",
    "hostel_warden_identity":       "Hostel Warden Details / Identity",
    "lab_photos_equipment_list":    "Lab Photos / Equipment List",
    # Safety (Step 7)
    "sdmp_document":                "School Disaster Management Plan (SDMP)",
    "structural_safety_cert":       "Structural Safety Certificate (PWD)",
    "fire_dept_certificate":        "Fire Department Certificate",
    "sssa_certificate":             "SSSA Self-Certification",
    # Transportation (Step 10) — NOW FILE UPLOADS
    "transport_fitness_certificate": "Vehicle Fitness Certificate",
    "transport_permit":             "Transport Permit",
}

# ─────────────────────────────────────────────
# Auth dependency
# ─────────────────────────────────────────────

def get_current_school_id(user_id: str = Depends(get_current_user)):
    return user_id


# ─────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────

def _ensure_school(db, school_id: str):
    ref = school_ref(db, school_id)
    if not ref.get().exists:
        ref.set(default_meta())


def _delete_sub_collection(db, school_id: str, sub: str):
    docs = sub_col(db, school_id, sub).stream()
    batch = db.batch()
    count = 0
    for doc in docs:
        batch.delete(doc.reference)
        count += 1
        if count == 500:
            batch.commit()
            batch = db.batch()
            count = 0
    if count:
        batch.commit()


def _doc_to_dict(doc) -> dict:
    if not doc.exists:
        return {}
    data = doc.to_dict()
    data["id"] = doc.id
    return data


def _col_to_list(col_ref) -> list:
    return [_doc_to_dict(d) for d in col_ref.stream()]


def _validate_mime(content_type: str):
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            415,
            detail=f"File type '{content_type}' not allowed. Use PDF, JPG, PNG or WEBP.",
        )


def _validate_size(data: bytes):
    if len(data) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(413, detail="File exceeds the 5 MB limit.")


def _sanitize_filename(name: str) -> str:
    name = os.path.basename(name)
    name = re.sub(r"[^\w.\-]", "_", name)
    return name[:200]


def _format_ts(ts) -> Optional[str]:
    if ts is None:
        return None
    try:
        return ts.astimezone(timezone.utc).strftime("%d %b %Y, %H:%M UTC")
    except Exception:
        return str(ts)


# ══════════════════════════════════════════════
# STATUS
# ══════════════════════════════════════════════

@router.get("/status", response_model=ProfileStatusResponse)
def get_profile_status(
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    snap = school_ref(db, school_id).get()
    if not snap.exists:
        return ProfileStatusResponse(school_id=school_id, completed_steps=[])

    data = snap.to_dict() or {}
    step_completion = data.get("step_completion", {})
    completed = [step for step, done in step_completion.items() if done]

    if any(True for _ in sub_col(db, school_id, SUB_SECTION_CONFIGS).limit(1).stream()):
        completed.append("student_capacity")

    return {
        "school_id": school_id,
        "completed_steps": completed,
        "submitted": data.get("is_submitted", False),
        "pdf_url": f"/profile/pdf" if data.get("is_submitted") else None
    }


# ══════════════════════════════════════════════
# STEP 1 – BASIC DETAILS
# ══════════════════════════════════════════════

@router.get("/basic-details")
def get_basic_details(
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    snap = school_ref(db, school_id).get()
    if not snap.exists:
        return {}
    data = snap.to_dict() or {}
    result = data.get("basic_details", {})
    result["anganwadi_rows"] = _col_to_list(sub_col(db, school_id, SUB_ANGANWADI))
    result["sec_156"] = _col_to_list(sub_col(db, school_id, SUB_SEC_156))
    result["sec_157"] = _col_to_list(sub_col(db, school_id, SUB_SEC_157))
    return result


@router.get("/verify-udise")
def verify_udise(
    udise_number: str,
    user_id: str = Depends(get_current_user),
    db=Depends(get_db),
):
    if not udise_number:
        return {"is_valid": True}
    user_doc = db.collection("users").document(user_id).get()
    if not user_doc.exists:
        return {"is_valid": True}
    stored_udise = user_doc.to_dict().get("udise_number")
    return {"is_valid": stored_udise == udise_number}


@router.put("/basic-details", response_model=MessageResponse)
def save_basic_details(
    payload: BasicDetailsSchema,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    _ensure_school(db, school_id)
    ref = school_ref(db, school_id)

    exclude = {"hos", "management", "anganwadi_rows", "sec_156", "sec_157", "multi_class_rows"}
    flat = {k: v for k, v in payload.dict(exclude=exclude).items()}

    if payload.hos:
        flat.update(payload.hos.dict())
    if payload.management:
        flat.update(payload.management.dict())

    data = {**default_basic_details(), **{k: v for k, v in flat.items() if v is not None}}
    ref.update({"basic_details": data, "updated_at": firestore.SERVER_TIMESTAMP})

    if payload.anganwadi_rows is not None:
        _delete_sub_collection(db, school_id, SUB_ANGANWADI)
        batch = db.batch()
        for row in payload.anganwadi_rows:
            batch.set(sub_col(db, school_id, SUB_ANGANWADI).document(), row.dict())
        batch.commit()

    if payload.sec_156 is not None:
        _delete_sub_collection(db, school_id, SUB_SEC_156)
        batch = db.batch()
        for i, row in enumerate(payload.sec_156):
            batch.set(sub_col(db, school_id, SUB_SEC_156).document(), {"row_index": i, **row.dict()})
        batch.commit()

    if payload.sec_157 is not None:
        _delete_sub_collection(db, school_id, SUB_SEC_157)
        batch = db.batch()
        for i, row in enumerate(payload.sec_157):
            batch.set(sub_col(db, school_id, SUB_SEC_157).document(), {"row_index": i, **row.dict()})
        batch.commit()

    update_step_completion(db, school_id, "basic_details")
    return MessageResponse(message="Basic details saved successfully")


# ══════════════════════════════════════════════
# STEP 2 – RECEIPTS & EXPENDITURE
# ══════════════════════════════════════════════

@router.get("/receipts-expenditure")
def get_receipts_expenditure(
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    snap = school_ref(db, school_id).get()
    data = (snap.to_dict() or {}) if snap.exists else {}
    return {
        "receipts_expenditure": data.get("receipts_expenditure", {}),
        "grants":     _col_to_list(sub_col(db, school_id, SUB_GRANTS)),
        "assistance": _col_to_list(sub_col(db, school_id, SUB_ASSISTANCE)),
    }


@router.put("/receipts-expenditure", response_model=MessageResponse)
def save_receipts_expenditure(
    payload: ReceiptsExpenditureSchema,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    _ensure_school(db, school_id)
    ref = school_ref(db, school_id)
    exp_data = {
        **default_receipts_expenditure(),
        "exp_maintenance":  payload.exp_maintenance,
        "exp_teachers":     payload.exp_teachers,
        "exp_construction": payload.exp_construction,
        "exp_others":       payload.exp_others,
    }
    ref.update({"receipts_expenditure": exp_data, "updated_at": firestore.SERVER_TIMESTAMP})

    _delete_sub_collection(db, school_id, SUB_GRANTS)
    if payload.grants:
        batch = db.batch()
        for g in payload.grants:
            batch.set(sub_col(db, school_id, SUB_GRANTS).document(), g.dict())
        batch.commit()

    _delete_sub_collection(db, school_id, SUB_ASSISTANCE)
    if payload.assistance:
        batch = db.batch()
        for a in payload.assistance:
            batch.set(sub_col(db, school_id, SUB_ASSISTANCE).document(), a.dict())
        batch.commit()

    update_step_completion(db, school_id, "receipts_expenditure")
    return MessageResponse(message="Receipts & expenditure saved successfully")


# ══════════════════════════════════════════════
# STEP 3 – LEGAL DETAILS
# ══════════════════════════════════════════════

@router.get("/legal-details")
def get_legal_details(
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    snap = school_ref(db, school_id).get()
    data = (snap.to_dict() or {}) if snap.exists else {}
    return {
        "legal_details":   data.get("legal_details", {}),
        "vocational_rows": _col_to_list(sub_col(db, school_id, SUB_VOC_ROWS)),
    }


@router.put("/legal-details", response_model=MessageResponse)
def save_legal_details(
    payload: LegalDetailsSchema,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    _ensure_school(db, school_id)
    ref = school_ref(db, school_id)
    legal_data = {
        **default_legal_details(),
        "recognition_number": payload.recognition_number,
        "recognition_date":   payload.recognition_date,
        "affiliation_number": payload.affiliation_number,
    }
    ref.update({"legal_details": legal_data, "updated_at": firestore.SERVER_TIMESTAMP})

    _delete_sub_collection(db, school_id, SUB_VOC_ROWS)
    if payload.vocational_rows:
        batch = db.batch()
        for row in payload.vocational_rows:
            batch.set(sub_col(db, school_id, SUB_VOC_ROWS).document(), row.dict())
        batch.commit()

    update_step_completion(db, school_id, "legal_details")
    return MessageResponse(message="Legal details saved successfully")


# ══════════════════════════════════════════════
# STEP 4 – LOCATION
# ══════════════════════════════════════════════

@router.get("/location")
def get_location(
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    snap = school_ref(db, school_id).get()
    if not snap.exists:
        return {}
    return (snap.to_dict() or {}).get("location", {})


@router.put("/location", response_model=MessageResponse)
def save_location(
    payload: LocationSchema,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    _ensure_school(db, school_id)
    location_data = {**default_location(), **{k: v for k, v in payload.dict().items() if v is not None}}
    school_ref(db, school_id).update({"location": location_data, "updated_at": firestore.SERVER_TIMESTAMP})
    update_step_completion(db, school_id, "location")
    return MessageResponse(message="Location saved successfully")


# ══════════════════════════════════════════════
# STEP 5 – INFRASTRUCTURE
# ══════════════════════════════════════════════

@router.get("/infrastructure")
def get_infrastructure(
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    snap = school_ref(db, school_id).get()
    data = (snap.to_dict() or {}) if snap.exists else {}
    return {
        "infrastructure":         data.get("infrastructure", {}),
        "higher_secondary_labs":  _col_to_list(sub_col(db, school_id, SUB_HS_LABS)),
        "digital_equip_items":    _col_to_list(sub_col(db, school_id, SUB_DIGITAL_EQUIP)),
        "digital_teaching_tools": _col_to_list(sub_col(db, school_id, SUB_DIGITAL_FACILITIES)),
    }


@router.put("/infrastructure", response_model=MessageResponse)
def save_infrastructure(
    payload: InfrastructureSchema,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    _ensure_school(db, school_id)
    exclude = {"higher_secondary_labs", "digital_equip_items", "digital_teaching_tools"}
    flat = {k: v for k, v in payload.dict(exclude=exclude).items()}
    flat["classroom_conditions"] = {
        "pucca_good": payload.cond_pucca_good,
        "pucca_minor": payload.cond_pucca_minor,
        "pucca_major": payload.cond_pucca_major,
        "partially_pucca_good": payload.cond_partially_pucca_good,
        "partially_pucca_minor": payload.cond_partially_pucca_minor,
        "partially_pucca_major": payload.cond_partially_pucca_major,
        "kuchcha_good": payload.cond_kuchcha_good,
        "kuchcha_minor": payload.cond_kuchcha_minor,
        "kuchcha_major": payload.cond_kuchcha_major,
        "tent_good": payload.cond_tent_good,
        "tent_minor": payload.cond_tent_minor,
        "tent_major": payload.cond_tent_major,
    }
    infra_data = {**default_infrastructure(), **{k: v for k, v in flat.items() if v is not None}}
    school_ref(db, school_id).update({"infrastructure": infra_data, "updated_at": firestore.SERVER_TIMESTAMP})

    _delete_sub_collection(db, school_id, SUB_HS_LABS)
    if payload.higher_secondary_labs:
        batch = db.batch()
        for lab in payload.higher_secondary_labs:
            batch.set(sub_col(db, school_id, SUB_HS_LABS).document(), lab.dict())
        batch.commit()

    _delete_sub_collection(db, school_id, SUB_DIGITAL_EQUIP)
    if payload.digital_equip_items:
        batch = db.batch()
        for item in payload.digital_equip_items:
            batch.set(sub_col(db, school_id, SUB_DIGITAL_EQUIP).document(), item.dict())
        batch.commit()

    _delete_sub_collection(db, school_id, SUB_DIGITAL_FACILITIES)
    if payload.digital_teaching_tools:
        batch = db.batch()
        for fac in payload.digital_teaching_tools:
            batch.set(sub_col(db, school_id, SUB_DIGITAL_FACILITIES).document(), fac.dict())
        batch.commit()

    update_step_completion(db, school_id, "infrastructure")
    return MessageResponse(message="Infrastructure saved successfully")


# ══════════════════════════════════════════════
# STEP 6 – STAFF
# ══════════════════════════════════════════════

@router.get("/staff")
def get_staff(
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    snap = school_ref(db, school_id).get()
    data = (snap.to_dict() or {}) if snap.exists else {}
    return {
        "staff_summary":      data.get("staff_summary", {}),
        "teachers":           _col_to_list(sub_col(db, school_id, SUB_TEACHERS)),
        "non_teaching_staff": _col_to_list(sub_col(db, school_id, SUB_NON_TEACHING)),
        "vocational_staff":   _col_to_list(sub_col(db, school_id, SUB_VOC_STAFF)),
    }


@router.put("/staff/summary", response_model=MessageResponse)
def save_staff_summary(
    counts: StaffCountRow,
    required: StaffRequiredRow,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    _ensure_school(db, school_id)
    summary = {
        **default_staff_summary(),
        "count_regular":             counts.regular,
        "count_non_regular":         counts.non_regular,
        "count_non_teaching":        counts.non_teaching,
        "count_vocational":          counts.vocational,
        "required_pre_primary":      required.pre_primary,
        "required_primary":          required.primary,
        "required_upper_primary":    required.upper_primary,
        "required_secondary":        required.secondary,
        "required_higher_secondary": required.higher_secondary,
    }
    school_ref(db, school_id).update({"staff_summary": summary, "updated_at": firestore.SERVER_TIMESTAMP})
    update_step_completion(db, school_id, "staff")
    return MessageResponse(message="Staff summary saved")


@router.post("/staff/teachers", response_model=MessageResponse, status_code=201)
def add_teacher(
    payload: TeacherDetailSchema,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    _ensure_school(db, school_id)
    new_ref = sub_col(db, school_id, SUB_TEACHERS).document()
    doc_data = {**default_teacher(), **{k: v for k, v in payload.dict().items() if v is not None}}
    new_ref.set(doc_data)
    update_step_completion(db, school_id, "staff")
    return MessageResponse(message="Teacher added successfully", id=new_ref.id)


@router.put("/staff/teachers/{teacher_id}", response_model=MessageResponse)
def update_teacher(
    teacher_id: str,
    payload: TeacherDetailSchema,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    ref = sub_doc(db, school_id, SUB_TEACHERS, teacher_id)
    if not ref.get().exists:
        raise HTTPException(404, "Teacher not found")
    ref.update({k: v for k, v in payload.dict().items() if v is not None})
    update_step_completion(db, school_id, "staff")
    return MessageResponse(message="Teacher updated successfully")


@router.delete("/staff/teachers/{teacher_id}", response_model=MessageResponse)
def delete_teacher(
    teacher_id: str,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    ref = sub_doc(db, school_id, SUB_TEACHERS, teacher_id)
    if not ref.get().exists:
        raise HTTPException(404, "Teacher not found")
    ref.delete()
    update_step_completion(db, school_id, "staff")
    return MessageResponse(message="Teacher deleted successfully")


@router.post("/staff/non-teaching", response_model=MessageResponse, status_code=201)
def add_non_teaching_staff(
    payload: NonTeachingStaffSchema,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    _ensure_school(db, school_id)
    new_ref = sub_col(db, school_id, SUB_NON_TEACHING).document()
    doc_data = {**default_non_teaching_staff(), **{k: v for k, v in payload.dict().items() if v is not None}}
    new_ref.set(doc_data)
    update_step_completion(db, school_id, "staff")
    return MessageResponse(message="Non-teaching staff added", id=new_ref.id)


@router.put("/staff/non-teaching/{staff_id}", response_model=MessageResponse)
def update_non_teaching_staff(
    staff_id: str,
    payload: NonTeachingStaffSchema,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    ref = sub_doc(db, school_id, SUB_NON_TEACHING, staff_id)
    if not ref.get().exists:
        raise HTTPException(404, "Staff not found")
    ref.update({k: v for k, v in payload.dict().items() if v is not None})
    update_step_completion(db, school_id, "staff")
    return MessageResponse(message="Non-teaching staff updated")


@router.delete("/staff/non-teaching/{staff_id}", response_model=MessageResponse)
def delete_non_teaching_staff(
    staff_id: str,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    ref = sub_doc(db, school_id, SUB_NON_TEACHING, staff_id)
    if not ref.get().exists:
        raise HTTPException(404, "Staff not found")
    ref.delete()
    update_step_completion(db, school_id, "staff")
    return MessageResponse(message="Non-teaching staff deleted")


@router.post("/staff/vocational", response_model=MessageResponse, status_code=201)
def add_vocational_staff(
    payload: VocationalStaffSchema,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    _ensure_school(db, school_id)
    new_ref = sub_col(db, school_id, SUB_VOC_STAFF).document()
    doc_data = {**default_vocational_staff(), **{k: v for k, v in payload.dict().items() if v is not None}}
    new_ref.set(doc_data)
    update_step_completion(db, school_id, "staff")
    return MessageResponse(message="Vocational resource person added", id=new_ref.id)


@router.put("/staff/vocational/{staff_id}", response_model=MessageResponse)
def update_vocational_staff(
    staff_id: str,
    payload: VocationalStaffSchema,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    ref = sub_doc(db, school_id, SUB_VOC_STAFF, staff_id)
    if not ref.get().exists:
        raise HTTPException(404, "Vocational staff not found")
    ref.update({k: v for k, v in payload.dict().items() if v is not None})
    update_step_completion(db, school_id, "staff")
    return MessageResponse(message="Vocational staff updated")


@router.delete("/staff/vocational/{staff_id}", response_model=MessageResponse)
def delete_vocational_staff(
    staff_id: str,
    payload: VocationalStaffSchema,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    ref = sub_doc(db, school_id, SUB_VOC_STAFF, staff_id)
    if not ref.get().exists:
        raise HTTPException(404, "Vocational staff not found")
    ref.delete()
    update_step_completion(db, school_id, "staff")
    return MessageResponse(message="Vocational staff deleted")


# ══════════════════════════════════════════════
# STEP 7 – SAFETY
# ══════════════════════════════════════════════

@router.get("/safety")
def get_safety(
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    snap = school_ref(db, school_id).get()
    if not snap.exists:
        return {}
    return (snap.to_dict() or {}).get("safety", {})


@router.put("/safety", response_model=MessageResponse)
def save_safety(
    payload: SafetySchema,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    _ensure_school(db, school_id)
    safety_data = {**default_safety(), **{k: v for k, v in payload.dict().items() if v is not None}}
    school_ref(db, school_id).update({"safety": safety_data, "updated_at": firestore.SERVER_TIMESTAMP})
    update_step_completion(db, school_id, "safety")
    return MessageResponse(message="Safety details saved")


# ══════════════════════════════════════════════
# STEP 8 – STUDENT CAPACITY
# ══════════════════════════════════════════════

@router.get("/student-capacity")
def get_student_capacity(
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    return {
        "section_configs": _col_to_list(sub_col(db, school_id, SUB_SECTION_CONFIGS)),
        "students":        _col_to_list(sub_col(db, school_id, SUB_STUDENTS)),
    }


@router.put("/student-capacity/sections", response_model=MessageResponse)
def save_section_configs(
    configs: List[dict],
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    _ensure_school(db, school_id)
    _delete_sub_collection(db, school_id, SUB_SECTION_CONFIGS)
    if configs:
        batch = db.batch()
        for cfg in configs:
            new_ref = sub_col(db, school_id, SUB_SECTION_CONFIGS).document()
            batch.set(new_ref, {
                "class_name":         cfg.get("class_name", ""),
                "number_of_sections": cfg.get("number_of_sections", 1),
                "section_names":      cfg.get("section_names", ["A"]),
            })
        batch.commit()
    update_step_completion(db, school_id, "student_capacity")
    return MessageResponse(message="Section configs saved")


@router.get("/students")
def list_students(
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    return _col_to_list(sub_col(db, school_id, SUB_STUDENTS))


@router.post("/students", response_model=MessageResponse, status_code=201)
def add_student(
    payload: StudentProfileSchema,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    _ensure_school(db, school_id)
    new_ref = sub_col(db, school_id, SUB_STUDENTS).document()
    doc_data = {**default_student(), **{k: v for k, v in payload.dict().items() if v is not None}}
    new_ref.set(doc_data)
    update_step_completion(db, school_id, "student_capacity")
    return MessageResponse(message="Student added successfully", id=new_ref.id)


@router.put("/students/{student_id}", response_model=MessageResponse)
def update_student(
    student_id: str,
    payload: StudentProfileSchema,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    ref = sub_doc(db, school_id, SUB_STUDENTS, student_id)
    if not ref.get().exists:
        raise HTTPException(404, "Student not found")
    ref.update({k: v for k, v in payload.dict().items() if v is not None})
    update_step_completion(db, school_id, "student_capacity")
    return MessageResponse(message="Student updated successfully")


@router.delete("/students/{student_id}", response_model=MessageResponse)
def delete_student(
    student_id: str,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    ref = sub_doc(db, school_id, SUB_STUDENTS, student_id)
    if not ref.get().exists:
        raise HTTPException(404, "Student not found")
    ref.delete()
    update_step_completion(db, school_id, "student_capacity")
    return MessageResponse(message="Student deleted successfully")


# ══════════════════════════════════════════════
# STEP 9 – VOCATIONAL EDUCATION
# ══════════════════════════════════════════════

@router.get("/vocational-education")
def get_vocational_education(
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    snap = school_ref(db, school_id).get()
    data = (snap.to_dict() or {}) if snap.exists else {}
    return {
        "vocational_education": data.get("vocational_education", {}),
        "vocational_labs":      _col_to_list(sub_col(db, school_id, SUB_VOC_LABS)),
    }


@router.put("/vocational-education", response_model=MessageResponse)
def save_vocational_education(
    payload: VocationalEducationSchema,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    _ensure_school(db, school_id)
    voc_data = {
        **default_vocational_education(),
        **{k: v for k, v in payload.dict(exclude={"vocational_labs"}).items() if v is not None}
    }
    school_ref(db, school_id).update({"vocational_education": voc_data, "updated_at": firestore.SERVER_TIMESTAMP})

    _delete_sub_collection(db, school_id, SUB_VOC_LABS)
    if payload.vocational_labs:
        batch = db.batch()
        for lab in payload.vocational_labs:
            batch.set(sub_col(db, school_id, SUB_VOC_LABS).document(), lab.dict())
        batch.commit()

    update_step_completion(db, school_id, "vocational_education")
    return MessageResponse(message="Vocational education saved successfully")


# ══════════════════════════════════════════════
# STEP 10 – TRANSPORTATION
# NOTE: fitness_cert and permit are NOW stored as uploaded document URLs,
#       not as yes/no dropdowns. The frontend uploads files via
#       POST /profile/upload-document with document_type =
#       "transport_fitness_certificate" or "transport_permit".
#       The remaining transport fields are still plain text/select values.
# ══════════════════════════════════════════════

@router.get("/transport")
def get_transport(
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    snap = school_ref(db, school_id).get()
    if not snap.exists:
        return {}
    data = (snap.to_dict() or {}).get("transport", {})

    # Attach upload URLs for the two document-backed fields
    docs = _col_to_list(sub_col(db, school_id, SUB_PROFILE_DOCUMENTS))
    for doc in docs:
        if doc.get("document_type") == "transport_fitness_certificate":
            data["fitness_cert_url"]  = doc.get("file_url")
            data["fitness_cert_name"] = doc.get("file_name")
        if doc.get("document_type") == "transport_permit":
            data["permit_url"]  = doc.get("file_url")
            data["permit_name"] = doc.get("file_name")
    return data


@router.put("/transport")
def save_transport(
    payload: dict,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    """
    Save non-document transport fields.
    fitness_cert and permit are uploaded separately via /upload-document.
    """
    _ensure_school(db, school_id)
    # Strip any URL fields that may accidentally be sent from the frontend
    clean = {k: v for k, v in payload.items() if not k.endswith("_url") and not k.endswith("_name")}
    school_ref(db, school_id).update({"transport": clean, "updated_at": firestore.SERVER_TIMESTAMP})
    update_step_completion(db, school_id, "transport")
    return {"message": "Transport saved successfully"}


# ══════════════════════════════════════════════
# GET /profile — Full profile read (for edit mode)
# ══════════════════════════════════════════════

@router.get("")
def get_full_profile(
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    """
    Returns ALL saved profile data for a school in one response.
    Used by the frontend to pre-fill every form field on page load (edit mode).
    """
    snap = school_ref(db, school_id).get()
    if not snap.exists:
        return {}

    data = snap.to_dict() or {}

    return {
        # Top-level field maps
        "basic_details":        data.get("basic_details",        {}),
        "receipts_expenditure": data.get("receipts_expenditure", {}),
        "legal_details":        data.get("legal_details",        {}),
        "location":             data.get("location",             {}),
        "infrastructure":       data.get("infrastructure",       {}),
        "staff_summary":        data.get("staff_summary",        {}),
        "safety":               data.get("safety",               {}),
        "vocational_education": data.get("vocational_education", {}),
        "transport":            data.get("transport",            {}),

        # Sub-collection data
        "teachers":             _col_to_list(sub_col(db, school_id, "teachers")),
        "non_teaching_staff":   _col_to_list(sub_col(db, school_id, "non_teaching_staff")),
        "vocational_staff":     _col_to_list(sub_col(db, school_id, "vocational_staff")),
        "students":             _col_to_list(sub_col(db, school_id, "students")),
        "section_configs":      _col_to_list(sub_col(db, school_id, "section_configs")),
        "grants":               _col_to_list(sub_col(db, school_id, "grants")),
        "assistance":           _col_to_list(sub_col(db, school_id, "assistance")),
        "vocational_rows":      _col_to_list(sub_col(db, school_id, "vocational_rows")),
        "vocational_labs":      _col_to_list(sub_col(db, school_id, "vocational_labs")),
        "anganwadi_rows":       _col_to_list(sub_col(db, school_id, "anganwadi_rows")),
        "sec_156":              _col_to_list(sub_col(db, school_id, "sec_156")),
        "sec_157":              _col_to_list(sub_col(db, school_id, "sec_157")),
        "higher_secondary_labs":_col_to_list(sub_col(db, school_id, "higher_secondary_labs")),
        "digital_equip_items":  _col_to_list(sub_col(db, school_id, "digital_equip_items")),
        "digital_teaching_tools":_col_to_list(sub_col(db, school_id, "digital_facilities")),

        # Meta
        "is_submitted":  data.get("is_submitted", False),
        "submitted_at":  str(data.get("submitted_at", "")),
        "created_at":    str(data.get("created_at",  "")),
        "updated_at":    str(data.get("updated_at",  "")),
    }


# ══════════════════════════════════════════════
# POST /profile/save — Bulk save all sections
# ══════════════════════════════════════════════

@router.post("/save", response_model=MessageResponse)
def save_full_profile(
    payload: dict,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    """
    Saves / merges all profile sections in one call.
    Only the sections present in the payload are updated (partial merge).
    Sub-collections (teachers, students, etc.) are NOT handled here —
    use the dedicated per-resource endpoints for those.
    """
    _ensure_school(db, school_id)
    ref = school_ref(db, school_id)

    update_data: dict = {"updated_at": firestore.SERVER_TIMESTAMP}

    # Each top-level section is merged independently
    section_keys = [
        "basic_details", "receipts_expenditure", "legal_details",
        "location", "infrastructure", "staff_summary", "safety",
        "vocational_education", "transport",
    ]
    for key in section_keys:
        if key in payload and isinstance(payload[key], dict):
            update_data[key] = payload[key]

    ref.update(update_data)

    # Mark completed steps based on which sections were provided
    step_map = {
        "basic_details":        "basic_details",
        "receipts_expenditure": "receipts_expenditure",
        "legal_details":        "legal_details",
        "location":             "location",
        "infrastructure":       "infrastructure",
        "staff_summary":        "staff",
        "safety":               "safety",
        "vocational_education": "vocational_education",
        "transport":            "transport",
    }
    for key, step_name in step_map.items():
        if key in payload:
            update_step_completion(db, school_id, step_name)

    return MessageResponse(message="Profile saved successfully")


# ══════════════════════════════════════════════
# PROFILE DOCUMENT UPLOAD  (Cloudinary)
# ══════════════════════════════════════════════

@router.get("/documents")
def list_profile_documents(
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    """List ALL documents uploaded for this school's profile (all steps)."""
    docs = _col_to_list(sub_col(db, school_id, SUB_PROFILE_DOCUMENTS))
    result = []
    for d in docs:
        result.append({
            "id":            d.get("id", ""),
            "document_type": d.get("document_type", ""),
            "step":          d.get("step"),          # ← always included
            "label":         PROFILE_DOCUMENT_LABELS.get(d.get("document_type", ""), d.get("document_type", "")),
            "file_name":     d.get("file_name", ""),
            "content_type":  d.get("content_type", ""),
            "file_url": d.get("file_url") or d.get("download_url", ""),
            "public_id":     d.get("public_id", ""),
            "uploaded_at":   _format_ts(d.get("uploaded_at")),
        })
    return result


@router.post("/upload-document", response_model=MessageResponse)
async def upload_profile_document(
    document_type: str = Form(...),
    file: UploadFile = File(...),
    step: int = Form(...),   
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    """
    Upload a supporting document for the school profile to Cloudinary.
    Stored under: profile_documents/{school_id}/{document_type}/
    document_type must be one of the keys in PROFILE_DOCUMENT_LABELS.

    For transport step, use document_type:
      - "transport_fitness_certificate"
      - "transport_permit"
    """
    if document_type not in PROFILE_DOCUMENT_LABELS:
        raise HTTPException(
            400,
            f"Unknown document_type '{document_type}'. "
            f"Allowed: {sorted(PROFILE_DOCUMENT_LABELS.keys())}",
        )

    # ── Security: MIME ──────────────────────────────────────────────────
    _validate_mime(file.content_type)

    # ── Read & size check ───────────────────────────────────────────────
    file_bytes = await file.read()
    _validate_size(file_bytes)

    # ── Magic-byte validation ───────────────────────────────────────────
    if file.content_type == "image/jpeg" and not file_bytes[:2] == b"\xff\xd8":
        raise HTTPException(400, "File does not appear to be a valid JPEG.")
    if file.content_type == "image/png" and not file_bytes[:8] == b"\x89PNG\r\n\x1a\n":
        raise HTTPException(400, "File does not appear to be a valid PNG.")
    if file.content_type == "application/pdf" and not file_bytes[:4] == b"%PDF":
        raise HTTPException(400, "File does not appear to be a valid PDF.")

    file.file.seek(0)

    # ── Upload to Cloudinary ─────────────────────────────────────────────
    # Folder: profile_documents/{school_id}/{document_type}
    safe_name = _sanitize_filename(file.filename or "document")
    folder = f"profile_documents/{school_id}/{document_type}"

    try:
        upload_result = upload_file(file, folder)
        download_url  = upload_result["url"]
        public_id    = upload_result["public_id"]
    except Exception as exc:
        logger.error("Cloudinary profile upload failed: %s", exc)
        raise HTTPException(500, "Document upload failed. Please try again.")

    # ── Persist metadata in Firestore ────────────────────────────────────
    _ensure_school(db, school_id)

    # If a document of the same type already exists, replace it
    existing = list(
        sub_col(db, school_id, SUB_PROFILE_DOCUMENTS)
        .where("document_type", "==", document_type)
        .limit(1)
        .stream()
    )
    if existing:
        old_doc  = existing[0]
        old_data = old_doc.to_dict()
        old_pid  = old_data.get("public_id")
        if old_pid:
            try:
                destroy(old_pid)
            except Exception as exc:
                logger.warning("Cloudinary old-file delete failed: %s", exc)
        old_doc.reference.delete()

    secure_url = upload_result.get("secure_url") if isinstance(upload_result, dict) else None

    if not secure_url:
        raise Exception(f"Cloudinary upload failed or invalid response: {upload_result}")

    file_url = secure_url.replace("/raw/upload/", "/upload/")
    doc_ref = sub_col(db, school_id, SUB_PROFILE_DOCUMENTS).document()
    doc_ref.set({
        "document_type": document_type,
        "step": step,   # ✅ ADD THIS LINE
        "label": PROFILE_DOCUMENT_LABELS.get(document_type, document_type),
        "file_name": safe_name,
        "file_url": file_url, 
        "public_id": public_id,
        "content_type": file.content_type,
        "uploaded_at": firestore.SERVER_TIMESTAMP,
})

    return MessageResponse(
        message=f"'{safe_name}' uploaded successfully",
        id=doc_ref.id,
    )

# NOTE: The old GET /documents/{step} endpoint has been REMOVED to prevent
# route conflict with DELETE /documents/{doc_id}.
# Step-filtering is now done on the frontend using STEP_DOCUMENTS mapping.

@router.put("/replace-document/{doc_id}")
async def replace_document(
    doc_id: str,
    file: UploadFile = File(...),
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    """
    Replace an existing profile document.
    - Deletes old Cloudinary asset using public_id.
    - Uploads the new file to Cloudinary.
    - Updates Firestore with new download_url, public_id, file_name.
    """
    doc_ref  = sub_doc(db, school_id, SUB_PROFILE_DOCUMENTS, doc_id)
    snap     = doc_ref.get()
    if not snap.exists:
        raise HTTPException(404, "Document not found.")

    old_data = snap.to_dict() or {}
    old_pid  = old_data.get("public_id")

    # ── Validate replacement file ────────────────────────────────────────────
    _validate_mime(file.content_type)
    file_bytes = await file.read()
    _validate_size(file_bytes)

    # ── Delete old Cloudinary asset ──────────────────────────────────────────
    if old_pid:
        try:
            destroy(old_pid)
        except Exception as exc:
            logger.warning("Cloudinary old-file delete failed during replace: %s", exc)

    # Reset cursor so upload_file can read the stream
    file.file.seek(0)

    # ── Upload new file to Cloudinary ──────────────────────────────────────
    doc_type = old_data.get("document_type", "document")
    folder   = f"profile_documents/{school_id}/{doc_type}"
    safe_name = _sanitize_filename(file.filename or "document")

    try:
        upload_result = upload_file(file, folder)
        download_url  = upload_result["url"]
        public_id     = upload_result["public_id"]
    except Exception as exc:
        logger.error("Cloudinary replace upload failed: %s", exc)
        raise HTTPException(500, "Document replacement upload failed. Please try again.")

    secure_url = upload_result.get("secure_url") or upload_result.get("url")

    if not secure_url:
        raise Exception(f"Invalid Cloudinary response: {upload_result}")

    file_url = secure_url.replace("/raw/upload/", "/upload/")
    # ── Update Firestore document ────────────────────────────────────────────
    doc_ref.update({
        "file_url": file_url,
        "public_id": public_id,
        "file_name": safe_name,
        "content_type": file.content_type,
        "uploaded_at": firestore.SERVER_TIMESTAMP,
    })

    return {"message": "Document replaced successfully", "id": doc_id, "download_url": download_url}

@router.delete("/documents/{doc_id}", response_model=MessageResponse)
def delete_profile_document(
    doc_id: str,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    """Delete a profile document from both Cloudinary and Firestore."""
    ref  = sub_col(db, school_id, SUB_PROFILE_DOCUMENTS).document(doc_id)
    snap = ref.get()
    if not snap.exists:
        raise HTTPException(404, "Document not found.")

    doc_data = snap.to_dict()
    public_id = doc_data.get("public_id")
    if public_id:
        try:
            result = destroy(public_id)
            if result.get("result") != "ok":
                logger.warning("Cloudinary delete issue: %s", result)
        except Exception as exc:
            logger.warning("Cloudinary delete failed (continuing): %s", exc)

    ref.delete()
    return MessageResponse(message="Document deleted successfully")


# ══════════════════════════════════════════════
# PROFILE PDF DOWNLOAD
# ══════════════════════════════════════════════

@router.get("/pdf")
def download_profile_pdf(
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    """
    Generate a summary PDF of the completed school profile and return it
    as a streaming download.  Mirrors the PDF layout used in registration.py.
    """
    snap = school_ref(db, school_id).get()
    if not snap.exists:
        raise HTTPException(404, "Profile not found.")

    profile = snap.to_dict() or {}
    bd   = profile.get("basic_details",        {}) or {}
    loc  = profile.get("location",             {}) or {}
    inf  = profile.get("infrastructure",       {}) or {}
    safe = profile.get("safety",               {}) or {}
    stf  = profile.get("staff_summary",        {}) or {}
    voc  = profile.get("vocational_education", {}) or {}
    trns = profile.get("transport",            {}) or {}
    docs = _col_to_list(sub_col(db, school_id, SUB_PROFILE_DOCUMENTS))

    try:
        pdf_bytes = _generate_profile_pdf(
            school_id=school_id,
            bd=bd, loc=loc, inf=inf, safe=safe,
            stf=stf, voc=voc, trns=trns, docs=docs,
        )
    except Exception as exc:
        logger.error("Profile PDF generation failed: %s", exc)
        raise HTTPException(500, "Could not generate PDF. Please try again.")

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="profile_{school_id}.pdf"'
        },
    )


# ──────────────────────────────────────────────────────────────────────────────
# PDF GENERATOR  (internal, mirrors registration._generate_pdf style)
# ──────────────────────────────────────────────────────────────────────────────

def _generate_profile_pdf(
    school_id: str,
    bd: dict, loc: dict, inf: dict, safe: dict,
    stf: dict, voc: dict, trns: dict, docs: list,
) -> bytes:
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.lib import colors
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table,
            TableStyle, HRFlowable,
        )
        from reportlab.lib.enums import TA_CENTER
    except ImportError:
        raise HTTPException(500, "PDF library not available. Run: pip install reportlab")

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=2 * cm, rightMargin=2 * cm,
        topMargin=2 * cm, bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    title_s = ParagraphStyle("T", fontSize=16, fontName="Helvetica-Bold",
                              alignment=TA_CENTER, spaceAfter=4,
                              textColor=colors.HexColor("#1e3a5f"))
    sub_s   = ParagraphStyle("S", fontSize=10, fontName="Helvetica",
                              alignment=TA_CENTER, spaceAfter=12,
                              textColor=colors.HexColor("#555555"))
    sec_s   = ParagraphStyle("SC", fontSize=11, fontName="Helvetica-Bold",
                              spaceBefore=14, spaceAfter=6,
                              textColor=colors.HexColor("#1e3a5f"))
    note_s  = ParagraphStyle("N", fontSize=8, fontName="Helvetica-Oblique",
                              textColor=colors.HexColor("#888888"), spaceAfter=4)

    TABLE_STYLE = TableStyle([
        ("FONTNAME",       (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE",       (0, 0), (-1, -1), 9),
        ("FONTNAME",       (0, 0), (0, 0),   "Helvetica-Bold"),
        ("FONTNAME",       (2, 0), (2, 0),   "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1),
         [colors.white, colors.HexColor("#f7f9fc")]),
        ("GRID",           (0, 0), (-1, -1), 0.4, colors.HexColor("#dddddd")),
        ("PADDING",        (0, 0), (-1, -1), 6),
        ("VALIGN",         (0, 0), (-1, -1), "MIDDLE"),
    ])

    def bold_labels(rows_count: int) -> TableStyle:
        """Make every even column (0,2) bold for all rows."""
        cmds = list(TABLE_STYLE._cmds)
        for r in range(rows_count):
            cmds.append(("FONTNAME", (0, r), (0, r), "Helvetica-Bold"))
            cmds.append(("FONTNAME", (2, r), (2, r), "Helvetica-Bold"))
        return TableStyle(cmds)

    def make_table(rows):
        t = Table(rows, colWidths=[4 * cm, 6.5 * cm, 4 * cm, 5.5 * cm])
        t.setStyle(bold_labels(len(rows)))
        return t

    story = []

    # ── Header ────────────────────────────────────────────────────────────
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph("Government of Maharashtra – Education Department", sub_s))
    story.append(Paragraph("School Profile Summary", title_s))
    story.append(Paragraph(
        f"Generated on {datetime.now(timezone.utc).strftime('%d %b %Y, %H:%M UTC')}",
        sub_s,
    ))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#1e3a5f")))
    story.append(Spacer(1, 0.4 * cm))

    # Helper: safe value
    def v(val):
        return str(val) if val not in (None, "", "None") else "—"

    # ── 1. School Identity ────────────────────────────────────────────────
    story.append(Paragraph("1. School Identity", sec_s))
    story.append(make_table([
        ["School Name",       v(bd.get("school_name")),      "UDISE Code",        v(bd.get("udise_number"))],
        ["School Type",       v(bd.get("school_type")),      "Category",          v(bd.get("school_category"))],
        ["Lowest Class",      v(bd.get("lowest_class")),     "Highest Class",     v(bd.get("highest_class"))],
        ["Board Affiliation", v(bd.get("board_affiliation")), "Est. Year",         v(bd.get("est_year"))],
        ["Management Group",  v(bd.get("management_group")), "Management Code",   v(bd.get("management_code"))],
    ]))

    # ── 2. Contact ────────────────────────────────────────────────────────
    story.append(Paragraph("2. Contact Details", sec_s))
    story.append(make_table([
        ["Mobile",    v(bd.get("mobile")),   "Email",    v(bd.get("email"))],
        ["Address",   v(loc.get("address")), "District", v(loc.get("district"))],
        ["Taluka",    v(loc.get("taluka")),  "Pin Code", v(loc.get("pin_code"))],
    ]))

    # ── 3. Infrastructure Summary ─────────────────────────────────────────
    story.append(Paragraph("3. Infrastructure Summary", sec_s))
    story.append(make_table([
        ["Building Status",    v(inf.get("building_status")),       "Boundary Wall",  v(inf.get("boundary_wall"))],
        ["Total Rooms",        v(inf.get("total_instructional_rooms")), "Electricity",v(inf.get("has_electricity"))],
        ["Has Library",        v(inf.get("has_library")),           "Library Books",  v(inf.get("library_books"))],
        ["Has Playground",     v(inf.get("has_playground")),        "Has Ramp",       v(inf.get("has_ramp"))],
        ["Toilets (Boys)",     v(inf.get("toilet_boys_total")),     "Toilets (Girls)",v(inf.get("toilet_girls_total"))],
        ["ICT Lab",            v(inf.get("has_ict_lab")),           "Internet",       v(inf.get("has_internet"))],
    ]))

    # ── 4. Staff Summary ──────────────────────────────────────────────────
    story.append(Paragraph("4. Staff Summary", sec_s))
    story.append(make_table([
        ["Regular Teaching",   v(stf.get("count_regular")),     "Non-Regular",      v(stf.get("count_non_regular"))],
        ["Non-Teaching",       v(stf.get("count_non_teaching")), "Vocational",      v(stf.get("count_vocational"))],
        ["Required (Primary)", v(stf.get("required_primary")),  "Required (Sec.)",  v(stf.get("required_secondary"))],
    ]))

    # ── 5. Safety ─────────────────────────────────────────────────────────
    story.append(Paragraph("5. Safety & Security", sec_s))
    story.append(make_table([
        ["Disaster Plan",      v(safe.get("has_disaster_plan")),     "CCTV",           v(safe.get("has_cctv"))],
        ["Fire Extinguishers", v(safe.get("has_fire_extinguishers")), "Nodal Teacher", v(safe.get("has_nodal_teacher"))],
        ["Safety Training",    v(safe.get("has_safety_training")),   "Safety Audit",   v(safe.get("safety_audit_frequency"))],
    ]))

    # ── 6. Vocational Education ───────────────────────────────────────────
    story.append(Paragraph("6. Vocational Education", sec_s))
    story.append(make_table([
        ["Guest Lecturers",  v(voc.get("vocational_guest_lecturers")),  "Industry Visits",   v(voc.get("vocational_industry_visits"))],
        ["Industry Linkages",v(voc.get("vocational_industry_linkages")), "Enrolled (Cl.10)", v(voc.get("plac_enrolled_10"))],
        ["Passed (Cl.10)",   v(voc.get("plac_passed_10")),             "Placed (Cl.10)",    v(voc.get("plac_placed_10"))],
    ]))

    # ── 7. Transportation ─────────────────────────────────────────────────
    story.append(Paragraph("7. Transportation", sec_s))
    story.append(make_table([
        ["Vehicle Age",       v(trns.get("trans_vehicle_age")),      "Speed Governor",  v(trns.get("trans_speed_governor"))],
        ["Driver Experience", v(trns.get("trans_driver_experience")), "No Offences",    v(trns.get("trans_driver_no_traffic_offences"))],
        ["School Name on Bus",v(trns.get("trans_school_name_written")), "Auto Safety",  v(trns.get("trans_auto_safety"))],
        ["Fitness Cert",      "See Documents Section",               "Permit",          "See Documents Section"],
    ]))

    # ── 8. Uploaded Documents ─────────────────────────────────────────────
    story.append(Paragraph("8. Uploaded Documents", sec_s))
    if docs:
        from reportlab.platypus import Paragraph as P
        lbl_s  = styles["Normal"]
        lbl_s.fontSize = 8
        doc_header = ["Document Type", "File Name", "Uploaded On", "Link"]
        doc_rows   = [doc_header]
        for d in docs:
            date_str = _format_ts(d.get("uploaded_at")) or "—"
            url = d.get("file_url") or d.get("download_url", "")
            link = f'<a href="{url}" color="blue"><u>View</u></a>' if url else "—"
            doc_rows.append([
                d.get("label", d.get("document_type", "")),
                d.get("file_name", "—"),
                date_str,
                P(link, styles["Normal"]),
            ])
        d_table = Table(doc_rows, colWidths=[5 * cm, 5 * cm, 4 * cm, 6 * cm])
        d_table.setStyle(TableStyle([
            ("BACKGROUND",  (0, 0), (-1, 0),  colors.HexColor("#1e3a5f")),
            ("TEXTCOLOR",   (0, 0), (-1, 0),  colors.white),
            ("FONTNAME",    (0, 0), (-1, 0),  "Helvetica-Bold"),
            ("FONTSIZE",    (0, 0), (-1, -1), 8),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1),
             [colors.white, colors.HexColor("#f7f9fc")]),
            ("GRID",        (0, 0), (-1, -1), 0.4, colors.HexColor("#dddddd")),
            ("PADDING",     (0, 0), (-1, -1), 5),
            ("VALIGN",      (0, 0), (-1, -1), "MIDDLE"),
        ]))
        story.append(d_table)
    else:
        story.append(Paragraph("No documents uploaded yet.", note_s))

    # ── Footer ────────────────────────────────────────────────────────────
    story.append(Spacer(1, 1 * cm))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cccccc")))
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph(
        "This is a computer-generated profile summary. No signature is required.",
        note_s,
    ))

    doc.build(story)
    return buf.getvalue()


# ══════════════════════════════════════════════
# FINAL SUBMIT  (validation disabled, always succeeds)
# ══════════════════════════════════════════════

@router.post("/submit", response_model=MessageResponse)
def submit_full_profile(
    payload: FullProfileSubmitSchema,
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    """
    Accept the entire profile in one request and persist all steps.
    Validation is disabled — submission always succeeds.
    """
    _ensure_school(db, school_id)

    if payload.basic_details:
        save_basic_details(payload.basic_details, school_id, db)
    if payload.receipts_expenditure:
        save_receipts_expenditure(payload.receipts_expenditure, school_id, db)
    if payload.legal_details:
        save_legal_details(payload.legal_details, school_id, db)
    if payload.location:
        save_location(payload.location, school_id, db)
    if payload.infrastructure:
        save_infrastructure(payload.infrastructure, school_id, db)
    if payload.safety:
        save_safety(payload.safety, school_id, db)
    if payload.vocational_education:
        save_vocational_education(payload.vocational_education, school_id, db)

    if payload.staff:
        s = payload.staff
        if s.staff_counts or s.staff_required:
            save_staff_summary(
                s.staff_counts or StaffCountRow(),
                s.staff_required or StaffRequiredRow(),
                school_id, db,
            )
        for t in (s.teachers or []):
            add_teacher(t, school_id, db)
        for nt in (s.non_teaching_staff or []):
            add_non_teaching_staff(nt, school_id, db)
        for vs in (s.vocational_staff or []):
            add_vocational_staff(vs, school_id, db)

    if payload.student_capacity:
        sc = payload.student_capacity
        if sc.section_configs:
            save_section_configs([c.dict() for c in sc.section_configs], school_id, db)
        for student in (sc.students or []):
            add_student(student, school_id, db)

    school_ref(db, school_id).update({
        "is_submitted": True,
        "submitted_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP,
    })

    # Create notification (use school_id instead of undefined school_name)
    try:
        create_notification(
            school_id=None,
            title="Profile Completed",
            message=f"School {school_id} has completed their profile",
            notif_type="info"
        )
    except Exception as exc:
        logger.warning("Notification creation failed (non-critical): %s", exc)

    return MessageResponse(message="School profile submitted successfully")


# ══════════════════════════════════════════════
# LEGACY upload-document endpoint (kept for backwards compat)
# Use /upload-document (the new one) for all new work.
# ══════════════════════════════════════════════

@router.post("/upload-document-legacy", response_model=MessageResponse)
async def upload_document_legacy(
    document_type: str,
    file: UploadFile = File(...),
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    """
    Original Firebase Storage upload (kept for backwards compatibility).
    Prefer /upload-document (Cloudinary) for all new uploads.
    """
    from firebase_admin import storage
    ALLOWED_TYPES = {"application/pdf", "image/jpeg", "image/png"}
    MAX_SIZE_MB = 5
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "Only PDF, JPG, PNG files allowed")
    file_bytes = await file.read()
    if len(file_bytes) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(400, f"File exceeds {MAX_SIZE_MB} MB limit")

    bucket = storage.bucket()
    ext = file.filename.rsplit(".", 1)[-1]
    blob_path = f"school_documents/{school_id}/{document_type}/{uuid.uuid4()}.{ext}"
    blob = bucket.blob(blob_path)
    blob.upload_from_string(file_bytes, content_type=file.content_type)
    blob.make_public()
    download_url = blob.public_url

    _ensure_school(db, school_id)
    doc_ref = sub_col(db, school_id, SUB_DOCUMENTS).document()
    doc_ref.set({
        "document_type": document_type,
        "file_name":     file.filename,
        "blob_path":     blob_path,
        "download_url":  download_url,
        "content_type":  file.content_type,
        "uploaded_at":   firestore.SERVER_TIMESTAMP,
    })
    return MessageResponse(message=f"'{file.filename}' uploaded successfully", id=doc_ref.id)



@router.get("/final-status")
def get_profile_final_status(
    school_id: str = Depends(get_current_school_id),
    db=Depends(get_db),
):
    snap = school_ref(db, school_id).get()
    if not snap.exists:
        return {"submitted": False}

    data = snap.to_dict() or {}

    return {
        "submitted": data.get("is_submitted", False),
        "submitted_at": data.get("submitted_at"),
        "pdf_url": f"/profile/pdf"
    }