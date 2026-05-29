"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTimetableStore } from "@/lib/stores/useTimetableStoreNew";
import { useSelectedTerm } from "@/lib/hooks/useSelectedTerm";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import type { EnrichedTimetableEntry } from "@/lib/types/timetable";
import { useToast } from "@/components/ui/use-toast";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { sanitizeTimetableUserMessage } from "@/lib/utils/timetable-user-messages";
import { dayNameFromNumber } from "@/lib/utils/timetable-user-messages";
import { useKnownRoomNumbers } from "../hooks/useKnownRoomNumbers";
import { pickTeacherForSubject } from "../utils/pickTeacherForSubject";
import { normalizeRoomNumber } from "../utils/normalizeRoomNumber";
import { useTimetableWeekDays } from "../hooks/useTimetableWeekDays";
import {
  getTimeSlotForDayAndPeriod,
  uniquePeriodNumbers,
} from "../utils/timetableSlots";
import {
  resolveGradeForSchoolConfig,
  resolveTenantGradeLevelIdForApi,
  subjectsForTimetableGrade,
} from "../utils/resolveGradeForSchoolConfig";

function teacherCanTeachGrade(
  teacher: { gradeLevels?: string[] },
  gradeName?: string,
): boolean {
  if (!gradeName) return true;
  if (!teacher.gradeLevels?.length) return true;
  return teacher.gradeLevels.includes(gradeName);
}

interface LessonEditDialogProps {
  lesson: (EnrichedTimetableEntry & { isNew?: boolean }) | null;
  onClose: () => void;
}

export function LessonEditDialog({ lesson, onClose }: LessonEditDialogProps) {
  const {
    subjects,
    teachers,
    entries,
    timeSlots,
    grades,
    addEntry,
    deleteEntry,
    deleteTimetableEntry,
    loadEntries,
    loadTeachers,
    loadSubjects,
    selectedGradeId,
    selectedStreamId,
    selectedTermId,
  } = useTimetableStore();
  const { selectedTerm } = useSelectedTerm();
  const { getSubjectsByLevelId, getGradeById } = useSchoolConfigStore();
  const { toast } = useToast();
  const params = useParams();
  const subdomain = params?.subdomain as string | undefined;
  const knownRooms = useKnownRoomNumbers();
  const [isSaving, setIsSaving] = useState(false);

  // Filter to only active teachers - memoized to prevent infinite loops
  const activeTeachers = useMemo(
    () => teachers.filter((teacher) => teacher.isActive !== false),
    [teachers],
  );

  const [formData, setFormData] = useState({
    subjectId: "",
    teacherId: "",
    roomNumber: "",
    isDoublePeriod: false,
  });
  const [moveDay, setMoveDay] = useState(1);
  const [movePeriod, setMovePeriod] = useState(1);

  const { dayLabels, daysPerWeek } = useTimetableWeekDays();
  const periodOptions = useMemo(
    () => uniquePeriodNumbers(timeSlots),
    [timeSlots],
  );

  const schoolConfigGetters = useMemo(
    () => ({ getGradeById, getSubjectsByLevelId }),
    [getGradeById, getSubjectsByLevelId],
  );

  useEffect(() => {
    if (!lesson) return;
    void loadSubjects(lesson.gradeId).catch(() => {});
    void loadTeachers().catch(() => {});
  }, [lesson, loadSubjects, loadTeachers]);

  useEffect(() => {
    if (lesson && !lesson.isNew) {
      const slot = timeSlots.find((ts) => ts.id === lesson.timeSlotId);
      setMoveDay(lesson.dayOfWeek);
      setMovePeriod(slot?.periodNumber ?? 1);
      setFormData({
        subjectId: lesson.subjectId,
        teacherId: lesson.teacherId,
        roomNumber: lesson.roomNumber || "",
        isDoublePeriod: !!(lesson as any).isDoublePeriod,
      });
    } else if (lesson && lesson.isNew) {
      // For new lessons, find first available teacher
      const busyTeacherIds = new Set(
        entries
          .filter(
            (entry) =>
              entry.timeSlotId === lesson.timeSlotId &&
              entry.dayOfWeek === lesson.dayOfWeek,
          )
          .map((entry) => entry.teacherId),
      );

      // Get the grade from the store
      const grade = grades.find((g) => g.id === lesson.gradeId);

      const classSubjects = subjectsForTimetableGrade(
        lesson.gradeId,
        grades,
        subjects,
        schoolConfigGetters,
      );
      const firstSubject = classSubjects[0] ?? null;

      // Find a teacher who can teach this grade (only active teachers)
      const eligibleForGrade = activeTeachers.filter((teacher) => {
        return (
          teacherCanTeachGrade(teacher, grade?.name) &&
          !busyTeacherIds.has(teacher.id)
        );
      });
      const suggestedTeacher = pickTeacherForSubject(
        firstSubject?.name,
        eligibleForGrade,
      );

      setFormData({
        subjectId: firstSubject?.id || "",
        teacherId: suggestedTeacher?.id || "",
        roomNumber: "",
        isDoublePeriod: false,
      });
    }
  }, [
    lesson,
    subjects,
    activeTeachers,
    entries,
    grades,
    grades,
    schoolConfigGetters,
  ]);

  const handleSave = async () => {
    if (!lesson) return;

    // Get termId from context or store
    const termId = selectedTerm?.id || selectedTermId;

    if (!termId) {
      toast({
        title: "Choose a term first",
        description:
          "Use the term selector in the top bar, then try saving again.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTerm?.academicYear?.name) {
      toast({
        title: "School year missing",
        description:
          "This term is not linked to a school year. Pick another term or contact support.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const normalizedRoom = normalizeRoomNumber(
      formData.roomNumber,
      knownRooms,
    );

    try {
      if (lesson.isNew) {
        // Validate all required IDs are present
        if (
          !lesson.gradeId ||
          !formData.subjectId ||
          !formData.teacherId ||
          !lesson.timeSlotId
        ) {
          toast({
            title: "Fill in all fields",
            description: "Choose a subject and teacher before saving.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }

        const tenantGradeLevelId = resolveTenantGradeLevelIdForApi(
          lesson.gradeId,
          grades,
        );
        if (!tenantGradeLevelId) {
          toast({
            title: "Class not found",
            description:
              "Could not resolve this class for saving. Try selecting the class again.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }

        // Create new entry via GraphQL - using single entry mutation
        const mutation = `
          mutation CreateSingleEntry($input: CreateTimetableEntryInput!) {
            createTimetableEntry(input: $input) {
              id
            }
          }
        `;

        // Build input object - GraphQL CreateTimetableEntryInput accepts:
        // dayTemplatePeriodId (required), subjectId, teacherId, gradeLevelId, streamId (nullable), roomName, termId
        // Note: dayTemplatePeriodId maps to our timeSlotId (loaded from day templates)
        // IMPORTANT: Do NOT include gradeId, timeSlotId, dayOfWeek - these are not part of the schema
        const input: {
          dayTemplatePeriodId: string;
          subjectId: string;
          teacherId: string;
          gradeLevelId: string;
          streamId: string | null;
          termId: string;
          roomName?: string;
        } = {
          dayTemplatePeriodId: lesson.timeSlotId,
          subjectId: formData.subjectId,
          teacherId: formData.teacherId,
          gradeLevelId: tenantGradeLevelId,
          streamId: selectedStreamId ?? null,
          termId: termId,
        };

        // Only add optional fields if they have values
        if (normalizedRoom) {
          input.roomName = normalizedRoom;
        }

        // Verify the IDs exist in the store
        const subject = subjects.find((s) => s.id === formData.subjectId);
        const teacher = activeTeachers.find((t) => t.id === formData.teacherId);
        const timeSlot = timeSlots.find((ts) => ts.id === lesson.timeSlotId);

        // Note: Subject validation is handled by:
        // 1. The dropdown which filters subjects by grade level (name/code matching)
        // 2. The backend which validates the tenantSubject.id is valid for the grade
        // We don't need to validate here since we're comparing tenantSubject.id to subject.id which won't match

        // Check if timeSlot has a valid UUID (not mock data like "slot-1")
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (timeSlot && !uuidRegex.test(timeSlot.id)) {
          console.error(
            "Time slot has invalid ID format (likely mock data):",
            timeSlot,
          );
          toast({
            title: "Please refresh the page",
            description:
              "Lesson times did not load correctly. Refresh and try again.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }

        // Validate UUID format for all IDs (uuidRegex already declared above)
        const invalidIds: string[] = [];
        if (!uuidRegex.test(input.termId))
          invalidIds.push(`termId: ${input.termId}`);
        if (!uuidRegex.test(input.subjectId))
          invalidIds.push(`subjectId: ${input.subjectId}`);
        if (!uuidRegex.test(input.teacherId))
          invalidIds.push(`teacherId: ${input.teacherId}`);
        if (!uuidRegex.test(input.dayTemplatePeriodId))
          invalidIds.push(`dayTemplatePeriodId: ${input.dayTemplatePeriodId}`);

        if (invalidIds.length > 0) {
          console.error("Invalid UUID format detected:", invalidIds);

          // Special handling for timeSlotId - likely cached mock data
          if (
            invalidIds.some(
              (id) =>
                id.includes("dayTemplatePeriodId") || id.includes("timeSlotId"),
            )
          ) {
            toast({
              title: "Please refresh the page",
              description:
                "Lesson times did not load correctly. Refresh and try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Could not save lesson",
              description:
                "Something did not load correctly. Refresh the page and try again.",
              variant: "destructive",
            });
          }
          setIsSaving(false);
          return;
        }

        // Validate IDs exist
        if (!subject) {
          console.error("Subject not found:", formData.subjectId);
          toast({
            title: "Error",
            description: `Subject ID ${formData.subjectId} not found in store`,
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
        if (!teacher) {
          console.error("Teacher not found or inactive:", formData.teacherId);
          toast({
            title: "Error",
            description: `Teacher ID ${formData.teacherId} not found or is inactive`,
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }

        if (!timeSlot) {
          console.error("TimeSlot not found:", lesson.timeSlotId);
          toast({
            title: "Error",
            description: `TimeSlot ID ${lesson.timeSlotId} not found in store`,
            variant: "destructive",
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

        const response = await fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestBody),
        });

        // Parse JSON first - GraphQL returns errors in JSON format even with non-200 status
        let result;
        try {
          result = await response.json();
        } catch (parseError) {
          // If JSON parsing fails, try to get text for debugging
          const errorText = await response.text();
          console.error("Failed to parse response as JSON:", errorText);
          throw new Error(
            `Invalid response format: ${errorText.substring(0, 200)}`,
          );
        }


        // Check for GraphQL errors first (these can occur even with 200 status)
        if (
          result.errors &&
          Array.isArray(result.errors) &&
          result.errors.length > 0
        ) {
          console.error("GraphQL errors:", result.errors);

          // Extract detailed error information
          const errorMessages = result.errors
            .map((e: any) => {
              let message = e.message || "Unknown error";

              // Handle validation errors with more detail
              if (
                e.extensions?.code === "VALIDATION_ERROR" ||
                e.extensions?.code === "BADREQUESTEXCEPTION"
              ) {
                // Log the full error structure for debugging
                console.error("=== VALIDATION ERROR DEBUG ===");
                console.error("Full error object:", JSON.stringify(e, null, 2));
                console.error(
                  "Error extensions:",
                  JSON.stringify(e.extensions, null, 2),
                );
                console.error(
                  "Input that caused the error:",
                  JSON.stringify(input, null, 2),
                );
                console.error("=== END VALIDATION ERROR DEBUG ===");

                // Try to extract more details from various possible error structures
                let detailedMessage = message;

                // Check for validationErrors object
                if (e.extensions.validationErrors) {
                  const validationDetails = Object.entries(
                    e.extensions.validationErrors,
                  )
                    .map(
                      ([field, errors]: [string, any]) =>
                        `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`,
                    )
                    .join("; ");
                  detailedMessage = `Validation failed: ${validationDetails}`;
                }
                // Check for exception object with nested details
                else if (e.extensions.exception) {
                  const exception = e.extensions.exception;
                  if (exception.response?.message) {
                    detailedMessage = `Validation failed: ${
                      Array.isArray(exception.response.message)
                        ? exception.response.message.join(", ")
                        : exception.response.message
                    }`;
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
                else if (
                  message.includes("Invalid subjectId") ||
                  message.includes("Invalid subject")
                ) {
                  console.error("=== INVALID TENANT SUBJECT ID ERROR ===");
                  console.error(
                    "TenantSubject ID being sent (assignment ID):",
                    formData.subjectId,
                  );
                  console.error("Subject from store:", subject);
                  console.error("Grade ID:", lesson.gradeId);
                  console.error("Grade from store:", grade);
                  console.error(
                    "All tenantSubject IDs in store:",
                    subjects.map((s) => ({ id: s.id, name: s.name })),
                  );
                  console.error(
                    "Grade level subjects:",
                    grade
                      ? (() => {
                          const gradeInfo = getGradeById(grade.id);
                          if (gradeInfo) {
                            return getSubjectsByLevelId(gradeInfo.levelId).map(
                              (s) => ({ id: s.id, name: s.name }),
                            );
                          }
                          return [];
                        })()
                      : [],
                  );
                  console.error("=== END INVALID TENANT SUBJECT ID DEBUG ===");

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
                } else if (
                  message.includes("Invalid teacherId") ||
                  message.includes("Invalid teacher")
                ) {
                  detailedMessage = `Invalid teacher selected. The teacher may not be assigned to teach this subject or grade.`;
                } else if (
                  message.includes("Invalid gradeId") ||
                  message.includes("Invalid grade")
                ) {
                  detailedMessage = `Invalid grade selected. Please try selecting the grade again.`;
                } else if (
                  message.includes("conflict") ||
                  message.includes("Conflict") ||
                  message.includes("already scheduled")
                ) {
                  detailedMessage = `Schedule conflict detected. The teacher or grade may already be scheduled at this time. Please choose a different time slot or teacher.`;
                } else if (
                  message.includes("not qualified") ||
                  message.includes("cannot teach")
                ) {
                  detailedMessage = `The selected teacher is not assigned to teach this subject. Please select a different teacher or subject.`;
                }

                // If we still have a generic message, provide helpful context
                if (
                  detailedMessage === message &&
                  message === "Input validation failed"
                ) {
                  // Log the full error and input for debugging
                  console.error("=== VALIDATION ERROR - Full Details ===");
                  console.error("Error object:", JSON.stringify(e, null, 2));
                  console.error("Input sent:", JSON.stringify(input, null, 2));
                  console.error("Selected term:", selectedTerm);
                  console.error(
                    "Term has academicYear:",
                    !!selectedTerm?.academicYear,
                  );
                  console.error(
                    "Academic year value:",
                    selectedTerm?.academicYear?.name,
                  );
                  console.error("=== END VALIDATION ERROR DETAILS ===");

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
                message += ` (at ${e.path.join(".")})`;
              }

              return message;
            })
            .join("; ");

          throw new Error(errorMessages);
        }

        // Check HTTP status after parsing JSON (GraphQL errors are handled above)
        if (!response.ok) {
          console.error("HTTP error response:", result);
          throw new Error(
            `Server error: ${response.status} ${response.statusText}`,
          );
        }

        // Enhanced error handling for invalid response
        if (!result.data) {
          console.error("No data in response:", result);
          throw new Error("Invalid response format: No data field in response");
        }

        // Handle single entry response
        if (!result.data || !result.data.createTimetableEntry) {
          console.error(
            "createTimetableEntry is null or undefined. Full response:",
            JSON.stringify(result, null, 2),
          );
          console.error("Response data keys:", Object.keys(result.data || {}));

          throw new Error(
            `Invalid response format: createTimetableEntry is ${result.data?.createTimetableEntry}. ` +
              `Response data: ${JSON.stringify(result.data)}`,
          );
        }

        const createdEntry = result.data.createTimetableEntry;

        toast({
          title: "Success",
          description: "Lesson created successfully",
        });

        // Close dialog - onClose will trigger full timetable reload
        onClose();
      } else {
        const targetSlot = getTimeSlotForDayAndPeriod(
          timeSlots,
          moveDay,
          movePeriod,
        );
        const isMoving =
          targetSlot &&
          (moveDay !== lesson.dayOfWeek ||
            targetSlot.id !== lesson.timeSlotId);

        if (isMoving && targetSlot) {
          const slotTaken = entries.some(
            (e) =>
              e.gradeId === lesson.gradeId &&
              e.dayOfWeek === moveDay &&
              e.timeSlotId === targetSlot.id &&
              e.id !== lesson.id,
          );
          if (slotTaken) {
            toast({
              title: "That slot is already filled",
              description: `Pick another period or day for ${dayNameFromNumber(moveDay)}.`,
              variant: "destructive",
            });
            setIsSaving(false);
            return;
          }

          const moveMutation = `
            mutation MoveEntry($input: UpdateTimetableEntryInput!) {
              updateTimetableEntry(input: $input) {
                id
              }
            }
          `;
          const moveRes = await fetch("/api/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              query: moveMutation,
              variables: {
                input: {
                  id: lesson.id,
                  dayTemplatePeriodId: targetSlot.id,
                  subjectId: formData.subjectId,
                  teacherId: formData.teacherId,
                  roomName: normalizedRoom || null,
                },
              },
            }),
          });
          const moveResult = await moveRes.json();
          if (moveResult.errors?.length) {
            throw new Error(
              moveResult.errors.map((e: { message: string }) => e.message).join(", "),
            );
          }
          if (!moveResult.data?.updateTimetableEntry?.id) {
            throw new Error("Could not move lesson to the new slot");
          }

          await loadEntries(termId, selectedGradeId ?? lesson.gradeId);

          toast({
            title: "Lesson moved",
            description: `${dayNameFromNumber(moveDay)}, period ${movePeriod}`,
          });
          onClose();
          setIsSaving(false);
          return;
        }

        if (!targetSlot && movePeriod) {
          toast({
            title: "Invalid period",
            description: "That period is not available on the selected day.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }

        // Update existing entry via GraphQL mutation
        if (!lesson.id) {
          toast({
            title: "Error",
            description: "Entry ID is missing. Cannot update entry.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }

        // Validate required fields
        if (!formData.subjectId || !formData.teacherId) {
          toast({
            title: "Error",
            description: "Subject and Teacher are required fields.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }

        const mutation = `
          mutation UpdateEntry($input: UpdateTimetableEntryInput!) {
            updateTimetableEntry(input: $input) {
              id
            }
          }
        `;

        const input = {
          id: lesson.id,
          teacherId: formData.teacherId,
          subjectId: formData.subjectId,
          roomName: normalizedRoom || null,
        };

        const variables = {
          input,
        };

        const requestBody = {
          query: mutation,
          variables,
        };


        const response = await fetch("/api/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestBody),
        });

        // Parse JSON first - GraphQL returns errors in JSON format even with non-200 status
        let result;
        try {
          result = await response.json();
        } catch (parseError) {
          const errorText = await response.text();
          console.error("Failed to parse response as JSON:", errorText);
          throw new Error(
            `Invalid response format: ${errorText.substring(0, 200)}`,
          );
        }


        // Check for GraphQL errors first
        if (
          result.errors &&
          Array.isArray(result.errors) &&
          result.errors.length > 0
        ) {
          console.error("GraphQL errors:", result.errors);

          const errorMessages = result.errors
            .map((e: any) => {
              let message = e.message || "Unknown error";

              // Handle validation errors with more detail
              if (
                e.extensions?.code === "VALIDATION_ERROR" ||
                e.extensions?.code === "BADREQUESTEXCEPTION"
              ) {
                if (e.extensions.validationErrors) {
                  const validationDetails = Object.entries(
                    e.extensions.validationErrors,
                  )
                    .map(
                      ([field, errors]: [string, any]) =>
                        `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`,
                    )
                    .join("; ");
                  message = `Validation failed: ${validationDetails}`;
                } else if (e.extensions.exception?.response?.message) {
                  message = `Validation failed: ${
                    Array.isArray(e.extensions.exception.response.message)
                      ? e.extensions.exception.response.message.join(", ")
                      : e.extensions.exception.response.message
                  }`;
                }
              }

              if (e.path && e.path.length > 0) {
                message += ` (at ${e.path.join(".")})`;
              }

              return message;
            })
            .join("; ");

          throw new Error(errorMessages);
        }

        // Check HTTP status
        if (!response.ok) {
          console.error("HTTP error response:", result);
          throw new Error(
            `Server error: ${response.status} ${response.statusText}`,
          );
        }

        // Check for valid response data
        if (!result.data) {
          console.error("No data in response:", result);
          throw new Error("Invalid response format: No data field in response");
        }

        if (!result.data.updateTimetableEntry) {
          console.error(
            "updateTimetableEntry is null or undefined. Full response:",
            JSON.stringify(result, null, 2),
          );
          throw new Error(
            `Invalid response format: updateTimetableEntry is ${result.data?.updateTimetableEntry}. ` +
              `Response data: ${JSON.stringify(result.data)}`,
          );
        }

        const updatedEntry = result.data.updateTimetableEntry;

        toast({
          title: "Success",
          description: "Lesson updated successfully",
        });

        // Close dialog - onClose will trigger full timetable reload
        onClose();
      }
    } catch (error) {
      console.error("Error saving lesson:", error);
      toast({
        title: "Could not save lesson",
        description: sanitizeTimetableUserMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!lesson || lesson.isNew) return;

    if (!confirm("Are you sure you want to delete this lesson?")) {
      return;
    }

    const termId = selectedTerm?.id || selectedTermId;

    setIsSaving(true);

    try {
      await deleteTimetableEntry(lesson.id);
      if (termId) {
        await loadEntries(termId, selectedGradeId ?? lesson.gradeId);
      }

      toast({
        title: "Lesson removed",
        description: "The slot is empty again.",
      });

      onClose();
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast({
        title: "Could not remove lesson",
        description: sanitizeTimetableUserMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!lesson) return null;

  const isNew = lesson.isNew;
  const selectedSubject = subjects.find((s) => s.id === formData.subjectId);
  const selectedTeacher = activeTeachers.find(
    (t) => t.id === formData.teacherId,
  );

  // Get timeslot and grade information
  const timeSlot = timeSlots.find((ts) => ts.id === lesson.timeSlotId);
  const grade = grades.find((g) => g.id === lesson.gradeId);
  const slotTitle = timeSlot
    ? `${dayNameFromNumber(lesson.dayOfWeek)} · P${timeSlot.periodNumber}`
    : dayNameFromNumber(lesson.dayOfWeek);
  const sectionName =
    lesson.gradeId && selectedStreamId
      ? (grades
          .find((gr) => gr.id === lesson.gradeId)
          ?.streams?.find((s) => s.tenantStreamId === selectedStreamId)?.name ??
        null)
      : null;

  // Find teachers already scheduled at this timeslot
  const busyTeacherIds = new Set(
    entries
      .filter((entry) => {
        // Same timeslot and day
        const sameSlot =
          entry.timeSlotId === lesson.timeSlotId &&
          entry.dayOfWeek === lesson.dayOfWeek;
        // Exclude current lesson if editing (not new)
        const isCurrentLesson = !isNew && entry.id === lesson.id;
        return sameSlot && !isCurrentLesson;
      })
      .map((entry) => entry.teacherId),
  );

  // Filter teachers who:
  // 1. Can teach the selected grade (or show all if no grade selected)
  // 2. Are NOT already scheduled at this timeslot
  const availableTeachers = activeTeachers.filter((teacher) => {
    const isAvailable = !busyTeacherIds.has(teacher.id);
    return teacherCanTeachGrade(teacher, grade?.name) && isAvailable;
  });

  // Separate list: teachers who can teach this grade but are busy (for display purposes)
  const busyButQualifiedTeachers = activeTeachers.filter((teacher) => {
    const isBusy = busyTeacherIds.has(teacher.id);
    return teacherCanTeachGrade(teacher, grade?.name) && isBusy;
  });

  const gradeQualifiedTeachers = activeTeachers.filter((teacher) =>
    teacherCanTeachGrade(teacher, grade?.name),
  );

  const gradeInfo = lesson.gradeId
    ? resolveGradeForSchoolConfig(lesson.gradeId, grades, schoolConfigGetters)
    : null;
  const subjectsForClass = subjectsForTimetableGrade(
    lesson.gradeId,
    grades,
    subjects,
    schoolConfigGetters,
  );

  return (
    <Drawer open={!!lesson} onOpenChange={onClose} direction="right">
      <DrawerContent className="max-w-md flex flex-col h-full">
        <DrawerHeader className="shrink-0 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <DrawerTitle className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {isNew ? "Add lesson" : "Edit lesson"} · {slotTitle}
          </DrawerTitle>
          <DrawerDescription className="text-[13px] text-zinc-500">
            {isNew
              ? "Choose subject, teacher, and room for this slot."
              : "Update details or move to another day or period."}
          </DrawerDescription>
          <div className="mt-3 space-y-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            {timeSlot && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Lesson time:
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  Period {timeSlot.periodNumber} · {timeSlot.time}
                </span>
              </div>
            )}
            {grade && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Class:
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {grade.displayName || grade.name}
                  {sectionName ? ` — ${sectionName}` : ""}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Day:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {dayNameFromNumber(lesson.dayOfWeek)}
              </span>
            </div>
          </div>
        </DrawerHeader>

        <div className="space-y-4 px-6 py-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-900">
          {!isNew && periodOptions.length > 0 && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Move to another slot
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Change day or period, then save.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Day</Label>
                  <Select
                    value={String(moveDay)}
                    onValueChange={(v) => setMoveDay(Number(v))}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dayLabels.slice(0, daysPerWeek).map((label, i) => (
                        <SelectItem key={label} value={String(i + 1)}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Period</Label>
                  <Select
                    value={String(movePeriod)}
                    onValueChange={(v) => setMovePeriod(Number(v))}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {periodOptions.map((p) => {
                        const slot = getTimeSlotForDayAndPeriod(
                          timeSlots,
                          moveDay,
                          p,
                        );
                        return (
                          <SelectItem key={p} value={String(p)}>
                            Period {p}
                            {slot?.time ? ` · ${slot.time}` : ""}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Subject Selection */}
          <div className="space-y-1.5">
            <Label
              htmlFor="subject"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Subject
            </Label>
            <Select
              value={formData.subjectId}
              onValueChange={(value) => {
                const newSubject = subjects.find((s) => s.id === value);
                const currentTeacher = activeTeachers.find(
                  (t) => t.id === formData.teacherId,
                );

                // Check if current teacher can teach this subject and is available
                const busyTeacherIds = new Set(
                  entries
                    .filter((entry) => {
                      const sameSlot =
                        entry.timeSlotId === lesson.timeSlotId &&
                        entry.dayOfWeek === lesson.dayOfWeek;
                      const isCurrentLesson =
                        !lesson.isNew && entry.id === lesson.id;
                      return sameSlot && !isCurrentLesson;
                    })
                    .map((entry) => entry.teacherId),
                );

                const currentTeacherValid =
                  currentTeacher &&
                  teacherCanTeachGrade(currentTeacher, grade?.name) &&
                  !busyTeacherIds.has(currentTeacher.id);

                const eligibleForGrade = activeTeachers.filter((t) => {
                  return (
                    teacherCanTeachGrade(t, grade?.name) &&
                    !busyTeacherIds.has(t.id)
                  );
                });

                if (!currentTeacherValid) {
                  const suggested = pickTeacherForSubject(
                    newSubject?.name,
                    eligibleForGrade,
                  );
                  setFormData({
                    ...formData,
                    subjectId: value,
                    teacherId: suggested?.id || "",
                  });
                } else if (
                  newSubject &&
                  currentTeacher &&
                  !(currentTeacher.subjects ?? []).some(
                    (s) =>
                      s.toLowerCase().trim() ===
                      newSubject.name.toLowerCase().trim(),
                  )
                ) {
                  const suggested = pickTeacherForSubject(
                    newSubject.name,
                    eligibleForGrade,
                  );
                  setFormData({
                    ...formData,
                    subjectId: value,
                    teacherId: suggested?.id ?? formData.teacherId,
                  });
                } else {
                  setFormData({ ...formData, subjectId: value });
                }
              }}
            >
              <SelectTrigger
                id="subject"
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary h-10"
              >
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjectsForClass.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No subjects available
                  </SelectItem>
                ) : (
                  subjectsForClass.map((subject) => {
                    const subjectColor =
                      "color" in subject && typeof subject.color === "string"
                        ? subject.color
                        : "#3B82F6";
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
                  })
                )}
              </SelectContent>
            </Select>
            {subjectsForClass.length === 0 && gradeInfo && (
              <p className="text-xs text-slate-500 mt-1.5">
                No subjects are linked to this class yet.{" "}
                {subdomain ? (
                  <Link
                    href={`/school/${subdomain}/classes`}
                    className="text-primary font-medium underline underline-offset-2"
                  >
                    Set up subjects in Classes
                  </Link>
                ) : (
                  <span>Set up subjects in Classes first.</span>
                )}
              </p>
            )}
          </div>

          {/* Teacher Selection */}
          <div className="space-y-1.5">
            <Label
              htmlFor="teacher"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Teacher
              {availableTeachers.length > 0 &&
                busyButQualifiedTeachers.length > 0 && (
                  <span className="ml-2 text-xs text-slate-500 font-normal">
                    ({availableTeachers.length} available,{" "}
                    {busyButQualifiedTeachers.length} busy)
                  </span>
                )}
            </Label>
            {grade && gradeQualifiedTeachers.length > 0 && (
              <p className="text-xs text-slate-500">
                {availableTeachers.length} of {gradeQualifiedTeachers.length}{" "}
                teacher
                {gradeQualifiedTeachers.length !== 1 ? "s" : ""} for{" "}
                {grade.displayName || grade.name} free at this time
              </p>
            )}
            <Select
              value={formData.teacherId}
              onValueChange={(value) =>
                setFormData({ ...formData, teacherId: value })
              }
            >
              <SelectTrigger
                id="teacher"
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary h-10"
              >
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
                    {busyButQualifiedTeachers.length} qualified teacher(s)
                    already scheduled at this timeslot
                  </p>
                ) : (
                  <p className="text-slate-600 dark:text-slate-400">
                    No teachers assigned to {grade?.name || "this grade"}
                  </p>
                )}
              </div>
            )}

            {/* Show list of busy teachers if any */}
            {busyButQualifiedTeachers.length > 0 &&
              availableTeachers.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-2 text-xs">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Currently busy:
                  </p>
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
            <Label
              htmlFor="room"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Room (optional)
            </Label>
            <Input
              id="room"
              list="lesson-known-rooms"
              value={formData.roomNumber}
              onChange={(e) =>
                setFormData({ ...formData, roomNumber: e.target.value })
              }
              placeholder="e.g. Room 101"
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary h-10"
            />
            <datalist id="lesson-known-rooms">
              {knownRooms.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
            {knownRooms.length > 0 && (
              <p className="text-[11px] text-slate-500">
                Suggestions from rooms already used on this timetable.
              </p>
            )}
          </div>

          {/* Double Period Toggle */}
          {isNew && (
            <div className="flex items-center gap-3 p-3 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="doublePeriod"
                  checked={formData.isDoublePeriod}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isDoublePeriod: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <Label
                  htmlFor="doublePeriod"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Two periods in a row
                </Label>
              </div>
              <p className="text-xs text-slate-500">
                This lesson uses this period and the next one
              </p>
            </div>
          )}
        </div>

        <DrawerFooter className="bg-white dark:bg-slate-900 border-t border-slate-300 dark:border-slate-600 px-6 py-4 gap-3">
          <div className="flex items-center justify-between w-full gap-3">
            {!isNew && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium h-10 border border-red-700 rounded"
              >
                Delete
              </Button>
            )}
            <div
              className={`flex gap-3 ${!isNew ? "flex-1 justify-end" : "w-full"}`}
            >
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium h-10 rounded"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  !formData.subjectId || !formData.teacherId || isSaving
                }
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium h-10 border border-primary disabled:opacity-50 rounded"
              >
                {isSaving ? "Saving..." : isNew ? "Add Lesson" : "Save Changes"}
              </Button>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
