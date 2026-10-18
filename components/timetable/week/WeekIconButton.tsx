"use client";

import type { LucideIcon } from "lucide-react";

type WeekIconButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
};

export function WeekIconButton({ icon: Icon, label, onClick }: WeekIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dfe3dd] bg-white text-[#111a16] transition-colors hover:bg-[#f4f6f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111a17] dark:border-white/15 dark:bg-white/5 dark:text-white"
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}
