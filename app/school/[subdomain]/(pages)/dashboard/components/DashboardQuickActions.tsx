"use client";

import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  Megaphone,
  UserPlus,
} from "lucide-react";
import { DashboardBroadcastSheet } from "./DashboardBroadcastSheet";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  description: string;
  href?: string;
  icon: typeof UserPlus;
  variant?: "primary" | "sheet";
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "add-teacher",
    label: "Add teacher",
    description: "Invite teaching staff",
    href: "/teachers?action=add",
    icon: GraduationCap,
    variant: "primary",
  },
  {
    id: "add-student",
    label: "Add student",
    description: "Enroll a new learner",
    href: "/students?action=add",
    icon: UserPlus,
  },
  {
    id: "classes",
    label: "Manage classes",
    description: "Grades and streams",
    href: "/classes",
    icon: BookOpen,
  },
  {
    id: "announce",
    label: "Send announcement",
    description: "Broadcast to the school",
    icon: Megaphone,
    variant: "sheet",
  },
];

interface DashboardQuickActionsProps {
  subdomain: string;
}

export function DashboardQuickActions({ subdomain }: DashboardQuickActionsProps) {
  return (
    <div className="space-y-0.5" aria-label="Quick actions">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon;
        const isPrimary = action.variant === "primary";

        const className = cn(
          "group flex w-full items-center gap-2 border border-transparent px-2 py-1.5 text-left transition-colors",
          "hover:border-[#1a4d42]/12 hover:bg-[#f3f7f5] dark:hover:bg-white/[0.04]",
          isPrimary &&
            "border-[#246a59]/20 bg-[#246a59]/[0.06] hover:border-[#246a59]/35 hover:bg-[#246a59]/10",
        );

        const content = (
          <>
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center border",
                isPrimary
                  ? "border-[#246a59] bg-[#0a1f1a] text-white"
                  : "border-[#1a4d42]/15 bg-[#f3f7f5] text-[#246a59] dark:border-white/15 dark:bg-[#071411]",
              )}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] font-medium text-[#0a1f1a] dark:text-white">
                {action.label}
              </span>
              <span className="block truncate text-[10px] text-[#1a4d42]/50 dark:text-white/40">
                {action.description}
              </span>
            </span>
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-[#1a4d42]/25 transition-transform group-hover:translate-x-0.5",
                isPrimary && "text-[#246a59]/60",
              )}
            />
          </>
        );

        if (action.variant === "sheet") {
          return (
            <DashboardBroadcastSheet
              key={action.id}
              subdomain={subdomain}
              triggerClassName={className}
              triggerLabel={action.label}
              triggerIcon={Icon}
              compact
              triggerContent={content}
            />
          );
        }

        return (
          <Link
            key={action.id}
            href={action.href ?? "#"}
            className={className}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
