"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
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
import { ClassCard } from "../components/ClassCard";
import { ClassCardSkeleton } from "../components/ClassCardSkeleton";
import { X } from "lucide-react";
import { SchoolSearchFilter } from "@/components/dashboard/SchoolSearchFilter";
import { ClassesStats } from "./components/ClassesStats";
import { ClassesContextBar } from "./components/ClassesContextBar";
import { ClassesGradeBrowse } from "./components/ClassesGradeBrowse";
import { ClassesPageHeader } from "./components/ClassesPageHeader";
import { ClassesPageSkeleton } from "./components/ClassesPageSkeleton";
import { SubjectsView } from "./components/SubjectsView";
import { GradeDetailsView } from "./components/GradeDetailsView";
import { AddStreamModal } from "../components/AddStreamModal";
import { AssignTeacherModal } from "../components/AssignTeacherModal";
import { AddSubjectDialog } from "../components/AddSubjectDialog";
import { type ClassAction } from "./components/ClassActionBar";
import { DashboardGradeSheet } from "../dashboard/components/DashboardGradeSheet";
import { DashboardSection } from "../dashboard/components/DashboardSection";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BookOpen, Layers, Plus, UserPlus } from "lucide-react";
import { formatGradeDisplayName } from "@/lib/utils/grade-display";

export default function ClassesPage() {
  const searchParams = useSearchParams();
  const { config } = useSchoolConfigStore();
  const { isLoading, error } = useSchoolConfig();

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
  }>({});
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

  const handleGradeSelect = useCallback((gradeId: string, levelId: string) => {
    setSelectedGradeId(gradeId);
    setSelectedLevelId(levelId);
    setSelectedStreamId("");
  }, []);

  const handleStreamSelect = useCallback(
    (streamId: string, gradeId: string, levelId: string) => {
      setSelectedStreamId(streamId);
      if (gradeId !== selectedGradeId || levelId !== selectedLevelId) {
        setSelectedGradeId(gradeId);
        setSelectedLevelId(levelId);
      }
    },
    [selectedGradeId, selectedLevelId],
  );

  const clearFilters = useCallback(() => {
    setSelectedGradeId("");
    setSelectedLevelId("");
    setSelectedStreamId("");
  }, []);

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

  const openAssignTeacher = useCallback(() => {
    if (selectedStreamId && selectedGrade?.streamName) {
      setAssignTeacherData({
        streamId: selectedStreamId,
        streamName: selectedGrade.streamName,
      });
    } else if (selectedGrade?.grade) {
      setAssignTeacherData({
        gradeLevelId: selectedGrade.grade.id,
        gradeName: selectedGrade.name,
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

  const headerTitle = selectedGrade
    ? selectedGrade.streamName
      ? `${selectedGrade.displayName} · ${selectedGrade.streamName}`
      : selectedGrade.displayName
    : "Classes";

  const headerSubtitle = selectedGrade
    ? `${selectedGrade.levelName} — manage subjects, streams, and teachers`
    : "Browse grades to manage subjects, streams, and teachers";

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
    <div className="flex min-h-full flex-col">
      <div className="flex min-w-0 flex-1">
        <aside
          className={cn(
            "hidden shrink-0 flex-col border-r border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950 lg:flex",
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
            <div className="mx-auto max-w-5xl space-y-3 p-3 sm:p-4">
              {!selectedGradeId ? (
                <>
                  <ClassesStats config={config} isLoading={isLoading} />

                  <DashboardSection
                    title="Browse by grade"
                    description="Grouped by school level — tap a grade to manage it"
                    bodyClassName="p-2 sm:p-2.5"
                  >
                    <ClassesGradeBrowse
                      config={config}
                      isLoading={isLoading}
                      selectedGradeId={selectedGradeId}
                      selectedStreamId={selectedStreamId}
                      onGradeSelect={handleGradeSelect}
                      onStreamSelect={handleStreamSelect}
                    />
                  </DashboardSection>
                </>
              ) : (
                selectedGrade?.grade && (
                  <div className="space-y-3">
                    <ClassesContextBar
                      levelName={selectedGrade.levelName}
                      gradeName={selectedGrade.displayName}
                      streamName={selectedGrade.streamName}
                      onClear={clearFilters}
                    />

                    <DashboardSection
                      title="Overview"
                      bodyClassName="p-2 sm:p-2.5"
                    >
                      <GradeDetailsView
                        grade={selectedGrade.grade}
                        selectedStreamId={selectedStreamId || undefined}
                        onStreamSelect={(streamId) =>
                          handleStreamSelect(
                            streamId,
                            selectedGrade.grade.id,
                            selectedGrade.level.id,
                          )
                        }
                        onAssignTeacher={openAssignTeacher}
                      />
                    </DashboardSection>

                    {isLoading ? (
                      <ClassCardSkeleton />
                    ) : (
                      filteredLevels.map((level) => (
                        <ClassCard
                          key={level.id}
                          level={level}
                          selectedGradeId={selectedGradeId}
                          onAssignTeacher={openAssignTeacher}
                        />
                      ))
                    )}
                  </div>
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
              onAssignTeacher={
                selectedGrade?.grade ? openAssignTeacher : undefined
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

      {showAssignTeacherModal ? (
        <AssignTeacherModal
          isOpen={showAssignTeacherModal}
          onClose={() => setShowAssignTeacherModal(false)}
          onSuccess={() => setShowAssignTeacherModal(false)}
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
