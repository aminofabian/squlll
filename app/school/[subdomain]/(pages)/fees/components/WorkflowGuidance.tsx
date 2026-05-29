"use client";

import { CheckCircle2, Circle, Sparkles, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

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
    title: "Create a fee plan",
    description: "Set charges per class and term",
    completed: false,
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    id: "2",
    title: "Apply to classes",
    description: "Link the plan to grades",
    completed: false,
    icon: <Target className="h-4 w-4" />,
  },
  {
    id: "3",
    title: "Bill students",
    description: "Create invoices for a term",
    completed: false,
    icon: <Zap className="h-4 w-4" />,
  },
  {
    id: "4",
    title: "Record payments",
    description: "Track money received",
    completed: false,
    icon: <CheckCircle2 className="h-4 w-4" />,
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

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Progress bar */}
      <div className="h-1 w-full bg-slate-100">
        <div
          className="h-full bg-slate-800 transition-all duration-500 ease-out"
          style={{ width: `${(done / steps.length) * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between px-5 py-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-slate-900">
            Setup guide
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {done === 0
              ? "Follow these steps to get started"
              : done === steps.length
                ? "All done — you're ready to collect fees"
                : `${done} of ${steps.length} steps complete`}
          </p>
        </div>
        <span className="text-xs font-medium tabular-nums text-slate-400">
          {done}/{steps.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-px bg-slate-100 px-5 pb-5 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => !step.completed && onStepClick?.(index)}
            disabled={step.completed || !onStepClick}
            className={cn(
              "flex items-start gap-3 rounded-lg p-3 text-left transition-colors",
              step.completed && "bg-transparent",
              !step.completed &&
                onStepClick &&
                "cursor-pointer hover:bg-slate-50",
              !step.completed && !onStepClick && "cursor-default",
            )}
          >
            <div
              className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                step.completed && "bg-emerald-100 text-emerald-600",
                step.current && "bg-slate-800 text-white",
                !step.completed &&
                  !step.current &&
                  "bg-slate-100 text-slate-400",
              )}
            >
              {step.completed ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <span className="text-xs font-bold tabular-nums">
                  {index + 1}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-sm font-medium leading-tight",
                  step.completed
                    ? "text-slate-400 line-through"
                    : step.current
                      ? "text-slate-900"
                      : "text-slate-600",
                )}
              >
                {step.title}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                {step.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
