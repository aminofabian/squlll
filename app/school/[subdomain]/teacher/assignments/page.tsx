"use client";

import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  Plus,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams, useRouter } from "next/navigation";
import { useTeacherAssignments } from "@/lib/teacher/useTeacherAssignments";
import { CreateAssignmentDialog } from "./components/CreateAssignmentDialog";
import { PageHeader } from "../components/ui/PageHeader";
import { Panel } from "../components/ui/Panel";
import { EmptyState, ListSkeleton } from "../components/ui/States";
import { tp } from "../styles/portal";
import { cn } from "@/lib/utils";

type SortKey = "date" | "title" | "subject" | "grade";
type StatusKey = "all" | "draft" | "published" | "completed";

const STATUS_CHIPS: Array<{ id: StatusKey; label: string }> = [
  { id: "all", label: "All" },
  { id: "draft", label: "Drafts" },
  { id: "published", label: "Published" },
  { id: "completed", label: "Completed" },
];

const STATUS_TONE: Record<string, string> = {
  draft:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
  published:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
  completed: "bg-muted text-muted-foreground",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AssignmentsPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain =
    typeof params.subdomain === "string"
      ? params.subdomain
      : Array.isArray(params.subdomain)
        ? params.subdomain[0]
        : "";

  const { assignments, loading, error, refetch } = useTeacherAssignments();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<StatusKey>("all");
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [createOpen, setCreateOpen] = useState(false);
  const [createdNotice, setCreatedNotice] = useState<string | null>(null);

  const uniqueGrades = useMemo(
    () =>
      Array.from(
        new Set(
          assignments.flatMap((assignment) =>
            assignment.gradeLevels.map((gradeLevel) => gradeLevel.gradeLevel.name),
          ),
        ),
      ).sort(),
    [assignments],
  );

  const uniqueSubjects = useMemo(
    () =>
      Array.from(
        new Set(assignments.map((assignment) => assignment.subject.subject.name)),
      ).sort(),
    [assignments],
  );

  const counts = useMemo(
    () => ({
      all: assignments.length,
      draft: assignments.filter((a) => a.status === "draft").length,
      published: assignments.filter((a) => a.status === "published").length,
      completed: assignments.filter((a) => a.status === "completed").length,
    }),
    [assignments],
  );

  const filteredAssignments = assignments.filter((assignment) => {
    const needle = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !needle ||
      assignment.title.toLowerCase().includes(needle) ||
      assignment.subject.subject.name.toLowerCase().includes(needle);

    const matchesGrade =
      selectedGrade === "all" ||
      assignment.gradeLevels.some(
        (gradeLevel) => gradeLevel.gradeLevel.name === selectedGrade,
      );

    const matchesSubject =
      selectedSubject === "all" ||
      assignment.subject.subject.name === selectedSubject;

    const matchesStatus =
      selectedStatus === "all" || assignment.status === selectedStatus;

    return matchesSearch && matchesGrade && matchesSubject && matchesStatus;
  });

  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case "title":
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case "subject":
        aValue = a.subject.subject.name.toLowerCase();
        bValue = b.subject.subject.name.toLowerCase();
        break;
      case "grade":
        aValue = a.gradeLevels
          .map((g) => g.gradeLevel.name)
          .sort()
          .join(", ")
          .toLowerCase();
        bValue = b.gradeLevels
          .map((g) => g.gradeLevel.name)
          .sort()
          .join(", ")
          .toLowerCase();
        break;
      case "date":
      default:
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const hasFilters =
    Boolean(searchTerm) ||
    selectedGrade !== "all" ||
    selectedSubject !== "all" ||
    selectedStatus !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedGrade("all");
    setSelectedSubject("all");
    setSelectedStatus("all");
  };

  return (
    <div className={tp.page}>
      <div className={tp.stack}>
        <PageHeader
          eyebrow="Coursework"
          title="Assignments"
          description="Tests and homework you've set, how far learners have got, and what still needs marking."
          actions={
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="tp-focus tp-press inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-[13px] font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-colors hover:bg-primary-dark"
            >
              <Plus className="size-4" strokeWidth={2.2} />
              New assignment
            </button>
          }
        />

        {createdNotice ? (
          <div className="tp-fade flex items-start gap-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-4 py-3 text-[13px] text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
            <span className="flex-1 text-pretty">{createdNotice}</span>
            <button
              type="button"
              className="tp-focus rounded-full px-1 text-[11px] font-semibold uppercase tracking-wide opacity-70 transition-opacity hover:opacity-100"
              onClick={() => setCreatedNotice(null)}
            >
              Dismiss
            </button>
          </div>
        ) : null}

        <Panel padded={false} delay={1}>
          <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by title or subject"
                  className={cn(tp.inputSoft, "pl-9")}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:w-auto">
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger className="h-10 w-full rounded-xl border-border/80 bg-card text-[13px]">
                    <SelectValue placeholder="All classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All classes</SelectItem>
                    {uniqueGrades.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="h-10 w-full rounded-xl border-border/80 bg-card text-[13px]">
                    <SelectValue placeholder="All subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All subjects</SelectItem>
                    {uniqueSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={`${sortBy}:${sortOrder}`}
                  onValueChange={(value) => {
                    const [key, order] = value.split(":");
                    setSortBy(key as SortKey);
                    setSortOrder(order as "asc" | "desc");
                  }}
                >
                  <SelectTrigger className="col-span-2 h-10 w-full rounded-xl border-border/80 bg-card text-[13px] sm:col-span-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date:desc">Newest first</SelectItem>
                    <SelectItem value="date:asc">Oldest first</SelectItem>
                    <SelectItem value="title:asc">Title A–Z</SelectItem>
                    <SelectItem value="subject:asc">Subject</SelectItem>
                    <SelectItem value="grade:asc">Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {STATUS_CHIPS.map((chip) => {
                const active = selectedStatus === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setSelectedStatus(chip.id)}
                    aria-pressed={active}
                    className={cn(
                      "tp-focus inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                      active
                        ? "bg-primary/[0.08] text-primary"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    {chip.label}
                    <span className="tp-num text-[11px] opacity-70">
                      {counts[chip.id]}
                    </span>
                  </button>
                );
              })}
              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="tp-focus ml-auto rounded-full px-2 py-1 text-[11.5px] font-semibold text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          {loading ? (
            <div className="p-5 sm:p-6">
              <ListSkeleton rows={4} />
            </div>
          ) : error ? (
            <EmptyState
              icon={FileText}
              title="Assignments didn't load"
              description={error}
              action={
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="tp-focus inline-flex h-9 items-center rounded-full border border-border/80 px-4 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-muted/50"
                >
                  Try again
                </button>
              }
            />
          ) : sortedAssignments.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={assignments.length === 0 ? "Nothing set yet" : "No matches"}
              description={
                assignments.length === 0
                  ? "Create your first assignment and it will appear here with learner progress."
                  : "Try a different search, or clear the filters to see everything."
              }
              action={
                assignments.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => setCreateOpen(true)}
                    className="tp-focus inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-[12.5px] font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
                  >
                    <Plus className="size-3.5" />
                    Create assignment
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="tp-focus inline-flex h-9 items-center rounded-full border border-border/80 px-4 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-muted/50"
                  >
                    Clear filters
                  </button>
                )
              }
            />
          ) : (
            <ul className="divide-y divide-border/70">
              {sortedAssignments.map((assignment) => {
                const classNames = assignment.gradeLevels
                  .map((gradeLevel) => gradeLevel.gradeLevel.name)
                  .join(", ");
                return (
                  <li key={assignment.id}>
                    <button
                      type="button"
                      onClick={() => router.push(`assignments/${assignment.id}`)}
                      className="tp-focus group flex w-full items-center gap-3.5 px-4 py-4 text-left transition-colors hover:bg-muted/30 sm:px-5"
                    >
                      <span className="hidden size-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-muted/40 text-muted-foreground transition-colors group-hover:border-primary/25 group-hover:text-primary sm:flex">
                        <FileText className="size-4" strokeWidth={1.7} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold text-foreground">
                          {assignment.title}
                        </span>
                        <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">
                          {assignment.subject.subject.name}
                          {classNames ? ` · ${classNames}` : ""} ·{" "}
                          {assignment.questions.length} questions ·{" "}
                          {assignment.totalMarks} marks
                        </span>
                      </span>
                      <span className="hidden shrink-0 text-right md:block">
                        <span className="block text-[12.5px] font-medium text-foreground">
                          {formatDate(assignment.date)}
                        </span>
                        <span className="tp-num mt-0.5 block text-[11px] text-muted-foreground">
                          {assignment.submissionCount} submitted
                          {assignment.gradedCount > 0
                            ? ` · ${assignment.gradedCount} graded`
                            : ""}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-semibold capitalize",
                          STATUS_TONE[assignment.status] ?? "bg-muted text-muted-foreground",
                        )}
                      >
                        {assignment.status}
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <p className="text-[11.5px] text-muted-foreground/70">
          Showing {sortedAssignments.length} of {assignments.length} assignments.
        </p>
      </div>

      <CreateAssignmentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        subdomain={subdomain}
        onCreated={(created) => {
          setCreatedNotice(
            `${created.title} is live in ${created.classCount} ${
              created.classCount === 1 ? "class" : "classes"
            }.`,
          );
          void refetch();
        }}
      />
    </div>
  );
}
