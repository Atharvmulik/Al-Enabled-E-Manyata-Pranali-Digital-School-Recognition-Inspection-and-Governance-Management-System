import DashboardLayout from "../components/DashboardLayout";
import {
    FiCheckCircle,
    FiClock,
    FiAlertCircle,
    FiUpload,
    FiArrowRight,
} from "react-icons/fi";

const timelineSteps = [
    {
        label: "Application Submitted",
        date: "12 Feb 2026",
        status: "done" as const,
        detail: "Your application has been received successfully.",
    },
    {
        label: "Document Verification",
        date: "14 Feb 2026",
        status: "done" as const,
        detail: "All submitted documents have been verified.",
    },
    {
        label: "Inspection",
        date: "18 Feb 2026",
        status: "current" as const,
        detail: "On-site inspection is being processed.",
    },
    {
        label: "Approval",
        date: "--",
        status: "pending" as const,
        detail: "Awaiting inspection completion for approval.",
    },
    {
        label: "Certificate Issued",
        date: "--",
        status: "pending" as const,
        detail: "Certificate will be issued after approval.",
    },
];

export default function StatusPage() {
    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-neutral-900">Application Status</h1>
                <p className="text-neutral-500 mt-1">Track your application progress in real time</p>
            </div>

            {/* Application Info */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Application ID", value: "APP-2026-001" },
                    { label: "Application Type", value: "New Recognition" },
                    { label: "Submitted On", value: "12 Feb 2026" },
                    { label: "Current Status", value: "Under Review", badge: true },
                ].map((item) => (
                    <div key={item.label} className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5">
                        <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">{item.label}</p>
                        {item.badge ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-sm font-semibold rounded-full">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                {item.value}
                            </span>
                        ) : (
                            <p className="text-sm font-semibold text-neutral-800">{item.value}</p>
                        )}
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Timeline */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 lg:p-8">
                    <h2 className="text-lg font-bold text-neutral-800 mb-6">Progress Timeline</h2>
                    <div className="relative">
                        {timelineSteps.map((step, i) => (
                            <div key={step.label} className="flex gap-4 mb-8 last:mb-0">
                                {/* Connector */}
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${step.status === "done"
                                                ? "bg-emerald-100 text-emerald-600"
                                                : step.status === "current"
                                                    ? "bg-primary-100 text-primary-600 ring-4 ring-primary-50"
                                                    : "bg-neutral-100 text-neutral-400"
                                            }`}
                                    >
                                        {step.status === "done" ? (
                                            <FiCheckCircle size={18} />
                                        ) : step.status === "current" ? (
                                            <FiClock size={18} />
                                        ) : (
                                            <FiAlertCircle size={18} />
                                        )}
                                    </div>
                                    {i < timelineSteps.length - 1 && (
                                        <div
                                            className={`w-0.5 flex-1 mt-2 ${step.status === "done" ? "bg-emerald-300" : "bg-neutral-200"
                                                }`}
                                        />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="pt-1.5 pb-2">
                                    <h3
                                        className={`text-sm font-bold ${step.status === "current" ? "text-primary-700" : step.status === "done" ? "text-neutral-800" : "text-neutral-400"
                                            }`}
                                    >
                                        {step.label}
                                    </h3>
                                    <p className="text-xs text-neutral-400 mt-0.5">{step.date}</p>
                                    <p className="text-sm text-neutral-500 mt-1">{step.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                    {/* Remarks */}
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                        <h2 className="text-lg font-bold text-neutral-800 mb-4">Remarks</h2>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="text-sm text-amber-800">
                                <strong>Inspector Note:</strong> Please upload a clearer copy of the fire safety certificate. The uploaded document is unreadable.
                            </p>
                            <p className="text-xs text-amber-600 mt-2">Received on 16 Feb 2026</p>
                        </div>
                    </div>

                    {/* Pending Actions */}
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                        <h2 className="text-lg font-bold text-neutral-800 mb-4">Pending Actions</h2>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                                <FiUpload className="text-red-500 shrink-0" size={18} />
                                <div>
                                    <p className="text-sm font-medium text-red-800">Upload Fire Safety Certificate</p>
                                    <p className="text-xs text-red-500">Due by 20 Feb 2026</p>
                                </div>
                            </li>
                            <li className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                                <FiCheckCircle className="text-amber-500 shrink-0" size={18} />
                                <div>
                                    <p className="text-sm font-medium text-amber-800">Confirm Inspection Date</p>
                                    <p className="text-xs text-amber-500">Respond before 22 Feb 2026</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
