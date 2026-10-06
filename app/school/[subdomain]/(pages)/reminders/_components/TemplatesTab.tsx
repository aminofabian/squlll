"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Eye,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import {
  bulkDeleteReminderTemplates,
  createReminderTemplate,
  deleteReminderTemplate,
  previewReminder,
  sendTestReminder,
  updateReminderTemplate,
  type CalendarEventType,
  type CommunicationChannelType,
  type ReminderPreview,
  type ReminderTemplate,
} from "@/lib/school/communicationsApi";
import { EVENT_TYPE_LABELS, EVENT_TYPE_OPTIONS } from "./labels";
import {
  MERGE_TAG_GROUPS,
  MergeTagPicker,
  useMergeTagInserter,
} from "./MergeTags";

export function TemplatesTab({
  templates,
  loading,
  onChanged,
}: {
  templates: ReminderTemplate[];
  loading: boolean;
  onChanged: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [eventType, setEventType] = useState<CalendarEventType | "">("");
  const [subject, setSubject] = useState("");
  const [bodySms, setBodySms] = useState("");
  const [bodyEmail, setBodyEmail] = useState("");

  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<ReminderPreview | null>(null);
  const [confirm, setConfirm] = useState<ReminderTemplate | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkConfirm, setBulkConfirm] = useState(false);

  const [testChannel, setTestChannel] =
    useState<CommunicationChannelType>("SMS");
  const [testTo, setTestTo] = useState("");
  const [testing, setTesting] = useState(false);

  const tags = useMergeTagInserter({
    sms: { value: bodySms, setValue: setBodySms, label: "SMS message" },
    subject: { value: subject, setValue: setSubject, label: "Email subject" },
    email: { value: bodyEmail, setValue: setBodyEmail, label: "Email body" },
  });

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setEventType("");
    setSubject("");
    setBodySms("");
    setBodyEmail("");
    setPreview(null);
    setTestTo("");
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (template: ReminderTemplate) => {
    setEditingId(template.id);
    setName(template.name);
    setEventType(template.eventType ?? "");
    setSubject(template.subject ?? "");
    setBodySms(template.bodySms ?? "");
    setBodyEmail(template.bodyEmail ?? "");
    setPreview(null);
    setTestTo("");
    setOpen(true);
  };

  const onSave = async () => {
    if (!name.trim()) {
      toast.error("Give the template a name.");
      return;
    }
    try {
      setBusy(true);
      const payload = {
        name: name.trim(),
        eventType: (eventType || undefined) as CalendarEventType | undefined,
        subject: subject.trim() || undefined,
        bodySms: bodySms.trim() || undefined,
        bodyEmail: bodyEmail.trim() || undefined,
      };
      if (editingId) {
        await updateReminderTemplate(editingId, payload);
        toast.success("Template updated");
      } else {
        await createReminderTemplate(payload);
        toast.success("Template created");
      }
      setOpen(false);
      resetForm();
      await onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save template");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (template: ReminderTemplate) => {
    try {
      await deleteReminderTemplate(template.id);
      toast.success("Template deleted");
      setConfirm(null);
      await onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    }
  };

  const onPreview = async () => {
    try {
      setBusy(true);
      const result = await previewReminder({
        channels: ["SMS", "EMAIL"],
        bodySms: bodySms.trim() || undefined,
        bodyEmail: bodyEmail.trim() || undefined,
        subject: subject.trim() || undefined,
      });
      setPreview(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not preview");
    } finally {
      setBusy(false);
    }
  };

  const onTest = async () => {
    if (!testTo.trim()) {
      toast.error(
        testChannel === "EMAIL" ? "Enter an email address." : "Enter a phone number.",
      );
      return;
    }
    const body =
      testChannel === "EMAIL" ? preview?.emailBody || bodyEmail : preview?.smsBody || bodySms;
    if (!body) {
      toast.error("Add a message body first.");
      return;
    }
    try {
      setTesting(true);
      const result = await sendTestReminder({
        channel: testChannel,
        to: testTo.trim(),
        body,
        subject: subject.trim() || undefined,
      });
      if (result.ok) toast.success(result.message);
      else toast.error(result.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Test failed");
    } finally {
      setTesting(false);
    }
  };

  const validIds = useMemo(() => new Set(templates.map((t) => t.id)), [templates]);
  const selectedIds = useMemo(
    () => new Set([...selected].filter((id) => validIds.has(id))),
    [selected, validIds],
  );
  const count = selectedIds.size;
  const allSelected =
    templates.length > 0 && templates.every((t) => selectedIds.has(t.id));

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) templates.forEach((t) => next.delete(t.id));
      else templates.forEach((t) => next.add(t.id));
      return next;
    });
  };

  const onBulkDelete = async () => {
    try {
      setBulkBusy(true);
      await bulkDeleteReminderTemplates([...selectedIds]);
      toast.success(`Deleted ${count} template${count === 1 ? "" : "s"}`);
      setSelected(new Set());
      setBulkConfirm(false);
      await onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Templates</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Reusable message bodies. Open a template to drop in tags like{" "}
            <span className="font-mono text-xs">{"{{student.name}}"}</span> — they
            fill in per recipient.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New template
        </Button>
      </div>

      {templates.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={allSelected}
              onCheckedChange={() => toggleAll()}
              aria-label="Select all templates"
            />
            {count > 0 ? `${count} selected` : "Select all"}
          </label>
          {count > 0 ? (
            <div className="ml-auto flex items-center gap-2">
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
          ) : null}
        </div>
      ) : null}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/60" />
              <p className="text-sm font-medium">No templates yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                A template is the message body a reminder sends.
              </p>
              <Button className="mt-2" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                New template
              </Button>
            </div>
          ) : (
            <ul className="divide-y">
              {templates.map((template) => (
                <li
                  key={template.id}
                  className={
                    "flex items-start gap-3 px-4 py-3" +
                    (selectedIds.has(template.id) ? " bg-muted/40" : "")
                  }
                >
                  <Checkbox
                    className="mt-1"
                    checked={selectedIds.has(template.id)}
                    onCheckedChange={() => toggleSelect(template.id)}
                    aria-label={`Select ${template.name}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {template.name}
                      </span>
                      {template.eventType ? (
                        <Badge variant="outline" className="shrink-0 text-[10px]">
                          {EVENT_TYPE_LABELS[template.eventType]}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {template.bodySms || template.bodyEmail || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 pt-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(template)}
                      aria-label="Edit template"
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirm(template)}
                      aria-label="Delete template"
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit template" : "New template"}
            </DialogTitle>
            <DialogDescription>
              Variables are filled per recipient when the reminder sends.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Parents' meeting reminder"
                />
              </div>
              <div className="space-y-2">
                <Label>Event type (optional)</Label>
                <Select
                  value={eventType || "none"}
                  onValueChange={(v) =>
                    setEventType(v === "none" ? "" : (v as CalendarEventType))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Any</SelectItem>
                    {EVENT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
              <MergeTagPicker
                columns="sidebar"
                className="lg:order-2"
                groups={MERGE_TAG_GROUPS}
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
                    placeholder="Hi {{recipient.name}}, {{school.name}} reminds you of {{event.title}} on {{event.date}}."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email subject</Label>
                  <Input
                    {...tags.bind("subject")}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="{{school.name}} — {{event.title}}"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email body</Label>
                  <Textarea
                    {...tags.bind("email")}
                    value={bodyEmail}
                    onChange={(e) => setBodyEmail(e.target.value)}
                    rows={5}
                    placeholder="<p>Dear {{recipient.name}}, …</p>"
                  />
                </div>
              </div>
            </div>

            {preview ? (
              <div className="space-y-3 rounded-xl border bg-muted/30 p-4 text-sm">
                <div>
                  <p className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    SMS preview
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
                      Email preview
                    </p>
                    <p className="font-medium">{preview.emailSubject}</p>
                    <div
                      className="mt-1 text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: preview.emailBody || "" }}
                    />
                  </div>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  Audience: {preview.recipients.total} recipient(s) ·{" "}
                  {preview.recipients.withPhone} with a phone ·{" "}
                  {preview.recipients.withEmail} with email.
                </p>
              </div>
            ) : null}

            <div className="flex flex-wrap items-end gap-2 rounded-xl border p-3">
              <div className="space-y-2">
                <Label className="text-xs">Test channel</Label>
                <Select
                  value={testChannel}
                  onValueChange={(v) => setTestChannel(v as CommunicationChannelType)}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-[12rem] flex-1 space-y-2">
                <Label className="text-xs">
                  {testChannel === "EMAIL" ? "Email" : "Phone"}
                </Label>
                <Input
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                  placeholder={
                    testChannel === "EMAIL" ? "you@school.ac.ke" : "07XX XXX XXX"
                  }
                />
              </div>
              <Button variant="outline" onClick={() => void onTest()} disabled={testing}>
                {testing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send test
              </Button>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => void onPreview()} disabled={busy}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => void onSave()} disabled={busy}>
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingId ? "Save changes" : "Create template"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this template?</AlertDialogTitle>
            <AlertDialogDescription>
              “{confirm?.name}” will be removed. Reminders using it will have no
              message until you re-link one.
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
              Delete {count} template{count === 1 ? "" : "s"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Reminders using them will have no message until you re-link one.
              This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void onBulkDelete();
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
