"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiFileText,
  FiActivity,
  FiAward,
  FiUser,
  FiArrowRight,
  FiClipboard,
  FiClock,
  FiBell,
} from "react-icons/fi";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type ApplicationStatus = "Draft" | "Submitted" | "Under Review" | "Approved" | "Rejected";
type InspectionStatus = "Pending" | "Scheduled" | "Completed" | "Failed";
type CertificateStatus = "Not Issued" | "Issued" | "Expired" | "Revoked";

interface StoredUser {
  user_id: string;
  email: string;
  role: string;
  full_name?: string;
  school_name?: string;
  udise_number?: string;
  access_token: string;
}

interface ProfileCompletionResponse {
  school_id: string;
  completion_percentage: number;
  sections: Record<string, boolean>;
}

interface ApplicationResponse {
  application_id: string;
  school_id: string;
  status: ApplicationStatus;
  submitted_on?: string;
  last_updated?: string;
  notes?: string;
}

interface NotificationResponse {
  id: string;
  text: string;
  icon_type: string;
  time_ago: string;
  color_variant: string;
  is_read: boolean;
  created_at?: string;
}

interface InspectionResponse {
  school_id: string;
  status: InspectionStatus;
  scheduled_date?: string;
  completed_date?: string;
  inspector_name?: string;
  remarks?: string;
}

interface CertificateResponse {
  school_id: string;
  status: CertificateStatus;
  certificate_id?: string;
  issued_on?: string;
  valid_until?: string;
  download_url?: string;
}

interface DashboardSummaryResponse {
  school_id: string;
  school_name: string;
  profile_completion: ProfileCompletionResponse;
  application?: ApplicationResponse;
  inspection: InspectionResponse;
  certificate: CertificateResponse;
  recent_notifications: NotificationResponse[];
}

// ─── API calls ────────────────────────────────────────────────────────────────

async function fetchDashboardSummary(
  schoolId: string,
  token: string
): Promise<DashboardSummaryResponse> {
  const res = await fetch(`${API_BASE_URL}/dashboard/${schoolId}/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (res.status === 401) {
    localStorage.removeItem("user");
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err?.detail ?? `Error ${res.status}`);
  }
  return res.json();
}

async function fetchMarkNotificationRead(
  schoolId: string,
  notifId: string,
  token: string
): Promise<void> {
  await fetch(`${API_BASE_URL}/dashboard/${schoolId}/notifications/${notifId}/read`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const appStatusStyle: Record<string, string> = {
  Draft: "bg-neutral-100 text-neutral-600",
  Submitted: "bg-blue-50 text-blue-700",
  "Under Review": "bg-amber-50 text-amber-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
};

const inspectionStyle: Record<string, { bg: string; icon: string }> = {
  Pending: { bg: "bg-amber-50", icon: "text-amber-500" },
  Scheduled: { bg: "bg-blue-50", icon: "text-blue-500" },
  Completed: { bg: "bg-emerald-50", icon: "text-emerald-500" },
  Failed: { bg: "bg-red-50", icon: "text-red-500" },
};

const certStyle: Record<string, { bg: string; icon: string }> = {
  "Not Issued": { bg: "bg-neutral-100", icon: "text-neutral-400" },
  Issued: { bg: "bg-emerald-50", icon: "text-emerald-500" },
  Expired: { bg: "bg-red-50", icon: "text-red-500" },
  Revoked: { bg: "bg-red-50", icon: "text-red-500" },
};

const notifColorMap: Record<string, string> = {
  blue: "text-blue-500 bg-blue-50",
  amber: "text-amber-500 bg-amber-50",
  red: "text-red-500 bg-red-50",
  green: "text-emerald-500 bg-emerald-50",
  bell: "text-purple-500 bg-purple-50",
};

// ─── Small helpers ────────────────────────────────────────────────────────────

function NotifIcon({ iconType }: { iconType: string }) {
  switch (iconType) {
    case "clipboard": return <FiClipboard size={14} />;
    case "alert": return <FiAlertCircle size={14} />;
    case "user": return <FiUser size={14} />;
    case "award": return <FiAward size={14} />;
    default: return <FiBell size={14} />;
  }
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-neutral-200 rounded-lg ${className ?? ""}`} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();

  // ── Auth state — populated after guard check ─────────────────────────────
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [isClient, setIsClient] = useState(false);

  // ── Dashboard data ────────────────────────────────────────────────────────
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Step 1: Auth guard ────────────────────────────────────────────────────
  // Runs once on mount. Reads localStorage, validates role, sets currentUser.
  useEffect(() => {
    setIsClient(true);
  }, []);


  useEffect(() => {
    if (!isClient) return;

    try {
      const raw = localStorage.getItem("user");

      if (!raw) {
        router.replace("/login");
        return;
      }

      const parsed: StoredUser = JSON.parse(raw);

      if (!parsed.user_id || !parsed.access_token || parsed.role !== "school") {
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }

      setCurrentUser(parsed);
    } catch {
      router.replace("/login");
    }
  }, [router, isClient]);

  // ── Step 2: Fetch dashboard data once user is confirmed ───────────────────
  // Depends on currentUser — won't run until auth guard sets it.
  useEffect(() => {
    if (!currentUser) return;

    fetchDashboardSummary(currentUser.user_id, currentUser.access_token)
      .then(setData)
      .catch((err: any) => {
        if (err.message === "Unauthorized") {
          router.replace("/login");
          return;
        }
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [currentUser]);

  // ── Mark notification read + optimistic UI update ─────────────────────────
  const handleNotifClick = async (notif: NotificationResponse) => {
    if (notif.is_read || !currentUser) return;

    // Optimistic update — mark as read in UI immediately
    setData((prev) =>
      prev
        ? {
          ...prev,
          recent_notifications: prev.recent_notifications.map((n) =>
            n.id === notif.id ? { ...n, is_read: true } : n
          ),
        }
        : prev
    );

    // Sync with backend (fire-and-forget; failures are silent)
    await fetchMarkNotificationRead(
      currentUser.user_id,
      notif.id,
      currentUser.access_token
    ).catch(() => { });
  };

  // ── Derived display values ────────────────────────────────────────────────

  const sectionOrder = [
    "basic_details",
    "location",
    "infrastructure",
    "staff",
    "safety",
  ];
  const profileSections = data
    ? sectionOrder.map((label) => ({
      label,
      done: data.profile_completion.sections[label] ?? false,
    }))
    : [];

  const completionPct = data?.profile_completion.completion_percentage ?? 0;

  const appStatus = data?.application?.status ?? null;
  const appId = data?.application?.application_id ?? "—";
  const appDate = data?.application?.submitted_on
    ? new Date(data.application.submitted_on).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    })
    : "—";

  const inspStatus = data?.inspection.status ?? "Pending";
  const insp = inspectionStyle[inspStatus] ?? inspectionStyle["Pending"];
  const inspDate = data?.inspection.scheduled_date ?? "Not Scheduled";

  const certStatus = data?.certificate.status ?? "Not Issued";
  const cert = certStyle[certStatus] ?? certStyle["Not Issued"];
  const certSub =
    certStatus === "Issued"
      ? `Valid until ${data?.certificate.valid_until ?? "—"}`
      : "Complete profile & inspection first";

  // ── Don't render anything until auth guard resolves ───────────────────────
  if (!isClient) return null;
  if (!currentUser) return null;

  const labelMap: Record<string, string> = {
    basic_details: "Basic Details",
    location: "Location Details",
    infrastructure: "Infrastructure",
    staff: "Staff Details",
    safety: "Safety Documents",
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>

      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">
          {loading
            ? <Skeleton className="h-8 w-72" />
            : `Welcome, ${data?.school_name ?? currentUser.school_name ?? "Your School"}`}
        </h1>
        <p className="text-neutral-500 mt-1">
          Manage your school profile, applications, and certificates
        </p>

        {/* Error banner */}
        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            <FiAlertCircle size={16} className="shrink-0" />
            <span>
              Could not load dashboard:{" "}
              <span className="font-semibold">{error}</span>.{" "}
              Check your <code className="font-mono text-xs">API_BASE_URL</code> in{" "}
              <code className="font-mono text-xs">api.ts</code>.
            </span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Complete Profile", icon: FiUser, href: "/profile", color: "from-blue-500 to-blue-700" },
          { label: "Submit Application", icon: FiFileText, href: "/registration", color: "from-emerald-500 to-emerald-700" },
          { label: "Track Status", icon: FiActivity, href: "/status", color: "from-amber-500 to-amber-700" },
          { label: "View Certificates", icon: FiAward, href: "/certificates", color: "from-purple-500 to-purple-700" },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group relative overflow-hidden rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.color}`} />
            <div className="relative z-10">
              <action.icon size={28} className="mb-3 opacity-90" />
              <p className="text-sm font-semibold">{action.label}</p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-500" />
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">

        {/* Profile Completion */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-800">Profile Completion</h2>
            {loading
              ? <Skeleton className="h-5 w-10" />
              : <span className="text-sm font-semibold text-primary-600">{completionPct}%</span>}
          </div>

          <div className="w-full h-3 bg-neutral-100 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-1000"
              style={{ width: loading ? "0%" : `${completionPct}%` }}
            />
          </div>

          {loading ? (
            <ul className="space-y-3 mb-6">
              {[...Array(5)].map((_, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-4 w-40" />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-3 mb-6">
              {profileSections.map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  {item.done
                    ? <FiCheckCircle className="text-emerald-500 shrink-0" size={18} />
                    : <FiAlertCircle className="text-amber-500 shrink-0" size={18} />}
                  <span className={`text-sm ${item.done ? "text-neutral-600" : "text-neutral-800 font-medium"}`}>

                    {labelMap[item.label] || item.label}

                    {!item.done && (
                      <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/profile"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/20"
          >
            Complete Profile <FiArrowRight size={16} />
          </Link>
        </div>

        {/* Application Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <h2 className="text-lg font-bold text-neutral-800 mb-4">Application Status</h2>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-24 mb-1" />
                  <Skeleton className="h-5 w-36" />
                </div>
              ))}
            </div>
          ) : !data?.application ? (
            <p className="text-sm text-neutral-400 py-4 text-center">
              No application submitted yet.
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wider">Application ID</p>
                <p className="text-sm font-semibold text-neutral-800 mt-0.5">{appId}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wider">Status</p>
                <span className={`inline-flex items-center gap-1.5 mt-1 px-3 py-1 text-xs font-semibold rounded-full ${appStatusStyle[appStatus!] ?? "bg-neutral-100 text-neutral-600"}`}>
                  {appStatus === "Under Review" && (
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                  )}
                  {appStatus}
                </span>
              </div>
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wider">Submitted On</p>
                <p className="text-sm font-semibold text-neutral-800 mt-0.5">{appDate}</p>
              </div>
            </div>
          )}

          <Link
            href="/status"
            className="mt-5 inline-flex items-center gap-1 text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors"
          >
            View Details <FiArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Notifications */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-800">Notifications</h2>
            <Link href="/notifications" className="text-xs text-primary-600 font-semibold hover:text-primary-700">
              View All
            </Link>
          </div>

          {loading ? (
            <ul className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <li key={i} className="flex items-start gap-3 p-3">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </li>
              ))}
            </ul>
          ) : data?.recent_notifications.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-6">No notifications yet.</p>
          ) : (
            <ul className="space-y-3">
              {data?.recent_notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => handleNotifClick(n)}
                  className={`flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer ${!n.is_read ? "ring-1 ring-primary-100" : ""}`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${notifColorMap[n.color_variant] ?? notifColorMap["bell"]}`}>
                    <NotifIcon iconType={n.icon_type} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-neutral-700 leading-snug">{n.text}</p>
                    <p className="text-xs text-neutral-400 mt-1">{n.time_ago}</p>
                  </div>
                  {!n.is_read && (
                    <span className="mt-1 w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Inspection Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <h2 className="text-lg font-bold text-neutral-800 mb-4">Inspection Status</h2>

          {loading ? (
            <div className="flex flex-col items-center py-6 gap-3">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <div className={`w-16 h-16 rounded-full ${insp.bg} flex items-center justify-center mb-4`}>
                <FiClock size={28} className={insp.icon} />
              </div>
              <p className="font-semibold text-neutral-800">{inspStatus}</p>
              <p className="text-sm text-neutral-400 mt-1">
                {inspStatus === "Scheduled" || inspStatus === "Completed"
                  ? `Date: ${inspDate}`
                  : "Inspection Date: Not Scheduled"}
              </p>
              {data?.inspection.inspector_name && (
                <p className="text-xs text-neutral-400 mt-0.5">
                  Inspector: {data.inspection.inspector_name}
                </p>
              )}
            </div>
          )}

          <Link
            href="/inspection"
            className="w-full inline-flex items-center justify-center gap-1 text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors"
          >
            View Details <FiArrowRight size={14} />
          </Link>
        </div>

        {/* Certificate Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <h2 className="text-lg font-bold text-neutral-800 mb-4">Certificate Status</h2>

          {loading ? (
            <div className="flex flex-col items-center py-6 gap-3">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <div className={`w-16 h-16 rounded-full ${cert.bg} flex items-center justify-center mb-4`}>
                <FiAward size={28} className={cert.icon} />
              </div>
              <p className="font-semibold text-neutral-800">{certStatus}</p>
              <p className="text-sm text-neutral-400 mt-1 text-center">{certSub}</p>
              {certStatus === "Issued" && data?.certificate.download_url && (
                <a
                  href={data.certificate.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-xs text-emerald-600 font-semibold hover:underline"
                >
                  Download Certificate ↓
                </a>
              )}
            </div>
          )}

          <Link
            href="/certificates"
            className="w-full inline-flex items-center justify-center gap-1 text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors"
          >
            View Details <FiArrowRight size={14} />
          </Link>
        </div>

      </div>
    </DashboardLayout>
  );
}