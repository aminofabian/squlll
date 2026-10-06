"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  fetchPlatformDeliveryStats,
  fetchPlatformScheduledMessages,
  type PlatformDeliveryStats,
  type PlatformScheduledMessage,
} from "@/lib/superadmin/deliveryApi";

type Filter = "all" | "DELIVERED" | "UNDELIVERED";

function when(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Super-admin delivery view: platform-wide SMS delivery outcomes plus a recent
 * cross-tenant feed, sourced from the same outbox the schools' own logs use.
 */
export function PlatformDeliveryPanel() {
  const { toast } = useToast();
  const [stats, setStats] = useState<PlatformDeliveryStats | null>(null);
  const [rows, setRows] = useState<PlatformScheduledMessage[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [nextStats, nextRows] = await Promise.all([
        fetchPlatformDeliveryStats(30),
        fetchPlatformScheduledMessages(
          50,
          filter === "all" ? undefined : filter,
        ),
      ]);
      setStats(nextStats);
      setRows(nextRows);
    } catch (err) {
      toast({
        title: "Could not load deliveries",
        description: err instanceof Error ? err.message : "Request failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  const cards: Array<{ label: string; value: number; tone: string }> = stats
    ? [
        { label: "Sent", value: stats.smsSent, tone: "text-slate-800" },
        { label: "Delivered", value: stats.smsDelivered, tone: "text-emerald-600" },
        { label: "Undelivered", value: stats.smsUndelivered, tone: "text-red-600" },
        { label: "Pending report", value: stats.smsPending, tone: "text-amber-600" },
        { label: "Send failed", value: stats.smsFailed, tone: "text-red-600" },
      ]
    : [];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div>
          <h2 className="flex items-center text-sm font-semibold text-slate-800 dark:text-slate-200">
            <Truck className="mr-2 h-4 w-4" />
            Delivery reports
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            SMS delivery outcomes across all schools
            {stats ? ` · last ${stats.windowDays} days` : ""}. Reconciled from
            the provider every 15 minutes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All messages</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="UNDELIVERED">Undelivered</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => void load()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {loading && !stats ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {cards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-950/40"
              >
                <p className="text-[11px] text-slate-500">{card.label}</p>
                <p className={cn("mt-1 text-xl font-semibold", card.tone)}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : rows.length === 0 ? (
          <p className="text-sm text-slate-500">No messages in this view.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-slate-500">
                  <th className="py-2 pr-3 font-medium">School</th>
                  <th className="py-2 pr-3 font-medium">Recipient</th>
                  <th className="py-2 pr-3 font-medium">Channel</th>
                  <th className="py-2 pr-3 font-medium">Send</th>
                  <th className="py-2 pr-3 font-medium">Delivery</th>
                  <th className="py-2 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="py-2 pr-3">{row.tenantName ?? "—"}</td>
                    <td className="py-2 pr-3">
                      {row.recipientName ||
                        row.recipientPhone ||
                        row.recipientEmail ||
                        "—"}
                    </td>
                    <td className="py-2 pr-3">{row.channel}</td>
                    <td className="py-2 pr-3">
                      <Badge variant="outline" className="text-[10px]">
                        {row.status}
                      </Badge>
                    </td>
                    <td className="py-2 pr-3">
                      {row.deliveryStatus ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            row.deliveryStatus === "DELIVERED"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-red-200 bg-red-50 text-red-700",
                          )}
                        >
                          {row.deliveryStatus === "DELIVERED"
                            ? "Delivered"
                            : "Not delivered"}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2 text-xs text-slate-500">
                      {when(row.sentAt ?? row.sendAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
