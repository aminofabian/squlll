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
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  User, 
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Award,
  Calendar,
  School,
  BookOpen,
  Info,
  Copy,
  RefreshCw,
  Loader2,
  AlertCircle,
  KeyRound,
  Trash2,
} from "lucide-react";
import { useTeacherDetailSummary } from "@/lib/hooks/useTeacherDetailSummary";
import { TeacherAcademicEditor } from "./TeacherAcademicEditor";
import { teachersPanel, teachersPanelMuted } from "./teachers-ui";

interface TeacherDetailViewProps {
  teacherId: string;
  tenantId?: string | null;
  onClose?: () => void;
  onTeacherRemoved?: () => void;
}

export function TeacherDetailView({
  teacherId,
  tenantId,
  onClose,
  onTeacherRemoved,
}: TeacherDetailViewProps) {
  const { teacherDetail, loading, error, refetch } = useTeacherDetailSummary(teacherId);
  const {
    deleteTeacherRecord,
    setTeacherPassword,
    isDeleting,
    isSettingPassword,
  } = useTeacherAdminActions();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  // Show loading state
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
  const userId = teacher.user?.id;

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
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 px-2 text-xs text-slate-500 hover:text-slate-800"
        >
          ← Back to list
        </Button>
      )}

      <div className={`${teachersPanel} p-5`}>
        <div className="flex flex-col gap-5 md:flex-row">
          <div className="shrink-0">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-slate-200/80">
              <div className="flex h-full w-full items-center justify-center bg-slate-100">
                <User className="h-10 w-10 text-slate-400" />
              </div>
              <div
                className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${
                  teacher.isActive ? "bg-emerald-500" : "bg-slate-300"
                }`}
              />
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {teacher.fullName || teacher.user.name}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                {teacher.department && (
                  <div className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-slate-400" />
                    <span>{teacher.department}</span>
                  </div>
                )}
                {teacher.role && (
                  <div className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>{teacher.role}</span>
                  </div>
                )}
                {teacher.tenantGradeLevels.length > 0 && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                    <span>{teacher.tenantGradeLevels.map(g => g.gradeLevel?.name || 'Unknown').join(', ')}</span>
                  </div>
                )}
                {teacher.tenantSubjects.length > 0 && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                    <span>{teacher.tenantSubjects.length} Subject{teacher.tenantSubjects.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs capitalize ${
                  teacher.isActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                {teacher.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:justify-end">
            {userId ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setPasswordDialogOpen(true)}
              >
                <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                Set password
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 border-red-200 text-xs text-red-700 hover:bg-red-50 hover:text-red-800"
              onClick={() => setRemoveDialogOpen(true)}
              disabled={isDeleting}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
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
      
      {/* Teacher details tabs */}
      <Tabs defaultValue="details">
        <TabsList className="mb-4 grid h-9 grid-cols-3 rounded-lg border border-slate-200/80 bg-slate-50/80 p-0.5 dark:border-slate-800">
          <TabsTrigger value="details" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">Details</TabsTrigger>
          <TabsTrigger value="academic" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">Academic</TabsTrigger>
          <TabsTrigger value="assignments" className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">Assignments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card className={`${teachersPanel} overflow-hidden`}>
            <CardHeader className="border-b border-slate-200/80 bg-slate-50/50 px-4 py-3">
              <CardTitle className="font-mono font-bold tracking-wide text-[var(--color-text)]">Teacher Information</CardTitle>
              <CardDescription className="font-mono text-[var(--color-textSecondary)]">
                Detailed personal information about {teacher.fullName || teacher.user.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personal Information */}
                <div className={`${teachersPanelMuted} p-5`}>
                  <div className="inline-block w-fit px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-md mb-4">
                    <h3 className="text-xs font-mono uppercase tracking-wide text-[var(--color-primary)] flex items-center gap-2">
                      <User className="h-3 w-3" />
                      Personal Information
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]/20">
                      <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)]">Full Name</div>
                      <div className="font-mono text-sm text-[var(--color-text)] text-right">{teacher.fullName || teacher.user.name}</div>
                    </div>
                    {teacher.gender && (
                      <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]/20">
                        <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)]">Gender</div>
                        <div className="font-mono text-sm text-[var(--color-text)] capitalize">{teacher.gender.toLowerCase()}</div>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2">
                      <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)]">Status</div>
                      <Badge className={`font-mono text-xs capitalize ${
                        teacher.isActive 
                          ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20' 
                          : 'bg-[var(--color-textSecondary)]/10 text-[var(--color-textSecondary)] border-[var(--color-textSecondary)]/20'
                      }`}>
                        {teacher.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className={`${teachersPanelMuted} p-5`}>
                  <div className="inline-block w-fit px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-md mb-4">
                    <h3 className="text-xs font-mono uppercase tracking-wide text-[var(--color-primary)] flex items-center gap-2">
                      <Award className="h-3 w-3" />
                      Professional Information
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {teacher.department && (
                      <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]/20">
                        <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)]">Department</div>
                        <div className="font-mono text-sm text-[var(--color-text)]">{teacher.department}</div>
                      </div>
                    )}
                    {teacher.role && (
                      <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]/20">
                        <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)]">Role</div>
                        <div className="font-mono text-sm text-[var(--color-text)] capitalize">{teacher.role}</div>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2">
                      <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)]">School</div>
                      <div className="font-mono text-sm text-[var(--color-text)]">{teacher.tenant.name}</div>
                    </div>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className={`${teachersPanelMuted} p-5`}>
                  <div className="inline-block w-fit px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-md mb-4">
                    <h3 className="text-xs font-mono uppercase tracking-wide text-[var(--color-primary)] flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      Contact Information
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start py-2 border-b border-[var(--color-border)]/20">
                      <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)] flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                      <div className="flex items-center gap-2 max-w-[60%]">
                        <div className="font-mono text-sm text-[var(--color-text)] text-right break-all">{teacher.email || teacher.user.email}</div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 hover:bg-[var(--color-primary)]/10 shrink-0"
                          onClick={() => navigator.clipboard.writeText(teacher.email || teacher.user.email)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {teacher.phoneNumber && (
                      <div className="flex justify-between items-center py-2">
                        <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)] flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="font-mono text-sm text-[var(--color-text)]">{teacher.phoneNumber}</div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 hover:bg-[var(--color-primary)]/10"
                            onClick={() => navigator.clipboard.writeText(teacher.phoneNumber || '')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {!teacher.phoneNumber && (
                      <div className="text-xs font-mono text-[var(--color-textSecondary)] italic py-2">
                        No phone number provided
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="academic">
          <Card className={`${teachersPanel} overflow-hidden`}>
            <CardHeader className="border-b border-slate-200/80 bg-slate-50/50 px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="font-mono font-bold tracking-wide text-[var(--color-text)]">Academic Information</CardTitle>
                  <CardDescription className="font-mono text-[var(--color-textSecondary)]">
                    Subjects, grade levels, and streams assigned to {teacher.fullName || teacher.user.name}
                  </CardDescription>
                </div>
                <TeacherAcademicEditor
                  teacherId={teacher.id}
                  teacherName={teacher.fullName || teacher.user.name}
                  initialSubjectIds={teacher.tenantSubjects.map((s) => s.id)}
                  initialGradeLevelIds={teacher.tenantGradeLevels.map((g) => g.id)}
                  initialStreamIds={teacher.tenantStreams.map((s) => s.id)}
                  tenantSubjects={teacher.tenantSubjects}
                  tenantGradeLevels={teacher.tenantGradeLevels}
                  tenantStreams={teacher.tenantStreams}
                  onSaved={refetch}
                />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Subjects Section */}
                <div className={`${teachersPanelMuted} p-5`}>
                  <div className="inline-block w-fit px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-md mb-4">
                    <h3 className="text-xs font-mono uppercase tracking-wide text-[var(--color-primary)] flex items-center">
                      <BookOpen className="h-3 w-3 mr-2" />
                      Subjects Taught
                    </h3>
                  </div>
                  {teacher.tenantSubjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {teacher.tenantSubjects.map((subject) => (
                        <Badge key={subject.id} variant="outline" className="bg-green-50 text-green-700 border-green-200 font-mono text-xs">
                          {subject.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-mono text-[var(--color-textSecondary)]">
                      No subjects assigned yet. Use &quot;Edit subjects &amp; classes&quot; to add them.
                    </p>
                  )}
                </div>

                {/* Grade Levels Section */}
                <div className={`${teachersPanelMuted} p-5`}>
                  <div className="inline-block w-fit px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-md mb-4">
                    <h3 className="text-xs font-mono uppercase tracking-wide text-[var(--color-primary)] flex items-center">
                      <GraduationCap className="h-3 w-3 mr-2" />
                      Grade Levels
                    </h3>
                  </div>
                  {teacher.tenantGradeLevels.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {teacher.tenantGradeLevels.map((gradeLevel) => (
                        <Badge key={gradeLevel.id} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-mono text-xs">
                          {gradeLevel.gradeLevel?.name || 'Unknown Grade Level'}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-mono text-[var(--color-textSecondary)]">
                      No grade levels assigned yet.
                    </p>
                  )}
                </div>

                {/* Streams Section */}
                <div className={`${teachersPanelMuted} p-5`}>
                  <div className="inline-block w-fit px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-md mb-4">
                    <h3 className="text-xs font-mono uppercase tracking-wide text-[var(--color-primary)] flex items-center">
                      <School className="h-3 w-3 mr-2" />
                      Streams / Classes
                    </h3>
                  </div>
                  {teacher.tenantStreams.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {teacher.tenantStreams.map((stream) => (
                        <Badge key={stream.id} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-mono text-xs">
                          {stream.stream?.name || "Stream"}
                          {stream.tenantGradeLevel?.gradeLevel?.name
                            ? ` · ${stream.tenantGradeLevel.gradeLevel.name}`
                            : ""}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-mono text-[var(--color-textSecondary)]">
                      No streams assigned. Streams are optional — if none are picked, all streams for the selected grades apply.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assignments">
          <Card className={`${teachersPanel} overflow-hidden`}>
            <CardHeader className="border-b border-slate-200/80 bg-slate-50/50 px-4 py-3">
              <CardTitle className="font-mono font-bold tracking-wide text-[var(--color-text)]">Class Teacher Assignments</CardTitle>
              <CardDescription className="font-mono text-[var(--color-textSecondary)]">
                Classes where {teacher.fullName || teacher.user.name} serves as class teacher
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {teacher.classTeacherAssignments.length > 0 ? (
                <div className="space-y-4">
                  {teacher.classTeacherAssignments.map((assignment) => (
                    <div key={assignment.id} className="border-2 border-[var(--color-border)] bg-[var(--color-primary)]/5 rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <School className="h-4 w-4 text-[var(--color-primary)]" />
                        <div className="font-mono text-sm text-[var(--color-text)]">
                          {assignment.gradeLevel?.gradeLevel?.name || 'Unknown Grade Level'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-[var(--color-textSecondary)] font-mono text-sm">
                  No class teacher assignments found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
