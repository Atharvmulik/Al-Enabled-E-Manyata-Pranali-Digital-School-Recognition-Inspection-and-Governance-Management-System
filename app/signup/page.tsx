"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();

  // ── Form fields ──
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [udiseNumber, setUdiseNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  // ── UI state ──
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ── Send OTP ──
  const handleGetOtp = async () => {
    setError(null);
    if (!fullName || !email || !contactNumber || !schoolName || !udiseNumber || !password || !confirmPassword) {
      setError("Please fill in all fields before requesting OTP.");
      return;
    }
    if (udiseNumber.length !== 11) {
      setError("UDISE Number must be exactly 11 digits.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSendingOtp(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Failed to send OTP");
      setOtpSent(true);
      setSuccess("OTP sent to your email. Please check your inbox.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSendingOtp(false);
    }
  };

  // ── Create account ──
  const handleCreateAccount = async () => {
    setError(null);
    setSuccess(null);
    if (!otp) {
      setError("Please enter the OTP sent to your email.");
      return;
    }
    setCreatingAccount(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          contact_number: contactNumber,
          school_name: schoolName,
          udise_number: udiseNumber,
          password,
          otp,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Signup failed");
      setSuccess("Account created successfully! Redirecting to login…");
      setTimeout(() => router.push("/login"), 1500);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCreatingAccount(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-neutral-400 mt-1 text-sm">Join us today and start your journey</p>
        </div>

        {/* Card */}
        <div className="bg-neutral-900 rounded-2xl p-8 space-y-5 border border-neutral-800">

          {/* Error / Success banners */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-xl px-4 py-3">
              {success}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email + Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Contact Number
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* School Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              School Name
            </label>
            <input
              ref={(el) => (fieldRefs.current["schoolName"] = el)}
              value={schoolName}
              onChange={(e) => {
                setSchoolName(e.target.value);
                clearError(0, "schoolName");
              }}
              className={`border ${stepErrors[0]?.schoolName ? "border-red-500" : "border-gray-300"
                }`}
            />

            {stepErrors[0]?.schoolName && (
              <p className="text-red-500 text-sm">
                {stepErrors[0].schoolName}
              </p>
            )}
          </div>

          {/* UDISE Number */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              UDISE Number
            </label>
            <input
              type="text"
              placeholder="11-digit UDISE Number"
              value={udiseNumber}
              maxLength={11}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 11);
                setUdiseNumber(val);
              }}
              className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password + Confirm */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Get OTP button */}
          <button
            type="button"
            onClick={handleGetOtp}
            disabled={sendingOtp}
            className="w-full bg-white text-black font-semibold rounded-xl py-3 text-sm hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendingOtp ? "Sending OTP…" : "Get OTP"}
          </button>

          {/* OTP input */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Enter OTP
            </label>
            <input
              type="text"
              placeholder="123456"
              value={otp}
              maxLength={6}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              disabled={!otpSent}
              className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40"
            />
          </div>

          {/* Create Account button */}
          <button
            type="button"
            onClick={handleCreateAccount}
            disabled={creatingAccount || !otpSent}
            className="w-full bg-blue-600 text-white font-semibold rounded-xl py-3 text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creatingAccount ? "Creating Account…" : "Create Account"}
          </button>

          {/* Sign in link */}
          <p className="text-center text-sm text-neutral-400">
            Already have an account?{" "}
            <a href="/login" className="text-blue-400 hover:underline font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}