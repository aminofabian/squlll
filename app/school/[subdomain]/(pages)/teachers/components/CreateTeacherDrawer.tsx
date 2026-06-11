"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
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
  GraduationCap,
  Loader2,
  X,
  Mail,
  Phone,
  User,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSchoolConfig } from "@/lib/hooks/useSchoolConfig";
import { InvitationSuccessModal } from "./InvitationSuccessModal";
import { teachersPanel } from "./teachers-ui";

const DEPARTMENTS = [
  "English",
  "Mathematics",
  "Science",
  "Social Studies",
  "Physical Education",
  "Arts & Music",
  "Languages",
  "Computer Science",
  "Special Education",
  "Administration",
] as const;

const phoneSchema = z.string().refine(
  (value) => /^\+254[0-9]{9}$|^\+[1-9][0-9]{1,14}$/.test(value),
  { message: "Enter a valid number: +254XXXXXXXXX" },
);

const teacherFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email is required"),
  phoneNumber: phoneSchema,
  gender: z.enum(["MALE", "FEMALE"]),
  department: z.string().min(1, "Department is required"),
});

type TeacherFormData = z.infer<typeof teacherFormSchema>;

interface CreateTeacherDrawerProps {
  onTeacherCreated: () => void;
  defaultOpen?: boolean;
}

function formatPhoneNumber(value: string): string {
  if (value === "" || value === "+" || value === "+2" || value === "+25") {
    return "+254";
  }

  let cleaned = value.replace(/[^\d+]/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "+254" + cleaned.substring(1);
  } else if (cleaned && /^\d/.test(cleaned) && !cleaned.startsWith("+")) {
    cleaned = "+254" + cleaned;
  } else if (cleaned.startsWith("+2540")) {
    cleaned = "+254" + cleaned.substring(5);
  } else if (!cleaned || cleaned === "+") {
    cleaned = "+254";
  }

  if (cleaned.startsWith("+254") && cleaned.length > 13) {
    cleaned = cleaned.substring(0, 13);
  }

  return cleaned;
}

function splitName(fullName: string): {
  firstName: string;
  lastName: string;
  fullName: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: "", lastName: "", fullName: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: parts[0], fullName: parts[0] };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
    fullName: parts.join(" "),
  };
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const fieldShell =
  "h-11 rounded-xl border-0 bg-slate-100/80 pl-10 text-sm shadow-none ring-1 ring-inset ring-slate-200/70 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary/40 dark:bg-slate-800/60 dark:ring-slate-700/60 dark:placeholder:text-slate-500";

const selectShell =
  "h-11 rounded-xl border-0 bg-slate-100/80 text-sm shadow-none ring-1 ring-inset ring-slate-200/70 focus:ring-2 focus:ring-primary/40 dark:bg-slate-800/60 dark:ring-slate-700/60";

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
      {children}
    </span>
  );
}

function GenderPills({
  value,
  onChange,
}: {
  value: "MALE" | "FEMALE";
  onChange: (v: "MALE" | "FEMALE") => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {([
        { id: "MALE" as const, label: "Male" },
        { id: "FEMALE" as const, label: "Female" },
      ]).map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-primary text-white shadow-md shadow-primary/25 ring-2 ring-primary/30"
                : "bg-slate-100/80 text-slate-600 ring-1 ring-inset ring-slate-200/70 hover:bg-slate-200/60 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-700/60",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function CreateTeacherDrawer({
  onTeacherCreated,
  defaultOpen = false,
}: CreateTeacherDrawerProps) {
  const queryClient = useQueryClient();
  const isSubmittingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(defaultOpen);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [invitationData, setInvitationData] = useState<{
    email: string;
    fullName: string;
    status: string;
    createdAt: string;
    emailSent?: boolean;
  } | null>(null);
  const { data: schoolConfig } = useSchoolConfig();

  useEffect(() => {
    if (defaultOpen) setIsDrawerOpen(true);
  }, [defaultOpen]);

  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "+254",
      gender: "MALE",
      department: "",
    },
  });

  const watchedName = form.watch("fullName");
  const watchedEmail = form.watch("email");
  const watchedDepartment = form.watch("department");

  const finishInvitation = useCallback(
    async (inviteData: {
      email: string;
      fullName: string;
      status: string;
      createdAt: string;
      emailSent?: boolean;
    }) => {
      setInvitationData(inviteData);
      setShowSuccessModal(true);
      form.reset();
      setIsDrawerOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["getTeachers"] });
      onTeacherCreated();

      if (inviteData.emailSent === false) {
        toast.warning("Teacher registered", {
          description:
            "The invitation email could not be sent. Use Resend on the pending invitations list.",
          duration: 10000,
        });
      }
    },
    [form, onTeacherCreated, queryClient],
  );

  const onSubmit = useCallback(
    async (data: TeacherFormData) => {
      if (isSubmittingRef.current) return;

      if (!schoolConfig?.tenant?.id) {
        toast.error("Configuration error", {
          description: "School configuration not available. Please refresh and try again.",
        });
        return;
      }

      isSubmittingRef.current = true;
      setIsLoading(true);

      const { firstName, lastName, fullName } = splitName(data.fullName);
      const isEmailDeliveryFailure = (message: string) =>
        message.toLowerCase().includes("failed to send email");

      try {
        const createTeacherDto = {
          email: data.email.trim(),
          fullName,
          firstName,
          lastName,
          role: "TEACHER",
          gender: data.gender,
          department: data.department.toLowerCase(),
          phoneNumber: data.phoneNumber.trim(),
        };

        const response = await fetch("/api/school/invite-teacher", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ createTeacherDto }),
        });

        const result = await response.json();

        if (!response.ok) {
          if (result.error && isEmailDeliveryFailure(result.error)) {
            await finishInvitation({
              email: data.email.trim(),
              fullName,
              status: "PENDING",
              createdAt: new Date().toISOString(),
              emailSent: false,
            });
            return;
          }

          throw new Error(result.error || "Failed to send invitation");
        }

        await finishInvitation({
          ...result.inviteTeacher,
          emailSent: result.inviteTeacher.emailSent !== false,
        });

        toast.success("Invitation sent", {
          description: `${fullName} will receive an email to set up their account.`,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not send invitation";
        toast.error("Invitation failed", { description: message, duration: 8000 });
      } finally {
        isSubmittingRef.current = false;
        setIsLoading(false);
      }
    },
    [finishInvitation, schoolConfig?.tenant?.id],
  );

  const previewName = watchedName.trim() || "New teacher";
  const previewDept = watchedDepartment || "Department not selected";

  return (
    <>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="default"
            className="flex items-center gap-2 bg-primary text-white shadow-sm hover:bg-primary-dark"
            disabled={isLoading}
          >
            <UserPlus className="h-4 w-4" />
            Add teacher
          </Button>
        </DrawerTrigger>
        <DrawerContent
          className="ml-auto flex h-[100dvh] max-h-[100dvh] w-full flex-col border-l border-slate-200/80 bg-[#f5f6f8] dark:border-slate-800 dark:bg-slate-950 sm:max-w-[440px]"
          data-vaul-drawer-direction="right"
        >
          <DrawerHeader className="relative shrink-0 overflow-hidden border-0 px-0 pb-0 pt-0">
            <div className="relative border-b border-primary/10 bg-gradient-to-br from-primary/[0.08] via-white to-primary/[0.04] px-5 pb-5 pt-5 dark:from-primary/15 dark:via-slate-900 dark:to-primary/5">
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/15 blur-3xl"
                aria-hidden
              />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
                    <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <DrawerTitle className="text-left text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                      Invite a teacher
                    </DrawerTitle>
                    <DrawerDescription className="mt-0.5 text-left text-sm text-slate-500 dark:text-slate-400">
                      Five fields — they&apos;ll get an email to join
                    </DrawerDescription>
                  </div>
                </div>
                <DrawerClose asChild>
                  <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 dark:hover:bg-slate-800"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </DrawerClose>
              </div>
            </div>
          </DrawerHeader>

          <div className="relative flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <Form {...form}>
              <form
                id="invite-teacher-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {isLoading && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#f5f6f8]/80 backdrop-blur-[2px] dark:bg-slate-950/80">
                    <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-5 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
                      <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        Sending invitation…
                      </p>
                    </div>
                  </div>
                )}

                {/* Preview card */}
                <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-dark via-slate-800 to-primary/70 p-[1px] shadow-md shadow-primary/10">
                  <div className="rounded-[15px] bg-gradient-to-br from-primary-dark to-slate-800 px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-base font-bold text-white ring-1 ring-white/20">
                        {initialsFromName(watchedName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-white">{previewName}</p>
                        <p className="mt-0.5 truncate text-xs text-white/55">
                          {watchedEmail.trim() || "email@school.com"}
                        </p>
                        <p className="mt-1 truncate text-[11px] text-primary-light/90">
                          {previewDept}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={cn(teachersPanel, "space-y-4 p-4")}>
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Full name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FieldIcon>
                              <User className="h-4 w-4" />
                            </FieldIcon>
                            <Input
                              placeholder="e.g. Jane Wanjiku"
                              {...field}
                              className={fieldShell}
                            />
                          </div>
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
                        <FormLabel className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Work email
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FieldIcon>
                              <Mail className="h-4 w-4" />
                            </FieldIcon>
                            <Input
                              type="email"
                              placeholder="teacher@school.com"
                              {...field}
                              className={fieldShell}
                            />
                          </div>
                        </FormControl>
                        <p className="text-[11px] text-slate-400">
                          Invitation and login link will be sent here.
                        </p>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Phone
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FieldIcon>
                              <Phone className="h-4 w-4" />
                            </FieldIcon>
                            <Input
                              placeholder="+254700000000"
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(formatPhoneNumber(e.target.value))
                              }
                              className={fieldShell}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Gender
                        </FormLabel>
                        <FormControl>
                          <GenderPills value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Department
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <SelectTrigger className={selectShell}>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DEPARTMENTS.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className={cn(teachersPanel, "p-4")}>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    After they join
                  </p>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    <li className="flex items-start gap-2">
                      <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      Assign grades and subjects from their teacher profile.
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      Set class teacher role and timetable from Classes.
                    </li>
                  </ul>
                </div>
              </form>
            </Form>
          </div>

          <DrawerFooter className="shrink-0 border-t border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 sm:px-5">
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <Button
                type="submit"
                form="invite-teacher-form"
                disabled={isLoading}
                className="h-11 flex-1 gap-2 rounded-full bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-dark disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Send invitation
                  </>
                )}
              </Button>
              <DrawerClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isLoading}
                  className="h-11 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 sm:flex-none sm:px-5"
                >
                  Cancel
                </Button>
              </DrawerClose>
            </div>
            <p className="text-center text-[11px] text-slate-400">
              They&apos;ll set their password from the invitation email.
            </p>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {invitationData && (
        <InvitationSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          invitationData={invitationData}
          schoolSubdomain={schoolConfig?.tenant?.subdomain}
        />
      )}
    </>
  );
}
