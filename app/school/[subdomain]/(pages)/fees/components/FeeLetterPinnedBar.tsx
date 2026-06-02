"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { FEES_LAYOUT } from "../lib/fees-ui";

type FeeLetterPinnedBarProps = {
  children: React.ReactNode;
  className?: string;
};

/** Renders above the school mobile tab bar so Preview / Print stay visible. */
export function FeeLetterPinnedBar({
  children,
  className,
}: FeeLetterPinnedBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      role="toolbar"
      aria-label="Letter actions"
      className={cn(
        FEES_LAYOUT.planLetterDock,
        FEES_LAYOUT.mobileDockBottom,
        FEES_LAYOUT.fixedBarSafe,
        "max-md:rounded-t-2xl",
        className,
      )}
    >
      <div className="mx-auto w-full min-w-0 max-w-full px-2 sm:max-w-5xl sm:px-4">
        {children}
      </div>
    </div>,
    document.body,
  );
}
