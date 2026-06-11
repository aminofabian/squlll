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
  Loader2,
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
import { teachersPanel } from "./teachers-ui";
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
    <div className="space-y-5" aria-busy="true" aria-label="Loading teacher details">
      <Skeleton className="h-4 w-24" />
      <div className={`${teachersPanel} p-5`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-48" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className={`${teachersPanel} p-5`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
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
  icon: Icon,
  copyValue,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  copyValue?: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50/80 px-3 py-2.5 dark:bg-slate-800/30">
      <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {Icon ? <Icon className="h-3 w-3 shrink-0" /> : null}
        {label}
      </p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="min-w-0 text-sm font-medium text-slate-800 dark:text-slate-100">
          {value}
        </div>
        {copyValue ? (
          <button
            type="button"
            className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-600 dark:hover:bg-slate-700"
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
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h4 className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
        <Icon className="h-3.5 w-3.5 text-slate-400" />
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
        {title}
      </p>
      <p className="mt-1 max-w-xs text-xs text-slate-400">{description}</p>
    </div>
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
      className="group flex w-full items-center gap-3 rounded-xl border border-dashed border-primary/30 bg-primary/[0.04] px-4 py-3.5 text-left transition-all hover:border-primary/50 hover:bg-primary/[0.08] dark:border-primary/25 dark:bg-primary/10 dark:hover:bg-primary/15"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
          {title}
        </p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
      <span className="hidden shrink-0 rounded-full bg-primary px-3 py-1.5 text-[11px] font-medium text-white shadow-sm transition-colors group-hover:bg-primary-dark sm:inline">
        {actionLabel}
      </span>
      <Plus className="h-4 w-4 shrink-0 text-primary sm:hidden" />
    </button>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[11px] font-medium",
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
          : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
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
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="max-w-sm space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
              Could not load teacher
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {error || "This teacher may have been removed or you may not have access."}
            </p>
          </div>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
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
    <div className="space-y-5">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to list
        </button>
      )}

      {profileIncomplete && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Profile incomplete</p>
            <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">
              Some required details are missing. Review employee ID, date of birth,
              qualifications, and contact information below.
            </p>
          </div>
        </div>
      )}

      {/* Profile summary */}
      <div
        className={cn(
          teachersPanel,
          "overflow-hidden bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-900/40 dark:to-slate-950/40",
        )}
      >
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <TeacherAvatar name={displayName} size="lg" ring />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-xl">
                    {displayName}
                  </h2>
                  <StatusBadge isActive={teacher.isActive ?? false} />
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500">
                  {teacher.department && (
                    <span className="inline-flex items-center gap-1 capitalize">
                      <Award className="h-3.5 w-3.5 text-slate-400" />
                      {teacher.department}
                    </span>
                  )}
                  {teacher.role && (
                    <Badge
                      variant="outline"
                      className="border-sky-200 bg-sky-50 text-[10px] font-medium capitalize text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-400"
                    >
                      {teacher.role}
                    </Badge>
                  )}
                  {grades && (
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                      {grades}
                    </span>
                  )}
                  {teacher.tenantSubjects.length > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                      {teacher.tenantSubjects.length} subject
                      {teacher.tenantSubjects.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {email && (
                  <p className="mt-2 truncate text-xs text-slate-400">{email}</p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
              {teacher.employeeId && (
                <div className="hidden text-right sm:block">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Employee ID
                  </p>
                  <p className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {teacher.employeeId}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 text-xs"
                  >
                    Actions
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {displayName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the teacher from your school and deletes their login
              if it is not used elsewhere. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleRemove();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Removing…" : "Remove teacher"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Tabs defaultValue="details">
        <TabsList className="mb-4 inline-flex h-10 w-full rounded-lg border border-slate-200/80 bg-slate-50/80 p-1 dark:border-slate-800 dark:bg-slate-900/60 sm:w-auto">
          <TabsTrigger
            value="details"
            className="flex-1 rounded-md px-3 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm sm:flex-none sm:px-4 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-100"
          >
            Details
          </TabsTrigger>
          <TabsTrigger
            value="academic"
            className="flex-1 rounded-md px-3 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm sm:flex-none sm:px-4 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-100"
          >
            Academic
          </TabsTrigger>
          <TabsTrigger
            value="assignments"
            className="flex-1 rounded-md px-3 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm sm:flex-none sm:px-4 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-100"
          >
            Classes
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="flex-1 rounded-md px-3 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm sm:flex-none sm:px-4 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-100"
          >
            Schedule
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="flex-1 rounded-md px-3 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm sm:flex-none sm:px-4 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-100"
          >
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-0 space-y-5">
          <div className={`${teachersPanel} overflow-hidden`}>
            <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Teacher information
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Personal and contact details for {displayName}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-3 sm:p-5">
              <InfoGroup title="Personal" icon={User}>
                <DetailField label="Full name" value={displayName} />
                {gender && <DetailField label="Gender" value={gender} />}
                <DetailField
                  label="Date of birth"
                  icon={Calendar}
                  value={
                    dateOfBirth ?? (
                      <span className="text-slate-400">Not provided</span>
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
                      <span className="text-slate-400">Not provided</span>
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
                      <Badge
                        variant="outline"
                        className="border-sky-200 bg-sky-50 text-[10px] font-medium capitalize text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-400"
                      >
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
                      <span className="text-slate-400">Not provided</span>
                    )
                  }
                />
                <DetailField
                  label="Date joined"
                  icon={Calendar}
                  value={
                    joinDate ?? (
                      <span className="text-slate-400">Not available</span>
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
                        className="break-all text-emerald-700 hover:underline dark:text-emerald-400"
                      >
                        {email}
                      </a>
                    ) : (
                      <span className="text-slate-400">Not provided</span>
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
                        className="text-slate-800 hover:underline dark:text-slate-200"
                      >
                        {teacher.phoneNumber}
                      </a>
                    ) : (
                      <span className="text-slate-400">Not provided</span>
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
                      <span className="text-slate-400">Not provided</span>
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
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Academic information
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Subjects, grades, and streams for {displayName}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openAcademicEditor}
                className="h-7 gap-1 px-2.5 text-xs"
              >
                <BookOpen className="h-3 w-3" />
                {isAcademicEmpty ? "Set up" : "Edit"}
              </Button>
            </div>
            <div className="space-y-5 p-4 sm:p-5">
              {isAcademicEmpty ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.06] via-white to-primary/[0.03] px-4 py-4 dark:from-primary/10 dark:via-slate-900 dark:to-primary/5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          Teaching assignments not set up
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Choose subjects and grade levels so {displayName.split(" ")[0] || "this teacher"} can be scheduled and assigned classes.
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={openAcademicEditor}
                        className="h-9 shrink-0 gap-1.5 rounded-full bg-primary px-4 text-xs text-white hover:bg-primary-dark"
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
                        className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800/30"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 ring-1 ring-slate-200/80 dark:bg-slate-900 dark:ring-slate-700">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                            {label}
                          </p>
                          <p className="text-[10px] text-slate-400">{hint}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <>
                  <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/30">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      Workload summary
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Teaches {teacher.tenantSubjects.length} subject
                      {teacher.tenantSubjects.length !== 1 ? "s" : ""} across{" "}
                      {teacher.tenantGradeLevels.length} grade
                      {teacher.tenantGradeLevels.length !== 1 ? "s" : ""}
                      {hasStreams
                        ? `, ${teacher.tenantStreams.length} stream${teacher.tenantStreams.length !== 1 ? "s" : ""}`
                        : ""}
                    </p>
                    {teacher.updatedAt ? (
                      <p className="mt-1 text-[11px] text-slate-400">
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
                            className="border-emerald-200 bg-emerald-50 text-[11px] font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
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
                            className="border-violet-200 bg-violet-50 text-[11px] font-medium text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-400"
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
                            className="border-sky-200 bg-sky-50 text-[11px] font-medium text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-400"
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
