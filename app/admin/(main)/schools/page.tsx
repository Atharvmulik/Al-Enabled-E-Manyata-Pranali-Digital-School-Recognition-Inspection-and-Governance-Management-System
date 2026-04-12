"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    School, Search, Eye, CheckCircle, Ban, Building2,
    FileText, Clock, AlertCircle, CheckCircle2,
    ChevronLeft, ChevronRight, Loader2, RefreshCw,
    Filter, MoreHorizontal
} from "lucide-react";
import ProfileBookletModal from "@/app/components/ProfileBookletModal";
import { API_BASE_URL } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type SchoolListItem = {
    school_id:          string;
    name:               string;
    udise_number:       string;
    district:           string;
    status:             string;
    application_status?: string;
    last_updated?:       string;
};

type SchoolListResponse = {
    schools:  SchoolListItem[];
    total:    number;
    page:     number;
    per_page: number;
};

type StoredUser = {
    user_id:      string;
    email:        string;
    role:         string;
    access_token: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getAuthHeader = (token: string) => ({
    Authorization:  `Bearer ${token}`,
    "Content-Type": "application/json",
});

const statusColors: Record<string, string> = {
    Active:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Blocked: "bg-rose-50 text-rose-700 border-rose-200",
};

const appStatusColors: Record<string, string> = {
    Submitted:     "bg-blue-50 text-blue-700",
    "Under Review":"bg-indigo-50 text-indigo-700",
    Approved:      "bg-emerald-50 text-emerald-700",
    Rejected:      "bg-rose-50 text-rose-700",
    Draft:         "bg-slate-100 text-slate-500",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SchoolsPage() {
    const [currentUser, setCurrentUser]             = useState<StoredUser | null>(null);
    const [schools, setSchools]                     = useState<SchoolListItem[]>([]);
    const [total, setTotal]                         = useState(0);
    const [loading, setLoading]                     = useState(true);
    const [refreshing, setRefreshing]               = useState(false);
    const [error, setError]                         = useState<string | null>(null);
    const [searchTerm, setSearchTerm]               = useState("");
    const [selectedDistrict, setSelectedDistrict]   = useState("");
    const [selectedStatus, setSelectedStatus]       = useState("");
    const [page, setPage]                           = useState(1);
    const perPage                                   = 10;
    const [selectedSchool, setSelectedSchool]       = useState<SchoolListItem | null>(null);
    const [verificationSchool, setVerificationSchool] = useState<SchoolListItem | null>(null);
    const [updatingId, setUpdatingId]               = useState<string | null>(null);

    // ── Auth guard ──────────────────────────────────────────────────────────
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

    // ── Fetch schools ───────────────────────────────────────────────────────
    const fetchSchools = useCallback(async (silent = false) => {
        if (!currentUser) return;
        if (!silent) setLoading(true);
        else setRefreshing(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (searchTerm)       params.append("search",   searchTerm);
            if (selectedDistrict) params.append("district", selectedDistrict);
            if (selectedStatus)   params.append("status",   selectedStatus);
            params.append("page",     page.toString());
            params.append("per_page", perPage.toString());

            const res = await fetch(
                `${API_BASE_URL}/admin/schools?${params.toString()}`,
                { headers: getAuthHeader(currentUser.access_token) },
            );
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const data: SchoolListResponse = await res.json();
            setSchools(data.schools);
            setTotal(data.total);
        } catch (err: any) {
            setError(err.message ?? "Failed to fetch schools");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentUser, searchTerm, selectedDistrict, selectedStatus, page, perPage]);

    useEffect(() => { fetchSchools(); }, [fetchSchools]);

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const updateStatus = async (schoolId: string, newStatus: string) => {
        if (!currentUser) return;
        setUpdatingId(schoolId);
        try {
            const res = await fetch(
                `${API_BASE_URL}/admin/schools/${schoolId}/status`,
                {
                    method:  "PATCH",
                    headers: getAuthHeader(currentUser.access_token),
                    body:    JSON.stringify({ status: newStatus }),
                },
            );
            if (!res.ok) throw new Error("Failed to update status");
            // Optimistic update
            setSchools(prev =>
                prev.map(s => s.school_id === schoolId ? { ...s, status: newStatus } : s)
            );
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUpdatingId(null);
        }
    };

    const totalPages = Math.ceil(total / perPage);

    // ── Computed stats ──────────────────────────────────────────────────────
    const newRequestsCount        = schools.filter(s => s.application_status === "Submitted").length;
    const underReviewCount        = schools.filter(s => s.application_status === "Under Review").length;
    const pendingInspectionCount  = schools.filter(s => s.status === "Pending").length;
    const grantedCount            = schools.filter(s => s.status === "Active").length;

    if (!currentUser) return null;

    // ── Skeleton ────────────────────────────────────────────────────────────
    if (loading && schools.length === 0) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="h-8 w-64 bg-slate-100 rounded-lg animate-pulse" />
                <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
                <div className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
                <div className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ── Page header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">School Management</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Manage registered schools, verify credentials, and monitor governance status.
                    </p>
                </div>
                <button
                    onClick={() => fetchSchools(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "New Requests",         count: newRequestsCount,       icon: FileText,    color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-100"   },
                    { label: "Under Review",          count: underReviewCount,       icon: Clock,       color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100"  },
                    { label: "Pending Inspection",    count: pendingInspectionCount, icon: AlertCircle, color: "text-indigo-600",  bg: "bg-indigo-50",  border: "border-indigo-100" },
                    { label: "Granted Recognition",   count: grantedCount,           icon: CheckCircle2,color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100"},
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center mb-4`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.count}</h3>
                    </div>
                ))}
            </div>

            {/* ── Filters ── */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by School Name or UDISE Code…"
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>
                <div className="flex gap-3">
                    <select
                        value={selectedStatus}
                        onChange={e => { setSelectedStatus(e.target.value); setPage(1); }}
                        className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Blocked">Blocked</option>
                    </select>
                </div>
            </div>

            {/* ── Error ── */}
            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                    <button onClick={() => setError(null)} className="ml-auto text-rose-500 hover:text-rose-700">×</button>
                </div>
            )}

            {/* ── Table ── */}
            {schools.length > 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest font-bold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">School</th>
                                    <th className="px-6 py-4">UDISE Code</th>
                                    <th className="px-6 py-4">District</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Application</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {schools.map(school => (
                                    <tr
                                        key={school.school_id}
                                        className="hover:bg-slate-50/60 transition-colors"
                                    >
                                        {/* School name */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                                    <Building2 className="w-4 h-4 text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{school.name || "—"}</p>
                                                    {school.last_updated && (
                                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                                            Updated {new Date(school.last_updated).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* UDISE */}
                                        <td className="px-6 py-4">
                                            <code className="text-[11px] bg-slate-100 px-2 py-1 rounded-lg text-slate-600 font-semibold">
                                                {school.udise_number || "—"}
                                            </code>
                                        </td>

                                        {/* District */}
                                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                            {school.district || "—"}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-tighter ${statusColors[school.status] ?? "bg-slate-50 text-slate-500 border-slate-200"}`}>
                                                {school.status}
                                            </span>
                                        </td>

                                        {/* Application status */}
                                        <td className="px-6 py-4">
                                            {school.application_status ? (
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${appStatusColors[school.application_status] ?? "bg-slate-100 text-slate-500"}`}>
                                                    {school.application_status}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-300">—</span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* View Profile */}
                                                <button
                                                    onClick={() => setSelectedSchool(school)}
                                                    title="View Profile"
                                                    className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                {/* Verify */}
                                                <button
                                                    onClick={() => setVerificationSchool(school)}
                                                    title="Verify Application"
                                                    className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-100"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>

                                                {/* Block / Unblock */}
                                                {school.status !== "Blocked" ? (
                                                    <button
                                                        onClick={() => updateStatus(school.school_id, "Blocked")}
                                                        disabled={updatingId === school.school_id}
                                                        title="Block School"
                                                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100 disabled:opacity-50"
                                                    >
                                                        {updatingId === school.school_id
                                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                                            : <Ban className="w-4 h-4" />
                                                        }
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => updateStatus(school.school_id, "Active")}
                                                        disabled={updatingId === school.school_id}
                                                        title="Unblock School"
                                                        className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-100 disabled:opacity-50"
                                                    >
                                                        {updatingId === school.school_id
                                                            ? <Loader2 className="w-4 h-4 animate-spin" />
                                                            : <CheckCircle className="w-4 h-4" />
                                                        }
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Pagination ── */}
                    <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-4">
                        <p className="text-xs text-slate-500 font-medium">
                            Showing{" "}
                            <span className="font-bold text-slate-800">
                                {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)}
                            </span>{" "}
                            of <span className="font-bold text-slate-800">{total}</span> schools
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {/* Page numbers */}
                            {(() => {
                                const pages: number[] = [];
                                const start = Math.max(1, page - 2);
                                const end   = Math.min(totalPages, page + 2);
                                for (let i = start; i <= end; i++) pages.push(i);
                                return pages.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                            page === p
                                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ));
                            })()}

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* ── Empty state ── */
                <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <School className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">No schools found</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
                        {searchTerm
                            ? `No schools matching "${searchTerm}".`
                            : "No schools match your current filters."}
                    </p>
                    {(searchTerm || selectedStatus) && (
                        <button
                            onClick={() => { setSearchTerm(""); setSelectedStatus(""); setPage(1); }}
                            className="mt-8 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            )}

            {/* ── Modals ── */}
            {selectedSchool && (
                <ProfileBookletModal
                    isOpen={!!selectedSchool}
                    onClose={() => setSelectedSchool(null)}
                    schoolName={selectedSchool.name}
                    udiseCode={selectedSchool.udise_number}
                    schoolId={selectedSchool.school_id}
                    mode="view"
                />
            )}
            {verificationSchool && (
                <ProfileBookletModal
                    isOpen={!!verificationSchool}
                    onClose={() => setVerificationSchool(null)}
                    schoolName={verificationSchool.name}
                    udiseCode={verificationSchool.udise_number}
                    schoolId={verificationSchool.school_id}
                    mode="verify"
                />
            )}
        </div>
    );
}