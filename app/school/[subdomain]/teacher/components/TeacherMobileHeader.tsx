"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/dashboard/TeacherSidebar";
import { getTeacherPageTitle } from "@/lib/teacher/teacherNavConfig";
import { RealtimeLiveIndicator } from "@/lib/realtime/RealtimeLiveIndicator";

const menuButtonClassName =
  "h-9 w-9 shrink-0 rounded-full p-0 text-muted-foreground hover:bg-muted/60 hover:text-foreground";

function MenuButton() {
  return (
    <Button variant="ghost" size="sm" className={menuButtonClassName}>
      <Menu className="h-5 w-5" />
      <span className="sr-only">Open menu</span>
    </Button>
  );
}

export function TeacherMobileHeader() {
  const pathname = usePathname();
  const title = getTeacherPageTitle(pathname);
  const showLive = pathname.includes("/timetable");
  const [sheetReady, setSheetReady] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSheetReady(true);
  }, []);

  return (
    <div className="flex items-center gap-2.5 px-4 py-3 lg:hidden">
      {sheetReady ? (
        <Sheet>
          <SheetTrigger asChild>
            <MenuButton />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <Sidebar logoInstance="drawer" />
          </SheetContent>
        </Sheet>
      ) : (
        <MenuButton />
      )}

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/70">
          Teacher
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
