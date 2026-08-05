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
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateTeacherDrawer } from "./components/CreateTeacherDrawer";
import { TeachersSearchSidebar } from "./components/TeachersSearchSidebar";
import { TeacherDetailView } from "./components/TeacherDetailView";
import { TeachersStats } from "./components/TeachersStats";
import { TeachersTable } from "./components/TeachersTable";
import { TeachersFilterBar } from "./components/TeachersFilterBar";
import { PendingInvitations } from "./components/PendingInvitations";
import { TeachersBulkActions } from "./components/TeachersBulkActions";
import { matchesStaffFilter, type StaffFilter } from "./utils/teachers-utils";
import { isTeacherProfileIncomplete } from "./utils/mapGraphqlTeacher";
import { useTeachersTimetableCoverage } from "@/lib/hooks/useTeachersTimetableCoverage";
import { usePendingInvitationsStore } from "@/lib/stores/usePendingInvitationsStore";
import { useGetTeachers } from "@/lib/hooks/useTeachers";
import { useTeacherAdminActions } from "@/lib/hooks/useTeacherAdminActions";
import { getTenantInfo } from "@/lib/utils";
import { mapGraphqlTeacherToListItem } from "./utils/mapGraphqlTeacher";
import { useDomainRealtime } from "@/lib/realtime/useDomainRealtime";

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
  const [staffFilter, setStaffFilter] = useState<StaffFilter>("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
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

  useDomainRealtime({
    onInvitationSent: () => {
      if (tenantId) void fetchPendingInvitations(tenantId);
    },
    onInvitationAccepted: () => {
      if (tenantId) {
        void fetchPendingInvitations(tenantId);
        void refetchTeachers();
      }
    },
    onInvitationRevoked: () => {
      if (tenantId) void fetchPendingInvitations(tenantId);
    },
  });

  const {
    lessonCounts,
    termName: timetableTermName,
    loading: timetableLoading,
  } = useTeachersTimetableCoverage();

  const departments = useMemo(() => {
    const unique = new Set(
      teachers.map((t) => t.department).filter(Boolean),
    );
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      if (!matchesStaffFilter(teacher, staffFilter)) return false;
      if (
        departmentFilter !== "all" &&
        teacher.department !== departmentFilter
      ) {
        return false;
      }
      const q = searchTerm.toLowerCase();
      if (!q) return true;
      return (
        teacher.name.toLowerCase().includes(q) ||
        (teacher.employeeId?.toLowerCase().includes(q) ?? false) ||
        teacher.contacts.email.toLowerCase().includes(q) ||
        teacher.subjects.some((subject) => subject.toLowerCase().includes(q)) ||
        teacher.grades.some((grade) => grade.toLowerCase().includes(q)) ||
        teacher.department.toLowerCase().includes(q)
      );
    });
  }, [teachers, searchTerm, staffFilter, departmentFilter]);

  const filterCounts = useMemo(
    () => ({
      all: teachers.length,
      active: teachers.filter((t) => t.status === "active").length,
      needsSetup: teachers.filter((t) => t.status === "inactive").length,
      incomplete: teachers.filter((t) => isTeacherProfileIncomplete(t)).length,
    }),
    [teachers],
  );

  const selectedTeacher = useMemo(
    () => teachers.find((t) => t.id === selectedTeacherId) ?? null,
    [teachers, selectedTeacherId],
  );

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
    <div className="flex h-screen overflow-hidden bg-[#f3f7f5] dark:bg-[#071411]">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#1a4d42]/12 bg-[#f8fbfa] transition-all duration-300 dark:border-white/10 dark:bg-[#0c1a17]",
          "md:relative md:translate-x-0",
          isSidebarMinimized ? "w-14" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 border-b border-[#1a4d42]/10 px-2 py-2 dark:border-white/10",
            isSidebarMinimized ? "justify-center" : "justify-end",
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-none p-0 text-[#1a4d42]/45 hover:bg-[#e8f2ef] hover:text-[#0a1f1a]"
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
          >
            {isSidebarMinimized ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!isSidebarMinimized && (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-3">
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
        )}
      </div>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-[#1a4d42]/12 bg-[#f8fbfa]/95 px-3 py-1.5 backdrop-blur-md dark:border-white/10 dark:bg-[#071411]/95 sm:px-4">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <h1 className="truncate font-display text-lg tracking-tight text-[#0a1f1a] dark:text-white">
                  {selectedTeacher
                    ? selectedTeacher.name
                    : "Teachers"}
                </h1>
                <p className="truncate text-[11px] text-[#1a4d42]/50 dark:text-white/45">
                  {selectedTeacher
                    ? `${selectedTeacher.department} · ${selectedTeacher.status === "active" ? "Active" : "Not activated"}`
                    : "Staff, invitations, and assignments"}
                </p>
              </div>
              <div className="flex items-center gap-2">
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
          <div className="mx-auto max-w-5xl space-y-2 p-3 sm:space-y-2.5 sm:p-4">
            {!tenantId && (
              <div className="flex items-center gap-2 border border-amber-300/80 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                <Info className="h-4 w-4 shrink-0" />
                Tenant ID not found. Please log in again.
              </div>
            )}

            {teachersLoading && tenantId && (
              <div className="flex items-center gap-2 text-sm text-[#1a4d42]/55">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading teachers…
              </div>
            )}

            {teachersError && (
              <div className="flex flex-wrap items-center justify-between gap-3 border border-red-300/80 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                <span className="flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0" />
                  Error loading teachers: {teachersError}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void refetchTeachers()}
                  className="h-7 rounded-none border-red-200 text-red-700 hover:bg-red-100"
                >
                  Retry
                </Button>
              </div>
            )}

            {teacherCreated && (
              <div className="flex items-center gap-2 border border-emerald-300/80 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
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
                onTeacherUpdated={() => {
                  void refetchTeachers();
                }}
              />
            ) : teachers.length === 0 && !teachersLoading ? (
              <div className="rounded-none border border-dashed border-[#1a4d42]/20 bg-white px-6 py-14 text-center shadow-[3px_3px_0_0_rgba(10,31,26,0.04)] dark:border-white/15 dark:bg-[#0c1a17]">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-none bg-[#246a59]/10 text-[#246a59]">
                  <Users className="h-5 w-5" />
                </div>
                <h2 className="font-display text-lg tracking-tight text-[#0a1f1a] dark:text-white">
                  No teachers yet
                </h2>
                <p className="mx-auto mt-1 max-w-sm text-xs text-[#1a4d42]/55 dark:text-white/45">
                  Invite your first teacher to get started. They&apos;ll receive an
                  email to set up their account.
                </p>
                <div className="mt-5 flex justify-center">
                  <CreateTeacherDrawer
                    onTeacherCreated={handleTeacherCreated}
                    defaultOpen={openAddTeacher}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <TeachersStats
                  teachers={teachers}
                  pendingCount={invitations.length}
                  isLoading={teachersLoading}
                />

                {!teachersLoading && teachers.length > 0 && (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <TeachersFilterBar
                      filter={staffFilter}
                      onFilterChange={setStaffFilter}
                      counts={filterCounts}
                      departments={departments}
                      departmentFilter={departmentFilter}
                      onDepartmentFilterChange={setDepartmentFilter}
                    />
                    <TeachersBulkActions
                      teachers={filteredTeachers}
                      invitations={invitations}
                      onInvitationsUpdated={() => {
                        if (tenantId) fetchPendingInvitations(tenantId);
                      }}
                    />
                  </div>
                )}

                {searchTerm && !selectedTeacherId && (
                  <div className="flex items-center gap-2 text-[11px] text-[#1a4d42]/55">
                    <span>Filtering by</span>
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="inline-flex items-center gap-1 rounded-none border border-[#1a4d42]/15 bg-white px-2 py-0.5 text-[#0a1f1a] hover:border-[#246a59]/40 dark:border-white/15 dark:bg-[#0c1a17] dark:text-white"
                    >
                      &ldquo;{searchTerm}&rdquo;
                      <span className="text-[#1a4d42]/40">×</span>
                    </button>
                  </div>
                )}

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
                  lessonCounts={lessonCounts}
                  timetableLoading={timetableLoading}
                  termName={timetableTermName}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeachersPage;
