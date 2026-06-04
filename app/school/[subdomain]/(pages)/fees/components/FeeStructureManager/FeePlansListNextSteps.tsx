"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Link2 } from "lucide-react";
import { FEES_BRAND } from "../../lib/fees-ui";
import { feesOverviewHref, feesSectionHref } from "../../lib/feesRoutes";

interface FeePlansListNextStepsProps {
  planCount: number;
  hasUnbilledPlans: boolean;
  hasDuplicateLinks?: boolean;
}

/** Secondary CTA only — duplicate-link warnings live in FeePlansListAlerts. */
export function FeePlansListNextSteps({
  planCount,
  hasUnbilledPlans,
  hasDuplicateLinks = false,
}: FeePlansListNextStepsProps) {
  if (hasDuplicateLinks || planCount > 6) return null;
  if (!hasUnbilledPlans && planCount > 4) return null;

  const headline = hasUnbilledPlans
    ? "Ready to bill linked classes"
    : "Fee structures look good";

  const body = hasUnbilledPlans
    ? "Generate term invoices on Overview when you are ready to charge students."
    : "Review class links or deactivate structures you no longer use.";

  return (
    <div
      className="min-w-0 max-w-full rounded-lg border border-emerald-200/60 bg-emerald-50/40 px-3 py-3 sm:flex sm:items-center sm:justify-between sm:gap-4"
    >
      <div className="min-w-0 text-center sm:text-left">
        <p className="text-sm font-medium text-slate-900">{headline}</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">{body}</p>
      </div>
      {hasUnbilledPlans ? (
        <Button
          asChild
          size="sm"
          className="mt-3 h-8 w-full gap-1.5 text-white shadow-sm sm:mt-0 sm:w-auto"
          style={{ backgroundColor: FEES_BRAND.primary }}
        >
          <Link href={feesOverviewHref()} scroll={false}>
            <LayoutDashboard className="h-3.5 w-3.5" />
            Bill on Overview
          </Link>
        </Button>
      ) : (
        <Button
          asChild
          size="sm"
          variant="outline"
          className="mt-3 h-8 w-full gap-1.5 border-slate-200/90 bg-white/90 sm:mt-0 sm:w-auto"
        >
          <Link href={feesSectionHref("assignments")} scroll={false}>
            <Link2 className="h-3.5 w-3.5" />
            Review Linked
          </Link>
        </Button>
      )}
    </div>
  );
}
