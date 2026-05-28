"use client";

import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import { useTimetableStore } from "@/lib/stores/useTimetableStoreNew";
import type { Break } from "@/lib/types/timetable";
import {
  useSelectedGradeTimetable,
  useTimetableGrid,
  useGradeStatistics,
  usePeriodSlots,
} from "./hooks/useTimetableData";
import { useAllConflicts } from "./hooks/useTimetableConflictsNew";
import { LessonEditDialog } from "./components/LessonEditDialog";
import { TimeslotEditDialog } from "./components/TimeslotEditDialog";
import { BreakEditDialog } from "./components/BreakEditDialog";
import { BulkScheduleDrawer } from "./components/BulkScheduleDrawer";
import { BulkBreaksDrawer } from "./components/BulkBreaksDrawer";
import { BulkLessonEntryDrawer } from "./components/BulkLessonEntryDrawer";
import { AdminTimetableGrid } from "./components/AdminTimetableGrid";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSelectedTerm } from "@/lib/hooks/useSelectedTerm";
import { useCurrentAcademicYear } from "@/lib/hooks/useAcademicYears";
import { Button } from "@/components/ui/button";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Clock,
  Trash2,
  Plus,
  Calendar,
  BookOpen,
  Coffee,
  Settings,
  GraduationCap,
  AlertCircle,
  LayoutGrid,
  MoreHorizontal,
  Eye,
  EyeOff,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { DashboardSearchSidebar } from "@/app/school/[subdomain]/(pages)/dashboard/components/DashboardSearchSidebar";
import { useSchoolConfig } from "@/lib/hooks/useSchoolConfig";
import { useStudentsStore } from "@/lib/stores/useStudentsStore";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateAcademicYearModal } from "@/app/school/[subdomain]/(pages)/dashboard/components/CreateAcademicYearModal";
import { CreateTermModal } from "@/app/school/[subdomain]/(pages)/dashboard/components/CreateTermModal";
import { SCHOOL_DAYS } from "@/lib/constants/breakTypes";

export default function SmartTimetableNew() {
  const { selectedTerm } = useSelectedTerm();
  const {
    academicYears,
    loading: academicYearsLoading,
    refetch: refetchAcademicYears,
  } = useCurrentAcademicYear();

  const {
    grades,
    timeSlots,
    selectedGradeId,
    selectedTermId,
    setSelectedGrade,
    setSelectedTerm: setStoreTerm,
    showConflicts,
    toggleConflicts,
    loadTimeSlots,
    loadDayTemplates,
    loadDayTemplatePeriods,
    loadGrades,
    loadSubjects,
    loadTeachers,
    loadEntries,
    loadSchoolTimetable,
    loadBreaks,
    deleteTimeSlot,
    deleteAllTimeSlots,
    deleteTimetableEntry,
    deleteAllBreaks,
    deleteAllBreaksByTerm,
    deleteBreaksByType,
    addPeriodsToDayTemplate,
    deleteEntriesForTerm,
    deleteTimetableForTerm,
  } = useTimetableStore();
  const { toast } = useToast();

  useEffect(() => {
    if (selectedTerm?.id && selectedTerm.id !== selectedTermId) {
      setStoreTerm(selectedTerm.id);
    }
  }, [selectedTerm?.id, selectedTermId, setStoreTerm]);

  const hasAcademicYear = academicYears.length > 0;
  const hasTerm = !!selectedTerm;
  const hasTimeSlots = timeSlots.length > 0;
  const hasGradeSelected = !!selectedGradeId;
  const hasLessons = useMemo(
    () =>
      useTimetableStore
        .getState()
        .entries.filter((e) => e.gradeId === selectedGradeId).length > 0,
    [selectedGradeId],
  );

  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  useEffect(() => {
    setIsLoadingInitial(true);
    const termId = selectedTerm?.id || selectedTermId;

    const basePromises = [
      loadGrades().catch((err) => console.error("Failed loading grades:", err)),
      loadSubjects().catch((err) =>
        console.error("Failed loading subjects:", err),
      ),
      loadBreaks().catch((err) => console.error("Failed loading breaks:", err)),
    ];

    const termPromises = termId
      ? [
          loadTimeSlots(termId).catch((err) => {
            console.error("Failed loading time slots:", err);
          }),
          loadSchoolTimetable(termId).catch((err) => {
            console.error("Failed loading school timetable:", err);
          }),
        ]
      : [];

    Promise.all([...basePromises, ...termPromises]).finally(() =>
      setIsLoadingInitial(false),
    );
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    selectedTerm?.id,
  ]);
  useEffect(() => {
    if (selectedGradeId) {
      loadTeachers().catch(() => {});
      loadSubjects(selectedGradeId).catch(() => {});
    }
  }, [selectedGradeId, loadTeachers, loadSubjects]);
  useEffect(() => {
    if (!selectedGradeId) return;
    const termId = selectedTerm?.id || selectedTermId;
    if (!termId) return;
    loadEntries(termId, selectedGradeId).catch(() => {});
  }, [selectedGradeId, selectedTermId, selectedTerm?.id, loadEntries]);

  const grid = useTimetableGrid(selectedGradeId);
  const { periodNumbers, getSlotFor } = usePeriodSlots();
  const hasScheduleStructure = hasTimeSlots || periodNumbers.length > 0;
  const stats = useGradeStatistics(selectedGradeId);
  const { total: conflictCount } = useAllConflicts();
  const days: string[] = [...SCHOOL_DAYS];
  const breaks = useTimetableStore((state) => state.breaks);

  const getCleanBreakName = useCallback(
    (name: string): string =>
      name.replace(/\s*\([^)]*(?:Before|After).*?Period[^)]*\)/gi, "").trim(),
    [],
  );

  const getEntryFor = useCallback(
    (dayOfWeek: number, period: number) => {
      const daySlot = getSlotFor(dayOfWeek - 1, period);
      let entry = daySlot ? grid[dayOfWeek]?.[daySlot.id] : null;
      if (!entry && daySlot && grid[dayOfWeek]) {
        const efd = Object.entries(grid[dayOfWeek])
          .filter(([, v]) => v !== null)
          .map(([, v]) => v);
        entry =
          efd.find((e: any) => {
            if (!e?.timeSlotId) return false;
            const ts = timeSlots.find((t) => t.id === e.timeSlotId);
            return ts?.periodNumber === period;
          }) || null;
      }
      if (!entry) return null;
      return {
        id: entry.id,
        subject: entry.subject,
        teacher: entry.teacher,
        roomNumber: entry.roomNumber,
        gradeId: entry.gradeId,
        timeSlotId: entry.timeSlotId,
        isDoublePeriod: entry.isDoublePeriod,
      };
    },
    [grid, timeSlots, getSlotFor],
  );

  const getBreaksAfterPeriod = useCallback(
    (period: number) => breaks.filter((b) => b.afterPeriod === period),
    [breaks],
  );
  const getBreaksBeforeFirstPeriod = useCallback(
    () => breaks.filter((b) => b.afterPeriod === 0 || b.afterPeriod === -1),
    [breaks],
  );

  const reloadTimetableData = useCallback(async () => {
    const termId = selectedTerm?.id || selectedTermId;
    if (!termId) return;
    const results = await Promise.allSettled([
      loadTimeSlots(termId),
      loadSchoolTimetable(termId),
      loadBreaks(),
    ]);
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        const names = ["loadTimeSlots", "loadSchoolTimetable", "loadBreaks"];
        console.error(`reloadTimetableData: ${names[i]} failed:`, r.reason);
      }
    });
  }, [
    loadBreaks,
    loadSchoolTimetable,
    loadTimeSlots,
    selectedTerm?.id,
    selectedTermId,
  ]);

  // State
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [editingTimeslot, setEditingTimeslot] = useState<any | null>(null);
  const [editingBreak, setEditingBreak] = useState<any | null>(null);
  const [bulkScheduleOpen, setBulkScheduleOpen] = useState(false);
  const [bulkBreaksOpen, setBulkBreaksOpen] = useState(false);
  const [bulkLessonEntryOpen, setBulkLessonEntryOpen] = useState(false);
  const [createTermModalOpen, setCreateTermModalOpen] = useState(false);
  const academicYearTriggerRef = useRef<HTMLButtonElement>(null);
  const [addingPeriods, setAddingPeriods] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [templatesDrawerOpen, setTemplatesDrawerOpen] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [dayTemplates, setDayTemplates] = useState<any[]>([]);
  const [addPeriodsDrawerOpen, setAddPeriodsDrawerOpen] = useState(false);
  const [addPeriodsTemplateId, setAddPeriodsTemplateId] = useState("");
  const [addPeriodsCount, setAddPeriodsCount] = useState("1");
  const [isDeletingTermEntries, setIsDeletingTermEntries] = useState(false);
  const [isDeletingTimetable, setIsDeletingTimetable] = useState(false);
  const [timeslotToDelete, setTimeslotToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showDeleteTimetableDialog, setShowDeleteTimetableDialog] =
    useState(false);
  const [showDeleteAllEntriesDialog, setShowDeleteAllEntriesDialog] =
    useState(false);
  const [deleteEntryConfirm, setDeleteEntryConfirm] = useState<any | null>(
    null,
  );
  const [periodsDrawerOpen, setPeriodsDrawerOpen] = useState(false);
  const [breaksDrawerOpen, setBreaksDrawerOpen] = useState(false);

  const { isLoading: isLoadingConfig } = useSchoolConfig();
  const { students } = useStudentsStore();
  const { config: schoolConfig } = useSchoolConfigStore();
  const [searchTerm, setSearchTerm] = useState("");

  const currentGrade = useMemo(
    () => grades.find((g) => g.id === selectedGradeId),
    [grades, selectedGradeId],
  );

  // Handlers
  const handleGradeSelect = useCallback(
    (gradeId: string, _levelId?: string) => setSelectedGrade(gradeId),
    [setSelectedGrade],
  );
  const handleAddLesson = useCallback(
    (dayOfWeek: number, timeSlotId: string, daySlotId?: string) => {
      if (!selectedGradeId) {
        toast({ title: "Select a grade first", variant: "destructive" });
        return;
      }
      setEditingLesson({
        gradeId: selectedGradeId,
        dayOfWeek,
        timeSlotId: daySlotId || timeSlotId,
        isNew: true,
      });
    },
    [selectedGradeId, toast],
  );

  const handleAddBreak = useCallback(
    (afterPeriod: number, dayOfWeek?: number) => {
      setEditingBreak({
        isNew: true,
        afterPeriod,
        dayOfWeek: dayOfWeek ?? undefined,
        name: "New Break",
        type: "short_break",
        durationMinutes: 20,
      } as any);
    },
    [],
  );

  const handleDeleteTimeslot = useCallback(async () => {
    if (!timeslotToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTimeSlot(timeslotToDelete.id);
      setTimeslotToDelete(null);
      await loadTimeSlots(selectedTerm?.id || selectedTermId || undefined);
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  }, [
    timeslotToDelete,
    deleteTimeSlot,
    loadTimeSlots,
    selectedTerm?.id,
    selectedTermId,
  ]);

  const handleDeleteAllTimeslots = useCallback(async () => {
    setIsDeletingAll(true);
    try {
      await deleteAllTimeSlots();
      setShowDeleteAllDialog(false);
      await loadTimeSlots(selectedTerm?.id || selectedTermId || undefined);
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    } finally {
      setIsDeletingAll(false);
    }
  }, [deleteAllTimeSlots, loadTimeSlots, selectedTerm?.id, selectedTermId]);

  const handleConfirmDeleteEntry = useCallback(async () => {
    if (!deleteEntryConfirm) return;
    try {
      await deleteTimetableEntry(deleteEntryConfirm.id);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setDeleteEntryConfirm(null);
    }
  }, [deleteEntryConfirm, deleteTimetableEntry]);

  const handleDeleteEntriesForTerm = useCallback(async () => {
    const termId = selectedTerm?.id || selectedTermId;
    if (!termId) return;
    setIsDeletingTermEntries(true);
    try {
      await deleteEntriesForTerm(termId);
      setShowDeleteAllEntriesDialog(false);
      await reloadTimetableData();
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    } finally {
      setIsDeletingTermEntries(false);
    }
  }, [
    deleteEntriesForTerm,
    selectedTerm?.id,
    selectedTermId,
    reloadTimetableData,
  ]);

  const handleDeleteTimetableForTerm = useCallback(async () => {
    const termId = selectedTerm?.id || selectedTermId;
    if (!termId) return;
    setIsDeletingTimetable(true);
    try {
      await deleteTimetableForTerm(termId);
      setShowDeleteTimetableDialog(false);
      await reloadTimetableData();
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    } finally {
      setIsDeletingTimetable(false);
    }
  }, [
    deleteTimetableForTerm,
    selectedTerm?.id,
    selectedTermId,
    reloadTimetableData,
  ]);

  const handleAddPeriods = async () => {
    setTemplatesLoading(true);
    try {
      const t = await loadDayTemplates();
      setDayTemplates(t || []);
      setAddPeriodsTemplateId(t?.[0]?.id || "");
      setAddPeriodsDrawerOpen(true);
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleOpenTemplates = async () => {
    setTemplatesDrawerOpen(true);
    setTemplatesLoading(true);
    try {
      setDayTemplates((await loadDayTemplates()) || []);
    } catch {
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleConfirmAddPeriods = async () => {
    setAddingPeriods(true);
    try {
      const n = parseInt(addPeriodsCount || "0", 10);
      if (!addPeriodsTemplateId || !Number.isFinite(n) || n <= 0) {
        toast({ title: "Invalid", variant: "destructive" });
        return;
      }
      await addPeriodsToDayTemplate(addPeriodsTemplateId, n);
      await loadDayTemplatePeriods();
      setAddPeriodsDrawerOpen(false);
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    } finally {
      setAddingPeriods(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100/70 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      {/* ── Sidebar ── */}
      {hasScheduleStructure && !isSidebarMinimized && (
        <aside className="w-72 flex-shrink-0 border-r border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-[0.14em]">
              Grades
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsSidebarMinimized(true)}
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <DashboardSearchSidebar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onClearFilters={() => setSearchTerm("")}
              selectedGradeId={selectedGradeId || "all"}
              onCollapse={() => setIsSidebarMinimized(true)}
              students={students}
              selectedGrade={selectedGradeId}
              onGradeSelect={(gradeId) => setSelectedGrade(gradeId)}
              schoolConfig={schoolConfig}
            />
          </div>
        </aside>
      )}

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Toolbar ── */}
        <header className="flex-shrink-0 border-b border-slate-200/80 bg-white/90 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90 px-4 lg:px-6 py-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-start gap-3 lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg lg:text-xl font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                      Timetable Builder
                    </h1>
                    <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 truncate">
                      {selectedTerm
                        ? `${selectedTerm.name} • Structure and schedule management`
                        : "Create structure, assign lessons, and resolve conflicts faster"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap lg:flex-nowrap">
                {hasScheduleStructure && isSidebarMinimized && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 text-xs bg-white/80 dark:bg-slate-900"
                    onClick={() => setIsSidebarMinimized(false)}
                  >
                    <PanelLeftOpen className="h-3.5 w-3.5" />
                    Grades
                  </Button>
                )}
                {selectedGradeId && (
                  <Button
                    size="sm"
                    className="h-9 gap-1.5 text-xs font-medium shadow-sm"
                    onClick={() => setBulkLessonEntryOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add lessons
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 text-xs bg-white/80 dark:bg-slate-900"
                  onClick={() => setBulkScheduleOpen(true)}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Schedule
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 text-xs bg-white/80 dark:bg-slate-900"
                  onClick={() => setBulkBreaksOpen(true)}
                >
                  <Coffee className="h-3.5 w-3.5" />
                  Breaks
                </Button>
                <Button
                  variant={showConflicts ? "default" : "outline"}
                  size="sm"
                  className="h-9 gap-1.5 text-xs"
                  onClick={toggleConflicts}
                  title={showConflicts ? "Hide conflicts" : "Show conflicts"}
                >
                  {showConflicts ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  {showConflicts ? "Hide conflicts" : "Show conflicts"}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem onClick={() => setPeriodsDrawerOpen(true)}>
                      <Clock className="h-3.5 w-3.5 mr-2" />
                      View periods
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setBreaksDrawerOpen(true)}>
                      <Coffee className="h-3.5 w-3.5 mr-2" />
                      View breaks
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteAllDialog(true)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Delete periods
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowDeleteAllEntriesDialog(true)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Delete lessons
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowDeleteTimetableDialog(true)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Delete timetable
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 dark:bg-slate-900/60 dark:border-slate-800 px-3 py-2.5">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                {!selectedGradeId && grades.length > 0 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 rounded-full text-xs whitespace-nowrap"
                    onClick={() => setSelectedGrade(grades[0].id)}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    Start with {grades[0].displayName || grades[0].name}
                  </Button>
                )}
                {grades.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGrade(g.id)}
                    className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                      selectedGradeId === g.id
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/40 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {g.displayName || g.name}
                    {selectedGradeId === g.id && (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6 space-y-4 lg:space-y-5">
            {selectedGradeId && (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-200/90 bg-white/95 dark:bg-slate-900 dark:border-slate-800 px-4 py-3 shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                    Selected grade
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {currentGrade?.displayName || currentGrade?.name || "Unknown"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/90 bg-white/95 dark:bg-slate-900 dark:border-slate-800 px-4 py-3 shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                    Total lessons
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-primary" />
                    {stats.totalLessons}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/90 bg-white/95 dark:bg-slate-900 dark:border-slate-800 px-4 py-3 shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                    Active periods
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    {periodNumbers.length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/90 bg-white/95 dark:bg-slate-900 dark:border-slate-800 px-4 py-3 shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                    Conflicts
                  </p>
                  <p
                    className={`mt-1 text-sm font-semibold flex items-center gap-1.5 ${
                      conflictCount > 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    <AlertCircle className="h-4 w-4" />
                    {conflictCount > 0 ? conflictCount : "None"}
                  </p>
                </div>
              </div>
            )}

            {/* Conflict banner */}
            {showConflicts && conflictCount > 0 && selectedGradeId && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    <strong>{conflictCount}</strong> scheduling{" "}
                    {conflictCount === 1 ? "conflict" : "conflicts"} detected
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-red-700 hover:text-red-800 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/30"
                  onClick={() => setBulkLessonEntryOpen(true)}
                >
                  Resolve now
                </Button>
              </div>
            )}

            <section className="rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm dark:bg-slate-900/95 dark:border-slate-800">
              <div className="border-b border-slate-100 dark:border-slate-800 px-4 lg:px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Weekly timetable
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      View, edit, and manage lessons by day and period
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs"
                    onClick={() => setBulkScheduleOpen(true)}
                  >
                    <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
                    Edit structure
                  </Button>
                </div>
              </div>

              <div className="p-4 lg:p-5">
                {/* No grade selected */}
                {!selectedGradeId && hasScheduleStructure ? (
                  <div className="flex items-center justify-center min-h-[54vh]">
                    <div className="max-w-sm text-center">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <GraduationCap className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Choose a grade to begin
                      </h3>
                      <p className="text-sm text-slate-500 mb-4">
                        Pick a grade from the header chips or the sidebar to open
                        its timetable and start editing.
                      </p>
                      {grades.length > 0 && (
                        <Button
                          size="sm"
                          className="h-9"
                          onClick={() => setSelectedGrade(grades[0].id)}
                        >
                          Open {grades[0].displayName || grades[0].name}
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <AdminTimetableGrid
                    periodNumbers={periodNumbers}
                    days={days}
                    getSlotFor={(d, p) => getSlotFor(d, p) ?? null}
                    getEntryFor={getEntryFor}
                    getBreaksAfterPeriod={getBreaksAfterPeriod}
                    getBreaksBeforeFirstPeriod={getBreaksBeforeFirstPeriod}
                    isLoading={isLoadingInitial}
                    hasNoTimeSlots={!hasScheduleStructure}
                    getCleanBreakName={getCleanBreakName}
                    onEditTimeslot={setEditingTimeslot}
                    onDeleteTimeslot={setTimeslotToDelete}
                    onEditLesson={setEditingLesson}
                    onDeleteLesson={setDeleteEntryConfirm}
                    onAddLesson={handleAddLesson}
                    onEditBreak={setEditingBreak}
                    onAddBreak={handleAddBreak}
                    onCreateSchedule={() => setBulkScheduleOpen(true)}
                  />
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* ── Dialogs & Drawers ── */}
      <LessonEditDialog
        lesson={editingLesson}
        onClose={() => {
          setEditingLesson(null);
          reloadTimetableData();
        }}
      />
      <TimeslotEditDialog
        timeslot={editingTimeslot}
        onClose={() => {
          setEditingTimeslot(null);
          reloadTimetableData();
        }}
      />
      <BreakEditDialog
        breakData={editingBreak}
        onClose={() => {
          setEditingBreak(null);
          reloadTimetableData();
        }}
      />
      <BulkScheduleDrawer
        open={bulkScheduleOpen}
        onClose={() => {
          reloadTimetableData();
          setBulkScheduleOpen(false);
        }}
      />
      <BulkBreaksDrawer
        open={bulkBreaksOpen}
        onClose={async () => {
          await reloadTimetableData();
          setBulkBreaksOpen(false);
        }}
      />
      <BulkLessonEntryDrawer
        open={bulkLessonEntryOpen}
        onClose={async () => {
          setBulkLessonEntryOpen(false);
          await reloadTimetableData();
        }}
        gradeId={selectedGradeId || undefined}
      />

      <Sheet open={periodsDrawerOpen} onOpenChange={setPeriodsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Periods
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            {timeSlots.map((slot) => (
              <div
                key={slot.id}
                className="bg-white dark:bg-slate-800 rounded-lg p-3 border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm">
                      Period {slot.periodNumber}
                    </span>
                    <p className="text-xs text-slate-500">
                      {slot.time || `${slot.startTime} - ${slot.endTime}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTimeslotToDelete(slot)}
                  className="p-1.5 hover:bg-red-50 rounded text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={breaksDrawerOpen} onOpenChange={setBreaksDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-primary" />
              Breaks
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            {breaks.map((b) => (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-800 rounded-lg p-3 border flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center text-lg">
                    {b.icon}
                  </div>
                  <div>
                    <span className="font-semibold text-sm">
                      {getCleanBreakName(b.name)}
                    </span>
                    <p className="text-xs text-slate-500">
                      {b.type} · {b.durationMinutes}m
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {}}
                  className="p-1.5 hover:bg-red-50 rounded text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <CreateAcademicYearModal
        onSuccess={() => {
          refetchAcademicYears();
          toast({ title: "Academic year created" });
        }}
        trigger={
          <button
            ref={academicYearTriggerRef}
            style={{
              position: "absolute",
              width: 0,
              height: 0,
              opacity: 0,
              pointerEvents: "none",
              overflow: "hidden",
            }}
            tabIndex={-1}
          />
        }
      />
      {academicYears.length > 0 && (
        <CreateTermModal
          isOpen={createTermModalOpen}
          onClose={() => setCreateTermModalOpen(false)}
          onSuccess={() => {
            setCreateTermModalOpen(false);
            refetchAcademicYears();
            reloadTimetableData();
          }}
          academicYear={{
            id: academicYears[0].id,
            name: academicYears[0].name,
            startDate: academicYears[0].startDate,
            endDate: academicYears[0].endDate,
          }}
        />
      )}

      <AlertDialog
        open={!!timeslotToDelete}
        onOpenChange={() => setTimeslotToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Period</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTimeslot}
              disabled={isDeleting}
              className="bg-red-600"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={showDeleteAllDialog}
        onOpenChange={setShowDeleteAllDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Periods</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllTimeslots}
              disabled={isDeletingAll}
              className="bg-red-600"
            >
              {isDeletingAll ? "Deleting…" : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={showDeleteTimetableDialog}
        onOpenChange={setShowDeleteTimetableDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Timetable</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTimetableForTerm}
              disabled={isDeletingTimetable}
              className="bg-red-600"
            >
              {isDeletingTimetable ? "Deleting…" : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={showDeleteAllEntriesDialog}
        onOpenChange={setShowDeleteAllEntriesDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Lessons</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEntriesForTerm}
              disabled={isDeletingTermEntries}
              className="bg-red-600"
            >
              {isDeletingTermEntries ? "Deleting…" : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={!!deleteEntryConfirm}
        onOpenChange={() => setDeleteEntryConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteEntry}
              className="bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
}
