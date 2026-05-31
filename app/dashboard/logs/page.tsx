"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  UserPlus,
  UserX,
  ToggleLeft,
  CreditCard,
  Shield,
  Search,
  Clock,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────

interface AuditEntry {
  id: string;
  message: string;
  source: string;
  level: string;
  metadata: any;
  timestamp: string;
}

// ─── GraphQL ───────────────────────────────────────────────────

async function fetchAuditLogs(): Promise<AuditEntry[]> {
  const res = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query GetAuditLogs {
          getAuditLogs {
            id
            message
            source
            level
            metadata
            timestamp
          }
        }
      `,
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || "GraphQL error");
  return json.data.getAuditLogs;
}

// ─── Helpers ───────────────────────────────────────────────────

function getActionMeta(entry: AuditEntry): {
  label: string;
  icon: typeof Activity;
  color: string;
  bg: string;
} {
  const msg = entry.message || "";
  if (msg.includes("CREATE_USER"))
    return {
      label: "User Created",
      icon: UserPlus,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/30",
    };
  if (msg.includes("DELETE_USER"))
    return {
      label: "User Deleted",
      icon: UserX,
      color: "text-red-600",
      bg: "bg-red-100 dark:bg-red-900/30",
    };
  if (msg.includes("CHANGE_STATUS"))
    return {
      label: "Status Changed",
      icon: ToggleLeft,
      color: "text-amber-600",
      bg: "bg-amber-100 dark:bg-amber-900/30",
    };
  if (msg.includes("SUBSCRIPTION") || msg.includes("PLAN"))
    return {
      label: "Plan Change",
      icon: CreditCard,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    };
  return {
    label: msg,
    icon: Shield,
    color: "text-slate-600",
    bg: "bg-slate-100 dark:bg-slate-800/50",
  };
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function extractTarget(entry: AuditEntry): string {
  const meta = entry.metadata;
  if (meta?.email) return meta.email;
  if (meta?.userId) return meta.userId;
  if (meta?.role) return `${meta.role}`;
  return "—";
}

// ─── Skeletons ────────────────────────────────────────────────

function LogSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="p-5 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAuditLogs();
      setLogs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filtered = useMemo(() => {
    if (!searchTerm) return logs;
    const term = searchTerm.toLowerCase();
    return logs.filter(
      (entry) =>
        entry.message.toLowerCase().includes(term) ||
        entry.source.toLowerCase().includes(term) ||
        JSON.stringify(entry.metadata).toLowerCase().includes(term),
    );
  }, [logs, searchTerm]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Audit Logs
              </h1>
              {!loading && (
                <span className="text-sm font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                  {logs.length}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Superadmin actions recorded across the platform
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadLogs}
            disabled={loading}
            className="h-9 gap-2"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", loading && "animate-spin")}
            />
            <span className="text-xs font-medium">Refresh</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {[
            {
              label: "Total Actions",
              value: String(logs.length),
              change: "From database",
              icon: Activity,
              color: "text-blue-600",
              gradient: "from-blue-500/10 to-blue-500/5",
            },
            {
              label: "User Actions",
              value: String(
                logs.filter((l) => l.message.includes("USER")).length,
              ),
              change: "Creations & changes",
              icon: UserPlus,
              color: "text-green-600",
              gradient: "from-green-500/10 to-green-500/5",
            },
            {
              label: "Plan Changes",
              value: String(
                logs.filter(
                  (l) =>
                    l.message.includes("PLAN") ||
                    l.message.includes("SUBSCRIPTION"),
                ).length,
              ),
              change: "Plan updates",
              icon: CreditCard,
              color: "text-purple-600",
              gradient: "from-purple-500/10 to-purple-500/5",
            },
            {
              label: "System",
              value: String(
                logs.filter(
                  (l) =>
                    !l.message.includes("USER") &&
                    !l.message.includes("PLAN") &&
                    !l.message.includes("SUBSCRIPTION"),
                ).length,
              ),
              change: "Other actions",
              icon: Shield,
              color: "text-amber-600",
              gradient: "from-amber-500/10 to-amber-500/5",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={cn(
                  "relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-5 shadow-sm bg-gradient-to-br dark:from-slate-900 dark:to-slate-900/80",
                  stat.gradient,
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm flex items-center justify-center">
                    <Icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <div>
                    <p className="text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-0.5">
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {stat.change}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search logs..."
            className="w-full h-10 pl-10 pr-4 text-sm rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-slate-900/80 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-4 p-5 bg-red-50/80 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40 rounded-2xl shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                Failed to load audit logs
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                {error}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadLogs}
              className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Loading */}
        {loading && !error && <LogSkeleton />}

        {/* Logs */}
        {!loading && !error && (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 shadow-sm p-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {searchTerm
                    ? "No logs match your search"
                    : "No audit logs yet"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {searchTerm
                    ? "Try a different search term"
                    : "Logs will appear here as superadmin actions are performed"}
                </p>
              </div>
            ) : (
              filtered.map((entry) => {
                const meta = getActionMeta(entry);
                const Icon = meta.icon;
                return (
                  <div
                    key={entry.id}
                    className="flex items-start gap-4 p-4 border border-slate-200/60 dark:border-slate-700/60 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors shadow-sm"
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                        meta.bg,
                      )}
                    >
                      <Icon className={cn("h-5 w-5", meta.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {meta.label}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-mono uppercase flex-shrink-0"
                          >
                            {entry.source}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(entry.timestamp)}
                        </div>
                      </div>
                      {entry.metadata && (
                        <p className="text-xs text-slate-500 mt-1.5 font-mono bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-700/50 overflow-x-auto">
                          {JSON.stringify(entry.metadata, null, 2)}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                        <span className="font-medium">Target:</span>{" "}
                        {extractTarget(entry)}
                        <span className="text-slate-300 dark:text-slate-600">
                          ·
                        </span>
                        <span>Level: {entry.level}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
