"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  EyeOff,
  Copy,
} from "lucide-react";
import type { Level, Subject } from "@/lib/types/school-config";
import { useState, useMemo } from "react";
import { EditSubjectDialog } from "./EditSubjectDialog";
import { useTenantSubjects, TenantSubject } from "@/lib/hooks/useTenantSubjects";
import { useGradeLevelFeeSummary } from "@/lib/hooks/useGradeLevelFeeSummary";
import { cn } from "@/lib/utils";
import {
  ClassActionBar,
} from "../classes/components/ClassActionBar";
import { dedupeSubjectsByMaster } from "../classes/utils/dedupeSubjects";
import { useSubjectTeacherMap } from "../classes/utils/useSubjectTeacherMap";
import { SubjectTeacherBadge } from "../classes/components/SubjectTeacherBadge";
import { toast } from "sonner";

interface ClassCardProps {
  level: Level;
  selectedGradeId: string;
  onAssignTeacher?: () => void;
}

export function ClassCard({
  level,
  selectedGradeId,
  onAssignTeacher,
}: ClassCardProps) {
  const [showSubjects, setShowSubjects] = useState(true);
  const [editingSubject, setEditingSubject] = useState<TenantSubject | null>(
    null,
  );
  const [showFeeDetails, setShowFeeDetails] = useState(true);

  const { data: tenantSubjects = [] } = useTenantSubjects();
  const { data: feeSummary } = useGradeLevelFeeSummary(selectedGradeId || null);
  const { getTeacherForSubject } = useSubjectTeacherMap();

  const transformedSubjects = useMemo(() => {
    return tenantSubjects.map((ts) => ({
      id: ts.id,
      name: ts.subject?.name || ts.customSubject?.name || "Unknown Subject",
      code: ts.subject?.code || ts.customSubject?.code || "",
      subjectType: (ts.subjectType === "core" ? "core" : "elective") as
        | "core"
        | "elective",
      _tenantSubject: ts,
    }));
  }, [tenantSubjects]);

  const filteredSubjects = useMemo(() => {
    let subjects = transformedSubjects;

    if (selectedGradeId) {
      const gradeBelongsToLevel = level.gradeLevels?.some(
        (grade) => grade.id === selectedGradeId,
      );

      if (gradeBelongsToLevel) {
        const levelSubjectNames = new Set(
          level.subjects.map((s) => s.name.toLowerCase().trim()),
        );
        const levelSubjectCodes = new Set(
          level.subjects
            .map((s) => s.code?.toLowerCase().trim())
            .filter(Boolean),
        );

        subjects = subjects.filter((subject) => {
          const subjectName = subject.name.toLowerCase().trim();
          const subjectCode = subject.code?.toLowerCase().trim();
          return (
            levelSubjectNames.has(subjectName) ||
            (subjectCode && levelSubjectCodes.has(subjectCode))
          );
        });
      } else {
        subjects = [];
      }
    }

    return dedupeSubjectsByMaster(subjects).sort((a, b) => {
      if (a.subjectType === "core" && b.subjectType !== "core") return -1;
      if (a.subjectType !== "core" && b.subjectType === "core") return 1;
      return a.name.localeCompare(b.name);
    });
  }, [
    transformedSubjects,
    selectedGradeId,
    level.subjects,
    level.gradeLevels,
  ]);

  const coreSubjects = filteredSubjects.filter((s) => s.subjectType === "core");
  const electiveSubjects = filteredSubjects.filter(
    (s) => s.subjectType === "elective",
  );

  const selectedGrade = useMemo(() => {
    return level.gradeLevels?.find((grade) => grade.id === selectedGradeId) || null;
  }, [level.gradeLevels, selectedGradeId]);

  const handleSaveSubject = (updatedSubject: Subject) => {
    console.log("Save updated subject:", updatedSubject);
  };

  if (!selectedGrade) return null;

  return (
    <div className="space-y-3">
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/40">
          <button
            type="button"
            onClick={() => setShowSubjects(!showSubjects)}
            className="flex w-full items-center justify-between px-3 py-2.5 text-left sm:px-4"
          >
            <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
              Subjects
              {!showSubjects && filteredSubjects.length > 0 && (
                <span className="ml-1.5 font-normal text-slate-400">
                  ({filteredSubjects.length})
                </span>
              )}
            </span>
            {showSubjects ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </button>

          {showSubjects && (
            <div className="space-y-3 border-t border-slate-100 px-2.5 py-2.5 dark:border-slate-800 sm:px-4 sm:py-3">
              {filteredSubjects.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-400">No subjects</p>
              ) : (
                <div className="space-y-3">
                  {coreSubjects.length > 0 && (
                      <SubjectList
                        title="Core"
                        hint="Required"
                        accent="emerald"
                        subjects={coreSubjects}
                        getTeacherForSubject={getTeacherForSubject}
                        onAssignTeacher={onAssignTeacher}
                        onEdit={(s) => setEditingSubject(s._tenantSubject)}
                      />
                    )}
                  {electiveSubjects.length > 0 && (
                      <SubjectList
                        title="Elective"
                        hint="Optional"
                        accent="amber"
                        subjects={electiveSubjects}
                        getTeacherForSubject={getTeacherForSubject}
                        onAssignTeacher={onAssignTeacher}
                        onEdit={(s) => setEditingSubject(s._tenantSubject)}
                      />
                    )}
                </div>
              )}
            </div>
          )}
        </div>

        {feeSummary && feeSummary.students.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Fees
              </h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-slate-500"
                onClick={() => setShowFeeDetails(!showFeeDetails)}
              >
                {showFeeDetails ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            {showFeeDetails && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60">
                      <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Student
                      </th>
                      <th className="px-4 py-2 text-right text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Owed
                      </th>
                      <th className="px-4 py-2 text-right text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Paid
                      </th>
                      <th className="px-4 py-2 text-right text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {feeSummary.students.map((student) => (
                      <tr
                        key={student.admissionNumber}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-4 py-2.5">
                          <p className="font-medium text-slate-800 dark:text-slate-100">
                            {student.studentName}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {student.admissionNumber}
                          </p>
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-300">
                          {student.feeSummary.totalOwed.toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-right text-emerald-600 dark:text-emerald-400">
                          {student.feeSummary.totalPaid.toLocaleString()}
                        </td>
                        <td
                          className={cn(
                            "px-4 py-2.5 text-right font-medium",
                            student.feeSummary.balance === 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400",
                          )}
                        >
                          {student.feeSummary.balance.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {editingSubject && (
          <EditSubjectDialog
            subject={{
              id: editingSubject.id,
              name:
                editingSubject.subject?.name ||
                editingSubject.customSubject?.name ||
                "Unknown Subject",
              code:
                editingSubject.subject?.code ||
                editingSubject.customSubject?.code ||
                "",
              subjectType: editingSubject.subjectType,
              category:
                editingSubject.subject?.category ||
                editingSubject.customSubject?.category ||
                null,
              department:
                editingSubject.subject?.department ||
                editingSubject.customSubject?.department ||
                null,
              shortName:
                editingSubject.subject?.shortName ||
                editingSubject.customSubject?.shortName ||
                null,
              isCompulsory: editingSubject.isCompulsory,
              totalMarks: editingSubject.totalMarks,
              passingMarks: editingSubject.passingMarks,
              creditHours: editingSubject.creditHours,
              curriculum: editingSubject.curriculum.name,
            }}
            onClose={() => setEditingSubject(null)}
            onSave={handleSaveSubject}
            isOpen={!!editingSubject}
            tenantSubjectId={editingSubject.id}
          />
        )}
      </div>
    );
}

function SubjectList({
  title,
  hint,
  accent,
  subjects,
  getTeacherForSubject,
  onAssignTeacher,
  onEdit,
}: {
  title: string;
  hint: string;
  accent: "emerald" | "amber";
  subjects: Array<{
    id: string;
    name: string;
    code: string;
    tenantSubjectIds: string[];
    _tenantSubject: TenantSubject;
  }>;
  getTeacherForSubject: (
    tenantSubjectIds: string[],
    meta?: { _tenantSubject: TenantSubject; name: string; code: string },
  ) => string | undefined;
  onAssignTeacher?: () => void;
  onEdit: (s: {
    id: string;
    name: string;
    code: string;
    _tenantSubject: TenantSubject;
  }) => void;
}) {
  const dot = accent === "emerald" ? "bg-emerald-500" : "bg-amber-400";

  return (
    <section>
      <div className="mb-1.5 flex items-center gap-1.5 px-0.5">
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dot)} />
        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
          {title} · {hint}
        </p>
      </div>
      <ul className="overflow-hidden rounded-lg border border-slate-200/80 dark:border-slate-800">
          {subjects.map((s) => {
            const actionButtons = (
              <ClassActionBar
                layout="icons"
                actions={[
                  {
                    id: "edit",
                    label: "Edit subject",
                    tooltip: "Edit subject settings",
                    icon: Edit,
                    onClick: () => onEdit(s),
                  },
                  {
                    id: "copy",
                    label: "Copy code",
                    tooltip: s.code
                      ? `Copy subject code (${s.code})`
                      : "Copy subject code",
                    icon: Copy,
                    onClick: () => {
                      if (s.code) {
                        navigator.clipboard.writeText(s.code);
                        toast.success("Subject code copied");
                      }
                    },
                    disabled: !s.code,
                    disabledReason: "This subject has no code",
                  },
                ]}
              />
            );

            return (
              <li
                key={s.id}
                className="border-b border-slate-100 px-2.5 py-2 last:border-b-0 dark:border-slate-800 sm:flex sm:items-center sm:gap-2 sm:px-3"
              >
                <div className="flex items-start justify-between gap-2 sm:min-w-0 sm:flex-1">
                  <span
                    className="min-w-0 flex-1 text-xs font-medium leading-snug text-slate-800 dark:text-slate-100 sm:truncate"
                    title={s.name}
                  >
                    {s.name}
                  </span>
                  <div className="shrink-0 sm:hidden">{actionButtons}</div>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2 sm:mt-0 sm:shrink-0">
                  <SubjectTeacherBadge
                    teacherName={getTeacherForSubject(s.tenantSubjectIds, {
                      _tenantSubject: s._tenantSubject,
                      name: s.name,
                      code: s.code,
                    })}
                    onAssign={onAssignTeacher}
                    className="max-w-full sm:max-w-[5.5rem]"
                  />
                  <div className="hidden sm:block">{actionButtons}</div>
                </div>
              </li>
            );
          })}
        </ul>
    </section>
  );
}
