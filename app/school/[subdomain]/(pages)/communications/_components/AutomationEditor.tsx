"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  fetchCommAudienceOptions,
  saveCommAutomation,
  type CommAudience,
  type CommAudienceOptions,
  type CommAutomation,
  type CommChannel,
  type CommTemplate,
  type CommTrigger,
} from "@/lib/school/communicationsHubApi";
import { CHANNEL_META, audienceIsValid } from "@/lib/school/communicationsHubUtils";
import { AudienceSelector } from "./AudienceSelector";
import { InlineError } from "./shared";

export function AutomationEditor({
  open,
  initial,
  catalog,
  templates,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: CommAutomation | null;
  catalog: CommTrigger[];
  templates: CommTemplate[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState(catalog[0]?.type ?? "");
  const [channels, setChannels] = useState<CommChannel[]>(
    catalog[0]?.defaultChannels ?? ["EMAIL"],
  );
  const [audience, setAudience] = useState<CommAudience>({ type: "EVENT_RECIPIENTS" });
  const [templateId, setTemplateId] = useState("");
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const [options, setOptions] = useState<CommAudienceOptions | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    const trigger =
      catalog.find((entry) => entry.type === initial?.eventType) ?? catalog[0];
    setName(initial?.name ?? trigger?.label ?? "");
    setDescription(initial?.description ?? "");
    setEventType(initial?.eventType ?? trigger?.type ?? "");
    setChannels(
      initial?.channels?.length
        ? initial.channels
        : trigger?.defaultChannels ?? ["EMAIL"],
    );
    setAudience(initial?.audience ?? { type: "EVENT_RECIPIENTS" });
    setTemplateId(initial?.templateId ?? "");
    setDelayMinutes(initial?.delayMinutes ?? 0);
    setEnabled(initial?.enabled ?? false);
    setError(null);
  }, [initial, catalog]);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting an editor when the dialog opens
    reset();
    void (async () => {
      try {
        setOptions(await fetchCommAudienceOptions());
      } catch {
        // Audience options are only needed for grade/stream filters.
      }
    })();
  }, [open, reset]);

  const trigger = catalog.find((entry) => entry.type === eventType);

  const changeTrigger = (value: string) => {
    setEventType(value);
    const next = catalog.find((entry) => entry.type === value);
    if (!next) return;
    setChannels(next.defaultChannels);
    setAudience({ type: "EVENT_RECIPIENTS" });
    if (!initial) setName(next.label);
  };

  const toggleChannel = (channel: CommChannel) => {
    setChannels((current) =>
      current.includes(channel)
        ? current.filter((entry) => entry !== channel)
        : [...current, channel],
    );
  };

  const save = async () => {
    if (!name.trim()) {
      setError("Give this automation a name.");
      return;
    }
    if (!eventType) {
      setError("Choose a trigger.");
      return;
    }
    if (!channels.length) {
      setError("Choose at least one channel.");
      return;
    }
    if (!audienceIsValid(audience)) {
      setError("Choose a complete audience.");
      return;
    }
    if (!templateId) {
      setError("Choose a template so the message has content.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await saveCommAutomation(
        {
          name: name.trim(),
          description: description.trim() || null,
          eventType,
          channels,
          audience,
          templateId,
          delayMinutes: Number.isFinite(delayMinutes) ? Math.max(0, delayMinutes) : 0,
          enabled,
        },
        initial?.id ?? null,
      );
      toast.success(initial ? "Automation updated." : "Automation created.");
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save automation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit automation" : "New automation"}</DialogTitle>
          <DialogDescription>
            Choose what happens in the school, who hears about it and on which
            channels. Automations are off until you enable them.
          </DialogDescription>
        </DialogHeader>

        {error ? <InlineError message={error} /> : null}

        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Trigger</Label>
              <Select value={eventType} onValueChange={changeTrigger}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a trigger" />
                </SelectTrigger>
                <SelectContent>
                  {catalog.map((entry) => (
                    <SelectItem key={entry.type} value={entry.type}>
                      {entry.group} · {entry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Delay (minutes)</Label>
              <Input
                type="number"
                min={0}
                value={delayMinutes}
                onChange={(event) => setDelayMinutes(Number(event.target.value))}
              />
              <p className="text-[11px] text-muted-foreground">
                0 sends as soon as the event is processed; quiet hours still apply.
              </p>
            </div>
          </div>

          {trigger ? (
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              {trigger.description}
              <div className="mt-1 flex flex-wrap gap-1">
                {trigger.variables.map((variable) => (
                  <span
                    key={variable}
                    className="rounded-full border border-border bg-background px-1.5 py-0.5 text-[10px]"
                  >
                    {variable}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Name</Label>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Description (optional)</Label>
              <Textarea
                rows={2}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What this automation is for"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Channels</Label>
            <div className="flex flex-wrap gap-2">
              {(["EMAIL", "SMS", "WHATSAPP", "IN_APP"] as CommChannel[]).map((channel) => {
                const active = channels.includes(channel);
                return (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => toggleChannel(channel)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                      active
                        ? "border-primary/40 bg-primary/5 text-primary"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full", CHANNEL_META[channel].dot)} />
                    {CHANNEL_META[channel].label}
                  </button>
                );
              })}
            </div>
          </div>

          <AudienceSelector
            audience={audience}
            onChange={setAudience}
            options={options}
            allowEventRecipients
          />

          <div className="space-y-1.5">
            <Label>Template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Enable automation</p>
              <p className="text-xs text-muted-foreground">
                Off means events are recorded but no message is queued.
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void save()} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {initial ? "Save changes" : "Create automation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
