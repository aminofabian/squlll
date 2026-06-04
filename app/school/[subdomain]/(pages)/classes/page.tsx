"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import { useSchoolConfig } from "@/lib/hooks/useSchoolConfig";
import { ClassesClassDetail } from "./components/ClassesClassDetail";
import { X } from "lucide-react";
import { SchoolSearchFilter } from "@/components/dashboard/SchoolSearchFilter";
import { ClassesPulseHero } from "./components/ClassesPulseHero";
import { ClassesQuickLinks } from "./components/ClassesQuickLinks";
import { ClassesCampusOverview } from "./components/ClassesCampusOverview";
import { useStudentsFromStore } from "@/lib/hooks/useStudents";
import { useTenantStatistics } from "@/lib/hooks/useTenantStatistics";
import { ClassesPageHeader } from "./components/ClassesPageHeader";
import { ClassesPageSkeleton } from "./components/ClassesPageSkeleton";
import { SubjectsView } from "./components/SubjectsView";
import { AddStreamModal } from "../components/AddStreamModal";
import { AssignTeacherModal } from "../components/AssignTeacherModal";
import { AddSubjectDialog } from "../components/AddSubjectDialog";
import { type ClassAction } from "./components/ClassActionBar";
import { DashboardGradeSheet } from "../dashboard/components/DashboardGradeSheet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BookOpen, Layers, Plus, UserPlus } from "lucide-react";
import { formatGradeDisplayName } from "@/lib/utils/grade-display";
import { useDomainRealtime } from "@/lib/realtime/useDomainRealtime";
import { refreshAfterClassTeacherChange } from "./utils/class-teacher-cache";

export default function ClassesPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { config } = useSchoolConfigStore();
  const { isLoading, error } = useSchoolConfig();
  const { students } = useStudentsFromStore();
  const { data: tenantStats, isLoading: statsLoading } = useTenantStatistics();
  const studentCount = tenantStats?.studentCount ?? students.length;

  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [selectedStreamId, setSelectedStreamId] = useState("");
  const [isGradePanelOpen, setIsGradePanelOpen] = useState(false);
  const [isGradeSheetOpen, setIsGradeSheetOpen] = useState(false);
  const [showSubjectsDrawer, setShowSubjectsDrawer] = useState(false);
  const [showAddStreamModal, setShowAddStreamModal] = useState(false);
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
  const [assignTeacherData, setAssignTeacherData] = useState<{
    streamId?: string;
    streamName?: string;
    gradeLevelId?: string;
    gradeName?: string;
  } | null>(null);
  const [showAddSubjectDialog, setShowAddSubjectDialog] = useState(false);
  const [addSubjectContext, setAddSubjectContext] = useState<{
    curriculumId: string;
    levelName: string;
    gradeName?: string;
    streamName?: string;
  } | null>(null);

  useEffect(() => {
    if (searchParams.get("tab") === "subjects") {
      setShowSubjectsDrawer(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const gradeId = searchParams.get("gradeId");
    if (!gradeId || !config?.selectedLevels) return;

    for (const level of config.selectedLevels) {
      const grade = level.gradeLevels?.find((g) => g.id === gradeId);
      if (!grade) continue;

      setSelectedGradeId(gradeId);
      setSelectedLevelId(level.id);

      const streamId = searchParams.get("streamId");
      if (streamId && grade.streams?.some((s) => s.id === streamId)) {
        setSelectedStreamId(streamId);
      } else if (grade.streams?.length === 1) {
        setSelectedStreamId(grade.streams[0].id);
      } else {
        setSelectedStreamId("");
      }
      break;
    }
  }, [searchParams, config?.selectedLevels]);

  useEffect(() => {
    const handleResize = () => {
      setIsGradePanelOpen(window.innerWidth >= 1280);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const selectedGrade = useMemo(() => {
    if (!selectedGradeId || !config) return null;
    for (const level of config.selectedLevels) {
      const grade = level.gradeLevels?.find((g) => g.id === selectedGradeId);
      if (grade) {
        const stream = selectedStreamId
          ? grade.streams?.find((s) => s.id === selectedStreamId)
          : null;
        return {
          name: grade.name,
          displayName: formatGradeDisplayName(grade.name),
          levelName: level.name,
          streamName: stream?.name,
          grade,
          level,
        };
      }
    }
    return null;
  }, [selectedGradeId, selectedStreamId, config]);

  const filteredLevels = useMemo(() => {
    if (!config?.selectedLevels || !selectedGradeId) return [];
    return config.selectedLevels.filter((level) => {
      if (selectedLevelId) {
        const hasGrade = level.gradeLevels?.some(
          (g) => g.id === selectedGradeId,
        );
        if (selectedStreamId) {
          const hasStream = level.gradeLevels?.find(
            (g) =>
              g.id === selectedGradeId &&
              g.streams?.some((s) => s.id === selectedStreamId),
          );
          return level.id === selectedLevelId && !!hasStream;
        }
        return level.id === selectedLevelId && hasGrade;
      }
      return false;
    });
  }, [
    config?.selectedLevels,
    selectedGradeId,
    selectedLevelId,
    selectedStreamId,
  ]);

  const syncClassUrl = useCallback(
    (gradeId: string, levelId: string, streamId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (gradeId) {
        params.set("gradeId", gradeId);
        if (levelId) params.set("levelId", levelId);
        if (streamId) params.set("streamId", streamId);
        else params.delete("streamId");
      } else {
        params.delete("gradeId");
        params.delete("levelId");
        params.delete("streamId");
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleGradeSelect = useCallback(
    (gradeId: string, levelId: string) => {
      let streamId = "";
      if (config?.selectedLevels) {
        for (const level of config.selectedLevels) {
          const grade = level.gradeLevels?.find((g) => g.id === gradeId);
          if (grade?.streams?.length === 1) {
            streamId = grade.streams[0].id;
            break;
          }
        }
      }
      setSelectedGradeId(gradeId);
      setSelectedLevelId(levelId);
      setSelectedStreamId(streamId);
      syncClassUrl(gradeId, levelId, streamId);
    },
    [syncClassUrl, config?.selectedLevels],
  );

  const handleStreamSelect = useCallback(
    (streamId: string, gradeId: string, levelId: string) => {
      setSelectedStreamId(streamId);
      if (gradeId !== selectedGradeId || levelId !== selectedLevelId) {
        setSelectedGradeId(gradeId);
        setSelectedLevelId(levelId);
      }
      syncClassUrl(gradeId, levelId, streamId);
    },
    [selectedGradeId, selectedLevelId, syncClassUrl],
  );

  const handleStreamSelectInGrade = useCallback(
    (streamId: string) => {
      if (!selectedGrade) return;
      if (!streamId) {
        setSelectedStreamId("");
        syncClassUrl(selectedGrade.grade.id, selectedGrade.level.id, "");
        return;
      }
      handleStreamSelect(
        streamId,
        selectedGrade.grade.id,
        selectedGrade.level.id,
      );
    },
    [handleStreamSelect, selectedGrade, syncClassUrl],
  );

  const clearFilters = useCallback(() => {
    setSelectedGradeId("");
    setSelectedLevelId("");
    setSelectedStreamId("");
    syncClassUrl("", "", "");
  }, [syncClassUrl]);

  const openClassFromOverview = useCallback(
    (gradeId: string, levelId: string, streamId?: string) => {
      if (streamId) {
        handleStreamSelect(streamId, gradeId, levelId);
      } else {
        handleGradeSelect(gradeId, levelId);
      }
    },
    [handleGradeSelect, handleStreamSelect],
  );

  const openAddSubject = useCallback(
    (context: {
      curriculumId: string;
      levelName: string;
      gradeName?: string;
      streamName?: string;
    }) => {
      if (!context.curriculumId) {
        toast.error("Could not determine the level for this class");
        return;
      }
      setAddSubjectContext(context);
      setShowAddSubjectDialog(true);
    },
    [],
  );

  const defaultAddSubjectContext = useMemo(() => {
    if (!selectedGrade) return null;
    return {
      curriculumId: selectedGrade.level.id,
      levelName: selectedGrade.levelName,
      gradeName: selectedGrade.name,
      streamName: selectedGrade.streamName,
    };
  }, [selectedGrade]);

  useDomainRealtime({
    enabled: Boolean(selectedGradeId),
    onClassTeacherAssigned: () => {
      void refreshAfterClassTeacherChange(queryClient, {
        gradeLevelId: selectedGrade?.grade?.id,
        streamId: selectedStreamId || undefined,
      });
    },
  });

  const openAssignTeacher = useCallback(() => {
    if (selectedStreamId && selectedGrade?.streamName) {
      setAssignTeacherData({
        streamId: selectedStreamId,
        streamName: selectedGrade.streamName,
        gradeLevelId: selectedGrade.grade?.id,
        gradeName: selectedGrade.displayName,
      });
    } else if (selectedGrade?.grade) {
      setAssignTeacherData({
        gradeLevelId: selectedGrade.grade.id,
        gradeName: selectedGrade.displayName,
      });
    } else {
      toast.error("Select a grade first");
      return;
    }
    setShowAssignTeacherModal(true);
  }, [selectedStreamId, selectedGrade]);

  const pageActions: ClassAction[] = useMemo(
    () => [
      {
        id: "subjects",
        label: "All subjects",
        icon: BookOpen,
        onClick: () => setShowSubjectsDrawer(true),
      },
      {
        id: "add-subject",
        label: "Add subject",
        icon: Plus,
        onClick: () => {
          if (defaultAddSubjectContext) {
            openAddSubject(defaultAddSubjectContext);
          } else {
            toast.error("Select a grade first");
          }
        },
        disabled: !selectedGrade?.grade,
        disabledReason: "Select a grade first",
      },
      {
        id: "add-stream",
        label: "Add stream",
        icon: Layers,
        onClick: () => {
          if (selectedGrade?.grade) setShowAddStreamModal(true);
          else toast.error("Select a grade first");
        },
        disabled: !selectedGrade?.grade,
        disabledReason: "Select a grade first",
      },
      {
        id: "assign-teacher",
        label: "Assign teacher",
        icon: UserPlus,
        onClick: openAssignTeacher,
        disabled: !selectedGrade?.grade,
        disabledReason: "Select a grade first",
      },
    ],
    [defaultAddSubjectContext, openAddSubject, openAssignTeacher, selectedGrade],
  );

  const headerTitle = selectedGrade ? "Class" : "Classes";

  const headerSubtitle = selectedGrade
    ? `${selectedGrade.displayName}${selectedGrade.streamName ? ` · ${selectedGrade.streamName}` : ""} · ${selectedGrade.levelName}`
    : "Structure, subjects, and teachers by grade";

  if (isLoading && !config) {
    return <ClassesPageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-lg border border-red-200 bg-white px-4 py-6 text-center dark:border-red-900 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-red-600">
            Error loading classes
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-3 h-8"
            size="sm"
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-[#f8f9fb] dark:bg-slate-950">
      <div className="flex min-w-0 flex-1">
        <aside
          className={cn(
            "hidden shrink-0 flex-col border-r border-slate-200/80 bg-[#f5f6f8] dark:border-slate-800 dark:bg-slate-900 lg:flex",
            isGradePanelOpen ? "w-56" : "w-0 overflow-hidden border-r-0",
          )}
          aria-label="Grade navigation"
        >
          {isGradePanelOpen ? (
            <div className="sticky top-[2.75rem] flex max-h-[calc(100vh-5.5rem)] flex-col overflow-hidden px-2 py-2">
              <SchoolSearchFilter
                className="h-full"
                variant="minimal"
                type="grades"
                onGradeSelect={handleGradeSelect}
                onStreamSelect={handleStreamSelect}
                isLoading={isLoading}
                selectedGradeId={selectedGradeId}
                selectedStreamId={selectedStreamId}
              />
            </div>
          ) : null}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <ClassesPageHeader
            title={headerTitle}
            subtitle={headerSubtitle}
            hasGradeSelected={Boolean(selectedGradeId)}
            onOpenGradePicker={() => setIsGradeSheetOpen(true)}
            actions={pageActions}
            showDesktopGradeToggle
            isGradePanelOpen={isGradePanelOpen}
            onToggleGradePanel={() => setIsGradePanelOpen((open) => !open)}
          />

          <div className="flex-1">
            <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
              {!selectedGradeId ? (
                <>
                  <ClassesPulseHero
                    config={config}
                    isLoading={isLoading}
                    studentCount={studentCount}
                    studentsLoading={statsLoading}
                  />

                  <ClassesQuickLinks
                    onOpenSubjects={() => setShowSubjectsDrawer(true)}
                  />

                  <ClassesCampusOverview
                    config={config}
                    students={students}
                    isLoading={isLoading}
                    onOpenGradePicker={() => setIsGradeSheetOpen(true)}
                    onGradeSelect={handleGradeSelect}
                    onStreamSelect={handleStreamSelect}
                  />
                </>
              ) : (
                selectedGrade?.grade &&
                filteredLevels[0] && (
                  <ClassesClassDetail
                    displayName={selectedGrade.displayName}
                    levelName={selectedGrade.levelName}
                    streamName={selectedGrade.streamName}
                    grade={selectedGrade.grade}
                    level={filteredLevels[0]}
                    selectedStreamId={selectedStreamId}
                    students={students}
                    onClear={clearFilters}
                    onStreamSelect={handleStreamSelectInGrade}
                    onAssignTeacher={openAssignTeacher}
                    actions={pageActions}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <DashboardGradeSheet
        open={isGradeSheetOpen}
        onOpenChange={setIsGradeSheetOpen}
        onGradeSelect={handleGradeSelect}
        onStreamSelect={handleStreamSelect}
        selectedGradeId={selectedGradeId}
        selectedStreamId={selectedStreamId}
        isLoading={isLoading}
      />

      <Drawer
        open={showSubjectsDrawer}
        onOpenChange={setShowSubjectsDrawer}
        direction="right"
      >
        <DrawerContent className="flex h-[95vh] max-h-[95dvh] flex-col bg-slate-50/50 dark:bg-slate-950 sm:max-w-lg">
          <DrawerHeader className="shrink-0 border-b border-slate-200/80 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <DrawerTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  All subjects
                </DrawerTitle>
                <DrawerDescription className="mt-0.5 text-xs text-slate-500">
                  {selectedGrade
                    ? `${selectedGrade.levelName} · ${selectedGrade.displayName}`
                    : "Core and elective subjects"}
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <SubjectsView
              selectedGradeId={selectedGradeId || null}
              onAddSubject={
                defaultAddSubjectContext
                  ? () => openAddSubject(defaultAddSubjectContext)
                  : undefined
              }
              onAddStream={
                selectedGrade?.grade
                  ? () => setShowAddStreamModal(true)
                  : undefined
              }
            />
          </div>
        </DrawerContent>
      </Drawer>

      {showAddStreamModal && selectedGrade?.grade ? (
        <AddStreamModal
          isOpen={showAddStreamModal}
          onClose={() => setShowAddStreamModal(false)}
          onSuccess={() => setShowAddStreamModal(false)}
          gradeId={selectedGrade.grade.id}
          gradeName={selectedGrade.grade.name}
        />
      ) : null}

      {showAssignTeacherModal && assignTeacherData ? (
        <AssignTeacherModal
          isOpen={showAssignTeacherModal}
          onClose={() => {
            setShowAssignTeacherModal(false);
            setAssignTeacherData(null);
          }}
          onSuccess={() => {
            setShowAssignTeacherModal(false);
            setAssignTeacherData(null);
          }}
          streamId={assignTeacherData.streamId}
          streamName={assignTeacherData.streamName}
          gradeLevelId={assignTeacherData.gradeLevelId}
          gradeName={assignTeacherData.gradeName}
        />
      ) : null}

      {addSubjectContext ? (
        <AddSubjectDialog
          open={showAddSubjectDialog}
          onOpenChange={setShowAddSubjectDialog}
          curriculumId={addSubjectContext.curriculumId}
          levelName={addSubjectContext.levelName}
          gradeName={addSubjectContext.gradeName}
          streamName={addSubjectContext.streamName}
        />
      ) : null}
    </div>
  );
}
