"use client";

import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { FeesStudentFilters } from "./FeesStudentFilters";
import type { StudentSummary } from "../types";
import type { FeesSection } from "./FeesSectionTabs";
import { hasMeaningfulFeeMetrics } from "../lib/feesWorkflow";
import { FEES_LAYOUT, FEES_MOBILE } from "../lib/fees-ui";

interface FeesPageHeaderProps {
  collectionRate: number;
  totalExpected: number;
  totalCollected: number;
  todayPaymentCount: number;
  activeSection: FeesSection;
  overviewSetupMode: boolean;
  isReadOnly: boolean;
  selectedStudent: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredStudents: StudentSummary[];
  onStudentSelect: (id: string) => void;
  onClearSelection: () => void;
  selectedGrade: string;
  onGradeChange: (grade: string) => void;
  gradeOptions: string[];
  /** Nested inside FeesPageChrome. */
  integrated?: boolean;
}

const SECTION_TITLES: Record<FeesSection, string> = {
  overview: "Collections",
  balances: "Balances",
  reports: "Reports",
  plans: "Fee structures",
  assignments: "Class links",
};

export function FeesPageHeader({
  collectionRate,
  totalExpected,
  totalCollected,
  todayPaymentCount,
  activeSection,
  overviewSetupMode,
  isReadOnly,
  selectedStudent,
  searchTerm,
  setSearchTerm,
  filteredStudents,
  onStudentSelect,
  onClearSelection,
  selectedGrade,
  onGradeChange,
  gradeOptions,
  integrated = false,
}: FeesPageHeaderProps) {
  const title = SECTION_TITLES[activeSection];
  const showStudentFilters = activeSection === "balances";

  const showMetricsBadge =
    !isReadOnly &&
    activeSection === "overview" &&
    !overviewSetupMode &&
    hasMeaningfulFeeMetrics({
      totalExpected,
      totalCollected,
      todayPaymentCount,
    });

  const displayTitle =
    activeSection === "overview" && overviewSetupMode
      ? "Get started"
      : title;

  const showHint =
    !integrated &&
    (activeSection === "overview" && overviewSetupMode);

  const displayHint = overviewSetupMode
    ? "Structure → link classes → bill"
    : "";

  return (
    <div
      className={cn(
        integrated
          ? "px-3 pb-2 pt-3 sm:px-3 sm:py-2"
          : "mb-3 rounded-none border border-[#1a4d42]/12 bg-white px-3 py-2.5 shadow-[3px_3px_0_0_rgba(10,31,26,0.05)] sm:px-4 sm:py-3",
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1
              className={cn(
                "font-display text-xl font-normal tracking-tight text-[#0a1f1a] sm:text-2xl",
                FEES_MOBILE.largeTitle,
                FEES_LAYOUT.textWrap,
              )}
            >
              {displayTitle}
            </h1>
            {showMetricsBadge && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-none border px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                  collectionRate >= 70
                    ? "border-[#246a59]/25 bg-[#e8f2ef] text-[#1a4d42]"
                    : "border-amber-200/80 bg-amber-50 text-amber-900",
                )}
              >
                <TrendingUp className="h-3 w-3" />
                {collectionRate.toFixed(0)}% collected
              </span>
            )}
          </div>
          {showHint ? (
            <p className="text-[11px] text-[#1a4d42]/50">{displayHint}</p>
          ) : null}
          {integrated && activeSection === "plans" ? (
            <p className="mt-0.5 text-[11px] text-[#1a4d42]/50">
              Templates for what each class owes — link classes, then bill
            </p>
          ) : null}
        </div>

        {showStudentFilters && (
          <div className={cn("min-w-0", FEES_MOBILE.card, "max-md:p-3 md:contents")}>
          <FeesStudentFilters
            selectedStudent={selectedStudent}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredStudents={filteredStudents}
            onStudentSelect={onStudentSelect}
            onClearSelection={onClearSelection}
            selectedGrade={selectedGrade}
            onGradeChange={onGradeChange}
            gradeOptions={gradeOptions}
            inline
          />
          </div>
        )}
      </div>
    </div>
  );
}
