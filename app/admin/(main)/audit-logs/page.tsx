"use client";

import React from "react";
import { History, Search, Filter, Calendar, Download, Database, Activity, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const auditLogs = [
    { id: 1, user: "admin_pankaj", action: "Approved Application", module: "Applications", time: "2026-02-27 15:42", ip: "192.168.1.104", status: "Success" },
    { id: 2, user: "admin_sneha", action: "Redefined Scrutiny Rules", module: "Settings", time: "2026-02-27 14:20", ip: "192.168.1.112", status: "Success" },
    { id: 3, user: "inspector_rahul", action: "Uploaded Inspection Report", module: "Inspections", time: "2026-02-27 12:05", ip: "10.0.4.52", status: "Success" },
    { id: 4, user: "system_root", action: "Model Recalibrated", module: "AI Monitoring", time: "2026-02-27 09:12", ip: "Internal", status: "Info" },
    { id: 5, user: "admin_pankaj", action: "Blocked School ID: 9021", module: "School Mgmt", time: "2026-02-27 08:30", ip: "192.168.1.104", status: "Danger" },
    { id: 6, user: "admin_sneha", action: "Updated Notification", module: "Broadcasting", time: "2026-02-26 17:55", ip: "192.168.1.112", status: "Success" },
];

export default function AuditLogsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Audit &amp; Governance Logs</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium italic">Immutable record of administrative activity, state transitions, and security events.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"><Download className="w-4 h-4" />Download CSV</button>
                    <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95"><ArrowUpRight className="w-4 h-4" />Full Database Export</button>
                </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[240px] relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search by User / Action / IP..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all" />
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <select className="bg-transparent text-[11px] font-black uppercase tracking-tighter text-slate-700 focus:outline-none cursor-pointer"><option>Today: Feb 27, 2026</option><option>Yesterday</option><option>Last 7 Days</option></select>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select className="bg-transparent text-[11px] font-black uppercase tracking-tighter text-slate-700 focus:outline-none cursor-pointer"><option>All Modules</option><option>Applications</option><option>Settings</option><option>AI Engine</option></select>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden min-h-[500px] flex flex-col relative group">
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black border-b border-slate-100 tracking-[0.2em]">
                            <tr><th className="px-8 py-5">User Account</th><th className="px-8 py-5">Activity Executed</th><th className="px-8 py-5">Module Path</th><th className="px-8 py-5">Timestamp</th><th className="px-8 py-5">Verification</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {auditLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/20 transition-all group/row">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-black text-xs text-slate-500 shadow-inner group-hover/row:bg-blue-100 group-hover/row:text-blue-600 transition-colors">{log.user[0].toUpperCase()}</div>
                                            <div><p className="text-xs font-black text-slate-900 tracking-tight">{log.user}</p><p className="text-[10px] text-slate-400 font-bold tracking-widest">{log.ip}</p></div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("w-1.5 h-1.5 rounded-full", log.status==="Success"?"bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]":log.status==="Info"?"bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]":"bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]")} />
                                            <p className="text-xs font-bold text-slate-700">{log.action}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6"><span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full text-slate-600 border border-slate-200">{log.module}</span></td>
                                    <td className="px-8 py-6"><div className="flex flex-col"><span className="text-xs font-bold text-slate-900 tracking-tighter">{log.time.split(' ')[0]}</span><span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{log.time.split(' ')[1]}</span></div></td>
                                    <td className="px-8 py-6"><div className="flex items-center gap-1.5 text-emerald-600 font-black text-[9px] uppercase tracking-widest italic"><Database className="w-3 h-3" /> Block Secured</div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-8 border-t border-slate-50 bg-slate-50/50 rounded-b-[2.5rem] flex items-center justify-between">
                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400"><p>Uptime: <span className="text-emerald-600">99.99%</span></p><div className="w-1 h-1 bg-slate-200 rounded-full" /><p>Cluster: <span className="text-slate-900">UP-NODAL-01</span></p></div>
                    <div className="flex items-center gap-4"><button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm"><Activity className="w-4 h-4" /></button><button className="text-[11px] font-black uppercase tracking-widest text-blue-600 hover:underline underline-offset-4">Archive Older Logs</button></div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            </div>
        </div>
    );
}
