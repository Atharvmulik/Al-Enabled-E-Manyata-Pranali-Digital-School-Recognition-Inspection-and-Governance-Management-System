"""
app/routers/registration.py
────────────────────────────────────────────────────────────────────────────────
Registration endpoints — school applies for New Recognition / Renewal / Upgradation.

Flow:
  Step 1  →  GET  /registration/prefill          (auto-fill from profile)
  Step 1  →  PUT  /registration/step1            (save + validate)
  Step 2  →  PUT  /registration/step2
  Step 3  →  POST /registration/upload-document  (secure upload)
  Step 3  →  GET  /registration/documents        (list uploaded docs)
  Step 3  →  DELETE /registration/documents/{doc_id}
  Step 4  →  POST /registration/submit           (final submit → PDF)
  GET     →  /registration/status                (current state)
  GET     →  /registration/pdf                   (download PDF)
────────────────────────────────────────────────────────────────────────────────
"""

from __future__ import annotations
from app.cloudinary_service import upload_file
from cloudinary.uploader import destroy
from app.models import create_notification


import io
import os
import re
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import (
    APIRouter, Depends, HTTPException, UploadFile, File,
    Form, status, Request,
)
from fastapi.responses import StreamingResponse
from firebase_admin import firestore
from pydantic import BaseModel, validator, Field

from app.models import (
    get_db,
    school_ref,           # school_profiles/{id}
    reg_ref,              # school_registrations/{id}
    reg_sub_col,
    reg_sub_doc,
    REG_SUB_DOCUMENTS,
    default_reg_meta,
    COL_REGISTRATIONS,
)
from app.routers.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/registration", tags=["Registration"])

# ─────────────────────────────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────────────────────────────

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024   # 5 MB
ALLOWED_APP_TYPES   = {"New Recognition", "Renewal", "Upgradation"}

DOCUMENT_TYPES_PER_APP: dict[str, list[str]] = {
    "New Recognition": [
        "land_building_deed",
        "trust_society_declaration",
    ],
    "Renewal": [
        "noc_renewal",
    ],
    "Upgradation": [
        "management_resolution",
    ],
}

DOCUMENT_LABELS: dict[str, str] = {
    "land_building_deed":        "Land/Building Ownership or Lease Deed",
    "trust_society_declaration": "Trust/Society Declaration",
    "noc_renewal":               "NOC for Renewal from Local Body",
    "management_resolution":     "Resolution from School Management to Upgrade",
}


# ─────────────────────────────────────────────────────────────────────────────
# Auth dependency
# ─────────────────────────────────────────────────────────────────────────────

def _school_id(user_id: str = Depends(get_current_user)) -> str:
    return user_id


# ─────────────────────────────────────────────────────────────────────────────
# Pydantic schemas  (request / response)
# ─────────────────────────────────────────────────────────────────────────────

class Step1Payload(BaseModel):
    application_type: str
 
    @validator("application_type")
    def _valid_type(cls, v):
        allowed = {"New Recognition", "Renewal", "Upgradation"}
        if v not in allowed:
            raise ValueError(f"Must be one of {sorted(allowed)}")
        return v
 
 
class Step2NewRecognition(BaseModel):
    lowest_class:       str = Field(..., min_length=1)
    highest_class:      str = Field(..., min_length=1)
    board_affiliation:  str = Field(..., min_length=1)
    academic_year:      str = Field(..., min_length=1)
 
 
class Step2Renewal(BaseModel):
    recognition_number:    str = Field(..., min_length=1)
    recognition_validity:  str = Field(..., min_length=1)
    has_changes:           str = Field(..., min_length=1)
 
 
class Step2Upgradation(BaseModel):
    upgrade_to:      str = Field(..., min_length=1)
    upgrade_reason:  str = Field(..., min_length=10)



class Step4Payload(BaseModel):
    signatory_name:  str = Field(..., min_length=2)
    designation:     str = Field(..., min_length=2)
    declaration:     bool
 
    @validator("declaration")
    def _must_accept(cls, v):
        if not v:
            raise ValueError("You must accept the declaration")
        return v



class RegistrationStatusResponse(BaseModel):
    school_id:        str
    application_type: Optional[str]
    status:           str
    step1_complete:   bool
    step2_complete:   bool
    step3_complete:   bool
    step4_complete:   bool
    submitted:        bool
    submitted_at:     Optional[str]
    pdf_url:          Optional[str]


class DocumentResponse(BaseModel):
    id:            str
    document_type: str
    label:         str
    file_name:     str
    content_type:  str
    download_url:  str
    uploaded_at:   Optional[str]


# ─────────────────────────────────────────────────────────────────────────────
# Internal helpers
# ─────────────────────────────────────────────────────────────────────────────

def _ensure_reg(db, school_id: str, app_type: str = "New Recognition"):
    ref = reg_ref(db, school_id)
    if not ref.get().exists:
        ref.set(default_reg_meta(app_type))


def _get_profile_data(db, school_id: str) -> dict:
    snap = school_ref(db, school_id).get()
    if not snap.exists:
        return {}
    data = snap.to_dict() or {}
    # Flatten nested maps so we can read school_name, etc.
    bd = data.get("basic_details", {}) or {}
    loc = data.get("location", {}) or {}
    return {**data, **bd, **loc}


def _validate_mime(content_type: str):
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"File type '{content_type}' not allowed. Use PDF, JPG, PNG or WEBP.",
        )


def _validate_size(data: bytes):
    if len(data) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File exceeds the 5 MB limit.",
        )


def _sanitize_filename(name: str) -> str:
    """Strip path traversal characters and keep only safe chars."""
    name = os.path.basename(name)
    name = re.sub(r"[^\w.\-]", "_", name)
    return name[:200]


def _doc_to_dict(doc) -> dict:
    if not doc.exists:
        return {}
    d = doc.to_dict()
    d["id"] = doc.id
    return d


def _col_to_list(col_ref) -> list:
    return [_doc_to_dict(d) for d in col_ref.stream()]


def _reg_data(db, school_id: str) -> dict:
    snap = reg_ref(db, school_id).get()
    return (snap.to_dict() or {}) if snap.exists else {}


def _format_ts(ts) -> Optional[str]:
    if ts is None:
        return None
    try:
        return ts.astimezone(timezone.utc).strftime("%d %b %Y, %H:%M UTC")
    except Exception:
        return str(ts)


# ─────────────────────────────────────────────────────────────────────────────
# PDF generation
# ─────────────────────────────────────────────────────────────────────────────

def _generate_pdf(reg: dict, profile: dict, docs: list[dict]) -> bytes:
    """
    Build a multi-section application PDF using reportlab.
    Returns raw bytes of the PDF.
    """
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.lib import colors
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table,
            TableStyle, HRFlowable,
        )
        from reportlab.lib.enums import TA_CENTER, TA_LEFT
    except ImportError:
        raise HTTPException(500, "PDF library not available. Run: pip install reportlab")

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=2 * cm, rightMargin=2 * cm,
        topMargin=2 * cm, bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()

    # ── Custom styles ──────────────────────────────────────────────────────
    title_style = ParagraphStyle(
        "AppTitle",
        fontSize=16, fontName="Helvetica-Bold",
        alignment=TA_CENTER, spaceAfter=4,
        textColor=colors.HexColor("#1e3a5f"),
    )
    subtitle_style = ParagraphStyle(
        "AppSubtitle",
        fontSize=10, fontName="Helvetica",
        alignment=TA_CENTER, spaceAfter=12,
        textColor=colors.HexColor("#555555"),
    )
    section_style = ParagraphStyle(
        "Section",
        fontSize=11, fontName="Helvetica-Bold",
        spaceBefore=14, spaceAfter=6,
        textColor=colors.HexColor("#1e3a5f"),
        borderPad=4,
    )
    label_style = ParagraphStyle(
        "Label",
        fontSize=8, fontName="Helvetica-Bold",
        textColor=colors.HexColor("#777777"),
        spaceAfter=1,
    )
    value_style = ParagraphStyle(
        "Value",
        fontSize=10, fontName="Helvetica",
        textColor=colors.HexColor("#111111"),
        spaceAfter=6,
    )
    note_style = ParagraphStyle(
        "Note",
        fontSize=8, fontName="Helvetica-Oblique",
        textColor=colors.HexColor("#888888"),
        spaceAfter=4,
    )

    def field_row(label: str, value) -> list:
        v = str(value) if value not in (None, "", "None") else "—"
        return [
            Paragraph(label, label_style),
            Paragraph(v, value_style),
        ]

    story = []

    # ── Header ─────────────────────────────────────────────────────────────
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph("Government of Maharashtra – Education Department", subtitle_style))
    story.append(Paragraph("School Recognition Application", title_style))

    app_type = reg.get("application_type", "New Recognition")
    story.append(Paragraph(f"Application Type: {app_type}", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#1e3a5f")))
    story.append(Spacer(1, 0.4 * cm))

    # Submission meta
    sub_at = _format_ts(reg.get("submitted_at")) or "—"
    app_id = reg.get("application_id", "—")
    meta_data = [
        ["Application ID", app_id, "Submitted On", sub_at],
    ]
    meta_table = Table(meta_data, colWidths=[4 * cm, 7 * cm, 4 * cm, 5 * cm])
    meta_table.setStyle(TableStyle([
        ("FONTNAME",    (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE",    (0, 0), (-1, -1), 9),
        ("FONTNAME",    (0, 0), (0, 0),  "Helvetica-Bold"),
        ("FONTNAME",    (2, 0), (2, 0),  "Helvetica-Bold"),
        ("BACKGROUND",  (0, 0), (-1, -1), colors.HexColor("#f0f4f8")),
        ("GRID",        (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
        ("PADDING",     (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 0.5 * cm))

    # ── Section 1: School Identity ─────────────────────────────────────────
    story.append(Paragraph("1. School Identity", section_style))
    identity_rows = [
        ["School Name",         profile.get("school_name", "—"),
         "UDISE Code",          profile.get("udise_number", "—")],
        ["School Type",         profile.get("school_type", "—"),
         "School Category",     profile.get("school_category", "—")],
        ["Lowest Class",        profile.get("lowest_class", "—"),
         "Highest Class",       profile.get("highest_class", "—")],
        ["Board Affiliation",   profile.get("board_affiliation", "—"),
         "Establishment Year",  profile.get("est_year", "—")],
        ["Management Group",    profile.get("management_group", "—"),
         "Management Code",     profile.get("management_code", "—")],
    ]
    id_table = Table(identity_rows, colWidths=[4 * cm, 6.5 * cm, 4 * cm, 5.5 * cm])
    id_table.setStyle(TableStyle([
        ("FONTNAME",   (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE",   (0, 0), (-1, -1), 9),
        ("FONTNAME",   (0, 0), (0, 0),  "Helvetica-Bold"),
        ("FONTNAME",   (2, 0), (2, 0),  "Helvetica-Bold"),
        ("FONTNAME",   (0, 1), (0, 1),  "Helvetica-Bold"),
        ("FONTNAME",   (2, 1), (2, 1),  "Helvetica-Bold"),
        ("FONTNAME",   (0, 2), (0, 2),  "Helvetica-Bold"),
        ("FONTNAME",   (2, 2), (2, 2),  "Helvetica-Bold"),
        ("FONTNAME",   (0, 3), (0, 3),  "Helvetica-Bold"),
        ("FONTNAME",   (2, 3), (2, 3),  "Helvetica-Bold"),
        ("FONTNAME",   (0, 4), (0, 4),  "Helvetica-Bold"),
        ("FONTNAME",   (2, 4), (2, 4),  "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1),
         [colors.white, colors.HexColor("#f7f9fc")]),
        ("GRID",       (0, 0), (-1, -1), 0.4, colors.HexColor("#dddddd")),
        ("PADDING",    (0, 0), (-1, -1), 6),
        ("VALIGN",     (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(id_table)

    # ── Section 2: Contact Details ─────────────────────────────────────────
    story.append(Paragraph("2. Contact Details", section_style))
    contact_rows = [
        ["Mobile",    profile.get("mobile", "—"),
         "Email",     profile.get("email", "—")],
        ["Address",   profile.get("address", "—"),
         "District",  profile.get("district", "—")],
        ["Taluka",    profile.get("taluka", "—"),
         "Pin Code",  profile.get("pin_code", "—")],
    ]
    c_table = Table(contact_rows, colWidths=[3 * cm, 7.5 * cm, 3 * cm, 6.5 * cm])
    c_table.setStyle(TableStyle([
        ("FONTNAME",       (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE",       (0, 0), (-1, -1), 9),
        ("FONTNAME",       (0, 0), (0, 0),  "Helvetica-Bold"),
        ("FONTNAME",       (2, 0), (2, 0),  "Helvetica-Bold"),
        ("FONTNAME",       (0, 1), (0, 1),  "Helvetica-Bold"),
        ("FONTNAME",       (2, 1), (2, 1),  "Helvetica-Bold"),
        ("FONTNAME",       (0, 2), (0, 2),  "Helvetica-Bold"),
        ("FONTNAME",       (2, 2), (2, 2),  "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1),
         [colors.white, colors.HexColor("#f7f9fc")]),
        ("GRID",       (0, 0), (-1, -1), 0.4, colors.HexColor("#dddddd")),
        ("PADDING",    (0, 0), (-1, -1), 6),
        ("VALIGN",     (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(c_table)

    # ── Section 3: Application Details ────────────────────────────────────
    story.append(Paragraph("3. Application Details", section_style))
    step2 = reg.get("step2_data", {}) or {}

    if app_type == "New Recognition":
        app_rows = [
            ["Lowest Class Sought",  step2.get("lowest_class", "—"),
             "Highest Class Sought", step2.get("highest_class", "—")],
            ["Board Affiliation",    step2.get("board_affiliation", "—"),
             "Academic Year",        step2.get("academic_year", "—")],
        ]
    elif app_type == "Renewal":
        app_rows = [
            ["Current Rec. Number",  step2.get("recognition_number", "—"),
             "Valid Upto",           step2.get("recognition_validity", "—")],
            ["Has Changes",          step2.get("has_changes", "—"),
             "",                     ""],
        ]
    else:  # Upgradation
        app_rows = [
            ["Upgrading To",         step2.get("upgrade_to", "—"),
             "Reason",               step2.get("upgrade_reason", "—")],
        ]

    a_table = Table(app_rows, colWidths=[4 * cm, 6.5 * cm, 4 * cm, 5.5 * cm])
    a_table.setStyle(TableStyle([
        ("FONTNAME",       (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE",       (0, 0), (-1, -1), 9),
        ("FONTNAME",       (0, 0), (0, 0),  "Helvetica-Bold"),
        ("FONTNAME",       (2, 0), (2, 0),  "Helvetica-Bold"),
        ("FONTNAME",       (0, 1), (0, 1),  "Helvetica-Bold"),
        ("FONTNAME",       (2, 1), (2, 1),  "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1),
         [colors.white, colors.HexColor("#f7f9fc")]),
        ("GRID",           (0, 0), (-1, -1), 0.4, colors.HexColor("#dddddd")),
        ("PADDING",        (0, 0), (-1, -1), 6),
        ("VALIGN",         (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(a_table)

    # ── Section 4: Uploaded Documents ─────────────────────────────────────
    story.append(Paragraph("4. Uploaded Documents", section_style))
    if docs:
        doc_header = [
            Paragraph("Document Type", label_style),
            Paragraph("File Name",     label_style),
            Paragraph("Uploaded On",   label_style),
            Paragraph("View Link",     label_style),
        ]
        doc_rows = [doc_header]
        for d in docs:
            ts = d.get("uploaded_at")
            date_str = _format_ts(ts) or "—"
            url = d.get("download_url", "")
            link = (
                f'<a href="{url}" color="blue"><u>View Document</u></a>'
                if url else "—"
            )
            doc_rows.append([
                Paragraph(d.get("label", d.get("document_type", "")), value_style),
                Paragraph(d.get("file_name", "—"), value_style),
                Paragraph(date_str, note_style),
                Paragraph(link, value_style),
            ])
        d_table = Table(
            doc_rows,
            colWidths=[5 * cm, 5 * cm, 4.5 * cm, 5.5 * cm],
        )
        d_table.setStyle(TableStyle([
            ("BACKGROUND",  (0, 0), (-1, 0),  colors.HexColor("#1e3a5f")),
            ("TEXTCOLOR",   (0, 0), (-1, 0),  colors.white),
            ("FONTNAME",    (0, 0), (-1, 0),  "Helvetica-Bold"),
            ("FONTSIZE",    (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1),
             [colors.white, colors.HexColor("#f7f9fc")]),
            ("GRID",        (0, 0), (-1, -1), 0.4, colors.HexColor("#dddddd")),
            ("PADDING",     (0, 0), (-1, -1), 6),
            ("VALIGN",      (0, 0), (-1, -1), "MIDDLE"),
        ]))
        story.append(d_table)
    else:
        story.append(Paragraph("No documents uploaded.", note_style))

    # ── Section 5: Declaration ─────────────────────────────────────────────
    story.append(Paragraph("5. Declaration", section_style))
    step4 = reg.get("step4_data", {}) or {}
    decl_rows = [
        ["Authorised Signatory", step4.get("signatory_name", "—"),
         "Designation",         step4.get("designation", "—")],
        ["Declaration Accepted", "Yes — digitally signed",
         "Submitted At",         sub_at],
    ]
    decl_table = Table(decl_rows, colWidths=[4 * cm, 6.5 * cm, 4 * cm, 5.5 * cm])
    decl_table.setStyle(TableStyle([
        ("FONTNAME",       (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE",       (0, 0), (-1, -1), 9),
        ("FONTNAME",       (0, 0), (0, 0),  "Helvetica-Bold"),
        ("FONTNAME",       (2, 0), (2, 0),  "Helvetica-Bold"),
        ("FONTNAME",       (0, 1), (0, 1),  "Helvetica-Bold"),
        ("FONTNAME",       (2, 1), (2, 1),  "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1),
         [colors.white, colors.HexColor("#f7f9fc")]),
        ("GRID",           (0, 0), (-1, -1), 0.4, colors.HexColor("#dddddd")),
        ("PADDING",        (0, 0), (-1, -1), 6),
        ("VALIGN",         (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(decl_table)

    # ── Footer ─────────────────────────────────────────────────────────────
    story.append(Spacer(1, 1 * cm))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cccccc")))
    story.append(Spacer(1, 0.3 * cm))
    story.append(Paragraph(
        "This is a computer-generated application. No signature is required.",
        note_style,
    ))
    story.append(Paragraph(
        f"Generated on {datetime.now(timezone.utc).strftime('%d %b %Y, %H:%M UTC')}",
        note_style,
    ))

    doc.build(story)
    return buf.getvalue()


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/prefill")
def prefill_from_profile(
    school_id: str = Depends(_school_id),
    db=Depends(get_db),
):
    """
    Step 1 — return school identity from profile so the frontend
    can show a read-only summary before the user confirms.
    """
    profile = _get_profile_data(db, school_id)
    if not profile:
        raise HTTPException(404, "Profile not found. Complete your profile first.")

    return {
        "school_name":      profile.get("school_name", ""),
        "udise_number":     profile.get("udise_number", ""),
        "school_type":      profile.get("school_type", ""),
        "school_category":  profile.get("school_category", ""),
        "lowest_class":     profile.get("lowest_class", ""),
        "highest_class":    profile.get("highest_class", ""),
        "mobile":           profile.get("mobile", ""),
        "email":            profile.get("email", ""),
        "address":          profile.get("address", ""),
        "district":         profile.get("district", ""),
    }


@router.get("/status", response_model=RegistrationStatusResponse)
def get_status(
    school_id: str = Depends(_school_id),
    db=Depends(get_db),
):
    data = _reg_data(db, school_id)
    return RegistrationStatusResponse(
        school_id=school_id,
        application_type=data.get("application_type"),
        status=data.get("status", "Not Started"),
        step1_complete=bool(data.get("step1_complete")),
        step2_complete=bool(data.get("step2_complete")),
        step3_complete=bool(data.get("step3_complete")),
        step4_complete=bool(data.get("step4_complete")),
        submitted=bool(data.get("submitted")),
        submitted_at=_format_ts(data.get("submitted_at")),
        pdf_url=data.get("pdf_url"),
    )


@router.put("/step1")
def save_step1(
    payload: Step1Payload,
    school_id: str = Depends(_school_id),
    db=Depends(get_db),
):
    """
    Step 1 — confirm application type.
    Idempotent: calling again just updates the type.
    """
    _ensure_reg(db, school_id, payload.application_type)
    reg_ref(db, school_id).update({
        "application_type": payload.application_type,
        "step1_complete":   True,
        "status":           "Draft",
        "updated_at":       firestore.SERVER_TIMESTAMP,
    })
    return {"message": "Step 1 saved", "application_type": payload.application_type}


@router.put("/step2")
def save_step2(
    payload: dict,                    # validated below per app_type
    school_id: str = Depends(_school_id),
    db=Depends(get_db),
):
    """
    Step 2 — application-specific details.
    Validated strictly per application_type.
    """
    data = _reg_data(db, school_id)
    if not data.get("step1_complete"):
        raise HTTPException(400, "Complete Step 1 first.")

    app_type = data.get("application_type", "New Recognition")

    # Validate against the correct schema
    try:
        if app_type == "New Recognition":
            validated = Step2NewRecognition(**payload)
        elif app_type == "Renewal":
            validated = Step2Renewal(**payload)
        else:
            validated = Step2Upgradation(**payload)
    except Exception as exc:
        raise HTTPException(422, detail=str(exc))

    reg_ref(db, school_id).update({
        "step2_data":     validated.dict(),
        "step2_complete": True,
        "updated_at":     firestore.SERVER_TIMESTAMP,
    })
    return {"message": "Step 2 saved"}


@router.get("/documents", response_model=List[DocumentResponse])
def list_documents(
    school_id: str = Depends(_school_id),
    db=Depends(get_db),
):
    docs = _col_to_list(reg_sub_col(db, school_id, REG_SUB_DOCUMENTS))
    result = []
    for d in docs:
        result.append(DocumentResponse(
            id=d.get("id", ""),
            document_type=d.get("document_type", ""),
            label=DOCUMENT_LABELS.get(d.get("document_type", ""), d.get("document_type", "")),
            file_name=d.get("file_name", ""),
            content_type=d.get("content_type", ""),
            download_url=d.get("download_url", ""),
            uploaded_at=_format_ts(d.get("uploaded_at")),
        ))
    return result


@router.post("/upload-document", status_code=201)
async def upload_document(
    document_type: str = Form(...),
    file: UploadFile = File(...),
    school_id: str = Depends(_school_id),
    db=Depends(get_db),
):
    """
    Step 3 — secure document upload.

    Security controls:
    • MIME type checked against whitelist (NOT just file extension)
    • File size hard-capped at 5 MB
    • Filename sanitised (no path traversal, no special chars)
    • Storage path is scoped to school_id so one school cannot
      overwrite another school's documents
    • Firestore record stores document_type, not free-form path
    """
    data = _reg_data(db, school_id)
    if not data.get("step1_complete"):
        raise HTTPException(400, "Complete Step 1 before uploading documents.")

    app_type = data.get("application_type", "New Recognition")
    allowed_doc_types = DOCUMENT_TYPES_PER_APP.get(app_type, [])
    if document_type not in allowed_doc_types:
        raise HTTPException(
            400,
            f"'{document_type}' is not a valid document type for {app_type}. "
            f"Allowed: {allowed_doc_types}",
        )

    # ── Security: MIME type ───────────────────────────────────────────────
    _validate_mime(file.content_type)

    # ── Read & validate size ──────────────────────────────────────────────
    file_bytes = await file.read()
    _validate_size(file_bytes)

    # ── Additional MIME magic-byte check for images ───────────────────────
    if file.content_type == "image/jpeg" and not (
        file_bytes[:2] == b"\xff\xd8"
    ):
        raise HTTPException(400, "File does not appear to be a valid JPEG.")
    if file.content_type == "image/png" and not (
        file_bytes[:8] == b"\x89PNG\r\n\x1a\n"
    ):
        raise HTTPException(400, "File does not appear to be a valid PNG.")
    if file.content_type == "application/pdf" and not (
        file_bytes[:4] == b"%PDF"
    ):
        raise HTTPException(400, "File does not appear to be a valid PDF.")

    file.file.seek(0)   # 🔥 IMPORTANT FIX
    # ── Upload to Cloudinary ─────────────────────────────────────────────
    safe_name = _sanitize_filename(file.filename or "document")

    try:
        folder = f"registration/{school_id}/{document_type}"
        upload_result = upload_file(file, folder)

        download_url = upload_result["url"]
        public_id = upload_result["public_id"]

    except Exception as exc:
        logger.error("Cloudinary upload failed: %s", exc)
        raise HTTPException(500, "Document upload failed. Please try again.")
    

    # ── Persist metadata ───────────────────────────────────────────────────
    _ensure_reg(db, school_id)

    doc_ref = reg_sub_col(db, school_id, REG_SUB_DOCUMENTS).document()

    doc_ref.set({
        "document_type": document_type,
        "label":         DOCUMENT_LABELS.get(document_type, document_type),
        "file_name":     safe_name,
        "download_url":  download_url,
        "public_id":     public_id,
        "content_type":  file.content_type,
        "uploaded_at":   firestore.SERVER_TIMESTAMP,
    })

 

    # Mark step3 started
    reg_ref(db, school_id).update({
        "step3_started": True,
        "updated_at":    firestore.SERVER_TIMESTAMP,
    })

    return {
        "message":      f"'{safe_name}' uploaded successfully",
        "id":           doc_ref.id,
        "download_url": download_url,
    }



@router.delete("/documents/{doc_id}")
def delete_document(
    doc_id: str,
    school_id: str = Depends(_school_id),
    db=Depends(get_db),
):
    """Delete a previously uploaded document (before submission)."""

    data = _reg_data(db, school_id)
    if data.get("submitted"):
        raise HTTPException(400, "Cannot delete documents after submission.")

    ref = reg_sub_col(db, school_id, REG_SUB_DOCUMENTS).document(doc_id)
    snap = ref.get()

    if not snap.exists:
        raise HTTPException(404, "Document not found.")

    doc_data = snap.to_dict()

    # 🔥 Delete from Cloudinary
    public_id = doc_data.get("public_id")

    if public_id:
        try:
            result = destroy(public_id)

            if result.get("result") != "ok":
                logger.warning(f"Cloudinary delete issue: {result}")

        except Exception as exc:
            logger.warning("Cloudinary delete failed (continuing): %s", exc)

    # 🧾 Delete from Firestore
    ref.delete()

    return {"message": "Document deleted successfully"}


@router.post("/step3/complete")
def complete_step3(
    school_id: str = Depends(_school_id),
    db=Depends(get_db),
):
    """
    Validate that all required documents for the application type are uploaded,
    then mark Step 3 complete.
    """
    data     = _reg_data(db, school_id)
    app_type = data.get("application_type", "New Recognition")
    required = set(DOCUMENT_TYPES_PER_APP.get(app_type, []))

    uploaded_types = {
        d.get("document_type")
        for d in _col_to_list(reg_sub_col(db, school_id, REG_SUB_DOCUMENTS))
    }
    missing = required - uploaded_types
    if missing:
        missing_labels = [DOCUMENT_LABELS.get(m, m) for m in missing]
        raise HTTPException(
            400,
            f"Missing required documents: {', '.join(missing_labels)}",
        )

    reg_ref(db, school_id).update({
        "step3_complete": True,
        "updated_at":     firestore.SERVER_TIMESTAMP,
    })
    return {"message": "Step 3 complete. All required documents uploaded."}


@router.post("/submit")
def submit_application(
    payload: Step4Payload,
    school_id: str = Depends(_school_id),
    db=Depends(get_db),
):
    """
    Step 4 — final submission.

    Validates:
    1. All previous steps complete
    2. All required docs uploaded
    3. Declaration accepted
    Then generates and stores the PDF, marks application as Submitted.
    """
    data = _reg_data(db, school_id)

    # ── Guard: previous steps ─────────────────────────────────────────────
    for step, key in [(1, "step1_complete"), (2, "step2_complete")]:
        if not data.get(key):
            raise HTTPException(400, f"Complete Step {step} first.")

    if data.get("submitted"):
        raise HTTPException(400, "Application already submitted.")

    # ── Guard: required documents ─────────────────────────────────────────
    app_type = data.get("application_type", "New Recognition")
    required = set(DOCUMENT_TYPES_PER_APP.get(app_type, []))
    uploaded = {
        d.get("document_type")
        for d in _col_to_list(reg_sub_col(db, school_id, REG_SUB_DOCUMENTS))
    }
    missing = required - uploaded
    if missing:
        missing_labels = [DOCUMENT_LABELS.get(m, m) for m in missing]
        raise HTTPException(
            400,
            f"Missing required documents: {', '.join(missing_labels)}",
        )

    # ── Save Step 4 data ───────────────────────────────────────────────────
    app_id = f"APP-{datetime.now(timezone.utc).year}-{str(uuid.uuid4())[:6].upper()}"

    reg_ref(db, school_id).update({
        "step4_data":     payload.dict(),
        "step4_complete": True,
        "step3_complete": True,      # retroactively confirm
        "application_id": app_id,
        "updated_at":     firestore.SERVER_TIMESTAMP,
    })

    # ── Generate PDF ───────────────────────────────────────────────────────
    profile  = _get_profile_data(db, school_id)
    reg_snap = _reg_data(db, school_id)
    docs     = _col_to_list(reg_sub_col(db, school_id, REG_SUB_DOCUMENTS))

    try:
        pdf_bytes = _generate_pdf(reg_snap, profile, docs)
    except Exception as exc:
        logger.error("PDF generation failed: %s", exc)
        # Still mark submitted even if PDF fails; URL will be None
        pdf_bytes = None

    pdf_url: Optional[str] = None

    if pdf_bytes:
        try:
            import cloudinary.uploader

            result = cloudinary.uploader.upload(
                pdf_bytes,
                resource_type="raw",   # 🔥 IMPORTANT for PDF
                folder=f"registration_pdfs/{school_id}",
                public_id=app_id
            )

            pdf_url = result.get("secure_url")

            reg_ref(db, school_id).update({
                "pdf_url": pdf_url
            })

        except Exception as exc:
            logger.error("PDF upload to Cloudinary failed: %s", exc)

    # ── Mark Submitted ─────────────────────────────────────────────────────
    # ── Mark Submitted ─────────────────────────
    reg_ref(db, school_id).update({
        "submitted": True,
        "status": "Submitted",
        "submitted_at": firestore.SERVER_TIMESTAMP,
    })

    # ✅ CORRECT NOTIFICATION
    create_notification(
        school_id=school_id,
        title="Application Submitted",
        message="Your application has been submitted successfully.",
        notif_type="info",
    )

    print("✅ Notification created")

    return {
        "message":        "Application submitted successfully",
        "application_id": app_id,
        "pdf_url":        pdf_url,
    }


@router.get("/pdf")
def download_pdf(
    school_id: str = Depends(_school_id),
    db=Depends(get_db),
):
    """
    Re-generate (or serve cached) application PDF for download.
    Returns a streaming PDF response.
    """
    data = _reg_data(db, school_id)
    if not data.get("submitted"):
        raise HTTPException(400, "Application not yet submitted.")

    # Try stored URL first (fast path)
    pdf_url = data.get("pdf_url")
    if pdf_url:
        return {"pdf_url": pdf_url}

    # Re-generate on the fly
    profile = _get_profile_data(db, school_id)
    docs    = _col_to_list(reg_sub_col(db, school_id, REG_SUB_DOCUMENTS))
    try:
        pdf_bytes = _generate_pdf(data, profile, docs)
    except Exception as exc:
        logger.error("On-the-fly PDF generation failed: %s", exc)
        raise HTTPException(500, "Could not generate PDF. Please try again.")

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="application_{school_id}.pdf"'
            )
        },
    )