"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FEES_LAYOUT } from "../lib/fees-ui";
import { feesBalancesHref } from "../lib/feesRoutes";

interface FeeAssignmentsGradeChipsProps {
  names: string[];
  maxVisible?: number;
  linkToBalances?: boolean;
  className?: string;
}

export function FeeAssignmentsGradeChips({
  names,
  maxVisible = 3,
  linkToBalances = true,
  className,
}: FeeAssignmentsGradeChipsProps) {
  const [expanded, setExpanded] = useState(false);

  if (names.length === 0) {
    return (
      <span className="text-xs text-slate-400" title="No classes linked">
        None
      </span>
    );
  }

  const showAll = expanded || names.length <= maxVisible;
  const visible = showAll ? names : names.slice(0, maxVisible);
  const hidden = names.length - visible.length;

  return (
    <div className={cn("min-w-0", className)}>
      <ul
        className={cn(FEES_LAYOUT.chipStrip, "gap-1")}
        role="list"
        aria-label={`${names.length} linked class${names.length === 1 ? "" : "es"}`}
      >
        {visible.map((name) => (
          <li key={name} className="min-w-0 max-w-full shrink-0">
            {linkToBalances ? (
              <Link
                href={feesBalancesHref(name)}
                scroll={false}
                className={chipClass(false)}
                title={`Balances for ${name}`}
              >
                {name}
              </Link>
            ) : (
              <span className={chipClass(true)}>{name}</span>
            )}
          </li>
        ))}
        {!showAll && hidden > 0 ? (
          <li className="shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(true);
              }}
              className={cn(
                chipClass(true),
                "cursor-pointer hover:border-slate-300 hover:bg-slate-100",
              )}
            >
              +{hidden} more
            </button>
          </li>
        ) : null}
        {showAll && names.length > maxVisible ? (
          <li className="shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(false);
              }}
              className="rounded-md px-1.5 py-0.5 text-[10px] font-medium text-slate-500 hover:text-slate-800"
            >
              Show less
            </button>
          </li>
        ) : null}
      </ul>
    </div>
  );
}

function chipClass(staticChip: boolean) {
  return cn(
    "inline-flex max-w-full truncate rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
    staticChip
      ? "border-slate-200/90 bg-slate-50 text-slate-700"
      : "border-slate-200/90 bg-white text-slate-700 shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50/80 hover:text-emerald-900",
  );
}
