"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiUpload,
  FiRefreshCw,
} from "react-icons/fi";
import { API_BASE_URL } from "@/lib/api";

// ─── Change to logged-in school's ID (from auth/session) ──────────────────────

// ─── Types ─────────────────────────────────────────────────────────────────────

type TimelineStepStatus = "done" | "current" | "pending";

interface TimelineStep {
  step: string;
  label: string;
  date: string;
  status: TimelineStepStatus;
  detail: string;
}

interface RemarkResponse {
  id: string;
  author: string;
  message: string;
  is_urgent: boolean;
  created_at: string;
}

interface PendingActionResponse {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  severity: "high" | "medium";
  resolved: boolean;
  created_at: string;
}

interface StatusPageResponse {
  application_id: string;
  application_type: string;
  submitted_on?: string;
  current_status: string;
  timeline: TimelineStep[];
  remarks: RemarkResponse[];
  pending_actions: PendingActionResponse[];
}

// ─── API Functions ──────────────────────────────────────────────────────────────

async function fetchStatusPage(schoolId: string): Promise<StatusPageResponse> {
  const res = await fetch(`${API_BASE_URL}/status/${schoolId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err?.detail ?? `Error ${res.status}`);
  }
  return res.json();
}

async function fetchTimeline(schoolId: string): Promise<TimelineStep[]> {
  const res = await fetch(`${API_BASE_URL}/status/${schoolId}/timeline`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err?.detail ?? `Error ${res.status}`);
  }
  return res.json();
}

async function resolveAction(
  schoolId: string,
  actionId: string
): Promise<PendingActionResponse> {
  const res = await fetch(
    `${API_BASE_URL}/status/${schoolId}/pending-actions/${actionId}/resolve`,
    { method: "PATCH" }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err?.detail ?? `Error ${res.status}`);
  }
  return res.json();
}

// ─── Style helpers ──────────────────────────────────────────────────────────────

const appStatusStyle: Record<string, string> = {
  Draft: "bg-neutral-100 text-neutral-600",
  "Under Review": "bg-amber-50 text-amber-700",
  "Under Inspection": "bg-blue-50 text-blue-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
};

function formatDate(iso?: string | null): string {
  if (!iso || iso === "--") return "--";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-neutral-200 rounded-lg ${className ?? ""}`} />
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function StatusPage() {
  const [data, setData] = useState<StatusPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [resolving, setResolving] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);



  useEffect(() => {
    const raw = localStorage.getItem("user");

    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);
    setSchoolId(parsed.user_id);
    setToken(parsed.access_token);

    setIsReady(true);
  }, []);

  // ── Initial full-page load ─────────────────────────────────────────────────
  useEffect(() => {
    if (!schoolId) return;

    fetchStatusPage(schoolId)
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [schoolId]);

  // ── Timeline-only refresh (lightweight) ────────────────────────────────────
  const handleRefreshTimeline = useCallback(async () => {
    setRefreshing(true);
    try {
      const updated = await fetchTimeline(schoolId as string);
      setData((prev) => (prev ? { ...prev, timeline: updated } : prev));
    } catch {
      // silently ignore poll errors
    } finally {
      setRefreshing(false);
    }
  }, []);

  // ── Resolve action — optimistic UI ─────────────────────────────────────────
  const handleResolve = async (actionId: string) => {
    setResolving(actionId);
    // optimistic: mark resolved immediately
    setData((prev) =>
      prev
        ? {
          ...prev,
          pending_actions: prev.pending_actions.map((a) =>
            a.id === actionId ? { ...a, resolved: true } : a
          ),
        }
        : prev
    );
    try {
      await resolveAction(schoolId as string, actionId);
    } catch (err) {
      // roll back on failure
      setData((prev) =>
        prev
          ? {
            ...prev,
            pending_actions: prev.pending_actions.map((a) =>
              a.id === actionId ? { ...a, resolved: false } : a
            ),
          }
          : prev
      );
      alert((err as Error).message);
    } finally {
      setResolving(null);
    }
  };

  // ─── Derived ──────────────────────────────────────────────────────────────────
  const unresolvedActions = data?.pending_actions.filter((a) => !a.resolved) ?? [];

  // ─── Error state ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8 rounded-2xl bg-red-50 border border-red-100 text-red-700">
          <p className="font-semibold">Failed to load application status</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!isReady) return null;
  if (!schoolId || !token) return <div>Please login</div>;

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Application Status</h1>
        <p className="text-neutral-500 mt-1">
          Track your application progress in real time
        </p>
      </div>

      {/* ── Application Info Cards ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading
          ? [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5"
            >
              <Skeleton className="h-3 w-28 mb-3" />
              <Skeleton className="h-5 w-36" />
            </div>
          ))
          : [
            { label: "Application ID", value: data?.application_id ?? "—" },
            { label: "Application Type", value: data?.application_type ?? "—" },
            { label: "Submitted On", value: formatDate(data?.submitted_on) },
            {
              label: "Current Status",
              value: data?.current_status ?? "—",
              badge: true,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5"
            >
              <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">
                {item.label}
              </p>
              {item.badge ? (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full ${appStatusStyle[item.value] ?? appStatusStyle["Draft"]
                    }`}
                >
                  {item.value === "Under Review" && (
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                  )}
                  {item.value}
                </span>
              ) : (
                <p className="text-sm font-semibold text-neutral-800">{item.value}</p>
              )}
            </div>
          ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Timeline ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-neutral-800">Progress Timeline</h2>
            <button
              onClick={handleRefreshTimeline}
              disabled={refreshing || loading}
              className="flex items-center gap-1.5 text-xs text-primary-600 font-semibold hover:text-primary-700 disabled:opacity-40 transition-colors"
            >
              <FiRefreshCw
                size={13}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="space-y-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                  <div className="flex-1 pt-1.5 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              {(data?.timeline ?? []).map((step, i) => (
                <div key={step.step} className="flex gap-4 mb-8 last:mb-0">
                  {/* Step icon + connector line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${step.status === "done"
                        ? "bg-emerald-100 text-emerald-600"
                        : step.status === "current"
                          ? "bg-primary-100 text-primary-600 ring-4 ring-primary-50"
                          : "bg-neutral-100 text-neutral-400"
                        }`}
                    >
                      {step.status === "done" ? (
                        <FiCheckCircle size={18} />
                      ) : step.status === "current" ? (
                        <FiClock size={18} />
                      ) : (
                        <FiAlertCircle size={18} />
                      )}
                    </div>
                    {i < (data?.timeline.length ?? 0) - 1 && (
                      
                      <div
                      
                        className={`w-0.5 h-full min-h-[40px] mt-2 ${step.status === "done"
                            ? "bg-emerald-300"
                            : "bg-neutral-200"
                          }`}
                      />
                    )}
                  </div>

                  {/* Step text */}
                  <div className="pt-1.5 pb-2">
                    <h3
                      className={`text-sm font-bold ${step.status === "current"
                        ? "text-primary-700"
                        : step.status === "done"
                          ? "text-neutral-800"
                          : "text-neutral-400"
                        }`}
                    >
                      {step.label}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {formatDate(step.date)}
                    </p>
                    <p className="text-sm text-neutral-500 mt-1">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-6">

          {/* Remarks */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
            <h2 className="text-lg font-bold text-neutral-800 mb-4">Remarks</h2>

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            ) : (data?.remarks ?? []).length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-4">No remarks yet.</p>
            ) : (
              <div className="space-y-3">
                {data?.remarks.map((remark) => (
                  <div
                    key={remark.id}
                    className={`rounded-xl p-4 border ${remark.is_urgent
                      ? "bg-amber-50 border-amber-200"
                      : "bg-neutral-50 border-neutral-100"
                      }`}
                  >
                    <p
                      className={`text-sm ${remark.is_urgent ? "text-amber-800" : "text-neutral-700"
                        }`}
                    >
                      <strong>{remark.author}:</strong> {remark.message}
                    </p>
                    <p
                      className={`text-xs mt-2 ${remark.is_urgent ? "text-amber-600" : "text-neutral-400"
                        }`}
                    >
                      {timeAgo(remark.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
            <h2 className="text-lg font-bold text-neutral-800 mb-4">Pending Actions</h2>

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : unresolvedActions.length === 0 ? (
              <div className="flex flex-col items-center py-4 gap-2">
                <FiCheckCircle size={28} className="text-emerald-400" />
                <p className="text-sm text-neutral-400">No pending actions.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {unresolvedActions.map((action) => (
                  <li
                    key={action.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${action.severity === "high"
                      ? "bg-red-50 border-red-100"
                      : "bg-amber-50 border-amber-100"
                      }`}
                  >
                    <FiUpload
                      className={`shrink-0 mt-0.5 ${action.severity === "high"
                        ? "text-red-500"
                        : "text-amber-500"
                        }`}
                      size={18}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${action.severity === "high"
                          ? "text-red-800"
                          : "text-amber-800"
                          }`}
                      >
                        {action.title}
                      </p>
                      {action.description && (
                        <p
                          className={`text-xs mt-0.5 ${action.severity === "high"
                            ? "text-red-600"
                            : "text-amber-600"
                            }`}
                        >
                          {action.description}
                        </p>
                      )}
                      {action.due_date && (
                        <p
                          className={`text-xs mt-0.5 ${action.severity === "high"
                            ? "text-red-500"
                            : "text-amber-500"
                            }`}
                        >
                          Due by {formatDate(action.due_date)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleResolve(action.id)}
                      disabled={resolving === action.id}
                      title="Mark as resolved"
                      className={`shrink-0 text-xs font-semibold hover:underline disabled:opacity-50 transition-opacity ${action.severity === "high"
                        ? "text-red-600"
                        : "text-amber-600"
                        }`}
                    >
                      {resolving === action.id ? "…" : "Resolve"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}