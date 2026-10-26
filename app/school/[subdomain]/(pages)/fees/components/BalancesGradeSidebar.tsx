"use client";

import { useMemo, useState } from "react";
import { GraduationCap } from "lucide-react";
import { SchoolSearchFilter } from "@/components/dashboard/SchoolSearchFilter";
import { DashboardGradeSheet } from "../../dashboard/components/DashboardGradeSheet";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BalancesGradeSidebarProps {
  /** Grade name currently held in ?class= / selectedClass. */
  selectedGradeName: string;
  onGradeNameChange: (gradeName: string) => void;
  className?: string;
}

/**
 * The exams module uses a persistent grade rail. Balances now gets the same
 * filter, with a drawer substitute on phones.
 */
export function BalancesGradeSidebar({
  selectedGradeName,
  onGradeNameChange,
  className,
}: BalancesGradeSidebarProps) {
  const { config } = useSchoolConfigStore();
  const [sheetOpen, setSheetOpen] = useState(false);

  const selectedGradeId = useMemo(() => {
    if (!selectedGradeName || selectedGradeName === "all") return "";
    for (const level of config?.selectedLevels ?? []) {
      const grade = (level.gradeLevels ?? []).find(
        (item) => item.name === selectedGradeName,
      );
      if (grade) return grade.id;
    }
    return "";
  }, [config?.selectedLevels, selectedGradeName]);

  const findGrade = (gradeId: string, levelId: string) => {
    const level = config?.selectedLevels?.find((item) => item.id === levelId);
    return level?.gradeLevels?.find((item) => item.id === gradeId);
  };

  const handleGradeSelect = (gradeId: string, levelId: string) => {
    const grade = findGrade(gradeId, levelId);
    if (grade) {
      onGradeNameChange(grade.name);
      setSheetOpen(false);
    }
  };

  const handleAll = () => {
    onGradeNameChange("all");
    setSheetOpen(false);
  };

  const filter = (
    <SchoolSearchFilter
      className="h-full"
      variant="minimal"
      type="grades"
      onGradeSelect={handleGradeSelect}
      onSelectAllClasses={handleAll}
      selectedGradeId={selectedGradeId}
      selectedStreamId=""
      allClassesSelected={selectedGradeName === "all"}
    />
  );

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="sticky top-[6.5rem] z-10 h-10 w-full justify-start gap-2 rounded-xl border-[#1a4d42]/15 bg-white text-xs text-[#1a4d42] shadow-sm lg:hidden"
        onClick={() => setSheetOpen(true)}
      >
        <GraduationCap className="h-4 w-4 text-[#246a59]" />
        <span className="min-w-0 flex-1 truncate text-left">
          {selectedGradeName === "all" ? "All grades" : selectedGradeName}
        </span>
        <span className="text-[10px] font-medium text-[#1a4d42]/45">Filter</span>
      </Button>

      <aside
        aria-label="Grade filter"
        className={cn(
          "hidden w-56 shrink-0 flex-col border-r border-slate-200/80 bg-[#f5f6f8] dark:border-slate-800 dark:bg-slate-900 lg:flex",
          className,
        )}
      >
        <div className="sticky top-[7rem] flex max-h-[calc(100vh-9rem)] flex-col overflow-hidden px-2 py-2">
          <p className="px-1 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#1a4d42]/45 dark:text-white/40">
            Grades
          </p>
          {filter}
        </div>
      </aside>

      <DashboardGradeSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onGradeSelect={handleGradeSelect}
        onStreamSelect={() => {}}
        selectedGradeId={selectedGradeId}
        selectedStreamId=""
        allClassesSelected={selectedGradeName === "all"}
        onSelectAllClasses={handleAll}
      />
    </>
  );
}
