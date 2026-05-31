"use client";

import { Megaphone, type LucideIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SchoolBroadcastSection } from "@/components/chat/SchoolBroadcastSection";
import { cn } from "@/lib/utils";

interface DashboardBroadcastSheetProps {
  subdomain: string;
  triggerClassName?: string;
  triggerLabel?: string;
  triggerIcon?: LucideIcon;
  compact?: boolean;
}

export function DashboardBroadcastSheet({
  subdomain,
  triggerClassName,
  triggerLabel = "Announcement",
  triggerIcon: TriggerIcon = Megaphone,
  compact = false,
}: DashboardBroadcastSheetProps) {
  const defaultTriggerClass =
    "inline-flex h-auto items-center gap-1 rounded px-1 py-0.5 font-medium text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white";

  return (
    <Sheet>
      <SheetTrigger asChild>
        {triggerClassName ? (
          <button type="button" className={triggerClassName}>
            <TriggerIcon className={cn("shrink-0", compact ? "h-4 w-4" : "h-4 w-4")} />
            {compact ? (
              <span className="text-[10px] font-medium leading-none">
                {triggerLabel}
              </span>
            ) : (
              triggerLabel
            )}
          </button>
        ) : (
          <Button variant="ghost" size="sm" className={cn(defaultTriggerClass)}>
            <TriggerIcon className="h-3 w-3" />
            {triggerLabel}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="mb-4 text-left">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Megaphone className="h-4 w-4 text-primary" />
            School announcement
          </SheetTitle>
          <SheetDescription className="text-xs">
            Send a message to all students and parents.
          </SheetDescription>
        </SheetHeader>
        <SchoolBroadcastSection subdomain={subdomain} compact />
      </SheetContent>
    </Sheet>
  );
}
