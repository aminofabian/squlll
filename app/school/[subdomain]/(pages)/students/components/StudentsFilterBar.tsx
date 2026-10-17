"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudentFilter } from "../utils/students-utils";
import {
  studentsFilterPill,
  studentsSelect,
} from "./students-ui";

export interface StudentClassOption {
  id: string;
  name: string;
  levelName: string;
  count: number;
}

export interface StudentStreamOption {
  id: string;
  name: string;
  count: number;
}

interface StudentsFilterBarProps {
  filter: StudentFilter;
  onFilterChange: (filter: StudentFilter) => void;
  counts: {
    all: number;
    active: number;
    inactive: number;
    missingClass: number;
  };
  classOptions: StudentClassOption[];
  classId: string;
  onClassChange: (classId: string) => void;
  streamOptions: StudentStreamOption[];
  streamId: string;
  onStreamChange: (streamId: string) => void;
}

const filters: { id: StudentFilter; label: string }[] = [
  { id: "all", label: "All students" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
  { id: "missing-class", label: "No class" },
];

export function StudentsFilterBar({
  filter,
  onFilterChange,
  counts,
  classOptions,
  classId,
  onClassChange,
  streamOptions,
  streamId,
  onStreamChange,
}: StudentsFilterBarProps) {
  const countFor = (id: StudentFilter) => {
    switch (id) {
      case "all":
        return counts.all;
      case "active":
        return counts.active;
      case "inactive":
        return counts.inactive;
      case "missing-class":
        return counts.missingClass;
      default:
        return 0;
    }
  };

  const streamDisabled = classId === "all" || streamOptions.length === 0;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-1.5">
        {filters.map(({ id, label }) => {
          const isActive = filter === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onFilterChange(id)}
              className={studentsFilterPill(isActive)}
            >
              {label}
              <span
                className={cn(
                  "tabular-nums",
                  isActive ? "opacity-75" : "text-slate-400",
                )}
              >
                {countFor(id)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <label
            htmlFor="student-class-filter"
            className="text-xs text-slate-400"
          >
            Class
          </label>
          <div className="relative">
            <select
              id="student-class-filter"
              value={classId}
              onChange={(event) => onClassChange(event.target.value)}
              className={cn(studentsSelect, "max-w-[13rem]")}
            >
              <option value="all">All classes</option>
              {classOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name} · {option.levelName} ({option.count})
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <label
            htmlFor="student-stream-filter"
            className="text-xs text-slate-400"
          >
            Stream
          </label>
          <div className="relative">
            <select
              id="student-stream-filter"
              value={streamId}
              onChange={(event) => onStreamChange(event.target.value)}
              disabled={streamDisabled}
              className={cn(
                studentsSelect,
                "max-w-[11rem]",
                streamDisabled && "cursor-not-allowed opacity-55",
              )}
            >
              <option value="all">
                {classId === "all" ? "Pick a class first" : "All streams"}
              </option>
              {streamOptions.map((stream) => (
                <option key={stream.id} value={stream.id}>
                  {stream.name} ({stream.count})
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </div>
  );
}
