"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bell, Send, Users, Target, History, Search, CheckCircle2, Clock, MoreVertical, Mail, ChevronDown, Trash2, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ──────────────────────────────────────────────
interface NotificationHistoryItem {
    id: string;
    message: string;
    sentTo: string;
    date: string;
    status: "Delivered" | "Seen" | "Pending" | "Auto Generated";
    type: "Urgent" | "Informational" | "Update" | "Action Required";
    source?: "system" | "broadcast";   // ✅ ADD THIS
}
interface SchoolSearchResult {
    school_id: string;
    name: string;
    udise_number: string;
    district: string;
}

interface Inspector {
    inspector_id: string;
    name: string;
    district?: string;
    active_count: number;
}

// ─── API helpers ─────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export default function NotificationsPage() {
    // ── compose state ────────────────────────────────────
    const [target, setTarget] = useState<"All Schools" | "Inspectors">("All Schools");
    const [schoolSearch, setSchoolSearch] = useState("");
    const [schoolResults, setSchoolResults] = useState<SchoolSearchResult[]>([]);
    const [selectedSchools, setSelectedSchools] = useState<SchoolSearchResult[]>([]);
    const [schoolSearchLoading, setSchoolSearchLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const [inspectors, setInspectors] = useState<Inspector[]>([]);
    const [selectedInspector, setSelectedInspector] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);

    // ── history state ────────────────────────────────────
    const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [systemAlerts, setSystemAlerts] = useState(0);

    // ─────────────────────────────────────────────────────
    // Load initial data
    // ─────────────────────────────────────────────────────
    useEffect(() => {
        loadHistory();
        loadSystemAlerts();
    }, []);

    useEffect(() => {
        if (target === "Inspectors") loadInspectors();
    }, [target]);

    async function loadHistory() {
        setHistoryLoading(true);
        try {
            const data = await apiFetch<{ notifications: NotificationHistoryItem[]; total: number }>(
                "/api/admin/notifications/history"
            );

            setHistory(
                data.notifications.map((n) => ({
                    ...n,

                    // ✅ SAFE DEFAULT (important)
                    source: n.source ?? "broadcast",

                    // ✅ STATUS LOGIC
                    status:
                        (n.source ?? "broadcast") === "broadcast"
                            ? "Delivered"
                            : "Auto Generated",
                }))
            );

        } catch {
            // keep empty
        } finally {
            setHistoryLoading(false);
        }
    }

    async function loadSystemAlerts() {
        try {
            const data = await apiFetch<{ active_count: number }>("/api/admin/notifications/system-alerts");
            setSystemAlerts(data.active_count);
        } catch {
            setSystemAlerts(0);
        }
    }

    async function loadInspectors() {
        try {
            const data = await apiFetch<{ inspectors: Inspector[] }>(
                "/api/admin/notifications/inspectors"
            );
            setInspectors(data.inspectors);
        } catch {
            setInspectors([]);
        }
    }

    // ─────────────────────────────────────────────────────
    // School search (debounced)
    // ─────────────────────────────────────────────────────
    const searchSchools = useCallback(async (q: string) => {
        if (!q.trim()) {
            setSchoolResults([]);
            setShowDropdown(false);
            return;
        }
        setSchoolSearchLoading(true);
        try {
            const data = await apiFetch<{ schools: SchoolSearchResult[] }>(
                `/api/admin/notifications/schools?search=${encodeURIComponent(q)}&per_page=8`
            );
            setSchoolResults(data.schools);
            setShowDropdown(true);
        } catch {
            setSchoolResults([]);
        } finally {
            setSchoolSearchLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => searchSchools(schoolSearch), 350);
        return () => clearTimeout(timer);
    }, [schoolSearch, searchSchools]);

    // ─────────────────────────────────────────────────────
    // Send notification
    // ─────────────────────────────────────────────────────
    async function handleSend() {
        if (!message.trim()) return;
        setSending(true);
        try {
            let recipientType: string;
            let recipientId: string[] | string | undefined;
            if (target === "All Schools") {
                if (selectedSchools.length > 0) {
                    recipientType = "school";   // ✅ selected
                } else {
                    recipientType = "all_schools"; // ✅ no selection
                }
            } else {
                recipientType = "inspector";
                recipientId = selectedInspector || undefined;
            }
            await apiFetch("/api/admin/notifications/send", {
                method: "POST",
                body: JSON.stringify({
                    message,
                    recipient_type: recipientType,

                    // ✅ FINAL FIX
                    recipient_ids:
                        recipientType === "school"
                            ? selectedSchools.map(s => s.school_id)
                            : selectedInspector
                                ? [selectedInspector]
                                : [],

                    recipient_label:
                        target === "Inspectors"
                            ? (
                                selectedInspector
                                    ? (
                                        inspectors.find(i => i.inspector_id === selectedInspector)?.name
                                        || "Inspector"
                                    )
                                    : "All Inspectors"
                            )
                            : (
                                selectedSchools.length > 0
                                    ? selectedSchools.map(s => s.name).join(", ")
                                    : "All Schools"
                            ),
                }),
            });

            setSendSuccess(true);
            setMessage("");
            setSelectedSchools([]); setSchoolSearch("");
            setSelectedInspector("");
            loadHistory();
            setTimeout(() => setSendSuccess(false), 3000);
        } catch {
            // handle error
        } finally {
            setSending(false);
        }
    }

    // ─────────────────────────────────────────────────────
    // History actions
    // ─────────────────────────────────────────────────────
    async function handleDelete(id: string) {
        setActiveMenuId(null);
        try {
            await apiFetch(`/api/admin/notifications/${id}`, { method: "DELETE" });
            setHistory(prev => prev.filter(h => h.id !== id));
        } catch {
            // optimistic already done
        }
    }

    async function handleRemind(id: string) {
        setActiveMenuId(null);
        try {
            await apiFetch(`/api/admin/notifications/${id}/remind`, { method: "POST" });
        } catch {
            // silent
        }
    }

    // ─────────────────────────────────────────────────────
    // Recipient label (for disclaimer)
    // ─────────────────────────────────────────────────────
    const recipientLabel =
        target === "Inspectors"
            ? (selectedInspector || "All Inspectors")
            : (selectedSchools.length > 0
                ? `${selectedSchools.length} schools selected`
                : "All Schools");

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Channel &amp; Notifications</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">
                        Broadcast official circulars, reminders, and urgent alerts to schools and administrative units.
                    </p>
                </div>
                {systemAlerts > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
                        <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
                        <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                            {systemAlerts} System Alert{systemAlerts !== 1 ? "s" : ""} Active
                        </span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* ── Compose Panel ─────────────────────────────── */}
                <div className="lg:col-span-1 space-y-6 sticky top-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <Mail className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-800 tracking-tight">Compose Broadcast</h3>
                        </div>

                        <div className="space-y-6">
                            {/* Target tabs — only All Schools + Inspectors */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">
                                    Target Selection
                                </label>
                                <div className="flex gap-2 mb-3">
                                    {(["All Schools", "Inspectors"] as const).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => {
                                                setTarget(t);
                                                setSelectedSchools([]); setSchoolSearch("");
                                                setSchoolResults([]);
                                                setShowDropdown(false);
                                                setSelectedInspector("");
                                            }}
                                            className={cn(
                                                "flex-1 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all text-center",
                                                target === t
                                                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
                                                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                                            )}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>

                                {/* All Schools — school name search */}
                                {target === "All Schools" && (
                                    <div className="relative">
                                        <div className="relative">
                                            {schoolSearchLoading
                                                ? <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 animate-spin" />
                                                : <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                            }
                                            <input
                                                type="text"
                                                placeholder={selectedSchools.length > 0 ? `${selectedSchools.length} selected` : "Search school..."}
                                                value={schoolSearch}
                                                onChange={(e) => {
                                                    setSelectedSchools([]); setSchoolSearch(e.target.value);
                                                }}
                                                onFocus={() => schoolResults.length > 0 && setShowDropdown(true)}
                                                className={cn(
                                                    "w-full pl-9 pr-4 py-2.5 bg-slate-50 border rounded-xl text-[11px] font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all shadow-inner",
                                                    selectedSchools ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200"
                                                )}
                                            />

                                        </div>
                                        {selectedSchools.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {selectedSchools.map(s => (
                                                    <div key={s.school_id} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                                        {s.name}
                                                        <button
                                                            onClick={() =>
                                                                setSelectedSchools(prev => prev.filter(x => x.school_id !== s.school_id))
                                                            }
                                                            className="ml-1"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Dropdown results */}
                                        <AnimatePresence>
                                            {showDropdown && schoolResults.length > 0 && (<>
                                                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                                                <motion.div
                                                    initial={{ opacity: 0, y: -6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -6 }}
                                                    className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden"
                                                >
                                                    {schoolResults.map((s) => (
                                                        <button
                                                            key={s.school_id}
                                                            onClick={() => {
                                                                setSelectedSchools((prev: SchoolSearchResult[]) => {
                                                                    if (prev.find(x => x.school_id === s.school_id)) return prev;
                                                                    return [...prev, s];
                                                                });
                                                                setShowDropdown(false);
                                                                setSchoolSearch("");
                                                            }}
                                                            className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                                                        >
                                                            <p className="text-[11px] font-bold text-slate-800 truncate">{s.name}</p>
                                                            <p className="text-[10px] text-slate-400 font-medium">{s.district} · {s.udise_number}</p>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            </>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* Inspectors dropdown */}
                                {target === "Inspectors" && (
                                    <div className="relative group">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <select
                                            value={selectedInspector}
                                            onChange={(e) => setSelectedInspector(e.target.value)}
                                            className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all shadow-inner appearance-none cursor-pointer"
                                        >
                                            <option value="">All Inspection Officers</option>
                                            {inspectors.map((ins) => (
                                                <option key={ins.inspector_id} value={ins.inspector_id}>
                                                    {ins.name}{ins.district ? ` (${ins.district})` : ""}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                    </div>
                                )}
                            </div>

                            {/* Message */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">
                                    Message Content
                                </label>
                                <textarea
                                    placeholder="Type official notification message here..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all resize-none shadow-inner"
                                />
                            </div>

                            {/* Send button */}
                            <button
                                onClick={handleSend}
                                disabled={!message.trim() || sending}
                                className={cn(
                                    "w-full py-4 font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group",
                                    sendSuccess
                                        ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20"
                                )}
                            >
                                {sending
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                                    : sendSuccess
                                        ? <><CheckCircle2 className="w-4 h-4" /> Sent Successfully</>
                                        : <><Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /> Transmit Notification</>
                                }
                            </button>

                            <p className="text-[9px] text-slate-400 font-medium text-center leading-relaxed">
                                By sending this, you agree to broadcast this message to{" "}
                                <span className="text-slate-600 font-bold">{recipientLabel}</span>.
                                This action is logged in the audit history.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── History Panel ──────────────────────────────── */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                        {/* Header — no search bar */}
                        <div className="p-8 border-b border-slate-100 flex items-center gap-3 bg-white">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                                <History className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-800 tracking-tight">Notification History</h3>
                        </div>

                        {/* Table */}
                        <div className="flex-1 overflow-x-auto">
                            {historyLoading ? (
                                <div className="flex items-center justify-center h-64 gap-2 text-slate-400">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span className="text-xs font-bold">Loading history…</span>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="flex items-center justify-center h-64 text-slate-400">
                                    <p className="text-xs font-bold">No notifications sent yet.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black border-b border-slate-100 tracking-[0.1em]">
                                        <tr>
                                            <th className="px-8 py-4">Broadcast Message</th>
                                            <th className="px-8 py-4">Recipients</th>
                                            <th className="px-8 py-4">Date</th>
                                            <th className="px-8 py-4">Status</th>
                                            <th className="px-8 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {history.map((h) => (
                                            <tr key={h.id} className="hover:bg-slate-50/30 transition-colors group">
                                                <td className="px-8 py-6 max-w-sm">
                                                    <p className="text-xs font-bold text-slate-900 line-clamp-2 leading-relaxed">{h.message}</p>
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest mt-2 inline-block px-2 py-0.5 rounded",
                                                        h.type === "Urgent" ? "bg-rose-100 text-rose-600"
                                                            : h.type === "Informational" ? "bg-blue-100 text-blue-600"
                                                                : h.type === "Action Required" ? "bg-amber-100 text-amber-600"
                                                                    : "bg-slate-100 text-slate-600"
                                                    )}>{h.type}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                                                            <Target className="w-3 h-3 text-slate-400" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-600">{h.sentTo}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-[11px] font-bold text-slate-500">{h.date}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        {h.status === "Delivered"
                                                            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                            : h.status === "Seen"
                                                                ? <Users className="w-3.5 h-3.5 text-blue-500" />
                                                                : <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                        }
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{h.status}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right relative">
                                                    <button
                                                        onClick={() => setActiveMenuId(activeMenuId === h.id ? null : h.id)}
                                                        className={cn(
                                                            "p-2 rounded-xl transition-all border shadow-sm",
                                                            activeMenuId === h.id
                                                                ? "bg-blue-50 text-blue-600 border-blue-100"
                                                                : "text-slate-400 hover:text-blue-600 hover:bg-white border-transparent hover:border-slate-100"
                                                        )}
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>

                                                    <AnimatePresence>
                                                        {activeMenuId === h.id && (
                                                            <>
                                                                <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                    className="absolute right-8 top-16 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 z-20 py-2 overflow-hidden"
                                                                >
                                                                    <button
                                                                        onClick={() => handleRemind(h.id)}
                                                                        className="w-full px-4 py-2.5 text-left text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-3"
                                                                    >
                                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                                        Remind Again
                                                                    </button>
                                                                    <div className="h-px bg-slate-100 mx-2 my-1" />
                                                                    <button
                                                                        onClick={() => handleDelete(h.id)}
                                                                        className="w-full px-4 py-2.5 text-left text-[11px] font-bold text-rose-500 hover:bg-rose-50 transition-colors flex items-center gap-3"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                        Delete Record
                                                                    </button>
                                                                </motion.div>
                                                            </>
                                                        )}
                                                    </AnimatePresence>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30 rounded-b-[2.5rem]">
                            <p className="text-[11px] font-bold text-slate-400">
                                Total archived broadcasts: <span className="text-slate-900">{history.length}</span>
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={async () => {
                                        try {
                                            await apiFetch("/api/admin/notifications/history", { method: "DELETE" });
                                            setHistory([]);
                                        } catch { }
                                    }}
                                    className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    Clear All Logs
                                </button>
                                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                <button
                                    onClick={() => apiFetch("/api/admin/notifications/export")}
                                    className="text-[11px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    Export Record
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}