"use client";

import React from "react";
import {
    Users,
    School,
    FileText,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

const stats = [
    {
        label: "Total Schools",
        value: "1,284",
        change: "+12%",
        isPositive: true,
        icon: School,
        color: "blue"
    },
    {
        label: "Approved Recognitions",
        value: "956",
        change: "+18%",
        isPositive: true,
        icon: CheckCircle2,
        color: "emerald"
    },
    {
        label: "Under Improvement",
        value: "84",
        change: "-2%",
        isPositive: true,
        icon: AlertCircle,
        color: "rose"
    },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

export default function DashboardPage() {
    const [exportStatus, setExportStatus] = React.useState<"idle" | "generating" | "success">("idle");

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Governance Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Real-time monitoring and administrative control overview.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => {
                            setExportStatus("generating");
                            setTimeout(() => {
                                setExportStatus("success");
                                setTimeout(() => setExportStatus("idle"), 3000);
                            }, 2000);
                        }}
                        disabled={exportStatus !== "idle"}
                        className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        {exportStatus === "generating" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : exportStatus === "success" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <FileText className="w-4 h-4" />
                        )}
                        {exportStatus === "generating" ? "Generating..." : exportStatus === "success" ? "Report Exported!" : "Export Report"}
                    </button>
                    <Link href="/admin/inspections">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20">
                            Schedule Inspection
                        </button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                {stats.map((stat) => (
                    <motion.div
                        key={stat.label}
                        variants={item}
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 duration-300",
                                stat.color === "blue" ? "bg-blue-50 text-blue-600" :
                                    stat.color === "amber" ? "bg-amber-50 text-amber-600" :
                                        stat.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
                                            "bg-rose-50 text-rose-600"
                            )}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className={cn(
                                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                                stat.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            )}>
                                {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {stat.change}
                            </div>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                        </div>

                        {/* Subtle background decoration */}
                        <div className={cn(
                            "absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity",
                            stat.color === "blue" ? "bg-blue-600" :
                                stat.color === "amber" ? "bg-amber-600" :
                                    stat.color === "emerald" ? "bg-emerald-600" :
                                        "bg-rose-600"
                        )}></div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Main Charts & Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Inspections Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">Recent Inspections</h3>
                        <Link href="/admin/inspections" className="text-blue-600 text-sm font-semibold hover:underline">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="px-6 py-4">School Name</th>
                                    <th className="px-6 py-4">District</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[
                                    { name: "City Public School", district: "Lucknow", date: "2026-03-27", type: "Regular", status: "Scheduled" },
                                    { name: "Riverside Academy", district: "Kanpur", date: "2026-03-28", type: "Surprise", status: "Pending" },
                                    { name: "Green Valley High", district: "Agra", date: "2026-03-29", type: "Follow-up", status: "Confirmed" },
                                ].map((inspection, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-slate-900">{inspection.name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{inspection.district}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{inspection.date}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                                {inspection.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "text-[10px] font-bold px-2 py-1 rounded-full",
                                                inspection.status === "Scheduled" ? "bg-blue-50 text-blue-600" :
                                                inspection.status === "Pending" ? "bg-amber-50 text-amber-600" :
                                                "bg-emerald-50 text-emerald-600"
                                            )}>
                                                {inspection.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Urgent Actions sidebar */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4">Urgent Actions</h3>
                        <div className="space-y-4">
                            {[
                                { text: "Verify 14 documents from Agra", time: "2h ago", type: "doc" },
                                { text: "Inspection report due for Varanasi", time: "5h ago", type: "insp" },
                                { text: "System update scheduled", time: "1d ago", type: "sys" },
                            ].map((action, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className={cn(
                                        "w-1.5 h-auto rounded-full",
                                        i === 0 ? "bg-rose-500" : i === 1 ? "bg-amber-500" : "bg-blue-500"
                                    )} />
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{action.text}</p>
                                        <p className="text-[10px] text-slate-500">{action.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
