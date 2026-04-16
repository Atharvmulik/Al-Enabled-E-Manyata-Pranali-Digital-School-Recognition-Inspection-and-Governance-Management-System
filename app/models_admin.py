# app/models_admin.py

from firebase_admin import firestore as _fs
from app.models import get_db, COL_SCHOOLS, COL_APPLICATIONS, COL_INSPECTIONS, get_application_by_school
from datetime import datetime, timezone
from typing import Optional, Tuple, List
from app.models import COL_REGISTRATIONS
# ─────────────────────────────────────────────────────────
# Dashboard stats
# ─────────────────────────────────────────────────────────

def get_total_schools() -> int:
    db = get_db()
    docs = db.collection(COL_SCHOOLS).stream()
    return sum(1 for _ in docs)


def get_approved_recognitions() -> int:
    db = get_db()
    docs = (
        db.collection(COL_APPLICATIONS)
        .where("status", "==", "Approved")
        .stream()
    )
    return sum(1 for _ in docs)


def get_under_improvement() -> int:
    db = get_db()
    docs = (
        db.collection(COL_INSPECTIONS)
        .where("overall_result", "==", "Failed")
        .stream()
    )
    school_ids = set()
    for doc in docs:
        data = doc.to_dict()
        sid = data.get("school_id")
        if sid:
            school_ids.add(sid)
    return len(school_ids)


def _time_ago(created_at) -> str:
    """Convert a Firestore timestamp / datetime to a human-readable 'X ago' string."""
    if not created_at:
        return "recently"
    if hasattr(created_at, "timestamp"):
        # Firestore DatetimeWithNanoseconds
        dt = datetime.fromtimestamp(created_at.timestamp(), tz=timezone.utc)
    elif isinstance(created_at, datetime):
        dt = created_at if created_at.tzinfo else created_at.replace(tzinfo=timezone.utc)
    else:
        return "recently"

    delta = datetime.now(timezone.utc) - dt
    if delta.days > 0:
        return f"{delta.days}d ago"
    hours = delta.seconds // 3600
    if hours > 0:
        return f"{hours}h ago"
    minutes = delta.seconds // 60
    return f"{minutes}m ago"


def get_recent_inspections(limit: int = 5) -> list:
    db = get_db()
    docs = (
        db.collection(COL_INSPECTIONS)
        .order_by("created_at", direction=_fs.Query.DESCENDING)
        .limit(limit)
        .stream()
    )
    inspections = []
    for doc in docs:
        data = doc.to_dict()
        school_id = data.get("school_id", "")
        school_doc = db.collection(COL_SCHOOLS).document(school_id).get()
        school_data = school_doc.to_dict() if school_doc.exists else {}
        inspections.append({
            "school_name": school_data.get("basic_details", {}).get("school_name", "Unknown"),
            "district":    school_data.get("location", {}).get("district", "Unknown"),
            "date":        data.get("date", ""),
            "inspection_type": data.get("type", "Regular"),
            "status":      data.get("status", "Pending"),
        })
    return inspections


def get_urgent_actions(limit: int = 3) -> list:
    db = get_db()
    school_docs = db.collection(COL_SCHOOLS).stream()
    actions = []

    for school_doc in school_docs:
        if len(actions) >= limit:
            break
        school_id = school_doc.id
        pending_ref = (
            db.collection("users")
            .document(school_id)
            .collection("pending_actions")
        )
        query = (
            pending_ref
            .where("resolved", "==", False)
            .where("severity", "==", "high")
            .limit(limit - len(actions))
        )
        for action_doc in query.stream():
            data = action_doc.to_dict()
            title = data.get("title", "")
            action_type = (
                "doc"  if "document"   in title.lower() else
                "insp" if "inspection" in title.lower() else
                "sys"
            )
            actions.append({
                "text":     title,
                "time_ago": _time_ago(data.get("created_at")),
                "type":     action_type,
            })
            if len(actions) >= limit:
                break

    return actions


# ─────────────────────────────────────────────────────────
# School management
# ─────────────────────────────────────────────────────────
def get_registration_by_school(db, school_id: str):
    doc = db.collection(COL_REGISTRATIONS).document(school_id).get()
    if not doc.exists:
        return None
    return doc.to_dict()


def list_schools(
    search: Optional[str] = None,
    district: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    per_page: int = 10,
) -> Tuple[List[dict], int]:
    """
    Return paginated list of schools with optional filters.
    Returns (schools_list, total_count).
    """
    db = get_db()
    query = db.collection(COL_SCHOOLS)

    # Server-side filters
    if district:
        query = query.where("location.district", "==", district)
    if status:
        query = query.where("status", "==", status)

    all_docs = list(query.stream())

    schools = []

    for doc in all_docs:
        data = doc.to_dict() or {}

        # ✅ SAFE extraction (VERY IMPORTANT)
        name = (
            data.get("basic_details", {}).get("school_name")
            or ""
        )

        udise = (
            data.get("basic_details", {}).get("udise_number")
            or data.get("udise_number")
            or ""
        )

        # Convert to lowercase for search safely
        name_lower = name.lower()
        udise_lower = udise.lower()

        # ✅ Search filter
        if search:
            search_lower = search.lower()
            if search_lower not in name_lower and search_lower not in udise_lower:
                continue

        reg_data = get_registration_by_school(db, doc.id)
        if not reg_data or not reg_data.get("submitted"):
            continue

        updated_at = data.get("updated_at")

        schools.append({
            "school_id": doc.id,
            "name": name,
            "udise_number": udise,
            "district": data.get("location", {}).get("district", ""),
            "status": data.get("status", "Pending"),
            "application_status": "Submitted" if reg_data.get("submitted") else "Draft",
            "last_updated": str(updated_at) if updated_at else None,
        })

    total = len(schools)

    # Pagination
    start = (page - 1) * per_page
    end = start + per_page

    return schools[start:end], total


# ─────────────────────────────────────────────────────────
# REPLACE get_school_full_profile in app/models_admin.py
# with this enhanced version that fetches all sub-collections
# ─────────────────────────────────────────────────────────

def get_school_full_profile(school_id: str) -> Optional[dict]:
    """
    Return the COMPLETE school profile — top-level doc + all sub-collections.
    Mirrors exactly what profile.py's individual GET endpoints do.
    """
    db = get_db()
    doc = db.collection(COL_SCHOOLS).document(school_id).get()
    if not doc.exists:
        return None

    data = doc.to_dict() or {}

    # ── Sub-collection names (must match models.py constants) ─────────────
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
    SUB_DIGITAL_FACILITIES = "digital_teaching_tools"
    SUB_DOCUMENTS          = "profile_documents"

    def _fetch_sub(sub_name: str) -> list:
        """Fetch all docs from a sub-collection and return as list of dicts."""
        refs = db.collection(COL_SCHOOLS).document(school_id).collection(sub_name).stream()
        result = []
        for d in refs:
            item = d.to_dict() or {}
            item["id"] = d.id
            result.append(item)
        return result

    # ── Assemble full profile ─────────────────────────────────────────────
    return {
        # Top-level sections stored on main doc
        "school_id":            school_id,
        "status":               data.get("status", "Pending"),
        "is_submitted":         data.get("is_submitted", False),
        "submitted_at":         str(data.get("submitted_at", "")),
        "updated_at":           str(data.get("updated_at", "")),

        # Step 1 – Basic Details
        "basic_details":        data.get("basic_details", {}),

        # Step 2 – Receipts & Expenditure
        "receipts_expenditure": data.get("receipts_expenditure", {}),
        "grants":               _fetch_sub(SUB_GRANTS),
        "assistance":           _fetch_sub(SUB_ASSISTANCE),

        # Step 3 – Legal Details
        "legal_details":        data.get("legal_details", {}),
        "vocational_rows":      _fetch_sub(SUB_VOC_ROWS),

        # Step 4 – Location
        "location":             data.get("location", {}),

        # Step 5 – Infrastructure
        "infrastructure":       data.get("infrastructure", {}),
        "higher_secondary_labs":  _fetch_sub(SUB_HS_LABS),
        "digital_equip_items":    _fetch_sub(SUB_DIGITAL_EQUIP),
        "digital_teaching_tools": _fetch_sub(SUB_DIGITAL_FACILITIES),

        # Step 6 – Staff
        "staff_summary":        data.get("staff_summary", {}),
        "teachers":             _fetch_sub(SUB_TEACHERS),
        "non_teaching_staff":   _fetch_sub(SUB_NON_TEACHING),
        "vocational_staff":     _fetch_sub(SUB_VOC_STAFF),

        # Step 7 – Safety
        "safety":               data.get("safety", {}),

        # Step 8 – Student Capacity
        "section_configs":      _fetch_sub(SUB_SECTION_CONFIGS),
        "students":             _fetch_sub(SUB_STUDENTS),

        # Anganwadi & misc sub-collections from Basic Details
        "anganwadi_rows":       _fetch_sub(SUB_ANGANWADI),
        "sec_156":              _fetch_sub(SUB_SEC_156),
        "sec_157":              _fetch_sub(SUB_SEC_157),

        # Step 9 – Vocational Education
        "vocational_education": data.get("vocational_education", {}),
        "vocational_labs":      _fetch_sub(SUB_VOC_LABS),

        # Step 10 – Transport
        "transport":            data.get("transport", {}),

        # Uploaded profile documents
        "profile_documents":    _fetch_sub(SUB_DOCUMENTS),
    }


def update_school_status(school_id: str, status: str) -> bool:
    """Update the top-level status field on the school document."""
    db = get_db()
    ref = db.collection(COL_SCHOOLS).document(school_id)
    if not ref.get().exists:
        return False
    ref.update({"status": status, "updated_at": _fs.SERVER_TIMESTAMP})
    return True


def get_latest_application(school_id: str) -> Optional[dict]:
    """Return the most recent application for a school."""
    db = get_db()
    docs = list(
        db.collection(COL_APPLICATIONS)
        .where("school_id", "==", school_id)
        .order_by("created_at", direction=_fs.Query.DESCENDING)
        .limit(1)
        .stream()
    )
    if not docs:
        return None
    d = docs[0].to_dict()
    d["_doc_id"] = docs[0].id
    return d


def verify_application(school_id: str, action: str, remarks: Optional[str] = None) -> bool:
    """
    Approve or reject the latest pending application.
    action must be 'approve' or 'reject'.
    """
    db = get_db()
    docs = list(
        db.collection(COL_APPLICATIONS)
        .where("school_id", "==", school_id)
        .where("status", "in", ["Submitted", "Under Review"])
        .order_by("created_at", direction=_fs.Query.DESCENDING)
        .limit(1)
        .stream()
    )
    if not docs:
        return False

    new_status = "Approved" if action == "approve" else "Rejected"
    docs[0].reference.update({
        "status":     new_status,
        "remarks":    remarks,
        "updated_at": _fs.SERVER_TIMESTAMP,
    })

    if action == "approve":
        update_school_status(school_id, "Active")

    return True




# ─────────────────────────────────────────────────────────
# ADD THESE FUNCTIONS to your existing app/models_admin.py
# ─────────────────────────────────────────────────────────

from firebase_admin import firestore as _fs
from app.models import get_db, COL_SCHOOLS, COL_INSPECTIONS
from typing import Optional, List, Tuple
from datetime import datetime, timezone

# Firestore collection for inspectors master list
COL_INSPECTORS = "inspectors"


# ─────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────

def _inspection_to_dict(doc_id: str, data: dict, school_name: str, district: str) -> dict:
    """Normalize a raw Firestore inspection doc → AdminInspectionItem dict."""
    return {
        "inspection_id":  doc_id,
        "school_id":      data.get("school_id", ""),
        "name":           school_name,
        "district":       district,
        "date":           data.get("date", ""),
        "time":           data.get("time", "10:00 AM"),
        "inspector":      data.get("officer_name") or data.get("inspector_name") or "TBD",
        "inspector_id":   data.get("inspector_id"),
        "type":           data.get("type", "Regular"),
        "status":         data.get("status", "Pending"),
        "remarks":        data.get("remarks"),
        "overall_result": data.get("overall_result"),
    }


def _get_school_name_district(db, school_id: str) -> Tuple[str, str]:
    """Fetch school name and district from school_profiles."""
    school_doc = db.collection(COL_SCHOOLS).document(school_id).get()
    if not school_doc.exists:
        return "Unknown School", "Unknown"
    d = school_doc.to_dict() or {}
    name     = d.get("basic_details", {}).get("school_name", "Unknown School")
    district = d.get("location", {}).get("district", "Unknown")
    return name, district


# ─────────────────────────────────────────────────────────
# 1. List all inspections (with optional filters)
# ─────────────────────────────────────────────────────────

def list_admin_inspections(
    status:   Optional[str] = None,
    district: Optional[str] = None,
    search:   Optional[str] = None,
    page:     int = 1,
    per_page: int = 20,
) -> Tuple[List[dict], int, int]:
    """
    Returns (inspections_list, total_count, active_count).
    active_count = inspections with status in [Pending, Scheduled, In Progress].
    """
    db = get_db()
    query = db.collection(COL_INSPECTIONS)

    if status:
        query = query.where("status", "==", status)

    all_docs = list(
        query.order_by("created_at", direction=_fs.Query.DESCENDING).stream()
    )

    results = []
    for doc in all_docs:
        data = doc.to_dict() or {}
        school_id = data.get("school_id", "")
        school_name, school_district = _get_school_name_district(db, school_id)

        # Client-side district filter
        if district and school_district.lower() != district.lower():
            continue

        # Client-side search filter (school name)
        if search and search.lower() not in school_name.lower():
            continue

        results.append(_inspection_to_dict(doc.id, data, school_name, school_district))

    active_count = sum(
        1 for r in results
        if r["status"] in ("Pending", "Scheduled", "In Progress")
    )

    total = len(results)
    start = (page - 1) * per_page
    return results[start: start + per_page], total, active_count


# ─────────────────────────────────────────────────────────
# 2. Get single inspection detail
# ─────────────────────────────────────────────────────────

def get_admin_inspection_detail(inspection_id: str) -> Optional[dict]:
    db = get_db()
    doc = db.collection(COL_INSPECTIONS).document(inspection_id).get()
    if not doc.exists:
        return None
    data = doc.to_dict() or {}
    school_id = data.get("school_id", "")
    school_name, district = _get_school_name_district(db, school_id)

    result = _inspection_to_dict(doc.id, data, school_name, district)
    # Add checklist
    result["checklist"] = [
        {"item": c.get("item", ""), "status": c.get("status", "Not Checked")}
        for c in (data.get("checklist") or [])
    ]
    return result


# ─────────────────────────────────────────────────────────
# 3. Schedule a new inspection
# ─────────────────────────────────────────────────────────

def schedule_admin_inspection(
    school_id:    str,
    date:         str,
    time:         str,
    inspector:    str,
    inspector_id: Optional[str],
    insp_type:    str,
    remarks:      Optional[str],
) -> dict:
    db = get_db()

    # Default checklist items
    default_checklist = [
        {"item": "Classrooms",        "status": "Not Checked"},
        {"item": "Toilets & Sanitation", "status": "Not Checked"},
        {"item": "Library",           "status": "Not Checked"},
        {"item": "ICT Lab",           "status": "Not Checked"},
        {"item": "Fire Safety",       "status": "Not Checked"},
        {"item": "Staff Records",     "status": "Not Checked"},
        {"item": "Drinking Water",    "status": "Not Checked"},
        {"item": "Playground",        "status": "Not Checked"},
    ]

    ref = db.collection(COL_INSPECTIONS).document()
    doc = {
        "school_id":    school_id,
        "date":         date,
        "time":         time,
        "officer_name": inspector,
        "inspector_id": inspector_id,
        "type":         insp_type,
        "status":       "Scheduled",
        "remarks":      remarks,
        "overall_result": "Pending",
        "checklist":    default_checklist,
        "created_at":   _fs.SERVER_TIMESTAMP,
        "updated_at":   _fs.SERVER_TIMESTAMP,
    }
    ref.set(doc)

    # Notify the school
    _notify_school(
        db, school_id,
        title   = "Inspection Scheduled",
        message = f"An inspection has been scheduled for {date} at {time}. Officer: {inspector}.",
        notif_type = "info",
    )

    school_name, district = _get_school_name_district(db, school_id)
    return _inspection_to_dict(ref.id, doc, school_name, district)


# ─────────────────────────────────────────────────────────
# 4. Reassign inspector
# ─────────────────────────────────────────────────────────

def reassign_inspector(
    inspection_id: str,
    new_inspector: str,
    inspector_id:  Optional[str],
    reason:        Optional[str],
) -> Optional[dict]:
    db = get_db()
    ref = db.collection(COL_INSPECTIONS).document(inspection_id)
    if not ref.get().exists:
        return None

    ref.update({
        "officer_name": new_inspector,
        "inspector_id": inspector_id,
        "reassign_reason": reason,
        "updated_at": _fs.SERVER_TIMESTAMP,
    })
    return {
        "message":       "Inspector reassigned successfully.",
        "inspection_id": inspection_id,
        "new_inspector": new_inspector,
    }


# ─────────────────────────────────────────────────────────
# 5. Update inspection status
# ─────────────────────────────────────────────────────────

def update_admin_inspection_status(
    inspection_id: str,
    status:        str,
    remarks:       Optional[str] = None,
) -> bool:
    db = get_db()
    ref = db.collection(COL_INSPECTIONS).document(inspection_id)
    if not ref.get().exists:
        return False

    update_data: dict = {
        "status":     status,
        "updated_at": _fs.SERVER_TIMESTAMP,
    }
    if remarks:
        update_data["remarks"] = remarks

    ref.update(update_data)

    # Notify school on completion
    if status == "Completed":
        data = ref.get().to_dict() or {}
        school_id = data.get("school_id", "")
        if school_id:
            _notify_school(
                db, school_id,
                title      = "Inspection Completed",
                message    = remarks or "Your school inspection has been completed.",
                notif_type = "success",
            )
    return True


# ─────────────────────────────────────────────────────────
# 6. List available inspectors  (for dropdown in modals)
# ─────────────────────────────────────────────────────────

def list_inspectors() -> List[dict]:
    """
    Returns all inspector profiles from the 'inspectors' collection.
    Each item includes how many active inspections they currently have.
    """
    db = get_db()
    docs = list(db.collection(COL_INSPECTORS).where("is_active", "==", True).stream())

    inspectors = []
    for doc in docs:
        data = doc.to_dict() or {}

        # Count active inspections for this inspector
        active_docs = list(
            db.collection(COL_INSPECTIONS)
            .where("inspector_id", "==", doc.id)
            .where("status", "in", ["Scheduled", "Pending", "In Progress"])
            .stream()
        )

        inspectors.append({
            "inspector_id": doc.id,
            "name":         data.get("name", ""),
            "district":     data.get("district"),
            "active_count": len(active_docs),
        })

    return inspectors


# ─────────────────────────────────────────────────────────
# Internal helper — create a school notification
# ─────────────────────────────────────────────────────────

def _notify_school(db, school_id: str, title: str, message: str, notif_type: str = "info"):
    """Create a notification document for a school."""
    COL_NOTIFICATIONS = "notifications"
    from datetime import datetime, timezone

    ref = db.collection(COL_NOTIFICATIONS).document()
    ref.set({
        "school_id":  school_id,
        "title":      title,
        "message":    message,
        "type":       notif_type,
        "read":       False,
        "created_at": _fs.SERVER_TIMESTAMP,
    })







# ─────────────────────────────────────────────────────────
# ADD THESE FUNCTIONS to your existing app/models_admin.py
# ─────────────────────────────────────────────────────────

from firebase_admin import firestore as _fs
from app.models import get_db, COL_SCHOOLS
from typing import Optional, List, Tuple

# Firestore top-level collection where school documents live
# Each document: school_profiles/{school_id}/documents/{doc_id}
COL_DOCUMENTS = "documents"   # sub-collection under school_profiles
SUB_PROFILE_DOCUMENTS = "profile_documents"


# ─────────────────────────────────────────────────────────
# Required documents master list
# (defines what docs every school must submit)
# ─────────────────────────────────────────────────────────

REQUIRED_DOCUMENTS = [

    # ── 1. Basic Details ─────────────────────────
    ("1. Basic Details", "registration_certificate", "Registration Certificate", "Mandatory"),
    ("1. Basic Details", "trust_certificate", "Trust / Society Certificate", "Mandatory"),
    ("1. Basic Details", "smc_member_list", "List of SMC Members", "Mandatory"),

    # ── 2. Legal Details ─────────────────────────
    ("2. Legal Details", "legal_document", "Legal Document", "Mandatory"),
    ("2. Legal Details", "noc_certificate", "NOC Certificate", "Mandatory"),
    ("2. Legal Details", "building_approval", "Building Approval Certificate", "Mandatory"),

    # ── 3. Infrastructure ────────────────────────
    ("3. Infrastructure", "structural_stability_cert", "Structural Stability Certificate", "Mandatory"),

    # ── 4. Safety ────────────────────────────────
    ("4. Safety", "sdmp_document", "School Disaster Management Plan (SDMP)", "Mandatory"),
    ("4. Safety", "pwd_safety_cert", "PWD Structural Safety Certificate", "Mandatory"),
    ("4. Safety", "fire_dept_certificate", "Fire Department Certificate", "Mandatory"),

    # ── 5. Transportation ────────────────────────
    ("5. Transportation", "fire_transport_certificate", "Fire Department Certificate", "Mandatory"),
    ("5. Transportation", "transport_permit", "Transport Permit", "Mandatory"),
]


# ─────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────

def _get_school_docs_ref(db, school_id: str):
    return db.collection(COL_SCHOOLS).document(school_id).collection(COL_DOCUMENTS)


def _doc_to_dict(doc_id: str, data: dict, category: str, requirement: str, name: str) -> dict:
    return {
        "doc_id":           doc_id,
        "name":             data.get("name", name),
        "status":           data.get("status", "Pending"),
        "requirement":      data.get("requirement", requirement),
        "file_name":        data.get("file_name"),
        "file_url":         data.get("file_url"),
        "category":         category,
        "rejected_reason":  data.get("rejected_reason"),
    }


def _ensure_documents_exist(db, school_id: str):
    """
    If a school has no documents sub-collection yet, seed it with
    all required document stubs (status = Pending or Not Required).
    """
    docs_ref = _get_school_docs_ref(db, school_id)
    existing = {doc.id for doc in docs_ref.stream()}

    for category, doc_id, name, requirement in REQUIRED_DOCUMENTS:
        if doc_id not in existing:
            docs_ref.document(doc_id).set({
                "name":        name,
                "status":      "Not Required" if requirement == "Conditional" else "Pending",
                "requirement": requirement,
                "category":    category,
                "file_name":   None,
                "file_url":    None,
                "created_at":  _fs.SERVER_TIMESTAMP,
            })


# ─────────────────────────────────────────────────────────
# 1. School list — left panel
# ─────────────────────────────────────────────────────────

def list_schools_with_doc_summary(
    search:   Optional[str] = None,
    priority: Optional[str] = None,
) -> Tuple[List[dict], int]:
    """
    Returns (school_list, total_pending_across_all_schools).
    Each item has pending_count, priority (Urgent if any Mandatory doc is Pending/Rejected), review_status.
    """
    db = get_db()
    school_docs = list(db.collection(COL_SCHOOLS).stream())

    results = []
    total_pending = 0

    for school_doc in school_docs:
        data       = school_doc.to_dict() or {}
        school_id  = school_doc.id
        school_name = data.get("basic_details", {}).get("school_name", "Unknown")

        if search and search.lower() not in school_name.lower():
            continue

        # Count pending docs in sub-collection
        docs_ref  = _get_school_docs_ref(db, school_id)
        all_docs  = [d.to_dict() or {} for d in docs_ref.stream()]

        pending_count  = sum(1 for d in all_docs if d.get("status") == "Pending")
        rejected_count = sum(1 for d in all_docs if d.get("status") == "Rejected")
        has_urgent     = any(
            d.get("requirement") == "Mandatory" and d.get("status") in ("Pending", "Rejected")
            for d in all_docs
        )

        # review_status
        if rejected_count > 0:
            review_status = "Rejected"
        elif pending_count == 0 and len(all_docs) > 0:
            review_status = "Approved"
        elif any(d.get("status") == "Reviewing" for d in all_docs):
            review_status = "Reviewing"
        else:
            review_status = "Pending"

        item_priority = "Urgent" if has_urgent else "Normal"

        if priority and item_priority != priority:
            continue

        total_pending += pending_count
        results.append({
            "school_id":     school_id,
            "name":          school_name,
            "pending_count": pending_count,
            "priority":      item_priority,
            "review_status": review_status,
        })

    # Sort: Urgent first, then by pending_count descending
    results.sort(key=lambda x: (0 if x["priority"] == "Urgent" else 1, -x["pending_count"]))
    return results, total_pending


# ─────────────────────────────────────────────────────────
# 2. Full documents page for one school
# ─────────────────────────────────────────────────────────

def get_school_documents_page(school_id: str) -> Optional[dict]:
    """
    Returns all document categories + stats for one school.
    Supports BOTH old (profile_documents) and new (documents) collections.
    """
    db = get_db()
    school_doc = db.collection(COL_SCHOOLS).document(school_id).get()
    if not school_doc.exists:
        return None

    school_data = school_doc.to_dict() or {}
    school_name = school_data.get("basic_details", {}).get("school_name", "Unknown")

    # Ensure new documents collection exists
    _ensure_documents_exist(db, school_id)

    # ─────────────────────────────────────────
    # 1. FETCH NEW COLLECTION (documents)
    # ─────────────────────────────────────────
    docs_ref = _get_school_docs_ref(db, school_id)
    doc_snaps = {d.id: d.to_dict() or {} for d in docs_ref.stream()}

    # ─────────────────────────────────────────
    # 2. FETCH OLD COLLECTION (profile_documents)
    # ─────────────────────────────────────────
    profile_docs_ref = db.collection(COL_SCHOOLS).document(school_id).collection("profile_documents")
    profile_docs = {d.id: d.to_dict() or {} for d in profile_docs_ref.stream()}

    # ─────────────────────────────────────────
    # 3. MERGE OLD DATA INTO NEW STRUCTURE
    # ─────────────────────────────────────────
    for doc_id, data in profile_docs.items():

        # If doc_id matches REQUIRED_DOCUMENTS → direct mapping
        if doc_id in doc_snaps:
            if not doc_snaps[doc_id].get("file_url"):
                doc_snaps[doc_id].update({
                    "file_url": data.get("file_url") or data.get("download_url"),
                    "file_name": data.get("file_name"),
                    "uploaded_at": data.get("uploaded_at"),
                    "content_type": data.get("content_type"),
                })

    # ─────────────────────────────────────────
    # 4. FILTER ONLY REQUIRED DOCUMENTS
    # ─────────────────────────────────────────
    valid_doc_ids = {doc_id for _, doc_id, _, _ in REQUIRED_DOCUMENTS}

    doc_snaps = {
        doc_id: data
        for doc_id, data in doc_snaps.items()
        if doc_id in valid_doc_ids
    }

    # ─────────────────────────────────────────
    # 5. BUILD RESPONSE
    # ─────────────────────────────────────────
    category_map: dict = {}
    approved = pending = rejected = 0

    for category, doc_id, name, requirement in REQUIRED_DOCUMENTS:
        data = doc_snaps.get(doc_id, {
            "status":      "Not Required" if requirement == "Conditional" else "Pending",
            "requirement": requirement,
        })

        status = data.get("status", "Pending")

        if status == "Approved":
            approved += 1
        elif status == "Pending":
            pending += 1
        elif status == "Rejected":
            rejected += 1

        doc_item = _doc_to_dict(doc_id, data, category, requirement, name)

        if category not in category_map:
            category_map[category] = []

        category_map[category].append(doc_item)

    categories = [
        {"category": cat, "docs": docs}
        for cat, docs in category_map.items()
    ]

    return {
        "school_id":   school_id,
        "school_name": school_name,
        "stats":       {
            "approved": approved,
            "pending": pending,
            "rejected": rejected
        },
        "categories":  categories,
    }


# ─────────────────────────────────────────────────────────
# 3. Approve a document
# ─────────────────────────────────────────────────────────

def approve_document(school_id: str, doc_id: str) -> bool:
    db = get_db()
    ref = _get_school_docs_ref(db, school_id).document(doc_id)
    if not ref.get().exists:
        return False
    ref.update({
        "status":          "Approved",
        "rejected_reason": None,
        "updated_at":      _fs.SERVER_TIMESTAMP,
    })
    _notify_school_doc(db, school_id, doc_id, "approved")
    return True


# ─────────────────────────────────────────────────────────
# 4. Reject a document
# ─────────────────────────────────────────────────────────

def reject_document(school_id: str, doc_id: str, reason: str) -> bool:
    db = get_db()
    ref = _get_school_docs_ref(db, school_id).document(doc_id)
    if not ref.get().exists:
        return False
    ref.update({
        "status":          "Rejected",
        "rejected_reason": reason,
        "updated_at":      _fs.SERVER_TIMESTAMP,
    })
    _notify_school_doc(db, school_id, doc_id, "rejected", reason)
    return True


# ─────────────────────────────────────────────────────────
# Internal: notify school about document action
# ─────────────────────────────────────────────────────────

def _notify_school_doc(db, school_id: str, doc_id: str, action: str, reason: Optional[str] = None):
    COL_NOTIFICATIONS = "notifications"
    if action == "approved":
        title   = "Document Approved"
        message = f"Your document '{doc_id}' has been approved by the admin."
        ntype   = "success"
    else:
        title   = "Document Rejected"
        message = f"Your document '{doc_id}' was rejected. Reason: {reason or 'See admin remarks.'}"
        ntype   = "warning"

    db.collection(COL_NOTIFICATIONS).document().set({
        "school_id":  school_id,
        "title":      title,
        "message":    message,
        "type":       ntype,
        "read":       False,
        "created_at": _fs.SERVER_TIMESTAMP,
    })




# ─────────────────────────────────────────────────────────
# ADD THESE FUNCTIONS to your existing app/models_admin.py
# (paste below the existing _notify_school_doc function)
# ─────────────────────────────────────────────────────────

# Firestore collection for admin-sent broadcast notifications (history log)
COL_BROADCAST_NOTIFICATIONS = "broadcast_notifications"
COL_SYSTEM_ALERTS = "system_alerts"


# ─────────────────────────────────────────────────────────
# 1. List notification history (paginated)
# ─────────────────────────────────────────────────────────

def list_notifications_history(
    page: int = 1,
    per_page: int = 20,
) -> tuple:
    """
    Returns (notifications_list, total_count).
    Each item matches the NotificationHistoryItem schema.
    """
    db = get_db()

    all_docs = list(
        db.collection(COL_BROADCAST_NOTIFICATIONS)
        .where("source", "==", "broadcast")   # ✅ THIS IS STEP 3
        .order_by("createdAt", direction=_fs.Query.DESCENDING)
        .stream()
    )

    results = []
    for doc in all_docs:
        data = doc.to_dict() or {}
        results.append({
        "id":      doc.id,
        "message": data.get("message", ""),
        "sentTo":  data.get("recipient_label", "All Schools"),
        "date":    _format_date(data.get("created_at") or data.get("createdAt")),
        "status":  data.get("status", "Delivered"),
        "type":    data.get("notification_type", "Informational"),
        "source":  data.get("source", "broadcast"),   # ✅ ADD THIS
    })

    total = len(results)
    start = (page - 1) * per_page
    return results[start: start + per_page], total


def _format_date(ts) -> str:
    """Convert Firestore timestamp to YYYY-MM-DD string."""
    if not ts:
        return ""
    if hasattr(ts, "timestamp"):
        dt = datetime.fromtimestamp(ts.timestamp(), tz=timezone.utc)
        return dt.strftime("%Y-%m-%d")
    if isinstance(ts, datetime):
        return ts.strftime("%Y-%m-%d")
    return str(ts)


# ─────────────────────────────────────────────────────────
# 2. Send broadcast notification
# ─────────────────────────────────────────────────────────

def send_broadcast_notification(
    message: str,
    recipient_type: str,
    recipient_label: str,
    recipient_ids: Optional[List[str]] = None,
    
) -> dict:
    """
    Create a broadcast_notifications log entry and push the
    notification to the relevant school(s) / inspector.

    Returns a dict matching SendNotificationResponse.
    """
    db = get_db()

    # Determine notification_type heuristic
    msg_lower = message.lower()
    if any(w in msg_lower for w in ("urgent", "noc", "fire", "immediate", "deadline")):
        notif_type = "Urgent"
    elif any(w in msg_lower for w in ("schedule", "inspection", "visit")):
        notif_type = "Update"
    elif any(w in msg_lower for w in ("action", "submit", "required", "pending")):
        notif_type = "Action Required"
    else:
        notif_type = "Informational"

    # Log entry
    ref = db.collection(COL_BROADCAST_NOTIFICATIONS).document()
    ref.set({
        "message":          message,
        "recipient_type":   recipient_type,
        "recipient_ids": recipient_ids if recipient_ids else [],
        "recipient_label":  recipient_label,
        "notification_type": notif_type,
        "status":           "Delivered",
        "created_at":       _fs.SERVER_TIMESTAMP,
        "createdAt": _fs.SERVER_TIMESTAMP,
        "source": "broadcast",
    })

    # Push to actual recipients
    if recipient_type == "school" and recipient_ids:
        if isinstance(recipient_ids, list):
            for sid in recipient_ids:
                _notify_school(db, sid, title="New Broadcast", message=message, notif_type="info")
        else:
            _notify_school(db, recipient_ids, title="New Broadcast", message=message, notif_type="info")


    elif recipient_type == "school" and recipient_ids:
        if isinstance(recipient_ids, list):
            for sid in recipient_ids:
                _notify_school(
                    db, sid,
                    title="New Broadcast",
                    message=message,
                    notif_type="info",
                )
        else:
            _notify_school(
                db, recipient_ids,
                title="New Broadcast",
                message=message,
                notif_type="info",
            )

    elif recipient_type == "inspector" and recipient_ids:
        _notify_inspector(db, recipient_ids, message)

    return {
        "notification_id":  ref.id,
        "message":          "Notification sent successfully.",
        "recipient_type":   recipient_type,
        "recipient_label":  recipient_label,
        "status":           "Delivered",
    }


def _notify_inspector(db, inspector_id: str, message: str):
    """Create a notification for an inspector."""
    COL_INSPECTOR_NOTIFICATIONS = "inspector_notifications"
    db.collection(COL_INSPECTOR_NOTIFICATIONS).document().set({
        "inspector_id": inspector_id,
        "message":      message,
        "read":         False,
        "created_at":   _fs.SERVER_TIMESTAMP,
    })


# ─────────────────────────────────────────────────────────
# 3. Delete a single notification record
# ─────────────────────────────────────────────────────────

def delete_notification_record(notification_id: str) -> bool:
    db = get_db()
    ref = db.collection(COL_BROADCAST_NOTIFICATIONS).document(notification_id)
    if not ref.get().exists:
        return False
    ref.delete()
    return True


# ─────────────────────────────────────────────────────────
# 4. Resend a notification as reminder
# ─────────────────────────────────────────────────────────

def remind_notification(notification_id: str) -> bool:
    """
    Fetches original notification and re-broadcasts it.
    Also resets status to Delivered.
    """
    db = get_db()
    ref = db.collection(COL_BROADCAST_NOTIFICATIONS).document(notification_id)
    doc = ref.get()
    if not doc.exists:
        return False

    data = doc.to_dict() or {}
    send_broadcast_notification(
    message         = data.get("message", ""),
    recipient_type  = data.get("recipient_type", "all_schools"),
    recipient_label = data.get("recipient_label", ""),
    recipient_ids   = data.get("recipient_id"),
)
    return True


# ─────────────────────────────────────────────────────────
# 5. Clear all notification logs
# ─────────────────────────────────────────────────────────

def clear_all_notification_logs():
    db = get_db()
    docs = db.collection(COL_BROADCAST_NOTIFICATIONS).stream()
    for doc in docs:
        doc.reference.delete()


# ─────────────────────────────────────────────────────────
# 6. System alert count
# ─────────────────────────────────────────────────────────

def get_system_alert_count() -> int:
    """Count active (unresolved) system alerts."""
    db = get_db()
    try:
        docs = (
            db.collection(COL_SYSTEM_ALERTS)
            .where("resolved", "==", False)
            .stream()
        )
        return sum(1 for _ in docs)
    except Exception:
        return 0
    



_DOC_META = {
    doc_type: (category, name, requirement)
    for category, doc_type, name, requirement in REQUIRED_DOCUMENTS
}



 
def _get_profile_docs_ref(db, school_id: str):
    """Reference to the profile_documents sub-collection (Cloudinary uploads)."""
    return db.collection(COL_SCHOOLS).document(school_id).collection(SUB_PROFILE_DOCUMENTS)
 
 
def _get_admin_overrides_ref(db, school_id: str):
    """
    Reference to admin_doc_overrides sub-collection.
    Stores admin approve/reject decisions + remarks per document_type.
    This is separate from the school's uploaded files.
    """
    return db.collection(COL_SCHOOLS).document(school_id).collection("admin_doc_overrides")
 
 
def _build_doc_item(
    doc_type: str,
    uploaded: Optional[dict],   # from profile_documents (may be None)
    override: Optional[dict],   # from admin_doc_overrides (may be None)
) -> dict:
    """
    Merge uploaded file info with admin override to produce a full doc item.
    """
    category, name, requirement = _DOC_META.get(
        doc_type,
        ("Unknown", doc_type.replace("_", " ").title(), "Mandatory")
    )
 
    # Admin override takes priority for status / remarks
    if override:
        status          = override.get("status", "Pending")
        rejected_reason = override.get("rejected_reason")
        admin_remarks   = override.get("admin_remarks")
    elif uploaded:
        # File is uploaded but admin hasn't acted yet
        status          = "Pending"
        rejected_reason = None
        admin_remarks   = None
    else:
        # Nothing uploaded, nothing reviewed
        status          = "Pending"
        rejected_reason = None
        admin_remarks   = None
 
    return {
        "doc_id":          doc_type,          # used as the URL segment
        "name":            name,
        "status":          status,
        "requirement":     requirement,
        "category":        category,
        "file_name":       uploaded.get("file_name")    if uploaded else None,
        "file_url": uploaded.get("file_url") if uploaded else None,
        "content_type":    uploaded.get("content_type") if uploaded else None,
        "uploaded_at":     str(uploaded.get("uploaded_at", "")) if uploaded else None,
        "rejected_reason": rejected_reason,
        "admin_remarks":   admin_remarks,
    }
 
 
# ─────────────────────────────────────────────────────────
# 1. School list — left panel
# ─────────────────────────────────────────────────────────
 
def list_schools_with_doc_summary(
    search:   Optional[str] = None,
    priority: Optional[str] = None,
) -> Tuple[List[dict], int]:
    """
    Returns (school_list, total_pending_across_all_schools).
    Reads from profile_documents + admin_doc_overrides to compute real counts.
    """
    db = get_db()
    school_docs = list(db.collection(COL_SCHOOLS).stream())
 
    results     = []
    total_pending = 0
 
    for school_doc in school_docs:
        school_id   = school_doc.id
        data        = school_doc.to_dict() or {}
        school_name = data.get("basic_details", {}).get("school_name", "Unknown")
 
        # Only show schools that have submitted their profile
        if not data.get("is_submitted", False):
            continue
 
        if search and search.lower() not in school_name.lower():
            continue
 
        # Read uploaded files
        uploaded_map = {
            d.to_dict().get("document_type"): d.to_dict()
            for d in _get_profile_docs_ref(db, school_id).stream()
            if d.to_dict().get("document_type")
        }
 
        # Read admin decisions
        override_map = {
            d.id: d.to_dict()
            for d in _get_admin_overrides_ref(db, school_id).stream()
        }
 
        # Count statuses
        approved_count = 0
        pending_count  = 0
        rejected_count = 0
        has_urgent     = False
 
        for _, doc_type, _, requirement in REQUIRED_DOCUMENTS:
            uploaded = uploaded_map.get(doc_type)
            override = override_map.get(doc_type)
            item     = _build_doc_item(doc_type, uploaded, override)
            status   = item["status"]
 
            if status == "Approved":
                approved_count += 1
            elif status == "Rejected":
                rejected_count += 1
                if requirement == "Mandatory":
                    has_urgent = True
            else:  # Pending
                pending_count += 1
                if requirement == "Mandatory" and not uploaded:
                    has_urgent = True
 
        # review_status
        total_docs = len(REQUIRED_DOCUMENTS)
        if rejected_count > 0:
            review_status = "Rejected"
        elif approved_count == total_docs:
            review_status = "Approved"
        elif approved_count > 0:
            review_status = "Reviewing"
        else:
            review_status = "Pending"
 
        item_priority = "Urgent" if has_urgent else "Normal"
 
        if priority and item_priority != priority:
            continue
 
        total_pending += pending_count
        results.append({
            "school_id":     school_id,
            "name":          school_name,
            "pending_count": pending_count,
            "priority":      item_priority,
            "review_status": review_status,
        })
 
    results.sort(key=lambda x: (0 if x["priority"] == "Urgent" else 1, -x["pending_count"]))
    return results, total_pending
 
 
# ─────────────────────────────────────────────────────────
# 2. Full documents page for one school
# ─────────────────────────────────────────────────────────
 
def get_school_documents_page(school_id: str) -> Optional[dict]:
    """
    Returns all document categories with real file URLs from Cloudinary
    and admin decisions from admin_doc_overrides.
    """
    db = get_db()
    school_doc = db.collection(COL_SCHOOLS).document(school_id).get()
    if not school_doc.exists:
        return None
 
    school_name = (school_doc.to_dict() or {}).get("basic_details", {}).get("school_name", "Unknown")
 
    # Read real uploads from profile_documents
    uploaded_map: dict = {}
    for d in _get_profile_docs_ref(db, school_id).stream():
        item = d.to_dict() or {}
        doc_type = item.get("document_type")
        if doc_type:
            uploaded_map[doc_type] = item
 
    # Read admin decisions
    override_map: dict = {}
    for d in _get_admin_overrides_ref(db, school_id).stream():
        override_map[d.id] = d.to_dict() or {}
 
    # Build category map preserving master list order
    category_map: dict = {}
    approved = pending = rejected = 0
 
    for category, doc_type, name, requirement in REQUIRED_DOCUMENTS:
        uploaded = uploaded_map.get(doc_type)
        override = override_map.get(doc_type)
        item     = _build_doc_item(doc_type, uploaded, override)
 
        s = item["status"]
        if s == "Approved":   approved += 1
        elif s == "Rejected": rejected += 1
        else:                 pending  += 1
 
        if category not in category_map:
            category_map[category] = []
        category_map[category].append(item)
 
    categories = [{"category": cat, "docs": docs} for cat, docs in category_map.items()]
 
    return {
        "school_id":   school_id,
        "school_name": school_name,
        "stats":       {"approved": approved, "pending": pending, "rejected": rejected},
        "categories":  categories,
    }
 
 
# ─────────────────────────────────────────────────────────
# 3. Approve a document
# ─────────────────────────────────────────────────────────
 
def approve_document(school_id: str, doc_id: str, admin_remarks: Optional[str] = None) -> bool:
    db = get_db()
 
    # Write admin decision to override collection
    ref = _get_admin_overrides_ref(db, school_id).document(doc_id)
    ref.set({
        "status":          "Approved",
        "rejected_reason": None,
        "admin_remarks":   admin_remarks,
        "updated_at":      _fs.SERVER_TIMESTAMP,
    }, merge=True)
 
    _notify_school_doc(db, school_id, doc_id, "approved", admin_remarks)
    return True
 
 
# ─────────────────────────────────────────────────────────
# 4. Reject a document
# ─────────────────────────────────────────────────────────
 
def reject_document(school_id: str, doc_id: str, reason: str) -> bool:
    db = get_db()
 
    ref = _get_admin_overrides_ref(db, school_id).document(doc_id)
    ref.set({
        "status":          "Rejected",
        "rejected_reason": reason,
        "admin_remarks":   reason,
        "updated_at":      _fs.SERVER_TIMESTAMP,
    }, merge=True)
 
    _notify_school_doc(db, school_id, doc_id, "rejected", reason)
    return True
 
 
# ─────────────────────────────────────────────────────────
# 5. Reset a document back to Pending (undo approve/reject)
# ─────────────────────────────────────────────────────────
 
def reset_document(school_id: str, doc_id: str) -> bool:
    db = get_db()
    ref = _get_admin_overrides_ref(db, school_id).document(doc_id)
    if ref.get().exists:
        ref.delete()
    return True
 
 
# ─────────────────────────────────────────────────────────
# Internal: notify school about document action
# ─────────────────────────────────────────────────────────
 
def _notify_school_doc(db, school_id: str, doc_id: str, action: str, reason: Optional[str] = None):
    COL_NOTIFICATIONS = "notifications"
    _, name, _ = _DOC_META.get(doc_id, ("", doc_id, ""))
 
    if action == "approved":
        title   = "Document Approved"
        message = f"Your document '{name}' has been approved by the admin."
        if reason:
            message += f" Remarks: {reason}"
        ntype   = "success"
    else:
        title   = "Document Rejected"
        message = f"Your document '{name}' was rejected. Reason: {reason or 'See admin remarks.'}"
        ntype   = "warning"
 
    db.collection(COL_NOTIFICATIONS).document().set({
        "school_id":  school_id,
        "title":      title,
        "message":    message,
        "type":       ntype,
        "read":       False,
        "created_at": _fs.SERVER_TIMESTAMP,
    })
 