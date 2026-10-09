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
    <div className="flex items-center gap-3 px-3 py-2.5 lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 shrink-0 rounded-lg p-0 text-muted-foreground hover:text-foreground"
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
        <h1 className="truncate text-base font-semibold text-foreground">
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
