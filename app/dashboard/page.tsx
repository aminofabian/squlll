"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SearchFilter } from "@/components/dashboard/SearchFilter";
import { MobileNav } from "@/components/dashboard/MobileNav";
import {
  Users,
  CalendarDays,
  BookOpen,
  TrendingUp,
  GraduationCap,
  ClipboardList,
  Clock,
  AlertCircle,
} from "lucide-react";

// ─── Constants ─────────────────────────────────────────────────

const STATS = [
  {
    title: "Total Students",
    value: "1,234",
    change: "+12 this month",
    icon: Users,
    color: "text-primary",
  },
  {
    title: "Attendance Rate",
    value: "95.8%",
    change: "+0.6% vs last week",
    icon: CalendarDays,
    color: "text-emerald-600",
  },
  {
    title: "Active Classes",
    value: "48",
    change: "Current semester",
    icon: BookOpen,
    color: "text-purple-600",
  },
  {
    title: "Academic Progress",
    value: "87.5%",
    change: "+2.3% this term",
    icon: TrendingUp,
    color: "text-blue-600",
  },
];

const EVENTS = [
  { name: "Parent-Teacher Conference", date: "Mar 15", attendees: 45 },
  { name: "Science Fair", date: "Mar 20", attendees: 120 },
  { name: "Sports Day", date: "Mar 25", attendees: 200 },
];

const CLASS_PERFORMANCE = [
  { name: "Grade 10A", average: 85.6, students: 32 },
  { name: "Grade 11B", average: 82.3, students: 28 },
  { name: "Grade 12C", average: 88.9, students: 30 },
];

const RECENT_ACTIVITY = [
  {
    action: "Attendance marked",
    target: "Grade 10A",
    time: "10 min ago",
    type: "attendance",
  },
  {
    action: "Exam results posted",
    target: "Grade 12 - Mathematics",
    time: "1 hour ago",
    type: "exam",
  },
  {
    action: "New student enrolled",
    target: "John Doe - Grade 8B",
    time: "2 hours ago",
    type: "enrollment",
  },
  {
    action: "Fee payment received",
    target: "Jane Smith - Parent",
    time: "3 hours ago",
    type: "finance",
  },
];

// ─── Component ─────────────────────────────────────────────────

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEvents = useMemo(() => {
    if (!searchTerm) return EVENTS;
    return EVENTS.filter((e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

  return (
    <DashboardLayout
      searchFilter={
        <SearchFilter
          type="dashboard"
          onSearch={setSearchTerm}
          onStoreSelect={() => {}}
        />
      }
      mobileNav={<MobileNav />}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="inline-block px-3 py-1 bg-primary/5 border border-primary/20 rounded-md mb-2">
            <span className="text-xs font-medium uppercase tracking-wide text-primary">
              School Overview
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor school performance and activities
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div
              key={stat.title}
              className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <div className={stat.color}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {stat.title}
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    {stat.change}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Recent Activity
              </h2>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {RECENT_ACTIVITY.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <ActivityIcon type={item.type} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                          {item.target}
                        </p>
                        <p className="text-xs text-slate-500">{item.action}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0 ml-3">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Upcoming Events
              </h2>
            </div>
            <div className="p-4">
              {filteredEvents.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  No events found
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredEvents.map((event) => (
                    <div
                      key={event.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                          <CalendarDays className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                            {event.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {event.date} · {event.attendees} attendees
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Class Performance */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Class Performance
              </h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {CLASS_PERFORMANCE.map((c) => (
                  <div key={c.name} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {c.name}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {c.average}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${c.average}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      {c.students} students
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Quick Actions
              </h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <QuickAction
                  icon={<Users className="h-5 w-5" />}
                  label="Take Attendance"
                />
                <QuickAction
                  icon={<GraduationCap className="h-5 w-5" />}
                  label="Enter Grades"
                />
                <QuickAction
                  icon={<CalendarDays className="h-5 w-5" />}
                  label="Schedule Event"
                />
                <QuickAction
                  icon={<ClipboardList className="h-5 w-5" />}
                  label="Create Report"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Sub-components ────────────────────────────────────────────

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case "attendance":
      return <CalendarDays className="h-4 w-4 text-primary" />;
    case "exam":
      return <BookOpen className="h-4 w-4 text-purple-600" />;
    case "enrollment":
      return <Users className="h-4 w-4 text-emerald-600" />;
    case "finance":
      return <Clock className="h-4 w-4 text-amber-600" />;
    default:
      return <AlertCircle className="h-4 w-4 text-slate-400" />;
  }
}

function QuickAction({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button className="flex flex-col items-center gap-2 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center">
      <div className="text-primary">{icon}</div>
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
        {label}
      </span>
    </button>
  );
}
