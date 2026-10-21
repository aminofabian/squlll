"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Copy,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteCommTemplate,
  duplicateCommTemplate,
  fetchCommTemplates,
  type CommChannel,
  type CommTemplate,
} from "@/lib/school/communicationsHubApi";
import { channelListLabel, truncate } from "@/lib/school/communicationsHubUtils";
import { TemplateEditor } from "./TemplateEditor";
import {
  ChannelPill,
  EmptyState,
  InlineError,
  LoadingPanel,
  PageSection,
} from "./shared";

const CATEGORY_LABELS: Record<string, string> = {
  GENERAL: "General",
  WELCOME: "Welcome",
  FINANCE: "Finance",
  ACADEMIC: "Academic",
  ATTENDANCE: "Attendance",
  EVENTS: "Events",
};

function channelsFor(template: CommTemplate): CommChannel[] {
  const channels: CommChannel[] = [];
  if (template.bodySms) channels.push("SMS");
  if (template.bodyEmail) channels.push("EMAIL");
  if (template.bodyWhatsApp) channels.push("WHATSAPP");
  return channels;
}

export function TemplatesTab({
  permissions,
  version,
  onChanged,
}: {
  permissions: string[];
  version: number;
  onChanged: () => void;
}) {
  const [templates, setTemplates] = useState<CommTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [editing, setEditing] = useState<CommTemplate | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<CommTemplate | null>(null);

  const canManage = permissions.includes("communications.templates.manage");

  const load = useCallback(async () => {
    try {
      setError(null);
      setTemplates(await fetchCommTemplates());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load templates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch owns the loading state
    void load();
  }, [load, version]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return templates.filter((template) => {
      if (category !== "ALL" && template.category !== category) return false;
      if (!query) return true;
      return (
        template.name.toLowerCase().includes(query) ||
        (template.subject ?? "").toLowerCase().includes(query) ||
        (template.description ?? "").toLowerCase().includes(query)
      );
    });
  }, [templates, search, category]);

  const duplicate = async (template: CommTemplate) => {
    try {
      setBusyId(template.id);
      await duplicateCommTemplate(template.id);
      toast.success("Template duplicated.");
      await load();
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not duplicate");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    if (!confirmDelete) return;
    try {
      setBusyId(confirmDelete.id);
      await deleteCommTemplate(confirmDelete.id);
      toast.success("Template deleted.");
      setConfirmDelete(null);
      await load();
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <PageSection
      title="Templates"
      description="One library of reusable messages. Personalise with merge tags and keep SMS, email and WhatsApp wording in sync."
      action={
        canManage ? (
          <Button
            onClick={() => {
              setEditing(null);
              setEditorOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> New template
          </Button>
        ) : null
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search templates"
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline">{filtered.length} shown</Badge>
      </div>

      {error ? <InlineError message={error} onRetry={() => void load()} /> : null}

      {loading ? (
        <LoadingPanel label="Loading templates…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={templates.length ? "No matching templates" : "No templates yet"}
          description={
            templates.length
              ? "Try another search or category."
              : "Create a reusable message for welcome notes, fee reminders, absence alerts and more."
          }
          action={
            canManage && !templates.length ? (
              <Button
                onClick={() => {
                  setEditing(null);
                  setEditorOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> Create template
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((template) => {
            const channels = channelsFor(template);
            return (
              <div
                key={template.id}
                className="flex flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/25"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {template.name}
                      </p>
                      {template.isDefault ? (
                        <Badge variant="secondary" className="text-[10px]">
                          Starter
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                      {CATEGORY_LABELS[template.category] ?? template.category}
                    </p>
                  </div>
                  {canManage ? (
                    <div className="flex shrink-0 items-center gap-0.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditing(template);
                          setEditorOpen(true);
                        }}
                        disabled={busyId === template.id}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => void duplicate(template)}
                        disabled={busyId === template.id}
                      >
                        {busyId === template.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-rose-600 hover:bg-rose-50"
                        onClick={() => setConfirmDelete(template)}
                        disabled={busyId === template.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : null}
                </div>

                <p className="mt-2 min-h-[2.5rem] text-xs text-muted-foreground">
                  {template.description ||
                    truncate(
                      template.bodySms ?? template.bodyEmail ?? template.bodyWhatsApp ?? "",
                      110,
                    )}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {channels.length ? (
                    channels.map((channel) => (
                      <ChannelPill key={channel} channel={channel} />
                    ))
                  ) : (
                    <span className="text-[11px] text-muted-foreground">No channel bodies</span>
                  )}
                </div>

                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-[11px] text-muted-foreground">
                    {template.variables.length
                      ? `${template.variables.length} variable${template.variables.length === 1 ? "" : "s"}: ${template.variables.slice(0, 4).join(", ")}${template.variables.length > 4 ? "…" : ""}`
                      : "No merge tags"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {channelListLabel(channels)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TemplateEditor
        open={editorOpen}
        initial={editing}
        onClose={() => setEditorOpen(false)}
        onSaved={() => {
          void load();
          onChanged();
        }}
      />

      {confirmDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-lg">
            <h3 className="text-base font-semibold">Delete template?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              “{confirmDelete.name}” will be removed. Campaigns and automations
              already using it keep their rendered content, but you won’t be able
              to pick it again.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
                Keep
              </Button>
              <Button variant="destructive" onClick={() => void remove()}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </PageSection>
  );
}
