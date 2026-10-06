"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Ban,
  Copy,
  Eye,
  Loader2,
  Megaphone,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  cancelCommunicationCampaign,
  createCommunicationCampaign,
  deleteCommunicationCampaign,
  fetchCommunicationAudienceOptions,
  fetchCommunicationCampaigns,
  fetchTemplates,
  previewCampaign,
  type CampaignPreview,
  type CommunicationAudienceOptions,
  type CommunicationCampaign,
  type CommunicationChannelType,
  type ReminderAudience,
  type ReminderRule,
  type ReminderTemplate,
} from "@/lib/school/communicationsApi";
import { cn } from "@/lib/utils";
import { ALL_CHANNELS, CHANNEL_LABELS } from "./labels";
import { AudiencePicker, AudienceValue, emptyAudience } from "./AudiencePicker";
import {
  CAMPAIGN_MERGE_TAG_GROUPS,
  MergeTagPicker,
  useMergeTagInserter,
} from "./MergeTags";

const CUSTOM = "__custom__";

function campaignState(campaign: CommunicationCampaign): {
  label: string;
  tone: string;
} {
  if (campaign.status === "CANCELLED") {
    return { label: "Cancelled", tone: "bg-muted text-muted-foreground" };
  }
  if (
    campaign.scheduledAt &&
    new Date(campaign.scheduledAt).getTime() > Date.now()
  ) {
    return { label: "Scheduled", tone: "bg-sky-50 text-sky-700 border-sky-200" };
  }
  return {
    label: "Sending",
    tone: "bg-amber-50 text-amber-700 border-amber-200",
  };
}

function audienceText(
  audience: ReminderRule["audience"],
  options: CommunicationAudienceOptions,
): string {
  switch (audience.type) {
    case "ALL_PARENTS":
      return "All parents";
    case "DEBTORS":
      return "Parents with a balance";
    case "ALL_STAFF":
      return "All staff";
    case "GRADE":
      return options.grades.find((g) => g.id === audience.gradeId)?.name ?? "A grade";
    case "STREAM":
      return options.streams.find((s) => s.id === audience.streamId)?.name ?? "A class";
    case "STUDENTS":
      return `${audience.studentIds?.length ?? 0} student${
        (audience.studentIds?.length ?? 0) === 1 ? "" : "s"
      }`;
    default:
      return audience.type;
  }
}

function formatWhen(value: string | null): string {
  if (!value) return "now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "now";
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CampaignsTab({
  onChanged,
}: {
  onChanged: () => Promise<void>;
}) {
  const [campaigns, setCampaigns] = useState<CommunicationCampaign[]>([]);
  const [templates, setTemplates] = useState<ReminderTemplate[]>([]);
  const [options, setOptions] = useState<CommunicationAudienceOptions>({
    grades: [],
    streams: [],
  });
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reusingName, setReusingName] = useState<string | null>(null);
  const [preview, setPreview] = useState<CampaignPreview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [confirm, setConfirm] = useState<{
    campaign: CommunicationCampaign;
    action: "cancel" | "delete";
  } | null>(null);

  const [name, setName] = useState("");
  const [channels, setChannels] = useState<CommunicationChannelType[]>(["SMS"]);
  const [audience, setAudience] = useState<AudienceValue>(emptyAudience());
  const [templateId, setTemplateId] = useState(CUSTOM);
  const [subject, setSubject] = useState("");
  const [bodySms, setBodySms] = useState("");
  const [bodyEmail, setBodyEmail] = useState("");
  const [scheduleLater, setScheduleLater] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");

  const tags = useMergeTagInserter({
    sms: { value: bodySms, setValue: setBodySms, label: "SMS message" },
    subject: { value: subject, setValue: setSubject, label: "Email subject" },
    email: { value: bodyEmail, setValue: setBodyEmail, label: "Email body" },
  });

  const load = useCallback(async () => {
    try {
      const [nextCampaigns, nextTemplates, nextOptions] = await Promise.all([
        fetchCommunicationCampaigns(),
        fetchTemplates(),
        fetchCommunicationAudienceOptions(),
      ]);
      setCampaigns(nextCampaigns);
      setTemplates(nextTemplates);
      setOptions(nextOptions);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  const resetForm = () => {
    setName("");
    setChannels(["SMS"]);
    setAudience(emptyAudience());
    setTemplateId(CUSTOM);
    setSubject("");
    setBodySms("");
    setBodyEmail("");
    setScheduleLater(false);
    setScheduledAt("");
    setReusingName(null);
    setPreview(null);
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  /** Prefill the dialog from a past campaign, ready to send again. */
  const reuse = (campaign: CommunicationCampaign) => {
    setName(`${campaign.name} (copy)`);
    setChannels(campaign.channels.length ? campaign.channels : ["SMS"]);
    setAudience({
      type: campaign.audience.type,
      gradeId: campaign.audience.gradeId,
      streamId: campaign.audience.streamId,
      students: (campaign.audience.studentIds ?? []).map((id, i) => ({
        id,
        name: `Student ${i + 1}`,
        admissionNumber: null,
      })),
    });
    if (campaign.templateId) {
      setTemplateId(campaign.templateId);
      setSubject("");
      setBodySms("");
      setBodyEmail("");
    } else {
      setTemplateId(CUSTOM);
      setSubject(campaign.subject ?? "");
      setBodySms(campaign.bodySms ?? "");
      setBodyEmail(campaign.bodyEmail ?? "");
    }
    setScheduleLater(false);
    setScheduledAt("");
    setReusingName(campaign.name);
    setPreview(null);
    setOpen(true);
  };

  const toggleChannel = (channel: CommunicationChannelType) => {
    setChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel],
    );
  };

  const buildAudience = (): ReminderAudience | null => {
    if (audience.type === "GRADE") {
      return audience.gradeId ? { type: "GRADE", gradeId: audience.gradeId } : null;
    }
    if (audience.type === "STREAM") {
      return audience.streamId
        ? { type: "STREAM", streamId: audience.streamId }
        : null;
    }
    if (audience.type === "STUDENTS") {
      return audience.students.length
        ? { type: "STUDENTS", studentIds: audience.students.map((s) => s.id) }
        : null;
    }
    return { type: audience.type };
  };

  const onPreview = async () => {
    const resolved = buildAudience();
    if (!resolved) {
      toast.error("Choose an audience.");
      return;
    }
    const useTemplate = templateId !== CUSTOM;
    try {
      setPreviewing(true);
      setPreview(
        await previewCampaign({
          channels,
          audience: resolved,
          templateId: useTemplate ? templateId : undefined,
          subject: useTemplate ? undefined : subject.trim() || undefined,
          bodySms: useTemplate ? undefined : bodySms.trim() || undefined,
          bodyEmail: useTemplate ? undefined : bodyEmail.trim() || undefined,
        }),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not preview");
    } finally {
      setPreviewing(false);
    }
  };

  const onSend = async () => {
    if (!name.trim()) {
      toast.error("Give the campaign a name.");
      return;
    }
    if (!channels.length) {
      toast.error("Pick at least one channel.");
      return;
    }
    if (audience.type === "GRADE" && !audience.gradeId) {
      toast.error("Choose a grade.");
      return;
    }
    if (audience.type === "STREAM" && !audience.streamId) {
      toast.error("Choose a class.");
      return;
    }
    if (audience.type === "STUDENTS" && !audience.students.length) {
      toast.error("Select at least one student.");
      return;
    }
    const useTemplate = templateId !== CUSTOM;
    if (!useTemplate && !bodySms.trim() && !bodyEmail.trim()) {
      toast.error("Write a message or choose a template.");
      return;
    }
    if (scheduleLater && !scheduledAt) {
      toast.error("Pick a date and time to send.");
      return;
    }
    try {
      setBusy(true);
      const resolvedAudience = buildAudience();
      if (!resolvedAudience) {
        toast.error("Choose an audience.");
        return;
      }
      const created = await createCommunicationCampaign({
        name: name.trim(),
        channels,
        audience: resolvedAudience,
        templateId: useTemplate ? templateId : undefined,
        subject: useTemplate ? undefined : subject.trim() || undefined,
        bodySms: useTemplate ? undefined : bodySms.trim() || undefined,
        bodyEmail: useTemplate ? undefined : bodyEmail.trim() || undefined,
        scheduledAt:
          scheduleLater && scheduledAt
            ? new Date(scheduledAt).toISOString()
            : undefined,
      });
      toast.success(
        `Campaign queued for ${created.recipientCount} recipient${
          created.recipientCount === 1 ? "" : "s"
        }`,
      );
      resetForm();
      setOpen(false);
      await Promise.all([load(), onChanged()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send");
    } finally {
      setBusy(false);
    }
  };

  const onConfirm = async () => {
    if (!confirm) return;
    try {
      setBusy(true);
      if (confirm.action === "cancel") {
        await cancelCommunicationCampaign(confirm.campaign.id);
        toast.success("Campaign cancelled");
      } else {
        await deleteCommunicationCampaign(confirm.campaign.id);
        toast.success("Campaign deleted");
      }
      setConfirm(null);
      await Promise.all([load(), onChanged()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Campaigns</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            One-off broadcasts — a message sent once, now or later. Great for
            “child sent home”, closures and announcements.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New campaign
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <Megaphone className="h-8 w-8 text-muted-foreground/60" />
              <p className="text-sm font-medium">No campaigns yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Send a one-off message to a group — no repeating schedule needed.
              </p>
              <Button className="mt-2" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                New campaign
              </Button>
            </div>
          ) : (
            <ul className="divide-y">
              {campaigns.map((campaign) => {
                const state = campaignState(campaign);
                return (
                  <li key={campaign.id} className="flex items-start gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {campaign.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn("shrink-0 border", state.tone)}
                        >
                          {state.label}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {audienceText(campaign.audience, options)} ·{" "}
                        {campaign.recipientCount} recipient
                        {campaign.recipientCount === 1 ? "" : "s"} ·{" "}
                        {campaign.status === "CANCELLED"
                          ? "cancelled"
                          : `sends ${formatWhen(campaign.scheduledAt)}`}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        {campaign.channels.map((channel) => (
                          <Badge
                            key={channel}
                            variant="secondary"
                            className="text-[10px]"
                          >
                            {CHANNEL_LABELS[channel]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 pt-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => reuse(campaign)}
                        aria-label="Reuse campaign"
                      >
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      {campaign.status === "SCHEDULED" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setConfirm({ campaign, action: "cancel" })
                          }
                          aria-label="Cancel campaign"
                        >
                          <Ban className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setConfirm({ campaign, action: "delete" })}
                        aria-label="Delete campaign"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              {reusingName ? "Reuse campaign" : "New campaign"}
            </DialogTitle>
            <DialogDescription>
              {reusingName
                ? `Based on “${reusingName}”. Review the audience and message, then send.`
                : "Sends once to everyone in the audience."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. School closed tomorrow"
              />
            </div>

            <div className="space-y-2">
              <Label>Channels</Label>
              <div className="flex flex-wrap gap-2">
                {ALL_CHANNELS.map((channel) => (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => toggleChannel(channel)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors",
                      channels.includes(channel)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {CHANNEL_LABELS[channel]}
                  </button>
                ))}
              </div>
            </div>

            <AudiencePicker
              options={options}
              value={audience}
              onChange={setAudience}
            />

            <div className="space-y-2">
              <Label>Message</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CUSTOM}>Write a custom message</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {templateId === CUSTOM ? (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
                <MergeTagPicker
                  columns="sidebar"
                  className="lg:order-2"
                  groups={CAMPAIGN_MERGE_TAG_GROUPS}
                  onInsert={tags.insert}
                  activeLabel={tags.activeLabel}
                />
                <div className="space-y-4 lg:order-1">
                  <div className="space-y-2">
                    <Label>SMS message</Label>
                    <Textarea
                      {...tags.bind("sms")}
                      value={bodySms}
                      onChange={(e) => setBodySms(e.target.value)}
                      rows={4}
                      placeholder="{{school.name}}: {{student.name}} will be sent home at 11am today."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email subject</Label>
                    <Input
                      {...tags.bind("subject")}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="{{school.name}} — important notice"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email body (optional)</Label>
                    <Textarea
                      {...tags.bind("email")}
                      value={bodyEmail}
                      onChange={(e) => setBodyEmail(e.target.value)}
                      rows={4}
                      placeholder="<p>Dear {{recipient.name}}, …</p>"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>When</Label>
              <Select
                value={scheduleLater ? "later" : "now"}
                onValueChange={(v) => setScheduleLater(v === "later")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="now">Send now</SelectItem>
                  <SelectItem value="later">Schedule for later</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {scheduleLater ? (
              <div className="space-y-2">
                <Label>Send at</Label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              </div>
            ) : null}

            {preview ? (
              <div className="space-y-3 rounded-xl border bg-muted/30 p-4 text-sm">
                <p className="text-xs font-medium text-muted-foreground">
                  Preview · {preview.recipientCount} recipient
                  {preview.recipientCount === 1 ? "" : "s"} · {preview.withPhone}{" "}
                  by SMS · {preview.withEmail} by email
                </p>
                <div>
                  <p className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    SMS
                    <Badge variant="outline" className="text-[10px]">
                      {preview.smsSegments} segment
                      {preview.smsSegments === 1 ? "" : "s"}
                    </Badge>
                  </p>
                  <p className="whitespace-pre-wrap">{preview.smsBody || "—"}</p>
                </div>
                {preview.emailSubject || preview.emailBody ? (
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      Email
                    </p>
                    <p className="font-medium">{preview.emailSubject}</p>
                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                      {preview.emailBody}
                    </p>
                  </div>
                ) : null}
                {preview.samples.length ? (
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      First {preview.samples.length}
                    </p>
                    <ul className="space-y-0.5 text-xs text-muted-foreground">
                      {preview.samples.map((sample, index) => (
                        <li key={index} className="truncate">
                          {sample.name || sample.phone || sample.email || "Recipient"}
                          {sample.studentName ? ` · ${sample.studentName}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => void onPreview()}
              disabled={previewing || busy}
            >
              {previewing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              Preview
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => void onSend()} disabled={busy}>
                {busy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {scheduleLater ? "Schedule campaign" : "Send now"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.action === "cancel"
                ? "Cancel this campaign?"
                : "Delete this campaign?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.action === "cancel"
                ? "Queued messages will not be sent. This can't be undone."
                : "The campaign is removed. Any messages already queued are cancelled."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Keep</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void onConfirm();
              }}
              disabled={busy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {confirm?.action === "cancel" ? "Cancel campaign" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
