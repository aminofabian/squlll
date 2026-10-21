"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  fetchCommOverview,
  fetchCommPermissions,
  seedCommDefaults,
  type CommCampaign,
  type CommOverview,
  type CommPermissions,
} from "@/lib/school/communicationsHubApi";
import { AutomationsTab } from "./AutomationsTab";
import { CampaignComposer } from "./CampaignComposer";
import { CampaignsTab } from "./CampaignsTab";
import { HistoryTab } from "./HistoryTab";
import { OverviewTab } from "./OverviewTab";
import { SettingsTab } from "./SettingsTab";
import { TemplatesTab } from "./TemplatesTab";
import { InlineError, LoadingPanel } from "./shared";

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

  const canCreate = permissions?.permissions.includes(
    "CAMPAIGNS_CREATE",
  );

  const openComposer = (campaign?: CommCampaign | null) => {
    if (!canCreate) {
      toast.error("You do not have permission to create campaigns.");
      return;
    }
    setEditingCampaign(campaign ?? null);
    setComposerOpen(true);
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <LoadingPanel label="Opening communications…" />
      </div>
    );
  }

  if (!permissions?.permissions.includes("VIEW")) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="mt-4 text-lg font-semibold">Communications access</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your school role does not include the communications workspace. Ask a
            school administrator to grant communications access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">Communications</h1>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" /> Unified
            </Badge>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Automated notifications and targeted campaigns across SMS, email and
            WhatsApp — with credits, permissions and delivery reporting in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => void refreshOverview()}
            disabled={overviewLoading}
          >
            {overviewLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
          {canCreate ? (
            <Button onClick={() => openComposer(null)}>
              <Megaphone className="h-4 w-4" /> New campaign
            </Button>
          ) : null}
        </div>
      </header>

      {error ? (
        <div className="mt-4">
          <InlineError message={error} onRetry={() => void loadPermissions()} />
        </div>
      ) : null}

      <nav className="mt-6 flex flex-wrap gap-1 border-b border-border">
        {allowedTabs.map((entry) => {
          const Icon = entry.icon;
          const active = activeTab === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => setTab(entry.id)}
              className={cn(
                "-mb-px inline-flex items-center gap-2 border-b-2 px-3.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {entry.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-6">
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
