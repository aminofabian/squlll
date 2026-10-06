"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileJson, FileSpreadsheet, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TeachersListItem } from "../utils/mapGraphqlTeacher";
import {
  exportTeachersToCsv,
  exportTeachersToJson,
} from "../utils/exportTeachersCsv";
import { resendPendingInvitations } from "../utils/invitationActions";
import type { PendingInvitation } from "@/lib/stores/usePendingInvitationsStore";

interface TeachersBulkActionsProps {
  teachers: TeachersListItem[];
  invitations: PendingInvitation[];
  onInvitationsUpdated?: () => void;
}

const actionButtonClass =
  "h-6 gap-1 rounded-none border-[#1a4d42]/15 px-2 text-[11px] text-[#0a1f1a] hover:border-[#246a59]/40 hover:bg-[#246a59]/[0.06]";

export function TeachersBulkActions({
  teachers,
  invitations,
  onInvitationsUpdated,
}: TeachersBulkActionsProps) {
  const [isResending, setIsResending] = useState(false);

  const pendingInviteIds = invitations
    .filter((inv) => inv.status === "PENDING")
    .map((inv) => inv.id);

  const date = new Date().toISOString().slice(0, 10);
  const exportSummary = `Exported ${teachers.length} teacher${teachers.length !== 1 ? "s" : ""}`;

  const handleExportCsv = () => {
    exportTeachersToCsv(teachers, `teachers-${date}.csv`);
    toast.success(exportSummary);
  };

  const handleExportJson = () => {
    exportTeachersToJson(teachers, `teachers-${date}.json`);
    toast.success(exportSummary);
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={actionButtonClass}
            >
              <Download className="h-3 w-3" />
              Export
              <span className="text-[#1a4d42]/40">({teachers.length})</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-none">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-slate-400">
              Download as
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportCsv} className="gap-2 text-xs">
              <FileSpreadsheet className="h-3.5 w-3.5 opacity-70" />
              CSV spreadsheet
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportJson} className="gap-2 text-xs">
              <FileJson className="h-3.5 w-3.5 opacity-70" />
              JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
      {pendingInviteIds.length > 0 ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={actionButtonClass}
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
