"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    ChevronLeft,
    CheckCircle2,
    XCircle,
    RotateCcw,
    AlertCircle,
    FileText,
    Calendar,
    MapPin,
    ArrowLeft,
    Search,
    Eye,
    Building2,
    ShieldCheck,
    BadgeCheck,
    Loader2,
    RefreshCw,
    ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Report {
    id: string;
    schoolName: string;
    district: string;
    state: string;
    inspectionDate: string;
    inspector: string;
    schoolType: string;
    applicationType: string;
    recognitionType: string;
    status: string;
    score: number;
    risk: string;
    recommendation: string;
    summary: string;
    improvementAreas: string[];
    certificateId?: string | null;
    certificateUrl?: string | null;
    submittedAt?: string | null;
    inspectorId?: string | null;
}

interface ReportListResponse {
    reports: Report[];
    total: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const RISK_CATEGORIES = {
    low: {
        title: "Low Risk",
        description: "School meets all standards with minor observations",
        accent: "bg-emerald-500",
        bg: "bg-emerald-50/60",
        border: "border-emerald-200",
        text: "text-emerald-700",
        badge: "bg-emerald-100 text-emerald-700",
    },
    medium: {
        title: "Medium Risk",
        description: "Some areas need improvement within 3 months",
        accent: "bg-amber-500",
        bg: "bg-amber-50/60",
        border: "border-amber-200",
        text: "text-amber-700",
        badge: "bg-amber-100 text-amber-700",
    },
    high: {
        title: "High Risk",
        description: "Significant issues requiring immediate attention",
        accent: "bg-orange-500",
        bg: "bg-orange-50/60",
        border: "border-orange-200",
        text: "text-orange-700",
        badge: "bg-orange-100 text-orange-700",
    },
    critical: {
        title: "Critical Risk",
        description: "Severe violations, immediate action required",
        accent: "bg-rose-500",
        bg: "bg-rose-50/60",
        border: "border-rose-200",
        text: "text-rose-700",
        badge: "bg-rose-100 text-rose-700",
    },
};

const RECOMMENDATIONS = {
    approve: {
        label: "Approve",
        icon: CheckCircle2,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-500",
        badge: "bg-emerald-100 text-emerald-700",
    },
    reject: {
        label: "Reject",
        icon: XCircle,
        color: "text-rose-600",
        bg: "bg-rose-50",
        border: "border-rose-500",
        badge: "bg-rose-100 text-rose-700",
    },
    "re-inspection": {
        label: "Re-Inspection",
        icon: RotateCcw,
        color: "text-slate-600",
        bg: "bg-slate-50",
        border: "border-slate-400",
        badge: "bg-slate-100 text-slate-600",
    },
};

const STATUS_STYLES: Record<string, string> = {
    "Pending Review": "bg-amber-100 text-amber-700",
    Approved: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-rose-100 text-rose-700",
    "Re-Inspection Required": "bg-blue-100 text-blue-700",
};


// ─────────────────────────────────────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────────────────────────────────────

async function fetchReports(params: {
    status?: string;
    search?: string;
    page?: number;
    per_page?: number;
}): Promise<ReportListResponse> {
    const query = new URLSearchParams();
    if (params.status && params.status !== "All Reports") query.set("status", params.status);
    if (params.search) query.set("search", params.search);
    if (params.page) query.set("page", String(params.page));
    if (params.per_page) query.set("per_page", String(params.per_page));

    const res = await fetch(`${API_BASE_URL}/admin/reports?${query.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch reports: ${res.status}`);
    return res.json();
}

async function fetchReportDetail(reportId: string): Promise<Report> {
    const res = await fetch(`${API_BASE_URL}/admin/reports/${reportId}`);
    if (!res.ok) throw new Error(`Failed to fetch report: ${res.status}`);
    return res.json();
}

async function updateReportStatus(
    reportId: string,
    status: string,
    remarks?: string
): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, remarks }),
    });
    if (!res.ok) throw new Error(`Failed to update status: ${res.status}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Score helpers
// ─────────────────────────────────────────────────────────────────────────────

function getScoreStatus(score: number) {
    if (score >= 85)
        return {
            label: "Excellent",
            color: "text-emerald-600",
            bar: "from-emerald-400 to-emerald-500",
            shadow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]",
        };
    if (score >= 70)
        return {
            label: "Satisfactory",
            color: "text-amber-600",
            bar: "from-amber-400 to-amber-500",
            shadow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]",
        };
    if (score >= 50)
        return {
            label: "Needs Improvement",
            color: "text-orange-600",
            bar: "from-orange-400 to-orange-500",
            shadow: "shadow-[0_0_15px_rgba(249,115,22,0.3)]",
        };
    return {
        label: "Critical",
        color: "text-rose-600",
        bar: "from-rose-400 to-rose-500",
        shadow: "shadow-[0_0_15px_rgba(244,63,94,0.3)]",
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────

function ReportCardSkeleton() {
    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col animate-pulse">
            <div className="h-1.5 w-full bg-slate-200" />
            <div className="p-6 flex flex-col gap-4 flex-1">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                        <div className="h-5 bg-slate-200 rounded-lg w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                    </div>
                    <div className="h-6 w-24 bg-slate-100 rounded-full" />
                </div>
                <div className="space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-2/3" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                    <div className="h-4 bg-slate-100 rounded w-2/5" />
                </div>
                <div className="flex gap-2 pt-2">
                    <div className="h-6 w-20 bg-slate-100 rounded-full" />
                    <div className="h-6 w-16 bg-slate-100 rounded-full" />
                    <div className="h-6 w-20 bg-slate-100 rounded-full" />
                </div>
                <div className="h-10 bg-slate-100 rounded-2xl mt-2" />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Report Card
// ─────────────────────────────────────────────────────────────────────────────

function ReportCard({ report, onClick }: { report: Report; onClick: () => void }) {
    const riskKey = (report.risk || "low").toLowerCase() as keyof typeof RISK_CATEGORIES;
    const recKey = (report.recommendation || "approve").toLowerCase() as keyof typeof RECOMMENDATIONS;
    const risk = RISK_CATEGORIES[riskKey] ?? RISK_CATEGORIES.low;
    const rec = RECOMMENDATIONS[recKey] ?? RECOMMENDATIONS.approve;
    const scoreStatus = getScoreStatus(report.score);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col cursor-pointer group"
            onClick={onClick}
        >
            <div className={cn("h-1.5 w-full", risk.accent)} />
            <div className="p-6 flex flex-col gap-4 flex-1">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="font-black text-slate-900 text-lg leading-tight group-hover:text-blue-700 transition-colors">
                            {report.schoolName}
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-0.5">
                            {report.id}
                        </p>
                    </div>
                    
                </div>

                {/* Meta */}
                <div className="space-y-1.5 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {report.district}, {report.state}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <BadgeCheck className="w-3.5 h-3.5 text-slate-400" />
                        {report.inspector}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {report.inspectionDate}
                    </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-auto pt-2">
                    <span className={cn("text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide", risk.badge)}>
                        {risk.title}
                    </span>
                    <span className={cn("text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide", rec.badge)}>
                        {rec.label}
                    </span>
                    <span className={cn("text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide", scoreStatus.color, "bg-slate-50")}>
                        Score: {report.score}
                    </span>
                </div>

                {/* CTA */}
                <button
                    className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-colors active:scale-95"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick();
                    }}
                >
                    <Eye className="w-3.5 h-3.5" /> View Report
                </button>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Report Detail
// ─────────────────────────────────────────────────────────────────────────────

function ReportDetail({
    reportId,
    onBack,
    onStatusChange,
}: {
    reportId: string;
    onBack: () => void;
    onStatusChange: () => void;
}) {
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null); // 'approve' | 'reject' | 're-inspection'
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchReportDetail(reportId)
            .then((data) => {
                if (!cancelled) setReport(data);
            })
            .catch((err) => {
                if (!cancelled) setError(err.message);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [reportId]);

    const handleAction = async (status: string, actionKey: string) => {
        setActionLoading(actionKey);
        setActionSuccess(null);
        try {
            await updateReportStatus(reportId, status);
            setActionSuccess(actionKey);
            // Refresh detail
            const updated = await fetchReportDetail(reportId);
            setReport(updated);
            // Tell listing to refresh too
            onStatusChange();
        } catch (err: any) {
            alert(`Failed to update status: ${err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Loading Report…</p>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-40 gap-4">
                <AlertCircle className="w-10 h-10 text-rose-400" />
                <p className="text-slate-600 font-bold">Failed to load report</p>
                <p className="text-slate-400 text-sm">{error}</p>
                <button
                    onClick={onBack}
                    className="mt-2 px-6 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 transition-colors"
                >
                    ← Go Back
                </button>
            </div>
        );
    }

    const riskKey = (report.risk || "low").toLowerCase() as keyof typeof RISK_CATEGORIES;
    const recKey = (report.recommendation || "approve").toLowerCase() as keyof typeof RECOMMENDATIONS;
    const scoreStatus = getScoreStatus(report.score);

    return (
        <motion.div
            key="detail"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="max-w-3xl mx-auto pb-24"
        >
            {/* Sticky Header */}
            <header className="flex items-center justify-between mb-8 sticky top-0 z-20 bg-[#f8fafc]/80 backdrop-blur-md py-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
                    >
                        <ChevronLeft className="w-6 h-6 text-slate-700 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Final Report</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            ID: {report.id}
                        </p>
                    </div>
                </div>

            </header>

            <div className="space-y-8">
                {/* School Info Card */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6 relative overflow-hidden">
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Verified Report</span>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 leading-tight">
                                {report.schoolName}
                            </h2>
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500 font-medium">
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-slate-400" /> {report.district}, {report.state}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-slate-400" /> {report.inspectionDate}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm pt-2">
                            {[
                                ["School Type", report.schoolType],
                                ["Application", report.applicationType],
                                ["Recognition", report.recognitionType],
                                ["Status", report.status],
                            ].map(([k, v]) => (
                                <div key={k}>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{k}</p>
                                    <p className="font-bold text-slate-700">{v}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="shrink-0 text-right md:border-l md:pl-8 border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                            Lead Inspector
                        </p>
                        <p className="font-bold text-slate-800 underline decoration-slate-200 decoration-2 underline-offset-4">
                            {report.inspector}
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16" />
                </div>

                {/* Score */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 text-center relative group"
                >
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
                        Compliance Score
                    </h3>
                    <div className="relative inline-flex flex-col items-center justify-center">
                        <div
                            className={cn(
                                "text-7xl font-black tracking-tighter tabular-nums drop-shadow-sm transition-transform group-hover:scale-110 duration-500",
                                scoreStatus.color
                            )}
                        >
                            {report.score}
                        </div>
                        <div className="text-xs font-black text-slate-200 mt-1 uppercase tracking-widest">Out of 100</div>
                    </div>
                    <div className="mt-8 relative w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${report.score}%` }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className={cn(
                                "absolute inset-y-0 left-0 bg-gradient-to-r rounded-full",
                                scoreStatus.bar,
                                scoreStatus.shadow
                            )}
                        />
                    </div>
                    <p className="mt-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                        Status: <span className={scoreStatus.color}>{scoreStatus.label}</span>
                    </p>
                </motion.div>

                {/* Risk Cards */}
                <section>
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">
                        Risk Category
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(Object.keys(RISK_CATEGORIES) as Array<keyof typeof RISK_CATEGORIES>).map((key) => {
                            const cat = RISK_CATEGORIES[key];
                            const isSelected = riskKey === key;
                            return (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={cn(
                                        "rounded-2xl border-2 overflow-hidden transition-all duration-300",
                                        isSelected ? cn(cat.bg, cat.border) : "bg-white border-slate-100"
                                    )}
                                >
                                    <div className={cn("h-1", isSelected ? cat.accent : "bg-slate-100")} />
                                    <div className="p-4">
                                        <p className={cn("font-black text-sm", isSelected ? cat.text : "text-slate-500")}>
                                            {cat.title}
                                        </p>
                                        <p className={cn("text-xs mt-1", isSelected ? "text-slate-600" : "text-slate-400")}>
                                            {cat.description}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* Recommendation Cards */}
                <section>
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">
                        Inspector Recommendation
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {(Object.keys(RECOMMENDATIONS) as Array<keyof typeof RECOMMENDATIONS>).map((key) => {
                            const rec = RECOMMENDATIONS[key];
                            const isSelected = recKey === key;
                            const Icon = rec.icon;
                            return (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 flex flex-col items-center gap-2 text-center transition-all duration-300",
                                        isSelected ? cn(rec.bg, rec.border) : "bg-white border-slate-100"
                                    )}
                                >
                                    <Icon
                                        className={cn("w-7 h-7", isSelected ? rec.color : "text-slate-300")}
                                        strokeWidth={1.5}
                                    />
                                    <p
                                        className={cn(
                                            "text-xs font-black uppercase tracking-wide",
                                            isSelected ? rec.color : "text-slate-400"
                                        )}
                                    >
                                        {rec.label}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* Summary */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" /> Summary of Findings
                        </h3>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm leading-relaxed text-slate-600 text-lg font-medium italic relative">
                        <span className="absolute top-6 left-6 text-7xl font-serif text-slate-100 pointer-events-none">
                            "
                        </span>
                        {report.summary || "No summary provided."}
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-50/20 rounded-full blur-[60px]" />
                    </div>
                </section>

                {/* Improvement Areas */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" /> Improvement Roadmap
                        </h3>
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                            {report.improvementAreas.length} Item
                            {report.improvementAreas.length !== 1 ? "s" : ""} Identified
                        </span>
                    </div>
                    {report.improvementAreas.length === 0 ? (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 text-center text-slate-400 font-bold">
                            No improvement areas identified
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {report.improvementAreas.map((area, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.08 }}
                                    className="flex items-start gap-4 bg-white p-5 rounded-3xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all group"
                                >
                                    <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                                        <span className="text-xs font-black">{index + 1}</span>
                                    </div>
                                    <p className="text-slate-700 font-bold text-sm tracking-tight pt-0.5">{area}</p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Success message */}
                <AnimatePresence>
                    {actionSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Status updated successfully
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Report Listing
// ─────────────────────────────────────────────────────────────────────────────

function ReportListing({ onSelect }: { onSelect: (id: string) => void }) {
    const [reports, setReports] = useState<Report[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search input
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const loadReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchReports({
                search: debouncedSearch || undefined,
                per_page: 50,
            });
            setReports(data.reports);
            setTotal(data.total);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    return (
        <motion.div
            key="listing"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="pb-16"
        >
            {/* Page Header */}
            <header className="sticky top-0 z-20 bg-[#f8fafc]/80 backdrop-blur-md pt-4 pb-3 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inspection Reports</h1>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                            {loading ? "Loading…" : `${total} report${total !== 1 ? "s" : ""} total`}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadReports}
                            disabled={loading}
                            className="p-2 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-40"
                            title="Refresh"
                        >
                            <RefreshCw className={cn("w-4 h-4 text-slate-500", loading && "animate-spin")} />
                        </button>
                        <div className="flex items-center gap-2 text-slate-400">
                            <ShieldCheck className="w-5 h-5" />
                            <Building2 className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by school, district, inspector, or ID…"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                    />
                </div>

                
            </header>

            {/* Error */}
            {error && (
                <div className="mb-6 flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Failed to load reports: {error}
                    <button
                        onClick={loadReports}
                        className="ml-auto text-xs underline hover:no-underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Grid */}
            <AnimatePresence mode="popLayout">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <ReportCardSkeleton key={i} />
                        ))}
                    </div>
                ) : reports.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 text-slate-400 font-bold"
                    >
                        {error ? null : "No reports found."}
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {reports.map((report) => (
                            <ReportCard
                                key={report.id}
                                report={report}
                                onClick={() => onSelect(report.id)}
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Root
// ─────────────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    // Used to trigger listing refresh after an admin action
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="max-w-5xl mx-auto px-4">
            <AnimatePresence mode="wait">
                {selectedReportId === null ? (
                    <ReportListing
                        key={`listing-${refreshKey}`}
                        onSelect={setSelectedReportId}
                    />
                ) : (
                    <ReportDetail
                        key={selectedReportId}
                        reportId={selectedReportId}
                        onBack={() => setSelectedReportId(null)}
                        onStatusChange={() => setRefreshKey((k) => k + 1)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}