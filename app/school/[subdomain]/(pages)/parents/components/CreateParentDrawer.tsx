"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  UserPlus,
  User,
  Users,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Shield,
  MessageSquare,
  Loader2,
  Search,
  CheckCircle,
  AlertCircle,
  Hash,
  UserCheck,
  X,
  GraduationCap,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";

// ─── Schema ────────────────────────────────────────────────────

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
  email: z.string().email("Valid email is required").or(z.literal("")),
  phone: z
    .string()
    .min(10, "Valid phone number is required")
    .regex(
      /^\+254[0-9]{9}$|^\+[1-9][0-9]{1,14}$/,
      "Enter a valid phone number (e.g., +254700000000)",
    ),
  relationship: z.enum(["father", "mother", "guardian", "other"]).optional(),
  occupation: z.string().optional().or(z.literal("")),
  workAddress: z.string().optional().or(z.literal("")),
  homeAddress: z.string().optional().or(z.literal("")),
  emergencyContact: z.string().optional().or(z.literal("")),
  idNumber: z.string().optional().or(z.literal("")),
  studentName: z.string().optional().or(z.literal("")),
  students: z.array(studentSchema).min(1, "At least one student is required"),
  communicationSms: z.boolean(),
  communicationEmail: z.boolean(),
  communicationWhatsapp: z.boolean(),
});

type ParentFormData = z.infer<typeof parentFormSchema>;

interface CreateParentDrawerProps {
  onParentCreated: () => void;
}

// ─── Helpers ───────────────────────────────────────────────────

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

// ─── Component ─────────────────────────────────────────────────

export function CreateParentDrawer({
  onParentCreated,
}: CreateParentDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchingStudent, setIsSearchingStudent] = useState(false);
  const [searchedStudent, setSearchedStudent] = useState<any>(null);
  const [searchedStudents, setSearchedStudents] = useState<any[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<"admissionNumber" | "name">(
    "name",
  );
  const [searchValue, setSearchValue] = useState("");

  const { config, getAllGradeLevels, getStreamsByGradeId } =
    useSchoolConfigStore();

  // Build sorted grade list from school config
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
      .sort((a, b) => {
        const numA = extractGradeNumber(a.name);
        const numB = extractGradeNumber(b.name);
        return numA - numB;
      });
  }, [config, getAllGradeLevels]);

  const form = useForm<ParentFormData>({
    resolver: zodResolver(parentFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      relationship: undefined,
      occupation: "",
      workAddress: "",
      homeAddress: "",
      emergencyContact: "",
      idNumber: "",
      studentName: "",
      students: [],
      communicationSms: true,
      communicationEmail: true,
      communicationWhatsapp: false,
    },
  });

  const watchedStudents = form.watch("students");

  // ─── Student Search ────────────────────────────────────────

  const searchStudent = useCallback(
    async (value: string, type: "admissionNumber" | "name") => {
      setIsSearchingStudent(true);
      setSearchError(null);
      setSearchedStudent(null);
      setSearchedStudents([]);

      try {
        const response = await fetch("/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
            query SearchStudents($input: StudentSearchInput!) {
              searchStudents(input: $input) {
                id name admissionNumber grade stream phone
              }
            }
          `,
            variables: {
              input:
                type === "admissionNumber"
                  ? { admissionNumber: value, searchType: "ADMISSION_NUMBER" }
                  : { name: value, searchType: "NAME" },
            },
          }),
        });

        const data = await response.json();
        if (data.errors)
          throw new Error(data.errors[0]?.message || "Search failed");

        const results = data.data?.searchStudents || [];
        if (results.length === 1) {
          setSearchedStudent(results[0]);
        } else if (results.length > 1) {
          setSearchedStudents(results);
        } else {
          setSearchError(
            "No students found matching your search. Try a different search term.",
          );
        }
      } catch (err) {
        setSearchError(
          err instanceof Error
            ? err.message
            : "Search failed. Please try again.",
        );
      } finally {
        setIsSearchingStudent(false);
      }
    },
    [],
  );

  // ─── Student List Management ───────────────────────────────

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

      const gradeName =
        allGrades.find((g) => g.id === student.grade)?.name ||
        student.grade ||
        "";
      const newStudent = {
        id: student.id,
        name: student.name,
        admissionNumber: student.admissionNumber,
        grade: student.grade || "",
        class: generateClassName(gradeName, student.stream),
        stream: student.stream || "",
        phone: student.phone || "",
      };

      form.setValue("students", [...currentStudents, newStudent]);
      setSearchedStudent(null);
      setSearchedStudents([]);
      setSearchValue("");
    },
    [form, allGrades],
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

  // ─── Submit ────────────────────────────────────────────────

  const onSubmit = useCallback(
    async (data: ParentFormData) => {
      if (isLoading) return;
      setIsLoading(true);

      try {
        const payload = {
          parentData: {
            name: data.name,
            email: data.email || undefined,
            phone: data.phone,
            relationship: data.relationship || "guardian",
            occupation: data.occupation || undefined,
            workAddress: data.workAddress || undefined,
            homeAddress: data.homeAddress || undefined,
            emergencyContact: data.emergencyContact || undefined,
            idNumber: data.idNumber || undefined,
            communicationSms: data.communicationSms,
            communicationEmail: data.communicationEmail,
            communicationWhatsapp: data.communicationWhatsapp,
          },
          students: data.students.map((s) => ({
            name: s.name,
            admissionNumber: s.admissionNumber,
            grade: s.grade,
            class: s.class,
            stream: s.stream || undefined,
            phone: s.phone || undefined,
            ...(s.id ? { id: s.id } : {}),
          })),
          linkingMethod: "MANUAL_INPUT",
        };

        const response = await fetch("/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
            mutation InviteParent($input: InviteParentInput!) {
              inviteParent(input: $input) {
                id name email phone
              }
            }
          `,
            variables: { input: payload },
          }),
        });

        const result = await response.json();

        if (result.errors) {
          const msg = result.errors[0]?.message || "Failed to create parent";
          throw new Error(msg);
        }

        toast.success("Parent registered successfully", {
          description: `${data.name} has been added and an invitation sent.`,
        });

        form.reset();
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

  // ─── Render ──────────────────────────────────────────────────

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="default"
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <UserPlus className="h-4 w-4" />
          Add New Parent
        </Button>
      </DrawerTrigger>
      <DrawerContent
        className="h-full w-full md:w-[520px] bg-white dark:bg-slate-950"
        data-vaul-drawer-direction="right"
      >
        <DrawerHeader className="border-b px-6 py-4">
          <DrawerTitle className="text-lg font-bold">
            Register Parent/Guardian
          </DrawerTitle>
          <DrawerDescription>
            Link a parent or guardian to their student
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/70 z-50 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-slate-500">Registering parent...</p>
              </div>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* ── Parent Info ── */}
              <Section
                title="Parent Information"
                icon={<User className="h-4 w-4" />}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldInput
                    form={form}
                    name="name"
                    label="Full Name"
                    placeholder="Parent full name"
                    required
                  />
                  <FieldSelect
                    form={form}
                    name="relationship"
                    label="Relationship"
                    placeholder="Select"
                    options={[
                      { value: "father", label: "Father" },
                      { value: "mother", label: "Mother" },
                      { value: "guardian", label: "Guardian" },
                      { value: "other", label: "Other" },
                    ]}
                  />
                  <FieldInput
                    form={form}
                    name="phone"
                    label="Phone Number"
                    placeholder="+254700000000"
                    required
                    onChangeTransform={formatPhoneNumber}
                    hint="Kenya numbers start with +254"
                  />
                  <FieldInput
                    form={form}
                    name="email"
                    label="Email"
                    placeholder="parent@example.com"
                    type="email"
                  />
                  <FieldInput
                    form={form}
                    name="idNumber"
                    label="ID Number"
                    placeholder="National ID"
                  />
                  <FieldInput
                    form={form}
                    name="occupation"
                    label="Occupation"
                    placeholder="Job title"
                  />
                  <FieldInput
                    form={form}
                    name="homeAddress"
                    label="Home Address"
                    placeholder="Physical address"
                    className="sm:col-span-2"
                  />
                  <FieldInput
                    form={form}
                    name="workAddress"
                    label="Work Address"
                    placeholder="Work location"
                  />
                  <FieldInput
                    form={form}
                    name="emergencyContact"
                    label="Emergency Contact"
                    placeholder="+254700000000"
                  />
                </div>
              </Section>

              {/* ── Student Search ── */}
              <Section
                title="Link Students"
                icon={<Users className="h-4 w-4" />}
              >
                <div className="flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchType("name");
                      setSearchValue("");
                      setSearchedStudent(null);
                      setSearchedStudents([]);
                      setSearchError(null);
                    }}
                    className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${searchType === "name" ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600"}`}
                  >
                    By Name
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchType("admissionNumber");
                      setSearchValue("");
                      setSearchedStudent(null);
                      setSearchedStudents([]);
                      setSearchError(null);
                    }}
                    className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${searchType === "admissionNumber" ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600"}`}
                  >
                    By Admission No.
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
                      if (e.key === "Enter" && searchValue.trim())
                        searchStudent(searchValue.trim(), searchType);
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      searchValue.trim() &&
                      searchStudent(searchValue.trim(), searchType)
                    }
                    disabled={isSearchingStudent || !searchValue.trim()}
                    size="sm"
                  >
                    {isSearchingStudent ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {searchError && (
                  <div className="mt-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    {searchError}
                  </div>
                )}

                {searchedStudent && (
                  <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium">
                        {searchedStudent.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {searchedStudent.admissionNumber}
                      </span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addStudentFromSearch(searchedStudent)}
                      className="w-full"
                    >
                      Add This Student
                    </Button>
                  </div>
                )}

                {searchedStudents.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                    {searchedStudents.map((student, i) => (
                      <div
                        key={student.id || i}
                        className="p-2 border rounded flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={() => addStudentFromSearch(student)}
                      >
                        <div>
                          <span className="text-sm font-medium">
                            {student.name}
                          </span>
                          <span className="text-xs text-slate-500 ml-2">
                            {student.admissionNumber}
                          </span>
                        </div>
                        <span className="text-xs text-primary">Select</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Student List */}
                {watchedStudents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-slate-500">
                      {watchedStudents.length} student
                      {watchedStudents.length !== 1 ? "s" : ""} linked
                    </p>
                    {watchedStudents.map((student, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded border"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {student.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {student.admissionNumber}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeStudent(idx)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* ── Communication ── */}
              <Section
                title="Communication Preferences"
                icon={<MessageSquare className="h-4 w-4" />}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FieldCheckbox
                    form={form}
                    name="communicationSms"
                    label="SMS"
                    description="Text messages"
                  />
                  <FieldCheckbox
                    form={form}
                    name="communicationEmail"
                    label="Email"
                    description="Email notifications"
                  />
                  <FieldCheckbox
                    form={form}
                    name="communicationWhatsapp"
                    label="WhatsApp"
                    description="WhatsApp messages"
                  />
                </div>
              </Section>

              <DrawerFooter className="px-0 pb-0">
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  Register Parent
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// ─── Reusable Form Field Components ────────────────────────────

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-primary">{icon}</div>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function FieldInput({
  form,
  name,
  label,
  placeholder,
  type = "text",
  required,
  onChangeTransform,
  hint,
  className,
}: {
  form: ReturnType<typeof useForm<ParentFormData>>;
  name: keyof ParentFormData;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  onChangeTransform?: (value: string) => string;
  hint?: string;
  className?: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name as any}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="text-xs font-medium">
            {label}
            {required && " *"}
          </FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              {...field}
              onChange={(e) => {
                const val = onChangeTransform
                  ? onChangeTransform(e.target.value)
                  : e.target.value;
                field.onChange(val);
              }}
              className="h-9 text-sm"
            />
          </FormControl>
          {hint && <p className="text-[10px] text-slate-400 mt-0.5">{hint}</p>}
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}

function FieldSelect({
  form,
  name,
  label,
  placeholder,
  options,
}: {
  form: ReturnType<typeof useForm<ParentFormData>>;
  name: keyof ParentFormData;
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <FormField
      control={form.control}
      name={name as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs font-medium">{label}</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value as string}
          >
            <FormControl>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
}

function FieldCheckbox({
  form,
  name,
  label,
  description,
}: {
  form: ReturnType<typeof useForm<ParentFormData>>;
  name: keyof ParentFormData;
  label: string;
  description: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name as any}
      render={({ field }) => (
        <FormItem className="flex items-start gap-3 p-3 border rounded">
          <FormControl>
            <Checkbox
              checked={field.value as boolean}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div>
            <FormLabel className="text-xs font-medium">{label}</FormLabel>
            <p className="text-[10px] text-slate-400">{description}</p>
          </div>
        </FormItem>
      )}
    />
  );
}

// ─── Grade Number Extractor ────────────────────────────────────

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
