"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LetterGradeSelectorProps {
  grades: string[];
  value: string;
  onChange: (grade: string) => void;
  className?: string;
  showHelper?: boolean;
  variant?: 'default' | 'planner' | 'compact';
}

export function LetterGradeSelector({
  grades,
  value,
  onChange,
  className,
  showHelper = true,
  variant = 'default',
}: LetterGradeSelectorProps) {
  if (grades.length === 0) return null;

  const planner = variant === 'planner';
  const compact = variant === 'compact';

  if (grades.length === 1) {
    return (
      <div
        className={
          planner
            ? 'rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700 ring-1 ring-slate-200/70'
            : compact
              ? 'text-xs text-slate-600'
              : undefined
        }
      >
        {compact ? (
          <>
            Grade: <strong className="text-slate-900">{grades[0]}</strong>
          </>
        ) : (
          <>
            Letter title grade:{' '}
            <strong className="text-slate-900">{grades[0]}</strong>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {!planner && !compact ? (
        <Label
          htmlFor="letter-grade-select"
          className="text-xs font-medium text-slate-500"
        >
          Grade on letter
        </Label>
      ) : null}
      <Select value={value || grades[0]} onValueChange={onChange}>
        <SelectTrigger
          id="letter-grade-select"
          className={
            compact
              ? 'h-8 border-slate-200 bg-white text-xs'
              : planner
                ? 'h-10 rounded-xl border-slate-200/80 bg-white text-sm font-medium shadow-sm ring-1 ring-slate-100'
                : 'mt-1.5 h-9 border-slate-200 bg-white text-sm'
          }
        >
          <SelectValue placeholder="Choose a grade" />
        </SelectTrigger>
        <SelectContent>
          {grades.map((grade) => (
            <SelectItem key={grade} value={grade}>
              {grade}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showHelper ? (
        <p
          className={cn(
            "mt-1.5 leading-relaxed text-slate-500",
            compact ? "text-[10px]" : "text-xs",
          )}
        >
          {compact
            ? "Letter title uses this grade. Defaults to the first class linked to this structure."
            : "The letter heading shows this grade. Fee amounts are the same for all grades in this structure unless you edited them per grade."}
        </p>
      ) : null}
    </div>
  );
}
