"use client";

import React, { useEffect, useState } from "react";
import {
    Cpu,
    Zap,
    Activity,
    AlertTriangle,
    BarChart,
    X,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

// ─── Types ─────────────────────────────────────────

type AIReport = {
    school: string;
    infraScore: number;
    qualityCategory: string;
    aiStatus: string;
    suggestion: string;
    severity: string;
};

// ─── Dummy Input (TEST DATA) ───────────────────────

const dummyInput = {
    TOTAL_STUDENTS: 500,
    TOTAL_TEACHERS: 20,
    total_boys_toilet: 5,
    total_boys_func_toilet: 4,
    total_girls_toilet: 5,
    total_girls_func_toilet: 4,
    total_class_rooms: 15,
    classrooms_in_good_condition: 10,
    internet: 1,
    comp_ict_lab_yn: 0,
    ict_lab_yn: 1,
    laptop: 5,
    desktop: 10,
    digiboard: 1,
    projector: 1,
};

// ─── Component ─────────────────────────────────────

export default function AIMonitoringPage() {
    const [reports, setReports] = useState<AIReport[]>([]);
    const [selectedSchool, setSelectedSchool] = useState<AIReport | null>(null);
    const [loading, setLoading] = useState(false);

    // ─── Fetch AI Prediction ────────────────────────
    const fetchPrediction = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");

            const schoolId = user.user_id; // 🔥 IMPORTANT

            const res = await fetch(`${API_BASE_URL}/predict/from-db/${schoolId}`);

            if (!res.ok) throw new Error("API failed");

            const data = await res.json();

            setReports([
                {
                    school: "Your School",
                    infraScore: data.infraScore,
                    qualityCategory: data.qualityCategory,
                    aiStatus: data.aiStatus,
                    suggestion: data.suggestion,
                    severity: data.severity,
                },
            ]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    // ─── Call on load ───────────────────────────────
    useEffect(() => {
        fetchPrediction();
    }, []);

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">AI Prediction Monitoring</h1>
                    <p className="text-sm text-gray-500">
                        Real-time AI-based infrastructure analysis
                    </p>
                </div>

                <button
                    onClick={fetchPrediction}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                >
                    Refresh
                </button>
            </div>

            {/* LOADING */}
            {loading && (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            )}

            {/* TABLE */}
            {!loading && (
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                    <div className="p-6 border-b">
                        <h3 className="font-bold">AI Infrastructure Assessments</h3>
                    </div>

                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4">School</th>
                                <th className="px-6 py-4">Score</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Suggestion</th>
                            </tr>
                        </thead>

                        <tbody>
                            {reports.map((r, i) => (
                                <tr
                                    key={i}
                                    onClick={() => setSelectedSchool(r)}
                                    className="cursor-pointer hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4">{r.school}</td>
                                    <td className="px-6 py-4">{r.infraScore}</td>
                                    <td className="px-6 py-4">{r.qualityCategory}</td>
                                    <td className="px-6 py-4">{r.suggestion}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL */}
            {selectedSchool && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-2xl w-[400px]">
                        <div className="flex justify-between mb-4">
                            <h2 className="font-bold">{selectedSchool.school}</h2>
                            <button onClick={() => setSelectedSchool(null)}>
                                <X />
                            </button>
                        </div>

                        <p><b>Score:</b> {selectedSchool.infraScore}</p>
                        <p><b>Category:</b> {selectedSchool.qualityCategory}</p>
                        <p><b>Status:</b> {selectedSchool.aiStatus}</p>
                        <p><b>Suggestion:</b> {selectedSchool.suggestion}</p>
                        <p><b>Severity:</b> {selectedSchool.severity}</p>
                    </div>
                </div>
            )}
        </div>
    );
}