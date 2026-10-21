"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  previewCommTemplate,
  saveCommTemplate,
  type CommChannel,
  type CommTemplate,
  type CommTemplatePreview,
} from "@/lib/school/communicationsHubApi";
import {
  CHANNEL_META,
  MERGE_TAG_GROUPS,
  estimateSegments,
} from "@/lib/school/communicationsHubUtils";
import { InlineError } from "./shared";

const CATEGORIES = [
  { value: "GENERAL", label: "General" },
  { value: "WELCOME", label: "Welcome" },
  { value: "FINANCE", label: "Finance" },
  { value: "ACADEMIC", label: "Academic" },
  { value: "ATTENDANCE", label: "Attendance" },
  { value: "EVENTS", label: "Events" },
];

const BODY_TABS: CommChannel[] = ["SMS", "WHATSAPP", "EMAIL"];

export function TemplateEditor({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: CommTemplate | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [subject, setSubject] = useState("");
  const [bodySms, setBodySms] = useState("");
  const [bodyEmail, setBodyEmail] = useState("");
  const [bodyWhatsApp, setBodyWhatsApp] = useState("");
  const [bodyTab, setBodyTab] = useState<CommChannel>("SMS");
  const [preview, setPreview] = useState<CommTemplatePreview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
    setCategory(initial?.category ?? "GENERAL");
    setSubject(initial?.subject ?? "");
    setBodySms(initial?.bodySms ?? "");
    setBodyEmail(initial?.bodyEmail ?? "");
    setBodyWhatsApp(initial?.bodyWhatsApp ?? "");
    setBodyTab(
      initial?.bodySms ? "SMS" : initial?.bodyEmail ? "EMAIL" : "WHATSAPP",
    );
    setPreview(null);
    setError(null);
  }, [initial]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting the editor when the dialog opens
    if (open) reset();
  }, [open, reset]);

  const appendTag = (tag: string) => {
    const token = `{{${tag}}}`;
    if (bodyTab === "SMS") setBodySms((value) => `${value}${value ? " " : ""}${token}`);
    if (bodyTab === "WHATSAPP") setBodyWhatsApp((value) => `${value}${value ? " " : ""}${token}`);
    if (bodyTab === "EMAIL") setBodyEmail((value) => `${value}${value ? " " : ""}${token}`);
  };

  const runPreview = async () => {
    try {
      setPreviewing(true);
      setError(null);
      setPreview(
        await previewCommTemplate({
          templateId: initial?.id ?? null,
          subject: subject.trim() || null,
          bodySms: bodySms.trim() || null,
          bodyEmail: bodyEmail.trim() || null,
          bodyWhatsApp: bodyWhatsApp.trim() || null,
          sampleName: "Parent Amina",
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed");
    } finally {
      setPreviewing(false);
    }
  };

  const save = async () => {
    if (!name.trim()) {
      setError("Give this template a name.");
      return;
    }
    if (!bodySms.trim() && !bodyEmail.trim() && !bodyWhatsApp.trim()) {
      setError("Write a message for at least one channel.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await saveCommTemplate(
        {
          name: name.trim(),
          description: description.trim() || null,
          category,
          subject: subject.trim() || null,
          bodySms: bodySms.trim() || null,
          bodyEmail: bodyEmail.trim() || null,
          bodyWhatsApp: bodyWhatsApp.trim() || null,
        },
        initial?.id ?? null,
      );
      toast.success(initial ? "Template updated." : "Template created.");
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save template");
    } finally {
      setSaving(false);
    }
  };

  const bodyValue =
    bodyTab === "SMS" ? bodySms : bodyTab === "WHATSAPP" ? bodyWhatsApp : bodyEmail;
  const setBodyValue =
    bodyTab === "SMS" ? setBodySms : bodyTab === "WHATSAPP" ? setBodyWhatsApp : setBodyEmail;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit template" : "New template"}</DialogTitle>
          <DialogDescription>
            Reusable wording for campaigns, automations and reminders. Write one
            version per channel where the tone or length differs.
          </DialogDescription>
        </DialogHeader>

        {error ? <InlineError message={error} /> : null}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={name} onChange={(event) => setName(event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((entry) => (
                      <SelectItem key={entry.value} value={entry.value}>
                        {entry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Description (optional)</Label>
                <Input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="When should this be used?"
                />
              </div>
            </div>

            <div className="flex gap-1 rounded-lg border border-border p-1">
              {BODY_TABS.map((channel) => (
                <button
                  key={channel}
                  type="button"
                  onClick={() => setBodyTab(channel)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                    bodyTab === channel
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {CHANNEL_META[channel].label}
                </button>
              ))}
            </div>

            {bodyTab === "EMAIL" ? (
              <div className="space-y-1.5">
                <Label>Email subject</Label>
                <Input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="{{school.name}} — update"
                />
              </div>
            ) : null}

            <Textarea
              value={bodyValue}
              onChange={(event) => setBodyValue(event.target.value)}
              rows={bodyTab === "EMAIL" ? 10 : 6}
              placeholder={
                bodyTab === "EMAIL"
                  ? "<p>Dear {{recipient.name}},</p>"
                  : "{{school.name}}: …"
              }
            />

            <div className="flex flex-wrap gap-1">
              {MERGE_TAG_GROUPS.flatMap((group) => group.tags).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => appendTag(tag)}
                  className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] text-foreground/80 hover:border-primary/30 hover:text-primary"
                >
                  {tag}
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              {bodyTab === "SMS"
                ? `${bodySms.length} characters · ${estimateSegments(bodySms)} segment${estimateSegments(bodySms) === 1 ? "" : "s"}`
                : bodyTab === "WHATSAPP"
                  ? `${bodyWhatsApp.length} characters`
                  : "Inline variables are HTML-escaped at send time."}
            </p>
          </div>

          <aside className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Preview</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void runPreview()}
                disabled={previewing}
              >
                {previewing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                Render
              </Button>
            </div>
            {preview ? (
              <div className="space-y-3 text-xs">
                {preview.subject ? (
                  <div>
                    <p className="font-semibold text-muted-foreground">Subject</p>
                    <p className="mt-1">{preview.subject}</p>
                  </div>
                ) : null}
                <div>
                  <p className="font-semibold text-muted-foreground">
                    {bodyTab === "EMAIL" ? "Email HTML" : bodyTab}
                  </p>
                  <pre className="mt-1 max-h-52 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-background p-2">
                    {bodyTab === "EMAIL"
                      ? preview.emailBody ?? "(empty)"
                      : bodyTab === "WHATSAPP"
                        ? preview.whatsAppBody
                        : preview.smsBody}
                  </pre>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">Variables</p>
                  <p className="mt-1 text-muted-foreground">
                    {preview.variables.length ? preview.variables.join(", ") : "None"}
                  </p>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  SMS uses {preview.smsSegments} segment{preview.smsSegments === 1 ? "" : "s"}.
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Render the template with sample student and payment data to check
                spacing and missing variables.
              </p>
            )}
          </aside>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void save()} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {initial ? "Save changes" : "Create template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
