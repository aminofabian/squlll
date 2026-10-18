"use client";

import type { LucideIcon } from "lucide-react";

type WeekHeroButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
};

export function WeekHeroButton({ icon: Icon, label, onClick }: WeekHeroButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#dfe3dd] bg-white px-4 py-2 text-[13px] font-semibold text-[#111a16] transition-colors hover:bg-[#f4f6f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111a17] dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
    >
      <Icon className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}
