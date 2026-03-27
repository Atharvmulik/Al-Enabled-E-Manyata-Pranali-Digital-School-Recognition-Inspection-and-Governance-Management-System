"use client";

import React, { useState } from "react";
import { ShieldAlert, Cpu, Zap, Activity, AlertTriangle, TrendingUp, BarChart, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type AIReport = {
    school: string;
    infraScore: number;
    qualityCategory: string;
    aiStatus: string;
    suggestion: string;
    severity: string;
};

const aiReports: AIReport[] = [
    { school: "City Public School", infraScore: 85, qualityCategory: "Good", aiStatus: "Excellent Infrastructure", suggestion: "Maintain current standards", severity: "Low" },
    { school: "Modern Elite Academy", infraScore: 72, qualityCategory: "Moderate", aiStatus: "Adequate Facilities", suggestion: "Upgrade library and computer lab", severity: "Medium" },
    { school: "Vidya Mandir", infraScore: 45, qualityCategory: "Poor", aiStatus: "Severe Deficiencies", suggestion: "Urgent: Build new science labs and repair roof", severity: "High" },
    { school: "Heritage Global", infraScore: 62, qualityCategory: "Moderate", aiStatus: "Moderate Infrastructure", suggestion: "Improve classroom condition and teacher strength", severity: "Medium" },
    { school: "Sunrise Public School", infraScore: 92, qualityCategory: "Good", aiStatus: "Premium Infrastructure", suggestion: "No core action needed", severity: "Low" },
];

export default function AIMonitoringPage() {
    const [selectedSchool, setSelectedSchool] = useState<AIReport | null>(null);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <Zap className="w-4 h-4 fill-current transition-all animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neuro-Governance Engine</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Prediction Monitoring</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">
                        Automated verification of school infrastructure and data integrity using computer vision and deep learning.
                    </p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Models Synchronized</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Average Infra Score", value: "71.4", trend: "out of 100", icon: Activity, color: "blue" },
                    { label: "Schools Assessed", value: "1,248", trend: "This Month", icon: Cpu, color: "emerald" },
                    { label: "Poor Quality Flags", value: "84", trend: "Needs Attention", icon: AlertTriangle, color: "rose" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                                stat.color === "blue" ? "bg-blue-50 text-blue-600" :
                                    stat.color === "rose" ? "bg-rose-50 text-rose-600" :
                                        "bg-emerald-50 text-emerald-600"
                            )}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                                <span className={cn(
                                    "text-[10px] font-bold px-1.5 py-0.5 rounded",
                                    stat.color === "blue" ? "text-blue-500" :
                                        stat.color === "rose" ? "bg-rose-100 text-rose-600" :
                                            "bg-emerald-100 text-emerald-600"
                                )}>{stat.trend}</span>
                            </div>
                        </div>
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-blue-600" />
                            <h3 className="font-bold text-slate-800 tracking-tight">AI Infrastructure Assessments</h3>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">School</th>
                                    <th className="px-6 py-4">Score & Quality</th>
                                    <th className="px-6 py-4">AI Status</th>
                                    <th className="px-6 py-4">Suggestions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {aiReports.map((report, i) => (
                                    <tr 
                                        key={i} 
                                        onClick={() => setSelectedSchool(report)}
                                        className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-5">
                                            <p className="text-xs font-bold text-slate-900">{report.school}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "text-[10px] font-black w-8 text-center rounded",
                                                        report.infraScore >= 80 ? "text-emerald-600 bg-emerald-50" :
                                                            report.infraScore >= 60 ? "text-blue-600 bg-blue-50" :
                                                                "text-rose-600 bg-rose-50"
                                                    )}>{report.infraScore}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold">/ 100</span>
                                                </div>
                                                <span className={cn(
                                                    "text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest self-start w-fit",
                                                    report.qualityCategory === "Good" ? "bg-emerald-100 text-emerald-700" :
                                                        report.qualityCategory === "Moderate" ? "bg-blue-100 text-blue-700" :
                                                            "bg-rose-100 text-rose-700"
                                                )}>{report.qualityCategory}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={cn(
                                                "text-[10px] font-bold px-2 py-1 rounded inline-block",
                                                report.severity === "High" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                                                    report.severity === "Medium" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                                        "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                            )}>{report.aiStatus}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-xs text-slate-600 leading-relaxed max-w-[200px]">{report.suggestion}</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 bg-slate-50/50 text-center border-t border-slate-100 italic text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                        End of real-time buffer
                    </div>
                </div>

                <div className="flex flex-col gap-8">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <BarChart className="w-5 h-5 text-blue-400" />
                                <h3 className="font-bold tracking-tight">Quality Category Breakdown</h3>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { label: "Good Infrastructure", val: 42, color: "emerald" },
                                    { label: "Moderate Infrastructure", val: 45, color: "blue" },
                                    { label: "Poor Infrastructure", val: 13, color: "rose" },
                                ].map((m, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between mb-1.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</span>
                                            <span className="text-[10px] font-black">{m.val}%</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-1000",
                                                    m.color === "blue" ? "bg-blue-500" : m.color === "emerald" ? "bg-emerald-400" : "bg-rose-500"
                                                )}
                                                style={{ width: `${m.val}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-10 p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-4 italic">
                                    Cross-modal validation identifies potential risks before manual inspection starts.
                                </p>
                                <button className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-colors underline underline-offset-4">Download AI Insights</button>
                            </div>
                        </div>
                        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-blue-500 rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-all duration-1000" />
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-dashed text-center">
                        <Cpu className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-slate-800">Edge Node: Active</h4>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">UP-GOV-CENTRAL-AI</p>
                    </div>
                </div>
            </div>

            {/* Detailed Assessment Modal */}
            {selectedSchool && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 px-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">{selectedSchool.school}</h2>
                                <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-widest">AI Assessment Detail</p>
                            </div>
                            <button 
                                onClick={() => setSelectedSchool(null)}
                                className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Infrastructure Score</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className={cn(
                                            "text-3xl font-black",
                                            selectedSchool.infraScore >= 80 ? "text-emerald-600" :
                                                selectedSchool.infraScore >= 60 ? "text-blue-600" :
                                                    "text-rose-600"
                                        )}>{selectedSchool.infraScore}</span>
                                        <span className="text-sm font-bold text-slate-400">/ 100</span>
                                    </div>
                                </div>
                                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Quality Category</p>
                                    <span className={cn(
                                        "text-sm font-black px-3 py-1 rounded inline-block uppercase tracking-widest mt-1",
                                        selectedSchool.qualityCategory === "Good" ? "bg-emerald-100 text-emerald-700" :
                                            selectedSchool.qualityCategory === "Moderate" ? "bg-blue-100 text-blue-700" :
                                                "bg-rose-100 text-rose-700"
                                    )}>{selectedSchool.qualityCategory}</span>
                                </div>
                            </div>

                            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">AI Status</p>
                                <div className="flex items-center gap-3">
                                    <Activity className={cn(
                                        "w-5 h-5",
                                        selectedSchool.severity === "High" ? "text-rose-500" :
                                            selectedSchool.severity === "Medium" ? "text-amber-500" :
                                                "text-emerald-500"
                                    )} />
                                    <span className="font-bold text-slate-800">{selectedSchool.aiStatus}</span>
                                </div>
                            </div>

                            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-inner relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-blue-400 mb-2">AI Suggestions & Actions</p>
                                    <p className="text-sm font-medium leading-relaxed">{selectedSchool.suggestion}</p>
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                            <button 
                                onClick={() => setSelectedSchool(null)}
                                className="px-6 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
