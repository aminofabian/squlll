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
  "h-8 rounded-none border-[#1a4d42]/12 bg-white px-2.5 text-xs shadow-none",
  "focus:ring-1 focus:ring-[#246a59]/35 focus:ring-offset-0",
  "dark:border-white/10 dark:bg-[#0c1a17]",
);

export const lessonSelectTriggerCompactClass = cn(
  lessonSelectTriggerClass,
  "h-7 text-[11px]",
);

const selectContentClass = cn(
  "rounded-none border border-[#1a4d42]/12 bg-white p-0.5 shadow-sm",
  "dark:border-white/10 dark:bg-[#0c1a17]",
);

const selectItemClass = cn(
  "rounded-none py-1.5 pl-7 pr-2 text-xs text-[#1a4d42]/75",
  "focus:bg-[#f3f7f5] data-[highlighted]:bg-[#f3f7f5]",
  "dark:text-white/70 dark:focus:bg-white/5 dark:data-[highlighted]:bg-white/5",
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
