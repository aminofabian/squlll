"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  Users,
  Loader2,
  Search,
  Link2,
  X,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { graphqlClient } from "@/lib/graphql-client";
import { gql } from "graphql-request";
import { getTenantInfo } from "@/lib/utils";
import { studentsPanel } from "./students-ui";

const inviteSchema = z.object({
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
});

type InviteFormData = z.infer<typeof inviteSchema>;

type LinkMode = "invite" | "existing";

export type LinkParentStudent = {
  id: string;
  name: string;
  admissionNumber: string;
  gradeLevelName?: string;
  streamName?: string;
};

interface LinkParentDrawerProps {
  student: LinkParentStudent;
  linkedParentIds?: string[];
  onLinked: () => void;
  defaultOpen?: boolean;
  trigger?: React.ReactNode;
}

function formatPhoneNumber(value: string): string {
  if (!value || value === "+" || value === "+2" || value === "+25") return "+254";
  let cleaned = value.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("0")) cleaned = "+254" + cleaned.substring(1);
  if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
  return cleaned;
}

const GET_ALL_PARENTS = gql`
  query GetAllParentsForLink {
    getAllParents {
      id
      name
      email
      phone
      students {
        id
      }
    }
  }
`;

const ADD_STUDENTS_TO_PARENT = gql`
  mutation AddStudentsToParent(
    $parentId: String!
    $studentIds: [String!]!
    $tenantId: String!
  ) {
    addStudentsToParent(
      parentId: $parentId
      studentIds: $studentIds
      tenantId: $tenantId
    )
  }
`;

const fieldShell =
  "h-10 rounded-xl border-0 bg-slate-100/80 text-sm shadow-none ring-1 ring-inset ring-slate-200/70 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary/40 dark:bg-slate-800/60 dark:ring-slate-700/60";

export function LinkParentDrawer({
  student,
  linkedParentIds = [],
  onLinked,
  defaultOpen = false,
  trigger,
}: LinkParentDrawerProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [mode, setMode] = useState<LinkMode>("invite");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allParents, setAllParents] = useState<
    { id: string; name: string; email: string; phone: string; studentIds: string[] }[]
  >([]);
  const [loadingParents, setLoadingParents] = useState(false);
  const [linkingParentId, setLinkingParentId] = useState<string | null>(null);

  const tenantId = getTenantInfo()?.tenantId;

  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "+254",
      relationship: undefined,
    },
  });

  const loadParents = useCallback(async () => {
    setLoadingParents(true);
    try {
      const response = await graphqlClient.request<{
        getAllParents: {
          id: string;
          name: string;
          email: string;
          phone: string;
          students: { id: string }[];
        }[];
      }>(GET_ALL_PARENTS);

      setAllParents(
        (response.getAllParents ?? []).map((p) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          phone: p.phone,
          studentIds: p.students?.map((s) => s.id) ?? [],
        })),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load parents");
    } finally {
      setLoadingParents(false);
    }
  }, []);

  useEffect(() => {
    if (open && mode === "existing") {
      void loadParents();
    }
  }, [open, mode, loadParents]);

  const availableParents = useMemo(() => {
    const linked = new Set(linkedParentIds);
    const q = searchTerm.trim().toLowerCase();

    return allParents
      .filter((p) => !linked.has(p.id) && !p.studentIds.includes(student.id))
      .filter((p) => {
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.phone.includes(q)
        );
      });
  }, [allParents, linkedParentIds, searchTerm, student.id]);

  const inviteParent = async (data: InviteFormData) => {
    setIsSubmitting(true);
    try {
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
              }
            }
          `,
          variables: {
            createParentDto: {
              email: data.email.trim(),
              name: data.name,
              phone: data.phone,
            },
            studentIds: [student.id],
          },
        }),
      });

      const result = await response.json();
      if (result.errors?.length) {
        throw new Error(result.errors[0]?.message || "Failed to invite parent");
      }
      if (!result.data?.inviteParent) {
        throw new Error("No invitation was created");
      }

      toast.success("Parent invited", {
        description: `${data.name} will receive portal access for ${student.name}.`,
      });

      form.reset({ name: "", email: "", phone: "+254", relationship: undefined });
      setOpen(false);
      onLinked();
    } catch (err) {
      toast.error("Could not invite parent", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const linkExistingParent = async (parentId: string, parentName: string) => {
    if (!tenantId) {
      toast.error("Missing school context");
      return;
    }

    setLinkingParentId(parentId);
    try {
      await graphqlClient.request(ADD_STUDENTS_TO_PARENT, {
        parentId,
        studentIds: [student.id],
        tenantId,
      });

      toast.success("Parent linked", {
        description: `${parentName} is now linked to ${student.name}.`,
      });

      setOpen(false);
      onLinked();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to link parent");
    } finally {
      setLinkingParentId(null);
    }
  };

  const gradeLabel = student.streamName
    ? `${student.gradeLevelName} · ${student.streamName}`
    : student.gradeLevelName;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="h-8 gap-1.5 text-xs">
            <UserPlus className="h-3.5 w-3.5" />
            Link parent
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent
        className="ml-auto flex h-[100dvh] max-h-[100dvh] w-full flex-col border-l border-slate-200/80 bg-[#f5f6f8] dark:border-slate-800 dark:bg-slate-950 sm:max-w-[440px]"
        data-vaul-drawer-direction="right"
      >
        <DrawerHeader className="relative shrink-0 overflow-hidden border-0 px-0 pb-0 pt-0">
          <div className="relative border-b border-primary/10 bg-gradient-to-br from-primary/[0.08] via-white to-primary/[0.04] px-5 pb-4 pt-5 dark:from-primary/15 dark:via-slate-900 dark:to-primary/5">
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <DrawerTitle className="text-left text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Link a parent
                </DrawerTitle>
                <DrawerDescription className="mt-0.5 text-left text-sm text-slate-500">
                  Connect a guardian to {student.name}
                </DrawerDescription>
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

            <div className={cn(studentsPanel, "mt-4 p-3")}>
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {student.name}
              </p>
              <p className="mt-0.5 font-mono text-xs text-slate-500">
                {student.admissionNumber}
                {gradeLabel ? ` · ${gradeLabel}` : ""}
              </p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {([
                { id: "invite" as const, label: "Invite new", icon: UserPlus },
                { id: "existing" as const, label: "Link existing", icon: Link2 },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMode(tab.id)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all",
                    mode === tab.id
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "bg-white/80 text-slate-600 ring-1 ring-inset ring-slate-200/70 hover:bg-white dark:bg-slate-900/60 dark:text-slate-300 dark:ring-slate-700/60",
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </DrawerHeader>

        <div className="relative flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {isSubmitting && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#f5f6f8]/80 backdrop-blur-[2px] dark:bg-slate-950/80">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {mode === "invite" ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => void inviteParent(data))}
                className="space-y-4"
              >
                <div className={cn(studentsPanel, "space-y-4 p-4")}>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-medium text-slate-600">
                          Full name
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Guardian full name" {...field} className={fieldShell} />
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
                        <FormLabel className="text-xs font-medium text-slate-600">
                          Relationship
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className={fieldShell}>
                              <SelectValue placeholder="Select (optional)" />
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

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-medium text-slate-600">
                          Phone
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+254700000000"
                            value={field.value}
                            onChange={(e) => field.onChange(formatPhoneNumber(e.target.value))}
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
                        <FormLabel className="text-xs font-medium text-slate-600">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="parent@example.com"
                            {...field}
                            className={fieldShell}
                          />
                        </FormControl>
                        <p className="text-[11px] text-slate-400">
                          An invitation will be sent to this address for portal access.
                        </p>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <DrawerFooter className="px-0 pb-0 pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-full bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-dark"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending invite…
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Send invitation
                      </>
                    )}
                  </Button>
                </DrawerFooter>
              </form>
            </Form>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or phone…"
                  className={cn(fieldShell, "pl-10")}
                />
              </div>

              {loadingParents ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : availableParents.length === 0 ? (
                <div className={cn(studentsPanel, "p-4 text-center")}>
                  <Users className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    No parents to link
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {searchTerm
                      ? "Try a different search, or invite a new parent instead."
                      : "All existing parents are already linked, or none exist yet."}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3 h-8 text-xs"
                    onClick={() => setMode("invite")}
                  >
                    Invite new parent
                  </Button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {availableParents.map((parent) => (
                    <li
                      key={parent.id}
                      className={cn(studentsPanel, "flex items-center gap-3 p-3")}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                          {parent.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">{parent.email}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 shrink-0 gap-1 text-xs"
                        disabled={linkingParentId === parent.id}
                        onClick={() => void linkExistingParent(parent.id, parent.name)}
                      >
                        {linkingParentId === parent.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Link2 className="h-3 w-3" />
                        )}
                        Link
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
