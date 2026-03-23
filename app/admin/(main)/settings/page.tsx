"use client";

import React from "react";
import { Settings, Shield, Map, FileCheck, Sliders, ChevronRight, Database, Lock, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const settingCards = [
    { id: "roles", title: "Roles & Permissions", desc: "Define administrative access levels, inspector roles, and staff permissions.", icon: Shield, color: "blue" },
    { id: "regions", title: "District / Block Management", desc: "Manage geographic master data, regional boundaries, and nodal offices.", icon: Map, color: "emerald" },
    { id: "criteria", title: "Recognition Criteria", desc: "Update statutory requirements, infrastructure standards, and marking schemes.", icon: FileCheck, color: "amber" },
    { id: "thresholds", title: "Threshold Settings", desc: "Configure AI confidence intervals, pass/fail scores, and auto-flagging rules.", icon: Sliders, color: "indigo" },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = React.useState("general");

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Configuration</h1>
                <p className="text-slate-500 text-sm mt-1 font-medium italic">Advanced administrative control panel for the E-Manyata governance engine.</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl w-fit mb-8">
                {["General", "Security", "Infrastructure", "API Keys"].map((t) => (
                    <button key={t} onClick={() => setActiveTab(t.toLowerCase())} className={cn("px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all", activeTab === t.toLowerCase() ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800")}>{t}</button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {settingCards.map((card) => (
                    <div key={card.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all group relative overflow-hidden">
                        <div className="relative z-10 flex flex-col h-full">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500", card.color==="blue"?"bg-blue-50 text-blue-600":card.color==="emerald"?"bg-emerald-50 text-emerald-600":card.color==="amber"?"bg-amber-50 text-amber-600":"bg-indigo-50 text-indigo-600")}>
                                <card.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2 uppercase">{card.title}</h3>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed mb-8">{card.desc}</p>
                            <div className="mt-auto flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Last updated 12 days ago</span>
                                <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95">Configure <ChevronRight className="w-3.5 h-3.5" /></button>
                            </div>
                        </div>
                        <div className={cn("absolute -right-8 -top-8 w-32 h-32 bg-slate-50 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700", card.color==="blue"?"bg-blue-100":card.color==="emerald"?"bg-emerald-100":"bg-amber-100")} />
                    </div>
                ))}
            </div>

            <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden mt-12 group">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div>
                        <div className="flex items-center gap-3 mb-4"><Database className="w-5 h-5 text-blue-400" /><h4 className="font-bold tracking-tight uppercase text-sm">Master Database</h4></div>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">Synchronize local registry with Ministry of Education National Data Portal.</p>
                        <button className="mt-6 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-colors border-b border-blue-400 pb-1">Trigger Manual Sync</button>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-4 text-emerald-400"><Lock className="w-5 h-5" /><h4 className="font-bold tracking-tight uppercase text-sm">Auth Protocols</h4></div>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">Advanced two-factor authentication and biometric validation for inspectors.</p>
                        <button className="mt-6 text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-white transition-colors border-b border-emerald-400 pb-1">Manage Security</button>
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-4 text-amber-400"><Globe className="w-5 h-5" /><h4 className="font-bold tracking-tight uppercase text-sm">Localization</h4></div>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">Update language packs, regional dialects, and local governance terminologies.</p>
                        <button className="mt-6 text-[10px] font-black uppercase tracking-widest text-amber-400 hover:text-white transition-colors border-b border-amber-400 pb-1">Edit Languages</button>
                    </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -rotate-12 pointer-events-none" />
            </div>
        </div>
    );
}
