"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  fetchCommDeliveryReport,
  fetchCommMessages,
  retryCommMessages,
  type CommChannel,
  type CommDeliveryReport,
  type CommMessage,
  type CommMessagePage,
  type CommStatus,
} from "@/lib/school/communicationsHubApi";
import {
  deliveryTone,
  formatDateTime,
  formatNumber,
  truncate,
} from "@/lib/school/communicationsHubUtils";
import {
  ChannelPill,
  EmptyState,
  InlineError,
  LoadingPanel,
  MessageStatusBadge,
  PageSection,
  StatCard,
} from "./shared";

const PAGE_SIZE = 25;

export function HistoryTab({ permissions }: { permissions: string[] }) {
  const [report, setReport] = useState<CommDeliveryReport | null>(null);
  const [page, setPage] = useState<CommMessagePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const canManage = permissions.includes("communications.campaigns.manage");

  const load = useCallback(async () => {
    try {
      setError(null);
      const [nextReport, nextPage] = await Promise.all([
        fetchCommDeliveryReport(30),
        fetchCommMessages({
          channel: channel === "ALL" ? null : (channel as CommChannel),
          status: status === "ALL" ? null : (status as CommStatus),
          search: search.trim() || null,
          limit: PAGE_SIZE,
          offset,
        }),
      ]);
      setReport(nextReport);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load history");
    } finally {
      setLoading(false);
    }
  }, [channel, status, search, offset]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clear selection when filters change
    setSelected([]);
  }, [channel, status, search, offset]);

  const rows = useMemo(() => page?.rows ?? [], [page]);
  const failedSelected = useMemo(
    () => rows.filter((row) => selected.includes(row.id) && row.status === "FAILED"),
    [rows, selected],
  );
  const queuedSelected = useMemo(
    () => rows.filter((row) => selected.includes(row.id) && row.status === "PENDING"),
    [rows, selected],
  );

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? rows.map((row) => row.id) : []);
  };

  const run = async (action: "retry" | "cancel", ids: string[]) => {
    if (!ids.length) {
      toast.error("Select messages first.");
      return;
    }
    try {
      setBusy(action);
      const count =
        action === "retry"
          ? await retryCommMessages(ids)
          : await cancelCommMessages(ids);
      toast.success(
        `${count} message${count === 1 ? "" : "s"} ${action === "retry" ? "re-queued" : "cancelled"}.`,
      );
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <PageSection
      title="History & delivery"
      description="Every message across campaigns, automations and reminders, with provider outcomes and retry controls."
      action={
        <Button variant="outline" size="sm" onClick={() => void load()}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Sent (30 days)"
          value={formatNumber(report?.sent)}
          hint={`${formatNumber(report?.total)} total messages`}
          loading={loading}
        />
        <StatCard
          label="Delivery rate"
          value={`${report?.deliveryRate ?? 0}%`}
          hint={`${formatNumber(report?.delivered)} confirmed delivered`}
          tone="positive"
          loading={loading}
        />
        <StatCard
          label="Failed"
          value={formatNumber(report?.failed)}
          tone={report?.failed ? "danger" : "default"}
          loading={loading}
        />
        <StatCard
          label="Queued"
          value={formatNumber(report?.queued)}
          tone={report?.queued ? "warning" : "default"}
          loading={loading}
        />
      </div>

      {report?.byChannel?.length ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {report.byChannel.map((entry) => (
            <div key={entry.channel} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <ChannelPill channel={entry.channel} />
                <span className={`text-xs font-semibold ${deliveryTone(entry.sent ? Math.round((entry.delivered / entry.sent) * 100) : 0)}`}>
                  {entry.sent ? Math.round((entry.delivered / entry.sent) * 100) : 0}%
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatNumber(entry.sent)} sent · {formatNumber(entry.failed)} failed ·{" "}
                {formatNumber(entry.delivered)} delivered
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setOffset(0);
              setSearch(event.target.value);
            }}
            placeholder="Search recipient, phone, email or subject"
            className="pl-9"
          />
        </div>
        <Select
          value={channel}
          onValueChange={(value) => {
            setOffset(0);
            setChannel(value);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All channels</SelectItem>
            <SelectItem value="EMAIL">Email</SelectItem>
            <SelectItem value="SMS">SMS</SelectItem>
            <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
            <SelectItem value="IN_APP">In-app</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(value) => {
            setOffset(0);
            setStatus(value);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="PENDING">Queued</SelectItem>
            <SelectItem value="SENDING">Sending</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="SKIPPED">Skipped</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        {canManage ? (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => void run("retry", failedSelected.map((row) => row.id))}
              disabled={!failedSelected.length || busy !== null}
            >
              {busy === "retry" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Retry failed
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void run("cancel", queuedSelected.map((row) => row.id))}
              disabled={!queuedSelected.length || busy !== null}
            >
              {busy === "cancel" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Ban className="h-4 w-4" />
              )}
              Cancel queued
            </Button>
          </div>
        ) : null}
      </div>

      {error ? <InlineError message={error} onRetry={() => void load()} /> : null}

      {loading ? (
        <LoadingPanel label="Loading delivery history…" />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No messages match"
          description="Try clearing filters, or send a campaign to start building your delivery history."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                {canManage ? (
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all messages"
                      checked={rows.length > 0 && selected.length === rows.length}
                      onChange={(event) => toggleAll(event.target.checked)}
                    />
                  </TableHead>
                ) : null}
                <TableHead>Recipient</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Provider / error</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <MessageRow
                  key={row.id}
                  row={row}
                  canManage={canManage}
                  selected={selected.includes(row.id)}
                  onToggle={() =>
                    setSelected((current) =>
                      current.includes(row.id)
                        ? current.filter((id) => id !== row.id)
                        : [...current, row.id],
                    )
                  }
                  onRetry={() => void run("retry", [row.id])}
                  onCancel={() => void run("cancel", [row.id])}
                  busy={busy !== null}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {page ? `${formatNumber(page.total)} messages` : "—"}
          {page?.hasMore ? " · more available" : ""}
        </span>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            disabled={offset === 0 || loading}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOffset(offset + PAGE_SIZE)}
            disabled={!page?.hasMore || loading}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </PageSection>
  );
}

function MessageRow({
  row,
  canManage,
  selected,
  onToggle,
  onRetry,
  onCancel,
  busy,
}: {
  row: CommMessage;
  canManage: boolean;
  selected: boolean;
  onToggle: () => void;
  onRetry: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  return (
    <TableRow>
      {canManage ? (
        <TableCell>
          <input
            type="checkbox"
            aria-label={`Select message for ${row.recipientName ?? row.id}`}
            checked={selected}
            onChange={onToggle}
          />
        </TableCell>
      ) : null}
      <TableCell>
        <p className="text-sm font-medium">{row.recipientName ?? "Recipient"}</p>
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
      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
        {formatDateTime(row.sentAt ?? row.sendAt)}
      </TableCell>
      <TableCell className="max-w-[240px]">
        <p className="truncate text-xs text-muted-foreground">
          {row.provider ?? "—"}
          {row.attempts ? ` · attempt ${row.attempts}/${row.maxAttempts}` : ""}
        </p>
        {row.lastError ? (
          <p className="mt-0.5 text-[11px] text-rose-600">
            {truncate(row.lastError, 80)}
          </p>
        ) : row.subject ? (
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {truncate(row.subject, 80)}
          </p>
        ) : null}
      </TableCell>
      <TableCell className="text-right">
        {row.status === "FAILED" ? (
          <Button size="sm" variant="ghost" onClick={onRetry} disabled={busy}>
            Retry
          </Button>
        ) : row.status === "PENDING" ? (
          <Button size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
    </TableRow>
  );
}
