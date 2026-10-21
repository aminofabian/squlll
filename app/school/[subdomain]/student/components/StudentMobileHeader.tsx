"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { StudentSidebar } from "@/components/dashboard/StudentSidebar";
import { getStudentPageTitle } from "@/lib/student/studentNavConfig";
import { RealtimeLiveIndicator } from "@/lib/realtime/RealtimeLiveIndicator";

export function StudentMobileHeader() {
  const pathname = usePathname();
  const title = getStudentPageTitle(pathname);
  const showLive = pathname.includes("/timetable");

  return (
    <div className="flex items-center gap-2.5 px-4 py-3 lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 shrink-0 rounded-full p-0 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <StudentSidebar />
        </SheetContent>
      </Sheet>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/70">
          Student
        </p>
        <h1 className="truncate font-display text-[1.35rem] leading-tight tracking-[-0.01em] text-foreground">
          {title}
        </h1>
      </div>

      {showLive ? (
        <RealtimeLiveIndicator className="shrink-0" />
      ) : (
        <div className="w-9 shrink-0" aria-hidden />
      )}
    </div>
  );
}
