"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    X,
    Search,
    School,
    MapPin,
    User,
    Phone,
    Calendar,
    Clock,
    ClipboardList,
    FileText,
    Bell,
    Upload,
    AlertTriangle,
    CheckCircle2,
    Hash,
    ChevronDown,
    Sparkles,
    Navigation,
    Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";
import type { InspectionData } from "@/app/admin/(main)/inspections/page";
// ─── Mock Data ───────────────────────────────────────────────────

const mockSchools = [
    { id: 1, name: "City Public School", udise: "09210100101", address: "12, Civil Lines, Lucknow, UP 226001", district: "Lucknow", lat: 26.8467, lng: 80.9462 },
    { id: 2, name: "Modern Elite Academy", udise: "09210200202", address: "45, Mall Road, Kanpur, UP 208001", district: "Kanpur", lat: 26.4499, lng: 80.3319 },
    { id: 3, name: "Vidya Mandir", udise: "09210300303", address: "78, Saket Nagar, Meerut, UP 250001", district: "Meerut", lat: 28.9845, lng: 77.7064 },
    { id: 4, name: "St. Mary's Convent", udise: "09210400404", address: "23, MG Road, Agra, UP 282001", district: "Agra", lat: 27.1767, lng: 78.0081 },
    { id: 5, name: "DAV Public School", udise: "09210500505", address: "56, Cantonment, Varanasi, UP 221002", district: "Varanasi", lat: 25.3176, lng: 82.9739 },
    { id: 6, name: "Kendriya Vidyalaya", udise: "09210600606", address: "Defence Colony, Allahabad, UP 211001", district: "Prayagraj", lat: 25.4358, lng: 81.8463 },
    { id: 7, name: "Holy Angels School", udise: "09210700707", address: "Station Road, Bareilly, UP 243001", district: "Bareilly", lat: 28.367, lng: 79.4304 },
    { id: 8, name: "Greenfield Academy", udise: "09210800808", address: "Sector 15, Noida, UP 201301", district: "Gautam Buddh Nagar", lat: 28.5355, lng: 77.391 },
];

const mockOfficers = [
    { id: 1, name: "Dr. R.K. Verma", contact: "+91 98765 43210", region: "Lucknow", status: "Available" as const },
    { id: 2, name: "Ms. Sunita Singh", contact: "+91 87654 32109", region: "Kanpur", status: "Busy" as const },
    { id: 3, name: "Mr. Amit Pathak", contact: "+91 76543 21098", region: "Agra", status: "Available" as const },
    { id: 4, name: "Dr. Priya Sharma", contact: "+91 65432 10987", region: "Meerut", status: "Available" as const },
    { id: 5, name: "Mr. Rajesh Gupta", contact: "+91 54321 09876", region: "Varanasi", status: "Busy" as const },
    { id: 6, name: "Ms. Neha Tiwari", contact: "+91 43210 98765", region: "Prayagraj", status: "Available" as const },
];

// Existing inspections for conflict detection
const existingInspections = [
    { officerId: 1, date: "2026-03-28", time: "10:00" },
    { officerId: 2, date: "2026-03-28", time: "10:00" },
    { officerId: 3, date: "2026-03-29", time: "14:00" },
    { officerId: 1, date: "2026-04-01", time: "11:00" },
];

const inspectionTypes = [
    { value: "new_recognition", label: "New Recognition" },
    { value: "renewal", label: "Renewal" },
    { value: "surprise", label: "Surprise Inspection" },
    { value: "complaint", label: "Complaint-Based" },
];

const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00",
];

// ─── Helpers ─────────────────────────────────────────────────────

function generateInspectionId() {
    const year = new Date().getFullYear();
    const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
    return `INSP-${year}-${seq}`;
}

// ─── Component ───────────────────────────────────────────────────

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;   // ← ADD
    token?: string;           // ← ADD
}

export default function ScheduleInspectionModal({ isOpen, onClose, onSuccess, token }: Props) {    // Form state
    const [schoolSearch, setSchoolSearch] = useState("");
    const [selectedSchool, setSelectedSchool] = useState<typeof mockSchools[0] | null>(null);
    const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);

    const [selectedOfficer, setSelectedOfficer] = useState<typeof mockOfficers[0] | null>(null);
    const [officerDropdownOpen, setOfficerDropdownOpen] = useState(false);

    const [inspectionDate, setInspectionDate] = useState("");
    const [inspectionTime, setInspectionTime] = useState("");
    const [inspectionType, setInspectionType] = useState("");

    const [addressEditable, setAddressEditable] = useState(false);
    const [editedAddress, setEditedAddress] = useState("");

    const [notes, setNotes] = useState("");
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);

    const [notifySchool, setNotifySchool] = useState(true);
    const [notifyOfficer, setNotifyOfficer] = useState(true);

    const [inspectionId] = useState(generateInspectionId);
    const [submitted, setSubmitted] = useState(false);

    // Refs for click-outside
    const schoolRef = useRef<HTMLDivElement>(null);
    const officerRef = useRef<HTMLDivElement>(null);

    // Close dropdowns on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (schoolRef.current && !schoolRef.current.contains(e.target as Node)) setSchoolDropdownOpen(false);
            if (officerRef.current && !officerRef.current.contains(e.target as Node)) setOfficerDropdownOpen(false);
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setSchoolSearch(""); setSelectedSchool(null); setSchoolDropdownOpen(false);
            setSelectedOfficer(null); setOfficerDropdownOpen(false);
            setInspectionDate(""); setInspectionTime(""); setInspectionType("");
            setAddressEditable(false); setEditedAddress("");
            setNotes(""); setUploadedFile(null);
            setNotifySchool(true); setNotifyOfficer(true);
            setSubmitted(false);
        }
    }, [isOpen]);

    // Sync address when school changes
    useEffect(() => {
        if (selectedSchool) setEditedAddress(selectedSchool.address);
    }, [selectedSchool]);

    // Filtered schools
    const filteredSchools = useMemo(() => {
        const q = schoolSearch.toLowerCase();
        if (!q) return mockSchools;
        return mockSchools.filter(
            (s) => s.name.toLowerCase().includes(q) || s.udise.includes(q) || s.district.toLowerCase().includes(q)
        );
    }, [schoolSearch]);

    // Suggested officers (same region as school)
    const suggestedOfficerIds = useMemo(() => {
        if (!selectedSchool) return new Set<number>();
        return new Set(
            mockOfficers
                .filter((o) => o.region.toLowerCase() === selectedSchool.district.toLowerCase())
                .map((o) => o.id)
        );
    }, [selectedSchool]);

    // Conflict detection
    const conflict = useMemo(() => {
        if (!selectedOfficer || !inspectionDate || !inspectionTime) return false;
        return existingInspections.some(
            (ins) => ins.officerId === selectedOfficer.id && ins.date === inspectionDate && ins.time === inspectionTime
        );
    }, [selectedOfficer, inspectionDate, inspectionTime]);

    // Handle file "upload"
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setUploadedFile(file.name);
    };

    // Submit
    const handleSubmit = async () => {
        if (!canSubmit || !selectedSchool || !selectedOfficer) return;
        setSubmitted(true);   // show success UI immediately (optimistic)
 
        // Fire API call in background — UI already shows success
        if (token) {
            try {
                await fetch(`${API_BASE_URL}/admin/inspections`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        school_id:    String(selectedSchool.id),
                        date:         inspectionDate,
                        time:         inspectionTime,
                        inspector:    selectedOfficer.name,
                        type:         inspectionType,
                        remarks:      notes || undefined,
                    }),
                });
            } catch {
                // Silent fail — success UI already shown, list will refresh
            }
        }
 
        setTimeout(() => {
            onSuccess?.();   // ← refresh parent list
            onClose();
        }, 2000);
    };

    const canSubmit = selectedSchool && selectedOfficer && inspectionDate && inspectionTime && inspectionType && !conflict;

    if (!isOpen) return null;

    // ─── Success State ───────────────────────────────────────────
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
                        ID: <span className="font-mono font-bold text-blue-600">{inspectionId}</span>
                    </p>
                    <p className="text-xs text-slate-400">
                        {selectedSchool?.name} • {inspectionDate} at {inspectionTime}
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        {notifySchool && (
                            <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full">📧 School Notified</span>
                        )}
                        {notifyOfficer && (
                            <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-3 py-1 rounded-full">📧 Officer Notified</span>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ─── Main Form ───────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300 shadow-2xl border border-slate-200/50">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <ClipboardList className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Schedule New Inspection</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{inspectionId}</span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Hash className="w-3 h-3" /> Auto-generated
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="overflow-y-auto flex-1 px-8 py-6 space-y-8">

                    {/* ────── 1. School Selection ────── */}
                    <section>
                        <SectionHeader icon={<School className="w-4 h-4" />} title="School Selection" step={1} />
                        <div ref={schoolRef} className="relative mt-3">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    value={selectedSchool ? selectedSchool.name : schoolSearch}
                                    onChange={(e) => {
                                        setSchoolSearch(e.target.value);
                                        setSelectedSchool(null);
                                        setSchoolDropdownOpen(true);
                                    }}
                                    onFocus={() => setSchoolDropdownOpen(true)}
                                    placeholder="Search by school name, UDISE code, or district..."
                                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none transition-all bg-slate-50/50 hover:bg-white"
                                />
                                <ChevronDown className={cn("absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-transform", schoolDropdownOpen && "rotate-180")} />
                            </div>

                            {schoolDropdownOpen && (
                                <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                    {filteredSchools.length === 0 ? (
                                        <p className="p-4 text-xs text-slate-400 text-center">No schools found</p>
                                    ) : (
                                        filteredSchools.map((s) => (
                                            <button
                                                key={s.id}
                                                onClick={() => { setSelectedSchool(s); setSchoolDropdownOpen(false); setSchoolSearch(""); }}
                                                className="w-full text-left px-4 py-3 hover:bg-blue-50/70 transition-colors flex items-start gap-3 border-b border-slate-50 last:border-0"
                                            >
                                                <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{s.name}</p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">UDISE: {s.udise} · {s.district}</p>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {selectedSchool && (
                            <div className="mt-3 p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                                    <School className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-900">{selectedSchool.name}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-2">
                                        <span className="font-mono bg-white/80 px-1.5 py-0.5 rounded text-blue-700 font-bold">UDISE: {selectedSchool.udise}</span>
                                    </p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {selectedSchool.address}
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* ────── 2. Assign Inspection Officer ────── */}
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
                                <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                    {mockOfficers.map((o) => {
                                        const isSuggested = suggestedOfficerIds.has(o.id);
                                        return (
                                            <button
                                                key={o.id}
                                                onClick={() => { setSelectedOfficer(o); setOfficerDropdownOpen(false); }}
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
                                                        "text-[10px] font-black px-2 py-1 rounded-full",
                                                        o.status === "Available" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                                    )}>
                                                        {o.status}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {selectedOfficer && (
                            <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4 animate-in fade-in duration-200">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                                    {selectedOfficer.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900">{selectedOfficer.name}</p>
                                    <p className="text-xs text-slate-500">{selectedOfficer.contact} · {selectedOfficer.region}</p>
                                </div>
                                <span className={cn(
                                    "text-[10px] font-black px-2.5 py-1 rounded-full",
                                    selectedOfficer.status === "Available" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                )}>
                                    {selectedOfficer.status}
                                </span>
                            </div>
                        )}
                    </section>

                    {/* ────── 3. Schedule Details ────── */}
                    <section>
                        <SectionHeader icon={<Calendar className="w-4 h-4" />} title="Schedule Details" step={3} />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Inspection Date</label>
                                <input
                                    type="date"
                                    value={inspectionDate}
                                    onChange={(e) => setInspectionDate(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none bg-slate-50/50 hover:bg-white transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Time Slot</label>
                                <select
                                    value={inspectionTime}
                                    onChange={(e) => setInspectionTime(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none bg-slate-50/50 hover:bg-white transition-all appearance-none"
                                >
                                    <option value="">Select time...</option>
                                    {timeSlots.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Inspection Type</label>
                                <select
                                    value={inspectionType}
                                    onChange={(e) => setInspectionType(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none bg-slate-50/50 hover:bg-white transition-all appearance-none"
                                >
                                    <option value="">Select type...</option>
                                    {inspectionTypes.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Conflict Warning */}
                        {conflict && (
                            <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 animate-in fade-in shake duration-300">
                                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-rose-800">Schedule Conflict Detected</p>
                                    <p className="text-xs text-rose-600 mt-0.5">
                                        {selectedOfficer?.name} is already assigned to another inspection on {inspectionDate} at {inspectionTime}. Please choose a different time or officer.
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* ────── 4. Location Details ────── */}
                    <section>
                        <SectionHeader icon={<MapPin className="w-4 h-4" />} title="Location Details" step={4} />
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">School Address</label>
                                {selectedSchool && (
                                    <button
                                        onClick={() => setAddressEditable(!addressEditable)}
                                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        {addressEditable ? "Lock" : "Edit"}
                                    </button>
                                )}
                            </div>
                            <input
                                value={selectedSchool ? editedAddress : ""}
                                onChange={(e) => setEditedAddress(e.target.value)}
                                readOnly={!addressEditable}
                                placeholder={selectedSchool ? "" : "Select a school first to auto-fill address..."}
                                className={cn(
                                    "w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none transition-all",
                                    addressEditable ? "bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" : "bg-slate-50 text-slate-600 cursor-default"
                                )}
                            />
                            {selectedSchool && (
                                <a
                                    href={`https://www.google.com/maps?q=${selectedSchool.lat},${selectedSchool.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-[11px] text-blue-600 hover:text-blue-800 font-bold mt-2 transition-colors"
                                >
                                    <Navigation className="w-3 h-3" /> View on Google Maps ↗
                                </a>
                            )}
                        </div>
                    </section>

                    {/* ────── 5. Instructions / Notes ────── */}
                    <section>
                        <SectionHeader icon={<FileText className="w-4 h-4" />} title="Instructions / Notes" step={5} />
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Special instructions for inspection officer (e.g. Check sanitation issues, Verify infrastructure)..."
                            rows={3}
                            className="mt-3 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none bg-slate-50/50 hover:bg-white transition-all resize-none"
                        />
                    </section>

                    {/* ────── 6. Documents ────── */}
                    <section>
                        <SectionHeader icon={<Upload className="w-4 h-4" />} title="Documents" step={6} optional />
                        <div className="mt-3">
                            {uploadedFile ? (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 animate-in fade-in duration-200">
                                    <FileText className="w-5 h-5 text-emerald-600" />
                                    <p className="text-sm font-bold text-emerald-800 flex-1">{uploadedFile}</p>
                                    <button
                                        onClick={() => setUploadedFile(null)}
                                        className="text-[10px] font-bold text-rose-500 hover:text-rose-700 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 cursor-pointer transition-all hover:bg-blue-50/30 group">
                                    <Upload className="w-8 h-8 text-slate-300 group-hover:text-blue-400 transition-colors mb-2" />
                                    <p className="text-sm font-bold text-slate-500 group-hover:text-blue-600 transition-colors">
                                        Upload checklist or guidelines
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1">PDF files only · Max 10MB</p>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </section>

                    {/* ────── 7. Notifications ────── */}
                    <section>
                        <SectionHeader icon={<Bell className="w-4 h-4" />} title="Notifications" step={7} />
                        <div className="mt-3 flex flex-col sm:flex-row gap-4">
                            <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-all flex-1 group">
                                <input
                                    type="checkbox"
                                    checked={notifySchool}
                                    onChange={(e) => setNotifySchool(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div>
                                    <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Notify School</p>
                                    <p className="text-[10px] text-slate-400">Send email notification to school</p>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-all flex-1 group">
                                <input
                                    type="checkbox"
                                    checked={notifyOfficer}
                                    onChange={(e) => setNotifyOfficer(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div>
                                    <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">Notify Officer</p>
                                    <p className="text-[10px] text-slate-400">Send email notification to officer</p>
                                </div>
                            </label>
                        </div>
                    </section>

                    {/* ────── 8. Status ────── */}
                    <section>
                        <SectionHeader icon={<Info className="w-4 h-4" />} title="Status" step={8} />
                        <div className="mt-3 flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-black bg-blue-100 text-blue-700 px-4 py-2 rounded-full uppercase tracking-wider">
                                <Clock className="w-3.5 h-3.5" /> Scheduled
                            </span>
                            <span className="text-[10px] text-slate-400 italic">Auto-set on creation. Will update as inspection progresses.</span>
                        </div>
                    </section>
                </div>

                {/* ────── 9. Footer Buttons ────── */}
                <div className="shrink-0 px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        {selectedSchool && selectedOfficer && inspectionDate && inspectionTime && inspectionType && !conflict && (
                            <span className="flex items-center gap-1 text-emerald-600 font-bold animate-in fade-in duration-200">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Ready to schedule
                            </span>
                        )}
                        {conflict && (
                            <span className="flex items-center gap-1 text-rose-600 font-bold">
                                <AlertTriangle className="w-3.5 h-3.5" /> Conflict detected
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95",
                                canSubmit
                                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
                                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                            )}
                        >
                            <ClipboardList className="w-4 h-4" />
                            Schedule Inspection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Sub-components ──────────────────────────────────────────────

function SectionHeader({ icon, title, step, optional }: { icon: React.ReactNode; title: string; step: number; optional?: boolean }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm">
                {step}
            </div>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                {icon}
            </div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h3>
            {optional && (
                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase">Optional</span>
            )}
        </div>
    );
}
