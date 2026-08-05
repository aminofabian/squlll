"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import type { TeachersListItem } from "../utils/mapGraphqlTeacher";
import { exportTeachersToCsv } from "../utils/exportTeachersCsv";
import { resendPendingInvitations } from "../utils/invitationActions";
import type { PendingInvitation } from "@/lib/stores/usePendingInvitationsStore";

interface TeachersBulkActionsProps {
  teachers: TeachersListItem[];
  invitations: PendingInvitation[];
  onInvitationsUpdated?: () => void;
}

export function TeachersBulkActions({
  teachers,
  invitations,
  onInvitationsUpdated,
}: TeachersBulkActionsProps) {
  const [isResending, setIsResending] = useState(false);

  const pendingInviteIds = invitations
    .filter((inv) => inv.status === "PENDING")
    .map((inv) => inv.id);

  const handleExport = () => {
    if (teachers.length === 0) {
      toast.error("No teachers to export");
      return;
    }
    const date = new Date().toISOString().slice(0, 10);
    exportTeachersToCsv(teachers, `teachers-${date}.csv`);
    toast.success(`Exported ${teachers.length} teacher${teachers.length !== 1 ? "s" : ""}`);
  };

  const handleResendAll = async () => {
    if (pendingInviteIds.length === 0) {
      toast.error("No pending invitations to resend");
      return;
    }

    setIsResending(true);
    try {
      const { succeeded, failed } = await resendPendingInvitations(
        pendingInviteIds,
      );
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

  if (teachers.length === 0 && pendingInviteIds.length === 0) {
    return null;
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-1">
      {teachers.length > 0 ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-6 gap-1 rounded-none border-[#1a4d42]/15 px-2 text-[11px] text-[#0a1f1a] hover:border-[#246a59]/40 hover:bg-[#246a59]/[0.06]"
          onClick={handleExport}
        >
          <Download className="h-3 w-3" />
          Export
          <span className="text-[#1a4d42]/40">({teachers.length})</span>
        </Button>
      ) : null}
      {pendingInviteIds.length > 0 ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-6 gap-1 rounded-none border-[#1a4d42]/15 px-2 text-[11px] text-[#0a1f1a] hover:border-[#246a59]/40 hover:bg-[#246a59]/[0.06]"
          onClick={() => void handleResendAll()}
          disabled={isResending}
        >
          {isResending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Mail className="h-3 w-3" />
          )}
          Resend invites
          <span className="text-[#1a4d42]/40">({pendingInviteIds.length})</span>
        </Button>
      ) : null}
    </div>
  );
}
