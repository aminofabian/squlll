"use client";

import { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ClipboardList,
  Copy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AUDIT_CATEGORY_META,
  formatAuditExactTimestamp,
  formatAuditMetadata,
  formatAuditTimestamp,
  getAuditActionMeta,
  getAuditActor,
  getAuditMetadataEntries,
  getAuditTarget,
  parseAuditMetadata,
} from "@/lib/superadmin/auditLogs";
import type { AuditLogRecord } from "@/lib/superadmin/types";
import { cn } from "@/lib/utils";

interface AuditLogTableProps {
  logs: AuditLogRecord[];
  emptyState: ReactNode;
  expandedId: string | null;
  onToggle: (id: string) => void;
}

const HEADER_CLASS =
  "whitespace-nowrap px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400";

const ROW_CLASS =
  "border-b border-slate-100 transition-colors last:border-0 dark:border-slate-800/60";

export function AuditLogTable({
  logs,
  emptyState,
  expandedId,
  onToggle,
}: AuditLogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800/70 dark:bg-slate-900/80">
        {emptyState}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800/70 dark:bg-slate-900/80">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left lg:min-w-[720px]">
          <thead className="bg-slate-50/90 dark:bg-slate-900">
            <tr className="border-b border-slate-200/80 dark:border-slate-800">
              <th scope="col" className={HEADER_CLASS}>
                Event
              </th>
              <th scope="col" className={cn(HEADER_CLASS, "hidden lg:table-cell")}>
                Performed by
              </th>
              <th scope="col" className={cn(HEADER_CLASS, "hidden lg:table-cell")}>
                Target
              </th>
              <th scope="col" className={HEADER_CLASS}>
                When
              </th>
              <th scope="col" className="w-12 px-3 py-3">
                <span className="sr-only">Details</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((entry) => {
              const meta = getAuditActionMeta(entry);
              const actor = getAuditActor(entry);
              const target = getAuditTarget(entry);
              const category = AUDIT_CATEGORY_META[meta.category];
              const Icon = meta.icon;
              const expanded = expandedId === entry.id;
              const isAlert = entry.level !== "INFO";

              return (
                <AuditRow
                  key={entry.id}
                  entry={entry}
                  meta={meta}
                  actor={actor}
                  target={target}
                  categoryLabel={category.label}
                  icon={Icon}
                  expanded={expanded}
                  isAlert={isAlert}
                  onToggle={() => onToggle(entry.id)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditRow({
  entry,
  meta,
  actor,
  target,
  categoryLabel,
  icon: Icon,
  expanded,
  isAlert,
  onToggle,
}: {
  entry: AuditLogRecord;
  meta: ReturnType<typeof getAuditActionMeta>;
  actor: ReturnType<typeof getAuditActor>;
  target: ReturnType<typeof getAuditTarget>;
  categoryLabel: string;
  icon: ReturnType<typeof getAuditActionMeta>["icon"];
  expanded: boolean;
  isAlert: boolean;
  onToggle: () => void;
}) {
  const exact = formatAuditExactTimestamp(entry.timestamp);

  return (
    <>
      <tr
        className={cn(
          ROW_CLASS,
          "hover:bg-slate-50/80 dark:hover:bg-slate-800/30",
          expanded && "bg-slate-50/80 dark:bg-slate-800/30",
        )}
      >
        <td className="px-4 py-3.5">
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl",
                meta.bg,
              )}
            >
              <Icon className={cn("h-4 w-4", meta.color)} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {meta.label}
                </span>
                {isAlert ? (
                  <Badge
                    variant={entry.level === "ERROR" ? "destructive" : "secondary"}
                    className="gap-1 px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide"
                  >
                    <AlertTriangle className="h-2.5 w-2.5" />
                    {entry.level.toLowerCase()}
                  </Badge>
                ) : null}
              </div>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                {meta.description}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  {meta.code}
                </code>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {categoryLabel}
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 lg:hidden">
                {actor.displayName}
                <span className="mx-1 text-slate-300 dark:text-slate-600">·</span>
                {target.kind}: {target.label}
              </p>
            </div>
          </div>
        </td>

        <td className="hidden px-4 py-3.5 lg:table-cell">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {actor.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                {actor.displayName}
              </p>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {actor.detail}
              </p>
            </div>
          </div>
        </td>

        <td className="hidden px-4 py-3.5 lg:table-cell">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
              {target.label}
            </p>
            <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
              {target.kind}
              {target.id ? ` · ${shortId(target.id)}` : ""}
            </p>
          </div>
        </td>

        <td className="whitespace-nowrap px-4 py-3.5">
          <time
            dateTime={entry.timestamp}
            title={exact}
            className="block text-xs font-medium text-slate-600 dark:text-slate-300"
          >
            {formatAuditTimestamp(entry.timestamp)}
          </time>
          <span className="mt-0.5 hidden text-[11px] text-slate-500 dark:text-slate-400 xl:block">
            {exact}
          </span>
        </td>

        <td className="px-3 py-3.5 text-right">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={expanded ? "Hide event details" : "Show event details"}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors",
              "hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200",
              expanded && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200",
            )}
          >
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
            />
          </button>
        </td>
      </tr>

      {expanded ? (
        <tr className="border-b border-slate-100 dark:border-slate-800/60">
          <td colSpan={5} className="bg-slate-50/70 p-0 dark:bg-slate-800/20">
            <AuditLogDetails entry={entry} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function AuditLogDetails({ entry }: { entry: AuditLogRecord }) {
  const metadata = getAuditMetadataEntries(entry);
  const raw = formatAuditMetadata(entry.metadata);
  const [copied, setCopied] = useState(false);

  const copyPayload = async () => {
    const payload = {
      ...entry,
      metadata: parseAuditMetadata(entry.metadata) ?? entry.metadata,
    };
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard permission denied; leave the button in its default state.
    }
  };

  return (
    <div className="px-4 py-4 sm:px-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              <ClipboardList className="h-3.5 w-3.5" />
              Event details
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={copyPayload}
              className="h-7 gap-1.5 rounded-lg px-2 text-[11px] text-slate-500 hover:bg-white hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copied ? "Copied" : "Copy JSON"}
            </Button>
          </div>

          {metadata.length > 0 ? (
            <dl className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {metadata.map(({ key, label, value, mono }) => (
                <div key={key} className="min-w-0">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {label}
                  </dt>
                  <dd
                    className={cn(
                      "mt-0.5 break-words text-xs text-slate-700 dark:text-slate-300",
                      mono && "font-mono text-[11px]",
                    )}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-3 text-xs text-slate-400">
              No extra details were recorded for this event.
            </p>
          )}

          {raw ? (
            <details className="group mt-4 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 dark:border-slate-700/60 dark:bg-slate-900/60">
              <summary className="cursor-pointer select-none text-[11px] font-medium text-slate-500 marker:text-slate-300 dark:text-slate-400">
                Raw payload
              </summary>
              <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-slate-50 p-2.5 font-mono text-[10px] leading-relaxed text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
                {raw}
              </pre>
            </details>
          ) : null}
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200/70 bg-white/70 p-3.5 dark:border-slate-700/60 dark:bg-slate-900/60">
          <ReferenceRow label="Event ID" value={entry.id} mono />
          <ReferenceRow label="Source" value={entry.source} />
          <ReferenceRow label="Level" value={entry.level} />
          <ReferenceRow
            label="Recorded"
            value={formatAuditExactTimestamp(entry.timestamp)}
          />
        </div>
      </div>
    </div>
  );
}

function ReferenceRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 break-all text-xs text-slate-600 dark:text-slate-300",
          mono && "font-mono text-[10px]",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function shortId(id: string): string {
  return id.length > 12 ? `${id.slice(0, 8)}…` : id;
}
