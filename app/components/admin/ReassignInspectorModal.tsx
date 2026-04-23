"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, User, Phone, Navigation, Sparkles, CheckCircle2, AlertTriangle, ArrowRightLeft, ChevronDown, MapPin, Calendar, Clock, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";
import type { InspectionData } from "@/app/admin/(main)/inspections/page";

interface Inspector {
    inspector_id: string;
    name: string;
    district: string;
    active_count: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    inspection: InspectionData | null;
    onSuccess?: () => void;
    token?: string;
}

export default function ReassignInspectorModal({ isOpen, onClose, inspection, onSuccess, token }: Props) {
    const [inspectors, setInspectors] = useState<Inspector[]>([]);
    const [selectedOfficer, setSelectedOfficer] = useState<Inspector | null>(null);
    const [officerDropdownOpen, setOfficerDropdownOpen] = useState(false);
    const [officerSearch, setOfficerSearch] = useState("");
    const [reason, setReason] = useState("");
    const [notifyOldOfficer, setNotifyOldOfficer] = useState(true);
    const [notifyNewOfficer, setNotifyNewOfficer] = useState(true);
    const [notifySchool, setNotifySchool] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Fetch inspectors
    useEffect(() => {
        if (!isOpen || !token) return;
        const fetchInspectors = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/admin/inspections/inspectors`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Failed to load inspectors");
                const data = await res.json();
                setInspectors(data.inspectors || []);
            } catch (err: any) {
                setErrorMsg(err.message);
            }
        };
        fetchInspectors();
    }, [isOpen, token]);

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setSelectedOfficer(null);
            setOfficerDropdownOpen(false);
            setOfficerSearch("");
            setReason("");
            setNotifyOldOfficer(true);
            setNotifyNewOfficer(true);
            setNotifySchool(false);
            setSubmitted(false);
            setErrorMsg(null);
        }
    }, [isOpen]);

    // Filter out current inspector
    const availableInspectors = useMemo(() => {
        if (!inspection) return [];
        const q = officerSearch.toLowerCase();
        return inspectors
            .filter((o) => o.name !== inspection.inspector)
            .filter((o) => !q || o.name.toLowerCase().includes(q) || o.district.toLowerCase().includes(q));
    }, [inspectors, officerSearch, inspection]);

    const suggestedIds = useMemo(() => {
        if (!inspection) return new Set<string>();
        return new Set(
            inspectors
                .filter((o) => o.district.toLowerCase() === inspection.district.toLowerCase() && o.name !== inspection.inspector)
                .map((o) => o.inspector_id)
        );
    }, [inspection, inspectors]);

    const canSubmit = selectedOfficer && reason;

    const handleSubmit = async () => {
        if (!canSubmit || !token || !inspection) return;
        setErrorMsg(null);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/inspections/${inspection.inspection_id}/reassign`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inspector: selectedOfficer.name,
                    inspector_id: selectedOfficer.inspector_id,
                    reason: reason,
                }),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || "Reassignment failed");
            }
            setSubmitted(true);
            setTimeout(() => {
                onSuccess?.();
                onClose();
            }, 2000);
        } catch (err: any) {
            setErrorMsg(err.message);
        }
    };

    if (!isOpen || !inspection) return null;

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
                        {inspection.name} reassigned to <span className="font-bold text-blue-600">{selectedOfficer?.name}</span>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300 shadow-2xl border border-slate-200/50">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <ArrowRightLeft className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-slate-900 tracking-tight">Reassign Inspector</h2>
                            <p className="text-[11px] text-slate-400">Change the assigned officer</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
                    {/* Current inspection info */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Current Inspection</p>
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-slate-900">{inspection.name}</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    <span className="text-[11px] text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> {inspection.date}</span>
                                    <span className="text-[11px] text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {inspection.time}</span>
                                </div>
                                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-[10px] font-bold text-rose-700">{inspection.inspector[0]}</div>
                                    <p className="text-xs text-slate-600">Currently assigned to <span className="font-bold">{inspection.inspector}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Select new officer */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Select New Officer</label>
                        <div className="relative">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    value={selectedOfficer ? selectedOfficer.name : officerSearch}
                                    onChange={(e) => { setOfficerSearch(e.target.value); setSelectedOfficer(null); setOfficerDropdownOpen(true); }}
                                    onFocus={() => setOfficerDropdownOpen(true)}
                                    placeholder="Search officers..."
                                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50/50"
                                />
                                <ChevronDown className={cn("absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-transform", officerDropdownOpen && "rotate-180")} />
                            </div>
                            {officerDropdownOpen && (
                                <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                                    {availableInspectors.length === 0 ? (
                                        <p className="p-4 text-xs text-slate-400 text-center">No officers found</p>
                                    ) : (
                                        availableInspectors.map((o) => {
                                            const isSuggested = suggestedIds.has(o.inspector_id);
                                            return (
                                                <button
                                                    key={o.inspector_id}
                                                    onClick={() => { setSelectedOfficer(o); setOfficerDropdownOpen(false); setOfficerSearch(""); }}
                                                    className={cn("w-full text-left px-4 py-3 hover:bg-blue-50/70 transition-colors border-b border-slate-50", isSuggested && "bg-emerald-50/40")}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-sm font-bold text-slate-800">{o.name}</p>
                                                                {isSuggested && <span className="text-[9px] bg-emerald-100 text-emerald-700 font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" /> Suggested</span>}
                                                            </div>
                                                            <p className="text-[11px] text-slate-400 mt-0.5">{o.district} · {o.active_count} active</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>
                        {selectedOfficer && (
                            <div className="mt-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">{selectedOfficer.name[0]}</div>
                                <div><p className="text-sm font-bold text-slate-900">{selectedOfficer.name}</p><p className="text-[11px] text-slate-500">{selectedOfficer.district}</p></div>
                            </div>
                        )}
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Reason for Reassignment</label>
                        <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50/50">
                            <option value="">Select a reason...</option>
                            <option value="Officer unavailable">Officer unavailable</option>
                            <option value="Schedule conflict">Schedule conflict</option>
                            <option value="Location proximity">Location proximity</option>
                            <option value="Workload balancing">Workload balancing</option>
                            <option value="Administrative decision">Administrative decision</option>
                        </select>
                    </div>

                    {/* Notifications */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Notifications</label>
                        <div className="space-y-2">
                            {[
                                { label: "Notify previous officer", checked: notifyOldOfficer, onChange: setNotifyOldOfficer },
                                { label: "Notify new officer", checked: notifyNewOfficer, onChange: setNotifyNewOfficer },
                                { label: "Notify school", checked: notifySchool, onChange: setNotifySchool },
                            ].map((item) => (
                                <label key={item.label} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50">
                                    <input type="checkbox" checked={item.checked} onChange={(e) => item.onChange(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                                    <p className="text-sm font-bold text-slate-700">{item.label}</p>
                                </label>
                            ))}
                        </div>
                    </div>

                    {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}
                </div>

                {/* Footer */}
                <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>{canSubmit && <span className="flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Ready</span>}</div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                        <button onClick={handleSubmit} disabled={!canSubmit} className={cn("px-6 py-2.5 rounded-xl text-sm font-bold transition-all", canSubmit ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-slate-200 text-slate-400 cursor-not-allowed")}>
                            Reassign Officer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}