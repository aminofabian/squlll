"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, XCircle, CheckCircle2, Rocket } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DashboardErrorBanner } from "@/components/dashboard/superadmin/DashboardStatCards";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  failPlatformDomainOrder,
  fetchPlatformDomainOrders,
  markPlatformDomainOrderLive,
  markPlatformDomainOrderRegistered,
  retryPlatformDomainOrder,
  type DomainOrderStatus,
  type PlatformDomainOrderRecord,
} from "@/lib/superadmin/domainsApi";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: Array<{ value: "" | DomainOrderStatus; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "QUOTED", label: "Quoted" },
  { value: "AWAITING_PAYMENT", label: "Awaiting payment" },
  { value: "REGISTERING", label: "Registering" },
  { value: "OWNED", label: "Owned" },
  { value: "PROVISIONING", label: "Provisioning" },
  { value: "LIVE", label: "Live" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function statusClass(status: string): string {
  switch (status) {
    case "LIVE":
    case "OWNED":
      return "bg-emerald-600 text-white hover:bg-emerald-600";
    case "FAILED":
    case "CANCELLED":
      return "bg-red-600 text-white hover:bg-red-600";
    case "PROVISIONING":
    case "REGISTERING":
    case "AWAITING_PAYMENT":
      return "bg-amber-500 text-white hover:bg-amber-500";
    default:
      return "";
  }
}

function price(order: PlatformDomainOrderRecord): string {
  if (!order.priceCents) return "—";
  return `${order.currency ?? ""} ${(Number(order.priceCents) / 100).toLocaleString()}`.trim();
}

export function DomainOrdersPanel() {
  const [rows, setRows] = useState<PlatformDomainOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | DomainOrderStatus>("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      setRows(
        await fetchPlatformDomainOrders({
          search: search.trim() || undefined,
          status: status || undefined,
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load orders");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (id: string, fn: () => Promise<unknown>, ok: string) => {
    setBusyId(id);
    try {
      await fn();
      toast.success(ok);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search domain…"
          className="max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "" | DomainOrderStatus)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Button variant="outline" size="sm" onClick={() => void load()}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {error ? <DashboardErrorBanner message={error} onRetry={load} /> : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Registrar</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  <Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin" />
                  Loading orders…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No domain orders yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.fqdn}</TableCell>
                  <TableCell className="text-sm">
                    {order.tenantName ?? order.tenantId}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("text-[10px] uppercase", statusClass(order.status))}>
                      {order.status}
                    </Badge>
                    {order.lastError ? (
                      <p className="mt-1 max-w-[180px] truncate text-[11px] text-amber-700">
                        {order.lastError}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-xs">{price(order)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {order.registrar}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === order.id}
                        onClick={() =>
                          void run(
                            order.id,
                            () => retryPlatformDomainOrder(order.id),
                            "Retried",
                          )
                        }
                      >
                        <RefreshCw className="mr-1 h-3.5 w-3.5" />
                        Retry
                      </Button>
                      {order.status === "REGISTERING" ||
                      order.status === "AWAITING_PAYMENT" ||
                      order.status === "QUOTED" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === order.id}
                          onClick={() =>
                            void run(
                              order.id,
                              () => markPlatformDomainOrderRegistered(order.id),
                              "Marked registered",
                            )
                          }
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          Registered
                        </Button>
                      ) : null}
                      {order.status === "PROVISIONING" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === order.id}
                          onClick={() =>
                            void run(
                              order.id,
                              () => markPlatformDomainOrderLive(order.id),
                              "Marked live",
                            )
                          }
                        >
                          <Rocket className="mr-1 h-3.5 w-3.5" />
                          Live
                        </Button>
                      ) : null}
                      {order.status !== "LIVE" && order.status !== "CANCELLED" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          disabled={busyId === order.id}
                          onClick={() =>
                            void run(
                              order.id,
                              () =>
                                failPlatformDomainOrder(
                                  order.id,
                                  "Failed by operator",
                                ),
                              "Marked failed",
                            )
                          }
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
