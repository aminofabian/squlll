
'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
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
import { DebugStoreButton } from './debug-store-button';
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

export default function SmartTimetableNew() {
  // Get store data and actions
  const {
    grades,
    subjects,
    teachers,
    timeSlots,
    selectedGradeId,
    setSelectedGrade,
    searchTerm,
    setSearchTerm,
    showConflicts,
    toggleConflicts,
    loadTimeSlots,
    deleteTimeSlot,
  } = useTimetableStore();

  // Toast for notifications
  const { toast } = useToast();

  // Load time slots from backend on mount
  useEffect(() => {
    setLoadingTimeSlots(true);
    loadTimeSlots()
      .then(() => {
        console.log('Time slots loaded successfully:', timeSlots);
      })
      .catch((error) => {
        console.error('Failed to load time slots:', error);
      })
      .finally(() => {
        setLoadingTimeSlots(false);
      });
  }, [loadTimeSlots]);

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

  // State for editing
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [editingTimeslot, setEditingTimeslot] = useState<any | null>(null);
  const [editingBreak, setEditingBreak] = useState<any | null>(null);
  const [bulkScheduleOpen, setBulkScheduleOpen] = useState(false);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(true);
  
  // State for delete confirmation
  const [timeslotToDelete, setTimeslotToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Smart Timetable</h1>
            <p className="text-gray-600">
              Viewing: {currentGrade?.name || 'Select a grade'}
            </p>
          </div>
          <button
            onClick={() => setBulkScheduleOpen(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <span>⚙️</span>
            <span>Bulk Schedule Setup</span>
          </button>
        </div>
        
        {/* Debug Buttons */}
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
          <p className="text-sm text-yellow-800 mb-2">
            <strong>Debug Tools:</strong> If you don't see any data, use these buttons
          </p>
          <DebugStoreButton />
        </div>
      </div>

      {/* Grade Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Grade:</label>
        <select
          value={selectedGradeId || ''}
          onChange={(e) => handleGradeChange(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          {grades.map((grade) => (
            <option key={grade.id} value={grade.id}>
              {grade.displayName || grade.name}
            </option>
          ))}
        </select>
      </div>

      {/* Statistics Card */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalLessons}
          </div>
          <div className="text-sm text-gray-600">Total Lessons</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {stats.completionPercentage}%
          </div>
          <div className="text-sm text-gray-600">Completion</div>
        </div>
        
        <div className={`p-4 rounded-lg ${conflictCount > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
          <div className={`text-2xl font-bold ${conflictCount > 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {conflictCount}
          </div>
          <div className="text-sm text-gray-600">Conflicts</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {Object.keys(stats.subjectDistribution).length}
          </div>
          <div className="text-sm text-gray-600">Subjects</div>
        </div>
      </div>

      {/* Conflict Warnings */}
      {showConflicts && conflictCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-900 mb-2">
            ⚠️ {conflictCount} Conflicts Detected
          </h3>
          <div className="space-y-2">
            {teacherConflicts.map((conflict, index) => (
              <div key={index} className="text-sm text-red-800">
                <strong>{conflict.teacher?.name}</strong> is scheduled in multiple grades:
                <ul className="ml-4 mt-1">
                  {conflict.entries.map((entry, i) => (
                    <li key={i}>
                      {entry.grade} - {entry.subject} ({entry.timeSlot})
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time Slots Debug Info */}
      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Time Slots from Backend</h3>
        {loadingTimeSlots ? (
          <p className="text-sm text-blue-700">Loading time slots...</p>
        ) : timeSlots.length === 0 ? (
          <p className="text-sm text-blue-700">No time slots found. Use "Bulk Schedule Setup" to create time slots.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-blue-700">
              Found <strong>{timeSlots.length}</strong> time slot{timeSlots.length !== 1 ? 's' : ''}:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <div key={slot.id} className="bg-white p-2 rounded border border-blue-200 text-xs">
                  <div className="font-semibold">Period {slot.periodNumber}</div>
                  <div className="text-gray-600">{slot.time}</div>
                  <div className="text-gray-500">{slot.startTime} - {slot.endTime}</div>
                  <div className="text-gray-400">ID: {slot.id.substring(0, 8)}...</div>
                </div>
              ))}
            </div>
          </div>
        )}
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
                            className="text-blue-600 hover:text-blue-800 text-xs"
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
                              className="space-y-1 cursor-pointer hover:bg-blue-50 p-2 rounded transition-colors"
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
                              className="text-xs text-blue-500 hover:text-blue-700 italic w-full text-left"
                            >
                              + Add lesson
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
                                className="text-xs text-blue-500 hover:text-blue-700 italic"
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
              <span className="font-semibold text-blue-600">{count} lessons</span>
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
    </div>
  );
}


