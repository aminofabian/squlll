"use client";

import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  CreditCard,
  Inbox,
  Megaphone,
  MessageSquareText,
  Send,
  Sparkles,
  TriangleAlert,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CommOverview } from "@/lib/school/communicationsHubApi";
import {
  CHANNEL_META,
  deliveryTone,
  formatDateTime,
  formatNumber,
  truncate,
} from "@/lib/school/communicationsHubUtils";
import {
  ChannelPill,
  EmptyState,
  PageSection,
  ProgressBar,
  StatCard,
} from "./shared";

type TabId =
  | "overview"
  | "campaigns"
  | "automations"
  | "templates"
  | "history"
  | "settings";

export function OverviewTab({
  overview,
  loading,
  permissions,
  onCompose,
  onTab,
}: {
  overview: CommOverview | null;
  loading: boolean;
  permissions: string[];
  onCompose: () => void;
  onTab: (tab: TabId) => void;
}) {
  const canCreate = permissions.includes("CAMPAIGNS_CREATE");
  const canReports = permissions.includes("REPORTS_VIEW");
  const canCredits = permissions.includes("CREDITS_VIEW");

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Sent · 30 days"
          value={formatNumber(overview?.sentLast30Days)}
          hint={`${formatNumber(overview?.campaignsSentLast30Days)} campaigns completed`}
          icon={Send}
          loading={loading}
        />
        <StatCard
          label="Confirmed delivery"
          value={`${overview?.deliveryRate ?? 0}%`}
          hint={`${formatNumber(overview?.deliveredLast30Days)} provider-confirmed`}
          icon={CheckCircle2}
          tone="positive"
          loading={loading}
        />
        <StatCard
          label="Queued now"
          value={formatNumber(overview?.queued)}
          hint={`${formatNumber(overview?.scheduledCampaigns)} scheduled campaigns`}
          icon={Inbox}
          tone={overview?.queued ? "warning" : "default"}
          loading={loading}
        />
        {canCredits ? (
          <StatCard
            label="SMS credits"
            value={formatNumber(overview?.smsCreditsAvailable)}
            hint={
              overview?.smsLowBalance
                ? "Low balance — top up or use email/WhatsApp"
                : overview?.smsMeteringEnabled
                  ? "Available message credits"
                  : "Metering is off platform-wide"
            }
            icon={CreditCard}
            tone={overview?.smsLowBalance ? "danger" : "default"}
            loading={loading}
          />
        ) : (
          <StatCard
            label="Automations active"
            value={formatNumber(overview?.activeAutomations)}
            hint={`${formatNumber(overview?.totalAutomations)} configured`}
            icon={Sparkles}
            loading={loading}
          />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" /> Quick actions
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Start with a broadcast, review your automations or check delivery.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {canCreate ? (
              <ActionTile
                icon={Megaphone}
                title="Compose a campaign"
                description="SMS, email and WhatsApp to a targeted audience."
                onClick={onCompose}
              />
            ) : null}
            <ActionTile
              icon={BellRing}
              title="Automated notifications"
              description={`${formatNumber(overview?.activeAutomations)} active of ${formatNumber(overview?.totalAutomations)}`}
              onClick={() => onTab("automations")}
            />
            {canReports ? (
              <ActionTile
                icon={MessageSquareText}
                title="Delivery history"
                description="Search every message and retry failures."
                onClick={() => onTab("history")}
              />
            ) : null}
            <ActionTile
              icon={Users}
              title="Templates"
              description="Reusable wording with safe merge tags."
              onClick={() => onTab("templates")}
            />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Channel health</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Enabled and configured status at dispatch time.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onTab("settings")}>
              Manage <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {(overview?.channelHealth ?? []).map((entry) => (
              <div
                key={entry.channel}
                className="flex items-start justify-between gap-3 rounded-lg border border-border px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${CHANNEL_META[entry.channel].dot}`}
                    />
                    <p className="text-xs font-medium">{CHANNEL_META[entry.channel].label}</p>
                    {!entry.enabled ? (
                      <Badge variant="outline" className="text-[10px]">
                        Off
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                    {entry.detail}
                  </p>
                </div>
                {entry.configured ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <TriangleAlert className="h-4 w-4 shrink-0 text-amber-500" />
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <PageSection
          title="Recent messages"
          description="The latest outbox activity across every channel."
          action={
            canReports ? (
              <Button variant="ghost" size="sm" onClick={() => onTab("history")}>
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : null
          }
        >
          {overview?.recentMessages?.length ? (
            <div className="divide-y divide-border rounded-xl border border-border bg-card">
              {overview.recentMessages.map((message) => (
                <div
                  key={message.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {message.recipientName ?? "Recipient"}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {truncate(message.subject || message.body, 80)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChannelPill channel={message.channel} />
                    <span className="text-[11px] text-muted-foreground">
                      {formatDateTime(message.sentAt ?? message.sendAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={MessageSquareText}
              title="No messages yet"
              description="Your first campaign or automation message will appear here with delivery status."
            />
          )}
        </PageSection>

        <PageSection
          title="Delivery overview"
          description="Last 30 days across channels."
        >
          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Confirmed delivery</span>
              <span className={`font-semibold ${deliveryTone(overview?.deliveryRate ?? 0)}`}>
                {overview?.deliveryRate ?? 0}%
              </span>
            </div>
            <ProgressBar
              value={overview?.deliveredLast30Days ?? 0}
              total={overview?.sentLast30Days || 1}
              tone="bg-emerald-500"
            />
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-muted/40 p-2">
                <p className="text-muted-foreground">Sent</p>
                <p className="text-base font-semibold">
                  {formatNumber(overview?.sentLast30Days)}
                </p>
              </div>
              <div className="rounded-lg bg-muted/40 p-2">
                <p className="text-muted-foreground">Failed</p>
                <p className="text-base font-semibold text-rose-600">
                  {formatNumber(overview?.failedLast30Days)}
                </p>
              </div>
              <div className="rounded-lg bg-muted/40 p-2">
                <p className="text-muted-foreground">Delivered</p>
                <p className="text-base font-semibold text-emerald-600">
                  {formatNumber(overview?.deliveredLast30Days)}
                </p>
              </div>
              <div className="rounded-lg bg-muted/40 p-2">
                <p className="text-muted-foreground">Active automations</p>
                <p className="text-base font-semibold">
                  {formatNumber(overview?.activeAutomations)}
                </p>
              </div>
            </div>
            {overview?.smsLowBalance && canCredits ? (
              <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                SMS balance is low ({formatNumber(overview.smsCreditsAvailable)} left).
                Email and WhatsApp are unaffected.
              </div>
            ) : null}
          </div>
        </PageSection>
      </div>
    </div>
  );
}

function ActionTile({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: typeof Megaphone;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-start gap-3 rounded-lg border border-border bg-background p-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/[0.03]"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1 text-sm font-medium text-foreground">
          {title}
          <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
        <span className="mt-0.5 block text-[11px] text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  );
}
