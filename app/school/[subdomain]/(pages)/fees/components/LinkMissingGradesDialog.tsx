"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, GraduationCap, Link2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AcademicYearPlanGroup } from "../lib/feePlanYearLinkage";
import type { ProcessedFeeStructure } from "./FeeStructureManager/types";
import { feePlanTermProgress, feePlanYearTotalKes } from "../lib/feePlanSlug";
import { KesAmount } from "./KesAmount";

interface LinkMissingGradesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: AcademicYearPlanGroup | null;
  onSelectPlan: (plan: ProcessedFeeStructure) => void;
  onCreateNew?: () => void;
}

/**
 * Year-level batch entry point. The user picks one plan for the grades that
 * are not linked anywhere yet; the normal link drawer then opens with those
 * grades preselected so they can still review the impact before submitting.
 */
export function LinkMissingGradesDialog({
  open,
  onOpenChange,
  group,
  onSelectPlan,
  onCreateNew,
}: LinkMissingGradesDialogProps) {
  const activePlans = useMemo(
    () => (group?.plans ?? []).filter((plan) => plan.isActive),
    [group],
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Fall back to the first plan without an effect, so opening a different
  // year (or a year with no plans) never leaves a stale selection.
  const effectivePlanId = activePlans.some(
    (plan) => plan.structureId === selectedPlanId,
  )
    ? selectedPlanId
    : (activePlans[0]?.structureId ?? null);

  const selectedPlan = activePlans.find(
    (plan) => plan.structureId === effectivePlanId,
  );
  const missingGrades = group?.unlinkedGrades ?? [];

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f2ef] text-[#1a4d42]">
              <Link2 className="h-4 w-4" />
            </span>
            Link {missingGrades.length} missing grade
            {missingGrades.length === 1 ? "" : "s"}
          </DialogTitle>
          <DialogDescription className="text-xs leading-relaxed text-slate-600">
            {group.yearLabel} · {missingGrades.map((grade) => grade.name).join(", ")}.
            Pick the plan these grades should receive. You’ll review the
            student count and fee before anything is linked.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {missingGrades.map((grade) => (
              <span
                key={grade.id}
                className="inline-flex items-center gap-1 rounded-md border border-amber-200/90 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-950"
              >
                <GraduationCap className="h-3 w-3" />
                {grade.name}
              </span>
            ))}
          </div>

          {activePlans.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center">
              <p className="text-sm font-medium text-slate-800">
                No active fee plan in {group.yearLabel}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Create a plan first, then come back to link these grades.
              </p>
              {onCreateNew ? (
                <Button
                  type="button"
                  size="sm"
                  className="mt-3 gap-1.5"
                  onClick={onCreateNew}
                >
                  <Plus className="h-3.5 w-3.5" />
                  New fee plan
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Choose a plan
                </span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="space-y-2" role="radiogroup" aria-label="Plan for missing grades">
                {activePlans.map((plan) => {
                  const isSelected = plan.structureId === effectivePlanId;
                  const termProgress = feePlanTermProgress(plan);
                  return (
                    <button
                      key={plan.structureId}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedPlanId(plan.structureId)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                        isSelected
                          ? "border-primary/45 bg-primary/[0.04] ring-1 ring-primary/15"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                          isSelected
                            ? "border-primary bg-primary text-white"
                            : "border-slate-300 bg-white",
                        )}
                      >
                        {isSelected ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-900">
                          {plan.structureName}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-slate-500">
                          {termProgress.total > 0
                            ? `${termProgress.configured}/${termProgress.total} terms priced`
                            : "No terms priced"}
                          {plan.gradeLevels?.length
                            ? ` · ${plan.gradeLevels.length} grade${plan.gradeLevels.length === 1 ? "" : "s"} configured`
                            : ""}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-sm font-semibold tabular-nums text-slate-900">
                          <KesAmount amount={feePlanYearTotalKes(plan)} size="sm" />
                        </span>
                        <span className="block text-[10px] text-slate-500">/ year</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="rounded-lg border border-[#1a4d42]/10 bg-[#f8fbfa] px-3 py-2 text-[11px] leading-relaxed text-[#1a4d42]/70">
                All {missingGrades.length} grade
                {missingGrades.length === 1 ? "" : "s"} get the same plan.
                To use different plans, link each grade from its plan row
                instead. Existing grade links stay unchanged.
              </p>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 gap-1.5"
            disabled={!selectedPlan}
            onClick={() => selectedPlan && onSelectPlan(selectedPlan)}
          >
            <Link2 className="h-3.5 w-3.5" />
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
