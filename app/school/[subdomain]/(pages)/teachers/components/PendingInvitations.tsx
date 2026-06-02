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
      <tr className="text-slate-700 transition-colors hover:bg-slate-50/80 dark:text-slate-300 dark:hover:bg-slate-800/40">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <p
              className="truncate font-medium text-slate-800 dark:text-slate-100"
              title={invitation.email}
            >
              {invitation.email}
            </p>
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
            className={cn(
              "text-[10px] font-normal capitalize",
              invitation.status === "PENDING"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : invitation.status === "ACCEPTED"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-600",
            )}
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
              <p className="truncate text-[11px] text-slate-400" title={invitation.invitedBy.email}>
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
        <td className="hidden px-4 py-3 text-xs text-slate-500 lg:table-cell">
          {expiresAt ? (
            <span className={isExpired ? "font-medium text-red-600" : undefined}>
              {formatDate(expiresAt)}
            </span>
          ) : (
            "Never"
          )}
        </td>
        <td className="px-4 py-3">
          {(isPending || isAccepted) && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {isPending && (
                <>
                  <button
                    type="button"
                    onClick={() => onResend(invitation.id)}
                    disabled={isResending}
                    className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-50"
                  >
                    {isResending ? "Sending…" : "Resend"}
                  </button>
                  <span className="text-slate-200">·</span>
                  <button
                    type="button"
                    onClick={() => setConfirmRevokeOpen(true)}
                    disabled={isRevoking}
                    className="text-xs text-slate-500 hover:text-red-600 disabled:opacity-50"
                  >
                    {isRevoking ? "Revoking…" : "Revoke"}
                  </button>
                  <span className="text-slate-200">·</span>
                </>
              )}
              <button
                type="button"
                onClick={() => onActivate(invitation)}
                disabled={isActivating}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-900 disabled:opacity-50"
              >
                {isActivating ? "Activating…" : "Activate"}
              </button>
            </div>
          )}
        </td>
      </tr>

      <AlertDialog open={confirmRevokeOpen} onOpenChange={setConfirmRevokeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the invitation for{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {invitation.email}
              </span>
              . They will no longer be able to accept it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep invitation</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
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
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
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
      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              <h2 className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Pending invitations
              </h2>
            </div>
            <p className="mt-0.5 pl-4 text-xs text-slate-400">
              {invitations.length} awaiting response — resend or activate when ready
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-left dark:border-slate-800 dark:bg-slate-900/60">
              <th className={teachersTh}>Email</th>
              <th className={teachersTh}>Role</th>
              <th className={teachersTh}>Status</th>
              <th className={cn(teachersTh, "hidden sm:table-cell")}>Invited by</th>
              <th className={cn(teachersTh, "hidden md:table-cell")}>Created</th>
              <th className={cn(teachersTh, "hidden lg:table-cell")}>Expires</th>
              <th className={teachersTh}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
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
    </div>
  );
}
