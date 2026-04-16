from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date
from enum import Enum


# ─────────────────────────────────────────────
# STEP 1 – BASIC DETAILS
# ─────────────────────────────────────────────

class HOSDetails(BaseModel):
    hos_type: Optional[str] = None
    hos_name: Optional[str] = None
    hos_mobile: Optional[str] = None
    hos_email: Optional[str] = None


class ManagementDetails(BaseModel):
    management_group: Optional[str] = None
    management_code: Optional[str] = None
    sub_management: Optional[str] = None
    nodal_ministry: Optional[str] = None
    administration_type: Optional[str] = None


class AnganwadiRow(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    boys: Optional[str] = None
    girls: Optional[str] = None


class MultiClassRow(BaseModel):
    classes: Optional[str] = None


class Sec156Row(BaseModel):
    pre_primary: Optional[str] = None
    primary: Optional[str] = None
    upper_primary: Optional[str] = None
    secondary: Optional[str] = None
    higher_secondary: Optional[str] = None


class Sec157Row(BaseModel):
    assessment: Optional[str] = None
    enrichment: Optional[str] = None
    cyber: Optional[str] = None
    psycho: Optional[str] = None


class BasicDetailsSchema(BaseModel):
    # 1.1 School Identity
    school_name: Optional[str] = None
    udise_number: Optional[str] = None
    est_year: Optional[str] = None
    board_affiliation: Optional[str] = None

    # 1.2 Contact
    std_code: Optional[str] = None
    landline: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None

    # 1.3 Head of School
    hos: Optional[HOSDetails] = None

    # 1.4 Management
    management: Optional[ManagementDetails] = None

    # 1.5 & 1.6 Classification & Sub-management
    classification: Optional[str] = None
    special_school_type: Optional[str] = None

    # 1.7 PM-SHRI
    is_pm_shri: Optional[str] = None

    # 1.9 School Type
    school_type: Optional[str] = None

    # 1.10 School Category
    school_category: Optional[str] = None

    # 1.10 Class Range
    lowest_class: Optional[str] = None
    highest_class: Optional[str] = None
    has_pre_primary: Optional[str] = None
    pre_primary_count: Optional[str] = None
    application_type: Optional[str] = "New Recognition"

    # 1.11 Curriculum/Medium
    instruction_medium: Optional[str] = None
    curriculum_primary: Optional[str] = None
    curriculum_upper_primary: Optional[str] = None

    # 1.15 School Flags
    is_minority: Optional[str] = None
    minority_community: Optional[str] = None
    is_rte: Optional[str] = None
    is_vocational: Optional[str] = None
    funding_source: Optional[str] = None
    sanction_order_number: Optional[str] = None
    is_pre_vocational: Optional[str] = None
    is_skill_center: Optional[str] = None
    is_residential: Optional[str] = None
    residential_type: Optional[str] = None
    is_shift: Optional[str] = None
    is_mother_tongue: Optional[str] = None
    is_all_weather_road: Optional[str] = None
    instructional_days: Optional[str] = None
    is_cce: Optional[str] = None
    is_records_maintained: Optional[str] = None
    is_records_shared: Optional[str] = None

    # 1.20 Distance to nearest
    dist_primary: Optional[str] = None
    dist_upper_primary: Optional[str] = None
    dist_secondary: Optional[str] = None
    dist_higher_secondary: Optional[str] = None

    # 1.40 Anganwadi
    has_anganwadi: Optional[str] = None
    anganwadi_centers_count: Optional[str] = None
    anganwadi_rows: Optional[List[AnganwadiRow]] = []

    has_balavatika: Optional[str] = None
    has_oosc: Optional[str] = None
    has_oosc_st: Optional[str] = None
    remedial_students: Optional[str] = None
    learning_enhancement_students: Optional[str] = None
    academic_inspections: Optional[str] = None
    crc_visits: Optional[str] = None
    brc_visits: Optional[str] = None
    district_visits: Optional[str] = None
    regional_visits: Optional[str] = None
    hq_visits: Optional[str] = None

    # 1.44 Committees
    has_smc: Optional[str] = None
    has_sdmc: Optional[str] = None
    smc_meetings: Optional[str] = None
    has_smc_plan: Optional[str] = None
    smc_plan_year: Optional[str] = None
    has_sbc: Optional[str] = None
    has_ac: Optional[str] = None
    has_pta: Optional[str] = None
    pta_meetings: Optional[str] = None

    # 1.48 PFMS & Multi-Grade
    has_pfms: Optional[str] = None
    pfms_id: Optional[str] = None
    has_multi_class: Optional[str] = None
    multi_class_rows: Optional[List[MultiClassRow]] = []
    is_school_complex: Optional[str] = None
    is_hub_school: Optional[str] = None
    complex_pre_primary: Optional[str] = None
    complex_primary: Optional[str] = None
    complex_upper_primary: Optional[str] = None
    complex_secondary: Optional[str] = None
    complex_higher_secondary: Optional[str] = None
    complex_total: Optional[str] = None

    # 1.53 Flags
    has_ebsb: Optional[str] = None
    has_fit_india: Optional[str] = None
    has_holistic_report_card: Optional[str] = None
    has_teacher_id: Optional[str] = None

    # 1.54 PM Poshan
    pm_poshan_total_days: Optional[str] = None
    pm_poshan_days_per_week: Optional[str] = None
    pm_poshan_days_per_month: Optional[str] = None
    pm_poshan_balvatika: Optional[str] = None

    # 1.56 & 1.57 Activity tables
    has_agreed_first_year_activities: Optional[bool] = False
    sec_156: Optional[List[Sec156Row]] = []
    sec_157: Optional[List[Sec157Row]] = []

    # 1.58 Safety & Digital
    has_disaster_plan: Optional[str] = None
    has_structural_audit: Optional[str] = None
    has_non_structural_audit: Optional[str] = None
    has_cctv: Optional[str] = None
    has_fire_extinguishers: Optional[str] = None
    has_nodal_teacher: Optional[str] = None
    has_safety_training: Optional[str] = None
    safety_training_date: Optional[str] = None
    disaster_management_taught: Optional[str] = None
    has_self_defence_grant: Optional[str] = None
    self_defence_upper_primary: Optional[str] = None
    self_defence_secondary: Optional[str] = None
    self_defence_higher_secondary: Optional[str] = None
    has_safety_display_board: Optional[str] = None
    has_first_level_counselor: Optional[str] = None
    safety_audit_frequency: Optional[str] = None
    has_teacher_photos: Optional[str] = None
    has_vidya_pravesh: Optional[str] = None
    student_attendance_capture: Optional[str] = None
    teacher_attendance_capture: Optional[str] = None
    has_youth_club: Optional[str] = None
    has_eco_club: Optional[str] = None
    sssa_certification: Optional[str] = None

    # 1.61 Registers
    has_ict_register: Optional[str] = None
    ict_register_date: Optional[str] = None
    has_sports_register: Optional[str] = None
    sports_register_date: Optional[str] = None
    has_library_register: Optional[str] = None
    library_register_date: Optional[str] = None


# ─────────────────────────────────────────────
# STEP 2 – RECEIPTS AND EXPENDITURE
# ─────────────────────────────────────────────

class GrantsRow(BaseModel):
    grant_name: Optional[str] = None
    receipt: Optional[str] = None
    expenditure: Optional[str] = None


class AssistanceRow(BaseModel):
    source: Optional[str] = None
    is_received: Optional[str] = None
    name: Optional[str] = None
    amount: Optional[str] = None


class ReceiptsExpenditureSchema(BaseModel):
    grants: Optional[List[GrantsRow]] = []
    assistance: Optional[List[AssistanceRow]] = []
    exp_maintenance: Optional[str] = None
    exp_teachers: Optional[str] = None
    exp_construction: Optional[str] = None
    exp_others: Optional[str] = None


# ─────────────────────────────────────────────
# STEP 3 – LEGAL DETAILS
# ─────────────────────────────────────────────

class VocationalRow(BaseModel):
    grade: Optional[str] = None
    sector: Optional[str] = None
    job_role: Optional[str] = None
    year_starting: Optional[str] = None


class LegalDetailsSchema(BaseModel):
    vocational_rows: Optional[List[VocationalRow]] = []
    recognition_number: Optional[str] = None
    recognition_date: Optional[str] = None
    affiliation_number: Optional[str] = None


# ─────────────────────────────────────────────
# STEP 4 – LOCATION
# ─────────────────────────────────────────────

class LocationSchema(BaseModel):
    location_type: Optional[str] = None
    address: Optional[str] = None
    pin_code: Optional[str] = None
    district: Optional[str] = None
    taluka: Optional[str] = None
    revenue_block: Optional[str] = None
    village_name: Optional[str] = None
    gram_panchayat: Optional[str] = None
    urban_local_body: Optional[str] = None
    ward_name: Optional[str] = None
    crc_name: Optional[str] = None
    assembly_constituency: Optional[str] = None
    parliamentary_constituency: Optional[str] = None


# ─────────────────────────────────────────────
# STEP 5 – INFRASTRUCTURE
# ─────────────────────────────────────────────

class HigherSecondaryLab(BaseModel):
    name: Optional[str] = None
    availability: Optional[str] = None
    separate_room: Optional[str] = None


class DigitalEquipRow(BaseModel):
    name: Optional[str] = None
    total: Optional[str] = None
    pedagogical: Optional[str] = None


class DigitalFacilityRow(BaseModel):
    name: Optional[str] = None
    availability: Optional[str] = None


class InfrastructureSchema(BaseModel):
    building_status: Optional[str] = None
    active_building_blocks: Optional[str] = None
    building_pucca: Optional[str] = None
    building_partially_pucca: Optional[str] = None
    building_kuchcha: Optional[str] = None
    building_tent: Optional[str] = None
    storey_single: Optional[str] = None
    storey_double: Optional[str] = None
    storey_triple: Optional[str] = None
    storey_multi: Optional[str] = None
    building_dilapidated: Optional[str] = None
    building_under_construction: Optional[str] = None
    classrooms_pre_primary: Optional[str] = None
    classrooms_primary: Optional[str] = None
    classrooms_upper_primary: Optional[str] = None
    classrooms_secondary: Optional[str] = None
    classrooms_higher_secondary: Optional[str] = None
    classrooms_not_in_use: Optional[str] = None
    total_instructional_rooms: Optional[str] = None
    classrooms_under_construction: Optional[str] = None
    classrooms_dilapidated: Optional[str] = None
    cond_pucca_good: Optional[str] = None
    cond_pucca_minor: Optional[str] = None
    cond_pucca_major: Optional[str] = None
    cond_partially_pucca_good: Optional[str] = None
    cond_partially_pucca_minor: Optional[str] = None
    cond_partially_pucca_major: Optional[str] = None
    cond_kuchcha_good: Optional[str] = None
    cond_kuchcha_minor: Optional[str] = None
    cond_kuchcha_major: Optional[str] = None
    cond_tent_good: Optional[str] = None
    cond_tent_minor: Optional[str] = None
    cond_tent_major: Optional[str] = None
    boundary_wall: Optional[str] = None
    has_electricity: Optional[str] = None
    classrooms_with_fans: Optional[str] = None
    classrooms_with_acs: Optional[str] = None
    classrooms_with_heaters: Optional[str] = None
    has_solar_panel: Optional[str] = None
    has_principal_room: Optional[str] = None
    has_library_room: Optional[str] = None
    has_vice_principal_room: Optional[str] = None
    has_girls_common_room: Optional[str] = None
    has_staffroom: Optional[str] = None
    has_co_curricular_room: Optional[str] = None
    lab_count: Optional[str] = None
    has_toilets: Optional[str] = None
    toilet_boys_total: Optional[str] = None
    toilet_boys_func: Optional[str] = None
    toilet_boys_water: Optional[str] = None
    toilet_girls_total: Optional[str] = None
    toilet_girls_func: Optional[str] = None
    toilet_girls_water: Optional[str] = None
    cwsn_boys_total: Optional[str] = None
    cwsn_boys_func: Optional[str] = None
    cwsn_boys_water: Optional[str] = None
    cwsn_girls_total: Optional[str] = None
    cwsn_girls_func: Optional[str] = None
    cwsn_girls_water: Optional[str] = None
    urinals_boys_total: Optional[str] = None
    urinals_girls_total: Optional[str] = None
    toilets_const_boys: Optional[str] = None
    toilets_const_girls: Optional[str] = None
    has_hand_washing_near_toilets: Optional[str] = None
    toilet_location: Optional[str] = None
    has_incinerator: Optional[str] = None
    has_pad_vending_machine: Optional[str] = None
    has_hand_washing_before_meal: Optional[str] = None
    wash_points_count: Optional[str] = None
    water_hand_pump: Optional[str] = None
    water_protected_well: Optional[str] = None
    water_unprotected_well: Optional[str] = None
    water_tap_water: Optional[str] = None
    water_packaged_water: Optional[str] = None
    water_others: Optional[str] = None
    has_water_purifier: Optional[str] = None
    has_water_quality_tested: Optional[str] = None
    has_rain_water_harvesting: Optional[str] = None
    has_library: Optional[str] = None
    library_books: Optional[str] = None
    has_book_bank: Optional[str] = None
    book_bank_books: Optional[str] = None
    has_reading_corner: Optional[str] = None
    reading_corner_books: Optional[str] = None
    has_full_time_librarian: Optional[str] = None
    subscribes_newspapers: Optional[str] = None
    library_books_borrowed: Optional[str] = None
    land_area: Optional[str] = None
    land_area_unit: Optional[str] = "Square Meter"
    has_expansion_land: Optional[str] = None
    expansion_type: Optional[str] = None
    additional_classrooms_needed: Optional[str] = None
    has_playground: Optional[str] = None
    playground_area: Optional[str] = None
    playground_unit: Optional[str] = "Square Meter"
    has_alternate_playground: Optional[str] = None
    has_health_checkup: Optional[str] = None
    health_checkups_count: Optional[str] = None
    health_params_height: Optional[str] = None
    health_params_weight: Optional[str] = None
    health_params_eyes: Optional[str] = None
    health_params_dental: Optional[str] = None
    health_params_throat: Optional[str] = None
    deworming_tablets: Optional[str] = None
    iron_folic_tablets: Optional[str] = None
    maintains_health_records: Optional[str] = None
    has_thermal_scanner: Optional[str] = None
    has_first_aid: Optional[str] = None
    has_essential_medicines: Optional[str] = None
    has_ramp: Optional[str] = None
    has_hand_rails: Optional[str] = None
    has_special_educator: Optional[str] = None
    has_kitchen_garden: Optional[str] = None
    has_kitchen_shed: Optional[str] = None
    dustbins_classroom: Optional[str] = None
    dustbins_toilets: Optional[str] = None
    dustbins_kitchen: Optional[str] = None
    has_student_furniture: Optional[str] = None
    furniture_student_count: Optional[str] = None
    has_staff_quarters: Optional[str] = None
    has_tinkering_lab: Optional[str] = None
    atl_id: Optional[str] = None
    has_integrated_science_lab: Optional[str] = None
    hostel_primary_availability: Optional[str] = None
    hostel_primary_boys: Optional[str] = None
    hostel_primary_girls: Optional[str] = None
    hostel_upper_primary_availability: Optional[str] = None
    hostel_upper_primary_boys: Optional[str] = None
    hostel_upper_primary_girls: Optional[str] = None
    hostel_secondary_availability: Optional[str] = None
    hostel_secondary_boys: Optional[str] = None
    hostel_secondary_girls: Optional[str] = None
    hostel_higher_secondary_availability: Optional[str] = None
    hostel_higher_secondary_boys: Optional[str] = None
    hostel_higher_secondary_girls: Optional[str] = None
    higher_secondary_labs: Optional[List[HigherSecondaryLab]] = []
    equip_audio_visual: Optional[str] = None
    equip_biometric: Optional[str] = None
    equip_science_kit: Optional[str] = None
    equip_math_kit: Optional[str] = None
    digital_equip_items: Optional[List[DigitalEquipRow]] = []
    has_ict_lab: Optional[str] = None
    ict_labs_count: Optional[str] = None
    total_functional_ict_devices: Optional[str] = None
    has_separate_ict_lab_room: Optional[str] = None
    has_samagra_ict_lab: Optional[str] = None
    samagra_ict_year: Optional[str] = None
    is_samagra_ict_functional: Optional[str] = None
    samagra_ict_model: Optional[str] = None
    samagra_ict_instructor_type: Optional[str] = None
    has_internet: Optional[str] = None
    internet_type: Optional[str] = None
    internet_pedagogical: Optional[str] = None
    digital_teaching_tools: Optional[List[DigitalFacilityRow]] = []
    has_digital_library: Optional[str] = None
    digital_library_books: Optional[str] = None


# ─────────────────────────────────────────────
# STEP 6 – STAFF
# ─────────────────────────────────────────────

class TeacherDetailSchema(BaseModel):
    name: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    social_category: Optional[str] = None
    is_cwsn: Optional[str] = "2-No"
    disability: Optional[str] = "1-Not applicable"
    blood_group: Optional[str] = None
    academic_level: Optional[str] = None
    academic_degree: Optional[str] = None
    professional_qual: Optional[str] = None
    national_code: Optional[str] = None
    teacher_code_state: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    aadhaar_number: Optional[str] = None
    aadhaar_name: Optional[str] = None
    crr_number: Optional[str] = None
    subject_level_math: Optional[str] = "1-Not Studied"
    subject_level_science: Optional[str] = "1-Not Studied"
    subject_level_english: Optional[str] = "1-Not Studied"
    subject_level_social_science: Optional[str] = "1-Not Studied"
    subject_level_language: Optional[str] = "1-Not Studied"
    nature_of_appointment: Optional[str] = None
    teacher_type: Optional[str] = None
    appointed_level: Optional[str] = None
    classes_taught: Optional[str] = None
    date_joining_service: Optional[str] = None
    date_joining_present_school: Optional[str] = None
    appointed_for_subject: Optional[str] = None
    main_subject1: Optional[str] = None
    main_subject2: Optional[str] = None
    is_deputation: Optional[str] = "2-No"
    is_guest_contractual: Optional[str] = "2-No"
    training_needed: Optional[List[str]] = []
    training_received: Optional[List[str]] = []
    languages: Optional[List[str]] = []
    hs_mastery_physics: Optional[str] = None
    hs_mastery_chemistry: Optional[str] = None
    hs_mastery_biology: Optional[str] = None
    hs_mastery_math: Optional[str] = None
    trained_cwsn: Optional[str] = "2-No"
    trained_computer: Optional[str] = "2-No"
    is_nishtha_trained: Optional[str] = "2-No"
    non_teaching_days: Optional[str] = "0"
    trained_safety: Optional[str] = "2-No"
    trained_cyber_safety: Optional[str] = "2-No"
    trained_cwsn_identification: Optional[str] = "2-No"
    is_tet_qualified: Optional[str] = "2-No"
    tet_year: Optional[str] = None
    is_capable_digital: Optional[str] = "2-No"


class NonTeachingStaffSchema(BaseModel):
    name: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    state_code: Optional[str] = None
    social_category: Optional[str] = None
    academic_level: Optional[str] = None
    degree: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    aadhaar_number: Optional[str] = None
    aadhaar_name: Optional[str] = None
    disability: Optional[str] = "1-Not applicable"
    nature_of_appointment: Optional[str] = None
    date_joining_service: Optional[str] = None
    date_joining_school: Optional[str] = None
    current_post: Optional[str] = None


class VocationalStaffSchema(BaseModel):
    name: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    vtp_code: Optional[str] = None
    social_category: Optional[str] = None
    academic_level: Optional[str] = None
    degree: Optional[str] = None
    professional_qual: Optional[str] = None
    mobile: Optional[str] = None
    email: Optional[str] = None
    aadhaar_number: Optional[str] = None
    aadhaar_name: Optional[str] = None
    disability: Optional[str] = "1-Not applicable"
    nature_of_appointment: Optional[str] = None
    date_joining_service: Optional[str] = None
    date_joining_school: Optional[str] = None
    type_of_teacher: Optional[str] = None
    classes_taught: Optional[str] = None
    sector: Optional[str] = None
    job_role: Optional[str] = None
    experience: Optional[str] = None
    received_induction: Optional[str] = None


class StaffCountRow(BaseModel):
    regular: Optional[str] = None
    non_regular: Optional[str] = None
    non_teaching: Optional[str] = None
    vocational: Optional[str] = None


class StaffRequiredRow(BaseModel):
    pre_primary: Optional[str] = None
    primary: Optional[str] = None
    upper_primary: Optional[str] = None
    secondary: Optional[str] = None
    higher_secondary: Optional[str] = None


class StaffSchema(BaseModel):
    staff_counts: Optional[StaffCountRow] = None
    staff_required: Optional[StaffRequiredRow] = None
    teachers: Optional[List[TeacherDetailSchema]] = []
    non_teaching_staff: Optional[List[NonTeachingStaffSchema]] = []
    vocational_staff: Optional[List[VocationalStaffSchema]] = []


# ─────────────────────────────────────────────
# STEP 7 – SAFETY
# ─────────────────────────────────────────────

class SafetySchema(BaseModel):
    has_disaster_plan: Optional[str] = None
    has_structural_audit: Optional[str] = None
    has_non_structural_audit: Optional[str] = None
    has_cctv: Optional[str] = None
    has_fire_extinguishers: Optional[str] = None
    has_nodal_teacher: Optional[str] = None
    has_safety_training: Optional[str] = None
    safety_training_date: Optional[str] = None
    disaster_management_taught: Optional[str] = None
    has_self_defence_grant: Optional[str] = None
    self_defence_upper_primary: Optional[str] = None
    self_defence_secondary: Optional[str] = None
    self_defence_higher_secondary: Optional[str] = None
    has_safety_display_board: Optional[str] = None
    has_first_level_counselor: Optional[str] = None
    safety_audit_frequency: Optional[str] = None


# ─────────────────────────────────────────────
# STEP 8 – STUDENT CAPACITY
# ─────────────────────────────────────────────

class SectionConfig(BaseModel):
    class_name: Optional[str] = None
    number_of_sections: Optional[int] = 1
    section_names: Optional[List[str]] = ["A"]


class StudentProfileSchema(BaseModel):
    name: Optional[str] = None
    gender: Optional[str] = None
    dob: Optional[str] = None
    mother_name: Optional[str] = None
    father_name: Optional[str] = None
    guardian_name: Optional[str] = None
    aadhaar_number: Optional[str] = None
    aadhaar_name: Optional[str] = None
    address: Optional[str] = None
    pincode: Optional[str] = None
    mobile: Optional[str] = None
    alternate_mobile: Optional[str] = None
    email: Optional[str] = None
    mother_tongue: Optional[str] = "19-English"
    social_category: Optional[str] = "1-General"
    minority_group: Optional[str] = "7-Not Applicable"
    is_bpl: Optional[str] = "2-No"
    is_aay: Optional[str] = "2-No"
    is_ews: Optional[str] = "2-No"
    is_cwsn: Optional[str] = "2-No"
    impairment_type: Optional[str] = "1-Not applicable"
    has_disability_certificate: Optional[str] = "2-No"
    is_indian_national: Optional[str] = "1-Yes"
    out_of_school_child: Optional[str] = "2-No"
    mainstreaming_year: Optional[str] = None
    blood_group: Optional[str] = "9-Not Known"
    academic_year: Optional[str] = "2024-25"
    school_udise_code: Optional[str] = None
    student_grade: Optional[str] = None
    student_national_code: Optional[str] = None
    student_section: Optional[str] = "A"
    roll_number: Optional[str] = None
    admission_number: Optional[str] = None
    admission_date: Optional[str] = None
    instruction_medium: Optional[str] = None
    language_group: Optional[str] = None
    academic_stream: Optional[str] = None
    prev_year_status: Optional[str] = None
    prev_year_grade: Optional[str] = None
    is_admitted_rte: Optional[str] = "2-No"
    rte_amount_claimed: Optional[str] = None
    prev_class_result: Optional[str] = None
    prev_class_marks: Optional[str] = None
    prev_year_attendance: Optional[str] = None
    has_facilities: Optional[str] = "2-No"
    facilities_received: Optional[List[str]] = []
    has_cwsn_facilities: Optional[str] = "2-No"
    cwsn_facilities_received: Optional[List[str]] = []
    screened_sld: Optional[str] = "2-No"
    sld_type: Optional[str] = None
    screened_asd: Optional[str] = "2-No"
    screened_adhd: Optional[str] = "2-No"
    is_gifted: Optional[str] = "2-No"
    appeared_competitions: Optional[str] = "2-No"
    participates_ncc: Optional[str] = "2-No"
    digital_capable: Optional[str] = "2-No"
    height: Optional[str] = None
    weight: Optional[str] = None
    distance_to_school: Optional[str] = None
    guardian_education: Optional[str] = None
    undertook_vocational: Optional[str] = "2-No"
    vocational_trade: Optional[str] = None
    vocational_job_role: Optional[str] = None
    vocational_prev_class_exam: Optional[str] = "3-Not Applicable"
    vocational_prev_class_marks: Optional[str] = None
    current_year_result: Optional[str] = None
    current_year_marks: Optional[str] = None
    current_year_attendance: Optional[str] = None


class StudentCapacitySchema(BaseModel):
    section_configs: Optional[List[SectionConfig]] = []
    students: Optional[List[StudentProfileSchema]] = []


# ─────────────────────────────────────────────
# STEP 9 – VOCATIONAL EDUCATION
# ─────────────────────────────────────────────

class VocationalLabRow(BaseModel):
    sector: Optional[str] = None
    condition: Optional[str] = None
    separate_room: Optional[str] = None


class VocationalEducationSchema(BaseModel):
    vocational_guest_lecturers: Optional[str] = None
    vocational_industry_visits: Optional[str] = None
    vocational_industry_linkages: Optional[str] = None
    plac_enrolled_10: Optional[str] = None
    plac_passed_10: Optional[str] = None
    plac_self_emp_10: Optional[str] = None
    plac_placed_10: Optional[str] = None
    plac_enrolled_12: Optional[str] = None
    plac_passed_12: Optional[str] = None
    plac_self_emp_12: Optional[str] = None
    plac_placed_12: Optional[str] = None
    vocational_labs: Optional[List[VocationalLabRow]] = []


# ─────────────────────────────────────────────
# FULL PROFILE SUBMIT SCHEMA
# ─────────────────────────────────────────────

class FullProfileSubmitSchema(BaseModel):
    basic_details: Optional[BasicDetailsSchema] = None
    receipts_expenditure: Optional[ReceiptsExpenditureSchema] = None
    legal_details: Optional[LegalDetailsSchema] = None
    location: Optional[LocationSchema] = None
    infrastructure: Optional[InfrastructureSchema] = None
    staff: Optional[StaffSchema] = None
    safety: Optional[SafetySchema] = None
    student_capacity: Optional[StudentCapacitySchema] = None
    vocational_education: Optional[VocationalEducationSchema] = None


# ─────────────────────────────────────────────
# RESPONSE SCHEMAS
# ─────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str
    id: Optional[str] = None


class ProfileStatusResponse(BaseModel):
    school_id: str
    completed_steps: List[str]
    last_updated: Optional[str] = None


# ─────────────────────────────────────────────
# DASHBOARD
# ─────────────────────────────────────────────

class ApplicationStatus(str, Enum):
    draft        = "Draft"
    submitted    = "Submitted"
    under_review = "Under Review"
    approved     = "Approved"
    rejected     = "Rejected"


class InspectionStatus(str, Enum):
    pending     = "Pending"
    scheduled   = "Scheduled"
    in_progress = "In Progress"
    completed   = "Completed"
    cancelled   = "Cancelled"
    failed      = "Failed"


class CertificateStatus(str, Enum):
    not_issued = "Not Issued"
    issued     = "Issued"
    active     = "Active"
    expired    = "Expired"
    revoked    = "Revoked"


class ProfileSectionStatus(BaseModel):
    name:      str
    completed: bool
    label:     Optional[str] = None


class ProfileCompletionResponse(BaseModel):
    school_id:             str
    completion_percentage: float
    sections:              dict


class ApplicationCreateRequest(BaseModel):
    notes: Optional[str] = None


class ApplicationResponse(BaseModel):
    application_id: str
    school_id:      str
    status:         ApplicationStatus
    submitted_on:   Optional[str] = None
    last_updated:   Optional[str] = None
    notes:          Optional[str] = None


class NotificationResponse(BaseModel):
    id:             str
    text:           str
    icon_type:      Optional[str] = "bell"
    time_ago:       Optional[str] = None
    color_variant:  Optional[str] = "blue"
    is_read:        bool = False
    created_at:     Optional[str] = None


class NotificationsListResponse(BaseModel):
    notifications: List[NotificationResponse]
    unread_count:  int = 0


class InspectionResponse(BaseModel):
    school_id:       str
    status:          InspectionStatus
    scheduled_date:  Optional[str] = None
    completed_date:  Optional[str] = None
    inspector_name:  Optional[str] = None
    remarks:         Optional[str] = None


class CertificateResponse(BaseModel):
    school_id:      str
    status:         CertificateStatus
    certificate_id: Optional[str] = None
    issued_on:      Optional[str] = None
    valid_until:    Optional[str] = None
    download_url:   Optional[str] = None


class DashboardSummaryResponse(BaseModel):
    school_id:            str
    school_name:          str
    profile_completion:   ProfileCompletionResponse
    application:          Optional[ApplicationResponse] = None
    inspection:           Optional[InspectionResponse] = None
    certificate:          Optional[CertificateResponse] = None
    recent_notifications: List[NotificationResponse] = []


# ─────────────────────────────────────────────
# ML PREDICTION
# ─────────────────────────────────────────────

class SchoolInfrastructureInput(BaseModel):
    TOTAL_STUDENTS: float
    TOTAL_TEACHERS: float
    total_boys_toilet: float
    total_boys_func_toilet: float
    total_girls_toilet: float
    total_girls_func_toilet: float
    total_class_rooms: float
    classrooms_in_good_condition: float
    internet: float
    comp_ict_lab_yn: float
    ict_lab_yn: float
    laptop: float
    desktop: float
    digiboard: float
    projector: float


class PredictionResponse(BaseModel):
    infraScore: int
    qualityCategory: str
    aiStatus: str
    suggestion: str
    severity: str


# ─────────────────────────────────────────────
# REGISTRATION SCHEMAS
# ─────────────────────────────────────────────

class ApplicationTypeUpdate(BaseModel):
    application_type: str


class RegistrationStepStatus(BaseModel):
    step:      str
    label:     str
    completed: bool


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

class StaffSummarySchema(BaseModel):
    staff_counts:    Optional[StaffCountRow]    = None
    staff_required:  Optional[StaffRequiredRow] = None


class RegistrationStaffSchema(BaseModel):
    staff_counts:        Optional[StaffCountRow]              = None
    staff_required:      Optional[StaffRequiredRow]           = None
    teachers:            Optional[List[TeacherDetailSchema]]  = []
    non_teaching_staff:  Optional[List[NonTeachingStaffSchema]] = []
    vocational_staff:    Optional[List[VocationalStaffSchema]] = []


class RegistrationStudentCapacitySchema(BaseModel):
    section_configs: Optional[List[SectionConfig]]       = []
    students:        Optional[List[StudentProfileSchema]] = []


class RegistrationSubmitSchema(BaseModel):
    application_type:      Optional[str]                           = "New Registration"
    basic_details:         Optional[BasicDetailsSchema]            = None
    receipts_expenditure:  Optional[ReceiptsExpenditureSchema]     = None
    legal_details:         Optional[LegalDetailsSchema]            = None
    location:              Optional[LocationSchema]                = None
    infrastructure:        Optional[InfrastructureSchema]          = None
    staff:                 Optional[RegistrationStaffSchema]       = None
    safety:                Optional[SafetySchema]                  = None
    student_capacity:      Optional[RegistrationStudentCapacitySchema] = None
    vocational_education:  Optional[VocationalEducationSchema]     = None


class RegistrationMessageResponse(BaseModel):
    message: str
    id:      Optional[str] = None


class RegistrationSummaryResponse(BaseModel):
    school_id:        str
    application_type: str
    status:           str
    completion_pct:   float
    submitted_at:     Optional[str] = None
    last_updated:     Optional[str] = None


# ─────────────────────────────────────────────
# STATUS PAGE SCHEMAS
# ─────────────────────────────────────────────

class TimelineStepStatus(str, Enum):
    done    = "done"
    current = "current"
    pending = "pending"


class TimelineStep(BaseModel):
    step:   str
    label:  str
    date:   Optional[str] = "--"
    status: TimelineStepStatus
    detail: str


class RemarkCreate(BaseModel):
    author:    str
    message:   str
    is_urgent: bool = False


class RemarkResponse(BaseModel):
    id:         str
    author:     str
    message:    str
    is_urgent:  bool
    created_at: str


class PendingActionSeverity(str, Enum):
    high   = "high"
    medium = "medium"


class PendingActionCreate(BaseModel):
    title:       str
    description: Optional[str] = None
    due_date:    Optional[str] = None
    severity:    PendingActionSeverity = PendingActionSeverity.medium


class PendingActionResponse(BaseModel):
    id:          str
    title:       str
    description: Optional[str] = None
    due_date:    Optional[str] = None
    severity:    PendingActionSeverity
    resolved:    bool = False
    created_at:  str


class StatusPageResponse(BaseModel):
    application_id:   str
    application_type: str
    submitted_on:     Optional[str]
    current_status:   str
    timeline:         List[TimelineStep]
    remarks:          List[RemarkResponse]
    pending_actions:  List[PendingActionResponse]


# ─────────────────────────────────────────────
# NOTIFICATIONS SCHEMAS
# ─────────────────────────────────────────────

class NotificationType(str, Enum):
    info    = "info"
    warning = "warning"
    success = "success"


class NotificationCreate(BaseModel):
    title:   str
    message: str
    type:    NotificationType = NotificationType.info


class MarkAllReadRequest(BaseModel):
    pass


class NotificationItem(BaseModel):
    id:      str
    title:   str
    message: str
    date:    str
    type:    NotificationType
    read:    bool


class NotificationsPageResponse(BaseModel):
    notifications: List[NotificationItem]
    unread_count:  int


class MarkReadResponse(BaseModel):
    message:  str
    notif_id: str


class MarkAllReadResponse(BaseModel):
    message:       str
    updated_count: int


# ─────────────────────────────────────────────
# INSPECTION SCHEMAS
# ─────────────────────────────────────────────

class ChecklistItemStatus(str, Enum):
    satisfactory      = "Satisfactory"
    needs_improvement = "Needs Improvement"
    not_checked       = "Not Checked"


class OverallResult(str, Enum):
    pending  = "Pending"
    passed   = "Passed"
    failed   = "Failed"
    deferred = "Deferred"


class ChecklistItem(BaseModel):
    item:   str
    status: ChecklistItemStatus


class ChecklistUpdateRequest(BaseModel):
    items: List[ChecklistItem]


class InspectionDetailResponse(BaseModel):
    inspection_id:   str
    school_id:       str
    date:            Optional[str] = None
    time:            Optional[str] = None
    officer_name:    Optional[str] = None
    status:          InspectionStatus


class InspectionReportResponse(BaseModel):
    overall_result: OverallResult
    remarks:        Optional[str] = None


class InspectionPageResponse(BaseModel):
    details:   InspectionDetailResponse
    checklist: List[ChecklistItem]
    report:    InspectionReportResponse


class ScheduleInspectionRequest(BaseModel):
    date:         str
    time:         str
    officer_name: str


class UpdateReportRequest(BaseModel):
    overall_result: OverallResult
    remarks:        Optional[str] = None


class UpdateStatusRequest(BaseModel):
    status: InspectionStatus


# ─────────────────────────────────────────────
# AUTH SCHEMAS
# ─────────────────────────────────────────────

class SendOtpRequest(BaseModel):
    email: Optional[EmailStr] = None


class SignupRequest(BaseModel):
    full_name:      Optional[str] = None
    email:          Optional[EmailStr] = None
    contact_number: Optional[str] = None
    school_name:    Optional[str] = None
    udise_number:   Optional[str] = None
    password:       Optional[str] = None
    otp:            Optional[str] = None


class LoginRequest(BaseModel):
    email:    Optional[EmailStr] = None
    password: Optional[str] = None


class UdiseVerifyResponse(BaseModel):
    is_valid: bool


class SignupResponse(BaseModel):
    message:  str
    user_id:  str
    email:    str


class LoginResponse(BaseModel):
    message:      str
    user_id:      str
    email:        str
    full_name:    str
    school_name:  str
    udise_number: str
    role:         str
    access_token: str
    token_type:   str = "bearer"


# ─────────────────────────────────────────────
# CERTIFICATES SCHEMAS
# ─────────────────────────────────────────────

class CertificatesSummary(BaseModel):
    active:  int
    expired: int
    total:   int


class CertificateItem(BaseModel):
    id:           str
    type:         str
    issue_date:   str
    validity:     str
    status:       CertificateStatus
    download_url: Optional[str] = None


class CurrentApplicationNote(BaseModel):
    application_id: str
    status:         str


class CertificatesPageResponse(BaseModel):
    school_id:           str
    summary:             CertificatesSummary
    certificates:        List[CertificateItem]
    current_application: Optional[CurrentApplicationNote] = None


class CertificateDetailResponse(BaseModel):
    certificate_id: str
    school_id:      str
    type:           str
    issued_on:      str
    valid_until:    str
    status:         CertificateStatus
    download_url:   Optional[str] = None
    issued_by:      Optional[str] = None
    remarks:        Optional[str] = None


class IssueCertificateRequest(BaseModel):
    type:         str = "Recognition Certificate"
    valid_until:  str
    download_url: Optional[str] = None


class RevokeCertificateRequest(BaseModel):
    reason: Optional[str] = None


class IssueCertificateResponse(BaseModel):
    message:        str
    certificate_id: str
    issued_on:      str
    valid_until:    str
    download_url:   Optional[str] = None


class DownloadUrlResponse(BaseModel):
    certificate_id: str
    download_url:   str



class ProfileDocumentResponse(BaseModel):
    id: str
    document_type: str
    label: str
    file_name: str
    content_type: str
    download_url: str
    uploaded_at: Optional[str] = None

class ProfileDocumentListResponse(BaseModel):
    documents: List[ProfileDocumentResponse]