"use client";

import { CheckCircle2, Circle, Sparkles, Target, Zap, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEES_BRAND } from "../lib/fees-ui";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon?: React.ReactNode;
}

interface WorkflowGuidanceProps {
  currentStep?: number;
  onStepClick?: (step: number) => void;
  completedSteps?: number[];
}

const defaultSteps: WorkflowStep[] = [
  {
    id: "1",
    title: "Fee structure",
    description: "Charges per class & term",
    completed: false,
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    id: "2",
    title: "Assign classes",
    description: "Link structure to grades",
    completed: false,
    icon: <Target className="h-4 w-4" />,
  },
  {
    id: "3",
    title: "Bill students",
    description: "Term invoices",
    completed: false,
    icon: <Zap className="h-4 w-4" />,
  },
  {
    id: "4",
    title: "Collect fees",
    description: "Record payments",
    completed: false,
    icon: <Receipt className="h-4 w-4" />,
  },
];

export const WorkflowGuidance = ({
  currentStep = 0,
  onStepClick,
  completedSteps = [],
}: WorkflowGuidanceProps) => {
  const steps = defaultSteps.map((step, index) => ({
    ...step,
    completed: completedSteps.includes(index) || index < currentStep,
    current: index === currentStep,
  }));

  const done = completedSteps.length;
  const pct = (done / steps.length) * 100;

  return (
    <div className="h-full rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Getting started</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {done === steps.length
              ? "You're ready to run term billing"
              : `${done} of ${steps.length} complete`}
          </p>
        </div>
        <span className="text-xs font-bold tabular-nums text-emerald-700">
          {Math.round(pct)}%
        </span>
      </div>

      <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: FEES_BRAND.primary,
          }}
        />
      </div>

      <ol className="space-y-1">
        {steps.map((step, index) => {
          const clickable = !step.completed && !!onStepClick;
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => clickable && onStepClick?.(index)}
                disabled={!clickable}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors",
                  clickable && "hover:bg-slate-50 cursor-pointer",
                  !clickable && "cursor-default",
                  step.current && "bg-emerald-50/80",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                    step.completed &&
                      "bg-emerald-100 text-emerald-700",
                    step.current &&
                      !step.completed &&
                      "text-white",
                    !step.completed &&
                      !step.current &&
                      "bg-slate-100 text-slate-400",
                  )}
                  style={
                    step.current && !step.completed
                      ? { backgroundColor: FEES_BRAND.primary }
                      : undefined
                  }
                >
                  {step.completed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium leading-tight",
                      step.completed
                        ? "text-slate-400 line-through decoration-slate-300"
                        : "text-slate-800",
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-500">{step.description}</p>
                </div>
                {step.icon && (
                  <span className="hidden text-slate-300 sm:block">
                    {step.icon}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
