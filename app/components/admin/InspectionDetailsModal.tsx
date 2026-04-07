"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Calendar,
    Clock,
    MapPin,
    User,
    Phone,
    Mail,
    Shield,
    FileText,
    AlertCircle,
    CheckCircle2,
    ArrowRight,
    Send,
    CalendarClock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";
import SendNotificationModal from "./SendNotificationModal";
import RescheduleInspectionModal from "./RescheduleInspectionModal";
import type { InspectionData } from "@/app/admin/(main)/inspections/page";

interface InspectionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    inspection: InspectionData | null;
    token?: string;              // ← ADD
    onStatusUpdate?: () => void; // ← ADD
}

export default function InspectionDetailsModal({
    isOpen, onClose, inspection, token, onStatusUpdate
}: InspectionDetailsModalProps) {
    const [showReschedule, setShowReschedule] = React.useState(false);
    const [showNotification, setShowNotification] = React.useState(false);

    if (!inspection) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
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
                        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                                    <Shield className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{inspection.name}</h2>
                                    <p className="text-blue-100 text-sm opacity-90">Scheduled Inspection Details</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 font-jakarta">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column: Inspection Info */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Schedule Information</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Date</p>
                                                    <p className="text-sm font-bold text-slate-900">{inspection.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600">
                                                    <Clock className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Time Slot</p>
                                                    <p className="text-sm font-bold text-slate-900">10:30 AM - 01:30 PM</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                                                    <MapPin className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase">District</p>
                                                    <p className="text-sm font-bold text-slate-900">{inspection.district}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Inspection Type</h3>
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold",
                                            inspection.type === "Regular" ? "bg-blue-50 text-blue-700" :
                                                inspection.type === "Surprise" ? "bg-rose-50 text-rose-700" :
                                                    "bg-amber-50 text-amber-700"
                                        )}>
                                            <Shield className="w-3.5 h-3.5" />
                                            {inspection.type} Audit Mode
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Inspector Info */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Assigned Inspector</h3>
                                        <div className="p-5 rounded-3xl bg-slate-900 text-white relative overflow-hidden group">
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-lg font-bold shadow-lg shadow-blue-500/30">
                                                        {inspection.inspector[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">{inspection.inspector}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium tracking-wide">Chief Education Inspector</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2.5">
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                                        <Phone className="w-3 h-3" /> +91 98765 43210
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                                        <Mail className="w-3 h-3" /> inspector.{inspection.inspector.split(' ')[1]?.toLowerCase() || 'edu'}@gov.in
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-2xl -mr-12 -mt-12 group-hover:bg-blue-500/20 transition-colors"></div>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl border border-blue-100 bg-blue-50/30">
                                        <div className="flex gap-3">
                                            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-blue-900 mb-1">Inspector Note</p>
                                                <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                                                    Infrastructure verification and student capacity audit mandatory for this session.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowReschedule(true)}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all border border-slate-200"
                                    >
                                        <CalendarClock className="w-4 h-4" />
                                        Reschedule
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (token && inspection?.inspection_id) {
                                                await fetch(
                                                    `${API_BASE_URL}/admin/inspections/${inspection.inspection_id}/status`,
                                                    {
                                                        method: "PATCH",
                                                        headers: {
                                                            Authorization: `Bearer ${token}`,
                                                            "Content-Type": "application/json",
                                                        },
                                                        body: JSON.stringify({ status: "Cancelled" }),
                                                    }
                                                );
                                                onStatusUpdate?.();
                                            }
                                            onClose();
                                        }}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all border border-rose-100"
                                    >
                                        Cancel Audit
                                    </button>
                                </div>
                                <button
                                    onClick={() => setShowNotification(true)}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 group"
                                >
                                    Send Notification Reminder
                                    <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Nested Modals */}
                    <SendNotificationModal
                        isOpen={showNotification}
                        onClose={() => setShowNotification(false)}
                        recipientName={inspection.inspector}
                        schoolName={inspection.name}
                    />

                    <RescheduleInspectionModal
                        isOpen={showReschedule}
                        onClose={() => setShowReschedule(false)}
                        inspection={inspection}
                    />
                </div>
            )}
        </AnimatePresence>
    );
}
