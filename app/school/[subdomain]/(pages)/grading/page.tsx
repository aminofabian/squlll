"use client";

import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Trophy,
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

  const gradeLevels = schoolConfig?.selectedLevels?.flatMap((level) =>
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
        tenantSubjectId:
          subjectId === "__all__" ? undefined : subjectId,
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
    id ? subjects.find((s) => s.id === id)?.name ?? id : "All subjects";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Grading & Weighting</h1>
                <p className="text-sm text-muted-foreground">
                  Configure KCSE scales and CA:Exam ratios per grade
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={refetchAll}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button size="sm" onClick={handleSeedScale} disabled={seeding}>
                {seeding ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Award className="mr-2 h-4 w-4" />
                )}
                Seed Kenyan KCSE Scale
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Scale className="h-4 w-4" />
              Grading Scales
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scalesQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (scalesQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No grading scales yet. Seed the default Kenyan KCSE scale to
                get started.
              </p>
            ) : (
              <div className="space-y-4">
                {(scalesQuery.data ?? []).map((scale: GradingScale) => (
                  <div
                    key={scale.id}
                    className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span className="font-semibold">{scale.name}</span>
                      {scale.isDefault ? (
                        <Badge variant="secondary">Default</Badge>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {scale.thresholds.map((t) => (
                        <Badge key={`${t.grade}-${t.min}`} variant="outline">
                          {t.grade}: {t.min}–{t.max}%
                          {t.points != null ? ` (${t.points} pts)` : ""}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Plus className="h-4 w-4" />
              CA : Exam Weighting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>Grade level</Label>
                <Select value={gradeLevelId} onValueChange={setGradeLevelId}>
                  <SelectTrigger>
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
              <div className="space-y-2">
                <Label>Subject (optional)</Label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger>
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
              <div className="space-y-2">
                <Label>CA %</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={caWeight}
                  onChange={(e) => setCaWeight(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Exam %</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={examWeight}
                  onChange={(e) => setExamWeight(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleAddWeight} disabled={savingWeight}>
              {savingWeight ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save weight config
            </Button>

            {weightsQuery.isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (weightsQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No weight configs yet. Example: 30% CA / 70% Exam for Form 2
                Mathematics.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-3">Grade</th>
                      <th className="py-2 pr-3">Subject</th>
                      <th className="py-2 pr-3">CA</th>
                      <th className="py-2 pr-3">Exam</th>
                      <th className="py-2 pr-3 w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {(weightsQuery.data ?? []).map((weight) => (
                      <tr
                        key={weight.id}
                        className="border-b border-slate-100 dark:border-slate-800"
                      >
                        <td className="py-2 pr-3">
                          {gradeName(weight.tenantGradeLevelId)}
                        </td>
                        <td className="py-2 pr-3">
                          {subjectName(weight.tenantSubjectId)}
                        </td>
                        <td className="py-2 pr-3">{weight.caWeight}%</td>
                        <td className="py-2 pr-3">{weight.examWeight}%</td>
                        <td className="py-2 pr-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
