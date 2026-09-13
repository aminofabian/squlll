"use client";

import { Clock, Coffee, Calendar } from "lucide-react";
import { tt } from "../utils/timetableTheme";
import { cn } from "@/lib/utils";

interface TimetableScheduleSummaryProps {
  periodCount: number;
  dayCount: number;
  breakCount: number;
}

export function TimetableScheduleSummary({
  periodCount,
  dayCount,
  breakCount,
}: TimetableScheduleSummaryProps) {
  return (
    <div className={cn(tt.panelMuted, "px-4 py-3")}>
      <p className={cn(tt.body, "mb-3")}>
        School day is configured. Pick a class below to add lessons.
      </p>
      <dl className="grid grid-cols-3 gap-2 text-center">
        <div className={cn(tt.panel, "px-2 py-2.5")}>
          <Clock className={cn("mx-auto mb-1 h-3.5 w-3.5", tt.ink.faint)} />
          <dt className={tt.label}>Periods</dt>
          <dd className={cn("mt-0.5", tt.text.title, tt.numeral, tt.ink.strong)}>
            {periodCount}
          </dd>
        </div>
        <div className={cn(tt.panel, "px-2 py-2.5")}>
          <Calendar className={cn("mx-auto mb-1 h-3.5 w-3.5", tt.ink.faint)} />
          <dt className={tt.label}>Days</dt>
          <dd className={cn("mt-0.5", tt.text.title, tt.numeral, tt.ink.strong)}>
            {dayCount}
          </dd>
        </div>
        <div className={cn(tt.panel, "px-2 py-2.5")}>
          <Coffee className={cn("mx-auto mb-1 h-3.5 w-3.5", tt.ink.faint)} />
          <dt className={tt.label}>Breaks</dt>
          <dd className={cn("mt-0.5", tt.text.title, tt.numeral, tt.ink.strong)}>
            {breakCount}
          </dd>
        </div>
      </dl>
    </div>
  );
}
