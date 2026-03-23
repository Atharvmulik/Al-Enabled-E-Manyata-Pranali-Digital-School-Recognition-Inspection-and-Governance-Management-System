"use client";

import React from "react";
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
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Inspection Management</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Orchestrate site visits, assign inspectors, and monitor compliance reporting.
                    </p>
                </div>
                <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95">
                    <Plus className="w-4 h-4" />
                    Schedule New Inspection
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
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
                                            <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all">Reassign</button>
                                            <button className="p-2 hover:bg-white hover:text-blue-600 rounded-lg text-slate-400 transition-all border border-transparent hover:border-slate-100 shadow-sm">
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
                </div>

                <div className="space-y-8 self-start">
                    <div className="bg-[#0f172a] text-white p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                    <ClipboardList className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="font-bold text-lg tracking-tight">Inspector Workload</h3>
                            </div>

                            <div className="space-y-6 pt-2">
                                <p className="text-xs text-slate-400 font-medium">District-wise active inspector availability and field allocation status.</p>

                                <div className="h-[220px] flex items-end justify-between gap-4 px-2">
                                    {[55, 80, 45, 95, 65].map((h, i) => (
                                        <div key={i} className="flex-1 bg-white/[0.03] rounded-t-xl relative group/bar cursor-help">
                                            <div
                                                className={cn(
                                                    "absolute bottom-0 left-0 right-0 rounded-t-xl transition-all duration-1000",
                                                    h > 80 ? "bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]" : "bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                                )}
                                                style={{ height: `${h}%` }}
                                            >
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-slate-200">
                                                    {h}% Busy
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between text-[10px] text-slate-500 px-1 font-black uppercase tracking-widest pt-2">
                                    <span>LKO</span>
                                    <span>KNP</span>
                                    <span>AGR</span>
                                    <span>VNS</span>
                                    <span>MRT</span>
                                </div>
                            </div>

                            <button className="w-full mt-8 bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-3 rounded-xl border border-white/10 transition-all active:scale-95">
                                Optimize Assignments
                            </button>
                        </div>

                        {/* Background pattern */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/5 blur-[80px] -mr-20 -mt-20"></div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Users className="w-5 h-5 text-slate-400" />
                            <h3 className="font-bold text-slate-800 tracking-tight">Field Force Status</h3>
                        </div>
                        <div className="space-y-5">
                            {[
                                { label: "Active Inspectors", count: "142", trend: "+4 this week" },
                                { label: "Avg. Duration", count: "2.4h", trend: "-15min vs last month" },
                                { label: "Completion Rate", count: "96.4%", trend: "98% target" },
                            ].map((stat, i) => (
                                <div key={i} className="flex justify-between items-end border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                        <p className="text-xl font-black text-slate-900 mt-1">{stat.count}</p>
                                    </div>
                                    <p className="text-[10px] text-emerald-600 font-bold italic mb-1">{stat.trend}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
