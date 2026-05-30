"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTerm } from "../contexts/TermContext";
import { CalendarDays, ChevronDown, Loader2 } from "lucide-react";
import { useCurrentAcademicYear } from "@/lib/hooks/useAcademicYears";
import { TermManagementModal } from "./TermManagementModal";
import { cn } from "@/lib/utils";

interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCurrent: boolean;
  timetablePublishedAt?: string | null;
  academicYear: {
    name: string;
  };
}

interface TermsDropdownProps {
  className?: string;
}

export function TermsDropdown({ className }: TermsDropdownProps) {
  const queryClient = useQueryClient();
  const { availableTerms, termsLoading } = useTerm();
  const [modalOpen, setModalOpen] = useState(false);

  const {
    academicYears,
    loading: currentAcademicYearLoading,
    getActiveAcademicYear,
    refetch: refetchAcademicYears,
  } = useCurrentAcademicYear();
  const currentAcademicYear =
    getActiveAcademicYear() ?? academicYears[0] ?? null;

  const terms = availableTerms as Term[];

  const refetchTerms = () => {
    void queryClient.invalidateQueries({ queryKey: ["allTerms"] });
    refetchAcademicYears();
  };

  const getFallbackTerm = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    if (month >= 1 && month <= 3) {
      return { name: `Term 1`, year: String(year) };
    } else if (month >= 5 && month <= 7) {
      return { name: `Term 2`, year: String(year) };
    } else if (month >= 9 && month <= 11) {
      return { name: `Term 3`, year: String(year) };
    } else {
      if (month === 4) return { name: `Term 2`, year: String(year) };
      if (month === 8) return { name: `Term 3`, year: String(year) };
      if (month === 12) return { name: `Term 1`, year: String(year + 1) };
    }
    return { name: `Term 1`, year: String(year) };
  };

  const currentTerm = terms.find((t) => t.isCurrent);
  const isLoading = currentAcademicYearLoading || termsLoading;

  const termName = currentTerm?.name ?? (isLoading ? "..." : getFallbackTerm().name);
  const yearName =
    currentTerm?.academicYear?.name ||
    currentAcademicYear?.name ||
    (!isLoading && !currentTerm ? getFallbackTerm().year : null);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        aria-label="Manage current term"
        className={cn(
          "group hidden md:flex items-center gap-2.5 h-10 pl-1.5 pr-3 rounded-xl",
          "border border-amber-200/80 dark:border-amber-800/60",
          "bg-gradient-to-r from-amber-50/90 via-white to-white",
          "dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900",
          "hover:border-amber-300 dark:hover:border-amber-700",
          "hover:shadow-md hover:shadow-amber-500/10",
          "transition-all duration-200",
          className,
        )}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50 ring-1 ring-amber-200/60 dark:ring-amber-700/50 group-hover:bg-amber-200/80 dark:group-hover:bg-amber-900/70 transition-colors">
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 text-amber-700 dark:text-amber-300 animate-spin" />
          ) : (
            <CalendarDays className="h-3.5 w-3.5 text-amber-700 dark:text-amber-300" />
          )}
        </div>

        <div className="flex flex-col items-start min-w-0 leading-none">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700/70 dark:text-amber-400/80">
            Current term
          </span>
          <span className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[140px] lg:max-w-[180px]">
            {termName}
            {yearName && (
              <span className="font-normal text-slate-500 dark:text-slate-400">
                {" "}
                · {yearName}
              </span>
            )}
          </span>
        </div>

        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-amber-600/60 dark:text-amber-400/60 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors ml-0.5" />
      </button>

      <TermManagementModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        terms={terms}
        currentAcademicYear={currentAcademicYear}
        termsLoading={isLoading}
        onTermsChanged={refetchTerms}
      />
    </>
  );
}
