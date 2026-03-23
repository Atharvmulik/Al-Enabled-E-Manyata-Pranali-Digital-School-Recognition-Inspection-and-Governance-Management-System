"use client";

import React from "react";
import { BarChart3, Download, ChevronDown, Calendar, Filter, TrendingUp, ArrowUpRight, MapPin, Building, CheckCircle, PieChart as PieChartIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports &amp; Analytics</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Analytical insights into school recognition trends, infrastructure gaps, and regional performance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"><Download className="w-4 h-4" />Export PDF</button>
                    <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"><ArrowUpRight className="w-4 h-4" />Export Excel</button>
                </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl"><MapPin className="w-4 h-4 text-slate-400" /><select className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"><option>All Districts</option><option>Lucknow</option><option>Kanpur</option><option>Agra</option></select></div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl"><Calendar className="w-4 h-4 text-slate-400" /><select className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"><option>Last 30 Days</option><option>Last 3 Months</option><option>Financial Year 24-25</option></select></div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl"><Filter className="w-4 h-4 text-slate-400" /><select className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"><option>All Status</option><option>Approved</option><option>Pending</option><option>Under Improvement</option></select></div>
                <div className="flex-1" />
                <button className="text-xs font-black uppercase tracking-widest text-blue-600 px-4 py-2 hover:bg-blue-50 rounded-xl transition-all">Reset Filters</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><BarChart3 className="w-6 h-6" /></div><h3 className="font-bold text-slate-800 tracking-tight">District-wise Coverage</h3></div>
                        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronDown className="w-4 h-4" /></button>
                    </div>
                    <div className="flex-1 flex items-end justify-between gap-6 px-4 pt-12">
                        {[{label:"Lucknow",val:85,color:"blue"},{label:"Kanpur",val:65,color:"blue"},{label:"Agra",val:45,color:"blue"},{label:"Varanasi",val:92,color:"emerald"},{label:"Meerut",val:56,color:"blue"},{label:"Prayagraj",val:78,color:"blue"}].map((d,i)=>(
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group cursor-help">
                                <div className="relative w-full"><div className={cn("w-full rounded-t-xl transition-all duration-1000 group-hover:brightness-110",d.color==="emerald"?"bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]":"bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.2)]")} style={{height:`${d.val*1.5}px`}} /><div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">{d.val}%</div></div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest -rotate-45 sm:rotate-0 mt-2">{d.label.slice(0,3)}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><TrendingUp className="w-6 h-6" /></div><h3 className="font-bold text-slate-800 tracking-tight">Recognition Trends</h3></div>
                        <div className="flex gap-2"><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400"><div className="w-2 h-2 rounded-full bg-blue-600" /> New</span><span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Approved</span></div>
                    </div>
                    <div className="flex-1 relative mt-12 px-4 h-48 border-l border-b border-slate-100">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,80 Q25,60 50,70 T100,20" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" /><path d="M0,90 Q25,85 50,75 T100,50" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" /><circle cx="0" cy="80" r="1.5" fill="#2563eb" /><circle cx="50" cy="70" r="1.5" fill="#2563eb" /><circle cx="100" cy="20" r="1.5" fill="#2563eb" /></svg>
                    </div>
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6"><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span></div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-8"><div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Building className="w-6 h-6" /></div><h3 className="font-bold text-slate-800 tracking-tight">Infrastructure Gap Analysis</h3></div>
                    <div className="space-y-6">
                        {[{label:"Digital Labs",val:68,color:"blue"},{label:"Safe Drinking Water",val:92,color:"emerald"},{label:"Toilets (Girls)",val:74,color:"amber"},{label:"Fire Safety (NOC)",val:42,color:"rose"},{label:"Ramp for Divyang",val:86,color:"blue"}].map((item,i)=>(
                            <div key={i} className="space-y-2 group">
                                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest"><span className="text-slate-600">{item.label}</span><span className={cn("transition-all group-hover:scale-110",item.val>90?"text-emerald-600":item.val<50?"text-rose-600":"text-slate-400")}>{item.val}%</span></div>
                                <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100"><div className={cn("h-full transition-all duration-1000",item.color==="blue"?"bg-blue-600":item.color==="emerald"?"bg-emerald-500":item.color==="amber"?"bg-amber-500":"bg-rose-500")} style={{width:`${item.val}%`}} /></div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-900 p-6 rounded-3xl text-white flex flex-col justify-between overflow-hidden relative group"><div className="relative z-10"><PieChartIcon className="w-8 h-8 text-blue-400 mb-4" /><h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Rural vs Urban</h4><h3 className="text-2xl font-black mt-2">64% / 36%</h3></div><div className="mt-8 flex gap-1 h-1.5 overflow-hidden rounded-full"><div className="bg-blue-500 w-[64%]" /><div className="bg-white/10 w-[36%]" /></div><div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-600/20 blur-[40px]" /></div>
                    <div className="bg-blue-600 p-6 rounded-3xl text-white flex flex-col justify-between overflow-hidden relative group"><div className="relative z-10"><CheckCircle className="w-8 h-8 text-white/50 mb-4" /><h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Recognition Rate</h4><h3 className="text-2xl font-black mt-2">12.4%</h3></div><p className="text-[10px] text-white/70 font-bold mt-8 italic">Based on latest audit cycle</p><div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 blur-[50px]" /></div>
                    <div className="col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6"><div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" /></div><div><h4 className="text-sm font-bold text-slate-800 tracking-tight">Generating Live Compliance Index...</h4><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Cross-referencing 14 districts across 8 parameters</p></div></div>
                </div>
            </div>
        </div>
    );
}
