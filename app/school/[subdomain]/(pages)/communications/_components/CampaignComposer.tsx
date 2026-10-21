"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Check,
  Eye,
  Loader2,
  Send,
  Sparkles,
  TestTube2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  fetchCommAudienceOptions,
  fetchCommSettings,
  fetchCommTemplates,
  previewCommCampaign,
  saveCommCampaign,
  sendCommTest,
  type CommAudience,
  type CommAudienceOptions,
  type CommCampaign,
  type CommCampaignInput,
  type CommCampaignPreview,
  type CommChannel,
  type CommSettings,
  type CommTemplate,
} from "@/lib/school/communicationsHubApi";
import {
  CHANNEL_META,
  MERGE_TAG_GROUPS,
  audienceIsValid,
  estimateSegments,
  formatNumber,
} from "@/lib/school/communicationsHubUtils";
import { ChannelPill, InlineError } from "./shared";
import { AudienceSelector } from "./AudienceSelector";

const CUSTOM_TEMPLATE = "__custom__";
const BODY_CHANNELS: CommChannel[] = ["SMS", "WHATSAPP", "EMAIL"];

function toLocalInput(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function CampaignComposer({
  open,
  initial,
  onClose,
  onSaved,
  permissions,
}: {
  open: boolean;
  initial?: CommCampaign | null;
  onClose: () => void;
  onSaved: () => void;
  permissions: string[];
}) {
  const [templates, setTemplates] = useState<CommTemplate[]>([]);
  const [options, setOptions] = useState<CommAudienceOptions | null>(null);
  const [settings, setSettings] = useState<CommSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [channels, setChannels] = useState<CommChannel[]>(["SMS"]);
  const [audience, setAudience] = useState<CommAudience>({ type: "ALL_PARENTS" });
  const [templateId, setTemplateId] = useState(CUSTOM_TEMPLATE);
  const [subject, setSubject] = useState("");
  const [bodySms, setBodySms] = useState("");
  const [bodyEmail, setBodyEmail] = useState("");
  const [bodyWhatsApp, setBodyWhatsApp] = useState("");
  const [bodyTab, setBodyTab] = useState<CommChannel>("SMS");
  const [schedule, setSchedule] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [preview, setPreview] = useState<CommCampaignPreview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [saving, setSaving] = useState<"draft" | "send" | "schedule" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testOpen, setTestOpen] = useState(false);
  const [testChannel, setTestChannel] = useState<CommChannel>("SMS");
  const [testTo, setTestTo] = useState("");
  const [testSending, setTestSending] = useState(false);

  const canSend = permissions.includes("CAMPAIGNS_SEND");
  const canSendTest = permissions.includes("TESTS_SEND");
  const isEdit = Boolean(initial?.id);

  const reset = useCallback(() => {
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
    setChannels(initial?.channels?.length ? initial.channels : ["SMS"]);
    setAudience(initial?.audience ?? { type: "ALL_PARENTS" });
    setTemplateId(initial?.templateId ?? CUSTOM_TEMPLATE);
    setSubject(initial?.subject ?? "");
    setBodySms(initial?.bodySms ?? "");
    setBodyEmail(initial?.bodyEmail ?? "");
    setBodyWhatsApp(initial?.bodyWhatsApp ?? "");
    setBodyTab(initial?.channels?.includes("SMS") ? "SMS" : initial?.channels?.includes("EMAIL") ? "EMAIL" : "WHATSAPP");
    setSchedule(Boolean(initial?.scheduledAt));
    setScheduledAt(toLocalInput(initial?.scheduledAt));
    setPreview(null);
    setError(null);
    setTestOpen(false);
  }, [initial]);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting the composer when the dialog opens
    reset();
    setLoading(true);
    void (async () => {
      try {
        const [nextTemplates, nextOptions, nextSettings] = await Promise.all([
          fetchCommTemplates(),
          fetchCommAudienceOptions(),
          fetchCommSettings(),
        ]);
        setTemplates(nextTemplates);
        setOptions(nextOptions);
        setSettings(nextSettings);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load composer data");
      } finally {
        setLoading(false);
      }
    })();
  }, [open, reset]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === templateId) ?? null,
    [templates, templateId],
  );

  const toggleChannel = (channel: CommChannel) => {
    setChannels((current) =>
      current.includes(channel)
        ? current.filter((entry) => entry !== channel)
        : [...current, channel],
    );
  };

  const selectTemplate = (value: string) => {
    setTemplateId(value);
    if (value === CUSTOM_TEMPLATE) return;
    const template = templates.find((entry) => entry.id === value);
    if (!template) return;
    if (template.subject) setSubject(template.subject);
    if (template.bodySms) setBodySms(template.bodySms);
    if (template.bodyEmail) setBodyEmail(template.bodyEmail);
    if (template.bodyWhatsApp) setBodyWhatsApp(template.bodyWhatsApp);
  };

  const appendTag = (tag: string) => {
    const token = `{{${tag}}}`;
    if (bodyTab === "SMS") setBodySms((value) => `${value}${value ? " " : ""}${token}`);
    if (bodyTab === "WHATSAPP") setBodyWhatsApp((value) => `${value}${value ? " " : ""}${token}`);
    if (bodyTab === "EMAIL") setBodyEmail((value) => `${value}${value ? " " : ""}${token}`);
  };

  const buildInput = (mode: CommCampaignInput["mode"]): CommCampaignInput => ({
    name: name.trim(),
    description: description.trim() || null,
    channels,
    audience,
    templateId: templateId === CUSTOM_TEMPLATE ? null : templateId,
    subject: subject.trim() || null,
    bodySms: bodySms.trim() || null,
    bodyEmail: bodyEmail.trim() || null,
    bodyWhatsApp: bodyWhatsApp.trim() || null,
    scheduledAt: schedule ? fromLocalInput(scheduledAt) : null,
    mode,
  });

  const validate = (): string | null => {
    if (!name.trim()) return "Give this campaign a name.";
    if (!channels.length) return "Choose at least one channel.";
    if (!audienceIsValid(audience)) return "Choose a complete audience.";
    if (
      templateId === CUSTOM_TEMPLATE &&
      !bodySms.trim() &&
      !bodyEmail.trim() &&
      !bodyWhatsApp.trim()
    ) {
      return "Write a message or choose a template.";
    }
    if (schedule && !scheduledAt) return "Choose a date and time to schedule.";
    if (schedule && fromLocalInput(scheduledAt) && new Date(scheduledAt).getTime() <= Date.now()) {
      return "The scheduled time must be in the future.";
    }
    return null;
  };

  const doPreview = async () => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    try {
      setPreviewing(true);
      setError(null);
      setPreview(await previewCommCampaign(buildInput("DRAFT")));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed");
    } finally {
      setPreviewing(false);
    }
  };

  const save = async (mode: "DRAFT" | "SEND_NOW" | "SCHEDULE") => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    try {
      setSaving(mode === "DRAFT" ? "draft" : mode === "SCHEDULE" ? "schedule" : "send");
      setError(null);
      const saved = await saveCommCampaign(buildInput(mode), initial?.id ?? null);
      toast.success(
        mode === "DRAFT"
          ? "Draft saved."
          : mode === "SCHEDULE"
            ? "Campaign scheduled."
            : "Campaign is sending.",
      );
      onSaved();
      onClose();
      void saved;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save campaign");
    } finally {
      setSaving(null);
    }
  };

  const submitTest = async () => {
    if (!testTo.trim()) {
      toast.error("Enter a destination for the test.");
      return;
    }
    try {
      setTestSending(true);
      const result = await sendCommTest({
        channel: testChannel,
        to: testTo.trim(),
        subject: subject.trim() || null,
        bodySms: bodySms.trim() || null,
        bodyEmail: bodyEmail.trim() || null,
        bodyWhatsApp: bodyWhatsApp.trim() || null,
        templateId: templateId === CUSTOM_TEMPLATE ? null : templateId,
        sampleName: "Test recipient",
      });
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
      setTestOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Test send failed");
    } finally {
      setTestSending(false);
    }
  };

  const bodyValue =
    bodyTab === "SMS" ? bodySms : bodyTab === "WHATSAPP" ? bodyWhatsApp : bodyEmail;
  const setBodyValue =
    bodyTab === "SMS" ? setBodySms : bodyTab === "WHATSAPP" ? setBodyWhatsApp : setBodyEmail;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-6xl overflow-y-auto p-0">
        <DialogHeader className="border-b border-border px-6 pb-4 pt-6">
          <DialogTitle className="text-xl">
            {isEdit ? "Edit campaign" : "New campaign"}
          </DialogTitle>
          <DialogDescription>
            Compose once, personalize per recipient and send through the channels
            your school has enabled.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading templates and audiences…
          </div>
        ) : (
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6 px-6 py-5">
              {error ? <InlineError message={error} /> : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="campaign-name">Campaign name</Label>
                  <Input
                    id="campaign-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Term 2 fee reminder"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="campaign-description">Internal note (optional)</Label>
                  <Input
                    id="campaign-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Only your team sees this"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Channels</Label>
                <div className="flex flex-wrap gap-2">
                  {(["SMS", "EMAIL", "WHATSAPP", "IN_APP"] as CommChannel[]).map((channel) => {
                    const meta = CHANNEL_META[channel];
                    const enabled = channels.includes(channel);
                    const settingsKey =
                      channel === "SMS"
                        ? "smsEnabled"
                        : channel === "EMAIL"
                          ? "emailEnabled"
                          : channel === "WHATSAPP"
                            ? "whatsappEnabled"
                            : "inAppEnabled";
                    const channelEnabled = settings?.[settingsKey] ?? true;
                    return (
                      <button
                        key={channel}
                        type="button"
                        onClick={() => toggleChannel(channel)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                          enabled
                            ? "border-primary/40 bg-primary/5 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/25",
                          !channelEnabled && "opacity-60",
                        )}
                      >
                        <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
                        {meta.label}
                        {enabled ? <Check className="h-3.5 w-3.5" /> : null}
                        {!channelEnabled ? (
                          <span className="text-[10px] uppercase tracking-wide">
                            off in settings
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <AudienceSelector
                audience={audience}
                onChange={setAudience}
                options={options}
              />

              <div className="space-y-2">
                <Label>Template</Label>
                <Select value={templateId} onValueChange={selectTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Write a custom message" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CUSTOM_TEMPLATE}>Custom message</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate?.variables?.length ? (
                  <p className="text-xs text-muted-foreground">
                    Template variables: {selectedTemplate.variables.join(", ")}
                  </p>
                ) : null}
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label>Message</Label>
                  <div className="flex gap-1 rounded-lg border border-border p-1">
                    {BODY_CHANNELS.map((channel) => (
                      <button
                        key={channel}
                        type="button"
                        onClick={() => setBodyTab(channel)}
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                          bodyTab === channel
                            ? "bg-primary text-white"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {CHANNEL_META[channel].short}
                      </button>
                    ))}
                  </div>
                </div>

                {bodyTab === "EMAIL" ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="email-subject">Email subject</Label>
                    <Input
                      id="email-subject"
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      placeholder="{{school.name}} — important update"
                    />
                  </div>
                ) : null}

                <Textarea
                  value={bodyValue}
                  onChange={(event) => setBodyValue(event.target.value)}
                  rows={bodyTab === "EMAIL" ? 9 : 5}
                  placeholder={
                    bodyTab === "EMAIL"
                      ? "Dear {{recipient.name}}, …"
                      : "{{school.name}}: …"
                  }
                />

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Merge tags
                  </span>
                  {MERGE_TAG_GROUPS.map((group) => (
                    <div key={group.label} className="flex flex-wrap items-center gap-1">
                      <span className="text-[11px] text-muted-foreground">{group.label}:</span>
                      {group.tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => appendTag(tag)}
                          className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] text-foreground/80 transition-colors hover:border-primary/30 hover:text-primary"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    {bodyTab === "SMS"
                      ? `${bodySms.length} characters · ${estimateSegments(bodySms)} SMS segment${estimateSegments(bodySms) === 1 ? "" : "s"}`
                      : bodyTab === "WHATSAPP"
                        ? `${bodyWhatsApp.length} characters`
                        : "Email is rendered as HTML; values are escaped safely."}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void doPreview()}
                    disabled={previewing}
                  >
                    {previewing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    Preview
                  </Button>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Schedule for later</p>
                    <p className="text-xs text-muted-foreground">
                      Leave off to send as soon as you confirm.
                    </p>
                  </div>
                  <Switch checked={schedule} onCheckedChange={setSchedule} />
                </div>
                {schedule ? (
                  <Input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(event) => setScheduledAt(event.target.value)}
                  />
                ) : null}
              </div>
            </div>

            <aside className="space-y-4 border-t border-border bg-muted/20 px-6 py-5 lg:border-l lg:border-t-0">
              <div>
                <p className="text-sm font-semibold text-foreground">Send summary</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Counts and credit estimates update from the live audience.
                </p>
              </div>

              <div className="space-y-2 rounded-xl border border-border bg-background p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Recipients</span>
                  <span className="font-semibold">
                    {preview ? formatNumber(preview.recipientCount) : "Preview to count"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">With phone</span>
                  <span>{preview ? formatNumber(preview.withPhone) : "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">With email</span>
                  <span>{preview ? formatNumber(preview.withEmail) : "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">SMS segments</span>
                  <span>{preview ? preview.smsSegments : estimateSegments(bodySms)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-muted-foreground">SMS credits needed</span>
                  <span
                    className={cn(
                      "font-semibold",
                      preview &&
                        preview.smsMeteringEnabled &&
                        preview.estimatedSmsCredits > preview.creditsAvailable
                        ? "text-rose-600"
                        : "",
                    )}
                  >
                    {preview ? formatNumber(preview.estimatedSmsCredits) : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Credits available</span>
                  <span>{preview ? formatNumber(preview.creditsAvailable) : "—"}</span>
                </div>
              </div>

              {preview?.lowBalance ? (
                <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  Your SMS balance is low. Email and WhatsApp can still send.
                </div>
              ) : null}

              {preview ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Sample recipients
                  </p>
                  {preview.samples.map((sample, index) => (
                    <div
                      key={`${sample.name ?? "sample"}-${index}`}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-xs"
                    >
                      <p className="font-medium text-foreground">
                        {sample.name ?? "Recipient"}
                        {sample.studentName ? ` · ${sample.studentName}` : ""}
                      </p>
                      <p className="mt-0.5 text-muted-foreground">
                        {[sample.phone, sample.email].filter(Boolean).join(" · ") || "No contact"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              {preview ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Rendered preview
                  </p>
                  <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-background p-3 text-xs text-foreground/80">
                    {bodyTab === "EMAIL"
                      ? preview.emailBody ?? "(empty)"
                      : bodyTab === "WHATSAPP"
                        ? preview.whatsAppBody
                        : preview.smsBody}
                  </pre>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTestOpen((value) => !value)}
                  disabled={!canSendTest}
                >
                  <TestTube2 className="h-4 w-4" /> Test send
                </Button>
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="h-3 w-3" /> Safe rendering
                </Badge>
              </div>

              {testOpen ? (
                <div className="space-y-2 rounded-xl border border-border bg-background p-3">
                  <p className="text-xs font-semibold">Send a single test</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={testChannel}
                      onValueChange={(value) => setTestChannel(value as CommChannel)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["SMS", "EMAIL", "WHATSAPP"] as CommChannel[]).map((channel) => (
                          <SelectItem key={channel} value={channel}>
                            {CHANNEL_META[channel].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      className="h-8 text-xs"
                      value={testTo}
                      onChange={(event) => setTestTo(event.target.value)}
                      placeholder={testChannel === "EMAIL" ? "you@school.ac.ke" : "+2547…"}
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="w-full"
                    onClick={() => void submitTest()}
                    disabled={testSending}
                  >
                    {testSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Send test
                  </Button>
                  <p className="text-[11px] text-muted-foreground">
                    Test sends do not use SMS credits or enter the campaign report.
                  </p>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-1.5">
                {channels.map((channel) => (
                  <ChannelPill key={channel} channel={channel} />
                ))}
              </div>
            </aside>
          </div>
        )}

        <DialogFooter className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-6 py-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => void save("DRAFT")}
              disabled={loading || saving !== null}
            >
              {saving === "draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save draft
            </Button>
            {canSend ? (
              <Button
                type="button"
                onClick={() => (schedule ? void save("SCHEDULE") : void save("SEND_NOW"))}
                disabled={loading || saving !== null}
              >
                {saving === "send" || saving === "schedule" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : schedule ? (
                  <CalendarClock className="h-4 w-4" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {schedule ? "Schedule campaign" : "Send now"}
              </Button>
            ) : null}
          </div>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
