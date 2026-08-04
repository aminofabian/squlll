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
          "group hidden md:flex items-center gap-2 h-8 pl-1 pr-2",
          "border border-[#1a4d42]/15 bg-white",
          "hover:border-[#246a59]/40 hover:bg-[#f3f7f5]",
          "dark:border-white/15 dark:bg-[#0c1a17] dark:hover:bg-white/5",
          "transition-colors",
          className,
        )}
      >
        <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-[#246a59]/10 text-[#246a59] dark:bg-[#246a59]/20">
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CalendarDays className="h-3.5 w-3.5" />
          )}
        </div>

        <div className="flex min-w-0 flex-col items-start leading-none">
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#246a59]/80">
            Current term
          </span>
          <span className="mt-0.5 max-w-[120px] truncate text-xs font-semibold text-[#0a1f1a] lg:max-w-[160px] dark:text-white">
            {termName}
            {yearName && (
              <span className="font-normal text-[#1a4d42]/50 dark:text-white/45">
                {" "}
                · {yearName}
              </span>
            )}
          </span>
        </div>

        <ChevronDown className="ml-0.5 h-3 w-3 shrink-0 text-[#1a4d42]/40 group-hover:text-[#246a59]" />
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
