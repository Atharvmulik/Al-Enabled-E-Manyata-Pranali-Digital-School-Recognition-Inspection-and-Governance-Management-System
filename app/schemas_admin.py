# app/schemas_admin.py

from pydantic import BaseModel
from typing import Optional, List


# ─────────────────────────────────────────────────────────
# Admin Dashboard Schemas
# ─────────────────────────────────────────────────────────

class AdminDashboardStats(BaseModel):
    total_schools: int
    approved_recognitions: int
    under_improvement: int


class RecentInspection(BaseModel):
    school_name:      str
    district:         str
    date:             str           # e.g. "2026-03-27"
    inspection_type:  Optional[str] = "Regular"
    status:           str           # Scheduled | In Progress | Completed | Cancelled


class UrgentAction(BaseModel):
    text:     str
    time_ago: str    # human-readable, e.g. "2h ago"
    type:     str    # doc | insp | sys  (used for colour coding on frontend)


class AdminDashboardResponse(BaseModel):
    stats:              AdminDashboardStats
    recent_inspections: List[RecentInspection]
    urgent_actions:     List[UrgentAction]


# ─────────────────────────────────────────────────────────
# School Management Schemas
# ─────────────────────────────────────────────────────────

class SchoolListItem(BaseModel):
    school_id:          str
    name:               str
    udise_number: str = ""
    district:           str
    status:             str                  # Active | Pending | Blocked
    application_status: Optional[str] = None # Draft | Submitted | Under Review | Approved | Rejected
    last_updated:       Optional[str] = None


class SchoolListResponse(BaseModel):
    schools:  List[SchoolListItem]
    total:    int
    page:     int
    per_page: int


class UpdateSchoolStatusRequest(BaseModel):
    status: str   # "Active" | "Pending" | "Blocked"


class VerifyApplicationRequest(BaseModel):
    action:  str            # "approve" or "reject"
    remarks: Optional[str] = None




# ─────────────────────────────────────────────────────────
# ADD THESE to your existing app/schemas_admin.py
# (append below the existing School Management Schemas)
# ─────────────────────────────────────────────────────────

from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


# ─────────────────────────────────────────────────────────
# Enums
# ─────────────────────────────────────────────────────────

class InspectionStatusAdmin(str, Enum):
    pending    = "Pending"
    scheduled  = "Scheduled"
    in_progress = "In Progress"
    completed  = "Completed"
    cancelled  = "Cancelled"

class InspectionTypeAdmin(str, Enum):
    regular      = "Regular"
    surprise     = "Surprise"
    reinspection = "Re-inspection"
    follow_up    = "Follow-up"


# ─────────────────────────────────────────────────────────
# Core inspection item  (used in list + modals)
# ─────────────────────────────────────────────────────────

class AdminInspectionItem(BaseModel):
    inspection_id: str
    school_id:     str
    name:          str          # school name
    district:      str
    date:          str          # "2026-03-05"
    time:          str          # "10:30 AM"
    inspector:     str          # inspector name or "TBD"
    inspector_id:  Optional[str] = None
    type:          InspectionTypeAdmin
    status:        InspectionStatusAdmin
    remarks:       Optional[str] = None
    overall_result: Optional[str] = None   # Passed / Failed / Pending


# ─────────────────────────────────────────────────────────
# List endpoint response
# ─────────────────────────────────────────────────────────

class AdminInspectionsListResponse(BaseModel):
    inspections:   List[AdminInspectionItem]
    total:         int
    active_count:  int          # powers the "14 Active" badge


# ─────────────────────────────────────────────────────────
# Schedule new inspection  (ScheduleInspectionModal)
# ─────────────────────────────────────────────────────────

class ScheduleInspectionRequest(BaseModel):
    school_id:    str
    date:         str           # "2026-03-25"
    time:         str           # "10:30 AM"
    inspector:    str           # name
    inspector_id: Optional[str] = None
    type:         InspectionTypeAdmin = InspectionTypeAdmin.regular
    remarks:      Optional[str] = None

class ScheduleInspectionResponse(BaseModel):
    message:       str
    inspection_id: str
    school_id:     str
    date:          str
    time:          str
    inspector:     str
    type:          str
    status:        str


# ─────────────────────────────────────────────────────────
# Reassign inspector  (ReassignInspectorModal)
# ─────────────────────────────────────────────────────────

class ReassignInspectorRequest(BaseModel):
    inspector:    str           # new inspector name
    inspector_id: Optional[str] = None
    reason:       Optional[str] = None

class ReassignInspectorResponse(BaseModel):
    message:        str
    inspection_id:  str
    new_inspector:  str


# ─────────────────────────────────────────────────────────
# Inspection detail  (InspectionDetailsModal)
# ─────────────────────────────────────────────────────────

class ChecklistItemAdmin(BaseModel):
    item:   str
    status: str     # Satisfactory / Needs Improvement / Not Checked

class InspectionDetailResponse(BaseModel):
    inspection_id:  str
    school_id:      str
    name:           str
    district:       str
    date:           str
    time:           str
    inspector:      str
    type:           str
    status:         str
    overall_result: Optional[str] = None
    remarks:        Optional[str] = None
    checklist:      List[ChecklistItemAdmin] = []


# ─────────────────────────────────────────────────────────
# Available inspectors list  (dropdown in both modals)
# ─────────────────────────────────────────────────────────

class InspectorItem(BaseModel):
    inspector_id: str
    name:         str
    district:     Optional[str] = None
    active_count: int = 0       # how many inspections currently assigned

class InspectorsListResponse(BaseModel):
    inspectors: List[InspectorItem]


# ─────────────────────────────────────────────────────────
# Update inspection status  (admin action)
# ─────────────────────────────────────────────────────────

class UpdateInspectionStatusRequest(BaseModel):
    status:  InspectionStatusAdmin
    remarks: Optional[str] = None








# ─────────────────────────────────────────────────────────
# ADD THESE to your existing app/schemas_admin.py
# (append below the inspection schemas)
# ─────────────────────────────────────────────────────────

from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


# ─────────────────────────────────────────────────────────
# Enums
# ─────────────────────────────────────────────────────────


class DocStatus(str, Enum):
    pending      = "Pending"
    approved     = "Approved"
    rejected     = "Rejected"
    not_required = "Not Required"
 
 
class DocRequirement(str, Enum):
    mandatory   = "Mandatory"
    conditional = "Conditional"
    optional    = "Optional"
 
 
class SchoolDocPriority(str, Enum):
    urgent = "Urgent"
    normal = "Normal"
 
 
class SchoolDocReviewStatus(str, Enum):
    pending   = "Pending"
    reviewing = "Reviewing"
    rejected  = "Rejected"
    approved  = "Approved"

# ─────────────────────────────────────────────────────────
# School list (left panel)
# ─────────────────────────────────────────────────────────

class SchoolDocSummary(BaseModel):
    school_id:     str
    name:          str
    pending_count: int
    priority:      SchoolDocPriority
    review_status: SchoolDocReviewStatus
 
 
class SchoolDocListResponse(BaseModel):
    schools:       List[SchoolDocSummary]
    total_pending: int

# ─────────────────────────────────────────────────────────
# Document item
# ─────────────────────────────────────────────────────────

class DocumentItem(BaseModel):
    doc_id:          str
    name:            str
    status:          DocStatus
    requirement:     DocRequirement
    file_name:       Optional[str] = None
    file_url:        Optional[str] = None       # Cloudinary download URL
    content_type:    Optional[str] = None       # e.g. application/pdf
    uploaded_at:     Optional[str] = None       # ISO timestamp string
    category:        str
    rejected_reason: Optional[str] = None       # why admin rejected
    admin_remarks:   Optional[str] = None       # optional admin note on approve
 
 
class DocumentCategory(BaseModel):
    category: str
    docs:     List[DocumentItem]


# ─────────────────────────────────────────────────────────
# Full documents page response (one API call loads page)
# ─────────────────────────────────────────────────────────

class DocumentsPageStats(BaseModel):
    approved: int
    pending:  int
    rejected: int
 
 
class DocumentsPageResponse(BaseModel):
    school_id:   str
    school_name: str
    stats:       DocumentsPageStats
    categories:  List[DocumentCategory]

# ─────────────────────────────────────────────────────────
# Approve / Reject a single document
# ─────────────────────────────────────────────────────────
 
class ApproveDocumentRequest(BaseModel):
    admin_remarks: Optional[str] = None     # optional note to school
 
 
class RejectDocumentRequest(BaseModel):
    doc_id:           str
    rejection_reason: str                   # mandatory
 
 
class DocumentActionResponse(BaseModel):
    message:   str
    doc_id:    str
    status:    DocStatus
    school_id: str
 



# ─────────────────────────────────────────────────────────
# ADD THESE to your existing app/schemas_admin.py
# (paste below the DocumentActionResponse class)
# ─────────────────────────────────────────────────────────

from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


# ─────────────────────────────────────────────────────────
# Enums
# ─────────────────────────────────────────────────────────

class NotificationStatus(str, Enum):
    delivered = "Delivered"
    seen      = "Seen"
    pending   = "Pending"

class NotificationType(str, Enum):
    urgent          = "Urgent"
    informational   = "Informational"
    update          = "Update"
    action_required = "Action Required"

class RecipientType(str, Enum):
    all_schools = "all_schools"
    school      = "school"
    inspector   = "inspector"


# ─────────────────────────────────────────────────────────
# History list item
# ─────────────────────────────────────────────────────────

class NotificationHistoryItem(BaseModel):
    id:      str
    message: str
    sentTo:  str                     # human label, e.g. "All Schools" / school name
    date:    str                     # "YYYY-MM-DD"
    status:  NotificationStatus
    type:    NotificationType


class NotificationHistoryResponse(BaseModel):
    notifications: List[NotificationHistoryItem]
    total:         int


# ─────────────────────────────────────────────────────────
# Send notification
# ─────────────────────────────────────────────────────────

class SendNotificationRequest(BaseModel):
    message:         str
    recipient_type:  RecipientType        # all_schools | school | inspector
    recipient_ids: Optional[List[str]] = None# school_id or inspector_id (None = all)
    recipient_label: str                  # human display label for history


class SendNotificationResponse(BaseModel):
    notification_id: str
    message:         str
    recipient_type:  str
    recipient_label: str
    status:          str


# ─────────────────────────────────────────────────────────
# System alerts
# ─────────────────────────────────────────────────────────

class SystemAlertsResponse(BaseModel):
    active_count: int


# ─────────────────────────────────────────────────────────
# Generic message (used for delete, remind, clear)
# ─────────────────────────────────────────────────────────

class GenericMessageResponse(BaseModel):
    message: str