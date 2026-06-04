"use client";

import { BookOpen, Filter, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ClassAction } from "./ClassActionBar";

interface ClassesPageHeaderProps {
  title: string;
  subtitle?: string;
  hasGradeSelected: boolean;
  onOpenGradePicker: () => void;
  actions: ClassAction[];
  showDesktopGradeToggle?: boolean;
  isGradePanelOpen?: boolean;
  onToggleGradePanel?: () => void;
}

export function ClassesPageHeader({
  title,
  subtitle,
  hasGradeSelected,
  onOpenGradePicker,
  actions,
  showDesktopGradeToggle = false,
  isGradePanelOpen = true,
  onToggleGradePanel,
}: ClassesPageHeaderProps) {
  return (
    <div className="sticky top-0 z-20 shrink-0 border-b border-slate-200/60 bg-[#f8f9fb]/90 px-3 py-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 sm:px-4">
      <div className="mx-auto flex max-w-6xl items-center gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100 sm:text-[15px]">
            {title}
          </h1>
          {subtitle ? (
            <p className="hidden truncate text-[11px] text-slate-400 sm:block">
              {subtitle}
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
                aria-label="Class actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs">Class tasks</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <DropdownMenuItem
                    key={action.id}
                    disabled={action.disabled}
                    onClick={action.onClick}
                    className="gap-2 text-sm"
                    title={action.disabled ? action.disabledReason : undefined}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {action.label}
                  </DropdownMenuItem>
                );
              })}
              {!hasGradeSelected ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled className="gap-2 text-xs text-slate-400">
                    <BookOpen className="h-3.5 w-3.5" />
                    Select a grade to add subjects or streams
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
