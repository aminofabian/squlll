"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type WeekHeroButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
};

export function WeekHeroButton({ icon: Icon, label, onClick }: WeekHeroButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 gap-1.5 rounded-md border border-white/15 bg-white/[0.06] px-3 text-[11px] font-medium text-white/80 hover:bg-white/12 hover:text-white"
      onClick={onClick}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </Button>
  );
}
