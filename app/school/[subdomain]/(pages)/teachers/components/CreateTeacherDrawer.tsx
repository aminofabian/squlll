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
import { UserPlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSchoolConfig } from "@/lib/hooks/useSchoolConfig";
import { InvitationSuccessModal } from "./InvitationSuccessModal";

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

const fieldShell =
  "h-10 rounded-none border border-[#1a4d42]/15 bg-white text-sm shadow-none placeholder:text-[#1a4d42]/40 focus-visible:border-[#246a59]/50 focus-visible:ring-1 focus-visible:ring-[#246a59]/25 dark:border-white/15 dark:bg-[#0c1a17] dark:placeholder:text-white/40";

const selectShell =
  "h-10 rounded-none border border-[#1a4d42]/15 bg-white text-sm shadow-none focus:ring-1 focus:ring-[#246a59]/25 dark:border-white/15 dark:bg-[#0c1a17]";

const labelClass = "text-xs font-medium text-[#0a1f1a] dark:text-white/80";

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
              "h-10 rounded-none px-3 text-sm font-medium transition-colors",
              active
                ? "bg-[#0a1f1a] text-white"
                : "border border-[#1a4d42]/15 bg-white text-[#1a4d42]/70 hover:border-[#246a59]/35 dark:border-white/15 dark:bg-[#0c1a17] dark:text-white/55",
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

  return (
    <>
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="default"
            className="flex items-center gap-2 rounded-none bg-[#0a1f1a] text-white shadow-none hover:bg-[#246a59]"
            disabled={isLoading}
          >
            <UserPlus className="h-4 w-4" />
            Add teacher
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
                  Add teacher
                </DrawerTitle>
                <DrawerDescription className="mt-0.5 text-left text-sm text-[#1a4d42]/55 dark:text-white/45">
                  They&apos;ll get an email to join
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
            <Form {...form}>
              <form
                id="invite-teacher-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {isLoading && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-[#071411]/80">
                    <div className="flex items-center gap-2 text-sm text-[#0a1f1a] dark:text-white">
                      <Loader2 className="h-4 w-4 animate-spin text-[#246a59]" />
                      Sending invitation…
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className={labelClass}>Full name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Jane Wanjiku"
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
                      <FormLabel className={labelClass}>Work email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="teacher@school.com"
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
                  name="phoneNumber"
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
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className={labelClass}>Gender</FormLabel>
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
                      <FormLabel className={labelClass}>Department</FormLabel>
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
              </form>
            </Form>
          </div>

          <DrawerFooter className="shrink-0 border-t border-[#1a4d42]/12 px-5 py-4 dark:border-white/10">
            <div className="flex w-full gap-2">
              <Button
                type="submit"
                form="invite-teacher-form"
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
