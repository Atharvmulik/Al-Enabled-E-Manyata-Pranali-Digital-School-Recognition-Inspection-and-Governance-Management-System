"use client";

import React from "react";
import {
    ClipboardCheck, FileText, Check, X, AlertOctagon,
    Search, ShieldCheck, ChevronRight, ChevronLeft,
    Clock, MinusCircle, Maximize2, Minimize2, Loader2,
    RefreshCw, ExternalLink, RotateCcw, FileImage,
    CheckCircle2, XCircle, AlertCircle,
    MessageSquare, Eye,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type StoredUser = { user_id: string; email: string; role: string; access_token: string };

export type DocStatus = "Pending" | "Approved" | "Rejected" | "Not Required";
export type DocRequirement = "Mandatory" | "Conditional" | "Optional";

export interface DocumentItem {
    doc_id: string;
    name: string;
    status: DocStatus;
    requirement: DocRequirement;
    file_name?: string;
    file_url?: string;
    content_type?: string;
    uploaded_at?: string;
    category: string;
    rejected_reason?: string;
    admin_remarks?: string;
    preview_url?: string;
}

export interface DocumentCategory {
    category: string;
    docs: DocumentItem[];
}

interface SchoolDocSummary {
    school_id: string;
    name: string;
    pending_count: number;
    priority: "Urgent" | "Normal";
    review_status: "Pending" | "Reviewing" | "Rejected" | "Approved";
}

interface DocsPageData {
    school_id: string;
    school_name: string;
    stats: { approved: number; pending: number; rejected: number };
    categories: DocumentCategory[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getHeaders = (token: string) => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
});

// Only include documents that have a file_url
const flatDocs = (cats: DocumentCategory[]) =>
    cats
        .flatMap(c => c.docs)
        .filter(d => d.status !== "Not Required")
        .filter(d => !!d.file_url);

const cn = (...classes: (string | boolean | undefined)[]) =>
    classes.filter(Boolean).join(" ");

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: DocStatus }) => {
    switch (status) {
        case "Approved":
            return (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                    <Check className="w-3 h-3" /> Approved
                </span>
            );
        case "Rejected":
            return (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200">
                    <AlertOctagon className="w-3 h-3" /> Rejected
                </span>
            );
        case "Not Required":
            return (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full border border-slate-200">
                    <MinusCircle className="w-3 h-3" /> N/A
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                    <Clock className="w-3 h-3" /> Pending
                </span>
            );
    }
};

const FileIcon = ({ contentType }: { contentType?: string }) => {
    if (contentType?.includes("pdf")) return <FileText className="w-5 h-5" />;
    if (contentType?.includes("image")) return <FileImage className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
};

// ── Document Viewer ────────────────────────────────────────────────────────────

function DocumentViewer({
    doc,
    schoolName,
    onApprove,
    onReject,
    onReset,
    onNext,
    onPrevious,
    onBack,
    hasNext,
    hasPrevious,
    actionLoading,
    actionError,
}: {
    doc: DocumentItem;
    schoolName: string;
    onApprove: (remarks?: string) => void;
    onReject: (reason: string) => void;
    onReset: () => void;
    onNext: () => void;
    onPrevious: () => void;
    onBack: () => void;
    hasNext: boolean;
    hasPrevious: boolean;
    actionLoading: boolean;
    actionError: string | null;
}) {
    const [rejectionReason, setRejectionReason] = React.useState(doc.rejected_reason || "");
    const [approveRemarks, setApproveRemarks] = React.useState(doc.admin_remarks || "");
    const [fullScreen, setFullScreen] = React.useState(false);
    const [showApproveBox, setShowApproveBox] = React.useState(false);

    React.useEffect(() => {
        setRejectionReason(doc.rejected_reason || "");
        setApproveRemarks(doc.admin_remarks || "");
        setShowApproveBox(false);
    }, [doc.doc_id]);

    const isPDF =
        doc.content_type?.toLowerCase().includes("pdf") ||
        doc.file_url?.toLowerCase().includes(".pdf");
    const isImage =
        doc.content_type?.toLowerCase().includes("image") ||
        /\.(jpg|jpeg|png|webp|gif)$/i.test(doc.file_url || "");

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Viewer Header */}
            <div className="px-5 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between gap-4 shrink-0 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-colors shrink-0"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shrink-0",
                        doc.status === "Approved" ? "bg-emerald-500" :
                            doc.status === "Rejected" ? "bg-rose-500" : "bg-blue-600"
                    )}>
                        <FileIcon contentType={doc.content_type} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-slate-400 truncate">{schoolName}</span>
                            <span className="text-slate-200">•</span>
                            <StatusBadge status={doc.status} />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
                        <button
                            onClick={onPrevious}
                            disabled={!hasPrevious}
                            className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm rounded-lg transition-all disabled:opacity-30 flex items-center gap-1"
                        >
                            <ChevronLeft className="w-3 h-3" /> Prev
                        </button>
                        <div className="w-px h-4 bg-slate-200" />
                        <button
                            onClick={onNext}
                            disabled={!hasNext}
                            className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm rounded-lg transition-all disabled:opacity-30 flex items-center gap-1"
                        >
                            Next <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>

                    <button
                        onClick={() => setFullScreen(true)}
                        className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-colors border border-slate-200"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>

                    {doc.status !== "Pending" && (
                        <button
                            onClick={onReset}
                            disabled={actionLoading}
                            title="Reset to Pending"
                            className="p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-colors border border-slate-200 disabled:opacity-50"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        onClick={() => setShowApproveBox(v => !v)}
                        disabled={actionLoading || doc.status === "Approved"}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50",
                            doc.status === "Approved"
                                ? "bg-emerald-100 text-emerald-600 border border-emerald-200 cursor-default"
                                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20"
                        )}
                    >
                        {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        {doc.status === "Approved" ? "Approved" : "Approve"}
                    </button>
                </div>
            </div>

            {actionError && (
                <div className="bg-rose-50 border-b border-rose-100 text-rose-600 text-xs font-semibold px-5 py-2 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {actionError}
                </div>
            )}

            <div className="flex-1 flex flex-col md:flex-row gap-0 overflow-hidden">
                <div className="flex-1 overflow-auto bg-slate-100/40 flex items-start justify-center p-6">
                    {doc.file_url ? (
                        <div className="w-full max-w-2xl">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold text-slate-500">
                                    {doc.file_name || "Uploaded document"}
                                    {doc.uploaded_at && (
                                        <span className="ml-2 text-slate-400">
                                            · {new Date(doc.uploaded_at).toLocaleDateString()}
                                        </span>
                                    )}
                                </p>
                                <a
                                    href={doc.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Open full
                                </a>
                            </div>

                            {isPDF ? (
                                <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                                    <iframe
                                        src={`${doc.file_url}#toolbar=1&navpanes=1&scrollbar=1`}
                                        className="w-full border-0"
                                        style={{ height: "70vh" }}
                                        title={doc.name}
                                    />
                                </div>
                            ) : isImage ? (
                                <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden p-4">
                                    <img
                                        src={doc.file_url}
                                        alt={doc.name}
                                        className="w-full h-auto rounded-xl object-contain"
                                        style={{ maxHeight: "70vh" }}
                                    />
                                </div>
                            ) : (
                                <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-lg p-12 flex flex-col items-center gap-4 text-slate-400">
                                    <FileText className="w-16 h-16 opacity-20" />
                                    <p className="text-sm font-semibold">Preview not available for this file type.</p>
                                    <a
                                        href={doc.file_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors"
                                    >
                                        Download & View
                                    </a>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-4 py-24 text-slate-400">
                            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center">
                                <FileText className="w-10 h-10 opacity-30" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-slate-600">No file uploaded yet</p>
                                <p className="text-xs mt-1">The school has not uploaded this document.</p>
                            </div>
                            {doc.requirement === "Mandatory" && (
                                <span className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl">
                                    ⚠ Required — school must upload this
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="w-full md:w-80 shrink-0 border-l border-slate-100 bg-white overflow-y-auto flex flex-col gap-0">
                    <div className="p-5 border-b border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Document Info</p>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Status</span>
                                <StatusBadge status={doc.status} />
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Requirement</span>
                                <span className={cn(
                                    "font-bold",
                                    doc.requirement === "Mandatory" ? "text-rose-600" :
                                        doc.requirement === "Conditional" ? "text-amber-600" : "text-slate-500"
                                )}>{doc.requirement}</span>
                            </div>
                            {doc.file_name && (
                                <div className="flex justify-between gap-2">
                                    <span className="text-slate-500 shrink-0">File</span>
                                    <span className="font-medium text-slate-700 text-right truncate">{doc.file_name}</span>
                                </div>
                            )}
                            {doc.uploaded_at && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Uploaded</span>
                                    <span className="font-medium text-slate-700">
                                        {new Date(doc.uploaded_at).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {(doc.rejected_reason || doc.admin_remarks) && (
                        <div className={cn(
                            "p-4 border-b border-slate-100",
                            doc.status === "Rejected" ? "bg-rose-50" : "bg-emerald-50"
                        )}>
                            <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className={cn(
                                    "w-3.5 h-3.5",
                                    doc.status === "Rejected" ? "text-rose-500" : "text-emerald-500"
                                )} />
                                <p className={cn(
                                    "text-[10px] font-black uppercase tracking-widest",
                                    doc.status === "Rejected" ? "text-rose-600" : "text-emerald-600"
                                )}>
                                    {doc.status === "Rejected" ? "Rejection Reason" : "Admin Remarks"}
                                </p>
                            </div>
                            <p className={cn(
                                "text-xs font-medium leading-relaxed",
                                doc.status === "Rejected" ? "text-rose-700" : "text-emerald-700"
                            )}>
                                {doc.rejected_reason || doc.admin_remarks}
                            </p>
                        </div>
                    )}

                    {showApproveBox && (
                        <div className="p-5 border-b border-slate-100 bg-emerald-50/50">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-3">
                                Approve Document
                            </p>
                            <textarea
                                placeholder="Optional remarks for the school…"
                                value={approveRemarks}
                                onChange={e => setApproveRemarks(e.target.value)}
                                rows={3}
                                className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400/20 resize-none"
                            />
                            <button
                                onClick={() => onApprove(approveRemarks || undefined)}
                                disabled={actionLoading}
                                className="w-full mt-3 py-2.5 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {actionLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                                <Check className="w-3.5 h-3.5" /> Confirm Approve
                            </button>
                        </div>
                    )}

                    <div className="p-5 border-b border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-rose-600">Reject Document</p>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                            Provide a reason — this will be sent to the school as a notification.
                        </p>
                        <textarea
                            placeholder="e.g. Certificate expired, image blurry, wrong document uploaded…"
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                            rows={4}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-300 resize-none transition-all"
                        />
                        <button
                            onClick={() => onReject(rejectionReason)}
                            disabled={!rejectionReason.trim() || actionLoading}
                            className="w-full mt-3 py-2.5 bg-white text-rose-600 border-2 border-rose-100 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                        >
                            {actionLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                            <X className="w-3.5 h-3.5" /> Reject Document
                        </button>
                    </div>
                </div>
            </div>

            {fullScreen && doc.file_url && (
                <div className="fixed inset-0 z-[200] bg-slate-950/95 flex flex-col p-6">
                    <div className="flex items-center justify-between mb-4 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                                <FileIcon contentType={doc.content_type} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-white">{doc.name}</p>
                                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{schoolName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 px-4 py-2 bg-white/10 text-white text-xs font-bold rounded-xl hover:bg-white/20 transition-colors"
                            >
                                <ExternalLink className="w-3.5 h-3.5" /> Open tab
                            </a>
                            <button
                                onClick={() => setFullScreen(false)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-xs font-bold"
                            >
                                <Minimize2 className="w-4 h-4" /> Minimize
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 bg-white">
                        {isPDF ? (
                            <iframe
                                src={`${doc.file_url}#toolbar=1&navpanes=1&scrollbar=1`}
                                className="w-full h-full border-0"
                                title={doc.name}
                            />
                        ) : isImage ? (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 p-8">
                                <img src={doc.file_url} alt={doc.name} className="max-w-full max-h-full object-contain rounded-xl" />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                                <a href={doc.file_url} target="_blank" rel="noreferrer"
                                    className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700">
                                    Download File
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
    const [currentUser, setCurrentUser] = React.useState<StoredUser | null>(null);
    const [schools, setSchools] = React.useState<SchoolDocSummary[]>([]);
    const [totalPending, setTotalPending] = React.useState(0);
    const [schoolsLoading, setSchoolsLoading] = React.useState(true);
    const [schoolSearch, setSchoolSearch] = React.useState("");
    const [selectedSchool, setSelectedSchool] = React.useState<SchoolDocSummary | null>(null);
    const [pageData, setPageData] = React.useState<DocsPageData | null>(null);
    const [docsLoading, setDocsLoading] = React.useState(false);
    const [selectedDocId, setSelectedDocId] = React.useState<string | null>(null);
    const [actionLoading, setActionLoading] = React.useState(false);
    const [actionError, setActionError] = React.useState<string | null>(null);

    // Auth guard
    React.useEffect(() => {
        try {
            const raw = localStorage.getItem("user");
            if (!raw) { window.location.href = "/login"; return; }
            const parsed: StoredUser = JSON.parse(raw);
            if (parsed.role !== "admin") { window.location.href = "/login"; return; }
            setCurrentUser(parsed);
        } catch { window.location.href = "/login"; }
    }, []);

    // Fetch school list
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
            setSchools(data.schools || []);
            setTotalPending(data.total_pending || 0);

            if ((data.schools || []).length > 0 && !selectedSchool) {
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

    // Fetch documents for selected school
    React.useEffect(() => {
        if (!selectedSchool || !currentUser) return;
        setDocsLoading(true);
        setSelectedDocId(null);
        setPageData(null);
        setActionError(null);

        fetch(`${API_BASE_URL}/admin/documents/${selectedSchool.school_id}`, {
            headers: getHeaders(currentUser.access_token),
        })
            .then(r => r.json())
            .then(data => setPageData(data))
            .catch(console.error)
            .finally(() => setDocsLoading(false));
    }, [selectedSchool?.school_id, currentUser]);

    // Flat list for prev/next (only documents with file_url)
    const flatList = React.useMemo(() => pageData ? flatDocs(pageData.categories) : [], [pageData]);
    const selectedDoc = React.useMemo(() => flatList.find(d => d.doc_id === selectedDocId) ?? null, [flatList, selectedDocId]);
    const currentIndex = flatList.findIndex(d => d.doc_id === selectedDocId);
    const hasNext = currentIndex >= 0 && currentIndex < flatList.length - 1;
    const hasPrevious = currentIndex > 0;

    const handleNext = () => { if (hasNext) { setSelectedDocId(flatList[currentIndex + 1].doc_id); setActionError(null); } };
    const handlePrevious = () => { if (hasPrevious) { setSelectedDocId(flatList[currentIndex - 1].doc_id); setActionError(null); } };

    // Update local state helper
    const updateDocLocally = (docId: string, patch: Partial<DocumentItem>) => {
        setPageData(prev => {
            if (!prev) return prev;
            const categories = prev.categories.map(cat => ({
                ...cat,
                docs: cat.docs.map(d => d.doc_id === docId ? { ...d, ...patch } : d),
            }));
            const allDocs = categories.flatMap(c => c.docs);
            const stats = {
                approved: allDocs.filter(d => d.status === "Approved").length,
                pending: allDocs.filter(d => d.status === "Pending").length,
                rejected: allDocs.filter(d => d.status === "Rejected").length,
            };
            return { ...prev, categories, stats };
        });
    };

    // Approve
    const handleApprove = async (remarks?: string) => {
        if (!currentUser || !selectedSchool || !selectedDoc) return;
        setActionLoading(true);
        setActionError(null);
        try {
            const res = await fetch(
                `${API_BASE_URL}/admin/documents/${selectedSchool.school_id}/${selectedDoc.doc_id}/approve`,
                {
                    method: "POST",
                    headers: getHeaders(currentUser.access_token),
                    body: JSON.stringify({ admin_remarks: remarks || null }),
                },
            );
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.detail || "Approval failed");
            }
            updateDocLocally(selectedDoc.doc_id, { status: "Approved", admin_remarks: remarks });
            fetchSchools(currentUser.access_token, schoolSearch);
        } catch (e: any) {
            setActionError(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    // Reject
    const handleReject = async (reason: string) => {
        if (!currentUser || !selectedSchool || !selectedDoc || !reason.trim()) return;
        setActionLoading(true);
        setActionError(null);
        try {
            const res = await fetch(
                `${API_BASE_URL}/admin/documents/${selectedSchool.school_id}/${selectedDoc.doc_id}/reject`,
                {
                    method: "POST",
                    headers: getHeaders(currentUser.access_token),
                    body: JSON.stringify({ rejection_reason: reason }),
                },
            );
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.detail || "Rejection failed");
            }
            updateDocLocally(selectedDoc.doc_id, { status: "Rejected", rejected_reason: reason });
            fetchSchools(currentUser.access_token, schoolSearch);
        } catch (e: any) {
            setActionError(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    // Reset
    const handleReset = async () => {
        if (!currentUser || !selectedSchool || !selectedDoc) return;
        setActionLoading(true);
        setActionError(null);
        try {
            const res = await fetch(
                `${API_BASE_URL}/admin/documents/${selectedSchool.school_id}/${selectedDoc.doc_id}/reset`,
                { method: "POST", headers: getHeaders(currentUser.access_token) },
            );
            if (!res.ok) throw new Error("Reset failed");
            updateDocLocally(selectedDoc.doc_id, { status: "Pending", rejected_reason: undefined, admin_remarks: undefined });
            fetchSchools(currentUser.access_token, schoolSearch);
        } catch (e: any) {
            setActionError(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (!currentUser) return null;

    const reviewStatusStyle: Record<string, string> = {
        Approved: "text-emerald-500",
        Rejected: "text-rose-500",
        Reviewing: "text-amber-500",
        Pending: "text-slate-400",
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] space-y-5 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Document Verification</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Authentication of statutory certificates, safety records, and regulatory clearances.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => currentUser && fetchSchools(currentUser.access_token, schoolSearch)}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 shadow-sm">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {totalPending} Pending Audits
                        </span>
                    </div>
                </div>
            </div>

            {/* Main panel */}
            <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col md:flex-row min-h-0">
                {/* LEFT: School list */}
                <div className="w-full md:w-72 shrink-0 border-r border-slate-100 flex flex-col bg-slate-50/30 min-h-0">
                    <div className="p-4 border-b border-slate-100 bg-white/60 shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search schools…"
                                value={schoolSearch}
                                onChange={e => setSchoolSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all shadow-sm"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                        {schoolsLoading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                            </div>
                        ) : schools.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                                <ClipboardCheck className="w-8 h-8 opacity-30" />
                                <p className="text-xs">No submitted schools found</p>
                            </div>
                        ) : (
                            schools.map(school => (
                                <button
                                    key={school.school_id}
                                    onClick={() => setSelectedSchool(school)}
                                    className={cn(
                                        "w-full text-left p-4 transition-all relative",
                                        selectedSchool?.school_id === school.school_id
                                            ? "bg-white shadow-[inset_3px_0_0_0_#2563eb]"
                                            : "hover:bg-white/70"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1.5">
                                        <p className={cn(
                                            "text-xs font-black uppercase tracking-tight leading-tight pr-2",
                                            selectedSchool?.school_id === school.school_id
                                                ? "text-blue-700" : "text-slate-700"
                                        )}>
                                            {school.name}
                                        </p>
                                        <span className={cn(
                                            "text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest shrink-0",
                                            school.priority === "Urgent"
                                                ? "bg-rose-100 text-rose-600"
                                                : "bg-slate-100 text-slate-500"
                                        )}>
                                            {school.priority}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] text-slate-500 font-semibold">
                                            {school.pending_count} pending
                                        </p>
                                        <span className={cn(
                                            "text-[9px] font-bold",
                                            reviewStatusStyle[school.review_status] ?? "text-slate-400"
                                        )}>
                                            {school.review_status}
                                        </span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT: Document panel */}
                <div className="flex-1 flex flex-col min-h-0 min-w-0">
                    {docsLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-3 text-slate-400">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                                <p className="text-xs">Loading documents…</p>
                            </div>
                        </div>
                    ) : !pageData ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400">
                            <div className="text-center">
                                <ClipboardCheck className="w-12 h-12 opacity-20 mx-auto mb-3" />
                                <p className="text-sm font-semibold">Select a school to review documents</p>
                            </div>
                        </div>
                    ) : selectedDoc ? (
                        <DocumentViewer
                            doc={selectedDoc}
                            schoolName={pageData.school_name}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onReset={handleReset}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            onBack={() => setSelectedDocId(null)}
                            hasNext={hasNext}
                            hasPrevious={hasPrevious}
                            actionLoading={actionLoading}
                            actionError={actionError}
                        />
                    ) : (
                        /* Document list – only categories with uploaded docs are shown */
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="max-w-3xl mx-auto space-y-6">
                                {/* Stats bar */}
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div>
                                        <h2 className="text-lg font-black text-slate-900">{pageData.school_name}</h2>
                                        <p className="text-xs text-slate-500 mt-0.5">Select any document to review</p>
                                    </div>
                                    <div className="flex items-center gap-5 text-[11px] font-bold text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                            <span>{pageData.stats.approved} Approved</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                                            <span>{pageData.stats.pending} Pending</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                            <span>{pageData.stats.rejected} Rejected</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Categories – skip those with no visible docs */}
                                {pageData.categories.map((category, ci) => {
                                    const visibleDocs = category.docs.filter(doc => !!doc.file_url);
                                    if (visibleDocs.length === 0) return null;
                                    return (
                                        <div key={ci} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100">
                                                <h3 className="text-sm font-bold text-slate-700">{category.category}</h3>
                                            </div>
                                            <div className="divide-y divide-slate-50">
                                                {visibleDocs.map(doc => (
                                                    <div
                                                        key={doc.doc_id}
                                                        className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className={cn(
                                                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                                                doc.status === "Approved" ? "bg-emerald-50 text-emerald-500" :
                                                                    doc.status === "Rejected" ? "bg-rose-50 text-rose-500" :
                                                                        doc.status === "Not Required" ? "bg-slate-100 text-slate-400" :
                                                                            doc.file_url ? "bg-blue-50 text-blue-500" :
                                                                                "bg-amber-50 text-amber-500"
                                                            )}>
                                                                <FileIcon contentType={doc.content_type} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <p className={cn(
                                                                        "text-sm font-bold truncate",
                                                                        doc.status === "Not Required"
                                                                            ? "text-slate-400 line-through"
                                                                            : "text-slate-800"
                                                                    )}>
                                                                        {doc.name}
                                                                    </p>
                                                                    {doc.requirement === "Mandatory" && (
                                                                        <span className="text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-500 px-1.5 py-0.5 rounded-md border border-rose-100">
                                                                            Required
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                                                                    {doc.file_name || "File uploaded"}
                                                                    {doc.uploaded_at && (
                                                                        <span className="ml-1.5">
                                                                            · {new Date(doc.uploaded_at).toLocaleDateString()}
                                                                        </span>
                                                                    )}
                                                                </p>
                                                                {doc.status === "Rejected" && doc.rejected_reason && (
                                                                    <p className="text-[10px] text-rose-500 mt-1 font-semibold">
                                                                        ✗ {doc.rejected_reason}
                                                                    </p>
                                                                )}
                                                                {doc.status === "Approved" && doc.admin_remarks && (
                                                                    <p className="text-[10px] text-emerald-600 mt-1 font-semibold">
                                                                        ✓ {doc.admin_remarks}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 shrink-0">
                                                            <StatusBadge status={doc.status} />
                                                            {doc.status !== "Not Required" && (
                                                                <button
                                                                    onClick={() => setSelectedDocId(doc.doc_id)}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                    Review
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}