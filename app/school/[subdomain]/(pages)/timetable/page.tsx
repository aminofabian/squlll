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
  useSchoolCombinedEntries,
} from "./hooks/useTimetableData";
import { useAllConflicts } from "./hooks/useTimetableConflictsNew";
import { useConflictLessonIds } from "./hooks/useConflictLessonIds";
import { useConflictEntryMap } from "./hooks/useConflictEntryMap";
import { TimetableConflictsPanel } from "./components/TimetableConflictsPanel";
import { TimetableStatusBar } from "./components/TimetableStatusBar";
import { TimetableClassSidebar } from "./components/TimetableClassSidebar";
import { TimetableOnboarding } from "./components/TimetableOnboarding";
import { TimetableFillProgress } from "./components/TimetableFillProgress";
import { TimetableSubjectInsights } from "./components/TimetableSubjectInsights";
import {
  TimetableGridSkeleton,
  TimetableSidebarSkeleton,
} from "./components/TimetableGridSkeleton";
import {
  TimetableGridError,
  RetryingSpinner,
} from "./components/TimetableGridError";
import { TimetableCompletionBanner } from "./components/TimetableCompletionBanner";
import { TimetablePrintStyles } from "./components/TimetablePrintStyles";
import { TimetableShareDrawer } from "./components/TimetableShareDrawer";
import { useSubjectCoverageInsights } from "./hooks/useSubjectCoverageInsights";
import { useTimetableTermOverview } from "./hooks/useTimetableTermOverview";
import { useTimetableShareStatus } from "./hooks/useTimetableShareStatus";
import {
  buildClassTimetableCsv,
  buildClassTimetableSummaryText,
  buildTermTimetableCsv,
  buildTermTimetableSummaryText,
  downloadTextFile,
} from "./utils/timetableSummaryText";
import { getTimeSlotForDayAndPeriod } from "./utils/timetableSlots";
import { formatBreakTypeLabel } from "@/lib/utils/timetable-user-messages";
import { LessonEditDialog } from "./components/LessonEditDialog";
import { TimeslotEditDialog } from "./components/TimeslotEditDialog";
import { BreakEditDialog } from "./components/BreakEditDialog";
import { BulkScheduleDrawer } from "./components/BulkScheduleDrawer";
import { BulkBreaksDrawer } from "./components/BulkBreaksDrawer";
import { BulkLessonEntryDrawer } from "./components/BulkLessonEntryDrawer";
import { AdminTimetableGrid } from "./components/AdminTimetableGrid";
import { getSubjectAccent } from "./utils/timetableSubjectColors";
import { tt } from "./utils/timetableTheme";
import { cn } from "@/lib/utils";
import { filterGradesBySearch } from "./utils/filterGradesBySearch";
import { GradeClassSearch } from "./components/GradeClassSearch";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
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
  Coffee,
  GraduationCap,
  AlertCircle,
  LayoutGrid,
  MoreHorizontal,
  Eye,
  EyeOff,
  Sparkles,
  ChevronRight,
  Users,
  Printer,
  Copy,
  Share2,
  Download,
  Mail,
  RefreshCw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useTimetableWeekDays } from "./hooks/useTimetableWeekDays";
import { TimetableSetupWizard } from "./components/TimetableSetupWizard";
import {
  isTimetableWizardComplete,
  markTimetableWizardComplete,
} from "@/lib/utils/timetable-setup";
import { getTenantIdFromCookies } from "@/lib/utils/school-onboarding";
import {
  formatLoadError,
  runWithLoadRetry,
} from "./utils/timetableLoadHelpers";
import { useTimetableNetworkStatus } from "./hooks/useTimetableNetworkStatus";
import { useDomainRealtime } from "@/lib/realtime/useDomainRealtime";
import { TimetableOfflineBanner } from "./components/TimetableOfflineBanner";

export default function SmartTimetableNew() {
  const { selectedTerm, setSelectedTerm, termsLoading } = useSelectedTerm();
  const {
    academicYears,
    loading: academicYearsLoading,
    refetch: refetchAcademicYears,
    getActiveAcademicYear,
  } = useCurrentAcademicYear();
  const activeAcademicYear = getActiveAcademicYear();

  const {
    grades,
    timeSlots,
    selectedGradeId,
    selectedStreamId,
    selectedTermId,
    setSelectedGrade,
    setSelectedStream,
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
    deleteBreak,
    teachers,
    subjects,
  } = useTimetableStore();

  const selectedGradeEntries = useSelectedGradeTimetable();
  const storeEntries = useTimetableStore((state) => state.entries);

  const subjectMetaById = useMemo(() => {
    const map = new Map<string, { department?: string; color?: string }>();
    for (const s of subjects) {
      map.set(s.id, {
        department: s.department,
        color: s.color,
      });
    }
    return map;
  }, [subjects]);

  const getSubjectAccentForGrid = useCallback(
    (subjectId: string, subjectName: string) => {
      const meta = subjectMetaById.get(subjectId);
      return getSubjectAccent(subjectId, subjectName, meta);
    },
    [subjectMetaById],
  );
  const { toast } = useToast();
  const { isOnline, reconnectedAt } = useTimetableNetworkStatus();
  const routeMountMsRef = useRef(performance.now());
  const loadMetricsLoggedRef = useRef(false);

  useEffect(() => {
    if (selectedTerm?.id && selectedTerm.id !== selectedTermId) {
      setStoreTerm(selectedTerm.id);
    }
  }, [selectedTerm?.id, selectedTermId, setStoreTerm]);

  const hasTerm = !!selectedTerm;
  const hasTimeSlots = timeSlots.length > 0;
  const hasGradeSelected = !!selectedGradeId;
  const hasAnyLessons = selectedGradeId
    ? selectedGradeEntries.length > 0
    : storeEntries.length > 0;

  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingTimetable, setIsLoadingTimetable] = useState(false);
  const initialGradeScopeKey = useRef<string | null>(null);

  // Per-resource error states (Phase 4b)
  const [gradesError, setGradesError] = useState<boolean>(false);
  const [subjectsError, setSubjectsError] = useState<boolean>(false);
  const [teachersError, setTeachersError] = useState<boolean>(false);
  const [breaksError, setBreaksError] = useState<boolean>(false);
  const [timetableError, setTimetableError] = useState<boolean>(false);
  const [timetableLoadError, setTimetableLoadError] = useState<string | null>(
    null,
  );
  const [refreshLoadFailed, setRefreshLoadFailed] = useState(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const prevSelectedGradeIdRef = useRef<string | null>(null);

  const clearErrors = useCallback(() => {
    setGradesError(false);
    setSubjectsError(false);
    setTeachersError(false);
    setBreaksError(false);
    setTimetableError(false);
    setTimetableLoadError(null);
    setRefreshLoadFailed(false);
  }, []);

  const hasCachedTimetableData = useCallback(() => {
    const state = useTimetableStore.getState();
    return state.entries.length > 0 || state.timeSlots.length > 0;
  }, []);

  const loadTimetableBundle = useCallback(
    async (scope?: {
      gradeId?: string | null;
      streamId?: string | null;
    }): Promise<{ ok: boolean; usedCache?: boolean }> => {
      const termId = selectedTerm?.id || selectedTermId;
      if (!termId) return { ok: true };

      const gradeId = scope?.gradeId ?? selectedGradeId ?? undefined;
      const streamId =
        scope?.streamId !== undefined ? scope.streamId : selectedStreamId;

      try {
        await runWithLoadRetry(async () => {
          const result = await loadSchoolTimetable(
            termId,
            gradeId ? { gradeLevelId: gradeId, streamId } : undefined,
          );
          if (result === null && !hasCachedTimetableData()) {
            throw new Error("Timetable could not be loaded");
          }
          // Supplement/refine period rows from day templates when available.
          await loadTimeSlots(termId, gradeId || undefined);
        });
        setTimetableError(false);
        setTimetableLoadError(null);
        setRefreshLoadFailed(false);
        return { ok: true };
      } catch (error) {
        const message = formatLoadError(error);
        setTimetableLoadError(message);
        console.error("Timetable bundle load failed:", error);

        if (hasCachedTimetableData()) {
          setRefreshLoadFailed(true);
          setTimetableError(false);
          return { ok: false, usedCache: true };
        }

        setTimetableError(true);
        setRefreshLoadFailed(false);
        return { ok: false };
      }
    },
    [
      selectedTerm?.id,
      selectedTermId,
      selectedGradeId,
      selectedStreamId,
      loadTimeSlots,
      loadSchoolTimetable,
      hasCachedTimetableData,
    ],
  );

  const isPageLoading =
    isLoadingInitial || termsLoading || academicYearsLoading;
  const showGridSkeleton =
    (isPageLoading || isLoadingTimetable) && !hasCachedTimetableData();
  const isGridLoading = isPageLoading || isLoadingTimetable;

  // A resource is "hard failed" if it errored AND its data is empty (no fallback)
  const sidebarFailed = gradesError;
  // Single-class grid failure: timetable for the selected grade failed
  const classGridFailed =
    !!selectedGradeId && timetableError && !refreshLoadFailed;

  useEffect(() => {
    initialGradeScopeKey.current = null;
  }, [selectedTerm?.id, selectedTermId]);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingInitial(true);
    clearErrors();
    const termId = selectedTerm?.id || selectedTermId;

    const loadAll = async () => {
      try {
        // Load grades first — everything depends on them
        try {
          await loadGrades();
        } catch (err) {
          console.error("Failed loading grades:", err);
          if (!cancelled) setGradesError(true);
        }

        if (cancelled) return;

        const timetableLoads = termId
          ? [
              loadTimetableBundle({
                gradeId: selectedGradeId,
                streamId: selectedStreamId,
              }),
            ]
          : [];

        await Promise.all([
          Promise.resolve(
            loadSubjects().catch((err) => {
              console.error("Failed loading subjects:", err);
              if (!cancelled) setSubjectsError(true);
            }),
          ),
          Promise.resolve(
            loadTeachers().catch((err) => {
              console.error("Failed loading teachers:", err);
              if (!cancelled) setTeachersError(true);
            }),
          ),
          Promise.resolve(
            loadBreaks().catch((err) => {
              console.error("Failed loading breaks:", err);
              if (!cancelled) setBreaksError(true);
            }),
          ),
          ...timetableLoads,
        ]);
      } finally {
        if (!cancelled) {
          initialGradeScopeKey.current = selectedGradeId
            ? `${selectedGradeId}:${selectedStreamId ?? ""}`
            : null;
          setIsLoadingInitial(false);
        }
      }
    };

    void loadAll();
    return () => {
      cancelled = true;
    };
  }, [
    selectedTerm?.id,
    selectedTermId,
    loadGrades,
    loadSubjects,
    loadTeachers,
    loadBreaks,
    loadTimetableBundle,
    clearErrors,
    // Grade/stream on first paint only — grade changes use the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ]);
  useEffect(() => {
    if (selectedGradeId) {
      loadTeachers().catch((err) => {
        console.error("Failed loading teachers on grade change:", err);
        setTeachersError(true);
      });
      loadSubjects(selectedGradeId).catch((err) => {
        console.error("Failed loading subjects on grade change:", err);
        setSubjectsError(true);
      });
    }
  }, [selectedGradeId, loadTeachers, loadSubjects]);

  useEffect(() => {
    const termId = selectedTerm?.id || selectedTermId;
    if (!termId || !selectedGradeId || isLoadingInitial) return;

    const scopeKey = `${selectedGradeId}:${selectedStreamId ?? ""}`;
    if (initialGradeScopeKey.current === scopeKey) {
      initialGradeScopeKey.current = null;
      return;
    }

    let cancelled = false;
    const hadCachedSchedule = hasCachedTimetableData();
    if (!hadCachedSchedule) {
      setIsLoadingTimetable(true);
    }
    setTimetableError(false);

    void (async () => {
      try {
        await loadTimetableBundle({
          gradeId: selectedGradeId,
          streamId: selectedStreamId,
        });
      } finally {
        if (!cancelled) setIsLoadingTimetable(false);
      }
    })();

    return () => {
      cancelled = true;
      setIsLoadingTimetable(false);
    };
  }, [
    selectedGradeId,
    selectedStreamId,
    selectedTerm?.id,
    selectedTermId,
    loadTimetableBundle,
    isLoadingInitial,
    hasCachedTimetableData,
  ]);

  // Returning to whole-school view: reload term-wide timetable and clear class-only errors.
  useEffect(() => {
    if (isLoadingInitial) return;
    const termId = selectedTerm?.id || selectedTermId;
    if (!termId) return;

    const prev = prevSelectedGradeIdRef.current;
    prevSelectedGradeIdRef.current = selectedGradeId;

    if (prev && !selectedGradeId) {
      setTimetableError(false);
      void loadTimetableBundle({ gradeId: null, streamId: null });
    }
  }, [
    selectedGradeId,
    selectedTerm?.id,
    selectedTermId,
    isLoadingInitial,
    loadTimetableBundle,
  ]);

  const grid = useTimetableGrid(selectedGradeId);
  const { periodNumbers, getSlotFor } = usePeriodSlots();
  const breaks = useTimetableStore((state) => state.breaks);
  const timetableSetupComplete = isTimetableWizardComplete(
    getTenantIdFromCookies(),
  );
  const daysPerWeekFromStore = useTimetableStore((state) => state.daysPerWeek);
  const lessonPeriodsPerDay = useTimetableStore(
    (state) => state.lessonPeriodsPerDay,
  );
  const hasScheduleStructure =
    hasTimeSlots ||
    periodNumbers.length > 0 ||
    hasAnyLessons ||
    (timetableSetupComplete && breaks.length > 0) ||
    (!isGridLoading &&
      !!selectedTerm &&
      ((lessonPeriodsPerDay ?? 0) > 0 || daysPerWeekFromStore > 0));
  const hasTimetableData =
    periodNumbers.length > 0 || timeSlots.length > 0 || storeEntries.length > 0;

  // Full-grid error only when load failed and there is nothing to show.
  const combinedGridFailed =
    timetableError && !selectedGradeId && hasTimetableData;
  const stats = useGradeStatistics(selectedGradeId);
  const {
    total: conflictCount,
    teacher: teacherConflicts,
    room: roomConflicts,
  } = useAllConflicts();
  const conflictLessonIds = useConflictLessonIds();
  const conflictTooltipMap = useConflictEntryMap();
  const { dayLabels: days, daysPerWeek } = useTimetableWeekDays();
  const lastUpdated = useTimetableStore((state) => state.lastUpdated);

  const subjectInsights = useSubjectCoverageInsights(
    selectedGradeId,
    stats.subjectDistribution,
    daysPerWeek,
    periodNumbers.length,
    stats.filledSlots,
    stats.totalSlots,
  );

  const getCleanBreakName = useCallback(
    (name: string): string =>
      name.replace(/\s*\([^)]*(?:Before|After).*?Period[^)]*\)/gi, "").trim(),
    [],
  );

  const getEntryFor = useCallback(
    (dayOfWeek: number, period: number) => {
      const fromList = selectedGradeEntries.find((e) => {
        if (e.dayOfWeek !== dayOfWeek) return false;
        return (
          e.periodNumber === period ||
          e.timeSlot?.periodNumber === period ||
          timeSlots.some(
            (ts) => ts.id === e.timeSlotId && ts.periodNumber === period,
          )
        );
      });

      if (fromList) {
        return {
          id: fromList.id,
          subject: fromList.subject,
          teacher: fromList.teacher,
          roomNumber: fromList.roomNumber,
          gradeId: fromList.gradeId,
          timeSlotId: fromList.timeSlotId,
          isDoublePeriod: fromList.isDoublePeriod,
        };
      }

      const daySlot = getSlotFor(dayOfWeek - 1, period);
      const entry = daySlot ? grid[dayOfWeek]?.[daySlot.id] : null;

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
    [grid, timeSlots, getSlotFor, selectedGradeEntries],
  );

  const getBreaksAfterPeriod = useCallback(
    (period: number) => breaks.filter((b) => b.afterPeriod === period),
    [breaks],
  );
  const getBreaksBeforeFirstPeriod = useCallback(
    () => breaks.filter((b) => b.afterPeriod === 0 || b.afterPeriod === -1),
    [breaks],
  );

  const reloadTimetableData = useCallback(async (): Promise<
    { ok: boolean; usedCache?: boolean } | undefined
  > => {
    const termId = selectedTerm?.id || selectedTermId;
    if (!termId) return undefined;

    const result = await loadTimetableBundle({
      gradeId: selectedGradeId,
      streamId: selectedStreamId,
    });

    await loadBreaks().catch((err) =>
      console.error("reloadTimetableData: loadBreaks failed:", err),
    );

    if (!result.ok && result.usedCache) {
      toast({
        title: "Could not refresh timetable",
        description:
          "Showing last loaded data. Try again when your connection is stable.",
        variant: "destructive",
      });
    }

    return result;
  }, [
    loadBreaks,
    loadTimetableBundle,
    selectedTerm?.id,
    selectedTermId,
    selectedGradeId,
    selectedStreamId,
    toast,
  ]);

  /** Retry after an error: re-run initial load (re-fetches all resources) */
  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    clearErrors();

    try {
      await loadGrades();
    } catch {
      setGradesError(true);
    }

    const termId = selectedTerm?.id || selectedTermId;
    if (termId) {
      await loadTimetableBundle({
        gradeId: selectedGradeId,
        streamId: selectedStreamId,
      });
    }

    await Promise.all([
      loadSubjects().catch(() => setSubjectsError(true)),
      loadTeachers().catch(() => setTeachersError(true)),
      loadBreaks().catch(() => setBreaksError(true)),
    ]);

    setIsRetrying(false);
  }, [
    loadGrades,
    loadSubjects,
    loadTeachers,
    loadBreaks,
    loadTimetableBundle,
    selectedTerm?.id,
    selectedTermId,
    selectedGradeId,
    selectedStreamId,
    clearErrors,
  ]);

  // State
  const [showFullSubjectName, setShowFullSubjectName] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [editingTimeslot, setEditingTimeslot] = useState<any | null>(null);
  const [editingBreak, setEditingBreak] = useState<any | null>(null);
  const [bulkScheduleOpen, setBulkScheduleOpen] = useState(false);
  const [advancedScheduleConfirmOpen, setAdvancedScheduleConfirmOpen] =
    useState(false);
  const [breakToDelete, setBreakToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [bulkBreaksOpen, setBulkBreaksOpen] = useState(false);
  const [bulkLessonEntryOpen, setBulkLessonEntryOpen] = useState(false);
  const [addingPeriods, setAddingPeriods] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 1023px)").matches;
  });
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
  const pendingLessonDeleteRef = useRef<{
    timeout: ReturnType<typeof setTimeout>;
  } | null>(null);
  const [periodsDrawerOpen, setPeriodsDrawerOpen] = useState(false);
  const [breaksDrawerOpen, setBreaksDrawerOpen] = useState(false);
  const [showTimetableWizard, setShowTimetableWizard] = useState(false);
  const [highlightTeacherId, setHighlightTeacherId] = useState<string | null>(
    null,
  );
  const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
  const periodsRefetchAttemptedRef = useRef(false);

  const { getCombinedEntriesFor } = useSchoolCombinedEntries();
  const termOverview = useTimetableTermOverview();
  const schoolLessonCount = useMemo(
    () => termOverview.byGrade.reduce((sum, g) => sum + g.lessonCount, 0),
    [termOverview.byGrade],
  );
  const termIdForShare = selectedTerm?.id || selectedTermId;
  const { markShared, hasChangesSinceShare, sharedAt } =
    useTimetableShareStatus(termIdForShare, selectedTerm?.timetablePublishedAt);
  const changesSinceShare = hasChangesSinceShare(lastUpdated);

  useDomainRealtime({
    onTimetablePublished: (payload) => {
      if (payload.termId !== termIdForShare) return;
      void refetchAcademicYears();
      if (selectedTermId) void loadSchoolTimetable(selectedTermId);
    },
    onTimetableUnpublished: (payload) => {
      if (payload.termId !== termIdForShare) return;
      void refetchAcademicYears();
    },
  });

  const sortedTeachers = useMemo(
    () =>
      [...teachers].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      ),
    [teachers],
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const onChange = () => {
      if (mq.matches) setIsSidebarMinimized(true);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (isGridLoading || academicYearsLoading || termsLoading) return;

    const termId = selectedTerm?.id || selectedTermId;
    const tenantId = getTenantIdFromCookies();

    if (hasScheduleStructure) {
      if (tenantId) markTimetableWizardComplete(tenantId);
      setShowTimetableWizard(false);
      return;
    }

    // Wait until a term is selected and we've tried loading its timetable.
    if (!termId) return;

    if (!isTimetableWizardComplete(tenantId)) {
      setShowTimetableWizard(true);
    }
  }, [
    isPageLoading,
    academicYearsLoading,
    termsLoading,
    hasScheduleStructure,
    selectedTerm?.id,
    selectedTermId,
  ]);

  useEffect(() => {
    periodsRefetchAttemptedRef.current = false;
  }, [selectedTerm?.id, selectedTermId]);

  useEffect(() => {
    if (isGridLoading) return;
    if (hasTimeSlots || periodNumbers.length > 0) return;
    if (!timetableSetupComplete) return;
    if (periodsRefetchAttemptedRef.current) return;

    const termId = selectedTerm?.id || selectedTermId;
    if (!termId) return;

    periodsRefetchAttemptedRef.current = true;
    void reloadTimetableData();
  }, [
    isPageLoading,
    hasTimeSlots,
    periodNumbers.length,
    timetableSetupComplete,
    selectedTerm?.id,
    selectedTermId,
    reloadTimetableData,
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const gradeSearchRef = useRef<HTMLInputElement>(null);
  const [hideLiveBanner, setHideLiveBanner] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      e.preventDefault();
      gradeSearchRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem("timetable-hide-live-banner") === "1") {
        setHideLiveBanner(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Phase 7.8: debounced refresh when connectivity returns
  useEffect(() => {
    if (!reconnectedAt) return;
    const termId = selectedTerm?.id || selectedTermId;
    if (!termId || isPageLoading) return;

    const timer = window.setTimeout(() => {
      void reloadTimetableData().then((result) => {
        if (result?.ok) {
          toast({
            title: "Back online",
            description: "Timetable data has been refreshed.",
          });
        }
      });
    }, 800);

    return () => window.clearTimeout(timer);
  }, [
    reconnectedAt,
    selectedTerm?.id,
    selectedTermId,
    isPageLoading,
    reloadTimetableData,
    toast,
  ]);

  // Phase 7.9: dev-only load timing (TTI when skeleton hides)
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (isGridLoading || loadMetricsLoggedRef.current) return;
    loadMetricsLoggedRef.current = true;
    const ttiMs = Math.round(performance.now() - routeMountMsRef.current);
    console.table([
      {
        metric: "Timetable TTI (route mount → grid ready)",
        ms: ttiMs,
      },
    ]);
  }, [isGridLoading]);

  const filteredGrades = useMemo(
    () => filterGradesBySearch(grades, searchTerm),
    [grades, searchTerm],
  );

  /** Keep the active class visible in the list even when the search filter would hide it. */
  const sidebarGrades = useMemo(() => {
    if (!selectedGradeId) return filteredGrades;
    if (filteredGrades.some((g) => g.id === selectedGradeId)) {
      return filteredGrades;
    }
    const selected = grades.find((g) => g.id === selectedGradeId);
    if (!selected) return filteredGrades;
    return [selected, ...filteredGrades];
  }, [filteredGrades, grades, selectedGradeId]);

  const chipGrades = sidebarGrades;

  const pinnedGradeId = useMemo(() => {
    if (!selectedGradeId || !searchTerm.trim()) return null;
    if (filteredGrades.some((g) => g.id === selectedGradeId)) return null;
    return selectedGradeId;
  }, [filteredGrades, searchTerm, selectedGradeId]);

  const currentGrade = useMemo(
    () => grades.find((g) => g.id === selectedGradeId),
    [grades, selectedGradeId],
  );

  const currentStreams = currentGrade?.streams ?? [];
  const currentStream = useMemo(
    () =>
      currentStreams.find((s) => s.tenantStreamId === selectedStreamId) ?? null,
    [currentStreams, selectedStreamId],
  );

  // Handlers
  const handleGradeSelect = useCallback(
    (gradeId: string, _levelId?: string) => setSelectedGrade(gradeId),
    [setSelectedGrade],
  );
  const handleJumpToConflictEntry = useCallback(
    (entryId: string) => {
      const state = useTimetableStore.getState();
      const entry = state.entries.find((e) => e.id === entryId);
      if (!entry) return;
      setSelectedGrade(entry.gradeId);
      const subject = state.subjects.find((s) => s.id === entry.subjectId);
      const teacher = state.teachers.find((t) => t.id === entry.teacherId);
      setEditingLesson({
        ...entry,
        subject: subject ?? { id: entry.subjectId, name: "Unknown" },
        teacher: teacher ?? {
          id: entry.teacherId,
          name: "Unknown",
        },
        isNew: false,
      });
      if (!showConflicts) toggleConflicts();
    },
    [setSelectedGrade, showConflicts, toggleConflicts],
  );

  const handleHighlightProblems = useCallback(() => {
    if (!showConflicts) toggleConflicts();
  }, [showConflicts, toggleConflicts]);

  const classDisplayLabel =
    currentGrade?.displayName || currentGrade?.name || "Class";

  const handlePrintClassTimetable = useCallback(() => {
    if (!selectedGradeId) {
      toast({
        title: "Pick a class first",
        description: "Select a class before printing its timetable.",
      });
      return;
    }
    window.print();
  }, [selectedGradeId, toast]);

  const handleCopyClassSummary = useCallback(async () => {
    if (!selectedGradeId) return;
    const text = buildClassTimetableSummaryText({
      classLabel: classDisplayLabel,
      streamName: currentStream?.name,
      termName: selectedTerm?.name,
      filledSlots: stats.filledSlots,
      totalSlots: stats.totalSlots,
      completionPercentage: stats.completionPercentage,
      conflictCount,
      subjectDistribution: stats.subjectDistribution,
      insightLines: subjectInsights.map(
        (i) => `  • ${i.subject}: ${i.message}`,
      ),
    });
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Summary copied",
        description: "Paste into email or chat.",
      });
    } catch {
      toast({
        title: "Could not copy",
        description: "Allow clipboard access and try again.",
        variant: "destructive",
      });
    }
  }, [
    selectedGradeId,
    classDisplayLabel,
    currentStream,
    selectedTerm?.name,
    stats,
    conflictCount,
    subjectInsights,
    toast,
  ]);

  const handleExportClassCsv = useCallback(() => {
    if (!selectedGradeId) {
      toast({
        title: "Pick a class first",
        description: "Select a class before exporting.",
      });
      return;
    }
    const dayRows = days.map((label, index) => ({
      dayOfWeek: index + 1,
      label,
    }));
    const periodRows = periodNumbers.map((period) => {
      const slot = getSlotFor(0, period);
      return {
        periodNumber: period,
        timeLabel: slot?.time || `Period ${period}`,
      };
    });
    const csv = buildClassTimetableCsv({
      classLabel: classDisplayLabel,
      streamName: currentStream?.name,
      termName: selectedTerm?.name,
      days: dayRows,
      periods: periodRows,
      getLesson: (dayOfWeek, period) => {
        const entry = getEntryFor(dayOfWeek, period);
        if (!entry) return null;
        return {
          subject: entry.subject?.name ?? "",
          teacher: entry.teacher?.name ?? "",
          room: entry.roomNumber ?? "",
        };
      },
    });
    const safeName =
      `${classDisplayLabel}${currentStream ? `-${currentStream.name}` : ""}`
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
    downloadTextFile(
      `${safeName || "class"}-timetable.csv`,
      csv,
      "text/csv;charset=utf-8",
    );
    toast({
      title: "CSV downloaded",
      description:
        "Open in Excel or Google Sheets, or print to PDF from there.",
    });
  }, [
    selectedGradeId,
    classDisplayLabel,
    currentStream,
    selectedTerm?.name,
    days,
    periodNumbers,
    getSlotFor,
    getEntryFor,
    toast,
  ]);

  const requestOpenAdvancedSchedule = useCallback(() => {
    setAdvancedScheduleConfirmOpen(true);
  }, []);

  const handleCopyTermSummary = useCallback(async () => {
    const text = buildTermTimetableSummaryText({
      termName: selectedTerm?.name,
      academicYearName: activeAcademicYear?.name,
      overallPercentage: termOverview.overallPercentage,
      totalFilled: termOverview.totalFilled,
      totalSlots: termOverview.totalSlots,
      conflictCount,
      byGrade: termOverview.byGrade,
    });
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Term summary copied",
        description: "Paste into email or staff chat.",
      });
    } catch {
      toast({
        title: "Could not copy",
        description: "Allow clipboard access and try again.",
        variant: "destructive",
      });
    }
  }, [
    selectedTerm?.name,
    activeAcademicYear?.name,
    termOverview,
    conflictCount,
    toast,
  ]);

  const handleExportTermCsv = useCallback(() => {
    const store = useTimetableStore.getState();
    const dayRows = days.map((label, index) => ({
      dayOfWeek: index + 1,
      label,
    }));
    const periodRows = periodNumbers.map((period) => {
      const slot = getSlotFor(0, period);
      return {
        periodNumber: period,
        timeLabel: slot?.time || `Period ${period}`,
      };
    });
    const csv = buildTermTimetableCsv({
      termName: selectedTerm?.name,
      academicYearName: activeAcademicYear?.name,
      grades: termOverview.byGrade.map((g) => ({
        gradeId: g.gradeId,
        label: g.label,
      })),
      days: dayRows,
      periods: periodRows,
      getLesson: (gradeId, dayOfWeek, period) => {
        const slot = getTimeSlotForDayAndPeriod(
          store.timeSlots,
          dayOfWeek,
          period,
        );
        if (!slot) return null;
        const entry = store.entries.find(
          (e) =>
            e.gradeId === gradeId &&
            e.dayOfWeek === dayOfWeek &&
            e.timeSlotId === slot.id,
        );
        if (!entry) return null;
        const subject = store.subjects.find((s) => s.id === entry.subjectId);
        const teacher = store.teachers.find((t) => t.id === entry.teacherId);
        return {
          subject: subject?.name ?? "",
          teacher: teacher?.name ?? "",
          room: entry.roomNumber ?? "",
        };
      },
    });
    const safeTerm = (selectedTerm?.name ?? "term")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    downloadTextFile(
      `timetable-${safeTerm || "all-classes"}.csv`,
      csv,
      "text/csv;charset=utf-8",
    );
    toast({
      title: "Term CSV downloaded",
      description: "All classes in one file — open in Excel or Sheets.",
    });
  }, [
    days,
    periodNumbers,
    getSlotFor,
    selectedTerm?.name,
    activeAcademicYear?.name,
    termOverview.byGrade,
    toast,
  ]);

  const handleEmailStaffSummary = useCallback(() => {
    const body = buildTermTimetableSummaryText({
      termName: selectedTerm?.name,
      academicYearName: activeAcademicYear?.name,
      overallPercentage: termOverview.overallPercentage,
      totalFilled: termOverview.totalFilled,
      totalSlots: termOverview.totalSlots,
      conflictCount,
      byGrade: termOverview.byGrade,
    });
    const subject = encodeURIComponent(
      `Timetable: ${selectedTerm?.name ?? "school"}${activeAcademicYear ? ` (${activeAcademicYear.name})` : ""}`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${encodeURIComponent(body)}`;
  }, [
    selectedTerm?.name,
    activeAcademicYear?.name,
    termOverview,
    conflictCount,
  ]);

  const handleAddLesson = useCallback(
    (dayOfWeek: number, timeSlotId: string, daySlotId?: string) => {
      if (!selectedGradeId) {
        toast({
          title: "Select a class first",
          description: "Choose a class above before adding a lesson.",
          variant: "destructive",
        });
        return;
      }
      const resolvedSlotId = daySlotId || timeSlotId;
      if (!resolvedSlotId) {
        toast({
          title: "Period not found",
          description:
            "Could not find a time slot for this cell. Try refreshing the timetable.",
          variant: "destructive",
        });
        return;
      }
      setEditingLesson({
        gradeId: selectedGradeId,
        dayOfWeek,
        timeSlotId: resolvedSlotId,
        isNew: true,
      });
    },
    [selectedGradeId, toast],
  );

  const handleEditLesson = useCallback(
    (entry: {
      id: string;
      subject: { id?: string; name: string };
      teacher: { id?: string; name: string };
      roomNumber?: string | null;
      gradeId?: string;
      timeSlotId?: string;
      isDoublePeriod?: boolean;
    }) => {
      const full = selectedGradeEntries.find((e) => e.id === entry.id);
      setEditingLesson(
        full
          ? { ...full, isNew: false }
          : {
              ...entry,
              subjectId: entry.subject?.id ?? "",
              teacherId: entry.teacher?.id ?? "",
              isNew: false,
            },
      );
    },
    [selectedGradeEntries],
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

  const handleCombinedLessonClick = useCallback(
    (entry: { gradeId?: string; streamId?: string | null }) => {
      if (entry.gradeId) setSelectedGrade(entry.gradeId);
      if (entry.streamId) {
        setSelectedStream(entry.streamId);
      } else {
        setSelectedStream(null);
      }
    },
    [setSelectedGrade, setSelectedStream],
  );

  const [movingBreakId, setMovingBreakId] = useState<string | null>(null);

  const handleMoveBreak = useCallback(
    async (breakEntry: any, direction: -1 | 1) => {
      if (!breakEntry?.id || movingBreakId) return;
      const newAfter = (breakEntry.afterPeriod ?? 0) + direction;
      if (newAfter < 0) return;

      setMovingBreakId(breakEntry.id);
      try {
        const mutation = `
          mutation UpdateDayTemplateBreak($id: ID!, $input: UpdateDayTemplateBreakInput!) {
            updateDayTemplateBreak(id: $id, input: $input) {
              id
              afterPeriod
            }
          }
        `;
        const response = await fetch("/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            query: mutation,
            variables: {
              id: breakEntry.id,
              input: { afterPeriod: newAfter },
            },
          }),
        });
        const result = await response.json();
        if (result.errors) throw new Error(result.errors[0]?.message);
        await reloadTimetableData();
      } catch {
        toast({
          title: "Could not move break",
          variant: "destructive",
        });
      } finally {
        setMovingBreakId(null);
      }
    },
    [movingBreakId, reloadTimetableData, toast],
  );

  const handleDeleteTimeslot = useCallback(async () => {
    if (!timeslotToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTimeSlot(timeslotToDelete.id);
      setTimeslotToDelete(null);
      await loadTimeSlots(
        selectedTerm?.id || selectedTermId || undefined,
        selectedGradeId || undefined,
      );
    } catch {
      toast({
        title: "Could not delete period",
        description: "Please refresh the page and try again.",
        variant: "destructive",
      });
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
      await loadTimeSlots(
        selectedTerm?.id || selectedTermId || undefined,
        selectedGradeId || undefined,
      );
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    } finally {
      setIsDeletingAll(false);
    }
  }, [deleteAllTimeSlots, loadTimeSlots, selectedTerm?.id, selectedTermId]);

  const handleConfirmDeleteEntry = useCallback(() => {
    if (!deleteEntryConfirm) return;
    const entryId = deleteEntryConfirm.id as string;
    setDeleteEntryConfirm(null);

    if (pendingLessonDeleteRef.current) {
      clearTimeout(pendingLessonDeleteRef.current.timeout);
    }

    const timeout = setTimeout(async () => {
      pendingLessonDeleteRef.current = null;
      try {
        await deleteTimetableEntry(entryId);
        await reloadTimetableData();
        toast({ title: "Lesson removed" });
      } catch {
        toast({
          title: "Could not remove lesson",
          description: "Please refresh and try again.",
          variant: "destructive",
        });
      }
    }, 5000);

    pendingLessonDeleteRef.current = { timeout };

    toast({
      title: "Removing lesson…",
      description: "You can undo within 5 seconds.",
      action: (
        <ToastAction
          altText="Undo remove lesson"
          onClick={() => {
            if (pendingLessonDeleteRef.current) {
              clearTimeout(pendingLessonDeleteRef.current.timeout);
              pendingLessonDeleteRef.current = null;
              toast({ title: "Lesson kept" });
            }
          }}
        >
          Undo
        </ToastAction>
      ),
    });
  }, [deleteEntryConfirm, deleteTimetableEntry, reloadTimetableData, toast]);

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
    <div className="relative flex h-screen overflow-hidden bg-slate-50/80 dark:bg-slate-950">
      <TimetablePrintStyles />
      {showTimetableWizard && (
        <div className="fixed inset-0 z-[60] overflow-auto">
          <TimetableSetupWizard
            onComplete={async () => {
              setShowTimetableWizard(false);
              await reloadTimetableData();
            }}
            onFailed={async () => {
              setShowTimetableWizard(false);
              await reloadTimetableData();
            }}
            onSkip={() => setShowTimetableWizard(false)}
          />
        </div>
      )}
      {/* ── Sidebar ── */}
      {isPageLoading && !isSidebarMinimized ? (
        <TimetableSidebarSkeleton />
      ) : (
        hasScheduleStructure &&
        !isSidebarMinimized && (
          <aside
            data-timetable-no-print
            className="flex w-64 flex-shrink-0 flex-col border-r border-zinc-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:w-72"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3.5 dark:border-zinc-800">
              <span className={tt.label}>Classes</span>
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
              {gradesError && grades.length === 0 ? (
                <div className="p-3">
                  <TimetableGridError
                    compact
                    title="Failed to load classes"
                    description="Check your connection and try again."
                    onRetry={isRetrying ? undefined : handleRetry}
                  />
                  {isRetrying && (
                    <RetryingSpinner className="mt-2 justify-center" />
                  )}
                </div>
              ) : (
                <>
                  {gradesError && grades.length > 0 && (
                    <div className="px-3 pt-2">
                      <TimetableGridError
                        compact
                        title="Some classes couldn't be loaded"
                        onRetry={isRetrying ? undefined : handleRetry}
                      />
                      {isRetrying && (
                        <RetryingSpinner className="mt-1 justify-center" />
                      )}
                    </div>
                  )}
                  <TimetableClassSidebar
                    grades={sidebarGrades}
                    allGradesCount={grades.length}
                    selectedGradeId={selectedGradeId}
                    pinnedGradeId={pinnedGradeId}
                    onSelectAllClasses={() => setSelectedGrade(null)}
                    onSelectGrade={setSelectedGrade}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    searchInputRef={gradeSearchRef}
                  />
                </>
              )}
            </div>
          </aside>
        )
      )}

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Toolbar ── */}
        <header
          data-timetable-no-print
          className="shrink-0 border-b border-slate-200/80 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-6"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Timetable
                </h1>
                <p className="mt-0.5 text-xs text-slate-400">
                  Build your weekly schedule.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 lg:flex-nowrap">
                {hasScheduleStructure && isSidebarMinimized && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 border-zinc-200 text-xs dark:border-zinc-700"
                    onClick={() => setIsSidebarMinimized(false)}
                  >
                    <PanelLeftOpen className="h-3.5 w-3.5" />
                    Classes
                  </Button>
                )}
                {selectedGradeId && hasScheduleStructure && (
                  <Button
                    size="sm"
                    className="h-9 gap-1.5 bg-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                    onClick={() => setBulkLessonEntryOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">
                      Add several lessons
                    </span>
                    <span className="sm:hidden">Add lessons</span>
                  </Button>
                )}
                {selectedGradeId &&
                  hasScheduleStructure &&
                  sortedTeachers.length > 0 && (
                    <div className="hidden lg:block">
                      <Select
                        value={highlightTeacherId ?? "all"}
                        onValueChange={(v) =>
                          setHighlightTeacherId(v === "all" ? null : v)
                        }
                      >
                        <SelectTrigger
                          className="h-9 w-[9.5rem] border-zinc-200 text-xs dark:border-zinc-700"
                          title="Highlight one teacher's lessons on the grid"
                        >
                          <Users className="h-3.5 w-3.5 mr-1.5 shrink-0 text-slate-500" />
                          <SelectValue placeholder="All teachers" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All teachers</SelectItem>
                          {sortedTeachers.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                {hasScheduleStructure && selectedTerm && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden h-9 gap-1.5 border-zinc-200 text-xs lg:inline-flex dark:border-zinc-700"
                    onClick={() => setShareDrawerOpen(true)}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    {sharedAt && !changesSinceShare
                      ? "Published"
                      : changesSinceShare
                        ? "Publish again"
                        : "Publish"}
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-1.5 border-zinc-200 text-xs lg:hidden dark:border-zinc-700"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                      More
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => reloadTimetableData()}>
                      <RefreshCw className="h-3.5 w-3.5 mr-2" />
                      Refresh
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setBulkBreaksOpen(true)}>
                      <Coffee className="h-3.5 w-3.5 mr-2" />
                      Breaks & lunch
                    </DropdownMenuItem>
                    {hasScheduleStructure && isSidebarMinimized && (
                      <DropdownMenuItem
                        onClick={() => setIsSidebarMinimized(false)}
                      >
                        <PanelLeftOpen className="h-3.5 w-3.5 mr-2" />
                        Class list
                      </DropdownMenuItem>
                    )}
                    {hasScheduleStructure && selectedTerm && (
                      <DropdownMenuItem
                        onClick={() => setShareDrawerOpen(true)}
                      >
                        <Share2 className="h-3.5 w-3.5 mr-2" />
                        Publish for teachers
                      </DropdownMenuItem>
                    )}
                    {selectedGradeId &&
                      hasScheduleStructure &&
                      sortedTeachers.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setHighlightTeacherId(null)}
                          >
                            <Users className="h-3.5 w-3.5 mr-2" />
                            All teachers on grid
                          </DropdownMenuItem>
                          {sortedTeachers.map((t) => (
                            <DropdownMenuItem
                              key={t.id}
                              onClick={() => setHighlightTeacherId(t.id)}
                            >
                              <Users className="h-3.5 w-3.5 mr-2 opacity-60" />
                              Highlight {t.name}
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleCopyTermSummary}>
                      <Copy className="h-3.5 w-3.5 mr-2" />
                      Copy term summary
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportTermCsv}>
                      <Download className="h-3.5 w-3.5 mr-2" />
                      Download term CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleEmailStaffSummary}>
                      <Mail className="h-3.5 w-3.5 mr-2" />
                      Email staff summary
                    </DropdownMenuItem>
                    {selectedGradeId && (
                      <>
                        <DropdownMenuItem onClick={handlePrintClassTimetable}>
                          <Printer className="h-3.5 w-3.5 mr-2" />
                          Print this class
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportClassCsv}>
                          <Download className="h-3.5 w-3.5 mr-2" />
                          Download class CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleCopyClassSummary}>
                          <Copy className="h-3.5 w-3.5 mr-2" />
                          Copy class summary
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  onClick={() => reloadTimetableData()}
                  title="Refresh timetable data"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-9 gap-1.5 text-xs",
                    showFullSubjectName
                      ? "text-slate-900 dark:text-slate-100"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
                  )}
                  onClick={() => setShowFullSubjectName(!showFullSubjectName)}
                  title={
                    showFullSubjectName
                      ? "Show subject codes"
                      : "Show full subject names"
                  }
                >
                  <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-wider">
                    {showFullSubjectName ? "MAT" : "Math"}
                  </span>
                </Button>
                <Button
                  variant={showConflicts ? "default" : "outline"}
                  size="sm"
                  className="h-9 gap-1.5 text-xs"
                  onClick={toggleConflicts}
                  title={
                    showConflicts
                      ? "Hide problem highlights"
                      : "Highlight scheduling problems on the grid"
                  }
                >
                  {showConflicts ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  {showConflicts
                    ? "Hide highlights"
                    : conflictCount > 0
                      ? `Problems (${conflictCount})`
                      : "Highlight problems"}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden lg:inline-flex h-9 w-9"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem
                      onClick={() => setShowTimetableWizard(true)}
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-2" />
                      Guided setup again
                    </DropdownMenuItem>
                    {hasScheduleStructure && (
                      <DropdownMenuItem
                        onClick={requestOpenAdvancedSchedule}
                        className="text-amber-800 dark:text-amber-200"
                      >
                        <LayoutGrid className="h-3.5 w-3.5 mr-2" />
                        Edit lesson times…
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setPeriodsDrawerOpen(true)}
                    >
                      <Clock className="h-3.5 w-3.5 mr-2" />
                      Lesson times list
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setBreaksDrawerOpen(true)}>
                      <Coffee className="h-3.5 w-3.5 mr-2" />
                      Breaks & lunch
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyTermSummary}>
                      <Copy className="h-3.5 w-3.5 mr-2" />
                      Copy term summary
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportTermCsv}>
                      <Download className="h-3.5 w-3.5 mr-2" />
                      Download term CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleEmailStaffSummary}>
                      <Mail className="h-3.5 w-3.5 mr-2" />
                      Email staff summary
                    </DropdownMenuItem>
                    {hasScheduleStructure && selectedTerm && (
                      <DropdownMenuItem
                        onClick={() => setShareDrawerOpen(true)}
                      >
                        <Share2 className="h-3.5 w-3.5 mr-2" />
                        Share with staff…
                      </DropdownMenuItem>
                    )}
                    {selectedGradeId && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handlePrintClassTimetable}>
                          <Printer className="h-3.5 w-3.5 mr-2" />
                          Print this class
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportClassCsv}>
                          <Download className="h-3.5 w-3.5 mr-2" />
                          Download class CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleCopyClassSummary}>
                          <Copy className="h-3.5 w-3.5 mr-2" />
                          Copy class summary
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => reloadTimetableData()}>
                      <RefreshCw className="h-3.5 w-3.5 mr-2" />
                      Refresh
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteAllDialog(true)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Reset lesson times
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowDeleteAllEntriesDialog(true)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Clear all lessons
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setShowDeleteTimetableDialog(true)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Delete entire timetable
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="space-y-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/40">
              {hasScheduleStructure && isSidebarMinimized && (
                <GradeClassSearch
                  ref={gradeSearchRef}
                  id="timetable-grade-search-toolbar"
                  value={searchTerm}
                  onChange={setSearchTerm}
                  resultCount={filteredGrades.length}
                  totalCount={grades.length}
                  className="max-w-md pb-0.5"
                />
              )}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                {!selectedGradeId && chipGrades.length > 0 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 shrink-0 rounded-full text-xs whitespace-nowrap"
                    onClick={() => setSelectedGrade(chipGrades[0].id)}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    Start with {chipGrades[0].displayName || chipGrades[0].name}
                  </Button>
                )}
                {chipGrades.length === 0 && searchTerm.trim() ? (
                  <p className="px-1 py-1.5 text-[12px] text-zinc-500">
                    No classes match &ldquo;{searchTerm.trim()}&rdquo;.{" "}
                    <button
                      type="button"
                      className="font-medium text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-300"
                      onClick={() => setSearchTerm("")}
                    >
                      Clear search
                    </button>
                  </p>
                ) : (
                  chipGrades.map((g) => {
                    const hiddenBySearch =
                      searchTerm.trim().length > 0 &&
                      !filteredGrades.some((f) => f.id === g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGrade(g.id)}
                        className={cn(
                          "flex max-w-[11rem] flex-shrink-0 items-center gap-1 truncate rounded-lg border px-2.5 py-1.5 text-[12px] font-medium tracking-tight transition-colors",
                          selectedGradeId === g.id
                            ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                            : "border-transparent bg-white text-zinc-600 hover:border-zinc-200 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600",
                          hiddenBySearch &&
                            selectedGradeId !== g.id &&
                            "opacity-60",
                        )}
                        title={
                          hiddenBySearch
                            ? `${g.displayName || g.name} (current selection — clear search to browse all)`
                            : g.displayName || g.name
                        }
                      >
                        <span className="truncate">
                          {g.displayName || g.name}
                        </span>
                        {selectedGradeId === g.id && (
                          <ChevronRight className="h-3 w-3 shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
              {selectedGradeId && currentStreams.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-0.5 border-t border-slate-200/80 dark:border-slate-700/80">
                  <span className={cn(tt.label, "shrink-0 pr-1")}>Section</span>
                  {currentStreams.map((s) => (
                    <button
                      key={s.tenantStreamId}
                      type="button"
                      onClick={() => setSelectedStream(s.tenantStreamId)}
                      className={cn(
                        "flex-shrink-0 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
                        selectedStreamId === s.tenantStreamId
                          ? "border-zinc-700 bg-zinc-700 text-white dark:border-zinc-300 dark:bg-zinc-300 dark:text-zinc-900"
                          : "border-zinc-200/80 bg-white text-zinc-500 hover:text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:text-zinc-200",
                      )}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
            {!isOnline && hasScheduleStructure && (
              <div data-timetable-no-print>
                <TimetableOfflineBanner />
              </div>
            )}

            {!hideLiveBanner && hasScheduleStructure && (
              <div
                className={cn(
                  tt.panelMuted,
                  "flex items-start justify-between gap-3 px-4 py-2.5",
                )}
              >
                <span className={tt.caption}>
                  <strong className="font-semibold text-zinc-700 dark:text-zinc-200">
                    Saves apply immediately.
                  </strong>{" "}
                  Use Share with staff to publish for teachers.
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs shrink-0"
                  onClick={() => {
                    try {
                      localStorage.setItem("timetable-hide-live-banner", "1");
                    } catch {
                      /* ignore */
                    }
                    setHideLiveBanner(true);
                  }}
                >
                  Dismiss
                </Button>
              </div>
            )}

            {!hasScheduleStructure &&
              !showTimetableWizard &&
              !isPageLoading && (
                <TimetableOnboarding
                  onSetupSchoolDay={() => setShowTimetableWizard(true)}
                />
              )}

            {(hasScheduleStructure || isPageLoading || selectedGradeId) && (
              <section
                data-timetable-print-root
                className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="hidden print:block px-4 lg:px-5 pt-4 border-b border-slate-200">
                  <h2 className="text-lg font-bold text-slate-900">
                    {classDisplayLabel}
                    {currentStream ? ` — ${currentStream.name}` : ""}
                  </h2>
                </div>
                <div
                  data-timetable-no-print
                  className="border-b border-zinc-100 px-4 py-3.5 dark:border-zinc-800 lg:px-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        {selectedGradeId
                          ? "Schedule"
                          : hasScheduleStructure
                            ? "All classes"
                            : "Preview"}
                      </p>
                      <h2 className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {selectedGradeId
                          ? "Weekly timetable"
                          : "Whole-school timetable"}
                      </h2>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {selectedGradeId
                          ? "Tap an empty cell to add a lesson. Tap a filled cell to edit."
                          : hasScheduleStructure
                            ? "Every class and stream in each slot — filled cells show the lesson; empty cells are open. Tap to open a class."
                            : "Complete step 1 above to see the schedule here."}
                        {highlightTeacherId && (
                          <span className="mt-1 block text-slate-600 dark:text-slate-300">
                            Dimmed cells are taught by other teachers.
                          </span>
                        )}
                      </p>
                    </div>
                    {hasScheduleStructure && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-zinc-200 text-xs text-zinc-600 dark:border-zinc-700"
                        onClick={requestOpenAdvancedSchedule}
                      >
                        <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
                        Edit lesson times
                      </Button>
                    )}
                  </div>
                </div>

                <div className="bg-zinc-50/30 p-3 dark:bg-zinc-950/30 lg:p-4">
                  {refreshLoadFailed &&
                  !combinedGridFailed &&
                  !classGridFailed ? (
                    <div className="mb-3">
                      <TimetableGridError
                        compact
                        title="Could not refresh — showing last loaded data"
                        description={
                          timetableLoadError
                            ? timetableLoadError
                            : "Check your connection and try again."
                        }
                        onRetry={isRetrying ? undefined : handleRetry}
                      />
                      {isRetrying ? (
                        <RetryingSpinner className="mt-2 justify-center" />
                      ) : null}
                    </div>
                  ) : null}
                  {!selectedGradeId && combinedGridFailed ? (
                    <div className="space-y-2">
                      <TimetableGridError
                        title="Failed to load timetable"
                        description={
                          timetableLoadError
                            ? `Could not load the whole-school timetable. ${timetableLoadError}`
                            : "Could not load the whole-school timetable. Check your connection and retry."
                        }
                        onRetry={isRetrying ? undefined : handleRetry}
                      />
                      {isRetrying ? (
                        <RetryingSpinner className="justify-center" />
                      ) : null}
                    </div>
                  ) : selectedGradeId && classGridFailed ? (
                    <div className="space-y-2">
                      <TimetableGridError
                        title="Failed to load timetable"
                        description={
                          timetableLoadError
                            ? `Could not load the timetable for this class. ${timetableLoadError}`
                            : "Could not load the timetable for this class. Check your connection and retry."
                        }
                        onRetry={isRetrying ? undefined : handleRetry}
                      />
                      {isRetrying ? (
                        <RetryingSpinner className="justify-center" />
                      ) : null}
                    </div>
                  ) : showGridSkeleton ? (
                    <TimetableGridSkeleton combined={!selectedGradeId} />
                  ) : !selectedGradeId ? (
                      <AdminTimetableGrid
                        schoolCombined
                        periodNumbers={periodNumbers}
                        days={days}
                        getSlotFor={(d, p) => getSlotFor(d, p) ?? null}
                        getEntryFor={() => null}
                        getCombinedEntriesFor={getCombinedEntriesFor}
                        onCombinedLessonClick={handleCombinedLessonClick}
                        getBreaksAfterPeriod={getBreaksAfterPeriod}
                        getBreaksBeforeFirstPeriod={getBreaksBeforeFirstPeriod}
                        hasNoTimeSlots={
                          periodNumbers.length === 0 && timeSlots.length === 0
                        }
                        getCleanBreakName={getCleanBreakName}
                        getSubjectAccent={getSubjectAccentForGrid}
                        conflictLessonIds={
                          showConflicts ? conflictLessonIds : undefined
                        }
                        conflictTooltipMap={
                          showConflicts ? conflictTooltipMap : undefined
                        }
                        showFullSubjectName={showFullSubjectName}
                        highlightTeacherId={highlightTeacherId}
                        onEditTimeslot={setEditingTimeslot}
                        onEditBreak={setEditingBreak}
                        onMoveBreak={handleMoveBreak}
                        movingBreakId={movingBreakId}
                        onCreateSchedule={() => setShowTimetableWizard(true)}
                      />
                  ) : (
                    <AdminTimetableGrid
                      periodNumbers={periodNumbers}
                      days={days}
                      getSlotFor={(d, p) => getSlotFor(d, p) ?? null}
                      getEntryFor={getEntryFor}
                      getBreaksAfterPeriod={getBreaksAfterPeriod}
                      getBreaksBeforeFirstPeriod={getBreaksBeforeFirstPeriod}
                      hasNoTimeSlots={
                        periodNumbers.length === 0 && timeSlots.length === 0
                      }
                      getCleanBreakName={getCleanBreakName}
                      getSubjectAccent={getSubjectAccentForGrid}
                      conflictLessonIds={
                        showConflicts ? conflictLessonIds : undefined
                      }
                      conflictTooltipMap={
                        showConflicts ? conflictTooltipMap : undefined
                      }
                      showFullSubjectName={showFullSubjectName}
                      highlightTeacherId={highlightTeacherId}
                      onEditTimeslot={setEditingTimeslot}
                      onDeleteTimeslot={setTimeslotToDelete}
                      onEditLesson={handleEditLesson}
                      onDeleteLesson={setDeleteEntryConfirm}
                      onAddLesson={handleAddLesson}
                      onEditBreak={setEditingBreak}
                      onAddBreak={handleAddBreak}
                      onMoveBreak={handleMoveBreak}
                      movingBreakId={movingBreakId}
                      onCreateSchedule={() => setShowTimetableWizard(true)}
                    />
                  )}
                </div>
              </section>
            )}

            <TimetableStatusBar
              hasScheduleStructure={hasScheduleStructure}
              hasAnyLessons={hasAnyLessons}
              conflictCount={conflictCount}
              onAddFirstLesson={() => {
                if (!selectedGradeId && grades.length > 0) {
                  setSelectedGrade(grades[0].id);
                }
              }}
              onHighlightProblems={handleHighlightProblems}
              classLabel={selectedGradeId ? classDisplayLabel : "All classes"}
              streamName={currentStream?.name}
              filledSlots={
                selectedGradeId ? stats.filledSlots : termOverview.totalFilled
              }
              totalSlots={
                selectedGradeId ? stats.totalSlots : termOverview.totalSlots
              }
              totalLessons={
                selectedGradeId ? stats.totalLessons : schoolLessonCount
              }
              periodCount={periodNumbers.length}
              lastUpdatedIso={lastUpdated}
            />

            {selectedGradeId &&
              stats.totalSlots > 0 &&
              stats.filledSlots < stats.totalSlots && (
                <TimetableFillProgress
                  filled={stats.filledSlots}
                  total={stats.totalSlots}
                  onAddSeveralLessons={() => setBulkLessonEntryOpen(true)}
                  onDuplicateDay={() => setBulkLessonEntryOpen(true)}
                />
              )}

            {selectedGradeId && (
              <TimetableCompletionBanner
                classLabel={classDisplayLabel}
                filledSlots={stats.filledSlots}
                totalSlots={stats.totalSlots}
                conflictCount={conflictCount}
                onPrint={handlePrintClassTimetable}
                onPublish={() => setShareDrawerOpen(true)}
              />
            )}

            {selectedGradeId && (
              <TimetableSubjectInsights insights={subjectInsights} />
            )}

            {showConflicts && conflictCount > 0 && (
              <TimetableConflictsPanel
                teacherConflicts={teacherConflicts}
                roomConflicts={roomConflicts}
                onJumpToLesson={handleJumpToConflictEntry}
              />
            )}
          </div>
        </div>
      </main>

      {/* ── Dialogs & Drawers ── */}
      <LessonEditDialog
        lesson={editingLesson}
        onClose={() => {
          setEditingLesson(null);
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
      <TimetableShareDrawer
        open={shareDrawerOpen}
        onOpenChange={setShareDrawerOpen}
        termName={selectedTerm?.name}
        academicYearName={activeAcademicYear?.name}
        hasScheduleStructure={hasScheduleStructure}
        conflictCount={conflictCount}
        overview={termOverview}
        classLabel={
          selectedGradeId
            ? `${classDisplayLabel}${currentStream ? ` — ${currentStream.name}` : ""}`
            : undefined
        }
        sharedAt={sharedAt}
        hasChangesSinceShare={changesSinceShare}
        onMarkShared={async () => {
          try {
            const publishedAt = await markShared();
            if (selectedTerm && publishedAt) {
              setSelectedTerm({
                ...selectedTerm,
                timetablePublishedAt: publishedAt,
              });
            }
            toast({
              title: "Published for teachers",
              description:
                "Teachers can now see this term's timetable. You can still edit; tell staff if you make big changes.",
            });
          } catch (err) {
            toast({
              title: "Could not publish",
              description:
                err instanceof Error ? err.message : "Please try again.",
              variant: "destructive",
            });
            throw err;
          }
        }}
        onPrint={selectedGradeId ? handlePrintClassTimetable : undefined}
        onCopySummary={selectedGradeId ? handleCopyClassSummary : undefined}
        onCopyTermSummary={handleCopyTermSummary}
        onEmailStaff={handleEmailStaffSummary}
        onExportClassCsv={selectedGradeId ? handleExportClassCsv : undefined}
        onExportTermCsv={handleExportTermCsv}
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
            <SheetTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <Clock className="h-4 w-4 text-zinc-500" />
              Lesson times
            </SheetTitle>
            <SheetDescription className={tt.caption}>
              Periods shared across the week. Tap delete to remove a slot.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 max-h-[calc(100vh-200px)] space-y-2 overflow-y-auto">
            {timeSlots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200/90 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900/80"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <span className="text-[11px] font-bold tabular-nums text-zinc-600 dark:text-zinc-300">
                      P{slot.periodNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
                      Period {slot.periodNumber}
                    </span>
                    <p className="font-mono text-[11px] tabular-nums text-zinc-500">
                      {slot.time || `${slot.startTime} - ${slot.endTime}`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTimeslotToDelete(slot)}
                  className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={breaksDrawerOpen} onOpenChange={setBreaksDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <Coffee className="h-4 w-4 text-zinc-500" />
              Breaks & lunch
            </SheetTitle>
            <SheetDescription className={tt.caption}>
              Tap a break to edit it, or add a new one for this school day.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-2 flex-1 overflow-y-auto min-h-0">
            {breaks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-200 p-6 text-center dark:border-zinc-700">
                <Coffee className="mx-auto mb-2 h-8 w-8 text-zinc-300" />
                <p className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
                  No breaks yet
                </p>
                <p className={cn(tt.caption, "mt-1")}>
                  Add lunch, assembly, or short breaks between lessons.
                </p>
              </div>
            ) : (
              breaks.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setBreaksDrawerOpen(false);
                    setEditingBreak(b);
                  }}
                  className="flex w-full items-center justify-between rounded-lg border border-zinc-200/90 bg-white p-3 text-left transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900/80 dark:hover:border-zinc-600"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-lg dark:bg-stone-900/50">
                      {b.icon}
                    </div>
                    <div className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
                        {getCleanBreakName(b.name)}
                      </span>
                      <p className={tt.caption}>
                        {formatBreakTypeLabel(b.type)} · {b.durationMinutes} min
                      </p>
                    </div>
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setBreakToDelete({
                        id: b.id,
                        name: getCleanBreakName(b.name),
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        setBreakToDelete({
                          id: b.id,
                          name: getCleanBreakName(b.name),
                        });
                      }
                    }}
                    className="p-1.5 hover:bg-red-50 rounded text-red-500 shrink-0"
                    aria-label="Remove break"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </span>
                </button>
              ))
            )}
          </div>
          <div className="pt-4 border-t mt-2 flex gap-2">
            <Button
              type="button"
              className="flex-1 h-9"
              onClick={() => {
                setBreaksDrawerOpen(false);
                setEditingBreak({
                  isNew: true,
                  afterPeriod: 0,
                  name: "New Break",
                  type: "short_break",
                  durationMinutes: 20,
                } as any);
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add break
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9"
              onClick={() => {
                setBreaksDrawerOpen(false);
                setBulkBreaksOpen(true);
              }}
            >
              Add several
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={!!timeslotToDelete}
        onOpenChange={() => setTimeslotToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this lesson period?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes period {timeslotToDelete?.periodNumber} from the
              schedule. Lessons in this slot may need to be re-added.
            </AlertDialogDescription>
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
            <AlertDialogTitle>Reset all lesson times?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes every period time for{" "}
              {selectedTerm?.name ?? "this term"}. You will need to set up
              school day times again. This cannot be undone.
            </AlertDialogDescription>
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
            <AlertDialogTitle>Delete entire timetable?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the timetable structure, periods, breaks, and all
              lessons for {selectedTerm?.name ?? "this term"}. This cannot be
              undone.
            </AlertDialogDescription>
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
            <AlertDialogTitle>Clear all lessons?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes every scheduled lesson for{" "}
              {selectedTerm?.name ?? "this term"} but keeps your lesson times
              and breaks. This cannot be undone.
            </AlertDialogDescription>
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
            <AlertDialogTitle>Remove this lesson?</AlertDialogTitle>
            <AlertDialogDescription>
              The slot will be empty and you can add a different lesson later.
            </AlertDialogDescription>
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

      <AlertDialog
        open={advancedScheduleConfirmOpen}
        onOpenChange={setAdvancedScheduleConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit lesson times?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                This updates when lessons start, how long they run, and how many
                fit in each day. Existing lessons stay in place where possible.
              </span>
              <span className="block">
                For first-time setup, use <strong>Guided setup</strong> from the
                menu instead — it is safer and walks you through breaks and the
                week preview.
              </span>
              {hasScheduleStructure && (
                <span className="block text-amber-800 dark:text-amber-200">
                  Saving here may remove existing lessons tied to old period
                  slots.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setAdvancedScheduleConfirmOpen(false);
                setBulkScheduleOpen(true);
              }}
            >
              Open advanced editor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!breakToDelete}
        onOpenChange={(open) => !open && setBreakToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this break?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{breakToDelete?.name}</strong> will be removed from the
              school day. Lessons are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600"
              onClick={async () => {
                if (!breakToDelete?.id) return;
                try {
                  await deleteBreak(breakToDelete.id);
                  await reloadTimetableData();
                  toast({ title: "Break removed" });
                } catch {
                  toast({
                    title: "Could not remove break",
                    description: "Please refresh and try again.",
                    variant: "destructive",
                  });
                } finally {
                  setBreakToDelete(null);
                }
              }}
            >
              Remove break
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
}
