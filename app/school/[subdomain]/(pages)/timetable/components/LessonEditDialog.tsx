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
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { normalizeRoomNumber } from "../utils/normalizeRoomNumber";
import { useTimetableWeekDays } from "../hooks/useTimetableWeekDays";
import {
  getTimeSlotForDayAndPeriod,
  uniquePeriodNumbers,
} from "../utils/timetableSlots";
import {
  resolveGradeForSchoolConfig,
  resolveTenantGradeLevelIdForApi,
  resolveTenantStreamIdForApi,
  subjectsForTimetableGrade,
} from "../utils/resolveGradeForSchoolConfig";
import { subjectsForSelectedTeacher } from "../utils/subjectsForSelectedTeacher";
import {
  getBusyTeacherIds,
  getOccupiedPeriodNumbers,
  validateScheduleConflict,
} from "../utils/computeTimetableConflicts";
import { cn } from "@/lib/utils";
import { tt } from "../utils/timetableTheme";
import { BookOpen, Clock, X, AlertCircle } from "lucide-react";
import type { ReactNode } from "react";
import { TeacherSelect, SubjectSelect, lessonSelectTriggerClass } from "./TimetableLessonSelects";

function lessonTargetPeriods(
  periodNumber: number | undefined,
  isDoublePeriod: boolean,
): number[] {
  if (!periodNumber) return [];
  const periods = [periodNumber];
  if (isDoublePeriod) periods.push(periodNumber + 1);
  return periods;
}

function teacherCanTeachGrade(
  teacher: { gradeLevels?: string[] },
  gradeName?: string,
): boolean {
  if (!gradeName) return true;
  if (!teacher.gradeLevels?.length) return true;
  return teacher.gradeLevels.includes(gradeName);
}

function FormSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div>
        <h3 className={tt.label}>{title}</h3>
        {hint ? <p className={cn(tt.caption, "mt-0.5")}>{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

interface LessonEditDialogProps {
  lesson: (EnrichedTimetableEntry & { isNew?: boolean }) | null;
  onClose: () => void;
}

function useIsLgDown() {
  const [isLgDown, setIsLgDown] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsLgDown(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isLgDown;
}

export function LessonEditDialog({ lesson, onClose }: LessonEditDialogProps) {
  const {
    subjects,
    teachers,
    entries,
    timeSlots,
    grades,
    addEntry,
    upsertEntry,
    updateEntry,
    deleteEntry,
    deleteTimetableEntry,
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
  const isLgDown = useIsLgDown();
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
      const clickedSlot = timeSlots.find((ts) => ts.id === lesson.timeSlotId);
      const targetPeriods = lessonTargetPeriods(
        clickedSlot?.periodNumber,
        false,
      );
      const busyTeacherIds = getBusyTeacherIds(
        lesson.dayOfWeek,
        targetPeriods,
        entries,
        timeSlots,
      );

      const grade = grades.find((g) => g.id === lesson.gradeId);

      const classSubjects = subjectsForTimetableGrade(
        lesson.gradeId,
        grades,
        subjects,
        schoolConfigGetters,
      );

      const eligibleForGrade = activeTeachers.filter((teacher) => {
        return (
          teacherCanTeachGrade(teacher, grade?.name) &&
          !busyTeacherIds.has(teacher.id)
        );
      });

      const firstTeacher = eligibleForGrade[0];
      const firstTeacherSubjects = firstTeacher
        ? subjectsForSelectedTeacher(firstTeacher, classSubjects)
        : [];

      setFormData({
        subjectId: firstTeacherSubjects[0]?.id ?? "",
        teacherId: firstTeacher?.id ?? "",
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
    schoolConfigGetters,
    timeSlots,
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
      const tenantStreamId = resolveTenantStreamIdForApi(
        selectedStreamId,
        lesson.gradeId ?? selectedGradeId,
        grades,
      );

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

        const clickedSlot = timeSlots.find((ts) => ts.id === lesson.timeSlotId);
        if (!clickedSlot) {
          toast({
            title: "This period is not set up for this class",
            description:
              "The timetable structure for this grade may be missing. Open “Set up schedule” and include this class, or pick a different class.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }

        if (
          clickedSlot.dayOfWeek != null &&
          clickedSlot.dayOfWeek !== lesson.dayOfWeek
        ) {
          toast({
            title: "Wrong day for this period",
            description: "Please close and click Add again on the correct day.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }

        const dayTemplatePeriodId = clickedSlot.id;
        const timeSlot = clickedSlot;

        if (formData.isDoublePeriod) {
          const nextPeriodNumber = clickedSlot.periodNumber + 1;
          const nextSlot = getTimeSlotForDayAndPeriod(
            timeSlots,
            lesson.dayOfWeek,
            nextPeriodNumber,
          );
          if (!nextSlot) {
            toast({
              title: "No next period",
              description:
                "This lesson needs the following period free for a double lesson.",
              variant: "destructive",
            });
            setIsSaving(false);
            return;
          }
          const nextTaken = entries.some(
            (e) =>
              e.dayOfWeek === lesson.dayOfWeek &&
              getOccupiedPeriodNumbers(e, timeSlots).includes(nextPeriodNumber),
          );
          if (nextTaken) {
            toast({
              title: "Next period is taken",
              description: "Clear the following period before adding a double lesson.",
              variant: "destructive",
            });
            setIsSaving(false);
            return;
          }
        }

        const createConflict = validateScheduleConflict({
          teacherId: formData.teacherId,
          roomNumber: normalizedRoom,
          dayOfWeek: lesson.dayOfWeek,
          targetPeriods: lessonTargetPeriods(
            clickedSlot.periodNumber,
            formData.isDoublePeriod ?? false,
          ),
          entries,
          timeSlots,
        });
        if (!createConflict.ok) {
          toast({
            title: createConflict.title,
            description: createConflict.description,
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }

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
          isDoublePeriod?: boolean;
        } = {
          dayTemplatePeriodId,
          subjectId: formData.subjectId,
          teacherId: formData.teacherId,
          gradeLevelId: tenantGradeLevelId,
          streamId: tenantStreamId,
          termId: termId,
          isDoublePeriod: formData.isDoublePeriod ?? false,
        };

        // Only add optional fields if they have values
        if (normalizedRoom) {
          input.roomName = normalizedRoom;
        }

        const subject = subjects.find((s) => s.id === formData.subjectId);
        const teacher = activeTeachers.find((t) => t.id === formData.teacherId);

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

        upsertEntry({
          id: createdEntry.id,
          gradeId: lesson.gradeId,
          streamId: tenantStreamId,
          subjectId: formData.subjectId,
          teacherId: formData.teacherId,
          timeSlotId: dayTemplatePeriodId,
          periodNumber: clickedSlot.periodNumber,
          dayOfWeek: lesson.dayOfWeek,
          roomNumber: normalizedRoom || undefined,
          isDoublePeriod: formData.isDoublePeriod ?? false,
        });

        toast({
          title: "Success",
          description: "Lesson created successfully",
        });

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

          const moveConflict = validateScheduleConflict({
            teacherId: formData.teacherId,
            roomNumber: normalizedRoom,
            dayOfWeek: moveDay,
            targetPeriods: lessonTargetPeriods(
              targetSlot.periodNumber,
              formData.isDoublePeriod ?? false,
            ),
            entries,
            timeSlots,
            excludeEntryId: lesson.id,
          });
          if (!moveConflict.ok) {
            toast({
              title: moveConflict.title,
              description: moveConflict.description,
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
                  isDoublePeriod: formData.isDoublePeriod ?? false,
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

          upsertEntry({
            id: lesson.id,
            gradeId: lesson.gradeId,
            streamId: tenantStreamId,
            subjectId: formData.subjectId,
            teacherId: formData.teacherId,
            timeSlotId: targetSlot.id,
            periodNumber: targetSlot.periodNumber,
            dayOfWeek: moveDay,
            roomNumber: normalizedRoom || undefined,
            isDoublePeriod: formData.isDoublePeriod ?? false,
          });

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

        if (formData.isDoublePeriod) {
          const currentPeriod =
            timeSlots.find((ts) => ts.id === lesson.timeSlotId)?.periodNumber ??
            lesson.timeSlot?.periodNumber ??
            movePeriod;
          const day = isMoving ? moveDay : lesson.dayOfWeek;
          const nextSlot = getTimeSlotForDayAndPeriod(
            timeSlots,
            day,
            currentPeriod + 1,
          );
          if (!nextSlot) {
            toast({
              title: "No next period",
              description:
                "This lesson needs the following period free for a double lesson.",
              variant: "destructive",
            });
            setIsSaving(false);
            return;
          }
          const nextTaken = entries.some(
            (e) =>
              e.id !== lesson.id &&
              e.dayOfWeek === day &&
              getOccupiedPeriodNumbers(e, timeSlots).includes(
                currentPeriod + 1,
              ),
          );
          if (nextTaken) {
            toast({
              title: "Next period is taken",
              description: "Clear the following period before using a double lesson.",
              variant: "destructive",
            });
            setIsSaving(false);
            return;
          }
        }

        const editDay = isMoving ? moveDay : lesson.dayOfWeek;
        const editSlot =
          targetSlot ??
          timeSlots.find((ts) => ts.id === lesson.timeSlotId) ??
          lesson.timeSlot;
        const editConflict = validateScheduleConflict({
          teacherId: formData.teacherId,
          roomNumber: normalizedRoom,
          dayOfWeek: editDay,
          targetPeriods: lessonTargetPeriods(
            editSlot?.periodNumber,
            formData.isDoublePeriod ?? false,
          ),
          entries,
          timeSlots,
          excludeEntryId: lesson.id,
        });
        if (!editConflict.ok) {
          toast({
            title: editConflict.title,
            description: editConflict.description,
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
          isDoublePeriod: formData.isDoublePeriod ?? false,
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

        updateEntry(lesson.id, {
          subjectId: formData.subjectId,
          teacherId: formData.teacherId,
          roomNumber: normalizedRoom || undefined,
          isDoublePeriod: formData.isDoublePeriod ?? false,
        });

        toast({
          title: "Success",
          description: "Lesson updated successfully",
        });

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

    setIsSaving(true);

    try {
      await deleteTimetableEntry(lesson.id);

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

  const effectiveScheduling = useMemo(() => {
    if (!lesson) {
      return { day: 1, periods: [] as number[] };
    }
    const isEditingMove = !lesson.isNew && moveDay > 0 && movePeriod > 0;
    const day = isEditingMove ? moveDay : lesson.dayOfWeek;
    let periodNumber: number | undefined;
    if (isEditingMove) {
      const moveSlot = getTimeSlotForDayAndPeriod(
        timeSlots,
        moveDay,
        movePeriod,
      );
      periodNumber = moveSlot?.periodNumber ?? movePeriod;
    } else {
      const slot = timeSlots.find((ts) => ts.id === lesson.timeSlotId);
      periodNumber =
        slot?.periodNumber ??
        (lesson as EnrichedTimetableEntry).timeSlot?.periodNumber;
    }
    return {
      day,
      periods: lessonTargetPeriods(periodNumber, formData.isDoublePeriod),
    };
  }, [
    lesson,
    moveDay,
    movePeriod,
    timeSlots,
    formData.isDoublePeriod,
  ]);

  const busyTeacherIds = useMemo(() => {
    if (!lesson || effectiveScheduling.periods.length === 0) {
      return new Set<string>();
    }
    return getBusyTeacherIds(
      effectiveScheduling.day,
      effectiveScheduling.periods,
      entries,
      timeSlots,
      !lesson.isNew ? lesson.id : undefined,
    );
  }, [lesson, effectiveScheduling, entries, timeSlots]);

  const scheduleConflict = useMemo(() => {
    if (
      !lesson ||
      !formData.teacherId ||
      effectiveScheduling.periods.length === 0
    ) {
      return null;
    }
    const result = validateScheduleConflict({
      teacherId: formData.teacherId,
      roomNumber: formData.roomNumber,
      dayOfWeek: effectiveScheduling.day,
      targetPeriods: effectiveScheduling.periods,
      entries,
      timeSlots,
      excludeEntryId: !lesson.isNew ? lesson.id : undefined,
    });
    return result.ok ? null : result;
  }, [
    lesson,
    formData.teacherId,
    formData.roomNumber,
    effectiveScheduling,
    entries,
    timeSlots,
  ]);

  useEffect(() => {
    if (!lesson || !formData.teacherId) return;
    if (!busyTeacherIds.has(formData.teacherId)) return;

    const grade = grades.find((g) => g.id === lesson.gradeId);
    const classSubjects = subjectsForTimetableGrade(
      lesson.gradeId,
      grades,
      subjects,
      schoolConfigGetters,
    );
    const replacement = activeTeachers.find(
      (teacher) =>
        teacherCanTeachGrade(teacher, grade?.name) &&
        !busyTeacherIds.has(teacher.id),
    );
    const replacementSubjects = subjectsForSelectedTeacher(
      replacement,
      classSubjects,
    );
    setFormData((prev) => ({
      ...prev,
      teacherId: replacement?.id ?? "",
      subjectId: replacementSubjects.some((s) => s.id === prev.subjectId)
        ? prev.subjectId
        : (replacementSubjects[0]?.id ?? ""),
    }));
  }, [
    lesson,
    formData.teacherId,
    busyTeacherIds,
    activeTeachers,
    grades,
    subjects,
    schoolConfigGetters,
  ]);

  if (!lesson) return null;

  const isNew = lesson.isNew;
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

  const availableSubjectsForTeacher = subjectsForSelectedTeacher(
    selectedTeacher,
    subjectsForClass,
    !isNew ? { includeSubjectId: formData.subjectId } : undefined,
  );

  const handleTeacherChange = (teacherId: string) => {
    const teacher = activeTeachers.find((t) => t.id === teacherId);
    const teacherSubjects = subjectsForSelectedTeacher(teacher, subjectsForClass);
    const keepCurrentSubject = teacherSubjects.some(
      (s) => s.id === formData.subjectId,
    );
    setFormData({
      ...formData,
      teacherId,
      subjectId: keepCurrentSubject
        ? formData.subjectId
        : (teacherSubjects[0]?.id ?? ""),
    });
  };

  return (
    <Drawer
      open={!!lesson}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      direction={isLgDown ? "bottom" : "right"}
    >
      <DrawerContent
        className={cn(
          "flex flex-col bg-white dark:bg-slate-950",
          isLgDown
            ? "max-h-[min(92dvh,720px)] rounded-t-[1.25rem] border-t border-slate-100 dark:border-slate-800"
            : "ml-auto h-[100dvh] max-h-[100dvh] w-full max-w-md",
        )}
        data-vaul-drawer-direction={isLgDown ? "bottom" : "right"}
      >
        <DrawerHeader
          className={cn(
            "shrink-0 space-y-0 border-b border-slate-100 dark:border-slate-800",
            isLgDown ? "px-5 py-4" : "px-4 py-3",
          )}
        >
          <div className="flex items-start gap-2">
            {!isLgDown ? (
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            ) : null}
            <div className="min-w-0 flex-1">
              <DrawerTitle
                className={cn(
                  "font-semibold text-slate-900 dark:text-slate-100",
                  isLgDown ? "text-[15px] tracking-tight" : "text-sm",
                )}
              >
                {isNew ? "Add lesson" : "Edit lesson"}
              </DrawerTitle>
              <p
                className={cn(
                  "text-slate-500",
                  isLgDown ? "mt-1 text-xs" : "mt-0.5 text-[11px]",
                )}
              >
                {slotTitle}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "shrink-0 text-slate-400",
                isLgDown ? "h-10 w-10 rounded-full" : "h-7 w-7",
              )}
              onClick={onClose}
              aria-label="Close"
            >
              <X className={isLgDown ? "h-4 w-4" : "h-3.5 w-3.5"} />
            </Button>
          </div>
          <div
            className={cn(
              "flex flex-wrap gap-1.5",
              isLgDown ? "mt-3 gap-2" : "mt-2.5",
            )}
          >
            <span
              className={cn(
                "inline-flex items-center gap-1 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                isLgDown
                  ? "rounded-full bg-slate-100 px-3 py-1 text-xs"
                  : "rounded-md bg-slate-100 px-2 py-0.5 text-[11px]",
              )}
            >
              <Clock className="h-3 w-3 text-slate-400" />
              {dayNameFromNumber(lesson.dayOfWeek)}
              {timeSlot
                ? ` · P${timeSlot.periodNumber}${timeSlot.time ? ` · ${timeSlot.time}` : ""}`
                : ""}
            </span>
            {grade ? (
              <span
                className={cn(
                  "font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                  isLgDown
                    ? "rounded-full bg-slate-100 px-3 py-1 text-xs"
                    : "rounded-md bg-slate-100 px-2 py-0.5 text-[11px]",
                )}
              >
                {grade.displayName || grade.name}
                {sectionName ? ` · ${sectionName}` : ""}
              </span>
            ) : null}
          </div>
        </DrawerHeader>

        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto",
            isLgDown ? "space-y-5 px-5 py-5" : "space-y-4 px-4 py-4",
          )}
        >
          {scheduleConflict ? (
            <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-900/50 dark:bg-red-950/40">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
              <div className="min-w-0 text-xs text-red-800 dark:text-red-200">
                <p className="font-semibold">{scheduleConflict.title}</p>
                <p className="mt-0.5 text-red-700/90 dark:text-red-300/90">
                  {scheduleConflict.description}
                </p>
              </div>
            </div>
          ) : null}

          {!isNew && periodOptions.length > 0 ? (
            <div className={cn(tt.panelMuted, "space-y-3 p-3")}>
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Move slot
                </p>
                <p className={cn(tt.caption, "mt-0.5")}>
                  Change day or period, then save.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className={tt.label}>Day</Label>
                  <Select
                    value={String(moveDay)}
                    onValueChange={(v) => setMoveDay(Number(v))}
                  >
                    <SelectTrigger className={lessonSelectTriggerClass}>
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
                  <Label className={tt.label}>Period</Label>
                  <Select
                    value={String(movePeriod)}
                    onValueChange={(v) => setMovePeriod(Number(v))}
                  >
                    <SelectTrigger className={lessonSelectTriggerClass}>
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
                            P{p}
                            {slot?.time ? ` · ${slot.time}` : ""}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : null}

          <FormSection
            title="Teacher"
            hint={
              grade && gradeQualifiedTeachers.length > 0
                ? `${availableTeachers.length} of ${gradeQualifiedTeachers.length} free for ${grade.displayName || grade.name}`
                : undefined
            }
          >
            <TeacherSelect
              id="teacher"
              value={
                availableTeachers.some((t) => t.id === formData.teacherId)
                  ? formData.teacherId
                  : undefined
              }
              onValueChange={handleTeacherChange}
              teachers={availableTeachers}
              emptyLabel="No teachers available"
            />

            {availableTeachers.length === 0 ? (
              <p className="text-[11px] text-red-600 dark:text-red-400">
                {busyButQualifiedTeachers.length > 0
                  ? `${busyButQualifiedTeachers.length} qualified teacher(s) already booked this period.`
                  : `No teachers assigned to ${grade?.name || "this grade"}.`}
              </p>
            ) : null}

            {busyButQualifiedTeachers.length > 0 &&
            availableTeachers.length > 0 ? (
              <div className="rounded-md border border-amber-200/80 bg-amber-50/80 px-2.5 py-2 dark:border-amber-900/40 dark:bg-amber-950/30">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                  Already booked
                </p>
                <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-200/90">
                  {busyButQualifiedTeachers.map((t) => t.name).join(", ")}
                </p>
              </div>
            ) : null}
          </FormSection>

          <FormSection title="Subject">
            {!formData.teacherId ? (
              <p className="rounded-lg border border-dashed border-slate-200 px-3 py-2.5 text-[11px] text-slate-500 dark:border-slate-700">
                Select a teacher to see their subjects.
              </p>
            ) : (
              <SubjectSelect
                id="subject"
                value={formData.subjectId || undefined}
                onValueChange={(value) =>
                  setFormData({ ...formData, subjectId: value })
                }
                subjects={availableSubjectsForTeacher}
                disabled={availableSubjectsForTeacher.length === 0}
                emptyLabel="No subjects for this teacher"
              />
            )}
            {formData.teacherId &&
            availableSubjectsForTeacher.length === 0 &&
            selectedTeacher ? (
              <p className="text-[11px] text-slate-500">
                {selectedTeacher.name} has no subjects for this class.{" "}
                {subdomain ? (
                  <Link
                    href={`/school/${subdomain}/teachers`}
                    className="font-medium text-slate-700 underline underline-offset-2 dark:text-slate-300"
                  >
                    Assign in Teachers
                  </Link>
                ) : (
                  <span>Assign subjects on the Teachers page.</span>
                )}
              </p>
            ) : null}
            {subjectsForClass.length === 0 && gradeInfo ? (
              <p className="text-[11px] text-slate-500">
                No subjects linked to this class.{" "}
                {subdomain ? (
                  <Link
                    href={`/school/${subdomain}/classes`}
                    className="font-medium text-slate-700 underline underline-offset-2 dark:text-slate-300"
                  >
                    Set up in Classes
                  </Link>
                ) : (
                  <span>Set up subjects in Classes first.</span>
                )}
              </p>
            ) : null}
          </FormSection>

          <FormSection title="Room" hint="Optional">
            <Input
              id="room"
              list="lesson-known-rooms"
              value={formData.roomNumber}
              onChange={(e) =>
                setFormData({ ...formData, roomNumber: e.target.value })
              }
              placeholder="e.g. Room 101"
              className={lessonSelectTriggerClass}
            />
            <datalist id="lesson-known-rooms">
              {knownRooms.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </FormSection>

          <label
            className={cn(
              "flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 transition-colors",
              formData.isDoublePeriod
                ? "border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-900/60"
                : "border-slate-200 hover:border-slate-300 dark:border-slate-700",
            )}
          >
            <Checkbox
              id="doublePeriod"
              checked={formData.isDoublePeriod}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  isDoublePeriod: checked === true,
                })
              }
              className="mt-0.5"
            />
            <div className="min-w-0">
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                Two periods in a row
              </span>
              <p className={cn(tt.caption, "mt-0.5")}>
                Uses this period and the next on the same day.
              </p>
            </div>
          </label>
        </div>

        <DrawerFooter
          className={cn(
            "shrink-0 border-t border-slate-100 dark:border-slate-800",
            isLgDown
              ? "px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
              : "px-4 py-3",
          )}
        >
          <div className={cn("flex w-full gap-2", isLgDown && "gap-3")}>
            {!isNew ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className={cn(
                  "h-9 shrink-0 px-3 text-xs",
                  isLgDown && "h-11 text-sm",
                )}
              >
                Delete
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
              className={cn("h-9 flex-1 text-xs", isLgDown && "h-11 text-sm")}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={
                !formData.subjectId ||
                !formData.teacherId ||
                isSaving ||
                !!scheduleConflict
              }
              className={cn(
                "h-9 flex-1 bg-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
                isLgDown && "h-11 text-sm",
              )}
            >
              {isSaving ? "Saving…" : isNew ? "Add lesson" : "Save"}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
