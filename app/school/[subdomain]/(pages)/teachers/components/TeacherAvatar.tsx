"use client";

import { cn } from "@/lib/utils";
import { getAvatarPalette, teacherInitials } from "../utils/teachers-utils";

const sizes = {
  sm: "h-6 w-6 text-[9px]",
  md: "h-8 w-8 text-[10px]",
  lg: "h-14 w-14 text-base",
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
        "flex shrink-0 items-center justify-center rounded-none font-semibold",
        ring
          ? "bg-[#0a1f1a] text-white"
          : cn(palette.bg, palette.text),
        sizes[size],
        className,
      )}
      aria-hidden
    >
      {teacherInitials(name)}
    </div>
  );
}
