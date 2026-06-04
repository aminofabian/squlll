"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Edit,
  Plus,
  Receipt,
  UserPlus,
} from "lucide-react";
import type { Level } from "@/lib/types/school-config";
import { EditSubjectDialog } from "../../components/EditSubjectDialog";
import { useGradeLevelFeeSummary } from "@/lib/hooks/useGradeLevelFeeSummary";
import { useClassSubjectsForLevel } from "../utils/useClassSubjectsForLevel";
import { ClassActionBar } from "./ClassActionBar";
import { ClassDetailProgressRing } from "./ClassDetailProgressRing";
import { SubjectTeacherBadge } from "./SubjectTeacherBadge";
import { AssignSubjectTeacherSheet } from "./AssignSubjectTeacherSheet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { TenantSubject } from "@/lib/hooks/useTenantSubjects";

interface ClassSubjectsPanelProps {
  level: Level;
  selectedGradeId: string;
  onAddSubject?: () => void;
}

function formatKes(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ClassSubjectsPanel({
  level,
  selectedGradeId,
  onAddSubject,
}: ClassSubjectsPanelProps) {
  const [editingSubject, setEditingSubject] = useState<TenantSubject | null>(
    null,
  );
  const [assignSubject, setAssignSubject] = useState<{
    tenantSubjectIds: string[];
    name: string;
  } | null>(null);
  const [feesOpen, setFeesOpen] = useState(false);
  const {
    subjects,
    assignedCount,
    totalCount,
    getTeacherForSubject,
    isLoading,
    refetch: refetchSubjectTeachers,
  } = useClassSubjectsForLevel(level, selectedGradeId);
  const { data: feeSummary } = useGradeLevelFeeSummary(selectedGradeId || null);

  const coreSubjects = subjects.filter((s) => s.subjectType === "core");
  const electiveSubjects = subjects.filter((s) => s.subjectType === "elective");
  const unassigned = totalCount - assignedCount;
  const coverage =
    totalCount > 0 ? Math.round((assignedCount / totalCount) * 100) : 0;

  const handleSaveSubject = () => {
    setEditingSubject(null);
    void refetchSubjectTeachers();
  };

  const outstandingBalances =
    feeSummary?.students.filter((s) => s.feeSummary.balance > 0).length ?? 0;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-6">
          <ClassDetailProgressRing value={coverage} size={52} stroke={5} />
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Curriculum & subject teachers
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {isLoading
                ? "Loading subjects…"
                : totalCount === 0
                  ? "No subjects on this level yet"
                  : `${assignedCount} of ${totalCount} subjects have a teacher assigned`}
            </p>
          </div>
          {onAddSubject ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              onClick={onAddSubject}
            >
              <Plus className="h-3.5 w-3.5" />
              Add subject
            </Button>
          ) : null}
        </div>

        {unassigned > 0 && !isLoading ? (
          <div className="border-b-2 border-amber-400/80 bg-amber-100 px-4 py-4 dark:border-amber-600 dark:bg-amber-950/50 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-950 dark:text-amber-50">
                  {unassigned} subject{unassigned !== 1 ? "s" : ""} still need a
                  teacher
                </p>
                <p className="mt-1 text-xs leading-relaxed text-amber-900/90 dark:text-amber-100/90">
                  Assign a teacher on each row below, or set subject assignments
                  in{" "}
                  <Link
                    href="/teachers"
                    className="font-semibold underline underline-offset-2"
                  >
                    Teachers
                  </Link>
                  . Parents see gaps until every subject is covered.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                className="h-9 shrink-0 gap-1.5 bg-amber-800 text-xs text-white hover:bg-amber-900 dark:bg-amber-700 dark:hover:bg-amber-600"
                asChild
              >
                <Link href="/teachers">
                  <UserPlus className="h-3.5 w-3.5" />
                  Go to Teachers
                </Link>
              </Button>
            </div>
          </div>
        ) : null}

        <div className="p-4 sm:p-6">
          {totalCount === 0 && !isLoading ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200/90 py-12 text-center dark:border-slate-700">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Build your class curriculum
              </p>
              <p className="mt-1 max-w-xs text-xs text-slate-500">
                Add subjects from your school catalog, then assign teachers per
                subject.
              </p>
              {onAddSubject ? (
                <Button
                  type="button"
                  size="sm"
                  className="mt-4 bg-[#0073ea] text-xs"
                  onClick={onAddSubject}
                >
                  Add first subject
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="space-y-6">
              {coreSubjects.length > 0 ? (
                <SubjectGroup
                  title="Core subjects"
                  hint="Required for all students"
                  accent="emerald"
                  subjects={coreSubjects}
                  getTeacherForSubject={getTeacherForSubject}
                  onAssignSubject={(s) =>
                    setAssignSubject({
                      tenantSubjectIds: s.tenantSubjectIds,
                      name: s.name,
                    })
                  }
                  onEdit={(s) => setEditingSubject(s._tenantSubject)}
                />
              ) : null}
              {electiveSubjects.length > 0 ? (
                <SubjectGroup
                  title="Electives"
                  hint="Optional pathways"
                  accent="amber"
                  subjects={electiveSubjects}
                  getTeacherForSubject={getTeacherForSubject}
                  onAssignSubject={(s) =>
                    setAssignSubject({
                      tenantSubjectIds: s.tenantSubjectIds,
                      name: s.name,
                    })
                  }
                  onEdit={(s) => setEditingSubject(s._tenantSubject)}
                />
              ) : null}
            </div>
          )}
        </div>
      </div>

      {feeSummary && feeSummary.students.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
          <button
            type="button"
            onClick={() => setFeesOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 sm:px-6"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Receipt className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Fee snapshot
                </h4>
                <p className="text-xs text-slate-500">
                  {feeSummary.students.length} student
                  {feeSummary.students.length !== 1 ? "s" : ""} ·{" "}
                  {outstandingBalances > 0
                    ? `${outstandingBalances} with balance`
                    : "all cleared"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-xs text-slate-400">Outstanding</p>
                <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                  {formatKes(feeSummary.totalFeesOwed - feeSummary.totalFeesPaid)}
                </p>
              </div>
              {feesOpen ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </div>
          </button>

          {feesOpen ? (
            <div className="border-t border-slate-100 dark:border-slate-800">
              <div className="max-h-56 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-slate-50/95 backdrop-blur dark:bg-slate-900/95">
                    <tr className="text-left text-[10px] uppercase tracking-wide text-slate-400">
                      <th className="px-4 py-2.5 sm:px-6">Student</th>
                      <th className="px-4 py-2.5 text-right sm:px-6">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {feeSummary.students.map((student) => (
                      <tr
                        key={student.admissionNumber}
                        className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                      >
                        <td className="px-4 py-2.5 sm:px-6">
                          <span className="font-medium text-slate-800 dark:text-slate-100">
                            {student.studentName}
                          </span>
                        </td>
                        <td
                          className={cn(
                            "px-4 py-2.5 text-right font-semibold tabular-nums sm:px-6",
                            student.feeSummary.balance === 0
                              ? "text-emerald-600"
                              : "text-amber-700",
                          )}
                        >
                          {formatKes(student.feeSummary.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {assignSubject ? (
        <AssignSubjectTeacherSheet
          open={Boolean(assignSubject)}
          onOpenChange={(open) => {
            if (!open) setAssignSubject(null);
          }}
          tenantSubjectIds={assignSubject.tenantSubjectIds}
          subjectName={assignSubject.name}
          onAssigned={() => void refetchSubjectTeachers()}
        />
      ) : null}

      {editingSubject ? (
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
      ) : null}
    </div>
  );
}

function SubjectGroup({
  title,
  hint,
  accent,
  subjects,
  getTeacherForSubject,
  onAssignSubject,
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
    ids: string[],
    meta?: { _tenantSubject: TenantSubject; name: string; code: string },
  ) => string | undefined;
  onAssignSubject: (s: {
    id: string;
    name: string;
    tenantSubjectIds: string[];
  }) => void;
  onEdit: (s: {
    id: string;
    name: string;
    code: string;
    _tenantSubject: TenantSubject;
  }) => void;
}) {
  const borderAccent =
    accent === "emerald"
      ? "border-l-emerald-500"
      : "border-l-amber-400";

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
            {title}
          </h4>
          <p className="text-[10px] text-slate-400">{hint}</p>
        </div>
        <span className="text-[10px] font-medium tabular-nums text-slate-400">
          {subjects.length}
        </span>
      </div>
      <ul className="space-y-2">
        {subjects.map((s) => {
          const teacher = getTeacherForSubject(s.tenantSubjectIds, {
            _tenantSubject: s._tenantSubject,
            name: s.name,
            code: s.code,
          });
          const staffed = Boolean(teacher);
          return (
            <li
              key={s.id}
              className={cn(
                "flex flex-col gap-3 rounded-xl border border-slate-200/70 border-l-[3px] bg-white px-3 py-3 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700/80 dark:bg-slate-900/30 sm:flex-row sm:items-center sm:justify-between sm:px-4",
                staffed ? borderAccent : "border-l-slate-300 dark:border-l-slate-600",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {s.name}
                </p>
                {s.code ? (
                  <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                    {s.code}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <SubjectTeacherBadge
                  teacherName={teacher}
                  onAssign={() => onAssignSubject(s)}
                />
                <ClassActionBar
                  layout="icons"
                  actions={[
                    {
                      id: "edit",
                      label: "Edit",
                      tooltip: "Edit subject",
                      icon: Edit,
                      onClick: () => onEdit(s),
                    },
                    {
                      id: "copy",
                      label: "Copy code",
                      tooltip: "Copy subject code",
                      icon: Copy,
                      onClick: () => {
                        if (s.code) {
                          void navigator.clipboard.writeText(s.code);
                          toast.success("Code copied");
                        }
                      },
                      disabled: !s.code,
                    },
                  ]}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
