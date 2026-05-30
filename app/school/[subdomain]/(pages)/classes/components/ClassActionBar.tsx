"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ClassAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  disabledReason?: string;
  tooltip?: string;
  destructive?: boolean;
};

interface ClassActionBarProps {
  actions: ClassAction[];
  className?: string;
  layout?: "links" | "menu" | "icons";
}

function getTooltipText(action: ClassAction) {
  if (action.disabled && action.disabledReason) return action.disabledReason;
  return action.tooltip ?? action.label;
}

function wrapWithTooltip(action: ClassAction, node: ReactNode) {
  const text = getTooltipText(action);

  return (
    <TooltipPrimitive.Root key={action.id}>
      <TooltipPrimitive.Trigger asChild>
        <span
          className={cn(
            "inline-flex",
            action.disabled ? "cursor-not-allowed" : "cursor-pointer",
          )}
        >
          {node}
        </span>
      </TooltipPrimitive.Trigger>
      <TooltipContent side="top" sideOffset={6} className="max-w-xs text-xs">
        {text}
      </TooltipContent>
    </TooltipPrimitive.Root>
  );
}

export function ClassActionBar({
  actions,
  className,
  layout = "links",
}: ClassActionBarProps) {
  if (actions.length === 0) return null;

  const visible = actions.filter((a) => !a.disabled);
  if (layout !== "icons" && visible.length === 0) return null;

  if (layout === "menu") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200",
              className,
            )}
            aria-label="Actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              disabled={action.disabled}
              onClick={action.onClick}
              className={cn(
                "gap-2 text-xs",
                action.destructive &&
                  "text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40",
              )}
            >
              <action.icon className="h-3.5 w-3.5" />
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (layout === "icons") {
    return (
      <TooltipProvider delayDuration={300}>
        <div className={cn("flex items-center gap-0.5", className)}>
          {actions.map((action) =>
            wrapWithTooltip(
              action,
              <button
                key={action.id}
                type="button"
                disabled={action.disabled}
                aria-label={getTooltipText(action)}
                title={getTooltipText(action)}
                onClick={(event) => {
                  if (action.disabled) {
                    event.preventDefault();
                    return;
                  }
                  action.onClick();
                }}
                className={cn(
                  "inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200",
                  action.destructive &&
                    "hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40",
                  action.disabled && "opacity-40",
                )}
              >
                <action.icon className="h-3.5 w-3.5" />
              </button>,
            ),
          )}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs",
          className,
        )}
      >
        {actions.map((action, index) => (
          <span key={action.id} className="inline-flex items-center gap-1">
            {index > 0 && (
              <span className="select-none text-slate-300 dark:text-slate-600">
                ·
              </span>
            )}
            {wrapWithTooltip(
              action,
              <button
                type="button"
                disabled={action.disabled}
                title={getTooltipText(action)}
                onClick={action.onClick}
                className={cn(
                  "inline-flex items-center gap-1 rounded px-1 py-0.5 transition-colors",
                  index === 0
                    ? "font-medium text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
                  action.destructive && "text-red-600 hover:text-red-700",
                  action.disabled && "pointer-events-none opacity-40",
                )}
              >
                <action.icon className="h-3 w-3" />
                {action.label}
              </button>,
            )}
          </span>
        ))}
      </div>
    </TooltipProvider>
  );
}
