"use client";

import {
  CheckCircle,
  Edit3,
  HardDrive,
  MoreHorizontal,
  School,
  Users,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  formatPlanLimit,
  formatPlanPrice,
  PLAN_FEATURES,
  PLAN_LIMIT_LABELS,
  type PlanRecord,
} from "@/lib/superadmin/plans";

interface PlanCardProps {
  plan: PlanRecord;
  onEdit: (plan: PlanRecord) => void;
}

export function PlanCard({ plan, onEdit }: PlanCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-slate-900/80",
        plan.isDefault
          ? "border-primary ring-2 ring-primary/20"
          : "border-slate-200/60 dark:border-slate-800/60",
        !plan.isActive && "opacity-80",
      )}
    >
      <div className="absolute right-4 top-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Plan actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(plan)}>
              Edit plan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {plan.isDefault ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary px-3 text-[10px] uppercase text-primary-foreground">
            Default
          </Badge>
        </div>
      ) : null}

      {!plan.isActive ? (
        <div className="absolute -top-3 right-4">
          <Badge variant="secondary" className="text-[10px] uppercase">
            Inactive
          </Badge>
        </div>
      ) : null}

      <div className="mb-6 mt-2 text-center">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {plan.name}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {plan.description || "No description provided"}
        </p>
        <div className="mt-4">
          <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">
            {formatPlanPrice(Number(plan.monthlyPrice))}
          </span>
          {Number(plan.monthlyPrice) > 0 ? (
            <span className="ml-1 text-sm text-slate-500">/mo</span>
          ) : null}
        </div>
        {plan.yearlyPrice && Number(plan.yearlyPrice) > 0 ? (
          <p className="mt-1 text-xs text-slate-400">
            {formatPlanPrice(Number(plan.yearlyPrice))}/year
          </p>
        ) : null}
      </div>

      <div className="mb-6 flex justify-center gap-4 text-xs text-slate-500">
        <span>{plan.trialDays} day trial</span>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span>{plan.graceDays} day grace</span>
      </div>

      <div className="mb-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Features
        </p>
        {PLAN_FEATURES.map((feature) => (
          <div
            key={feature.key}
            className="flex items-center justify-between"
          >
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {feature.label}
            </span>
            {plan.features?.[feature.key] ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-slate-300 dark:text-slate-600" />
            )}
          </div>
        ))}
      </div>

      <div className="mb-6 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Limits
        </p>
        {Object.entries(plan.limits ?? {}).map(([key, value]) => (
          <div
            key={key}
            className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
          >
            {key === "maxStudents" ? (
              <Users className="h-4 w-4 text-slate-400" />
            ) : null}
            {key === "maxTeachers" ? (
              <School className="h-4 w-4 text-slate-400" />
            ) : null}
            {key === "maxStorage" ? (
              <HardDrive className="h-4 w-4 text-slate-400" />
            ) : null}
            <span>
              {formatPlanLimit(Number(value), PLAN_LIMIT_LABELS[key] || key)}
            </span>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        className="w-full"
        size="sm"
        onClick={() => onEdit(plan)}
      >
        <Edit3 className="mr-2 h-4 w-4" />
        Edit plan
      </Button>
    </div>
  );
}
