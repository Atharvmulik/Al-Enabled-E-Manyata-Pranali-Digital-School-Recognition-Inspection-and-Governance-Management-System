"use client";

import React, { useState, useEffect } from "react";
import {
    X, Building2, Receipt, Scale, MapPin, Wrench, Users,
    ShieldAlert, GraduationCap, BookOpen, Bus, CheckCircle2,
    Maximize2, Minimize2
} from "lucide-react";

import { cn } from "@/lib/utils";
import RequestChangesModal from "./admin/RequestChangesModal";

interface ProfileBookletModalProps {
    isOpen: boolean;
    onClose: () => void;
    schoolName: string;
    udiseCode: string;
    schoolId: string;
    mode?: "view" | "verify";
}

const SECTIONS = [
    { id: "basic", label: "Basic Details", icon: Building2 },
    { id: "receipts", label: "Receipts & Expenditure", icon: Receipt },
    { id: "legal", label: "Legal Details", icon: Scale },
    { id: "location", label: "Location", icon: MapPin },
    { id: "infra", label: "Infrastructure", icon: Wrench },
    { id: "staff", label: "Staff", icon: Users },
    { id: "safety", label: "Safety", icon: ShieldAlert },
    { id: "capacity", label: "Student Capacity", icon: GraduationCap },
    { id: "vocational", label: "Vocational Education", icon: BookOpen },
    { id: "transport", label: "Transportation Details", icon: Bus },
];

export default function ProfileBookletModal({
    isOpen, onClose, schoolName, udiseCode, schoolId, mode = "view"
}: ProfileBookletModalProps) {
    const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
    const [displayData, setDisplayData] = useState<any>(null);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const savedData = localStorage.getItem("profileData");
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    setDisplayData(parsed);
                } catch (e) {
                    console.error("Failed to parse profile data", e);
                    setDisplayData(null);
                }
            } else {
                setDisplayData(null);
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const getSectionData = (sectionId: string) => {
        if (!displayData) return null;

        switch (sectionId) {
            case "basic":
                return [
                    { label: "School Name", value: displayData.schoolName },
                    { label: "UDISE Number", value: displayData.udiseNumber },
                    { label: "Year of Establishment", value: displayData.estYear },
                    { label: "Board Affiliation", value: displayData.boardAffiliation },
                    { label: "School Category", value: displayData.schoolCategory },
                    { label: "School Type", value: displayData.schoolType },
                    { label: "Classification", value: displayData.classification },
                    { label: "Application Type", value: displayData.applicationType },
                    { label: "STD Code", value: displayData.stdCode },
                    { label: "Landline", value: displayData.landline },
                    { label: "Mobile", value: displayData.mobile },
                    { label: "Email", value: displayData.email },
                    { label: "Website", value: displayData.website },
                    { label: "Management Group", value: displayData.managementGroup },
                    { label: "Management Code", value: displayData.managementCode },
                    { label: "Sub Management", value: displayData.subManagement },
                    { label: "PM-SHRI School", value: displayData.isPmShri },
                    { label: "Lowest Class", value: displayData.lowestClass },
                    { label: "Highest Class", value: displayData.highestClass },
                    { label: "Has Pre-Primary", value: displayData.hasPrePrimary },
                    { label: "Location Type", value: displayData.locationType },
                    { label: "Is Vocational", value: displayData.isVocational },
                ];
            case "location":
                return [
                    { label: "Address", value: displayData.address },
                    { label: "Pin Code", value: displayData.pinCode },
                    { label: "District", value: displayData.district },
                    { label: "Taluka", value: displayData.taluka },
                    { label: "Revenue Block", value: displayData.revenueBlock },
                    { label: "Village Name", value: displayData.villageName },
                    { label: "Gram Panchayat", value: displayData.gramPanchayat },
                    { label: "Urban Local Body", value: displayData.urbanLocalBody },
                    { label: "Ward Name", value: displayData.wardName },
                    { label: "CRC Name", value: displayData.crcName },
                    { label: "Assembly Constituency", value: displayData.assemblyConstituency },
                    { label: "Parliamentary Constituency", value: displayData.parliamentaryConstituency },
                    { label: "Location Type", value: displayData.locationType },
                ];
            case "infra":
                return [
                    { label: "Building Status", value: displayData.buildingStatus },
                    { label: "Land Area", value: displayData.landArea ? `${displayData.landArea} ${displayData.landAreaUnit || ""}` : "" },
                    { label: "Has Playground", value: displayData.hasPlayground },
                    { label: "Total Classrooms", value: displayData.totalClassrooms },
                    { label: "Has Electricity", value: displayData.hasElectricity },
                    { label: "Has Library", value: displayData.hasLibrary },
                    { label: "Has Ramp", value: displayData.hasRamp },
                ];
            case "staff":
                return [
                    { label: "Total Teaching Staff", value: displayData.totalTeachingStaff },
                    { label: "Total Non-Teaching Staff", value: displayData.totalNonTeachingStaff },
                    { label: "Total Vocational Staff", value: displayData.totalVocationalStaff },
                ];
            case "capacity":
                return [
                    { label: "Total Students", value: displayData.totalStudents },
                ];
            case "transport":
                return [
                    { label: "Fitness Certificate", value: displayData.transFitnessCert },
                    { label: "Vehicle Age", value: displayData.transVehicleAge },
                    { label: "Permit", value: displayData.transPermit },
                    { label: "Speed Governor", value: displayData.transSpeedGovernor },
                    { label: "Vehicle Exterior Condition", value: displayData.transVehicleExterior },
                    { label: "School Bus Prominently Marked", value: displayData.transSchoolBusProminent },
                    { label: "Hired Bus on Duty", value: displayData.transHiredBusDuty },
                    { label: "School Name Written", value: displayData.transSchoolNameWritten },
                    { label: "Driver Experience", value: displayData.transDriverExperience },
                    { label: "Driver No Traffic Offences", value: displayData.transDriverNoTrafficOffences },
                    { label: "Auto Safety", value: displayData.transAutoSafety },
                    { label: "Auto Parent Instruction", value: displayData.transAutoParentInstruction },
                    { label: "Auto Registered", value: displayData.transAutoRegistered },
                ];
            default:
                return null;
        }
    };

    const sectionItems = getSectionData(activeSection);

    
    return (
        <div className={cn(
            "fixed inset-0 z-[100] flex bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200",
            isFullScreen ? "justify-center items-center" : "justify-end"
        )}>
            <div className={cn(
                "bg-slate-50 shadow-2xl flex flex-col transition-all duration-500 overflow-hidden",
                isFullScreen
                    ? "w-screen h-screen rounded-none"
                    : "w-[90vw] md:w-[80vw] lg:w-[1000px] h-full animate-in slide-in-from-right"
            )}>
                {/* Header */}
                <div className="bg-white px-8 py-6 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-sm shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">
                                {schoolName || displayData?.schoolName || "School Name"}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    UDISE: {udiseCode || displayData?.udiseNumber || "—"}
                                </span>
                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                                    {mode === "verify" ? "Verification Mode" : "Profile Booklet View"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsFullScreen(!isFullScreen)}
                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                            title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
                        >
                            {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors group">
                            <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:rotate-90 transition-all duration-300" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-72 bg-white border-r border-slate-200 overflow-y-auto p-6 space-y-2 hidden md:block">
                        {SECTIONS.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all group",
                                    activeSection === section.id
                                        ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-1"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                                )}
                            >
                                <section.icon className={cn(
                                    "w-4 h-4 transition-transform group-hover:scale-110",
                                    activeSection === section.id ? "text-white" : "text-slate-400"
                                )} />
                                <span className="text-left">{section.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 relative">
                        <div className="flex-1 overflow-y-auto p-8 pb-32">
                            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="mb-8 border-b border-slate-200 pb-4">
                                    <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                                        {SECTIONS.find(s => s.id === activeSection)?.label}
                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                    </h3>
                                    <p className="text-xs text-slate-400 font-medium mt-1">
                                        Review accurate data from official school records.
                                    </p>
                                </div>

                                {displayData ? (
                                    sectionItems && sectionItems.length > 0 ? (
                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                                            <div className="divide-y divide-slate-100">
                                                {sectionItems.map((item, i) => (
                                                    <div key={i} className="flex flex-col sm:flex-row sm:items-start justify-between px-6 py-4 hover:bg-slate-50/40 transition-colors gap-4">
                                                        <span className="text-sm font-medium text-slate-500 sm:w-1/2 mt-0.5">{item.label}</span>
                                                        <div className="text-sm font-semibold text-slate-800 sm:w-1/2 sm:text-right flex items-center sm:justify-end gap-2 text-right">
                                                            {item.value === "1-Yes" ||
                                                                item.value === "Yes" ||
                                                                item.value === true ||
                                                                item.value === "true" ||
                                                                item.value === 1
                                                                ? <span className="text-emerald-600 flex items-center gap-1.5 justify-end"><CheckCircle2 className="w-4 h-4" /> Yes</span>
                                                                : <span>{item.value || <span className="text-slate-300 italic">Not Provided</span>}</span>
                                                            }
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                                            <pre className="text-xs text-slate-600 whitespace-pre-wrap overflow-auto max-h-[60vh]">
                                                {JSON.stringify(displayData, null, 2)}
                                            </pre>
                                        </div>
                                    )
                                ) : (
                                    <div className="text-center text-slate-400 py-20 font-bold uppercase tracking-widest text-[10px]">
                                        No Data Found
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Verification Footer */}
                        {mode === "verify" && (
                            <div className="border-t border-slate-200 bg-white p-6 shrink-0 z-10 w-full flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 font-black uppercase tracking-widest text-[10px]">
                                        Verification Remarks
                                    </label>
                                    <textarea
                                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                                        rows={3}
                                        placeholder="Add your constructive remarks or reasons for rejection here..."
                                    />
                                </div>
                                <div className="flex flex-wrap items-center justify-end gap-3">
                                    <button
                                        className="px-5 py-2.5 rounded-xl border border-rose-200 text-rose-600 font-black uppercase tracking-widest text-[10px] hover:bg-rose-50 transition-colors"
                                        onClick={() => { alert("Application Rejected"); onClose(); }}
                                    >
                                        Reject Application
                                    </button>
                                    <button
                                        className="px-5 py-2.5 rounded-xl border border-amber-200 text-amber-600 font-black uppercase tracking-widest text-[10px] hover:bg-amber-50 transition-colors"
                                        onClick={() => setIsRequestModalOpen(true)}
                                    >
                                        Request Changes
                                    </button>
                                    <button
                                        className="bg-emerald-600 text-white px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
                                        onClick={() => { alert("Profile Verified!"); onClose(); }}
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Approve Profile
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <RequestChangesModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                schoolName={schoolName || displayData?.schoolName || "School Name"}
            />
        </div>
    );
}