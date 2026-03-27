"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, 
    Calendar, 
    Clock, 
    MapPin, 
    AlertTriangle, 
    CheckCircle2,
    CalendarClock,
    Navigation,
    Save
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RescheduleInspectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    inspection: {
        name: string;
        date: string;
        inspector: string;
        district: string;
        type: string;
    } | null;
}

const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM",
];

export default function RescheduleInspectionModal({ isOpen, onClose, inspection }: RescheduleInspectionModalProps) {
    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("10:30 AM");
    const [newLocation, setNewLocation] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (inspection && isOpen) {
            setNewDate(inspection.date);
            setNewLocation(`${inspection.district} Regional Hub`);
            setIsSaved(false);
        }
    }, [inspection, isOpen]);

    const handleReschedule = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            setIsSaved(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        }, 1500);
    };

    if (!inspection) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {isSaved ? (
                            <div className="p-12 text-center animate-in zoom-in-95 duration-300">
                                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-2">Rescheduled Successfully!</h2>
                                <p className="text-sm text-slate-500">The inspection for {inspection.name} has been updated.</p>
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
                                {/* Header */}
                                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                            <CalendarClock className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900">Reschedule Inspection</h2>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{inspection.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-8 space-y-6">
                                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                            Rescheduling requires notifying the inspector ({inspection.inspector}) and the school administration once the new slot is confirmed.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">New Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    type="date"
                                                    value={newDate}
                                                    onChange={(e) => setNewDate(e.target.value)}
                                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50/50 font-bold"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">New Time Slot</label>
                                            <div className="relative">
                                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <select
                                                    value={newTime}
                                                    onChange={(e) => setNewTime(e.target.value)}
                                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50/50 font-bold appearance-none"
                                                >
                                                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Location / Place</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={newLocation}
                                                onChange={(e) => setNewLocation(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm bg-slate-50/50 font-bold"
                                                placeholder="Enter specific meeting point or address..."
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex items-center gap-3">
                                        <button
                                            onClick={onClose}
                                            className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all border border-slate-200"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleReschedule}
                                            disabled={isSaving || !newDate || !newLocation}
                                            className="flex-[2] px-6 py-3.5 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    Confirm Reschedule
                                                </>
                                            )}
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
