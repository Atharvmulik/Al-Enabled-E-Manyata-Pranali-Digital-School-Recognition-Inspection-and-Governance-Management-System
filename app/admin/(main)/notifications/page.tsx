"use client";

import React from "react";
import { Bell, Send, Users, Target, History, Search, CheckCircle2, Clock, MoreVertical, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const notificationHistory = [
    { id: 1, message: "Reminder: Fire Safety NOC renewal due by March 31.", sentTo: "All Schools", date: "2026-02-25", status: "Delivered", type: "Urgent" },
    { id: 2, message: "New guidelines for digital literacy labs released.", sentTo: "Lucknow District", date: "2026-02-22", status: "Delivered", type: "Informational" },
    { id: 3, message: "Inspection scheduled for Modern Elite Academy.", sentTo: "Modern Elite Academy", date: "2026-02-20", status: "Seen", type: "Update" },
    { id: 4, message: "UDISE data validation cycle started for FY 26-27.", sentTo: "Principals", date: "2026-02-18", status: "Pending", type: "Action Required" },
];

export default function NotificationsPage() {
    const [message, setMessage] = React.useState("");
    const [target, setTarget] = React.useState("All Schools");

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Channel &amp; Notifications</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Broadcast official circulars, reminders, and urgent alerts to schools and administrative units.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
                    <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">3 System Alerts Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-6 sticky top-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20"><Mail className="w-5 h-5" /></div>
                            <h3 className="font-bold text-slate-800 tracking-tight">Compose Broadcast</h3>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Target Selection</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {["All Schools", "Lucknow", "Principals", "Inspectors"].map((t) => (
                                        <button key={t} onClick={() => setTarget(t)} className={cn("px-3 py-2.5 rounded-xl text-[11px] font-bold border transition-all text-center", target === t ? "bg-blue-50 border-blue-600 text-blue-600 ring-2 ring-blue-500/10" : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-slate-200")}>{t}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Message Content</label>
                                <textarea placeholder="Type official notification message here..." value={message} onChange={(e) => setMessage(e.target.value)} className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all resize-none shadow-inner" />
                            </div>
                            <button disabled={!message} className="w-full py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group">
                                <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /> Transmit Notification
                            </button>
                            <p className="text-[9px] text-slate-400 font-medium text-center leading-relaxed">By sending this, you agree to broadcast this message to {target}. This action is logged in the audit history.</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500"><History className="w-5 h-5" /></div>
                                <h3 className="font-bold text-slate-800 tracking-tight">Notification History</h3>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input type="text" placeholder="Search history..." className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all w-48" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black border-b border-slate-100 tracking-[0.1em]">
                                    <tr><th className="px-8 py-4">Broadcast Message</th><th className="px-8 py-4">Recipients</th><th className="px-8 py-4">Date</th><th className="px-8 py-4">Status</th><th className="px-8 py-4 text-right">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {notificationHistory.map((h) => (
                                        <tr key={h.id} className="hover:bg-slate-50/30 transition-colors group">
                                            <td className="px-8 py-6 max-w-sm">
                                                <p className="text-xs font-bold text-slate-900 line-clamp-2 leading-relaxed">{h.message}</p>
                                                <span className={cn("text-[9px] font-black uppercase tracking-widest mt-2 inline-block px-2 py-0.5 rounded", h.type==="Urgent"?"bg-rose-100 text-rose-600":h.type==="Informational"?"bg-blue-100 text-blue-600":h.type==="Action Required"?"bg-amber-100 text-amber-600":"bg-slate-100 text-slate-600")}>{h.type}</span>
                                            </td>
                                            <td className="px-8 py-6"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center"><Target className="w-3 h-3 text-slate-400" /></div><span className="text-xs font-bold text-slate-600">{h.sentTo}</span></div></td>
                                            <td className="px-8 py-6"><span className="text-[11px] font-bold text-slate-500">{h.date}</span></td>
                                            <td className="px-8 py-6"><div className="flex items-center gap-2">{h.status==="Delivered"?<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />:h.status==="Seen"?<Users className="w-3.5 h-3.5 text-blue-500" />:<Clock className="w-3.5 h-3.5 text-amber-500" />}<span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{h.status}</span></div></td>
                                            <td className="px-8 py-6 text-right"><button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 transition-all border border-transparent hover:border-slate-100 shadow-sm"><MoreVertical className="w-4 h-4" /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30 rounded-b-[2.5rem]">
                            <p className="text-[11px] font-bold text-slate-400">Total archived broadcasts: <span className="text-slate-900">124</span></p>
                            <div className="flex items-center gap-3">
                                <button className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Clear All Logs</button>
                                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                <button className="text-[11px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">Export Record</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
