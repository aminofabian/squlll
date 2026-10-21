"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Ban,
  BarChart3,
  Copy,
  Loader2,
  Megaphone,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  cancelCommCampaign,
  deleteCommCampaign,
  duplicateCommCampaign,
  fetchCommAudienceOptions,
  fetchCommCampaigns,
  sendCommCampaign,
  type CommAudienceOptions,
  type CommCampaign,
} from "@/lib/school/communicationsHubApi";
import {
  audienceLabel,
  canCancel,
  canDelete,
  canEdit,
  channelListLabel,
  formatDateTime,
  formatNumber,
} from "@/lib/school/communicationsHubUtils";
import { CampaignReportDialog } from "./CampaignReportDialog";
import {
  CampaignStatusBadge,
  EmptyState,
  InlineError,
  LoadingPanel,
  PageSection,
  ProgressBar,
} from "./shared";

type PendingAction = {
  campaign: CommCampaign;
  action: "send" | "cancel" | "delete";
};

export function CampaignsTab({
  permissions,
  version,
  onCompose,
  onChanged,
}: {
  permissions: string[];
  version: number;
  onCompose: (campaign?: CommCampaign | null) => void;
  onChanged: () => void;
}) {
  const [campaigns, setCampaigns] = useState<CommCampaign[]>([]);
  const [options, setOptions] = useState<CommAudienceOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [report, setReport] = useState<CommCampaign | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);

  const canCreate = permissions.includes("CAMPAIGNS_CREATE");
  const canSend = permissions.includes("CAMPAIGNS_SEND");
  const canManage = permissions.includes("CAMPAIGNS_MANAGE");

  const load = useCallback(async () => {
    try {
      setError(null);
      const [rows, audienceOptions] = await Promise.all([
        fetchCommCampaigns(status === "ALL" ? null : status, search || null),
        fetchCommAudienceOptions(),
      ]);
      setCampaigns(rows);
      setOptions(audienceOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load campaigns");
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [load, version]);

  const counts = useMemo(() => {
    return {
      total: campaigns.length,
      drafts: campaigns.filter((campaign) => campaign.effectiveStatus === "DRAFT").length,
      scheduled: campaigns.filter((campaign) => campaign.effectiveStatus === "SCHEDULED").length,
    };
  }, [campaigns]);

  const runAction = async () => {
    if (!pending) return;
    const { campaign, action } = pending;
    try {
      setBusyId(campaign.id);
      if (action === "send") await sendCommCampaign(campaign.id);
      if (action === "cancel") await cancelCommCampaign(campaign.id);
      if (action === "delete") await deleteCommCampaign(campaign.id);
      toast.success(
        action === "send"
          ? "Campaign is sending."
          : action === "cancel"
            ? "Campaign cancelled."
            : "Campaign deleted.",
      );
      setPending(null);
      await load();
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const duplicate = async (campaign: CommCampaign) => {
    try {
      setBusyId(campaign.id);
      await duplicateCommCampaign(campaign.id);
      toast.success("Campaign duplicated as a draft.");
      await load();
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not duplicate");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <PageSection
      title="Campaigns"
      description="One-off broadcasts with a full audit trail. Draft, preview, test, schedule and track delivery."
      action={
        canCreate ? (
          <Button onClick={() => onCompose(null)}>
            <Plus className="h-4 w-4" /> New campaign
          </Button>
        ) : null
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search campaigns"
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="DRAFT">Drafts ({counts.drafts})</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="SENDING">Sending</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="PARTIALLY_SENT">Partly sent</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      {error ? <InlineError message={error} onRetry={() => void load()} /> : null}

      {loading ? (
        <LoadingPanel label="Loading campaigns…" />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No campaigns yet"
          description="Create a campaign to reach parents, staff or a specific class over SMS, email or WhatsApp."
          action={
            canCreate ? (
              <Button onClick={() => onCompose(null)}>
                <Plus className="h-4 w-4" /> Create your first campaign
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3">
          {campaigns.map((campaign) => {
            const sentRatio =
              campaign.stats.total > 0
                ? Math.round((campaign.stats.sent / campaign.stats.total) * 100)
                : 0;
            const isBusy = busyId === campaign.id;
            return (
              <div
                key={campaign.id}
                className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/25"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setReport(campaign)}
                        className="truncate text-left text-sm font-semibold text-foreground hover:text-primary"
                      >
                        {campaign.name}
                      </button>
                      <CampaignStatusBadge status={campaign.effectiveStatus} />
                      {campaign.templateName ? (
                        <span className="text-[11px] text-muted-foreground">
                          {campaign.templateName}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {audienceLabel(campaign.audience, options)} ·{" "}
                      {channelListLabel(campaign.channels)}
                      {campaign.scheduledAt
                        ? ` · ${formatDateTime(campaign.scheduledAt)}`
                        : campaign.createdAt
                          ? ` · created ${formatDateTime(campaign.createdAt)}`
                          : ""}
                    </p>
                    {campaign.description ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {campaign.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setReport(campaign)}
                    >
                      <BarChart3 className="h-4 w-4" /> Report
                    </Button>
                    {canEdit(campaign.effectiveStatus) && canCreate ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onCompose(campaign)}
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </Button>
                    ) : null}
                    {canEdit(campaign.effectiveStatus) && canSend ? (
                      <Button
                        size="sm"
                        onClick={() => setPending({ campaign, action: "send" })}
                        disabled={isBusy}
                      >
                        {isBusy ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Send
                      </Button>
                    ) : null}
                    {canCreate ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void duplicate(campaign)}
                        disabled={isBusy}
                      >
                        <Copy className="h-4 w-4" /> Duplicate
                      </Button>
                    ) : null}
                    {canManage && canCancel(campaign.effectiveStatus) ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPending({ campaign, action: "cancel" })}
                        disabled={isBusy}
                      >
                        <Ban className="h-4 w-4" /> Cancel
                      </Button>
                    ) : null}
                    {canManage && canDelete(campaign.effectiveStatus) ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-600 hover:bg-rose-50"
                        onClick={() => setPending({ campaign, action: "delete" })}
                        disabled={isBusy}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        {formatNumber(campaign.stats.sent)} sent ·{" "}
                        {formatNumber(campaign.stats.failed)} failed ·{" "}
                        {formatNumber(campaign.stats.queued)} queued
                      </span>
                      <span>{sentRatio}%</span>
                    </div>
                    <div className="mt-1.5">
                      <ProgressBar
                        value={campaign.stats.sent + campaign.stats.failed}
                        total={campaign.stats.total || 1}
                        tone={campaign.stats.failed ? "bg-amber-500" : "bg-emerald-500"}
                      />
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{formatNumber(campaign.recipientCount)} recipients</p>
                    <p>{campaign.stats.deliveryRate}% confirmed</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CampaignReportDialog
        campaign={report}
        open={Boolean(report)}
        onClose={() => setReport(null)}
        onChanged={() => {
          void load();
          onChanged();
        }}
      />

      <AlertDialog
        open={Boolean(pending)}
        onOpenChange={(next) => !next && setPending(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.action === "send"
                ? "Send this campaign?"
                : pending?.action === "cancel"
                  ? "Cancel this campaign?"
                  : "Delete this campaign?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.action === "send"
                ? "Recipients will be resolved now. SMS spends credits and quiet hours/opt-outs still apply."
                : pending?.action === "cancel"
                  ? "Queued messages will be cancelled. Already-sent messages are unaffected."
                  : "This permanently removes the draft/cancelled campaign record."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void runAction()}
              className={cn(
                pending?.action === "delete" && "bg-rose-600 hover:bg-rose-700",
              )}
            >
              {pending?.action === "send"
                ? "Send now"
                : pending?.action === "cancel"
                  ? "Cancel campaign"
                  : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageSection>
  );
}
