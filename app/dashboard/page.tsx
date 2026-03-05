import DashboardLayout from "../components/DashboardLayout";
import {
    FiCheckCircle,
    FiAlertCircle,
    FiFileText,
    FiActivity,
    FiAward,
    FiBell,
    FiUser,
    FiArrowRight,
    FiClipboard,
    FiClock,
} from "react-icons/fi";
import Link from "next/link";

export default function DashboardPage() {
    return (
        <DashboardLayout>
            {/* Welcome */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">
                    Welcome to School Dashboard
                </h1>
                <p className="text-neutral-500 mt-1">
                    Manage your school profile, applications, and certificates
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Complete Profile", icon: FiUser, href: "/profile", color: "from-blue-500 to-blue-700" },
                    { label: "Submit Application", icon: FiFileText, href: "/registration", color: "from-emerald-500 to-emerald-700" },
                    { label: "Track Status", icon: FiActivity, href: "/status", color: "from-amber-500 to-amber-700" },
                    { label: "View Certificates", icon: FiAward, href: "/certificates", color: "from-purple-500 to-purple-700" },
                ].map((action) => (
                    <Link
                        key={action.label}
                        href={action.href}
                        className="group relative overflow-hidden rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${action.color}`} />
                        <div className="relative z-10">
                            <action.icon size={28} className="mb-3 opacity-90" />
                            <p className="text-sm font-semibold">{action.label}</p>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-500" />
                    </Link>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Profile Completion */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-neutral-800">Profile Completion</h2>
                        <span className="text-sm font-semibold text-primary-600">65%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-neutral-100 rounded-full mb-6 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-1000"
                            style={{ width: "65%" }}
                        />
                    </div>

                    {/* Checklist */}
                    <ul className="space-y-3 mb-6">
                        {[
                            { label: "Basic Details", done: true },
                            { label: "Location Details", done: true },
                            { label: "Infrastructure", done: true },
                            { label: "Staff Details", done: false },
                            { label: "Safety Documents", done: false },
                        ].map((item) => (
                            <li key={item.label} className="flex items-center gap-3">
                                {item.done ? (
                                    <FiCheckCircle className="text-emerald-500 shrink-0" size={18} />
                                ) : (
                                    <FiAlertCircle className="text-amber-500 shrink-0" size={18} />
                                )}
                                <span
                                    className={`text-sm ${item.done ? "text-neutral-600" : "text-neutral-800 font-medium"
                                        }`}
                                >
                                    {item.label}
                                    {!item.done && (
                                        <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                            Pending
                                        </span>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <Link
                        href="/profile"
                        className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/20"
                    >
                        Complete Profile <FiArrowRight size={16} />
                    </Link>
                </div>

                {/* Application Status */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                    <h2 className="text-lg font-bold text-neutral-800 mb-4">Application Status</h2>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-neutral-400 uppercase tracking-wider">Application ID</p>
                            <p className="text-sm font-semibold text-neutral-800 mt-0.5">APP-2026-001</p>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-400 uppercase tracking-wider">Status</p>
                            <span className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                Under Review
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-400 uppercase tracking-wider">Submitted On</p>
                            <p className="text-sm font-semibold text-neutral-800 mt-0.5">12 Feb 2026</p>
                        </div>
                    </div>
                    <Link
                        href="/status"
                        className="mt-5 inline-flex items-center gap-1 text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                    >
                        View Details <FiArrowRight size={14} />
                    </Link>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Notifications Preview */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-neutral-800">Notifications</h2>
                        <Link href="/notifications" className="text-xs text-primary-600 font-semibold hover:text-primary-700">
                            View All
                        </Link>
                    </div>
                    <ul className="space-y-3">
                        {[
                            { text: "Inspection scheduled for your school", icon: FiClipboard, time: "2h ago", color: "text-blue-500 bg-blue-50" },
                            { text: "Document verification pending", icon: FiAlertCircle, time: "5h ago", color: "text-amber-500 bg-amber-50" },
                            { text: "Profile incomplete — action required", icon: FiUser, time: "1d ago", color: "text-red-500 bg-red-50" },
                        ].map((n, i) => (
                            <li key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer">
                                <div className={`p-2 rounded-lg shrink-0 ${n.color}`}>
                                    <n.icon size={14} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-neutral-700 leading-snug">{n.text}</p>
                                    <p className="text-xs text-neutral-400 mt-1">{n.time}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Inspection Status */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                    <h2 className="text-lg font-bold text-neutral-800 mb-4">Inspection Status</h2>
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                            <FiClock size={28} className="text-amber-500" />
                        </div>
                        <p className="font-semibold text-neutral-800">Pending</p>
                        <p className="text-sm text-neutral-400 mt-1">Inspection Date: Not Scheduled</p>
                    </div>
                    <Link
                        href="/inspection"
                        className="w-full inline-flex items-center justify-center gap-1 text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                    >
                        View Details <FiArrowRight size={14} />
                    </Link>
                </div>

                {/* Certificate Status */}
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
                    <h2 className="text-lg font-bold text-neutral-800 mb-4">Certificate Status</h2>
                    <div className="flex flex-col items-center justify-center py-6">
                        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                            <FiAward size={28} className="text-neutral-400" />
                        </div>
                        <p className="font-semibold text-neutral-800">Not Issued</p>
                        <p className="text-sm text-neutral-400 mt-1">Complete profile & inspection first</p>
                    </div>
                    <Link
                        href="/certificates"
                        className="w-full inline-flex items-center justify-center gap-1 text-sm text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                    >
                        View Details <FiArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    );
}
