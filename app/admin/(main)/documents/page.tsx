"use client";

import React from "react";
import {
    ClipboardCheck,
    FileText,
    Check,
    X,
    AlertOctagon,
    Search,
    Filter,
    ShieldCheck,
    ChevronDown,
    Info
} from "lucide-react";
import { cn } from "@/lib/utils";

const schoolDocuments = [
    { id: 1, name: "Public High School", items: 4, type: "Urgent", status: "Pending" },
    { id: 2, name: "Gyan Mandir Academy", items: 2, type: "Normal", status: "Reviewing" },
    { id: 3, name: "Convent Academy", items: 8, type: "Normal", status: "Pending" },
    { id: 4, name: "Heritage Global", items: 1, type: "Urgent", status: "Rejected" },
];

export default function DocumentsPage() {
    const [rejectionReason, setRejectionReason] = React.useState("");
    const [selectedSchool, setSelectedSchool] = React.useState(schoolDocuments[0]);

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Document Verification</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">
                        Authentication of statutory certificates, safety records, and regulatory clearances.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-widest">14 Pending Audits</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col md:flex-row">
                {/* Left Side: School List */}
                <div className="w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/20">
                    <div className="p-5 border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search Schools..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
                        {schoolDocuments.map((school) => (
                            <div
                                key={school.id}
                                onClick={() => setSelectedSchool(school)}
                                className={cn(
                                    "p-5 cursor-pointer transition-all relative group",
                                    selectedSchool.id === school.id ? "bg-white shadow-[inset_4px_0_0_0_#2563eb]" : "hover:bg-white"
                                )}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className={cn(
                                        "text-xs font-black uppercase tracking-tight transition-colors",
                                        selectedSchool.id === school.id ? "text-blue-600" : "text-slate-700"
                                    )}>{school.name}</h4>
                                    <span className={cn(
                                        "text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest",
                                        school.type === "Urgent" ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"
                                    )}>{school.type}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-slate-500 font-bold">{school.items} items pending</p>
                                    <span className={cn(
                                        "text-[9px] font-bold italic",
                                        school.status === "Reviewing" ? "text-amber-500" :
                                            school.status === "Rejected" ? "text-rose-500" : "text-slate-400"
                                    )}>{school.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Document Preview & Actions */}
                <div className="flex-1 flex flex-col bg-slate-100/30">
                    <div className="p-5 bg-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 tracking-tight">Building_Safety_Cert_2024.pdf</h3>
                                <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                    <span>Ref: LKO-9021X</span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                    <span className="text-blue-600">Department of PWD</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="p-2 bg-slate-50 text-slate-600 rounded-xl border border-slate-200 hover:bg-white transition-all shadow-sm">
                                <Info className="w-4 h-4" />
                            </button>
                            <div className="h-8 w-px bg-slate-200 mx-1" />
                            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                                <Check className="w-4 h-4" /> Approve
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row p-6 gap-6 overflow-hidden">
                        <div className="flex-1 overflow-y-auto scrollbar-hide flex justify-center bg-slate-500/5 rounded-2xl border border-slate-100 p-8 shadow-inner">
                            <div className="w-full max-w-[600px] aspect-[1/1.414] bg-white shadow-2xl rounded-sm border border-slate-200 flex flex-col p-16 select-none shadow-blue-900/5">
                                <div className="flex flex-col items-center mb-16 border-b border-slate-100 pb-12">
                                    <div className="w-16 h-16 border-4 border-slate-900 flex items-center justify-center font-black text-2xl mb-6 shadow-sm">GOV</div>
                                    <h2 className="text-2xl font-serif font-black uppercase tracking-[0.2em] text-center">Safety Compliance Certificate</h2>
                                    <p className="text-slate-400 font-serif text-sm mt-2 tracking-widest uppercase">Government of Uttar Pradesh</p>
                                </div>

                                <div className="space-y-8 flex-1">
                                    <div className="h-3 bg-slate-100/80 w-full rounded-full" />
                                    <div className="h-3 bg-slate-100/80 w-[95%] rounded-full" />
                                    <div className="h-3 bg-slate-100/80 w-[80%] rounded-full" />

                                    <div className="py-12 px-6 border-y border-slate-50 relative">
                                        <div className="text-[10px] text-slate-300 absolute top-2 left-1/2 -translate-x-1/2 uppercase tracking-widest font-bold">Encrypted Digital Proof</div>
                                        <div className="h-2 bg-slate-50 w-full rounded-full" />
                                        <div className="h-2 bg-slate-50 w-3/4 rounded-full mt-4 mx-auto" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-12 mt-12">
                                        <div className="space-y-4">
                                            <div className="h-2 bg-slate-100/50 w-full rounded-full" />
                                            <div className="h-2 bg-slate-100/50 w-full rounded-full" />
                                        </div>
                                        <div className="space-y-4 text-right">
                                            <div className="h-2 bg-slate-100/50 w-full rounded-full" />
                                            <div className="h-2 bg-slate-100/50 w-1/2 rounded-full ml-auto" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-16 flex justify-between items-end border-t border-slate-50">
                                    <div className="text-center">
                                        <div className="w-32 h-16 bg-slate-50 border border-dashed border-slate-200 mb-2 rounded flex items-center justify-center italic text-[10px] text-slate-300">Official Seal</div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Issuing Authority</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">Date of Issuance: 2024-02-12</p>
                                        <div className="w-32 h-10 border-b border-slate-200 ml-auto flex items-end justify-center">
                                            <span className="font-serif italic text-slate-300 text-sm">Sunil Kumar</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-80 flex flex-col gap-4">
                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-4 text-rose-600">
                                    <AlertOctagon className="w-5 h-5" />
                                    <h4 className="text-sm font-black uppercase tracking-tight">Rejection Desk</h4>
                                </div>
                                <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">
                                    Please provide a valid reason if you choose to reject this document. This will be visible to the school.
                                </p>
                                <textarea
                                    placeholder="e.g. Certificate expired, Image blurry, Incorrect UDISE..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-400 transition-all resize-none"
                                />
                                <button
                                    disabled={!rejectionReason}
                                    className="w-full mt-4 py-3 bg-white text-rose-600 border-2 border-rose-100 font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-rose-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                >
                                    Reject Document
                                </button>
                            </div>

                            <div className="bg-blue-900 p-6 rounded-3xl shadow-xl shadow-blue-900/10 relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                                        <ShieldCheck className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h4 className="text-sm font-bold text-white mb-2 tracking-tight">AI Compliance Check</h4>
                                    <p className="text-[10px] text-blue-300 font-medium leading-relaxed">
                                        System has cross-verified this document with national database. No anomalies detected.
                                    </p>
                                    <div className="mt-4 flex items-center gap-2">
                                        <div className="flex-1 h-1 bg-blue-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-400 w-[100%]" />
                                        </div>
                                        <span className="text-[9px] font-black text-emerald-400 uppercase">Valid</span>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-[40px] -mr-12 -mt-12 group-hover:bg-blue-500/20 transition-all duration-700"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
