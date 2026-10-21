"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Ban,
  Loader2,
  RefreshCw,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  cancelCommMessages,
  fetchCommMessages,
  resendCommMessages,
  retryCommMessages,
  type CommCampaign,
  type CommMessage,
} from "@/lib/school/communicationsHubApi";
import {
  formatDateTime,
  truncate,
} from "@/lib/school/communicationsHubUtils";
import {
  CampaignStatusBadge,
  ChannelPill,
  EmptyState,
  LoadingPanel,
  MessageStatusBadge,
  StatCard,
} from "./shared";

export function CampaignReportDialog({
  campaign,
  open,
  onClose,
  onChanged,
}: {
  campaign: CommCampaign | null;
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [rows, setRows] = useState<CommMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!campaign) return;
    try {
      setLoading(true);
      const page = await fetchCommMessages({
        campaignId: campaign.id,
        limit: 200,
      });
      setRows(page.rows);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load report");
    } finally {
      setLoading(false);
    }
  }, [campaign]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch owns the loading state
    if (open && campaign) void load();
  }, [open, campaign, load]);

  if (!campaign) return null;
  const stats = campaign.stats;
  const failed = rows.filter((row) => row.status === "FAILED");
  const queued = rows.filter((row) => row.status === "PENDING");
  const resendable = rows.filter((row) =>
    ["SENT", "FAILED", "SKIPPED", "CANCELLED"].includes(row.status),
  );

  const retry = async (ids: string[]) => {
    if (!ids.length) return;
    try {
      setBusy("retry");
      const count = await retryCommMessages(ids);
      toast.success(`${count} message${count === 1 ? "" : "s"} re-queued.`);
      await load();
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Retry failed");
    } finally {
      setBusy(null);
    }
  };

  const resend = async (ids: string[]) => {
    if (!ids.length) return;
    try {
      setBusy("resend");
      const count = await resendCommMessages(ids);
      toast.success(`${count} message${count === 1 ? "" : "s"} queued to resend.`);
      await load();
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Resend failed");
    } finally {
      setBusy(null);
    }
  };

  const cancel = async (ids: string[]) => {
    if (!ids.length) return;
    try {
      setBusy("cancel");
      const count = await cancelCommMessages(ids);
      toast.success(`${count} message${count === 1 ? "" : "s"} cancelled.`);
      await load();
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2 text-xl">
            {campaign.name}
            <CampaignStatusBadge status={campaign.effectiveStatus} />
          </DialogTitle>
          <DialogDescription>
            {[
              campaign.templateName ? `Template: ${campaign.templateName}` : null,
              campaign.createdByName ? `Created by ${campaign.createdByName}` : null,
              campaign.scheduledAt ? `Scheduled ${formatDateTime(campaign.scheduledAt)}` : null,
            ]
              .filter(Boolean)
              .join(" · ") || "Campaign delivery report"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Recipients" value={campaign.recipientCount} icon={Send} />
          <StatCard
            label="Delivered"
            value={stats.delivered}
            hint={`${stats.deliveryRate}% provider-confirmed`}
            tone="positive"
          />
          <StatCard label="Failed" value={stats.failed} tone={stats.failed ? "danger" : "default"} />
          <StatCard label="Queued" value={stats.queued} tone={stats.queued ? "warning" : "default"} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => void retry(failed.map((row) => row.id))}
            disabled={!failed.length || busy !== null}
          >
            {busy === "retry" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Retry failed ({failed.length})
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void resend(resendable.map((row) => row.id))}
            disabled={!resendable.length || busy !== null}
          >
            {busy === "resend" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Resend completed ({resendable.length})
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void cancel(queued.map((row) => row.id))}
            disabled={!queued.length || busy !== null}
          >
            {busy === "cancel" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Ban className="h-4 w-4" />
            )}
            Cancel queued ({queued.length})
          </Button>
          <Button size="sm" variant="ghost" onClick={() => void load()}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <div className="ml-auto flex flex-wrap gap-1.5">
            {campaign.channels.map((channel) => (
              <ChannelPill key={channel} channel={channel} />
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingPanel label="Loading recipients…" />
        ) : rows.length ? (
          <div className="overflow-x-auto rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <p className="text-sm font-medium">
                        {row.recipientName ?? "Recipient"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {row.recipientPhone ?? row.recipientEmail ?? "—"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <ChannelPill channel={row.channel} />
                    </TableCell>
                    <TableCell>
                      <MessageStatusBadge status={row.status} />
                    </TableCell>
                    <TableCell>
                      {row.deliveryStatus ? (
                        <Badge
                          variant="outline"
                          className={
                            row.deliveryStatus === "DELIVERED"
                              ? "border-emerald-200 text-emerald-700"
                              : "border-rose-200 text-rose-700"
                          }
                        >
                          {row.deliveryStatus.toLowerCase()}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[260px]">
                      <p className="truncate text-xs text-muted-foreground">
                        {truncate(row.subject || row.body, 90)}
                      </p>
                      {row.lastError ? (
                        <p className="mt-0.5 text-[11px] text-rose-600">
                          {truncate(row.lastError, 70)}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.status === "FAILED" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void retry([row.id])}
                          disabled={busy !== null}
                        >
                          Retry
                        </Button>
                      ) : row.status === "PENDING" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void cancel([row.id])}
                          disabled={busy !== null}
                        >
                          Cancel
                        </Button>
                      ) : ["SENT", "SKIPPED", "CANCELLED"].includes(row.status) ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void resend([row.id])}
                          disabled={busy !== null}
                        >
                          Resend
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            title="No recipients yet"
            description="This campaign has no outbox rows. Send it from the campaigns list to start delivery."
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
