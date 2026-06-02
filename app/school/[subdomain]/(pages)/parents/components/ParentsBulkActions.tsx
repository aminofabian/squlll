"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import type { ParentsListItem } from "../utils/mapGraphqlParent";
import { exportParentsToCsv } from "../utils/exportParentsCsv";
import { resendPendingParentInvitations } from "../utils/parentInvitationActions";
import type { ParentInvitation } from "../types";

interface ParentsBulkActionsProps {
  parents: ParentsListItem[];
  invitations: ParentInvitation[];
  onInvitationsUpdated?: () => void;
}

export function ParentsBulkActions({
  parents,
  invitations,
  onInvitationsUpdated,
}: ParentsBulkActionsProps) {
  const [isResending, setIsResending] = useState(false);

  const pendingInviteIds = invitations
    .filter((inv) => inv.status === "PENDING")
    .map((inv) => inv.id);

  const handleExport = () => {
    if (parents.length === 0) {
      toast.error("No parents to export");
      return;
    }
    const date = new Date().toISOString().slice(0, 10);
    exportParentsToCsv(parents, `parents-${date}.csv`);
    toast.success(
      `Exported ${parents.length} parent${parents.length !== 1 ? "s" : ""}`,
    );
  };

  const handleResendAll = async () => {
    if (pendingInviteIds.length === 0) {
      toast.error("No pending invitations to resend");
      return;
    }

    setIsResending(true);
    try {
      const { succeeded, failed } =
        await resendPendingParentInvitations(pendingInviteIds);
      if (succeeded > 0) {
        toast.success(
          `Resent ${succeeded} invitation${succeeded !== 1 ? "s" : ""}`,
        );
        onInvitationsUpdated?.();
      }
      if (failed > 0) {
        toast.error(
          `${failed} invitation${failed !== 1 ? "s" : ""} could not be resent`,
        );
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to resend invitations",
      );
    } finally {
      setIsResending(false);
    }
  };

  if (parents.length === 0 && pendingInviteIds.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {parents.length > 0 ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={handleExport}
        >
          <Download className="h-3.5 w-3.5" />
          Export parent list
          <span className="text-slate-400">({parents.length})</span>
        </Button>
      ) : null}
      {pendingInviteIds.length > 0 ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => void handleResendAll()}
          disabled={isResending}
        >
          {isResending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Mail className="h-3.5 w-3.5" />
          )}
          Resend pending invites
          <span className="text-slate-400">({pendingInviteIds.length})</span>
        </Button>
      ) : null}
    </div>
  );
}
