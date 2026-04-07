"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiFileText,
} from "react-icons/fi";
import { API_BASE_URL } from "@/lib/api";


type InspectionStatus  = "Scheduled" | "In Progress" | "Completed" | "Cancelled";
type ChecklistStatus   = "Satisfactory" | "Needs Improvement" | "Not Checked";
type OverallResult     = "Pending" | "Passed" | "Failed" | "Deferred";

interface InspectionDetail {
  inspection_id: string;
  school_id: string;
  date?: string;
  time?: string;
  officer_name?: string;
  status: InspectionStatus;
}

interface ChecklistItem {
  item: string;
  status: ChecklistStatus;
}

interface InspectionReport {
  overall_result: OverallResult;
  remarks?: string;
}

interface InspectionPageResponse {
  details: InspectionDetail;
  checklist: ChecklistItem[];
  report: InspectionReport;
}

// ─── API Functions ──────────────────────────────────────────────────────────────

async function fetchInspectionPage(schoolId: string): Promise<InspectionPageResponse> {
  const res = await fetch(`${API_BASE_URL}/inspection/${schoolId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err?.detail ?? `Error ${res.status}`);
  }
  return res.json();
}

// ─── Style maps ─────────────────────────────────────────────────────────────────

const checklistStyle: Record<
  ChecklistStatus,
  { icon: React.ElementType; color: string; bg: string }
> = {
  Satisfactory: {
    icon: FiCheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  "Needs Improvement": {
    icon: FiAlertCircle,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  "Not Checked": {
    icon: FiXCircle,
    color: "text-neutral-400",
    bg: "bg-neutral-100",
  },
};

const inspectionStatusStyle: Record<InspectionStatus, { bg: string; text: string; dot: string }> = {
  Scheduled:    { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500"    },
  "In Progress":{ bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500"   },
  Completed:    { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Cancelled:    { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500"     },
};

const overallResultStyle: Record<OverallResult, { bg: string; text: string; icon: React.ElementType }> = {
  Pending:  { bg: "bg-amber-50",   text: "text-amber-700",   icon: FiClock         },
  Passed:   { bg: "bg-emerald-50", text: "text-emerald-700", icon: FiCheckCircle   },
  Failed:   { bg: "bg-red-50",     text: "text-red-700",     icon: FiXCircle       },
  Deferred: { bg: "bg-neutral-100",text: "text-neutral-600", icon: FiAlertCircle   },
};

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-neutral-200 rounded-lg ${className ?? ""}`} />
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function InspectionPage() {
  const [data, setData] = useState<InspectionPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");

    if (!raw) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    const user = JSON.parse(raw);
    const schoolId = user.user_id;

    fetchInspectionPage(schoolId)
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ─── Derived ──────────────────────────────────────────────────────────────────
  const details   = data?.details;
  const checklist = data?.checklist ?? [];
  const report    = data?.report;

  const inspStatus     = (details?.status ?? "Scheduled") as InspectionStatus;
  const statusStyle    = inspectionStatusStyle[inspStatus] ?? inspectionStatusStyle.Scheduled;
  const overallResult  = (report?.overall_result ?? "Pending") as OverallResult;
  const resultStyle    = overallResultStyle[overallResult] ?? overallResultStyle.Pending;
  const ResultIcon     = resultStyle.icon;

  // ─── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8 rounded-2xl bg-red-50 border border-red-100 text-red-700">
          <p className="font-semibold">Failed to load inspection data</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Inspection Information</h1>
        <p className="text-neutral-500 mt-1">View inspection details, checklist, and report</p>
      </div>

      {/* ── Inspection Detail Cards ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {loading
          ? [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5"
              >
                <Skeleton className="h-3 w-20 mb-3" />
                <Skeleton className="h-5 w-28" />
              </div>
            ))
          : [
              {
                label: "Inspection ID",
                value: details?.inspection_id ?? "—",
                icon: FiFileText,
                badge: false,
              },
              {
                label: "Date",
                value: details?.date ?? "—",
                icon: FiCalendar,
                badge: false,
              },
              {
                label: "Time",
                value: details?.time ?? "—",
                icon: FiClock,
                badge: false,
              },
              {
                label: "Officer",
                value: details?.officer_name ?? "—",
                icon: FiUser,
                badge: false,
              },
              {
                label: "Status",
                value: inspStatus,
                icon: FiAlertCircle,
                badge: true,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5"
              >
                <div className="flex items-center gap-2 mb-2 text-neutral-400">
                  <item.icon size={14} />
                  <p className="text-xs uppercase tracking-wider">{item.label}</p>
                </div>
                {item.badge ? (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full animate-pulse ${statusStyle.dot}`}
                    />
                    {item.value}
                  </span>
                ) : (
                  <p className="text-sm font-semibold text-neutral-800">{item.value}</p>
                )}
              </div>
            ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* ── Checklist ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <h2 className="text-lg font-bold text-neutral-800 mb-5">Inspection Checklist</h2>

          {loading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl border border-neutral-100"
                >
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-28 rounded-full" />
                </div>
              ))}
            </div>
          ) : checklist.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-8">
              No checklist items yet.
            </p>
          ) : (
            <div className="space-y-3">
              {checklist.map((c) => {
                const style = checklistStyle[c.status] ?? checklistStyle["Not Checked"];
                const Icon  = style.icon;
                return (
                  <div
                    key={c.item}
                    className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 hover:bg-neutral-50/50 transition-colors"
                  >
                    <span className="text-sm font-medium text-neutral-700">{c.item}</span>
                    <span
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${style.bg} ${style.color}`}
                    >
                      <Icon size={12} />
                      {c.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-6">

          {/* Inspection Report */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
            <h2 className="text-lg font-bold text-neutral-800 mb-4">Inspection Report</h2>

            {loading ? (
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-3 w-24 mb-2" />
                  <Skeleton className="h-8 w-28 rounded-full" />
                </div>
                <div>
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </div>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">
                    Overall Result
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-full ${resultStyle.bg} ${resultStyle.text}`}
                  >
                    <ResultIcon size={14} />
                    {overallResult}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-neutral-400 uppercase tracking-wider mb-2">
                    Remarks
                  </p>
                  <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      {report?.remarks ?? "No remarks available yet."}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Preparation Tips */}
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl border border-primary-100 p-6">
            <h3 className="text-sm font-bold text-primary-800 mb-2">📋 Preparation Tips</h3>
            <ul className="space-y-2 text-sm text-primary-700">
              {[
                "Keep all original documents ready for verification",
                "Ensure all fire safety equipment is functional",
                "Labs and library should be accessible",
                "Principal and key staff should be available",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <FiCheckCircle className="shrink-0 mt-0.5" size={14} />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}