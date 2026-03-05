import DashboardLayout from "../components/DashboardLayout";
import {
    FiCalendar,
    FiClock,
    FiUser,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiFileText,
} from "react-icons/fi";

const checklist = [
    { item: "Classrooms", status: "Satisfactory" },
    { item: "Library", status: "Satisfactory" },
    { item: "Science Lab", status: "Needs Improvement" },
    { item: "Computer Lab", status: "Satisfactory" },
    { item: "Playground", status: "Satisfactory" },
    { item: "Fire Safety", status: "Not Checked" },
    { item: "Sanitation", status: "Satisfactory" },
    { item: "Drinking Water", status: "Satisfactory" },
];

const statusStyle = {
    Satisfactory: { icon: FiCheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    "Needs Improvement": { icon: FiAlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
    "Not Checked": { icon: FiXCircle, color: "text-neutral-400", bg: "bg-neutral-100" },
};

export default function InspectionPage() {
    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-neutral-900">Inspection Information</h1>
                <p className="text-neutral-500 mt-1">View inspection details, checklist, and report</p>
            </div>

            {/* Inspection Details */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {[
                    { label: "Inspection ID", value: "INS-2026-047", icon: FiFileText },
                    { label: "Date", value: "25 Feb 2026", icon: FiCalendar },
                    { label: "Time", value: "10:00 AM", icon: FiClock },
                    { label: "Officer", value: "Mr. Rajesh Kumar", icon: FiUser },
                    { label: "Status", value: "Scheduled", icon: FiAlertCircle, badge: true },
                ].map((item) => (
                    <div key={item.label} className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
                        <div className="flex items-center gap-2 mb-2 text-neutral-400">
                            <item.icon size={14} />
                            <p className="text-xs uppercase tracking-wider">{item.label}</p>
                        </div>
                        {item.badge ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                {item.value}
                            </span>
                        ) : (
                            <p className="text-sm font-semibold text-neutral-800">{item.value}</p>
                        )}
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Checklist */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                    <h2 className="text-lg font-bold text-neutral-800 mb-5">Inspection Checklist</h2>
                    <div className="space-y-3">
                        {checklist.map((c) => {
                            const style = statusStyle[c.status as keyof typeof statusStyle];
                            const Icon = style.icon;
                            return (
                                <div
                                    key={c.item}
                                    className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 hover:bg-neutral-50/50 transition-colors"
                                >
                                    <span className="text-sm font-medium text-neutral-700">{c.item}</span>
                                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${style.bg} ${style.color}`}>
                                        <Icon size={12} />
                                        {c.status}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Report */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                        <h2 className="text-lg font-bold text-neutral-800 mb-4">Inspection Report</h2>

                        <div className="mb-5">
                            <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Overall Result</p>
                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 text-amber-700 text-sm font-bold rounded-full">
                                <FiClock size={14} />
                                Pending
                            </span>
                        </div>

                        <div>
                            <p className="text-xs text-neutral-400 uppercase tracking-wider mb-2">Remarks</p>
                            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                                <p className="text-sm text-neutral-600 leading-relaxed">
                                    The inspection is scheduled for 25 Feb 2026. The inspecting officer will review all infrastructure, safety measures, and documentation. Please ensure that all facilities are accessible and all documents are available in original copies.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl border border-primary-100 p-6">
                        <h3 className="text-sm font-bold text-primary-800 mb-2">📋 Preparation Tips</h3>
                        <ul className="space-y-2 text-sm text-primary-700">
                            <li className="flex items-start gap-2">
                                <FiCheckCircle className="shrink-0 mt-0.5" size={14} />
                                Keep all original documents ready for verification
                            </li>
                            <li className="flex items-start gap-2">
                                <FiCheckCircle className="shrink-0 mt-0.5" size={14} />
                                Ensure all fire safety equipment is functional
                            </li>
                            <li className="flex items-start gap-2">
                                <FiCheckCircle className="shrink-0 mt-0.5" size={14} />
                                Labs and library should be accessible
                            </li>
                            <li className="flex items-start gap-2">
                                <FiCheckCircle className="shrink-0 mt-0.5" size={14} />
                                Principal and key staff should be available
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
