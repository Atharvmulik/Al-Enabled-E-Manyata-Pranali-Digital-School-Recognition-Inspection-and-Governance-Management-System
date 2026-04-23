"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    X, Search, School, MapPin, User, Phone, Calendar, Clock, ClipboardList,
    FileText, Bell, Upload, AlertTriangle, CheckCircle2, Hash, ChevronDown,
    Sparkles, Navigation, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

interface EligibleSchool {
    school_id: string;
    school_name: string;
    district: string;
    application_status: string;
    profile_status: string;
    documents_verified: boolean;
    eligible_for_inspection: boolean;
}

interface Inspector {
    inspector_id: string;
    name: string;
    district: string;
    active_count: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    token?: string;
}

const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00",
];

const inspectionTypes = [
    { value: "Regular", label: "Regular" },
    { value: "Surprise", label: "Surprise" },
    { value: "Re-inspection", label: "Re-inspection" },
    { value: "Follow-up", label: "Follow-up" },
];

export default function ScheduleInspectionModal({ isOpen, onClose, onSuccess, token }: Props) {
    // Schools from backend
    const [eligibleSchools, setEligibleSchools] = useState<EligibleSchool[]>([]);
    const [schoolSearch, setSchoolSearch] = useState("");
    const [selectedSchool, setSelectedSchool] = useState<EligibleSchool | null>(null);
    const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
    const schoolRef = useRef<HTMLDivElement>(null);

    // Inspectors from backend
    const [inspectors, setInspectors] = useState<Inspector[]>([]);
    const [selectedOfficer, setSelectedOfficer] = useState<Inspector | null>(null);
    const [officerDropdownOpen, setOfficerDropdownOpen] = useState(false);
    const officerRef = useRef<HTMLDivElement>(null);

    const [inspectionDate, setInspectionDate] = useState("");
    const [inspectionTime, setInspectionTime] = useState("");
    const [inspectionType, setInspectionType] = useState("");
    const [notes, setNotes] = useState("");
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);
    const [notifySchool, setNotifySchool] = useState(true);
    const [notifyOfficer, setNotifyOfficer] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loadingData, setLoadingData] = useState(true);

    // Fetch eligible schools and inspectors on mount
    useEffect(() => {
        if (!isOpen || !token) return;
        const fetchData = async () => {
            setLoadingData(true);
            setErrorMsg(null);
            try {
                const [schoolsRes, inspectorsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/admin/inspections/eligible-schools`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${API_BASE_URL}/admin/inspections/inspectors`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);
                if (!schoolsRes.ok) throw new Error("Failed to fetch eligible schools");
                if (!inspectorsRes.ok) throw new Error("Failed to fetch inspectors");
                const schoolsData = await schoolsRes.json();
                const inspectorsData = await inspectorsRes.json();
                setEligibleSchools(schoolsData.schools || []);
                setInspectors(inspectorsData.inspectors || []);
            } catch (err: any) {
                setErrorMsg(err.message);
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [isOpen, token]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSchoolSearch("");
            setSelectedSchool(null);
            setSchoolDropdownOpen(false);
            setSelectedOfficer(null);
            setOfficerDropdownOpen(false);
            setInspectionDate("");
            setInspectionTime("");
            setInspectionType("");
            setNotes("");
            setUploadedFile(null);
            setNotifySchool(true);
            setNotifyOfficer(true);
            setSubmitted(false);
            setErrorMsg(null);
        }
    }, [isOpen]);

    // Close dropdowns on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (schoolRef.current && !schoolRef.current.contains(e.target as Node)) setSchoolDropdownOpen(false);
            if (officerRef.current && !officerRef.current.contains(e.target as Node)) setOfficerDropdownOpen(false);
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filteredSchools = useMemo(() => {
        const q = schoolSearch.toLowerCase();
        if (!q) return eligibleSchools;
        return eligibleSchools.filter(
            (s) => s.school_name.toLowerCase().includes(q) || s.district.toLowerCase().includes(q)
        );
    }, [schoolSearch, eligibleSchools]);

    // Suggested officers: same district as selected school
    const suggestedOfficerIds = useMemo(() => {
        if (!selectedSchool) return new Set<string>();
        return new Set(
            inspectors.filter((o) => o.district.toLowerCase() === selectedSchool.district.toLowerCase())
                .map((o) => o.inspector_id)
        );
    }, [selectedSchool, inspectors]);

    const canSubmit = selectedSchool && selectedOfficer && inspectionDate && inspectionTime && inspectionType;

    const handleSubmit = async () => {
        if (!canSubmit || !token) return;
        setErrorMsg(null);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/inspections`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    school_id: selectedSchool.school_id,
                    date: inspectionDate,
                    time: inspectionTime,
                    inspector: selectedOfficer.name,
                    inspector_id: selectedOfficer.inspector_id,
                    type: inspectionType,
                    remarks: notes || undefined,
                }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || "Failed to schedule inspection");
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

    if (!isOpen) return null;

    if (submitted) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <div className="relative bg-white rounded-3xl p-12 max-w-md w-full text-center animate-in zoom-in-95 fade-in duration-300 shadow-2xl">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Inspection Scheduled!</h2>
                    <p className="text-sm text-slate-500 mb-4">
                        {selectedSchool?.school_name} • {inspectionDate} at {inspectionTime}
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        {notifySchool && <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full">📧 School Notified</span>}
                        {notifyOfficer && <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-3 py-1 rounded-full">📧 Officer Notified</span>}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />

            <div className="relative bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300 shadow-2xl border border-slate-200/50">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <ClipboardList className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Schedule New Inspection</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="overflow-y-auto flex-1 px-8 py-6 space-y-8">
                    {loadingData ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : errorMsg ? (
                        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm">{errorMsg}</div>
                    ) : (
                        <>
                            {/* School Selection */}
                            <section>
                                <SectionHeader icon={<School className="w-4 h-4" />} title="School Selection" step={1} />
                                <div ref={schoolRef} className="relative mt-3">
                                    <div className="relative">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            value={selectedSchool ? selectedSchool.school_name : schoolSearch}
                                            onChange={(e) => { setSchoolSearch(e.target.value); setSelectedSchool(null); setSchoolDropdownOpen(true); }}
                                            onFocus={() => setSchoolDropdownOpen(true)}
                                            placeholder="Search eligible schools..."
                                            className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none bg-slate-50/50"
                                        />
                                        <ChevronDown className={cn("absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-transform", schoolDropdownOpen && "rotate-180")} />
                                    </div>
                                    {schoolDropdownOpen && (
                                        <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                                            {filteredSchools.length === 0 ? (
                                                <p className="p-4 text-xs text-slate-400 text-center">No eligible schools found</p>
                                            ) : (
                                                filteredSchools.map((s) => (
                                                    <button
                                                        key={s.school_id}
                                                        onClick={() => { setSelectedSchool(s); setSchoolDropdownOpen(false); setSchoolSearch(""); }}
                                                        className="w-full text-left px-4 py-3 hover:bg-blue-50/70 transition-colors flex items-start gap-3 border-b border-slate-50"
                                                    >
                                                        <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800">{s.school_name}</p>
                                                            <p className="text-[11px] text-slate-400 mt-0.5">{s.district} · {s.application_status}</p>
                                                            <div className="flex gap-2 mt-1">
                                                                <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">✅ Documents Verified</span>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                                {selectedSchool && (
                                    <div className="mt-3 p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-3">
                                        <School className="w-5 h-5 text-blue-600 shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{selectedSchool.school_name}</p>
                                            <p className="text-xs text-slate-500">{selectedSchool.district}</p>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Assign Officer */}
                            <section>
                                <SectionHeader icon={<User className="w-4 h-4" />} title="Assign Inspection Officer" step={2} />
                                <div ref={officerRef} className="relative mt-3">
                                    <button
                                        onClick={() => setOfficerDropdownOpen(!officerDropdownOpen)}
                                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50/50 hover:bg-white transition-all"
                                    >
                                        <span className={selectedOfficer ? "text-slate-900 font-bold" : "text-slate-400"}>
                                            {selectedOfficer ? selectedOfficer.name : "Select an inspection officer..."}
                                        </span>
                                        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", officerDropdownOpen && "rotate-180")} />
                                    </button>
                                    {officerDropdownOpen && (
                                        <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                                            {inspectors.map((o) => {
                                                const isSuggested = suggestedOfficerIds.has(o.inspector_id);
                                                return (
                                                    <button
                                                        key={o.inspector_id}
                                                        onClick={() => { setSelectedOfficer(o); setOfficerDropdownOpen(false); }}
                                                        className={cn("w-full text-left px-4 py-3 hover:bg-blue-50/70 transition-colors border-b border-slate-50", isSuggested && "bg-emerald-50/40")}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-sm font-bold text-slate-800">{o.name}</p>
                                                                    {isSuggested && <span className="text-[9px] bg-emerald-100 text-emerald-700 font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5" /> Suggested</span>}
                                                                </div>
                                                                <p className="text-[11px] text-slate-400 mt-0.5">{o.district} · {o.active_count} active inspections</p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Schedule Details */}
                            <section>
                                <SectionHeader icon={<Calendar className="w-4 h-4" />} title="Schedule Details" step={3} />
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Date</label>
                                        <input type="date" value={inspectionDate} onChange={(e) => setInspectionDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Time</label>
                                        <select value={inspectionTime} onChange={(e) => setInspectionTime(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm">
                                            <option value="">Select time...</option>
                                            {timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Type</label>
                                        <select value={inspectionType} onChange={(e) => setInspectionType(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm">
                                            <option value="">Select type...</option>
                                            {inspectionTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Notes */}
                            <section>
                                <SectionHeader icon={<FileText className="w-4 h-4" />} title="Instructions / Notes" step={4} optional />
                                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special instructions for inspector..." rows={3} className="mt-3 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none" />
                            </section>

                            {/* Notifications */}
                            <section>
                                <SectionHeader icon={<Bell className="w-4 h-4" />} title="Notifications" step={5} />
                                <div className="mt-3 flex flex-col sm:flex-row gap-4">
                                    <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 flex-1">
                                        <input type="checkbox" checked={notifySchool} onChange={(e) => setNotifySchool(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                                        <div><p className="text-sm font-bold text-slate-700">Notify School</p><p className="text-[10px] text-slate-400">Send email notification</p></div>
                                    </label>
                                    <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 flex-1">
                                        <input type="checkbox" checked={notifyOfficer} onChange={(e) => setNotifyOfficer(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                                        <div><p className="text-sm font-bold text-slate-700">Notify Officer</p><p className="text-[10px] text-slate-400">Send email notification</p></div>
                                    </label>
                                </div>
                            </section>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="text-[10px] text-slate-400">
                        {errorMsg && <span className="text-red-600">{errorMsg}</span>}
                        {canSubmit && !errorMsg && <span className="flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Ready to schedule</span>}
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                        <button onClick={handleSubmit} disabled={!canSubmit || loadingData} className={cn("px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2", canSubmit && !loadingData ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-200 text-slate-400 cursor-not-allowed")}>
                            <ClipboardList className="w-4 h-4" /> Schedule Inspection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SectionHeader({ icon, title, step, optional }: { icon: React.ReactNode; title: string; step: number; optional?: boolean }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm">{step}</div>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">{icon}</div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h3>
            {optional && <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase">Optional</span>}
        </div>
    );
}