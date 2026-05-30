"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Info,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateTeacherDrawer } from "./components/CreateTeacherDrawer";
import { TeachersSearchSidebar } from "./components/TeachersSearchSidebar";
import { TeacherDetailView } from "./components/TeacherDetailView";
import { TeachersStats } from "./components/TeachersStats";
import { TeachersTable } from "./components/TeachersTable";
import { PendingInvitations } from "./components/PendingInvitations";
import { usePendingInvitationsStore } from "@/lib/stores/usePendingInvitationsStore";
import { useGetTeachers } from "@/lib/hooks/useTeachers";
import { useTeacherAdminActions } from "@/lib/hooks/useTeacherAdminActions";
import { getTenantInfo } from "@/lib/utils";
import { mapGraphqlTeacherToListItem } from "./utils/mapGraphqlTeacher";

function TeachersPage() {
  const tenantInfo = getTenantInfo();
  const tenantId = tenantInfo?.tenantId;
  const hasInitialFetch = useRef(false);

  const {
    teachers: graphqlTeachers,
    isLoading: teachersLoading,
    isError: teachersIsError,
    error: teachersQueryError,
    refetch: refetchTeachers,
  } = useGetTeachers();
  const { deleteTeacherRecord } = useTeacherAdminActions();

  const teachersError = teachersIsError
    ? teachersQueryError instanceof Error
      ? teachersQueryError.message
      : "Failed to load teachers"
    : null;

  const teachers = useMemo(() => {
    if (!graphqlTeachers?.length) return [];
    return graphqlTeachers.map(mapGraphqlTeacherToListItem);
  }, [graphqlTeachers]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [displayedTeachersCount, setDisplayedTeachersCount] = useState(10);
  const [teacherCreated, setTeacherCreated] = useState(false);
  const searchParams = useSearchParams();
  const openAddTeacher = searchParams.get("action") === "add";

  const {
    invitations,
    isLoading: invitationsLoading,
    error: invitationsError,
    fetchPendingInvitations,
  } = usePendingInvitationsStore();

  useEffect(() => {
    if (tenantId && !hasInitialFetch.current) {
      hasInitialFetch.current = true;
      fetchPendingInvitations(tenantId);
    }
  }, [tenantId, fetchPendingInvitations]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const q = searchTerm.toLowerCase();
      return (
        teacher.name.toLowerCase().includes(q) ||
        teacher.employeeId.toLowerCase().includes(q) ||
        teacher.contacts.email.toLowerCase().includes(q) ||
        teacher.subjects.some((subject) => subject.toLowerCase().includes(q))
      );
    });
  }, [teachers, searchTerm]);

  const handleTeacherCreated = () => {
    setTeacherCreated(true);
    void refetchTeachers();
    if (tenantId) {
      fetchPendingInvitations(tenantId);
    }
    setTimeout(() => setTeacherCreated(false), 3000);
  };

  const handleTeacherDelete = async (teacherId: string) => {
    if (!tenantId) throw new Error("Tenant ID not found");
    await deleteTeacherRecord(teacherId, tenantId);
    await refetchTeachers();
    if (selectedTeacherId === teacherId) {
      setSelectedTeacherId(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/80 dark:bg-slate-950">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200/80 bg-slate-50/50 transition-all duration-300 dark:border-slate-800 dark:bg-slate-950",
          "md:relative md:translate-x-0",
          isSidebarMinimized ? "w-0 overflow-hidden border-r-0 md:w-0" : "w-64",
        )}
      >
        {!isSidebarMinimized && (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex shrink-0 justify-end border-b border-slate-200/80 px-2 py-2 dark:border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
                onClick={() => setIsSidebarMinimized(true)}
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden px-3 pb-3">
              <TeachersSearchSidebar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedTeacherId={selectedTeacherId}
                onTeacherSelect={setSelectedTeacherId}
                displayedTeachersCount={displayedTeachersCount}
                onLoadMore={() =>
                  setDisplayedTeachersCount((prev) => prev + 10)
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-slate-200/80 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {selectedTeacherId ? "Teacher details" : "Teachers"}
                </h1>
                {!selectedTeacherId && (
                  <p className="mt-0.5 text-xs text-slate-400">
                    Manage staff, invitations, and assignments.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isSidebarMinimized && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
                    onClick={() => setIsSidebarMinimized(false)}
                  >
                    <PanelLeftOpen className="h-4 w-4" />
                  </Button>
                )}
                {!selectedTeacherId && (
                  <CreateTeacherDrawer
                    onTeacherCreated={handleTeacherCreated}
                    defaultOpen={openAddTeacher}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
            {!tenantId && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                <Info className="h-4 w-4 shrink-0" />
                Tenant ID not found. Please log in again.
              </div>
            )}

            {teachersLoading && tenantId && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading teachers…
              </div>
            )}

            {teachersError && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200/80 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                <span className="flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0" />
                  Error loading teachers: {teachersError}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void refetchTeachers()}
                  className="h-7 border-red-200 text-red-700 hover:bg-red-100"
                >
                  Retry
                </Button>
              </div>
            )}

            {teacherCreated && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200/80 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
                <CheckCircle className="h-4 w-4 shrink-0" />
                Teacher created successfully.
              </div>
            )}

            {selectedTeacherId ? (
              <TeacherDetailView
                teacherId={selectedTeacherId}
                tenantId={tenantId}
                onClose={() => setSelectedTeacherId(null)}
                onTeacherRemoved={() => {
                  void refetchTeachers();
                  setSelectedTeacherId(null);
                }}
              />
            ) : (
              <>
                <TeachersStats
                  teachers={teachers}
                  pendingCount={invitations.length}
                  isLoading={teachersLoading}
                />

                <PendingInvitations
                  invitations={invitations}
                  isLoading={invitationsLoading}
                  error={invitationsError}
                  onInvitationResent={() => {
                    if (tenantId) fetchPendingInvitations(tenantId);
                  }}
                  onInvitationRevoked={() => {
                    if (tenantId) fetchPendingInvitations(tenantId);
                  }}
                  onTeacherActivated={() => {
                    if (tenantId) {
                      fetchPendingInvitations(tenantId);
                    }
                    void refetchTeachers();
                  }}
                />

                <TeachersTable
                  teachers={filteredTeachers}
                  onTeacherSelect={setSelectedTeacherId}
                  onTeacherDelete={handleTeacherDelete}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeachersPage;
