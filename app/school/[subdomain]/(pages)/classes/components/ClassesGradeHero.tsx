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
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1a4d42]/55 transition-colors hover:text-[#246a59]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All classes
      </button>

      <div className="overflow-hidden rounded-none border border-[#1a4d42]/12 bg-white shadow-[3px_3px_0_0_rgba(10,31,26,0.05)] dark:border-white/10 dark:bg-[#0c1a17]">
        <div className="bg-gradient-to-br from-[#246a59]/[0.06] via-[#f8fbfa] to-[#f3f7f5] px-4 py-4 dark:from-[#246a59]/12 dark:via-[#0c1a17] dark:to-[#071411] sm:px-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#246a59]">
            {levelName}
          </p>
          <h2 className="mt-1 font-display text-xl font-normal tracking-tight text-[#0a1f1a] dark:text-white">
            {title}
          </h2>
          <p className="mt-1 text-xs text-[#1a4d42]/55">
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
                    "h-8 gap-1.5 rounded-none text-xs",
                    isPrimary
                      ? "bg-[#0a1f1a] text-white hover:bg-[#246a59]"
                      : "border-[#1a4d42]/15",
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

        <div className="border-t border-[#1a4d42]/10 px-4 py-3 dark:border-white/10 sm:px-5">
          <GradeDetailsView
            grade={grade}
            selectedStreamId={selectedStreamId || undefined}
            onStreamSelect={onStreamSelect}
            onAssignTeacher={onAssignTeacher}
          />
        </div>

        {selectedStreamId && grade.streams && grade.streams.length > 1 ? (
          <div className="flex flex-wrap gap-1.5 border-t border-[#1a4d42]/10 px-4 py-2.5 dark:border-white/10 sm:px-5">
            <span className="w-full text-[10px] font-semibold uppercase tracking-wide text-[#1a4d42]/45 sm:w-auto sm:py-1">
              Switch stream
            </span>
            {grade.streams.map((stream) => (
              <button
                key={stream.id}
                type="button"
                onClick={() => onStreamSelect(stream.id)}
                className={cn(
                  "rounded-none px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedStreamId === stream.id
                    ? "bg-[#246a59] text-white"
                    : "bg-[#e8f2ef] text-[#1a4d42]/80 hover:bg-[#e8f2ef] dark:bg-slate-800 dark:text-slate-200",
                )}
              >
                {stream.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onStreamSelect("")}
              className="rounded-none px-3 py-1.5 text-xs font-medium text-[#246a59] hover:underline"
            >
              Whole grade
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
