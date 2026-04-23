"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  RefreshCw,
  Building2,
  GraduationCap,
  Users,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Hash,
  Shield,
  BookOpen,
  FileCheck,
  ChevronRight,
  Award,
  UserCheck,
  Stamp,
  Paperclip,
  ClipboardList,
  Search,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  UserPlus,
  FolderOpen,
  FileBadge,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
// Types (aligned with backend schemas)
// ─────────────────────────────────────────────────────────────────────────────

type AppType = "New Recognition" | "Renewal" | "Upgradation";
type AppStatus =
  | "Pending Review"
  | "Under Inspection"
  | "Approved"
  | "Rejected"
  | "Re-Inspection Required"
  | "Documents Requested";

// Application list item from GET /admin/applications
interface AdminApplication {
  school_id: string;
  school_name: string;
  udise_number: string;
  district: string;
  status: AppStatus;
  application_type: AppType;
  application_id: string;
  updated_at: string;
  submitted_at: string;
}

// Full application data for modal (same as original)
interface ApplicationData {
  application_id: string;
  submitted_at: string;
  application_type: AppType;
  status: AppStatus;
  pdf_url: string;
  profile: {
    school_name: string;
    udise_number: string;
    school_type: string;
    school_category: string;
    lowest_class: string;
    highest_class: string;
    district: string;
    mobile: string;
    email: string;
    address: string;
  };
  details: {
    lowest_class_start?: string;
    highest_class_operate?: string;
    board_affiliation?: string;
    academic_year?: string;
    recognition_number?: string;
    recognition_validity?: string;
    has_changes?: string;
    current_classes?: string;
    upgrade_to?: string;
    upgrade_reason?: string;
  };
  documents: {
    id: string;
    document_type: string;
    label: string;
    file_name: string;
    content_type: string;
    download_url: string;
    uploaded_at: string;
  }[];
  declaration: {
    signatory_name: string;
    designation: string;
    declared: boolean;
    submitted_at: string;
    application_id: string;
    status: AppStatus;
  };
}

interface Inspector {
  id: string;
  name: string;
  designation?: string;
  contact?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Authentication helpers
// ─────────────────────────────────────────────────────────────────────────────

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw)?.access_token ?? null;
  } catch {
    return null;
  }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants & UI Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  AppStatus,
  { color: string; bg: string; border: string; dot: string }
> = {
  "Pending Review": {
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  "Under Inspection": {
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  Approved: {
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
  },
  Rejected: {
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-400",
  },
  "Re-Inspection Required": {
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    dot: "bg-purple-400",
  },
  "Documents Requested": {
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    dot: "bg-orange-400",
  },
};

const APP_TYPE_CONFIG: Record<AppType, { color: string; bg: string; border: string }> = {
  "New Recognition": {
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  Renewal: {
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  Upgradation: {
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
};

const STATUS_OPTIONS: AppStatus[] = [
  "Pending Review",
  "Under Inspection",
  "Approved",
  "Rejected",
  "Documents Requested",
  "Re-Inspection Required",
];
const APP_TYPE_OPTIONS: AppType[] = ["New Recognition", "Renewal", "Upgradation"];

// Simple toast hook
function useToast() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(
    null
  );
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  return { toast, showToast: setToast };
}

// ─────────────────────────────────────────────────────────────────────────────
// Reusable Table Skeleton
// ─────────────────────────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="bg-white border border-neutral-200 rounded-2xl p-4 animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-neutral-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-neutral-100 rounded w-1/3" />
              <div className="h-3 bg-neutral-100 rounded w-1/4" />
            </div>
            <div className="w-20 h-6 bg-neutral-100 rounded-full" />
            <div className="w-24 h-8 bg-neutral-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reject Modal
// ─────────────────────────────────────────────────────────────────────────────
function RejectModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState("");
  const handleConfirm = () => {
    onConfirm(reason);
    setReason("");
  };
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-neutral-900">Reject Application</h3>
              <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-bold text-neutral-600 mb-1">
                Reason (optional)
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
                placeholder="Provide a reason for rejection..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-neutral-200 rounded-xl text-sm font-medium hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 size={14} className="animate-spin" />}
                Reject
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SchoolApplicationViewModal (integrated from original snippet, slightly adapted)
// ─────────────────────────────────────────────────────────────────────────────
const SIDEBAR_SECTIONS = [
  { id: "profile", label: "Profile Summary", icon: Building2 },
  { id: "details", label: "Application Details", icon: ClipboardList },
  { id: "documents", label: "Uploaded Documents", icon: Paperclip },
  { id: "declaration", label: "Declaration & Submission", icon: Shield },
];

function ReadField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
        {Icon && <Icon size={10} className="text-neutral-400" />}
        {label}
      </p>
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 font-medium min-h-[42px] flex items-center">
        {value || <span className="text-neutral-400">—</span>}
      </div>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-6 pb-4 border-b border-neutral-100">
      <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={18} className="text-primary-600" />
      </div>
      <div>
        <h3 className="text-base font-bold text-neutral-900">{title}</h3>
        {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AppStatus }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Pending Review"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${cfg.color} ${cfg.bg} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

function ProfileSummarySection({ data }: { data: ApplicationData["profile"] }) {
  return (
    <div>
      <SectionHeading icon={Building2} title="Profile Summary" subtitle="Institutional profile linked to this application (read-only)" />
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3 mb-6">
        <CheckCircle className="text-emerald-500 mt-0.5 shrink-0" size={16} />
        <div>
          <p className="text-sm font-bold text-emerald-800">Profile Linked Successfully</p>
          <p className="text-xs text-emerald-600 mt-0.5">
            Comprehensive institutional profile was automatically attached at time of submission.
          </p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <ReadField label="School Name" value={data.school_name} icon={Building2} />
        </div>
        <ReadField label="UDISE Code" value={data.udise_number} icon={Hash} />
        <ReadField label="District" value={data.district} icon={MapPin} />
        <ReadField label="School Type" value={data.school_type} icon={GraduationCap} />
        <ReadField label="School Category" value={data.school_category} icon={Users} />
        <ReadField label="Lowest Class" value={`Class ${data.lowest_class}`} icon={BookOpen} />
        <ReadField label="Highest Class" value={`Class ${data.highest_class}`} icon={BookOpen} />
        <ReadField label="Mobile Number" value={data.mobile} icon={Phone} />
        <ReadField label="Email Address" value={data.email} icon={Mail} />
        <div className="sm:col-span-2">
          <ReadField label="Address" value={data.address} icon={MapPin} />
        </div>
      </div>
    </div>
  );
}

function ApplicationDetailsSection({
  appType,
  details,
}: {
  appType: AppType;
  details: ApplicationData["details"];
}) {
  const typeCfg = APP_TYPE_CONFIG[appType];
  const bannerText = {
    "New Recognition":
      "This application is for obtaining first-time recognition for a new school from the Education Department.",
    Renewal:
      "This application is for renewing an existing recognition certificate before its expiry.",
    Upgradation:
      "This application is for upgrading the school to offer additional classes or levels.",
  }[appType];
  return (
    <div>
      <SectionHeading icon={ClipboardList} title="Application Details" subtitle="Specific details submitted for this application type" />
      <div className={`${typeCfg.bg} ${typeCfg.border} border rounded-xl p-4 mb-6`}>
        <div className="flex items-center gap-2 mb-1.5">
          <FileBadge size={15} className={typeCfg.color} />
          <span className={`text-sm font-bold ${typeCfg.color}`}>{appType}</span>
        </div>
        <p className={`text-xs ${typeCfg.color} opacity-80`}>{bannerText}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {appType === "New Recognition" && (
          <>
            <ReadField label="Lowest Class to Start" value={details.lowest_class_start ?? "—"} icon={BookOpen} />
            <ReadField label="Highest Class to Operate" value={details.highest_class_operate ?? "—"} icon={BookOpen} />
            <ReadField label="Board Affiliation Sought" value={details.board_affiliation ?? "—"} icon={Award} />
            <ReadField label="Academic Year Starting From" value={details.academic_year ?? "—"} icon={Calendar} />
          </>
        )}
        {appType === "Renewal" && (
          <>
            <ReadField label="Current Recognition Number" value={details.recognition_number ?? "—"} icon={Hash} />
            <ReadField label="Current Validity Upto" value={details.recognition_validity ?? "—"} icon={Calendar} />
            <div className="sm:col-span-2">
              <ReadField label="Changes Since Last Recognition" value={details.has_changes ?? "—"} icon={AlertCircle} />
            </div>
          </>
        )}
        {appType === "Upgradation" && (
          <>
            <ReadField label="Currently Recognised Classes" value={details.current_classes ?? "—"} icon={BookOpen} />
            <ReadField label="Applying to Upgrade To" value={details.upgrade_to ?? "—"} icon={ChevronRight} />
            <div className="sm:col-span-2">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                Primary Reason for Upgradation
              </p>
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 min-h-[80px]">
                {details.upgrade_reason || <span className="text-neutral-400">—</span>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DocumentsSection({ documents }: { documents: ApplicationData["documents"] }) {
  return (
    <div>
      <SectionHeading icon={Paperclip} title="Uploaded Documents" subtitle={`${documents.length} document${documents.length !== 1 ? "s" : ""} submitted with this application`} />
      {documents.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          <FolderOpen size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No documents uploaded.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc, i) => {
            const isPdf = doc.content_type === "application/pdf";
            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="border border-neutral-200 rounded-2xl p-4 bg-white hover:border-primary-200 hover:bg-primary-50/20 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isPdf ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                    }`}
                  >
                    {isPdf ? <FileText size={20} /> : <ImageIcon size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-neutral-800 truncate">{doc.label}</p>
                    <p className="text-xs text-neutral-500 mt-0.5 truncate">{doc.file_name}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          isPdf
                            ? "bg-red-50 text-red-600 border-red-100"
                            : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}
                      >
                        {isPdf ? "PDF" : "IMAGE"}
                      </span>
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Calendar size={10} /> {doc.uploaded_at}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => window.open(doc.download_url, "_blank")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
                    >
                      <Eye size={12} /> View
                    </button>
                    <a
                      href={doc.download_url}
                      download
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-200 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors"
                    >
                      <Download size={12} /> Download
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DeclarationSection({ decl }: { decl: ApplicationData["declaration"] }) {
  return (
    <div>
      <SectionHeading icon={Shield} title="Declaration & Submission" subtitle="Formal undertaking accepted by the authorised signatory" />
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <ReadField label="Authorised Signatory Name" value={decl.signatory_name} icon={UserCheck} />
        <ReadField label="Designation" value={decl.designation} icon={Stamp} />
        <ReadField label="Submitted At" value={decl.submitted_at} icon={Calendar} />
        <ReadField label="Application ID" value={decl.application_id} icon={Hash} />
        <div className="sm:col-span-2">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
            Declaration Status
          </p>
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
            {decl.declared ? (
              <>
                <CheckCircle size={15} className="text-emerald-500" />
                <span className="text-sm font-bold text-emerald-700">Declaration Formally Accepted</span>
              </>
            ) : (
              <>
                <XCircle size={15} className="text-red-500" />
                <span className="text-sm font-bold text-red-700">Declaration Not Accepted</span>
              </>
            )}
          </div>
        </div>
        <div className="sm:col-span-2">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
            Current Application Status
          </p>
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5">
            <StatusBadge status={decl.status} />
          </div>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={15} className="text-amber-600" />
          <p className="text-sm font-bold text-amber-800">Management Electronic Undertaking</p>
        </div>
        <p className="text-xs leading-relaxed text-amber-800 text-justify">
          I/We hereby declare that all information attached from our Institutional Profile and provided in this
          application form is true and correct to the best of my/our knowledge and belief. I/We understand that
          any false information or suppression of facts may result in the rejection of this application and/or
          cancellation of recognition already granted. I/We agree to abide by all the rules, regulations and
          orders formulated by the Education Department, Government of Maharashtra, from time to time.
        </p>
        {decl.declared && (
          <div className="mt-3 pt-3 border-t border-amber-100 flex items-center gap-2">
            <CheckCircle size={12} className="text-emerald-600" />
            <p className="text-xs font-semibold text-emerald-700">
              Accepted by <strong>{decl.signatory_name}</strong> ({decl.designation}) on {decl.submitted_at}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Admin Action Bar for modal (kept as original but simplified for brevity)
function AdminActionBar({
  schoolId,
  currentStatus,
  onActionComplete,
}: {
  schoolId: string;
  currentStatus: AppStatus;
  onActionComplete: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const updateStatus = async (status: string, remarks?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/applications/${schoolId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ status, remarks: remarks || "" }),
      });
      if (!res.ok) throw new Error(await res.text());
      onActionComplete();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleApprove = () => updateStatus("Approved");
  const handleReject = () => {
    const remarks = prompt("Optional rejection reason:", "");
    if (remarks !== null) updateStatus("Rejected", remarks);
  };
  return (
    <div className="sticky bottom-0 bg-white border-t border-neutral-100 px-6 py-4 flex flex-wrap items-center gap-3">
      <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mr-2">Admin Actions:</p>
      <button
        onClick={handleApprove}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm transition-all disabled:opacity-50"
      >
        {isLoading ? <Loader2 size={13} className="animate-spin" /> : <ThumbsUp size={13} />} Approve
      </button>
      <button
        onClick={handleReject}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-sm transition-all disabled:opacity-50"
      >
        <ThumbsDown size={13} /> Reject
      </button>
      <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-700 text-xs font-bold hover:bg-neutral-50 transition-all ml-auto">
        <Download size={13} /> Download Full PDF
      </button>
    </div>
  );
}

function SchoolApplicationViewModal({
  isOpen,
  onClose,
  schoolId,
}: {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
}) {
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("profile");

  const fetchApplication = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/applications/${schoolId}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setApplication(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && schoolId) {
      fetchApplication();
    }
  }, [isOpen, schoolId]);

  const renderSection = () => {
    if (!application) return null;
    switch (activeSection) {
      case "profile":
        return <ProfileSummarySection data={application.profile} />;
      case "details":
        return <ApplicationDetailsSection appType={application.application_type} details={application.details} />;
      case "documents":
        return <DocumentsSection documents={application.documents} />;
      case "declaration":
        return <DeclarationSection decl={application.declaration} />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-4 md:inset-8 lg:inset-12 z-50 bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            style={{ maxWidth: 1100, margin: "auto" }}
          >
            <div className="shrink-0 px-6 pt-5 pb-4 border-b border-neutral-100 bg-white">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={32} className="animate-spin text-primary-500" />
                  <span className="ml-3 text-neutral-600">Loading application...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-between">
                  <div className="text-red-600 flex items-center gap-2">
                    <AlertCircle size={20} /> {error}
                  </div>
                  <button
                    onClick={fetchApplication}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 text-sm"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                application && (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0">
                        <Building2 size={22} className="text-primary-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-neutral-900 leading-tight">
                          {application.profile.school_name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {application.profile.udise_number !== "—" && (
                            <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-lg font-mono font-medium">
                              UDISE: {application.profile.udise_number}
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              APP_TYPE_CONFIG[application.application_type]?.color
                            } ${APP_TYPE_CONFIG[application.application_type]?.bg} ${
                              APP_TYPE_CONFIG[application.application_type]?.border
                            }`}
                          >
                            <FileCheck size={11} /> {application.application_type}
                          </span>
                          <StatusBadge status={application.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <span className="text-xs text-neutral-500 flex items-center gap-1">
                            <Hash size={10} /> {application.application_id}
                          </span>
                          <span className="text-xs text-neutral-500 flex items-center gap-1">
                            <Calendar size={10} /> Submitted: {application.submitted_at}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                      >
                        <X size={17} />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
            {!loading && !error && application && (
              <div className="flex flex-1 min-h-0">
                <div className="w-56 shrink-0 border-r border-neutral-100 bg-neutral-50 py-4 px-3 flex flex-col gap-1">
                  {SIDEBAR_SECTIONS.map((s) => {
                    const isActive = activeSection === s.id;
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left w-full ${
                          isActive
                            ? "bg-white shadow-sm text-primary-700 border border-primary-100"
                            : "text-neutral-600 hover:bg-white hover:text-neutral-800"
                        }`}
                      >
                        <Icon size={15} className={isActive ? "text-primary-600" : "text-neutral-400"} />
                        {s.label}
                        {isActive && <ChevronRight size={12} className="ml-auto text-primary-400" />}
                      </button>
                    );
                  })}
                  <div className="mt-auto pt-4 border-t border-neutral-200 space-y-2 px-1">
                    <div
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${
                        STATUS_CONFIG[application.status]?.bg || "bg-gray-50"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${STATUS_CONFIG[application.status]?.dot || "bg-gray-400"}`}
                      />
                      <span className={`text-[11px] font-bold ${STATUS_CONFIG[application.status]?.color || "text-gray-700"}`}>
                        {application.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 px-2">{application.application_id}</p>
                  </div>
                </div>
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    <motion.div
                      key={activeSection}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {renderSection()}
                    </motion.div>
                  </div>
                  <AdminActionBar schoolId={schoolId} currentStatus={application.status} onActionComplete={fetchApplication} />
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Admin Applications Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [page, setPage] = useState(1);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectSchoolId, setRejectSchoolId] = useState<string | null>(null);
  const [rejectLoading, setRejectLoading] = useState(false);
  const { toast, showToast } = useToast();
  const itemsPerPage = 10;

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/applications`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      // Expecting array directly or under 'applications' key
      const apps = Array.isArray(data) ? data : data.applications || [];
      setApplications(apps);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Filtering logic (client-side)
  const filteredApps = useMemo(() => {
    let filtered = [...applications];
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.school_name.toLowerCase().includes(lowerSearch) ||
          app.udise_number.toLowerCase().includes(lowerSearch)
      );
    }
    if (selectedStatus) {
      filtered = filtered.filter((app) => app.status === selectedStatus);
    }
    if (selectedType) {
      filtered = filtered.filter((app) => app.application_type === selectedType);
    }
    return filtered;
  }, [applications, search, selectedStatus, selectedType]);

  // Pagination
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = filteredApps.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, selectedStatus, selectedType]);

  const handleView = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    setShowApplicationModal(true);
  };

  const handleApprove = async (schoolId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/applications/${schoolId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
      });
      if (!res.ok) throw new Error(await res.text());
      showToast({ message: "Application approved successfully!", type: "success" });
      await fetchApplications();
    } catch (err: any) {
      showToast({ message: err.message, type: "error" });
    }
  };

  const openRejectModal = (schoolId: string) => {
    setRejectSchoolId(schoolId);
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectSchoolId) return;
    setRejectLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/applications/${rejectSchoolId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error(await res.text());
      showToast({ message: "Application rejected successfully!", type: "success" });
      await fetchApplications();
    } catch (err: any) {
      showToast({ message: err.message, type: "error" });
    } finally {
      setRejectLoading(false);
      setRejectModalOpen(false);
      setRejectSchoolId(null);
    }
  };

  // Desktop Table
  const DesktopTable = () => (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-wider">School</th>
            <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-wider">UDISE Code</th>
            <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-wider">District</th>
            <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-wider">Status</th>
            <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-wider">Application</th>
            <th className="pb-3 text-xs font-bold text-neutral-400 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedApps.map((app, idx) => (
            <motion.tr
              key={app.school_id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
            >
              <td className="py-4 pr-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
                    <Building2 size={16} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="font-bold text-neutral-800 text-sm">{app.school_name}</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Updated: {new Date(app.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </td>
              <td className="py-4 text-sm font-mono text-neutral-600">{app.udise_number}</td>
              <td className="py-4 text-sm text-neutral-600">{app.district}</td>
              <td className="py-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_CONFIG[app.status]?.bg} ${STATUS_CONFIG[app.status]?.border} ${STATUS_CONFIG[app.status]?.color}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[app.status]?.dot}`} />
                  {app.status}
                </span>
              </td>
              <td className="py-4">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${APP_TYPE_CONFIG[app.application_type]?.bg} ${APP_TYPE_CONFIG[app.application_type]?.border} ${APP_TYPE_CONFIG[app.application_type]?.color}`}
                >
                  {app.application_type}
                </span>
              </td>
              <td className="py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleView(app.school_id)}
                    className="p-2 rounded-lg text-neutral-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleApprove(app.school_id)}
                    className="p-2 rounded-lg text-neutral-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    title="Approve"
                  >
                    <ThumbsUp size={16} />
                  </button>
                  <button
                    onClick={() => openRejectModal(app.school_id)}
                    className="p-2 rounded-lg text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Reject"
                  >
                    <ThumbsDown size={16} />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Mobile Card View
  const MobileCards = () => (
    <div className="md:hidden space-y-3">
      {paginatedApps.map((app, idx) => (
        <motion.div
          key={app.school_id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-primary-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-neutral-800">{app.school_name}</p>
              <p className="text-xs text-neutral-500 mt-0.5">UDISE: {app.udise_number}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_CONFIG[app.status]?.bg} ${STATUS_CONFIG[app.status]?.border} ${STATUS_CONFIG[app.status]?.color}`}
                >
                  <span className={`w-1 h-1 rounded-full ${STATUS_CONFIG[app.status]?.dot}`} />
                  {app.status}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${APP_TYPE_CONFIG[app.application_type]?.bg} ${APP_TYPE_CONFIG[app.application_type]?.border} ${APP_TYPE_CONFIG[app.application_type]?.color}`}
                >
                  {app.application_type}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-2">District: {app.district}</p>
              <p className="text-[10px] text-neutral-400 mt-1">
                Updated: {new Date(app.updated_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleView(app.school_id)}
                className="p-2 rounded-lg text-neutral-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => handleApprove(app.school_id)}
                className="p-2 rounded-lg text-neutral-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
              >
                <ThumbsUp size={16} />
              </button>
              <button
                onClick={() => openRejectModal(app.school_id)}
                className="p-2 rounded-lg text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <ThumbsDown size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-neutral-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">School Applications</h1>
          <p className="text-neutral-500 mt-1">Manage and review all submitted recognition applications.</p>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input
                type="text"
                placeholder="Search by school name or UDISE code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-400 outline-none"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 border border-neutral-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary-200"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2.5 border border-neutral-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary-200"
            >
              <option value="">All Application Types</option>
              {APP_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setSearch("");
                setSelectedStatus("");
                setSelectedType("");
              }}
              className="px-4 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-4 text-sm text-neutral-500">
          Showing {paginatedApps.length} of {filteredApps.length} applications
        </div>

        {/* Loading / Error / Empty states */}
        {loading && <TableSkeleton />}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />
            <p className="text-red-700 font-medium">Failed to load applications</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={fetchApplications}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}
        {!loading && !error && filteredApps.length === 0 && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center">
            <FolderOpen className="mx-auto text-neutral-400 mb-3" size={48} />
            <p className="text-neutral-600 font-medium">No applications found</p>
            <p className="text-neutral-400 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Table / Cards */}
        {!loading && !error && filteredApps.length > 0 && (
          <>
            <DesktopTable />
            <MobileCards />
          </>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-neutral-200 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="text-sm text-neutral-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-neutral-200 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50"
            >
              Next <ChevronRightIcon size={16} />
            </button>
          </div>
        )}

        {/* Toast Notifications */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
                toast.type === "success"
                  ? "bg-emerald-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reject Modal */}
        <RejectModal
          isOpen={rejectModalOpen}
          onClose={() => {
            setRejectModalOpen(false);
            setRejectSchoolId(null);
          }}
          onConfirm={handleRejectConfirm}
          isLoading={rejectLoading}
        />

        {/* Application Detail Modal */}
        <SchoolApplicationViewModal
          isOpen={showApplicationModal}
          onClose={() => {
            setShowApplicationModal(false);
            setSelectedSchoolId(null);
          }}
          schoolId={selectedSchoolId || ""}
        />
      </div>
    </div>
  );
}