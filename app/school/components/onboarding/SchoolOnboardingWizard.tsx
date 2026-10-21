"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  GraduationCap,
  Loader2,
  Rocket,
  Smartphone,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
  useAcademicYears,
  type AcademicYear,
} from "@/lib/hooks/useAcademicYears";
import { useSchoolConfig } from "@/lib/hooks/useSchoolConfig";
import {
  getMoeAcademicYearPreset,
  getMoeTermPresets,
  moeCalendarYear,
  suggestAcademicYearDates,
  suggestAcademicYearName,
  suggestTermsForYear,
  type TermDraft,
} from "@/lib/utils/school-calendar-presets";
import {
  getTenantIdFromCookies,
  isSchoolOnboardingComplete,
  markSchoolOnboardingComplete,
} from "@/lib/utils/school-onboarding";
import {
  isDuplicateTermError,
  isOverlappingTermError,
  normalizeTermName,
  pendingTermDrafts,
  termErrorMessage,
} from "@/lib/utils/onboarding-terms";
import { OnboardingShell, OnboardingStep } from "./onboarding-ui";
import {
  AcademicYearStepContent,
  formatDisplayDate,
  PaymentsStepContent,
  StreamsStepContent,
  TermsStepContent,
  countPlannedStreamCreates,
} from "./onboarding-steps";
import { OwnerPaymentsDrawer } from "@/app/school/[subdomain]/(pages)/dashboard/components/OwnerPaymentsDrawer";

const ONBOARDING_STEPS = [
  { id: 1, name: "Academic year", description: "Your school calendar" },
  { id: 2, name: "Terms", description: "Teaching periods" },
  { id: 3, name: "Classes", description: "Class streams" },
  { id: 4, name: "Payments", description: "Till, paybill & bank" },
  { id: 5, name: "Next steps", description: "Optional setup" },
  { id: 6, name: "Done", description: "Open your dashboard" },
];

function buildInitialYearForm() {
  const name = suggestAcademicYearName();
  const { startDate, endDate } = suggestAcademicYearDates(name);
  return { name, startDate, endDate };
}

export function SchoolOnboardingWizard() {
  const params = useParams();
  const router = useRouter();
  const subdomain = params.subdomain as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [tenantId, setTenantId] = useState<string | null>(null);

  const {
    academicYears,
    loading: yearsLoading,
    refetch: refetchYears,
  } = useAcademicYears();
  const { data: schoolConfig, refetch: refetchConfig } = useSchoolConfig();

  const [academicYearForm, setAcademicYearForm] =
    useState(buildInitialYearForm);
  const [createdAcademicYear, setCreatedAcademicYear] =
    useState<AcademicYear | null>(null);
  const [isCreatingYear, setIsCreatingYear] = useState(false);

  const [termMode, setTermMode] = useState<"suggested" | "moe" | "custom">(
    "suggested",
  );
  const [suggestedTermCount, setSuggestedTermCount] = useState(3);
  const [termDrafts, setTermDrafts] = useState<TermDraft[]>([]);
  const [customTerm, setCustomTerm] = useState<TermDraft>({
    name: "",
    startDate: "",
    endDate: "",
  });
  const [isCreatingTerms, setIsCreatingTerms] = useState(false);

  const [gradeStreamPlans, setGradeStreamPlans] = useState<
    Record<string, { id: string; name: string; capacity: string }[]>
  >({});
  const [isCreatingStreams, setIsCreatingStreams] = useState(false);
  const [paymentsDrawerOpen, setPaymentsDrawerOpen] = useState(false);
  const [paymentsRail, setPaymentsRail] = useState<"mpesa" | "bank">("mpesa");

  // The cookie is normally present, but custom domains and stale sessions can
  // drop it. Fall back to the tenant carried by the school config so we never
  // mark onboarding complete against a null key (which silently no-ops and
  // bounces the user straight back to /onboarding).
  useEffect(() => {
    const id = getTenantIdFromCookies() || schoolConfig?.tenant?.id || null;
    setTenantId(id);
    if (id && isSchoolOnboardingComplete(id)) {
      router.replace("/dashboard");
    }
  }, [router, schoolConfig?.tenant?.id]);

  // Prefer the freshly fetched year over the locally constructed placeholder:
  // the placeholder is created with `terms: []`, so keeping it would make
  // `hasTerms` false forever and re-seed already-created terms.
  const activeAcademicYear = useMemo(() => {
    if (createdAcademicYear) {
      return (
        academicYears.find((y) => y.id === createdAcademicYear.id) ??
        createdAcademicYear
      );
    }
    return academicYears.find((y) => y.isActive) || academicYears[0] || null;
  }, [academicYears, createdAcademicYear]);

  const termsForYear = useMemo(() => {
    if (!activeAcademicYear) return [];
    return (
      academicYears.find((y) => y.id === activeAcademicYear.id)?.terms || []
    );
  }, [activeAcademicYear, academicYears]);

  const gradeRows = useMemo(() => {
    if (!schoolConfig?.selectedLevels) return [];
    return schoolConfig.selectedLevels.flatMap((level) =>
      (level.gradeLevels || []).map((grade) => ({
        gradeId: grade.id,
        gradeName: grade.name,
        levelName: level.name,
        existingStreams: (grade.streams || []).map((s) => s.name),
      })),
    );
  }, [schoolConfig]);

  const gradesWithoutStreams = useMemo(
    () => gradeRows.filter((g) => g.existingStreams.length === 0),
    [gradeRows],
  );

  useEffect(() => {
    if (gradeRows.length === 0) return;
    setGradeStreamPlans((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const g of gradeRows) {
        if (!(g.gradeId in next)) {
          next[g.gradeId] =
            g.existingStreams.length === 0
              ? [{ id: `stream-${g.gradeId}-0`, name: "A", capacity: "30" }]
              : [];
          changed = true;
          continue;
        }
        const filtered = next[g.gradeId].filter(
          (d) =>
            !d.name.trim() ||
            !g.existingStreams.some(
              (s) => s.toLowerCase() === d.name.trim().toLowerCase(),
            ),
        );
        if (filtered.length !== next[g.gradeId].length) {
          next[g.gradeId] = filtered;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [gradeRows]);

  useEffect(() => {
    if (!activeAcademicYear) return;
    // Terms already exist for this year — show them as done instead of
    // re-seeding "Term 1…3" and posting duplicates on Continue.
    if (termsForYear.length > 0) return;
    const start = activeAcademicYear.startDate.split("T")[0];
    const end = activeAcademicYear.endDate.split("T")[0];
    setTermDrafts((prev) =>
      prev.length > 0 ? prev : suggestTermsForYear(start, end, suggestedTermCount),
    );
    setCustomTerm((prev) =>
      prev.endDate ? prev : { ...prev, name: prev.name || "Term 1", startDate: start },
    );
  }, [activeAcademicYear, suggestedTermCount, termsForYear.length]);

  const hasAcademicYear = Boolean(activeAcademicYear);
  const hasTerms = termsForYear.length > 0;
  const hasAnyStream =
    gradesWithoutStreams.length === 0 ||
    (schoolConfig?.selectedLevels?.some((level) =>
      level.gradeLevels?.some((g) => g.streams && g.streams.length > 0),
    ) ??
      false);

  useEffect(() => {
    if (yearsLoading || !schoolConfig) return;
    const id = getTenantIdFromCookies() || schoolConfig.tenant?.id;
    if (!id || isSchoolOnboardingComplete(id)) return;
    if (hasAcademicYear && hasTerms && gradesWithoutStreams.length === 0) {
      markSchoolOnboardingComplete(id);
      router.replace("/dashboard");
    }
  }, [
    yearsLoading,
    schoolConfig,
    hasAcademicYear,
    hasTerms,
    gradesWithoutStreams.length,
    router,
  ]);

  const setYearField = (
    field: "name" | "startDate" | "endDate",
    value: string,
  ) => {
    setAcademicYearForm((f) => ({ ...f, [field]: value }));
  };

  const applySuggestedYear = () => {
    const name = suggestAcademicYearName();
    const dates = suggestAcademicYearDates(name);
    setAcademicYearForm({ name, ...dates });
    toast.message("Suggested dates applied — adjust if needed");
  };

  const applyMoeYear = () => {
    const moe = getMoeAcademicYearPreset();
    if (!moe) {
      toast.error("MoE calendar data is unavailable");
      return;
    }
    setAcademicYearForm({
      name: moe.name,
      startDate: moe.startDate,
      endDate: moe.endDate,
    });
    toast.message(
      `Loaded ${moe.year} MoE calendar — you can still edit the dates`,
    );
  };

  const handleCreateAcademicYear = async (): Promise<boolean> => {
    if (
      !academicYearForm.name.trim() ||
      !academicYearForm.startDate ||
      !academicYearForm.endDate
    ) {
      toast.error("Enter a year name and start/end dates");
      return false;
    }
    if (
      new Date(academicYearForm.startDate) >= new Date(academicYearForm.endDate)
    ) {
      toast.error("End date must be after start date");
      return false;
    }

    setIsCreatingYear(true);
    try {
      const response = await fetch("/api/school/create-academic-year", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          input: {
            name: academicYearForm.name.trim(),
            startDate: academicYearForm.startDate,
            endDate: academicYearForm.endDate,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to create academic year");

      setCreatedAcademicYear({
        id: result.id,
        name: result.name,
        startDate: result.startDate,
        endDate: result.endDate,
        isActive: true,
        isCurrent: true,
        terms: [],
      });
      setTermDrafts([]);
      toast.success(`Academic year "${result.name}" created`);
      await refetchYears();
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create academic year",
      );
      return false;
    } finally {
      setIsCreatingYear(false);
    }
  };

  const applySuggestedTerms = () => {
    if (!activeAcademicYear) return;
    const start = activeAcademicYear.startDate.split("T")[0];
    const end = activeAcademicYear.endDate.split("T")[0];
    setTermDrafts(suggestTermsForYear(start, end, suggestedTermCount));
    toast.message(
      `Generated ${suggestedTermCount} terms — edit names or dates below`,
    );
  };

  const applyMoeTerms = () => {
    const presets = getMoeTermPresets();
    if (presets.length === 0) {
      toast.error("MoE term data is unavailable");
      return;
    }
    setTermDrafts(presets);
    toast.message("MoE term dates loaded — review before saving");
  };

  const handleAddCustomTerm = () => {
    if (
      !customTerm.name.trim() ||
      !customTerm.startDate ||
      !customTerm.endDate
    ) {
      toast.error("Enter term name, start date, and end date");
      return;
    }
    setTermDrafts((prev) => [
      ...prev,
      { ...customTerm, name: customTerm.name.trim() },
    ]);
    setCustomTerm((t) => ({ ...t, name: "", endDate: "" }));
    toast.success("Term added to list");
  };

  const handleCreateTermDrafts = async (): Promise<boolean> => {
    if (!activeAcademicYear) return false;

    // Only post terms that are not already stored. This makes the step safe to
    // retry after a partial save or a page reload — previously "Term 1" was
    // re-posted on every attempt, returned CONFLICT, and trapped the wizard on
    // step 2 with no way to reach the dashboard.
    const pending = pendingTermDrafts(termDrafts, termsForYear);
    if (pending.length === 0) {
      if (hasTerms) return true;
      toast.error("Add at least one term");
      return false;
    }

    setIsCreatingTerms(true);
    let created = 0;
    let alreadyPresent = 0;
    const persistedNames = new Set<string>();
    const errors: string[] = [];

    for (const draft of pending) {
      const name = draft.name.trim();
      try {
        const response = await fetch("/api/school/create-term", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            input: {
              name,
              startDate: draft.startDate,
              endDate: draft.endDate,
              academicYearId: activeAcademicYear.id,
              isActive: draft.active === true,
            },
          }),
        });
        const result = await response.json().catch(() => null);

        if (!response.ok) {
          // Another device/tab may have saved it first, or the local year data
          // may be stale. Both mean the term/period is already covered — that
          // is success for onboarding, not an error to retry forever.
          if (isDuplicateTermError(result) || isOverlappingTermError(result)) {
            alreadyPresent++;
            persistedNames.add(normalizeTermName(name));
            continue;
          }
          throw new Error(
            termErrorMessage(result, `Failed to create ${name}`),
          );
        }

        created++;
        persistedNames.add(normalizeTermName(name));
      } catch (err) {
        errors.push(
          err instanceof Error ? err.message : `Failed to create ${name}`,
        );
      }
    }

    if (persistedNames.size > 0) {
      if (created > 0) {
        toast.success(`Saved ${created} term${created === 1 ? "" : "s"}`);
      } else if (alreadyPresent > 0) {
        toast.message("Those terms are already set up — continuing");
      }
      // Drop only what is now persisted; leave failed drafts visible so dates
      // can be corrected instead of silently losing them.
      setTermDrafts((prev) =>
        prev.filter(
          (draft) => !persistedNames.has(normalizeTermName(draft.name)),
        ),
      );
      await refetchYears();
    }

    if (errors.length > 0) {
      toast.error(errors[0]);
    } else if (persistedNames.size === 0) {
      toast.error("No terms were created");
    }

    setIsCreatingTerms(false);

    // Advance when this attempt persisted something, the year already had
    // terms, or every draft was already covered on the server. Stay only when
    // nothing exists at all and every request failed.
    return persistedNames.size > 0 || hasTerms;
  };

  const handleCreateStreams = async (): Promise<boolean> => {
    const jobs: {
      gradeId: string;
      gradeName: string;
      name: string;
      capacity: string;
    }[] = [];

    for (const grade of gradeRows) {
      const plans = gradeStreamPlans[grade.gradeId] || [];
      const namesInGrade = new Set<string>();

      for (const draft of plans) {
        const name = draft.name.trim();
        const capacity = draft.capacity.trim();
        if (!name) continue;

        const key = name.toLowerCase();
        if (namesInGrade.has(key)) {
          toast.error(`Duplicate stream "${name}" on ${grade.gradeName}`);
          return false;
        }
        namesInGrade.add(key);

        if (grade.existingStreams.some((s) => s.toLowerCase() === key)) {
          continue;
        }

        if (!capacity || Number(capacity) < 1) {
          toast.error(
            `Capacity for "${name}" on ${grade.gradeName} must be at least 1`,
          );
          return false;
        }

        jobs.push({
          gradeId: grade.gradeId,
          gradeName: grade.gradeName,
          name,
          capacity,
        });
      }
    }

    if (jobs.length === 0) {
      return true;
    }

    setIsCreatingStreams(true);
    let created = 0;

    for (const job of jobs) {
      try {
        const response = await fetch("/api/school/create-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: job.name,
            capacity: job.capacity,
            gradeId: job.gradeId,
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed");
        created++;
      } catch (err) {
        console.warn(`${job.gradeName} / ${job.name}:`, err);
      }
    }

    setIsCreatingStreams(false);

    if (created > 0) {
      toast.success(`Created ${created} stream${created === 1 ? "" : "s"}`);
      await refetchConfig();
      return true;
    }

    toast.error("No streams were created. Check names and try again.");
    return false;
  };

  const finishOnboarding = useCallback(() => {
    const id =
      tenantId || schoolConfig?.tenant?.id || getTenantIdFromCookies();
    if (id) markSchoolOnboardingComplete(id);
    router.push("/dashboard");
  }, [router, tenantId, schoolConfig?.tenant?.id]);

  const goNext = () => {
    if (currentStep < 6) setCurrentStep((s) => s + 1);
    else finishOnboarding();
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleStreamsContinue = async () => {
    const planned = countPlannedStreamCreates(gradeRows, gradeStreamPlans);
    if (planned === 0) {
      goNext();
      return;
    }
    const ok = await handleCreateStreams();
    if (ok) goNext();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <AcademicYearStepContent
            hasAcademicYear={hasAcademicYear}
            activeYearLabel={activeAcademicYear?.name}
            activeYearRange={
              activeAcademicYear
                ? `${formatDisplayDate(activeAcademicYear.startDate)} – ${formatDisplayDate(activeAcademicYear.endDate)}`
                : undefined
            }
            form={academicYearForm}
            onFormChange={setYearField}
            onSuggestCurrentYear={applySuggestedYear}
            onSuggestMoe={applyMoeYear}
            suggestedYearLabel={suggestAcademicYearName()}
            moeYear={moeCalendarYear}
          />
        );

      case 2:
        return (
          <OnboardingStep
            icon={BookOpen}
            title="Terms"
            description="Split the year into teaching periods."
          >
            <TermsStepContent
              hasAcademicYear={hasAcademicYear}
              hasTerms={hasTerms}
              academicYearName={activeAcademicYear?.name}
              existingTermNames={termsForYear.map((t) => t.name).join(", ")}
              pendingTermCount={termsToSaveCount}
              termDrafts={termDrafts}
              onTermDraftsChange={setTermDrafts}
              termMode={termMode}
              onTermModeChange={setTermMode}
              suggestedTermCount={suggestedTermCount}
              onSuggestedTermCountChange={(n) => {
                setSuggestedTermCount(n);
                if (activeAcademicYear) {
                  const start = activeAcademicYear.startDate.split("T")[0];
                  const end = activeAcademicYear.endDate.split("T")[0];
                  setTermDrafts(suggestTermsForYear(start, end, n));
                }
              }}
              onApplySuggested={applySuggestedTerms}
              onApplyMoe={applyMoeTerms}
              moeYear={moeCalendarYear}
              customTerm={customTerm}
              onCustomTermChange={setCustomTerm}
              onAddCustomTerm={handleAddCustomTerm}
            />
          </OnboardingStep>
        );

      case 3:
        return (
          <OnboardingStep
            icon={GraduationCap}
            title="Create class streams"
            description="Streams are the sections inside a grade — e.g. Grade 4A and Grade 4B."
          >
            <StreamsStepContent
              gradeRows={gradeRows}
              gradeStreamPlans={gradeStreamPlans}
              onGradeStreamPlansChange={setGradeStreamPlans}
            />
          </OnboardingStep>
        );

      case 4:
        return (
          <OnboardingStep
            icon={Smartphone}
            title="How parents pay"
            description="Set your M-Pesa till and bank details so fee letters and Express STK are ready."
          >
            <PaymentsStepContent
              subdomain={subdomain}
              onConfigureMpesa={() => {
                setPaymentsRail("mpesa");
                setPaymentsDrawerOpen(true);
              }}
              onConfigureBank={() => {
                setPaymentsRail("bank");
                setPaymentsDrawerOpen(true);
              }}
            />
          </OnboardingStep>
        );

      case 5:
        return (
          <OnboardingStep
            icon={UserPlus}
            title="What to set up next"
            description="Optional — open any of these when you're ready. Everything is also in the sidebar."
          >
            <ul className="overflow-hidden rounded-xl border border-[#14201b]/10 bg-white/70">
              <ChecklistItem
                icon={Users}
                title="Teachers"
                description="Staff who teach or manage classes."
                href="/teachers"
              />
              <ChecklistItem
                icon={GraduationCap}
                title="Students"
                description="Enroll learners and assign streams."
                href="/students"
              />
              <ChecklistItem
                icon={Wallet}
                title="Fees"
                description="Fee structures for the active term."
                href="/fees?section=plans"
              />
              <ChecklistItem
                icon={CalendarDays}
                title="Timetable"
                description="Periods, breaks, and lessons."
                href="/timetable"
              />
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-[#7c857d]">
              Nothing here blocks your dashboard — set these up whenever you&apos;re ready.
            </p>
          </OnboardingStep>
        );

      case 6:
        return (
          <OnboardingStep
            icon={Rocket}
            title="You're all set"
            description="Your school is ready for day-to-day use. Here's what's in place."
          >
            <div className="rounded-xl border border-[#14201b]/10 bg-white/70 px-4">
              <SummaryRow done={hasAcademicYear} label="Academic year" />
              <SummaryRow done={hasTerms} label="Terms" />
              <SummaryRow
                done={hasAnyStream}
                label="Class streams"
                hint={
                  hasAnyStream ? undefined : "You can add these from Classes"
                }
              />
              <SummaryRow done label="Curriculum levels" />
              <SummaryRow
                done
                label="Payment methods"
                hint="Edit anytime from Dashboard → Till · paybill · bank"
              />
            </div>
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#a98a55]/30 bg-[#a98a55]/[0.08] p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#a98a55]/15 text-[#8a6c3d]">
                <Rocket className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <p className="text-[0.8125rem] leading-relaxed text-[#4d574f]">
                Your dashboard is where you manage daily operations. You can
                return to payment settings from the school snapshot anytime.
              </p>
            </div>
          </OnboardingStep>
        );

      default:
        return null;
    }
  };

  if (yearsLoading && currentStep === 1 && !hasAcademicYear) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#efeadd] dark:bg-[#071411]">
        <div className="relative">
          <div className="h-12 w-12 border-2 border-[#1c3d32]/20" />
          <Loader2 className="absolute inset-0 m-auto h-6 w-6 animate-spin text-[#1c3d32]" />
        </div>
        <p className="text-[11px] tracking-[0.14em] text-[#1c3d32]/60 uppercase font-semibold">
          Loading your school…
        </p>
      </div>
    );
  }

  const plannedStreamCreates = countPlannedStreamCreates(
    gradeRows,
    gradeStreamPlans,
  );

  const skipLabel =
    currentStep === 3 && plannedStreamCreates > 0
      ? "Skip streams for now"
      : "Skip this step";

  // Only optional steps get an escape hatch. The footer keeps a single
  // primary CTA; skipping is a quiet secondary link in the step header.
  const canSkipStep =
    currentStep === 3 || currentStep === 4 || currentStep === 5;

  // Terms already stored for this year are excluded from the save count, so an
  // already-configured school sees "Continue" instead of "Save 3 terms" and a
  // fresh attempt never re-posts "Term 1".
  const termsToSave = pendingTermDrafts(termDrafts, termsForYear);
  const termsToSaveCount = termsToSave.length;

  const yearFormValid =
    Boolean(academicYearForm.name.trim()) &&
    Boolean(academicYearForm.startDate) &&
    Boolean(academicYearForm.endDate) &&
    new Date(academicYearForm.startDate) <
      new Date(academicYearForm.endDate);

  const continueDisabled =
    (currentStep === 1 &&
      !hasAcademicYear &&
      (!yearFormValid || isCreatingYear)) ||
    (currentStep === 2 && !hasTerms && termsToSaveCount === 0) ||
    (currentStep === 2 && isCreatingTerms);

  const continueLabel =
    currentStep === 1 && !hasAcademicYear
      ? isCreatingYear
        ? "Creating year…"
        : "Create academic year"
      : currentStep === 6
        ? "Open dashboard"
        : currentStep === 2 && termsToSaveCount > 0
          ? `Save ${termsToSaveCount} term${termsToSaveCount === 1 ? "" : "s"} & continue`
          : currentStep === 3 && plannedStreamCreates > 0
            ? `Save ${plannedStreamCreates} & continue`
            : "Continue";

  const handleContinue = async () => {
    if (currentStep === 1) {
      if (!hasAcademicYear) {
        const ok = await handleCreateAcademicYear();
        if (ok) goNext();
        return;
      }
      goNext();
      return;
    }
    if (currentStep === 6) {
      finishOnboarding();
      return;
    }
    if (currentStep === 3) {
      void handleStreamsContinue();
      return;
    }
    if (currentStep === 2) {
      if (termsToSaveCount === 0) {
        goNext();
        return;
      }
      const ok = await handleCreateTermDrafts();
      if (ok) goNext();
      return;
    }
    goNext();
  };

  return (
    <>
      <OnboardingShell
        subdomain={subdomain}
        currentStep={currentStep}
        totalSteps={6}
        steps={ONBOARDING_STEPS}
        onBack={goBack}
        onSkip={canSkipStep ? goNext : undefined}
        skipLabel={skipLabel}
        showSkip={canSkipStep}
        onContinue={handleContinue}
        continueLabel={continueLabel}
        isContinueDisabled={continueDisabled}
        isLoading={
          (currentStep === 1 && isCreatingYear) ||
          (currentStep === 2 && isCreatingTerms) ||
          (currentStep === 3 && isCreatingStreams)
        }
      >
        {renderStepContent()}
      </OnboardingShell>

      <OwnerPaymentsDrawer
        open={paymentsDrawerOpen}
        onOpenChange={setPaymentsDrawerOpen}
        defaultRail={paymentsRail}
        allowDuringOnboarding
      />
    </>
  );
}

function SummaryRow({
  done,
  label,
  hint,
}: {
  done: boolean;
  label: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-[#14201b]/10 py-3.5 last:border-b-0">
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          done
            ? "border-[#1c3d32] bg-[#1c3d32] text-[#f7f4ec]"
            : "border-[#14201b]/20 bg-transparent text-transparent",
        )}
      >
        <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
      </span>
      <span className="min-w-0">
        <span
          className={
            done
              ? "text-sm font-medium text-[#14201b]"
              : "text-sm text-[#7c857d]"
          }
        >
          {label}
        </span>
        {hint && (
          <span className="mt-0.5 block text-xs leading-relaxed text-[#7c857d]">
            {hint}
          </span>
        )}
      </span>
    </div>
  );
}

function ChecklistItem({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  href: string;
}) {
  const router = useRouter();
  return (
    <li className="border-b border-[#14201b]/10 last:border-b-0">
      <button
        type="button"
        onClick={() => router.push(href)}
        className="group flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-[#1c3d32]/[0.04] focus-visible:bg-[#1c3d32]/[0.06] focus-visible:outline-none"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#1c3d32]/12 bg-[#1c3d32]/[0.05] text-[#1c3d32]">
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-[#14201b]">
            {title}
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-[#4d574f]">
            {description}
          </span>
        </span>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-[#7c857d] transition-transform group-hover:translate-x-0.5 group-hover:text-[#1c3d32]"
          aria-hidden
        />
      </button>
    </li>
  );
}
