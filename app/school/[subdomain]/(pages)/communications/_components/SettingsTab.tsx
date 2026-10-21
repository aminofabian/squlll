"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Save,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  fetchCommAuditLogs,
  fetchCommSettings,
  updateCommSettings,
  type CommAuditEntry,
  type CommOverview,
  type CommSettings,
} from "@/lib/school/communicationsHubApi";
import {
  CHANNEL_META,
  formatDateTime,
} from "@/lib/school/communicationsHubUtils";
import {
  ChannelPill,
  InlineError,
  LoadingPanel,
  PageSection,
} from "./shared";

export function SettingsTab({
  permissions,
  permissionsCatalog,
  overview,
  onChanged,
}: {
  permissions: string[];
  permissionsCatalog: Array<{
    key: string;
    label: string;
    description: string;
    group: string;
  }>;
  overview: CommOverview | null;
  onChanged: () => void;
}) {
  const [settings, setSettings] = useState<CommSettings | null>(null);
  const [audit, setAudit] = useState<CommAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canManage = permissions.includes("SETTINGS_MANAGE");
  const canAudit = permissions.includes("AUDIT_VIEW");

  const load = useCallback(async () => {
    try {
      setError(null);
      const [nextSettings, auditRows] = await Promise.all([
        fetchCommSettings(),
        canAudit ? fetchCommAuditLogs(30) : Promise.resolve([]),
      ]);
      setSettings(nextSettings);
      setAudit(auditRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load settings");
    } finally {
      setLoading(false);
    }
  }, [canAudit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch owns the loading state
    void load();
  }, [load]);

  const patch = (update: Partial<CommSettings>) => {
    setSettings((current) => (current ? { ...current, ...update } : current));
  };

  const save = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      setError(null);
      const saved = await updateCommSettings(settings);
      setSettings(saved);
      toast.success("Communication settings saved.");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageSection
      title="Channel settings"
      description="Control what can send, when it can send and how much SMS the school can use. Platform credentials are managed by your provider."
      action={
        canManage ? (
          <Button onClick={() => void save()} disabled={saving || !settings}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save settings
          </Button>
        ) : null
      }
    >
      {error ? <InlineError message={error} onRetry={() => void load()} /> : null}

      {loading ? (
        <LoadingPanel label="Loading settings…" />
      ) : settings ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            <div>
              <h3 className="text-sm font-semibold">Channels</h3>
              <p className="text-xs text-muted-foreground">
                A disabled channel is skipped at dispatch time, even if a campaign
                selected it.
              </p>
            </div>
            {(
              [
                ["emailEnabled", "Email", "EMAIL"],
                ["smsEnabled", "SMS", "SMS"],
                ["whatsappEnabled", "WhatsApp", "WHATSAPP"],
                ["inAppEnabled", "In-app", "IN_APP"],
              ] as const
            ).map(([key, label, channel]) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${CHANNEL_META[channel].dot}`} />
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {overview?.channelHealth.find((entry) => entry.channel === channel)?.detail ??
                        "Channel health unavailable."}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings[key]}
                  onCheckedChange={(checked) => patch({ [key]: checked })}
                  disabled={!canManage}
                />
              </div>
            ))}
          </div>

          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            <div>
              <h3 className="text-sm font-semibold">Quiet hours & limits</h3>
              <p className="text-xs text-muted-foreground">
                SMS and WhatsApp are deferred during quiet hours. The daily SMS
                cap protects your credit balance.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Quiet hours start</Label>
                <Input
                  type="time"
                  value={settings.quietHoursStart ?? ""}
                  onChange={(event) =>
                    patch({ quietHoursStart: event.target.value || null })
                  }
                  disabled={!canManage}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Quiet hours end</Label>
                <Input
                  type="time"
                  value={settings.quietHoursEnd ?? ""}
                  onChange={(event) =>
                    patch({ quietHoursEnd: event.target.value || null })
                  }
                  disabled={!canManage}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Daily SMS cap</Label>
                <Input
                  type="number"
                  min={0}
                  value={settings.dailySmsCap ?? ""}
                  onChange={(event) =>
                    patch({
                      dailySmsCap: event.target.value
                        ? Number(event.target.value)
                        : null,
                    })
                  }
                  disabled={!canManage}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Timezone</Label>
                <Input
                  value={settings.timezone}
                  onChange={(event) => patch({ timezone: event.target.value })}
                  disabled={!canManage}
                />
              </div>
              <div className="space-y-1.5">
                <Label>SMS sender name</Label>
                <Input
                  value={settings.smsSenderName ?? ""}
                  onChange={(event) =>
                    patch({ smsSenderName: event.target.value || null })
                  }
                  placeholder="SCHOOL"
                  disabled={!canManage}
                />
              </div>
              <div className="space-y-1.5">
                <Label>WhatsApp sender label</Label>
                <Input
                  value={settings.whatsappSenderName ?? ""}
                  onChange={(event) =>
                    patch({ whatsappSenderName: event.target.value || null })
                  }
                  placeholder="School office"
                  disabled={!canManage}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Opt-out footer (SMS)</Label>
                <Input
                  value={settings.optOutFooter ?? ""}
                  onChange={(event) =>
                    patch({ optOutFooter: event.target.value || null })
                  }
                  placeholder="Reply STOP to opt out."
                  disabled={!canManage}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-card p-5">
            <div>
              <h3 className="text-sm font-semibold">Channel health</h3>
              <p className="text-xs text-muted-foreground">
                A channel can be enabled but still unconfigured at platform level.
              </p>
            </div>
            {(overview?.channelHealth ?? []).map((entry) => (
              <div
                key={entry.channel}
                className="flex items-start justify-between gap-3 rounded-lg border border-border px-3 py-2"
              >
                <div className="min-w-0">
                  <ChannelPill channel={entry.channel} />
                  <p className="mt-1 text-[11px] text-muted-foreground">{entry.detail}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1 text-[11px]">
                  {entry.enabled ? (
                    <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                      Enabled
                    </Badge>
                  ) : (
                    <Badge variant="outline">Off</Badge>
                  )}
                  {entry.configured ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-500" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Your permissions</h3>
            </div>
            <div className="space-y-1.5">
              {permissionsCatalog.map((entry) => {
                const granted = permissions.includes(entry.key);
                return (
                  <div key={entry.key} className="flex items-start gap-2 text-xs">
                    {granted ? (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    ) : (
                      <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                    )}
                    <div>
                      <p className={granted ? "font-medium" : "text-muted-foreground"}>
                        {entry.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {entry.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {canAudit ? (
            <div className="space-y-3 rounded-xl border border-border bg-card p-5 lg:col-span-2">
              <div>
                <h3 className="text-sm font-semibold">Recent audit trail</h3>
                <p className="text-xs text-muted-foreground">
                  Who composed, sent, cancelled or changed communications.
                </p>
              </div>
              {audit.length ? (
                <div className="space-y-1.5">
                  {audit.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-1.5 text-xs last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">
                          {entry.action.replaceAll("_", " ").toLowerCase()}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {entry.actorName ?? "System"}
                          {entry.actorRole ? ` · ${entry.actorRole}` : ""}
                          {entry.entityType ? ` · ${entry.entityType}` : ""}
                        </p>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDateTime(entry.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No audit entries yet.</p>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </PageSection>
  );
}
