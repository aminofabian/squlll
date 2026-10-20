"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { schoolPortalUrl } from "@/lib/auth/post-login-navigation";
import { SqulWordmark } from "@/components/brand/SqulMark";

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

      const subdomain: string | undefined =
        data.tenantSubdomain ||
        data.tenant?.subdomain ||
        data.subdomainUrl?.split(".")[0];

      if (data.membership?.role === "ADMIN") {
        router.push("/dashboard");
      } else if (subdomain) {
        // Keep local dev on the local host instead of redirecting to *.squl.co.ke
        window.location.href = schoolPortalUrl(subdomain);
      } else {
        router.push("/dashboard");
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
    <div className="onboarding-flow min-h-screen bg-[#f7f4ec] font-sans text-[#14201b]">
      <div className="grid min-h-screen lg:grid-cols-[1.02fr_1fr]">
        {/* Brand panel */}
        <aside className="relative hidden overflow-hidden bg-[#0d201a] lg:flex lg:flex-col">
          <div className="absolute inset-0" aria-hidden>
            <img
              src="/schooll.png"
              alt=""
              className="h-full w-full object-cover object-[50%_35%] opacity-45 grayscale-[0.2]"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0d201a] via-[#0d201a]/85 to-[#0d201a]/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d201a] via-transparent to-[#0d201a]/50" />
            <div className="mk-grain mk-grain--light" />
          </div>

          <div className="relative z-10 flex flex-1 flex-col justify-between p-10 xl:p-14">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-[0.625rem] uppercase tracking-[0.16em] text-white/40 transition-colors duration-200 hover:text-white"
              >
                <ArrowLeft size={13} aria-hidden />
                Back to home
              </Link>

              <div className="mt-16">
                <SqulWordmark tone="light" markSize={32} />
              </div>

              <h1 className="mt-12 max-w-md font-display text-[clamp(2.6rem,3.8vw,3.5rem)] leading-[1.0] tracking-[-0.025em] text-[#f7f4ec]">
                Welcome back
                <span className="mt-1 block italic text-[#d8c9ab]">to your school.</span>
              </h1>
              <p className="mt-6 max-w-sm text-[0.9375rem] leading-[1.7] text-white/55">
                Principals, bursars and admins — pick up fees, admissions and CBC
                marks exactly where you left off.
              </p>
            </div>

            <ul className="border-t border-white/10 pt-5">
              <li className="flex items-baseline gap-3 border-b border-white/8 py-3.5 text-[0.75rem] leading-relaxed text-white/45">
                <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-[#a98a55]" aria-hidden />
                Role-based access — staff only see what their job needs.
              </li>
              <li className="flex items-baseline gap-3 py-3.5 text-[0.75rem] leading-relaxed text-white/45">
                <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-[#a98a55]" aria-hidden />
                M-Pesa reconciliation, learner files and term reports in one place.
              </li>
            </ul>
          </div>
        </aside>

        {/* Form panel */}
        <main className="flex min-h-screen flex-col px-6 py-8 sm:px-10 lg:px-14">
          <div className="flex items-center justify-between">
            <div className="lg:hidden">
              <SqulWordmark markSize={28} />
            </div>
            <Link
              href="/"
              className="ml-auto text-[0.625rem] uppercase tracking-[0.16em] text-[#7c857d] transition-colors duration-200 hover:text-[#14201b]"
            >
              Back to home
            </Link>
          </div>

          <div className="mx-auto flex w-full max-w-[26rem] flex-1 flex-col justify-center py-12">
            <p className="mk-eyebrow">Sign in</p>
            <h2 className="mt-6 font-display text-[2.4rem] leading-[1.03] tracking-[-0.02em] text-[#14201b]">
              Sign in.
            </h2>
            <p className="mt-4 text-[0.8125rem] leading-[1.7] text-[#4d574f]">
              Use the email and password for your school account. New school?{" "}
              <Link
                href="/register"
                className="text-[#14201b] underline decoration-[#14201b]/25 underline-offset-4 transition-colors hover:decoration-[#14201b]"
              >
                Start a free term
              </Link>
              .
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              {error && (
                <div
                  role="alert"
                  className="border-l-2 border-[#a04a3a] py-1 pl-4 text-[0.8125rem] leading-relaxed text-[#8a3a2c]"
                >
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[0.625rem] font-medium uppercase tracking-[0.14em] text-[#4d574f]">
                  Work email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@schoolname.ac.ke"
                  className="h-12 rounded-[2px] border-[#14201b]/15 bg-[#fcfaf4] text-[0.875rem] shadow-none placeholder:text-[#14201b]/30 focus-visible:border-[#1c3d32] focus-visible:ring-2 focus-visible:ring-[#1c3d32]/10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[0.625rem] font-medium uppercase tracking-[0.14em] text-[#4d574f]">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-[0.6875rem] font-medium text-[#1c3d32] underline decoration-[#1c3d32]/25 underline-offset-4 transition-colors hover:decoration-[#1c3d32]"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Your password"
                  className="h-12 rounded-[2px] border-[#14201b]/15 bg-[#fcfaf4] text-[0.875rem] shadow-none placeholder:text-[#14201b]/30 focus-visible:border-[#1c3d32] focus-visible:ring-2 focus-visible:ring-[#1c3d32]/10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded-[2px] border-[#14201b]/25 text-[#1c3d32] focus:ring-[#1c3d32]/25"
                />
                <Label htmlFor="remember" className="text-[0.75rem] font-normal text-[#4d574f]">
                  Keep me signed in on this device
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-2 h-12 w-full rounded-[2px] bg-[#14201b] text-[0.8125rem] font-medium text-[#f7f4ec] shadow-none transition-colors duration-200 hover:bg-[#1c3d32] disabled:bg-[#14201b]/20 disabled:text-[#14201b]/40"
              >
                {isLoading ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <p className="mt-8 text-[0.8125rem] text-[#4d574f]">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-[#14201b] underline decoration-[#14201b]/25 underline-offset-4 transition-colors hover:decoration-[#14201b]"
              >
                Create your school
              </Link>
            </p>

            <p className="mt-6">
              <Link
                href="/superadmin/login"
                className="text-[0.625rem] uppercase tracking-[0.14em] text-[#7c857d] transition-colors hover:text-[#14201b]"
              >
                Platform super admin
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
