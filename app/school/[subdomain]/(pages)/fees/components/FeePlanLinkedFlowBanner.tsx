"use client";

import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEES_BRAND } from "../lib/fees-ui";
import type { FeePlanSetupIntent } from "../lib/feePlanCreationFlow";

type BannerPhase = "setup" | "setup-revise" | "plan";

interface FeePlanLinkedFlowBannerProps {
  phase: BannerPhase;
  setupIntent?: FeePlanSetupIntent;
  summary?: {
    yearName: string;
    categoryCount: number;
    gradeCount: number;
    termCount: number;
  } | null;
  className?: string;
}

export function FeePlanLinkedFlowBanner({
  phase,
  setupIntent = "initial",
  summary,
  className,
}: FeePlanLinkedFlowBannerProps) {
  const setupDone = phase === "plan";
  const onSetup = phase === "setup" || phase === "setup-revise";

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
        <span>Create fee structure</span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-700">
          {onSetup
            ? setupIntent === "revise"
              ? "Update configuration"
              : "Step 1 · Configure"
            : "Step 2 · Publish"}
        </span>
      </div>

      <ol className="mt-2.5 flex items-center gap-1">
        <li
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2.5 py-2",
            onSetup && "bg-emerald-50 ring-1 ring-emerald-100",
            setupDone && "opacity-90",
          )}
        >
          <span
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
              setupDone
                ? "bg-emerald-600 text-white"
                : "text-white",
            )}
            style={
              !setupDone ? { backgroundColor: FEES_BRAND.primary } : undefined
            }
          >
            {setupDone ? <Check className="h-3.5 w-3.5" /> : "1"}
          </span>
          <span className="min-w-0 truncate text-xs font-medium text-slate-800">
            Guided setup
          </span>
        </li>

        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" aria-hidden />

        <li
          className={cn(
            "flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2.5 py-2",
            setupDone && "bg-emerald-50 ring-1 ring-emerald-100",
            onSetup && "opacity-60",
          )}
        >
          <span
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
              setupDone
                ? "text-white"
                : "bg-slate-100 text-slate-500",
            )}
            style={
              setupDone ? { backgroundColor: FEES_BRAND.primary } : undefined
            }
          >
            2
          </span>
          <span className="min-w-0 truncate text-xs font-medium text-slate-800">
            Fee structure & letter
          </span>
        </li>
      </ol>

      {onSetup && setupIntent === "initial" ? (
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          Set year, categories, splits, and amounts per grade. You&apos;ll
          continue to name the structure, review amounts, and publish the fee letter.
        </p>
      ) : null}

      {onSetup && setupIntent === "revise" ? (
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          Changes apply to your in-progress fee structure when you continue.
        </p>
      ) : null}

      {setupDone && summary ? (
        <p className="mt-2 text-xs text-slate-600">
          From setup:{" "}
          <span className="font-medium text-slate-800">{summary.yearName}</span>
          {" · "}
          {summary.categoryCount} categories · {summary.gradeCount} grades ·{" "}
          {summary.termCount} terms
        </p>
      ) : null}
    </div>
  );
}
