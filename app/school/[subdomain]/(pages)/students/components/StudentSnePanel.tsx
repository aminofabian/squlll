"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HeartHandshake, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  fetchStudentSneProfile,
  upsertStudentSneProfile,
  type SneDisabilityType,
  type StudentSneProfile,
} from "@/lib/student/studentSne";
import { studentsPanel } from "./students-ui";

const DISABILITY_TYPES: { value: SneDisabilityType; label: string }[] = [
  { value: "PHYSICAL", label: "Physical" },
  { value: "VISUAL", label: "Visual" },
  { value: "HEARING", label: "Hearing" },
  { value: "LEARNING", label: "Learning" },
  { value: "AUTISM", label: "Autism spectrum" },
  { value: "SPEECH", label: "Speech & language" },
  { value: "OTHER", label: "Other" },
];

interface StudentSnePanelProps {
  studentId: string;
}

export function StudentSnePanel({ studentId }: StudentSnePanelProps) {
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [disabilityType, setDisabilityType] = useState<SneDisabilityType>("OTHER");
  const [iepSummary, setIepSummary] = useState("");
  const [extraTimePercent, setExtraTimePercent] = useState("0");
  const [requiresAdaptedFormat, setRequiresAdaptedFormat] = useState(false);
  const [accommodations, setAccommodations] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchStudentSneProfile(subdomain, studentId)
      .then((profile: StudentSneProfile | null) => {
        if (cancelled || !profile) return;
        setDisabilityType(profile.disabilityType);
        setIepSummary(profile.iepSummary ?? "");
        setExtraTimePercent(String(profile.extraTimePercent));
        setRequiresAdaptedFormat(profile.requiresAdaptedFormat);
        setAccommodations(profile.accommodations ?? "");
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Could not load SNE profile");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [subdomain, studentId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertStudentSneProfile(subdomain, {
        studentId,
        disabilityType,
        iepSummary: iepSummary.trim() || undefined,
        extraTimePercent: Number(extraTimePercent) || 0,
        requiresAdaptedFormat,
        accommodations: accommodations.trim() || undefined,
      });
      toast.success("SNE accommodations saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save SNE profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`${studentsPanel} overflow-hidden`}>
      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
          <HeartHandshake className="h-4 w-4" />
          Special Needs Education (SNE)
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          Accommodations apply to timed online tests and assessment access.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
          <div className="space-y-2">
            <Label>Disability / support category</Label>
            <Select
              value={disabilityType}
              onValueChange={(v) => setDisabilityType(v as SneDisabilityType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DISABILITY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Extra time on tests (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={extraTimePercent}
              onChange={(e) => setExtraTimePercent(e.target.value)}
              placeholder="e.g. 25 for 25% more time"
            />
          </div>

          <div className="flex items-center justify-between gap-3 sm:col-span-2">
            <div>
              <Label>Adapted assessment format</Label>
              <p className="text-xs text-muted-foreground">
                Large print, reader, or modified question papers
              </p>
            </div>
            <Switch
              checked={requiresAdaptedFormat}
              onCheckedChange={setRequiresAdaptedFormat}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>IEP summary</Label>
            <Textarea
              value={iepSummary}
              onChange={(e) => setIepSummary(e.target.value)}
              rows={3}
              placeholder="Individual Education Plan goals and support notes..."
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Other accommodations</Label>
            <Textarea
              value={accommodations}
              onChange={(e) => setAccommodations(e.target.value)}
              rows={2}
              placeholder="e.g. preferential seating, breaks during exams..."
            />
          </div>

          <div className="sm:col-span-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save SNE profile
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
