"use client";

import type { ReactNode } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TimetableClassDrawerProps = {
  open: boolean;
  onClose: () => void;
  desktopMinimized: boolean;
  onToggleDesktop: () => void;
  children: ReactNode;
  /** Shown in the collapsed desktop rail so the selected class stays visible. */
  railLabel?: string;
};

export function TimetableClassDrawer({
  open,
  onClose,
  desktopMinimized,
  onToggleDesktop,
  children,
  railLabel,
}: TimetableClassDrawerProps) {
  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close class list"
          className="fixed inset-0 z-[60] bg-black/40 transition-opacity lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        data-timetable-no-print
        className={cn(
          "fixed inset-y-0 left-0 z-[61] flex flex-col",
          "bg-[#f8fbfa] dark:bg-[#0c1a17]",
          "max-lg:shadow-[4px_0_24px_rgba(10,31,26,0.12)]",
          "border-r border-[#1a4d42]/12 dark:border-white/10",
          "transition-transform duration-300 ease-out",
          "max-lg:w-[min(88vw,20rem)] max-lg:pb-[env(safe-area-inset-bottom)]",
          open
            ? "max-lg:translate-x-0"
            : "max-lg:-translate-x-full max-lg:pointer-events-none",
          "lg:relative lg:translate-x-0 lg:bg-[#f8fbfa] lg:dark:bg-[#0c1a17]",
          desktopMinimized ? "lg:w-14" : "lg:w-[17.5rem]",
        )}
      >
        {/* Mobile sheet header */}
        <div className="shrink-0 border-b border-[#1a4d42]/10 bg-[#f8fbfa] px-4 pb-3 pt-[max(0.625rem,env(safe-area-inset-top))] lg:hidden dark:border-white/10 dark:bg-[#0c1a17]">
          <div className="flex items-center justify-between gap-3 py-1.5">
            <h2 className="font-display text-lg tracking-tight text-[#0a1f1a] dark:text-white">
              Choose a class
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-none px-2 py-1 text-[15px] font-semibold text-[#246a59] active:opacity-60"
            >
              Done
            </button>
          </div>
        </div>

        {/* Desktop collapse */}
        <div
          className={cn(
            "hidden shrink-0 border-b border-[#1a4d42]/10 px-2 py-2 dark:border-white/10 lg:flex",
            desktopMinimized ? "justify-center" : "justify-end",
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-none p-0 text-[#1a4d42]/50 hover:bg-[#e8f2ef] hover:text-[#0a1f1a] dark:hover:bg-white/5 dark:hover:text-white"
            onClick={onToggleDesktop}
            aria-label={desktopMinimized ? "Expand sidebar" : "Collapse sidebar"}
          >
            {desktopMinimized ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        {desktopMinimized && railLabel ? (
          <div className="hidden min-h-0 flex-1 flex-col items-center gap-3 px-1 pt-3 lg:flex">
            <span
              className="max-h-full truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-[#246a59] [writing-mode:vertical-rl] rotate-180"
              title={railLabel}
            >
              {railLabel}
            </span>
          </div>
        ) : null}

        <div
          className={cn(
            "min-h-0 flex-1 flex-col overflow-hidden",
            desktopMinimized ? "flex lg:hidden" : "flex",
          )}
        >
          {children}
        </div>
      </aside>
    </>
  );
}
