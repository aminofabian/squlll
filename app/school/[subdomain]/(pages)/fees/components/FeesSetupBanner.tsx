"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Sparkles,
  X,
} from "lucide-react";
import { FEES_BRAND } from "../lib/fees-ui";

const STEPS = [
  { key: "plan", label: "Create fee plan", hint: "Amounts per term & category" },
  { key: "link", label: "Link to classes", hint: "Which grades use this plan" },
  { key: "bill", label: "Send invoices", hint: "Bill students for the term" },
] as const;

interface FeesSetupBannerProps {
  plansReady: boolean;
  classesLinked: boolean;
  billingStarted: boolean;
  planCount?: number;
  onGuidedSetup: () => void;
  onStepClick?: (step: number) => void;
  onDismiss?: () => void;
  className?: string;
}

export function FeesSetupBanner({
  plansReady,
  classesLinked,
  billingStarted,
  planCount = 0,
  onGuidedSetup,
  onStepClick,
  onDismiss,
  className,
}: FeesSetupBannerProps) {
  const flags = [plansReady, classesLinked, billingStarted];
  const doneCount = flags.filter(Boolean).length;
  if (doneCount >= 3) return null;

  const nextStep = flags.findIndex((f) => !f);

  return (
    <section
      className={cn(
        "relative mb-5 overflow-hidden rounded-2xl border-2 shadow-md",
        className,
      )}
      style={{
        borderColor: `${FEES_BRAND.primary}55`,
        background: `linear-gradient(135deg, ${FEES_BRAND.primaryDark} 0%, ${FEES_BRAND.primary} 55%, #2d7a68 100%)`,
      }}
      aria-label="Fees setup guidance"
    >
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
          aria-label="Dismiss setup banner"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 pr-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100/90">
            Getting started · {doneCount} of 3 complete
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
            Finish fees setup before daily collections
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-emerald-50/95">
            {plansReady
              ? classesLinked
                ? "Your plans are linked — send term invoices so balances and collection % reflect real data."
                : `You have ${planCount} plan${planCount === 1 ? "" : "s"} — link each plan to the classes it applies to.`
              : "Start with a guided setup: academic year, categories, and amounts per grade."}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button
            size="lg"
            className="h-11 bg-white font-semibold text-emerald-900 shadow-lg hover:bg-emerald-50"
            onClick={onGuidedSetup}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Guided setup
          </Button>
          {nextStep >= 0 && onStepClick && (
            <Button
              size="lg"
              variant="outline"
              className="h-11 border-white/40 bg-white/10 font-semibold text-white hover:bg-white/20"
              onClick={() => onStepClick(nextStep)}
            >
              Continue step {nextStep + 1}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-px border-t border-white/15 bg-black/10 sm:grid-cols-3">
        {STEPS.map((step, index) => {
          const done = flags[index];
          const isNext = index === nextStep;
          return (
            <button
              key={step.key}
              type="button"
              disabled={!onStepClick}
              onClick={() => onStepClick?.(index)}
              className={cn(
                "flex flex-col gap-0.5 px-4 py-3 text-left transition-colors",
                onStepClick && "hover:bg-white/5 cursor-pointer",
                !onStepClick && "cursor-default",
                isNext && "bg-white/10",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-white">
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                ) : (
                  <Circle
                    className={cn(
                      "h-4 w-4",
                      isNext ? "text-white" : "text-white/40",
                    )}
                  />
                )}
                {step.label}
              </span>
              <span className="text-xs text-emerald-100/80">{step.hint}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
