
'use client';

import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';
import { 
  useSelectedGradeTimetable, 
  useTimetableGrid,
  useGradeStatistics
} from './hooks/useTimetableData';
import { useAllConflicts } from './hooks/useTimetableConflictsNew';
import { LessonEditDialog } from './components/LessonEditDialog';
import { TimeslotEditDialog } from './components/TimeslotEditDialog';
import { BreakEditDialog } from './components/BreakEditDialog';
import { BulkScheduleDrawer } from './components/BulkScheduleDrawer';
import { BulkLessonEntryDrawer } from './components/BulkLessonEntryDrawer';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
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
import { Button } from '@/components/ui/button';
import { PanelLeftClose, PanelLeftOpen, Clock, Edit2, Trash2, Plus } from 'lucide-react';
import { SchoolSearchFilter } from '@/components/dashboard/SchoolSearchFilter';
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export default function SmartTimetableNew() {
  // Get selected term from context
  const { selectedTerm } = useSelectedTerm();
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
    loadGrades,
    loadSubjects,
    loadTeachers,
    loadEntries,
    deleteTimeSlot,
    deleteAllTimeSlots,
    createBreaks,
    deleteAllBreaks,
  } = useTimetableStore();

  // Toast for notifications
  const { toast } = useToast();

  // Load time slots, grades, subjects, and teachers from backend on mount
  useEffect(() => {
    setLoadingTimeSlots(true);
    // Use term from context if available, otherwise use selectedTermId from store
    const termId = selectedTerm?.id || selectedTermId;
    
    Promise.all([
      loadTimeSlots(termId || undefined), // Pass termId if available
      loadGrades(),
      loadSubjects(), // Load all subjects initially
      loadTeachers(), // Load all teachers
    ])
      .then(() => {
        console.log('Time slots, grades, subjects, and teachers loaded successfully');
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
  }, [loadTimeSlots, loadGrades, loadSubjects, loadTeachers, selectedTerm?.id, selectedTermId]);

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

  // Get enriched entries for selected grade (memoized!)
  const entries = useSelectedGradeTimetable();
  
  // Get grid organized by day/period (memoized!)
  const grid = useTimetableGrid(selectedGradeId);
  
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

  // State for editing
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [editingTimeslot, setEditingTimeslot] = useState<any | null>(null);
  const [editingBreak, setEditingBreak] = useState<any | null>(null);
  const [bulkScheduleOpen, setBulkScheduleOpen] = useState(false);
  const [bulkLessonEntryOpen, setBulkLessonEntryOpen] = useState(false);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(true);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  
  // Fetch school config for the search filter
  const { isLoading: isLoadingConfig } = useSchoolConfig();
  
  // State for delete confirmation
  const [timeslotToDelete, setTimeslotToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showDeleteAllBreaksDialog, setShowDeleteAllBreaksDialog] = useState(false);
  const [isDeletingAllBreaks, setIsDeletingAllBreaks] = useState(false);
  
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

  // Handle delete all breaks
  const handleDeleteAllBreaks = useCallback(async () => {
    setIsDeletingAllBreaks(true);
    try {
      await deleteAllBreaks();
      toast({
        title: 'All breaks deleted',
        description: `All ${breaks.length} break${breaks.length !== 1 ? 's' : ''} have been successfully deleted.`,
      });
      setShowDeleteAllBreaksDialog(false);
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
  }, [deleteAllBreaks, toast, breaks.length]);

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
              <div className="flex items-center gap-2">
                {isSidebarMinimized && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSidebarMinimized(false)}
                    className="border-primary/20 bg-white dark:bg-slate-800 text-primary hover:bg-primary/5"
                  >
                    <PanelLeftOpen className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Grades</span>
                  </Button>
                )}
                <button
                  onClick={() => setBulkScheduleOpen(true)}
                  className="px-3 py-1.5 text-xs bg-primary text-white hover:bg-primary/90 rounded transition-colors flex items-center gap-1.5 font-medium"
                >
                  <span>⚙️</span>
                  <span>Create Time Slots</span>
                </button>
                <button
                  onClick={() => setBulkLessonEntryOpen(true)}
                  className="px-3 py-1.5 text-xs bg-primary/80 text-white hover:bg-primary/70 rounded transition-colors flex items-center gap-1.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedGradeId}
                >
                  <span>📚</span>
                  <span>Bulk Create Lessons</span>
                </button>
              </div>
            </div>

            {/* Grade Selector and Stats Row */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  View Schedule For:
                </label>
                <select
                  value={selectedGradeId || ''}
                  onChange={(e) => handleGradeChange(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-primary/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                >
                  <option value="">Select a grade...</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.displayName || grade.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Statistics */}
              <div className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded">
                  <span className="text-sm font-bold text-primary">{stats.totalLessons}</span>
                  <span className="text-xs text-primary/80">Scheduled</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded">
                  <span className="text-sm font-bold text-primary">{stats.completionPercentage}%</span>
                  <span className="text-xs text-primary/80">Complete</span>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 border rounded ${
                  conflictCount > 0 
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
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded">
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

      {/* Time Slots & Breaks - Compact Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
        {/* Time Slots Section */}
        <div className="bg-primary/5 dark:bg-primary/10 border-l-2 border-primary rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-primary text-sm">Class Periods</h3>
              {!loadingTimeSlots && timeSlots.length > 0 && (
                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">
                  {timeSlots.length} period{timeSlots.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {!loadingTimeSlots && timeSlots.length > 0 && (
              <button
                onClick={() => setShowDeleteAllDialog(true)}
                className="text-red-600 hover:text-red-800 transition-colors"
                title="Delete all periods"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          {loadingTimeSlots ? (
            <p className="text-xs text-primary/70">Loading periods...</p>
          ) : timeSlots.length === 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs text-primary font-medium">No class periods set up yet</p>
              <p className="text-[10px] text-primary/70">Start by creating your daily schedule periods</p>
              <button
                onClick={() => setBulkScheduleOpen(true)}
                className="w-full text-xs bg-primary text-white px-2 py-1.5 font-medium hover:bg-primary/90 rounded transition-colors"
              >
                ➕ Create Periods Now
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {timeSlots.slice(0, 1).map((slot) => (
                <div key={slot.id} className="bg-white dark:bg-slate-800 rounded p-2 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-primary text-xs">Period {slot.periodNumber}</span>
                        <span className="text-slate-700 dark:text-slate-300 text-xs">{slot.time}</span>
                      </div>
                      {slot.startTime && slot.endTime && (
                        <div className="text-slate-500 dark:text-slate-400 text-[9px] mt-0.5">
                          {slot.startTime} - {slot.endTime}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {timeSlots.length > 1 && (
                <button
                  onClick={() => setPeriodsDrawerOpen(true)}
                  className="text-xs text-primary hover:text-primary/80 font-medium w-full text-left py-1"
                >
                  ▼ View All {timeSlots.length} Periods
                </button>
              )}
            </div>
          )}
        </div>

        {/* Breaks Section */}
        <div className="bg-primary/5 dark:bg-primary/10 border-l-2 border-primary rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">☕</span>
              <h3 className="font-semibold text-primary text-sm">Break Times</h3>
              {breaks.length > 0 && (
                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">
                  {breaks.length} break{breaks.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {breaks.length > 0 && (
                <button
                  onClick={() => setShowDeleteAllBreaksDialog(true)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Delete all breaks"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => {
                  setEditingBreak({
                    isNew: true,
                    afterPeriod: 3,
                    dayOfWeek: 1,
                  });
                }}
                className="text-primary hover:text-primary/80 transition-colors"
                title="Add break time"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          {breaks.length === 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs text-primary font-medium">No break times scheduled</p>
              <p className="text-[10px] text-primary/70">Add lunch and short breaks between periods</p>
              <button
                onClick={() => {
                  setEditingBreak({
                    isNew: true,
                    afterPeriod: 3,
                    dayOfWeek: 1,
                  });
                }}
                className="w-full text-xs bg-primary text-white px-2 py-1.5 font-medium hover:bg-primary/90 rounded transition-colors"
              >
                ➕ Add Break Time
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {breaks.slice(0, 1).map((breakItem) => (
                <div key={breakItem.id} className="bg-white dark:bg-slate-800 rounded p-2 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{breakItem.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-primary text-xs">{breakItem.name}</span>
                        <span className="text-slate-600 dark:text-slate-300 text-[10px]">
                          {breakItem.durationMinutes} min
                        </span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[9px] mt-0.5">
                        After P{breakItem.afterPeriod} • {days[breakItem.dayOfWeek - 1] || 'Unknown day'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {breaks.length > 1 && (
                <button
                  onClick={() => setBreaksDrawerOpen(true)}
                  className="text-xs text-primary hover:text-primary/80 font-medium w-full text-left py-1"
                >
                  ▼ View All {breaks.length} Breaks
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b-2 border-slate-200 dark:border-slate-600">
                <th className="border-r border-slate-200 dark:border-slate-600 p-4 text-left font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Time</span>
                  </div>
                </th>
                {days.map((day, index) => (
                  <th key={index} className="border-r border-slate-200 dark:border-slate-600 last:border-r-0 p-4 text-left font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide">
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
                timeSlots.map((slot, slotIndex) => {
                // Get breaks that come after this period (for Monday, used as reference)
                // Note: Breaks are day-specific, so we show Monday's breaks as reference
                const breaksAfterThisPeriod = breaks.filter(
                  (b) => b.afterPeriod === slot.periodNumber && b.dayOfWeek === 1
                );

                // Alternate row colors for better readability
                const isEven = slotIndex % 2 === 0;

                return (
                  <React.Fragment key={slot.id}>
                    {/* Regular lesson row */}
                    <tr className={`group transition-colors ${
                      isEven 
                        ? 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750' 
                        : 'bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}>
                      <td className="border-r border-b border-slate-200 dark:border-slate-700 p-0">
                        <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 border-r-2 border-primary/20 dark:border-primary/30 p-4 min-w-[140px]">
                          <div className="flex flex-col gap-2">
                            {/* Time Display */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20 dark:bg-primary/30">
                                <Clock className="h-4 w-4 text-primary dark:text-primary-foreground" />
                              </div>
                              <div className="flex-1">
                                <div className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight">
                                  {slot.time}
                                </div>
                                <div className="text-xs font-semibold text-primary dark:text-primary-foreground mt-0.5">
                                  Period {slot.periodNumber}
                                </div>
                              </div>
                            </div>
                            
                            {/* Time Range */}
                            {slot.startTime && slot.endTime && (
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium pl-10">
                                {slot.startTime} - {slot.endTime}
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditingTimeslot(slot)}
                                className="flex items-center justify-center w-7 h-7 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                                title="Edit timeslot"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => setTimeslotToDelete(slot)}
                                className="flex items-center justify-center w-7 h-7 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-red-500 dark:text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
                                title="Delete timeslot"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      {days.map((_, dayIndex) => {
                        const dayOfWeek = dayIndex + 1;
                        const entry = grid[dayOfWeek]?.[slot.id];

                        return (
                          <td key={dayIndex} className="border-r border-b border-slate-200 dark:border-slate-700 last:border-r-0 p-3 align-top">
                            {entry ? (
                              <div 
                                className="group/lesson relative cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 hover:shadow-md hover:scale-[1.02] transition-all duration-200"
                                onClick={() => setEditingLesson(entry)}
                                title="Click to edit"
                              >
                                <div className="space-y-1.5">
                                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight">
                                    {entry.subject.name}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                    <span className="font-medium">{entry.teacher.name}</span>
                                  </div>
                                  {entry.roomNumber && (
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-600">
                                      <span>📍</span>
                                      <span>Room {entry.roomNumber}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                                  <Edit2 className="h-3.5 w-3.5 text-primary" />
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingLesson({
                                    gradeId: selectedGradeId,
                                    dayOfWeek,
                                    timeSlotId: slot.id,
                                    isNew: true,
                                  });
                                }}
                                className="w-full h-full min-h-[80px] flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary-foreground border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary dark:hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group/empty"
                                title="Click to schedule a lesson"
                              >
                                <Plus className="h-4 w-4 opacity-50 group-hover/empty:opacity-100 transition-opacity" />
                                <span className="font-medium">Add Lesson</span>
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
                        <div className="relative bg-gradient-to-br from-orange-100/50 via-orange-50/30 to-transparent dark:from-orange-900/30 dark:via-orange-950/20 border-r-2 border-orange-300 dark:border-orange-700 p-4 min-w-[140px]">
                          <div className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-200 dark:bg-orange-900 text-lg">
                              {breaksAfterThisPeriod[0].icon}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-sm text-orange-900 dark:text-orange-200">
                                {breaksAfterThisPeriod[0].name}
                              </div>
                              <div className="text-xs font-semibold text-orange-700 dark:text-orange-300 mt-0.5">
                                {breaksAfterThisPeriod[0].durationMinutes} min
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      {days.map((day, dayIndex) => {
                        const dayBreak = breaksAfterThisPeriod.find(
                          (b) => b.dayOfWeek === dayIndex + 1
                        );
                        return (
                          <td key={dayIndex} className="border-r border-b border-orange-200 dark:border-orange-800 last:border-r-0 p-3 text-center align-middle">
                            {dayBreak ? (
                              <div 
                                className="flex items-center justify-center gap-2 cursor-pointer bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800 rounded-lg p-3 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:shadow-md hover:scale-[1.02] transition-all duration-200 group/break"
                                onClick={() => setEditingBreak(dayBreak)}
                                title="Click to edit break"
                              >
                                <span className="text-lg">{dayBreak.icon}</span>
                                <span className="text-sm font-semibold text-orange-900 dark:text-orange-200">
                                  {dayBreak.durationMinutes}min
                                </span>
                                <Edit2 className="h-3 w-3 text-orange-600 dark:text-orange-400 opacity-0 group-hover/break:opacity-100 transition-opacity" />
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingBreak({
                                    isNew: true,
                                    afterPeriod: slot.periodNumber,
                                    dayOfWeek: dayIndex + 1,
                                  });
                                }}
                                className="w-full h-full min-h-[60px] flex items-center justify-center gap-2 text-xs text-orange-500 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 border-2 border-dashed border-orange-200 dark:border-orange-800 rounded-lg hover:border-orange-400 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all"
                                title="Add break for this day"
                              >
                                <Plus className="h-4 w-4" />
                                <span className="font-medium">Add Break</span>
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  )}
                </React.Fragment>
              );
            })
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
          className={`px-4 py-2 rounded-lg ${
            showConflicts
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
        onClose={() => setEditingLesson(null)} 
      />
      <TimeslotEditDialog 
        timeslot={editingTimeslot} 
        onClose={() => setEditingTimeslot(null)} 
      />
      <BreakEditDialog 
        breakData={editingBreak} 
        onClose={() => setEditingBreak(null)} 
      />
      
      {/* Bulk Schedule Drawer */}
      <BulkScheduleDrawer 
        open={bulkScheduleOpen} 
        onClose={() => setBulkScheduleOpen(false)} 
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
              <span>All Break Times</span>
            </SheetTitle>
            <SheetDescription>
              View and manage all {breaks.length} break{breaks.length !== 1 ? 's' : ''}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
            {breaks.map((breakItem) => (
              <div key={breakItem.id} className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-lg">
                      <span>{breakItem.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary">{breakItem.name}</span>
                        <span className="text-slate-600 dark:text-slate-300 text-sm">
                          {breakItem.durationMinutes} min
                        </span>
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                        After Period {breakItem.afterPeriod} • {days[breakItem.dayOfWeek - 1] || 'Unknown day'}
                      </div>
                    </div>
                  </div>
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
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Toast Notifications */}
      <Toaster />

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
            <AlertDialogTitle>Delete All Time Slots</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">all {timeSlots.length} time slot{timeSlots.length !== 1 ? 's' : ''}</span>?
              <p className="mt-2 text-red-500 font-semibold">This action cannot be undone.</p>
              <p className="mt-2 text-red-500">All lessons scheduled in these timeslots will also be removed.</p>
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
                  Deleting All...
                </>
              ) : (
                'Delete All Time Slots'
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
              Are you sure you want to delete <span className="font-semibold">all {breaks.length} break{breaks.length !== 1 ? 's' : ''}</span>?
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
        </div>
      </div>
    </div>
  );
}


