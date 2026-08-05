"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SetTeacherPasswordDialog } from "./SetTeacherPasswordDialog";
import { useTeacherAdminActions } from "@/lib/hooks/useTeacherAdminActions";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  GraduationCap,
  Award,
  School,
  BookOpen,
  Copy,
  RefreshCw,
  AlertCircle,
  KeyRound,
  Trash2,
  ArrowLeft,
  MoreHorizontal,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { useTeacherDetailSummary } from "@/lib/hooks/useTeacherDetailSummary";
import { TeacherAcademicEditor } from "./TeacherAcademicEditor";
import { ClassTeacherAssignments } from "./ClassTeacherAssignments";
import { TeacherTimetableSummary } from "./TeacherTimetableSummary";
import { TeacherAccountPanel } from "./TeacherAccountPanel";
import { TeacherActivityPanel } from "./TeacherActivityPanel";
import {
  teachersActionButton,
  teachersBadge,
  teachersField,
  teachersFieldLabel,
  teachersPanel,
  teachersPrimaryButton,
  teachersSectionHead,
  teachersTabList,
  teachersTabTrigger,
} from "./teachers-ui";
import { TeacherAvatar } from "./TeacherAvatar";
import { cn } from "@/lib/utils";
import { formatTeacherDate, formatTenantSubjectLabel } from "../utils/teachers-utils";
import { isTeacherProfileIncomplete } from "../utils/mapGraphqlTeacher";

interface TeacherDetailViewProps {
  teacherId: string;
  tenantId?: string | null;
  onClose?: () => void;
  onTeacherRemoved?: () => void;
  onTeacherUpdated?: () => void;
}

function formatGender(gender?: string) {
  if (!gender?.trim()) return null;
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
}

function TeacherDetailSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading teacher details">
      <Skeleton className="h-3 w-20 rounded-none" />
      <div className={`${teachersPanel} p-4`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <Skeleton className="h-14 w-14 shrink-0 rounded-none" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48 rounded-none" />
            <div className="flex flex-wrap gap-1.5">
              <Skeleton className="h-5 w-20 rounded-none" />
              <Skeleton className="h-5 w-14 rounded-none" />
              <Skeleton className="h-5 w-16 rounded-none" />
            </div>
          </div>
        </div>
      </div>
      <Skeleton className="h-9 w-full rounded-none" />
      <div className={`${teachersPanel} p-4`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24 rounded-none" />
              <Skeleton className="h-10 w-full rounded-none" />
              <Skeleton className="h-10 w-full rounded-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
  copyValue,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  copyValue?: string;
}) {
  return (
    <div className={teachersField}>
      <p className={teachersFieldLabel}>{label}</p>
      <div className="mt-1 flex items-start justify-between gap-2">
        <div className="min-w-0 text-sm text-[#0a1f1a] dark:text-white">
          {value}
        </div>
        {copyValue ? (
          <button
            type="button"
            className="shrink-0 rounded-none p-1 text-[#1a4d42]/40 transition-colors hover:text-[#246a59]"
            onClick={() => {
              void navigator.clipboard.writeText(copyValue);
              toast.success(`${label} copied`);
            }}
            aria-label={`Copy ${label.toLowerCase()}`}
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function InfoGroup({
  title,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#246a59]">
        {title}
      </h4>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

function AcademicSetupCta({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      type="button"
      onClick={onAction}
      className="group flex w-full items-center gap-3 rounded-none border border-dashed border-[#246a59]/35 bg-[#246a59]/[0.04] px-3 py-3 text-left transition-colors hover:border-[#246a59]/55 hover:bg-[#246a59]/[0.08]"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none bg-[#246a59]/10 text-[#246a59]">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#0a1f1a] dark:text-white">
          {title}
        </p>
        <p className="mt-0.5 text-xs text-[#1a4d42]/50">
          {description}
        </p>
      </div>
      <span className="hidden shrink-0 rounded-none bg-[#0a1f1a] px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors group-hover:bg-[#246a59] sm:inline">
        {actionLabel}
      </span>
      <Plus className="h-4 w-4 shrink-0 text-[#246a59] sm:hidden" />
    </button>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-none text-[10px] font-medium",
        isActive
          ? "border-[#246a59]/25 bg-[#e8f2ef] text-[#1a4d42]"
          : "border-amber-200 bg-amber-50 text-amber-800",
      )}
    >
      {isActive ? "Active" : "Not activated"}
    </Badge>
  );
}

export function TeacherDetailView({
  teacherId,
  tenantId,
  onClose,
  onTeacherRemoved,
  onTeacherUpdated,
}: TeacherDetailViewProps) {
  const { teacherDetail, loading, error, refetch } =
    useTeacherDetailSummary(teacherId);
  const {
    deleteTeacherRecord,
    setTeacherPassword,
    isDeleting,
    isSettingPassword,
  } = useTeacherAdminActions();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [academicEditorOpen, setAcademicEditorOpen] = useState(false);

  if (loading) {
    return <TeacherDetailSkeleton />;
  }

  if (error || !teacherDetail) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <div className="max-w-sm space-y-3 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-none bg-red-50 dark:bg-red-950/40">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#0a1f1a] dark:text-white">
              Could not load teacher
            </p>
            <p className="mt-1 text-xs text-[#1a4d42]/50">
              {error || "This teacher may have been removed or you may not have access."}
            </p>
          </div>
          <Button
            onClick={refetch}
            variant="outline"
            size="sm"
            className="rounded-none border-[#1a4d42]/15"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const teacher = teacherDetail;
  const displayName = teacher.fullName || teacher.user.name;
  const email = teacher.email || teacher.user.email;
  const gender = formatGender(teacher.gender);
  const userId = teacher.user?.id;
  const grades = teacher.tenantGradeLevels
    .map((g) => g.gradeLevel?.name || "Unknown")
    .join(", ");
  const dateOfBirth = formatTeacherDate(teacher.dateOfBirth);
  const joinDate = formatTeacherDate(teacher.createdAt);
  const profileIncomplete = isTeacherProfileIncomplete(teacher);
  const hasSubjects = teacher.tenantSubjects.length > 0;
  const hasGrades = teacher.tenantGradeLevels.length > 0;
  const hasStreams = teacher.tenantStreams.length > 0;
  const isAcademicEmpty = !hasSubjects && !hasGrades;
  const openAcademicEditor = () => setAcademicEditorOpen(true);

  const handleRemove = async () => {
    if (!tenantId) {
      toast.error("Tenant not found. Please sign in again.");
      return;
    }
    try {
      await deleteTeacherRecord(teacher.id, tenantId);
      toast.success(`${displayName} has been removed`);
      setRemoveDialogOpen(false);
      onTeacherRemoved?.();
      onClose?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove teacher",
      );
    }
  };

  return (
    <div className="space-y-3">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-0.5 text-[11px] font-medium text-[#1a4d42]/50 transition-colors hover:text-[#0a1f1a] dark:hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to list
        </button>
      )}

      {profileIncomplete && (
        <div className="flex items-center gap-2 rounded-none border border-[#246a59]/20 bg-[#e8f2ef] px-3 py-2 text-[11px] text-[#1a4d42] dark:border-[#246a59]/30 dark:bg-[#246a59]/15 dark:text-[#d4e8e2]">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#246a59]" />
          <p>
            <span className="font-semibold">Profile incomplete.</span>{" "}
            Add employee ID, date of birth, qualifications, or contact details.
          </p>
        </div>
      )}

      <div className={cn(teachersPanel)}>
        <div className="bg-[#f8fbfa] px-4 py-4 dark:bg-[#071411] sm:px-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-3.5">
              <TeacherAvatar name={displayName} size="lg" ring />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-normal tracking-tight text-[#0a1f1a] dark:text-white sm:text-2xl">
                    {displayName}
                  </h2>
                  <StatusBadge isActive={teacher.isActive ?? false} />
                </div>
                <p className="mt-1 text-sm capitalize text-[#1a4d42]/55">
                  {[
                    teacher.department,
                    teacher.role?.toLowerCase(),
                    grades || null,
                    teacher.tenantSubjects.length > 0
                      ? `${teacher.tenantSubjects.length} subject${teacher.tenantSubjects.length !== 1 ? "s" : ""}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {email ? (
                  <p className="mt-1 truncate text-xs text-[#1a4d42]/45">
                    {email}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {teacher.employeeId ? (
                <div className="hidden text-right sm:block">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
                    Employee ID
                  </p>
                  <p className="font-mono text-sm font-semibold text-[#0a1f1a] dark:text-white">
                    {teacher.employeeId}
                  </p>
                </div>
              ) : null}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(teachersActionButton, "h-8 w-8 p-0")}
                    aria-label="Actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-none">
                  {userId ? (
                    <DropdownMenuItem
                      onClick={() => setPasswordDialogOpen(true)}
                      className="cursor-pointer gap-2"
                    >
                      <KeyRound className="h-4 w-4" />
                      Set password
                    </DropdownMenuItem>
                  ) : null}
                  {userId ? <DropdownMenuSeparator /> : null}
                  <DropdownMenuItem
                    onClick={() => setRemoveDialogOpen(true)}
                    disabled={isDeleting || !tenantId}
                    className="cursor-pointer gap-2 text-red-600 focus:text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove teacher
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {userId ? (
        <SetTeacherPasswordDialog
          open={passwordDialogOpen}
          onOpenChange={setPasswordDialogOpen}
          teacherName={displayName}
          isSubmitting={isSettingPassword}
          onSubmit={async (password) => {
            await setTeacherPassword(userId, password);
            toast.success(`Password updated for ${displayName}`);
          }}
        />
      ) : null}

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent className="rounded-none border border-[#1a4d42]/12">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-[#0a1f1a]">
              Remove {displayName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This removes the teacher from your school and deletes their login
              if it is not used elsewhere. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none" disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleRemove();
              }}
              disabled={isDeleting}
              className="rounded-none bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Removing…" : "Remove teacher"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Tabs defaultValue="details">
        <TabsList className={teachersTabList}>
          <TabsTrigger value="details" className={teachersTabTrigger}>
            Details
          </TabsTrigger>
          <TabsTrigger value="academic" className={teachersTabTrigger}>
            Academic
          </TabsTrigger>
          <TabsTrigger value="assignments" className={teachersTabTrigger}>
            Classes
          </TabsTrigger>
          <TabsTrigger value="schedule" className={teachersTabTrigger}>
            Schedule
          </TabsTrigger>
          <TabsTrigger value="activity" className={teachersTabTrigger}>
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-0 space-y-3">
          <div className={`${teachersPanel} overflow-hidden`}>
            <div className={cn(teachersSectionHead, "px-4 py-2.5 sm:px-5")}>
              <h3 className="text-sm font-semibold text-[#0a1f1a] dark:text-white">
                Teacher information
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 p-3 sm:grid-cols-3 sm:p-4">
              <InfoGroup title="Personal" icon={User}>
                <DetailField label="Full name" value={displayName} />
                {gender && <DetailField label="Gender" value={gender} />}
                <DetailField
                  label="Date of birth"
                  icon={Calendar}
                  value={
                    dateOfBirth ?? (
                      <span className="font-normal text-[#1a4d42]/40">Not provided</span>
                    )
                  }
                />
                <DetailField
                  label="Status"
                  value={<StatusBadge isActive={teacher.isActive ?? false} />}
                />
              </InfoGroup>

              <InfoGroup title="Professional" icon={Award}>
                <DetailField
                  label="Employee ID"
                  icon={Briefcase}
                  copyValue={teacher.employeeId || undefined}
                  value={
                    teacher.employeeId ? (
                      <span className="font-mono">{teacher.employeeId}</span>
                    ) : (
                      <span className="font-normal text-[#1a4d42]/40">Not provided</span>
                    )
                  }
                />
                {teacher.department && (
                  <DetailField
                    label="Department"
                    value={
                      <span className="capitalize">{teacher.department}</span>
                    }
                  />
                )}
                {teacher.role && (
                  <DetailField
                    label="Role"
                    value={
                      <Badge variant="outline" className={teachersBadge}>
                        {teacher.role}
                      </Badge>
                    }
                  />
                )}
                <DetailField
                  label="Qualifications"
                  value={
                    teacher.qualifications ? (
                      teacher.qualifications
                    ) : (
                      <span className="font-normal text-[#1a4d42]/40">Not provided</span>
                    )
                  }
                />
                <DetailField
                  label="Date joined"
                  icon={Calendar}
                  value={
                    joinDate ?? (
                      <span className="font-normal text-[#1a4d42]/40">Not available</span>
                    )
                  }
                />
                <DetailField label="School" value={teacher.tenant.name} icon={School} />
              </InfoGroup>

              <InfoGroup title="Contact" icon={Mail}>
                <DetailField
                  label="Email"
                  icon={Mail}
                  copyValue={email || undefined}
                  value={
                    email ? (
                      <a
                        href={`mailto:${email}`}
                        className="break-all text-[#246a59] hover:underline"
                      >
                        {email}
                      </a>
                    ) : (
                      <span className="font-normal text-[#1a4d42]/40">Not provided</span>
                    )
                  }
                />
                <DetailField
                  label="Phone"
                  icon={Phone}
                  copyValue={teacher.phoneNumber || undefined}
                  value={
                    teacher.phoneNumber ? (
                      <a
                        href={`tel:${teacher.phoneNumber}`}
                        className="text-[#0a1f1a] hover:underline dark:text-white"
                      >
                        {teacher.phoneNumber}
                      </a>
                    ) : (
                      <span className="font-normal text-[#1a4d42]/40">Not provided</span>
                    )
                  }
                />
                <DetailField
                  label="Address"
                  icon={MapPin}
                  copyValue={teacher.address || undefined}
                  value={
                    teacher.address?.trim() ? (
                      teacher.address
                    ) : (
                      <span className="font-normal text-[#1a4d42]/40">Not provided</span>
                    )
                  }
                />
              </InfoGroup>
            </div>
          </div>

          <TeacherAccountPanel
            teacherId={teacher.id}
            email={email}
            isActive={teacher.isActive ?? false}
            userId={userId}
            hasCompletedProfile={teacher.hasCompletedProfile}
            tenantId={tenantId}
            onUpdated={() => {
              void refetch();
              onTeacherUpdated?.();
            }}
          />
        </TabsContent>

        <TabsContent value="academic" className="mt-0">
          <div className={`${teachersPanel} overflow-hidden`}>
            <div className={cn(teachersSectionHead, "flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-5")}>
              <h3 className="text-sm font-semibold text-[#0a1f1a] dark:text-white">
                Academic information
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openAcademicEditor}
                className={cn(teachersActionButton, "h-7")}
              >
                <BookOpen className="h-3 w-3" />
                {isAcademicEmpty ? "Set up" : "Edit"}
              </Button>
            </div>
            <div className="space-y-3 p-3 sm:p-4">
              {isAcademicEmpty ? (
                <div className="space-y-3">
                  <div className="rounded-none border border-[#246a59]/25 bg-[#f8fbfa] px-3 py-3 dark:bg-[#071411]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#0a1f1a] dark:text-white">
                          Teaching assignments not set up
                        </p>
                        <p className="mt-1 text-xs text-[#1a4d42]/50">
                          Choose subjects and grade levels so {displayName.split(" ")[0] || "this teacher"} can be scheduled and assigned classes.
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={openAcademicEditor}
                        className={cn(teachersPrimaryButton, "shrink-0")}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Set up assignments
                      </Button>
                    </div>
                  </div>
                  <ul className="grid gap-2 sm:grid-cols-3">
                    {[
                      { icon: BookOpen, label: "Subjects", hint: "What they teach" },
                      { icon: GraduationCap, label: "Grades", hint: "Year levels" },
                      { icon: School, label: "Streams", hint: "Optional classes" },
                    ].map(({ icon: Icon, label, hint }) => (
                      <li
                        key={label}
                        className="flex items-center gap-2.5 rounded-none border border-[#1a4d42]/10 bg-[#f8fbfa] px-3 py-2 dark:border-white/10 dark:bg-[#071411]"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-none bg-white text-[#246a59] ring-1 ring-[#1a4d42]/12 dark:bg-[#0c1a17]">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[#0a1f1a] dark:text-white">
                            {label}
                          </p>
                          <p className="text-[10px] text-[#1a4d42]/40">{hint}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <>
                  <div className="rounded-none border border-[#1a4d42]/10 bg-[#f8fbfa] px-3 py-2.5 dark:border-white/10 dark:bg-[#071411]">
                    <p className="text-sm font-medium text-[#0a1f1a] dark:text-white">
                      Workload summary
                    </p>
                    <p className="mt-1 text-xs text-[#1a4d42]/50">
                      Teaches {teacher.tenantSubjects.length} subject
                      {teacher.tenantSubjects.length !== 1 ? "s" : ""} across{" "}
                      {teacher.tenantGradeLevels.length} grade
                      {teacher.tenantGradeLevels.length !== 1 ? "s" : ""}
                      {hasStreams
                        ? `, ${teacher.tenantStreams.length} stream${teacher.tenantStreams.length !== 1 ? "s" : ""}`
                        : ""}
                    </p>
                    {teacher.updatedAt ? (
                      <p className="mt-1 text-[11px] text-[#1a4d42]/40">
                        Last updated {formatTeacherDate(teacher.updatedAt)}
                      </p>
                    ) : null}
                  </div>

                  <InfoGroup title="Subjects taught" icon={BookOpen}>
                    {hasSubjects ? (
                      <div className="flex flex-wrap gap-1.5">
                        {teacher.tenantSubjects.map((subject) => (
                          <Badge
                            key={subject.id}
                            variant="outline"
                            className="rounded-none border-[#246a59]/25 bg-[#e8f2ef] text-[11px] font-medium text-[#1a4d42]"
                          >
                            {formatTenantSubjectLabel(subject)}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <AcademicSetupCta
                        icon={BookOpen}
                        title="No subjects assigned"
                        description="Pick the subjects this teacher can teach."
                        actionLabel="Add subjects"
                        onAction={openAcademicEditor}
                      />
                    )}
                  </InfoGroup>

                  <InfoGroup title="Grade levels" icon={GraduationCap}>
                    {hasGrades ? (
                      <div className="flex flex-wrap gap-1.5">
                        {teacher.tenantGradeLevels.map((gradeLevel) => (
                          <Badge
                            key={gradeLevel.id}
                            variant="outline"
                            className="rounded-none border-[#1a4d42]/15 bg-[#f8fbfa] text-[11px] font-medium text-[#0a1f1a] dark:text-white"
                          >
                            {gradeLevel.gradeLevel?.name || "Unknown"}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <AcademicSetupCta
                        icon={GraduationCap}
                        title="No grade levels assigned"
                        description="Choose which grades this teacher covers."
                        actionLabel="Assign grades"
                        onAction={openAcademicEditor}
                      />
                    )}
                  </InfoGroup>

                  <InfoGroup title="Streams / classes" icon={School}>
                    {hasStreams ? (
                      <div className="flex flex-wrap gap-1.5">
                        {teacher.tenantStreams.map((stream) => (
                          <Badge
                            key={stream.id}
                            variant="outline"
                            className="rounded-none border-[#246a59]/20 bg-white text-[11px] font-medium text-[#1a4d42]"
                          >
                            {stream.stream?.name || "Stream"}
                            {stream.tenantGradeLevel?.gradeLevel?.name
                              ? ` · ${stream.tenantGradeLevel.gradeLevel.name}`
                              : ""}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <AcademicSetupCta
                        icon={School}
                        title="No streams assigned"
                        description="Optional — narrow to specific classes, or leave blank for all streams."
                        actionLabel="Assign streams"
                        onAction={openAcademicEditor}
                      />
                    )}
                  </InfoGroup>
                </>
              )}
            </div>
          </div>

          <TeacherAcademicEditor
            teacherId={teacher.id}
            teacherName={displayName}
            initialSubjectIds={teacher.tenantSubjects.map((s) => s.id)}
            initialGradeLevelIds={teacher.tenantGradeLevels.map((g) => g.id)}
            initialStreamIds={teacher.tenantStreams.map((s) => s.id)}
            tenantSubjects={teacher.tenantSubjects}
            tenantGradeLevels={teacher.tenantGradeLevels}
            tenantStreams={teacher.tenantStreams}
            onSaved={refetch}
            open={academicEditorOpen}
            onOpenChange={setAcademicEditorOpen}
            hideTrigger
          />
        </TabsContent>

        <TabsContent value="assignments" className="mt-0">
          <ClassTeacherAssignments
            assignments={teacher.classTeacherAssignments}
            teacherName={displayName}
          />
        </TabsContent>

        <TabsContent value="schedule" className="mt-0">
          <TeacherTimetableSummary
            teacherId={teacher.id}
            teacherName={displayName}
          />
        </TabsContent>

        <TabsContent value="activity" className="mt-0">
          <TeacherActivityPanel
            teacherUserId={userId}
            teacherName={displayName}
            tenantSubjectIds={teacher.tenantSubjects.map((s) => s.id)}
            tenantGradeLevelIds={teacher.tenantGradeLevels.map((g) => g.id)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
