"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  FiCheckCircle, FiUpload, FiFileText, FiAlertCircle,
  FiX, FiDownload, FiEye, FiTrash2, FiLoader,
  FiChevronRight, FiChevronLeft, FiShield,
} from "react-icons/fi";
import { API_BASE_URL } from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ApplicationType = "New Recognition" | "Renewal" | "Upgradation";

interface ProfilePrefill {
  school_name: string;
  udise_number: string;
  school_type: string;
  school_category: string;
  lowest_class: string;
  highest_class: string;
  mobile: string;
  email: string;
  address: string;
  district: string;
}

interface UploadedDoc {
  id: string;
  document_type: string;
  label: string;
  file_name: string;
  content_type: string;
  download_url: string;
  uploaded_at: string | null;
}

interface RegistrationStatus {
  application_type: string | null;
  status: string;
  step1_complete: boolean;
  step2_complete: boolean;
  step3_complete: boolean;
  step4_complete: boolean;
  submitted: boolean;
  submitted_at: string | null;
  pdf_url: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: "profile",     label: "Profile Summary"   },
  { id: "details",     label: "Application Details" },
  { id: "documents",   label: "Document Upload"    },
  { id: "declaration", label: "Final Declaration"  },
];

const REQUIRED_DOCS: Record<ApplicationType, { type: string; label: string; hint: string }[]> = {
  "New Recognition": [
    {
      type:  "land_building_deed",
      label: "Land / Building Ownership or Lease Deed",
      hint:  "Registered sale deed, lease agreement (min 3 years) or govt allotment letter",
    },
    {
      type:  "trust_society_declaration",
      label: "Trust / Society Declaration",
      hint:  "Registration certificate of the Trust / Society / Company",
    },
  ],
  "Renewal": [
    {
      type:  "noc_renewal",
      label: "NOC for Renewal from Local Body (if required)",
      hint:  "Obtain NOC from Municipal Corporation / Gram Panchayat",
    },
  ],
  "Upgradation": [
    {
      type:  "management_resolution",
      label: "Resolution from School Management to Upgrade",
      hint:  "Formal resolution passed by the Managing Committee / Board of Trustees",
    },
  ],
};

const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_MB = 5;

// ─────────────────────────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────────────────────────

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw)?.access_token ?? null;
  } catch {
    return null;
  }
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StepBar({ current }: { current: number }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 mb-6">
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const isActive    = idx === current;
          const isCompleted = idx < current;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                      : isActive
                      ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30 scale-110"
                      : "bg-neutral-100 text-neutral-400"
                  }`}
                >
                  {isCompleted ? <FiCheckCircle size={16} /> : idx + 1}
                </div>
                <span
                  className={`text-xs font-semibold text-center hidden sm:block ${
                    isActive
                      ? "text-primary-700"
                      : isCompleted
                      ? "text-emerald-600"
                      : "text-neutral-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 transition-all duration-500 ${
                    idx < current ? "bg-emerald-400" : "bg-neutral-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function ErrorBanner({ errors }: { errors: string[] }) {
  if (!errors.length) return null;
  return (
    <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
      <FiAlertCircle className="text-red-500 mt-0.5 shrink-0" size={18} />
      <div>
        <p className="text-sm font-bold text-red-700 mb-1">Please fix the following:</p>
        <ul className="list-disc list-inside space-y-0.5">
          {errors.map((e, i) => (
            <li key={i} className="text-xs text-red-600">{e}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FieldLabel({
  label, required, hint,
}: { label: string; required?: boolean; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="block text-sm font-semibold text-neutral-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-neutral-400 mt-0.5">{hint}</p>}
    </div>
  );
}

function TextInput({
  name, value, onChange, placeholder = "", type = "text", disabled = false, error,
}: {
  name: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; disabled?: boolean; error?: string;
}) {
  return (
    <div>
      <input
        name={name} type={type} value={value} placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:border-transparent ${
          disabled
            ? "bg-neutral-100 text-neutral-600 cursor-not-allowed border-neutral-200"
            : error
            ? "border-red-400 bg-red-50 focus:ring-red-400"
            : "border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-primary-500"
        }`}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
          <FiAlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

function SelectInput({
  name, value, onChange, options, placeholder = "Select...", error,
}: {
  name: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder?: string; error?: string;
}) {
  return (
    <div>
      <select
        name={name} value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:border-transparent appearance-none ${
          error
            ? "border-red-400 bg-red-50 focus:ring-red-400"
            : "border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-primary-500"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
          <FiAlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-500 mb-1 uppercase tracking-wider">
        {label}
      </label>
      <div className="w-full bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 font-medium">
        {value || "—"}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function RegistrationPage() {
  const [step, setStep]            = useState(0);
  const [loading, setLoading]      = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errors, setErrors]        = useState<string[]>([]);
  const [apiError, setApiError]    = useState<string | null>(null);

  // Step 1
  const [appType, setAppType]      = useState<ApplicationType>("New Recognition");
  const [profile, setProfile]      = useState<ProfilePrefill | null>(null);

  // Step 2 — New Recognition
  const [lowestClass, setLowestClass]     = useState("");
  const [highestClass, setHighestClass]   = useState("");
  const [boardAffil, setBoardAffil]       = useState("");
  const [academicYear, setAcademicYear]   = useState("");

  // Step 2 — Renewal
  const [recNumber, setRecNumber]         = useState("");
  const [recValidity, setRecValidity]     = useState("");
  const [hasChanges, setHasChanges]       = useState("");

  // Step 2 — Upgradation
  const [upgradeTo, setUpgradeTo]         = useState("");
  const [upgradeReason, setUpgradeReason] = useState("");

  // Step 3
  const [uploadedDocs, setUploadedDocs]   = useState<UploadedDoc[]>([]);
  const [uploading, setUploading]         = useState<Record<string, boolean>>({});
  const [uploadErrors, setUploadErrors]   = useState<Record<string, string>>({});

  // Step 4
  const [signatoryName, setSignatoryName] = useState("");
  const [designation, setDesignation]     = useState("");
  const [declared, setDeclared]           = useState(false);

  // Submission result
  const [submitted, setSubmitted]         = useState(false);
  const [pdfUrl, setPdfUrl]               = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  // ── On mount: load status + prefill ─────────────────────────────────────
  useEffect(() => {
    (async () => {
      setPageLoading(true);
      try {
        // Prefill from profile
        const prefillRes = await fetch(`${API_BASE_URL}/registration/prefill`, {
          headers: { ...authHeaders() },
        });
        if (prefillRes.ok) {
          const data = await prefillRes.json();
          setProfile(data);
        }

        // Restore any existing registration state
        const statusRes = await fetch(`${API_BASE_URL}/registration/status`, {
          headers: { ...authHeaders() },
        });
        if (statusRes.ok) {
          const s: RegistrationStatus = await statusRes.json();
          if (s.application_type) {
            setAppType(s.application_type as ApplicationType);
          }
          if (s.submitted) {
            setSubmitted(true);
            setPdfUrl(s.pdf_url ?? null);
          }
          // Jump to correct step
          if (s.step4_complete) setStep(3);
          else if (s.step3_complete) setStep(3);
          else if (s.step2_complete) setStep(2);
          else if (s.step1_complete) setStep(1);
        }

        // Load uploaded docs
        await fetchDocuments();
      } catch {
        // Non-fatal: user can still proceed
      } finally {
        setPageLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/registration/documents`, {
        headers: { ...authHeaders() },
      });
      if (res.ok) {
        const data: UploadedDoc[] = await res.json();
        setUploadedDocs(data);
      }
    } catch {
      // silent
    }
  }, []);

  // ── Validation helpers ───────────────────────────────────────────────────

  function validateStep1(): string[] {
    const e: string[] = [];
    if (!appType) e.push("Select an application type.");
    return e;
  }

  function validateStep2(): string[] {
    const e: string[] = [];
    if (appType === "New Recognition") {
      if (!lowestClass)  e.push("Lowest class is required.");
      if (!highestClass) e.push("Highest class is required.");
      if (!boardAffil)   e.push("Board affiliation is required.");
      if (!academicYear) e.push("Academic year is required.");
    } else if (appType === "Renewal") {
      if (!recNumber)   e.push("Recognition number is required.");
      if (!recValidity) e.push("Recognition validity date is required.");
      if (!hasChanges)  e.push("Indicate whether any changes have been made.");
    } else {
      if (!upgradeTo)                        e.push("Select the level to upgrade to.");
      if (upgradeReason.trim().length < 10)  e.push("Provide a reason for upgradation (min 10 characters).");
    }
    return e;
  }

  function validateStep3(): string[] {
    const requiredTypes = new Set(REQUIRED_DOCS[appType].map((d) => d.type));
    const uploadedTypes = new Set(uploadedDocs.map((d) => d.document_type));
    const missing = [...requiredTypes].filter((t) => !uploadedTypes.has(t));
    if (missing.length) {
      return missing.map(
        (t) => `Missing: ${REQUIRED_DOCS[appType].find((d) => d.type === t)?.label ?? t}`
      );
    }
    return [];
  }

  function validateStep4(): string[] {
    const e: string[] = [];
    if (!signatoryName.trim()) e.push("Authorised signatory name is required.");
    if (!designation.trim())   e.push("Designation is required.");
    if (!declared)             e.push("You must accept the declaration.");
    return e;
  }

  // ── Step savers ───────────────────────────────────────────────────────────

  async function saveStep1(): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/registration/step1`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ application_type: appType }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Step 1 save failed" }));
      setApiError(err?.detail ?? "Step 1 save failed");
      return false;
    }
    return true;
  }

  async function saveStep2(): Promise<boolean> {
    let payload: Record<string, string> = {};
    if (appType === "New Recognition") {
      payload = {
        lowest_class:      lowestClass,
        highest_class:     highestClass,
        board_affiliation: boardAffil,
        academic_year:     academicYear,
      };
    } else if (appType === "Renewal") {
      payload = {
        recognition_number:   recNumber,
        recognition_validity: recValidity,
        has_changes:          hasChanges,
      };
    } else {
      payload = {
        upgrade_to:     upgradeTo,
        upgrade_reason: upgradeReason,
      };
    }

    const res = await fetch(`${API_BASE_URL}/registration/step2`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Step 2 save failed" }));
      setApiError(err?.detail ?? "Step 2 save failed");
      return false;
    }
    return true;
  }

  async function confirmStep3(): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/registration/step3/complete`, {
      method: "POST",
      headers: { ...authHeaders() },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Document validation failed" }));
      setApiError(err?.detail ?? "Document validation failed");
      return false;
    }
    return true;
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  const handleNext = async () => {
    setApiError(null);
    let errs: string[] = [];

    if (step === 0) errs = validateStep1();
    if (step === 1) errs = validateStep2();
    if (step === 2) errs = validateStep3();

    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    setLoading(true);

    try {
      let ok = true;
      if (step === 0) ok = await saveStep1();
      if (step === 1) ok = await saveStep2();
      if (step === 2) ok = await confirmStep3();
      if (ok) setStep((s) => Math.min(s + 1, STEPS.length - 1));
    } catch {
      setApiError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    setErrors([]);
    setApiError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  // ── Final submit ──────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setApiError(null);
    const errs = validateStep4();
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/registration/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          signatory_name: signatoryName,
          designation,
          declaration: declared,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Submission failed" }));
        setApiError(err?.detail ?? "Submission failed");
        return;
      }

      const data = await res.json();
      setSubmitted(true);
      setApplicationId(data.application_id);
      setPdfUrl(data.pdf_url ?? null);
    } catch {
      setApiError("An unexpected error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  // ── Document upload ───────────────────────────────────────────────────────

  const handleUpload = async (docType: string, file: File) => {
    // Client-side guards
    if (!ALLOWED_MIME.includes(file.type)) {
      setUploadErrors((p) => ({
        ...p,
        [docType]: "Only PDF, JPG, PNG or WEBP files are allowed.",
      }));
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setUploadErrors((p) => ({
        ...p,
        [docType]: `File exceeds ${MAX_MB} MB limit.`,
      }));
      return;
    }

    setUploadErrors((p) => ({ ...p, [docType]: "" }));
    setUploading((p) => ({ ...p, [docType]: true }));

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("document_type", docType);

      const res = await fetch(`${API_BASE_URL}/registration/upload-document`, {
        method: "POST",
        headers: { ...authHeaders() },
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Upload failed" }));
        setUploadErrors((p) => ({
          ...p,
          [docType]: err?.detail ?? "Upload failed",
        }));
        return;
      }

      await fetchDocuments();
    } catch {
      setUploadErrors((p) => ({
        ...p,
        [docType]: "Upload failed. Please check your connection.",
      }));
    } finally {
      setUploading((p) => ({ ...p, [docType]: false }));
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm("Delete this document?")) return;
    try {
      await fetch(`${API_BASE_URL}/registration/documents/${docId}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      await fetchDocuments();
    } catch {
      // silent
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  if (pageLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <FiLoader className="animate-spin text-primary-600" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  // ── Submitted state ───────────────────────────────────────────────────────
  if (submitted) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-10">
          <div className="bg-white rounded-3xl shadow-lg border border-neutral-100 p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <FiCheckCircle className="text-emerald-600" size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Application Submitted!</h2>
              {applicationId && (
                <p className="text-sm text-neutral-500 mt-2">
                  Application ID: <span className="font-mono font-bold text-primary-700">{applicationId}</span>
                </p>
              )}
              <p className="text-sm text-neutral-500 mt-1">
                You will receive updates via the Notifications section.
              </p>
            </div>

            {pdfUrl ? (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-3 bg-primary-600 text-white rounded-2xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20"
              >
                <FiDownload size={18} /> Download Application PDF
              </a>
            ) : (
              <button
                onClick={async () => {
                  const res = await fetch(`${API_BASE_URL}/registration/pdf`, {
                    headers: { ...authHeaders() },
                  });
                  if (res.ok) {
                    const data = await res.json();
                    if (data.pdf_url) window.open(data.pdf_url, "_blank");
                  }
                }}
                className="inline-flex items-center gap-3 px-8 py-3 bg-primary-600 text-white rounded-2xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20"
              >
                <FiDownload size={18} /> Download Application PDF
              </button>
            )}

            <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800 text-left">
              <p className="font-bold mb-1">📋 What happens next?</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Your application is under review by the Education Department.</li>
                <li>An inspection will be scheduled. You will receive a notification.</li>
                <li>On successful inspection, your Recognition Certificate will be issued.</li>
              </ol>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Normal multi-step form ────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-0">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Application Entry</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Your institutional profile is linked. Provide application intent below.
            </p>
          </div>
          <div className="w-full md:w-64">
            <label className="block text-xs font-semibold text-neutral-500 tracking-wider mb-1 uppercase">
              Applying for
            </label>
            <select
              value={appType}
              disabled={step > 0}
              onChange={(e) => {
                setAppType(e.target.value as ApplicationType);
                setStep(0);
                setErrors([]);
              }}
              className={`w-full text-sm font-semibold border-2 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                step > 0
                  ? "bg-neutral-100 text-neutral-600 border-neutral-200 cursor-not-allowed"
                  : "bg-primary-50 text-primary-700 border-primary-200"
              }`}
            >
              <option value="New Recognition">New Recognition</option>
              <option value="Renewal">Renewal of Recognition</option>
              <option value="Upgradation">Upgradation of School</option>
            </select>
            {step > 0 && (
              <p className="text-xs text-neutral-400 mt-1">
                Type locked. Go back to Step 1 to change.
              </p>
            )}
          </div>
        </div>

        {/* Step bar */}
        <StepBar current={step} />

        {/* Content card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8 min-h-[420px] flex flex-col">

          {/* API error */}
          {apiError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <FiAlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-700 font-medium">{apiError}</p>
              <button onClick={() => setApiError(null)} className="ml-auto text-red-400 hover:text-red-600">
                <FiX size={16} />
              </button>
            </div>
          )}

          {/* Step validation errors */}
          <ErrorBanner errors={errors} />

          {/* ── Step 1: Profile Summary ─────────────────────────────────────── */}
          <div className={`flex-1 ${step !== 0 ? "hidden" : ""}`}>
            <h2 className="text-lg font-bold text-neutral-800 mb-5">
              Step 1: Profile Summary &amp; Validation
            </h2>

            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex items-start gap-4 mb-6">
              <FiCheckCircle className="text-emerald-500 mt-0.5 shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-emerald-800">Profile Linked Successfully</p>
                <p className="text-xs text-emerald-600 mt-1">
                  Your comprehensive institutional profile (Infrastructure, Staff, Students,
                  Location) is already on file and will be attached to this application.
                </p>
              </div>
            </div>

            {profile ? (
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                <ReadOnlyField label="School Name"        value={profile.school_name}     />
                <ReadOnlyField label="UDISE Code"         value={profile.udise_number}    />
                <ReadOnlyField label="School Type"        value={profile.school_type}     />
                <ReadOnlyField label="School Category"    value={profile.school_category} />
                <ReadOnlyField label="Current Offerings"  value={`Class ${profile.lowest_class} to ${profile.highest_class}`} />
                <ReadOnlyField label="District"           value={profile.district}        />
              </div>
            ) : (
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <p className="text-sm font-semibold text-amber-800">
                  ⚠️ Profile not found. Please complete your Profile Completion first before applying.
                </p>
              </div>
            )}
          </div>

          {/* ── Step 2: Application Details ──────────────────────────────────── */}
          <div className={`flex-1 ${step !== 1 ? "hidden" : ""}`}>
            <h2 className="text-lg font-bold text-neutral-800 mb-5">
              Step 2: Application Details
            </h2>

            {appType === "New Recognition" && (
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel label="Lowest Class to Start" required />
                    <SelectInput
                      name="lowestClass"
                      value={lowestClass}
                      onChange={setLowestClass}
                      options={[
                        "Nursery","LKG","UKG","1","2","3","4","5","6","7","8","9","10","11","12"
                      ].map((v) => ({ value: v, label: v.startsWith("N") || v.startsWith("L") || v.startsWith("U") ? v : `Class ${v}` }))}
                      error={errors.find((e) => e.toLowerCase().includes("lowest"))}
                    />
                  </div>
                  <div>
                    <FieldLabel label="Highest Class to Operate" required />
                    <SelectInput
                      name="highestClass"
                      value={highestClass}
                      onChange={setHighestClass}
                      options={[
                        "1","2","3","4","5","6","7","8","9","10","11","12"
                      ].map((v) => ({ value: v, label: `Class ${v}` }))}
                      error={errors.find((e) => e.toLowerCase().includes("highest"))}
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel label="Board Affiliation Sought" required />
                  <SelectInput
                    name="boardAffil"
                    value={boardAffil}
                    onChange={setBoardAffil}
                    options={[
                      { value: "State Board", label: "State Board" },
                      { value: "CBSE",        label: "CBSE"        },
                      { value: "ICSE",        label: "ICSE"        },
                      { value: "IB",          label: "IB"          },
                      { value: "Other",       label: "Other"       },
                    ]}
                    error={errors.find((e) => e.toLowerCase().includes("board"))}
                  />
                </div>
                <div>
                  <FieldLabel label="Academic Year Starting From" required />
                  <SelectInput
                    name="academicYear"
                    value={academicYear}
                    onChange={setAcademicYear}
                    options={[
                      { value: "2024-25", label: "2024-25" },
                      { value: "2025-26", label: "2025-26" },
                      { value: "2026-27", label: "2026-27" },
                    ]}
                    error={errors.find((e) => e.toLowerCase().includes("academic"))}
                  />
                </div>
              </div>
            )}

            {appType === "Renewal" && (
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel label="Current Recognition Number" required />
                  <TextInput
                    name="recNumber"
                    value={recNumber}
                    onChange={setRecNumber}
                    placeholder="e.g. REC-2018-9928"
                    error={errors.find((e) => e.toLowerCase().includes("recognition number"))}
                  />
                </div>
                <div>
                  <FieldLabel label="Current Validity Upto" required />
                  <TextInput
                    name="recValidity"
                    value={recValidity}
                    onChange={setRecValidity}
                    type="date"
                    error={errors.find((e) => e.toLowerCase().includes("validity"))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel
                    label="Any changes to Management / Building since last recognition?"
                    required
                  />
                  <SelectInput
                    name="hasChanges"
                    value={hasChanges}
                    onChange={setHasChanges}
                    options={[
                      { value: "No changes (Same as previous)", label: "No changes (Same as previous)" },
                      { value: "Yes, changes have been made",   label: "Yes, changes have been made"   },
                    ]}
                    error={errors.find((e) => e.toLowerCase().includes("changes"))}
                  />
                </div>
              </div>
            )}

            {appType === "Upgradation" && (
              <div className="grid sm:grid-cols-2 gap-5">
                <ReadOnlyField
                  label="Currently Recognised For"
                  value={profile ? `Class ${profile.lowest_class} to ${profile.highest_class}` : "—"}
                />
                <div>
                  <FieldLabel label="Applying to Upgrade to" required />
                  <SelectInput
                    name="upgradeTo"
                    value={upgradeTo}
                    onChange={setUpgradeTo}
                    options={[
                      { value: "Class 9 to 10 (Secondary)",              label: "Class 9 to 10 (Secondary)"              },
                      { value: "Class 11 to 12 (Higher Secondary)",       label: "Class 11 to 12 (Higher Secondary)"       },
                      { value: "Class 1 to 10 (Primary to Secondary)",    label: "Class 1 to 10 (Primary to Secondary)"    },
                      { value: "Class 1 to 12 (Primary to Higher Sec.)",  label: "Class 1 to 12 (Primary to Higher Sec.)"  },
                    ]}
                    error={errors.find((e) => e.toLowerCase().includes("upgrade to"))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel label="Primary Reason for Upgradation" required hint="Minimum 10 characters" />
                  <textarea
                    value={upgradeReason}
                    onChange={(e) => setUpgradeReason(e.target.value)}
                    rows={3}
                    placeholder="e.g. Meeting growing local community demand for secondary education..."
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:border-transparent resize-none ${
                      errors.find((e) => e.toLowerCase().includes("reason"))
                        ? "border-red-400 bg-red-50 focus:ring-red-400"
                        : "border-neutral-200 bg-neutral-50 focus:bg-white focus:ring-primary-500"
                    }`}
                  />
                  {errors.find((e) => e.toLowerCase().includes("reason")) && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {errors.find((e) => e.toLowerCase().includes("reason"))}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Step 3: Document Upload ───────────────────────────────────────── */}
          <div className={`flex-1 ${step !== 2 ? "hidden" : ""}`}>
            <h2 className="text-lg font-bold text-neutral-800 mb-2">
              Step 3: Document Upload
            </h2>
            <p className="text-xs text-neutral-500 mb-5">
              Upload only the application-specific documents below. All profile documents
              are already attached automatically.
              <br />
              <span className="font-semibold">Accepted:</span> PDF, JPG, PNG, WEBP &nbsp;•&nbsp;
              <span className="font-semibold">Max size:</span> 5 MB per file
            </p>

            <div className="space-y-4">
              {REQUIRED_DOCS[appType].map((req) => {
                const uploaded = uploadedDocs.find((d) => d.document_type === req.type);
                const isUploading = uploading[req.type];
                const uploadErr = uploadErrors[req.type];

                return (
                  <div
                    key={req.type}
                    className={`rounded-2xl border p-5 transition-all ${
                      uploaded
                        ? "border-emerald-200 bg-emerald-50"
                        : uploadErr
                        ? "border-red-200 bg-red-50"
                        : "border-neutral-200 bg-neutral-50"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            uploaded ? "bg-emerald-100" : "bg-neutral-200"
                          }`}
                        >
                          {uploaded ? (
                            <FiCheckCircle className="text-emerald-600" size={16} />
                          ) : (
                            <FiFileText className="text-neutral-500" size={14} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-neutral-800">{req.label}</p>
                          <p className="text-xs text-neutral-500 mt-0.5">{req.hint}</p>
                          {uploaded && (
                            <p className="text-xs text-emerald-600 font-medium mt-1">
                              ✓ {uploaded.file_name}
                              {uploaded.uploaded_at && ` — ${uploaded.uploaded_at}`}
                            </p>
                          )}
                          {uploadErr && (
                            <p className="text-xs text-red-600 font-medium mt-1">
                              ✗ {uploadErr}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* View uploaded doc */}
                        {uploaded && (
                          <a
                            href={uploaded.download_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-50 transition-colors"
                          >
                            <FiEye size={12} /> View
                          </a>
                        )}

                        {/* Delete uploaded doc */}
                        {uploaded && (
                          <button
                            onClick={() => handleDeleteDoc(uploaded.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors"
                          >
                            <FiTrash2 size={12} /> Delete
                          </button>
                        )}

                        {/* Upload button */}
                        <label
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all ${
                            isUploading
                              ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                              : "bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
                          }`}
                        >
                          {isUploading ? (
                            <>
                              <FiLoader className="animate-spin" size={14} />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <FiUpload size={14} />
                              {uploaded ? "Replace" : "Upload"}
                            </>
                          )}
                          <input
                            type="file"
                            className="hidden"
                            disabled={isUploading}
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleUpload(req.type, f);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Validation summary for step 3 */}
            {errors.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                {errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-600 font-medium">{e}</p>
                ))}
              </div>
            )}
          </div>

          {/* ── Step 4: Final Declaration ─────────────────────────────────────── */}
          <div className={`flex-1 ${step !== 3 ? "hidden" : ""}`}>
            <h2 className="text-lg font-bold text-neutral-800 mb-5">
              Step 4: Final Declaration &amp; Submit
            </h2>

            <div className="bg-amber-50 border border-amber-100 p-5 rounded-xl mb-6">
              <h4 className="text-sm font-bold mb-2 flex items-center gap-2 text-amber-900">
                <FiShield size={16} /> Management Electronic Undertaking
              </h4>
              <p className="text-xs leading-relaxed text-justify text-amber-800">
                I/We hereby declare that all information attached from our Institutional Profile
                and provided in this application form is true and correct to the best of my/our
                knowledge and belief. I/We understand that any false information or suppression
                of facts may result in the rejection of this application and/or cancellation of
                recognition already granted. I/We agree to abide by all the rules, regulations
                and orders formulated by the Education Department, Government of Maharashtra,
                from time to time.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 mb-6">
              <div>
                <FieldLabel label="Authorised Signatory Name" required />
                <TextInput
                  name="signatoryName"
                  value={signatoryName}
                  onChange={setSignatoryName}
                  placeholder="Full Name of Authorised Person"
                  error={errors.find((e) => e.toLowerCase().includes("signatory"))}
                />
              </div>
              <div>
                <FieldLabel label="Designation" required />
                <TextInput
                  name="designation"
                  value={designation}
                  onChange={setDesignation}
                  placeholder="e.g. Secretary / Principal / Trustee"
                  error={errors.find((e) => e.toLowerCase().includes("designation"))}
                />
              </div>
            </div>

            <label
              className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer border transition-all ${
                declared
                  ? "bg-primary-50 border-primary-300"
                  : errors.find((e) => e.toLowerCase().includes("declaration"))
                  ? "bg-red-50 border-red-300"
                  : "bg-neutral-50 border-neutral-200 hover:bg-primary-50/50 hover:border-primary-200"
              }`}
            >
              <input
                type="checkbox"
                checked={declared}
                onChange={(e) => setDeclared(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
              />
              <span className="text-sm font-semibold text-neutral-800">
                I formally declare and accept the above undertaking on behalf of the
                School Management.
                <span className="text-red-500 ml-1">*</span>
              </span>
            </label>
            {errors.find((e) => e.toLowerCase().includes("declaration")) && (
              <p className="mt-1 text-xs text-red-600 font-medium ml-2">
                {errors.find((e) => e.toLowerCase().includes("declaration"))}
              </p>
            )}

            {/* Summary before submit */}
            <div className="mt-6 p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-600">
              <p className="font-bold text-neutral-800 mb-2">Application Summary</p>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
                <p><span className="font-semibold">Type:</span> {appType}</p>
                <p><span className="font-semibold">School:</span> {profile?.school_name ?? "—"}</p>
                <p><span className="font-semibold">UDISE:</span> {profile?.udise_number ?? "—"}</p>
                <p>
                  <span className="font-semibold">Documents:</span>{" "}
                  {uploadedDocs.length} / {REQUIRED_DOCS[appType].length} uploaded
                </p>
              </div>
            </div>
          </div>

          {/* ── Footer Navigation ─────────────────────────────────────────────── */}
          <div className="mt-8 pt-5 border-t border-neutral-100 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={step === 0 || loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-neutral-600 border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronLeft size={16} /> Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <><FiLoader className="animate-spin" size={15} /> Saving...</>
                ) : (
                  <>Continue <FiChevronRight size={16} /></>
                )}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-10 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <><FiLoader className="animate-spin" size={15} /> Submitting...</>
                ) : (
                  <><FiCheckCircle size={16} /> Submit Application</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}