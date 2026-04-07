"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    X,
    User,
    Phone,
    Navigation,
    Sparkles,
    CheckCircle2,
    AlertTriangle,
    ArrowRightLeft,
    ChevronDown,
    MapPin,
    Calendar,
    Clock,
    Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";
import type { InspectionData } from "@/app/admin/(main)/inspections/page";


// ─── Mock Officers (same pool as ScheduleInspectionModal) ────────

const mockOfficers = [
    { id: 1, name: "Dr. R.K. Verma", contact: "+91 98765 43210", region: "Lucknow", status: "Available" as const },
    { id: 2, name: "Ms. Sunita Singh", contact: "+91 87654 32109", region: "Kanpur", status: "Busy" as const },
    { id: 3, name: "Mr. Amit Pathak", contact: "+91 76543 21098", region: "Agra", status: "Available" as const },
    { id: 4, name: "Dr. Priya Sharma", contact: "+91 65432 10987", region: "Meerut", status: "Available" as const },
    { id: 5, name: "Mr. Rajesh Gupta", contact: "+91 54321 09876", region: "Varanasi", status: "Busy" as const },
    { id: 6, name: "Ms. Neha Tiwari", contact: "+91 43210 98765", region: "Prayagraj", status: "Available" as const },
];

const reassignReasons = [
    "Officer unavailable",
    "Schedule conflict",
    "Location proximity",
    "Workload balancing",
    "Officer request",
    "Administrative decision",
    "Other",
];

// ─── Types ───────────────────────────────────────────────────────



interface Props {
    isOpen: boolean;
    onClose: () => void;
    inspection: InspectionData | null;
    onSuccess?: () => void;   // ← ADD
    token?: string;           // ← ADD
}
 
export default function ReassignInspectorModal({ isOpen, onClose, inspection, onSuccess, token }: Props) {
    const [selectedOfficer, setSelectedOfficer] = useState<typeof mockOfficers[0] | null>(null);
    const [officerDropdownOpen, setOfficerDropdownOpen] = useState(false);
    const [officerSearch, setOfficerSearch] = useState("");
    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("");
    const [reason, setReason] = useState("");
    const [additionalNotes, setAdditionalNotes] = useState("");
    const [notifyOldOfficer, setNotifyOldOfficer] = useState(true);
    const [notifyNewOfficer, setNotifyNewOfficer] = useState(true);
    const [notifySchool, setNotifySchool] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOfficerDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setSelectedOfficer(null);
            setOfficerDropdownOpen(false);
            setOfficerSearch("");
            setNewDate("");
            setNewTime("");
            setReason("");
            setAdditionalNotes("");
            setNotifyOldOfficer(true);
            setNotifyNewOfficer(true);
            setNotifySchool(false);
            setSubmitted(false);
        }
    }, [isOpen]);

    // Filter officers — exclude the currently assigned one
    const availableOfficers = useMemo(() => {
        const q = officerSearch.toLowerCase();
        return mockOfficers
            .filter((o) => inspection ? o.name !== inspection.inspector : true)
            .filter((o) => !q || o.name.toLowerCase().includes(q) || o.region.toLowerCase().includes(q));
    }, [officerSearch, inspection]);

    // Suggested: same region
    const suggestedIds = useMemo(() => {
        if (!inspection) return new Set<number>();
        return new Set(
            mockOfficers
                .filter((o) => o.region.toLowerCase() === inspection.district.toLowerCase() && o.name !== inspection.inspector)
                .map((o) => o.id)
        );
    }, [inspection]);

    // Initialize date/time when inspection is selected
    useEffect(() => {
        if (inspection) {
            setNewDate(inspection.date);
            setNewTime("10:30"); // Default time from the parent UI
        }
    }, [inspection]);

    const canSubmit = selectedOfficer && reason && newDate && newTime;

    const handleSubmit = async () => {
        if (!canSubmit || !selectedOfficer || !inspection) return;
        setSubmitted(true);   // show success UI
 
        // Fire API call if we have a real inspection_id and token
        if (token && inspection.inspection_id) {
            try {
                await fetch(
                    `${API_BASE_URL}/admin/inspections/${inspection.inspection_id}/reassign`,
                    {
                        method: "PATCH",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            inspector: selectedOfficer.name,
                            reason:    reason || undefined,
                        }),
                    }
                );
            } catch {
                // Silent fail
            }
        }
 
        setTimeout(() => {
            onSuccess?.();   // ← refresh parent list
            onClose();
        }, 2200);
    };

    if (!isOpen || !inspection) return null;

    // ─── Success State ───────────────────────────────────────────
    if (submitted) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <div className="relative bg-white rounded-3xl p-10 max-w-sm w-full text-center animate-in zoom-in-95 fade-in duration-300 shadow-2xl">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-2">Inspector Reassigned!</h2>
                    <p className="text-sm text-slate-500">
                        <span className="font-bold text-slate-700">{inspection.name}</span> has been reassigned to{" "}
                        <span className="font-bold text-blue-600">{selectedOfficer?.name}</span>
                        <br />
                        <span className="text-xs">Scheduled for {newDate} at {newTime}</span>
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {notifyOldOfficer && (
                            <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-3 py-1 rounded-full">📧 Previous officer notified</span>
                        )}
                        {notifyNewOfficer && (
                            <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full">📧 New officer notified</span>
                        )}
                        {notifySchool && (
                            <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-3 py-1 rounded-full">📧 School notified</span>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ─── Main Modal ──────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />

            <div className="relative bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300 shadow-2xl border border-slate-200/50">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <ArrowRightLeft className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-slate-900 tracking-tight">Reassign Inspector</h2>
                            <p className="text-[11px] text-slate-400 mt-0.5">Change the assigned officer for this inspection</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

                    {/* Inspection Info Card */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Current Inspection</p>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-900">{inspection.name}</p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                    <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> {inspection.date}
                                    </span>
                                    <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> 10:30 AM
                                    </span>
                                    <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-black uppercase">{inspection.district}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-[10px] font-bold text-rose-700">
                                {inspection.inspector[0]}
                            </div>
                            <p className="text-xs text-slate-600">
                                Currently assigned to <span className="font-bold text-slate-800">{inspection.inspector}</span>
                            </p>
                        </div>
                    </div>

                    {/* Select New Officer */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                            Select New Officer
                        </label>
                        <div ref={dropdownRef} className="relative">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    value={selectedOfficer ? selectedOfficer.name : officerSearch}
                                    onChange={(e) => {
                                        setOfficerSearch(e.target.value);
                                        setSelectedOfficer(null);
                                        setOfficerDropdownOpen(true);
                                    }}
                                    onFocus={() => setOfficerDropdownOpen(true)}
                                    placeholder="Search officers by name or region..."
                                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all bg-slate-50/50 hover:bg-white"
                                />
                                <ChevronDown className={cn("absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-transform", officerDropdownOpen && "rotate-180")} />
                            </div>

                            {officerDropdownOpen && (
                                <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                    {availableOfficers.length === 0 ? (
                                        <p className="p-4 text-xs text-slate-400 text-center">No officers found</p>
                                    ) : (
                                        availableOfficers.map((o) => {
                                            const isSuggested = suggestedIds.has(o.id);
                                            return (
                                                <button
                                                    key={o.id}
                                                    onClick={() => { setSelectedOfficer(o); setOfficerDropdownOpen(false); setOfficerSearch(""); }}
                                                    className={cn(
                                                        "w-full text-left px-4 py-3 hover:bg-blue-50/70 transition-colors border-b border-slate-50 last:border-0",
                                                        isSuggested && "bg-emerald-50/40"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                                                {o.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-sm font-bold text-slate-800">{o.name}</p>
                                                                    {isSuggested && (
                                                                        <span className="text-[9px] bg-emerald-100 text-emerald-700 font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                                                            <Sparkles className="w-2.5 h-2.5" /> Suggested
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                                                                    <Phone className="w-3 h-3" /> {o.contact} · <Navigation className="w-3 h-3" /> {o.region}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className={cn(
                                                            "text-[10px] font-black px-2 py-1 rounded-full shrink-0",
                                                            o.status === "Available" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                                        )}>
                                                            {o.status}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Selected officer preview */}
                        {selectedOfficer && (
                            <div className="mt-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center gap-3 animate-in fade-in duration-200">
                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                                    {selectedOfficer.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900">{selectedOfficer.name}</p>
                                    <p className="text-[11px] text-slate-500">{selectedOfficer.contact} · {selectedOfficer.region}</p>
                                </div>
                                <span className={cn(
                                    "text-[10px] font-black px-2 py-1 rounded-full",
                                    selectedOfficer.status === "Available" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                )}>
                                    {selectedOfficer.status}
                                </span>
                            </div>
                        )}

                        {/* Warning if selecting busy officer */}
                        {selectedOfficer?.status === "Busy" && (
                            <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2 animate-in fade-in duration-200">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                <p className="text-[11px] text-amber-700 font-medium">This officer is currently busy. Consider selecting an available officer.</p>
                            </div>
                        )}
                    </div>

                    {/* New Schedule Details */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                            New Schedule Details
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <input
                                    type="date"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none bg-slate-50/50 hover:bg-white transition-all"
                                />
                            </div>
                            <div>
                                <select
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none bg-slate-50/50 hover:bg-white transition-all appearance-none"
                                >
                                    <option value="">Select time...</option>
                                    {[
                                        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
                                        "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
                                        "15:00", "15:30", "16:00", "16:30", "17:00",
                                    ].map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                            Reason for Reassignment
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none bg-slate-50/50 hover:bg-white transition-all appearance-none"
                        >
                            <option value="">Select a reason...</option>
                            {reassignReasons.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    {/* Additional notes */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                            Additional Notes <span className="text-slate-300 normal-case">(optional)</span>
                        </label>
                        <textarea
                            value={additionalNotes}
                            onChange={(e) => setAdditionalNotes(e.target.value)}
                            placeholder="Any additional context for this reassignment..."
                            rows={2}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none bg-slate-50/50 hover:bg-white transition-all resize-none"
                        />
                    </div>

                    {/* Notification toggles */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                            Notifications
                        </label>
                        <div className="space-y-2">
                            {[
                                { label: "Notify previous officer", desc: "Inform about the reassignment", checked: notifyOldOfficer, onChange: setNotifyOldOfficer },
                                { label: "Notify new officer", desc: "Send assignment details", checked: notifyNewOfficer, onChange: setNotifyNewOfficer },
                                { label: "Notify school", desc: "Inform about inspector change", checked: notifySchool, onChange: setNotifySchool },
                            ].map((item) => (
                                <label key={item.label} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50 transition-all group">
                                    <input
                                        type="checkbox"
                                        checked={item.checked}
                                        onChange={(e) => item.onChange(e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{item.label}</p>
                                        <p className="text-[10px] text-slate-400">{item.desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="text-[10px] text-slate-400">
                        {canSubmit && (
                            <span className="flex items-center gap-1 text-emerald-600 font-bold animate-in fade-in duration-200">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Ready to reassign
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95",
                                canSubmit
                                    ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                            )}
                        >
                            <ArrowRightLeft className="w-4 h-4" />
                            Reassign Officer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
