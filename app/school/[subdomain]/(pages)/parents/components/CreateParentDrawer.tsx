"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  UserPlus,
  Loader2,
  Search,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";

const studentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Student name is required"),
  grade: z.string().min(1, "Grade is required"),
  class: z.string().min(1, "Class is required"),
  admissionNumber: z.string().min(1, "Admission number is required"),
  stream: z.string().optional(),
  phone: z.string().optional(),
});

const parentFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email is required"),
  phone: z
    .string()
    .min(10, "Valid phone number is required")
    .regex(
      /^\+254[0-9]{9}$|^\+[1-9][0-9]{1,14}$/,
      "Enter a valid phone number (e.g., +254700000000)",
    ),
  relationship: z.enum(["father", "mother", "guardian", "other"]).optional(),
  students: z.array(studentSchema).min(1, "At least one student is required"),
});

type ParentFormData = z.infer<typeof parentFormSchema>;

interface CreateParentDrawerProps {
  onParentCreated: () => void;
  defaultOpen?: boolean;
}

function formatPhoneNumber(value: string): string {
  if (!value || value === "+" || value === "+2" || value === "+25")
    return "+254";
  let cleaned = value.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("0")) cleaned = "+254" + cleaned.substring(1);
  if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
  return cleaned;
}

function generateClassName(gradeName: string, streamName?: string): string {
  return streamName ? `${gradeName} ${streamName}` : gradeName;
}

function extractGradeNumber(name: string): number {
  const gradeMatch = name.match(/Grade\s+(\d+)/i);
  if (gradeMatch) return parseInt(gradeMatch[1]);
  const formMatch = name.match(/Form\s+(\d+)/i);
  if (formMatch) return parseInt(formMatch[1]) + 6;
  const ppMatch = name.match(/PP(\d+)/i);
  if (ppMatch) return parseInt(ppMatch[1]) - 3;
  const special: Record<string, number> = {
    "Baby Class": -4,
    Nursery: -3,
    Reception: -2,
  };
  if (special[name]) return special[name];
  return 999;
}

const fieldShell =
  "h-10 rounded-none border border-[#1a4d42]/15 bg-white text-sm shadow-none placeholder:text-[#1a4d42]/40 focus-visible:border-[#246a59]/50 focus-visible:ring-1 focus-visible:ring-[#246a59]/25 dark:border-white/15 dark:bg-[#0c1a17] dark:placeholder:text-white/40";

const selectShell =
  "h-10 rounded-none border border-[#1a4d42]/15 bg-white text-sm shadow-none focus:ring-1 focus:ring-[#246a59]/25 dark:border-white/15 dark:bg-[#0c1a17]";

const labelClass = "text-xs font-medium text-[#0a1f1a] dark:text-white/80";

export function CreateParentDrawer({
  onParentCreated,
  defaultOpen = false,
}: CreateParentDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(defaultOpen);
  const [isSearchingStudent, setIsSearchingStudent] = useState(false);
  const [searchedStudent, setSearchedStudent] = useState<any>(null);
  const [searchedStudents, setSearchedStudents] = useState<any[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<"admissionNumber" | "name">(
    "name",
  );
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (defaultOpen) setIsDrawerOpen(true);
  }, [defaultOpen]);

  const { config, getAllGradeLevels, getStreamsByGradeId } =
    useSchoolConfigStore();

  const allGrades = useMemo(() => {
    if (!config) return [];
    const allGradeLevels = getAllGradeLevels();
    return allGradeLevels
      .flatMap((level) =>
        level.grades.map((grade) => ({
          ...grade,
          levelName: level.levelName,
          levelId: level.levelId,
        })),
      )
      .sort((a, b) => extractGradeNumber(a.name) - extractGradeNumber(b.name));
  }, [config, getAllGradeLevels]);

  const form = useForm<ParentFormData>({
    resolver: zodResolver(parentFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "+254",
      relationship: undefined,
      students: [],
    },
  });

  const watchedStudents = form.watch("students");

  const searchStudent = useCallback(
    async (value: string, type: "admissionNumber" | "name") => {
      setIsSearchingStudent(true);
      setSearchError(null);
      setSearchedStudent(null);
      setSearchedStudents([]);

      try {
        const response = await fetch("/api/parents/search-student", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            type === "admissionNumber"
              ? { searchType: "admissionNumber", admissionNumber: value }
              : { searchType: "name", name: value },
          ),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : data.errors?.[0]?.message || "Search failed",
          );
        }

        const results =
          type === "admissionNumber"
            ? data.searchStudentByAdmission
              ? [data.searchStudentByAdmission]
              : []
            : data.searchStudentsByName || [];

        if (results.length === 1) {
          setSearchedStudent(results[0]);
        } else if (results.length > 1) {
          setSearchedStudents(results);
        } else {
          setSearchError("No students found. Try a different search term.");
        }
      } catch (err) {
        setSearchError(
          err instanceof Error ? err.message : "Search failed. Please try again.",
        );
      } finally {
        setIsSearchingStudent(false);
      }
    },
    [],
  );

  const addStudentFromSearch = useCallback(
    (student: any) => {
      const currentStudents = form.getValues("students");
      const exists = currentStudents.some(
        (s) => s.admissionNumber === student.admissionNumber,
      );

      if (exists) {
        toast.info("Student already added");
        return;
      }

      const matchedGrade = allGrades.find((g) => g.id === student.grade);
      const gradeName = matchedGrade?.name || student.grade || "";
      const gradeId = matchedGrade?.id || student.grade || "";
      const streamName =
        student.stream ||
        (student.streamId && gradeId
          ? getStreamsByGradeId(gradeId).find((s) => s.id === student.streamId)
              ?.name
          : "") ||
        "";

      form.setValue("students", [
        ...currentStudents,
        {
          id: student.id,
          name: student.name,
          admissionNumber: student.admissionNumber,
          grade: gradeId,
          class: generateClassName(gradeName, streamName),
          stream: streamName,
          phone: student.phone || "",
        },
      ]);
      setSearchedStudent(null);
      setSearchedStudents([]);
      setSearchValue("");
    },
    [form, allGrades, getStreamsByGradeId],
  );

  const removeStudent = useCallback(
    (index: number) => {
      const current = form.getValues("students");
      form.setValue(
        "students",
        current.filter((_, i) => i !== index),
      );
    },
    [form],
  );

  const onSubmit = useCallback(
    async (data: ParentFormData) => {
      if (isLoading) return;
      setIsLoading(true);

      try {
        const email = data.email?.trim();
        if (!email) {
          throw new Error("Email is required to send an invitation.");
        }

        const studentIds = data.students
          .map((s) => s.id)
          .filter((id): id is string => Boolean(id));

        if (studentIds.length !== data.students.length) {
          throw new Error(
            "Link each student using search so they can be connected to this parent.",
          );
        }

        const response = await fetch("/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
            mutation InviteParent(
              $createParentDto: CreateParentInvitationDto!
              $studentIds: [String!]!
            ) {
              inviteParent(
                createParentDto: $createParentDto
                studentIds: $studentIds
              ) {
                email
                name
                status
                createdAt
                students {
                  id
                  name
                  admissionNumber
                }
              }
            }
          `,
            variables: {
              createParentDto: {
                email,
                name: data.name,
                phone: data.phone,
              },
              studentIds,
            },
          }),
        });

        const result = await response.json();

        if (result.errors) {
          throw new Error(result.errors[0]?.message || "Failed to create parent");
        }

        if (!result.data?.inviteParent) {
          throw new Error("No invitation was created. Please try again.");
        }

        toast.success("Parent registered", {
          description: `${data.name} has been added and an invitation sent.`,
        });

        form.reset({
          name: "",
          email: "",
          phone: "+254",
          relationship: undefined,
          students: [],
        });
        setIsDrawerOpen(false);
        onParentCreated();
      } catch (err) {
        toast.error("Registration failed", {
          description: err instanceof Error ? err.message : "Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, form, onParentCreated],
  );

  const resetSearchMode = (type: "admissionNumber" | "name") => {
    setSearchType(type);
    setSearchValue("");
    setSearchedStudent(null);
    setSearchedStudents([]);
    setSearchError(null);
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <Button
          size="sm"
          className="h-7 gap-1.5 rounded-none bg-[#0a1f1a] px-2.5 text-xs text-white shadow-none hover:bg-[#246a59]"
          disabled={isLoading}
        >
          <UserPlus className="h-3.5 w-3.5" />
          Add parent
        </Button>
      </DrawerTrigger>
      <DrawerContent
        className="ml-auto flex h-[100dvh] max-h-[100dvh] w-full flex-col border-l border-[#1a4d42]/12 bg-white dark:border-white/10 dark:bg-[#071411] sm:max-w-[400px]"
        data-vaul-drawer-direction="right"
      >
        <DrawerHeader className="shrink-0 border-b border-[#1a4d42]/12 px-5 py-4 dark:border-white/10">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DrawerTitle className="font-display text-left text-lg tracking-tight text-[#0a1f1a] dark:text-white">
                Add parent
              </DrawerTitle>
              <DrawerDescription className="mt-0.5 text-left text-sm text-[#1a4d42]/55 dark:text-white/45">
                Invite a guardian and link their children
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center justify-center text-[#1a4d42]/40 hover:bg-[#f3f7f5] hover:text-[#0a1f1a] dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="relative flex-1 overflow-y-auto px-5 py-5">
          {isLoading ? (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-[#071411]/80">
              <div className="flex items-center gap-2 text-sm text-[#0a1f1a] dark:text-white">
                <Loader2 className="h-4 w-4 animate-spin text-[#246a59]" />
                Sending invitation…
              </div>
            </div>
          ) : null}

          <Form {...form}>
            <form
              id="invite-parent-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className={labelClass}>Full name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Mary Wanjiku"
                        {...field}
                        className={fieldShell}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className={labelClass}>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="parent@example.com"
                        {...field}
                        className={fieldShell}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className={labelClass}>Phone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+254700000000"
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(formatPhoneNumber(e.target.value))
                        }
                        className={fieldShell}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="relationship"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className={labelClass}>Relationship</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className={selectShell}>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="father">Father</SelectItem>
                        <SelectItem value="mother">Mother</SelectItem>
                        <SelectItem value="guardian">Guardian</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <div className="space-y-3 border-t border-[#1a4d42]/10 pt-4 dark:border-white/10">
                <div>
                  <p className={labelClass}>Link students</p>
                  <p className="mt-0.5 text-[11px] text-[#1a4d42]/45">
                    Search and add at least one child
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => resetSearchMode("name")}
                    className={cn(
                      "h-8 px-3 text-xs font-medium transition-colors",
                      searchType === "name"
                        ? "bg-[#0a1f1a] text-white"
                        : "border border-[#1a4d42]/15 text-[#1a4d42]/70 hover:border-[#246a59]/35 dark:border-white/15 dark:text-white/55",
                    )}
                  >
                    By name
                  </button>
                  <button
                    type="button"
                    onClick={() => resetSearchMode("admissionNumber")}
                    className={cn(
                      "h-8 px-3 text-xs font-medium transition-colors",
                      searchType === "admissionNumber"
                        ? "bg-[#0a1f1a] text-white"
                        : "border border-[#1a4d42]/15 text-[#1a4d42]/70 hover:border-[#246a59]/35 dark:border-white/15 dark:text-white/55",
                    )}
                  >
                    By admission no.
                  </button>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder={
                      searchType === "admissionNumber"
                        ? "Admission number"
                        : "Student name"
                    }
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchValue.trim()) {
                        e.preventDefault();
                        void searchStudent(searchValue.trim(), searchType);
                      }
                    }}
                    className={cn(fieldShell, "flex-1")}
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      searchValue.trim() &&
                      void searchStudent(searchValue.trim(), searchType)
                    }
                    disabled={isSearchingStudent || !searchValue.trim()}
                    className="h-10 shrink-0 rounded-none bg-[#0a1f1a] px-3 text-white hover:bg-[#246a59]"
                  >
                    {isSearchingStudent ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {searchError ? (
                  <div className="flex items-start gap-2 border border-red-300/80 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {searchError}
                  </div>
                ) : null}

                {searchedStudent ? (
                  <div className="border border-[#246a59]/25 bg-[#246a59]/[0.06] px-3 py-3">
                    <div className="mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-[#246a59]" />
                      <span className="text-sm font-medium text-[#0a1f1a] dark:text-white">
                        {searchedStudent.name}
                      </span>
                      <span className="font-mono text-xs text-[#1a4d42]/50">
                        {searchedStudent.admissionNumber}
                      </span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addStudentFromSearch(searchedStudent)}
                      className="h-8 w-full rounded-none bg-[#0a1f1a] text-xs text-white hover:bg-[#246a59]"
                    >
                      Add this student
                    </Button>
                  </div>
                ) : null}

                {searchedStudents.length > 0 ? (
                  <div className="max-h-40 space-y-1 overflow-y-auto border border-[#1a4d42]/12 dark:border-white/10">
                    {searchedStudents.map((student, i) => (
                      <button
                        key={student.id || i}
                        type="button"
                        onClick={() => addStudentFromSearch(student)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-[#f3f7f5] dark:hover:bg-white/5"
                      >
                        <span>
                          <span className="text-sm font-medium text-[#0a1f1a] dark:text-white">
                            {student.name}
                          </span>
                          <span className="ml-2 font-mono text-xs text-[#1a4d42]/45">
                            {student.admissionNumber}
                          </span>
                        </span>
                        <span className="text-xs font-medium text-[#246a59]">
                          Select
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}

                {watchedStudents.length > 0 ? (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-[#1a4d42]/45">
                      {watchedStudents.length} student
                      {watchedStudents.length !== 1 ? "s" : ""} linked
                    </p>
                    {watchedStudents.map((student, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between border border-[#1a4d42]/12 bg-[#f8fbfa] px-3 py-2 dark:border-white/10 dark:bg-[#0c1a17]"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#0a1f1a] dark:text-white">
                            {student.name}
                          </p>
                          <p className="font-mono text-xs text-[#1a4d42]/50">
                            {student.admissionNumber}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeStudent(idx)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                          aria-label={`Remove ${student.name}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                {form.formState.errors.students ? (
                  <p className="text-xs text-red-600">
                    {form.formState.errors.students.message}
                  </p>
                ) : null}
              </div>
            </form>
          </Form>
        </div>

        <DrawerFooter className="shrink-0 border-t border-[#1a4d42]/12 px-5 py-4 dark:border-white/10">
          <div className="flex w-full gap-2">
            <Button
              type="submit"
              form="invite-parent-form"
              disabled={isLoading}
              className="h-10 flex-1 gap-2 rounded-none bg-[#0a1f1a] text-white shadow-none hover:bg-[#246a59] disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send invitation"
              )}
            </Button>
            <DrawerClose asChild>
              <Button
                type="button"
                variant="ghost"
                disabled={isLoading}
                className="h-10 rounded-none px-4 text-[#1a4d42]/70 hover:bg-[#f3f7f5] dark:text-white/55 dark:hover:bg-white/10"
              >
                Cancel
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
