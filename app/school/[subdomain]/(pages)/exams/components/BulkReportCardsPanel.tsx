"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import {
  downloadPdfDataUrl,
  generateBulkReportCardsPdf,
} from "@/lib/exams/reportCards";
import { useAcademicYears } from "@/lib/hooks/useAcademicYears";

const TERMS = [
  { value: "0", label: "Full year" },
  { value: "1", label: "Term 1" },
  { value: "2", label: "Term 2" },
  { value: "3", label: "Term 3" },
];

export function BulkReportCardsPanel() {
  const params = useParams();
  const subdomain = params.subdomain as string;
  const { config: schoolConfig } = useSchoolConfigStore();
  const { academicYears, getActiveAcademicYear } = useAcademicYears();

  const gradeLevels =
    schoolConfig?.selectedLevels?.flatMap((level) =>
      (level.gradeLevels ?? []).map((grade) => ({
        id: grade.id,
        name: grade.name,
      })),
    ) ?? [];

  const [gradeLevelId, setGradeLevelId] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  useEffect(() => {
    const active = getActiveAcademicYear();
    if (active && !academicYear) {
      setAcademicYear(active.name);
    }
  }, [academicYears, getActiveAcademicYear, academicYear]);
  const [term, setTerm] = useState("0");
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{
    generated: number;
    total: number;
    skipped: number;
  } | null>(null);

  const handleGenerate = async () => {
    if (!gradeLevelId) {
      toast.error("Select a grade level");
      return;
    }

    setLoading(true);
    setLastResult(null);
    try {
      const result = await generateBulkReportCardsPdf(subdomain, {
        gradeLevelId,
        academicYear,
        term: term === "0" ? undefined : Number(term),
      });

      const gradeName =
        gradeLevels.find((g) => g.id === gradeLevelId)?.name ?? "class";
      const termLabel = term === "0" ? "full-year" : `term-${term}`;
      downloadPdfDataUrl(
        result.pdfDataUrl,
        `report-cards-${gradeName}-${academicYear}-${termLabel}.pdf`,
      );

      setLastResult({
        generated: result.generatedCount,
        total: result.totalStudents,
        skipped: result.skippedStudentIds.length,
      });

      toast.success(
        `Generated ${result.generatedCount} of ${result.totalStudents} report cards`,
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to generate report cards",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" />
          Bulk PDF report cards
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Generate a single printable PDF with one report card per student. Only
          students with published results and entered marks are included.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
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
            <Label>Academic year</Label>
            <Select value={academicYear} onValueChange={setAcademicYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year.id} value={year.name}>
                    {year.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Term</Label>
            <Select value={term} onValueChange={setTerm}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TERMS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Generate &amp; download PDF
          </Button>
          {lastResult ? (
            <span className="text-sm text-muted-foreground">
              {lastResult.generated}/{lastResult.total} generated
              {lastResult.skipped > 0
                ? ` · ${lastResult.skipped} skipped (no marks)`
                : ""}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
