"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BellPlus,
  BellRing,
  Copy,
  Loader2,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  Trash2,
  Users,
  X,
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Switch } from "@/components/ui/switch";
import {
  bulkDeleteReminderRules,
  bulkSetReminderRulesEnabled,
  copyReminderRulesToAudience,
  createReminderRule,
  deleteReminderRule,
  fetchCommunicationAudienceOptions,
  setReminderRuleEnabled,
  updateReminderRule,
  type CalendarEventType,
  type CommunicationAudienceOptions,
  type CommunicationChannelType,
  type ReminderAudience,
  type ReminderOffset,
  type ReminderRule,
  type ReminderSource,
  type ReminderTemplate,
} from "@/lib/school/communicationsApi";
import { cn } from "@/lib/utils";
import {
  ALL_CHANNELS,
  CHANNEL_LABELS,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_OPTIONS,
} from "./labels";
import { AudiencePicker, AudienceValue, emptyAudience } from "./AudiencePicker";

type Filter = "all" | "active" | "paused";

function offsetSummary(rule: ReminderRule): string {
  if (!rule.offsets?.length) return "No schedule";
  return rule.offsets
    .map((o) =>
      o.daysBefore === 0
        ? `on the day at ${o.atTime}`
        : `${o.daysBefore}d before at ${o.atTime}`,
    )
    .join(", ");
}

function triggerLabel(rule: ReminderRule): string {
  if (rule.source === "FEE_DUE") return "Fee due date";
  return rule.eventType ? EVENT_TYPE_LABELS[rule.eventType] : "Calendar event";
}

function audienceLabel(
  rule: ReminderRule,
  options: CommunicationAudienceOptions,
): string {
  const a = rule.audience;
  switch (a.type) {
    case "ALL_PARENTS":
      return "All parents";
    case "DEBTORS":
      return "Parents with a balance";
    case "ALL_STAFF":
      return "All staff";
    case "GRADE":
      return options.grades.find((g) => g.id === a.gradeId)?.name ?? "A grade";
    case "STREAM":
      return options.streams.find((s) => s.id === a.streamId)?.name ?? "A class";
    case "STUDENTS":
      return `${a.studentIds?.length ?? 0} student${
        (a.studentIds?.length ?? 0) === 1 ? "" : "s"
      }`;
    default:
      return a.type;
  }
}

function toAudience(value: AudienceValue): ReminderAudience | null {
  switch (value.type) {
    case "GRADE":
      return value.gradeId ? { type: "GRADE", gradeId: value.gradeId } : null;
    case "STREAM":
      return value.streamId ? { type: "STREAM", streamId: value.streamId } : null;
    case "STUDENTS":
      return value.students.length
        ? { type: "STUDENTS", studentIds: value.students.map((s) => s.id) }
        : null;
    default:
      return { type: value.type };
  }
}

const DEFAULT_OFFSET: ReminderOffset = { daysBefore: 1, atTime: "08:00" };

export function RulesTab({
  rules,
  templates,
  loading,
  activeCount,
  onChanged,
}: {
  rules: ReminderRule[];
  templates: ReminderTemplate[];
  loading: boolean;
  activeCount: number;
  onChanged: () => Promise<void>;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<ReminderRule | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [copyAudience, setCopyAudience] = useState<AudienceValue>(emptyAudience());

  const [name, setName] = useState("");
  const [source, setSource] = useState<ReminderSource>("CALENDAR");
  const [eventType, setEventType] =
    useState<CalendarEventType>("PARENTS_MEETING");
  const [templateId, setTemplateId] = useState("");
  const [channels, setChannels] = useState<CommunicationChannelType[]>(["SMS"]);
  const [audience, setAudience] = useState<AudienceValue>(emptyAudience());
  const [offsets, setOffsets] = useState<ReminderOffset[]>([{ ...DEFAULT_OFFSET }]);
  const [minBalance, setMinBalance] = useState("");

  const [options, setOptions] = useState<CommunicationAudienceOptions>({
    grades: [],
    streams: [],
  });

  useEffect(() => {
    void (async () => {
      try {
        setOptions(await fetchCommunicationAudienceOptions());
      } catch {
        /* pickers are optional */
      }
    })();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSource("CALENDAR");
    setEventType("PARENTS_MEETING");
    setTemplateId("");
    setChannels(["SMS"]);
    setAudience(emptyAudience());
    setOffsets([{ ...DEFAULT_OFFSET }]);
    setMinBalance("");
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const prefill = (rule: ReminderRule, copy: boolean) => {
    setEditingId(copy ? null : rule.id);
    setName(copy ? `${rule.name} (copy)` : rule.name);
    setSource(rule.source);
    setEventType(rule.eventType ?? "PARENTS_MEETING");
    setTemplateId(rule.templateId ?? "");
    setChannels(rule.channels.length ? rule.channels : ["SMS"]);
    setAudience({
      type: rule.audience.type,
      gradeId: rule.audience.gradeId,
      streamId: rule.audience.streamId,
      students: (rule.audience.studentIds ?? []).map((id, i) => ({
        id,
        name: `Student ${i + 1}`,
        admissionNumber: null,
      })),
    });
    setMinBalance(
      rule.condition?.minBalance != null ? String(rule.condition.minBalance) : "",
    );
    setOffsets(
      rule.offsets.length
        ? rule.offsets.map((o) => ({ ...o }))
        : [{ ...DEFAULT_OFFSET }],
    );
    setOpen(true);
  };

  const toggleChannel = (channel: CommunicationChannelType) => {
    setChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel],
    );
  };

  const updateOffset = (index: number, next: Partial<ReminderOffset>) => {
    setOffsets((prev) =>
      prev.map((o, i) => (i === index ? { ...o, ...next } : o)),
    );
  };

  const onSave = async () => {
    if (!name.trim()) {
      toast.error("Give the reminder a name.");
      return;
    }
    if (!channels.length) {
      toast.error("Pick at least one channel.");
      return;
    }
    if (!templateId) {
      toast.error("Choose a message template.");
      return;
    }
    const cleanOffsets = offsets
      .map((o) => ({ daysBefore: Number(o.daysBefore) || 0, atTime: o.atTime }))
      .filter((o) => o.atTime);
    if (!cleanOffsets.length) {
      toast.error("Add at least one send time.");
      return;
    }
    const resolvedAudience = toAudience(audience);
    if (!resolvedAudience) {
      toast.error("Choose a grade, class, or at least one student.");
      return;
    }
    const payload = {
      name: name.trim(),
      source,
      eventType: source === "CALENDAR" ? eventType : undefined,
      channels,
      audience: resolvedAudience,
      offsets: cleanOffsets,
      templateId,
      condition:
        source === "FEE_DUE" && minBalance.trim()
          ? { minBalance: Number(minBalance) }
          : undefined,
    };
    try {
      setBusy(true);
      if (editingId) {
        await updateReminderRule(editingId, payload);
        toast.success("Reminder updated");
      } else {
        await createReminderRule({ ...payload, enabled: true });
        toast.success("Reminder created");
      }
      resetForm();
      setOpen(false);
      await onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  const onToggle = async (rule: ReminderRule, enabled: boolean) => {
    try {
      await setReminderRuleEnabled(rule.id, enabled);
      await onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update rule");
    }
  };

  const onDelete = async (rule: ReminderRule) => {
    try {
      await deleteReminderRule(rule.id);
      toast.success("Reminder deleted");
      setConfirm(null);
      await onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete rule");
    }
  };

  const templateName = (id: string | null) =>
    templates.find((t) => t.id === id)?.name ?? "—";

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rules.filter((r) => {
      if (filter === "active" && !r.enabled) return false;
      if (filter === "paused" && r.enabled) return false;
      if (q && !`${r.name} ${triggerLabel(r)}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [rules, filter, search]);

  const chips: Array<{ id: Filter; label: string; count: number }> = [
    { id: "all", label: "All", count: rules.length },
    { id: "active", label: "Active", count: activeCount },
    { id: "paused", label: "Paused", count: rules.length - activeCount },
  ];

  const validIds = useMemo(() => new Set(rules.map((r) => r.id)), [rules]);
  const selectedIds = useMemo(
    () => new Set([...selected].filter((id) => validIds.has(id))),
    [selected, validIds],
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allVisibleSelected =
    visible.length > 0 && visible.every((r) => selectedIds.has(r.id));

  const toggleAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visible.forEach((r) => next.delete(r.id));
      else visible.forEach((r) => next.add(r.id));
      return next;
    });
  };

  const runBulk = async (fn: () => Promise<unknown>, message: string) => {
    try {
      setBulkBusy(true);
      await fn();
      toast.success(message);
      setSelected(new Set());
      setBulkConfirm(false);
      setCopyOpen(false);
      await onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBulkBusy(false);
    }
  };

  const count = selectedIds.size;
  const onBulkEnable = () =>
    void runBulk(
      () => bulkSetReminderRulesEnabled([...selectedIds], true),
      `Activated ${count} reminder${count === 1 ? "" : "s"}`,
    );
  const onBulkDisable = () =>
    void runBulk(
      () => bulkSetReminderRulesEnabled([...selectedIds], false),
      `Paused ${count} reminder${count === 1 ? "" : "s"}`,
    );
  const onBulkDelete = () =>
    void runBulk(
      () => bulkDeleteReminderRules([...selectedIds]),
      `Deleted ${count} reminder${count === 1 ? "" : "s"}`,
    );
  const onCopyConfirm = () => {
    const target = toAudience(copyAudience);
    if (!target) {
      toast.error("Choose a grade, class, or at least one student.");
      return;
    }
    void runBulk(
      () => copyReminderRulesToAudience([...selectedIds], target),
      `Copied ${count} reminder${count === 1 ? "" : "s"} to a new audience`,
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Reminders</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Message a group automatically before (or on) a date.{" "}
            {activeCount > 0 ? `${activeCount} active.` : "Nothing is active yet."}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New reminder
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {visible.length > 0 ? (
          <Checkbox
            checked={allVisibleSelected}
            onCheckedChange={() => toggleAllVisible()}
            aria-label="Select all reminders"
          />
        ) : null}
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setFilter(chip.id)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filter === chip.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {chip.label}
            <span className="ml-1.5 opacity-70">{chip.count}</span>
          </button>
        ))}
        <div className="relative ml-auto w-full sm:w-56">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reminders"
            className="pl-8"
          />
        </div>
      </div>

      {count > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-muted/40 px-3 py-2">
          <span className="text-sm font-medium">{count} selected</span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" disabled={bulkBusy} onClick={onBulkEnable}>
              {bulkBusy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Activate
            </Button>
            <Button size="sm" variant="outline" disabled={bulkBusy} onClick={onBulkDisable}>
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={bulkBusy}
              onClick={() => {
                setCopyAudience(emptyAudience());
                setCopyOpen(true);
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy to…
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={bulkBusy}
              onClick={() => setBulkConfirm(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button
              size="icon"
              variant="ghost"
              disabled={bulkBusy}
              onClick={() => setSelected(new Set())}
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <BellRing className="h-8 w-8 text-muted-foreground/60" />
              <p className="text-sm font-medium">
                {rules.length === 0 ? "No reminders yet" : "Nothing matches"}
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                {rules.length === 0
                  ? "Create one and it will run automatically — no need to remember dates."
                  : "Try a different search or filter."}
              </p>
              {rules.length === 0 ? (
                <Button className="mt-2" onClick={openCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  New reminder
                </Button>
              ) : null}
            </div>
          ) : (
            <ul className="divide-y">
              {visible.map((rule) => (
                <li
                  key={rule.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3",
                    selectedIds.has(rule.id) && "bg-muted/40",
                  )}
                >
                  <Checkbox
                    className="mt-1"
                    checked={selectedIds.has(rule.id)}
                    onCheckedChange={() => toggleSelect(rule.id)}
                    aria-label={`Select ${rule.name}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {rule.name}
                      </span>
                      <Badge
                        variant={rule.enabled ? "default" : "outline"}
                        className={cn(
                          "shrink-0 text-[10px]",
                          !rule.enabled && "text-muted-foreground",
                        )}
                      >
                        {rule.enabled ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {triggerLabel(rule)} · {audienceLabel(rule, options)} ·{" "}
                      {offsetSummary(rule)}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      {rule.channels.map((channel) => (
                        <Badge key={channel} variant="secondary" className="text-[10px]">
                          {CHANNEL_LABELS[channel]}
                        </Badge>
                      ))}
                      <span className="text-[11px] text-muted-foreground">
                        via {templateName(rule.templateId)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 pt-0.5">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(v) => void onToggle(rule, v)}
                      aria-label={rule.enabled ? "Pause reminder" : "Activate reminder"}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => prefill(rule, false)}
                      aria-label="Edit reminder"
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => prefill(rule, true)}
                      aria-label="Duplicate reminder"
                    >
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirm(rule)}
                      aria-label="Delete reminder"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BellPlus className="h-4 w-4" />
              {editingId ? "Edit reminder" : "New reminder"}
            </DialogTitle>
            <DialogDescription>
              Runs automatically before (or on) the chosen date.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Parents meeting — 3 days before"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Trigger</Label>
                <Select
                  value={source}
                  onValueChange={(v) => setSource(v as ReminderSource)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CALENDAR">A calendar event</SelectItem>
                    <SelectItem value="FEE_DUE">Fee due date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {source === "CALENDAR" ? (
                <div className="space-y-2">
                  <Label>Event type</Label>
                  <Select
                    value={eventType}
                    onValueChange={(v) => setEventType(v as CalendarEventType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Minimum balance (optional)</Label>
                  <Input
                    value={minBalance}
                    onChange={(e) => setMinBalance(e.target.value)}
                    placeholder="e.g. 1000"
                    inputMode="numeric"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Message template</Label>
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
              <Label>When to send</Label>
              <div className="space-y-2">
                {offsets.map((offset, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      value={offset.daysBefore}
                      onChange={(e) =>
                        updateOffset(index, { daysBefore: Number(e.target.value) })
                      }
                      className="w-24"
                      aria-label="Days before"
                    />
                    <span className="text-xs text-muted-foreground">
                      day{offset.daysBefore === 1 ? "" : "s"} before, at
                    </span>
                    <Input
                      type="time"
                      value={offset.atTime}
                      onChange={(e) => updateOffset(index, { atTime: e.target.value })}
                      className="w-32"
                      aria-label="Time of day"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setOffsets((prev) =>
                          prev.length === 1
                            ? prev
                            : prev.filter((_, i) => i !== index),
                        )
                      }
                      disabled={offsets.length === 1}
                      aria-label="Remove send time"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOffsets((prev) => [...prev, { ...DEFAULT_OFFSET }])}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add another
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void onSave()} disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingId ? "Save changes" : "Create reminder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={copyOpen} onOpenChange={setCopyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Copy to another audience
            </DialogTitle>
            <DialogDescription>
              Creates {count} paused cop{count === 1 ? "y" : "ies"} of the
              selected reminder{count === 1 ? "" : "s"} for a new audience.
              Review and turn them on when ready.
            </DialogDescription>
          </DialogHeader>

          <AudiencePicker
            options={options}
            value={copyAudience}
            onChange={setCopyAudience}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onCopyConfirm} disabled={bulkBusy}>
              {bulkBusy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              Create copies
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this reminder?</AlertDialogTitle>
            <AlertDialogDescription>
              “{confirm?.name}” will stop sending. Messages already queued are
              unaffected. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirm && void onDelete(confirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkConfirm} onOpenChange={setBulkConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {count} reminder{count === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              They will stop sending. Messages already queued are unaffected.
              This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                onBulkDelete();
              }}
              disabled={bulkBusy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
