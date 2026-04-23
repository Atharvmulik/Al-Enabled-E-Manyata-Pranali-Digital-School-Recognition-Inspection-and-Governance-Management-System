"use client";

import React, { useState, useEffect, useCallback } from "react";
import ScheduleInspectionModal from "@/app/components/admin/ScheduleInspectionModal";
import ReassignInspectorModal from "@/app/components/admin/ReassignInspectorModal";
import InspectionDetailsModal from "@/app/components/admin/InspectionDetailsModal";
import {
    Calendar,
    MapPin,
    Plus,
    Clock,
    ExternalLink,
    Loader2,
    Search,
    RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type StoredUser = {
    user_id: string;
    email: string;
    role: string;
    access_token: string;
};

export type InspectionData = {
    inspection_id: string;
    school_id: string;
    name: string;
    district: string;
    date: string;
    time: string;
    inspector: string;
    inspector_id?: string;
    type: string;
    status: string;
    remarks?: string;
    overall_result?: string;
};

type InspectionsResponse = {
    inspections: InspectionData[];
    total: number;
    active_count: number;
};

const getAuthHeader = (token: string) => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
});

const STATUS_COLORS: Record<string, string> = {
    Scheduled: "bg-blue-50 text-blue-600",
    Pending: "bg-amber-50 text-amber-600",
    "In Progress": "bg-indigo-50 text-indigo-600",
    Completed: "bg-emerald-50 text-emerald-600",
    Cancelled: "bg-slate-100 text-slate-500",
};

export default function InspectionsPage() {
    const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
    const [inspections, setInspections] = useState<InspectionData[]>([]);
    const [activeCount, setActiveCount] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [districtFilter, setDistrictFilter] = useState("");

    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [reassignTarget, setReassignTarget] = useState<InspectionData | null>(null);
    const [selectedInspection, setSelectedInspection] = useState<InspectionData | null>(null);

    // Auth guard
    useEffect(() => {
        try {
            const raw = localStorage.getItem("user");
            if (!raw) { window.location.href = "/login"; return; }
            const parsed: StoredUser = JSON.parse(raw);
            if (parsed.role !== "admin") { window.location.href = "/login"; return; }
            setCurrentUser(parsed);
        } catch {
            window.location.href = "/login";
        }
    }, []);

    const fetchInspections = useCallback(async (token: string) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (statusFilter) params.append("status", statusFilter);
            if (districtFilter) params.append("district", districtFilter);
            params.append("per_page", "50");

            const res = await fetch(
                `${API_BASE_URL}/admin/inspections?${params.toString()}`,
                { headers: getAuthHeader(token) }
            );
            if (!res.ok) throw new Error("Failed to load inspections");
            const data: InspectionsResponse = await res.json();
            setInspections(data.inspections);
            setActiveCount(data.active_count);
            setTotal(data.total);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, districtFilter]);

    useEffect(() => {
        if (currentUser) fetchInspections(currentUser.access_token);
    }, [currentUser, fetchInspections]);

    const handleRefresh = () => {
        if (currentUser) fetchInspections(currentUser.access_token);
    };

    if (!currentUser) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Inspection Management</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Orchestrate site visits, assign inspectors, and monitor compliance reporting.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm disabled:opacity-40"
                        title="Refresh"
                    >
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    </button>
                    <button
                        onClick={() => setShowScheduleModal(true)}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Schedule New Inspection
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by school name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                >
                    <option value="">All Statuses</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                <select
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                >
                    <option value="">All Districts</option>
                    <option value="Lucknow">Lucknow</option>
                    <option value="Kanpur">Kanpur</option>
                    <option value="Agra">Agra</option>
                    <option value="Meerut">Meerut</option>
                    <option value="Varanasi">Varanasi</option>
                </select>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                    {error} —{" "}
                    <button onClick={handleRefresh} className="underline font-semibold">retry</button>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 tracking-tight">
                            {statusFilter || "All"} Inspections
                        </h3>
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                            {activeCount} Active
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">{total} total</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-24">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : inspections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                        <MapPin className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-sm font-semibold">No inspections found</p>
                        <p className="text-xs mt-1">Try adjusting your filters or schedule a new one.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {inspections.map((insp) => (
                            <div
                                key={insp.inspection_id}
                                className="p-6 hover:bg-slate-50/50 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors shadow-inner shrink-0">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {insp.name}
                                            </h4>
                                            <span className={cn(
                                                "text-[10px] font-black px-2 py-0.5 rounded-full",
                                                STATUS_COLORS[insp.status] ?? "bg-slate-100 text-slate-500"
                                            )}>
                                                {insp.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1.5">
                                            <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" /> {insp.date}
                                            </span>
                                            <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 whitespace-nowrap">
                                                <Clock className="w-3.5 h-3.5" /> {insp.time}
                                            </span>
                                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-black uppercase tracking-tighter">
                                                {insp.district}
                                            </span>
                                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-black uppercase tracking-tighter">
                                                {insp.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">
                                            {(insp.inspector ?? "T")[0]}
                                        </div>
                                        <p className="text-xs font-bold text-slate-700 tracking-tight">
                                            {insp.inspector || "TBD"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setReassignTarget(insp)}
                                            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
                                        >
                                            Reassign
                                        </button>
                                        <button
                                            onClick={() => setSelectedInspection(insp)}
                                            className="p-2 hover:bg-white hover:text-blue-600 rounded-lg text-slate-400 transition-all border border-transparent hover:border-slate-100 shadow-sm"
                                            title="View Details"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && inspections.length > 0 && (
                    <div className="p-6 bg-slate-50/50 text-center border-t border-slate-100">
                        <p className="text-xs text-slate-400 font-medium">
                            Showing {inspections.length} of {total} inspections
                        </p>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ScheduleInspectionModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                onSuccess={handleRefresh}
                token={currentUser.access_token}
            />

            <ReassignInspectorModal
                isOpen={!!reassignTarget}
                onClose={() => setReassignTarget(null)}
                inspection={reassignTarget}
                onSuccess={handleRefresh}
                token={currentUser.access_token}
            />

            <InspectionDetailsModal
                isOpen={!!selectedInspection}
                onClose={() => setSelectedInspection(null)}
                inspection={selectedInspection}
                token={currentUser.access_token}
                onStatusUpdate={handleRefresh}
            />
        </div>
    );
}