import DashboardLayout from "../components/DashboardLayout";
import {
    FiDownload,
    FiEye,
    FiAward,
    FiCalendar,
    FiCheckCircle,
    FiClock,
} from "react-icons/fi";

const certificates = [
    {
        id: "CERT-2025-112",
        type: "Recognition Certificate",
        issueDate: "15 Aug 2025",
        validity: "14 Aug 2026",
        status: "Active",
    },
    {
        id: "CERT-2024-089",
        type: "Recognition Certificate",
        issueDate: "10 Jul 2024",
        validity: "9 Jul 2025",
        status: "Expired",
    },
];

export default function CertificatesPage() {
    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-neutral-900">Certificates</h1>
                <p className="text-neutral-500 mt-1">View and download your recognition certificates</p>
            </div>

            {/* Summary Cards */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <FiCheckCircle size={22} className="text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-neutral-800">1</p>
                        <p className="text-xs text-neutral-500">Active Certificate</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                        <FiClock size={22} className="text-red-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-neutral-800">1</p>
                        <p className="text-xs text-neutral-500">Expired</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <FiAward size={22} className="text-blue-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-neutral-800">2</p>
                        <p className="text-xs text-neutral-500">Total Issued</p>
                    </div>
                </div>
            </div>

            {/* Certificate Cards */}
            <div className="space-y-4">
                {certificates.map((cert) => (
                    <div
                        key={cert.id}
                        className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                            {/* Left: Certificate visual */}
                            <div className="flex items-center gap-4 flex-1">
                                <div
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${cert.status === "Active" ? "bg-gradient-to-br from-emerald-400 to-emerald-600" : "bg-gradient-to-br from-neutral-300 to-neutral-400"
                                        }`}
                                >
                                    <FiAward size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-800">{cert.type}</h3>
                                    <p className="text-xs text-neutral-400 mt-0.5">{cert.id}</p>
                                </div>
                            </div>

                            {/* Middle: Details */}
                            <div className="flex flex-wrap items-center gap-6 flex-1">
                                <div>
                                    <p className="text-xs text-neutral-400">Issue Date</p>
                                    <p className="text-sm font-medium text-neutral-700 flex items-center gap-1">
                                        <FiCalendar size={12} /> {cert.issueDate}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-400">Valid Until</p>
                                    <p className="text-sm font-medium text-neutral-700 flex items-center gap-1">
                                        <FiCalendar size={12} /> {cert.validity}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-400">Status</p>
                                    <span
                                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${cert.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                                            }`}
                                    >
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full ${cert.status === "Active" ? "bg-emerald-500" : "bg-red-400"
                                                }`}
                                        />
                                        {cert.status}
                                    </span>
                                </div>
                            </div>

                            {/* Right: Actions + QR */}
                            <div className="flex items-center gap-3">
                                {/* QR Placeholder */}
                                <div className="w-16 h-16 bg-neutral-100 rounded-xl border-2 border-dashed border-neutral-200 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="grid grid-cols-3 gap-0.5 w-8 h-8 mx-auto">
                                            {Array.from({ length: 9 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-full h-full ${[0, 1, 2, 3, 5, 6, 8].includes(i) ? "bg-neutral-700" : "bg-white"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors">
                                        <FiEye size={14} /> View
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                                        <FiDownload size={14} /> Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Current Application Note */}
            <div className="mt-8 bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl border border-primary-100 p-6">
                <h3 className="text-sm font-bold text-primary-800 mb-1">📝 Current Application</h3>
                <p className="text-sm text-primary-700">
                    Your application <strong>APP-2026-001</strong> is currently under review. A new certificate will be issued upon successful completion of the inspection and approval process.
                </p>
            </div>
        </DashboardLayout>
    );
}
