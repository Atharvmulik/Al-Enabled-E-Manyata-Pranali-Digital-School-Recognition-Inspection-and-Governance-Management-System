"use client";

import { useEffect, useState, useCallback } from "react";
import { API_BASE_URL } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type ApplicationType = "New Registration" | "Renewal" | "Upgradation";

interface RegistrationStepStatus {
  step: string;
  label: string;
  completed: boolean;
}

interface RegistrationStatusResponse {
  school_id: string;
  application_type: ApplicationType;
  status: string;
  steps: RegistrationStepStatus[];
  completion_pct: number;
  submitted_at?: string;
  last_updated?: string;
}

// Step data types
interface BasicDetails {
  school_name?: string;
  udise_code?: string;
  establishment_year?: string;
  school_type?: string;
  medium_of_instruction?: string;
  classes_from?: string;
  classes_to?: string;
  phone?: string;
  email?: string;
  website?: string;
  [key: string]: unknown;
}

interface ReceiptsExpenditure {
  exp_maintenance?: number;
  exp_teachers?: number;
  exp_construction?: number;
  exp_others?: number;
  grants?: unknown[];
  assistance?: unknown[];
}

interface LegalDetails {
  recognition_number?: string;
  recognition_date?: string;
  affiliation_number?: string;
  vocational_rows?: unknown[];
}

interface LocationData {
  address?: string;
  village?: string;
  block?: string;
  district?: string;
  state?: string;
  pincode?: string;
  [key: string]: unknown;
}

interface InfrastructureData {
  total_classrooms?: number;
  [key: string]: unknown;
}

interface StaffData {
  staff_summary?: Record<string, unknown>;
  teachers?: unknown[];
  non_teaching_staff?: unknown[];
  vocational_staff?: unknown[];
}

interface SafetyData {
  [key: string]: unknown;
}

interface StudentCapacityData {
  section_configs?: unknown[];
}

interface VocationalEducationData {
  vocational_education?: Record<string, unknown>;
  vocational_labs?: unknown[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err?.detail ?? `Error ${res.status}`);
  }
  return res.json();
}

async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err?.detail ?? `Error ${res.status}`);
  }
  return res.json();
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err?.detail ?? `Error ${res.status}`);
  }
  return res.json();
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err?.detail ?? `Error ${res.status}`);
  }
  return res.json();
}

// ─── Registration API calls ───────────────────────────────────────────────────

const fetchRegistrationStatus = () =>
  apiGet<RegistrationStatusResponse>("/registration/status");

const patchApplicationType = (application_type: ApplicationType) =>
  apiPatch<{ message: string }>("/registration/application-type", { application_type });

const fetchBasicDetails = () =>
  apiGet<BasicDetails>("/registration/basic-details");

const saveBasicDetails = (payload: BasicDetails) =>
  apiPut<{ message: string }>("/registration/basic-details", payload);

const fetchReceiptsExpenditure = () =>
  apiGet<ReceiptsExpenditure>("/registration/receipts-expenditure");

const saveReceiptsExpenditure = (payload: ReceiptsExpenditure) =>
  apiPut<{ message: string }>("/registration/receipts-expenditure", payload);

const fetchLegalDetails = () =>
  apiGet<LegalDetails>("/registration/legal-details");

const saveLegalDetails = (payload: LegalDetails) =>
  apiPut<{ message: string }>("/registration/legal-details", payload);

const fetchLocation = () =>
  apiGet<LocationData>("/registration/location");

const saveLocation = (payload: LocationData) =>
  apiPut<{ message: string }>("/registration/location", payload);

const fetchInfrastructure = () =>
  apiGet<InfrastructureData>("/registration/infrastructure");

const saveInfrastructure = (payload: InfrastructureData) =>
  apiPut<{ message: string }>("/registration/infrastructure", payload);

const fetchStaff = () =>
  apiGet<StaffData>("/registration/staff");

const saveStaffSummary = (payload: StaffData["staff_summary"]) =>
  apiPut<{ message: string }>("/registration/staff/summary", payload);

const addTeacher = (payload: unknown) =>
  apiPost<{ message: string; id?: string }>("/registration/staff/teachers", payload);

const updateTeacher = (teacher_id: string, payload: unknown) =>
  apiPut<{ message: string }>(`/registration/staff/teachers/${teacher_id}`, payload);

const deleteTeacher = (teacher_id: string) =>
  fetch(`${API_BASE_URL}/registration/staff/teachers/${teacher_id}`, { method: "DELETE" });

const addNonTeachingStaff = (payload: unknown) =>
  apiPost<{ message: string; id?: string }>("/registration/staff/non-teaching", payload);

const updateNonTeachingStaff = (staff_id: string, payload: unknown) =>
  apiPut<{ message: string }>(`/registration/staff/non-teaching/${staff_id}`, payload);

const deleteNonTeachingStaff = (staff_id: string) =>
  fetch(`${API_BASE_URL}/registration/staff/non-teaching/${staff_id}`, { method: "DELETE" });

const addVocationalStaff = (payload: unknown) =>
  apiPost<{ message: string; id?: string }>("/registration/staff/vocational", payload);

const updateVocationalStaff = (staff_id: string, payload: unknown) =>
  apiPut<{ message: string }>(`/registration/staff/vocational/${staff_id}`, payload);

const deleteVocationalStaff = (staff_id: string) =>
  fetch(`${API_BASE_URL}/registration/staff/vocational/${staff_id}`, { method: "DELETE" });

const fetchSafety = () =>
  apiGet<SafetyData>("/registration/safety");

const saveSafety = (payload: SafetyData) =>
  apiPut<{ message: string }>("/registration/safety", payload);

const fetchStudentCapacity = () =>
  apiGet<StudentCapacityData>("/registration/student-capacity");

const saveSectionConfigs = (configs: unknown[]) =>
  apiPut<{ message: string }>("/registration/student-capacity/sections", configs);

const fetchStudents = () =>
  apiGet<unknown[]>("/registration/students");

const addStudent = (payload: unknown) =>
  apiPost<{ message: string; id?: string }>("/registration/students", payload);

const updateStudent = (student_id: string, payload: unknown) =>
  apiPut<{ message: string }>(`/registration/students/${student_id}`, payload);

const deleteStudent = (student_id: string) =>
  fetch(`${API_BASE_URL}/registration/students/${student_id}`, { method: "DELETE" });

const fetchVocationalEducation = () =>
  apiGet<VocationalEducationData>("/registration/vocational-education");

const saveVocationalEducation = (payload: VocationalEducationData) =>
  apiPut<{ message: string }>("/registration/vocational-education", payload);

const saveDraft = (step: string) =>
  apiPost<{ message: string }>("/registration/save", { step });

const submitRegistration = (payload: Record<string, unknown>) =>
  apiPost<{ message: string }>("/registration/submit", payload);

const uploadDocument = async (document_type: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(
    `${API_BASE_URL}/registration/upload-document?document_type=${encodeURIComponent(document_type)}`,
    { method: "POST", body: formData }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err?.detail ?? `Error ${res.status}`);
  }
  return res.json();
};

// ─── Step key → fetch fn map ──────────────────────────────────────────────────

const STEP_FETCH_MAP: Record<string, () => Promise<unknown>> = {
  basic_details:        fetchBasicDetails,
  receipts_expenditure: fetchReceiptsExpenditure,
  legal_details:        fetchLegalDetails,
  location:             fetchLocation,
  infrastructure:       fetchInfrastructure,
  staff:                fetchStaff,
  safety:               fetchSafety,
  student_capacity:     () => Promise.all([fetchStudentCapacity(), fetchStudents()]),
  vocational_education: fetchVocationalEducation,
};

const STEP_SAVE_MAP: Record<string, (data: unknown) => Promise<{ message: string }>> = {
  basic_details:        (d) => saveBasicDetails(d as BasicDetails),
  receipts_expenditure: (d) => saveReceiptsExpenditure(d as ReceiptsExpenditure),
  legal_details:        (d) => saveLegalDetails(d as LegalDetails),
  location:             (d) => saveLocation(d as LocationData),
  infrastructure:       (d) => saveInfrastructure(d as InfrastructureData),
  staff:                (d) => saveStaffSummary((d as StaffData).staff_summary),
  safety:               (d) => saveSafety(d as SafetyData),
  student_capacity:     (d) => saveSectionConfigs((d as StudentCapacityData).section_configs ?? []),
  vocational_education: (d) => saveVocationalEducation(d as VocationalEducationData),
};

// ─── Step labels ──────────────────────────────────────────────────────────────

const STEPS = [
  { key: "basic_details",        label: "Basic Details",             step: 1 },
  { key: "receipts_expenditure", label: "Receipts & Expenditure",    step: 2 },
  { key: "legal_details",        label: "Legal Details",             step: 3 },
  { key: "location",             label: "Location",                  step: 4 },
  { key: "infrastructure",       label: "Infrastructure",            step: 5 },
  { key: "staff",                label: "Staff",                     step: 6 },
  { key: "safety",               label: "Safety",                    step: 7 },
  { key: "student_capacity",     label: "Student Capacity",          step: 8 },
  { key: "vocational_education", label: "Vocational Education",      step: 9 },
];

// ─── Small helpers ────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-neutral-200 rounded-lg ${className ?? ""}`} />;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Draft:     "bg-neutral-100 text-neutral-600",
    Submitted: "bg-blue-50 text-blue-700",
    Approved:  "bg-emerald-50 text-emerald-700",
    Rejected:  "bg-red-50 text-red-700",
  };
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${map[status] ?? map.Draft}`}>
      {status}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegistrationPage() {
  // ── Status & app type ──
  const [status, setStatus]       = useState<RegistrationStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [statusError, setStatusError]     = useState<string | null>(null);

  // ── Active step ──
  const [activeStep, setActiveStep]   = useState<string>("basic_details");
  const [stepData, setStepData]       = useState<unknown>(null);
  const [loadingStep, setLoadingStep] = useState(false);
  const [stepError, setStepError]     = useState<string | null>(null);

  // ── Save / submit ──
  const [saving, setSaving]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveMsg, setSaveMsg]     = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── App-type change ──
  const [appTypeSaving, setAppTypeSaving] = useState(false);

  // ─── Load overall status ──────────────────────────────────────────────────

  const loadStatus = useCallback(() => {
    setLoadingStatus(true);
    setStatusError(null);
    fetchRegistrationStatus()
      .then(setStatus)
      .catch((err: Error) => setStatusError(err.message))
      .finally(() => setLoadingStatus(false));
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  // ─── Load step data whenever active step changes ──────────────────────────

  useEffect(() => {
    const fn = STEP_FETCH_MAP[activeStep];
    if (!fn) return;
    setLoadingStep(true);
    setStepError(null);
    setStepData(null);
    fn()
      .then(setStepData)
      .catch((err: Error) => setStepError(err.message))
      .finally(() => setLoadingStep(false));
  }, [activeStep]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleApplicationTypeChange = async (type: ApplicationType) => {
    setAppTypeSaving(true);
    try {
      await patchApplicationType(type);
      setStatus((prev) => prev ? { ...prev, application_type: type } : prev);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setAppTypeSaving(false);
    }
  };

  const handleSave = async () => {
    if (!stepData) return;
    setSaving(true);
    setSaveMsg(null);
    setSaveError(null);
    try {
      const saveFn = STEP_SAVE_MAP[activeStep];
      if (saveFn) await saveFn(stepData);
      const result = await saveDraft(activeStep);
      setSaveMsg(result.message);
      loadStatus(); // refresh step completion
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!confirm("Are you sure you want to submit the registration? This cannot be undone.")) return;
    setSubmitting(true);
    setSaveMsg(null);
    setSaveError(null);
    try {
      const result = await submitRegistration({
        application_type: status?.application_type ?? "New Registration",
      });
      setSaveMsg(result.message);
      loadStatus();
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (document_type: string, file: File) => {
    try {
      const result = await uploadDocument(document_type, file);
      alert(result.message ?? "File uploaded successfully");
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // ─── Derived ──────────────────────────────────────────────────────────────

  const stepStatusMap = Object.fromEntries(
    (status?.steps ?? []).map((s) => [s.step, s.completed])
  );
  const completionPct = status?.completion_pct ?? 0;
  const allDone       = completionPct === 100;
  const isSubmitted   = status?.status === "Submitted";

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">School Registration</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Complete all 9 steps to submit your registration.
          </p>
        </div>

        {/* ── Status Error ── */}
        {statusError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
            Failed to load registration status: {statusError}
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">

          {/* ── Sidebar ── */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-5 sticky top-6">

              {/* Application type */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  Application Type
                </p>
                {loadingStatus ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <select
                    value={status?.application_type ?? "New Registration"}
                    disabled={appTypeSaving || isSubmitted}
                    onChange={(e) => handleApplicationTypeChange(e.target.value as ApplicationType)}
                    className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    <option>New Registration</option>
                    <option>Renewal</option>
                    <option>Upgradation</option>
                  </select>
                )}
              </div>

              {/* Overall status */}
              <div className="mb-5 flex items-center justify-between">
                {loadingStatus ? (
                  <Skeleton className="h-6 w-24" />
                ) : (
                  <StatusBadge status={status?.status ?? "Draft"} />
                )}
                {!loadingStatus && (
                  <span className="text-xs text-neutral-400">{completionPct}% done</span>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-neutral-100 rounded-full h-1.5 mb-5">
                <div
                  className="bg-primary-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${completionPct}%` }}
                />
              </div>

              {/* Step list */}
              <nav className="space-y-1">
                {STEPS.map(({ key, label, step }) => {
                  const done    = stepStatusMap[key] ?? false;
                  const active  = activeStep === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveStep(key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-colors
                        ${active
                          ? "bg-primary-50 text-primary-700 font-semibold"
                          : "text-neutral-600 hover:bg-neutral-50"
                        }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                          ${done
                            ? "bg-emerald-100 text-emerald-600"
                            : active
                            ? "bg-primary-600 text-white"
                            : "bg-neutral-100 text-neutral-400"
                          }`}
                      >
                        {done ? "✓" : step}
                      </span>
                      <span className="truncate">{label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Submit button */}
              <div className="mt-6 pt-5 border-t border-neutral-100">
                <button
                  disabled={submitting || isSubmitted || !allDone}
                  onClick={handleSubmit}
                  className="w-full bg-primary-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-md shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting…" : isSubmitted ? "Submitted ✓" : "Submit Registration"}
                </button>
                {!allDone && !isSubmitted && (
                  <p className="text-xs text-neutral-400 text-center mt-2">
                    Complete all steps to enable submission
                  </p>
                )}
              </div>
            </div>
          </aside>

          {/* ── Step Panel ── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">

              {/* Step header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-neutral-800">
                    Step {STEPS.find((s) => s.key === activeStep)?.step} —{" "}
                    {STEPS.find((s) => s.key === activeStep)?.label}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {stepStatusMap[activeStep] ? "✓ Saved" : "Not saved yet"}
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving || loadingStep || isSubmitted}
                  className="bg-primary-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save Step"}
                </button>
              </div>

              {/* Save feedback */}
              {saveMsg && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm">
                  {saveMsg}
                </div>
              )}
              {saveError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
                  {saveError}
                </div>
              )}

              {/* Step content */}
              {stepError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
                  Failed to load step data: {stepError}
                </div>
              )}

              {loadingStep && (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-3 w-32 mb-1.5" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              )}

              {!loadingStep && !stepError && (
                <StepContent
                  stepKey={activeStep}
                  data={stepData}
                  onChange={setStepData}
                  onFileUpload={handleFileUpload}
                  disabled={isSubmitted}
                  // staff-specific handlers
                  onAddTeacher={addTeacher}
                  onUpdateTeacher={updateTeacher}
                  onDeleteTeacher={deleteTeacher}
                  onAddNonTeaching={addNonTeachingStaff}
                  onUpdateNonTeaching={updateNonTeachingStaff}
                  onDeleteNonTeaching={deleteNonTeachingStaff}
                  onAddVocationalStaff={addVocationalStaff}
                  onUpdateVocationalStaff={updateVocationalStaff}
                  onDeleteVocationalStaff={deleteVocationalStaff}
                  // student-specific handlers
                  onAddStudent={addStudent}
                  onUpdateStudent={updateStudent}
                  onDeleteStudent={deleteStudent}
                  onRefreshStudents={fetchStudents}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── StepContent ──────────────────────────────────────────────────────────────

interface StepContentProps {
  stepKey: string;
  data: unknown;
  onChange: (d: unknown) => void;
  onFileUpload: (docType: string, file: File) => void;
  disabled: boolean;
  onAddTeacher: (p: unknown) => Promise<unknown>;
  onUpdateTeacher: (id: string, p: unknown) => Promise<unknown>;
  onDeleteTeacher: (id: string) => Promise<unknown>;
  onAddNonTeaching: (p: unknown) => Promise<unknown>;
  onUpdateNonTeaching: (id: string, p: unknown) => Promise<unknown>;
  onDeleteNonTeaching: (id: string) => Promise<unknown>;
  onAddVocationalStaff: (p: unknown) => Promise<unknown>;
  onUpdateVocationalStaff: (id: string, p: unknown) => Promise<unknown>;
  onDeleteVocationalStaff: (id: string) => Promise<unknown>;
  onAddStudent: (p: unknown) => Promise<unknown>;
  onUpdateStudent: (id: string, p: unknown) => Promise<unknown>;
  onDeleteStudent: (id: string) => Promise<unknown>;
  onRefreshStudents: () => Promise<unknown>;
}

function StepContent({ stepKey, data, onChange, onFileUpload, disabled, ...handlers }: StepContentProps) {
  // Generic key-value updater for flat objects
  const set = (key: string, value: unknown) =>
    onChange({ ...(data as Record<string, unknown> ?? {}), [key]: value });

  const d = (data as Record<string, unknown>) ?? {};

  // ── Reusable field ──
  const Field = ({
    label, name, type = "text", options,
  }: {
    label: string;
    name: string;
    type?: string;
    options?: string[];
  }) => (
    <div>
      <label className="block text-xs font-semibold text-neutral-500 mb-1">{label}</label>
      {options ? (
        <select
          disabled={disabled}
          value={(d[name] as string) ?? ""}
          onChange={(e) => set(name, e.target.value)}
          className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50"
        >
          <option value="">— Select —</option>
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          disabled={disabled}
          value={(d[name] as string) ?? ""}
          onChange={(e) => set(name, e.target.value)}
          className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50"
        />
      )}
    </div>
  );

  // ────────────────────────────────────────────────────────────────────────────
  // Step-specific UIs
  // ────────────────────────────────────────────────────────────────────────────

  if (stepKey === "basic_details") {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="School Name"              name="school_name" />
        <Field label="UDISE Code"               name="udise_code" />
        <Field label="Establishment Year"       name="establishment_year" type="number" />
        <Field label="School Type"              name="school_type"
          options={["Government", "Aided", "Private Unaided", "Central Government"]} />
        <Field label="Medium of Instruction"    name="medium_of_instruction" />
        <Field label="Classes From"             name="classes_from" />
        <Field label="Classes To"               name="classes_to" />
        <Field label="Phone"                    name="phone" type="tel" />
        <Field label="Email"                    name="email" type="email" />
        <Field label="Website"                  name="website" type="url" />
      </div>
    );
  }

  if (stepKey === "receipts_expenditure") {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Expenditure — Maintenance (₹)"   name="exp_maintenance"  type="number" />
        <Field label="Expenditure — Teachers (₹)"      name="exp_teachers"     type="number" />
        <Field label="Expenditure — Construction (₹)"  name="exp_construction" type="number" />
        <Field label="Expenditure — Others (₹)"        name="exp_others"       type="number" />
      </div>
    );
  }

  if (stepKey === "legal_details") {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Recognition Number" name="recognition_number" />
        <Field label="Recognition Date"   name="recognition_date" type="date" />
        <Field label="Affiliation Number" name="affiliation_number" />
      </div>
    );
  }

  if (stepKey === "location") {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Field label="Address" name="address" />
        </div>
        <Field label="Village / Town" name="village" />
        <Field label="Block"          name="block" />
        <Field label="District"       name="district" />
        <Field label="State"          name="state" />
        <Field label="Pincode"        name="pincode" type="number" />
      </div>
    );
  }

  if (stepKey === "infrastructure") {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Total Classrooms"        name="total_classrooms"        type="number" />
        <Field label="Classrooms in Good Condition" name="classrooms_good"   type="number" />
        <Field label="Classrooms Needing Repair"    name="classrooms_repair" type="number" />
        <Field label="Total Land Area (sq m)"  name="total_land_area"         type="number" />
        <Field label="Total Built-up Area (sq m)" name="total_built_area"    type="number" />
        <Field label="Library Available"       name="library_available"
          options={["Yes", "No"]} />
        <Field label="Playground Available"    name="playground_available"
          options={["Yes", "No"]} />
        <Field label="Drinking Water Available" name="drinking_water"
          options={["Yes", "No"]} />
        <Field label="Toilets — Boys"           name="toilets_boys"  type="number" />
        <Field label="Toilets — Girls"          name="toilets_girls" type="number" />

        {/* Document upload */}
        <div className="sm:col-span-2 mt-2">
          <p className="text-xs font-semibold text-neutral-500 mb-1">Upload Building Plan</p>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={disabled}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileUpload("building_plan", file);
            }}
            className="text-sm text-neutral-600"
          />
        </div>
      </div>
    );
  }

  if (stepKey === "staff") {
    const staffData = data as StaffData ?? {};
    const teachers         = (staffData.teachers         ?? []) as Array<Record<string, unknown>>;
    const nonTeaching      = (staffData.non_teaching_staff ?? []) as Array<Record<string, unknown>>;
    const vocationalStaff  = (staffData.vocational_staff  ?? []) as Array<Record<string, unknown>>;

    const refreshStaff = () =>
      fetchStaff().then((s) => onChange(s));

    return (
      <div className="space-y-8">
        {/* Summary counts */}
        <div>
          <h3 className="text-sm font-bold text-neutral-700 mb-3">Staff Count Summary</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {["count_regular", "count_non_regular", "count_non_teaching", "count_vocational"].map((k) => (
              <div key={k}>
                <label className="block text-xs font-semibold text-neutral-500 mb-1 capitalize">
                  {k.replace(/_/g, " ")}
                </label>
                <input
                  type="number"
                  disabled={disabled}
                  value={((staffData.staff_summary ?? {}) as Record<string, unknown>)[k] as number ?? 0}
                  onChange={(e) =>
                    onChange({
                      ...staffData,
                      staff_summary: {
                        ...(staffData.staff_summary ?? {}),
                        [k]: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Teachers */}
        <StaffSubSection
          title="Teachers"
          items={teachers}
          fields={["name", "designation", "qualification", "subject"]}
          disabled={disabled}
          onAdd={(p) => handlers.onAddTeacher(p).then(refreshStaff)}
          onUpdate={(id, p) => handlers.onUpdateTeacher(id, p).then(refreshStaff)}
          onDelete={(id) => handlers.onDeleteTeacher(id).then(refreshStaff)}
        />

        {/* Non-teaching staff */}
        <StaffSubSection
          title="Non-Teaching Staff"
          items={nonTeaching}
          fields={["name", "designation", "qualification"]}
          disabled={disabled}
          onAdd={(p) => handlers.onAddNonTeaching(p).then(refreshStaff)}
          onUpdate={(id, p) => handlers.onUpdateNonTeaching(id, p).then(refreshStaff)}
          onDelete={(id) => handlers.onDeleteNonTeaching(id).then(refreshStaff)}
        />

        {/* Vocational staff */}
        <StaffSubSection
          title="Vocational Resource Persons"
          items={vocationalStaff}
          fields={["name", "trade", "qualification"]}
          disabled={disabled}
          onAdd={(p) => handlers.onAddVocationalStaff(p).then(refreshStaff)}
          onUpdate={(id, p) => handlers.onUpdateVocationalStaff(id, p).then(refreshStaff)}
          onDelete={(id) => handlers.onDeleteVocationalStaff(id).then(refreshStaff)}
        />
      </div>
    );
  }

  if (stepKey === "safety") {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Fire Extinguishers"    name="fire_extinguishers"    options={["Yes", "No"]} />
        <Field label="First Aid Kit"         name="first_aid_kit"         options={["Yes", "No"]} />
        <Field label="CCTV Installed"        name="cctv_installed"        options={["Yes", "No"]} />
        <Field label="Boundary Wall"         name="boundary_wall"         options={["Yes", "No"]} />
        <Field label="Security Guard"        name="security_guard"        options={["Yes", "No"]} />
        <Field label="Emergency Exit"        name="emergency_exit"        options={["Yes", "No"]} />

        {/* Document uploads */}
        <div className="sm:col-span-2 mt-2 space-y-3">
          <p className="text-xs font-bold text-neutral-500">Safety Documents</p>
          {[
            { label: "Lab Photo",               type: "lab_photo" },
            { label: "Sanction Order",           type: "sanction_order" },
            { label: "Disability Certificate",   type: "disability_certificate" },
          ].map(({ label, type }) => (
            <div key={type}>
              <p className="text-xs font-semibold text-neutral-500 mb-1">{label}</p>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                disabled={disabled}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFileUpload(type, file);
                }}
                className="text-sm text-neutral-600"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stepKey === "student_capacity") {
    const capacityData = (Array.isArray(data) ? data[0] : data) as StudentCapacityData ?? {};
    const students     = (Array.isArray(data) ? data[1] : []) as Array<Record<string, unknown>>;

    const refreshStudents = () =>
      Promise.all([fetchStudentCapacity(), handlers.onRefreshStudents()]).then(onChange);

    return (
      <div className="space-y-8">
        {/* Section configs — simple JSON editor as placeholder */}
        <div>
          <h3 className="text-sm font-bold text-neutral-700 mb-2">Section Configurations</h3>
          <p className="text-xs text-neutral-400 mb-2">
            {(capacityData.section_configs ?? []).length} section config(s) saved.
          </p>
        </div>

        {/* Students */}
        <StaffSubSection
          title="Students"
          items={students}
          fields={["name", "class_name", "section", "roll_number"]}
          disabled={disabled}
          onAdd={(p) => handlers.onAddStudent(p).then(refreshStudents)}
          onUpdate={(id, p) => handlers.onUpdateStudent(id, p).then(refreshStudents)}
          onDelete={(id) => handlers.onDeleteStudent(id).then(refreshStudents)}
        />
      </div>
    );
  }

  if (stepKey === "vocational_education") {
    const vData = data as VocationalEducationData ?? {};
    const voc   = (vData.vocational_education ?? {}) as Record<string, unknown>;

    const setVoc = (key: string, value: unknown) =>
      onChange({ ...vData, vocational_education: { ...voc, [key]: value } });

    return (
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          ["vocational_trade",        "Vocational Trade"],
          ["nss_available",           "NSS Available"],
          ["ncc_available",           "NCC Available"],
          ["scout_guide_available",   "Scout & Guide Available"],
        ].map(([key, label]) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-neutral-500 mb-1">{label}</label>
            <select
              disabled={disabled}
              value={(voc[key] as string) ?? ""}
              onChange={(e) => setVoc(key, e.target.value)}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-neutral-50"
            >
              <option value="">— Select —</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
        ))}
      </div>
    );
  }

  return (
    <p className="text-sm text-neutral-400 text-center py-10">
      No UI defined for this step yet.
    </p>
  );
}

// ─── StaffSubSection ──────────────────────────────────────────────────────────

interface StaffSubSectionProps {
  title: string;
  items: Array<Record<string, unknown>>;
  fields: string[];
  disabled: boolean;
  onAdd: (p: unknown) => Promise<unknown>;
  onUpdate: (id: string, p: unknown) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}

function StaffSubSection({ title, items, fields, disabled, onAdd, onUpdate, onDelete }: StaffSubSectionProps) {
  const [form, setForm]   = useState<Record<string, string>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [busy, setBusy]   = useState(false);

  const reset = () => { setForm({}); setEditId(null); };

  const handleSubmit = async () => {
    setBusy(true);
    try {
      if (editId) {
        await onUpdate(editId, form);
      } else {
        await onAdd(form);
      }
      reset();
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = (item: Record<string, unknown>) => {
    setEditId(item.id as string);
    const f: Record<string, string> = {};
    fields.forEach((k) => { f[k] = (item[k] as string) ?? ""; });
    setForm(f);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    setBusy(true);
    try { await onDelete(id); } finally { setBusy(false); }
  };

  return (
    <div>
      <h3 className="text-sm font-bold text-neutral-700 mb-3">{title}</h3>

      {/* Existing items */}
      {items.length > 0 && (
        <div className="border border-neutral-100 rounded-xl overflow-hidden mb-4">
          <table className="w-full text-xs">
            <thead className="bg-neutral-50">
              <tr>
                {fields.map((f) => (
                  <th key={f} className="px-3 py-2 text-left font-semibold text-neutral-500 capitalize">
                    {f.replace(/_/g, " ")}
                  </th>
                ))}
                {!disabled && <th className="px-3 py-2" />}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={(item.id as string) ?? i} className="border-t border-neutral-100 hover:bg-neutral-50">
                  {fields.map((f) => (
                    <td key={f} className="px-3 py-2 text-neutral-700">
                      {(item[f] as string) ?? "—"}
                    </td>
                  ))}
                  {!disabled && (
                    <td className="px-3 py-2 flex items-center gap-2 justify-end">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-primary-600 hover:underline text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id as string)}
                        disabled={busy}
                        className="text-red-500 hover:underline text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / edit form */}
      {!disabled && (
        <div className="border border-dashed border-neutral-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-neutral-500 mb-3">
            {editId ? "Edit Entry" : `Add ${title}`}
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            {fields.map((f) => (
              <div key={f}>
                <label className="block text-xs text-neutral-400 mb-1 capitalize">
                  {f.replace(/_/g, " ")}
                </label>
                <input
                  type="text"
                  value={form[f] ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f]: e.target.value }))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-1.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={busy}
              className="bg-primary-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary-700 disabled:opacity-50"
            >
              {busy ? "Saving…" : editId ? "Update" : "Add"}
            </button>
            {editId && (
              <button
                onClick={reset}
                className="border border-neutral-200 text-neutral-600 px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-neutral-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}