"use client";

import React, { useEffect, useState } from "react";
import {
    X,
    Loader2,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

// ─── Types ─────────────────────────────────────────

type School = {
    school_id: string;
    school_name: string;
};

type AIReport = {
    school: string;
    infraScore: number;
    qualityCategory: string;
    aiStatus: string;
    suggestion: string;
    severity: string;
};

// ─── Component ─────────────────────────────────────

export default function AIMonitoringPage() {
    const [schools, setSchools] = useState<School[]>([]);
    const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
    const [selectedSchoolName, setSelectedSchoolName] = useState<string>("");

    const [reports, setReports] = useState<AIReport[]>([]);
    const [selectedSchool, setSelectedSchool] = useState<AIReport | null>(null);
    const [loading, setLoading] = useState(false);

    // ─── Fetch Schools List ─────────────────────────
    const fetchSchools = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/predict/schools`);
            const data = await res.json();
            setSchools(data.schools || []);
        } catch (err) {
            console.error("Error fetching schools:", err);
        }
    };

    // ─── Fetch Prediction ───────────────────────────
    const fetchPrediction = async (schoolId: string, schoolName: string) => {
        if (!schoolId) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/predict/from-db/${schoolId}`);

            if (!res.ok) throw new Error("API failed");

            const data = await res.json();

            setReports([
                {
                    school: schoolName,
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

    const fetchAllPredictions = async () => {
    setLoading(true);
    try {
        const res = await fetch(`${API_BASE_URL}/predict/all`);
        const data = await res.json();

        setReports(data.reports || []);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
};

   const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const schoolId = e.target.value;
    const schoolName = e.target.options[e.target.selectedIndex].text;

    setSelectedSchoolId(schoolId);
    setSelectedSchoolName(schoolName);

    if (!schoolId) {
        fetchAllPredictions(); // 🔥 reset to all
    } else {
        fetchPrediction(schoolId, schoolName);
    }
};
    // ─── Load Schools on Mount ──────────────────────
    useEffect(() => {
    fetchSchools();
    fetchAllPredictions(); // 🔥 load all on page load
}, []);

    return (
        <div className="space-y-8">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">AI Prediction Monitoring</h1>
                    <p className="text-sm text-gray-500">
                        Select a school to analyze infrastructure
                    </p>
                </div>

                {/* 🔥 DROPDOWN */}
                <select
                    value={selectedSchoolId}
                    onChange={handleSchoolChange}
                    className="px-4 py-2 border rounded-lg text-sm"
                >
                    <option value="">All Schools</option>
                    <option value="">Select School</option>
                    {schools.map((s) => (
                        <option key={s.school_id} value={s.school_id}>
                            {s.school_name}
                        </option>
                    ))}
                </select>
            </div>

            {/* LOADING */}
            {loading && (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            )}

            {/* TABLE */}
            {!loading && reports.length > 0 && (
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                    <div className="p-6 border-b">
                        <h3 className="font-bold">AI Infrastructure Assessment</h3>
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