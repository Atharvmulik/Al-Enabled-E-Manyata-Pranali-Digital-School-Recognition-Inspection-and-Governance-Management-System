"use client";

import React, { useEffect, useState } from "react";
import {
    School,
    Search,
    Filter,
    Eye,
    CheckCircle,
    Ban,
    Building2,
    FileText,
    Clock,
    AlertCircle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import ProfileBookletModal from "@/app/components/ProfileBookletModal";
import { API_BASE_URL } from "@/lib/api";

// Types
type SchoolListItem = {
    school_id: string;
    name: string;
    udise_number: string;
    district: string;
    status: string;
    application_status?: string;
    last_updated?: string;
};

type SchoolListResponse = {
    schools: SchoolListItem[];
    total: number;
    page: number;
    per_page: number;
};

type StoredUser = {
    user_id: string;
    email: string;
    role: string;
    access_token: string;
};

const getAuthHeader = (token: string) => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
});

export default function SchoolsPage() {
    const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
    const [schools, setSchools] = useState<SchoolListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);
    const [selectedSchool, setSelectedSchool] = useState<SchoolListItem | null>(null);
    const [verificationSchool, setVerificationSchool] = useState<SchoolListItem | null>(null);
    const [updating, setUpdating] = useState(false);

    // Auth guard
    useEffect(() => {
        try {
            const raw = localStorage.getItem("user");
            if (!raw) {
                window.location.href = "/login";
                return;
            }
            const parsed: StoredUser = JSON.parse(raw);
            if (parsed.role !== "admin") {
                window.location.href = "/login";
                return;
            }
            setCurrentUser(parsed);
        } catch {
            window.location.href = "/login";
        }
    }, []);

    // Fetch schools
    useEffect(() => {
        if (!currentUser) return;

        const fetchSchools = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (searchTerm) params.append("search", searchTerm);
                if (selectedDistrict) params.append("district", selectedDistrict);
                if (selectedStatus) params.append("status", selectedStatus);
                params.append("page", page.toString());
                params.append("per_page", perPage.toString());

                const res = await fetch(`${API_BASE_URL}/admin/schools?${params.toString()}`, {
                    headers: getAuthHeader(currentUser.access_token),
                });
                if (!res.ok) throw new Error("Failed to fetch schools");
                const data: SchoolListResponse = await res.json();
                setSchools(data.schools);
                setTotal(data.total);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSchools();
    }, [currentUser, searchTerm, selectedDistrict, selectedStatus, page, perPage]);

    // Handle search debounce
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDistrict(e.target.value);
        setPage(1);
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedStatus(e.target.value);
        setPage(1);
    };

    // Update school status (block/unblock)
    const updateStatus = async (schoolId: string, newStatus: string) => {
        if (!currentUser) return;
        setUpdating(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/schools/${schoolId}/status`, {
                method: "PATCH",
                headers: getAuthHeader(currentUser.access_token),
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error("Failed to update status");
            // Refresh list
            setPage(1);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const totalPages = Math.ceil(total / perPage);

    // Stats (could be computed from schools or separate endpoint)
    const newRequestsCount = schools.filter(s => s.status === "Pending" && s.application_status === "Submitted").length;
    const underReviewCount = schools.filter(s => s.status === "Pending" && s.application_status === "Under Review").length;
    const pendingInspectionCount = schools.filter(s => s.status === "Pending" && s.application_status === "Approved").length; // placeholder
    const grantedCount = schools.filter(s => s.status === "Active").length;

    if (!currentUser) return null;

    if (loading && schools.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">School Management</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Manage registered schools, verify credentials, and monitor governance status.
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "New Requests", count: newRequestsCount, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Under Review", count: underReviewCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Pending Inspection", count: pendingInspectionCount, icon: AlertCircle, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Granted Recognition", count: grantedCount, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                                <stat.icon className={cn("w-5 h-5", stat.color)} />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.count}</h3>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by School Name / UDISE..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    />
                </div>
            </div>

            {/* Schools Table */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    Error: {error}
                </div>
            )}

            {schools.length > 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">School Details</th>
                                    <th className="px-6 py-4">UDISE Code</th>
                                    <th className="px-6 py-4">District</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Application</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {schools.map((school) => (
                                    <tr key={school.school_id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shadow-inner">
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{school.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <code className="text-[11px] bg-slate-100 px-2 py-1 rounded text-slate-600 font-semibold">{school.udise_number}</code>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-600 font-medium">{school.district}</td>
                                        <td className="px-6 py-5">
                                            <span className={cn(
                                                "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter",
                                                school.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                    school.status === "Pending" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                                        "bg-rose-50 text-rose-600 border border-rose-100"
                                            )}>
                                                {school.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            {school.application_status ? (
                                                <span className={cn(
                                                    "text-[10px] font-bold px-2.5 py-1 rounded-full",
                                                    school.application_status === "Approved" ? "bg-emerald-50 text-emerald-600" :
                                                        school.application_status === "Rejected" ? "bg-rose-50 text-rose-600" :
                                                            "bg-blue-50 text-blue-600"
                                                )}>
                                                    {school.application_status}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedSchool(school)}
                                                    className="p-2 hover:bg-white hover:text-blue-600 rounded-lg text-slate-400 transition-all border border-transparent hover:border-slate-100 shadow-sm"
                                                    title="View Profile"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setVerificationSchool(school)}
                                                    className="p-2 hover:bg-white hover:text-emerald-600 rounded-lg text-slate-400 transition-all border border-transparent hover:border-slate-100 shadow-sm"
                                                    title="Verify Credentials"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                                {school.status !== "Blocked" ? (
                                                    <button
                                                        onClick={() => updateStatus(school.school_id, "Blocked")}
                                                        disabled={updating}
                                                        className="p-2 hover:bg-white hover:text-rose-600 rounded-lg text-slate-400 transition-all border border-transparent hover:border-slate-100 shadow-sm disabled:opacity-50"
                                                        title="Block School"
                                                    >
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => updateStatus(school.school_id, "Active")}
                                                        disabled={updating}
                                                        className="p-2 hover:bg-white hover:text-emerald-600 rounded-lg text-slate-400 transition-all border border-transparent hover:border-slate-100 shadow-sm disabled:opacity-50"
                                                        title="Unblock School"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-xs text-slate-500 font-medium">
                            Showing <span className="font-bold text-slate-900">{schools.length}</span> of <span className="font-bold text-slate-900">{total}</span> schools
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum = i + 1;
                                    if (totalPages > 5 && page > 3) {
                                        pageNum = page - 2 + i;
                                        if (pageNum > totalPages) return null;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={cn(
                                                "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                                                page === pageNum
                                                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                                            )}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || totalPages === 0}
                                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <School className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">No schools found</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
                        {searchTerm ? `No schools matching "${searchTerm}".` : "No schools match your filters."}
                    </p>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="mt-8 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
                        >
                            Clear Search
                        </button>
                    )}
                </div>
            )}

            {/* Profile Modals */}
            {selectedSchool && (
                <ProfileBookletModal
                    isOpen={!!selectedSchool}
                    onClose={() => setSelectedSchool(null)}
                    schoolName={selectedSchool.name}
                    udiseCode={selectedSchool.udise_number}
                    schoolId={selectedSchool.school_id}
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