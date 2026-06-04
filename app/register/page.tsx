"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  ArrowLeft,
  Check,
  Circle,
} from "lucide-react";

// ─── Schema ────────────────────────────────────────────────────

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  schoolName: z.string().min(2, "School name must be at least 2 characters"),
  schoolUrl: z
    .string()
    .min(3, "URL must be at least 3 characters")
    .max(63, "URL must be 63 characters or fewer")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Only lowercase letters, numbers, and hyphens",
    ),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms to continue" }),
  }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

// ─── Steps ─────────────────────────────────────────────────────

type StepId = "personal" | "school" | "review";

interface Step {
  id: StepId;
  title: string;
  description: string;
  fields: (keyof SignupFormValues)[];
}

const STEPS: Step[] = [
  {
    id: "personal",
    title: "Your Details",
    description: "Create your account",
    fields: ["name", "email", "password"],
  },
  {
    id: "school",
    title: "Your School",
    description: "Set up your institution",
    fields: ["schoolName", "schoolUrl"],
  },
  {
    id: "review",
    title: "Review",
    description: "Confirm and create",
    fields: ["acceptTerms"],
  },
];

// ─── Password Requirements ─────────────────────────────────────

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, text: "At least 8 characters" },
  { test: (p: string) => /[A-Z]/.test(p), text: "One uppercase letter" },
  { test: (p: string) => /[a-z]/.test(p), text: "One lowercase letter" },
  { test: (p: string) => /[0-9]/.test(p), text: "One number" },
] as const;

// ─── URL Generator ─────────────────────────────────────────────

function generateSchoolUrl(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 63);
}

// ─── GraphQL Mutation ──────────────────────────────────────────

const SIGNUP_MUTATION = `
  mutation CreateUser($input: SignupInput!) {
    createUser(signupInput: $input) {
      user { id email schoolUrl }
      tenant { id name subdomain }
      subdomainUrl
      tokens { accessToken refreshToken }
    }
  }
`;

// ─── Component ─────────────────────────────────────────────────

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isUrlEdited, setIsUrlEdited] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      schoolName: "",
      schoolUrl: "",
      acceptTerms: false as unknown as true,
    },
    mode: "onChange",
  });

  const schoolName = form.watch("schoolName");

  // Auto-generate URL from school name (only when not manually edited)
  useEffect(() => {
    if (currentStep < 1 || !schoolName || isUrlEdited) return;
    const url = generateSchoolUrl(schoolName);
    if (url.length >= 3) {
      form.setValue("schoolUrl", url, { shouldValidate: true });
    }
  }, [schoolName, currentStep, isUrlEdited, form]);

  // ─── Step Navigation ────────────────────────────────────────

  const goToStep = useCallback(
    async (targetStep: number) => {
      // Validate current step's fields before advancing
      if (targetStep > currentStep) {
        const currentFields = STEPS[currentStep].fields;
        const valid = await form.trigger(currentFields);
        if (!valid) return;
      }
      setError(null);
      setCurrentStep(targetStep);
    },
    [currentStep, form],
  );

  const handleNext = useCallback(async () => {
    await goToStep(currentStep + 1);
  }, [currentStep, goToStep]);

  const handlePrev = useCallback(() => {
    setError(null);
    setCurrentStep((p) => Math.max(0, p - 1));
  }, []);

  // ─── Submit ─────────────────────────────────────────────────

  const onSubmit = useCallback(
    async (data: SignupFormValues) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      setError(null);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30_000);

        const response = await fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            query: SIGNUP_MUTATION,
            variables: {
              input: {
                email: data.email,
                password: data.password,
                name: data.name,
                schoolName: data.schoolName,
              },
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok && response.status >= 500) {
          throw new Error("Server error. Please try again later.");
        }

        const text = await response.text();
        if (!text) throw new Error("No response from server.");

        let result: any;
        try {
          result = JSON.parse(text.trim().replace(/^\uFEFF/, ""));
        } catch {
          throw new Error("Invalid server response. Please try again.");
        }

        if (result.errors) {
          const msg = result.errors[0]?.message || "";
          if (
            msg.toLowerCase().includes("email") &&
            msg.toLowerCase().includes("exist")
          ) {
            throw new Error(
              "An account with this email already exists. Please sign in instead.",
            );
          }
          if (
            msg.toLowerCase().includes("url") ||
            msg.toLowerCase().includes("subdomain")
          ) {
            throw new Error(
              "This school URL is already taken. Please choose a different one.",
            );
          }
          throw new Error(msg || "Signup failed. Please try again.");
        }

        const userData = result.data?.createUser;
        if (!userData) throw new Error("Signup failed. Please try again.");

        setSuccess(true);

        // Redirect after brief success display
        const subdomain =
          userData.tenant?.subdomain ||
          userData.subdomainUrl?.split(".")[0] ||
          userData.user.schoolUrl;
        const isProd = process.env.NODE_ENV === "production";
        const protocol = isProd ? "https://" : "http://";
        const host = isProd ? "squl.co.ke" : "localhost:3000";
        const loginUrl = `${protocol}${subdomain}.${host}/login?registered=true&email=${encodeURIComponent(userData.user.email)}`;

        setTimeout(() => {
          window.location.replace(loginUrl);
        }, 2000);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.name === "AbortError"
              ? "Request timed out. Please check your connection and try again."
              : err.message
            : "An unexpected error occurred. Please try again.";
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting],
  );

  // ─── Current step context ───────────────────────────────────

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;

  // ─── Render ──────────────────────────────────────────────────

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
                Start your
                <span className="block text-emerald-300/95">free term</span>
              </h1>
              <p className="mt-5 max-w-sm text-base leading-relaxed text-white/65">
                Set up M-Pesa fees, admissions, and CBC marks for your school—90-day trial, no card required.
              </p>
            </div>

            <ul className="space-y-4 border-t border-white/10 pt-10 text-sm text-white/55">
              <li className="flex items-start gap-3">
                <Check size={18} className="mt-0.5 shrink-0 text-emerald-300/80" aria-hidden />
                <span>Go live in days—not a six-month IT project.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/80" aria-hidden />
                <span>Import your learner list and train the bursar before reporting day.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-lg">
            <div className="mb-6 lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-[#1d5547] hover:text-[#2d8570]"
              >
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

            <div className="mb-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1d5547]">
                Create account
              </p>
              <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-900">
                Set up your school
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Three quick steps—your details, school name, then confirm. Already on SQUL?{" "}
                <Link href="/login" className="font-semibold text-[#1d5547] hover:text-[#2d8570]">
                  Sign in
                </Link>
                .
              </p>
            </div>

            {/* Step indicators */}
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
              {STEPS.map((step, idx) => (
                <div key={step.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (idx < currentStep) setCurrentStep(idx);
                    }}
                    disabled={idx > currentStep}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                      idx === currentStep &&
                        "bg-[#1d5547] text-white shadow-sm",
                      idx < currentStep &&
                        "cursor-pointer bg-[#1d5547]/10 text-[#1d5547] hover:bg-[#1d5547]/15",
                      idx > currentStep && "bg-slate-100 text-slate-400",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                        idx === currentStep && "bg-white/20",
                        idx < currentStep && "bg-[#1d5547]/15",
                        idx > currentStep && "bg-slate-200",
                      )}
                    >
                      {idx < currentStep ? (
                        <Check size={12} aria-hidden />
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <span className="hidden sm:inline">{step.title}</span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div className="h-px w-4 bg-emerald-900/15 sm:w-6" />
                  )}
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-emerald-900/10 bg-white shadow-sm">
              {(error || success) && (
                <div
                  role={error ? "alert" : "status"}
                  className={cn(
                    "border-b px-6 py-3 text-sm font-medium",
                    error &&
                      "border-red-200 bg-red-50 text-red-700",
                    success &&
                      "border-emerald-200 bg-emerald-50 text-emerald-800",
                  )}
                >
                  {error}
                  {success && "Account created. Redirecting you to sign in…"}
                </div>
              )}

              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5 p-6 sm:p-8"
              >
            {/* ── Step 0: Personal Info ── */}
            <div className={cn("space-y-4", currentStep !== 0 && "hidden")}>
              <Field
                form={form}
                name="name"
                label="Full Name"
                placeholder="John Doe"
                icon={<UserIcon />}
                disabled={isSubmitting}
              />
              <Field
                form={form}
                name="email"
                label="Email Address"
                type="email"
                placeholder="you@schoolname.ac.ke"
                icon={<MailIcon />}
                disabled={isSubmitting}
              />
              <div>
                <Field
                  form={form}
                  name="password"
                  label="Password"
                  type="password"
                  placeholder="Create a secure password"
                  icon={<LockIcon />}
                  disabled={isSubmitting}
                  onFocus={() => setPasswordTouched(true)}
                />
                {passwordTouched && (
                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    {PASSWORD_RULES.map((rule, i) => {
                      const pass = form.watch("password") || "";
                      const met = rule.test(pass);
                      return (
                        <div
                          key={i}
                          className={cn(
                            "flex items-center gap-1.5 text-xs transition-colors",
                            met ? "text-[#1d5547]" : "text-slate-400",
                          )}
                        >
                          {met ? (
                            <Check size={14} className="shrink-0" aria-hidden />
                          ) : (
                            <Circle size={14} className="shrink-0 text-slate-300" aria-hidden />
                          )}
                          {rule.text}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ── Step 1: School Details ── */}
            <div className={cn("space-y-4", currentStep !== 1 && "hidden")}>
              <Field
                form={form}
                name="schoolName"
                label="School Name"
                placeholder="e.g. Greenfields Academy"
                icon={<BuildingIcon />}
                disabled={isSubmitting}
              />
              <div>
                <label className="mb-1.5 block font-ui text-sm font-medium text-slate-700">
                  School portal address
                </label>
                <div className="flex overflow-hidden rounded-lg border border-emerald-900/15 bg-[#f6faf8] transition-all focus-within:ring-2 focus-within:ring-[#1d5547]/25">
                  <span className="flex items-center border-r border-emerald-900/10 px-3 text-sm text-slate-500">
                    https://
                  </span>
                  <input
                    {...form.register("schoolUrl")}
                    placeholder="greenfields-academy"
                    disabled={isSubmitting}
                    onChange={(e) => {
                      form.setValue("schoolUrl", e.target.value, {
                        shouldValidate: true,
                      });
                      setIsUrlEdited(true);
                    }}
                    className="flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-0"
                  />
                  <span className="flex items-center border-l border-emerald-900/10 px-3 text-sm text-slate-500">
                    .squl.co.ke
                  </span>
                </div>
                {isUrlEdited && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsUrlEdited(false);
                      const url = generateSchoolUrl(
                        form.getValues("schoolName"),
                      );
                      form.setValue("schoolUrl", url, { shouldValidate: true });
                    }}
                    className="mt-1.5 text-xs font-medium text-[#1d5547] hover:text-[#2d8570] hover:underline"
                  >
                    Reset to auto-generated
                  </button>
                )}
                {form.formState.errors.schoolUrl && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {form.formState.errors.schoolUrl.message}
                  </p>
                )}
                <p className="mt-1.5 text-xs text-slate-500">
                  Your staff and parents will use this link. We suggest one from your school name.
                </p>
              </div>
            </div>

            {/* ── Step 2: Review ── */}
            <div className={cn("space-y-4", currentStep !== 2 && "hidden")}>
              <h3 className="font-ui text-xs font-semibold uppercase tracking-[0.14em] text-[#1d5547]">
                Review before you create
              </h3>
              <ReviewRow label="Full Name" value={form.watch("name")} />
              <ReviewRow label="Email" value={form.watch("email")} />
              <ReviewRow label="Password" value="••••••••" />
              <hr className="border-emerald-900/10" />
              <ReviewRow label="School Name" value={form.watch("schoolName")} />
              <ReviewRow
                label="School URL"
                value={`https://${form.watch("schoolUrl")}.squl.co.ke`}
              />

              {/* Terms checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...form.register("acceptTerms")}
                    className="mt-0.5 h-4 w-4 rounded border-emerald-900/20 text-[#1d5547] focus:ring-[#1d5547]/30"
                  />
                  <span className="text-xs leading-relaxed text-slate-600">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="font-medium text-[#1d5547] hover:text-[#2d8570] hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="font-medium text-[#1d5547] hover:text-[#2d8570] hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {form.formState.errors.acceptTerms && (
                  <p className="text-xs text-red-500 mt-1">
                    {form.formState.errors.acceptTerms.message}
                  </p>
                )}
              </div>
            </div>

            {/* ── Navigation Buttons ── */}
            <div className="flex items-center justify-between border-t border-emerald-900/10 pt-5">
              <div>
                {!isFirstStep && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handlePrev}
                    disabled={isSubmitting}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    Back
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {!isLastStep ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="bg-[#1d5547] font-semibold text-white hover:bg-[#2d8570]"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[140px] bg-[#1d5547] font-semibold text-white hover:bg-[#2d8570] disabled:opacity-60"
                  >
                    {isSubmitting ? "Creating…" : "Create school"}
                  </Button>
                )}
              </div>
            </div>
              </form>
            </div>

            <p className="mt-8 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#1d5547] hover:text-[#2d8570]"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable Field Component ──────────────────────────────────

function Field({
  form,
  name,
  label,
  type = "text",
  placeholder,
  icon,
  disabled,
  onFocus,
}: {
  form: ReturnType<typeof useForm<SignupFormValues>>;
  name: keyof SignupFormValues;
  label: string;
  type?: string;
  placeholder: string;
  icon: React.ReactNode;
  disabled?: boolean;
  onFocus?: () => void;
}) {
  const { error } = form.getFieldState(name);

  return (
    <div>
      <label className="mb-1.5 block font-ui text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          {icon}
        </div>
        <input
          {...form.register(name)}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={onFocus}
          className={cn(
            "h-11 w-full rounded-lg border bg-[#f6faf8] pl-10 pr-3 text-sm transition-all",
            "text-slate-900 placeholder:text-slate-400",
            error
              ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
              : "border-emerald-900/15 focus:border-[#1d5547]/40 focus:ring-2 focus:ring-[#1d5547]/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error.message}</p>}
    </div>
  );
}

// ─── Review Row ────────────────────────────────────────────────

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="shrink-0 text-sm text-slate-500">{label}</span>
      <span className="truncate text-right text-sm font-medium text-slate-900">
        {value}
      </span>
    </div>
  );
}

// ─── Inline Icons (avoids large import) ────────────────────────

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
      <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path
        fillRule="evenodd"
        d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path
        fillRule="evenodd"
        d="M4 16.5v-13h-.25a.75.75 0 010-1.5h12.5a.75.75 0 010 1.5H16v13h.25a.75.75 0 010 1.5h-3.5a.75.75 0 01-.75-.75v-5.5a.75.75 0 00-.75-.75h-2.5a.75.75 0 00-.75.75v5.5a.75.75 0 01-.75.75h-3.5a.75.75 0 010-1.5H4zm3-11a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1zM7.5 9a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5h-1zM11 5.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1zm.5 3.5a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5h-1z"
        clipRule="evenodd"
      />
    </svg>
  );
}
