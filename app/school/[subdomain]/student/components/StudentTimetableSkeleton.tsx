"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WeekDesktopSkeleton } from "@/components/timetable/week/WeekDesktopSkeleton";
import { WeekMobileSkeleton } from "@/components/timetable/week/WeekMobileSkeleton";

interface StudentTimetableSkeletonProps {
  onBack?: () => void;
  layout?: "embedded" | "page";
}

export function StudentTimetableSkeleton({ onBack, layout = "embedded" }: StudentTimetableSkeletonProps) {
  const isPage = layout === "page";

  return (
    <div
      className={cn("overflow-x-hidden", isPage ? "w-full" : "min-h-[50vh]")}
      aria-busy
      aria-label="Loading timetable"
    >
      <div className="mx-auto max-w-[1440px] lg:px-5 lg:py-4">
        {!isPage && onBack ? (
          <div className="px-4 pt-3 lg:px-0 lg:pt-0">
            <Button variant="ghost" size="sm" onClick={onBack} aria-label="Back" className="-ml-2 gap-1.5 px-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
        <div className="lg:hidden">
          <WeekMobileSkeleton />
        </div>
        <div className="hidden lg:block">
          <WeekDesktopSkeleton />
        </div>
      </div>
    </div>
  );
}
