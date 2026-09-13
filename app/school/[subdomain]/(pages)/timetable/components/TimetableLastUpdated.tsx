"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface TimetableLastUpdatedProps {
  isoTimestamp?: string | null;
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  // Past a day, include the clock time so "before or after lunch?" is answerable.
  const clock = new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  if (days === 1) return `yesterday, ${clock}`;
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function TimetableLastUpdated({ isoTimestamp }: TimetableLastUpdatedProps) {
  // Re-render on a timer so the relative time stays honest while the tab is open.
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!isoTimestamp) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 60000);
    return () => window.clearInterval(id);
  }, [isoTimestamp]);

  if (!isoTimestamp) return null;

  return (
    <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
      <Clock className="h-3 w-3 shrink-0" />
      Last change saved {formatRelative(isoTimestamp)}
    </p>
  );
}
