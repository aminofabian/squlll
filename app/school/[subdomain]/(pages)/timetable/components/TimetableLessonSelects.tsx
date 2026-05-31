"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type LessonTeacher = { id: string; name: string };
type LessonSubject = {
  id: string;
  name: string;
  color?: string;
  department?: string;
  code?: string;
};

export const lessonSelectTriggerClass = cn(
  "h-8 rounded-md border-slate-200 bg-white px-2.5 text-xs shadow-none",
  "focus:ring-1 focus:ring-slate-200 focus:ring-offset-0",
  "dark:border-slate-700 dark:bg-slate-900",
);

export const lessonSelectTriggerCompactClass = cn(
  lessonSelectTriggerClass,
  "h-7 text-[11px]",
);

const selectContentClass = cn(
  "rounded-md border border-slate-200 bg-white p-0.5 shadow-sm",
  "dark:border-slate-700 dark:bg-slate-900",
);

const selectItemClass = cn(
  "rounded-sm py-1.5 pl-7 pr-2 text-xs text-slate-700",
  "focus:bg-slate-50 data-[highlighted]:bg-slate-50",
  "dark:text-slate-200 dark:focus:bg-slate-800 dark:data-[highlighted]:bg-slate-800",
);

interface TeacherSelectProps {
  id?: string;
  value: string | undefined;
  onValueChange: (value: string) => void;
  teachers: LessonTeacher[];
  placeholder?: string;
  compact?: boolean;
  disabled?: boolean;
  emptyLabel?: string;
}

export function TeacherSelect({
  id,
  value,
  onValueChange,
  teachers,
  placeholder = "Teacher",
  compact = false,
  disabled = false,
  emptyLabel = "No teachers",
}: TeacherSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || teachers.length === 0}
    >
      <SelectTrigger
        id={id}
        className={compact ? lessonSelectTriggerCompactClass : lessonSelectTriggerClass}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={selectContentClass}>
        {teachers.length > 0 ? (
          teachers.map((teacher) => (
            <SelectItem
              key={teacher.id}
              value={teacher.id}
              className={selectItemClass}
            >
              {teacher.name}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="none" disabled className={selectItemClass}>
            {emptyLabel}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}

interface SubjectSelectProps {
  id?: string;
  value: string | undefined;
  onValueChange: (value: string) => void;
  subjects: LessonSubject[];
  placeholder?: string;
  compact?: boolean;
  disabled?: boolean;
  emptyLabel?: string;
}

export function SubjectSelect({
  id,
  value,
  onValueChange,
  subjects,
  placeholder = "Subject",
  compact = false,
  disabled = false,
  emptyLabel = "No subjects",
}: SubjectSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || subjects.length === 0}
    >
      <SelectTrigger
        id={id}
        className={compact ? lessonSelectTriggerCompactClass : lessonSelectTriggerClass}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={selectContentClass}>
        {subjects.length > 0 ? (
          subjects.map((subject) => (
            <SelectItem
              key={subject.id}
              value={subject.id}
              className={selectItemClass}
            >
              {subject.name}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="none" disabled className={selectItemClass}>
            {emptyLabel}
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
