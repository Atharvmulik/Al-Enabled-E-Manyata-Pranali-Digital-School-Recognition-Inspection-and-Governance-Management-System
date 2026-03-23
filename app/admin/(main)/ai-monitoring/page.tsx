"use client";

import React from "react";
import { ShieldAlert, Cpu, Zap, Activity, AlertTriangle, TrendingUp, BarChart, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const anomalies = [
    { school: "City Public School", issue: "Mismatched Classroom Count", ai: 12, physical: 8, severity: "High" },
    { school: "Modern Elite Academy", issue: "Lab Infrastructure Discrepancy", ai: "Level 4", physical: "Level 2", severity: "Medium" },
    { school: "Vidya Mandir", issue: "Doubtful Library Area Data", ai: "400sqft", physical: "120sqft", severity: "High" },
    { school: "Heritage Global", issue: "Suspicious Student-Teacher Ratio", ai: "25:1", physical: "45:1", severity: "Medium" },
];

export default function AIMonitoringPage() {
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
                    { label: "Average AI Score", value: "84.2", trend: "+2.1%", icon: TrendingUp, color: "blue" },
                    { label: "Flagged Schools", value: "12", trend: "High Risk", icon: AlertTriangle, color: "rose" },
                    { label: "Data Integrity", value: "98.4%", trend: "Optimal", icon: ShieldCheck, color: "emerald" },
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
                            <ShieldAlert className="w-5 h-5 text-rose-500" />
                            <h3 className="font-bold text-slate-800 tracking-tight">Active Mismatch Alerts</h3>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">School</th>
                                    <th className="px-6 py-4">Anomaly Targeted</th>
                                    <th className="px-6 py-4">AI vs Physical</th>
                                    <th className="px-6 py-4">Risk</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {anomalies.map((a, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <p className="text-xs font-bold text-slate-900">{a.school}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-xs text-slate-600">{a.issue}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-black">{a.ai}</span>
                                                <span className="text-slate-300">/</span>
                                                <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded font-black">{a.physical}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={cn(
                                                "text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest",
                                                a.severity === "High" ? "bg-rose-600 text-white" : "bg-amber-100 text-amber-600 border border-amber-200"
                                            )}>{a.severity}</span>
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
                                <h3 className="font-bold tracking-tight">Category Distribution</h3>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { label: "Model A (Infra)", val: 88, color: "blue" },
                                    { label: "Model B (Teachers)", val: 94, color: "emerald" },
                                    { label: "Model C (Fraud)", val: 72, color: "rose" },
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
        </div>
    );
}
