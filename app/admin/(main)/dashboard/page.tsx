"use client";

import React from "react";
import {
    Users,
    School,
    FileText,
    CheckCircle2,
    AlertCircle,
    ShieldAlert,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
        label: "Pending Applications",
        value: "142",
        change: "+5%",
        isPositive: false,
        icon: FileText,
        color: "amber"
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
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                        Export Report
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20">
                        Schedule Inspection
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
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
                {/* Recent Applications Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">Recent Applications</h3>
                        <button className="text-blue-600 text-sm font-semibold hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                                <tr>
                                    <th className="px-6 py-4">School Name</th>
                                    <th className="px-6 py-4">District</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">AI Score</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[
                                    { name: "Public High School", district: "Lucknow", status: "Pending", score: 85, color: "amber" },
                                    { name: "Gyan Mandir Academy", district: "Kanpur", status: "Review", score: 92, color: "blue" },
                                    { name: "Nightingale Convent", district: "Agra", status: "Approved", score: 88, color: "emerald" },
                                    { name: "Saraswati Shishu Mandir", district: "Varanasi", status: "Pending", score: 74, color: "amber" },
                                    { name: "St. Xavier's International", district: "Meerut", status: "Rejected", score: 62, color: "rose" },
                                ].map((school, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-slate-900">{school.name}</p>
                                            <p className="text-[10px] text-slate-500">UDISE: 09120304{i}01</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{school.district}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "text-[10px] font-bold px-2 py-1 rounded-full",
                                                school.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
                                                    school.color === "amber" ? "bg-amber-50 text-amber-600" :
                                                        school.color === "blue" ? "bg-blue-50 text-blue-600" :
                                                            "bg-rose-50 text-rose-600"
                                            )}>
                                                {school.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full",
                                                            school.score > 80 ? "bg-emerald-500" : school.score > 70 ? "bg-amber-500" : "bg-rose-500"
                                                        )}
                                                        style={{ width: `${school.score}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-slate-700">{school.score}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                                                <TrendingUp className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* AI Prediction Insights / Notifications */}
                <div className="space-y-8">
                    <div className="bg-[#1e293b] p-6 rounded-2xl text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                                    <ShieldAlert className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-bold">AI Monitoring</h3>
                            </div>
                            <p className="text-slate-300 text-sm mb-6">
                                System detected 12 schools with mismatched infrastructure data in Lucknow District.
                            </p>
                            <div className="space-y-4">
                                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-[10px] font-medium text-slate-400">Data Integrity</span>
                                        <span className="text-[10px] font-bold text-emerald-400">94.2%</span>
                                    </div>
                                    <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[94.2%]"></div>
                                    </div>
                                </div>
                                <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-[10px] font-medium text-slate-400">System Uptime</span>
                                        <span className="text-[10px] font-bold text-blue-400">99.9%</span>
                                    </div>
                                    <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[99.9%]"></div>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full mt-6 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 rounded-lg border border-white/20 transition-all">
                                Audit All Flags
                            </button>
                        </div>
                        {/* Background glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl -mr-16 -mt-16"></div>
                    </div>

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
