"use client";

import { WifiOff } from "lucide-react";
import { tt } from "../utils/timetableTheme";

export function TimetableOfflineBanner() {
  return (
    <div
      role="status"
      className="flex items-start gap-2.5 rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-2.5 dark:border-amber-900/50 dark:bg-amber-950/30"
    >
      <WifiOff
        className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400"
        aria-hidden
      />
      <p className={tt.caption}>
        <strong className="font-semibold text-amber-900 dark:text-amber-200">
          You&apos;re offline
        </strong>{" "}
        — showing cached timetable data. Changes will sync when you&apos;re back
        online.
      </p>
    </div>
  );
}
