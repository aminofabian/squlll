"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Ban, Inbox, Loader2, RefreshCw, RotateCcw, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  bulkCancelScheduledMessages,
  bulkRetryScheduledMessages,
  fetchScheduledMessages,
  type ScheduledMessage,
  type ScheduledMessageStatus,
} from "@/lib/school/communicationsApi";
import { cn } from "@/lib/utils";
import { CHANNEL_LABELS, STATUS_LABELS, STATUS_TONE, formatDateTime } from "./labels";

const STATUS_FILTERS: Array<ScheduledMessageStatus | "all"> = [
  "all",
  "PENDING",
  "SENT",
  "FAILED",
  "SKIPPED",
];

export function LogTab() {
  const [rows, setRows] = useState<ScheduledMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ScheduledMessageStatus | "all">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setRows(
        await fetchScheduledMessages(status === "all" ? undefined : status, 100),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load log");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  const validIds = useMemo(() => new Set(rows.map((r) => r.id)), [rows]);
  const selectedIds = useMemo(
    () => new Set([...selected].filter((id) => validIds.has(id))),
    [selected, validIds],
  );
  const count = selectedIds.size;
  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(r.id));

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) rows.forEach((r) => next.delete(r.id));
      else rows.forEach((r) => next.add(r.id));
      return next;
    });
  };

  const run = async (fn: () => Promise<number>, verb: string) => {
    try {
      setBusy(true);
      const affected = await fn();
      if (affected > 0) {
        toast.success(`${verb} ${affected} message${affected === 1 ? "" : "s"}`);
      } else {
        toast.info(`No matching messages to ${verb.toLowerCase()}`);
      }
      setSelected(new Set());
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Delivery log</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Every message the engine has queued or sent.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v as ScheduledMessageStatus | "all");
              setSelected(new Set());
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((value) => (
                <SelectItem key={value} value={value}>
                  {value === "all" ? "All messages" : STATUS_LABELS[value]}
                </SelectItem>
              ))}
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

      {rows.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={allSelected}
              onCheckedChange={() => toggleAll()}
              aria-label="Select all messages"
            />
            {count > 0 ? `${count} selected` : "Select all"}
          </label>
          {count > 0 ? (
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() =>
                  void run(
                    () => bulkCancelScheduledMessages([...selectedIds]),
                    "Cancelled",
                  )
                }
              >
                {busy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Ban className="mr-2 h-4 w-4" />
                )}
                Cancel queued
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() =>
                  void run(
                    () => bulkRetryScheduledMessages([...selectedIds]),
                    "Retried",
                  )
                }
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Retry failed
              </Button>
              <Button
                size="icon"
                variant="ghost"
                disabled={busy}
                onClick={() => setSelected(new Set())}
                aria-label="Clear selection"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <Inbox className="h-8 w-8 text-muted-foreground/60" />
              <p className="text-sm font-medium">Nothing here yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                The engine queues messages ahead of each date, then sends them.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3",
                    selectedIds.has(row.id) && "bg-muted/40",
                  )}
                >
                  <Checkbox
                    className="mt-1"
                    checked={selectedIds.has(row.id)}
                    onCheckedChange={() => toggleSelect(row.id)}
                    aria-label="Select message"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn("shrink-0", STATUS_TONE[row.status])}
                      >
                        {STATUS_LABELS[row.status]}
                      </Badge>
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        {CHANNEL_LABELS[row.channel]}
                      </Badge>
                      {row.deliveryStatus ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "shrink-0 text-[10px]",
                            row.deliveryStatus === "DELIVERED"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-red-200 bg-red-50 text-red-700",
                          )}
                        >
                          {row.deliveryStatus === "DELIVERED"
                            ? "Delivered"
                            : "Not delivered"}
                        </Badge>
                      ) : null}
                      <span className="truncate text-sm font-medium">
                        {row.recipientName ||
                          row.recipientPhone ||
                          row.recipientEmail ||
                          "Recipient"}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {row.body}
                    </p>
                    {row.lastError ? (
                      <p className="mt-0.5 text-xs text-amber-700">{row.lastError}</p>
                    ) : null}
                  </div>
                  <span className="shrink-0 pt-0.5 text-xs text-muted-foreground">
                    {formatDateTime(row.sentAt ?? row.sendAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
