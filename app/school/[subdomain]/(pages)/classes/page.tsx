"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import {
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { SchoolSearchFilter } from "@/components/dashboard/SchoolSearchFilter";
import { ClassesStats } from "./components/ClassesStats";
import { ClassesOverview } from "./components/ClassesOverview";
import { ClassesContextBar } from "./components/ClassesContextBar";
import { SubjectsView } from "./components/SubjectsView";
import { GradeDetailsView } from "./components/GradeDetailsView";
import { AddStreamModal } from "../components/AddStreamModal";
import { AssignTeacherModal } from "../components/AssignTeacherModal";
import { AddSubjectDialog } from "../components/AddSubjectDialog";
import { ClassActionBar, type ClassAction } from "./components/ClassActionBar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BookOpen, Layers, Plus, UserPlus } from "lucide-react";

export default function ClassesPage() {
  const searchParams = useSearchParams();
  const { config } = useSchoolConfigStore();
  const { isLoading, error } = useSchoolConfig();

  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [selectedStreamId, setSelectedStreamId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
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

  const filteredLevels = useMemo(() => {
    if (!config?.selectedLevels) return [];
    return config.selectedLevels.filter((level) => {
      if (selectedGradeId && selectedLevelId) {
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
      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase();
      return (
        level.name.toLowerCase().includes(s) ||
        level.description.toLowerCase().includes(s) ||
        level.gradeLevels?.some((g) => g.name.toLowerCase().includes(s)) ||
        level.subjects.some(
          (sub) =>
            sub.name.toLowerCase().includes(s) ||
            sub.code.toLowerCase().includes(s),
        )
      );
    });
  }, [
    config?.selectedLevels,
    selectedGradeId,
    selectedLevelId,
    selectedStreamId,
    searchTerm,
  ]);

  const handleGradeSelect = (gradeId: string, levelId: string) => {
    setSelectedGradeId(gradeId);
    setSelectedLevelId(levelId);
    setSelectedStreamId("");
  };

  const handleStreamSelect = (
    streamId: string,
    gradeId: string,
    levelId: string,
  ) => {
    setSelectedStreamId(streamId);
    if (gradeId !== selectedGradeId || levelId !== selectedLevelId) {
      setSelectedGradeId(gradeId);
      setSelectedLevelId(levelId);
    }
  };

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
          levelName: level.name,
          streamName: stream?.name,
          grade,
          level,
        };
      }
    }
    return null;
  }, [selectedGradeId, selectedStreamId, config]);

  const clearFilters = () => {
    setSelectedGradeId("");
    setSelectedLevelId("");
    setSelectedStreamId("");
    setSearchTerm("");
  };

  const openAddSubject = (context: {
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
  };

  const defaultAddSubjectContext = useMemo(() => {
    if (!selectedGrade) return null;
    return {
      curriculumId: selectedGrade.level.id,
      levelName: selectedGrade.levelName,
      gradeName: selectedGrade.name,
      streamName: selectedGrade.streamName,
    };
  }, [selectedGrade]);

  const openAssignTeacher = () => {
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
  };

  const headerActions: ClassAction[] = [
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
      disabledReason: "Select a grade in the sidebar first",
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
      disabledReason: "Select a grade in the sidebar first",
    },
    {
      id: "assign-teacher",
      label: "Assign teacher",
      icon: UserPlus,
      onClick: openAssignTeacher,
      disabled: !selectedGrade?.grade,
      disabledReason: "Select a grade in the sidebar first",
    },
    {
      id: "subjects",
      label: "All subjects",
      icon: BookOpen,
      onClick: () => setShowSubjectsDrawer(true),
    },
  ];

  const contextActions: ClassAction[] = [
    {
      id: "assign-teacher",
      label: "Assign teacher",
      icon: UserPlus,
      onClick: openAssignTeacher,
    },
    {
      id: "add-subject",
      label: "Add subject",
      icon: Plus,
      onClick: () => {
        if (defaultAddSubjectContext) openAddSubject(defaultAddSubjectContext);
      },
    },
    {
      id: "add-stream",
      label: "Add stream",
      icon: Layers,
      onClick: () => setShowAddStreamModal(true),
    },
    {
      id: "subjects",
      label: "Subjects",
      icon: BookOpen,
      onClick: () => setShowSubjectsDrawer(true),
    },
  ];

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="rounded-xl border border-red-200 bg-white px-6 py-8 text-center dark:border-red-900 dark:bg-slate-900">
          <h2 className="text-base font-semibold text-red-600 mb-1">
            Error loading classes
          </h2>
          <p className="text-sm text-slate-500">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/80 dark:bg-slate-950">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200/80 bg-slate-50/50 transition-all duration-300 dark:border-slate-800 dark:bg-slate-950",
          "md:relative md:translate-x-0",
          isSidebarMinimized ? "w-14" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 border-b border-slate-200/80 px-2 py-2 dark:border-slate-800",
            isSidebarMinimized ? "justify-center" : "justify-end",
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
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
          <div className="flex-1 overflow-hidden px-3 pb-3">
            <SchoolSearchFilter
              className="h-full"
              variant="minimal"
              type="grades"
              onSearch={setSearchTerm}
              onGradeSelect={handleGradeSelect}
              onStreamSelect={handleStreamSelect}
              isLoading={isLoading}
              selectedGradeId={selectedGradeId}
              selectedStreamId={selectedStreamId}
            />
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
                  Classes & Grades
                </h1>
                {!selectedGrade && (
                  <p className="mt-0.5 text-xs text-slate-400">
                    Browse and select a grade in the sidebar to manage it.
                  </p>
                )}
              </div>
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
            </div>
            {!selectedGrade && (
              <ClassActionBar
                actions={headerActions}
                layout="links"
                className="mt-2.5"
              />
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div
            className={cn(
              "mx-auto max-w-5xl p-4 sm:p-6",
              selectedGradeId ? "space-y-4" : "space-y-5",
            )}
          >
            {!selectedGradeId && (
              <ClassesStats config={config} isLoading={isLoading} />
            )}

            {selectedGrade && (
              <ClassesContextBar
                levelName={selectedGrade.levelName}
                gradeName={selectedGrade.name}
                streamName={selectedGrade.streamName}
                onClear={clearFilters}
                actions={contextActions}
              />
            )}

            {!isLoading && config && searchTerm && !selectedGrade && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Search results
                </span>
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                >
                  &ldquo;{searchTerm}&rdquo;
                  <X className="h-3 w-3 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear search
                </button>
              </div>
            )}

            {selectedGradeId && selectedGrade?.grade && (
              <>
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
              </>
            )}

            {!selectedGradeId &&
              (isLoading ? (
                <ClassesOverview levels={[]} isLoading />
              ) : config && filteredLevels.length > 0 ? (
                <ClassesOverview levels={filteredLevels} />
              ) : config ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900/40">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    No classes found
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {searchTerm
                      ? "Try a different search term, or clear the search to see all grades."
                      : "Your school levels will appear here once setup is complete."}
                  </p>
                  {searchTerm && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setSearchTerm("")}
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              ) : null)}
          </div>
        </div>
      </div>

      {/* Subjects Drawer */}
      <Drawer
        open={showSubjectsDrawer}
        onOpenChange={setShowSubjectsDrawer}
        direction="right"
      >
        <DrawerContent className="flex h-[95vh] max-h-[95dvh] flex-col bg-slate-50/50 dark:bg-slate-950 sm:max-w-lg">
          <DrawerHeader className="flex-shrink-0 border-b border-slate-200/80 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <DrawerTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  All subjects
                </DrawerTitle>
                <DrawerDescription className="mt-1 text-xs text-slate-500">
                  {selectedGrade
                    ? `${selectedGrade.levelName} · ${selectedGrade.name}`
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
          <div className="flex-1 overflow-y-auto px-5 py-4">
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
                selectedGrade?.grade
                  ? () => {
                      if (selectedStreamId && selectedGrade.streamName) {
                        setAssignTeacherData({
                          streamId: selectedStreamId,
                          streamName: selectedGrade.streamName,
                        });
                      } else {
                        setAssignTeacherData({
                          gradeLevelId: selectedGrade.grade.id,
                          gradeName: selectedGrade.name,
                        });
                      }
                      setShowAssignTeacherModal(true);
                    }
                  : undefined
              }
            />
          </div>
        </DrawerContent>
      </Drawer>

      {showAddStreamModal && selectedGrade?.grade && (
        <AddStreamModal
          isOpen={showAddStreamModal}
          onClose={() => setShowAddStreamModal(false)}
          onSuccess={() => setShowAddStreamModal(false)}
          gradeId={selectedGrade.grade.id}
          gradeName={selectedGrade.grade.name}
        />
      )}
      {showAssignTeacherModal && (
        <AssignTeacherModal
          isOpen={showAssignTeacherModal}
          onClose={() => setShowAssignTeacherModal(false)}
          onSuccess={() => setShowAssignTeacherModal(false)}
          streamId={assignTeacherData.streamId}
          streamName={assignTeacherData.streamName}
          gradeLevelId={assignTeacherData.gradeLevelId}
          gradeName={assignTeacherData.gradeName}
        />
      )}

      {addSubjectContext && (
        <AddSubjectDialog
          open={showAddSubjectDialog}
          onOpenChange={setShowAddSubjectDialog}
          curriculumId={addSubjectContext.curriculumId}
          levelName={addSubjectContext.levelName}
          gradeName={addSubjectContext.gradeName}
          streamName={addSubjectContext.streamName}
        />
      )}
    </div>
  );
}
