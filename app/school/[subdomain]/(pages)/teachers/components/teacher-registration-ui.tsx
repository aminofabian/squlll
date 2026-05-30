"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const fieldInputClass =
  "h-10 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus-visible:ring-primary/30";

export const fieldSelectClass =
  "h-10 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-primary/30";

export function RequiredMark() {
  return <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>;
}

export function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{children}</p>
  );
}

export function FormSection({
  icon: Icon,
  title,
  description,
  step,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  step: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden",
        className,
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3.5 sm:px-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/80">
              Step {step}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function SelectionChip({
  label,
  sublabel,
  selected,
  onToggle,
  id,
}: {
  id: string;
  label: string;
  sublabel?: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      id={id}
      onClick={onToggle}
      className={cn(
        "flex flex-col items-start rounded-lg border px-3 py-2.5 text-left transition-all",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : "border-slate-200 dark:border-slate-700 hover:border-primary/40 hover:bg-slate-50 dark:hover:bg-slate-900",
      )}
    >
      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{label}</span>
      {sublabel && (
        <span className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</span>
      )}
    </button>
  );
}

export function EmptyDataNotice({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
      {message}
    </div>
  );
}

export type WizardStep = {
  id: string;
  label: string;
};

export function FormWizardStepper({
  steps,
  currentStep,
}: {
  steps: WizardStep[];
  currentStep: number;
}) {
  return (
    <nav aria-label="Form progress" className="mb-6">
      <ol className="flex items-center gap-1">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isDone = index < currentStep;
          return (
            <li key={step.id} className="flex flex-1 items-center min-w-0">
              <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    isDone
                      ? "bg-primary text-white"
                      : isActive
                        ? "bg-primary text-white ring-4 ring-primary/15"
                        : "bg-slate-200 dark:bg-slate-800 text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium truncate w-full text-center",
                    isActive
                      ? "text-slate-900 dark:text-slate-100"
                      : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-1 mb-5 rounded-full",
                    index < currentStep ? "bg-primary/40" : "bg-slate-200 dark:bg-slate-800",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export type TeachingPanel = "grades" | "subjects" | "extras";

export function TeachingPanelNav({
  panel,
  hasStreams,
}: {
  panel: TeachingPanel;
  hasStreams: boolean;
}) {
  const items: { id: TeachingPanel; label: string }[] = [
    { id: "grades", label: "Grades" },
    { id: "subjects", label: "Subjects" },
    { id: "extras", label: "Optional" },
  ];

  const currentIndex = items.findIndex((i) => i.id === panel);

  return (
    <div className="mb-5 flex items-center gap-2 text-xs text-muted-foreground">
      {items.map((item, index) => {
        const isActive = item.id === panel;
        const isPast = index < currentIndex;
        return (
          <React.Fragment key={item.id}>
            {index > 0 && <span className="opacity-40">/</span>}
            <span
              className={cn(
                "font-medium",
                isActive && "text-primary",
                isPast && "text-slate-600 dark:text-slate-400",
              )}
            >
              {item.label}
            </span>
          </React.Fragment>
        );
      })}
      {panel === "extras" && hasStreams && (
        <span className="ml-auto text-[11px]">streams & class teacher</span>
      )}
    </div>
  );
}

export function WizardStepHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
}
