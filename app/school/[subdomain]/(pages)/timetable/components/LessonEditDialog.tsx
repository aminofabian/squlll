'use client';

import { useState, useEffect } from 'react';
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';
import { useSelectedTerm } from '@/lib/hooks/useSelectedTerm';
import type { EnrichedTimetableEntry } from '@/lib/types/timetable';
import { useToast } from '@/components/ui/use-toast';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface LessonEditDialogProps {
  lesson: (EnrichedTimetableEntry & { isNew?: boolean }) | null;
  onClose: () => void;
}

export function LessonEditDialog({ lesson, onClose }: LessonEditDialogProps) {
  const { subjects, teachers, entries, timeSlots, grades, updateEntry, addEntry, deleteEntry, loadEntries, selectedGradeId, selectedTermId } = useTimetableStore();
  const { selectedTerm } = useSelectedTerm();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    subjectId: '',
    teacherId: '',
    roomNumber: '',
  });

  useEffect(() => {
    if (lesson && !lesson.isNew) {
      setFormData({
        subjectId: lesson.subjectId,
        teacherId: lesson.teacherId,
        roomNumber: lesson.roomNumber || '',
      });
    } else if (lesson && lesson.isNew) {
      // For new lessons, find first available teacher
      const busyTeacherIds = new Set(
        entries
          .filter((entry) => 
            entry.timeSlotId === lesson.timeSlotId && 
            entry.dayOfWeek === lesson.dayOfWeek
          )
          .map((entry) => entry.teacherId)
      );

      const firstSubject = subjects[0];
      // Find a teacher who can teach this grade
      const firstAvailableTeacher = teachers.find((teacher) => {
        const canTeachGrade = !grade?.name || (teacher.gradeLevels && teacher.gradeLevels.includes(grade.name));
        const isAvailable = !busyTeacherIds.has(teacher.id);
        return canTeachGrade && isAvailable;
      });

      setFormData({
        subjectId: firstSubject?.id || '',
        teacherId: firstAvailableTeacher?.id || '',
        roomNumber: '',
      });
    }
  }, [lesson, subjects, teachers, entries]);

  const handleSave = async () => {
    if (!lesson) return;

    // Get termId from context or store
    const termId = selectedTerm?.id || selectedTermId;
    
    if (!termId) {
      toast({
        title: 'Error',
        description: 'No term selected. Please select a term first.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      if (lesson.isNew) {
        // Create new entry via GraphQL
        const mutation = `
          mutation CreateSingleEntry($input: CreateTimetableEntryInput!) {
            createTimetableEntry(input: $input) {
              id
              dayOfWeek
              roomNumber
              grade {
                name
              }
              subject {
                name
              }
              teacher {
                user {
                  name
                }
              }
              timeSlot {
                periodNumber
                displayTime
              }
            }
          }
        `;

        // Validate all required IDs are present
        if (!lesson.gradeId || !formData.subjectId || !formData.teacherId || !lesson.timeSlotId) {
          toast({
            title: 'Error',
            description: 'Missing required information. Please check all fields are selected.',
            variant: 'destructive',
          });
          setIsSaving(false);
          return;
        }

        // Build input object - only include roomNumber if it has a value
        // Make sure we're using the correct IDs from the lesson object
        const input: any = {
          termId: termId,
          gradeId: lesson.gradeId, // This should be the grade entity ID
          subjectId: formData.subjectId, // This should be the subject entity ID
          teacherId: formData.teacherId, // This should be the teacher entity ID (not user ID)
          timeSlotId: lesson.timeSlotId, // This should be the timeSlot entity ID
          dayOfWeek: lesson.dayOfWeek,
        };

        // Verify the IDs exist in the store
        const grade = grades.find((g) => g.id === lesson.gradeId);
        const subject = subjects.find((s) => s.id === formData.subjectId);
        const teacher = teachers.find((t) => t.id === formData.teacherId);
        const timeSlot = timeSlots.find((ts) => ts.id === lesson.timeSlotId);

        console.log('Creating entry with IDs:', {
          termId,
          gradeId: lesson.gradeId,
          gradeName: grade?.name,
          subjectId: formData.subjectId,
          subjectName: subject?.name,
          teacherId: formData.teacherId,
          teacherName: teacher?.name,
          timeSlotId: lesson.timeSlotId,
          timeSlotPeriod: timeSlot?.periodNumber,
          dayOfWeek: lesson.dayOfWeek,
        });

        // Validate IDs exist
        if (!grade) {
          console.error('Grade not found:', lesson.gradeId);
          toast({
            title: 'Error',
            description: `Grade ID ${lesson.gradeId} not found in store`,
            variant: 'destructive',
          });
          setIsSaving(false);
          return;
        }
        if (!subject) {
          console.error('Subject not found:', formData.subjectId);
          toast({
            title: 'Error',
            description: `Subject ID ${formData.subjectId} not found in store`,
            variant: 'destructive',
          });
          setIsSaving(false);
          return;
        }
        if (!teacher) {
          console.error('Teacher not found:', formData.teacherId);
          toast({
            title: 'Error',
            description: `Teacher ID ${formData.teacherId} not found in store`,
            variant: 'destructive',
          });
          setIsSaving(false);
          return;
        }
        if (!timeSlot) {
          console.error('TimeSlot not found:', lesson.timeSlotId);
          toast({
            title: 'Error',
            description: `TimeSlot ID ${lesson.timeSlotId} not found in store`,
            variant: 'destructive',
          });
          setIsSaving(false);
          return;
        }

        // Only include roomNumber if it's not empty
        if (formData.roomNumber && formData.roomNumber.trim()) {
          input.roomNumber = formData.roomNumber.trim();
        }

        const variables = {
          input,
        };

        console.log('Creating timetable entry with input:', input);

        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            query: mutation,
            variables,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('HTTP error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('GraphQL response:', result);

        if (result.errors) {
          console.error('GraphQL errors:', result.errors);
          const errorMessages = result.errors.map((e: any) => {
            // Include more details if available
            if (e.extensions) {
              return `${e.message} (${JSON.stringify(e.extensions)})`;
            }
            return e.message;
          }).join(', ');
          throw new Error(`GraphQL errors: ${errorMessages}`);
        }

        if (!result.data || !result.data.createTimetableEntry) {
          throw new Error('Invalid response format');
        }

        // Reload entries to update the UI
        if (selectedGradeId && termId) {
          await loadEntries(termId, selectedGradeId);
        }

        toast({
          title: 'Success',
          description: 'Lesson created successfully',
        });

        onClose();
      } else {
        // Update existing entry - for now, use local update
        // TODO: Implement update mutation when backend supports it
        updateEntry(lesson.id, {
          subjectId: formData.subjectId,
          teacherId: formData.teacherId,
          roomNumber: formData.roomNumber || undefined,
        });

        toast({
          title: 'Success',
          description: 'Lesson updated successfully',
        });

        onClose();
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save lesson',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!lesson || lesson.isNew) return;
    
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    const termId = selectedTerm?.id || selectedTermId;
    
    setIsSaving(true);

    try {
      // TODO: Implement delete mutation when backend supports it
      // For now, use local delete
      deleteEntry(lesson.id);

      // Reload entries to update the UI
      if (selectedGradeId && termId) {
        await loadEntries(termId, selectedGradeId);
      }

      toast({
        title: 'Success',
        description: 'Lesson deleted successfully',
      });

      onClose();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete lesson',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!lesson) return null;

  const isNew = lesson.isNew;
  const selectedSubject = subjects.find((s) => s.id === formData.subjectId);
  const selectedTeacher = teachers.find((t) => t.id === formData.teacherId);
  
  // Get timeslot and grade information
  const timeSlot = timeSlots.find((ts) => ts.id === lesson.timeSlotId);
  const grade = grades.find((g) => g.id === lesson.gradeId);

  // Find teachers already scheduled at this timeslot
  const busyTeacherIds = new Set(
    entries
      .filter((entry) => {
        // Same timeslot and day
        const sameSlot = entry.timeSlotId === lesson.timeSlotId && entry.dayOfWeek === lesson.dayOfWeek;
        // Exclude current lesson if editing (not new)
        const isCurrentLesson = !isNew && entry.id === lesson.id;
        return sameSlot && !isCurrentLesson;
      })
      .map((entry) => entry.teacherId)
  );

  // Filter teachers who:
  // 1. Can teach the selected grade (or show all if no grade selected)
  // 2. Are NOT already scheduled at this timeslot
  const availableTeachers = teachers.filter((teacher) => {
    // Filter by grade level - show teachers who can teach this grade
    const canTeachGrade = !grade?.name || (teacher.gradeLevels && teacher.gradeLevels.includes(grade.name));
    const isAvailable = !busyTeacherIds.has(teacher.id);
    return canTeachGrade && isAvailable;
  });

  // Separate list: teachers who can teach this grade but are busy (for display purposes)
  const busyButQualifiedTeachers = teachers.filter((teacher) => {
    // Filter by grade level - show teachers who can teach this grade
    const canTeachGrade = !grade?.name || (teacher.gradeLevels && teacher.gradeLevels.includes(grade.name));
    const isBusy = busyTeacherIds.has(teacher.id);
    return canTeachGrade && isBusy;
  });

  return (
    <Drawer open={!!lesson} onOpenChange={onClose} direction="right">
      <DrawerContent className="max-w-md flex flex-col h-full">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle>
            {isNew ? 'Add New Lesson' : 'Edit Lesson'}
          </DrawerTitle>
          {/* Timeslot and Grade Info */}
          <div className="mt-3 space-y-2 pt-3 border-t">
            {timeSlot && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Time Slot:</span>
                <span className="font-medium text-blue-700">
                  Period {timeSlot.periodNumber} • {timeSlot.time}
                </span>
              </div>
            )}
            {grade && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Grade:</span>
                <span className="font-medium text-purple-700">
                  {grade.displayName || grade.name}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Day:</span>
              <span className="font-medium">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][lesson.dayOfWeek - 1]}
              </span>
            </div>
          </div>
        </DrawerHeader>

        <div className="space-y-4 px-4 pb-4 overflow-y-auto flex-1">
          {/* Subject Selection */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select
              value={formData.subjectId}
              onValueChange={(value) => {
                const newSubject = subjects.find((s) => s.id === value);
                const currentTeacher = teachers.find((t) => t.id === formData.teacherId);
                
                // Check if current teacher can teach this subject and is available
                const busyTeacherIds = new Set(
                  entries
                    .filter((entry) => {
                      const sameSlot = entry.timeSlotId === lesson.timeSlotId && entry.dayOfWeek === lesson.dayOfWeek;
                      const isCurrentLesson = !lesson.isNew && entry.id === lesson.id;
                      return sameSlot && !isCurrentLesson;
                    })
                    .map((entry) => entry.teacherId)
                );

                const currentTeacherValid = 
                  currentTeacher &&
                  (!grade?.name || (currentTeacher.gradeLevels && currentTeacher.gradeLevels.includes(grade.name))) &&
                  !busyTeacherIds.has(currentTeacher.id);

                if (!currentTeacherValid) {
                  // Find first available teacher for this grade
                  const firstAvailable = teachers.find((t) => {
                    const canTeachGrade = !grade?.name || (t.gradeLevels && t.gradeLevels.includes(grade.name));
                    const isAvailable = !busyTeacherIds.has(t.id);
                    return canTeachGrade && isAvailable;
                  });

                  setFormData({
                    ...formData,
                    subjectId: value,
                    teacherId: firstAvailable?.id || '',
                  });
                } else {
                  setFormData({ ...formData, subjectId: value });
                }
              }}
            >
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: subject.color }}
                      />
                      {subject.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Teacher Selection */}
          <div className="space-y-2">
            <Label htmlFor="teacher">
              Teacher
              {availableTeachers.length > 0 && busyButQualifiedTeachers.length > 0 && (
                <span className="ml-2 text-xs text-gray-500">
                  ({availableTeachers.length} available, {busyButQualifiedTeachers.length} busy)
                </span>
              )}
            </Label>
            <Select
              value={formData.teacherId}
              onValueChange={(value) => setFormData({ ...formData, teacherId: value })}
            >
              <SelectTrigger id="teacher">
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {availableTeachers.length > 0 ? (
                  availableTeachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        {teacher.name}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No teachers available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            
            {/* Show appropriate warning message */}
            {availableTeachers.length === 0 && (
              <div className="text-xs text-red-600 space-y-1">
                <p>⚠️ No teachers available at this time</p>
                {busyButQualifiedTeachers.length > 0 ? (
                  <p className="text-gray-600">
                    {busyButQualifiedTeachers.length} qualified teacher(s) already scheduled at this timeslot
                  </p>
                ) : (
                  <p className="text-gray-600">
                    No teachers assigned to {grade?.name || 'this grade'}
                  </p>
                )}
              </div>
            )}

            {/* Show list of busy teachers if any */}
            {busyButQualifiedTeachers.length > 0 && availableTeachers.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-2 rounded text-xs">
                <p className="font-medium text-yellow-800 mb-1">Currently busy:</p>
                <ul className="text-yellow-700 space-y-0.5">
                  {busyButQualifiedTeachers.map((teacher) => (
                    <li key={teacher.id}>• {teacher.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Room Number */}
          <div className="space-y-2">
            <Label htmlFor="room">Room Number (Optional)</Label>
            <Input
              id="room"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              placeholder="e.g. Room 101"
            />
          </div>

        </div>

        <DrawerFooter className="gap-2">
          <div className="flex items-center justify-between w-full">
            {!isNew && (
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            )}
            <div className={`flex gap-2 ${!isNew ? 'ml-auto' : 'ml-auto'}`}>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.subjectId || !formData.teacherId || isSaving}
              >
                {isSaving ? 'Saving...' : isNew ? 'Add Lesson' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

