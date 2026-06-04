"use client";

import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEES_MOBILE } from "../../lib/fees-ui";

interface FeePlanNextStepsProps {
  termsReady: boolean;
  termsLabel: string;
  classesLinked: number;
  className?: string;
}

export function FeePlanNextSteps({
  termsReady,
  termsLabel,
  classesLinked,
  className,
}: FeePlanNextStepsProps) {
  const classesReady = classesLinked > 0;
  if (termsReady && classesReady) {
    return null;
  }

  const items = [
    !termsReady && termsLabel,
    !classesReady && "Link classes to this structure",
  ].filter(Boolean) as string[];

  return (
    <div
      className={cn(
        FEES_MOBILE.card,
        "border-amber-200/70 bg-amber-50/95 px-4 py-3.5 max-md:border-0 md:rounded-xl md:border md:px-3 md:py-2.5",
        className,
      )}
      role="status"
    >
      <div className="flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
          <AlertCircle className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-amber-950">Finish setup</p>
          <ul className="mt-2 space-y-1.5">
            {items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-xs leading-snug text-amber-900/90"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
