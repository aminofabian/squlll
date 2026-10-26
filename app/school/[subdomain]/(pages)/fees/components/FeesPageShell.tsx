"use client";

import { cn } from "@/lib/utils";
import { FEES_BRAND, FEES_MOBILE } from "../lib/fees-ui";

interface FeesPageShellProps {
  children: React.ReactNode;
  className?: string;
  /** Let a full-height rail sit flush against the main sidebar. */
  fullBleed?: boolean;
}

export function FeesPageShell({
  children,
  className,
  fullBleed = false,
}: FeesPageShellProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden max-md:bg-[#eef1ef]",
      )}
      style={{ backgroundColor: FEES_BRAND.surface }}
    >
      <div
        className={cn(
          "relative mx-auto flex h-full min-h-0 w-full max-w-7xl min-w-0 flex-1 flex-col px-2 py-2 sm:px-4 sm:py-3",
          FEES_MOBILE.shell,
          FEES_MOBILE.stack,
          fullBleed && "mx-0 max-w-none px-0 py-0",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
