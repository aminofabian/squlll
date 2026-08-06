"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { gql } from "graphql-request";
import {
  ArrowRight,
  ChevronRight,
  Inbox,
  Loader2,
  X,
} from "lucide-react";
import { graphqlClient } from "@/lib/graphql-client";
import { useNotificationsOptional } from "@/lib/notifications/NotificationProvider";
import { cn } from "@/lib/utils";
import {
  formatDate,
  normalizeStatus,
  PROGRAMME_LABELS,
  studentName,
} from "../../admissions/applications/components/applications-types";

type PendingApp = {
  id: string;
  reference: string;
  status: string;
  studentFirstName: string;
  studentLastName: string;
  programme: string;
  startTerm: string;
  guardianName: string;
  createdAt: string;
};

const PENDING_QUERY = gql`
  query DashboardPendingApplications {
    admissionApplications {
      id
      reference
      status
      studentFirstName
      studentLastName
      programme
      startTerm
      guardianName
      createdAt
    }
  }
`;

interface DashboardPendingApplicationsProps {
  className?: string;
}

export function DashboardPendingApplications({
  className,
}: DashboardPendingApplicationsProps) {
  const [apps, setApps] = useState<PendingApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [pulse, setPulse] = useState(false);
  const notifications = useNotificationsOptional();

  const load = useCallback(async () => {
    try {
      const data = await graphqlClient.request<{
        admissionApplications: PendingApp[];
      }>(PENDING_QUERY);
      setApps(data.admissionApplications || []);
    } catch {
      // Soft-fail: dashboard still works without admissions inbox
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Refresh when a live admission notification arrives
  useEffect(() => {
    if (!notifications?.notifications?.length) return;
    const latest = notifications.notifications[0];
    if (latest?.type === "admission.application_submitted" && !latest.read) {
      setDismissed(false);
      setPulse(true);
      void load();
      const t = window.setTimeout(() => setPulse(false), 2400);
      return () => window.clearTimeout(t);
    }
  }, [notifications?.notifications, load]);

  const pending = useMemo(
    () => apps.filter((a) => normalizeStatus(a.status) === "new"),
    [apps],
  );

  if (dismissed) return null;

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 border border-[#1a4d42]/12 bg-white px-3 py-2 text-[12px] text-[#1a4d42]/55 dark:border-white/10 dark:bg-[#0c1a17]",
          className,
        )}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Checking admissions inbox…
      </div>
    );
  }

  if (pending.length === 0) return null;

  const latest = pending[0];
  const preview = pending.slice(0, 3);
  const more = pending.length - preview.length;

  return (
    <section
      className={cn(
        "relative overflow-hidden border border-[#1a4d42]/15 bg-[#0a1f1a] text-white shadow-[4px_4px_0_0_rgba(36,106,89,0.35)] dark:border-white/10",
        pulse && "ring-2 ring-amber-400/70 ring-offset-2 ring-offset-[#f3f7f5] dark:ring-offset-[#071411]",
        className,
      )}
      aria-label="Pending admission applications"
    >
      {/* Atmospheric grain / angle */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(115deg, transparent 40%, #246a59 40%, #246a59 62%, transparent 62%), radial-gradient(circle at 90% 10%, rgba(251,191,36,0.35), transparent 45%)",
        }}
      />

      <div className="relative flex flex-col gap-3 p-3 sm:flex-row sm:items-stretch sm:gap-4 sm:p-4">
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="relative flex h-8 w-8 items-center justify-center bg-amber-400 text-[#0a1f1a]">
              <Inbox className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-white px-1 text-[10px] font-bold text-[#0a1f1a]">
                {pending.length}
              </span>
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300/90">
                Admissions desk
              </p>
              <h2 className="font-display text-xl leading-tight text-white sm:text-2xl">
                {pending.length === 1
                  ? "One application waiting"
                  : `${pending.length} applications waiting`}
              </h2>
            </div>
          </div>

          <p className="max-w-xl text-[13px] leading-snug text-white/65">
            Fresh from the public apply form — review{" "}
            <span className="text-white">{studentName(latest)}</span>
            {pending.length > 1 ? " and the rest of the queue" : ""} before they
            go cold.
          </p>

          <ul className="mt-1 flex flex-col gap-1.5 sm:max-w-md">
            {preview.map((app, index) => (
              <li
                key={app.id}
                className={cn(
                  "flex items-center gap-2 border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[12px]",
                  index === 0 && pulse && "animate-pulse border-amber-400/40 bg-amber-400/10",
                )}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-[#246a59] text-[10px] font-semibold">
                  {app.studentFirstName?.[0]}
                  {app.studentLastName?.[0]}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium text-white">
                  {studentName(app)}
                </span>
                <span className="hidden truncate text-white/45 sm:inline">
                  {PROGRAMME_LABELS[app.programme] || app.programme}
                </span>
                <span className="shrink-0 tabular-nums text-white/40">
                  {formatDate(app.createdAt)}
                </span>
              </li>
            ))}
            {more > 0 ? (
              <li className="px-2.5 text-[11px] text-white/45">
                +{more} more in the inbox
              </li>
            ) : null}
          </ul>
        </div>

        <div className="flex shrink-0 flex-row items-end gap-2 sm:flex-col sm:justify-between sm:self-stretch">
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center text-white/40 transition-colors hover:bg-white/10 hover:text-white sm:static sm:self-end"
            aria-label="Dismiss pending applications banner"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          <Link
            href="/admissions/applications"
            className="inline-flex h-9 items-center gap-1.5 bg-amber-400 px-3 text-[12px] font-semibold text-[#0a1f1a] transition-colors hover:bg-amber-300"
          >
            Open inbox
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <Link
            href="/admissions/applications"
            className="hidden items-center gap-0.5 text-[11px] text-white/50 transition-colors hover:text-white sm:inline-flex"
          >
            Review all
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
