"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { UserPlus, Layers, BookOpen, GraduationCap, Menu, X, Plus } from "lucide-react";
import CreateClassDrawer from "@/app/school/components/CreateClassDrawer";
import type { GradeLevel } from "@/lib/types/school-config";
import { cn } from "@/lib/utils";

interface ActionsDrawerProps {
  onCreateClass?: () => void;
  onViewSubjects?: () => void;
  onAddSubject?: () => void;
  selectedGrade?: GradeLevel | null;
  onAddStream?: (gradeId: string) => void;
  onAssignTeacher?: (gradeLevelId: string, gradeName: string) => void;
  selectedStreamId?: string;
  selectedStreamName?: string;
  onAssignStreamTeacher?: (streamId: string, streamName: string) => void;
}

function ActionRow({
  icon: Icon,
  title,
  description,
  onClick,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  const content = (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
        <Icon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {title}
        </p>
        <p className="text-[11px] text-slate-400">{description}</p>
      </div>
      {children}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 text-left transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-800/40"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/40">
      {content}
    </div>
  );
}

export function ActionsDrawer({
  onCreateClass,
  onViewSubjects,
  onAddSubject,
  selectedGrade,
  onAddStream,
  onAssignTeacher,
  selectedStreamId,
  selectedStreamName,
  onAssignStreamTeacher,
}: ActionsDrawerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const close = () => setIsOpen(false);

  const handleAddStream = () => {
    if (selectedGrade && onAddStream) {
      onAddStream(selectedGrade.id);
      close();
    }
  };

  const handleAssignTeacher = () => {
    if (selectedStreamId && selectedStreamName && onAssignStreamTeacher) {
      onAssignStreamTeacher(selectedStreamId, selectedStreamName);
      close();
    } else if (selectedGrade && onAssignTeacher) {
      onAssignTeacher(selectedGrade.id, selectedGrade.name);
      close();
    }
  };

  const handleViewSubjects = () => {
    onViewSubjects?.();
    close();
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 border-slate-200">
          <Menu className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Actions</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-w-sm h-[95vh] flex flex-col bg-slate-50/50 dark:bg-slate-950">
        <DrawerHeader className="border-b border-slate-200/80 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Actions
              </DrawerTitle>
              <DrawerDescription className="text-xs text-slate-500 mt-0.5">
                Manage classes, streams, and teachers
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              General
            </h3>
            <div className="space-y-2">
              {onCreateClass && (
                <ActionRow
                  icon={GraduationCap}
                  title="Create class"
                  description="Add a new grade or level"
                >
                  <CreateClassDrawer
                    onClassCreated={() => {
                      onCreateClass();
                      close();
                    }}
                  />
                </ActionRow>
              )}
              {onViewSubjects && (
                <ActionRow
                  icon={BookOpen}
                  title="View subjects"
                  description="Browse core and elective subjects"
                  onClick={handleViewSubjects}
                />
              )}
              {onAddSubject && (
                <ActionRow
                  icon={Plus}
                  title="Add subject"
                  description="Assign catalog or custom subject to level"
                  onClick={() => {
                    onAddSubject();
                    close();
                  }}
                />
              )}
            </div>
          </section>

          {selectedGrade && (
            <section>
              <h3
                className={cn(
                  "mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400",
                )}
              >
                {selectedGrade.name}
              </h3>
              <div className="space-y-2">
                {onAddStream && (
                  <ActionRow
                    icon={Layers}
                    title="Add stream"
                    description={`Create a stream for ${selectedGrade.name}`}
                    onClick={handleAddStream}
                  />
                )}
                {(onAssignTeacher || onAssignStreamTeacher) && (
                  <ActionRow
                    icon={UserPlus}
                    title={
                      selectedStreamId
                        ? "Assign stream teacher"
                        : "Assign class teacher"
                    }
                    description={
                      selectedStreamId
                        ? `For ${selectedStreamName}`
                        : `For ${selectedGrade.name}`
                    }
                    onClick={handleAssignTeacher}
                  />
                )}
              </div>
            </section>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
