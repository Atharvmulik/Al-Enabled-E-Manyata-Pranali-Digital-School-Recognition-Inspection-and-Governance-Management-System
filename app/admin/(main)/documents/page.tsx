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
    Info,
    ChevronRight,
    ChevronLeft,
    Clock,
    MinusCircle,
    Maximize2,
    Minimize2
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Mock Data ---
const schoolDocuments = [
    { id: 1, name: "Public High School", items: 4, type: "Urgent", status: "Pending" },
    { id: 2, name: "Gyan Mandir Academy", items: 2, type: "Normal", status: "Reviewing" },
    { id: 3, name: "Convent Academy", items: 8, type: "Normal", status: "Pending" },
    { id: 4, name: "Heritage Global", items: 1, type: "Urgent", status: "Rejected" },
];

export type DocStatus = "Pending" | "Approved" | "Rejected" | "Not Required";
export type DocRequirement = "Mandatory" | "Conditional" | "Optional";

export interface DocumentItem {
    id: string;
    name: string;
    status: DocStatus;
    requirement: DocRequirement;
    fileName?: string;
}

export interface DocumentCategory {
    category: string;
    docs: DocumentItem[];
}

const documentCategoriesData: DocumentCategory[] = [
    {
        category: "1. Basic & Legal Details",
        docs: [
            { id: "reg", name: "Registration Certificate", status: "Approved", requirement: "Mandatory", fileName: "Registration_Cert_2015.pdf" },
            { id: "trust", name: "Trust Certificate", status: "Pending", requirement: "Mandatory", fileName: "Trust_Deed_Signed.pdf" },
            { id: "recog", name: "Current Recognition Certificate(s)", status: "Pending", requirement: "Mandatory", fileName: "Prev_Recognition_2020.pdf" }
        ]
    },
    {
        category: "2. Infrastructure & Land",
        docs: [
            { id: "land", name: "3.4 Land Document", status: "Pending", requirement: "Mandatory", fileName: "Land_Registry_Copy.pdf" },
            { id: "noc", name: "3.5 NOC Certificate", status: "Pending", requirement: "Mandatory", fileName: "Fire_NOC_2024.pdf" },
            { id: "build", name: "3.6 Building Approval", status: "Approved", requirement: "Mandatory", fileName: "Building_Plan_Apprv.pdf" },
            { id: "rent", name: "Rent Agreement (Min 3-5 Years)", status: "Not Required", requirement: "Conditional" }
        ]
    },
    {
        category: "3. Safety & Maintenance",
        docs: [
            { id: "fit", name: "Fitness Certificate from PWD", status: "Pending", requirement: "Mandatory", fileName: "PWD_Fitness_Cert.pdf" },
            { id: "struct", name: "Structural Stability Certificate", status: "Not Required", requirement: "Conditional" },
            { id: "rep", name: "Repair Plan / Quote", status: "Not Required", requirement: "Conditional" },
            { id: "maint", name: "Maintenance/Repair Plan", status: "Pending", requirement: "Conditional", fileName: "Maintenance_Log_24.pdf" },
            { id: "pwd_safe", name: "PWD Structural Safety Certificate", status: "Pending", requirement: "Mandatory", fileName: "PWD_Structural_Safety.pdf" },
            { id: "fire", name: "Fire Department Certificate", status: "Approved", requirement: "Mandatory", fileName: "Fire_Safety_Cert.pdf" },
            { id: "sdmp", name: "SDMP Document", status: "Pending", requirement: "Mandatory", fileName: "Disaster_Mgmt_Plan.pdf" },
            { id: "sssa", name: "SSSA Certificate / Receipt", status: "Rejected", requirement: "Mandatory", fileName: "SSSA_Self_Cert.pdf" }
        ]
    },
    {
        category: "4. Facilities & Equipment",
        docs: [
            { id: "water", name: "Water Quality Test Report", status: "Pending", requirement: "Mandatory", fileName: "Water_Test_Lab.pdf" },
            { id: "hos_fire", name: "Hostel Fire Safety Cert.", status: "Not Required", requirement: "Conditional" },
            { id: "hos_fssai", name: "Food Safety (FSSAI) License", status: "Not Required", requirement: "Conditional" },
            { id: "hos_warden", name: "Warden Details / Identity", status: "Not Required", requirement: "Conditional" },
            { id: "lab_photo", name: "Lab Photos / Equipment List", status: "Pending", requirement: "Conditional", fileName: "Science_Lab_Photos.pdf" }
        ]
    },
    {
        category: "5. Management & Development Details",
        docs: [
            { id: "smc", name: "List of SMC/SDMC Members", status: "Approved", requirement: "Mandatory", fileName: "SMC_Members_List.pdf" },
            { id: "sdp", name: "School Development Plan Document", status: "Pending", requirement: "Mandatory", fileName: "School_Dev_Plan_24.pdf" },
            { id: "report", name: "Sample Cumulative Record / Progress Report", status: "Pending", requirement: "Mandatory", fileName: "Student_Progress_Sample.pdf" },
            { id: "safety", name: "Safety Access Plan", status: "Not Required", requirement: "Conditional" },
            { id: "fit_india", name: "Fit India Certificate", status: "Pending", requirement: "Optional", fileName: "Fit_India_Reg.pdf" }
        ]
    }
];

// Flat list for navigation
const flatDocumentsList = documentCategoriesData.flatMap(cat => cat.docs).filter(d => d.status !== "Not Required");

export default function DocumentsPage() {
    const [rejectionReason, setRejectionReason] = React.useState("");
    const [isFullScreen, setIsFullScreen] = React.useState(false);
    const [selectedSchool, setSelectedSchool] = React.useState(schoolDocuments[0]);
    const [selectedDocumentId, setSelectedDocumentId] = React.useState<string | null>(null);

    const selectedDocument = React.useMemo(() => {
        if (!selectedDocumentId) return null;
        return flatDocumentsList.find(d => d.id === selectedDocumentId) || null;
    }, [selectedDocumentId]);

    const currentIndex = flatDocumentsList.findIndex(d => d.id === selectedDocumentId);
    const hasNext = currentIndex >= 0 && currentIndex < flatDocumentsList.length - 1;
    const hasPrevious = currentIndex > 0;

    const handleNext = () => {
        if (hasNext) setSelectedDocumentId(flatDocumentsList[currentIndex + 1].id);
        setRejectionReason("");
    };

    const handlePrevious = () => {
        if (hasPrevious) setSelectedDocumentId(flatDocumentsList[currentIndex - 1].id);
        setRejectionReason("");
    };

    const StatusBadge = ({ status }: { status: DocStatus }) => {
        switch (status) {
            case "Approved": return <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Check className="w-3 h-3" /> Approved</span>;
            case "Rejected": return <span className="text-[10px] font-black uppercase tracking-widest bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertOctagon className="w-3 h-3" /> Rejected</span>;
            case "Not Required": return <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex items-center gap-1"><MinusCircle className="w-3 h-3" /> N/A</span>;
            default: return <span className="text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
        }
    };

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

                {/* Right Side: Content Area (List OR Viewer) */}
                <div className="flex-1 flex flex-col bg-slate-50/50">
                    {!selectedDocument ? (
                        /* --- 1. CATEGORIZED DOCUMENT LIST --- */
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            <div className="max-w-4xl mx-auto space-y-8">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Required Documents</h2>
                                        <p className="text-xs font-medium text-slate-500 mt-1">Select a document to review and verify.</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> 3 Approved</div>
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> 10 Pending</div>
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500" /> 1 Rejected</div>
                                    </div>
                                </div>

                                {documentCategoriesData.map((category, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100">
                                            <h3 className="text-sm font-bold text-slate-800">{category.category}</h3>
                                        </div>
                                        <div className="divide-y divide-slate-100">
                                            {category.docs.map(doc => (
                                                <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/30 transition-colors">
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-start gap-3">
                                                            <div className={cn(
                                                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                                                doc.status === "Approved" ? "bg-emerald-50 text-emerald-600" :
                                                                    doc.status === "Rejected" ? "bg-rose-50 text-rose-600" :
                                                                        doc.status === "Not Required" ? "bg-slate-100 text-slate-400" :
                                                                            "bg-blue-50 text-blue-600"
                                                            )}>
                                                                <FileText className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className={cn("text-sm font-bold", doc.status === "Not Required" ? "text-slate-400 line-through decoration-slate-300" : "text-slate-800")}>{doc.name}</h4>
                                                                    {doc.requirement === "Mandatory" && <span className="text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded">Required</span>}
                                                                </div>
                                                                <p className="text-[11px] font-medium text-slate-400 mt-1">{doc.fileName || "No file uploaded yet"}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 pl-13 sm:pl-0">
                                                        <StatusBadge status={doc.status} />
                                                        {doc.status !== "Not Required" && (
                                                            <button
                                                                onClick={() => setSelectedDocumentId(doc.id)}
                                                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm flex items-center gap-2 group"
                                                            >
                                                                Review <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* --- 2. DOCUMENT VIEWER --- */
                        <div className="flex-1 flex flex-col h-full overflow-hidden animate-in slide-in-from-right-8 duration-300">
                            {/* Viewer Header */}
                            <div className="p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm z-10 shrink-0">
                                <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                                    <button
                                        onClick={() => setSelectedDocumentId(null)}
                                        className="p-2 -ml-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shrink-0">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-black text-slate-900 tracking-tight truncate">{selectedDocument.fileName || selectedDocument.name}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {selectedSchool.name}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <StatusBadge status={selectedDocument.status} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                    <div className="flex items-center bg-slate-100 p-1 rounded-xl mr-2">
                                        <button
                                            onClick={handlePrevious}
                                            disabled={!hasPrevious}
                                            className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:shadow-none flex items-center gap-1"
                                        >
                                            <ChevronLeft className="w-3 h-3" /> Prev
                                        </button>
                                        <div className="w-px h-4 bg-slate-200 mx-1" />
                                        <button
                                            onClick={handleNext}
                                            disabled={!hasNext}
                                            className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:shadow-none flex items-center gap-1"
                                        >
                                            Next <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => setIsFullScreen(true)}
                                        className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 shadow-sm mr-2 group"
                                        title="Full Screen Preview"
                                    >
                                        <Maximize2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    </button>
                                    <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                                        <Check className="w-4 h-4" /> Approve
                                    </button>
                                </div>
                            </div>

                            {/* Viewer Body Layout */}
                            <div className="flex-1 flex flex-col md:flex-row p-6 gap-6 overflow-hidden bg-slate-100/30">
                                {/* The PDF / Doc Preview Canvas */}
                                <div className="flex-1 overflow-y-auto scrollbar-hide flex justify-center bg-slate-500/5 rounded-2xl border border-slate-200 p-8 shadow-inner">
                                    <div className="w-full max-w-[600px] aspect-[1/1.414] bg-white shadow-xl rounded-sm border border-slate-200 flex flex-col p-16 select-none relative animate-in zoom-in-95 duration-500">
                                        {/* Mock Certificate Content */}
                                        <div className="flex flex-col items-center mb-16 border-b border-slate-100 pb-12">
                                            <div className="w-16 h-16 border-4 border-slate-900 flex items-center justify-center font-black text-2xl mb-6 opacity-80 decoration-slice">GOV</div>
                                            <h2 className="text-xl sm:text-2xl font-serif font-black uppercase tracking-[0.2em] text-center">{selectedDocument.name}</h2>
                                            <p className="text-slate-400 font-serif text-xs mt-3 tracking-widest uppercase">{selectedSchool.name}</p>
                                        </div>

                                        <div className="space-y-8 flex-1 opacity-60">
                                            <div className="h-3 bg-slate-200 w-full rounded-full" />
                                            <div className="h-3 bg-slate-200 w-[95%] rounded-full" />
                                            <div className="h-3 bg-slate-200 w-[80%] rounded-full" />
                                            <div className="py-12 px-6 border-y border-slate-100 relative mt-8">
                                                <div className="text-[10px] text-slate-400 absolute top-2 left-1/2 -translate-x-1/2 uppercase tracking-widest font-bold">Encrypted Digital Proof</div>
                                                <div className="h-2 bg-slate-200 w-full rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Validation Side Panel */}
                                <div className="w-full md:w-80 flex flex-col gap-4 overflow-y-auto pr-2 pb-2 scrollbar-hide">
                                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm shrink-0">
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

                                    <div className="bg-blue-950 p-6 rounded-3xl shadow-xl shadow-blue-900/10 relative overflow-hidden group shrink-0">
                                        <div className="relative z-10">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                                                <ShieldCheck className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <h4 className="text-sm font-bold text-white mb-2 tracking-tight">AI Compliance Check</h4>
                                            <p className="text-[10px] text-blue-200/70 font-medium leading-relaxed">
                                                System has cross-verified this document with the national database. No anomalies detected.
                                            </p>
                                            <div className="mt-4 flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-blue-900 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-400 w-[100%]" />
                                                </div>
                                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Valid</span>
                                            </div>
                                        </div>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all duration-700"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Full Screen Modal */}
            <AnimatePresence>
                {isFullScreen && selectedDocument && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex flex-col p-6 sm:p-12 overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-8 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white tracking-tight">{selectedDocument.fileName || selectedDocument.name}</h3>
                                    <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">{selectedSchool.name}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsFullScreen(false)}
                                className="group flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all border border-white/10 backdrop-blur-sm"
                            >
                                <span className="text-xs font-bold tracking-widest uppercase">Minimize</span>
                                <Minimize2 className="w-4 h-4 group-hover:scale-90 transition-transform" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-hide flex justify-center bg-white/5 rounded-3xl border border-white/10 p-4 sm:p-8">
                            <div className="w-full max-w-[850px] aspect-[1/1.414] bg-white shadow-2xl rounded-sm flex flex-col p-12 sm:p-24 select-none relative origin-top">
                                {/* Certificate Content at Full Scale */}
                                <div className="flex flex-col items-center mb-16 border-b border-slate-100 pb-12">
                                    <div className="w-20 h-20 border-8 border-slate-900 flex items-center justify-center font-black text-3xl mb-8 opacity-80">GOV</div>
                                    <h2 className="text-3xl sm:text-4xl font-serif font-black uppercase tracking-[0.3em] text-center leading-tight">{selectedDocument.name}</h2>
                                    <p className="text-slate-400 font-serif text-sm mt-4 tracking-[0.4em] uppercase">{selectedSchool.name}</p>
                                </div>

                                <div className="space-y-12 flex-1 opacity-60">
                                    <div className="h-4 bg-slate-100 w-full rounded-full" />
                                    <div className="h-4 bg-slate-100 w-[95%] rounded-full" />
                                    <div className="h-4 bg-slate-100 w-[98%] rounded-full" />
                                    <div className="h-4 bg-slate-100 w-[80%] rounded-full" />
                                    <div className="h-4 bg-slate-100 w-[90%] rounded-full" />
                                    <div className="py-20 px-10 border-y-2 border-slate-100 relative mt-16 flex flex-col items-center">
                                        <div className="text-[11px] text-slate-300 absolute -top-3 bg-white px-4 uppercase tracking-[0.5em] font-black">Official Digital Clearance</div>
                                        <div className="w-full max-w-sm h-3 bg-slate-100 rounded-full" />
                                        <div className="w-2/3 h-3 bg-slate-100 rounded-full mt-4" />
                                    </div>
                                    <div className="flex justify-between items-end mt-20">
                                        <div className="space-y-3">
                                            <div className="w-32 h-2 bg-slate-100 rounded-full" />
                                            <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Authority Signature</p>
                                        </div>
                                        <div className="w-24 h-24 border-4 border-slate-100 rounded-full flex items-center justify-center text-[8px] text-slate-200 font-black uppercase text-center p-2 rotate-12">
                                            Verified Digital Seal
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
