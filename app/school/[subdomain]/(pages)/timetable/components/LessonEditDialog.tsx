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
  const { subjects, teachers, entries, timeSlots, grades, addEntry, deleteEntry, loadEntries, selectedGradeId, selectedTermId } = useTimetableStore();
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

      // Get the grade from the store
      const grade = grades.find((g) => g.id === lesson.gradeId);
      
      // Get the first available backend subject for this grade's level
      const gradeInfo = getGradeById(lesson.gradeId);
      let firstSubject = null;
      
      if (gradeInfo) {
        const levelSubjects = getSubjectsByLevelId(gradeInfo.levelId);
        const levelSubjectNames = new Set(
          levelSubjects.map(s => s.name.toLowerCase().trim())
        );
        const levelSubjectCodes = new Set(
          levelSubjects.map(s => s.code?.toLowerCase().trim()).filter(Boolean)
        );

        // Find first backend subject that matches the grade's level
        firstSubject = subjects.find((backendSubject) => {
          const subjectName = backendSubject.name.toLowerCase().trim();
          const subjectCode = backendSubject.code?.toLowerCase().trim();
          return levelSubjectNames.has(subjectName) || 
                 (subjectCode && levelSubjectCodes.has(subjectCode));
        });
      }

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

    // Verify term has academicYear (backend needs this to derive academicYear)
    if (!selectedTerm?.academicYear?.name) {
      toast({
        title: 'Error',
        description: 'Selected term does not have an academic year. Please select a different term or contact support.',
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

        // Build input object - GraphQL CreateTimetableEntryInput only accepts:
        // termId, gradeId, subjectId, teacherId, timeSlotId, dayOfWeek, roomNumber (optional)
        // The backend derives academicYear from termId internally
        const input: any = {
          termId: termId,
          gradeId: lesson.gradeId,
          subjectId: formData.subjectId,
          teacherId: formData.teacherId,
          timeSlotId: lesson.timeSlotId,
          dayOfWeek: parseInt(String(lesson.dayOfWeek), 10), // Ensure it's an integer
        };

        // Only add optional fields if they have values
        if (formData.roomNumber && formData.roomNumber.trim()) {
          input.roomNumber = formData.roomNumber.trim();
        }

        // Validate input structure before sending
        console.log('Input validation check:', {
          termId: typeof input.termId === 'string' && input.termId.length > 0,
          gradeId: typeof input.gradeId === 'string' && input.gradeId.length > 0,
          subjectId: typeof input.subjectId === 'string' && input.subjectId.length > 0,
          teacherId: typeof input.teacherId === 'string' && input.teacherId.length > 0,
          timeSlotId: typeof input.timeSlotId === 'string' && input.timeSlotId.length > 0,
          dayOfWeek: Number.isInteger(input.dayOfWeek) && input.dayOfWeek >= 1 && input.dayOfWeek <= 5,
          roomNumber: !input.roomNumber || typeof input.roomNumber === 'string',
        });

        // Verify the IDs exist in the store
        const grade = grades.find((g) => g.id === lesson.gradeId);
        const subject = subjects.find((s) => s.id === formData.subjectId);
        const teacher = teachers.find((t) => t.id === formData.teacherId);
        const timeSlot = timeSlots.find((ts) => ts.id === lesson.timeSlotId);

        // Log subject ID details for debugging
        console.log('=== SUBJECT ID VALIDATION ===');
        console.log('TenantSubject ID being sent (this is the assignment ID):', formData.subjectId);
        console.log('Subject found in store:', subject);
        console.log('Subject ID type:', typeof formData.subjectId);
        console.log('Subject ID length:', formData.subjectId?.length);
        console.log('Is valid UUID format:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(formData.subjectId));
        console.log('All tenantSubject IDs in store:', subjects.map(s => s.id));
        console.log('=== END SUBJECT ID VALIDATION ===');

        // Note: Subject validation is handled by:
        // 1. The dropdown which filters subjects by grade level (name/code matching)
        // 2. The backend which validates the tenantSubject.id is valid for the grade
        // We don't need to validate here since we're comparing tenantSubject.id to subject.id which won't match

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

        console.log('Creating entry with input:', {
          input,
          termId,
          selectedTerm: selectedTerm?.name,
          academicYear: selectedTerm?.academicYear?.name,
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
                console.error('=== INVALID TENANT SUBJECT ID ERROR ===');
                console.error('TenantSubject ID being sent (assignment ID):', formData.subjectId);
                console.error('Subject from store:', subject);
                console.error('Grade ID:', lesson.gradeId);
                console.error('Grade from store:', grade);
                console.error('All tenantSubject IDs in store:', subjects.map(s => ({ id: s.id, name: s.name })));
                console.error('Grade level subjects:', grade ? (() => {
                  const gradeInfo = getGradeById(grade.id);
                  if (gradeInfo) {
                    return getSubjectsByLevelId(gradeInfo.levelId).map(s => ({ id: s.id, name: s.name }));
                  }
                  return [];
                })() : []);
                console.error('=== END INVALID TENANT SUBJECT ID DEBUG ===');
                
                detailedMessage = `Invalid tenantSubject ID: ${formData.subjectId}. 
                
This is the subject assignment ID (tenantSubject.id), not the subject.id.

Possible causes:
• Subject assignment not found in the backend
• TenantSubject doesn't exist in the database
• TenantSubject ID format mismatch
• Subject assignment not active for this tenant

Please verify:
✓ The subject is assigned to this grade/level for your tenant
✓ The tenantSubject exists and is active
✓ Try selecting a different subject

Check the browser console for detailed debugging information.`;
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
                // Log the full error and input for debugging
                console.error('=== VALIDATION ERROR - Full Details ===');
                console.error('Error object:', JSON.stringify(e, null, 2));
                console.error('Input sent:', JSON.stringify(input, null, 2));
                console.error('Selected term:', selectedTerm);
                console.error('Term has academicYear:', !!selectedTerm?.academicYear);
                console.error('Academic year value:', selectedTerm?.academicYear?.name);
                console.error('=== END VALIDATION ERROR DETAILS ===');
                
                detailedMessage = `Validation failed. This could be due to:
1. Teacher already scheduled at this time slot
2. Grade already has a lesson at this time slot  
3. Teacher not assigned to teach this subject
4. Subject not assigned to this grade
5. Term ID not found or invalid
6. One of the IDs (subject, teacher, grade, timeSlot) doesn't exist

Please check:
- The selected term has a valid academic year
- The teacher is assigned to teach this subject
- The subject is available for this grade
- There are no scheduling conflicts

Check the browser console for detailed input information.`;
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
        // Update existing entry via GraphQL mutation
        if (!lesson.id) {
          toast({
            title: 'Error',
            description: 'Entry ID is missing. Cannot update entry.',
            variant: 'destructive',
          });
          setIsSaving(false);
          return;
        }

        // Validate required fields
        if (!formData.subjectId || !formData.teacherId) {
          toast({
            title: 'Error',
            description: 'Subject and Teacher are required fields.',
            variant: 'destructive',
          });
          setIsSaving(false);
          return;
        }

        const mutation = `
          mutation UpdateEntry($input: UpdateTimetableEntryInput!) {
            updateTimetableEntry(input: $input) {
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

        const input = {
          id: lesson.id,
          teacherId: formData.teacherId,
          subjectId: formData.subjectId,
          roomNumber: formData.roomNumber || null,
        };

        const variables = {
          input,
        };

        const requestBody = {
          query: mutation,
          variables,
        };

        console.log('Updating timetable entry with input:', input);
        console.log('GraphQL mutation:', mutation);
        console.log('GraphQL variables:', JSON.stringify(variables, null, 2));

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
          const errorText = await response.text();
          console.error('Failed to parse response as JSON:', errorText);
          throw new Error(`Invalid response format: ${errorText.substring(0, 200)}`);
        }

        console.log('GraphQL response:', JSON.stringify(result, null, 2));

        // Check for GraphQL errors first
        if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
          console.error('GraphQL errors:', result.errors);
          
          const errorMessages = result.errors.map((e: any) => {
            let message = e.message || 'Unknown error';
            
            // Handle validation errors with more detail
            if (e.extensions?.code === 'VALIDATION_ERROR' || e.extensions?.code === 'BADREQUESTEXCEPTION') {
              if (e.extensions.validationErrors) {
                const validationDetails = Object.entries(e.extensions.validationErrors)
                  .map(([field, errors]: [string, any]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                  .join('; ');
                message = `Validation failed: ${validationDetails}`;
              } else if (e.extensions.exception?.response?.message) {
                message = `Validation failed: ${Array.isArray(e.extensions.exception.response.message) 
                  ? e.extensions.exception.response.message.join(', ') 
                  : e.extensions.exception.response.message}`;
              }
            }
            
            if (e.path && e.path.length > 0) {
              message += ` (at ${e.path.join('.')})`;
            }
            
            return message;
          }).join('; ');
          
          throw new Error(errorMessages);
        }

        // Check HTTP status
        if (!response.ok) {
          console.error('HTTP error response:', result);
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        // Check for valid response data
        if (!result.data) {
          console.error('No data in response:', result);
          throw new Error('Invalid response format: No data field in response');
        }

        if (!result.data.updateTimetableEntry) {
          console.error('updateTimetableEntry is null or undefined. Full response:', JSON.stringify(result, null, 2));
          throw new Error(
            `Invalid response format: updateTimetableEntry is ${result.data?.updateTimetableEntry}. ` +
            `Response data: ${JSON.stringify(result.data)}`
          );
        }

        const updatedEntry = result.data.updateTimetableEntry;
        console.log('Successfully updated entry:', updatedEntry);

        // Reload entries to update the UI
        if (selectedGradeId && termId) {
          await loadEntries(termId, selectedGradeId);
        }

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
        <DrawerHeader className="bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 flex-shrink-0">
          <DrawerTitle className="text-xl font-bold text-primary">
            {isNew ? 'Add New Lesson' : 'Edit Lesson'}
          </DrawerTitle>
          {/* Timeslot and Grade Info */}
          <div className="mt-3 space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            {timeSlot && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Time Slot:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Period {timeSlot.periodNumber} • {timeSlot.time}
                </span>
              </div>
            )}
            {grade && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Grade:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {grade.displayName || grade.name}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Day:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][lesson.dayOfWeek - 1]}
              </span>
            </div>
          </div>
        </DrawerHeader>

        <div className="space-y-4 px-6 py-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-900">
          {/* Subject Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="subject" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Subject</Label>
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
              <SelectTrigger id="subject" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary h-10">
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

                  // Get subjects for this grade's level from school config (for filtering)
                  const levelSubjects = getSubjectsByLevelId(gradeInfo.levelId);
                  
                  // Create a set of level subject names for matching
                  const levelSubjectNames = new Set(
                    levelSubjects.map(s => s.name.toLowerCase().trim())
                  );
                  const levelSubjectCodes = new Set(
                    levelSubjects.map(s => s.code?.toLowerCase().trim()).filter(Boolean)
                  );

                  // Filter backend subjects to only include those that match the grade's level
                  // Use backend subject IDs (from timetable store) but filter by name/code match
                  const filteredBackendSubjects = subjects.filter((backendSubject) => {
                    const subjectName = backendSubject.name.toLowerCase().trim();
                    const subjectCode = backendSubject.code?.toLowerCase().trim();
                    
                    // Match by name or code
                    return levelSubjectNames.has(subjectName) || 
                           (subjectCode && levelSubjectCodes.has(subjectCode));
                  });

                  if (filteredBackendSubjects.length === 0) {
                    return (
                      <SelectItem value="none" disabled>
                        No subjects available for this grade
                      </SelectItem>
                    );
                  }

                  return filteredBackendSubjects.map((subject) => {
                    const subjectColor = 'color' in subject && typeof subject.color === 'string' ? subject.color : '#3B82F6';
                    return (
                      <SelectItem key={subject.id} value={subject.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: subjectColor }}
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
          <div className="space-y-1.5">
            <Label htmlFor="teacher" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Teacher
              {availableTeachers.length > 0 && busyButQualifiedTeachers.length > 0 && (
                <span className="ml-2 text-xs text-slate-500 font-normal">
                  ({availableTeachers.length} available, {busyButQualifiedTeachers.length} busy)
                </span>
              )}
            </Label>
            <Select
              value={formData.teacherId}
              onValueChange={(value) => setFormData({ ...formData, teacherId: value })}
            >
              <SelectTrigger id="teacher" className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary h-10">
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
                  <p className="text-slate-600 dark:text-slate-400">
                    {busyButQualifiedTeachers.length} qualified teacher(s) already scheduled at this timeslot
                  </p>
                ) : (
                  <p className="text-slate-600 dark:text-slate-400">
                    No teachers assigned to {grade?.name || 'this grade'}
                  </p>
                )}
              </div>
            )}

            {/* Show list of busy teachers if any */}
            {busyButQualifiedTeachers.length > 0 && availableTeachers.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-2 text-xs">
                <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Currently busy:</p>
                <ul className="text-yellow-700 dark:text-yellow-300 space-y-0.5">
                  {busyButQualifiedTeachers.map((teacher) => (
                    <li key={teacher.id}>• {teacher.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Room Number */}
          <div className="space-y-1.5">
            <Label htmlFor="room" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Room Number (Optional)</Label>
            <Input
              id="room"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              placeholder="e.g. Room 101"
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary h-10"
            />
          </div>

        </div>

        <DrawerFooter className="bg-white dark:bg-slate-900 border-t border-slate-300 dark:border-slate-600 px-6 py-4 gap-3">
          <div className="flex items-center justify-between w-full gap-3">
            {!isNew && (
              <Button variant="destructive" onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium h-10 border border-red-700 rounded">
                Delete
              </Button>
            )}
            <div className={`flex gap-3 ${!isNew ? 'flex-1 justify-end' : 'w-full'}`}>
              <Button variant="outline" onClick={onClose} disabled={isSaving} className="flex-1 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium h-10 rounded">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.subjectId || !formData.teacherId || isSaving}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium h-10 border border-primary disabled:opacity-50 rounded"
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

