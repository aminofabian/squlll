"use client";

import { formatDistanceToNow } from "date-fns";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { studentsPanel } from "./students-ui";

export interface RecentStudent {
  id: string;
  name: string;
  grade: string;
  admissionNumber: string;
  createdAt: string;
}

interface StudentsRecentlyEnrolledProps {
  students: RecentStudent[];
  selectedStudentId: string | null;
  onSelect: (id: string) => void;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function StudentsRecentlyEnrolled({
  students,
  selectedStudentId,
  onSelect,
}: StudentsRecentlyEnrolledProps) {
  if (students.length === 0) return null;

  return (
    <div className={cn(studentsPanel, "p-3")}>
      <div className="mb-2 flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-violet-500" />
        <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
          Recently enrolled
        </h3>
      </div>
      <ul className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {students.map((student) => {
          const selected = selectedStudentId === student.id;
          let when = "";
          try {
            if (student.createdAt) {
              when = formatDistanceToNow(new Date(student.createdAt), {
                addSuffix: true,
              });
            }
          } catch {
            when = "";
          }

          return (
            <li key={student.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect(student.id)}
                className={cn(
                  "flex w-[9.5rem] flex-col gap-1.5 rounded-xl border px-2.5 py-2 text-left transition-all",
                  selected
                    ? "border-[#0073ea]/40 bg-[#0073ea]/5 ring-1 ring-[#0073ea]/20"
                    : "border-slate-200/80 bg-slate-50/50 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/30 dark:hover:bg-slate-800/60",
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0073ea]/10 text-[10px] font-bold text-[#0073ea]">
                    {initials(student.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                      {student.name}
                    </span>
                    <span className="block truncate text-[10px] text-slate-400">
                      {student.grade}
                    </span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {when || student.admissionNumber}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
