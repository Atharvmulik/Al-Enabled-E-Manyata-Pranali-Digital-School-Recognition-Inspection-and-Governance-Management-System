"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "../components/DashboardLayout";
import {
    FiSave,
    FiSend,
    FiUpload,
    FiEdit2,
    FiLock,
    FiPlusCircle,
    FiRefreshCw,
    FiArrowUpCircle,
    FiAlertTriangle,
    FiCheckCircle,
    FiMapPin,
    FiUsers,
    FiHome,
    FiPhone,
} from "react-icons/fi";

// Type for profile data loaded from localStorage
type ProfileData = {
    // Identity
    schoolName: string;
    estYear: string;
    boardAffiliation: string;
    schoolCategory: string;
    schoolType: string;
    classification: string;
    applicationType: string;
    // Contact
    stdCode: string;
    landline: string;
    mobile: string;
    email: string;
    website: string;
    // Management
    managementGroup: string;
    managementCode: string;
    subManagement: string;
    isPmShri: string;
    // Class Range
    lowestClass: string;
    highestClass: string;
    hasPrePrimary: string;
    // Location
    locationType: string;
    address: string;
    pinCode: string;
    district: string;
    taluka: string;
    revenueBlock: string;
    villageName: string;
    gramPanchayat: string;
    urbanLocalBody: string;
    wardName: string;
    crcName: string;
    assemblyConstituency: string;
    parliamentaryConstituency: string;
    // Infrastructure summary
    landArea: string;
    landAreaUnit: string;
    hasPlayground: string;
    buildingStatus: string;
    totalClassrooms: string;
    hasElectricity: string;
    hasLibrary: string;
    hasRamp: string;
    // Staff summary
    totalTeachingStaff: string;
    totalNonTeachingStaff: string;
    totalVocationalStaff: string;
    // Student summary
    totalStudents: string;
    // Completeness
    isProfileComplete: boolean;
};

export default function RegistrationPage() {
    const [appType, setAppType] = useState<"new" | "renewal" | "upgradation" | null>(null);
    const [agreed, setAgreed] = useState(false);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load profile data from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem("profileData");
            if (saved) {
                setProfileData(JSON.parse(saved));
            }
        } catch {
            // Ignore parse errors
        }
        setIsLoading(false);
    }, []);

    // Helper to display a value or a dash
    const displayValue = (val: string | undefined) => val || "—";

    // Build address string
    const fullAddress = profileData
        ? [
            profileData.address,
            profileData.district,
            profileData.taluka,
            profileData.pinCode ? `PIN: ${profileData.pinCode}` : "",
        ]
            .filter(Boolean)
            .join(", ") || "—"
        : "—";

    // Build class range string
    const classRange = profileData?.lowestClass && profileData?.highestClass
        ? `Class ${profileData.lowestClass} to Class ${profileData.highestClass}${profileData.hasPrePrimary === "1-Yes" ? " (+ Pre-Primary)" : ""}`
        : "—";

    const hasProfileData = profileData && profileData.schoolName;

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-neutral-900">Application Registration</h1>
                <p className="text-neutral-500 mt-1">Select the type of application you wish to submit</p>
            </div>

            {/* Application Type Selection */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
                {[
                    { id: "new", label: "New Registration", icon: FiPlusCircle, description: "For schools applying for the first time" },
                    { id: "renewal", label: "Renewal", icon: FiRefreshCw, description: "Renew existing school recognition" },
                    { id: "upgradation", label: "Upgradation", icon: FiArrowUpCircle, description: "Apply for higher grade levels" },
                ].map((type) => (
                    <button
                        key={type.id}
                        onClick={() => setAppType(type.id as any)}
                        className={`
              p-5 text-left rounded-2xl border transition-all duration-200
              ${appType === type.id
                                ? "border-primary-500 bg-primary-50 ring-2 ring-primary-200"
                                : "border-neutral-200 bg-white hover:border-primary-300 hover:shadow-md"
                            }
            `}
                    >
                        <type.icon
                            size={24}
                            className={appType === type.id ? "text-primary-600" : "text-neutral-400"}
                        />
                        <h3 className={`mt-3 font-bold ${appType === type.id ? "text-primary-900" : "text-neutral-800"}`}>
                            {type.label}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-1">{type.description}</p>
                    </button>
                ))}
            </div>

            {!appType ? (
                <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-12 text-center text-neutral-500">
                    Please select an application type to proceed with the form.
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Section: Auto-filled Profile Data */}
                    <Card title="Institutional Information (From Profile)">
                        {isLoading ? (
                            <div className="text-center py-8 text-neutral-400">Loading profile data...</div>
                        ) : !hasProfileData ? (
                            /* Profile Incomplete Warning */
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                                <FiAlertTriangle className="mx-auto text-amber-500 mb-3" size={32} />
                                <h3 className="text-lg font-bold text-amber-800 mb-2">Profile Incomplete</h3>
                                <p className="text-sm text-amber-700 mb-4">
                                    Please complete your school profile before submitting a registration application.
                                    Your profile data will be automatically populated here once saved.
                                </p>
                                <Link
                                    href="/profile"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 text-white hover:bg-amber-700 shadow-md transition-colors"
                                >
                                    <FiEdit2 size={14} /> Go to Profile
                                </Link>
                            </div>
                        ) : (
                            /* Profile Data Display */
                            <>
                                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 mb-4 relative">
                                    {/* Header with lock and edit */}
                                    <div className="absolute top-4 right-4 flex items-center gap-2">
                                        <span className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
                                            <FiLock size={10} /> Auto-filled
                                        </span>
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-white px-2 py-1 rounded-md border border-neutral-200 shadow-sm"
                                        >
                                            <FiEdit2 size={12} /> Edit Profile
                                        </Link>
                                    </div>

                                    {/* Profile completeness indicator */}
                                    <div className="mb-5 flex items-center gap-2">
                                        {profileData.isProfileComplete ? (
                                            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                                                <FiCheckCircle size={12} /> Profile Complete
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                                                <FiAlertTriangle size={12} /> Some fields are incomplete
                                            </span>
                                        )}
                                    </div>

                                    {/* School Identity */}
                                    <div className="mb-5">
                                        <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-bold mb-3 flex items-center gap-1.5">
                                            <FiHome size={12} /> School Identity
                                        </h4>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-8">
                                            <ProfileField label="School Name" value={displayValue(profileData.schoolName)} highlight />
                                            <ProfileField label="Year of Establishment" value={displayValue(profileData.estYear)} />
                                            <ProfileField label="Board Affiliation" value={displayValue(profileData.boardAffiliation)} />
                                            <ProfileField label="School Category" value={displayValue(profileData.schoolCategory)} />
                                            <ProfileField label="Class Range" value={classRange} />
                                            <ProfileField label="Management" value={displayValue(profileData.managementGroup)} />
                                        </div>
                                    </div>

                                    <div className="border-t border-neutral-200 my-4" />

                                    {/* Contact Details */}
                                    <div className="mb-5">
                                        <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-bold mb-3 flex items-center gap-1.5">
                                            <FiPhone size={12} /> Contact Details
                                        </h4>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-8">
                                            <ProfileField label="Mobile" value={displayValue(profileData.mobile)} />
                                            <ProfileField label="Email" value={displayValue(profileData.email)} />
                                            <ProfileField label="Landline" value={profileData.stdCode && profileData.landline ? `${profileData.stdCode}-${profileData.landline}` : displayValue(profileData.landline)} />
                                            {profileData.website && <ProfileField label="Website" value={profileData.website} />}
                                        </div>
                                    </div>

                                    <div className="border-t border-neutral-200 my-4" />

                                    {/* Location */}
                                    <div className="mb-5">
                                        <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-bold mb-3 flex items-center gap-1.5">
                                            <FiMapPin size={12} /> Location
                                        </h4>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-8">
                                            <div className="md:col-span-2 lg:col-span-3">
                                                <ProfileField label="Address" value={fullAddress} />
                                            </div>
                                            <ProfileField label="Location Type" value={displayValue(profileData.locationType)} />
                                            <ProfileField label="District" value={displayValue(profileData.district)} />
                                            <ProfileField label="Taluka" value={displayValue(profileData.taluka)} />
                                        </div>
                                    </div>

                                    <div className="border-t border-neutral-200 my-4" />

                                    {/* Infrastructure & Capacity Summary */}
                                    <div>
                                        <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-bold mb-3 flex items-center gap-1.5">
                                            <FiUsers size={12} /> Infrastructure & Capacity Summary
                                        </h4>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-y-3 gap-x-8">
                                            <ProfileField label="Total Classrooms" value={displayValue(profileData.totalClassrooms)} />
                                            <ProfileField label="Land Area" value={profileData.landArea ? `${profileData.landArea} ${profileData.landAreaUnit || ''}` : "—"} />
                                            <ProfileField label="Playground" value={displayValue(profileData.hasPlayground)} />
                                            <ProfileField label="Building Status" value={displayValue(profileData.buildingStatus)} />
                                            <ProfileField label="Teaching Staff" value={displayValue(profileData.totalTeachingStaff)} />
                                            <ProfileField label="Non-Teaching Staff" value={displayValue(profileData.totalNonTeachingStaff)} />
                                            <ProfileField label="Total Students" value={displayValue(profileData.totalStudents)} />
                                            <ProfileField label="Electricity" value={displayValue(profileData.hasElectricity)} />
                                        </div>
                                    </div>

                                    {/* Renewal-specific fields */}
                                    {appType === "renewal" && (
                                        <>
                                            <div className="border-t border-neutral-200 my-4" />
                                            <div>
                                                <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-bold mb-3">
                                                    Renewal Context
                                                </h4>
                                                <div className="grid md:grid-cols-2 gap-y-3 gap-x-8">
                                                    <ProfileField label="Application Type" value={displayValue(profileData.applicationType)} />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Upgradation-specific fields */}
                                    {appType === "upgradation" && (
                                        <>
                                            <div className="border-t border-neutral-200 my-4" />
                                            <div>
                                                <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-bold mb-3">
                                                    Upgradation Context
                                                </h4>
                                                <div className="grid md:grid-cols-2 gap-y-3 gap-x-8">
                                                    <ProfileField label="Current Class Range" value={classRange} />
                                                    <ProfileField label="Library Available" value={displayValue(profileData.hasLibrary)} />
                                                    <ProfileField label="Accessibility (Ramp)" value={displayValue(profileData.hasRamp)} />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <p className="text-xs text-neutral-400 italic">
                                    * The above information is pulled automatically from your school profile. To make changes, use the &quot;Edit Profile&quot; button.
                                </p>
                            </>
                        )}
                    </Card>

                    {/* Dynamic Form Sections based on appType */}
                    {appType === "new" && (
                        <>
                            <Card title="New Registration Specific Details">
                                <div className="grid md:grid-cols-2 gap-5">
                                    <InputField label="Proposed Classes" placeholder="e.g. 1st to 10th" />
                                    <InputField label="Opening Year" placeholder="e.g. 2026" />
                                    <InputField label="Expected Student Capacity" type="number" placeholder="e.g. 500" />
                                    <InputField label="Total Land Area (sq ft)" placeholder="e.g. 25000" />
                                    <SelectField label="Building Type" options={["Own Building", "Leased", "Rented"]} />
                                    <InputField label="Number of Classrooms" type="number" placeholder="e.g. 15" />
                                    <SelectField label="Playground Available" options={["Yes", "No"]} />
                                </div>
                            </Card>
                            <Card title="Required Uploads">
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    <UploadField label="Land Document" />
                                    <UploadField label="Building Plan" />
                                    <UploadField label="Fire Safety Certificate" />
                                    <UploadField label="Sanitation Certificate" />
                                    <UploadField label="NOC" />
                                    <UploadField label="School Photos" />
                                </div>
                            </Card>
                        </>
                    )}

                    {appType === "renewal" && (
                        <>
                            <Card title="Renewal Details">
                                <div className="grid md:grid-cols-1 gap-5">
                                    <TextAreaField label="Significant Changes Since Last Approval" placeholder="Mention infrastructure, management, or staff changes..." />
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <InputField label="Current Student Count" type="number" placeholder="e.g. 480" />
                                        <InputField label="Current Staff Count" type="number" placeholder="e.g. 32" />
                                    </div>
                                    <TextAreaField label="Reason for Renewal" placeholder="Describe the reason for applying for renewal..." />
                                </div>
                            </Card>
                            <Card title="Updated Uploads">
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    <UploadField label="Previous Certificate" />
                                    <UploadField label="Updated Safety Certs" />
                                    <UploadField label="Updated Photos" />
                                </div>
                            </Card>
                        </>
                    )}

                    {appType === "upgradation" && (
                        <>
                            <Card title="Upgradation Details">
                                <div className="grid md:grid-cols-2 gap-5">
                                    <InputField label="Requested Level" placeholder="e.g. Higher Secondary (11th & 12th)" />
                                    <InputField label="Additional Rooms Built" type="number" placeholder="e.g. 4" />
                                    <InputField label="Additional Staff Recruited" type="number" placeholder="e.g. 5" />
                                    <SelectField label="Physics/Chemistry Lab" options={["Available", "Under Construction", "Planned"]} />
                                    <SelectField label="Library Capacity Increased" options={["Yes", "No"]} />
                                </div>
                            </Card>
                            <Card title="Upgradation Proofs">
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    <UploadField label="Lab Photos" />
                                    <UploadField label="New Staff Certificates" />
                                    <UploadField label="New Room Photos" />
                                    <UploadField label="Equipment List (PDF)" />
                                </div>
                            </Card>
                        </>
                    )}

                    {/* Declaration & Submission */}
                    <Card title="Final Declaration">
                        <label className="flex items-start gap-3 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500 mt-0.5"
                            />
                            <span className="text-sm text-neutral-700 leading-relaxed">
                                I hereby confirm that all the details provided for this <strong>{appType === "new" ? "New Registration" : appType === "renewal" ? "Renewal" : "Upgradation"}</strong> application are true and correct. I understand that the system has auto-filled my profile data and any discrepancies should be updated in the profile section before final submission.
                            </span>
                        </label>

                        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-neutral-100">
                            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors">
                                <FiSave size={16} /> Save Draft
                            </button>
                            <button
                                disabled={!agreed}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-600/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FiSend size={16} /> Submit {appType === "new" ? "Registration" : appType === "renewal" ? "Renewal" : "Upgradation"}
                            </button>
                        </div>
                    </Card>
                </div>
            )}
        </DashboardLayout>
    );
}

/* ---------- Reusable Sub-components ---------- */

function ProfileField({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div>
            <label className="block text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-1">{label}</label>
            <p className={`text-sm ${highlight ? "font-bold text-neutral-900" : "font-semibold text-neutral-800"}`}>{value}</p>
        </div>
    );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 lg:p-8">
            <h2 className="text-lg font-bold text-neutral-800 mb-5">{title}</h2>
            {children}
        </div>
    );
}

function InputField({ label, type = "text", placeholder = "" }: { label: string; type?: string; placeholder?: string }) {
    return (
        <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-neutral-50 focus:bg-white"
            />
        </div>
    );
}

function TextAreaField({ label, placeholder = "" }: { label: string; placeholder?: string }) {
    return (
        <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
            <textarea
                placeholder={placeholder}
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-neutral-50 focus:bg-white"
            />
        </div>
    );
}

function SelectField({ label, options }: { label: string; options: string[] }) {
    return (
        <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-neutral-50 focus:bg-white appearance-none">
                <option value="">Select {label}</option>
                {options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                ))}
            </select>
        </div>
    );
}

function UploadField({ label }: { label: string }) {
    return (
        <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
            <div className="flex items-center justify-center w-full h-24 border-2 border-dashed border-neutral-200 rounded-xl hover:border-primary-400 transition-colors cursor-pointer bg-neutral-50 hover:bg-primary-50/50">
                <div className="text-center">
                    <FiUpload className="mx-auto text-neutral-400 mb-1" size={20} />
                    <p className="text-[10px] text-neutral-500 px-2">{label}</p>
                    <p className="text-[8px] text-neutral-400 mt-1">PDF/JPG (Max 5MB)</p>
                </div>
            </div>
        </div>
    );
}
