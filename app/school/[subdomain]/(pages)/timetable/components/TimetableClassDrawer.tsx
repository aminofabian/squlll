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
};

export function TimetableClassDrawer({
  open,
  onClose,
  desktopMinimized,
  onToggleDesktop,
  children,
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
          "bg-[#f2f2f7] dark:bg-slate-950",
          "max-lg:shadow-[4px_0_24px_rgba(0,0,0,0.12)]",
          "border-r border-slate-200/60 dark:border-slate-800",
          "transition-transform duration-300 ease-out",
          "max-lg:w-[min(88vw,20rem)] max-lg:pb-[env(safe-area-inset-bottom)]",
          open
            ? "max-lg:translate-x-0"
            : "max-lg:-translate-x-full max-lg:pointer-events-none",
          "lg:relative lg:translate-x-0 lg:bg-[#f2f2f7] lg:dark:bg-slate-950",
          desktopMinimized ? "lg:w-14" : "lg:w-[17.5rem]",
        )}
      >
        {/* Mobile sheet header */}
        <div className="shrink-0 border-b border-slate-200/60 bg-[#f2f2f7] px-4 pb-3 pt-[max(0.625rem,env(safe-area-inset-top))] lg:hidden dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-3 py-1.5">
            <h2 className="text-[17px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Choose a class
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-[15px] font-semibold text-primary active:opacity-60"
            >
              Done
            </button>
          </div>
        </div>

        {/* Desktop collapse */}
        <div
          className={cn(
            "hidden shrink-0 border-b border-slate-200/60 px-2 py-2 dark:border-slate-800 lg:flex",
            desktopMinimized ? "justify-center" : "justify-end",
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
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

        {children}
      </aside>
    </>
  );
}
