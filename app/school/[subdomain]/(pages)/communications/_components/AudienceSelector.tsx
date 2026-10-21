"use client";

import { useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  searchCommStudents,
  type CommAudience,
  type CommAudienceOptions,
  type CommStudentOption,
} from "@/lib/school/communicationsHubApi";
import { AUDIENCE_LABELS } from "@/lib/school/communicationsHubUtils";

const CAMPAIGN_AUDIENCES = [
  "ALL_PARENTS",
  "PARENTS_WITH_ACCOUNT",
  "PARENTS_WITHOUT_ACCOUNT",
  "ALL_STAFF",
  "ALL_TEACHERS",
  "ADMINS",
  "DEBTORS",
  "GRADE",
  "STREAM",
  "STUDENTS",
] as const;

export function AudienceSelector({
  audience,
  onChange,
  options,
  disabled = false,
  allowEventRecipients = false,
}: {
  audience: CommAudience;
  onChange: (audience: CommAudience) => void;
  options: CommAudienceOptions | null;
  disabled?: boolean;
  allowEventRecipients?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<CommStudentOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const selectedStudents = audience.studentIds ?? [];

  const setType = (type: string) => {
    onChange({ type });
    setResults([]);
    setError(null);
  };

  const runSearch = async () => {
    if (search.trim().length < 2) {
      setError("Type at least two characters to search.");
      return;
    }
    try {
      setSearching(true);
      setError(null);
      setResults(await searchCommStudents(search.trim(), 20));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const toggleStudent = (student: CommStudentOption) => {
    const exists = selectedStudents.includes(student.id);
    onChange({
      ...audience,
      studentIds: exists
        ? selectedStudents.filter((id) => id !== student.id)
        : [...selectedStudents, student.id],
    });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Who should receive this?</Label>
        <Select value={audience.type} onValueChange={setType} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder="Choose an audience" />
          </SelectTrigger>
          <SelectContent>
            {[
              ...CAMPAIGN_AUDIENCES,
              ...(allowEventRecipients ? (["EVENT_RECIPIENTS"] as const) : []),
            ].map((type) => (
              <SelectItem key={type} value={type}>
                {AUDIENCE_LABELS[type] ?? type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {audience.type === "GRADE" ? (
        <div className="space-y-1.5">
          <Label>Grade</Label>
          <Select
            value={audience.gradeId ?? ""}
            onValueChange={(value) => onChange({ ...audience, gradeId: value })}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a grade" />
            </SelectTrigger>
            <SelectContent>
              {(options?.grades ?? []).map((grade) => (
                <SelectItem key={grade.id} value={grade.id}>
                  {grade.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {audience.type === "STREAM" ? (
        <div className="space-y-1.5">
          <Label>Class / stream</Label>
          <Select
            value={audience.streamId ?? ""}
            onValueChange={(value) => onChange({ ...audience, streamId: value })}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a class" />
            </SelectTrigger>
            <SelectContent>
              {(options?.streams ?? []).map((stream) => (
                <SelectItem key={stream.id} value={stream.id}>
                  {stream.name}
                  {stream.gradeName ? ` · ${stream.gradeName}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {audience.type === "STUDENTS" ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void runSearch();
                }
              }}
              placeholder="Search by name or admission number"
              disabled={disabled}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => void runSearch()}
              disabled={disabled || searching}
            >
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Search
            </Button>
          </div>
          {error ? <p className="text-xs text-rose-600">{error}</p> : null}
          {selectedStudents.length ? (
            <div className="flex flex-wrap gap-1.5">
              {selectedStudents.map((id) => {
                const found = results.find((student) => student.id === id);
                return (
                  <Badge key={id} variant="secondary" className="gap-1">
                    {found?.name ?? id.slice(0, 8)}
                    <button
                      type="button"
                      aria-label="Remove student"
                      onClick={() => toggleStudent({ id, name: "", admissionNumber: null })}
                      className="ml-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          ) : null}
          {results.length ? (
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border p-1">
              {results.map((student) => {
                const selected = selectedStudents.includes(student.id);
                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => toggleStudent(student)}
                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                      selected
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span>
                      {student.name}
                      {student.admissionNumber ? (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {student.admissionNumber}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-xs">{selected ? "Selected" : "Add"}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">
        {audience.type === "ALL_PARENTS"
          ? "One message per guardian, even when several children attend the school."
          : audience.type === "DEBTORS"
            ? "Guardians of students with an outstanding fee balance at send time."
            : audience.type === "GRADE" || audience.type === "STREAM"
              ? "One message per guardian in the selected grade or class."
              : audience.type === "STUDENTS"
                ? "One message per guardian for each selected student."
                : audience.type === "EVENT_RECIPIENTS"
                  ? "The people naturally involved in the event (e.g. the new teacher, guardians of the student, or teachers in a swap)."
                  : "Audience is resolved securely inside this school."}
      </p>
    </div>
  );
}
