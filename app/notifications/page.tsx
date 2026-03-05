"use client";

import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
    FiCalendar,
    FiAlertCircle,
    FiCheckCircle,
    FiInfo,
    FiBell,
    FiCheck,
} from "react-icons/fi";

interface Notification {
    id: number;
    title: string;
    message: string;
    date: string;
    type: "info" | "warning" | "success";
    read: boolean;
}

const initialNotifications: Notification[] = [
    {
        id: 1,
        title: "Inspection Scheduled",
        message: "An inspection has been scheduled for your school on 25 Feb 2026. Please ensure all required documents and facilities are ready for review.",
        date: "23 Feb 2026",
        type: "info",
        read: false,
    },
    {
        id: 2,
        title: "Document Re-upload Required",
        message: "The fire safety certificate you uploaded is unreadable. Please upload a clearer copy before 20 Feb 2026.",
        date: "16 Feb 2026",
        type: "warning",
        read: false,
    },
    {
        id: 3,
        title: "Application Submitted Successfully",
        message: "Your application APP-2026-001 has been submitted successfully and is now under review.",
        date: "12 Feb 2026",
        type: "success",
        read: false,
    },
    {
        id: 4,
        title: "Profile Incomplete",
        message: "Your school profile is only 65% complete. Please fill in Staff Details and Safety Documents to proceed with your application.",
        date: "10 Feb 2026",
        type: "warning",
        read: true,
    },
    {
        id: 5,
        title: "Welcome to the Portal",
        message: "Welcome to the School Recognition & Inspection Management System. Start by completing your school profile.",
        date: "5 Feb 2026",
        type: "info",
        read: true,
    },
];

const typeConfig = {
    info: { icon: FiInfo, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" },
    warning: { icon: FiAlertCircle, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100" },
    success: { icon: FiCheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100" },
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(initialNotifications);

    const markAsRead = (id: number) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <DashboardLayout>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Notifications</h1>
                    <p className="text-neutral-500 mt-1">
                        {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                    >
                        <FiCheck size={16} /> Mark All as Read
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {notifications.map((n) => {
                    const config = typeConfig[n.type];
                    const Icon = config.icon;

                    return (
                        <div
                            key={n.id}
                            className={`bg-white rounded-2xl shadow-sm border p-5 transition-all duration-300 ${n.read ? "border-neutral-100 opacity-70" : `${config.border} border-l-4`
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-2.5 rounded-xl ${config.bg} shrink-0`}>
                                    <Icon size={20} className={config.color} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-bold text-neutral-800">{n.title}</h3>
                                        {!n.read && (
                                            <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-sm text-neutral-600 leading-relaxed">{n.message}</p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <span className="flex items-center gap-1 text-xs text-neutral-400">
                                            <FiCalendar size={12} /> {n.date}
                                        </span>
                                        {!n.read && (
                                            <button
                                                onClick={() => markAsRead(n.id)}
                                                className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </DashboardLayout>
    );
}
