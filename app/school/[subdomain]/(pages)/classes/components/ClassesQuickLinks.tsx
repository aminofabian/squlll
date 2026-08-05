"use client";

import Link from "next/link";
import {
  BookOpen,
  CalendarRange,
  CircleDollarSign,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/students",
    label: "Students",
    icon: Users,
  },
  {
    href: "/timetable",
    label: "Timetable",
    icon: CalendarRange,
  },
  {
    href: "/fees?section=balances",
    label: "Fees",
    icon: CircleDollarSign,
  },
  {
    href: "#subjects",
    label: "Subjects",
    icon: BookOpen,
    isButton: true as const,
  },
] as const;

interface ClassesQuickLinksProps {
  onOpenSubjects?: () => void;
}

export function ClassesQuickLinks({ onOpenSubjects }: ClassesQuickLinksProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {links.map((item) => {
        const Icon = item.icon;
        const className = cn(
          "inline-flex items-center gap-1.5 rounded-none border border-[#1a4d42]/12 bg-white px-2.5 py-1.5 text-xs font-medium text-[#0a1f1a] transition-colors",
          "hover:border-[#246a59]/35 hover:bg-[#f8fbfa] dark:border-white/10 dark:bg-[#0c1a17] dark:text-white dark:hover:bg-[#071411]",
        );
        const inner = (
          <>
            <Icon className="h-3.5 w-3.5 text-[#246a59]" />
            {item.label}
          </>
        );

        if ("isButton" in item && item.isButton) {
          return (
            <button
              key={item.label}
              type="button"
              onClick={onOpenSubjects}
              className={className}
            >
              {inner}
            </button>
          );
        }

        return (
          <Link key={item.href} href={item.href} className={className}>
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
