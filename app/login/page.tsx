"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, ArrowLeft, Shield } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sign in failed");
      }

      if (data.membership?.role === "ADMIN") {
        router.push("/dashboard");
      } else {
        if (data.subdomainUrl) {
          window.location.href = `https://${data.subdomainUrl}`;
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred during sign in",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6faf8] font-sans">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden overflow-hidden bg-[#0a1f1a] lg:flex lg:flex-col">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <img
              src="/schooll.png"
              alt=""
              className="h-full w-full object-cover object-[50%_35%]"
            />
            <div className="absolute inset-0 bg-[#0a1f1a]/88" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f1a]/70 via-[#1d5547]/35 to-[#0a1f1a]/90" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f1a] via-transparent to-[#0a1f1a]/40" />
          </div>
          <div className="relative z-10 flex flex-1 flex-col justify-between p-10 xl:p-14">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
              >
                <ArrowLeft size={16} aria-hidden />
                Back to home
              </Link>
              <div className="mt-14 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#2d8570]/40 bg-gradient-to-b from-[#246a59] to-[#1a4c40]">
                  <GraduationCap size={22} className="text-white" aria-hidden />
                </div>
                <span className="font-display text-3xl tracking-wide text-white">
                  SQUL
                </span>
              </div>
              <h1 className="mt-10 max-w-md font-display text-4xl leading-[1.12] tracking-tight text-white xl:text-[2.65rem]">
                Sign in to your
                <span className="block text-emerald-300/95">school workspace</span>
              </h1>
              <p className="mt-5 max-w-sm text-base leading-relaxed text-white/65">
                Principals, bursars, and admins—pick up fees, admissions, and CBC marks where you left off.
              </p>
            </div>

            <ul className="space-y-4 border-t border-white/10 pt-10 text-sm text-white/55">
              <li className="flex items-start gap-3">
                <Shield size={18} className="mt-0.5 shrink-0 text-emerald-300/80" aria-hidden />
                <span>Role-based access—staff only see what their job needs.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/80" aria-hidden />
                <span>M-Pesa reconciliation, learner files, and term reports in one place.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#1d5547] hover:text-[#2d8570]">
                <ArrowLeft size={16} aria-hidden />
                Back to home
              </Link>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#1d5547]/25 bg-gradient-to-b from-[#246a59] to-[#1a4c40]">
                  <GraduationCap size={20} className="text-white" aria-hidden />
                </div>
                <span className="font-display text-2xl text-[#1d5547]">SQUL</span>
              </div>
            </div>

            <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-900/10 shadow-sm lg:hidden">
              <img
                src="/schooll.png"
                alt="Kenyan school building"
                className="h-44 w-full object-cover object-[50%_35%] sm:h-52"
              />
            </div>

            <div className="mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1d5547]">
                Sign in
              </p>
              <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-900">
                Welcome back
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Use the email and password for your school account. New school?{" "}
                <Link href="/register" className="font-semibold text-[#1d5547] hover:text-[#2d8570]">
                  Start a free term
                </Link>
                .
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-ui text-sm font-medium text-slate-700">
                    Work email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@schoolname.ac.ke"
                    className="h-11 border-emerald-900/15 bg-[#f6faf8] focus-visible:ring-[#1d5547]/30"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="font-ui text-sm font-medium text-slate-700">
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-[#1d5547] hover:text-[#2d8570]"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Your password"
                    className="h-11 border-emerald-900/15 bg-[#f6faf8] focus-visible:ring-[#1d5547]/30"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 rounded border-emerald-900/20 text-[#1d5547] focus:ring-[#1d5547]/30"
                  />
                  <Label htmlFor="remember" className="text-sm font-normal text-slate-600">
                    Keep me signed in on this device
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 h-11 w-full border-0 bg-[#1d5547] font-semibold text-white hover:bg-[#2d8570] disabled:opacity-50"
                >
                  {isLoading ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </div>

            <p className="mt-8 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-[#1d5547] hover:text-[#2d8570]">
                Create your school
              </Link>
            </p>

            <p className="mt-6 text-center">
              <Link
                href="/superadmin/login"
                className="text-xs text-slate-400 transition-colors hover:text-slate-600"
              >
                Platform super admin
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
