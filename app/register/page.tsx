"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";

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
  const router = useRouter();
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-sm">SQ</span>
            </div>
            <span className="font-bold text-lg text-slate-800 dark:text-slate-200">
              SQUL
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Create your school account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Set up your school management system in minutes
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (idx < currentStep) setCurrentStep(idx);
                }}
                disabled={idx > currentStep}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  idx === currentStep && "bg-primary text-white shadow-sm",
                  idx < currentStep &&
                    "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20",
                  idx > currentStep &&
                    "bg-slate-100 dark:bg-slate-800 text-slate-400",
                )}
              >
                <span
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                    idx === currentStep && "bg-white/20",
                    idx < currentStep && "bg-primary/20",
                    idx > currentStep && "bg-slate-200 dark:bg-slate-700",
                  )}
                >
                  {idx < currentStep ? "✓" : idx + 1}
                </span>
                <span className="hidden sm:inline">{step.title}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <div className="w-6 h-px bg-slate-200 dark:bg-slate-700" />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Error / Success */}
          {(error || success) && (
            <div
              className={cn(
                "px-6 py-3 text-sm font-medium border-b",
                error &&
                  "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300",
                success &&
                  "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
              )}
            >
              {error && `⚠️ ${error}`}
              {success && "✅ Account created! Redirecting you to sign in…"}
            </div>
          )}

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-6 space-y-5"
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
                placeholder="you@example.com"
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
                            met
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-slate-400 dark:text-slate-500",
                          )}
                        >
                          <div
                            className={cn(
                              "w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] transition-all",
                              met
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400",
                            )}
                          >
                            {met ? "✓" : "○"}
                          </div>
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
                placeholder="Springfield High School"
                icon={<BuildingIcon />}
                disabled={isSubmitting}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  School URL
                </label>
                <div className="flex rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 focus-within:ring-2 focus-within:ring-primary transition-all">
                  <span className="flex items-center px-3 rounded-l-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm border-r border-slate-200 dark:border-slate-700">
                    https://
                  </span>
                  <input
                    {...form.register("schoolUrl")}
                    placeholder="springfield-high"
                    disabled={isSubmitting}
                    onChange={(e) => {
                      form.setValue("schoolUrl", e.target.value, {
                        shouldValidate: true,
                      });
                      setIsUrlEdited(true);
                    }}
                    className="flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-0"
                  />
                  <span className="flex items-center px-3 rounded-r-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm border-l border-slate-200 dark:border-slate-700">
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
                    className="mt-1.5 text-xs text-primary hover:underline"
                  >
                    Reset to auto-generated
                  </button>
                )}
                {form.formState.errors.schoolUrl && (
                  <p className="text-xs text-red-500 mt-1.5">
                    {form.formState.errors.schoolUrl.message}
                  </p>
                )}
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                  This will be your school&apos;s unique web address.
                  Auto-generated from your school name.
                </p>
              </div>
            </div>

            {/* ── Step 2: Review ── */}
            <div className={cn("space-y-4", currentStep !== 2 && "hidden")}>
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Review Your Information
              </h3>
              <ReviewRow label="Full Name" value={form.watch("name")} />
              <ReviewRow label="Email" value={form.watch("email")} />
              <ReviewRow label="Password" value="••••••••" />
              <hr className="border-slate-100 dark:border-slate-800" />
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
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-primary hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-primary hover:underline"
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
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <div>
                {!isFirstStep && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                  >
                    ← Back
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                {!isLastStep ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating…
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
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
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
          {icon}
        </div>
        <input
          {...form.register(name)}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={onFocus}
          className={cn(
            "w-full h-11 pl-10 pr-3 rounded-lg border text-sm transition-all",
            "bg-white dark:bg-slate-950",
            "text-slate-900 dark:text-slate-100",
            "placeholder:text-slate-400 dark:placeholder:text-slate-500",
            error
              ? "border-red-300 dark:border-red-700 focus:ring-2 focus:ring-red-500/20"
              : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error.message}</p>}
    </div>
  );
}

// ─── Review Row ────────────────────────────────────────────────

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
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
