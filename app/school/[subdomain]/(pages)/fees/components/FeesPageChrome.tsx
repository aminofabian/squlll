"use client";

import { cn } from "@/lib/utils";
import { FEES_LAYOUT, FEES_MOBILE, FEES_PANEL } from "../lib/fees-ui";
import { FeesPageHeader } from "./FeesPageHeader";
import { FeesSectionTabs, type FeesSection } from "./FeesSectionTabs";
import type { StudentSummary } from "../types";

interface FeesPageChromeProps {
  feesSection: FeesSection;
  planDetailMode: boolean;
  assignmentCount?: number;
  hideReports?: boolean;
  isReadOnly?: boolean;
  onNavigateReports?: () => void;
  header: {
    collectionRate: number;
    totalExpected: number;
    totalCollected: number;
    todayPaymentCount: number;
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
    showGuidedSetup?: boolean;
  };
}

export function FeesPageChrome({
  feesSection,
  planDetailMode,
  assignmentCount,
  hideReports,
  isReadOnly,
  onNavigateReports,
  header,
}: FeesPageChromeProps) {
  if (planDetailMode) {
    return null;
  }

  return (
    <header
      className={cn(
        FEES_LAYOUT.page,
        "sticky top-0 z-20 mb-2 shrink-0",
      )}
    >
      <div
        className={cn(
          "min-w-0 max-w-full overflow-x-hidden bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/90",
          FEES_PANEL,
          FEES_MOBILE.chrome,
        )}
      >
        <FeesPageHeader
          {...header}
          activeSection={feesSection}
          integrated
        />

        <FeesSectionTabs
          active={feesSection}
          assignmentCount={assignmentCount}
          hideReports={hideReports}
          integrated
        />

        {isReadOnly && (
          <p className="border-t border-[#1a4d42]/10 px-3 py-1.5 text-[10px] text-[#1a4d42]/70">
            View-only ·{" "}
            <button
              type="button"
              className="font-semibold text-[#246a59] underline"
              onClick={onNavigateReports}
            >
              Reports
            </button>
          </p>
        )}
      </div>
    </header>
  );
}
