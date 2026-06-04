"use client";

import Link from "next/link";
import { School } from "lucide-react";
import { feesBalancesHref } from "../../lib/feesRoutes";
import { cn } from "@/lib/utils";
import { FEES_LAYOUT } from "../../lib/fees-ui";
import type { LinkedClassEntry } from "../../lib/feePlanLinkage";

interface FeePlanLinkedClassesProps {
  classes: LinkedClassEntry[];
  onLinkMore?: () => void;
  className?: string;
  embedded?: boolean;
  compact?: boolean;
  /** chips = dense wrap; grid = card grid (legacy). */
  variant?: "chips" | "grid";
}

function sortLinkedClasses(classes: LinkedClassEntry[]): LinkedClassEntry[] {
  return [...classes].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }),
  );
}

export function FeePlanLinkedClasses({
  classes,
  onLinkMore,
  className,
  embedded = false,
  compact = false,
  variant = "chips",
}: FeePlanLinkedClassesProps) {
  const isCompact = compact || embedded;
  const sorted = sortLinkedClasses(classes);
  const useChips = variant === "chips" || isCompact;

  if (sorted.length === 0) {
    return (
      <div
        className={cn(
          "text-center",
          useChips
            ? "rounded-lg border border-dashed px-3 py-4"
            : "rounded-2xl border border-dashed px-5 py-8",
          "border-slate-200 bg-slate-50/80",
          className,
        )}
      >
        <School
          className={cn(
            "mx-auto text-slate-400",
            useChips ? "h-5 w-5" : "h-8 w-8",
          )}
        />
        <p
          className={cn(
            "font-medium text-slate-800",
            useChips ? "mt-1.5 text-xs" : "mt-2 text-sm",
          )}
        >
          No classes linked
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          {onLinkMore
            ? "Use Manage to assign this structure to grades."
            : "Not assigned to any class yet."}
        </p>
      </div>
    );
  }

  if (useChips) {
    return (
      <div className={cn("min-w-0", className)}>
        <ul
          className="flex flex-wrap gap-1.5"
          role="list"
        >
          {sorted.map((entry) => (
            <li key={entry.id} className="min-w-0 max-w-full">
              <Link
                href={feesBalancesHref(entry.name)}
                scroll={false}
                className={cn(
                  "inline-flex max-w-full items-center rounded-lg border border-slate-200/90 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-800 shadow-sm transition-colors",
                  "hover:border-emerald-200 hover:bg-emerald-50/80 hover:text-emerald-900",
                  FEES_LAYOUT.textWrap,
                )}
                title={`Balances for ${entry.name}`}
              >
                {entry.name}
              </Link>
            </li>
          ))}
        </ul>
        {onLinkMore && !embedded ? (
          <button
            type="button"
            className="mt-2 text-[11px] font-medium text-primary hover:underline"
            onClick={onLinkMore}
          >
            Manage class links
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("min-w-0", className)}>
      <div
        className={cn(
          "overflow-y-auto overscroll-contain rounded-xl border border-slate-200/80 bg-white",
          "max-h-[min(280px,45vh)] shadow-sm ring-1 ring-slate-200/60",
        )}
      >
        <ul className="grid grid-cols-3 gap-2 p-2" role="list">
          {sorted.map((entry) => (
            <li key={entry.id} className="min-w-0">
              <Link
                href={feesBalancesHref(entry.name)}
                scroll={false}
                className={cn(
                  "group flex h-full min-h-[2.75rem] items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 px-1.5 py-2 text-center transition-colors",
                  "hover:border-emerald-200/80 hover:bg-emerald-50/60",
                )}
                title={`View balances for ${entry.name}`}
              >
                <span
                  className={cn(
                    "line-clamp-2 text-xs font-medium leading-snug text-slate-800 group-hover:text-emerald-900",
                    FEES_LAYOUT.textWrap,
                  )}
                >
                  {entry.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {onLinkMore && !embedded ? (
        <div className="mt-2 px-0.5">
          <button
            type="button"
            className="text-[11px] font-medium text-primary hover:underline"
            onClick={onLinkMore}
          >
            Manage class links
          </button>
        </div>
      ) : null}
    </div>
  );
}
