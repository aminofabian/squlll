"use client";

import React from "react";
import {
  Award,
  Bell,
  CheckCircle,
  Clock,
  GraduationCap,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { ParentConsolidatedFeeCard } from "./ParentConsolidatedFeeCard";
import type { ParentConsolidatedFees } from "@/lib/parent/parentFees";
import { childGradeSubtitle } from "@/lib/parent/displayName";
import { cn } from "@/lib/utils";
import {
  portalChildPill,
  portalEmptyState,
  portalPanel,
  portalSectionLabel,
  portalStatCard,
} from "./parent-portal-ui";

interface Child {
  id: number;
  name: string;
  grade: string;
  class: string;
  avatar: string;
  attendance: number;
  currentGPA: number;
  behavior: string;
}

interface ScheduleItem {
  time: string;
  subject: string;
  teacher: string;
  room: string;
  status: string;
}

interface Grade {
  subject: string;
  assignment: string;
  grade: string;
  points: string;
  date: string;
}

interface Notification {
  id: string | number;
  type: string;
  message: string;
  time: string;
  read: boolean;
}

interface DesktopDashboardProps {
  children: Child[];
  selectedChild: number;
  setSelectedChild: (index: number) => void;
  todaySchedule: ScheduleItem[];
  recentGrades: Grade[];
  upcomingEvents: unknown[];
  notifications: Notification[];
  parentName?: string;
  averageGpa?: number | null;
  dashboardLoading?: boolean;
  consolidatedFees?: ParentConsolidatedFees | null;
  feesLoading?: boolean;
  onFeesRefresh?: () => void;
  onSelectChildByStudentId?: (studentId: string) => void;
  onPayFees?: () => void;
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "in-progress":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "upcoming":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function gradeBadgeClass(grade: string) {
  if (grade.startsWith("A"))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (grade.startsWith("B")) return "bg-sky-50 text-sky-700 border-sky-200";
  if (grade.startsWith("C")) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

export function DesktopDashboard({
  children,
  selectedChild,
  setSelectedChild,
  todaySchedule,
  recentGrades,
  notifications,
  parentName = "Parent",
  averageGpa = null,
  dashboardLoading = false,
  consolidatedFees = null,
  feesLoading = false,
  onFeesRefresh,
  onSelectChildByStudentId,
  onPayFees,
}: DesktopDashboardProps) {
  const activeChild = children[selectedChild];
  const displayGpa = averageGpa ?? activeChild?.currentGPA ?? 0;
  const unreadCount = notifications.filter((n) => !n.read).length;
  const firstName = parentName.split(/\s+/)[0] || parentName;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className={cn(portalPanel, "bg-gradient-to-br from-primary/5 via-white to-white px-6 py-6 dark:from-primary/10 dark:via-slate-900/50 dark:to-slate-900/30 sm:px-8")}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={portalSectionLabel}>Overview &amp; analytics</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">
              Here&apos;s what&apos;s happening with your{" "}
              {children.length === 1 ? "child" : "children"} today.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {new Date().toLocaleDateString("en-KE", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </header>

      <ParentConsolidatedFeeCard
        summary={consolidatedFees}
        loading={feesLoading}
        onRefresh={onFeesRefresh}
        onSelectChild={onSelectChildByStudentId}
        onPayFees={onPayFees}
      />

      {children.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {children.map((child, index) => (
            <button
              key={child.id}
              type="button"
              onClick={() => setSelectedChild(index)}
              className={portalChildPill(selectedChild === index)}
            >
              <span className="text-lg leading-none">{child.avatar}</span>
              <span>
                <span className="block font-medium leading-tight">
                  {child.name}
                </span>
                <span
                  className={cn(
                    "block text-[11px]",
                    selectedChild === index
                      ? "text-white/80"
                      : "text-slate-400",
                  )}
                >
                  {childGradeSubtitle(child)}
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : activeChild ? (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
          <span className="text-2xl">{activeChild.avatar}</span>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {activeChild.name}
            </p>
            <p className="text-xs text-slate-500">
              {childGradeSubtitle(activeChild)}
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Attendance"
          value={`${activeChild?.attendance ?? 0}%`}
          icon={TrendingUp}
        />
        <StatTile
          label="Current GPA"
          value={String(displayGpa)}
          icon={Award}
        />
        <StatTile
          label="Behavior"
          value={activeChild?.behavior ?? "—"}
          icon={CheckCircle}
          compact
        />
        <StatTile
          label="Notifications"
          value={String(unreadCount)}
          icon={Bell}
          highlight={unreadCount > 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className={cn(portalPanel, "lg:col-span-2")}>
          <div className="border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Clock className="h-4 w-4 text-primary" />
              Today&apos;s schedule
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {dashboardLoading && todaySchedule.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500">Loading schedule…</p>
            ) : todaySchedule.length === 0 ? (
              <div className={cn(portalEmptyState, "m-4 border-0 bg-transparent")}>
                No lessons scheduled for today.
              </div>
            ) : (
              todaySchedule.slice(0, 5).map((item, index) => (
                <div
                  key={`${item.time}-${index}`}
                  className="flex flex-wrap items-center gap-3 px-5 py-3.5 sm:flex-nowrap"
                >
                  <span className="w-20 shrink-0 text-xs font-medium tabular-nums text-slate-500">
                    {item.time}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {item.subject}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.teacher}
                      {item.room ? ` · ${item.room}` : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-[10px] font-medium capitalize",
                      statusBadgeClass(item.status),
                    )}
                  >
                    {item.status.replace("-", " ")}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className={portalPanel}>
          <div className="border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <GraduationCap className="h-4 w-4 text-primary" />
              Recent grades
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {dashboardLoading && recentGrades.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500">Loading grades…</p>
            ) : recentGrades.length === 0 ? (
              <div className={cn(portalEmptyState, "m-4 border-0 bg-transparent")}>
                No graded assessments yet.
              </div>
            ) : (
              recentGrades.slice(0, 5).map((grade, index) => (
                <div
                  key={`${grade.subject}-${index}`}
                  className="flex items-center justify-between gap-2 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                      {grade.subject}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {grade.assignment}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                      gradeBadgeClass(grade.grade),
                    )}
                  >
                    {grade.grade}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
  compact,
  highlight,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  compact?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={portalStatCard}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={portalSectionLabel}>{label}</p>
          <p
            className={cn(
              "mt-1 font-semibold tabular-nums text-slate-900 dark:text-slate-100",
              compact ? "text-lg" : "text-2xl",
              highlight && "text-primary",
            )}
          >
            {value}
          </p>
        </div>
        <Icon className="h-4 w-4 shrink-0 text-slate-300" />
      </div>
    </div>
  );
}
