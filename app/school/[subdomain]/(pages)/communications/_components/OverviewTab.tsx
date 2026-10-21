"use client";

import {
  ArrowRight,
  ArrowUpRight,
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
import { cn } from "@/lib/utils";
import { tp } from "@/lib/portal-tokens";
import type { CommOverview } from "@/lib/school/communicationsHubApi";
import {
  CHANNEL_META,
  formatDateTime,
  formatNumber,
  truncate,
} from "@/lib/school/communicationsHubUtils";
import {
  ChannelPill,
  EmptyState,
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

  const messages = overview?.recentMessages ?? [];
  const rate = overview?.deliveryRate ?? 0;

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
          value={`${rate}%`}
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

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {canCreate ? (
            <section className="tp-reveal relative overflow-hidden rounded-2xl border border-primary/15 bg-primary/[0.045] p-6 sm:p-7">
              <Send
                aria-hidden
                className="pointer-events-none absolute -right-6 -top-6 size-32 -rotate-12 text-primary/[0.06]"
                strokeWidth={1}
              />
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-primary/75">
                Start here
              </p>
              <h2 className="mt-2 font-display text-[1.65rem] leading-[1.1] tracking-[-0.01em] text-foreground text-balance">
                Say it once. Reach everyone.
              </h2>
              <p className="mt-2 max-w-md text-[12.5px] leading-relaxed text-muted-foreground text-pretty">
                Pick who hears it, write it in your own words, and send by SMS, email
                or WhatsApp. Every send is logged and trackable.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onCompose}
                  className="tp-focus inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-[12.5px] font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-colors hover:bg-primary-dark"
                >
                  <Megaphone className="size-4" />
                  New campaign
                </button>
                <span className="flex items-center gap-1.5">
                  {(["SMS", "EMAIL", "WHATSAPP"] as const).map((channel) => (
                    <span
                      key={channel}
                      className={cn(
                        "size-1.5 rounded-full",
                        CHANNEL_META[channel].dot,
                      )}
                      title={CHANNEL_META[channel].label}
                    />
                  ))}
                  <span className="ml-1 text-[10.5px] text-muted-foreground">
                    SMS · Email · WhatsApp
                  </span>
                </span>
              </div>
            </section>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            <ShortcutCard
              icon={BellRing}
              title="Automations"
              description={`${formatNumber(overview?.activeAutomations)} active of ${formatNumber(overview?.totalAutomations)}`}
              onClick={() => onTab("automations")}
            />
            {canReports ? (
              <ShortcutCard
                icon={MessageSquareText}
                title="Delivery history"
                description="Search messages, retry failures"
                onClick={() => onTab("history")}
              />
            ) : null}
            <ShortcutCard
              icon={Users}
              title="Templates"
              description="Reusable wording, safe tags"
              onClick={() => onTab("templates")}
            />
          </div>
        </div>

        <section className={cn(tp.card, "tp-reveal overflow-hidden")}>
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
            <div>
              <h2 className="text-[13.5px] font-semibold text-foreground">Channel health</h2>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                Checked at dispatch time
              </p>
            </div>
            <button
              type="button"
              onClick={() => onTab("settings")}
              className="tp-focus inline-flex items-center gap-1 rounded-full text-[11.5px] font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              Manage
              <ArrowRight className="size-3.5" />
            </button>
          </div>
          <div className="divide-y divide-border/60">
            {(overview?.channelHealth ?? []).map((entry) => {
              const meta = CHANNEL_META[entry.channel];
              const ready = entry.enabled && entry.configured;
              return (
                <div key={entry.channel} className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full", meta.dot)} />
                    <p className="text-[12.5px] font-semibold text-foreground">
                      {meta.label}
                    </p>
                    <span
                      className={cn(
                        "ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        ready
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : entry.enabled
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {ready ? "Ready" : entry.enabled ? "Needs setup" : "Off"}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 pl-4 text-[11px] leading-relaxed text-muted-foreground">
                    {entry.detail}
                  </p>
                </div>
              );
            })}
            {!loading && (overview?.channelHealth?.length ?? 0) === 0 ? (
              <p className="px-5 py-8 text-center text-[12px] text-muted-foreground">
                No channels configured yet.
              </p>
            ) : null}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <section className={cn(tp.card, "tp-reveal overflow-hidden")}>
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
            <div>
              <h2 className="text-[13.5px] font-semibold text-foreground">Recent activity</h2>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                Latest outbox across every channel
              </p>
            </div>
            {canReports ? (
              <button
                type="button"
                onClick={() => onTab("history")}
                className="tp-focus inline-flex items-center gap-1 rounded-full text-[11.5px] font-semibold text-muted-foreground transition-colors hover:text-primary"
              >
                View all
                <ArrowRight className="size-3.5" />
              </button>
            ) : null}
          </div>

          {messages.length > 0 ? (
            <ul className="divide-y divide-border/60">
              {messages.map((message) => (
                <li
                  key={message.id}
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/25"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border/70 bg-muted/40 text-[10.5px] font-semibold text-muted-foreground">
                    {(message.recipientName ?? "R")
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase())
                      .join("") || "R"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-semibold text-foreground">
                      {message.recipientName ?? "Recipient"}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {truncate(message.subject || message.body, 72)}
                    </p>
                  </div>
                  <ChannelPill channel={message.channel} />
                  <span className="hidden shrink-0 text-[10.5px] text-muted-foreground sm:block">
                    {formatDateTime(message.sentAt ?? message.sendAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : loading ? (
            <div className="space-y-3 px-5 py-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="tp-skeleton size-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="tp-skeleton h-3 w-1/3 rounded-full" />
                    <div className="tp-skeleton h-2.5 w-1/2 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={MessageSquareText}
              title="No messages yet"
              description="Your first campaign or automation message will appear here with its delivery status."
            />
          )}
        </section>

        <section className={cn(tp.card, "tp-reveal overflow-hidden")}>
          <div className="border-b border-border/70 px-5 py-4">
            <h2 className="text-[13.5px] font-semibold text-foreground">Delivery</h2>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">Last 30 days</p>
          </div>
          <div className="px-5 py-6">
            <div className="flex items-center gap-5">
              <DeliveryGauge value={rate} />
              <div className="min-w-0 flex-1 space-y-2.5">
                <MiniStat
                  label="Sent"
                  value={formatNumber(overview?.sentLast30Days)}
                />
                <MiniStat
                  label="Delivered"
                  value={formatNumber(overview?.deliveredLast30Days)}
                  tone="text-emerald-700 dark:text-emerald-300"
                />
                <MiniStat
                  label="Failed"
                  value={formatNumber(overview?.failedLast30Days)}
                  tone="text-rose-700 dark:text-rose-300"
                />
              </div>
            </div>

            {overview?.smsLowBalance && canCredits ? (
              <div className="mt-5 flex gap-2 rounded-xl border border-amber-200/80 bg-amber-50/70 px-3 py-2.5 text-[11.5px] leading-relaxed text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
                <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
                <span>
                  SMS balance is low ({formatNumber(overview.smsCreditsAvailable)} left).
                  Email and WhatsApp are unaffected.
                </span>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function ShortcutCard({
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
      className={cn(
        "tp-focus tp-lift group flex flex-col items-start gap-3 rounded-2xl border border-border/90 bg-card p-4 text-left",
        "hover:border-primary/25 hover:shadow-[0_16px_32px_-26px_rgba(20,32,28,0.4)]",
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-muted/45 text-primary transition-colors group-hover:border-primary/20 group-hover:bg-primary/[0.07]">
        <Icon className="size-4" strokeWidth={1.7} />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1 text-[12.5px] font-semibold text-foreground">
          {title}
          <ArrowUpRight className="size-3.5 opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
        </span>
        <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">
          {description}
        </span>
      </span>
    </button>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-border/60 pb-1.5 last:border-0 last:pb-0">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className={cn("tp-num text-[13px] font-semibold", tone ?? "text-foreground")}>
        {value}
      </span>
    </div>
  );
}

function DeliveryGauge({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;

  return (
    <div className="relative size-[88px] shrink-0">
      <svg viewBox="0 0 88 88" className="size-full -rotate-90">
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth="7"
        />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          className="stroke-primary transition-[stroke-dasharray] duration-700"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[1.35rem] leading-none text-foreground">
          {clamped}%
        </span>
        <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/80">
          Delivered
        </span>
      </div>
    </div>
  );
}
