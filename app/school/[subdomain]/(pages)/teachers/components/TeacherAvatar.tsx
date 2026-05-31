"use client";

import { cn } from "@/lib/utils";
import { getAvatarPalette, teacherInitials } from "../utils/teachers-utils";

const sizes = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-16 w-16 text-lg",
} as const;

interface TeacherAvatarProps {
  name: string;
  size?: keyof typeof sizes;
  className?: string;
  ring?: boolean;
}

export function TeacherAvatar({
  name,
  size = "md",
  className,
  ring = false,
}: TeacherAvatarProps) {
  const palette = getAvatarPalette(name);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        palette.bg,
        palette.text,
        sizes[size],
        ring && "ring-2 ring-white dark:ring-slate-900",
        className,
      )}
      aria-hidden
    >
      {teacherInitials(name)}
    </div>
  );
}
