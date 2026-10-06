"use client";

import Link from "next/link";
import {
  BookOpen,
  CalendarRange,
  CircleDollarSign,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { classesMicro } from "./classes-ui";

type QuickLink =
  | { href: string; label: string; icon: LucideIcon }
  | { action: "subjects"; label: string; icon: LucideIcon };

const links: QuickLink[] = [
  { href: "/students", label: "Students", icon: Users },
  { href: "/timetable", label: "Timetable", icon: CalendarRange },
  { href: "/fees?section=balances", label: "Fees", icon: CircleDollarSign },
  { action: "subjects", label: "Subjects", icon: BookOpen },
];

const buttonClass =
  "inline-flex items-center gap-1.5 rounded-none border border-[#1a4d42]/12 bg-white px-3 py-1.5 text-xs font-medium text-[#0a1f1a] transition-colors hover:border-[#246a59]/40 hover:bg-[#246a59]/[0.06] dark:border-white/10 dark:bg-[#0c1a17] dark:text-white dark:hover:border-[#246a59]/45 dark:hover:bg-[#246a59]/15";

interface ClassesQuickLinksProps {
  onOpenSubjects?: () => void;
}

export function ClassesQuickLinks({ onOpenSubjects }: ClassesQuickLinksProps) {
  return (
    <section aria-label="Quick links">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn(classesMicro, "mr-0.5 hidden sm:inline")}>
          Jump to
        </span>
        {links.map((item) => {
          const Icon = item.icon;
          const inner = (
            <>
              <Icon className="h-3.5 w-3.5 text-[#246a59] dark:text-[#8fe3c8]" />
              {item.label}
            </>
          );

          if ("href" in item) {
            return (
              <Link key={item.href} href={item.href} className={buttonClass}>
                {inner}
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              type="button"
              onClick={onOpenSubjects}
              className={buttonClass}
            >
              {inner}
            </button>
          );
        })}
      </div>
    </section>
  );
}
