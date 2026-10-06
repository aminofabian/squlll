"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BellRing,
  CalendarClock,
  FileText,
  Mail,
  MessageSquareText,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  fetchSmsCreditBalance,
  type SmsCreditBalance,
} from "@/lib/school/smsCreditsApi";
import {
  fetchUpcomingScheduledMessages,
  type ScheduledMessage,
} from "@/lib/school/communicationsApi";
import { CHANNEL_LABELS } from "./labels";

function relativeWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diff = date.getTime() - Date.now();
  if (diff < 0) return "now";
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `in ${hours}h`;
  const days = Math.round(hours / 24);
  return days === 1 ? "tomorrow" : `in ${days} days`;
}

function formatWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ChannelIcon({ channel }: { channel: ScheduledMessage["channel"] }) {
  if (channel === "EMAIL") return <Mail className="h-3.5 w-3.5" />;
  if (channel === "IN_APP") return <BellRing className="h-3.5 w-3.5" />;
  return <Smartphone className="h-3.5 w-3.5" />;
}

function Tile({
  icon: Icon,
  label,
  value,
  tone = "text-foreground",
  onClick,
}: {
  icon: typeof BellRing;
  label: string;
  value: string;
  tone?: string;
  onClick?: () => void;
}) {
  const body = (
    <>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <p className={cn("mt-1 text-lg font-semibold leading-none", tone)}>{value}</p>
    </>
  );
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/40"
      >
        {body}
      </button>
    );
  }
  return <div className="rounded-xl border bg-card px-4 py-3">{body}</div>;
}

/**
 * At-a-glance summary for the Reminders hub: how many reminders are live, the
 * next send, remaining SMS credit, and a slim "next up" queue.
 */
export function RemindersOverview({
  activeCount,
  rulesCount,
  templatesCount,
  version,
  onOpenRules,
  onOpenLog,
}: {
  activeCount: number;
  rulesCount: number;
  templatesCount: number;
  version: number;
  onOpenRules?: () => void;
  onOpenLog?: () => void;
}) {
  const [balance, setBalance] = useState<SmsCreditBalance | null>(null);
  const [upcoming, setUpcoming] = useState<ScheduledMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [nextBalance, nextUpcoming] = await Promise.all([
        fetchSmsCreditBalance().catch(() => null),
        fetchUpcomingScheduledMessages(4).catch(() => []),
      ]);
      setBalance(nextBalance);
      setUpcoming(nextUpcoming);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load, version]);

  const nextSend = upcoming[0];

  return (
    <div className="mb-6 space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile
          icon={BellRing}
          label="Active reminders"
          value={loading ? "…" : String(activeCount)}
          tone={activeCount > 0 ? "text-primary" : undefined}
          onClick={onOpenRules}
        />
        <Tile
          icon={CalendarClock}
          label="Next send"
          value={
            loading
              ? "…"
              : nextSend
                ? relativeWhen(nextSend.sendAt)
                : "None yet"
          }
          onClick={onOpenLog}
        />
        <Tile
          icon={FileText}
          label="Templates"
          value={loading ? "…" : String(templatesCount)}
        />
        <Tile
          icon={MessageSquareText}
          label="SMS balance"
          value={
            loading
              ? "…"
              : balance
                ? `${balance.available}`
                : "—"
          }
          tone={balance?.lowBalance ? "text-amber-600" : undefined}
        />
      </div>

      {loading ? (
        <Skeleton className="h-16 w-full" />
      ) : rulesCount === 0 ? null : upcoming.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Nothing queued yet — reminders are added automatically as dates approach.
        </p>
      ) : (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Next up
            </span>
            {upcoming.map((row) => (
              <span
                key={row.id}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <span className="flex items-center gap-1 text-foreground">
                  <ChannelIcon channel={row.channel} />
                  {CHANNEL_LABELS[row.channel]}
                </span>
                <span className="max-w-[10rem] truncate">
                  {row.recipientName || row.recipientPhone || row.recipientEmail || "Recipient"}
                </span>
                <span className="text-muted-foreground" title={formatWhen(row.sendAt)}>
                  {formatWhen(row.sendAt)}
                </span>
              </span>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
