"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, MapPin, AlertTriangle, CheckCircle2, CalendarClock, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";
import type { InspectionData } from "@/app/admin/(main)/inspections/page";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    inspection: InspectionData | null;
    token?: string;
    onSuccess?: () => void;
}

const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00",
];

export default function RescheduleInspectionModal({ isOpen, onClose, inspection, token, onSuccess }: Props) {
    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("");
    const [newLocation, setNewLocation] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (inspection && isOpen) {
            setNewDate(inspection.date);
            setNewTime(inspection.time || "10:00");
            setNewLocation(`${inspection.district} Regional Hub`);
            setIsSaved(false);
            setErrorMsg(null);
        }
    }, [inspection, isOpen]);

    const handleReschedule = async () => {
        if (!inspection || !token) return;
        setIsSaving(true);
        setErrorMsg(null);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/inspections/${inspection.inspection_id}/reschedule`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    date: newDate,
                    time: newTime,
                    location: newLocation,
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Failed to reschedule");
            }
            setIsSaved(true);
            setTimeout(() => {
                onSuccess?.();
                onClose();
            }, 2000);
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (!inspection) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
                        {isSaved ? (
                            <div className="p-12 text-center animate-in zoom-in-95 duration-300">
                                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-10 h-10 text-emerald-600" /></div>
                                <h2 className="text-2xl font-black text-slate-900 mb-2">Rescheduled Successfully!</h2>
                                <p className="text-sm text-slate-500">Inspection for {inspection.name} updated.</p>
                                <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 inline-block text-left">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">New Schedule</p>
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
                                        <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {newDate}</div>
                                        <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {newTime}</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20"><CalendarClock className="w-5 h-5 text-white" /></div>
                                        <div><h2 className="text-lg font-bold text-slate-900">Reschedule Inspection</h2><p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{inspection.name}</p></div>
                                    </div>
                                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-200 text-slate-400"><X className="w-5 h-5" /></button>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                                        <p className="text-xs text-amber-800 leading-relaxed font-medium">Rescheduling will notify the inspector and school.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">New Date</label><input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-200" /></div>
                                        <div><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">New Time</label><select value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-200">{timeSlots.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                                    </div>
                                    <div><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Location</label><input type="text" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-slate-200" placeholder="Meeting point" /></div>
                                    {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}
                                    <div className="flex items-center gap-3">
                                        <button onClick={onClose} className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-600 border border-slate-200">Cancel</button>
                                        <button onClick={handleReschedule} disabled={isSaving || !newDate || !newLocation} className="flex-[2] px-6 py-3.5 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:opacity-70 flex items-center justify-center gap-2">
                                            {isSaving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</> : <><Save className="w-4 h-4" /> Confirm Reschedule</>}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}