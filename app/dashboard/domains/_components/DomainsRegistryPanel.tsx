"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, ShieldOff, Trash2, CircleCheck } from "lucide-react";
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
  approvePlatformDomain,
  detachPlatformDomain,
  fetchPlatformDomains,
  suspendPlatformDomain,
  verifyPlatformDomain,
  type DomainStatus,
  type PlatformDomainRecord,
} from "@/lib/superadmin/domainsApi";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: Array<{ value: "" | DomainStatus; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "VERIFYING", label: "Verifying" },
  { value: "ACTIVE", label: "Live" },
  { value: "FAILED", label: "Failed" },
  { value: "SUSPENDED", label: "Suspended" },
];

function statusClass(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-600 text-white hover:bg-emerald-600";
    case "FAILED":
      return "bg-red-600 text-white hover:bg-red-600";
    case "VERIFYING":
      return "bg-amber-500 text-white hover:bg-amber-500";
    case "SUSPENDED":
      return "bg-slate-500 text-white hover:bg-slate-500";
    default:
      return "";
  }
}

export function DomainsRegistryPanel() {
  const [rows, setRows] = useState<PlatformDomainRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | DomainStatus>("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const data = await fetchPlatformDomains({
        search: search.trim() || undefined,
        status: status || undefined,
      });
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load domains");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (
    id: string,
    fn: () => Promise<unknown>,
    success: string,
  ) => {
    setBusyId(id);
    try {
      await fn();
      toast.success(success);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleDetach = (row: PlatformDomainRecord) => {
    if (
      !window.confirm(
        `Detach ${row.hostname}? It will stop resolving until reconnected.`,
      )
    ) {
      return;
    }
    void run(row.id, () => detachPlatformDomain(row.id), "Domain detached");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search hostname…"
          className="max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "" | DomainStatus)}
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
              <TableHead>Provider</TableHead>
              <TableHead>Last error</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  <Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin" />
                  Loading domains…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No custom domains yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">
                    {row.hostname}
                    {row.isPrimary ? (
                      <Badge variant="outline" className="ml-2 text-[10px]">
                        Primary
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-sm">
                    {row.tenantName ?? row.tenantId}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("text-[10px] uppercase", statusClass(row.status))}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.provider}
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate text-xs text-amber-700 dark:text-amber-500">
                    {row.lastError ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === row.id}
                        onClick={() =>
                          void run(
                            row.id,
                            () =>
                              row.status === "PENDING"
                                ? approvePlatformDomain(row.id)
                                : verifyPlatformDomain(row.id),
                            row.status === "PENDING"
                              ? "Domain approved"
                              : "Re-checked",
                          )
                        }
                      >
                        <CircleCheck className="mr-1 h-3.5 w-3.5" />
                        {row.status === "PENDING" ? "Approve" : "Verify"}
                      </Button>
                      {row.status !== "SUSPENDED" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busyId === row.id}
                          onClick={() =>
                            void run(
                              row.id,
                              () => suspendPlatformDomain(row.id),
                              "Domain suspended",
                            )
                          }
                        >
                          <ShieldOff className="h-3.5 w-3.5" />
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        disabled={busyId === row.id}
                        onClick={() => handleDetach(row)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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
