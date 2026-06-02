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
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
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
        <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            <div>
              <h2 className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Pending invitations
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                {invitations.length} awaiting response
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left dark:border-slate-800 dark:bg-slate-900/60">
                <th className={parentsTh}>Email</th>
                <th className={parentsTh}>Role</th>
                <th className={parentsTh}>Status</th>
                <th className={cn(parentsTh, "hidden sm:table-cell")}>
                  Invited by
                </th>
                <th className={cn(parentsTh, "hidden md:table-cell")}>Sent</th>
                <th className={parentsTh}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invitations.map((invitation) => {
                const isRevoking = revokingIds.has(invitation.id);
                const isResending = resendingIds.has(invitation.id);
                return (
                  <tr
                    key={invitation.id}
                    className="text-slate-700 transition-colors hover:bg-slate-50/80 dark:text-slate-300 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span
                          className="truncate font-medium text-slate-800 dark:text-slate-100"
                          title={invitation.email}
                        >
                          {invitation.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className="border-sky-200 bg-sky-50 text-[10px] font-normal capitalize text-sky-700"
                      >
                        {invitation.role.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className="border-amber-200 bg-amber-50 text-[10px] font-normal capitalize text-amber-700"
                      >
                        {invitation.status.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      {invitation.invitedBy ? (
                        <div className="min-w-0 max-w-[180px]">
                          <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                            {invitation.invitedBy.name}
                          </p>
                          <p className="truncate text-[11px] text-slate-400">
                            {invitation.invitedBy.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">System</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-slate-500 md:table-cell">
                      {formatDateTime(invitation.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {invitation.status === "PENDING" ? (
                          <button
                            type="button"
                            onClick={() =>
                              void handleResend(invitation.id, invitation.email)
                            }
                            disabled={isResending || isRevoking}
                            className="text-xs text-slate-500 hover:text-emerald-700 disabled:opacity-50"
                          >
                            {isResending ? "Sending…" : "Resend"}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setConfirmRevoke(invitation)}
                          disabled={isRevoking || isResending}
                          className="text-xs text-slate-500 hover:text-red-600 disabled:opacity-50"
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
      </div>

      <AlertDialog
        open={!!confirmRevoke}
        onOpenChange={(open) => !open && setConfirmRevoke(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the invitation for{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {confirmRevoke?.email}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep invitation</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
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
