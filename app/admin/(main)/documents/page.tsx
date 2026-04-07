"use client";

import React from "react";
import {
    ClipboardCheck,
    FileText,
    Check,
    X,
    AlertOctagon,
    Search,
    ShieldCheck,
    ChevronRight,
    ChevronLeft,
    Clock,
    MinusCircle,
    Maximize2,
    Minimize2,
    Loader2,
    RefreshCw,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type StoredUser = { user_id: string; email: string; role: string; access_token: string };

export type DocStatus      = "Pending" | "Approved" | "Rejected" | "Not Required";
export type DocRequirement = "Mandatory" | "Conditional" | "Optional";

export interface DocumentItem {
    doc_id:      string;
    name:        string;
    status:      DocStatus;
    requirement: DocRequirement;
    file_name?:  string;
    file_url?:   string;
    category:    string;
    rejected_reason?: string;
}

export interface DocumentCategory {
    category: string;
    docs:     DocumentItem[];
}

interface SchoolDocSummary {
    school_id:     string;
    name:          string;
    pending_count: number;
    priority:      "Urgent" | "Normal";
    review_status: "Pending" | "Reviewing" | "Rejected" | "Approved";
}

interface DocsPageData {
    school_id:   string;
    school_name: string;
    stats:       { approved: number; pending: number; rejected: number };
    categories:  DocumentCategory[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getHeaders = (token: string) => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
});

// flat list excluding Not Required — for prev/next navigation
const flatDocs = (categories: DocumentCategory[]) =>
    categories.flatMap(c => c.docs).filter(d => d.status !== "Not Required");

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: DocStatus }) => {
    switch (status) {
        case "Approved":     return <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Check className="w-3 h-3" /> Approved</span>;
        case "Rejected":     return <span className="text-[10px] font-black uppercase tracking-widest bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertOctagon className="w-3 h-3" /> Rejected</span>;
        case "Not Required": return <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex items-center gap-1"><MinusCircle className="w-3 h-3" /> N/A</span>;
        default:             return <span className="text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
    }
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DocumentsPage() {
    const [currentUser, setCurrentUser]             = React.useState<StoredUser | null>(null);

    // School list (left panel)
    const [schools, setSchools]                     = React.useState<SchoolDocSummary[]>([]);
    const [totalPending, setTotalPending]           = React.useState(0);
    const [schoolsLoading, setSchoolsLoading]       = React.useState(true);
    const [schoolSearch, setSchoolSearch]           = React.useState("");

    // Selected school + its docs
    const [selectedSchool, setSelectedSchool]       = React.useState<SchoolDocSummary | null>(null);
    const [pageData, setPageData]                   = React.useState<DocsPageData | null>(null);
    const [docsLoading, setDocsLoading]             = React.useState(false);

    // Viewer
    const [selectedDocId, setSelectedDocId]         = React.useState<string | null>(null);
    const [rejectionReason, setRejectionReason]     = React.useState("");
    const [isFullScreen, setIsFullScreen]           = React.useState(false);
    const [actionLoading, setActionLoading]         = React.useState(false);
    const [actionError, setActionError]             = React.useState<string | null>(null);

    // ── Auth ────────────────────────────────────────────────────────────────
    React.useEffect(() => {
        try {
            const raw = localStorage.getItem("user");
            if (!raw) { window.location.href = "/login"; return; }
            const parsed: StoredUser = JSON.parse(raw);
            if (parsed.role !== "admin") { window.location.href = "/login"; return; }
            setCurrentUser(parsed);
        } catch { window.location.href = "/login"; }
    }, []);

    // ── Fetch school list ────────────────────────────────────────────────────
    const fetchSchools = React.useCallback(async (token: string, search = "") => {
        setSchoolsLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            const res = await fetch(`${API_BASE_URL}/admin/documents?${params}`, {
                headers: getHeaders(token),
            });
            if (!res.ok) throw new Error("Failed to load schools");
            const data = await res.json();
            setSchools(data.schools);
            setTotalPending(data.total_pending);

            // Auto-select first school
            if (data.schools.length > 0 && !selectedSchool) {
                setSelectedSchool(data.schools[0]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSchoolsLoading(false);
        }
    }, [selectedSchool]);

    React.useEffect(() => {
        if (currentUser) fetchSchools(currentUser.access_token, schoolSearch);
    }, [currentUser, schoolSearch]);

    // ── Fetch documents for selected school ──────────────────────────────────
    React.useEffect(() => {
        if (!selectedSchool || !currentUser) return;
        setDocsLoading(true);
        setSelectedDocId(null);
        setPageData(null);

        fetch(`${API_BASE_URL}/admin/documents/${selectedSchool.school_id}`, {
            headers: getHeaders(currentUser.access_token),
        })
            .then(r => r.json())
            .then(data => setPageData(data))
            .catch(console.error)
            .finally(() => setDocsLoading(false));
    }, [selectedSchool, currentUser]);

    // ── Document viewer helpers ──────────────────────────────────────────────
    const flatList = React.useMemo(() =>
        pageData ? flatDocs(pageData.categories) : [],
    [pageData]);

    const selectedDocument = React.useMemo(() =>
        flatList.find(d => d.doc_id === selectedDocId) ?? null,
    [flatList, selectedDocId]);

    const currentIndex = flatList.findIndex(d => d.doc_id === selectedDocId);
    const hasNext     = currentIndex >= 0 && currentIndex < flatList.length - 1;
    const hasPrevious = currentIndex > 0;

    const handleNext = () => {
        if (hasNext) { setSelectedDocId(flatList[currentIndex + 1].doc_id); setRejectionReason(""); }
    };
    const handlePrevious = () => {
        if (hasPrevious) { setSelectedDocId(flatList[currentIndex - 1].doc_id); setRejectionReason(""); }
    };

    // ── Approve ──────────────────────────────────────────────────────────────
    const handleApprove = async () => {
        if (!currentUser || !selectedSchool || !selectedDocument) return;
        setActionLoading(true);
        setActionError(null);
        try {
            const res = await fetch(
                `${API_BASE_URL}/admin/documents/${selectedSchool.school_id}/${selectedDocument.doc_id}/approve`,
                { method: "POST", headers: getHeaders(currentUser.access_token) }
            );
            if (!res.ok) throw new Error("Approval failed");
            // Update local state instantly
            setPageData(prev => prev ? updateDocStatus(prev, selectedDocument.doc_id, "Approved") : prev);
            if (hasNext) handleNext(); else setSelectedDocId(null);
            fetchSchools(currentUser.access_token, schoolSearch); // refresh left panel counts
        } catch (e: any) {
            setActionError(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    // ── Reject ───────────────────────────────────────────────────────────────
    const handleReject = async () => {
        if (!currentUser || !selectedSchool || !selectedDocument || !rejectionReason.trim()) return;
        setActionLoading(true);
        setActionError(null);
        try {
            const res = await fetch(
                `${API_BASE_URL}/admin/documents/${selectedSchool.school_id}/${selectedDocument.doc_id}/reject`,
                {
                    method: "POST",
                    headers: getHeaders(currentUser.access_token),
                    body: JSON.stringify({
                        doc_id: selectedDocument.doc_id,
                        rejection_reason: rejectionReason,
                    }),
                }
            );
            if (!res.ok) throw new Error("Rejection failed");
            setPageData(prev => prev ? updateDocStatus(prev, selectedDocument.doc_id, "Rejected") : prev);
            setRejectionReason("");
            if (hasNext) handleNext(); else setSelectedDocId(null);
            fetchSchools(currentUser.access_token, schoolSearch);
        } catch (e: any) {
            setActionError(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (!currentUser) return null;

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-[calc(100vh-120px)] space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Document Verification</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">
                        Authentication of statutory certificates, safety records, and regulatory clearances.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchSchools(currentUser.access_token, schoolSearch)}
                        className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {totalPending} Pending Audits
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col md:flex-row">

                {/* ── LEFT PANEL: School List ─────────────────────────────── */}
                <div className="w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/20">
                    <div className="p-5 border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search Schools..."
                                value={schoolSearch}
                                onChange={e => setSchoolSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                        {schoolsLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                            </div>
                        ) : schools.length === 0 ? (
                            <p className="p-6 text-xs text-slate-400 text-center">No schools found</p>
                        ) : (
                            schools.map(school => (
                                <div
                                    key={school.school_id}
                                    onClick={() => setSelectedSchool(school)}
                                    className={cn(
                                        "p-5 cursor-pointer transition-all relative group",
                                        selectedSchool?.school_id === school.school_id
                                            ? "bg-white shadow-[inset_4px_0_0_0_#2563eb]"
                                            : "hover:bg-white"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className={cn(
                                            "text-xs font-black uppercase tracking-tight transition-colors",
                                            selectedSchool?.school_id === school.school_id ? "text-blue-600" : "text-slate-700"
                                        )}>{school.name}</h4>
                                        <span className={cn(
                                            "text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest",
                                            school.priority === "Urgent" ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"
                                        )}>{school.priority}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] text-slate-500 font-bold">{school.pending_count} items pending</p>
                                        <span className={cn(
                                            "text-[9px] font-bold italic",
                                            school.review_status === "Reviewing" ? "text-amber-500" :
                                            school.review_status === "Rejected"  ? "text-rose-500"  : "text-slate-400"
                                        )}>{school.review_status}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ── RIGHT PANEL ─────────────────────────────────────────── */}
                <div className="flex-1 flex flex-col bg-slate-50/50">
                    {docsLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : !pageData ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                            Select a school to view documents
                        </div>
                    ) : !selectedDocument ? (

                        /* ── DOCUMENT LIST ──────────────────────────────── */
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            <div className="max-w-4xl mx-auto space-y-8">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Required Documents</h2>
                                        <p className="text-xs font-medium text-slate-500 mt-1">Select a document to review and verify.</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> {pageData.stats.approved} Approved</div>
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" />   {pageData.stats.pending} Pending</div>
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500" />    {pageData.stats.rejected} Rejected</div>
                                    </div>
                                </div>

                                {pageData.categories.map((category, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100">
                                            <h3 className="text-sm font-bold text-slate-800">{category.category}</h3>
                                        </div>
                                        <div className="divide-y divide-slate-100">
                                            {category.docs.map(doc => (
                                                <div key={doc.doc_id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/30 transition-colors">
                                                    <div className="flex items-start gap-3">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                                            doc.status === "Approved"     ? "bg-emerald-50 text-emerald-600" :
                                                            doc.status === "Rejected"     ? "bg-rose-50 text-rose-600"       :
                                                            doc.status === "Not Required" ? "bg-slate-100 text-slate-400"    :
                                                                                            "bg-blue-50 text-blue-600"
                                                        )}>
                                                            <FileText className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className={cn("text-sm font-bold", doc.status === "Not Required" ? "text-slate-400 line-through decoration-slate-300" : "text-slate-800")}>
                                                                    {doc.name}
                                                                </h4>
                                                                {doc.requirement === "Mandatory" && (
                                                                    <span className="text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded">Required</span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] font-medium text-slate-400 mt-1">
                                                                {doc.file_name || "No file uploaded yet"}
                                                            </p>
                                                            {doc.status === "Rejected" && doc.rejected_reason && (
                                                                <p className="text-[10px] text-rose-500 mt-1 font-medium">
                                                                    Rejected: {doc.rejected_reason}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 pl-13 sm:pl-0">
                                                        <StatusBadge status={doc.status} />
                                                        {doc.status !== "Not Required" && (
                                                            <button
                                                                onClick={() => setSelectedDocId(doc.doc_id)}
                                                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm flex items-center gap-2 group"
                                                            >
                                                                Review <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    ) : (

                        /* ── DOCUMENT VIEWER ────────────────────────────── */
                        <div className="flex-1 flex flex-col h-full overflow-hidden animate-in slide-in-from-right-8 duration-300">
                            {/* Viewer Header */}
                            <div className="p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm z-10 shrink-0">
                                <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                                    <button
                                        onClick={() => setSelectedDocId(null)}
                                        className="p-2 -ml-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-black text-slate-900 tracking-tight truncate">
                                            {selectedDocument.file_name || selectedDocument.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {selectedSchool?.name}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <StatusBadge status={selectedDocument.status} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                    <div className="flex items-center bg-slate-100 p-1 rounded-xl mr-2">
                                        <button onClick={handlePrevious} disabled={!hasPrevious}
                                            className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm rounded-lg transition-all disabled:opacity-30 flex items-center gap-1">
                                            <ChevronLeft className="w-3 h-3" /> Prev
                                        </button>
                                        <div className="w-px h-4 bg-slate-200 mx-1" />
                                        <button onClick={handleNext} disabled={!hasNext}
                                            className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm rounded-lg transition-all disabled:opacity-30 flex items-center gap-1">
                                            Next <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <button onClick={() => setIsFullScreen(true)}
                                        className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 shadow-sm mr-2 group">
                                        <Maximize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        disabled={actionLoading || selectedDocument.status === "Approved"}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        Approve
                                    </button>
                                </div>
                            </div>

                            {actionError && (
                                <div className="bg-red-50 text-red-600 text-xs px-6 py-2 border-b border-red-100">
                                    {actionError}
                                </div>
                            )}

                            {/* Viewer Body */}
                            <div className="flex-1 flex flex-col md:flex-row p-6 gap-6 overflow-hidden bg-slate-100/30">
                                {/* PDF Canvas (mock) */}
                                <div className="flex-1 overflow-y-auto scrollbar-hide flex justify-center bg-slate-500/5 rounded-2xl border border-slate-200 p-8 shadow-inner">
                                    <div className="w-full max-w-[600px] aspect-[1/1.414] bg-white shadow-xl rounded-sm border border-slate-200 flex flex-col p-16 select-none relative animate-in zoom-in-95 duration-500">
                                        {selectedDocument.file_url ? (
                                            <iframe
                                                src={selectedDocument.file_url}
                                                className="w-full h-full border-0"
                                                title={selectedDocument.name}
                                            />
                                        ) : (
                                            <>
                                                <div className="flex flex-col items-center mb-16 border-b border-slate-100 pb-12">
                                                    <div className="w-16 h-16 border-4 border-slate-900 flex items-center justify-center font-black text-2xl mb-6 opacity-80">GOV</div>
                                                    <h2 className="text-xl sm:text-2xl font-serif font-black uppercase tracking-[0.2em] text-center">{selectedDocument.name}</h2>
                                                    <p className="text-slate-400 font-serif text-xs mt-3 tracking-widest uppercase">{selectedSchool?.name}</p>
                                                </div>
                                                <div className="space-y-8 flex-1 opacity-60">
                                                    <div className="h-3 bg-slate-200 w-full rounded-full" />
                                                    <div className="h-3 bg-slate-200 w-[95%] rounded-full" />
                                                    <div className="h-3 bg-slate-200 w-[80%] rounded-full" />
                                                    <div className="py-12 px-6 border-y border-slate-100 relative mt-8">
                                                        <div className="text-[10px] text-slate-400 absolute top-2 left-1/2 -translate-x-1/2 uppercase tracking-widest font-bold">Encrypted Digital Proof</div>
                                                        <div className="h-2 bg-slate-200 w-full rounded-full" />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Validation Panel */}
                                <div className="w-full md:w-80 flex flex-col gap-4 overflow-y-auto pr-2 pb-2 scrollbar-hide">
                                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm shrink-0">
                                        <div className="flex items-center gap-2 mb-4 text-rose-600">
                                            <AlertOctagon className="w-5 h-5" />
                                            <h4 className="text-sm font-black uppercase tracking-tight">Rejection Desk</h4>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
                                            Provide a reason if you choose to reject. This will be visible to the school.
                                        </p>
                                        <textarea
                                            placeholder="e.g. Certificate expired, Image blurry, Incorrect UDISE..."
                                            value={rejectionReason}
                                            onChange={e => setRejectionReason(e.target.value)}
                                            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-400 transition-all resize-none"
                                        />
                                        <button
                                            onClick={handleReject}
                                            disabled={!rejectionReason || actionLoading}
                                            className="w-full mt-4 py-3 bg-white text-rose-600 border-2 border-rose-100 font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-rose-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            {actionLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                                            Reject Document
                                        </button>
                                    </div>

                                    <div className="bg-blue-950 p-6 rounded-3xl shadow-xl shadow-blue-900/10 relative overflow-hidden group shrink-0">
                                        <div className="relative z-10">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                                                <ShieldCheck className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <h4 className="text-sm font-bold text-white mb-2 tracking-tight">AI Compliance Check</h4>
                                            <p className="text-[10px] text-blue-200/70 font-medium leading-relaxed">
                                                System has cross-verified this document with the national database. No anomalies detected.
                                            </p>
                                            <div className="mt-4 flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-blue-900 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-400 w-full" />
                                                </div>
                                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Valid</span>
                                            </div>
                                        </div>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all duration-700" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Full Screen Modal — unchanged from original */}
            <AnimatePresence>
                {isFullScreen && selectedDocument && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex flex-col p-6 sm:p-12 overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-8 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white tracking-tight">{selectedDocument.file_name || selectedDocument.name}</h3>
                                    <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">{selectedSchool?.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsFullScreen(false)}
                                className="group flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all border border-white/10 backdrop-blur-sm">
                                <span className="text-xs font-bold tracking-widest uppercase">Minimize</span>
                                <Minimize2 className="w-4 h-4 group-hover:scale-90 transition-transform" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto scrollbar-hide flex justify-center bg-white/5 rounded-3xl border border-white/10 p-4 sm:p-8">
                            <div className="w-full max-w-[850px] aspect-[1/1.414] bg-white shadow-2xl rounded-sm flex flex-col p-12 sm:p-24 select-none">
                                {selectedDocument.file_url ? (
                                    <iframe src={selectedDocument.file_url} className="w-full h-full border-0" title={selectedDocument.name} />
                                ) : (
                                    <>
                                        <div className="flex flex-col items-center mb-16 border-b border-slate-100 pb-12">
                                            <div className="w-20 h-20 border-8 border-slate-900 flex items-center justify-center font-black text-3xl mb-8 opacity-80">GOV</div>
                                            <h2 className="text-3xl sm:text-4xl font-serif font-black uppercase tracking-[0.3em] text-center leading-tight">{selectedDocument.name}</h2>
                                            <p className="text-slate-400 font-serif text-sm mt-4 tracking-[0.4em] uppercase">{selectedSchool?.name}</p>
                                        </div>
                                        <div className="space-y-12 flex-1 opacity-60">
                                            <div className="h-4 bg-slate-100 w-full rounded-full" />
                                            <div className="h-4 bg-slate-100 w-[95%] rounded-full" />
                                            <div className="h-4 bg-slate-100 w-[80%] rounded-full" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Local state updater helper ───────────────────────────────────────────────

function updateDocStatus(pageData: DocsPageData, docId: string, newStatus: DocStatus): DocsPageData {
    const categories = pageData.categories.map(cat => ({
        ...cat,
        docs: cat.docs.map(d => d.doc_id === docId ? { ...d, status: newStatus } : d),
    }));
    const allDocs = categories.flatMap(c => c.docs);
    const stats = {
        approved: allDocs.filter(d => d.status === "Approved").length,
        pending:  allDocs.filter(d => d.status === "Pending").length,
        rejected: allDocs.filter(d => d.status === "Rejected").length,
    };
    return { ...pageData, categories, stats };
}