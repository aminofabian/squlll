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
import { useTeachersByTenantQuery, useTeacherData } from "@/lib/stores/useTeachersStore";
import { useDeleteTeacher } from "@/lib/hooks/useTeachers";
import { getTenantInfo } from "@/lib/utils";

type Teacher = {
  id: string;
  name: string;
  title?: string;
  photo?: string;
  gender: "male" | "female";
  dateOfBirth: string;
  joinDate: string;
  employeeId: string;
  staffId?: string;
  status: "active" | "on leave" | "former" | "substitute" | "retired";
  designation: string;
  department: string;
  subjects: string[];
  classesAssigned: string[];
  grades: string[];
  curriculum?: string[];
  timetable?: { day: string; periods: { time: string; class: string; subject: string }[] }[];
  classTeacherOf?: string;
  academic: {
    qualification: string;
    university?: string;
    specialization: string;
    experience: number;
    tscNumber?: string;
    certifications?: string[];
  };
  contacts: {
    phone: string;
    email: string;
    address?: string;
    officeLocation?: string;
  };
  performance?: {
    rating: number;
    lastEvaluation?: string;
    studentPerformance?: string;
    classPerformance?: { subject: string; performance: string }[];
    subjectPerformanceHistory?: { year: string; performance: string }[];
    attendanceRate?: number;
    disciplineReports?: number;
    studentsMentored?: number;
    trend?: "improving" | "declining" | "stable";
  };
  responsibilities?: string[];
  extraCurricular?: {
    clubs?: string[];
    sports?: string[];
    committees?: string[];
  };
  leadershipRoles?: string[];
  administrativeNotes?: string;
  reportsSubmitted?: { type: string; date: string; status: string }[];
  administrative?: {
    roles?: string[];
    committees?: string[];
    reports?: { type: string; date: string; status: string }[];
    notes?: { title: string; date: string; addedBy: string; content: string }[];
  };
  documents?: {
    name: string;
    type: "pdf" | "image" | "doc" | string;
    url: string;
    size: string;
    dateAdded?: string;
  }[];
  systemMetadata?: {
    dateAdded: string;
    lastUpdated: string;
    updatedBy: string;
  };
  awards?: string[];
  languagesSpoken?: string[];
  motto?: string;
  officeHours?: { day: string; hours: string }[];
};

const transformUserToTeacher = (user: {
  id: string;
  name: string;
  email: string;
}): Teacher => ({
  id: user.id,
  name: user.name,
  employeeId: `TCH/${new Date().getFullYear()}/${user.id.slice(-3)}`,
  gender: "male",
  dateOfBirth: "1980-01-01",
  joinDate: new Date().toISOString().split("T")[0],
  status: "active",
  subjects: ["General"],
  classesAssigned: [],
  grades: [],
  designation: "teacher",
  department: "General",
  contacts: {
    phone: "+254700000000",
    email: user.email,
    address: "Address not provided",
  },
  academic: {
    qualification: "bachelors",
    specialization: "General Education",
    experience: 1,
    certifications: [],
  },
  performance: {
    rating: 4.0,
    lastEvaluation: new Date().toISOString().split("T")[0],
    studentPerformance: "Good",
    trend: "stable",
  },
  responsibilities: [],
  extraCurricular: {
    clubs: [],
    sports: [],
    committees: [],
  },
});

function TeachersPage() {
  const tenantInfo = getTenantInfo();
  const tenantId = tenantInfo?.tenantId;
  const hasInitialFetch = useRef(false);

  const { fetchTeachersByTenant } = useTeachersByTenantQuery();
  const {
    teacherStaffUsers: graphqlTeachers,
    isLoading: teachersLoading,
    error: teachersError,
  } = useTeacherData();
  const { deleteTeacher } = useDeleteTeacher();

  const teachers = useMemo(() => {
    if (!graphqlTeachers || !Array.isArray(graphqlTeachers)) return [];
    return graphqlTeachers.map(transformUserToTeacher);
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
      fetchTeachersByTenant(tenantId).catch(console.error);
      fetchPendingInvitations(tenantId);
    }
  }, [tenantId, fetchTeachersByTenant, fetchPendingInvitations]);

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
    if (tenantId) {
      fetchTeachersByTenant(tenantId).catch(console.error);
      fetchPendingInvitations(tenantId);
    }
    setTimeout(() => setTeacherCreated(false), 3000);
  };

  const handleTeacherDelete = async (teacherId: string) => {
    if (!tenantId) throw new Error("Tenant ID not found");
    await deleteTeacher(teacherId, tenantId);
    fetchTeachersByTenant(tenantId).catch(console.error);
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
                  onClick={() => tenantId && fetchTeachersByTenant(tenantId)}
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
                onClose={() => setSelectedTeacherId(null)}
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
                      fetchTeachersByTenant(tenantId).catch(console.error);
                    }
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
