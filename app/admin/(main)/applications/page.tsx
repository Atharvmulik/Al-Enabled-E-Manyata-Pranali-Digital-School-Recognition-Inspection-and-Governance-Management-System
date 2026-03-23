"use client";

import React from "react";
import {
    FileCheck,
    Filter,
    Download,
    Search,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    AlertCircle,
    MoreVertical,
    ChevronRight,
    FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

const applications = [
    { name: "Public High School", date: "2026-02-15", status: "New", score: 85 },
    { name: "Gyan Mandir Academy", date: "2026-02-12", status: "Under Review", score: 92 },
    { name: "Nightingale Convent", date: "2026-02-10", status: "Pending Inspection", score: 88 },
    { name: "Saraswati Shishu Mandir", date: "2026-02-08", status: "New", score: 74 },
    { name: "St. Xavier's International", date: "2026-02-05", status: "Under Review", score: 62 },
];

export default function ApplicationsPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Applications & Recognition</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Review submitted recognition requests and manage governance workflows.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
                        <Download className="w-4 h-4" />
                        Batch Action
                    </button>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                        <ArrowUpRight className="w-4 h-4" />
                        Export List
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "New Requests", count: "48", icon: FileText, color: "blue" },
                    { label: "Under Review", count: "32", icon: Clock, color: "amber" },
                    { label: "Pending Inspection", count: "14", icon: AlertCircle, color: "indigo" },
                    { label: "Granted Recognition", count: "892", icon: CheckCircle2, color: "emerald" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md group">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                            stat.color === "blue" ? "bg-blue-50 text-blue-600" :
                                stat.color === "amber" ? "bg-amber-50 text-amber-600" :
                                    stat.color === "indigo" ? "bg-indigo-50 text-indigo-600" :
                                        "bg-emerald-50 text-emerald-600"
                        )}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">{stat.label}</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{stat.count}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <h3 className="font-bold text-slate-800">Application Workflow</h3>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search Applications..."
                                className="pl-8 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all w-48 md:w-64"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-slate-500 text-[10px] uppercase tracking-widest font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">School Name</th>
                                <th className="px-6 py-4">Application Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">AI Prediction</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {applications.map((app, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-bold text-slate-900">{app.name}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">UDISE: 09120304{i + 10}1</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-xs text-slate-600 font-semibold">{app.date}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full animate-pulse",
                                                app.status === "New" ? "bg-blue-500" :
                                                    app.status === "Under Review" ? "bg-amber-500" : "bg-indigo-500"
                                            )} />
                                            <span className="text-[10px] font-bold text-slate-700 uppercase">{app.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 max-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full transition-all duration-1000",
                                                        app.score > 80 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" :
                                                            app.score > 70 ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]" :
                                                                "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                                                    )}
                                                    style={{ width: `${app.score}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-900">{app.score}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 transition-all hover:text-blue-600">Review</button>
                                            <button className="text-[10px] font-bold px-3 py-1.5 rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all">Approve</button>
                                            <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-all">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Action Pagination / Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <p className="text-xs text-slate-500 font-medium tracking-tight">Showing <span className="text-slate-900 font-bold">5</span> of 94 active applications</p>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 text-xs font-bold text-slate-400 border border-slate-200 rounded-lg cursor-not-allowed">Previous</button>
                        <button className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-white border border-blue-100 rounded-lg hover:bg-blue-50 transition-all shadow-sm">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
