"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Library,
  Check,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
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
import {
  assignSubjectToLevel,
  deactivateTenantSubject,
  fetchAvailableSubjects,
  fetchTenantSubjects,
  updateTenantSubject,
  type CurriculumSubjectType,
  type TenantSubjectView,
} from "@/lib/school/curriculum";

function AssignSubjectForm({
  subdomain,
  curriculumId,
  onDone,
  onCancel,
}: {
  subdomain: string;
  curriculumId: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();
  const [subjectId, setSubjectId] = useState("");
  const [subjectType, setSubjectType] = useState<CurriculumSubjectType>("CORE");
  const [creditHours, setCreditHours] = useState("");
  const [passingMarks, setPassingMarks] = useState("");
  const [totalMarks, setTotalMarks] = useState("");

  const availableQuery = useQuery({
    queryKey: ["availableSubjects", subdomain, curriculumId],
    queryFn: () => fetchAvailableSubjects(subdomain, curriculumId),
    enabled: Boolean(subdomain && curriculumId),
  });

  const assignMutation = useMutation({
    mutationFn: () =>
      assignSubjectToLevel(subdomain, {
        curriculumId,
        subjectId,
        subjectType,
        isCompulsory: subjectType === "CORE",
        creditHours: creditHours ? Number(creditHours) : undefined,
        passingMarks: passingMarks ? Number(passingMarks) : undefined,
        totalMarks: totalMarks ? Number(totalMarks) : undefined,
      }),
    onSuccess: () => {
      toast.success("Subject added to curriculum");
      void queryClient.invalidateQueries({
        queryKey: ["tenantSubjects", subdomain, curriculumId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["availableSubjects", subdomain, curriculumId],
      });
      onDone();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Could not add subject",
      );
    },
  });

  const available = availableQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-2">
          <Label className={labelClass}>Subject</Label>
          <Select
            value={subjectId}
            onValueChange={setSubjectId}
            disabled={availableQuery.isLoading}
          >
            <SelectTrigger className={selectShell}>
              <SelectValue
                placeholder={
                  availableQuery.isLoading
                    ? "Loading subjects…"
                    : "Select a subject"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {available.length === 0 ? (
                <SelectItem value="__none__" disabled>
                  No available subjects
                </SelectItem>
              ) : (
                available.map((subject) => (
                  <SelectItem key={subject.subjectId} value={subject.subjectId}>
                    {subject.name}
                    {subject.code ? ` (${subject.code})` : ""}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className={labelClass}>Requirement</Label>
          <Select
            value={subjectType}
            onValueChange={(value) =>
              setSubjectType(value as CurriculumSubjectType)
            }
          >
            <SelectTrigger className={selectShell}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CORE">Compulsory</SelectItem>
              <SelectItem value="ELECTIVE">Elective</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className={labelClass}>Credit hours</Label>
          <Input
            className={fieldShell}
            inputMode="decimal"
            placeholder="e.g. 3"
            value={creditHours}
            onChange={(event) => setCreditHours(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className={labelClass}>Passing marks</Label>
          <Input
            className={fieldShell}
            inputMode="numeric"
            placeholder="e.g. 40"
            value={passingMarks}
            onChange={(event) => setPassingMarks(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className={labelClass}>Total marks</Label>
          <Input
            className={fieldShell}
            inputMode="numeric"
            placeholder="e.g. 100"
            value={totalMarks}
            onChange={(event) => setTotalMarks(event.target.value)}
          />
        </div>
      </div>

      {availableQuery.isError ? (
        <p className="text-xs text-red-600 dark:text-red-400">
          {availableQuery.error instanceof Error
            ? availableQuery.error.message
            : "Could not load available subjects"}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          className={primaryButtonClass}
          disabled={!subjectId || assignMutation.isPending}
          onClick={() => assignMutation.mutate()}
        >
          {assignMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Add subject
        </Button>
        <Button
          variant="outline"
          className={outlineButtonClass}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

function EditSubjectForm({
  subdomain,
  curriculumId,
  subject,
  onDone,
  onCancel,
}: {
  subdomain: string;
  curriculumId: string;
  subject: TenantSubjectView;
  onDone: () => void;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();
  const [subjectType, setSubjectType] = useState<CurriculumSubjectType>(
    subject.isCompulsory ? "CORE" : "ELECTIVE",
  );
  const [creditHours, setCreditHours] = useState(
    subject.creditHours != null ? String(subject.creditHours) : "",
  );
  const [passingMarks, setPassingMarks] = useState(
    subject.passingMarks != null ? String(subject.passingMarks) : "",
  );
  const [totalMarks, setTotalMarks] = useState(
    subject.totalMarks != null ? String(subject.totalMarks) : "",
  );
  const [isActive, setIsActive] = useState(subject.isActive);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateTenantSubject(subdomain, subject.id, {
        subjectType,
        isCompulsory: subjectType === "CORE",
        creditHours: creditHours ? Number(creditHours) : undefined,
        passingMarks: passingMarks ? Number(passingMarks) : undefined,
        totalMarks: totalMarks ? Number(totalMarks) : undefined,
        isActive,
      }),
    onSuccess: () => {
      toast.success("Subject updated");
      void queryClient.invalidateQueries({
        queryKey: ["tenantSubjects", subdomain, curriculumId],
      });
      onDone();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Could not update subject",
      );
    },
  });

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-[#0a1f1a] dark:text-white">
        Editing {subject.subjectName}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-1.5">
          <Label className={labelClass}>Requirement</Label>
          <Select
            value={subjectType}
            onValueChange={(value) =>
              setSubjectType(value as CurriculumSubjectType)
            }
          >
            <SelectTrigger className={selectShell}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CORE">Compulsory</SelectItem>
              <SelectItem value="ELECTIVE">Elective</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className={labelClass}>Credit hours</Label>
          <Input
            className={fieldShell}
            inputMode="decimal"
            value={creditHours}
            onChange={(event) => setCreditHours(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className={labelClass}>Passing marks</Label>
          <Input
            className={fieldShell}
            inputMode="numeric"
            value={passingMarks}
            onChange={(event) => setPassingMarks(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className={labelClass}>Total marks</Label>
          <Input
            className={fieldShell}
            inputMode="numeric"
            value={totalMarks}
            onChange={(event) => setTotalMarks(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className={labelClass}>Status</Label>
          <Select
            value={isActive ? "active" : "inactive"}
            onValueChange={(value) => setIsActive(value === "active")}
          >
            <SelectTrigger className={selectShell}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          className={primaryButtonClass}
          disabled={updateMutation.isPending}
          onClick={() => updateMutation.mutate()}
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Save changes
        </Button>
        <Button
          variant="outline"
          className={outlineButtonClass}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

/**
 * Curriculum overview. Lists the school's curricula (levels) from the config
 * store, shows the grade levels each covers, and the tenant subjects attached
 * to the selected curriculum. Admins can attach catalog subjects and remove
 * subjects from a curriculum.
 */
export function CurriculumPanel() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const queryClient = useQueryClient();

  const schoolConfig = useSchoolConfigStore((state) => state.config);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editing, setEditing] = useState<TenantSubjectView | null>(null);

  const levels = schoolConfig?.selectedLevels ?? [];
  const activeLevel =
    levels.find((level) => level.id === selectedLevelId) ?? levels[0] ?? null;
  const activeLevelId = activeLevel?.id ?? null;

  const subjectsQuery = useQuery({
    queryKey: ["tenantSubjects", subdomain, activeLevelId],
    queryFn: () => fetchTenantSubjects(subdomain, activeLevelId ?? undefined),
    enabled: Boolean(subdomain && activeLevelId),
  });

  const removeMutation = useMutation({
    mutationFn: (tenantSubjectId: string) =>
      deactivateTenantSubject(subdomain, tenantSubjectId),
    onSuccess: () => {
      toast.success("Subject removed from curriculum");
      void queryClient.invalidateQueries({
        queryKey: ["tenantSubjects", subdomain, activeLevelId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["availableSubjects", subdomain, activeLevelId],
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Could not remove subject",
      );
    },
  });

  const { isError, error } = subjectsQuery;

  useEffect(() => {
    if (!isError) return;
    toast.error(
      error instanceof Error ? error.message : "Failed to load subjects",
    );
  }, [isError, error]);

  const subjects = subjectsQuery.data ?? [];
  const subjectCount = subjectsQuery.data
    ? subjects.length
    : (activeLevel?.subjects.length ?? 0);
  const compulsoryCount = subjects.filter((s) => s.isCompulsory).length;
  const gradeLevelCount = activeLevel?.gradeLevels?.length ?? 0;

  const hasConfig = Boolean(schoolConfig) && levels.length > 0;

  const renderSubjects = () => {
    if (!activeLevelId) {
      return (
        <SchoolEmpty
          icon={BookOpen}
          title="Select a curriculum"
          description="Choose a curriculum above to see the subjects it offers."
        />
      );
    }

    if (subjectsQuery.isLoading) {
      return <SchoolLoading label="Loading subjects…" />;
    }

    if (subjectsQuery.isError) {
      return (
        <div className="space-y-4">
          <SchoolEmpty
            icon={AlertTriangle}
            title="Couldn't load subjects"
            description={
              error instanceof Error
                ? error.message
                : "Something went wrong while fetching this curriculum."
            }
          />
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className={outlineButtonClass}
              onClick={() => void subjectsQuery.refetch()}
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Try again
            </Button>
          </div>
        </div>
      );
    }

    if (!subjects.length) {
      return (
        <SchoolEmpty
          icon={BookOpen}
          title="No subjects in this curriculum"
          description={`${activeLevel?.name ?? "This curriculum"} doesn't have any subjects yet.`}
        />
      );
    }

    return (
      <div className="overflow-x-auto border border-[#1a4d42]/12 dark:border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a4d42]/10 bg-[#f8fbfa] text-left dark:border-white/10 dark:bg-[#071411]">
              <th className={thClass}>Subject</th>
              <th className={thClass}>Code</th>
              <th className={thClass}>Type</th>
              <th className={thClass}>Requirement</th>
              <th className={thClass}>Credits</th>
              <th className={thClass}>Pass / Total</th>
              <th className={`${thClass} w-12`} />
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject: TenantSubjectView) => (
              <tr
                key={subject.id}
                className="border-b border-[#1a4d42]/8 last:border-0 dark:border-white/5"
              >
                <td className="px-3 py-2.5 font-medium text-[#0a1f1a] dark:text-white">
                  {subject.subjectName}
                </td>
                <td className="px-3 py-2.5 tabular-nums text-[#1a4d42]/70 dark:text-white/60">
                  {subject.subjectCode || "—"}
                </td>
                <td className="px-3 py-2.5 text-[#1a4d42]/70 dark:text-white/60">
                  {subject.subjectType || "—"}
                </td>
                <td className="px-3 py-2.5">
                  <Badge
                    className={cn(
                      "rounded-none border-0 px-2 text-[10px] font-semibold",
                      subject.isCompulsory
                        ? "bg-[#246a59]/10 text-[#246a59] hover:bg-[#246a59]/10"
                        : "bg-[#1a4d42]/8 text-[#1a4d42]/50 hover:bg-[#1a4d42]/8 dark:bg-white/10 dark:text-white/50",
                    )}
                  >
                    {subject.isCompulsory ? "Compulsory" : "Elective"}
                  </Badge>
                </td>
                <td className="px-3 py-2.5 tabular-nums text-[#0a1f1a] dark:text-white">
                  {subject.creditHours ?? "—"}
                </td>
                <td className="px-3 py-2.5 tabular-nums text-[#0a1f1a] dark:text-white">
                  {subject.passingMarks ?? "—"} / {subject.totalMarks ?? "—"}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none text-[#1a4d42]/50 hover:bg-[#246a59]/10 hover:text-[#246a59] dark:text-white/40"
                      aria-label={`Edit ${subject.subjectName}`}
                      onClick={() => {
                        setEditing(subject);
                        setShowAddForm(false);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={
                        removeMutation.isPending &&
                        removeMutation.variables === subject.id
                      }
                      className="h-8 w-8 rounded-none text-[#1a4d42]/50 hover:bg-red-50 hover:text-red-600 dark:text-white/40 dark:hover:bg-red-950/30"
                      aria-label={`Remove ${subject.subjectName}`}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Remove ${subject.subjectName} from this curriculum?`,
                          )
                        ) {
                          removeMutation.mutate(subject.id);
                        }
                      }}
                    >
                      {removeMutation.isPending &&
                      removeMutation.variables === subject.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <SchoolPage
      eyebrow="Academics"
      title="Curriculum"
      subtitle="The subjects each curriculum offers, with their grade levels and marks."
      actions={
        activeLevelId ? (
          <Button
            variant="outline"
            size="sm"
            className={outlineButtonClass}
            onClick={() => void subjectsQuery.refetch()}
            disabled={subjectsQuery.isFetching}
          >
            <RefreshCw
              className={cn(
                "mr-2 h-3.5 w-3.5",
                subjectsQuery.isFetching && "animate-spin",
              )}
            />
            Refresh
          </Button>
        ) : undefined
      }
    >
      {!hasConfig ? (
        <SchoolPanel>
          <SchoolEmpty
            icon={Library}
            title="No curriculum configured yet"
            description="Once your school's curricula and subjects are set up, they'll appear here for review."
          />
        </SchoolPanel>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <SchoolStat label="Curricula" value={levels.length} icon={Library} />
            <SchoolStat
              label="Subjects"
              value={subjectCount}
              icon={BookOpen}
              hint={
                subjects.length && compulsoryCount
                  ? `${compulsoryCount} compulsory`
                  : undefined
              }
            />
            <SchoolStat
              label="Grade levels"
              value={gradeLevelCount}
              icon={GraduationCap}
            />
          </div>

          <SchoolPanel title="Curricula" icon={Library}>
            <div className="flex flex-wrap gap-1.5">
              {levels.map((level) => {
                const isActive = level.id === activeLevelId;
                return (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => {
                      setSelectedLevelId(level.id);
                      setShowAddForm(false);
                      setEditing(null);
                    }}
                    className={cn(
                      "inline-flex items-center gap-2 border px-3 py-1.5 text-xs font-medium transition-colors",
                      isActive
                        ? "border-[#246a59] bg-[#246a59]/10 text-[#246a59]"
                        : "border-[#1a4d42]/15 bg-white text-[#0a1f1a] hover:border-[#246a59]/40 dark:border-white/15 dark:bg-[#0c1a17] dark:text-white",
                    )}
                  >
                    {level.name}
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                        isActive
                          ? "bg-[#246a59]/15 text-[#246a59]"
                          : "bg-[#1a4d42]/8 text-[#1a4d42]/50 dark:bg-white/10 dark:text-white/50",
                      )}
                    >
                      {level.subjects.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {activeLevel?.description ? (
              <p className="mt-3 text-sm text-[#1a4d42]/55 dark:text-white/45">
                {activeLevel.description}
              </p>
            ) : null}

            {activeLevel && gradeLevelCount > 0 ? (
              <div className="mt-4">
                <p className={labelClass}>Grade levels</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {activeLevel.gradeLevels.map((grade) => (
                    <Badge
                      key={grade.id}
                      className="rounded-none border border-[#1a4d42]/15 bg-white px-2 py-1 text-xs font-normal text-[#0a1f1a] hover:bg-white dark:border-white/15 dark:bg-[#0c1a17] dark:text-white/80"
                    >
                      {grade.name}
                      {grade.age != null ? (
                        <span className="ml-1 text-[#1a4d42]/45 dark:text-white/40">
                          · {grade.age} yrs
                        </span>
                      ) : null}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </SchoolPanel>

          <SchoolPanel
            title={activeLevel ? `Subjects — ${activeLevel.name}` : "Subjects"}
            icon={BookOpen}
            actions={
              activeLevelId ? (
                <Button
                  size="sm"
                  className={primaryButtonClass}
                  onClick={() => {
                    setShowAddForm((open) => !open);
                    setEditing(null);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add subject
                </Button>
              ) : null
            }
          >
            {editing && activeLevelId ? (
              <div className="mb-4 border border-[#1a4d42]/12 bg-[#f8fbfa] p-4 dark:border-white/10 dark:bg-[#071411]">
                <EditSubjectForm
                  subdomain={subdomain}
                  curriculumId={activeLevelId}
                  subject={editing}
                  onDone={() => setEditing(null)}
                  onCancel={() => setEditing(null)}
                />
              </div>
            ) : showAddForm && activeLevelId ? (
              <div className="mb-4 border border-[#1a4d42]/12 bg-[#f8fbfa] p-4 dark:border-white/10 dark:bg-[#071411]">
                <AssignSubjectForm
                  subdomain={subdomain}
                  curriculumId={activeLevelId}
                  onDone={() => setShowAddForm(false)}
                  onCancel={() => setShowAddForm(false)}
                />
              </div>
            ) : null}
            {renderSubjects()}
          </SchoolPanel>
        </>
      )}
    </SchoolPage>
  );
}
