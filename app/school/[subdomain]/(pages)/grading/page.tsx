"use client";

import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Award,
  Loader2,
  Plus,
  RefreshCw,
  Scale,
  Trash2,
} from "lucide-react";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import {
  createAssessmentWeight,
  deleteAssessmentWeight,
  fetchAssessmentWeights,
  fetchGradingScales,
  seedKenyanGradingScale,
  type AssessmentWeight,
  type GradingScale,
} from "@/lib/exams/gradingConfig";

const panel =
  "border border-[#1a4d42]/12 bg-white shadow-[3px_3px_0_0_rgba(10,31,26,0.05)] dark:border-white/10 dark:bg-[#0c1a17]";

const fieldShell =
  "h-10 rounded-none border border-[#1a4d42]/15 bg-white text-sm shadow-none placeholder:text-[#1a4d42]/40 focus-visible:border-[#246a59]/50 focus-visible:ring-1 focus-visible:ring-[#246a59]/25 dark:border-white/15 dark:bg-[#071411] dark:placeholder:text-white/40";

const selectShell =
  "h-10 rounded-none border border-[#1a4d42]/15 bg-white text-sm shadow-none focus:ring-1 focus:ring-[#246a59]/25 dark:border-white/15 dark:bg-[#071411]";

const labelClass = "text-xs font-medium text-[#0a1f1a] dark:text-white/80";

const thClass =
  "py-2 pr-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45";

export default function GradingPage() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const queryClient = useQueryClient();
  const { config: schoolConfig, getAllSubjects } = useSchoolConfigStore();

  const [gradeLevelId, setGradeLevelId] = useState("");
  const [subjectId, setSubjectId] = useState("__all__");
  const [caWeight, setCaWeight] = useState("30");
  const [examWeight, setExamWeight] = useState("70");
  const [savingWeight, setSavingWeight] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const gradeLevels =
    schoolConfig?.selectedLevels?.flatMap((level) =>
      (level.gradeLevels ?? []).map((grade) => ({
        id: grade.id,
        name: grade.name,
      })),
    ) ?? [];

  const subjects = getAllSubjects().map((subject) => ({
    id: subject.id,
    name: subject.name,
  }));

  const scalesQuery = useQuery({
    queryKey: ["gradingScales", subdomain],
    queryFn: () => fetchGradingScales(subdomain),
    enabled: Boolean(subdomain),
  });

  const weightsQuery = useQuery({
    queryKey: ["assessmentWeights", subdomain],
    queryFn: () => fetchAssessmentWeights(subdomain),
    enabled: Boolean(subdomain),
  });

  const refetchAll = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["gradingScales", subdomain] });
    void queryClient.invalidateQueries({
      queryKey: ["assessmentWeights", subdomain],
    });
  }, [queryClient, subdomain]);

  const handleSeedScale = async () => {
    setSeeding(true);
    try {
      await seedKenyanGradingScale(subdomain);
      toast.success("Kenyan KCSE grading scale seeded");
      refetchAll();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to seed grading scale",
      );
    } finally {
      setSeeding(false);
    }
  };

  const handleAddWeight = async () => {
    if (!gradeLevelId) {
      toast.error("Select a grade level");
      return;
    }
    const ca = Number(caWeight);
    const exam = Number(examWeight);
    if (ca + exam !== 100) {
      toast.error("CA and Exam weights must total 100%");
      return;
    }

    setSavingWeight(true);
    try {
      await createAssessmentWeight(subdomain, {
        tenantGradeLevelId: gradeLevelId,
        tenantSubjectId: subjectId === "__all__" ? undefined : subjectId,
        caWeight: ca,
        examWeight: exam,
        isDefault: subjectId === "__all__",
      });
      toast.success("Assessment weight saved");
      setGradeLevelId("");
      setSubjectId("__all__");
      refetchAll();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save weight config",
      );
    } finally {
      setSavingWeight(false);
    }
  };

  const handleDeleteWeight = async (weight: AssessmentWeight) => {
    try {
      await deleteAssessmentWeight(subdomain, weight.id);
      toast.success("Weight config removed");
      refetchAll();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete weight config",
      );
    }
  };

  const gradeName = (id: string) =>
    gradeLevels.find((g) => g.id === id)?.name ?? id;
  const subjectName = (id?: string | null) =>
    id ? (subjects.find((s) => s.id === id)?.name ?? id) : "All subjects";

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-[#f3f7f5] dark:bg-[#071411]">
      <div className="mx-auto max-w-5xl space-y-4 p-4 sm:p-5">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#1a4d42]/12 pb-4 dark:border-white/10">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#246a59]">
              Academics
            </p>
            <h1 className="font-display text-2xl tracking-tight text-[#0a1f1a] dark:text-white">
              Grading
            </h1>
            <p className="mt-0.5 text-sm text-[#1a4d42]/55 dark:text-white/45">
              KCSE scales and CA:Exam ratios per grade
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refetchAll}
              className="h-9 rounded-none border-[#1a4d42]/15 bg-white text-xs text-[#0a1f1a] shadow-none hover:border-[#246a59]/40 hover:bg-[#f8fbfa] dark:border-white/15 dark:bg-[#0c1a17] dark:text-white"
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleSeedScale}
              disabled={seeding}
              className="h-9 rounded-none bg-[#0a1f1a] text-xs text-white shadow-none hover:bg-[#246a59]"
            >
              {seeding ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Award className="mr-2 h-3.5 w-3.5" />
              )}
              Seed Kenyan KCSE scale
            </Button>
          </div>
        </div>

        {/* Scales */}
        <section className={panel}>
          <div className="flex items-center gap-2 border-b border-[#1a4d42]/10 px-4 py-3 dark:border-white/10 sm:px-5">
            <Scale className="h-4 w-4 text-[#246a59]" />
            <h2 className="text-sm font-semibold text-[#0a1f1a] dark:text-white">
              Grading scales
            </h2>
          </div>
          <div className="p-4 sm:p-5">
            {scalesQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-[#246a59]" />
              </div>
            ) : (scalesQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-[#1a4d42]/55 dark:text-white/45">
                No grading scales yet. Seed the default Kenyan KCSE scale to get
                started.
              </p>
            ) : (
              <div className="space-y-3">
                {(scalesQuery.data ?? []).map((scale: GradingScale) => (
                  <div
                    key={scale.id}
                    className="border border-[#1a4d42]/12 bg-[#f8fbfa] p-4 dark:border-white/10 dark:bg-[#071411]"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#0a1f1a] dark:text-white">
                        {scale.name}
                      </span>
                      {scale.isDefault ? (
                        <Badge className="rounded-none border-0 bg-[#246a59]/10 px-2 text-[10px] font-semibold text-[#246a59] hover:bg-[#246a59]/10">
                          Default
                        </Badge>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {scale.thresholds.map((t) => (
                        <span
                          key={`${t.grade}-${t.min}`}
                          className="inline-flex items-center border border-[#1a4d42]/15 bg-white px-2 py-1 text-xs text-[#0a1f1a] dark:border-white/15 dark:bg-[#0c1a17] dark:text-white/80"
                        >
                          <span className="font-semibold">{t.grade}</span>
                          <span className="mx-1 text-[#1a4d42]/35">·</span>
                          {t.min}–{t.max}%
                          {t.points != null ? (
                            <span className="ml-1 text-[#1a4d42]/45">
                              ({t.points} pts)
                            </span>
                          ) : null}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Weighting */}
        <section className={panel}>
          <div className="flex items-center gap-2 border-b border-[#1a4d42]/10 px-4 py-3 dark:border-white/10 sm:px-5">
            <Plus className="h-4 w-4 text-[#246a59]" />
            <h2 className="text-sm font-semibold text-[#0a1f1a] dark:text-white">
              CA : Exam weighting
            </h2>
          </div>
          <div className="space-y-5 p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label className={labelClass}>Grade level</Label>
                <Select value={gradeLevelId} onValueChange={setGradeLevelId}>
                  <SelectTrigger className={selectShell}>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeLevels.map((grade) => (
                      <SelectItem key={grade.id} value={grade.id}>
                        {grade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Subject (optional)</Label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger className={selectShell}>
                    <SelectValue placeholder="All subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>CA %</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={caWeight}
                  onChange={(e) => setCaWeight(e.target.value)}
                  className={fieldShell}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Exam %</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={examWeight}
                  onChange={(e) => setExamWeight(e.target.value)}
                  className={fieldShell}
                />
              </div>
            </div>

            <Button
              onClick={handleAddWeight}
              disabled={savingWeight}
              className="h-9 rounded-none bg-[#0a1f1a] text-xs text-white shadow-none hover:bg-[#246a59]"
            >
              {savingWeight ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : null}
              Save weight config
            </Button>

            {weightsQuery.isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-[#246a59]" />
              </div>
            ) : (weightsQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-[#1a4d42]/55 dark:text-white/45">
                No weight configs yet. Example: 30% CA / 70% Exam for Form 2
                Mathematics.
              </p>
            ) : (
              <div className="overflow-x-auto border border-[#1a4d42]/12 dark:border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1a4d42]/10 bg-[#f8fbfa] text-left dark:border-white/10 dark:bg-[#071411]">
                      <th className={thClass}>Grade</th>
                      <th className={thClass}>Subject</th>
                      <th className={thClass}>CA</th>
                      <th className={thClass}>Exam</th>
                      <th className={`${thClass} w-12`} />
                    </tr>
                  </thead>
                  <tbody>
                    {(weightsQuery.data ?? []).map((weight) => (
                      <tr
                        key={weight.id}
                        className="border-b border-[#1a4d42]/8 last:border-0 dark:border-white/5"
                      >
                        <td className="px-3 py-2.5 text-[#0a1f1a] dark:text-white">
                          {gradeName(weight.tenantGradeLevelId)}
                        </td>
                        <td className="px-3 py-2.5 text-[#1a4d42]/70 dark:text-white/60">
                          {subjectName(weight.tenantSubjectId)}
                        </td>
                        <td className="px-3 py-2.5 tabular-nums text-[#0a1f1a] dark:text-white">
                          {weight.caWeight}%
                        </td>
                        <td className="px-3 py-2.5 tabular-nums text-[#0a1f1a] dark:text-white">
                          {weight.examWeight}%
                        </td>
                        <td className="px-3 py-2.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                            onClick={() => handleDeleteWeight(weight)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
