"use client";

import React from "react";
import { DynamicLogo } from "./DynamicLogo";
import { getLayoutSchoolName } from "@/lib/schoolLogo";

interface MobileHeaderProps {
  subdomain: string;
}

export function MobileHeader({ subdomain }: MobileHeaderProps) {
  const schoolName = getLayoutSchoolName(subdomain);

  return (
    <header className="flex items-center justify-between border-b border-slate-200/60 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
      <div className="min-w-0">
        <DynamicLogo subdomain={subdomain} size="sm" showText={false} />
        <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
          {schoolName}
        </p>
        <p className="text-[11px] text-slate-400">Parent portal</p>
      </div>
    </header>
  );
}
