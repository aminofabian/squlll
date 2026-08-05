"use client";

import React, { useState } from "react";
import { teachersPanel, teachersTh } from "./teachers-ui";
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
import { PendingInvitation } from "@/lib/stores/usePendingInvitationsStore";
import {
  findTeacherIdByEmail,
  resendTeacherInvitation,
  revokeTeacherInvitation,
} from "../utils/invitationActions";
import { useTeacherAdminActions } from "@/lib/hooks/useTeacherAdminActions";

interface PendingInvitationsProps {
  invitations: PendingInvitation[];
  isLoading: boolean;
  error: string | null;
  onInvitationResent?: (invitationId: string) => void;
  onInvitationRevoked?: (invitationId: string) => void;
  onTeacherActivated?: (invitationId: string) => void;
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface InvitationRowProps {
  invitation: PendingInvitation;
  resendingIds: Set<string>;
  revokingIds: Set<string>;
  activatingEmails: Set<string>;
  onResend: (id: string) => void;
  onRevoke: (id: string) => void;
  onActivate: (invitation: PendingInvitation) => void;
}

function InvitationTableRow({
  invitation,
  resendingIds,
  revokingIds,
  activatingEmails,
  onResend,
  onRevoke,
  onActivate,
}: InvitationRowProps) {
  const [confirmRevokeOpen, setConfirmRevokeOpen] = useState(false);
  const isResending = resendingIds.has(invitation.id);
  const isRevoking = revokingIds.has(invitation.id);
  const isActivating = activatingEmails.has(invitation.email);
  const isPending = invitation.status === "PENDING";
  const isAccepted = invitation.status === "ACCEPTED";
  const expiresAt = invitation.expiresAt;
  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;

  return (
    <>
      <tr className="text-[#1a4d42]/80 transition-colors hover:bg-[#f8fbfa] dark:text-white/70 dark:hover:bg-white/5">
        <td className="px-2 py-1.5">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-none bg-[#246a59]/10">
              <Mail className="h-3 w-3 text-[#246a59]" />
            </div>
            <p
              className="truncate text-xs font-medium text-[#0a1f1a] dark:text-white"
              title={invitation.email}
            >
              {invitation.email}
            </p>
          </div>
        </td>
        <td className="px-2 py-1.5">
          <Badge
            variant="outline"
            className="rounded-none border-[#246a59]/25 bg-[#246a59]/10 text-[9px] font-normal capitalize text-[#246a59]"
          >
            {invitation.role.toLowerCase()}
          </Badge>
        </td>
        <td className="px-2 py-1.5">
          <Badge
            variant="outline"
            className={cn(
              "rounded-none text-[9px] font-normal capitalize",
              invitation.status === "PENDING"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : invitation.status === "ACCEPTED"
                  ? "border-[#246a59]/25 bg-[#246a59]/10 text-[#246a59]"
                  : "border-[#1a4d42]/12 bg-[#f8fbfa] text-[#1a4d42]/70",
            )}
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
        <td className="hidden px-2 py-1.5 text-[11px] text-[#1a4d42]/55 lg:table-cell">
          {expiresAt ? (
            <span className={isExpired ? "font-medium text-red-600" : undefined}>
              {formatDate(expiresAt)}
            </span>
          ) : (
            "Never"
          )}
        </td>
        <td className="px-2 py-1.5">
          {(isPending || isAccepted) && (
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              {isPending && (
                <>
                  <button
                    type="button"
                    onClick={() => onResend(invitation.id)}
                    disabled={isResending}
                    className="text-[11px] text-[#1a4d42]/55 hover:text-[#246a59] disabled:opacity-50"
                  >
                    {isResending ? "Sending…" : "Resend"}
                  </button>
                  <span className="text-[#1a4d42]/20">·</span>
                  <button
                    type="button"
                    onClick={() => setConfirmRevokeOpen(true)}
                    disabled={isRevoking}
                    className="text-[11px] text-[#1a4d42]/55 hover:text-red-600 disabled:opacity-50"
                  >
                    {isRevoking ? "Revoking…" : "Revoke"}
                  </button>
                  <span className="text-[#1a4d42]/20">·</span>
                </>
              )}
              <button
                type="button"
                onClick={() => onActivate(invitation)}
                disabled={isActivating}
                className="text-[11px] font-medium text-[#246a59] hover:text-[#1a4d42] disabled:opacity-50"
              >
                {isActivating ? "Activating…" : "Activate"}
              </button>
            </div>
          )}
        </td>
      </tr>

      <AlertDialog open={confirmRevokeOpen} onOpenChange={setConfirmRevokeOpen}>
        <AlertDialogContent className="rounded-none border border-[#1a4d42]/12">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-[#0a1f1a]">Revoke invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the invitation for{" "}
              <span className="font-medium text-[#0a1f1a] dark:text-white">
                {invitation.email}
              </span>
              . They will no longer be able to accept it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Keep invitation</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-none bg-red-600 hover:bg-red-700"
              onClick={() => {
                setConfirmRevokeOpen(false);
                onRevoke(invitation.id);
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

export function PendingInvitations({ invitations, isLoading, error, onInvitationResent, onInvitationRevoked, onTeacherActivated }: PendingInvitationsProps) {
  const [resendingIds, setResendingIds] = useState<Set<string>>(new Set());
  const [revokingIds, setRevokingIds] = useState<Set<string>>(new Set());
  const [activatingEmails, setActivatingEmails] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(false);
  const { activateTeacherRecord } = useTeacherAdminActions();

  const resendInvitation = async (invitationId: string) => {
    setResendingIds((prev) => new Set(prev).add(invitationId));

    try {
      const resendData = await resendTeacherInvitation(invitationId);
      toast.success(`Invitation has been resent to ${resendData.email}`);
      onInvitationResent?.(invitationId);
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

  const revokeInvitation = async (invitationId: string) => {
    setRevokingIds((prev) => new Set(prev).add(invitationId));

    try {
      const revokeData = await revokeTeacherInvitation(invitationId);
      toast.success(revokeData.message || "Invitation revoked successfully");
      onInvitationRevoked?.(invitationId);
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

  const activateTeacher = async (invitation: PendingInvitation) => {
    const email = invitation.email;
    setActivatingEmails((prev) => new Set(prev).add(email));

    try {
      const teacherId = await findTeacherIdByEmail(invitation.email);
      if (!teacherId) {
        throw new Error(
          `Could not find teacher record for ${email}. They may need to accept the invitation first.`,
        );
      }

      const activateData = await activateTeacherRecord(teacherId);
      toast.success(
        activateData.message ||
          `Teacher ${activateData.email ?? email} has been activated successfully.`,
      );

      if (onTeacherActivated) {
        onTeacherActivated(invitation.id);
      } else {
        onInvitationResent?.(invitation.id);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to activate teacher",
      );
    } finally {
      setActivatingEmails((prev) => {
        const next = new Set(prev);
        next.delete(email);
        return next;
      });
    }
  };

  if (!isLoading && !error && invitations.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={teachersPanel}>
        <div className="flex items-center justify-center px-4 py-10">
          <Loader2 className="h-5 w-5 animate-spin text-[#1a4d42]/40" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={teachersPanel}>
        <div className="px-4 py-4 text-sm text-red-600">
          Error loading invitations: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={teachersPanel}>
      <button
        type="button"
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
                <th className={cn(teachersTh, "px-2 py-1.5")}>Email</th>
                <th className={cn(teachersTh, "px-2 py-1.5")}>Role</th>
                <th className={cn(teachersTh, "px-2 py-1.5")}>Status</th>
                <th className={cn(teachersTh, "hidden px-2 py-1.5 sm:table-cell")}>
                  Invited by
                </th>
                <th className={cn(teachersTh, "hidden px-2 py-1.5 md:table-cell")}>
                  Created
                </th>
                <th className={cn(teachersTh, "hidden px-2 py-1.5 lg:table-cell")}>
                  Expires
                </th>
                <th className={cn(teachersTh, "px-2 py-1.5")}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a4d42]/10 dark:divide-white/10">
              {invitations.map((invitation) => (
                <InvitationTableRow
                  key={invitation.id}
                  invitation={invitation}
                  resendingIds={resendingIds}
                  revokingIds={revokingIds}
                  activatingEmails={activatingEmails}
                  onResend={resendInvitation}
                  onRevoke={revokeInvitation}
                  onActivate={activateTeacher}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
