"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BellRing,
  Copy,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
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
import { Switch } from "@/components/ui/switch";
import {
  fetchCommAutomationCatalog,
  fetchCommAutomations,
  fetchCommTemplates,
  toggleCommAutomation,
  duplicateCommAutomation,
  deleteCommAutomation,
  seedCommDefaults,
  type CommAutomation,
  type CommTemplate,
  type CommTrigger,
} from "@/lib/school/communicationsHubApi";
import {
  CHANNEL_META,
  formatRelative,
  formatNumber,
} from "@/lib/school/communicationsHubUtils";
import { AutomationEditor } from "./AutomationEditor";
import {
  ChannelPill,
  EmptyState,
  InlineError,
  LoadingPanel,
  PageSection,
} from "./shared";

export function AutomationsTab({
  permissions,
  version,
  onChanged,
}: {
  permissions: string[];
  version: number;
  onChanged: () => void;
}) {
  const [automations, setAutomations] = useState<CommAutomation[]>([]);
  const [catalog, setCatalog] = useState<CommTrigger[]>([]);
  const [templates, setTemplates] = useState<CommTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<CommAutomation | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<CommAutomation | null>(null);

  const canManage = permissions.includes("AUTOMATIONS_MANAGE");

  const load = useCallback(async () => {
    try {
      setError(null);
      const [rows, triggerCatalog, templateRows] = await Promise.all([
        fetchCommAutomations(),
        fetchCommAutomationCatalog(),
        fetchCommTemplates(),
      ]);
      setAutomations(rows);
      setCatalog(triggerCatalog);
      setTemplates(templateRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load automations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch owns the loading state
    void load();
  }, [load, version]);

  const triggerByType = useMemo(
    () => new Map(catalog.map((entry) => [entry.type, entry])),
    [catalog],
  );
  const active = automations.filter((automation) => automation.enabled).length;

  const toggle = async (automation: CommAutomation, enabled: boolean) => {
    try {
      setBusyId(automation.id);
      const updated = await toggleCommAutomation(automation.id, enabled);
      setAutomations((rows) =>
        rows.map((row) => (row.id === updated.id ? updated : row)),
      );
      toast.success(enabled ? "Automation enabled." : "Automation paused.");
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update automation");
    } finally {
      setBusyId(null);
    }
  };

  const duplicate = async (automation: CommAutomation) => {
    try {
      setBusyId(automation.id);
      await duplicateCommAutomation(automation.id);
      toast.success("Automation duplicated (paused).");
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
      await deleteCommAutomation(confirmDelete.id);
      toast.success("Automation deleted.");
      setConfirmDelete(null);
      await load();
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setBusyId(null);
    }
  };

  const seed = async () => {
    try {
      setSeeding(true);
      const result = await seedCommDefaults();
      toast.success(
        result.automations
          ? `${result.automations} starter automation${result.automations === 1 ? "" : "s"} added (paused).`
          : "Starter automations are already set up.",
      );
      await load();
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add starters");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <PageSection
      title="Automated notifications"
      description="Messages that fire when something happens: a teacher joins, a student enrols, a payment lands, attendance is marked or a timetable is published."
      action={
        canManage ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void seed()} disabled={seeding}>
              {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Add starters
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                setEditorOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> New automation
            </Button>
          </div>
        ) : null
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="gap-1">
          <Zap className="h-3 w-3" /> {active} active
        </Badge>
        <Badge variant="outline">{automations.length} configured</Badge>
        <Badge variant="outline">{catalog.length} available triggers</Badge>
      </div>

      {error ? <InlineError message={error} onRetry={() => void load()} /> : null}

      {loading ? (
        <LoadingPanel label="Loading automations…" />
      ) : automations.length === 0 ? (
        <EmptyState
          icon={BellRing}
          title="No automations yet"
          description="Add the starter pack to get a reviewed set of triggers, then switch on the ones your school needs."
          action={
            canManage ? (
              <Button onClick={() => void seed()} disabled={seeding}>
                {seeding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Add starter automations
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3">
          {automations.map((automation) => {
            const trigger = triggerByType.get(automation.eventType);
            const busy = busyId === automation.id;
            return (
              <div
                key={automation.id}
                className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/25"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {automation.name}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {trigger?.group ?? "Event"} · {trigger?.label ?? automation.eventType}
                      </Badge>
                      {automation.enabled ? (
                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Paused</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {automation.description || trigger?.description || "No description"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {automation.channels.map((channel) => (
                        <ChannelPill key={channel} channel={channel} />
                      ))}
                      <span className="text-[11px] text-muted-foreground">
                        {automation.templateName ?? "No template"} ·{" "}
                        {automation.delayMinutes
                          ? `${automation.delayMinutes}m delay`
                          : "immediate"}{" "}
                        · {formatNumber(automation.sentLast30Days)} sent in 30d
                        {automation.lastRunAt
                          ? ` · last ${formatRelative(automation.lastRunAt)}`
                          : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <div className="mr-2 flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">
                        {automation.enabled ? "On" : "Off"}
                      </span>
                      <Switch
                        checked={automation.enabled}
                        onCheckedChange={(checked) => void toggle(automation, checked)}
                        disabled={!canManage || busy}
                      />
                    </div>
                    {canManage ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditing(automation);
                            setEditorOpen(true);
                          }}
                          disabled={busy}
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void duplicate(automation)}
                          disabled={busy}
                        >
                          {busy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-600 hover:bg-rose-50"
                          onClick={() => setConfirmDelete(automation)}
                          disabled={busy}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {catalog.length ? (
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Trigger catalogue
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.map((entry) => (
              <div key={entry.type} className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs font-semibold text-foreground">{entry.label}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  {entry.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {entry.defaultChannels.map((channel) => (
                    <span
                      key={channel}
                      className="rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {CHANNEL_META[channel].label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <AutomationEditor
        open={editorOpen}
        initial={editing}
        catalog={catalog}
        templates={templates}
        onClose={() => setEditorOpen(false)}
        onSaved={() => {
          void load();
          onChanged();
        }}
      />

      <AlertDialog
        open={Boolean(confirmDelete)}
        onOpenChange={(next) => !next && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete automation?</AlertDialogTitle>
            <AlertDialogDescription>
              “{confirmDelete?.name}” will stop firing. Messages already queued are
              unaffected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => void remove()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageSection>
  );
}
