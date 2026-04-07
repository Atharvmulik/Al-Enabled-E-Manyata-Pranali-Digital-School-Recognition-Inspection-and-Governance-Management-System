"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import {
    FiDownload,
    FiEye,
    FiAward,
    FiCalendar,
    FiCheckCircle,
    FiClock,
    FiAlertCircle,
    FiLoader,
} from "react-icons/fi";
import { API_BASE_URL } from "@/lib/api";

// ─────────────────────────────────────────────
// Types (matching backend CertificatesPageResponse)
// ─────────────────────────────────────────────

type CertificateStatus = "Active" | "Expired" | "Revoked";

interface CertificateItem {
    id: string;
    type: string;
    issue_date: string;
    validity: string;
    status: CertificateStatus;
    download_url: string | null;
}

interface CertificatesSummary {
    active: number;
    expired: number;
    total: number;
}

interface CurrentApplicationNote {
    application_id: string;
    status: string;
}

interface CertificatesPageData {
    school_id: string;
    summary: CertificatesSummary;
    certificates: CertificateItem[];
    current_application: CurrentApplicationNote | null;
}

// ─────────────────────────────────────────────
// QR Placeholder (unchanged visual)
// ─────────────────────────────────────────────

function QRPlaceholder() {
    return (
        <div className="w-16 h-16 bg-neutral-100 rounded-xl border-2 border-dashed border-neutral-200 flex items-center justify-center shrink-0">
            <div className="grid grid-cols-3 gap-0.5 w-8 h-8">
                {Array.from({ length: 9 }).map((_, i) => (
                    <div
                        key={i}
                        className={`w-full h-full ${
                            [0, 1, 2, 3, 5, 6, 8].includes(i)
                                ? "bg-neutral-700"
                                : "bg-white"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────

export default function CertificatesPage() {
    const router = useRouter();

    const [data, setData] = useState<CertificatesPageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Per-certificate download loading state
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    // ── Fetch page data on mount ──────────────────────────────
    useEffect(() => {
        const raw = localStorage.getItem("user");
        if (!raw) {
            router.push("/login");
            return;
        }

        const user = JSON.parse(raw);
        const schoolId: string = user.user_id;
        const token: string | null = localStorage.getItem("token");

        async function fetchCertificates() {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch(`${API_BASE_URL}/certificates/${schoolId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (res.status === 401) {
                    router.push("/login");
                    return;
                }

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.detail || "Failed to load certificates.");
                }

                const json: CertificatesPageData = await res.json();
                setData(json);
            } catch (e) {
                setError((e as Error).message);
            } finally {
                setLoading(false);
            }
        }

        fetchCertificates();
    }, [router]);

    // ── Download handler ──────────────────────────────────────
    async function handleDownload(cert: CertificateItem) {
        setDownloadError(null);

        // If we already have a URL, open directly
        if (cert.download_url) {
            window.open(cert.download_url, "_blank");
            return;
        }

        const raw = localStorage.getItem("user");
        if (!raw) return;
        const user = JSON.parse(raw);
        const token = localStorage.getItem("token");

        try {
            setDownloadingId(cert.id);
            const res = await fetch(
                `${API_BASE_URL}/certificates/${user.user_id}/${cert.id}/download`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Download unavailable.");
            }

            const json: { certificate_id: string; download_url: string } = await res.json();

            // Update local state so next click opens directly
            setData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    certificates: prev.certificates.map((c) =>
                        c.id === cert.id ? { ...c, download_url: json.download_url } : c
                    ),
                };
            });

            window.open(json.download_url, "_blank");
        } catch (e) {
            setDownloadError((e as Error).message);
        } finally {
            setDownloadingId(null);
        }
    }

    // ── View handler ──────────────────────────────────────────
    function handleView(certId: string) {
        const raw = localStorage.getItem("user");
        if (!raw) return;
        const user = JSON.parse(raw);
        router.push(`/certificates/${certId}?school=${user.user_id}`);
    }

    // ─────────────────────────────────────────────
    // Loading state
    // ─────────────────────────────────────────────
    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-neutral-400">
                    <FiLoader size={28} className="animate-spin" />
                    <p className="text-sm">Loading certificates…</p>
                </div>
            </DashboardLayout>
        );
    }

    // ─────────────────────────────────────────────
    // Error state
    // ─────────────────────────────────────────────
    if (error || !data) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
                    <FiAlertCircle size={32} className="text-red-400" />
                    <p className="text-sm text-neutral-600">{error || "Something went wrong."}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 px-4 py-2 rounded-xl bg-primary-50 text-primary-700 text-sm font-semibold hover:bg-primary-100 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const { summary, certificates, current_application } = data;

    // ─────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────
    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-neutral-900">Certificates</h1>
                <p className="text-neutral-500 mt-1">
                    View and download your recognition certificates
                </p>
            </div>

            {/* ── Summary Cards ───────────────────────────── */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <FiCheckCircle size={22} className="text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-neutral-800">{summary.active}</p>
                        <p className="text-xs text-neutral-500">Active Certificate</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                        <FiClock size={22} className="text-red-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-neutral-800">{summary.expired}</p>
                        <p className="text-xs text-neutral-500">Expired</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <FiAward size={22} className="text-blue-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-neutral-800">{summary.total}</p>
                        <p className="text-xs text-neutral-500">Total Issued</p>
                    </div>
                </div>
            </div>

            {/* ── Download error banner ────────────────────── */}
            {downloadError && (
                <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                    <FiAlertCircle size={15} />
                    {downloadError}
                </div>
            )}

            {/* ── Certificate Cards ────────────────────────── */}
            {certificates.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-100 p-10 text-center text-neutral-400">
                    <FiAward size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No certificates issued yet.</p>
                </div>
            ) : (
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
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                                            cert.status === "Active"
                                                ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                                                : "bg-gradient-to-br from-neutral-300 to-neutral-400"
                                        }`}
                                    >
                                        <FiAward size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-neutral-800">
                                            {cert.type}
                                        </h3>
                                        <p className="text-xs text-neutral-400 mt-0.5">{cert.id}</p>
                                    </div>
                                </div>

                                {/* Middle: Details */}
                                <div className="flex flex-wrap items-center gap-6 flex-1">
                                    <div>
                                        <p className="text-xs text-neutral-400">Issue Date</p>
                                        <p className="text-sm font-medium text-neutral-700 flex items-center gap-1">
                                            <FiCalendar size={12} /> {cert.issue_date}
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
                                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
                                                cert.status === "Active"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : cert.status === "Revoked"
                                                    ? "bg-orange-50 text-orange-600"
                                                    : "bg-red-50 text-red-600"
                                            }`}
                                        >
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${
                                                    cert.status === "Active"
                                                        ? "bg-emerald-500"
                                                        : cert.status === "Revoked"
                                                        ? "bg-orange-400"
                                                        : "bg-red-400"
                                                }`}
                                            />
                                            {cert.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Right: Actions + QR */}
                                <div className="flex items-center gap-3">
                                    <QRPlaceholder />

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleView(cert.id)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                                        >
                                            <FiEye size={14} /> View
                                        </button>
                                        <button
                                            onClick={() => handleDownload(cert)}
                                            disabled={downloadingId === cert.id}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {downloadingId === cert.id ? (
                                                <>
                                                    <FiLoader size={14} className="animate-spin" /> Loading…
                                                </>
                                            ) : (
                                                <>
                                                    <FiDownload size={14} /> Download
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Current Application Note ─────────────────── */}
            {current_application && (
                <div className="mt-8 bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl border border-primary-100 p-6">
                    <h3 className="text-sm font-bold text-primary-800 mb-1">
                        📝 Current Application
                    </h3>
                    <p className="text-sm text-primary-700">
                        Your application{" "}
                        <strong>{current_application.application_id}</strong> is currently{" "}
                        <strong>{current_application.status.toLowerCase()}</strong>. A new
                        certificate will be issued upon successful completion of the inspection
                        and approval process.
                    </p>
                </div>
            )}
        </DashboardLayout>
    );
}