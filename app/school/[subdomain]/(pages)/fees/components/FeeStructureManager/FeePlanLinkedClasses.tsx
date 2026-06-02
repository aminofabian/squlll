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
}: FeePlanLinkedClassesProps) {
  const isCompact = compact || embedded;
  const sorted = sortLinkedClasses(classes);

  if (sorted.length === 0) {
    return (
      <div
        className={cn(
          "text-center",
          isCompact
            ? "rounded-xl border border-dashed px-3 py-5"
            : "rounded-2xl border border-dashed px-5 py-8",
          "border-slate-200 bg-slate-50/80",
          className,
        )}
      >
        <School
          className={cn(
            "mx-auto text-slate-400",
            isCompact ? "h-5 w-5" : "h-8 w-8",
          )}
        />
        <p
          className={cn(
            "font-medium text-slate-800",
            isCompact ? "mt-1.5 text-xs" : "mt-2 text-sm",
          )}
        >
          No classes linked
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          {onLinkMore
            ? "Use Link classes above to assign this plan."
            : "Not assigned to any class yet."}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("min-w-0", className)}>
      {!isCompact ? (
        <div className="mb-2 px-0.5">
          <p className="text-xs text-slate-500">
            {sorted.length} class{sorted.length === 1 ? "" : "es"} · alphabetical
          </p>
        </div>
      ) : null}

      <div
        className={cn(
          "overflow-y-auto overscroll-contain rounded-xl border border-slate-200/80 bg-white",
          isCompact
            ? "max-h-[min(20rem,55vh)]"
            : "max-h-[min(280px,45vh)] shadow-sm ring-1 ring-slate-200/60",
        )}
      >
        <ul
          className="grid grid-cols-3 gap-2 p-0.5 sm:gap-2"
          role="list"
        >
          {sorted.map((entry) => (
            <li key={entry.id} className="min-w-0">
              <Link
                href={feesBalancesHref(entry.name)}
                scroll={false}
                className={cn(
                  "group flex h-full min-h-[2.75rem] items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 px-1.5 py-2 text-center transition-colors",
                  "hover:border-emerald-200/80 hover:bg-emerald-50/60 active:scale-[0.98] active:bg-emerald-50",
                  isCompact ? "min-h-[2.5rem]" : "min-h-[2.75rem]",
                )}
                title={`View balances for ${entry.name}`}
              >
                <span
                  className={cn(
                    "line-clamp-2 font-medium leading-snug text-slate-800 group-hover:text-emerald-900",
                    isCompact ? "text-[10px]" : "text-xs",
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
