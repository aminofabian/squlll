"use client";

import { ArrowRight, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUTO_BUILD_COPY } from "../utils/autoBuildCopy";
import type { AutoBuildOffer } from "../utils/getAutoBuildOffer";
import { tt } from "../utils/timetableTheme";

type TimetableAutoBuildBannerProps = {
  offer: Exclude<AutoBuildOffer, null>;
  filledSlots: number;
  totalSlots: number;
  onBuild: () => void;
  onBuildByHand: () => void;
  onDismiss: () => void;
};

const copy = AUTO_BUILD_COPY.banner;

export function TimetableAutoBuildBanner({
  offer,
  filledSlots,
  totalSlots,
  onBuild,
  onBuildByHand,
  onDismiss,
}: TimetableAutoBuildBannerProps) {
  const isStart = offer === "start";

  return (
    <section
      aria-label={isStart ? copy.startTitle : copy.finishTitle}
      className="relative overflow-hidden rounded-2xl border border-[#246a59]/30 bg-gradient-to-r from-[#0a1f1a] via-[#123a31] to-[#246a59] text-white shadow-[0_14px_38px_-24px_rgba(10,31,26,0.6)]"
    >
      <Sparkles
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 text-white/[0.06]"
        strokeWidth={1}
      />
      <div className="relative flex flex-col gap-3.5 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-5 sm:px-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
          <Sparkles className="h-5 w-5 text-amber-200" strokeWidth={1.75} />
        </span>

        <div className="min-w-0 flex-1 pr-6 sm:pr-0">
          <p className={cn(tt.text.micro, "font-semibold uppercase tracking-[0.14em] text-amber-200")}>
            {isStart ? copy.startEyebrow : copy.finishEyebrow}
          </p>
          <h2 className={cn(tt.text.title, "mt-0.5 font-semibold tracking-[-0.02em]")}>
            {isStart ? copy.startTitle : copy.finishTitle}
          </h2>
          <p className={cn(tt.text.small, "mt-1 max-w-2xl leading-relaxed text-white/75")}>
            {isStart ? copy.startBody : copy.finishBody(filledSlots, totalSlots)}
          </p>
          <BannerSteps />
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onBuild}
            className={cn(
              tt.text.small,
              tt.focus,
              "group inline-flex h-9 items-center gap-2 rounded-lg bg-white px-4 font-semibold text-[#0a1f1a] shadow-sm transition hover:bg-amber-50",
            )}
          >
            <Sparkles className="h-4 w-4 text-[#246a59]" />
            {isStart ? copy.startAction : copy.finishAction}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </button>
          {isStart ? (
            <button
              type="button"
              onClick={onBuildByHand}
              className={cn(tt.text.small, tt.focus, "font-medium text-white/70 underline-offset-4 hover:text-white hover:underline")}
            >
              {copy.manualAction}
            </button>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label={copy.dismissLabel}
        className={cn(tt.focus, "absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white")}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </section>
  );
}

function BannerSteps() {
  return (
    <ol className="mt-3 flex flex-wrap items-center gap-1.5">
      {copy.steps.map((step, index) => (
        <li
          key={step}
          className={cn(tt.text.caption, "inline-flex items-center gap-1.5 bg-white/10 px-2 py-0.5 text-white/85")}
        >
          <span className={cn(tt.numeral, "font-semibold text-amber-200")}>{index + 1}</span>
          {step}
        </li>
      ))}
    </ol>
  );
}
