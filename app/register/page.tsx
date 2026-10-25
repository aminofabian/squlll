"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Check,
  Circle,
  Loader2,
  Phone,
  X,
} from "lucide-react";
import { schoolPortalUrl } from "@/lib/auth/post-login-navigation";
import { suggestDomainNames } from "@/lib/school/domainSuggestions";
import { SqulWordmark } from "@/components/brand/SqulMark";
import {
  formatKenyanPhone,
  normalizeKenyanPhone,
} from "@/lib/auth/phone";

// ─── Schema ────────────────────────────────────────────────────

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z
    .string()
    .trim()
    .refine((value) => normalizeKenyanPhone(value) !== null, {
      message: "Enter a valid mobile number, e.g. 712 345 678",
    }),
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
      "Use lowercase letters, numbers and hyphens only (no spaces)",
    )
    .refine(
      (value) => !RESERVED_PORTAL_ADDRESSES.has(value),
      "That address is reserved. Please choose another.",
    ),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms to continue" }),
  }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

// Mirrors the backend reservation list so the form can warn instantly.
const RESERVED_PORTAL_ADDRESSES = new Set([
  "www", "api", "admin", "dashboard", "app", "mail", "smtp", "imap", "pop",
  "ns", "ns1", "ns2", "cpanel", "webmail", "autodiscover", "ftp", "localhost",
  "register", "login", "signup", "support", "help", "status", "billing", "docs",
  "blog", "news", "test", "demo", "staging", "dev", "portal", "schools",
  "school", "tenants", "tenant", "auth", "sso", "cdn", "static", "assets",
  "media", "files", "download", "uploads", "pay", "payments", "mpesa", "sms",
  "email", "analytics",
]);

const SCHOOL_URL_AVAILABLE_QUERY = `
  query SchoolUrlAvailable($schoolUrl: String!) {
    schoolUrlAvailable(schoolUrl: $schoolUrl)
  }
`;

async function isSchoolUrlAvailable(schoolUrl: string): Promise<boolean> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      query: SCHOOL_URL_AVAILABLE_QUERY,
      variables: { schoolUrl },
    }),
  });
  if (!response.ok) throw new Error("Availability check failed");
  const payload = (await response.json()) as {
    data?: { schoolUrlAvailable?: boolean };
    errors?: Array<{ message?: string }>;
  };
  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message ?? "Availability check failed");
  }
  return Boolean(payload.data?.schoolUrlAvailable);
}

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
    fields: ["name", "email", "phoneNumber", "password"],
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

/**
 * Portal-friendly ideas derived from the same naming rules, but with readable
 * hyphenated variants (`nyahururu-ps`, `nyahururu-primary`) instead of long
 * concatenations. The field stays editable — these are only suggestions.
 */
function portalIdeas(name: string): Array<{ label: string; note: string }> {
  const suggestions = suggestDomainNames(name).filter(
    (suggestion) => !suggestion.domain,
  );
  const core = suggestions.find(
    (suggestion) => suggestion.strategy === "core",
  )?.label;
  if (!core) return [];

  const ideas: Array<{ label: string; note: string }> = [
    { label: core, note: "Just the school's name" },
  ];
  const levelSuggestion = suggestions.find(
    (suggestion) => suggestion.strategy === "level",
  );
  if (levelSuggestion) {
    const level = levelSuggestion.label.slice(core.length);
    const short =
      level === "primary"
        ? "ps"
        : level === "secondary"
          ? "sec"
          : level === "junior"
            ? "jss"
            : level;
    ideas.push({ label: `${core}-${short}`, note: "Short, with the level" });
    ideas.push({ label: `${core}-${level}`, note: "The level in full" });
  } else {
    ideas.push({ label: `${core}-school`, note: "Adds 'school'" });
    ideas.push({ label: `${core}-academy`, note: "Adds 'academy'" });
  }

  return ideas
    .filter(
      (idea, index) =>
        ideas.findIndex((candidate) => candidate.label === idea.label) === index,
    )
    .slice(0, 4);
}

function suggestedSchoolUrl(name: string): string {
  return portalIdeas(name)[0]?.label ?? "";
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

interface SignupMutationResult {
  errors?: Array<{ message?: string }>;
  data?: {
    createUser?: {
      user: { id: string; email: string; schoolUrl: string };
      tenant?: { id: string; name: string; subdomain: string };
      subdomainUrl?: string;
    };
  };
}

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
      phoneNumber: "",
      password: "",
      schoolName: "",
      schoolUrl: "",
      acceptTerms: false as unknown as true,
    },
    mode: "onChange",
  });

  const schoolName = form.watch("schoolName");
  const schoolUrlValue = form.watch("schoolUrl");

  const ideas = useMemo(() => portalIdeas(schoolName || ""), [schoolName]);
  const [urlCheckState, setUrlCheckState] = useState<{
    value: string;
    status: "idle" | "checking" | "available" | "taken" | "error";
  }>({ value: "", status: "idle" });
  const isUrlEditedRef = useRef(false);

  useEffect(() => {
    isUrlEditedRef.current = isUrlEdited;
  }, [isUrlEdited]);

  // Follow the school name until the admin edits the address themselves.
  useEffect(() => {
    if (currentStep !== 1 || isUrlEdited) return;
    const core = ideas[0]?.label;
    if (core && form.getValues("schoolUrl") !== core) {
      form.setValue("schoolUrl", core, { shouldValidate: true });
    }
  }, [currentStep, ideas, isUrlEdited, form]);

  // Debounced availability lookup for whatever is currently in the field.
  useEffect(() => {
    if (currentStep !== 1) return;
    const value = (schoolUrlValue || "").trim().toLowerCase();

    let alive = true;
    const timer = setTimeout(() => {
      const validShape = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
      if (value.length < 3 || value.length > 63 || !validShape) {
        setUrlCheckState({ value, status: "idle" });
        return;
      }
      if (RESERVED_PORTAL_ADDRESSES.has(value)) {
        setUrlCheckState({ value, status: "taken" });
        return;
      }

      setUrlCheckState({ value, status: "checking" });
      void (async () => {
        try {
          const available = await isSchoolUrlAvailable(value);
          if (!alive) return;
          setUrlCheckState({
            value,
            status: available ? "available" : "taken",
          });

          // If the auto-chosen name is taken, quietly move to the next idea
          // rather than pre-selecting something the school cannot have.
          if (!available && !isUrlEditedRef.current) {
            const alternative = ideas.find((idea) => idea.label !== value);
            if (alternative) {
              try {
                const alternativeAvailable = await isSchoolUrlAvailable(
                  alternative.label,
                );
                if (!alive || isUrlEditedRef.current) return;
                if (alternativeAvailable) {
                  form.setValue("schoolUrl", alternative.label, {
                    shouldValidate: true,
                  });
                }
              } catch {
                // Leave the taken state visible; the admin can pick manually.
              }
            }
          }
        } catch {
          if (alive) setUrlCheckState({ value, status: "error" });
        }
      })();
    }, 550);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [schoolUrlValue, currentStep, ideas, form]);

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
                phoneNumber: normalizeKenyanPhone(data.phoneNumber),
                schoolName: data.schoolName,
                // The backend uses this as the tenant subdomain; without it the
                // portal address shown on this step would be ignored.
                schoolUrl: data.schoolUrl,
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

        let result: SignupMutationResult;
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
          if (msg.toLowerCase().includes("phone")) {
            throw new Error(
              "Please enter a valid phone number, e.g. 712 345 678.",
            );
          }
          if (msg.toLowerCase().includes("reserved")) {
            throw new Error(
              "That portal address is reserved. Please choose another.",
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
        const loginUrl = schoolPortalUrl(
          subdomain,
          `/login?registered=true&email=${encodeURIComponent(userData.user.email)}`,
        );

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

  const normalizedUrl = (schoolUrlValue || "").toLowerCase();
  const otherIdeas = ideas.filter((idea) => idea.label !== normalizedUrl);
  const schoolUrlValidShape = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedUrl);
  // Ignore a result that belongs to an older value while the new one is typed.
  const urlCheck =
    urlCheckState.value === normalizedUrl ? urlCheckState.status : "idle";
  const urlChecking =
    currentStep === 1 &&
    normalizedUrl.length >= 3 &&
    schoolUrlValidShape &&
    (urlCheck === "checking" || urlCheck === "idle");
  const canContinueFromSchool =
    schoolName.trim().length >= 2 &&
    normalizedUrl.length >= 3 &&
    normalizedUrl.length <= 63 &&
    schoolUrlValidShape &&
    !RESERVED_PORTAL_ADDRESSES.has(normalizedUrl) &&
    (urlCheck === "available" || urlCheck === "error");

  // ─── Render ──────────────────────────────────────────────────

  return (
    <div className="onboarding-flow min-h-screen bg-[#f7f4ec] font-sans text-[#14201b]">
      <div className="grid min-h-screen lg:grid-cols-2">
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
                Start your
                <span className="mt-1 block italic text-[#d8c9ab]">free term.</span>
              </h1>
              <p className="mt-6 max-w-sm text-[0.9375rem] leading-[1.7] text-white/55">
                Set up M-Pesa fees, admissions and CBC marks for your school —
                90 days free, no card required.
              </p>
            </div>

            <ul className="border-t border-white/10 pt-5">
              <li className="flex items-baseline gap-3 border-b border-white/8 py-3.5 text-[0.75rem] leading-relaxed text-white/45">
                <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-[#a98a55]" aria-hidden />
                Go live in days — not a six-month IT project.
              </li>
              <li className="flex items-baseline gap-3 py-3.5 text-[0.75rem] leading-relaxed text-white/45">
                <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-[#a98a55]" aria-hidden />
                Import your learner list and train the bursar before reporting day.
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
              className="ml-auto text-[0.625rem] uppercase tracking-[0.16em] text-[#5a655d] transition-colors duration-200 hover:text-[#14201b]"
            >
              Back to home
            </Link>
          </div>

          <div className="mx-auto flex w-full max-w-[30rem] flex-1 flex-col justify-center py-10">
            <div className="mb-7">
              <p className="mk-eyebrow">Create account</p>
              <h2 className="mt-6 font-display text-[2.4rem] leading-[1.03] tracking-[-0.02em] text-[#14201b]">
                Set up your school.
              </h2>
              <p className="mt-4 text-[0.8125rem] leading-[1.7] text-[#4d574f]">
                Three short steps — your details, school name, then confirm.
              </p>
            </div>

            {/* Step indicators */}
            <div className="mb-8 flex items-center gap-2 border-y border-[#14201b]/10 py-4">
              {STEPS.map((step, idx) => (
                <div key={step.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (idx < currentStep) setCurrentStep(idx);
                    }}
                    disabled={idx > currentStep}
                    className={cn(
                      "flex items-center gap-2 text-[0.75rem] font-medium transition-colors duration-200",
                      idx === currentStep && "text-[#14201b]",
                      idx < currentStep && "cursor-pointer text-[#4d574f] underline-offset-4 hover:text-[#14201b] hover:underline",
                      idx > currentStep && "text-[#14201b]/25",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border font-mono text-[0.5rem] tabular-nums",
                        idx === currentStep && "border-[#1c3d32] bg-[#1c3d32] text-[#f7f4ec]",
                        idx < currentStep && "border-[#1c3d32]/30 text-[#1c3d32]",
                        idx > currentStep && "border-[#14201b]/15 text-[#14201b]/25",
                      )}
                    >
                      {idx < currentStep ? <Check size={10} aria-hidden /> : String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className={cn(idx === currentStep ? "inline" : "hidden sm:inline")}>{step.title}</span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <span className="mx-1 h-px w-5 bg-[#14201b]/10" aria-hidden />
                  )}
                </div>
              ))}
            </div>

            <div>
              {(error || success) && (
                <div
                  role={error ? "alert" : "status"}
                  className={cn(
                    "mb-5 border-l-2 py-1.5 pl-4 text-[0.8125rem] leading-relaxed",
                    error && "border-[#a04a3a] text-[#8a3a2c]",
                    success && "border-[#1c3d32] text-[#1c3d32]",
                  )}
                >
                  {error}
                  {success && "Account created. Redirecting you to sign in…"}
                </div>
              )}

              <form
                onSubmit={form.handleSubmit(onSubmit)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !isLastStep) {
                    event.preventDefault();
                    void handleNext();
                  }
                }}
                className="space-y-5"
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
              <PhoneField form={form} disabled={isSubmitting} />
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
                            met ? "text-[#1c3d32]" : "text-[#5a655d]",
                          )}
                        >
                          {met ? (
                            <Check size={14} className="shrink-0" aria-hidden />
                          ) : (
                            <Circle size={12} className="shrink-0 text-[#14201b]/20" aria-hidden />
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
                <label className="mb-2 block text-[0.625rem] font-medium uppercase tracking-[0.14em] text-[#4d574f]">
                  School portal address
                </label>
                <div className="flex overflow-hidden rounded-[2px] border border-[#14201b]/15 bg-[#fcfaf4] transition-colors focus-within:border-[#1c3d32] focus-within:ring-2 focus-within:ring-[#1c3d32]/25">
                  <span className="flex items-center border-r border-[#14201b]/10 px-3 text-[0.8125rem] text-[#5a655d]">
                    https://
                  </span>
                  <input
                    {...form.register("schoolUrl")}
                    placeholder="greenfields"
                    disabled={isSubmitting}
                    onChange={(e) => {
                      form.setValue("schoolUrl", e.target.value, {
                        shouldValidate: true,
                      });
                      setIsUrlEdited(true);
                    }}
                    className="h-12 flex-1 border-0 bg-transparent px-3 text-[0.875rem] text-[#14201b] placeholder:text-[#14201b]/30 focus:ring-0"
                  />
                  <span className="flex items-center border-l border-[#14201b]/10 px-3 text-[0.8125rem] text-[#5a655d]">
                    .squl.co.ke
                  </span>
                </div>

                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[0.75rem] text-[#4d574f]">
                    Preview:{" "}
                    <span className="font-mono font-medium text-[#14201b]">
                      {(schoolUrlValue || "yourschool").toLowerCase()}.squl.co.ke
                    </span>
                  </p>
                  {schoolUrlValue.length >= 3 ? (
                    urlCheck === "checking" ? (
                      <span className="flex items-center gap-1 text-[0.6875rem] text-[#5a655d]">
                        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                        Checking…
                      </span>
                    ) : urlCheck === "available" ? (
                      <span className="flex items-center gap-1 text-[0.6875rem] font-medium text-[#1c3d32]">
                        <Check size={13} aria-hidden /> Available
                      </span>
                    ) : urlCheck === "taken" ? (
                      <span className="flex items-center gap-1 text-[0.6875rem] font-medium text-[#a04a3a]">
                        <X size={13} aria-hidden /> Taken — try an idea below
                      </span>
                    ) : urlCheck === "error" ? (
                      <span className="text-[0.6875rem] text-[#5a655d]">
                        Couldn&apos;t check — you can still continue
                      </span>
                    ) : null
                  ) : null}
                </div>

                {otherIdeas.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[0.625rem] uppercase tracking-[0.12em] text-[#5a655d]">
                      Other ideas
                    </span>
                    {otherIdeas.map((idea) => (
                      <button
                        key={idea.label}
                        type="button"
                        title={idea.note}
                        onClick={() => {
                          form.setValue("schoolUrl", idea.label, {
                            shouldValidate: true,
                          });
                          setIsUrlEdited(true);
                        }}
                        className="rounded-full border border-[#14201b]/15 px-2.5 py-1 text-[0.6875rem] text-[#4d574f] transition-colors hover:border-[#1c3d32]/40 hover:bg-[#1c3d32]/5"
                      >
                        {idea.label}
                      </button>
                    ))}
                    {isUrlEdited && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsUrlEdited(false);
                          form.setValue(
                            "schoolUrl",
                            suggestedSchoolUrl(form.getValues("schoolName")),
                            { shouldValidate: true },
                          );
                        }}
                        className="text-[0.6875rem] text-[#1c3d32] underline decoration-[#1c3d32]/25 underline-offset-4 hover:decoration-[#1c3d32]"
                      >
                        Use our suggestion
                      </button>
                    )}
                  </div>
                )}

                <p className="mt-2 text-[0.8125rem] font-medium leading-snug text-[#14201b]">
                  Your staff and parents will use this link.
                </p>
                <p className="mt-1 text-[0.6875rem] leading-relaxed text-[#4d574f]">
                  Choose carefully — changing it later requires support.
                  Lowercase letters, numbers and hyphens only.
                </p>
                {schoolUrlValue.length > 30 ? (
                  <p className="mt-1 text-[0.6875rem] text-[#a04a3a]">
                    Shorter is easier to share — try to stay under 30
                    characters.
                  </p>
                ) : null}

                {form.formState.errors.schoolUrl && (
                  <p className="mt-2 text-[0.6875rem] text-[#a04a3a]">
                    {form.formState.errors.schoolUrl.message}
                  </p>
                )}
              </div>
            </div>

            {/* ── Step 2: Review ── */}
            <div className={cn("space-y-4", currentStep !== 2 && "hidden")}>
              <h3 className="text-[0.625rem] font-medium uppercase tracking-[0.16em] text-[#5a655d]">
                Review before you create
              </h3>
              <ReviewRow label="Full Name" value={form.watch("name")} />
              <ReviewRow label="Email" value={form.watch("email")} />
              <ReviewRow
                label="Phone"
                value={formatKenyanPhone(form.watch("phoneNumber"))}
              />
              <ReviewRow label="Password" value="••••••••" />
              <hr className="border-[#14201b]/10" />
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
                    className="mt-0.5 h-3.5 w-3.5 rounded-[2px] border-[#14201b]/25 text-[#1c3d32] focus:ring-[#1c3d32]/25"
                  />
                  <span className="text-[0.75rem] leading-relaxed text-[#4d574f]">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="font-medium text-[#14201b] underline decoration-[#14201b]/25 underline-offset-2 hover:decoration-[#14201b]"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="font-medium text-[#14201b] underline decoration-[#14201b]/25 underline-offset-2 hover:decoration-[#14201b]"
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
            <div className="flex items-center justify-between border-t border-[#14201b]/10 pt-6">
              <div>
                {!isFirstStep && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handlePrev}
                    disabled={isSubmitting}
                    className="-ml-4 px-0 text-[#4d574f] hover:bg-transparent hover:text-[#14201b]"
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
                    disabled={currentStep === 1 && !canContinueFromSchool}
                    className="h-11 rounded-[2px] bg-[#14201b] px-6 text-[0.8125rem] font-medium text-[#f7f4ec] shadow-none hover:bg-[#1c3d32] disabled:bg-[#14201b]/25 disabled:text-[#f7f4ec]/60"
                  >
                    {urlChecking ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" aria-hidden />
                        Checking…
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 min-w-[9.5rem] rounded-[2px] bg-[#14201b] px-6 text-[0.8125rem] font-medium text-[#f7f4ec] shadow-none hover:bg-[#1c3d32] disabled:bg-[#14201b]/20 disabled:text-[#14201b]/40"
                  >
                    {isSubmitting ? "Creating…" : "Create school"}
                  </Button>
                )}
              </div>
            </div>
              </form>
            </div>

            <p className="mt-8 text-[0.8125rem] text-[#4d574f]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-[#14201b] underline decoration-[#14201b]/25 underline-offset-4 hover:decoration-[#14201b]"
              >
                Sign in
              </Link>
            </p>
          </div>
        </main>
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
      <label className="mb-2 block text-[0.625rem] font-medium uppercase tracking-[0.14em] text-[#4d574f]">
        {label}
      </label>
      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#5a655d] transition-colors group-focus-within:text-[#1c3d32]">
          {icon}
        </div>
        <input
          {...form.register(name)}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={onFocus}
          className={cn(
            "h-12 w-full rounded-[2px] border bg-[#fcfaf4] pl-10 pr-3 text-[0.875rem] transition-colors",
            "text-[#14201b] placeholder:text-[#14201b]/30",
            error
              ? "border-[#a04a3a]/60 focus:border-[#a04a3a] focus:ring-2 focus:ring-[#a04a3a]/15"
              : "border-[#14201b]/15 focus:border-[#1c3d32] focus:ring-2 focus:ring-[#1c3d32]/25",
            "disabled:cursor-not-allowed disabled:bg-[#efeadd] disabled:text-[#14201b]/40",
          )}
        />
      </div>
      {error && <p className="mt-2 text-[0.6875rem] text-[#a04a3a]">{error.message}</p>}
    </div>
  );
}

// ─── Phone Field ──────────────────────────────────────────────

function PhoneField({
  form,
  disabled,
}: {
  form: ReturnType<typeof useForm<SignupFormValues>>;
  disabled?: boolean;
}) {
  const { error } = form.getFieldState("phoneNumber");

  return (
    <div>
      <label className="mb-2 flex items-center justify-between text-[0.625rem] font-medium uppercase tracking-[0.14em] text-[#4d574f]">
        <span>Phone Number</span>
        <span className="text-[0.5625rem] font-normal normal-case tracking-normal text-[#5a655d]">
          for urgent school updates
        </span>
      </label>
      <div
        className={cn(
          "flex overflow-hidden rounded-[2px] border bg-[#fcfaf4] transition-colors focus-within:ring-2",
          error
            ? "border-[#a04a3a]/60 focus-within:border-[#a04a3a] focus-within:ring-[#a04a3a]/15"
            : "border-[#14201b]/15 focus-within:border-[#1c3d32] focus-within:ring-[#1c3d32]/25",
          disabled && "opacity-50",
        )}
      >
        <span className="flex items-center gap-1.5 border-r border-[#14201b]/10 pl-3 pr-2.5 text-[0.8125rem] font-medium text-[#4d574f]">
          <Phone className="h-3.5 w-3.5 text-[#1c3d32]/60" aria-hidden />
          +254
        </span>
        <input
          {...form.register("phoneNumber")}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="712 345 678"
          maxLength={16}
          disabled={disabled}
          className="h-12 flex-1 border-0 bg-transparent px-3 text-[0.875rem] text-[#14201b] placeholder:text-[#14201b]/30 focus:ring-0 disabled:cursor-not-allowed"
        />
      </div>
      {error ? (
        <p className="mt-2 text-[0.6875rem] text-[#a04a3a]">{error.message}</p>
      ) : (
        <p className="mt-2 text-[0.6875rem] leading-relaxed text-[#5a655d]">
          Kenyan mobile number. We&apos;ll only call or text about your school
          account.
        </p>
      )}
    </div>
  );
}

// ─── Review Row ────────────────────────────────────────────────

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[#14201b]/8 py-3">
      <span className="shrink-0 text-[0.625rem] uppercase tracking-[0.12em] text-[#5a655d]">{label}</span>
      <span className="truncate text-right text-[0.8125rem] font-medium text-[#14201b]">
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
