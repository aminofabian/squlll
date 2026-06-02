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
    <div className="flex flex-wrap items-center gap-2">
      {teachers.length > 0 ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={handleExport}
        >
          <Download className="h-3.5 w-3.5" />
          Export staff list
          <span className="text-slate-400">({teachers.length})</span>
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
