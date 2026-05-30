"use client";

import React from "react";
import type { UseFormReturn } from "react-hook-form";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FieldHint,
  RequiredMark,
  fieldInputClass,
  fieldSelectClass,
  EmptyDataNotice,
  FormWizardStepper,
  TeachingPanelNav,
  WizardStepHeader,
  type TeachingPanel,
} from "./teacher-registration-ui";

type Grade = {
  id: string;
  name: string;
  levelName: string;
  levelId: string;
  streams: Array<{ id: string; name: string }>;
};

type Subject = {
  id: string;
  name: string;
  curriculum: string;
};

type StreamOption = {
  id: string;
  name: string;
  gradeName: string;
  gradeId: string;
};

type LevelGroup = {
  levelId: string;
  levelName: string;
  grades: Array<{ id: string; name: string; streams: Array<{ id: string; name: string }> }>;
};

export const TEACHER_WIZARD_STEPS = [
  { id: "basics", label: "Basics" },
  { id: "work", label: "Work" },
  { id: "classes", label: "Classes" },
] as const;

export const WIZARD_STEP_FIELDS = {
  0: ["firstName", "lastName", "gender", "dateOfBirth", "phoneNumber", "email"],
  1: ["employeeId", "department", "qualifications"],
} as const;

export interface TeacherRegistrationFormProps {
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  formId?: string;
  isSubmitting?: boolean;
  error: string | null;
  departments: string[];
  flatGrades: Grade[];
  allSubjects: Subject[];
  gradeLevels: LevelGroup[];
  allStreams: StreamOption[];
  formatPhoneNumber: (value: string) => string;
  subjectsLoading: boolean;
  gradeLevelsLoading: boolean;
  wizardStep: number;
  teachingPanel: TeachingPanel;
}

function ErrorBanner({ error }: { error: string }) {
  return (
    <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3 mb-4">
      <div className="flex gap-2">
        <Info className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
        <p className="text-sm text-red-700 dark:text-red-300 whitespace-pre-line">{error}</p>
      </div>
    </div>
  );
}

export function TeacherRegistrationForm({
  form,
  onSubmit,
  formId = "teacher-registration-form",
  isSubmitting = false,
  error,
  departments,
  flatGrades,
  allSubjects,
  gradeLevels,
  allStreams,
  formatPhoneNumber,
  subjectsLoading,
  gradeLevelsLoading,
  wizardStep,
  teachingPanel,
}: TeacherRegistrationFormProps) {
  const maxDateOfBirth = React.useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split("T")[0];
  }, []);

  const selectedGradeIds = form.watch("tenantGradeLevelIds") || [];
  const selectedGrades = flatGrades.filter((g) => selectedGradeIds.includes(g.id));
  const isClassTeacher = form.watch("isClassTeacher");
  const classTeacherType = form.watch("classTeacherType");

  const availableStreamsForGrades = React.useMemo(
    () => allStreams.filter((s) => selectedGradeIds.includes(s.gradeId)),
    [allStreams, selectedGradeIds],
  );

  const hasGradesSelected = selectedGradeIds.length > 0;

  const clearGradeDependents = React.useCallback(
    (removedGradeId?: string) => {
      if (removedGradeId) {
        const streamIdsForGrade = allStreams
          .filter((s) => s.gradeId === removedGradeId)
          .map((s) => s.id);
        const currentStreams = form.getValues("tenantStreamIds") || [];
        form.setValue(
          "tenantStreamIds",
          currentStreams.filter((id: string) => !streamIdsForGrade.includes(id)),
        );
        if (form.getValues("classTeacherTenantGradeLevelId") === removedGradeId) {
          form.setValue("classTeacherTenantGradeLevelId", "");
        }
        const ctStream = form.getValues("classTeacherTenantStreamId");
        if (ctStream && streamIdsForGrade.includes(ctStream)) {
          form.setValue("classTeacherTenantStreamId", "");
        }
      }
    },
    [allStreams, form],
  );

  React.useEffect(() => {
    if (!hasGradesSelected) {
      form.setValue("tenantStreamIds", []);
      form.setValue("isClassTeacher", false);
      form.setValue("classTeacherTenantStreamId", "");
      form.setValue("classTeacherTenantGradeLevelId", "");
    }
  }, [hasGradesSelected, form]);

  React.useEffect(() => {
    if (
      isClassTeacher &&
      availableStreamsForGrades.length === 0 &&
      classTeacherType === "stream"
    ) {
      form.setValue("classTeacherType", "grade");
      form.setValue("classTeacherTenantStreamId", "");
    }
  }, [isClassTeacher, availableStreamsForGrades.length, classTeacherType, form]);

  React.useEffect(() => {
    if (!isClassTeacher) return;

    if (classTeacherType === "stream") {
      const streams = availableStreamsForGrades;
      const current = form.getValues("classTeacherTenantStreamId");
      const stillValid = streams.some((s) => s.id === current);

      if (streams.length === 1) {
        const only = streams[0];
        if (current !== only.id) {
          form.setValue("classTeacherTenantStreamId", only.id, { shouldValidate: true });
        }
        const streamIds = form.getValues("tenantStreamIds") || [];
        if (!streamIds.includes(only.id)) {
          form.setValue("tenantStreamIds", [...streamIds, only.id]);
        }
      } else if (current && !stillValid) {
        form.setValue("classTeacherTenantStreamId", "");
      }
    }

    if (classTeacherType === "grade") {
      const current = form.getValues("classTeacherTenantGradeLevelId");
      const stillValid = selectedGradeIds.includes(current);

      if (selectedGradeIds.length === 1) {
        const only = selectedGradeIds[0];
        if (current !== only) {
          form.setValue("classTeacherTenantGradeLevelId", only, { shouldValidate: true });
        }
      } else if (current && !stillValid) {
        form.setValue("classTeacherTenantGradeLevelId", "");
      }
    }
  }, [isClassTeacher, classTeacherType, selectedGradeIds, availableStreamsForGrades, form]);

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={(event) => {
          if (isSubmitting) {
            event.preventDefault();
            return;
          }
          form.handleSubmit(onSubmit)(event);
        }}
        className="space-y-1"
      >
        {error && <ErrorBanner error={error} />}

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => <input type="hidden" {...field} />}
        />

        {(subjectsLoading || gradeLevelsLoading) && (
          <EmptyDataNotice message="Loading grades and subjects…" />
        )}

        <FormWizardStepper steps={[...TEACHER_WIZARD_STEPS]} currentStep={wizardStep} />

        {wizardStep === 0 && (
          <div>
            <WizardStepHeader
              title="Who are you adding?"
              description="Basic identity and how to reach them."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">
                      First name
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Mary"
                        className={fieldInputClass}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          const lastName = form.getValues("lastName");
                          const name = `${e.target.value} ${lastName}`.trim();
                          if (name) form.setValue("fullName", name);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">
                      Last name
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Wanjiku"
                        className={fieldInputClass}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          const firstName = form.getValues("firstName");
                          const name = `${firstName} ${e.target.value}`.trim();
                          if (name) form.setValue("fullName", name);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">
                      Gender
                      <RequiredMark />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={fieldSelectClass}>
                          <SelectValue placeholder="Choose" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">
                      Date of birth
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input type="date" max={maxDateOfBirth} className={fieldInputClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">
                      Phone
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+254712345678"
                        className={fieldInputClass}
                        value={field.value}
                        onChange={(e) => field.onChange(formatPhoneNumber(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">
                      Email
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="teacher@school.ac.ke"
                        className={fieldInputClass}
                        {...field}
                      />
                    </FormControl>
                    <FieldHint>Invitation is sent here.</FieldHint>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {wizardStep === 1 && (
          <div>
            <WizardStepHeader
              title="Employment details"
              description="Staff ID, department, and qualifications."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">
                      Staff ID
                      <RequiredMark />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="TCH-2025-014" className={fieldInputClass} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">
                      Department
                      <RequiredMark />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={fieldSelectClass}>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept.toLowerCase()}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="qualifications"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel className="text-sm">
                    Qualifications
                    <RequiredMark />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. B.Ed Mathematics"
                      className={fieldInputClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel className="text-sm">
                    Home address
                    <span className="text-xs font-normal text-muted-foreground ml-1">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Estate, town, or P.O. Box" className={fieldInputClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {wizardStep === 2 && (
          <div>
            <WizardStepHeader
              title="Teaching assignment"
              description="Pick grades first, then subjects. Streams and class teacher are optional."
            />

            {flatGrades.length === 0 ? (
              <EmptyDataNotice message="No grades set up yet. Add classes first, then return here." />
            ) : (
              <>
                <TeachingPanelNav
                  panel={teachingPanel}
                  hasStreams={availableStreamsForGrades.length > 0}
                />

                {teachingPanel === "grades" && (
                  <FormField
                    control={form.control}
                    name="tenantGradeLevelIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm mb-3 block">
                          Grades
                          <RequiredMark />
                        </FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {flatGrades.map((grade) => {
                            const checked = field.value?.includes(grade.id) || false;
                            return (
                              <label
                                key={grade.id}
                                htmlFor={`grade-${grade.id}`}
                                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                                  checked
                                    ? "border-primary bg-primary/5"
                                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
                                }`}
                              >
                                <Checkbox
                                  id={`grade-${grade.id}`}
                                  checked={checked}
                                  onCheckedChange={(isChecked) => {
                                    const current = field.value || [];
                                    if (isChecked) {
                                      field.onChange([...current, grade.id]);
                                    } else {
                                      field.onChange(current.filter((id: string) => id !== grade.id));
                                      const currentGradeSubjects = form.getValues("gradeSubjects") || {};
                                      const updated = { ...currentGradeSubjects };
                                      delete updated[grade.id];
                                      form.setValue("gradeSubjects", updated);
                                      clearGradeDependents(grade.id);
                                    }
                                  }}
                                />
                                <span className="text-sm font-medium">{grade.name}</span>
                              </label>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {teachingPanel === "subjects" && (
                  <FormField
                    control={form.control}
                    name="gradeSubjects"
                    render={({ field }) => (
                      <FormItem>
                        {!hasGradesSelected ? (
                          <p className="text-sm text-muted-foreground py-6 text-center">
                            Go back and pick at least one grade.
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {selectedGrades.map((grade) => {
                              const level = gradeLevels.find((l) =>
                                l.grades?.some((g) => g.id === grade.id),
                              );
                              const gradeSubjectList = level
                                ? allSubjects.filter(
                                    (s) => s.curriculum === level.levelName || !s.curriculum,
                                  )
                                : allSubjects;

                            return (
                              <div
                                key={grade.id}
                                className="rounded-lg border border-slate-200 dark:border-slate-800 p-3"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-sm font-semibold">{grade.name}</p>
                                  <span className="text-[11px] text-muted-foreground">
                                    {(field.value?.[grade.id] || []).length} selected
                                  </span>
                                </div>
                                  {gradeSubjectList.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No subjects for this grade.</p>
                                ) : (
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {gradeSubjectList.map((subject) => {
                                      const ids = field.value?.[grade.id] || [];
                                      const isChecked = ids.includes(subject.id);
                                      return (
                                        <label
                                          key={subject.id}
                                          htmlFor={`sub-${grade.id}-${subject.id}`}
                                          className={`flex items-center gap-2 rounded-md border px-2.5 py-2 cursor-pointer text-sm ${
                                            isChecked
                                              ? "border-primary/50 bg-primary/5 text-primary"
                                              : "border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900"
                                          }`}
                                        >
                                          <Checkbox
                                            id={`sub-${grade.id}-${subject.id}`}
                                            checked={isChecked}
                                            onCheckedChange={(checked) => {
                                              const current = field.value || {};
                                              const subjectIds = current[grade.id] || [];
                                              field.onChange({
                                                ...current,
                                                [grade.id]: checked
                                                  ? [...subjectIds, subject.id]
                                                  : subjectIds.filter(
                                                      (id: string) => id !== subject.id,
                                                    ),
                                              });
                                            }}
                                          />
                                          <span className="truncate">{subject.name}</span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {teachingPanel === "extras" && (
                  <div className="space-y-6">
                    {availableStreamsForGrades.length > 0 && (
                      <FormField
                        control={form.control}
                        name="tenantStreamIds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm">Streams (optional)</FormLabel>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {availableStreamsForGrades.map((stream) => {
                                const checked = field.value?.includes(stream.id) || false;
                                return (
                                  <label
                                    key={stream.id}
                                    htmlFor={`stream-${stream.id}`}
                                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 cursor-pointer text-sm ${
                                      checked
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-slate-200 dark:border-slate-700"
                                    }`}
                                  >
                                    <Checkbox
                                      id={`stream-${stream.id}`}
                                      checked={checked}
                                      className="sr-only"
                                      onCheckedChange={(isChecked) => {
                                        const current = field.value || [];
                                        field.onChange(
                                          isChecked
                                            ? [...current, stream.id]
                                            : current.filter((id: string) => id !== stream.id),
                                        );
                                      }}
                                    />
                                    {stream.name}
                                    <span className="text-muted-foreground text-xs">({stream.gradeName})</span>
                                  </label>
                                );
                              })}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <FormField
                        control={form.control}
                        name="isClassTeacher"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center gap-3 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              Class teacher
                            </FormLabel>
                          </FormItem>
                        )}
                      />

                      {isClassTeacher && (
                        <div className="mt-4 space-y-4 pl-1">
                          <FormField
                            control={form.control}
                            name="classTeacherType"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="flex gap-3"
                                  >
                                    {availableStreamsForGrades.length > 0 && (
                                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <RadioGroupItem value="stream" />
                                        Stream
                                      </label>
                                    )}
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                      <RadioGroupItem value="grade" />
                                      Whole grade
                                    </label>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {classTeacherType === "stream" && availableStreamsForGrades.length > 0 && (
                            <FormField
                              control={form.control}
                              name="classTeacherTenantStreamId"
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    onValueChange={(value) => {
                                      field.onChange(value);
                                      const streamIds = form.getValues("tenantStreamIds") || [];
                                      if (!streamIds.includes(value)) {
                                        form.setValue("tenantStreamIds", [...streamIds, value]);
                                      }
                                    }}
                                    value={field.value || undefined}
                                  >
                                    <FormControl>
                                      <SelectTrigger className={fieldSelectClass}>
                                        <SelectValue placeholder="Choose stream" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {availableStreamsForGrades.map((stream) => (
                                        <SelectItem key={stream.id} value={stream.id}>
                                          {stream.name} ({stream.gradeName})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          {classTeacherType === "grade" && (
                            <FormField
                              control={form.control}
                              name="classTeacherTenantGradeLevelId"
                              render={({ field }) => (
                                <FormItem>
                                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                                    <FormControl>
                                      <SelectTrigger className={fieldSelectClass}>
                                        <SelectValue placeholder="Choose grade" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {selectedGrades.map((grade) => (
                                        <SelectItem key={grade.id} value={grade.id}>
                                          {grade.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </form>
    </Form>
  );
}
