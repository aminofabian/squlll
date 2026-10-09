"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarCheck,
  Check,
  ClipboardCheck,
  Clock3,
  Loader2,
  UserCheck,
  UserMinus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import {
  fetchAttendanceByDate,
  fetchStudentsByGrade,
  markAttendance,
  type AttendanceStatus,
} from "@/lib/school/attendance";
import {
  SchoolEmpty,
  SchoolLoading,
  SchoolPage,
  SchoolPanel,
  SchoolStat,
  fieldShell,
  labelClass,
  outlineButtonClass,
  primaryButtonClass,
  selectShell,
  thClass,
} from "@/components/school/SchoolContentPage";

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "LATE", label: "Late" },
  { value: "SUSPENDED", label: "Suspended" },
];

const STATUS_ACTIVE_CLASS: Record<AttendanceStatus, string> = {
  PRESENT: "bg-[#246a59] text-white",
  ABSENT: "bg-red-600 text-white",
  LATE: "bg-amber-500 text-white",
  SUSPENDED: "bg-slate-600 text-white",
};

function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const parsed = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusControl({
  value,
  onChange,
}: {
  value: AttendanceStatus;
  onChange: (status: AttendanceStatus) => void;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-none border border-[#1a4d42]/15 dark:border-white/15">
      {STATUS_OPTIONS.map((option, index) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "px-2.5 py-1.5 text-[11px] font-medium transition-colors",
              index > 0 && "border-l border-[#1a4d42]/15 dark:border-white/15",
              active
                ? STATUS_ACTIVE_CLASS[option.value]
                : "bg-white text-[#1a4d42]/70 hover:bg-[#f8fbfa] dark:bg-[#0c1a17] dark:text-white/60 dark:hover:bg-white/5",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Daily attendance register. Pick a grade and a date, load the class list plus
 * any attendance already recorded, then save one record per student.
 *
 * Edited rows live in a `draft` keyed by the current grade/date, so the displayed
 * status is always derived (saved value → PRESENT) without syncing via effects.
 */
export function AttendancesPanel() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const queryClient = useQueryClient();
  const config = useSchoolConfigStore((state) => state.config);
  const getAllGradeLevels = useSchoolConfigStore(
    (state) => state.getAllGradeLevels,
  );

  const gradeOptions = useMemo(
    () =>
      config
        ? getAllGradeLevels().flatMap((level) =>
            level.grades.map((grade) => ({
              id: grade.id,
              name: grade.name,
              levelName: level.levelName,
            })),
          )
        : [],
    [config, getAllGradeLevels],
  );

  const [gradeId, setGradeId] = useState("");
  const [date, setDate] = useState<string>(() => todayIso());
  const [draft, setDraft] = useState<{
    key: string;
    statuses: Record<string, AttendanceStatus>;
  }>({ key: "", statuses: {} });

  const registerKey = `${gradeId}|${date}`;

  const studentsQuery = useQuery({
    queryKey: ["attendanceStudents", subdomain, gradeId],
    queryFn: () => fetchStudentsByGrade(subdomain, gradeId),
    enabled: Boolean(subdomain && gradeId),
  });

  const attendanceQuery = useQuery({
    queryKey: ["attendanceByDate", subdomain, gradeId, date],
    queryFn: () => fetchAttendanceByDate(subdomain, date, gradeId),
    enabled: Boolean(subdomain && gradeId && date),
  });

  const students = useMemo(
    () => studentsQuery.data ?? [],
    [studentsQuery.data],
  );

  const savedStatuses = useMemo(() => {
    const map: Record<string, AttendanceStatus> = {};
    for (const record of attendanceQuery.data ?? []) {
      map[record.studentId] = record.status;
    }
    return map;
  }, [attendanceQuery.data]);

  // Saved value wins over the default; drafted (unsaved) edits win over both.
  const statuses = useMemo(() => {
    const next: Record<string, AttendanceStatus> = {};
    for (const student of students) {
      next[student.id] = savedStatuses[student.id] ?? "PRESENT";
    }
    if (draft.key === registerKey) {
      for (const [studentId, status] of Object.entries(draft.statuses)) {
        if (studentId in next) next[studentId] = status;
      }
    }
    return next;
  }, [students, savedStatuses, draft, registerKey]);

  const counts = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    for (const student of students) {
      switch (statuses[student.id]) {
        case "ABSENT":
          absent += 1;
          break;
        case "LATE":
          late += 1;
          break;
        default:
          present += 1;
          break;
      }
    }
    return { present, absent, late };
  }, [students, statuses]);

  const saveMutation = useMutation({
    mutationFn: () =>
      markAttendance(subdomain, {
        date,
        gradeId,
        attendanceRecords: students.map((student) => ({
          studentId: student.id,
          status: statuses[student.id] ?? "PRESENT",
        })),
      }),
    onSuccess: (records) => {
      toast.success(
        `Attendance saved for ${records.length} student${
          records.length === 1 ? "" : "s"
        }`,
      );
      setDraft({ key: "", statuses: {} });
      void queryClient.invalidateQueries({
        queryKey: ["attendanceByDate", subdomain, gradeId, date],
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to save attendance",
      );
    },
  });

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setDraft((prev) => ({
      key: registerKey,
      statuses: {
        ...(prev.key === registerKey ? prev.statuses : {}),
        [studentId]: status,
      },
    }));
  };

  const markAllPresent = () => {
    const next: Record<string, AttendanceStatus> = {};
    for (const student of students) {
      next[student.id] = "PRESENT";
    }
    setDraft({ key: registerKey, statuses: next });
  };

  const loading = studentsQuery.isLoading || attendanceQuery.isLoading;
  const error = studentsQuery.error ?? attendanceQuery.error;
  const ready = Boolean(gradeId && date && students.length > 0);
  const alreadyRecorded = (attendanceQuery.data?.length ?? 0) > 0;

  return (
    <SchoolPage
      eyebrow="Academics"
      title="Attendances"
      subtitle="Record and review daily attendance for a class — pick a grade and date, then save the register."
      actions={
        <Button
          className={primaryButtonClass}
          disabled={!ready || saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Save attendance
        </Button>
      }
    >
      <SchoolPanel
        icon={ClipboardCheck}
        title="Attendance register"
        actions={
          gradeId && !loading ? (
            <Badge variant={alreadyRecorded ? "secondary" : "outline"}>
              {alreadyRecorded ? "Already recorded" : "Not recorded yet"}
            </Badge>
          ) : null
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className={labelClass}>Grade</Label>
            <Select value={gradeId} onValueChange={setGradeId}>
              <SelectTrigger className={selectShell}>
                <SelectValue placeholder="Select a grade" />
              </SelectTrigger>
              <SelectContent>
                {gradeOptions.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    No grades configured
                  </SelectItem>
                ) : (
                  gradeOptions.map((grade) => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.name} · {grade.levelName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Date</Label>
            <Input
              type="date"
              className={fieldShell}
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
        </div>

        {gradeId ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              className={outlineButtonClass}
              disabled={students.length === 0}
              onClick={markAllPresent}
            >
              <UserCheck className="h-4 w-4" />
              Mark all present
            </Button>
            <span className="text-xs text-[#1a4d42]/50 dark:text-white/40">
              {formatDate(date)}
            </span>
          </div>
        ) : null}
      </SchoolPanel>

      {!gradeId ? (
        <SchoolPanel>
          <SchoolEmpty
            icon={CalendarCheck}
            title="Pick a grade to begin"
            description="Choose a grade and a date to load the class list and mark attendance."
          />
        </SchoolPanel>
      ) : loading ? (
        <SchoolPanel>
          <SchoolLoading label="Loading class register…" />
        </SchoolPanel>
      ) : error ? (
        <SchoolPanel>
          <SchoolEmpty
            icon={UserMinus}
            title="Could not load attendance"
            description={
              error instanceof Error ? error.message : "Please try again."
            }
          />
        </SchoolPanel>
      ) : students.length === 0 ? (
        <SchoolPanel>
          <SchoolEmpty
            icon={Users}
            title="No students in this grade"
            description="There are no students enrolled in the selected grade yet."
          />
        </SchoolPanel>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <SchoolStat
              label="Present"
              value={counts.present}
              icon={UserCheck}
            />
            <SchoolStat label="Absent" value={counts.absent} icon={UserMinus} />
            <SchoolStat label="Late" value={counts.late} icon={Clock3} />
          </div>

          <SchoolPanel
            title="Class list"
            icon={ClipboardCheck}
            actions={<Badge variant="secondary">{students.length} students</Badge>}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#1a4d42]/10 text-left dark:border-white/10">
                    <th className={thClass}>Student</th>
                    <th className={thClass}>Admission no.</th>
                    <th className={thClass}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-[#1a4d42]/6 last:border-0 dark:border-white/5"
                    >
                      <td className="py-2.5 pr-3 font-medium text-[#0a1f1a] dark:text-white">
                        {student.user?.name ?? "Unnamed student"}
                      </td>
                      <td className="py-2.5 pr-3 text-[#1a4d42]/70 dark:text-white/60">
                        {student.admission_number}
                      </td>
                      <td className="py-2.5">
                        <StatusControl
                          value={statuses[student.id] ?? "PRESENT"}
                          onChange={(status) => setStatus(student.id, status)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SchoolPanel>
        </>
      )}
    </SchoolPage>
  );
}
