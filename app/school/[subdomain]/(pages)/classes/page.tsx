"use client";

import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { SchoolSearchFilter } from "@/components/dashboard/SchoolSearchFilter";
import { ClassesStats } from "./components/ClassesStats";
import { SubjectsView } from "./components/SubjectsView";
import { GradeDetailsView } from "./components/GradeDetailsView";
import { ActionsDrawer } from "./components/ActionsDrawer";
import { AddStreamModal } from "../components/AddStreamModal";
import { AssignTeacherModal } from "../components/AssignTeacherModal";

export default function ClassesPage() {
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

  // Filter levels
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

  // ─── Error ─────────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900 items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600 mb-2">
            Error Loading Classes
          </h2>
          <p className="text-sm text-red-500">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform md:relative md:translate-x-0 transition-all duration-300 ${isSidebarMinimized ? "w-16" : "w-72"} flex flex-col`}
      >
        <div
          className={`p-4 border-b border-slate-200 dark:border-slate-800 ${isSidebarMinimized ? "flex justify-center" : "flex justify-end"}`}
        >
          <Button
            variant="outline"
            size="sm"
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
          <div className="flex-1 overflow-y-auto">
            <SchoolSearchFilter
              className="p-4"
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
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {/* Tabs */}
          <Tabs defaultValue="classes" className="mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="classes" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Classes & Grades
              </TabsTrigger>
              <TabsTrigger
                value="subjects"
                className="flex items-center gap-2"
                onClick={() => setShowSubjectsDrawer(true)}
              >
                <BookOpen className="h-4 w-4" />
                Subjects
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                Classes & Grades
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage class information, subjects, and financial summaries
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isSidebarMinimized && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSidebarMinimized(false)}
                >
                  <PanelLeftOpen className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Filters</span>
                </Button>
              )}
              <ActionsDrawer
                onCreateClass={() => {}}
                onViewSubjects={() => setShowSubjectsDrawer(true)}
                selectedGrade={selectedGrade?.grade || null}
                selectedStreamId={selectedStreamId || undefined}
                selectedStreamName={selectedGrade?.streamName}
                onAddStream={() => {
                  if (selectedGrade?.grade) setShowAddStreamModal(true);
                }}
                onAssignTeacher={(levelId, gradeName) => {
                  setAssignTeacherData({ gradeLevelId: levelId, gradeName });
                  setShowAssignTeacherModal(true);
                }}
                onAssignStreamTeacher={(streamId, streamName) => {
                  setAssignTeacherData({ streamId, streamName });
                  setShowAssignTeacherModal(true);
                }}
              />
            </div>
          </div>

          {/* Stats (only when no grade selected) */}
          {!selectedGradeId && (
            <div className="mb-6">
              <ClassesStats config={config} isLoading={isLoading} />
            </div>
          )}

          {/* Active Filters */}
          {!isLoading && config && (selectedGrade || searchTerm) && (
            <div className="mb-4 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 flex flex-wrap gap-2 items-center">
              <span className="text-xs font-semibold text-slate-500">
                Filters:
              </span>
              {selectedGrade && (
                <Badge
                  variant="secondary"
                  className="flex gap-1.5 items-center"
                >
                  {selectedGrade.name}
                  {selectedGrade.streamName
                    ? ` (${selectedGrade.streamName})`
                    : ""}{" "}
                  · {selectedGrade.levelName}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={clearFilters}
                  />
                </Badge>
              )}
              {searchTerm && (
                <Badge
                  variant="secondary"
                  className="flex gap-1.5 items-center"
                >
                  &ldquo;{searchTerm}&rdquo;
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500"
                    onClick={() => setSearchTerm("")}
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-xs"
                onClick={clearFilters}
              >
                Clear All
              </Button>
            </div>
          )}

          {/* Grade Detail */}
          {selectedGradeId && selectedGrade?.grade && (
            <div className="mb-6">
              <GradeDetailsView
                grade={selectedGrade.grade}
                levelName={selectedGrade.levelName}
                selectedStreamId={selectedStreamId || undefined}
              />
            </div>
          )}

          {/* Class Cards */}
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <ClassCardSkeleton key={i} />
              ))
            ) : filteredLevels.length > 0 ? (
              filteredLevels.map((level) => (
                <ClassCard
                  key={level.id}
                  level={level}
                  selectedGradeId={selectedGradeId}
                  selectedStreamId={selectedStreamId}
                  onStreamSelect={handleStreamSelect}
                />
              ))
            ) : config ? (
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-8 text-center">
                <h3 className="text-base font-medium text-slate-600 dark:text-slate-400">
                  No classes found
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedGrade
                    ? `No classes for ${selectedGrade.name} in ${selectedGrade.levelName}.`
                    : "Try adjusting your search or filters."}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Subjects Drawer */}
      <Drawer
        open={showSubjectsDrawer}
        onOpenChange={setShowSubjectsDrawer}
        direction="right"
      >
        <DrawerContent className="max-w-4xl h-[95vh] flex flex-col">
          <DrawerHeader className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-lg font-bold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Subjects
                </DrawerTitle>
                <DrawerDescription className="text-sm text-slate-500">
                  View and manage all subjects across grades
                </DrawerDescription>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <SubjectsView selectedGradeId={selectedGradeId || null} />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Modals */}
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
    </div>
  );
}
