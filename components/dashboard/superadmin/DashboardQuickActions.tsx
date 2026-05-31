"use client";

import Link from "next/link";
import { ChevronRight, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { DashboardQuickAction } from "@/lib/superadmin/types";

interface DashboardQuickActionsProps {
  actions: DashboardQuickAction[];
}

export function DashboardQuickActions({ actions }: DashboardQuickActionsProps) {
  const primaryAction =
    actions.find((action) => action.variant === "primary") ?? actions[0];
  const secondaryActions = actions.filter(
    (action) => action.id !== primaryAction?.id,
  );

  if (!primaryAction) return null;

  const PrimaryIcon = primaryAction.icon;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
      <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Quick actions
        </h2>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Common tasks to manage the platform
        </p>
      </div>

      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
        <Button asChild className="h-10 gap-2 sm:flex-1">
          <Link href={primaryAction.href}>
            <PrimaryIcon className="h-4 w-4" />
            {primaryAction.label}
          </Link>
        </Button>

        <div className="hidden sm:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 gap-2">
                More actions
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Platform tasks</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {secondaryActions.map((action) => {
                const Icon = action.icon;
                return (
                  <DropdownMenuItem key={action.id} asChild>
                    <Link href={action.href} className="cursor-pointer">
                      <Icon className="mr-2 h-4 w-4" />
                      {action.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-10 gap-2 sm:hidden">
              More actions
              <Plus className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader className="text-left">
              <SheetTitle>Quick actions</SheetTitle>
              <SheetDescription>
                Choose a task to manage the platform
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-2">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.id}
                    href={action.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border border-slate-200/70 px-4 py-3 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40",
                      action.variant === "primary" &&
                        "border-primary/20 bg-primary/5",
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-slate-900">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {action.label}
                      </p>
                      <p className="text-xs text-slate-400">
                        {action.description}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
