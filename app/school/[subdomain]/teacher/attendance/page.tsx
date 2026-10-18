'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Search,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTeacherData } from '@/lib/hooks/useTeacherData';
import {
  fetchAttendanceByDate,
  fetchStudentsByGrade,
  markAttendance,
  type AttendanceStatus,
  type AttendanceStudent,
} from '@/lib/teacher/attendance';

const STATUS_META: Record<
  AttendanceStatus,
  { label: string; dot: string; chip: string }
> = {
  present: {
    label: 'Present',
    dot: 'bg-emerald-500',
    chip: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  },
  late: {
    label: 'Late',
    dot: 'bg-amber-500',
    chip: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  },
  absent: {
    label: 'Absent',
    dot: 'bg-rose-500',
    chip: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
  },
  suspended: {
    label: 'Suspended',
    dot: 'bg-slate-400',
    chip: 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
};

const STATUS_ORDER: AttendanceStatus[] = ['present', 'late', 'absent', 'suspended'];

function todayYmd(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function formatLongDate(ymd: string): string {
  return new Date(`${ymd}T12:00:00Z`).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function displayName(student: AttendanceStudent): string {
  return student.user?.name?.trim() || student.admission_number || 'Learner';
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function StatChip({
  status,
  count,
}: {
  status: AttendanceStatus;
  count: number;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium',
        meta.chip,
      )}
    >
      <span className={cn('size-1.5 rounded-full', meta.dot)} />
      {meta.label}
      <span className="font-semibold">{count}</span>
    </span>
  );
}

export default function TeacherAttendancePage() {
  const params = useParams();
  const subdomain =
    typeof params.subdomain === 'string'
      ? params.subdomain
      : Array.isArray(params.subdomain)
        ? params.subdomain[0]
        : '';

  const {
    teacher,
    loading: teacherLoading,
    error: teacherError,
    getFormattedGradeLevels,
  } = useTeacherData();

  const grades = useMemo(
    () => getFormattedGradeLevels(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [teacher],
  );

  const [gradeId, setGradeId] = useState('');
  const [date, setDate] = useState(todayYmd());
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});
  const [existingCount, setExistingCount] = useState(0);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!gradeId && grades.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGradeId(grades[0].id);
    }
  }, [grades, gradeId]);

  const loadRegister = useCallback(async () => {
    if (!subdomain || !gradeId) return;
    setLoadingRoster(true);
    setRosterError(null);
    setSavedAt(null);
    try {
      const [roster, existing] = await Promise.all([
        fetchStudentsByGrade(subdomain, gradeId),
        fetchAttendanceByDate(subdomain, date, gradeId),
      ]);
      setStudents(roster);
      setExistingCount(existing.length);
      const fromExisting = new Map(
        existing.map((record) => [record.studentId, record.status]),
      );
      setMarks(
        Object.fromEntries(
          roster.map((student) => [
            student.id,
            fromExisting.get(student.id) ?? 'present',
          ]),
        ),
      );
    } catch (err) {
      setStudents([]);
      setMarks({});
      setExistingCount(0);
      setRosterError(
        err instanceof Error ? err.message : 'Could not load this class register',
      );
    } finally {
      setLoadingRoster(false);
    }
  }, [subdomain, gradeId, date]);

  useEffect(() => {
    if (!gradeId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRegister();
  }, [loadRegister, gradeId]);

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setMarks((current) => ({ ...current, [studentId]: status }));
    setSavedAt(null);
  };

  const counts = useMemo(() => {
    const base: Record<AttendanceStatus, number> = {
      present: 0,
      late: 0,
      absent: 0,
      suspended: 0,
    };
    for (const student of students) {
      const status = marks[student.id] ?? 'present';
      base[status] += 1;
    }
    return base;
  }, [students, marks]);

  const visibleStudents = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...students]
      .sort((a, b) => displayName(a).localeCompare(displayName(b)))
      .filter((student) => {
        if (!needle) return true;
        return (
          displayName(student).toLowerCase().includes(needle) ||
          student.admission_number.toLowerCase().includes(needle)
        );
      });
  }, [students, query]);

  const handleMarkAllPresent = () => {
    setMarks(Object.fromEntries(students.map((student) => [student.id, 'present'])));
    setSavedAt(null);
  };

  const handleSave = async () => {
    if (!subdomain || !gradeId || students.length === 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      await markAttendance(subdomain, {
        date,
        gradeId,
        attendanceRecords: students.map((student) => ({
          studentId: student.id,
          status: marks[student.id] ?? 'present',
        })),
      });
      const saved = await fetchAttendanceByDate(subdomain, date, gradeId);
      setExistingCount(saved.length);
      setSavedAt(
        new Date().toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        }),
      );
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Could not save the register',
      );
    } finally {
      setSaving(false);
    }
  };

  if (teacherLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (teacherError && !teacher) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <AlertCircle className="mx-auto size-5 text-rose-500" />
          <h1 className="mt-2 text-base font-semibold">Attendance unavailable</h1>
          <p className="mt-1 text-sm text-muted-foreground">{teacherError}</p>
        </div>
      </div>
    );
  }

  if (grades.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <Users className="mx-auto size-6 text-muted-foreground" />
          <h1 className="mt-3 text-base font-semibold">No classes assigned</h1>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            You can mark attendance once an administrator assigns you to a class.
          </p>
        </div>
      </div>
    );
  }

  const selectedGrade = grades.find((grade) => grade.id === gradeId);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-5 lg:px-0 lg:py-0">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Attendance
          </p>
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight">
            {selectedGrade?.name ?? 'Register'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{formatLongDate(date)}</p>
        </div>
        <Button
          size="sm"
          onClick={() => void handleSave()}
          disabled={saving || loadingRoster || students.length === 0}
        >
          {saving ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <ClipboardCheck className="size-3.5" />
          )}
          Save register
        </Button>
      </header>

      <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Class
          </label>
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
            value={gradeId}
            onChange={(event) => setGradeId(event.target.value)}
          >
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Date
          </label>
          <Input
            type="date"
            value={date}
            max={todayYmd()}
            onChange={(event) => setDate(event.target.value || todayYmd())}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDate(todayYmd())}
          disabled={date === todayYmd()}
        >
          <CalendarDays className="size-3.5" />
          Today
        </Button>
      </div>

      {existingCount > 0 && !savedAt && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          A register already exists for this class and date. Saving will replace it.
        </div>
      )}

      {savedAt && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 className="size-3.5 shrink-0" />
          Register saved at {savedAt}. Parents and guardians can see the update.
        </div>
      )}

      {saveError && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {saveError}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_ORDER.map((status) => (
          <StatChip key={status} status={status} count={counts[status]} />
        ))}
        <span className="ml-auto text-[11px] text-muted-foreground">
          {students.length} learners
        </span>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-2 border-b border-border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a learner"
              className="h-8 pl-8 text-xs"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={handleMarkAllPresent}
            disabled={students.length === 0}
          >
            Mark all present
          </Button>
        </div>

        {loadingRoster ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : rosterError ? (
          <div className="px-4 py-10 text-center text-sm text-rose-600">
            {rosterError}
          </div>
        ) : visibleStudents.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Users className="mx-auto size-5 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">
              {students.length === 0 ? 'No learners in this class yet' : 'No match'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {students.length === 0
                ? 'Learners appear here once they are enrolled in the class.'
                : 'Try a different name or admission number.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {visibleStudents.map((student) => {
              const status = marks[student.id] ?? 'present';
              const meta = STATUS_META[status];
              return (
                <li
                  key={student.id}
                  className="flex items-center gap-3 px-3 py-2.5"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                    {initials(displayName(student)) || '?'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {displayName(student)}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {student.admission_number}
                      {student.stream?.name ? ` · ${student.stream.name}` : ''}
                    </p>
                  </div>
                  <span
                    className={cn('size-2 shrink-0 rounded-full', meta.dot)}
                    aria-hidden
                  />
                  <select
                    aria-label={`Attendance for ${displayName(student)}`}
                    className={cn(
                      'h-8 w-[112px] shrink-0 rounded-md border border-input bg-background px-1.5 text-xs',
                      status === 'present' && 'text-emerald-700 dark:text-emerald-300',
                      status === 'late' && 'text-amber-700 dark:text-amber-300',
                      status === 'absent' && 'text-rose-700 dark:text-rose-300',
                      status === 'suspended' && 'text-slate-600 dark:text-slate-300',
                    )}
                    value={status}
                    onChange={(event) =>
                      setStatus(student.id, event.target.value as AttendanceStatus)
                    }
                  >
                    {STATUS_ORDER.map((option) => (
                      <option key={option} value={option}>
                        {STATUS_META[option].label}
                      </option>
                    ))}
                  </select>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Attendance saves for the whole class. Saving again replaces the same
          date&apos;s register.
        </p>
        <Button
          onClick={() => void handleSave()}
          disabled={saving || loadingRoster || students.length === 0}
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          Save register
        </Button>
      </div>
    </div>
  );
}
