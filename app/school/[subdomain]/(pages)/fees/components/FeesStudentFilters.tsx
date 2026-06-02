"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentSearchBar } from "./StudentSearchBar";
import type { StudentSummary } from "../types";
import { cn } from "@/lib/utils";

interface FeesStudentFiltersProps {
  selectedStudent: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredStudents: StudentSummary[];
  onStudentSelect: (id: string) => void;
  onClearSelection: () => void;
  selectedGrade: string;
  onGradeChange: (grade: string) => void;
  gradeOptions: string[];
  /** Single row for the page chrome toolbar. */
  inline?: boolean;
}

export function FeesStudentFilters({
  selectedStudent,
  searchTerm,
  setSearchTerm,
  filteredStudents,
  onStudentSelect,
  onClearSelection,
  selectedGrade,
  onGradeChange,
  gradeOptions,
  inline = false,
}: FeesStudentFiltersProps) {
  return (
    <div
      className={cn(
        "w-full",
        inline
          ? "flex flex-col gap-2 sm:flex-row sm:items-center lg:max-w-2xl"
          : "flex flex-col gap-4 sm:flex-row sm:items-end lg:max-w-xl",
      )}
    >
      <div className={cn("min-w-0 flex-1", !inline && "space-y-1.5")}>
        {!inline && (
          <label
            htmlFor="fees-student-search"
            className="text-xs font-medium text-slate-500"
          >
            Search student
          </label>
        )}
        <StudentSearchBar
          variant="compact"
          selectedStudent={selectedStudent}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredStudents={filteredStudents}
          onStudentSelect={onStudentSelect}
          onClearSelection={onClearSelection}
        />
      </div>
      <div
        className={cn(
          "shrink-0",
          inline ? "w-full sm:w-[9.5rem]" : "w-full space-y-1.5 sm:w-[11rem]",
        )}
      >
        {!inline && (
          <label
            htmlFor="fees-grade-filter"
            className="text-xs font-medium text-slate-500"
          >
            Grade
          </label>
        )}
        <Select
          value={selectedGrade || "all"}
          onValueChange={onGradeChange}
        >
          <SelectTrigger
            id="fees-grade-filter"
            className={cn(
              "w-full border-slate-200 bg-white text-sm shadow-sm",
              inline ? "h-9" : "h-10",
            )}
          >
            <SelectValue placeholder="All grades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All grades</SelectItem>
            {gradeOptions.map((grade) => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
