"use client";

import { cn } from "@/lib/utils";
import { getAvatarPalette, parentInitials } from "../utils/parentAvatar";

export function ParentAvatar({
  name,
  size = "md",
  ring,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  ring?: boolean;
}) {
  const palette = getAvatarPalette(name);
  const initials = parentInitials(name);

  const sizeClass =
    size === "sm"
      ? "h-8 w-8 text-[10px]"
      : size === "lg"
        ? "h-16 w-16 text-base"
        : "h-10 w-10 text-xs";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        sizeClass,
        palette.bg,
        palette.text,
        ring && "ring-2 ring-white dark:ring-slate-900",
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
