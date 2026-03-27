"use client";

import React, { useState } from "react";
import ScheduleInspectionModal from "@/app/components/admin/ScheduleInspectionModal";
import ReassignInspectorModal, { type InspectionData } from "@/app/components/admin/ReassignInspectorModal";
import InspectionDetailsModal from "@/app/components/admin/InspectionDetailsModal";
import {
    SearchCheck,
    Calendar,
    MapPin,
    ClipboardList,
    Plus,
    User,
    ChevronRight,
    Clock,
    ExternalLink,
    Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const pendingInspections = [
    { name: "City Public School", date: "2026-03-05", inspector: "Dr. R.K. Verma", district: "Lucknow", type: "Regular" },
    { name: "Modern Elite Academy", date: "2026-03-07", inspector: "Ms. Sunita Singh", district: "Kanpur", type: "Surprise" },
    { name: "Vidya Mandir", date: "2026-03-10", inspector: "TBD", district: "Meerut", type: "Re-inspection" },
    { name: "St. Mary's Convent", date: "2026-03-12", inspector: "Mr. Amit Pathak", district: "Agra", type: "Regular" },
];

export default function InspectionsPage() {
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [reassignTarget, setReassignTarget] = useState<InspectionData | null>(null);
    const [selectedInspection, setSelectedInspection] = useState<InspectionData | null>(null);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Inspection Management</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Orchestrate site visits, assign inspectors, and monitor compliance reporting.
                    </p>
                </div>
                <button
                    onClick={() => setShowScheduleModal(true)}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    Schedule New Inspection
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 tracking-tight">Pending Inspections</h3>
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">14 Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="text-xs font-bold text-blue-600 hover:underline">View Calendar</button>
                    </div>
                </div>

                <div className="divide-y divide-slate-100">
                    {pendingInspections.map((insp, i) => (
                        <div key={i} className="p-6 hover:bg-slate-50/50 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors shadow-inner">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{insp.name}</h4>
                                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1.5">
                                        <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" /> {insp.date}
                                        </span>
                                        <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 whitespace-nowrap">
                                            <Clock className="w-3.5 h-3.5" /> 10:30 AM
                                        </span>
                                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-black uppercase tracking-tighter">
                                            {insp.district}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">
                                        {insp.inspector[0]}
                                    </div>
                                    <p className="text-xs font-bold text-slate-700 tracking-tight">{insp.inspector}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setReassignTarget(insp)}
                                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
                                    >Reassign</button>
                                    <button
                                        onClick={() => setSelectedInspection(insp)}
                                        className="p-2 hover:bg-white hover:text-blue-600 rounded-lg text-slate-400 transition-all border border-transparent hover:border-slate-100 shadow-sm"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-slate-50/50 text-center border-t border-slate-100">
                    <button className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">Load More Schedules</button>
                </div>
            </div>

            <ScheduleInspectionModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
            />

            <ReassignInspectorModal
                isOpen={!!reassignTarget}
                onClose={() => setReassignTarget(null)}
                inspection={reassignTarget}
            />

            <InspectionDetailsModal
                isOpen={!!selectedInspection}
                onClose={() => setSelectedInspection(null)}
                inspection={selectedInspection}
            />
        </div>
    );
}
