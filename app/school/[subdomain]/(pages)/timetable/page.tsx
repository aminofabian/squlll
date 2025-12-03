
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
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { SchoolSearchFilter } from '@/components/dashboard/SchoolSearchFilter';
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig';

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
    Promise.all([
      loadTimeSlots(),
      loadGrades(),
      loadSubjects(), // Load all subjects initially
      loadTeachers(), // Load all teachers
    ])
      .then(() => {
        console.log('Time slots, grades, subjects, and teachers loaded successfully');
      })
      .catch((error) => {
        console.error('Failed to load data:', error);
      })
      .finally(() => {
        setLoadingTimeSlots(false);
      });
  }, [loadTimeSlots, loadGrades, loadSubjects, loadTeachers]);

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
  
  // State for showing all items
  const [showAllTimeSlots, setShowAllTimeSlots] = useState(false);
  const [showAllBreaks, setShowAllBreaks] = useState(false);

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
      await loadTimeSlots();
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
      await loadTimeSlots();
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
          {/* Header - Compact */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold">Smart Timetable</h1>
                <span className="text-xs text-gray-500">•</span>
                <p className="text-xs text-gray-600">
                  {currentGrade?.name || 'Choose a grade to view schedule'}
                </p>
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
                  className="px-3 py-1.5 text-xs bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                >
                  <span>⚙️</span>
                  <span>Create Time Slots</span>
                </button>
                <button
                  onClick={() => setBulkLessonEntryOpen(true)}
                  className="px-3 py-1.5 text-xs bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-1.5"
                  disabled={!selectedGradeId}
                >
                  <span>📚</span>
                  <span>Bulk Create Lessons</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grade Selector - Inline with Stats (Fallback for mobile or when sidebar is minimized) */}
          <div className="mb-2 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">View Schedule For:</label>
              <select
                value={selectedGradeId || ''}
                onChange={(e) => handleGradeChange(e.target.value)}
                className="px-2 py-1 text-sm border-2 border-primary/10 bg-white text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              >
                <option value="">Select a grade...</option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.displayName || grade.name}
                  </option>
                ))}
              </select>
            </div>

        {/* Statistics - Compact Inline */}
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/5 border border-primary/10">
            <span className="text-xs font-bold text-primary">{stats.totalLessons}</span>
            <span className="text-[10px] text-primary">Scheduled</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 border border-green-200">
            <span className="text-xs font-bold text-green-600">{stats.completionPercentage}%</span>
            <span className="text-[10px] text-green-600">Complete</span>
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-1 border ${conflictCount > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
            <span className={`text-xs font-bold ${conflictCount > 0 ? 'text-red-600' : 'text-gray-600'}`}>{conflictCount}</span>
            <span className={`text-[10px] ${conflictCount > 0 ? 'text-red-600' : 'text-gray-600'}`}>Issues</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-50 border border-purple-200">
            <span className="text-xs font-bold text-purple-600">{Object.keys(stats.subjectDistribution).length}</span>
            <span className="text-[10px] text-purple-600">Subjects</span>
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
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-l-2 border-primary p-2 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">⏰</span>
              <h3 className="font-semibold text-primary text-xs">Class Periods</h3>
              {!loadingTimeSlots && timeSlots.length > 0 && (
                <span className="text-[10px] bg-primary/20 text-primary px-1 py-0.5 font-medium">
                  {timeSlots.length} period{timeSlots.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {!loadingTimeSlots && timeSlots.length > 0 && (
              <button
                onClick={() => setShowDeleteAllDialog(true)}
                className="text-[10px] text-red-600 hover:text-red-800 transition-colors"
                title="Delete all periods"
              >
                🗑️
              </button>
            )}
          </div>
          {loadingTimeSlots ? (
            <p className="text-[10px] text-primary/70">Loading periods...</p>
          ) : timeSlots.length === 0 ? (
            <div className="space-y-1.5">
              <p className="text-[10px] text-primary font-medium mb-1">No class periods set up yet</p>
              <p className="text-[9px] text-primary/70 mb-2">Start by creating your daily schedule periods</p>
              <button
                onClick={() => setBulkScheduleOpen(true)}
                className="w-full text-[10px] bg-primary text-white px-2 py-1.5 font-medium hover:bg-primary/90 transition-colors"
              >
                ➕ Create Periods Now
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {(showAllTimeSlots ? timeSlots : timeSlots.slice(0, 1)).map((slot) => (
                <div key={slot.id} className="bg-white/80 backdrop-blur-sm p-1 border border-primary/20 text-[10px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-primary">Period {slot.periodNumber}</span>
                      <span className="text-gray-700">{slot.time}</span>
                    </div>
                    <span className="text-gray-500 text-[9px]">{slot.startTime}-{slot.endTime}</span>
                  </div>
                </div>
              ))}
              {timeSlots.length > 1 && (
                <button
                  onClick={() => setShowAllTimeSlots(!showAllTimeSlots)}
                  className="text-[10px] text-primary hover:text-primary-dark font-medium w-full text-left"
                >
                  {showAllTimeSlots ? '▲ Show Less' : `▼ View All ${timeSlots.length} Periods`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Breaks Section */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-l-2 border-orange-500 p-2 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">☕</span>
              <h3 className="font-semibold text-orange-900 text-xs">Break Times</h3>
              {breaks.length > 0 && (
                <span className="text-[10px] bg-orange-200 text-orange-800 px-1 py-0.5 font-medium">
                  {breaks.length} break{breaks.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {breaks.length > 0 && (
                <button
                  onClick={() => setShowDeleteAllBreaksDialog(true)}
                  className="text-[10px] text-red-600 hover:text-red-800 transition-colors"
                  title="Delete all breaks"
                >
                  🗑️
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
                className="text-[10px] text-orange-700 hover:text-orange-900 transition-colors"
                title="Add break time"
              >
                ➕
              </button>
            </div>
          </div>
          {breaks.length === 0 ? (
            <div className="space-y-1">
              <p className="text-[10px] text-orange-600 font-medium">No break times scheduled</p>
              <p className="text-[9px] text-orange-500">Add lunch and short breaks between periods</p>
              <button
                onClick={() => {
                  setEditingBreak({
                    isNew: true,
                    afterPeriod: 3,
                    dayOfWeek: 1,
                  });
                }}
                className="w-full text-[10px] bg-orange-500 text-white px-2 py-1.5 font-medium hover:bg-orange-600 transition-colors mt-1"
              >
                ➕ Add Break Time
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {(showAllBreaks ? breaks : breaks.slice(0, 1)).map((breakItem) => (
                <div key={breakItem.id} className="bg-white/80 backdrop-blur-sm p-1 border border-orange-200/50 text-[10px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span>{breakItem.icon}</span>
                      <span className="font-medium text-orange-900">{breakItem.name}</span>
                    </div>
                    <div className="text-gray-600 text-[9px]">
                      After P{breakItem.afterPeriod} • {breakItem.durationMinutes} min
                    </div>
                  </div>
                  <div className="text-gray-500 text-[9px] mt-0.5">
                    {days[breakItem.dayOfWeek - 1] || 'Unknown day'}
                  </div>
                </div>
              ))}
              {breaks.length > 1 && (
                <button
                  onClick={() => setShowAllBreaks(!showAllBreaks)}
                  className="text-[10px] text-orange-600 hover:text-orange-800 font-medium w-full text-left"
                >
                  {showAllBreaks ? '▲ Show Less' : `▼ View All ${breaks.length} Breaks`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3 text-left font-semibold">Time</th>
              {days.map((day, index) => (
                <th key={index} className="border p-3 text-left font-semibold">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loadingTimeSlots ? (
              <tr>
                <td colSpan={6} className="border p-8 text-center text-gray-500">
                  Loading time slots...
                </td>
              </tr>
            ) : timeSlots.length === 0 ? (
              <tr>
                <td colSpan={6} className="border p-8 text-center text-gray-500">
                  No time slots available. Click "Bulk Schedule Setup" to create time slots.
                </td>
              </tr>
            ) : (
              timeSlots.map((slot, slotIndex) => {
              // Get breaks that come after this period
              const breaksAfterThisPeriod = breaks.filter(
                (b) => b.afterPeriod === slot.periodNumber
              );

              return (
                <React.Fragment key={slot.id}>
                  {/* Regular lesson row */}
                  <tr className="hover:bg-gray-50">
                    <td className="border p-3 font-medium text-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <div>{slot.time}</div>
                          <div className="text-xs text-gray-500">Period {slot.periodNumber}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingTimeslot(slot)}
                            className="text-primary hover:text-primary-dark text-xs"
                            title="Edit timeslot"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => setTimeslotToDelete(slot)}
                            className="text-red-600 hover:text-red-800 text-xs"
                            title="Delete timeslot"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </td>
                    {days.map((_, dayIndex) => {
                      const dayOfWeek = dayIndex + 1;
                      const entry = grid[dayOfWeek]?.[slot.id];

                      return (
                        <td key={dayIndex} className="border p-3">
                          {entry ? (
                            <div 
                              className="space-y-1 cursor-pointer hover:bg-primary/5 p-2 transition-colors"
                              onClick={() => setEditingLesson(entry)}
                              title="Click to edit"
                            >
                              <div className="font-semibold text-sm">
                                {entry.subject.name}
                              </div>
                              <div className="text-xs text-gray-600">
                                {entry.teacher.name}
                              </div>
                              {entry.roomNumber && (
                                <div className="text-xs text-gray-500">
                                  {entry.roomNumber}
                                </div>
                              )}
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
                              className="text-xs text-primary hover:text-primary-dark italic w-full text-left"
                            >
                              + Click to schedule a lesson
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Break rows (if any after this period) */}
                  {breaksAfterThisPeriod.length > 0 && (
                    <tr className="bg-orange-50 border-y-2 border-orange-200 hover:bg-orange-100 transition-colors">
                      <td className="border p-3 font-medium text-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{breaksAfterThisPeriod[0].icon}</span>
                            <div>
                              <div className="font-semibold">{breaksAfterThisPeriod[0].name}</div>
                              <div className="text-xs text-gray-600">
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
                          <td key={dayIndex} className="border p-3 text-center text-sm text-gray-600">
                            {dayBreak ? (
                              <div 
                                className="flex items-center justify-center gap-2 cursor-pointer hover:bg-orange-200 p-2 rounded transition-colors"
                                onClick={() => setEditingBreak(dayBreak)}
                                title="Click to edit break"
                              >
                                <span>{dayBreak.icon}</span>
                                <span>{dayBreak.durationMinutes}min</span>
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
                                className="text-xs text-primary hover:text-primary-dark italic"
                                title="Add break for this day"
                              >
                                + Add
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


