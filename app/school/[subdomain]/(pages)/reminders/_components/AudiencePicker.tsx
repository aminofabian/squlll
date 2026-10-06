"use client";

import { useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  searchCommunicationStudents,
  type CommunicationAudienceOptions,
  type StudentOption,
} from "@/lib/school/communicationsApi";

export const AUDIENCE_OPTIONS = [
  { value: "ALL_PARENTS", label: "All parents / guardians" },
  { value: "DEBTORS", label: "Parents with a fee balance" },
  { value: "GRADE", label: "A specific grade" },
  { value: "STREAM", label: "A specific class / stream" },
  { value: "STUDENTS", label: "Selected students" },
  { value: "ALL_STAFF", label: "All staff" },
] as const;

export interface AudienceValue {
  type: string;
  gradeId?: string;
  streamId?: string;
  students: StudentOption[];
}

export function emptyAudience(): AudienceValue {
  return { type: "ALL_PARENTS", students: [] };
}

/**
 * Audience selector shared by the reminder editor and the "copy to audience"
 * action: a type picker plus grade / class / student sub-pickers.
 */
export function AudiencePicker({
  options,
  value,
  onChange,
}: {
  options: CommunicationAudienceOptions;
  value: AudienceValue;
  onChange: (next: AudienceValue) => void;
}) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<StudentOption[]>([]);
  const [searching, setSearching] = useState(false);

  const search = async () => {
    try {
      setSearching(true);
      setResults(await searchCommunicationStudents(term, 15));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const addStudent = (student: StudentOption) => {
    onChange({
      ...value,
      students: value.students.some((s) => s.id === student.id)
        ? value.students
        : [...value.students, student],
    });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Audience</Label>
        <Select
          value={value.type}
          onValueChange={(type) => onChange({ ...value, type })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AUDIENCE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {value.type === "GRADE" ? (
        <div className="space-y-2">
          <Label>Grade</Label>
          <Select
            value={value.gradeId ?? ""}
            onValueChange={(gradeId) => onChange({ ...value, gradeId })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a grade" />
            </SelectTrigger>
            <SelectContent>
              {options.grades.map((grade) => (
                <SelectItem key={grade.id} value={grade.id}>
                  {grade.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {value.type === "STREAM" ? (
        <div className="space-y-2">
          <Label>Class / stream</Label>
          <Select
            value={value.streamId ?? ""}
            onValueChange={(streamId) => onChange({ ...value, streamId })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a class" />
            </SelectTrigger>
            <SelectContent>
              {options.streams.map((stream) => (
                <SelectItem key={stream.id} value={stream.id}>
                  {stream.gradeName
                    ? `${stream.gradeName} · ${stream.name}`
                    : stream.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {value.type === "STUDENTS" ? (
        <div className="space-y-2">
          <Label>Students</Label>
          <div className="flex gap-2">
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void search();
                }
              }}
              placeholder="Search by name or admission no."
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => void search()}
              disabled={searching}
            >
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          {results.length > 0 ? (
            <ul className="max-h-40 overflow-auto rounded-md border text-sm">
              {results.map((student) => (
                <li key={student.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-muted"
                    onClick={() => addStudent(student)}
                  >
                    <span className="truncate">{student.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {student.admissionNumber}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {value.students.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {value.students.map((student) => (
                <span
                  key={student.id}
                  className="inline-flex items-center gap-1 rounded-full border bg-muted/50 px-2 py-0.5 text-xs"
                >
                  {student.name}
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...value,
                        students: value.students.filter(
                          (s) => s.id !== student.id,
                        ),
                      })
                    }
                    aria-label="Remove student"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
