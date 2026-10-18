import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "h-[18px] w-[18px] text-[10px]",
  md: "h-7 w-7 text-[12px]",
} as const;

type WeekGroupBadgeProps = {
  letter: string;
  accent: string;
  size?: keyof typeof SIZE_CLASSES;
};

export function WeekGroupBadge({ letter, accent, size = "sm" }: WeekGroupBadgeProps) {
  return (
    <span
      aria-hidden
      style={{ backgroundColor: accent } as CSSProperties}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-bold leading-none text-white", SIZE_CLASSES[size])}
    >
      {letter}
    </span>
  );
}
