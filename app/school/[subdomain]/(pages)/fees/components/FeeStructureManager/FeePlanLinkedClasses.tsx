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
            ? "rounded-none border border-dashed px-3 py-4"
            : "rounded-none border border-dashed px-5 py-8",
          "border-[#1a4d42]/15 bg-[#f8fbfa]",
          className,
        )}
      >
        <School
          className={cn(
            "mx-auto text-[#1a4d42]/35",
            useChips ? "h-5 w-5" : "h-8 w-8",
          )}
        />
        <p
          className={cn(
            "font-medium text-[#0a1f1a]",
            useChips ? "mt-1.5 text-xs" : "mt-2 text-sm",
          )}
        >
          No classes linked
        </p>
        <p className="mt-0.5 text-[11px] text-[#1a4d42]/50">
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
                  "inline-flex max-w-full items-center rounded-none border border-[#1a4d42]/12 bg-white px-2.5 py-1 text-[11px] font-medium text-[#0a1f1a] transition-colors",
                  "hover:border-[#246a59]/35 hover:bg-[#e8f2ef] hover:text-[#1a4d42]",
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
            className="mt-2 text-[11px] font-medium text-[#246a59] hover:underline"
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
          "overflow-y-auto overscroll-contain rounded-none border border-[#1a4d42]/12 bg-white",
          "max-h-[min(280px,45vh)]",
        )}
      >
        <ul className="grid grid-cols-3 gap-2 p-2" role="list">
          {sorted.map((entry) => (
            <li key={entry.id} className="min-w-0">
              <Link
                href={feesBalancesHref(entry.name)}
                scroll={false}
                className={cn(
                  "group flex h-full min-h-[2.75rem] items-center justify-center rounded-none border border-[#1a4d42]/12 bg-[#f8fbfa] px-1.5 py-2 text-center transition-colors",
                  "hover:border-[#246a59]/35 hover:bg-[#e8f2ef]",
                )}
                title={`View balances for ${entry.name}`}
              >
                <span
                  className={cn(
                    "line-clamp-2 text-xs font-medium leading-snug text-[#0a1f1a] group-hover:text-[#1a4d42]",
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
            className="text-[11px] font-medium text-[#246a59] hover:underline"
            onClick={onLinkMore}
          >
            Manage class links
          </button>
        </div>
      ) : null}
    </div>
  );
}
