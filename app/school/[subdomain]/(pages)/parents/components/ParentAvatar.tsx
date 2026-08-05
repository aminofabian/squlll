"use client";

import { cn } from "@/lib/utils";
import { parentInitials } from "../utils/parentAvatar";

const sizes = {
  sm: "h-6 w-6 text-[9px]",
  md: "h-8 w-8 text-[10px]",
  lg: "h-14 w-14 text-base",
} as const;

export function ParentAvatar({
  name,
  size = "md",
  ring,
}: {
  name: string;
  size?: keyof typeof sizes;
  ring?: boolean;
}) {
  const initials = parentInitials(name);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-none font-semibold",
        sizes[size],
        ring
          ? "bg-[#0a1f1a] text-white"
          : "bg-[#e8f2ef] text-[#1a4d42]",
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
