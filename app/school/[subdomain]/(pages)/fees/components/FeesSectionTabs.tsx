"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileStack,
  Users,
  Link2,
  BarChart3,
} from "lucide-react";
import { FEES_LAYOUT, FEES_MOBILE } from "../lib/fees-ui";
import { feesSectionHref } from "../lib/feesRoutes";

export type FeesSection =
  | "overview"
  | "plans"
  | "balances"
  | "assignments"
  | "reports";

interface FeesSectionTabsProps {
  active: FeesSection;
  assignmentCount?: number;
  hideReports?: boolean;
  /** Renders inside FeesPageChrome (no outer card). */
  integrated?: boolean;
}

type TabDef = {
  id: FeesSection;
  label: string;
  short: string;
  icon: typeof LayoutDashboard;
  priority: number;
};

/** Priority: daily work first, configuration last. */
const tabs: TabDef[] = [
  {
    id: "overview",
    label: "Overview",
    short: "Home",
    icon: LayoutDashboard,
    priority: 1,
  },
  {
    id: "balances",
    label: "Balances",
    short: "Owing",
    icon: Users,
    priority: 2,
  },
  {
    id: "reports",
    label: "Reports",
    short: "Reports",
    icon: BarChart3,
    priority: 3,
  },
  {
    id: "plans",
    label: "Fee structures",
    short: "Structures",
    icon: FileStack,
    priority: 4,
  },
  {
    id: "assignments",
    label: "Linked",
    short: "Linked",
    icon: Link2,
    priority: 5,
  },
];

export const FeesSectionTabs = ({
  active,
  assignmentCount,
  hideReports = false,
  integrated = false,
}: FeesSectionTabsProps) => {
  const visible = tabs
    .filter((t) => !(hideReports && t.id === "reports"))
    .sort((a, b) => a.priority - b.priority);

  const operationsEnd = visible.findIndex((t) => t.id === "reports");

  return (
    <nav
      className={cn(
        FEES_LAYOUT.page,
        integrated
          ? "border-t border-[#1a4d42]/10 px-3 py-2 max-md:border-0 max-md:px-3 max-md:pb-3"
          : "rounded-none border border-[#1a4d42]/12 bg-white p-2 shadow-[3px_3px_0_0_rgba(10,31,26,0.05)]",
      )}
      aria-label="Fees sections"
    >
      <div
        className={cn(
          FEES_LAYOUT.chipStrip,
          "items-center gap-1 sm:flex-wrap",
          integrated && FEES_MOBILE.segmentedTrack,
        )}
        role="tablist"
      >
        {visible.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          const href = feesSectionHref(tab.id);
          const showDivider =
            integrated &&
            operationsEnd >= 0 &&
            index === operationsEnd + 1;

          return (
            <span key={tab.id} className="contents">
              {showDivider && (
                <span
                  className="mx-0.5 hidden h-5 w-px shrink-0 bg-[#1a4d42]/15 sm:inline-block"
                  aria-hidden
                />
              )}
              <Link
                href={href}
                scroll={false}
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? "page" : undefined}
                title={tab.label}
                className={cn(
                  "inline-flex items-center gap-1 rounded-none px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-[13px]",
                  integrated && FEES_MOBILE.segmentedTab,
                  integrated &&
                    (isActive
                      ? FEES_MOBILE.segmentedActive
                      : FEES_MOBILE.segmentedIdle),
                  !integrated &&
                    (isActive
                      ? "bg-[#0a1f1a] text-white"
                      : "text-[#1a4d42]/65 hover:bg-[#f3f7f5] hover:text-[#0a1f1a]"),
                  integrated &&
                    isActive &&
                    "md:bg-[#0a1f1a] md:text-white md:shadow-none",
                  integrated &&
                    !isActive &&
                    "md:text-[#1a4d42]/65 md:hover:bg-[#f3f7f5]",
                )}
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 opacity-90",
                    integrated && "max-md:h-4 max-md:w-4",
                  )}
                />
                <span className={cn("text-center", FEES_LAYOUT.textWrap)}>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.short}</span>
                </span>
                {tab.id === "assignments" &&
                  assignmentCount != null &&
                  assignmentCount > 0 && (
                    <span
                      className={cn(
                        "rounded-none px-1.5 text-[9px] font-bold tabular-nums",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[#e8f2ef] text-[#1a4d42]",
                      )}
                    >
                      {assignmentCount}
                    </span>
                  )}
              </Link>
            </span>
          );
        })}
      </div>
    </nav>
  );
};
