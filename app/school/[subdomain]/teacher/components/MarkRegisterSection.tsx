import React, { useState, useEffect, useMemo } from "react";
import { CheckCircle2, XCircle, ChevronLeft, Loader2, CalendarDays, Users, ClipboardList, Home } from "lucide-react";
import { useTeacherData } from "@/lib/hooks/useTeacherData";
import {
  fetchStudentsByGrade,
  markAttendance as saveAttendance,
  type AttendanceStudent,
} from "@/lib/teacher/attendance";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function studentDisplayName(student: AttendanceStudent): string {
  return student.user?.name?.trim() || student.admission_number;
}

export default function MarkRegisterSection({
  subdomain,
  onBack,
}: {
  subdomain?: string;
  onBack?: () => void;
}) {
  const {
    teacher,
    loading: teacherLoading,
    error: teacherError,
    getClassTeacherClasses,
  } = useTeacherData();

  // Attendance is taken by the class teacher, so only their classes appear.
  const classes = useMemo(
    () => getClassTeacherClasses(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [teacher],
  );

  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const selectedClass = classes.find((item) => item.id === selectedClassId);
  const gradeId = selectedClass?.id ?? "";
  const streamId = selectedClass?.streamId;
  const studentsToShow = showAll ? students : students.slice(0, 25);
  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  useEffect(() => {
    if (!gradeId || !subdomain) return;

    const fetchStudents = async () => {
      try {
        setStudentsLoading(true);
        setError(null);
        const fetchedStudents = await fetchStudentsByGrade(
          subdomain,
          gradeId,
          streamId,
        );
        setStudents(fetchedStudents);
        setAttendance(
          Object.fromEntries(fetchedStudents.map((student) => [student.id, true])),
        );
        setShowAll(false);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to load students. Please try again.");
        setStudents([]);
        setAttendance({});
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchStudents();
  }, [gradeId, streamId, subdomain]);

  const handleToggle = (id: string) => {
    setAttendance((a) => ({ ...a, [id]: !a[id] }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subdomain || !gradeId || students.length === 0) return;

    setSaving(true);
    setSuccess(false);
    setError(null);

    const today = new Date().toISOString().slice(0, 10);

    try {
      await saveAttendance(subdomain, {
        date: today,
        gradeId,
        streamId,
        attendanceRecords: students.map((student) => ({
          studentId: student.id,
          status: attendance[student.id] ? "PRESENT" : "ABSENT",
        })),
      });
      setSuccess(true);
    } catch (err) {
      console.error("Error saving attendance:", err);
      setError("Failed to save attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (teacherLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fadeIn">
        <div className="w-16 h-16 flex items-center justify-center bg-primary text-white mb-4 shadow-lg">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <div className="text-lg font-semibold text-primary mb-2">Loading...</div>
        <div className="text-muted-foreground text-sm">Fetching your assigned classes.</div>
      </div>
    );
  }

  if (teacherError && !teacher) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fadeIn">
        <div className="w-16 h-16 flex items-center justify-center bg-destructive text-white mb-4 shadow-lg">
          <XCircle className="w-8 h-8" />
        </div>
        <div className="text-lg font-semibold text-destructive mb-2">Unable to Load Profile</div>
        <div className="text-muted-foreground text-sm mb-6">{teacherError}</div>
        <button
          className="px-4 py-2 bg-muted text-foreground font-semibold hover:bg-muted/90 transition shadow"
          onClick={onBack}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fadeIn">
        <div className="w-16 h-16 flex items-center justify-center bg-muted text-muted-foreground mb-4 shadow-lg">
          <Users className="w-8 h-8" />
        </div>
        <div className="text-lg font-semibold text-foreground mb-2">Not a class teacher</div>
        <div className="text-muted-foreground text-sm mb-6 text-center max-w-md">
          Only the class teacher of a class can take its register. Ask an administrator to assign you a class.
        </div>
        <button
          className="px-4 py-2 bg-primary text-white font-semibold hover:bg-primary/90 transition shadow"
          onClick={onBack}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fadeIn">
        <div className="w-16 h-16 flex items-center justify-center bg-primary text-white mb-4 shadow-lg">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="text-lg font-semibold text-primary mb-2">Register Marked!</div>
        <div className="text-muted-foreground text-sm mb-6">
          Attendance for {selectedClass?.name ?? "the class"} has been saved. Students and parents will be notified.
        </div>
        <button
          className="px-4 py-2 bg-primary text-white font-semibold hover:bg-primary/90 transition shadow"
          onClick={onBack}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl animate-fadeIn overflow-x-hidden">
      <form
        onSubmit={handleSave}
        className="flex w-full flex-col overflow-hidden rounded-2xl border border-border/90 bg-card shadow-[0_1px_2px_rgba(20,32,28,0.04),0_24px_60px_-40px_rgba(20,32,28,0.4)]"
      >
        <div className="relative flex flex-col items-center gap-4 border-b border-border/70 px-4 pb-6 pt-8 sm:px-8">
          <button
            type="button"
            className="tp-focus absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11.5px] font-semibold text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground sm:left-5 sm:top-5"
            onClick={onBack}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <button
            type="button"
            className="tp-focus absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11.5px] font-semibold text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground sm:right-5 sm:top-5"
            onClick={onBack}
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </button>

          <div className="flex flex-col items-center gap-2 pt-2">
            <span className="mb-1 flex size-11 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
              <CalendarDays className="size-5" strokeWidth={1.8} />
            </span>
            <span className="text-center font-display text-[1.35rem] leading-tight tracking-[-0.01em] text-foreground">
              {formatDate(new Date())}
            </span>
          </div>

          <div className="w-full max-w-xs sm:max-w-sm">
            <label className="mb-1.5 block text-center text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
              Class
            </label>
            <Select
              value={selectedClassId}
              onValueChange={setSelectedClassId}
            >
              <SelectTrigger className="h-10 w-full rounded-xl border-border/80 bg-card text-[13px]">
                <SelectValue placeholder="Choose your class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.streamName ? `${item.name} · ${item.streamName}` : item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedClass && (
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/[0.08] px-3.5 py-1.5 text-[12px] font-semibold text-primary">
              <Users className="w-5 h-5" />
              {selectedClass.streamName
                ? `${selectedClass.name} · ${selectedClass.streamName}`
                : selectedClass.name}
              {!studentsLoading && students.length > 0 && (
                <span className="opacity-90">· {students.length} students</span>
              )}
            </span>
          )}

          <div className="mt-1 flex flex-col items-center">
            <h2 className="flex items-center gap-2 font-display text-[1.5rem] leading-tight tracking-[-0.01em] text-foreground">
              <ClipboardList className="size-5 text-primary/80" strokeWidth={1.8} />
              Take the register
            </h2>
            {!studentsLoading && students.length > 0 && (
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/[0.07] px-3 py-1 text-[11.5px] font-semibold text-primary">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {presentCount} present
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-[11.5px] font-semibold text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                  <XCircle className="w-3.5 h-3.5" /> {absentCount} absent
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mx-4 sm:mx-8 px-4 py-3 bg-destructive/10 text-destructive text-sm rounded border border-destructive/20">
            {error}
          </div>
        )}

        {studentsLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-muted-foreground text-sm">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Users className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm text-center">
              No students enrolled in {selectedClass?.name ?? "this class"} yet.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto px-1 sm:px-4 pb-2 sm:pb-4 w-full">
              <table className="min-w-full border overflow-hidden shadow-sm text-xs sm:text-sm">
                <thead>
                  <tr className="bg-primary/10 text-primary text-left">
                    <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold">#</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold">Student</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold">Adm No.</th>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsToShow.map((student, idx) => (
                    <tr
                      key={student.id}
                      className={
                        `transition-all ${idx % 2 === 0 ? "bg-primary/5" : "bg-white"} hover:bg-primary/10` +
                        " border-b last:border-b-0"
                      }
                    >
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-muted-foreground font-mono">
                        {idx + 1}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-foreground">
                        {studentDisplayName(student)}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-muted-foreground">
                        {student.admission_number}
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                        <button
                          type="button"
                          className={`tp-focus inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition-colors sm:px-4 sm:text-[12.5px]
                        ${
                          attendance[student.id]
                            ? "bg-primary/[0.08] text-primary hover:bg-primary/[0.12]"
                            : "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-300"
                        }`}
                          onClick={() => handleToggle(student.id)}
                        >
                          {attendance[student.id] ? (
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                          {attendance[student.id] ? "Present" : "Absent"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {students.length > 25 && (
              <div className="flex justify-center mt-2">
                <button
                  type="button"
                  className="px-4 py-1 bg-primary text-white font-semibold shadow hover:bg-primary/90 transition text-sm"
                  onClick={() => setShowAll((v) => !v)}
                >
                  {showAll ? "Show Less" : `Show All (${students.length} students)`}
                </button>
              </div>
            )}

            <div className="flex justify-end px-3 sm:px-8 pb-4 sm:pb-8 mt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-primary/80 text-white font-bold text-base sm:text-lg shadow-lg hover:scale-105 hover:from-primary/90 hover:to-primary/70 transition disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                )}{" "}
                Save Register
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
