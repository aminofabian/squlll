"use client";

import { useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SchoolEmpty,
  SchoolLoading,
  SchoolPage,
  SchoolPanel,
  SchoolStat,
  fieldShell,
  labelClass,
  outlineButtonClass,
  primaryButtonClass,
  selectShell,
  thClass,
} from "@/components/school/SchoolContentPage";
import { cn } from "@/lib/utils";
import { getDisplayErrorMessage } from "@/lib/utils/graphql-errors";
import {
  createAcademicYear,
  createTerm,
  deleteAcademicYear,
  deleteTerm,
  fetchAcademicYears,
  type AcademicYear,
  type CreateAcademicYearInput,
  type CreateTermInput,
} from "@/lib/school/academicYears";

type TermInput = Omit<CreateTermInput, "academicYearId">;
type StatusFilter = "all" | "active" | "current";

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

function CreateAcademicYearForm({
  saving,
  onCancel,
  onSubmit,
}: {
  saving: boolean;
  onCancel: () => void;
  onSubmit: (input: CreateAcademicYearInput) => void;
}) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !startDate || !endDate) {
      toast.error("Please enter a name, start date and end date");
      return;
    }
    onSubmit({ name: name.trim(), startDate, endDate });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label className={labelClass} htmlFor="ay-name">
          Name
        </Label>
        <Input
          id="ay-name"
          className={fieldShell}
          value={name}
          placeholder="e.g. 2026 Academic Year"
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div>
        <Label className={labelClass} htmlFor="ay-start">
          Start date
        </Label>
        <Input
          id="ay-start"
          type="date"
          className={fieldShell}
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />
      </div>
      <div>
        <Label className={labelClass} htmlFor="ay-end">
          End date
        </Label>
        <Input
          id="ay-end"
          type="date"
          className={fieldShell}
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" className={primaryButtonClass} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add year
        </Button>
        <Button
          type="button"
          className={outlineButtonClass}
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function CreateTermForm({
  saving,
  onCancel,
  onSubmit,
}: {
  saving: boolean;
  onCancel: () => void;
  onSubmit: (input: TermInput) => void;
}) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !startDate || !endDate) {
      toast.error("Please enter a name, start date and end date");
      return;
    }
    onSubmit({ name: name.trim(), startDate, endDate, isActive });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label className={labelClass} htmlFor="term-name">
          Term name
        </Label>
        <Input
          id="term-name"
          className={fieldShell}
          value={name}
          placeholder="e.g. Term 1"
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div>
        <Label className={labelClass} htmlFor="term-start">
          Start date
        </Label>
        <Input
          id="term-start"
          type="date"
          className={fieldShell}
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />
      </div>
      <div>
        <Label className={labelClass} htmlFor="term-end">
          End date
        </Label>
        <Input
          id="term-end"
          type="date"
          className={fieldShell}
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />
      </div>
      <label className="flex items-center gap-2 text-xs text-[#0a1f1a] dark:text-white/80 sm:col-span-2">
        <input
          type="checkbox"
          className="size-4 accent-[#246a59]"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
        />
        Mark as active
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" className={primaryButtonClass} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add term
        </Button>
        <Button
          type="button"
          className={outlineButtonClass}
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function AcademicYearCard({
  year,
  deleting,
  addingTerm,
  deletingTermId,
  onDelete,
  onAddTerm,
  onDeleteTerm,
}: {
  year: AcademicYear;
  deleting: boolean;
  addingTerm: boolean;
  deletingTermId: string | null;
  onDelete: (id: string) => void;
  onAddTerm: (input: TermInput) => void;
  onDeleteTerm: (id: string) => void;
}) {
  const [showTermForm, setShowTermForm] = useState(false);
  const terms = year.terms ?? [];

  return (
    <SchoolPanel
      icon={CalendarDays}
      title={year.name}
      actions={
        <div className="flex items-center gap-2">
          {year.isCurrent ? <Badge>Current</Badge> : null}
          {year.isActive ? <Badge variant="secondary">Active</Badge> : null}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-label={`Delete ${year.name}`}
            disabled={deleting}
            onClick={() => onDelete(year.id)}
            className="h-8 rounded-none text-[#1a4d42]/60 hover:bg-red-50 hover:text-red-600 dark:text-white/60 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-[#1a4d42]/55 dark:text-white/45">
            {formatDate(year.startDate)} — {formatDate(year.endDate)}
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={outlineButtonClass}
            onClick={() => setShowTermForm((open) => !open)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add term
          </Button>
        </div>

        {showTermForm ? (
          <div className="border border-[#1a4d42]/10 p-3 dark:border-white/10">
            <CreateTermForm
              saving={addingTerm}
              onCancel={() => setShowTermForm(false)}
              onSubmit={(input) => {
                onAddTerm(input);
                setShowTermForm(false);
              }}
            />
          </div>
        ) : null}

        {terms.length === 0 ? (
          <p className="text-xs text-[#1a4d42]/45 dark:text-white/40">
            No terms yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#1a4d42]/10 dark:border-white/10">
                  <th className={cn(thClass, "text-left")}>Term</th>
                  <th className={cn(thClass, "text-left")}>Dates</th>
                  <th className={cn(thClass, "text-left")}>Status</th>
                  <th className={cn(thClass, "text-right")} aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {terms.map((term) => (
                  <tr
                    key={term.id}
                    className="border-b border-[#1a4d42]/8 last:border-0 dark:border-white/5"
                  >
                    <td className="py-2 pr-3 text-[#0a1f1a] dark:text-white">
                      {term.name}
                    </td>
                    <td className="py-2 pr-3 text-[#1a4d42]/55 dark:text-white/45">
                      {formatDate(term.startDate)} — {formatDate(term.endDate)}
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex flex-wrap gap-1">
                        {term.isCurrent ? <Badge>Current</Badge> : null}
                        {term.isActive ? (
                          <Badge variant="secondary">Active</Badge>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-2 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        aria-label={`Delete ${term.name}`}
                        disabled={deletingTermId === term.id}
                        onClick={() => onDeleteTerm(term.id)}
                        className="h-8 rounded-none text-[#1a4d42]/60 hover:bg-red-50 hover:text-red-600 dark:text-white/60 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                      >
                        {deletingTermId === term.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SchoolPanel>
  );
}

export function SchoolYearsPanel() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const queryClient = useQueryClient();

  const [showYearForm, setShowYearForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const yearsQuery = useQuery({
    queryKey: ["academicYears", subdomain],
    queryFn: () => fetchAcademicYears(subdomain),
    enabled: Boolean(subdomain),
  });

  const invalidateYears = () =>
    queryClient.invalidateQueries({ queryKey: ["academicYears", subdomain] });

  const createYearMutation = useMutation({
    mutationFn: (input: CreateAcademicYearInput) =>
      createAcademicYear(subdomain, input),
    onSuccess: () => {
      toast.success("Academic year added");
      setShowYearForm(false);
      void invalidateYears();
    },
    onError: (error) => toast.error(getDisplayErrorMessage(error)),
  });

  const createTermMutation = useMutation({
    mutationFn: (input: CreateTermInput) => createTerm(subdomain, input),
    onSuccess: () => {
      toast.success("Term added");
      void invalidateYears();
    },
    onError: (error) => toast.error(getDisplayErrorMessage(error)),
  });

  const deleteYearMutation = useMutation({
    mutationFn: (id: string) => deleteAcademicYear(subdomain, id),
    onSuccess: () => {
      toast.success("Academic year deleted");
      void invalidateYears();
    },
    onError: (error) => toast.error(getDisplayErrorMessage(error)),
  });

  const deleteTermMutation = useMutation({
    mutationFn: (id: string) => deleteTerm(subdomain, id),
    onSuccess: () => {
      toast.success("Term deleted");
      void invalidateYears();
    },
    onError: (error) => toast.error(getDisplayErrorMessage(error)),
  });

  const years = yearsQuery.data ?? [];
  const totalTerms = years.reduce(
    (count, year) => count + (year.terms?.length ?? 0),
    0,
  );
  const currentYear = years.find((year) => year.isCurrent) ?? null;

  const filteredYears = years.filter((year) => {
    if (statusFilter === "active") return year.isActive;
    if (statusFilter === "current") return year.isCurrent;
    return true;
  });

  const deletingYearId = deleteYearMutation.isPending
    ? deleteYearMutation.variables ?? null
    : null;
  const deletingTermId = deleteTermMutation.isPending
    ? deleteTermMutation.variables ?? null
    : null;

  return (
    <SchoolPage
      eyebrow="Academics"
      title="School Years"
      subtitle="Organise your academic years and the terms within them."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <SchoolStat
          label="Academic years"
          value={years.length}
          icon={CalendarDays}
        />
        <SchoolStat label="Terms" value={totalTerms} icon={BookOpen} />
        <SchoolStat
          label="Current year"
          value={currentYear?.name ?? "—"}
          icon={GraduationCap}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Label className={labelClass} htmlFor="year-status-filter">
            Status
          </Label>
          <select
            id="year-status-filter"
            className={cn(selectShell, "px-2")}
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
          >
            <option value="all">All years</option>
            <option value="active">Active</option>
            <option value="current">Current</option>
          </select>
        </div>
        <Button
          className={primaryButtonClass}
          onClick={() => setShowYearForm((open) => !open)}
        >
          <Plus className="h-4 w-4" />
          Add academic year
        </Button>
      </div>

      {showYearForm ? (
        <SchoolPanel title="New academic year">
          <CreateAcademicYearForm
            saving={createYearMutation.isPending}
            onCancel={() => setShowYearForm(false)}
            onSubmit={(input) => createYearMutation.mutate(input)}
          />
        </SchoolPanel>
      ) : null}

      {yearsQuery.isLoading ? (
        <SchoolPanel>
          <SchoolLoading label="Loading school years…" />
        </SchoolPanel>
      ) : yearsQuery.isError ? (
        <SchoolPanel>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <AlertCircle className="h-7 w-7 text-red-500" />
            <p className="text-sm text-[#0a1f1a] dark:text-white">
              {getDisplayErrorMessage(yearsQuery.error)}
            </p>
            <Button
              className={outlineButtonClass}
              onClick={() => void yearsQuery.refetch()}
            >
              Try again
            </Button>
          </div>
        </SchoolPanel>
      ) : filteredYears.length === 0 ? (
        <SchoolPanel>
          <SchoolEmpty
            icon={GraduationCap}
            title={
              years.length === 0
                ? "No academic years yet"
                : "No matching years"
            }
            description={
              years.length === 0
                ? "Add your first academic year to start creating terms."
                : "Try a different status filter."
            }
          />
        </SchoolPanel>
      ) : (
        <div className="space-y-4">
          {filteredYears.map((year) => (
            <AcademicYearCard
              key={year.id}
              year={year}
              deleting={deletingYearId === year.id}
              addingTerm={createTermMutation.isPending}
              deletingTermId={deletingTermId}
              onDelete={(id) => {
                if (
                  window.confirm(
                    `Delete "${year.name}"? Its terms will be removed too.`,
                  )
                ) {
                  deleteYearMutation.mutate(id);
                }
              }}
              onAddTerm={(input) =>
                createTermMutation.mutate({
                  academicYearId: year.id,
                  ...input,
                })
              }
              onDeleteTerm={(id) => {
                if (window.confirm("Delete this term?")) {
                  deleteTermMutation.mutate(id);
                }
              }}
            />
          ))}
        </div>
      )}
    </SchoolPage>
  );
}
