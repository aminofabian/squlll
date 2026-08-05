"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { parentsPanel, parentsTh } from "./parents-ui";
import type { ParentInvitation } from "../types";
import { revokeParentInvitation, resendParentInvitation } from "../utils/parentInvitationActions";

interface PendingParentInvitationsProps {
  invitations: ParentInvitation[];
  isLoading: boolean;
  error: string | null;
  onInvitationRevoked?: () => void;
  onInvitationResent?: () => void;
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PendingParentInvitations({
  invitations,
  isLoading,
  error,
  onInvitationRevoked,
  onInvitationResent,
}: PendingParentInvitationsProps) {
  const [revokingIds, setRevokingIds] = useState<Set<string>>(new Set());
  const [resendingIds, setResendingIds] = useState<Set<string>>(new Set());
  const [confirmRevoke, setConfirmRevoke] = useState<ParentInvitation | null>(
    null,
  );
  const [expanded, setExpanded] = useState(false);

  const handleRevoke = async (invitationId: string) => {
    setRevokingIds((prev) => new Set(prev).add(invitationId));
    try {
      const result = await revokeParentInvitation(invitationId);
      toast.success(result.message || "Invitation revoked");
      onInvitationRevoked?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to revoke invitation",
      );
    } finally {
      setRevokingIds((prev) => {
        const next = new Set(prev);
        next.delete(invitationId);
        return next;
      });
    }
  };

  const handleResend = async (invitationId: string, email: string) => {
    setResendingIds((prev) => new Set(prev).add(invitationId));
    try {
      await resendParentInvitation(invitationId);
      toast.success(`Invitation resent to ${email}`);
      onInvitationResent?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to resend invitation",
      );
    } finally {
      setResendingIds((prev) => {
        const next = new Set(prev);
        next.delete(invitationId);
        return next;
      });
    }
  };

  if (!isLoading && !error && invitations.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={parentsPanel}>
        <div className="flex items-center justify-center px-4 py-10">
          <Loader2 className="h-5 w-5 animate-spin text-[#1a4d42]/45" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={parentsPanel}>
        <div className="px-4 py-4 text-sm text-red-600">
          Error loading invitations: {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={parentsPanel}>
        <button
          type="button"
          id="pending-invites-heading"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between gap-3 bg-[#f8fbfa] px-3 py-1.5 text-left transition-colors hover:bg-[#eef5f2] dark:bg-[#071411] dark:hover:bg-[#0c1a17]"
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-none bg-amber-400 opacity-40" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-none bg-amber-500" />
            </span>
            <h2 className="text-xs font-semibold text-[#0a1f1a] dark:text-white">
              Pending invitations
            </h2>
            <span className="tabular-nums text-[11px] text-amber-700">
              {invitations.length}
            </span>
          </div>
          <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#1a4d42]/45">
            {expanded ? "Hide" : "Show"}
          </span>
        </button>

        {expanded ? (
          <div className="max-h-[180px] overflow-auto border-t border-[#1a4d42]/10">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-[#1a4d42]/10 bg-[#f8fbfa] text-left dark:border-white/10 dark:bg-[#071411]">
                  <th className={cn(parentsTh, "px-2 py-1.5")}>Email</th>
                  <th className={cn(parentsTh, "px-2 py-1.5")}>Role</th>
                  <th className={cn(parentsTh, "px-2 py-1.5")}>Status</th>
                  <th className={cn(parentsTh, "hidden px-2 py-1.5 sm:table-cell")}>
                    Invited by
                  </th>
                  <th className={cn(parentsTh, "hidden px-2 py-1.5 md:table-cell")}>
                    Sent
                  </th>
                  <th className={cn(parentsTh, "px-2 py-1.5")}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a4d42]/10 dark:divide-white/10">
                {invitations.map((invitation) => {
                  const isRevoking = revokingIds.has(invitation.id);
                  const isResending = resendingIds.has(invitation.id);
                  return (
                    <tr
                      key={invitation.id}
                      className="text-[#1a4d42]/80 transition-colors hover:bg-[#f8fbfa] dark:text-white/70 dark:hover:bg-white/5"
                    >
                      <td className="px-2 py-1.5">
                        <div className="flex min-w-0 items-center gap-2">
                          <Mail className="h-3 w-3 shrink-0 text-[#246a59]" />
                          <span
                            className="truncate text-xs font-medium text-[#0a1f1a] dark:text-white"
                            title={invitation.email}
                          >
                            {invitation.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <Badge
                          variant="outline"
                          className="rounded-none border-[#246a59]/25 bg-[#e8f2ef] text-[9px] font-normal capitalize text-[#1a4d42]"
                        >
                          {invitation.role.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="px-2 py-1.5">
                        <Badge
                          variant="outline"
                          className="rounded-none border-amber-200 bg-amber-50 text-[9px] font-normal capitalize text-amber-700"
                        >
                          {invitation.status.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="hidden px-2 py-1.5 sm:table-cell">
                        {invitation.invitedBy ? (
                          <p className="max-w-[140px] truncate text-[11px] text-[#1a4d42]/65">
                            {invitation.invitedBy.name}
                          </p>
                        ) : (
                          <span className="text-[11px] text-[#1a4d42]/45">System</span>
                        )}
                      </td>
                      <td className="hidden px-2 py-1.5 text-[11px] text-[#1a4d42]/55 md:table-cell">
                        {formatDateTime(invitation.createdAt)}
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="flex flex-wrap gap-x-1.5">
                          {invitation.status === "PENDING" ? (
                            <button
                              type="button"
                              onClick={() =>
                                void handleResend(invitation.id, invitation.email)
                              }
                              disabled={isResending || isRevoking}
                              className="text-[11px] text-[#1a4d42]/55 hover:text-[#246a59] disabled:opacity-50"
                            >
                              {isResending ? "Sending…" : "Resend"}
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setConfirmRevoke(invitation)}
                            disabled={isRevoking || isResending}
                            className="text-[11px] text-[#1a4d42]/55 hover:text-red-600 disabled:opacity-50"
                          >
                            {isRevoking ? "Revoking…" : "Revoke"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <AlertDialog
        open={!!confirmRevoke}
        onOpenChange={(open) => !open && setConfirmRevoke(null)}
      >
        <AlertDialogContent className="rounded-none border border-[#1a4d42]/12">
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the invitation for{" "}
              <span className="font-medium text-[#1a4d42]/80 dark:text-white/70">
                {confirmRevoke?.email}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Keep invitation</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-none bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (confirmRevoke) {
                  void handleRevoke(confirmRevoke.id);
                }
                setConfirmRevoke(null);
              }}
            >
              Revoke invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
