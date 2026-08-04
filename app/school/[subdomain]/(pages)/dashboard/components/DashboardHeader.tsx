"use client";

import {
  CalendarDays,
  Filter,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { useRealtime } from "@/lib/realtime/RealtimeProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ViewAcademicYearsDrawer } from "./ViewAcademicYearsDrawer";
import { DashboardBroadcastSheet } from "./DashboardBroadcastSheet";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  subdomain: string;
  selectedGradeLabel?: string;
  selectedStreamLabel?: string;
  hasGradeSelected: boolean;
  onOpenGradePicker: () => void;
  onCreateTerm: () => void;
  canCreateTerm: boolean;
  showDesktopGradeToggle?: boolean;
  isGradePanelOpen?: boolean;
  onToggleGradePanel?: () => void;
}

export function DashboardHeader({
  subdomain,
  selectedGradeLabel,
  selectedStreamLabel,
  hasGradeSelected,
  onOpenGradePicker,
  onCreateTerm,
  canCreateTerm,
  showDesktopGradeToggle = false,
  isGradePanelOpen = true,
  onToggleGradePanel,
}: DashboardHeaderProps) {
  const { connected } = useRealtime();
  const title = hasGradeSelected
    ? selectedStreamLabel
      ? `${selectedGradeLabel} · ${selectedStreamLabel}`
      : selectedGradeLabel ?? "Grade"
    : "Dashboard";

  return (
    <div className="sticky top-0 z-10 shrink-0 border-b border-[#1a4d42]/12 bg-[#f3f7f5]/95 backdrop-blur-md dark:border-white/10 dark:bg-[#071411]/95">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2 sm:px-4 lg:px-5">
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg tracking-tight text-[#0a1f1a] dark:text-white">
            {title}
          </h1>
          {!hasGradeSelected ? (
            <p className="mt-0 hidden items-center gap-1.5 truncate text-[11px] text-[#1a4d42]/50 sm:flex dark:text-white/40">
              {connected ? (
                <span className="h-1.5 w-1.5 shrink-0 bg-emerald-500" />
              ) : null}
              School day at a glance
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            variant={hasGradeSelected ? "secondary" : "outline"}
            size="sm"
            className="h-8 gap-1.5 rounded-none border-[#1a4d42]/20 px-2.5 text-xs lg:hidden"
            onClick={onOpenGradePicker}
          >
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden min-[380px]:inline">
              {hasGradeSelected ? "Grades" : "Browse grades"}
            </span>
          </Button>

          {showDesktopGradeToggle && onToggleGradePanel ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="hidden h-8 rounded-none px-2.5 text-xs text-[#1a4d42]/70 lg:inline-flex dark:text-white/60"
              onClick={onToggleGradePanel}
            >
              {isGradePanelOpen ? "Hide grades" : "Show grades"}
            </Button>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-none border-[#1a4d42]/20 bg-white dark:border-white/15 dark:bg-[#0c1a17]"
                aria-label="Dashboard actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-none">
              <DropdownMenuLabel className="text-xs text-[#1a4d42]/55">
                Tasks
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ViewAcademicYearsDrawer
                onAcademicYearCreated={() => {}}
                trigger={
                  <DropdownMenuItem
                    onSelect={(event) => event.preventDefault()}
                    className="cursor-pointer gap-2 text-sm"
                  >
                    <CalendarDays className="h-3.5 w-3.5" />
                    Academic year
                  </DropdownMenuItem>
                }
              />
              <DropdownMenuItem
                disabled={!canCreateTerm}
                onClick={onCreateTerm}
                className="gap-2 text-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Create term
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(event) => event.preventDefault()}
                className="p-0 focus:bg-transparent"
              >
                <DashboardBroadcastSheet
                  subdomain={subdomain}
                  triggerClassName={cn(
                    "flex w-full cursor-pointer items-center gap-2 rounded-none px-2 py-1.5 text-sm",
                    "hover:bg-accent hover:text-accent-foreground",
                  )}
                  triggerLabel="Announcement"
                />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="text-sm">
                <a href="/teachers?action=add">Add teacher</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-sm">
                <a href="/students?action=add">Add student</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-sm">
                <a href="/classes">Manage classes</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
