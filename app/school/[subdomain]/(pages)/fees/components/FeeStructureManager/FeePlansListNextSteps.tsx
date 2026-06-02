"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Plus } from "lucide-react";
import { FEES_BRAND } from "../../lib/fees-ui";
import { feesOverviewHref } from "../../lib/feesRoutes";

interface FeePlansListNextStepsProps {
  planCount: number;
  hasUnbilledPlans: boolean;
  onCreateNew: () => void;
  canCreate: boolean;
}

export function FeePlansListNextSteps({
  planCount,
  hasUnbilledPlans,
  onCreateNew,
  canCreate,
}: FeePlansListNextStepsProps) {
  if (planCount > 4) return null;

  const headline = hasUnbilledPlans
    ? "You're all set — ready to bill your students?"
    : "Keep your fee plans up to date";

  const body = hasUnbilledPlans
    ? "Your plans are configured. Open Overview to bill students and record payments."
    : planCount <= 2
      ? "Add a plan for another academic year, or open a plan to link more classes."
      : "Archive or deactivate old plans you no longer use, and link any classes still missing.";

  return (
    <div
      className="rounded-xl border px-4 py-5 text-center sm:text-left"
      style={{
        borderColor: "rgba(36, 106, 89, 0.28)",
        background: `linear-gradient(135deg, #f0f9f4 0%, ${FEES_BRAND.primaryLight} 48%, #ffffff 100%)`,
        boxShadow: "0 1px 2px rgba(36, 106, 89, 0.08)",
      }}
    >
      <p className="text-sm font-medium text-slate-900">{headline}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">{body}</p>
      <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row sm:justify-start">
        {hasUnbilledPlans ? (
          <Button
            asChild
            size="sm"
            className="h-8 gap-1.5 text-white shadow-sm"
            style={{ backgroundColor: FEES_BRAND.primary }}
          >
            <Link href={feesOverviewHref()} scroll={false}>
              <LayoutDashboard className="h-3.5 w-3.5" />
              Bill on Overview
            </Link>
          </Button>
        ) : null}
        {canCreate ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 border-slate-200/90 bg-white/80"
            onClick={onCreateNew}
          >
            <Plus className="h-3.5 w-3.5" />
            New fee plan
          </Button>
        ) : null}
      </div>
    </div>
  );
}
