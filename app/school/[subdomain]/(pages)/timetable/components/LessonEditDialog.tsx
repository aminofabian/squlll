'use client';

import { useState, useEffect } from 'react';
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';
import { useSelectedTerm } from '@/lib/hooks/useSelectedTerm';
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore';
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
  const { getSubjectsByLevelId, getGradeById } = useSchoolConfigStore();
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

        // Create new entry via GraphQL - using single entry mutation
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

        // Build input object - always include roomNumber (null if empty to match backend expectations)
        const input: any = {
          termId: termId,
          gradeId: lesson.gradeId,
          subjectId: formData.subjectId,
          teacherId: formData.teacherId,
          timeSlotId: lesson.timeSlotId,
          dayOfWeek: lesson.dayOfWeek,
          roomNumber: formData.roomNumber && formData.roomNumber.trim() 
            ? formData.roomNumber.trim() 
            : null, // Explicitly set to null if empty
        };

        // Verify the IDs exist in the store
        const grade = grades.find((g) => g.id === lesson.gradeId);
        const subject = subjects.find((s) => s.id === formData.subjectId);
        const teacher = teachers.find((t) => t.id === formData.teacherId);
        const timeSlot = timeSlots.find((ts) => ts.id === lesson.timeSlotId);

        // Check if timeSlot has a valid UUID (not mock data like "slot-1")
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (timeSlot && !uuidRegex.test(timeSlot.id)) {
          console.error('Time slot has invalid ID format (likely mock data):', timeSlot);
          toast({
            title: 'Time Slots Need Reloading',
            description: 'Time slots appear to be using old cached data. Please reload the page to fetch fresh time slots from the backend.',
            variant: 'destructive',
          });
          setIsSaving(false);
          return;
        }

        // Log available subjects for debugging
        console.log('Available subjects in store:', subjects.map(s => ({ id: s.id, name: s.name })));
        console.log('Selected subject:', subject);
        console.log('Selected timeSlot:', timeSlot);

        // Validate UUID format for all IDs (uuidRegex already declared above)
        const invalidIds: string[] = [];
        if (!uuidRegex.test(input.termId)) invalidIds.push(`termId: ${input.termId}`);
        if (!uuidRegex.test(input.gradeId)) invalidIds.push(`gradeId: ${input.gradeId}`);
        if (!uuidRegex.test(input.subjectId)) invalidIds.push(`subjectId: ${input.subjectId}`);
        if (!uuidRegex.test(input.teacherId)) invalidIds.push(`teacherId: ${input.teacherId}`);
        if (!uuidRegex.test(input.timeSlotId)) invalidIds.push(`timeSlotId: ${input.timeSlotId}`);

        if (invalidIds.length > 0) {
          console.error('Invalid UUID format detected:', invalidIds);
          
          // Special handling for timeSlotId - likely cached mock data
          if (invalidIds.some(id => id.includes('timeSlotId'))) {
            toast({
              title: 'Time Slots Need Reloading',
              description: 'Time slots appear to be using old data. Please reload the page or click "Create Time Slots" to refresh them.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Error',
              description: `Invalid ID format: ${invalidIds.join(', ')}. Please reload the page.`,
              variant: 'destructive',
            });
          }
          setIsSaving(false);
          return;
        }

        // Validate dayOfWeek is between 1-5
        if (input.dayOfWeek < 1 || input.dayOfWeek > 5) {
          console.error('Invalid dayOfWeek:', input.dayOfWeek);
          toast({
            title: 'Error',
            description: `Invalid day of week: ${input.dayOfWeek}. Must be between 1 (Monday) and 5 (Friday).`,
            variant: 'destructive',
          });
          setIsSaving(false);
          return;
        }

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
          roomNumber: input.roomNumber,
        });

        // Log the exact input being sent
        console.log('Exact input object being sent to backend:', JSON.stringify(input, null, 2));

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

        const variables = {
          input,
        };

        const requestBody = {
          query: mutation,
          variables,
        };

        console.log('Creating timetable entry with input:', input);
        console.log('GraphQL mutation:', mutation);
        console.log('GraphQL variables:', JSON.stringify(variables, null, 2));
        console.log('Full request body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(requestBody),
        });

        // Parse JSON first - GraphQL returns errors in JSON format even with non-200 status
        let result;
        try {
          result = await response.json();
        } catch (parseError) {
          // If JSON parsing fails, try to get text for debugging
          const errorText = await response.text();
          console.error('Failed to parse response as JSON:', errorText);
          throw new Error(`Invalid response format: ${errorText.substring(0, 200)}`);
        }

        console.log('GraphQL response:', JSON.stringify(result, null, 2));

        // Check for GraphQL errors first (these can occur even with 200 status)
        if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
          console.error('GraphQL errors:', result.errors);
          
          // Extract detailed error information
          const errorMessages = result.errors.map((e: any) => {
            let message = e.message || 'Unknown error';
            
            // Handle validation errors with more detail
            if (e.extensions?.code === 'VALIDATION_ERROR' || e.extensions?.code === 'BADREQUESTEXCEPTION') {
              // Log the full error structure for debugging
              console.error('=== VALIDATION ERROR DEBUG ===');
              console.error('Full error object:', JSON.stringify(e, null, 2));
              console.error('Error extensions:', JSON.stringify(e.extensions, null, 2));
              console.error('Input that caused the error:', JSON.stringify(input, null, 2));
              console.error('=== END VALIDATION ERROR DEBUG ===');
              
              // Try to extract more details from various possible error structures
              let detailedMessage = message;
              
              // Check for validationErrors object
              if (e.extensions.validationErrors) {
                const validationDetails = Object.entries(e.extensions.validationErrors)
                  .map(([field, errors]: [string, any]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                  .join('; ');
                detailedMessage = `Validation failed: ${validationDetails}`;
              } 
              // Check for exception object with nested details
              else if (e.extensions.exception) {
                const exception = e.extensions.exception;
                if (exception.response?.message) {
                  detailedMessage = `Validation failed: ${Array.isArray(exception.response.message) 
                    ? exception.response.message.join(', ') 
                    : exception.response.message}`;
                } else if (exception.message) {
                  detailedMessage = `Validation failed: ${exception.message}`;
                }
              }
              // Check for originalError
              else if (e.extensions.originalError) {
                const originalError = e.extensions.originalError;
                if (originalError.message) {
                  detailedMessage = `Validation failed: ${originalError.message}`;
                }
                if (originalError.response?.data?.message) {
                  detailedMessage = `Validation failed: ${originalError.response.data.message}`;
                }
              }
              // Check if the error message itself contains useful info
              else if (message.includes('Invalid subjectId') || message.includes('Invalid subject')) {
                detailedMessage = `Invalid subject selected. The subject may not be assigned to this grade. Please select a different subject.`;
              } else if (message.includes('Invalid teacherId') || message.includes('Invalid teacher')) {
                detailedMessage = `Invalid teacher selected. The teacher may not be assigned to teach this subject or grade.`;
              } else if (message.includes('Invalid gradeId') || message.includes('Invalid grade')) {
                detailedMessage = `Invalid grade selected. Please try selecting the grade again.`;
              } else if (message.includes('conflict') || message.includes('Conflict') || message.includes('already scheduled')) {
                detailedMessage = `Schedule conflict detected. The teacher or grade may already be scheduled at this time. Please choose a different time slot or teacher.`;
              } else if (message.includes('not qualified') || message.includes('cannot teach')) {
                detailedMessage = `The selected teacher is not assigned to teach this subject. Please select a different teacher or subject.`;
              }
              
              // If we still have a generic message, provide helpful context
              if (detailedMessage === message && message === 'Input validation failed') {
                detailedMessage = `Validation failed. Possible causes: (1) Teacher already scheduled at this time, (2) Grade already has a lesson at this time, (3) Teacher not assigned to teach this subject, or (4) Subject not assigned to this grade. Check console logs for the exact input being sent.`;
              }
              
              message = detailedMessage;
            }
            
            // Include field path if available
            if (e.path && e.path.length > 0) {
              message += ` (at ${e.path.join('.')})`;
            }
            
            return message;
          }).join('; ');
          
          throw new Error(errorMessages);
        }

        // Check HTTP status after parsing JSON (GraphQL errors are handled above)
        if (!response.ok) {
          console.error('HTTP error response:', result);
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        // Enhanced error handling for invalid response
        if (!result.data) {
          console.error('No data in response:', result);
          throw new Error('Invalid response format: No data field in response');
        }

        // Handle single entry response
        if (!result.data || !result.data.createTimetableEntry) {
          console.error('createTimetableEntry is null or undefined. Full response:', JSON.stringify(result, null, 2));
          console.error('Response data keys:', Object.keys(result.data || {}));
          
          throw new Error(
            `Invalid response format: createTimetableEntry is ${result.data?.createTimetableEntry}. ` +
            `Response data: ${JSON.stringify(result.data)}`
          );
        }

        const createdEntry = result.data.createTimetableEntry;
        console.log('Successfully created entry:', createdEntry);

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
                {(() => {
                  // Get the grade info for this lesson
                  const gradeInfo = getGradeById(lesson.gradeId);
                  if (!gradeInfo) {
                    return (
                      <SelectItem value="none" disabled>
                        No grade information available
                      </SelectItem>
                    );
                  }

                  // Get subjects for this grade's level
                  const levelSubjects = getSubjectsByLevelId(gradeInfo.levelId);

                  return levelSubjects.map((subject) => {
                    // Subject from school-config doesn't have color, so we use a fallback
                    const subjectColor = 'color' in subject ? (subject as { color?: string }).color : undefined;
                    return (
                      <SelectItem key={subject.id} value={subject.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: subjectColor || '#3B82F6' }}
                          />
                          {subject.name}
                        </div>
                      </SelectItem>
                    );
                  });
                })()}
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

