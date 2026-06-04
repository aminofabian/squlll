"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StudentFeePanel({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function StudentFeeEmptyTimeline({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="relative pl-6">
      <div
        className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-slate-200 via-slate-200 to-transparent"
        aria-hidden
      />
      <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-slate-200 ring-2 ring-slate-100" />
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <Icon className="h-4 w-4 text-slate-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-800">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{body}</p>
            {action ? <div className="mt-3">{action}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReminderTimelineItem({
  sentAt,
  channel,
  status,
  message,
}: {
  sentAt: string;
  channel: string;
  status: string;
  message: string;
}) {
  return (
    <div className="relative pl-6 pb-4 last:pb-0">
      <div
        className="absolute left-[7px] top-3 bottom-0 w-px bg-slate-200 last:hidden"
        aria-hidden
      />
      <div
        className="absolute left-0 top-2 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm"
        aria-hidden
      />
      <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 p-3 shadow-sm">
        <p className="text-[10px] font-medium text-slate-500">
          {new Date(sentAt).toLocaleString()} · {channel.toUpperCase()} ·{" "}
          <span className="text-slate-700">{status}</span>
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-800">{message}</p>
      </div>
    </div>
  );
}
