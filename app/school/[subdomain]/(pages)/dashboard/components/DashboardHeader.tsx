"use client";

import {
  CalendarDays,
  Filter,
  MoreHorizontal,
  Plus,
} from "lucide-react";
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
  const title = hasGradeSelected
    ? selectedStreamLabel
      ? `${selectedGradeLabel} · ${selectedStreamLabel}`
      : selectedGradeLabel ?? "Grade"
    : "Dashboard";

  return (
    <div className="sticky top-0 z-20 shrink-0 border-b border-slate-200/80 bg-white/95 px-3 py-2 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 sm:px-4">
      <div className="mx-auto flex max-w-5xl items-center gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100 sm:text-[15px]">
            {title}
          </h1>
          {!hasGradeSelected ? (
            <p className="hidden truncate text-[11px] text-slate-400 sm:block">
              Overview of your school
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant={hasGradeSelected ? "secondary" : "outline"}
            size="sm"
            className="h-7 gap-1 px-2 text-xs lg:hidden"
            onClick={onOpenGradePicker}
          >
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden min-[380px]:inline">
              {hasGradeSelected ? "Grades" : "Browse"}
            </span>
          </Button>

          {showDesktopGradeToggle && onToggleGradePanel ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="hidden h-7 px-2 text-xs lg:inline-flex"
              onClick={onToggleGradePanel}
            >
              {isGradePanelOpen ? "Hide panel" : "Grades"}
            </Button>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label="Dashboard actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs">Tasks</DropdownMenuLabel>
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
                    "flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm",
                    "hover:bg-accent hover:text-accent-foreground",
                  )}
                  triggerLabel="Announcement"
                />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="text-sm">
                <a href="/students?action=add">Add student</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-sm">
                <a href="/teachers?action=add">Add teacher</a>
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
