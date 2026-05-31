"use client";

import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  AdminPageHeader,
  AdminSearchBar,
  AdminStatGrid,
} from "@/components/dashboard/superadmin/AdminPageChrome";
import { DashboardErrorBanner } from "@/components/dashboard/superadmin/DashboardStatCards";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  countAuditLogsByCategory,
  extractAuditTarget,
  formatAuditMetadata,
  formatAuditTimestamp,
  getAuditActionMeta,
  parseAuditMetadata,
} from "@/lib/superadmin/auditLogs";
import { useAuditLogs } from "@/lib/superadmin/useAuditLogs";
import {
  Activity,
  UserPlus,
  CreditCard,
  Shield,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

function LogSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
      <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-3 p-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 flex-shrink-0 rounded-xl" />
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

export default function AuditLogsPage() {
  const { logs, loading, error, refresh } = useAuditLogs();
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    if (!searchTerm) return logs;
    const term = searchTerm.toLowerCase();
    return logs.filter((entry) => {
      const metadata = parseAuditMetadata(entry.metadata);
      return (
        entry.message.toLowerCase().includes(term) ||
        entry.source.toLowerCase().includes(term) ||
        JSON.stringify(metadata ?? {}).toLowerCase().includes(term)
      );
    });
  }, [logs, searchTerm]);

  const stats = [
    {
      label: "Total actions",
      value: String(logs.length),
      helper: "Recorded in the system",
      icon: Activity,
      color: "text-blue-600",
      gradient: "from-blue-500/10 to-blue-500/5",
    },
    {
      label: "User actions",
      value: String(countAuditLogsByCategory(logs, "user")),
      helper: "Creations and changes",
      icon: UserPlus,
      color: "text-green-600",
      gradient: "from-green-500/10 to-green-500/5",
    },
    {
      label: "Plan changes",
      value: String(countAuditLogsByCategory(logs, "plan")),
      helper: "Subscription updates",
      icon: CreditCard,
      color: "text-purple-600",
      gradient: "from-purple-500/10 to-purple-500/5",
    },
    {
      label: "Other",
      value: String(countAuditLogsByCategory(logs, "system")),
      helper: "System events",
      icon: Shield,
      color: "text-amber-600",
      gradient: "from-amber-500/10 to-amber-500/5",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <AdminPageHeader
          icon={Activity}
          title="Audit logs"
          description="Platform actions performed by super admins"
          count={loading ? undefined : logs.length}
          loading={loading}
          onRefresh={refresh}
        />

        <AdminStatGrid stats={stats} />

        <AdminSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search logs..."
          resultCount={loading ? undefined : filtered.length}
          loading={loading}
        />

        {error ? (
          <DashboardErrorBanner message={error} onRetry={refresh} />
        ) : null}

        {loading && !error ? <LogSkeleton /> : null}

        {!loading && !error ? (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/60 bg-white p-10 text-center shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <Activity className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {searchTerm ? "No logs match your search" : "No audit logs yet"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {searchTerm
                    ? "Try a different search term"
                    : "Logs appear here as platform actions are performed"}
                </p>
              </div>
            ) : (
              filtered.map((entry) => {
                const meta = getAuditActionMeta(entry);
                const Icon = meta.icon;
                const metadataText = formatAuditMetadata(entry.metadata);

                return (
                  <div
                    key={entry.id}
                    className="flex items-start gap-4 rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50/50 dark:border-slate-700/60 dark:bg-slate-900/80 dark:hover:bg-slate-800/20"
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl",
                        meta.bg,
                      )}
                    >
                      <Icon className={cn("h-5 w-5", meta.color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="text-sm font-semibold capitalize text-slate-900 dark:text-slate-100">
                            {meta.label}
                          </span>
                          <Badge
                            variant="outline"
                            className="flex-shrink-0 font-mono text-[10px] uppercase"
                          >
                            {entry.source}
                          </Badge>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-1 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          {formatAuditTimestamp(entry.timestamp)}
                        </div>
                      </div>
                      {metadataText ? (
                        <pre className="mt-1.5 overflow-x-auto rounded-lg border border-slate-100 bg-slate-50 p-2 font-mono text-xs text-slate-500 dark:border-slate-700/50 dark:bg-slate-800/50">
                          {metadataText}
                        </pre>
                      ) : null}
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-medium">Target:</span>
                        {extractAuditTarget(entry)}
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
        ) : null}
      </div>
    </DashboardLayout>
  );
}
