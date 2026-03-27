"use client";

import React from "react";
import {
    School,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Eye,
    CheckCircle,
    Ban,
    Building2,
    FileText,
    Clock,
    AlertCircle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import ProfileBookletModal from "@/app/components/ProfileBookletModal";

const schools = [
    { name: "Public High School", udise: "09120304101", district: "Lucknow", status: "Active" },
    { name: "Gyan Mandir Academy", udise: "09120304202", district: "Kanpur", status: "Pending" },
    { name: "Nightingale Convent", udise: "09120304303", district: "Agra", status: "Active" },
    { name: "Saraswati Shishu Mandir", udise: "09120304404", district: "Varanasi", status: "Blocked" },
    { name: "St. Xavier's International", udise: "09120304505", district: "Meerut", status: "Pending" },
    { name: "Heritage Global School", udise: "09120304606", district: "Lucknow", status: "Active" },
];

export default function SchoolsPage() {
    const [searchTerm, setSearchTerm] = React.useState("");
    const [selectedSchool, setSelectedSchool] = React.useState<any>(null);
    const [verificationSchool, setVerificationSchool] = React.useState<any>(null);

    const filteredSchools = schools.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.udise.includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">School Management</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Manage registered schools, verify credentials, and monitor governance status.
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "New Requests", count: "48", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Under Review", count: "32", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Pending Inspection", count: "14", icon: AlertCircle, color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Granted Recognition", count: "892", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                                <stat.icon className={cn("w-5 h-5", stat.color)} />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.count}</h3>
                    </div>
                ))}
            </div>


            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by School Name / UDISE / District..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select className="bg-white border border-slate-200 text-slate-700 font-medium px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer">
                        <option>All Districts</option>
                        <option>Lucknow</option>
                        <option>Kanpur</option>
                        <option>Agra</option>
                    </select>
                    <select className="bg-white border border-slate-200 text-slate-700 font-medium px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Pending</option>
                        <option>Blocked</option>
                    </select>
                </div>
            </div>

            {filteredSchools.length > 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">School Details</th>
                                    <th className="px-6 py-4">UDISE Code</th>
                                    <th className="px-6 py-4">District</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredSchools.map((school, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shadow-inner">
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{school.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium">Secondary Education Board</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <code className="text-[11px] bg-slate-100 px-2 py-1 rounded text-slate-600 font-semibold">{school.udise}</code>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-600 font-medium">{school.district}</td>
                                        <td className="px-6 py-5">
                                            <span className={cn(
                                                "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tighter",
                                                school.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                                    school.status === "Pending" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                                        "bg-rose-50 text-rose-600 border border-rose-100"
                                            )}>
                                                {school.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => setSelectedSchool(school)} className="p-2 hover:bg-white hover:text-blue-600 rounded-lg text-slate-400 transition-all border border-transparent hover:border-slate-100 shadow-sm" title="View Profile">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setVerificationSchool(school)} className="p-2 hover:bg-white hover:text-emerald-600 rounded-lg text-slate-400 transition-all border border-transparent hover:border-slate-100 shadow-sm" title="Verify Credentials">
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-white hover:text-rose-600 rounded-lg text-slate-400 transition-all border border-transparent hover:border-slate-100 shadow-sm" title="Block School">
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-xs text-slate-500 font-medium">
                            Showing <span className="font-bold text-slate-900">{filteredSchools.length}</span> of <span className="font-bold text-slate-900">{schools.length}</span> schools
                        </p>
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1">
                                <button className="w-8 h-8 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20">1</button>
                                <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all">2</button>
                                <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all">3</button>
                            </div>
                            <button className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

            ) : (
                <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <School className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">No schools found</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
                        We couldn&apos;t find any schools matching &quot;{searchTerm}&quot;. Try broadening your search.
                    </p>
                    <button
                        onClick={() => setSearchTerm("")}
                        className="mt-8 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
                    >
                        Clear Search
                    </button>
                </div>
            )}

            {/* Profile Booklet View Modal (Read Only) */}
            {selectedSchool && (
                <ProfileBookletModal 
                    isOpen={!!selectedSchool} 
                    onClose={() => setSelectedSchool(null)} 
                    schoolName={selectedSchool.name} 
                    udiseCode={selectedSchool.udise} 
                />
            )}

            {/* Profile Booklet View Modal (Verification Mode) */}
            {verificationSchool && (
                <ProfileBookletModal 
                    isOpen={!!verificationSchool} 
                    onClose={() => setVerificationSchool(null)} 
                    schoolName={verificationSchool.name} 
                    udiseCode={verificationSchool.udise} 
                    mode="verify"
                />
            )}
        </div>
    );
}
