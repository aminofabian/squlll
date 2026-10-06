"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BellRing,
  CalendarDays,
  FileText,
  Loader2,
  Megaphone,
  Send,
  Settings2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  fetchCommunicationSettings,
  fetchRules,
  fetchTemplates,
  seedCommunicationDefaults,
  setReminderRuleEnabled,
  type CommunicationSettings,
  type ReminderRule,
  type ReminderTemplate,
} from "@/lib/school/communicationsApi";
import { CalendarTab } from "./CalendarTab";
import { CampaignsTab } from "./CampaignsTab";
import { LogTab } from "./LogTab";
import { RemindersOverview } from "./RemindersOverview";
import { RulesTab } from "./RulesTab";
import { SettingsTab } from "./SettingsTab";
import { TemplatesTab } from "./TemplatesTab";

type TabId = "rules" | "campaigns" | "calendar" | "templates" | "log" | "settings";

/**
 * Tenant Reminders hub. A single scrollable tab per concern: the school
 * calendar, the reminder rules, message templates, the delivery log and channel
 * settings — styled to match the rest of the school dashboard.
 */
export function RemindersPanel() {
  const [tab, setTab] = useState<TabId>("rules");
  const [settings, setSettings] = useState<CommunicationSettings | null>(null);
  const [templates, setTemplates] = useState<ReminderTemplate[]>([]);
  const [rules, setRules] = useState<ReminderRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);
  const [enablingStarters, setEnablingStarters] = useState(false);
  const [version, setVersion] = useState(0);

  const reloadShared = useCallback(async () => {
    try {
      const [nextSettings, nextTemplates, nextRules] = await Promise.all([
        fetchCommunicationSettings(),
        fetchTemplates(),
        fetchRules(),
      ]);
      setSettings(nextSettings);
      setTemplates(nextTemplates);
      setRules(nextRules);
      setVersion((v) => v + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load reminders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const result = await seedCommunicationDefaults();
        if (result.templates > 0 || result.rules > 0) {
          setSeeded(true);
        }
      } catch {
        /* seeding is best-effort */
      }
      await reloadShared();
    })();
  }, [reloadShared]);

  const activeRules = rules.filter((r) => r.enabled).length;

  const onEnableStarters = async () => {
    const disabled = rules.filter((r) => !r.enabled);
    if (!disabled.length) {
      setSeeded(false);
      return;
    }
    try {
      setEnablingStarters(true);
      for (const rule of disabled) {
        await setReminderRuleEnabled(rule.id, true);
      }
      toast.success(
        `Turned on ${disabled.length} reminder${disabled.length === 1 ? "" : "s"}`,
      );
      setSeeded(false);
      await reloadShared();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not turn on reminders",
      );
    } finally {
      setEnablingStarters(false);
    }
  };

  const tabs: Array<{
    id: TabId;
    label: string;
    icon: typeof BellRing;
    count?: number;
  }> = [
    { id: "rules", label: "Reminders", icon: BellRing, count: rules.length },
    { id: "campaigns", label: "Campaigns", icon: Megaphone },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "templates", label: "Templates", icon: FileText, count: templates.length },
    { id: "log", label: "Delivery log", icon: Send },
    { id: "settings", label: "Settings", icon: Settings2 },
  ];

  return (
    <div>
      <RemindersOverview
        activeCount={activeRules}
        rulesCount={rules.length}
        templatesCount={templates.length}
        version={version}
        onOpenRules={() => setTab("rules")}
        onOpenLog={() => setTab("log")}
      />

      {seeded ? (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          <p className="flex items-start gap-3 text-slate-700 dark:text-slate-200">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              We&apos;ve prepared a few starter reminders and templates for you
              — they&apos;re{" "}
              <span className="font-medium">turned off</span> until you switch
              them on.
            </span>
          </p>
          <Button
            size="sm"
            onClick={() => void onEnableStarters()}
            disabled={enablingStarters}
          >
            {enablingStarters ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Turn on starters
          </Button>
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
        {tabs.map((item) => {
          const Icon = item.icon;
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {typeof item.count === "number" ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {item.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {tab === "rules" ? (
        <RulesTab
          rules={rules}
          templates={templates}
          loading={loading}
          activeCount={activeRules}
          onChanged={reloadShared}
        />
      ) : null}
      {tab === "campaigns" ? <CampaignsTab onChanged={reloadShared} /> : null}
      {tab === "calendar" ? <CalendarTab /> : null}
      {tab === "templates" ? (
        <TemplatesTab
          templates={templates}
          loading={loading}
          onChanged={reloadShared}
        />
      ) : null}
      {tab === "log" ? <LogTab /> : null}
      {tab === "settings" ? (
        <SettingsTab
          settings={settings}
          loading={loading}
          onChanged={reloadShared}
        />
      ) : null}
    </div>
  );
}
