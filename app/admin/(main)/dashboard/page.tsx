"use client";

import React, { useEffect, useState } from "react";
import {
    School,
    FileText,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type StoredUser = {
    user_id: string;
    email: string;
    role: string;
    access_token: string;
};

type DashboardStats = {
    total_schools: number;
    approved_recognitions: number;
    under_improvement: number;
};

type RecentInspection = {
    school_name: string;
    district: string;
    date: string;
    inspection_type: string;
    status: string;
};

type UrgentAction = {
    text: string;
    time_ago: string;
    type: "doc" | "insp" | "sys";
};

type DashboardData = {
    stats: DashboardStats;
    recent_inspections: RecentInspection[];
    urgent_actions: UrgentAction[];
};

// ─── Animation variants ───────────────────────────────────────────────────────

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [exportStatus, setExportStatus] = useState<"idle" | "generating" | "success">("idle");

    // ── Auth guard ──────────────────────────────────────────────────────────
    useEffect(() => {
        try {
            const raw = localStorage.getItem("user");
            if (!raw) { window.location.href = "/login"; return; }
            const parsed: StoredUser = JSON.parse(raw);
            if (!parsed.user_id || !parsed.access_token || parsed.role !== "admin") {
                localStorage.removeItem("user");
                window.location.href = "/login";
                return;
            } setCurrentUser(parsed);
        } catch {
            window.location.href = "/login";
        }
    }, []);

    // ── Fetch dashboard data ────────────────────────────────────────────────
    const fetchDashboard = async (token: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (res.status === 401) {
                localStorage.removeItem("user");
                window.location.href = "/login";
                return;
            }

            if (!res.ok) {
                throw new Error("Failed to load dashboard data");
            }
            const json: DashboardData = await res.json();
            setData(json);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) fetchDashboard(currentUser.access_token);
    }, [currentUser]);

    // ── Derived stat cards ──────────────────────────────────────────────────
    const statCards = data
        ? [
            {
                label: "Total Schools",
                value: data.stats.total_schools.toLocaleString(),
                change: "+12%",
                isPositive: true,
                icon: School,
                color: "blue",
            },
            {
                label: "Approved Recognitions",
                value: data.stats.approved_recognitions.toLocaleString(),
                change: "+18%",
                isPositive: true,
                icon: CheckCircle2,
                color: "emerald",
            },
            {
                label: "Under Improvement",
                value: data.stats.under_improvement.toLocaleString(),
                change: "-2%",
                isPositive: true,
                icon: AlertCircle,
                color: "rose",
            },
        ]
        : [];

    // ── Loading state ───────────────────────────────────────────────────────
    if (!currentUser || (loading && !data)) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Governance Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Real-time monitoring and administrative control overview.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Refresh */}
                    <button
                        onClick={() => currentUser && fetchDashboard(currentUser.access_token)}
                        disabled={loading}
                        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm disabled:opacity-40"
                        title="Refresh"
                    >
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    </button>

                    {/* Export report (UI only) */}
                    <button
                        onClick={() => {
                            setExportStatus("generating");
                            setTimeout(() => {
                                setExportStatus("success");
                                setTimeout(() => setExportStatus("idle"), 3000);
                            }, 2000);
                        }}
                        disabled={exportStatus !== "idle"}
                        className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        {exportStatus === "generating" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : exportStatus === "success" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <FileText className="w-4 h-4" />
                        )}
                        {exportStatus === "generating"
                            ? "Generating..."
                            : exportStatus === "success"
                                ? "Report Exported!"
                                : "Export Report"}
                    </button>

                    <Link href="/admin/inspections">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20">
                            Schedule Inspection
                        </button>
                    </Link>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                    {error} —{" "}
                    <button
                        onClick={() => currentUser && fetchDashboard(currentUser.access_token)}
                        className="underline font-semibold"
                    >
                        retry
                    </button>
                </div>
            )}

            {/* Stats Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                {statCards.map((stat) => (
                    <motion.div
                        key={stat.label}
                        variants={item}
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div
                                className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 duration-300",
                                    stat.color === "blue"
                                        ? "bg-blue-50 text-blue-600"
                                        : stat.color === "emerald"
                                            ? "bg-emerald-50 text-emerald-600"
                                            : "bg-rose-50 text-rose-600"
                                )}
                            >
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div
                                className={cn(
                                    "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                                    stat.isPositive
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-rose-50 text-rose-600"
                                )}
                            >
                                {stat.isPositive ? (
                                    <ArrowUpRight className="w-3 h-3" />
                                ) : (
                                    <ArrowDownRight className="w-3 h-3" />
                                )}
                                {stat.change}
                            </div>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                        </div>
                        <div
                            className={cn(
                                "absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity",
                                stat.color === "blue"
                                    ? "bg-blue-600"
                                    : stat.color === "emerald"
                                        ? "bg-emerald-600"
                                        : "bg-rose-600"
                            )}
                        />
                    </motion.div>
                ))}
            </motion.div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Inspections Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">Recent Inspections</h3>
                        <Link
                            href="/admin/inspections"
                            className="text-blue-600 text-sm font-semibold hover:underline"
                        >
                            View All
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        {data && data.recent_inspections.length > 0 ? (
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                                    <tr>
                                        <th className="px-6 py-4">School Name</th>
                                        <th className="px-6 py-4">District</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.recent_inspections.map((ins, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {ins.school_name}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {ins.district}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {ins.date}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                                    {ins.inspection_type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={cn(
                                                        "text-[10px] font-bold px-2 py-1 rounded-full",
                                                        ins.status === "Scheduled"
                                                            ? "bg-blue-50 text-blue-600"
                                                            : ins.status === "In Progress"
                                                                ? "bg-amber-50 text-amber-600"
                                                                : ins.status === "Completed"
                                                                    ? "bg-emerald-50 text-emerald-600"
                                                                    : "bg-slate-100 text-slate-500"
                                                    )}
                                                >
                                                    {ins.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="px-6 py-12 text-center text-slate-400 text-sm">
                                No recent inspections found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Urgent Actions sidebar */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Urgent Actions</h3>
                    {data && data.urgent_actions.length > 0 ? (
                        <div className="space-y-4">
                            {data.urgent_actions.map((action, i) => (
                                <div key={i} className="flex gap-3">
                                    <div
                                        className={cn(
                                            "w-1.5 rounded-full flex-shrink-0",
                                            action.type === "doc"
                                                ? "bg-rose-500"
                                                : action.type === "insp"
                                                    ? "bg-amber-500"
                                                    : "bg-blue-500"
                                        )}
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">
                                            {action.text}
                                        </p>
                                        <p className="text-[10px] text-slate-500">{action.time_ago}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">No urgent actions right now.</p>
                    )}
                </div>
            </div>
        </div>
    );
}