"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  ArrowUpRight,
  BellRing,
  FileText,
  LayoutDashboard,
  Loader2,
  Megaphone,
  RefreshCw,
  Send,
  Settings2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { tp } from "@/lib/portal-tokens";
import {
  fetchCommOverview,
  fetchCommPermissions,
  seedCommDefaults,
  type CommCampaign,
  type CommOverview,
  type CommPermissions,
} from "@/lib/school/communicationsHubApi";
import { CHANNEL_META, formatNumber } from "@/lib/school/communicationsHubUtils";
import { AutomationsTab } from "./AutomationsTab";
import { CampaignComposer } from "./CampaignComposer";
import { CampaignsTab } from "./CampaignsTab";
import { HistoryTab } from "./HistoryTab";
import { OverviewTab } from "./OverviewTab";
import { SettingsTab } from "./SettingsTab";
import { TemplatesTab } from "./TemplatesTab";
import { InlineError } from "./shared";

/**
 * The admin shell's <main> has no padding of its own, so this page supplies the
 * full page gutter at every breakpoint.
 */
const PAGE =
  "mx-auto w-full max-w-[1180px] px-5 pb-24 pt-6 sm:px-8 sm:pt-9 lg:px-8 lg:pb-14 lg:pt-8";

type TabId =
  | "overview"
  | "campaigns"
  | "automations"
  | "templates"
  | "history"
  | "settings";

const TABS: Array<{
  id: TabId;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: string;
}> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "campaigns", label: "Campaigns", icon: Megaphone },
  { id: "automations", label: "Automations", icon: BellRing },
  { id: "templates", label: "Templates", icon: FileText },
  {
    id: "history",
    label: "History & delivery",
    icon: Send,
    permission: "REPORTS_VIEW",
  },
  { id: "settings", label: "Settings", icon: Settings2 },
];

export function CommunicationsHub() {
  const [permissions, setPermissions] = useState<CommPermissions | null>(null);
  const [overview, setOverview] = useState<CommOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("overview");
  const [version, setVersion] = useState(0);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CommCampaign | null>(null);

  const loadPermissions = useCallback(async () => {
    try {
      setError(null);
      const [nextPermissions, nextOverview] = await Promise.all([
        fetchCommPermissions(),
        fetchCommOverview(),
      ]);
      setPermissions(nextPermissions);
      setOverview(nextOverview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load communications");
    } finally {
      setLoading(false);
      setOverviewLoading(false);
    }
  }, []);

  const refreshOverview = useCallback(async () => {
    try {
      setOverview(await fetchCommOverview());
      setVersion((value) => value + 1);
    } catch {
      // A failed overview refresh should not blank the workspace.
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await loadPermissions();
      try {
        await seedCommDefaults();
        await refreshOverview();
      } catch {
        // Starter seeding is best-effort; the UI remains usable.
      }
    })();
  }, [loadPermissions, refreshOverview]);

  const allowedTabs = useMemo(() => {
    const granted = permissions?.permissions ?? [];
    return TABS.filter(
      (entry) => !entry.permission || granted.includes(entry.permission as never),
    );
  }, [permissions]);

  const activeTab = useMemo<TabId>(() => {
    return allowedTabs.some((entry) => entry.id === tab)
      ? tab
      : allowedTabs[0]?.id ?? "overview";
  }, [allowedTabs, tab]);

  const canCreate = permissions?.permissions.includes("CAMPAIGNS_CREATE");
  const canCredits = permissions?.permissions.includes("CREDITS_VIEW");

  const openComposer = (campaign?: CommCampaign | null) => {
    if (!canCreate) {
      toast.error("You do not have permission to create campaigns.");
      return;
    }
    setEditingCampaign(campaign ?? null);
    setComposerOpen(true);
  };

  if (loading) {
    return <HubSkeleton />;
  }

  if (!permissions?.permissions.includes("VIEW")) {
    return (
      <div className={PAGE}>
        <div className={cn(tp.card, "mx-auto mt-6 max-w-xl px-6 py-14 text-center sm:px-10")}>
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300">
            <ShieldAlert className="size-5" strokeWidth={1.7} />
          </span>
          <h1 className="mt-4 font-display text-[1.6rem] leading-tight text-foreground">
            Communications access
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground text-pretty">
            Your school role doesn&apos;t include the communications workspace. Ask a
            school administrator to grant communications access.
          </p>
        </div>
      </div>
    );
  }

  const channels = overview?.channelHealth ?? [];

  return (
    <div className={PAGE}>
      <div className={tp.stack}>
        {/* Dispatch hero */}
        <section className="tp-reveal relative overflow-hidden rounded-3xl bg-[#0d2b23] text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_88%_-10%,rgba(58,160,133,0.45),transparent_58%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.22]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />

          <div className="relative p-6 sm:p-9 lg:p-10">
            <div className="flex items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-white/55">
                <Sparkles className="size-3.5" strokeWidth={1.8} />
                Communications studio
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Unified
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h1 className="font-display text-[2.3rem] leading-[1.02] tracking-[-0.02em] text-white text-balance sm:text-[2.9rem]">
                  Every message, one desk.
                </h1>
                <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-white/65 text-pretty">
                  Campaigns, automations and delivery at a glance — SMS, email,
                  WhatsApp and in-app, with credits and permissions handled.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-2.5">
                  {canCreate ? (
                    <button
                      type="button"
                      onClick={() => openComposer(null)}
                      className="tp-focus inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-[13px] font-semibold text-[#0d2b23] transition-colors hover:bg-white/90"
                    >
                      <Megaphone className="size-4" />
                      New campaign
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void refreshOverview()}
                    disabled={overviewLoading}
                    className="tp-focus inline-flex h-10 items-center gap-2 rounded-full border border-white/20 px-4 text-[13px] font-semibold text-white/80 transition-colors hover:border-white/35 hover:text-white disabled:opacity-60"
                  >
                    {overviewLoading ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="size-3.5" />
                    )}
                    Refresh
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5 border-t border-white/10 pt-6 sm:gap-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                <HeroMetric
                  label="Queued now"
                  value={formatNumber(overview?.queued)}
                  hint={`${formatNumber(overview?.scheduledCampaigns)} scheduled`}
                />
                <HeroMetric
                  label="Sent · 30d"
                  value={formatNumber(overview?.sentLast30Days)}
                  hint={`${overview?.deliveryRate ?? 0}% inbox-confirmed`}
                />
                <HeroMetric
                  label={canCredits ? "SMS credits" : "Automations"}
                  value={
                    canCredits
                      ? formatNumber(overview?.smsCreditsAvailable)
                      : formatNumber(overview?.activeAutomations)
                  }
                  hint={
                    canCredits
                      ? overview?.smsLowBalance
                        ? "Low balance"
                        : "Available"
                      : "Active now"
                  }
                />
              </div>
            </div>

            {channels.length > 0 ? (
              <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-white/10 pt-5">
                {channels.map((entry) => {
                  const meta = CHANNEL_META[entry.channel];
                  return (
                    <span
                      key={entry.channel}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold",
                        entry.enabled
                          ? "border-white/15 bg-white/[0.06] text-white/80"
                          : "border-white/10 text-white/35",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          entry.configured && entry.enabled ? meta.dot : "bg-white/30",
                        )}
                      />
                      {meta.label}
                    </span>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setTab("settings")}
                  className="tp-focus ml-auto inline-flex items-center gap-1 rounded-full text-[11px] font-semibold text-white/55 transition-colors hover:text-white"
                >
                  Channel settings
                  <ArrowUpRight className="size-3.5" />
                </button>
              </div>
            ) : null}
          </div>
        </section>

        {/* Section rail */}
        <div
          className="tp-reveal -mx-1 overflow-x-auto px-1 pb-1"
          style={{ "--tp-delay": 1 } as CSSProperties}
        >
          <nav
            className="inline-flex min-w-full items-center gap-1 rounded-full border border-border/80 bg-card p-1.5 shadow-[0_1px_2px_rgba(20,32,28,0.04)] sm:min-w-0"
            aria-label="Communications sections"
          >
            {allowedTabs.map((entry) => {
              const Icon = entry.icon;
              const active = activeTab === entry.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setTab(entry.id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "tp-focus inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-colors",
                    active
                      ? "bg-primary/[0.09] text-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.8} />
                  {entry.label}
                </button>
              );
            })}
          </nav>
        </div>

        {error ? (
          <InlineError message={error} onRetry={() => void loadPermissions()} />
        ) : null}

        <div>
          {activeTab === "overview" ? (
            <OverviewTab
              overview={overview}
              loading={overviewLoading}
              permissions={permissions.permissions}
              onCompose={() => openComposer(null)}
              onTab={(next) => setTab(next)}
            />
          ) : null}
          {activeTab === "campaigns" ? (
            <CampaignsTab
              permissions={permissions.permissions}
              version={version}
              onCompose={openComposer}
              onChanged={() => void refreshOverview()}
            />
          ) : null}
          {activeTab === "automations" ? (
            <AutomationsTab
              permissions={permissions.permissions}
              version={version}
              onChanged={() => void refreshOverview()}
            />
          ) : null}
          {activeTab === "templates" ? (
            <TemplatesTab
              permissions={permissions.permissions}
              version={version}
              onChanged={() => void refreshOverview()}
            />
          ) : null}
          {activeTab === "history" ? (
            <HistoryTab permissions={permissions.permissions} />
          ) : null}
          {activeTab === "settings" ? (
            <SettingsTab
              permissions={permissions.permissions}
              permissionsCatalog={permissions.catalog}
              overview={overview}
              onChanged={() => void refreshOverview()}
            />
          ) : null}
        </div>
      </div>

      <CampaignComposer
        open={composerOpen}
        initial={editingCampaign}
        permissions={permissions.permissions}
        onClose={() => {
          setComposerOpen(false);
          setEditingCampaign(null);
        }}
        onSaved={() => {
          void refreshOverview();
        }}
      />
    </div>
  );
}

function HeroMetric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
        {label}
      </p>
      <p className="tp-num mt-1.5 text-[1.45rem] font-semibold leading-none text-white">
        {value}
      </p>
      <p className="mt-1 truncate text-[10.5px] text-white/45">{hint}</p>
    </div>
  );
}

function HubSkeleton() {
  return (
    <div className={PAGE}>
      <div className={tp.stack}>
        <div className="tp-skeleton h-[260px] w-full rounded-3xl" />
        <div className="tp-skeleton h-12 w-full max-w-2xl rounded-full" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="tp-skeleton h-[110px] rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="tp-skeleton h-[260px] rounded-2xl" />
          <div className="tp-skeleton h-[260px] rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
