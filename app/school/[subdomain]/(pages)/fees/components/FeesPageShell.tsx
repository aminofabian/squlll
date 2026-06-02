"use client";

import { cn } from "@/lib/utils";
import { FEES_BRAND, FEES_MOBILE } from "../lib/fees-ui";

interface FeesPageShellProps {
  children: React.ReactNode;
  className?: string;
}

export function FeesPageShell({ children, className }: FeesPageShellProps) {
  return (
    <div
      className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden"
      style={{ backgroundColor: FEES_BRAND.surface }}
      className="max-md:bg-[#eef1ef]"
    >
      <div
        className={cn(
          "relative mx-auto flex h-full min-h-0 w-full max-w-7xl min-w-0 flex-1 flex-col px-2 py-2 sm:px-4 sm:py-3",
          FEES_MOBILE.shell,
          FEES_MOBILE.stack,
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
