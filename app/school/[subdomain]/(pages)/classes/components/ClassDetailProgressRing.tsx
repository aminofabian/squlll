"use client";

import { cn } from "@/lib/utils";

interface ClassDetailProgressRingProps {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  label?: string;
}

export function ClassDetailProgressRing({
  value,
  size = 44,
  stroke = 4,
  className,
  label,
}: ClassDetailProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  const complete = clamped >= 100;

  return (
    <div
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `${clamped}% complete`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-slate-200/90 dark:text-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn(
            "transition-[stroke-dashoffset] duration-500",
            complete ? "text-emerald-500" : clamped > 0 ? "text-[#0073ea]" : "text-slate-300",
          )}
        />
      </svg>
      <span
        className={cn(
          "absolute text-[10px] font-bold tabular-nums",
          complete ? "text-emerald-600" : "text-slate-700 dark:text-slate-200",
        )}
      >
        {clamped}%
      </span>
    </div>
  );
}
