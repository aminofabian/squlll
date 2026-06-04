"use client";

import {
  ArrowLeft,
  BookOpen,
  Layers,
  Plus,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GradeLevel } from "@/lib/types/school-config";
import { GradeDetailsView } from "./GradeDetailsView";
import { cn } from "@/lib/utils";
import type { ClassAction } from "./ClassActionBar";

interface ClassesGradeHeroProps {
  displayName: string;
  levelName: string;
  streamName?: string;
  grade: GradeLevel;
  selectedStreamId: string;
  onClear: () => void;
  onStreamSelect: (streamId: string) => void;
  onAssignTeacher: () => void;
  actions: Pick<ClassAction, "label" | "icon" | "onClick" | "disabled">[];
}

export function ClassesGradeHero({
  displayName,
  levelName,
  streamName,
  grade,
  selectedStreamId,
  onClear,
  onStreamSelect,
  onAssignTeacher,
  actions,
}: ClassesGradeHeroProps) {
  const title = streamName ? `${displayName} · ${streamName}` : displayName;

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-[#0073ea]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All classes
      </button>

      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <div className="bg-gradient-to-br from-[#0073ea]/[0.07] via-white to-slate-50/80 px-4 py-4 dark:from-[#0073ea]/12 dark:via-slate-900 sm:px-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0073ea]/80">
            {levelName}
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Subjects, class teacher, streams, and fee totals for this class.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {actions.map((action) => {
              const Icon = action.icon;
              const isPrimary = action.label === "Add subject";
              return (
                <Button
                  key={action.label}
                  type="button"
                  size="sm"
                  variant={isPrimary ? "default" : "outline"}
                  disabled={action.disabled}
                  className={cn(
                    "h-8 gap-1.5 text-xs",
                    isPrimary &&
                      "bg-[#0073ea] hover:bg-[#0062c4]",
                  )}
                  onClick={action.onClick}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
          <GradeDetailsView
            grade={grade}
            selectedStreamId={selectedStreamId || undefined}
            onStreamSelect={onStreamSelect}
            onAssignTeacher={onAssignTeacher}
          />
        </div>

        {selectedStreamId && grade.streams && grade.streams.length > 1 ? (
          <div className="flex flex-wrap gap-1.5 border-t border-slate-100 px-4 py-2.5 dark:border-slate-800 sm:px-5">
            <span className="w-full text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:w-auto sm:py-1">
              Switch stream
            </span>
            {grade.streams.map((stream) => (
              <button
                key={stream.id}
                type="button"
                onClick={() => onStreamSelect(stream.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedStreamId === stream.id
                    ? "bg-[#0073ea] text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200",
                )}
              >
                {stream.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onStreamSelect("")}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#0073ea] hover:underline"
            >
              Whole grade
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
