"use client";

import React, { useState } from "react";
import {
    ChevronLeft,
    CheckCircle2,
    XCircle,
    RotateCcw,
    AlertCircle,
    Download,
    Printer,
    FileText,
    Calendar,
    MapPin,
    ArrowLeft,
    Search,
    Eye,
    Building2,
    ShieldCheck,
    BadgeCheck,
    Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Constants ──────────────────────────────────────────────────────────────

const RISK_CATEGORIES = {
    low: {
        title: "Low Risk",
        description: "School meets all standards with minor observations",
        color: "emerald",
        accent: "bg-emerald-500",
        bg: "bg-emerald-50/60",
        border: "border-emerald-200",
        text: "text-emerald-700",
        badge: "bg-emerald-100 text-emerald-700",
    },
    medium: {
        title: "Medium Risk",
        description: "Some areas need improvement within 3 months",
        color: "amber",
        accent: "bg-amber-500",
        bg: "bg-amber-50/60",
        border: "border-amber-200",
        text: "text-amber-700",
        badge: "bg-amber-100 text-amber-700",
    },
    high: {
        title: "High Risk",
        description: "Significant issues requiring immediate attention",
        color: "orange",
        accent: "bg-orange-500",
        bg: "bg-orange-50/60",
        border: "border-orange-200",
        text: "text-orange-700",
        badge: "bg-orange-100 text-orange-700",
    },
    critical: {
        title: "Critical Risk",
        description: "Severe violations, immediate action required",
        color: "rose",
        accent: "bg-rose-500",
        bg: "bg-rose-50/60",
        border: "border-rose-200",
        text: "text-rose-700",
        badge: "bg-rose-100 text-rose-700",
    },
};

const RECOMMENDATIONS = {
    approve: {
        label: "Approve",
        icon: CheckCircle2,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-500",
        badge: "bg-emerald-100 text-emerald-700",
    },
    reject: {
        label: "Reject",
        icon: XCircle,
        color: "text-rose-600",
        bg: "bg-rose-50",
        border: "border-rose-500",
        badge: "bg-rose-100 text-rose-700",
    },
    "re-inspection": {
        label: "Re-Inspection",
        icon: RotateCcw,
        color: "text-slate-600",
        bg: "bg-slate-50",
        border: "border-slate-400",
        badge: "bg-slate-100 text-slate-600",
    },
};

const STATUS_STYLES: Record<string, string> = {
    "Pending Review": "bg-amber-100 text-amber-700",
    Approved: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-rose-100 text-rose-700",
    "Re-Inspection Required": "bg-blue-100 text-blue-700",
};

// ─── Dummy Data ──────────────────────────────────────────────────────────────

const reportsData = [
    {
        id: "REP-2026-0812",
        schoolName: "Global International School",
        district: "Lucknow",
        state: "Uttar Pradesh",
        inspectionDate: "April 16, 2026",
        inspector: "Dr. Alok Verma",
        schoolType: "Private",
        applicationType: "New Affiliation",
        recognitionType: "CBSE",
        status: "Pending Review",
        score: 70,
        risk: "medium",
        recommendation: "approve",
        summary:
            "The school demonstrates a strong commitment to academic excellence and student safety. The infrastructure is well-maintained, particularly the digital labs and primary classrooms. However, certain fire safety protocols need updating, and the girls' common room requires immediate renovation.",
        improvementAreas: [
            "Update Fire Safety NOC from the local fire department.",
            "Renovate the girls' common room to meet new ventilation standards.",
            "Implement a more rigorous waste management system in the canteen.",
            "Install additional CCTV cameras in the rear parking zone.",
        ],
    },
    {
        id: "REP-2026-0801",
        schoolName: "Sunrise Public School",
        district: "Patna",
        state: "Bihar",
        inspectionDate: "April 12, 2026",
        inspector: "Ms. Priya Sharma",
        schoolType: "Government Aided",
        applicationType: "Renewal",
        recognitionType: "State Board",
        status: "Approved",
        score: 91,
        risk: "low",
        recommendation: "approve",
        summary:
            "Sunrise Public School has demonstrated exemplary compliance across all inspection parameters. The school's commitment to inclusive education and infrastructure maintenance is commendable. All safety norms are met and documentation is thorough.",
        improvementAreas: [],
    },
    {
        id: "REP-2026-0799",
        schoolName: "New Era Academy",
        district: "Raipur",
        state: "Chhattisgarh",
        inspectionDate: "April 10, 2026",
        inspector: "Mr. Rajesh Nair",
        schoolType: "Private",
        applicationType: "Upgradation",
        recognitionType: "ICSE",
        status: "Rejected",
        score: 38,
        risk: "critical",
        recommendation: "reject",
        summary:
            "New Era Academy has multiple critical violations including unsafe structural conditions in Block C, non-functional fire suppression systems, and severely inadequate sanitation facilities. Immediate closure of affected areas is recommended until compliance is achieved.",
        improvementAreas: [
            "Structural audit and repair of Block C building.",
            "Install and certify fire suppression and sprinkler systems.",
            "Overhaul sanitation facilities across all floors.",
            "Obtain clearance from District Education Officer.",
            "Conduct mandatory staff safety training within 30 days.",
        ],
    },
    {
        id: "REP-2026-0788",
        schoolName: "St. Xavier's High School",
        district: "Pune",
        state: "Maharashtra",
        inspectionDate: "April 8, 2026",
        inspector: "Dr. Angela D'Souza",
        schoolType: "Private Minority",
        applicationType: "Renewal",
        recognitionType: "CBSE",
        status: "Approved",
        score: 88,
        risk: "low",
        recommendation: "approve",
        summary:
            "St. Xavier's continues to uphold its legacy of quality education. The inspection revealed outstanding compliance with academic and infrastructure standards. Minor landscaping issues around the sports grounds were noted but do not affect overall compliance status.",
        improvementAreas: ["Repair boundary wall near the sports ground perimeter."],
    },
    {
        id: "REP-2026-0775",
        schoolName: "Delhi Heights Senior Secondary",
        district: "New Delhi",
        state: "Delhi",
        inspectionDate: "April 5, 2026",
        inspector: "Mr. Suresh Pandey",
        schoolType: "Private",
        applicationType: "New Affiliation",
        recognitionType: "CBSE",
        status: "Re-Inspection Required",
        score: 58,
        risk: "high",
        recommendation: "re-inspection",
        summary:
            "Delhi Heights shows potential but significant infrastructural gaps remain. The library lacks adequate seating and resource volumes required by CBSE norms. The science labs have outdated equipment and safety shields are missing. A re-inspection is recommended after these issues are addressed.",
        improvementAreas: [
            "Expand library seating capacity to 100+ students.",
            "Procure and install safety equipment in all three science labs.",
            "Submit updated building safety certificate.",
            "Ensure playground area meets minimum square footage norms.",
        ],
    },
    {
        id: "REP-2026-0761",
        schoolName: "Vidya Mandir Convent",
        district: "Jaipur",
        state: "Rajasthan",
        inspectionDate: "April 2, 2026",
        inspector: "Sr. Mary Mathew",
        schoolType: "Private Minority",
        applicationType: "Renewal",
        recognitionType: "ICSE",
        status: "Approved",
        score: 93,
        risk: "low",
        recommendation: "approve",
        summary:
            "Vidya Mandir Convent continues to set a benchmark for excellence in the region. All infrastructure, safety, and academic compliance parameters meet or exceed norms. The school's digital integration and counseling support system were especially noted during the visit.",
        improvementAreas: [],
    },
    {
        id: "REP-2026-0749",
        schoolName: "Bharat Vidyalaya",
        district: "Nagpur",
        state: "Maharashtra",
        inspectionDate: "March 30, 2026",
        inspector: "Mr. Dinesh Kulkarni",
        schoolType: "Government",
        applicationType: "Renewal",
        recognitionType: "State Board",
        status: "Re-Inspection Required",
        score: 62,
        risk: "high",
        recommendation: "re-inspection",
        summary:
            "Bharat Vidyalaya has adequate staff strength and academic programs but the physical infrastructure shows signs of neglect. Leaking roofs in Classrooms 4–7, non-functional drinking water purifiers, and a missing ramp for differently-abled students are areas requiring urgent attention.",
        improvementAreas: [
            "Repair leaking roofs in Classrooms 4, 5, 6, and 7.",
            "Replace non-functional RO water purifiers on all floors.",
            "Construct wheelchair-accessible ramp at main entrance.",
            "Repaint and demarcate all emergency exit pathways.",
        ],
    },
    {
        id: "REP-2026-0733",
        schoolName: "Greenfield International",
        district: "Hyderabad",
        state: "Telangana",
        inspectionDate: "March 27, 2026",
        inspector: "Dr. Kavita Reddy",
        schoolType: "Private",
        applicationType: "Upgradation",
        recognitionType: "IB",
        status: "Pending Review",
        score: 76,
        risk: "medium",
        recommendation: "approve",
        summary:
            "Greenfield International presents a well-organised academic setup with modern facilities. The IB curriculum implementation is largely compliant. Some areas in the hostel block need updated documentation, and the counselor-to-student ratio needs improvement before full approval is granted.",
        improvementAreas: [
            "Update hostel block safety and occupancy documentation.",
            "Hire an additional school counselor to meet 1:250 ratio norm.",
            "Install emergency lighting in all corridors.",
        ],
    },
];

const TABS = ["All Reports", "Pending Review", "Approved", "Rejected", "Re-Inspection Required"];

// ─── Score helpers ────────────────────────────────────────────────────────────

function getScoreStatus(score: number) {
    if (score >= 85) return { label: "Excellent", color: "text-emerald-600", bar: "from-emerald-400 to-emerald-500", shadow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]" };
    if (score >= 70) return { label: "Satisfactory", color: "text-amber-600", bar: "from-amber-400 to-amber-500", shadow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]" };
    if (score >= 50) return { label: "Needs Improvement", color: "text-orange-600", bar: "from-orange-400 to-orange-500", shadow: "shadow-[0_0_15px_rgba(249,115,22,0.3)]" };
    return { label: "Critical", color: "text-rose-600", bar: "from-rose-400 to-rose-500", shadow: "shadow-[0_0_15px_rgba(244,63,94,0.3)]" };
}

// ─── Report Card ─────────────────────────────────────────────────────────────

function ReportCard({ report, onClick }: { report: (typeof reportsData)[0]; onClick: () => void }) {
    const risk = RISK_CATEGORIES[report.risk as keyof typeof RISK_CATEGORIES];
    const rec = RECOMMENDATIONS[report.recommendation as keyof typeof RECOMMENDATIONS];
    const scoreStatus = getScoreStatus(report.score);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col cursor-pointer group"
            onClick={onClick}
        >
            {/* Color accent bar */}
            <div className={cn("h-1.5 w-full", risk.accent)} />

            <div className="p-6 flex flex-col gap-4 flex-1">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="font-black text-slate-900 text-lg leading-tight group-hover:text-blue-700 transition-colors">
                            {report.schoolName}
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-0.5">
                            {report.id}
                        </p>
                    </div>
                    <span className={cn("shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide", STATUS_STYLES[report.status])}>
                        {report.status}
                    </span>
                </div>

                {/* Meta */}
                <div className="space-y-1.5 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {report.district}, {report.state}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <BadgeCheck className="w-3.5 h-3.5 text-slate-400" />
                        {report.inspector}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {report.inspectionDate}
                    </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-auto pt-2">
                    <span className={cn("text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide", risk.badge)}>
                        {risk.title}
                    </span>
                    <span className={cn("text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide", rec.badge)}>
                        {rec.label}
                    </span>
                    <span className={cn("text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide", scoreStatus.color, "bg-slate-50")}>
                        Score: {report.score}
                    </span>
                </div>

                {/* CTA */}
                <button
                    className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-colors active:scale-95"
                    onClick={(e) => { e.stopPropagation(); onClick(); }}
                >
                    <Eye className="w-3.5 h-3.5" /> View Report
                </button>
            </div>
        </motion.div>
    );
}

// ─── Report Detail ────────────────────────────────────────────────────────────

function ReportDetail({ report, onBack }: { report: (typeof reportsData)[0]; onBack: () => void }) {
    const riskLevel = RISK_CATEGORIES[report.risk as keyof typeof RISK_CATEGORIES];
    const recommendedDecision = RECOMMENDATIONS[report.recommendation as keyof typeof RECOMMENDATIONS];
    const scoreStatus = getScoreStatus(report.score);

    return (
        <motion.div
            key="detail"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="max-w-3xl mx-auto pb-24"
        >
            {/* Sticky Header */}
            <header className="flex items-center justify-between mb-8 sticky top-0 z-20 bg-[#f8fafc]/80 backdrop-blur-md py-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
                    >
                        <ChevronLeft className="w-6 h-6 text-slate-700 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Final Report</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ID: {report.id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
                        <Printer className="w-4 h-4" /> Print
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                        <Download className="w-4 h-4" /> Export PDF
                    </button>
                </div>
            </header>

            <div className="space-y-8">
                {/* School Info Card */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6 relative overflow-hidden">
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Verified Report</span>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 leading-tight">{report.schoolName}</h2>
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500 font-medium">
                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {report.district}, {report.state}</span>
                                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> {report.inspectionDate}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm pt-2">
                            {[
                                ["School Type", report.schoolType],
                                ["Application", report.applicationType],
                                ["Recognition", report.recognitionType],
                                ["Status", report.status],
                            ].map(([k, v]) => (
                                <div key={k}>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{k}</p>
                                    <p className="font-bold text-slate-700">{v}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="shrink-0 text-right md:border-l md:pl-8 border-slate-100">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Lead Inspector</p>
                        <p className="font-bold text-slate-800 underline decoration-slate-200 decoration-2 underline-offset-4">{report.inspector}</p>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl opacity-50 -mr-16 -mt-16" />
                </div>

                {/* Score */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 text-center relative group"
                >
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Compliance Score</h3>
                    <div className="relative inline-flex flex-col items-center justify-center">
                        <div className={cn("text-7xl font-black tracking-tighter tabular-nums drop-shadow-sm transition-transform group-hover:scale-110 duration-500", scoreStatus.color)}>
                            {report.score}
                        </div>
                        <div className="text-xs font-black text-slate-200 mt-1 uppercase tracking-widest">Out of 100</div>
                    </div>
                    <div className="mt-8 relative w-full h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${report.score}%` }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className={cn("absolute inset-y-0 left-0 bg-gradient-to-r rounded-full", scoreStatus.bar, scoreStatus.shadow)}
                        />
                    </div>
                    <p className="mt-4 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                        Status: <span className={scoreStatus.color}>{scoreStatus.label}</span>
                    </p>
                </motion.div>

                {/* Risk Cards */}
                <section>
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">Risk Category</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(Object.keys(RISK_CATEGORIES) as Array<keyof typeof RISK_CATEGORIES>).map((key) => {
                            const cat = RISK_CATEGORIES[key];
                            const isSelected = report.risk === key;
                            return (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={cn(
                                        "rounded-2xl border-2 overflow-hidden transition-all duration-300",
                                        isSelected ? cn(cat.bg, cat.border) : "bg-white border-slate-100"
                                    )}
                                >
                                    <div className={cn("h-1", isSelected ? cat.accent : "bg-slate-100")} />
                                    <div className="p-4">
                                        <p className={cn("font-black text-sm", isSelected ? cat.text : "text-slate-500")}>{cat.title}</p>
                                        <p className={cn("text-xs mt-1", isSelected ? "text-slate-600" : "text-slate-400")}>{cat.description}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* Recommendation Cards */}
                <section>
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">Inspector Recommendation</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {(Object.keys(RECOMMENDATIONS) as Array<keyof typeof RECOMMENDATIONS>).map((key) => {
                            const rec = RECOMMENDATIONS[key];
                            const isSelected = report.recommendation === key;
                            const Icon = rec.icon;
                            return (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 flex flex-col items-center gap-2 text-center transition-all duration-300",
                                        isSelected ? cn(rec.bg, rec.border) : "bg-white border-slate-100"
                                    )}
                                >
                                    <Icon className={cn("w-7 h-7", isSelected ? rec.color : "text-slate-300")} strokeWidth={1.5} />
                                    <p className={cn("text-xs font-black uppercase tracking-wide", isSelected ? rec.color : "text-slate-400")}>
                                        {rec.label}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* Summary */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" /> Summary of Findings
                        </h3>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm leading-relaxed text-slate-600 text-lg font-medium italic relative">
                        <span className="absolute top-6 left-6 text-7xl font-serif text-slate-100 pointer-events-none">"</span>
                        {report.summary}
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-50/20 rounded-full blur-[60px]" />
                    </div>
                </section>

                {/* Improvement Areas */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" /> Improvement Roadmap
                        </h3>
                        <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                            {report.improvementAreas.length} Item{report.improvementAreas.length !== 1 ? "s" : ""} Identified
                        </span>
                    </div>
                    {report.improvementAreas.length === 0 ? (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 text-center text-slate-400 font-bold">
                            No improvement areas identified
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {report.improvementAreas.map((area, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.08 }}
                                    className="flex items-start gap-4 bg-white p-5 rounded-3xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all group"
                                >
                                    <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                                        <span className="text-xs font-black">{index + 1}</span>
                                    </div>
                                    <p className="text-slate-700 font-bold text-sm tracking-tight pt-0.5">{area}</p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Admin Actions */}
                <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <motion.button
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors"
                    >
                        <CheckCircle2 className="w-4 h-4" /> Approve Report
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-amber-500 text-white font-black text-sm shadow-lg shadow-amber-200 hover:bg-amber-600 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" /> Request Re-Inspection
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-rose-600 text-white font-black text-sm shadow-lg shadow-rose-200 hover:bg-rose-700 transition-colors"
                    >
                        <XCircle className="w-4 h-4" /> Reject Report
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onBack}
                        className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-800 text-white font-black text-sm shadow-lg shadow-slate-200 hover:bg-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Report List
                    </motion.button>
                </div>

                <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pt-4">End of Official Document</p>
            </div>
        </motion.div>
    );
}

// ─── Report Listing ───────────────────────────────────────────────────────────

function ReportListing({
    onSelect,
}: {
    onSelect: (r: (typeof reportsData)[0]) => void;
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTab, setSelectedTab] = useState("All Reports");

    const filtered = reportsData.filter((r) => {
        const matchesTab = selectedTab === "All Reports" || r.status === selectedTab;
        const q = searchQuery.toLowerCase();
        const matchesSearch =
            !q ||
            r.schoolName.toLowerCase().includes(q) ||
            r.district.toLowerCase().includes(q) ||
            r.inspector.toLowerCase().includes(q) ||
            r.id.toLowerCase().includes(q);
        return matchesTab && matchesSearch;
    });

    return (
        <motion.div
            key="listing"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="pb-16"
        >
            {/* Page Header */}
            <header className="sticky top-0 z-20 bg-[#f8fafc]/80 backdrop-blur-md pt-4 pb-3 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inspection Reports</h1>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{reportsData.length} reports total</p>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                        <ShieldCheck className="w-5 h-5" />
                        <Building2 className="w-5 h-5" />
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by school, district, inspector, or ID…"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className={cn(
                                "shrink-0 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide transition-all",
                                selectedTab === tab
                                    ? "bg-slate-900 text-white shadow"
                                    : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            {/* Grid */}
            <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 text-slate-400 font-bold"
                    >
                        No reports found.
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map((report) => (
                            <ReportCard key={report.id} report={report} onClick={() => onSelect(report)} />
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Page Root ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
    const [selectedReport, setSelectedReport] = useState<(typeof reportsData)[0] | null>(null);

    return (
        <div className="max-w-5xl mx-auto px-4">
            <AnimatePresence mode="wait">
                {selectedReport === null ? (
                    <ReportListing key="listing" onSelect={setSelectedReport} />
                ) : (
                    <ReportDetail key={selectedReport.id} report={selectedReport} onBack={() => setSelectedReport(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}