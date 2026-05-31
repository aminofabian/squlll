"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { useTeacherDetailSummary } from "@/lib/hooks/useTeacherDetailSummary";
import { TeacherAcademicEditor } from "./TeacherAcademicEditor";
import { teachersPanel } from "./teachers-ui";
import { TeacherAvatar } from "./TeacherAvatar";
import { cn } from "@/lib/utils";

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

function InfoSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800">
      <h3 className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        <Icon className="h-3 w-3 shrink-0" />
        {title}
      </h3>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 first:pt-0 last:pb-0">
      <span className="shrink-0 text-[11px] text-slate-400">{label}</span>
      <span className="min-w-0 text-right text-xs font-medium text-slate-700 dark:text-slate-200">
        {value}
      </span>
    </div>
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
    activateTeacherRecord,
    isDeleting,
    isSettingPassword,
    isActivating,
  } = useTeacherAdminActions();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="space-y-3 text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-slate-400" />
          <p className="text-sm text-slate-500">Loading teacher details…</p>
        </div>
      </div>
    );
  }

  if (error || !teacherDetail) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="space-y-3 text-center">
          <AlertCircle className="mx-auto h-7 w-7 text-red-400" />
          <p className="text-sm text-red-600">{error || "Teacher not found"}</p>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
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

  const handleActivate = async () => {
    try {
      const result = await activateTeacherRecord(teacher.id);
      toast.success(result.message || `${displayName} has been activated`);
      await refetch();
      onTeacherUpdated?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to activate teacher",
      );
    }
  };

  return (
    <div className="space-y-5">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to list
        </button>
      )}

      <div className={`${teachersPanel} p-5`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <TeacherAvatar name={displayName} size="lg" />
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {displayName}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                {teacher.department && (
                  <span className="inline-flex items-center gap-1 capitalize">
                    <Award className="h-3 w-3 text-slate-400" />
                    {teacher.department}
                  </span>
                )}
                {teacher.role && (
                  <Badge
                    variant="outline"
                    className="border-sky-200 bg-sky-50 text-[10px] font-normal capitalize text-sky-700"
                  >
                    {teacher.role}
                  </Badge>
                )}
                {grades && (
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="h-3 w-3 text-slate-400" />
                    {grades}
                  </span>
                )}
                {teacher.tenantSubjects.length > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <BookOpen className="h-3 w-3 text-slate-400" />
                    {teacher.tenantSubjects.length} subject
                    {teacher.tenantSubjects.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="mt-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-normal",
                    teacher.isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700",
                  )}
                >
                  {teacher.isActive ? "Active" : "Not activated"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {!teacher.isActive && (
              <Button
                type="button"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => void handleActivate()}
                disabled={isActivating}
              >
                {isActivating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle className="h-3.5 w-3.5" />
                )}
                {isActivating ? "Activating…" : "Activate"}
              </Button>
            )}
            {userId ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setPasswordDialogOpen(true)}
              >
                <KeyRound className="h-3.5 w-3.5" />
                Set password
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-red-200 text-xs text-red-700 hover:bg-red-50"
              onClick={() => setRemoveDialogOpen(true)}
              disabled={isDeleting || !tenantId}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </Button>
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
        <TabsList className="mb-4 grid h-9 grid-cols-3 rounded-lg border border-slate-200/80 bg-slate-50/80 p-0.5 dark:border-slate-800">
          <TabsTrigger
            value="details"
            className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Details
          </TabsTrigger>
          <TabsTrigger
            value="academic"
            className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Academic
          </TabsTrigger>
          <TabsTrigger
            value="assignments"
            className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className={`${teachersPanel} overflow-hidden`}>
            <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                Teacher information
              </h3>
              <p className="text-[10px] text-slate-400">
                Personal and contact details for {displayName}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-3">
              <InfoSection title="Personal information" icon={User}>
                <InfoRow label="Full name" value={displayName} />
                {gender && <InfoRow label="Gender" value={gender} />}
                <InfoRow
                  label="Status"
                  value={
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-normal",
                        teacher.isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-amber-200 bg-amber-50 text-amber-700",
                      )}
                    >
                      {teacher.isActive ? "Active" : "Not activated"}
                    </Badge>
                  }
                />
              </InfoSection>

              <InfoSection title="Professional information" icon={Award}>
                {teacher.department && (
                  <InfoRow
                    label="Department"
                    value={
                      <span className="capitalize">{teacher.department}</span>
                    }
                  />
                )}
                {teacher.role && (
                  <InfoRow
                    label="Role"
                    value={
                      <Badge
                        variant="outline"
                        className="border-sky-200 bg-sky-50 text-[10px] font-normal capitalize text-sky-700"
                      >
                        {teacher.role}
                      </Badge>
                    }
                  />
                )}
                <InfoRow label="School" value={teacher.tenant.name} />
              </InfoSection>

              <InfoSection title="Contact information" icon={Mail}>
                <InfoRow
                  label="Email"
                  value={
                    email ? (
                      <span className="inline-flex items-center gap-1">
                        <a
                          href={`mailto:${email}`}
                          className="break-all text-emerald-700 hover:underline dark:text-emerald-400"
                        >
                          {email}
                        </a>
                        <button
                          type="button"
                          className="shrink-0 text-slate-400 hover:text-slate-600"
                          onClick={() => {
                            void navigator.clipboard.writeText(email);
                            toast.success("Email copied");
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </span>
                    ) : (
                      <span className="text-slate-400">Not provided</span>
                    )
                  }
                />
                <InfoRow
                  label="Phone"
                  value={
                    teacher.phoneNumber ? (
                      <span className="inline-flex items-center gap-1">
                        <a
                          href={`tel:${teacher.phoneNumber}`}
                          className="text-slate-800 hover:underline dark:text-slate-200"
                        >
                          {teacher.phoneNumber}
                        </a>
                        <button
                          type="button"
                          className="shrink-0 text-slate-400 hover:text-slate-600"
                          onClick={() => {
                            void navigator.clipboard.writeText(
                              teacher.phoneNumber || "",
                            );
                            toast.success("Phone copied");
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </span>
                    ) : (
                      <span className="text-slate-400">Not provided</span>
                    )
                  }
                />
              </InfoSection>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="academic">
          <div className={`${teachersPanel} overflow-hidden`}>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  Academic information
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Subjects, grades, and streams for {displayName}
                </p>
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
              />
            </div>
            <div className="space-y-4 p-4">
              <InfoSection title="Subjects taught" icon={BookOpen}>
                {teacher.tenantSubjects.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {teacher.tenantSubjects.map((subject) => (
                      <Badge
                        key={subject.id}
                        variant="outline"
                        className="border-emerald-200 bg-emerald-50 text-[10px] font-normal text-emerald-700"
                      >
                        {subject.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    No subjects assigned yet.
                  </p>
                )}
              </InfoSection>

              <InfoSection title="Grade levels" icon={GraduationCap}>
                {teacher.tenantGradeLevels.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {teacher.tenantGradeLevels.map((gradeLevel) => (
                      <Badge
                        key={gradeLevel.id}
                        variant="outline"
                        className="border-violet-200 bg-violet-50 text-[10px] font-normal text-violet-700"
                      >
                        {gradeLevel.gradeLevel?.name || "Unknown"}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    No grade levels assigned yet.
                  </p>
                )}
              </InfoSection>

              <InfoSection title="Streams / classes" icon={School}>
                {teacher.tenantStreams.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {teacher.tenantStreams.map((stream) => (
                      <Badge
                        key={stream.id}
                        variant="outline"
                        className="border-sky-200 bg-sky-50 text-[10px] font-normal text-sky-700"
                      >
                        {stream.stream?.name || "Stream"}
                        {stream.tenantGradeLevel?.gradeLevel?.name
                          ? ` · ${stream.tenantGradeLevel.gradeLevel.name}`
                          : ""}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    No streams assigned.
                  </p>
                )}
              </InfoSection>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assignments">
          <div className={`${teachersPanel} overflow-hidden`}>
            <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Class teacher assignments
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Classes where {displayName} is the class teacher
              </p>
            </div>
            <div className="p-4">
              {teacher.classTeacherAssignments.length > 0 ? (
                <div className="space-y-2">
                  {teacher.classTeacherAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/50 px-3 py-2.5 text-sm dark:border-slate-800"
                    >
                      <School className="h-4 w-4 text-slate-400" />
                      {assignment.gradeLevel?.gradeLevel?.name ||
                        "Unknown grade"}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-xs text-slate-400">
                  No class teacher assignments
                </p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
