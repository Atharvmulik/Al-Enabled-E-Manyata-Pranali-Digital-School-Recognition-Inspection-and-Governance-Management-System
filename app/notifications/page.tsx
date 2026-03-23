"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  FiCalendar,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiCheck,
  FiBell,
} from "react-icons/fi";
import { API_BASE_URL } from "@/lib/api";

// ─── Change to logged-in school's ID (from auth/session) ──────────────────────
const SCHOOL_ID = "school_001";

// ─── Types ─────────────────────────────────────────────────────────────────────

type NotificationType = "info" | "warning" | "success";

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: NotificationType;
  read: boolean;
}

interface NotificationsPageResponse {
  notifications: Notification[];
  unread_count: number;
}

// ─── API Functions ──────────────────────────────────────────────────────────────

async function fetchNotifications(schoolId: string): Promise<NotificationsPageResponse> {
  const res = await fetch(`${API_BASE_URL}/notifications/${schoolId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err?.detail ?? `Error ${res.status}`);
  }
  return res.json();
}

async function markOneRead(schoolId: string, notifId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/notifications/${schoolId}/${notifId}/read`, {
    method: "POST",
  });
}

async function markAllRead(schoolId: string): Promise<void> {
  await fetch(`${API_BASE_URL}/notifications/${schoolId}/mark-all-read`, {
    method: "POST",
  });
}

// ─── Style config ──────────────────────────────────────────────────────────────

const typeConfig: Record<
  NotificationType,
  { icon: React.ElementType; color: string; bg: string; border: string }
> = {
  info: {
    icon: FiInfo,
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  warning: {
    icon: FiAlertCircle,
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  success: {
    icon: FiCheckCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
};

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-neutral-200 rounded-lg ${className ?? ""}`} />
  );
}

function NotificationSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
      <div className="flex items-start gap-4">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-24 mt-1" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  // ── Load on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchNotifications(SCHOOL_ID)
      .then((data) => {
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Mark single as read (optimistic) ──────────────────────────────────────
  const handleMarkOneRead = async (notif: Notification) => {
    if (notif.read) return;
    // optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    // fire and forget — read state doesn't need rollback
    await markOneRead(SCHOOL_ID, notif.id).catch(() => {});
  };

  // ── Mark all as read (optimistic) ─────────────────────────────────────────
  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    setMarkingAllRead(true);
    // optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    await markAllRead(SCHOOL_ID).catch(() => {});
    setMarkingAllRead(false);
  };

  // ─── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8 rounded-2xl bg-red-50 border border-red-100 text-red-700">
          <p className="font-semibold">Failed to load notifications</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Notifications</h1>
          <p className="text-neutral-500 mt-1">
            {loading
              ? "Loading…"
              : unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {!loading && unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors disabled:opacity-50"
          >
            <FiCheck size={16} />
            {markingAllRead ? "Marking…" : "Mark All as Read"}
          </button>
        )}
      </div>

      {/* ── List ── */}
      <div className="space-y-4">

        {/* Skeletons while loading */}
        {loading && [...Array(5)].map((_, i) => <NotificationSkeleton key={i} />)}

        {/* Empty state */}
        {!loading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
              <FiBell size={28} className="text-neutral-300" />
            </div>
            <p className="text-neutral-400 font-medium">No notifications yet.</p>
          </div>
        )}

        {/* Notification cards */}
        {!loading &&
          notifications.map((n) => {
            const config = typeConfig[n.type] ?? typeConfig.info;
            const Icon   = config.icon;

            return (
              <div
                key={n.id}
                className={`bg-white rounded-2xl shadow-sm border p-5 transition-all duration-300 ${
                  n.read
                    ? "border-neutral-100 opacity-70"
                    : `${config.border} border-l-4`
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl ${config.bg} shrink-0`}>
                    <Icon size={20} className={config.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-neutral-800">{n.title}</h3>
                      {!n.read && (
                        <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-neutral-600 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1 text-xs text-neutral-400">
                        <FiCalendar size={12} /> {n.date}
                      </span>
                      {!n.read && (
                        <button
                          onClick={() => handleMarkOneRead(n)}
                          className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </DashboardLayout>
  );
}