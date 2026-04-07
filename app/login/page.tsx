"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/app/components/ui/auth-card";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { API_BASE_URL } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── If already logged in, redirect AWAY from login page ──────────────────
  // NEVER redirect to "/login" inside this useEffect — that caused the loop.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return; // Not logged in → stay on this page

      const parsed = JSON.parse(raw);
      if (!parsed?.access_token || !parsed?.role) return; // Bad data → stay

      // Already logged in → send to the right dashboard
      if (parsed.role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/dashboard");
      }
    } catch {
      localStorage.removeItem("user"); // Corrupted data → clear and stay
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Login form submit ─────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail ?? "Invalid email or password.");
      }

      // Persist user session to localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          user_id:      data.user_id,
          email:        data.email,
          full_name:    data.full_name,
          school_name:  data.school_name,
          udise_number: data.udise_number,
          role:         data.role,
          access_token: data.access_token,
        })
      );

      // Redirect based on role — never back to /login
      if (data.role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-900 p-4 transition-colors duration-500">
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />

      <AuthCard
        title="School Login"
        subtitle="Sign in to manage your school profile and applications"
      >
        {/* Error Banner */}
        {error && (
          <div className="mb-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <Input
            label="Email Address"
            type="email"
            placeholder="school@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex justify-end text-sm">
            <Link
              href="#"
              className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-12 text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing In…" : "Sign In"}
            </Button>
          </div>

          <div className="text-center pt-2">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors underline-offset-4 hover:underline"
              >
                Register your school
              </Link>
            </p>
          </div>
        </form>
      </AuthCard>
    </div>
  );
}