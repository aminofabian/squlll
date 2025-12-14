
'use client';

import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';
import type { Break } from '@/lib/types/timetable';
import {
  useSelectedGradeTimetable,
  useTimetableGrid,
  useGradeStatistics,
  usePeriodSlots
} from './hooks/useTimetableData';
import { useAllConflicts } from './hooks/useTimetableConflictsNew';
import { LessonEditDialog } from './components/LessonEditDialog';
import { TimeslotEditDialog } from './components/TimeslotEditDialog';
import { BreakEditDialog } from './components/BreakEditDialog';
import { BulkScheduleDrawer } from './components/BulkScheduleDrawer';
import { BulkBreaksDrawer } from './components/BulkBreaksDrawer';
import { BulkLessonEntryDrawer } from './components/BulkLessonEntryDrawer';
import { WeekTemplateManager } from './components/WeekTemplateManager';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSelectedTerm } from '@/lib/hooks/useSelectedTerm';
import { useCurrentAcademicYear } from '@/lib/hooks/useAcademicYears';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PanelLeftClose, PanelLeftOpen, Clock, Edit2, Trash2, Plus, Calendar, BookOpen, Coffee } from 'lucide-react';
import { SchoolSearchFilter } from '@/components/dashboard/SchoolSearchFilter';
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { TimetableOnboarding } from './components/TimetableOnboarding';
import { CreateAcademicYearModal } from '@/app/school/[subdomain]/(pages)/dashboard/components/CreateAcademicYearModal';
import { CreateTermModal } from '@/app/school/[subdomain]/(pages)/dashboard/components/CreateTermModal';

export default function SmartTimetableNew() {
  // Get selected term from context
  const { selectedTerm } = useSelectedTerm();
  // Get academic years
  const { academicYears, loading: academicYearsLoading, refetch: refetchAcademicYears } = useCurrentAcademicYear();
  // Get store data and actions
  const {
    grades,
    subjects,
    teachers,
    timeSlots,
    selectedGradeId,
    selectedTermId,
    setSelectedGrade,
    searchTerm,
    setSearchTerm,
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
    deleteBreak,
    addPeriodsToDayTemplate,
    createBreaks,
    deleteAllBreaks,
    deleteEntriesForTerm,
    deleteTimetableForTerm,
  } = useTimetableStore();

  // Toast for notifications
  const { toast } = useToast();

  // Check if onboarding is needed
  const hasAcademicYear = academicYears.length > 0;
  const hasTerm = !!selectedTerm;
  const hasWeekTemplate = timeSlots.length > 0;
  const needsOnboarding = !academicYearsLoading && (!hasAcademicYear || !hasTerm || !hasWeekTemplate);

  // Load time slots, grades, subjects, and teachers from backend on mount
  useEffect(() => {
    setLoadingTimeSlots(true);
    // Use term from context if available, otherwise use selectedTermId from store
    const termId = selectedTerm?.id || selectedTermId;

    Promise.all([
      loadGrades(),
      loadSubjects(), // Load all subjects initially
      loadTeachers(), // Load all teachers
      loadBreaks(), // Load breaks from GetAllDayTemplateBreaks query (no caching)
      // Load complete timetable if term is available (includes time slots and entries)
      termId ? loadSchoolTimetable(termId) : Promise.resolve(),
    ])
      .then(() => {
        console.log('Grades, subjects, teachers, breaks, and timetable loaded successfully');
      })
      .catch((error) => {
        console.error('Failed to load data:', error);
        // Don't show error toast for missing term - it's expected on first load
        if (error.message && !error.message.includes('No term selected')) {
          toast({
            title: 'Error',
            description: 'Failed to load some data. Please try again.',
            variant: 'destructive',
          });
        }
      })
      .finally(() => {
        setLoadingTimeSlots(false);
      });
  }, [loadGrades, loadSubjects, loadTeachers, loadBreaks, loadSchoolTimetable, selectedTerm?.id, selectedTermId, toast]);

  // Reload subjects when grade selection changes
  useEffect(() => {
    if (selectedGradeId) {
      loadSubjects(selectedGradeId)
        .then(() => {
          console.log('Subjects loaded for grade:', selectedGradeId);
        })
        .catch((error) => {
          console.error('Failed to load subjects for grade:', error);
        });
    }
  }, [selectedGradeId, loadSubjects]);

  // Load timetable entries automatically when grade is selected
  useEffect(() => {
    // Don't load if no grade is selected
    if (!selectedGradeId) {
      return;
    }

    // Use term from context if available, otherwise use selectedTermId from store
    const termId = selectedTerm?.id || selectedTermId;

    // If no term is available, show a message but don't block
    if (!termId) {
      console.warn('No term selected. Please select a term to load timetable entries.');
      toast({
        title: 'No Term Selected',
        description: 'Please select a term to view timetable entries.',
        variant: 'default',
      });
      return;
    }

    // Load entries for the selected grade and term
    console.log('Loading entries for grade:', selectedGradeId, 'term:', termId);
    loadEntries(termId, selectedGradeId)
      .then(() => {
        console.log('Timetable entries loaded successfully for grade:', selectedGradeId, 'term:', termId);
      })
      .catch((error) => {
        console.error('Failed to load timetable entries:', error);
        toast({
          title: 'Error',
          description: 'Failed to load timetable entries. Please try again.',
          variant: 'destructive',
        });
      });
  }, [selectedGradeId, selectedTermId, selectedTerm?.id, loadEntries, toast]);

  const handleAddPeriods = async () => {
    try {
      setTemplatesLoading(true);
      const templates = await loadDayTemplates();
      setDayTemplates(templates || []);
      setAddPeriodsTemplateId(templates?.[0]?.id || '');
      setAddPeriodsDrawerOpen(true);
    } catch (error) {
      console.error('Error loading day templates:', error);
      toast({
        title: 'Failed to load templates',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleOpenTemplates = async () => {
    try {
      setTemplatesDrawerOpen(true);
      setTemplatesLoading(true);
      const templates = await loadDayTemplates();
      setDayTemplates(templates || []);
    } catch (error) {
      console.error('Error loading day templates:', error);
      toast({
        title: 'Failed to load templates',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleConfirmAddPeriods = async () => {
    try {
      setAddingPeriods(true);
      const extraPeriods = parseInt(addPeriodsCount || '0', 10);
      if (!addPeriodsTemplateId || !Number.isFinite(extraPeriods) || extraPeriods <= 0) {
        toast({
          title: 'Invalid input',
          description: 'Select a template and enter a positive number of extra periods.',
          variant: 'destructive',
        });
        return;
      }

      await addPeriodsToDayTemplate(addPeriodsTemplateId, extraPeriods);
      await loadDayTemplatePeriods();

      toast({
        title: 'Periods added',
        description: `Added ${extraPeriods} period${extraPeriods !== 1 ? 's' : ''}.`,
        variant: 'default',
      });

      setAddPeriodsDrawerOpen(false);
    } catch (error) {
      console.error('Error adding periods:', error);
      toast({
        title: 'Failed to add periods',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setAddingPeriods(false);
    }
  };

  // Get enriched entries for selected grade (memoized!)
  const entries = useSelectedGradeTimetable();

  // Get grid organized by day/period (memoized!)
  const grid = useTimetableGrid(selectedGradeId);

  // Get period slots grouped by day with helpers
  const { periodNumbers, getSlotFor } = usePeriodSlots();

  // Get statistics (memoized!)
  const stats = useGradeStatistics(selectedGradeId);

  // Get conflicts (memoized!)
  const { total: conflictCount, teacher: teacherConflicts } = useAllConflicts();

  // Days array (memoized)
  const days = useMemo(
    () => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    []
  );

  // Get breaks from store
  const breaks = useTimetableStore((state) => state.breaks);

  // Handle grade selection
  const handleGradeChange = useCallback(
    (gradeId: string) => {
      setSelectedGrade(gradeId);
    },
    [setSelectedGrade]
  );

  // Handle grade selection from sidebar
  const handleGradeSelect = useCallback(
    (gradeId: string, levelId: string) => {
      setSelectedGrade(gradeId);
    },
    [setSelectedGrade]
  );

  // Reload timetable data (breaks, time slots, and entries)
  const reloadTimetableData = useCallback(async () => {
    try {
      const termId = selectedTerm?.id || selectedTermId;
      await Promise.all([
        loadBreaks(),
        loadDayTemplatePeriods(),
        termId && selectedGradeId ? loadEntries(termId, selectedGradeId) : Promise.resolve(),
      ]);
      console.log('Timetable data reloaded successfully');
    } catch (error) {
      console.error('Failed to reload timetable data:', error);
    }
  }, [loadBreaks, loadDayTemplatePeriods, loadEntries, selectedTerm?.id, selectedTermId, selectedGradeId]);

  const handleDeleteEntriesForTerm = useCallback(async () => {
    const termId = selectedTerm?.id || selectedTermId;
    if (!termId) {
      toast({
        title: 'No Term Selected',
        description: 'Select a term before deleting its entries.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsDeletingTermEntries(true);
      const message = await deleteEntriesForTerm(termId);
      toast({
        title: 'Entries deleted',
        description: message || 'Deleted all timetable entries for this term.',
      });
      setShowDeleteAllEntriesDialog(false);
      // Reload data
      await reloadTimetableData();
    } catch (error) {
      console.error('Failed to delete term entries:', error);
      toast({
        title: 'Failed to delete entries',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingTermEntries(false);
    }
  }, [deleteEntriesForTerm, selectedTerm?.id, selectedTermId, toast, reloadTimetableData]);

  const handleDeleteTimetableForTerm = useCallback(async () => {
    const termId = selectedTerm?.id || selectedTermId;
    if (!termId) {
      toast({
        title: 'No Term Selected',
        description: 'Select a term before deleting its timetable.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsDeletingTimetable(true);
      const message = await deleteTimetableForTerm(termId);
      toast({
        title: 'Timetable deleted',
        description: message || 'Complete timetable for this term was deleted.',
      });
      setShowDeleteTimetableDialog(false);
      // Reload data
      await reloadTimetableData();
    } catch (error) {
      console.error('Failed to delete timetable for term:', error);
      toast({
        title: 'Failed to delete timetable',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingTimetable(false);
    }
  }, [deleteTimetableForTerm, selectedTerm?.id, selectedTermId, toast, reloadTimetableData]);

  // State for editing
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [editingTimeslot, setEditingTimeslot] = useState<any | null>(null);
  const [editingBreak, setEditingBreak] = useState<any | null>(null);
  const [bulkScheduleOpen, setBulkScheduleOpen] = useState(false);
  const [bulkBreaksOpen, setBulkBreaksOpen] = useState(false);
  const [bulkLessonEntryOpen, setBulkLessonEntryOpen] = useState(false);
  const [createTermModalOpen, setCreateTermModalOpen] = useState(false);
  const academicYearTriggerRef = useRef<HTMLButtonElement>(null);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(true);
  const [addingPeriods, setAddingPeriods] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [templatesDrawerOpen, setTemplatesDrawerOpen] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [dayTemplates, setDayTemplates] = useState<any[]>([]);
  const [templateViewType, setTemplateViewType] = useState<'day' | 'week'>('day');
  const [addPeriodsDrawerOpen, setAddPeriodsDrawerOpen] = useState(false);
  const [addPeriodsTemplateId, setAddPeriodsTemplateId] = useState<string>('');
  const [addPeriodsCount, setAddPeriodsCount] = useState<string>('1');
  const [isDeletingTermEntries, setIsDeletingTermEntries] = useState(false);
  const [isDeletingTimetable, setIsDeletingTimetable] = useState(false);

  // Fetch school config for the search filter
  const { isLoading: isLoadingConfig } = useSchoolConfig();

  // State for delete confirmation
  const [timeslotToDelete, setTimeslotToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showDeleteAllBreaksDialog, setShowDeleteAllBreaksDialog] = useState(false);
  const [isDeletingAllBreaks, setIsDeletingAllBreaks] = useState(false);
  const [breakToDelete, setBreakToDelete] = useState<Break | null>(null);
  const [isDeletingBreak, setIsDeletingBreak] = useState(false);
  const [showDeleteTimetableDialog, setShowDeleteTimetableDialog] = useState(false);
  const [showDeleteAllEntriesDialog, setShowDeleteAllEntriesDialog] = useState(false);

  // State for drawers
  const [periodsDrawerOpen, setPeriodsDrawerOpen] = useState(false);
  const [breaksDrawerOpen, setBreaksDrawerOpen] = useState(false);

  // Get current grade name
  const currentGrade = useMemo(
    () => grades.find(g => g.id === selectedGradeId),
    [grades, selectedGradeId]
  );

  // Handle timeslot deletion
  const handleDeleteTimeslot = useCallback(async () => {
    if (!timeslotToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTimeSlot(timeslotToDelete.id);
      toast({
        title: 'Timeslot deleted',
        description: `Period ${timeslotToDelete.periodNumber} has been successfully deleted.`,
      });
      setTimeslotToDelete(null);
      // Reload timeslots to ensure UI is in sync
      const termId = selectedTerm?.id || selectedTermId;
      await loadTimeSlots(termId || undefined);
    } catch (error) {
      console.error('Error deleting timeslot:', error);
      toast({
        title: 'Failed to delete timeslot',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  }, [timeslotToDelete, deleteTimeSlot, loadTimeSlots, toast]);

  // Handle delete all timeslots
  const handleDeleteAllTimeslots = useCallback(async () => {
    setIsDeletingAll(true);
    try {
      await deleteAllTimeSlots();
      toast({
        title: 'All timeslots deleted',
        description: `All ${timeSlots.length} time slot${timeSlots.length !== 1 ? 's' : ''} have been successfully deleted.`,
      });
      setShowDeleteAllDialog(false);
      // Reload timeslots to ensure UI is in sync
      const termId = selectedTerm?.id || selectedTermId;
      await loadTimeSlots(termId || undefined);
    } catch (error) {
      console.error('Error deleting all timeslots:', error);
      toast({
        title: 'Failed to delete all timeslots',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingAll(false);
    }
  }, [deleteAllTimeSlots, loadTimeSlots, toast, timeSlots.length]);

  // Handle delete all breaks by term
  const handleDeleteAllBreaks = useCallback(async () => {
    const termId = selectedTerm?.id || selectedTermId;
    if (!termId) {
      toast({
        title: 'No term selected',
        description: 'Please select a term before deleting breaks.',
        variant: 'destructive',
      });
      return;
    }

    setIsDeletingAllBreaks(true);
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation DeleteAllBreaksByTerm($input: DeleteBreaksByTermInput!) {
              deleteAllBreaksByTerm(input: $input) {
                success
                deletedBreaksCount
                recalculatedDaysCount
                message
                completedAt
              }
            }
          `,
          variables: {
            input: {
              termId: termId,
              confirmDeletion: true,
            },
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to delete breaks');
      }

      const data = result.data?.deleteAllBreaksByTerm;
      if (data?.success) {
        toast({
          title: 'All breaks deleted',
          description: data.message || `Successfully deleted ${data.deletedBreaksCount} break${data.deletedBreaksCount !== 1 ? 's' : ''} and recalculated ${data.recalculatedDaysCount} day template${data.recalculatedDaysCount !== 1 ? 's' : ''}.`,
        });
        // Reload breaks and timetable data
        await reloadTimetableData();
        setShowDeleteAllBreaksDialog(false);
      } else {
        throw new Error(data?.message || 'Failed to delete breaks');
      }
    } catch (error) {
      console.error('Error deleting all breaks:', error);
      toast({
        title: 'Failed to delete all breaks',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingAllBreaks(false);
    }
  }, [selectedTerm?.id, selectedTermId, toast, reloadTimetableData]);

  // Handle create lessons - check if grade is selected first
  const handleCreateLessons = useCallback(() => {
    if (!selectedGradeId) {
      console.log('No grade selected, showing toast');
      toast({
        title: 'Grade Required',
        description: 'Please select a grade first before creating lessons.',
        variant: 'destructive',
      });
      return;
    }
    setBulkLessonEntryOpen(true);
  }, [selectedGradeId, toast]);

  // Handle add lesson - check if grade is selected first
  const handleAddLesson = useCallback((dayOfWeek: number, timeSlotId: string, daySlotId?: string) => {
    if (!selectedGradeId) {
      toast({
        title: 'Grade Required',
        description: 'Please select a grade first before adding lessons.',
        variant: 'destructive',
      });
      return;
    }
    // Use day-specific slot if available, otherwise base slot
    const targetSlotId = daySlotId || timeSlotId;
    setEditingLesson({
      gradeId: selectedGradeId,
      dayOfWeek,
      timeSlotId: targetSlotId,
      isNew: true,
    });
  }, [selectedGradeId, toast]);

  // Handle delete breaks by type - opens confirmation dialog
  const handleDeleteBreak = useCallback((breakItem: Break) => {
    const termId = selectedTerm?.id || selectedTermId;
    if (!termId) {
      toast({
        title: 'No term selected',
        description: 'Please select a term before deleting breaks.',
        variant: 'destructive',
      });
      return;
    }
    setBreakToDelete(breakItem);
  }, [selectedTerm?.id, selectedTermId, toast]);

  // Actually delete breaks by type
  const confirmDeleteBreak = useCallback(async () => {
    if (!breakToDelete) return;

    const termId = selectedTerm?.id || selectedTermId;
    if (!termId) {
      toast({
        title: 'No term selected',
        description: 'Please select a term before deleting breaks.',
        variant: 'destructive',
      });
      setBreakToDelete(null);
      return;
    }

    // Map frontend break type to GraphQL enum format
    const typeMapping: Record<string, string> = {
      'short_break': 'SHORT_BREAK',
      'long_break': 'LONG_BREAK',
      'lunch': 'LUNCH',
      'afternoon_break': 'TEA_BREAK', // or 'AFTERNOON_BREAK' depending on backend
      'games': 'GAMES_BREAK',
      'assembly': 'ASSEMBLY',
      'recess': 'RECESS',
      'snack': 'SNACK_BREAK',
    };
    
    // Convert break type from frontend format to GraphQL enum
    const breakType = typeMapping[breakToDelete.type] || breakToDelete.type.toUpperCase();

    setIsDeletingBreak(true);
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation DeleteBreaksByType($input: DeleteBreaksByTypeInput!) {
              deleteBreaksByType(input: $input) {
                success
                breakType
                deletedBreaksCount
                recalculatedDaysCount
                message
                completedAt
              }
            }
          `,
          variables: {
            input: {
              termId: termId,
              breakType: breakType,
              confirmDeletion: true,
            },
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to delete breaks');
      }

      const data = result.data?.deleteBreaksByType;
      if (data?.success) {
        toast({
          title: 'Breaks deleted',
          description: data.message || `Successfully deleted ${data.deletedBreaksCount} ${data.breakType} break${data.deletedBreaksCount !== 1 ? 's' : ''} and recalculated ${data.recalculatedDaysCount} day template${data.recalculatedDaysCount !== 1 ? 's' : ''}.`,
        });
        // Reload timetable data to reflect changes
        await reloadTimetableData();
        setBreakToDelete(null);
      } else {
        throw new Error(data?.message || 'Failed to delete breaks');
      }
    } catch (error) {
      console.error('Error deleting breaks:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast({
        title: 'Failed to delete breaks',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsDeletingBreak(false);
    }
  }, [breakToDelete, selectedTerm?.id, selectedTermId, toast, reloadTimetableData]);

  // Show onboarding if needed
  if (needsOnboarding) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <TimetableOnboarding
            onCreateWeekTemplate={() => setBulkScheduleOpen(true)}
            onCreateBreaks={() => setBulkBreaksOpen(true)}
            onCreateLessons={handleCreateLessons}
            onOpenAcademicYearDrawer={() => academicYearTriggerRef.current?.click()}
            onOpenCreateTermDrawer={() => setCreateTermModalOpen(true)}
          />
        </div>

        {/* Drawers still available during onboarding */}
        <BulkScheduleDrawer
          open={bulkScheduleOpen}
          onClose={() => {
            reloadTimetableData();
            setBulkScheduleOpen(false);
          }}
        />
        <BulkBreaksDrawer
          open={bulkBreaksOpen}
          onClose={() => {
            reloadTimetableData();
            setBulkBreaksOpen(false);
          }}
        />
        <BulkLessonEntryDrawer
          open={bulkLessonEntryOpen}
          onClose={() => {
            reloadTimetableData();
            setBulkLessonEntryOpen(false);
          }}
        />
        {/* Academic Year Drawer - Hidden trigger controlled by ref */}
        <CreateAcademicYearModal
          onSuccess={() => {
            refetchAcademicYears();
            toast({
              title: 'Success',
              description: 'Academic year created successfully',
            });
          }}
          trigger={
            <button
              ref={academicYearTriggerRef}
              style={{ 
                position: 'absolute',
                width: 0,
                height: 0,
                opacity: 0,
                pointerEvents: 'none',
                overflow: 'hidden'
              }}
              tabIndex={-1}
              aria-label="Hidden trigger for academic year drawer"
            />
          }
        />
        
        {/* Create Term Modal */}
        {academicYears.length > 0 && (
          <CreateTermModal
            isOpen={createTermModalOpen}
            onClose={() => setCreateTermModalOpen(false)}
            onSuccess={() => {
              toast({
                title: 'Success',
                description: 'Term created successfully',
              });
              setCreateTermModalOpen(false);
              // Reload the page to refresh all data
              window.location.reload();
            }}
            academicYear={{
              id: academicYears[0].id,
              name: academicYears[0].name,
              startDate: academicYears[0].startDate,
              endDate: academicYears[0].endDate,
            }}
          />
        )}
        
        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r-2 border-primary/20 transform md:relative md:translate-x-0 transition-all duration-300 ease-in-out
        ${isSidebarMinimized ? 'w-16' : 'w-72'}
        flex flex-col
      `}>
        {/* Sidebar Toggle */}
        <div className={`p-4 border-b-2 border-primary/20 ${isSidebarMinimized ? 'flex justify-center' : 'flex justify-end'}`}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
            className="border-primary/20 bg-white dark:bg-slate-800 text-primary hover:bg-primary/5 transition-all duration-200"
            title={isSidebarMinimized ? "Expand sidebar" : "Minimize sidebar"}
          >
            {isSidebarMinimized ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Search Filter */}
        {!isSidebarMinimized && (
          <div className="flex-1 overflow-y-auto">
            <SchoolSearchFilter
              className="p-4"
              type="grades"
              onGradeSelect={handleGradeSelect}
              isLoading={isLoadingConfig}
              selectedGradeId={selectedGradeId || undefined}
            />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-3">
          {/* Header */}
          <div className="mb-4">
            {/* Title and Actions Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Smart Timetable</h1>
                {currentGrade?.name && (
                  <>
                    <span className="text-slate-400">•</span>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {currentGrade.name}
                    </p>
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
                <div className="flex flex-wrap items-center gap-1.5 lg:grid lg:grid-cols-5 lg:gap-x-1.5 lg:gap-y-2 lg:justify-items-stretch lg:ml-auto lg:relative">
                {isSidebarMinimized && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSidebarMinimized(false)}
                    className="border-primary/20 bg-white dark:bg-slate-800 text-primary hover:bg-primary/5 rounded-none h-8 flex items-center justify-center gap-1.5 lg:w-full"
                  >
                    <PanelLeftOpen className="h-3.5 w-3.5" />
                    <span className="text-xs hidden sm:inline">Grades</span>
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPeriodsDrawerOpen(true)}
                  disabled={loadingTimeSlots}
                    className="rounded-none h-8 flex items-center justify-center gap-1.5 lg:w-full"
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-xs">View Periods</span>
                  {!loadingTimeSlots && timeSlots.length > 0 && (
                    <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 font-medium rounded">
                      {timeSlots.length}
                    </span>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBreaksDrawerOpen(true)}
                    className="rounded-none h-8 flex items-center justify-center gap-1.5 lg:w-full"
                >
                  <Coffee className="h-3.5 w-3.5" />
                  <span className="text-xs">View Breaks</span>
                  {breaks.length > 0 && (
                    <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 font-medium rounded">
                      {breaks.length}
                    </span>
                  )}
                </Button>


                <Button
                  size="sm"
                  onClick={handleCreateLessons}
                    className="rounded-none h-8 flex items-center justify-center gap-1.5 lg:w-full"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span className="text-xs">Create Lessons</span>
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenTemplates}
                  disabled={templatesLoading}
                    className="rounded-none h-8 flex items-center justify-center gap-1.5 lg:w-full"
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-xs">{templatesLoading ? 'Loading…' : 'Manage Schedule'}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddPeriods}
                  disabled={templatesLoading}
                    className="rounded-none h-8 flex items-center justify-center gap-1.5 lg:w-full"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="text-xs">Add Periods</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkBreaksOpen(true)}
                  disabled={timeSlots.length === 0}
                    className="rounded-none h-8 flex items-center justify-center gap-1.5 lg:w-full"
                >
                  <Coffee className="h-3.5 w-3.5" />
                  <span className="text-xs">Create Breaks</span>
                </Button>


                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDeleteAllDialog(true)}
                    className="rounded-none h-8 flex items-center justify-center gap-1.5 border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800/50 lg:w-full"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="text-xs uppercase">DELETE PERIODS</span>
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDeleteAllBreaksDialog(true)}
                  disabled={isDeletingAllBreaks || breaks.length === 0 || !(selectedTerm?.id || selectedTermId)}
                    className="rounded-none h-8 flex items-center justify-center gap-1.5 border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800/50 lg:w-full"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="text-xs uppercase">DELETE BREAKS</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDeleteAllEntriesDialog(true)}
                    className="rounded-none h-8 flex items-center justify-center gap-1.5 border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800/50 lg:w-full"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="text-xs uppercase">DELETE LESSONS</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDeleteTimetableDialog(true)}
                    className="rounded-none h-8 flex items-center justify-center gap-1.5 border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800/50 lg:w-full"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="text-xs uppercase">DELETE TIMETABLE</span>
                </Button>
                </div>
              </div>
            </div>

            {/* Grade Selector and Stats Row */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span>View Schedule For:</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedGradeId || ''}
                    onChange={(e) => handleGradeChange(e.target.value)}
                    className="appearance-none px-3 py-1.5 pr-8 text-xs border border-primary/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium rounded-none hover:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="" className="font-medium">Select a grade...</option>
                    {grades.map((grade) => (
                      <option key={grade.id} value={grade.id} className="font-medium">
                        {grade.displayName || grade.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-3.5 w-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-none">
                  <span className="text-sm font-bold text-primary">{stats.totalLessons}</span>
                  <span className="text-xs text-primary/80">Scheduled</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-none">
                  <span className="text-sm font-bold text-primary">{stats.completionPercentage}%</span>
                  <span className="text-xs text-primary/80">Complete</span>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-none ${conflictCount > 0
                  ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}>
                  <span className={`text-sm font-bold ${conflictCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                    {conflictCount}
                  </span>
                  <span className={`text-xs ${conflictCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                    Issues
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-none">
                  <span className="text-sm font-bold text-primary">{Object.keys(stats.subjectDistribution).length}</span>
                  <span className="text-xs text-primary/80">Subjects</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conflict Warnings - Compact */}
          {showConflicts && conflictCount > 0 && (
            <div className="bg-red-50 border-2 border-red-200 p-2 mb-2">
              <h3 className="text-xs font-semibold text-red-900 mb-1">
                ⚠️ {conflictCount} Scheduling Issue{conflictCount !== 1 ? 's' : ''} Found
              </h3>
              <div className="space-y-0.5">
                {teacherConflicts.slice(0, 2).map((conflict, index) => (
                  <div key={index} className="text-[10px] text-red-800">
                    <strong>{conflict.teacher?.name}</strong> has {conflict.entries.length} overlapping class{conflict.entries.length !== 1 ? 'es' : ''}
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* Timetable Grid */}
          <div className="bg-white dark:bg-slate-800 rounded-none shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b-2 border-slate-200 dark:border-slate-600">
                    <th className="border-r border-slate-200 dark:border-slate-600 p-1.5 text-left font-bold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wide">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-primary" />
                        <span>Time</span>
                      </div>
                    </th>
                    {days.map((day, index) => (
                      <th key={index} className="border-r border-slate-200 dark:border-slate-600 last:border-r-0 p-1.5 text-left font-bold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wide">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingTimeSlots ? (
                    <tr>
                      <td colSpan={6} className="border-b border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500 dark:text-slate-400">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm">Loading time slots...</span>
                        </div>
                      </td>
                    </tr>
                  ) : timeSlots.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="border-b border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500 dark:text-slate-400">
                        <div className="flex flex-col items-center gap-3">
                          <Clock className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                          <p className="text-sm font-medium">No time slots available</p>
                          <p className="text-xs text-slate-400">Click "Create Time Slots" to get started</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <>
                      {/* Breaks at START of day (before any period) would need afterPeriod === -1 */}
                      {/* REMOVED: afterPeriod === 0 means AFTER Period 0, not BEFORE */}
                      {(() => {
                        // Note: Breaks with afterPeriod = 0 are displayed AFTER Period 0 in the period loop
                        const breaksBeforeAnyPeriod = breaks.filter((b) => b.afterPeriod === -1);
                        if (breaksBeforeAnyPeriod.length === 0) return null;

                        return (
                          <tr className="bg-gradient-to-r from-orange-50/80 to-amber-50/80 dark:from-orange-950/20 dark:to-amber-950/20 border-y-2 border-orange-200 dark:border-orange-800 hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-950/30 dark:hover:to-amber-950/30 transition-colors">
                              <td className="border-r border-b border-orange-200 dark:border-orange-800 p-0">
                                <div className="relative bg-gradient-to-br from-orange-100/50 via-orange-50/30 to-transparent dark:from-orange-900/30 dark:via-orange-950/20 border-r-2 border-orange-300 dark:border-orange-700 p-1.5 min-w-[90px]">
                                  <div className="flex items-center gap-1">
                                    <div className="flex items-center justify-center w-4 h-4 rounded-none bg-orange-200 dark:bg-orange-900 text-xs flex-shrink-0">
                                      {breaksBeforeAnyPeriod[0].icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-bold text-[9px] text-orange-900 dark:text-orange-200 uppercase leading-tight truncate">
                                        {breaksBeforeAnyPeriod[0].name}
                                      </div>
                                      <div className="flex items-center gap-1 flex-wrap">
                                        {breaksBeforeAnyPeriod[0].startTime && breaksBeforeAnyPeriod[0].endTime ? (
                                          <span className="text-[8px] font-semibold text-orange-700 dark:text-orange-300">
                                            {breaksBeforeAnyPeriod[0].startTime}-{breaksBeforeAnyPeriod[0].endTime}
                                          </span>
                                        ) : (
                                          <span className="text-[8px] font-semibold text-orange-700 dark:text-orange-300">
                                            Start
                                          </span>
                                        )}
                                        <span className="text-[8px] font-semibold text-orange-700 dark:text-orange-300">
                                          {breaksBeforeAnyPeriod[0].durationMinutes}m
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              {days.map((day, dayIndex) => {
                                const dayBreak = breaksBeforeAnyPeriod.find(
                                  (b) => b.applyToAllDays || b.dayOfWeek === dayIndex + 1
                                );
                                return (
                                  <td key={dayIndex} className="border-r border-b border-orange-200 dark:border-orange-800 last:border-r-0 p-1.5 text-center align-middle">
                                    {dayBreak ? (
                                      <div
                                        className="flex items-center justify-center gap-0.5 cursor-pointer bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800 rounded-none p-1 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:shadow-md hover:scale-[1.01] transition-all duration-200 group/break"
                                        onClick={() => setEditingBreak(dayBreak)}
                                        title="Click to edit break"
                                      >
                                        <div className="flex flex-col items-center gap-0">
                                          <span className="text-sm">{dayBreak.icon}</span>
                                          <span className="text-[9px] font-bold text-orange-900 dark:text-orange-200 uppercase leading-tight">
                                            {dayBreak.name}
                                          </span>
                                          {dayBreak.startTime && dayBreak.endTime ? (
                                            <span className="text-[8px] font-semibold text-orange-700 dark:text-orange-300">
                                              {dayBreak.startTime} - {dayBreak.endTime}
                                            </span>
                                          ) : (
                                            <span className="text-[8px] font-semibold text-orange-700 dark:text-orange-300">
                                              {dayBreak.durationMinutes}m
                                            </span>
                                          )}
                                        </div>
                                        <Edit2 className="h-2.5 w-2.5 text-orange-600 dark:text-orange-400 opacity-0 group-hover/break:opacity-100 transition-opacity" />
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setEditingBreak({
                                            isNew: true,
                                            afterPeriod: 0,
                                            dayOfWeek: dayIndex + 1,
                                          });
                                        }}
                                        className="w-full h-full min-h-[40px] flex items-center justify-center gap-1 text-[10px] text-orange-500 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 border border-dashed border-orange-200 dark:border-orange-800 rounded-none hover:border-orange-400 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all"
                                        title="Add break for this day"
                                      >
                                        <Plus className="h-3 w-3" />
                                        <span className="font-medium">Add</span>
                                      </button>
                                    )}
                                  </td>
                                );
                              })}
                          </tr>
                        );
                      })()}

                      {/* Period rows */}
                      {periodNumbers.map((period, periodIndex) => {
                      // Use Monday (day 0) as the weekly template for time display
                      const baseSlot = getSlotFor(0, period);
                      if (!baseSlot) return null;

                      // Get breaks that come after this period
                      // Include both day-specific and "apply to all days" breaks
                      const breaksAfterThisPeriod = breaks.filter(
                        (b) => b.afterPeriod === period
                      );

                      // Alternate row colors for better readability
                      const isEven = periodIndex % 2 === 0;

                      return (
                        <React.Fragment key={`period-${period}`}>
                          {/* Regular lesson row */}
                          <tr className={`group transition-colors ${isEven
                            ? 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750'
                            : 'bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-750'
                            }`}>
                            <td className="border-r border-b border-slate-200 dark:border-slate-700 p-0">
                              <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 border-r-2 border-primary/20 dark:border-primary/30 p-1.5 min-w-[90px] group/time">
                                {/* Time Display - Compact Single Line */}
                                <div className="flex items-center gap-1 pr-6">
                                  <div className="flex items-center justify-center w-4 h-4 rounded-none bg-primary/20 dark:bg-primary/30 flex-shrink-0">
                                    <Clock className="h-2.5 w-2.5 text-primary dark:text-primary-foreground" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-[11px] text-slate-900 dark:text-slate-100 tracking-tight leading-tight truncate">
                                      {baseSlot.time}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[9px] font-semibold text-primary dark:text-primary-foreground">
                                        P{period}
                                      </span>
                                      {baseSlot.startTime && baseSlot.endTime && (
                                        <span className="text-[8px] text-slate-500 dark:text-slate-400 truncate">
                                          {baseSlot.startTime}-{baseSlot.endTime}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Action Buttons - Absolutely Positioned Top Right */}
                                <div className="absolute top-0.5 right-0.5 flex items-center gap-0.5 opacity-0 group-hover/time:opacity-100 transition-opacity z-10">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingTimeslot(baseSlot);
                                    }}
                                    className="flex items-center justify-center w-4 h-4 rounded-none bg-white/90 dark:bg-slate-700/90 backdrop-blur-sm border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                                    title="Edit timeslot"
                                  >
                                    <Edit2 className="h-2 w-2" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setTimeslotToDelete(baseSlot);
                                    }}
                                    className="flex items-center justify-center w-4 h-4 rounded-none bg-white/90 dark:bg-slate-700/90 backdrop-blur-sm border border-slate-200 dark:border-slate-600 text-red-500 dark:text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
                                    title="Delete timeslot"
                                  >
                                    <Trash2 className="h-2 w-2" />
                                  </button>
                                </div>
                              </div>
                            </td>
                            {days.map((_, dayIndex) => {
                              const dayOfWeek = dayIndex + 1;
                              // Get the day-specific slot for this period
                              const daySlot = getSlotFor(dayIndex, period);
                              const entry = daySlot ? grid[dayOfWeek]?.[daySlot.id] : null;

                              return (
                                <td key={dayIndex} className="border-r border-b border-slate-200 dark:border-slate-700 last:border-r-0 p-1.5 align-top">
                                  {entry ? (
                                    <div
                                      className="group/lesson relative cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-none p-1.5 hover:shadow-md hover:scale-[1.01] transition-all duration-200"
                                      onClick={() => setEditingLesson(entry)}
                                      title="Click to edit"
                                    >
                                      <div className="space-y-0.5">
                                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100 leading-tight">
                                          {entry.subject.name}
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-600 dark:text-slate-300">
                                          <span className="font-medium">{entry.teacher.name}</span>
                                        </div>
                                        {entry.roomNumber && (
                                          <div className="flex items-center gap-0.5 text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 pt-0.5 border-t border-slate-200 dark:border-slate-600">
                                            <span>📍</span>
                                            <span>{entry.roomNumber}</span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="absolute top-1 right-1 opacity-0 group-hover/lesson:opacity-100 transition-opacity flex items-center gap-0.5">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingLesson(entry);
                                          }}
                                          className="p-0.5 hover:bg-primary/10 rounded-none transition-colors"
                                          title="Edit lesson"
                                        >
                                          <Edit2 className="h-2.5 w-2.5 text-primary" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const deleteEntry = async () => {
                                              try {
                                                const mutation = `
                                                  mutation DeleteEntry {
                                                    deleteTimetableEntry(id: "${entry.id}")
                                                  }
                                                `;
                                                const response = await fetch('/api/graphql', {
                                                  method: 'POST',
                                                  headers: {
                                                    'Content-Type': 'application/json',
                                                  },
                                                  credentials: 'include',
                                                  body: JSON.stringify({
                                                    query: mutation,
                                                  }),
                                                });
                                                const result = await response.json();
                                                if (result.errors) {
                                                  throw new Error(result.errors[0]?.message || 'Failed to delete entry');
                                                }
                                                if (result.data?.deleteTimetableEntry === true) {
                                                  // Reload entries to update UI
                                                  const termId = selectedTerm?.id || selectedTermId;
                                                  if (selectedGradeId && termId) {
                                                    await loadEntries(termId, selectedGradeId);
                                                  }
                                                  toast({
                                                    title: 'Success',
                                                    description: 'Lesson deleted successfully',
                                                  });
                                                } else {
                                                  throw new Error('Delete failed');
                                                }
                                              } catch (error) {
                                                console.error('Error deleting entry:', error);
                                                toast({
                                                  title: 'Error',
                                                  description: error instanceof Error ? error.message : 'Failed to delete lesson',
                                                  variant: 'destructive',
                                                });
                                              }
                                            };

                                            const confirmationToast = toast({
                                              title: 'Delete Lesson',
                                              description: 'Are you sure you want to delete this lesson? This action cannot be undone.',
                                              variant: 'destructive',
                                              action: (
                                                <div className="flex gap-2 mt-2">
                                                  <ToastAction
                                                    altText="Cancel"
                                                    onClick={() => {
                                                      confirmationToast.dismiss();
                                                    }}
                                                    className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border-primary/20 hover:border-primary/40"
                                                  >
                                                    Cancel
                                                  </ToastAction>
                                                  <ToastAction
                                                    altText="Delete"
                                                    onClick={() => {
                                                      confirmationToast.dismiss();
                                                      deleteEntry();
                                                    }}
                                                    className="bg-primary hover:bg-primary/90 text-white border-primary"
                                                  >
                                                    Delete
                                                  </ToastAction>
                                                </div>
                                              ),
                                            });
                                          }}
                                          className="p-0.5 hover:bg-red-500/10 rounded-none transition-colors"
                                          title="Delete lesson"
                                        >
                                          <Trash2 className="h-2.5 w-2.5 text-red-600 dark:text-red-400" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        handleAddLesson(dayOfWeek, baseSlot.id, daySlot?.id);
                                      }}
                                      className="w-full h-full min-h-[50px] flex items-center justify-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary-foreground border border-dashed border-slate-200 dark:border-slate-700 rounded-none hover:border-primary dark:hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group/empty"
                                      title="Click to schedule a lesson"
                                    >
                                      <Plus className="h-3 w-3 opacity-50 group-hover/empty:opacity-100 transition-opacity" />
                                      <span className="font-medium">Add</span>
                                    </button>
                                  )}
                                </td>
                              );
                            })}
                          </tr>

                          {/* Break rows (if any after this period) */}
                          {breaksAfterThisPeriod.length > 0 && (
                            <tr className="bg-gradient-to-r from-orange-50/80 to-amber-50/80 dark:from-orange-950/20 dark:to-amber-950/20 border-y-2 border-orange-200 dark:border-orange-800 hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-950/30 dark:hover:to-amber-950/30 transition-colors">
                              <td className="border-r border-b border-orange-200 dark:border-orange-800 p-0">
                                <div className="relative bg-gradient-to-br from-orange-100/50 via-orange-50/30 to-transparent dark:from-orange-900/30 dark:via-orange-950/20 border-r-2 border-orange-300 dark:border-orange-700 p-1.5 min-w-[90px]">
                                  <div className="flex items-center gap-1">
                                    <div className="flex items-center justify-center w-4 h-4 rounded-none bg-orange-200 dark:bg-orange-900 text-xs flex-shrink-0">
                                      {breaksAfterThisPeriod[0].icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-bold text-[9px] text-orange-900 dark:text-orange-200 uppercase leading-tight truncate">
                                        {breaksAfterThisPeriod[0].name}
                                      </div>
                                      <div className="flex items-center gap-1 flex-wrap">
                                        {breaksAfterThisPeriod[0].startTime && breaksAfterThisPeriod[0].endTime ? (
                                          <span className="text-[8px] font-semibold text-orange-700 dark:text-orange-300">
                                            {breaksAfterThisPeriod[0].startTime}-{breaksAfterThisPeriod[0].endTime}
                                          </span>
                                        ) : (
                                          <span className="text-[8px] font-semibold text-orange-700 dark:text-orange-300">
                                            {breaksAfterThisPeriod[0].durationMinutes}m
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              {days.map((day, dayIndex) => {
                                const dayBreak = breaksAfterThisPeriod.find(
                                  (b) => b.applyToAllDays || b.dayOfWeek === dayIndex + 1
                                );
                                return (
                                  <td key={dayIndex} className="border-r border-b border-orange-200 dark:border-orange-800 last:border-r-0 p-1.5 text-center align-middle">
                                    {dayBreak ? (
                                      <div
                                        className="flex items-center justify-center gap-0.5 cursor-pointer bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800 rounded-none p-1 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:shadow-md hover:scale-[1.01] transition-all duration-200 group/break"
                                        onClick={() => setEditingBreak(dayBreak)}
                                        title="Click to edit break"
                                      >
                                        <div className="flex flex-col items-center gap-0">
                                          <span className="text-sm">{dayBreak.icon}</span>
                                          <span className="text-[9px] font-bold text-orange-900 dark:text-orange-200 uppercase leading-tight">
                                            {dayBreak.name}
                                          </span>
                                          {dayBreak.startTime && dayBreak.endTime ? (
                                            <span className="text-[8px] font-semibold text-orange-700 dark:text-orange-300">
                                              {dayBreak.startTime} - {dayBreak.endTime}
                                            </span>
                                          ) : (
                                            <span className="text-[8px] font-semibold text-orange-700 dark:text-orange-300">
                                              {dayBreak.durationMinutes}m
                                            </span>
                                          )}
                                        </div>
                                        <Edit2 className="h-2.5 w-2.5 text-orange-600 dark:text-orange-400 opacity-0 group-hover/break:opacity-100 transition-opacity" />
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          setEditingBreak({
                                            isNew: true,
                                            afterPeriod: period,
                                            dayOfWeek: dayIndex + 1,
                                          });
                                        }}
                                        className="w-full h-full min-h-[40px] flex items-center justify-center gap-1 text-[10px] text-orange-500 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 border border-dashed border-orange-200 dark:border-orange-800 rounded-none hover:border-orange-400 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all"
                                        title="Add break for this day"
                                      >
                                        <Plus className="h-3 w-3" />
                                        <span className="font-medium">Add</span>
                                      </button>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subject Distribution */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Subject Distribution</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(stats.subjectDistribution).map(([subject, count]) => (
                <div key={subject} className="flex justify-between items-center">
                  <span className="text-sm">{subject}</span>
                  <span className="font-semibold text-primary">{count} lessons</span>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Workload */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Teacher Workload (This Grade)</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(stats.teacherWorkload).map(([teacher, count]) => (
                <div key={teacher} className="flex justify-between items-center">
                  <span className="text-sm">{teacher}</span>
                  <span className="font-semibold text-purple-600">{count} lessons</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={toggleConflicts}
              className={`px-4 py-2 rounded-lg ${showConflicts
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700'
                }`}
            >
              {showConflicts ? 'Hide' : 'Show'} Conflicts
            </button>
          </div>

          {/* Edit Dialogs */}
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

      {/* Templates Drawer (Day or Week) */}
      <Sheet open={templatesDrawerOpen} onOpenChange={setTemplatesDrawerOpen}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-primary">
              <Calendar className="h-5 w-5" />
              Templates
            </SheetTitle>
            <SheetDescription>
              View and manage your day and week templates.
            </SheetDescription>
          </SheetHeader>

          {/* Toggle between Day and Week Templates */}
          <div className="mt-4 mb-4">
            <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50">
              <button
                onClick={() => setTemplateViewType('day')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  templateViewType === 'day'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Day Templates
              </button>
              <button
                onClick={() => setTemplateViewType('week')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  templateViewType === 'week'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Week Templates
              </button>
            </div>
          </div>

          {/* Content based on view type */}
          {templateViewType === 'day' ? (
            <div className="space-y-3">
              {templatesLoading ? (
                <div className="text-sm text-slate-500">Loading templates…</div>
              ) : dayTemplates.length === 0 ? (
                <div className="text-sm text-slate-500">No templates found.</div>
              ) : (
                dayTemplates.map((t) => {
                  const dayName = days[t.dayOfWeek - 1] || `Day ${t.dayOfWeek}`;
                  const breakSummary =
                    t.breaks && t.breaks.length
                      ? t.breaks
                          .map(
                            (b: any) =>
                              `${b.type ?? 'break'} · ${b.durationMinutes}m${
                                b.afterPeriod ? ` after P${b.afterPeriod}` : ''
                              }${b.applyToAllDays ? ' · all days' : ''}`
                          )
                          .join(' | ')
                      : 'No breaks';

                  return (
                    <div
                      key={t.id}
                      className="border border-primary/30 bg-primary/5 rounded-lg p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-primary">
                          {dayName}
                        </div>
                        <div className="text-[11px] text-primary/70">Template</div>
                      </div>
                      <div className="text-xs text-slate-600 mt-1 break-words">
                        {breakSummary}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <WeekTemplateManager />
          )}
        </SheetContent>
      </Sheet>

      {/* Add Periods Drawer */}
      <Sheet open={addPeriodsDrawerOpen} onOpenChange={setAddPeriodsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-primary">
              <Clock className="h-5 w-5" />
              Add Periods to Template
            </SheetTitle>
            <SheetDescription>
              Select a day template and how many extra periods to append.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            {templatesLoading ? (
              <div className="text-sm text-slate-500">Loading templates…</div>
            ) : dayTemplates.length === 0 ? (
              <div className="text-sm text-slate-500">
                No templates found. Create a day template first.
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-600">Choose template</div>
                  <div className="space-y-2">
                    {dayTemplates.map((t: any) => {
                      const dayName = days[t.dayOfWeek - 1] || `Day ${t.dayOfWeek}`;
                      const isSelected = addPeriodsTemplateId === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setAddPeriodsTemplateId(t.id)}
                          className={`w-full text-left border rounded-md px-3 py-2 transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-slate-200 hover:border-primary/50'
                          }`}
                        >
                          <div className="text-sm font-semibold">{dayName}</div>
                          <div className="text-xs text-slate-500 truncate">{t.id}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600">Extra periods</label>
                  <input
                    type="number"
                    min={1}
                    value={addPeriodsCount}
                    onChange={(e) => setAddPeriodsCount(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. 2"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setAddPeriodsDrawerOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmAddPeriods}
                    disabled={addingPeriods || !addPeriodsTemplateId}
                  >
                    {addingPeriods ? 'Adding…' : 'Add Periods'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

          {/* Bulk Schedule Drawer */}
          <BulkScheduleDrawer
            open={bulkScheduleOpen}
            onClose={() => setBulkScheduleOpen(false)}
          />

          {/* Bulk Breaks Drawer */}
          <BulkBreaksDrawer
            open={bulkBreaksOpen}
            onClose={async () => {
              await reloadTimetableData();
              setBulkBreaksOpen(false);
            }}
          />

          {/* Bulk Lesson Entry Drawer */}
          <BulkLessonEntryDrawer
            open={bulkLessonEntryOpen}
            onClose={() => setBulkLessonEntryOpen(false)}
            gradeId={selectedGradeId || undefined}
          />

          {/* All Periods Drawer */}
          <Sheet open={periodsDrawerOpen} onOpenChange={setPeriodsDrawerOpen}>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>All Class Periods</span>
                </SheetTitle>
                <SheetDescription>
                  View and manage all {timeSlots.length} class period{timeSlots.length !== 1 ? 's' : ''}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {timeSlots.map((slot) => (
                  <div key={slot.id} className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-primary">Period {slot.periodNumber}</span>
                            <span className="text-slate-700 dark:text-slate-300 text-sm">{slot.time}</span>
                          </div>
                          {slot.startTime && slot.endTime && (
                            <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                              {slot.startTime} - {slot.endTime}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setPeriodsDrawerOpen(false);
                            setEditingTimeslot(slot);
                          }}
                          className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                          title="Edit timeslot"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setPeriodsDrawerOpen(false);
                            setTimeslotToDelete(slot);
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                          title="Delete timeslot"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* All Breaks Drawer */}
          <Sheet open={breaksDrawerOpen} onOpenChange={setBreaksDrawerOpen}>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="text-lg">☕</span>
                  <span></span>
                </SheetTitle>
                <SheetDescription>
                  View and manage all {breaks.length} break{breaks.length !== 1 ? 's' : ''}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {breaks.map((breakItem) => {
                  return (
                  <div 
                    key={breakItem.id} 
                    className="rounded-lg p-3 border bg-white dark:bg-slate-800 border-primary/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-lg">
                          <span>{breakItem.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-primary uppercase">{breakItem.name}</span>
                            {breakItem.startTime && breakItem.endTime ? (
                              <span className="text-slate-600 dark:text-slate-300 text-sm">
                                {breakItem.startTime} - {breakItem.endTime}
                              </span>
                            ) : (
                              <span className="text-slate-600 dark:text-slate-300 text-sm">
                                {breakItem.durationMinutes} min
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                            After Period {breakItem.afterPeriod} • {days[breakItem.dayOfWeek - 1] || 'Unknown day'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setBreaksDrawerOpen(false);
                            setEditingBreak(breakItem);
                          }}
                          className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                          title="Edit break"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBreak(breakItem)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                          title="Delete break"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            </SheetContent>
          </Sheet>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={!!timeslotToDelete} onOpenChange={(open) => !open && setTimeslotToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Timeslot</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete <span className="font-semibold">Period {timeslotToDelete?.periodNumber}</span> ({timeslotToDelete?.time})?
                  <p className="mt-2 text-red-500">This action cannot be undone. All lessons scheduled in this timeslot will also be removed.</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteTimeslot}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete Timeslot'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Delete All Time Slots Confirmation Dialog */}
          <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete All Periods</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete <span className="font-semibold">all {timeSlots.length} period{timeSlots.length !== 1 ? 's' : ''}</span> (time slots)?
                  <p className="mt-2 text-sm text-muted-foreground">
                    This will remove all period time slots from the timetable structure.
                  </p>
                  <p className="mt-2 text-red-500 font-semibold">⚠️ All lessons scheduled in these periods will also be removed.</p>
                  <p className="mt-2 text-red-500 font-semibold">This action cannot be undone.</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeletingAll}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAllTimeslots}
                  disabled={isDeletingAll}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  {isDeletingAll ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete All Periods'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Delete All Breaks Confirmation Dialog */}
          <AlertDialog open={showDeleteAllBreaksDialog} onOpenChange={setShowDeleteAllBreaksDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete All Breaks</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete <span className="font-semibold">all {breaks.length} break{breaks.length !== 1 ? 's' : ''}</span> for this term?
                  <p className="mt-2 text-sm text-muted-foreground">
                    This will delete all breaks (both those that apply to all days and day-specific breaks) and automatically recalculate the affected day templates.
                  </p>
                  <p className="mt-2 text-red-500 font-semibold">This action cannot be undone.</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeletingAllBreaks}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAllBreaks}
                  disabled={isDeletingAllBreaks}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  {isDeletingAllBreaks ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting All...
                    </>
                  ) : (
                    'Delete All Breaks'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Delete Break by Type Confirmation Dialog */}
          <AlertDialog open={!!breakToDelete} onOpenChange={(open) => !open && setBreakToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Breaks by Type</AlertDialogTitle>
                <AlertDialogDescription>
                  {breakToDelete && (() => {
                    const typeMapping: Record<string, string> = {
                      'short_break': 'SHORT_BREAK',
                      'long_break': 'LONG_BREAK',
                      'lunch': 'LUNCH',
                      'afternoon_break': 'TEA_BREAK',
                      'games': 'GAMES_BREAK',
                      'assembly': 'ASSEMBLY',
                      'recess': 'RECESS',
                      'snack': 'SNACK_BREAK',
                    };
                    const breakType = typeMapping[breakToDelete.type] || breakToDelete.type.toUpperCase();
                    return (
                      <>
                        {breakToDelete.applyToAllDays ? (
                          <p>
                            Are you sure you want to delete <span className="font-semibold">all "{breakToDelete.name}" breaks ({breakType})</span> from all days?
                          </p>
                        ) : (
                          <p>
                            Are you sure you want to delete <span className="font-semibold">all "{breakToDelete.name}" breaks ({breakType})</span> for this term?
                          </p>
                        )}
                        <p className="mt-2 text-sm text-muted-foreground">
                          This will delete all breaks of this type for the term and automatically recalculate the affected day templates.
                        </p>
                        <p className="mt-2 text-red-500 font-semibold">This action cannot be undone.</p>
                      </>
                    );
                  })()}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeletingBreak}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDeleteBreak}
                  disabled={isDeletingBreak}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  {isDeletingBreak ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete Breaks'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Delete All Entries Confirmation Dialog */}
          <AlertDialog open={showDeleteAllEntriesDialog} onOpenChange={setShowDeleteAllEntriesDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete All Lessons</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete <span className="font-semibold">all lesson entries</span> for the current term?
                  <p className="mt-2 text-sm text-muted-foreground">
                    This will remove all scheduled lessons but keep your time slots, breaks, and timetable structure intact.
                  </p>
                  <p className="mt-2 text-red-500 font-semibold">This action cannot be undone.</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeletingTermEntries}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteEntriesForTerm}
                  disabled={isDeletingTermEntries}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  {isDeletingTermEntries ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete All Lessons'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Delete Entire Timetable Confirmation Dialog */}
          <AlertDialog open={showDeleteTimetableDialog} onOpenChange={setShowDeleteTimetableDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Entire Timetable</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the <span className="font-semibold">entire timetable</span> for the current term?
                  <p className="mt-2 text-sm text-muted-foreground">
                    This will permanently delete:
                  </p>
                  <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>All lesson entries</li>
                    <li>All time slots and periods</li>
                    <li>All breaks</li>
                    <li>The complete timetable structure</li>
                  </ul>
                  <p className="mt-3 text-red-500 font-semibold">⚠️ This action cannot be undone!</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeletingTimetable}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteTimetableForTerm}
                  disabled={isDeletingTimetable}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  {isDeletingTimetable ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete Entire Timetable'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      {/* Toast Notifications - Outside containers for proper z-index */}
      <Toaster />
    </div>
  );
}


