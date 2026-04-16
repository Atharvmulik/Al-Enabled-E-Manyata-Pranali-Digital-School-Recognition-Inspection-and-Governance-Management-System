"""
app/models.py
─────────────────────────────────────────────────────────────────────────────
Firestore collection & document structure for the School Profile system.

No ORM classes needed — Firestore is schema-less.
This file provides:
  1. Collection name constants  (use these everywhere instead of raw strings)
  2. Helper functions           (get_db, school_ref, sub-collection refs)
  3. Default document builders  (so every document always has the same shape)

Firestore Structure
───────────────────
school_profiles/                        ← top-level collection
  {school_id}/                          ← one document per school (Firebase Auth UID)
    basic_details         (field map)
    receipts_expenditure  (field map)
    legal_details         (field map)
    location              (field map)
    infrastructure        (field map)
    staff_summary         (field map)
    safety                (field map)
    vocational_education  (field map)
    meta                  (field map — created_at, updated_at, application_type)

    ── sub-collections ──────────────────
    teachers/             {auto_id}
    non_teaching_staff/   {auto_id}
    vocational_staff/     {auto_id}
    students/             {auto_id}
    section_configs/      {auto_id}
    grants/               {auto_id}
    assistance/           {auto_id}
    vocational_rows/      {auto_id}
    vocational_labs/      {auto_id}
    anganwadi_rows/       {auto_id}
    sec_156/              {auto_id}
    sec_157/              {auto_id}
    higher_secondary_labs/{auto_id}
    digital_equip_items/  {auto_id}
    digital_facilities/   {auto_id}
    documents/            {auto_id}
"""

from firebase_admin import firestore as _fs
from app.firebase_config import *   # ensures firebase_admin is initialised
from datetime import datetime, timezone




# ─────────────────────────────────────────────
# Collection / sub-collection name constants
# ─────────────────────────────────────────────

COL_SCHOOLS            = "school_profiles"

SUB_TEACHERS           = "teachers"
SUB_NON_TEACHING       = "non_teaching_staff"
SUB_VOC_STAFF          = "vocational_staff"
SUB_STUDENTS           = "students"
SUB_SECTION_CONFIGS    = "section_configs"
SUB_GRANTS             = "grants"
SUB_ASSISTANCE         = "assistance"
SUB_VOC_ROWS           = "vocational_rows"
SUB_VOC_LABS           = "vocational_labs"
SUB_ANGANWADI          = "anganwadi_rows"
SUB_SEC_156            = "sec_156"
SUB_SEC_157            = "sec_157"
SUB_HS_LABS            = "higher_secondary_labs"
SUB_DIGITAL_EQUIP      = "digital_equip_items"
SUB_DIGITAL_FACILITIES = "digital_facilities"
SUB_DOCUMENTS          = "documents"          # Legacy / kept for backward compat only
SUB_PROFILE_DOCUMENTS  = "profile_documents"   # ✅ Correct collection for all profile docs
COL_APPLICATIONS = "applications"
COL_INSPECTIONS  = "inspections"

# ─────────────────────────────────────────────
# DB client helper  (FastAPI Dependency)
# ─────────────────────────────────────────────

def get_db():
    """Return the Firestore client. Inject with Depends(get_db)."""
    return _fs.client()


# ─────────────────────────────────────────────
# Reference helpers
# ─────────────────────────────────────────────

def school_ref(db, school_id: str):
    """Top-level school document reference."""
    return db.collection(COL_SCHOOLS).document(school_id)


def sub_col(db, school_id: str, sub: str):
    """Sub-collection reference under a school document."""
    return school_ref(db, school_id).collection(sub)


def sub_doc(db, school_id: str, sub: str, doc_id: str):
    """Specific document reference inside a sub-collection."""
    return sub_col(db, school_id, sub).document(doc_id)


# ─────────────────────────────────────────────
# Default document shapes
# ─────────────────────────────────────────────

def default_meta(application_type: str = "New Recognition") -> dict:
    return {
    "application_type": application_type,
    "created_at": _fs.SERVER_TIMESTAMP,
    "updated_at": _fs.SERVER_TIMESTAMP,
    "step_completion": {}   # 🔥 ADD THIS
}


def default_basic_details() -> dict:
    return {
        "school_name": None, "udise_number": None, "est_year": None, "board_affiliation": None,
        "std_code": None, "landline": None, "mobile": None,
        "email": None, "website": None,
        "hos_type": None, "hos_name": None, "hos_mobile": None, "hos_email": None,
        "management_group": None, "management_code": None,
        "sub_management": None, "nodal_ministry": None, "administration_type": None,
        "classification": None, "special_school_type": None,
        "is_pm_shri": None, "school_type": None, "school_category": None,
        "lowest_class": None, "highest_class": None,
        "has_pre_primary": None, "pre_primary_count": None,
        "instruction_medium": None,
        "curriculum_primary": None, "curriculum_upper_primary": None,
        "is_minority": None, "minority_community": None,
        "is_rte": None, "is_vocational": None,
        "funding_source": None, "sanction_order_number": None,
        "is_pre_vocational": None, "is_skill_center": None,
        "is_residential": None, "residential_type": None,
        "is_shift": None, "is_mother_tongue": None,
        "is_all_weather_road": None, "instructional_days": None,
        "is_cce": None, "is_records_maintained": None, "is_records_shared": None,
        "dist_primary": None, "dist_upper_primary": None,
        "dist_secondary": None, "dist_higher_secondary": None,
        "has_anganwadi": None, "anganwadi_centers_count": None,
        "has_balavatika": None, "has_oosc": None, "has_oosc_st": None,
        "remedial_students": None, "learning_enhancement_students": None,
        "academic_inspections": None, "crc_visits": None, "brc_visits": None,
        "district_visits": None, "regional_visits": None, "hq_visits": None,
        "has_smc": None, "has_sdmc": None, "smc_meetings": None,
        "has_smc_plan": None, "smc_plan_year": None,
        "has_sbc": None, "has_ac": None, "has_pta": None, "pta_meetings": None,
        "has_pfms": None, "pfms_id": None, "has_multi_class": None,
        "is_school_complex": None, "is_hub_school": None,
        "complex_pre_primary": None, "complex_primary": None,
        "complex_upper_primary": None, "complex_secondary": None,
        "complex_higher_secondary": None, "complex_total": None,
        "has_ebsb": None, "has_fit_india": None,
        "has_holistic_report_card": None, "has_teacher_id": None,
        "pm_poshan_total_days": None, "pm_poshan_days_per_week": None,
        "pm_poshan_days_per_month": None, "pm_poshan_balvatika": None,
        "has_agreed_first_year_activities": False,
        "has_disaster_plan": None, "has_structural_audit": None,
        "has_non_structural_audit": None, "has_cctv": None,
        "has_fire_extinguishers": None, "has_nodal_teacher": None,
        "has_safety_training": None, "safety_training_date": None,
        "disaster_management_taught": None, "has_self_defence_grant": None,
        "self_defence_upper_primary": None, "self_defence_secondary": None,
        "self_defence_higher_secondary": None, "has_safety_display_board": None,
        "has_first_level_counselor": None, "safety_audit_frequency": None,
        "has_teacher_photos": None, "has_vidya_pravesh": None,
        "student_attendance_capture": None, "teacher_attendance_capture": None,
        "has_youth_club": None, "has_eco_club": None, "sssa_certification": None,
        "has_ict_register": None, "ict_register_date": None,
        "has_sports_register": None, "sports_register_date": None,
        "has_library_register": None, "library_register_date": None,
    }


def default_receipts_expenditure() -> dict:
    return {
        "exp_maintenance": None, "exp_teachers": None,
        "exp_construction": None, "exp_others": None,
    }


def default_legal_details() -> dict:
    return {
        "recognition_number": None,
        "recognition_date": None,
        "affiliation_number": None,
    }


def default_location() -> dict:
    return {
        "location_type": None, "address": None, "pin_code": None,
        "district": None, "taluka": None, "revenue_block": None,
        "village_name": None, "gram_panchayat": None,
        "urban_local_body": None, "ward_name": None, "crc_name": None,
        "assembly_constituency": None, "parliamentary_constituency": None,
    }


def default_infrastructure() -> dict:
    return {
        "building_status": None, "active_building_blocks": None,
        "building_pucca": None, "building_partially_pucca": None,
        "building_kuchcha": None, "building_tent": None,
        "storey_single": None, "storey_double": None,
        "storey_triple": None, "storey_multi": None,
        "building_dilapidated": None, "building_under_construction": None,
        "classrooms_pre_primary": None, "classrooms_primary": None,
        "classrooms_upper_primary": None, "classrooms_secondary": None,
        "classrooms_higher_secondary": None, "classrooms_not_in_use": None,
        "total_instructional_rooms": None,
        "classrooms_under_construction": None, "classrooms_dilapidated": None,
        "classroom_conditions": {},
        "boundary_wall": None, "has_electricity": None,
        "classrooms_with_fans": None, "classrooms_with_acs": None,
        "classrooms_with_heaters": None, "has_solar_panel": None,
        "has_principal_room": None, "has_library_room": None,
        "has_vice_principal_room": None, "has_girls_common_room": None,
        "has_staffroom": None, "has_co_curricular_room": None, "lab_count": None,
        "has_toilets": None, "toilet_boys_total": None, "toilet_boys_func": None,
        "toilet_boys_water": None, "toilet_girls_total": None,
        "toilet_girls_func": None, "toilet_girls_water": None,
        "cwsn_boys_total": None, "cwsn_boys_func": None, "cwsn_boys_water": None,
        "cwsn_girls_total": None, "cwsn_girls_func": None, "cwsn_girls_water": None,
        "urinals_boys_total": None, "urinals_girls_total": None,
        "toilets_const_boys": None, "toilets_const_girls": None,
        "has_hand_washing_near_toilets": None, "toilet_location": None,
        "has_incinerator": None, "has_pad_vending_machine": None,
        "has_hand_washing_before_meal": None, "wash_points_count": None,
        "water_hand_pump": None, "water_protected_well": None,
        "water_unprotected_well": None, "water_tap_water": None,
        "water_packaged_water": None, "water_others": None,
        "has_water_purifier": None, "has_water_quality_tested": None,
        "has_rain_water_harvesting": None,
        "has_library": None, "library_books": None, "has_book_bank": None,
        "book_bank_books": None, "has_reading_corner": None,
        "reading_corner_books": None, "has_full_time_librarian": None,
        "subscribes_newspapers": None, "library_books_borrowed": None,
        "land_area": None, "land_area_unit": "Square Meter",
        "has_expansion_land": None, "expansion_type": None,
        "additional_classrooms_needed": None,
        "has_playground": None, "playground_area": None,
        "playground_unit": "Square Meter", "has_alternate_playground": None,
        "has_health_checkup": None, "health_checkups_count": None,
        "health_params_height": None, "health_params_weight": None,
        "health_params_eyes": None, "health_params_dental": None,
        "health_params_throat": None, "deworming_tablets": None,
        "iron_folic_tablets": None, "maintains_health_records": None,
        "has_thermal_scanner": None, "has_first_aid": None,
        "has_essential_medicines": None,
        "has_ramp": None, "has_hand_rails": None, "has_special_educator": None,
        "has_kitchen_garden": None, "has_kitchen_shed": None,
        "dustbins_classroom": None, "dustbins_toilets": None,
        "dustbins_kitchen": None, "has_student_furniture": None,
        "furniture_student_count": None,
        "has_staff_quarters": None, "has_tinkering_lab": None,
        "atl_id": None, "has_integrated_science_lab": None,
        "hostel_primary_availability": None, "hostel_primary_boys": None,
        "hostel_primary_girls": None,
        "hostel_upper_primary_availability": None,
        "hostel_upper_primary_boys": None, "hostel_upper_primary_girls": None,
        "hostel_secondary_availability": None,
        "hostel_secondary_boys": None, "hostel_secondary_girls": None,
        "hostel_higher_secondary_availability": None,
        "hostel_higher_secondary_boys": None, "hostel_higher_secondary_girls": None,
        "equip_audio_visual": None, "equip_biometric": None,
        "equip_science_kit": None, "equip_math_kit": None,
        "has_ict_lab": None, "ict_labs_count": None,
        "total_functional_ict_devices": None, "has_separate_ict_lab_room": None,
        "has_samagra_ict_lab": None, "samagra_ict_year": None,
        "is_samagra_ict_functional": None, "samagra_ict_model": None,
        "samagra_ict_instructor_type": None,
        "has_internet": None, "internet_type": None, "internet_pedagogical": None,
        "has_digital_library": None, "digital_library_books": None,
    }


def default_staff_summary() -> dict:
    return {
        "count_regular": None, "count_non_regular": None,
        "count_non_teaching": None, "count_vocational": None,
        "required_pre_primary": None, "required_primary": None,
        "required_upper_primary": None, "required_secondary": None,
        "required_higher_secondary": None,
    }


def default_safety() -> dict:
    return {
        "has_disaster_plan": None, "has_structural_audit": None,
        "has_non_structural_audit": None, "has_cctv": None,
        "has_fire_extinguishers": None, "has_nodal_teacher": None,
        "has_safety_training": None, "safety_training_date": None,
        "disaster_management_taught": None, "has_self_defence_grant": None,
        "self_defence_upper_primary": None, "self_defence_secondary": None,
        "self_defence_higher_secondary": None,
        "has_safety_display_board": None,
        "has_first_level_counselor": None, "safety_audit_frequency": None,
    }


def default_vocational_education() -> dict:
    return {
        "vocational_guest_lecturers": None,
        "vocational_industry_visits": None,
        "vocational_industry_linkages": None,
        "plac_enrolled_10": None, "plac_passed_10": None,
        "plac_self_emp_10": None, "plac_placed_10": None,
        "plac_enrolled_12": None, "plac_passed_12": None,
        "plac_self_emp_12": None, "plac_placed_12": None,
    }


def default_teacher() -> dict:
    return {
        "name": None, "gender": None, "dob": None,
        "social_category": None, "is_cwsn": "2-No",
        "disability": "1-Not applicable", "blood_group": None,
        "academic_level": None, "academic_degree": None, "professional_qual": None,
        "national_code": None, "teacher_code_state": None,
        "mobile": None, "email": None,
        "aadhaar_number": None, "aadhaar_name": None, "crr_number": None,
        "subject_level_math": "1-Not Studied",
        "subject_level_science": "1-Not Studied",
        "subject_level_english": "1-Not Studied",
        "subject_level_social_science": "1-Not Studied",
        "subject_level_language": "1-Not Studied",
        "nature_of_appointment": None, "teacher_type": None,
        "appointed_level": None, "classes_taught": None,
        "date_joining_service": None, "date_joining_present_school": None,
        "appointed_for_subject": None,
        "main_subject1": None, "main_subject2": None,
        "is_deputation": "2-No", "is_guest_contractual": "2-No",
        "training_needed": [], "training_received": [], "languages": [],
        "hs_mastery_physics": None, "hs_mastery_chemistry": None,
        "hs_mastery_biology": None, "hs_mastery_math": None,
        "trained_cwsn": "2-No", "trained_computer": "2-No",
        "is_nishtha_trained": "2-No", "non_teaching_days": "0",
        "trained_safety": "2-No", "trained_cyber_safety": "2-No",
        "trained_cwsn_identification": "2-No",
        "is_tet_qualified": "2-No", "tet_year": None,
        "is_capable_digital": "2-No",
        "created_at": _fs.SERVER_TIMESTAMP,
    }


def default_non_teaching_staff() -> dict:
    return {
        "name": None, "gender": None, "dob": None,
        "state_code": None, "social_category": None,
        "academic_level": None, "degree": None,
        "mobile": None, "email": None,
        "aadhaar_number": None, "aadhaar_name": None,
        "disability": "1-Not applicable",
        "nature_of_appointment": None,
        "date_joining_service": None, "date_joining_school": None,
        "current_post": None,
        "created_at": _fs.SERVER_TIMESTAMP,
    }


def default_vocational_staff() -> dict:
    return {
        "name": None, "gender": None, "dob": None,
        "vtp_code": None, "social_category": None,
        "academic_level": None, "degree": None, "professional_qual": None,
        "mobile": None, "email": None,
        "aadhaar_number": None, "aadhaar_name": None,
        "disability": "1-Not applicable",
        "nature_of_appointment": None,
        "date_joining_service": None, "date_joining_school": None,
        "type_of_teacher": None, "classes_taught": None,
        "sector": None, "job_role": None,
        "experience": None, "received_induction": None,
        "created_at": _fs.SERVER_TIMESTAMP,
    }


def default_student() -> dict:
    return {
        "name": None, "gender": None, "dob": None,
        "mother_name": None, "father_name": None, "guardian_name": None,
        "aadhaar_number": None, "aadhaar_name": None,
        "address": None, "pincode": None,
        "mobile": None, "alternate_mobile": None, "email": None,
        "mother_tongue": "19-English", "social_category": "1-General",
        "minority_group": "7-Not Applicable",
        "is_bpl": "2-No", "is_aay": "2-No", "is_ews": "2-No",
        "is_cwsn": "2-No", "impairment_type": "1-Not applicable",
        "has_disability_certificate": "2-No",
        "is_indian_national": "1-Yes", "out_of_school_child": "2-No",
        "mainstreaming_year": None, "blood_group": "9-Not Known",
        "academic_year": "2024-25", "school_udise_code": None,
        "student_grade": None, "student_national_code": None,
        "student_section": "A", "roll_number": None,
        "admission_number": None, "admission_date": None,
        "instruction_medium": None, "language_group": None, "academic_stream": None,
        "prev_year_status": None, "prev_year_grade": None,
        "is_admitted_rte": "2-No", "rte_amount_claimed": None,
        "prev_class_result": None, "prev_class_marks": None,
        "prev_year_attendance": None,
        "has_facilities": "2-No", "facilities_received": [],
        "has_cwsn_facilities": "2-No", "cwsn_facilities_received": [],
        "screened_sld": "2-No", "sld_type": None,
        "screened_asd": "2-No", "screened_adhd": "2-No",
        "is_gifted": "2-No", "appeared_competitions": "2-No",
        "participates_ncc": "2-No", "digital_capable": "2-No",
        "height": None, "weight": None,
        "distance_to_school": None, "guardian_education": None,
        "undertook_vocational": "2-No", "vocational_trade": None,
        "vocational_job_role": None,
        "vocational_prev_class_exam": "3-Not Applicable",
        "vocational_prev_class_marks": None,
        "current_year_result": None, "current_year_marks": None,
        "current_year_attendance": None,
        "created_at": _fs.SERVER_TIMESTAMP,
    }



"""
────────────────────────────────────────────────────────────────────────────────
ADDITIONS TO  app/models.py
────────────────────────────────────────────────────────────────────────────────

Paste the constants block at the top of models.py (after the existing SUB_*
constants) and paste the three default-builder functions anywhere below the
existing ones.

Nothing in the existing models.py needs to be changed — this is purely additive.
────────────────────────────────────────────────────────────────────────────────
"""

# ─────────────────────────────────────────────────────────────────────────────
# NEW COLLECTION / SUB-COLLECTION CONSTANTS  (add after existing SUB_* block)
# ─────────────────────────────────────────────────────────────────────────────

COL_REGISTRATIONS        = "school_registrations"   # top-level collection

# sub-collections (mirrors profile but scoped under registrations)
REG_SUB_TEACHERS         = "teachers"
REG_SUB_NON_TEACHING     = "non_teaching_staff"
REG_SUB_VOC_STAFF        = "vocational_staff"
REG_SUB_STUDENTS         = "students"
REG_SUB_SECTION_CONFIGS  = "section_configs"
REG_SUB_GRANTS           = "grants"
REG_SUB_ASSISTANCE       = "assistance"
REG_SUB_VOC_ROWS         = "vocational_rows"
REG_SUB_VOC_LABS         = "vocational_labs"
REG_SUB_ANGANWADI        = "anganwadi_rows"
REG_SUB_SEC_156          = "sec_156"
REG_SUB_SEC_157          = "sec_157"
REG_SUB_HS_LABS          = "higher_secondary_labs"
REG_SUB_DIGITAL_EQUIP    = "digital_equip_items"
REG_SUB_DIGITAL_FACS     = "digital_facilities"
REG_SUB_DOCUMENTS        = "documents"


# ─────────────────────────────────────────────────────────────────────────────
# REFERENCE HELPERS  (add after existing reference helpers)
# ─────────────────────────────────────────────────────────────────────────────

from firebase_admin import firestore as _fs   # already imported in models.py


def reg_ref(db, school_id: str):
    """Top-level registration document reference for a school."""
    return db.collection(COL_REGISTRATIONS).document(school_id)


def reg_sub_col(db, school_id: str, sub: str):
    """Sub-collection reference under a registration document."""
    return reg_ref(db, school_id).collection(sub)


def reg_sub_doc(db, school_id: str, sub: str, doc_id: str):
    """Specific document inside a registration sub-collection."""
    return reg_sub_col(db, school_id, sub).document(doc_id)


# ─────────────────────────────────────────────────────────────────────────────
# DEFAULT DOCUMENT BUILDERS  (add after existing default_* functions)
# ─────────────────────────────────────────────────────────────────────────────

def default_reg_meta(application_type: str = "New Recognition") -> dict:
    """
    Top-level metadata for a school_registrations/{school_id} document.
    All step_*_complete flags start False and are set True as each
    step is saved successfully.
    """
    from firebase_admin import firestore as _fs
    return {
        "application_type": application_type,
        "status":           "Draft",
        "submitted":        False,
        "submitted_at":     None,
        "application_id":   None,
        "pdf_path":         None,
        "pdf_url":          None,
        # Step completion tracking
        "step1_complete":   False,
        "step2_complete":   False,
        "step3_complete":   False,
        "step3_started":    False,
        "step4_complete":   False,
        # Step data payloads (saved on each step)
        "step2_data":       {},
        "step4_data":       {},
        "created_at":       _fs.SERVER_TIMESTAMP,
        "updated_at":       _fs.SERVER_TIMESTAMP,
    }

def default_reg_step_completion() -> dict:
    """
    Tracks which of the 9 steps have been saved at least once.
    Used by GET /registration/status.
    """
    return {
        "basic_details":         False,
        "receipts_expenditure":  False,
        "legal_details":         False,
        "location":              False,
        "infrastructure":        False,
        "staff":                 False,
        "safety":                False,
        "student_capacity":      False,
        "vocational_education":  False,
    }

def get_registration_data(school_id: str) -> dict:
    """
    Convenience function to read the full registration document outside a
    FastAPI request context (e.g. from a background job or admin script).
    Returns empty dict if the document does not exist.
    """
    from firebase_admin import firestore as _fs
    db  = _fs.client()
    ref = db.collection("school_registrations").document(school_id)
    snap = ref.get()
    if not snap.exists:
        return {}
    data = snap.to_dict() or {}
    data["school_id"] = school_id
    return data
 
def default_reg_basic_details() -> dict:
    """
    Flat field-map for Step 1 – Basic Details (registration).
    Matches BasicDetailsSchema exactly; all fields default to None.
    """
    return {
        # School identity
        "school_name": None, "est_year": None, "board_affiliation": None,
        "std_code": None, "landline": None, "mobile": None,
        "email": None, "website": None,
        # HoS
        "hos_type": None, "hos_name": None, "hos_mobile": None, "hos_email": None,
        # Management
        "management_group": None, "management_code": None,
        "sub_management": None, "nodal_ministry": None, "administration_type": None,
        # Classification
        "classification": None, "special_school_type": None,
        "is_pm_shri": None, "school_type": None, "school_category": None,
        # Classes
        "lowest_class": None, "highest_class": None,
        "has_pre_primary": None, "pre_primary_count": None,
        "application_type": "New Registration",
        # Curriculum
        "instruction_medium": None,
        "curriculum_primary": None, "curriculum_upper_primary": None,
        # Flags
        "is_minority": None, "minority_community": None,
        "is_rte": None, "is_vocational": None,
        "funding_source": None, "sanction_order_number": None,
        "is_pre_vocational": None, "is_skill_center": None,
        "is_residential": None, "residential_type": None,
        "is_shift": None, "is_mother_tongue": None,
        "is_all_weather_road": None, "instructional_days": None,
        "is_cce": None, "is_records_maintained": None, "is_records_shared": None,
        # Distance
        "dist_primary": None, "dist_upper_primary": None,
        "dist_secondary": None, "dist_higher_secondary": None,
        # Anganwadi / OoSC
        "has_anganwadi": None, "anganwadi_centers_count": None,
        "has_balavatika": None, "has_oosc": None, "has_oosc_st": None,
        "remedial_students": None, "learning_enhancement_students": None,
        # Inspections
        "academic_inspections": None, "crc_visits": None, "brc_visits": None,
        "district_visits": None, "regional_visits": None, "hq_visits": None,
        # Committees
        "has_smc": None, "has_sdmc": None, "smc_meetings": None,
        "has_smc_plan": None, "smc_plan_year": None,
        "has_sbc": None, "has_ac": None, "has_pta": None, "pta_meetings": None,
        # PFMS & Multi-grade
        "has_pfms": None, "pfms_id": None, "has_multi_class": None,
        "is_school_complex": None, "is_hub_school": None,
        "complex_pre_primary": None, "complex_primary": None,
        "complex_upper_primary": None, "complex_secondary": None,
        "complex_higher_secondary": None, "complex_total": None,
        # Misc flags
        "has_ebsb": None, "has_fit_india": None,
        "has_holistic_report_card": None, "has_teacher_id": None,
        # PM Poshan
        "pm_poshan_total_days": None, "pm_poshan_days_per_week": None,
        "pm_poshan_days_per_month": None, "pm_poshan_balvatika": None,
        # Activity agreement
        "has_agreed_first_year_activities": False,
        # Safety (Section 1.58)
        "has_disaster_plan": None, "has_structural_audit": None,
        "has_non_structural_audit": None, "has_cctv": None,
        "has_fire_extinguishers": None, "has_nodal_teacher": None,
        "has_safety_training": None, "safety_training_date": None,
        "disaster_management_taught": None, "has_self_defence_grant": None,
        "self_defence_upper_primary": None, "self_defence_secondary": None,
        "self_defence_higher_secondary": None,
        "has_safety_display_board": None,
        "has_first_level_counselor": None, "safety_audit_frequency": None,
        "has_teacher_photos": None, "has_vidya_pravesh": None,
        "student_attendance_capture": None, "teacher_attendance_capture": None,
        "has_youth_club": None, "has_eco_club": None, "sssa_certification": None,
        # Registers (Section 1.61)
        "has_ict_register": None, "ict_register_date": None,
        "has_sports_register": None, "sports_register_date": None,
        "has_library_register": None, "library_register_date": None,
    }


def default_reg_receipts_expenditure() -> dict:
    return {
        "exp_maintenance": None, "exp_teachers": None,
        "exp_construction": None, "exp_others": None,
    }


def default_reg_legal_details() -> dict:
    return {
        "recognition_number": None,
        "recognition_date":   None,
        "affiliation_number": None,
    }


def default_reg_location() -> dict:
    return {
        "location_type": None, "address": None, "pin_code": None,
        "district": None, "taluka": None, "revenue_block": None,
        "village_name": None, "gram_panchayat": None,
        "urban_local_body": None, "ward_name": None, "crc_name": None,
        "assembly_constituency": None, "parliamentary_constituency": None,
    }


def default_reg_infrastructure() -> dict:
    return {
        "building_status": None, "active_building_blocks": None,
        "building_pucca": None, "building_partially_pucca": None,
        "building_kuchcha": None, "building_tent": None,
        "storey_single": None, "storey_double": None,
        "storey_triple": None, "storey_multi": None,
        "building_dilapidated": None, "building_under_construction": None,
        "classrooms_pre_primary": None, "classrooms_primary": None,
        "classrooms_upper_primary": None, "classrooms_secondary": None,
        "classrooms_higher_secondary": None, "classrooms_not_in_use": None,
        "total_instructional_rooms": None,
        "classrooms_under_construction": None, "classrooms_dilapidated": None,
        "classroom_conditions": {},
        "boundary_wall": None, "has_electricity": None,
        "classrooms_with_fans": None, "classrooms_with_acs": None,
        "classrooms_with_heaters": None, "has_solar_panel": None,
        "has_principal_room": None, "has_library_room": None,
        "has_vice_principal_room": None, "has_girls_common_room": None,
        "has_staffroom": None, "has_co_curricular_room": None, "lab_count": None,
        "has_toilets": None,
        "toilet_boys_total": None, "toilet_boys_func": None, "toilet_boys_water": None,
        "toilet_girls_total": None, "toilet_girls_func": None, "toilet_girls_water": None,
        "cwsn_boys_total": None, "cwsn_boys_func": None, "cwsn_boys_water": None,
        "cwsn_girls_total": None, "cwsn_girls_func": None, "cwsn_girls_water": None,
        "urinals_boys_total": None, "urinals_girls_total": None,
        "toilets_const_boys": None, "toilets_const_girls": None,
        "has_hand_washing_near_toilets": None, "toilet_location": None,
        "has_incinerator": None, "has_pad_vending_machine": None,
        "has_hand_washing_before_meal": None, "wash_points_count": None,
        "water_hand_pump": None, "water_protected_well": None,
        "water_unprotected_well": None, "water_tap_water": None,
        "water_packaged_water": None, "water_others": None,
        "has_water_purifier": None, "has_water_quality_tested": None,
        "has_rain_water_harvesting": None,
        "has_library": None, "library_books": None, "has_book_bank": None,
        "book_bank_books": None, "has_reading_corner": None,
        "reading_corner_books": None, "has_full_time_librarian": None,
        "subscribes_newspapers": None, "library_books_borrowed": None,
        "land_area": None, "land_area_unit": "Square Meter",
        "has_expansion_land": None, "expansion_type": None,
        "additional_classrooms_needed": None,
        "has_playground": None, "playground_area": None,
        "playground_unit": "Square Meter", "has_alternate_playground": None,
        "has_health_checkup": None, "health_checkups_count": None,
        "health_params_height": None, "health_params_weight": None,
        "health_params_eyes": None, "health_params_dental": None,
        "health_params_throat": None, "deworming_tablets": None,
        "iron_folic_tablets": None, "maintains_health_records": None,
        "has_thermal_scanner": None, "has_first_aid": None,
        "has_essential_medicines": None,
        "has_ramp": None, "has_hand_rails": None, "has_special_educator": None,
        "has_kitchen_garden": None, "has_kitchen_shed": None,
        "dustbins_classroom": None, "dustbins_toilets": None,
        "dustbins_kitchen": None, "has_student_furniture": None,
        "furniture_student_count": None,
        "has_staff_quarters": None, "has_tinkering_lab": None,
        "atl_id": None, "has_integrated_science_lab": None,
        "hostel_primary_availability": None, "hostel_primary_boys": None,
        "hostel_primary_girls": None,
        "hostel_upper_primary_availability": None,
        "hostel_upper_primary_boys": None, "hostel_upper_primary_girls": None,
        "hostel_secondary_availability": None,
        "hostel_secondary_boys": None, "hostel_secondary_girls": None,
        "hostel_higher_secondary_availability": None,
        "hostel_higher_secondary_boys": None, "hostel_higher_secondary_girls": None,
        "equip_audio_visual": None, "equip_biometric": None,
        "equip_science_kit": None, "equip_math_kit": None,
        "has_ict_lab": None, "ict_labs_count": None,
        "total_functional_ict_devices": None, "has_separate_ict_lab_room": None,
        "has_samagra_ict_lab": None, "samagra_ict_year": None,
        "is_samagra_ict_functional": None, "samagra_ict_model": None,
        "samagra_ict_instructor_type": None,
        "has_internet": None, "internet_type": None, "internet_pedagogical": None,
        "has_digital_library": None, "digital_library_books": None,
    }


def default_reg_staff_summary() -> dict:
    return {
        "count_regular": None, "count_non_regular": None,
        "count_non_teaching": None, "count_vocational": None,
        "required_pre_primary": None, "required_primary": None,
        "required_upper_primary": None, "required_secondary": None,
        "required_higher_secondary": None,
    }


def default_reg_safety() -> dict:
    return {
        "has_disaster_plan": None, "has_structural_audit": None,
        "has_non_structural_audit": None, "has_cctv": None,
        "has_fire_extinguishers": None, "has_nodal_teacher": None,
        "has_safety_training": None, "safety_training_date": None,
        "disaster_management_taught": None, "has_self_defence_grant": None,
        "self_defence_upper_primary": None, "self_defence_secondary": None,
        "self_defence_higher_secondary": None,
        "has_safety_display_board": None,
        "has_first_level_counselor": None, "safety_audit_frequency": None,
    }


def default_reg_vocational_education() -> dict:
    return {
        "vocational_guest_lecturers": None,
        "vocational_industry_visits": None,
        "vocational_industry_linkages": None,
        "plac_enrolled_10": None, "plac_passed_10": None,
        "plac_self_emp_10": None, "plac_placed_10": None,
        "plac_enrolled_12": None, "plac_passed_12": None,
        "plac_self_emp_12": None, "plac_placed_12": None,
    }






"""
─────────────────────────────────────────────────────────────────────────────
ADDITIONS TO  app/models.py   ←  paste at the BOTTOM of your models.py
─────────────────────────────────────────────────────────────────────────────
Firestore helper functions for the notifications collection.

Firestore Structure:
  notifications/                        ← top-level collection
    {notif_id}/
        school_id    string
        title        string
        message      string
        type         string  ("info" | "warning" | "success")
        is_read      bool
        created_at   timestamp
─────────────────────────────────────────────────────────────────────────────
"""

from firebase_admin import firestore as _fs
from app.firebase_config import *          # ensures firebase_admin is initialised
from datetime import datetime, timezone


# ─────────────────────────────────────────────
# Collection constant
# ─────────────────────────────────────────────

COL_NOTIFICATIONS = "notifications"


# ─────────────────────────────────────────────
# Internal helpers
# ─────────────────────────────────────────────

def _get_db():
    return _fs.client()


def _format_date(ts) -> str:
    if ts is None:
        return ""

    try:
        if hasattr(ts, "strftime"):
            return ts.strftime("%d %b %Y").lstrip("0")

        return ts.astimezone(timezone.utc).strftime("%d %b %Y").lstrip("0")

    except Exception:
        return str(ts)


# ─────────────────────────────────────────────
# Public model functions (used by notifications.py router)
# ─────────────────────────────────────────────
def get_notifications_for_school(school_id: str, limit: int = 50) -> list[dict]:
    db = _get_db()

    results = []

    # ─────────────────────────────
    # 1. SCHOOL-GENERATED NOTIFICATIONS
    # ─────────────────────────────
    school_docs = (
        db.collection(COL_NOTIFICATIONS)
        .where("school_id", "==", school_id)
        .order_by("created_at", direction=_fs.Query.DESCENDING)
        .limit(limit)
        .stream()
    )

    for doc in school_docs:
        data = doc.to_dict()
        results.append({
            "id": doc.id,
            "title": data.get("title", "Notification"),
            "message": data.get("message", ""),
            "date": _format_date(data.get("created_at")),
            "type": data.get("type", "info"),
            "read": data.get("is_read", False),
            "sort_time": data.get("created_at"),
        })

    # ─────────────────────────────
# 2. ADMIN BROADCAST NOTIFICATIONS
# ─────────────────────────────
    broadcast_docs = (
        db.collection("broadcast_notifications")
        .where("recipient_ids", "array_contains", school_id)
        .stream()
    )

    for doc in broadcast_docs:
        data = doc.to_dict()

        notif_type = data.get("notification_type", "info").lower()

        mapped_type = (
            "info" if notif_type in ["informational", "info"]
            else "warning" if notif_type in ["urgent", "warning"]
            else "success"
        )

    results.append({
        "id": doc.id,
        "title": data.get("title", "Admin Notification"),
        "message": data.get("message", ""),
        "date": _format_date(data.get("createdAt")),
        "type": mapped_type,
        "read": data.get("isRead", False),
        "sort_time": data.get("createdAt"),
    })

    # ─────────────────────────────
    # 3. SORT COMBINED RESULTS
    # ─────────────────────────────
    results.sort(
        key=lambda x: x.get("sort_time") or datetime.min.replace(tzinfo=timezone.utc),
        reverse=True
    )

    # remove helper field
    for r in results:
        r.pop("sort_time", None)

    return results[:limit]


# ─────────────────────────────────────────────


def get_unread_count_for_school(school_id: str) -> int:
    db = _get_db()

    count = 0

    # school notifications
    school_docs = (
        db.collection(COL_NOTIFICATIONS)
        .where("school_id", "==", school_id)
        .where("is_read", "==", False)
        .stream()
    )
    count += sum(1 for _ in school_docs)

    # admin notifications
    admin_docs = (
        db.collection(COL_NOTIFICATIONS)
        .where("recipient_ids", "array_contains", school_id)
        .stream()
    )

    for doc in admin_docs:
        if not doc.to_dict().get("isRead", False):
            count += 1

    return count


# ─────────────────────────────────────────────


def mark_notification_as_read(notif_id: str) -> bool:
    db = _get_db()
    ref = db.collection(COL_NOTIFICATIONS).document(notif_id)
    doc = ref.get()

    if not doc.exists:
        return False

    data = doc.to_dict()

    # handle BOTH types
    if "is_read" in data:
        ref.update({"is_read": True})
    else:
        ref.update({"isRead": True})

    return True


# ─────────────────────────────────────────────


def mark_all_notifications_read(school_id: str) -> int:
    db = _get_db()
    batch = db.batch()
    count = 0

    # school notifications
    school_docs = (
        db.collection(COL_NOTIFICATIONS)
        .where("school_id", "==", school_id)
        .where("is_read", "==", False)
        .stream()
    )

    for doc in school_docs:
        batch.update(doc.reference, {"is_read": True})
        count += 1

    # admin notifications
    admin_docs = (
        db.collection(COL_NOTIFICATIONS)
        .where("recipient_ids", "array_contains", school_id)
        .stream()
    )

    for doc in admin_docs:
        if not doc.to_dict().get("isRead", False):
            batch.update(doc.reference, {"isRead": True})
            count += 1

    if count:
        batch.commit()

    return count


# ─────────────────────────────────────────────


def create_notification(school_id: str, title: str, message: str, notif_type: str = "info") -> dict:
    db = _get_db()

    doc_ref = db.collection(COL_NOTIFICATIONS).document()

    payload = {
    "school_id": school_id,
    "title": title,
    "message": message,
    "type": notif_type,
    "source": "system",   # ✅ ADD THIS
    "is_read": False,
    "created_at": _fs.SERVER_TIMESTAMP,
}

    doc_ref.set(payload)

    now = datetime.now(timezone.utc)

    return {
        "id": doc_ref.id,
        "title": title,
        "message": message,
        "date": now.strftime("%d %b %Y").lstrip("0"),
        "type": notif_type,
        "read": False,
    }





"""
─────────────────────────────────────────────────────────────────────────────
ADDITIONS TO  app/models.py   ←  paste at the BOTTOM of your models.py
─────────────────────────────────────────────────────────────────────────────
Firestore helper functions for the inspections collection.

Firestore Structure:
  inspections/                        ← top-level collection
    {school_id}/                      ← one document per school (school_id as doc ID)
        inspection_id   string        e.g. "INS-2026-047"
        school_id       string
        date            string        e.g. "25 Feb 2026"
        time            string        e.g. "10:00 AM"
        officer_name    string
        status          string        "Scheduled" | "In Progress" | "Completed" | "Cancelled"
        overall_result  string        "Pending" | "Passed" | "Failed" | "Deferred"
        remarks         string
        checklist       list[map]     [{item, status}, ...]
        created_at      timestamp
        updated_at      timestamp
─────────────────────────────────────────────────────────────────────────────
"""

from firebase_admin import firestore as _fs
from app.firebase_config import *          # ensures firebase_admin is initialised
from datetime import datetime, timezone
import uuid


# ─────────────────────────────────────────────
# Collection constant
# ─────────────────────────────────────────────

COL_INSPECTIONS = "inspections"

# Default checklist items — same as page.tsx hardcoded list
DEFAULT_CHECKLIST = [
    {"item": "Classrooms",     "status": "Not Checked"},
    {"item": "Library",        "status": "Not Checked"},
    {"item": "Science Lab",    "status": "Not Checked"},
    {"item": "Computer Lab",   "status": "Not Checked"},
    {"item": "Playground",     "status": "Not Checked"},
    {"item": "Fire Safety",    "status": "Not Checked"},
    {"item": "Sanitation",     "status": "Not Checked"},
    {"item": "Drinking Water", "status": "Not Checked"},
]


# ─────────────────────────────────────────────
# Internal helpers
# ─────────────────────────────────────────────

def _get_db():
    return _fs.client()


def _inspection_ref(db, school_id: str):
    """One inspection document per school, keyed by school_id."""
    return db.collection(COL_INSPECTIONS).document(school_id)


def _generate_inspection_id() -> str:
    year = datetime.now(timezone.utc).year
    short = str(uuid.uuid4())[:3].upper()
    # e.g. INS-2026-047  (simple sequential-style)
    return f"INS-{year}-{short}"


# ─────────────────────────────────────────────
# Public model functions (used by inspection.py router)
# ─────────────────────────────────────────────

def get_inspection_data(school_id: str) -> dict | None:
    """
    Fetch full inspection document for a school.
    Returns plain dict or None if not found.
    """
    db  = _get_db()
    doc = _inspection_ref(db, school_id).get()
    if not doc.exists:
        return None
    return doc.to_dict()


def schedule_new_inspection(school_id: str, date: str, time: str, officer_name: str) -> dict:
    """
    Create or overwrite inspection document when admin schedules inspection.
    Returns the saved inspection dict.
    """
    db  = _get_db()
    ref = _inspection_ref(db, school_id)

    existing = ref.get()
    inspection_id = (
        existing.to_dict().get("inspection_id", _generate_inspection_id())
        if existing.exists else _generate_inspection_id()
    )

    payload = {
        "inspection_id":  inspection_id,
        "school_id":      school_id,
        "date":           date,
        "time":           time,
        "officer_name":   officer_name,
        "status":         "Scheduled",
        "overall_result": "Pending",
        "remarks":        "The inspection is scheduled. Please ensure all facilities are accessible and all documents are available in original copies.",
        "checklist":      DEFAULT_CHECKLIST,
        "created_at":     _fs.SERVER_TIMESTAMP,
        "updated_at":     _fs.SERVER_TIMESTAMP,
    }
    ref.set(payload)
    payload["inspection_id"] = inspection_id  # SERVER_TIMESTAMP not returned, keep id
    return payload


def update_inspection_checklist(school_id: str, items: list[dict]) -> bool:
    """
    Replace checklist items in the inspection document.
    Returns True on success, False if inspection not found.
    """
    db  = _get_db()
    ref = _inspection_ref(db, school_id)
    if not ref.get().exists:
        return False
    ref.update({
        "checklist":  items,
        "updated_at": _fs.SERVER_TIMESTAMP,
    })
    return True


def update_inspection_report(school_id: str, overall_result: str, remarks: str | None) -> bool:
    """
    Update overall_result and remarks after inspection is done.
    Returns True on success, False if not found.
    """
    db  = _get_db()
    ref = _inspection_ref(db, school_id)
    if not ref.get().exists:
        return False
    update_data: dict = {
        "overall_result": overall_result,
        "updated_at":     _fs.SERVER_TIMESTAMP,
    }
    if remarks is not None:
        update_data["remarks"] = remarks
    ref.update(update_data)
    return True


def update_inspection_status(school_id: str, status: str) -> bool:
    """
    Update inspection status (Scheduled → In Progress → Completed / Cancelled).
    Returns True on success, False if not found.
    """
    db  = _get_db()
    ref = _inspection_ref(db, school_id)
    if not ref.get().exists:
        return False
    ref.update({
        "status":     status,
        "updated_at": _fs.SERVER_TIMESTAMP,
    })
    return True




"""
─────────────────────────────────────────────────────────────────────────────
ADDITIONS TO  app/models.py
─────────────────────────────────────────────────────────────────────────────
Paste these lines at the BOTTOM of your existing models.py file.
─────────────────────────────────────────────────────────────────────────────
"""

# ─────────────────────────────────────────────
# New collection name constants
# (add these alongside the existing constants at the top of models.py)
# ─────────────────────────────────────────────

COL_USERS = "users"       # one document per registered school user
COL_OTP   = "otp_codes"   # temporary OTP storage, keyed by email


# ─────────────────────────────────────────────
# Default shape for a user document
# ─────────────────────────────────────────────

def default_user() -> dict:
    """
    Default structure for a document in the 'users' collection.
    Called when creating a new school user account.

    Firestore path:  users/{user_id}
    """
    return {
        "full_name":      None,
        "email":          None,
        "contact_number": None,
        "school_name":    None,
        "udise_number":   None,
        "password_hash":  None,
        "role":           "school",     # "school" | "admin" | "inspector"
        "is_active":      True,
        "created_at":     None,         # set to firestore.SERVER_TIMESTAMP on write
        "updated_at":     None,
    }


# ─────────────────────────────────────────────
# ALSO ADD THESE TWO LINES near the top of models.py,
# alongside the existing COL_SCHOOLS constant:
#
#   COL_USERS = "users"
#   COL_OTP   = "otp_codes"
#
# And add them to your imports in auth.py:
#   from app.models import get_db, COL_SCHOOLS, COL_USERS, COL_OTP
# ─────────────────────────────────────────────










"""
app/certificate_models.py
─────────────────────────────────────────────────────────────────────────────
Firestore model functions for the Certificates feature.

Firestore structure
───────────────────
certificates/                        ← top-level collection
  {cert_id}/                         ← one document per issued certificate
    certificate_id   string          e.g. "CERT-2025-112"
    school_id        string          Firebase Auth UID of the school
    type             string          "Recognition Certificate"
    status           string          "Active" | "Expired" | "Revoked"
    issued_on        string          human-readable  "15 Aug 2025"
    valid_until      string          human-readable  "14 Aug 2026"
    issued_on_iso    string          ISO date        "2025-08-15"
    valid_until_iso  string          ISO date        "2026-08-14"
    download_url     string | null   Firebase Storage signed URL
    issued_by        string | null   admin UID or name
    remarks          string | null
    revoked_reason   string | null   set on revocation
    created_at       timestamp
    updated_at       timestamp

school_profiles/{school_id}          ← reuses existing collection for:
  applications sub-collection        ← read to build CurrentApplicationNote

─────────────────────────────────────────────────────────────────────────────
"""

from firebase_admin import firestore as _fs, storage as _storage
from app.firebase_config import *          # ensures firebase_admin is initialised
from datetime import datetime, timezone, timedelta
import uuid


# ─────────────────────────────────────────────
# Collection constants
# ─────────────────────────────────────────────

COL_CERTIFICATES = "certificates"
COL_SCHOOLS      = "school_profiles"
COL_INSPECTIONS  = "inspections"
COL_APPLICATIONS = "applications"


# ─────────────────────────────────────────────
# Internal helpers
# ─────────────────────────────────────────────

def _get_db():
    return _fs.client()


def _generate_cert_id() -> str:
    """Generate a human-readable certificate ID, e.g. CERT-2026-047."""
    year  = datetime.now(timezone.utc).year
    short = str(uuid.uuid4().int)[:3].zfill(3)
    return f"CERT-{year}-{short}"


def _iso_to_display(iso_date: str) -> str:
    """
    Convert ISO date string "2026-08-14" to display format "14 Aug 2026".
    Falls back to the original string if parsing fails.
    """
    try:
        dt = datetime.strptime(iso_date, "%Y-%m-%d")
        return dt.strftime("%-d %b %Y")   # Linux; use "%#d %b %Y" on Windows
    except Exception:
        return iso_date


def _auto_expire_certificates(db, school_id: str):
    """
    Mark any certificates whose valid_until_iso has passed as 'Expired'.
    Called on every list_certificates() to keep statuses fresh.
    """
    today = datetime.now(timezone.utc).date().isoformat()   # "2026-03-26"
    query = (
        db.collection(COL_CERTIFICATES)
        .where("school_id", "==", school_id)
        .where("status", "==", "Active")
    )
    for doc in query.stream():
        data = doc.to_dict()
        if data.get("valid_until_iso", "9999-12-31") < today:
            doc.reference.update({
                "status":     "Expired",
                "updated_at": _fs.SERVER_TIMESTAMP,
            })


# ─────────────────────────────────────────────
# Public model functions (used by certificates.py router)
# ─────────────────────────────────────────────

def get_school(school_id: str) -> dict | None:
    """Check the school exists in school_profiles. Returns dict or None."""
    db  = _get_db()
    doc = db.collection(COL_SCHOOLS).document(school_id).get()
    return doc.to_dict() if doc.exists else None


def get_inspection(school_id: str) -> dict | None:
    """Fetch the inspection document for a school. Returns dict or None."""
    db  = _get_db()
    doc = db.collection(COL_INSPECTIONS).document(school_id).get()
    return doc.to_dict() if doc.exists else None


def list_certificates(school_id: str) -> list[dict]:
    """
    Return all certificates for a school, newest first.
    Auto-expires any certificates whose validity has lapsed before returning.
    """
    db = _get_db()
    _auto_expire_certificates(db, school_id)

    query = (
        db.collection(COL_CERTIFICATES)
        .where("school_id", "==", school_id)
        .order_by("created_at", direction=_fs.Query.DESCENDING)
    )
    return [doc.to_dict() for doc in query.stream()]


def get_active_certificate(school_id: str) -> dict | None:
    """
    Return the first 'Active' certificate for a school, or None.
    Used by the issue endpoint to prevent duplicate active certs.
    """
    db    = _get_db()
    query = (
        db.collection(COL_CERTIFICATES)
        .where("school_id", "==", school_id)
        .where("status", "==", "Active")
        .limit(1)
    )
    docs = list(query.stream())
    return docs[0].to_dict() if docs else None


def get_certificate_by_id(school_id: str, cert_id: str) -> dict | None:
    """
    Fetch a single certificate by its cert_id.
    Also validates that it belongs to the given school.
    Returns dict or None.
    """
    db    = _get_db()
    query = (
        db.collection(COL_CERTIFICATES)
        .where("certificate_id", "==", cert_id)
        .where("school_id",      "==", school_id)
        .limit(1)
    )
    docs = list(query.stream())
    return docs[0].to_dict() if docs else None


def create_certificate(
    school_id:    str,
    cert_type:    str,
    valid_until:  str,   # ISO e.g. "2027-08-14"
    download_url: str | None = None,
    issued_by:    str | None = None,
) -> dict:
    """
    Create a new certificate document in Firestore.
    Returns the saved dict (SERVER_TIMESTAMP fields replaced with readable values).
    """
    db      = _get_db()
    cert_id = _generate_cert_id()
    now_iso = datetime.now(timezone.utc).date().isoformat()   # "2026-03-26"

    payload = {
        "certificate_id":  cert_id,
        "school_id":       school_id,
        "type":            cert_type,
        "status":          "Active",
        "issued_on":       _iso_to_display(now_iso),
        "issued_on_iso":   now_iso,
        "valid_until":     _iso_to_display(valid_until),
        "valid_until_iso": valid_until,
        "download_url":    download_url,
        "issued_by":       issued_by,
        "remarks":         None,
        "revoked_reason":  None,
        "created_at":      _fs.SERVER_TIMESTAMP,
        "updated_at":      _fs.SERVER_TIMESTAMP,
    }

    # Use cert_id as the Firestore document ID for easy lookup
    db.collection(COL_CERTIFICATES).document(cert_id).set(payload)

    # Return a copy with cert_id set (SERVER_TIMESTAMP won't be in payload)
    return {**payload, "certificate_id": cert_id}


def set_download_url(school_id: str, cert_id: str, url: str) -> None:
    """Persist a download URL back to the certificate document."""
    db = _get_db()
    db.collection(COL_CERTIFICATES).document(cert_id).update({
        "download_url": url,
        "updated_at":   _fs.SERVER_TIMESTAMP,
    })


def revoke_certificate(school_id: str, cert_id: str, reason: str | None = None) -> None:
    """Mark a certificate as Revoked and store optional reason."""
    db = _get_db()
    update: dict = {
        "status":         "Revoked",
        "revoked_reason": reason,
        "updated_at":     _fs.SERVER_TIMESTAMP,
    }
    db.collection(COL_CERTIFICATES).document(cert_id).update(update)


def generate_certificate_download_url(school_id: str, cert_id: str) -> str | None:
    """
    Attempt to generate a signed download URL from Firebase Storage.

    Expected Storage path: certificates/{school_id}/{cert_id}.pdf
    Returns the signed URL string, or None if the file doesn't exist yet.

    NOTE: Firebase Admin SDK requires a service account with
    'iam.serviceAccounts.signBlob' permission to generate signed URLs.
    """
    try:
        bucket    = _storage.bucket()
        blob_path = f"certificates/{school_id}/{cert_id}.pdf"
        blob      = bucket.blob(blob_path)

        if not blob.exists():
            return None

        # Signed URL valid for 7 days
        expiry  = datetime.now(timezone.utc) + timedelta(days=7)
        url     = blob.generate_signed_url(expiration=expiry, method="GET", version="v4")
        return url
    except Exception:
        return None


def get_current_application_note(school_id: str) -> dict | None:
    """
    Return the most recent in-progress application for the school.
    Only returned when status is one of: Draft, Submitted, Under Review.
    Used to render the "📝 Current Application" note at the bottom of the page.

    Returns:
        dict with keys: application_id, status
        None if no active application exists
    """
    db = _get_db()

    # Applications are stored as a top-level collection (see dashboard.py pattern)
    # keyed by school_id for quick lookup
    query = (
        db.collection(COL_APPLICATIONS)
        .where("school_id", "==", school_id)
        .where("status", "in", ["Draft", "Submitted", "Under Review"])
        .order_by("last_updated", direction=_fs.Query.DESCENDING)
        .limit(1)
    )
    docs = list(query.stream())
    if not docs:
        return None

    data = docs[0].to_dict()
    return {
        "application_id": data.get("application_id", ""),
        "status":         data.get("status", ""),
    }







def get_school_profile(school_id: str):
    db = get_db()
    doc = db.collection("school_profiles").document(school_id).get()

    if not doc.exists:
        return None

    return doc.to_dict()




def get_application_by_school(school_id: str):
    db = get_db()

    doc = db.collection("school_registrations").document(school_id).get()

    if not doc.exists:
        return None

    data = doc.to_dict()

    # ✅ Only return if submitted
    if not data.get("submitted"):
        return None

    def format_ts(ts):
        if not ts:
            return None
        try:
            return ts.isoformat()
        except:
            return str(ts)

    return {
        "application_id": data.get("application_id"),
        "school_id": school_id,
        "status": data.get("status", "Submitted"),
        "submitted_on": format_ts(data.get("submitted_at")),
        "last_updated": format_ts(data.get("updated_at")),
    }


def update_step_completion(db, school_id: str, step_name: str):
    doc_ref = school_ref(db, school_id)   # IMPORTANT: use school_profiles

    doc_ref.update({
        f"step_completion.{step_name}": True
    })






# ─────────────────────────────────────────────
# Dashboard helper functions
# ─────────────────────────────────────────────

def compute_profile_completion(school_id: str) -> dict:
    """
    Reads school_profiles/{school_id} and checks which sections are filled.
    A section is 'complete' if at least one key field is non-None/non-empty.
    """
    db = get_db()
    doc = db.collection(COL_SCHOOLS).document(school_id).get()

    if not doc.exists:
        return {
            "school_id": school_id,
            "completion_percentage": 0,
            "sections": {
                "basic_details": False,
                "location": False,
                "infrastructure": False,
                "staff": False,
                "safety": False,
            }
        }

    data = doc.to_dict()

    def has_value(field):
        v = data.get(field)
        return v is not None and v != "" and v != 0 and v is not False

    # Check one representative required field per section
    sections = {
        "basic_details":  has_value("school_name") and has_value("mobile"),
        "location":       has_value("address") or has_value("district") or
                          (isinstance(data.get("location"), dict) and
                           bool(data["location"].get("district"))),
        "infrastructure": has_value("building_status") or
                          (isinstance(data.get("infrastructure"), dict) and
                           bool(data["infrastructure"].get("building_status"))),
        "staff":          has_value("count_regular") or
                          (isinstance(data.get("staff_summary"), dict) and
                           bool(data["staff_summary"].get("count_regular"))),
        "safety":         has_value("has_cctv") or
                          (isinstance(data.get("safety"), dict) and
                           data["safety"].get("has_cctv") is not None),
    }

    # Also check step_completion map if it exists (most reliable)
    step_completion = data.get("step_completion", {})
    if step_completion:
        sections = {
            "basic_details":  step_completion.get("basic_details", False),
            "location":       step_completion.get("location", False),
            "infrastructure": step_completion.get("infrastructure", False),
            "staff":          step_completion.get("staff", False),
            "safety":         step_completion.get("safety", False),
        }

    completed = sum(1 for v in sections.values() if v)
    total = len(sections)
    percentage = int((completed / total) * 100) if total > 0 else 0

    return {
        "school_id": school_id,
        "completion_percentage": percentage,
        "sections": sections,
    }


def get_inspection(school_id: str) -> dict:
    """Fetch inspection for dashboard. Returns default Pending if not found."""
    db = get_db()
    doc = db.collection(COL_INSPECTIONS).document(school_id).get()
    if not doc.exists:
        return {"school_id": school_id, "status": "Pending"}
    return {**doc.to_dict(), "school_id": school_id}


def get_certificate(school_id: str) -> dict:
    db = get_db()
    docs = list(
        db.collection("certificates")
        .where("school_id", "==", school_id)
        .limit(1)
        .stream()
    )
    if not docs:
        return {"school_id": school_id, "status": "Not Issued"}
    data = docs[0].to_dict()
    return {
        "school_id": school_id,
        "status": data.get("status", "Not Issued"),
        "certificate_id": data.get("certificate_id"),
        "issued_on": data.get("issued_on_iso"),
        "valid_until": data.get("valid_until_iso"),
        "download_url": data.get("download_url"),
    }


def get_notifications(school_id: str, limit: int = 20) -> list[dict]:
    db = get_db()
    try:
        # Remove order_by to skip index requirement
        docs = (
            db.collection(COL_NOTIFICATIONS)
            .where("school_id", "==", school_id)
            .limit(limit)
            .stream()
        )
        result = []
        for doc in docs:
            d = doc.to_dict()
            created = d.get("created_at")
            time_ago = ""
            if created and hasattr(created, "astimezone"):
                from datetime import timezone as tz
                try:
                    aware = created.astimezone(tz.utc)
                    diff = datetime.now(tz.utc) - aware
                    if diff.days > 0:
                        time_ago = f"{diff.days}d ago"
                    elif diff.seconds > 3600:
                        time_ago = f"{diff.seconds // 3600}h ago"
                    else:
                        time_ago = f"{diff.seconds // 60}m ago"
                except Exception:
                    pass
            result.append({
                "id": doc.id,
                "text": d.get("message", d.get("title", "")),
                "icon_type": d.get("icon_type", "bell"),
                "time_ago": time_ago,
                "color_variant": d.get("color_variant", "blue"),
                "is_read": d.get("is_read", False),
                "created_at": str(created) if created else None,
            })
        return result
    except Exception:
        return []


def get_unread_count(school_id: str) -> int:
    """Count unread notifications for a school."""
    db = get_db()
    try:
        docs = (
            db.collection(COL_NOTIFICATIONS)
            .where("school_id", "==", school_id)
            .where("is_read", "==", False)
            .stream()
        )
        return sum(1 for _ in docs)
    except Exception:
        return 0


def mark_notification_read(notif_id: str) -> bool:
    """Mark a single notification as read. Returns True if found."""
    db = get_db()
    ref = db.collection(COL_NOTIFICATIONS).document(notif_id)
    if not ref.get().exists:
        return False
    ref.update({"is_read": True})
    return True


def create_application(school_id: str, notes: str = None) -> dict:
    """Create a new application document."""
    import uuid
    db = get_db()
    app_id = f"APP-{datetime.now(timezone.utc).year}-{str(uuid.uuid4())[:6].upper()}"
    now = datetime.now(timezone.utc).isoformat()
    payload = {
        "application_id": app_id,
        "school_id": school_id,
        "status": "Submitted",
        "submitted_on": now,
        "last_updated": now,
        "notes": notes,
        "created_at": _fs.SERVER_TIMESTAMP,
    }
    db.collection(COL_APPLICATIONS).document(app_id).set(payload)
    return payload



def default_profile_document() -> dict:
    return {
        "document_type": None,
        "label": None,
        "file_name": None,
        "download_url": None,
        "public_id": None,
        "content_type": None,
        "uploaded_at": _fs.SERVER_TIMESTAMP,
    }