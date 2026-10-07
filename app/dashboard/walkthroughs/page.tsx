"use client";

import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardErrorBanner } from "@/components/dashboard/superadmin/DashboardStatCards";
import {
  AdminPageHeader,
  AdminSearchBar,
  AdminTableSkeleton,
} from "@/components/dashboard/superadmin/AdminPageChrome";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useWalkthroughs } from "@/lib/superadmin/useWalkthroughs";
import type {
  UpdateWalkthroughInput,
  WalkthroughRequestRecord,
  WalkthroughStatus,
} from "@/lib/superadmin/walkthroughsApi";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";

const STATUS_OPTIONS: WalkthroughStatus[] = [
  "NEW",
  "CONTACTED",
  "SCHEDULED",
  "CLOSED",
];

const STATUS_META: Record<
  WalkthroughStatus,
  { label: string; badge: string; dot: string }
> = {
  NEW: {
    label: "New",
    badge:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  CONTACTED: {
    label: "Contacted",
    badge:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  SCHEDULED: {
    label: "Scheduled",
    badge:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/40 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  CLOSED: {
    label: "Closed",
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
};

function StatusBadge({ status }: { status: WalkthroughStatus }) {
  const meta = STATUS_META[status];
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 text-[10px] font-semibold uppercase tracking-wide",
        meta.badge,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </Badge>
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function DetailItem({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <div className="text-sm text-slate-600 dark:text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
}

function WalkthroughRow({
  request,
  onUpdate,
}: {
  request: WalkthroughRequestRecord;
  onUpdate: (
    input: UpdateWalkthroughInput,
  ) => Promise<WalkthroughRequestRecord>;
}) {
  const [notes, setNotes] = useState(request.adminNotes ?? "");
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const message = request.message ?? "";
  const isLongMessage = message.length > 160;

  const handleStatusChange = async (status: WalkthroughStatus) => {
    setSavingStatus(true);
    try {
      await onUpdate({ id: request.id, status });
      toast.success(`Marked as ${STATUS_META[status].label.toLowerCase()}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update status",
      );
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSaveNote = async () => {
    setSavingNote(true);
    try {
      await onUpdate({ id: request.id, adminNotes: notes });
      toast.success("Note saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save note");
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-colors hover:border-slate-300/60 dark:border-slate-800/60 dark:bg-slate-900/80 dark:hover:border-slate-700/60">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10">
            <span className="text-sm font-bold text-primary">
              {request.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                {request.name}
              </p>
              <StatusBadge status={request.status} />
            </div>
            <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
              {request.schoolName}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <a
                href={`mailto:${request.email}`}
                className="flex items-center gap-1.5 transition-colors hover:text-primary"
              >
                <Mail className="h-3.5 w-3.5" />
                {request.email}
              </a>
              {request.phone ? (
                <a
                  href={`tel:${request.phone}`}
                  className="flex items-center gap-1.5 transition-colors hover:text-primary"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {request.phone}
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
          <select
            value={request.status}
            disabled={savingStatus}
            onChange={(event) =>
              void handleStatusChange(event.target.value as WalkthroughStatus)
            }
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {STATUS_META[status].label}
              </option>
            ))}
          </select>
          {savingStatus ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          ) : null}
          <Badge
            variant="secondary"
            className="gap-1.5 text-[11px] font-medium text-slate-500"
          >
            <CalendarDays className="h-3 w-3" />
            {formatDate(request.createdAt)}
          </Badge>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 dark:border-slate-800/60 sm:grid-cols-4">
        <DetailItem icon={Users} label="Role">
          {request.role || "—"}
        </DetailItem>
        <DetailItem icon={MapPin} label="County">
          {request.county || "—"}
        </DetailItem>
        <DetailItem icon={Users} label="Students">
          {request.studentCount || "—"}
        </DetailItem>
        <DetailItem icon={Clock} label="Preferred time">
          {request.preferredTime || "—"}
        </DetailItem>
      </div>

      {message ? (
        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800/60">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Message
          </p>
          <p
            className={cn(
              "mt-1 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300",
              !expanded && "line-clamp-3",
            )}
          >
            {message}
          </p>
          {isLongMessage ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary-dark"
            >
              {expanded ? (
                <>
                  Show less <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Show more <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800/60">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Admin notes
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add an internal note about this lead..."
            rows={2}
            className="min-h-[60px] flex-1 rounded-xl text-sm"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={savingNote || notes === (request.adminNotes ?? "")}
            onClick={() => void handleSaveNote()}
            className="h-9 gap-2"
          >
            {savingNote ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save note
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function WalkthroughsPage() {
  const { requests, loading, error, refresh, updateRequest } = useWalkthroughs();
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    if (!searchTerm) return requests;
    const term = searchTerm.toLowerCase();
    return requests.filter(
      (request) =>
        request.name.toLowerCase().includes(term) ||
        request.schoolName.toLowerCase().includes(term) ||
        request.email.toLowerCase().includes(term),
    );
  }, [requests, searchTerm]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <AdminPageHeader
          icon={ClipboardList}
          title="Walkthrough leads"
          description="Requests from schools interested in a guided walkthrough of the platform."
          count={requests.length}
          loading={loading}
          onRefresh={refresh}
        />

        <AdminSearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by name, school or email..."
          resultCount={filtered.length}
          loading={loading}
        />

        {error ? (
          <DashboardErrorBanner message={error} onRetry={refresh} />
        ) : null}

        {loading && !error ? <AdminTableSkeleton /> : null}

        {!loading && !error && filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((request) => (
              <WalkthroughRow
                key={request.id}
                request={request}
                onUpdate={updateRequest}
              />
            ))}
          </div>
        ) : null}

        {!loading && !error && filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/60 bg-white px-5 py-16 text-center shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <ClipboardList className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              {searchTerm
                ? "No leads match your search"
                : "No walkthrough requests yet"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {searchTerm
                ? "Try adjusting your search"
                : "New requests will appear here as schools reach out"}
            </p>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
