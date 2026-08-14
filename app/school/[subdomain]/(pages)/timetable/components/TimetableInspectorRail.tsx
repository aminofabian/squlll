"use client";

import type { ReactNode } from "react";
import {
  Activity,
  AlertCircle,
  BookOpen,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";

export type TimetableInspectorTab =
  | "overview"
  | "teachers"
  | "coverage"
  | "issues";

type TabDef = {
  id: TimetableInspectorTab;
  label: string;
  icon: LucideIcon;
  badge?: number;
  hidden?: boolean;
};

type TimetableInspectorRailProps = {
  activeTab: TimetableInspectorTab | null;
  onChange: (tab: TimetableInspectorTab | null) => void;
  issueCount?: number;
  teacherCount?: number;
  coverageCount?: number;
  showCoverage?: boolean;
  overview: ReactNode;
  teachers: ReactNode;
  coverage?: ReactNode;
  issues: ReactNode;
};

export function TimetableInspectorRail({
  activeTab,
  onChange,
  issueCount = 0,
  teacherCount = 0,
  coverageCount = 0,
  showCoverage = false,
  overview,
  teachers,
  coverage,
  issues,
}: TimetableInspectorRailProps) {
  const tabs: TabDef[] = [
    { id: "overview", label: "Pulse", icon: Activity },
    {
      id: "teachers",
      label: "Teachers",
      icon: Users,
      badge: teacherCount > 0 ? teacherCount : undefined,
    },
    {
      id: "coverage",
      label: "Coverage",
      icon: BookOpen,
      badge: coverageCount > 0 ? coverageCount : undefined,
      hidden: !showCoverage,
    },
    {
      id: "issues",
      label: "Issues",
      icon: AlertCircle,
      badge: issueCount > 0 ? issueCount : undefined,
    },
  ];

  const visibleTabs = tabs.filter((tab) => !tab.hidden);
  const open = activeTab != null;
  const panel =
    activeTab === "overview"
      ? overview
      : activeTab === "teachers"
        ? teachers
        : activeTab === "coverage"
          ? coverage
          : activeTab === "issues"
            ? issues
            : null;

  const toggle = (id: TimetableInspectorTab) => {
    onChange(activeTab === id ? null : id);
  };

  return (
    <aside
      data-timetable-no-print
      className={cn(
        "hidden min-h-0 shrink-0 lg:flex",
        "border-l border-[#1a4d42]/12 bg-[#f8fbfa] dark:border-white/10 dark:bg-[#0c1a17]",
      )}
    >
      {open ? (
        <div className="flex min-h-0 w-[20.5rem] flex-col">
          <div className="flex items-center justify-between gap-2 border-b border-[#1a4d42]/10 px-3 py-2 dark:border-white/10">
            <p className={tt.eyebrow}>
              {visibleTabs.find((tab) => tab.id === activeTab)?.label ?? "Inspect"}
            </p>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="px-1.5 py-0.5 text-[11px] font-medium text-[#1a4d42]/55 hover:text-[#0a1f1a] dark:text-white/45 dark:hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {panel}
          </div>
        </div>
      ) : null}

      <nav
        aria-label="Timetable inspector"
        className="flex w-11 shrink-0 flex-col items-center gap-1 border-l border-[#1a4d42]/10 py-2 dark:border-white/10"
      >
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isHot = tab.id === "issues" && (tab.badge ?? 0) > 0;
          return (
            <button
              key={tab.id}
              type="button"
              title={tab.label}
              aria-pressed={isActive}
              onClick={() => toggle(tab.id)}
              className={cn(
                "relative flex h-9 w-9 items-center justify-center transition-colors",
                isActive
                  ? "bg-[#0a1f1a] text-white dark:bg-[#246a59]"
                  : isHot
                    ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                    : "text-[#1a4d42]/55 hover:bg-[#e8f2ef] hover:text-[#0a1f1a] dark:text-white/45 dark:hover:bg-white/5 dark:hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {tab.badge != null && tab.badge > 0 ? (
                <span
                  className={cn(
                    "absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center px-0.5 text-[8px] font-bold tabular-nums leading-none text-white",
                    isHot ? "bg-red-600" : "bg-[#246a59]",
                  )}
                >
                  {tab.badge > 99 ? "99+" : tab.badge}
                </span>
              ) : null}
              <span className="sr-only">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
