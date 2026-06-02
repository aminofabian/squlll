"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { formatParentDate } from "../utils/parents-utils";
import {
  resendParentInvitation,
  revokeParentInvitation,
} from "../utils/parentInvitationActions";
import { useParentAdminActions } from "@/lib/hooks/useParentAdminActions";
import { parentsPanel } from "./parents-ui";
import type { ParentInvitation } from "../types";
import { toast } from "sonner";
import {
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { SetTeacherPasswordDialog } from "../../teachers/components/SetTeacherPasswordDialog";

interface ParentAccountPanelProps {
  parentId: string;
  email: string;
  name: string;
  isActive: boolean;
  userId?: string | null;
  hasCompletedProfile?: boolean;
  pendingInvitation?: ParentInvitation | null;
  onUpdated?: () => void;
}

function invitationStatusBadge(invitation: ParentInvitation | undefined | null) {
  if (!invitation) {
    return (
      <Badge
        variant="outline"
        className="border-slate-200 bg-slate-50 text-[10px] font-medium text-slate-600"
      >
        No pending invite
      </Badge>
    );
  }

  const isExpired =
    invitation.expiresAt && new Date(invitation.expiresAt) < new Date();

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-medium capitalize",
        invitation.status === "PENDING"
          ? isExpired
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-amber-200 bg-amber-50 text-amber-700"
          : invitation.status === "ACCEPTED"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-slate-200 bg-slate-50 text-slate-600",
      )}
    >
      {isExpired && invitation.status === "PENDING"
        ? "Expired"
        : invitation.status.toLowerCase()}
    </Badge>
  );
}

export function ParentAccountPanel({
  parentId,
  email,
  name,
  isActive,
  userId,
  hasCompletedProfile,
  pendingInvitation,
  onUpdated,
}: ParentAccountPanelProps) {
  const { activateParentRecord, setParentPassword, isActivating, isSettingPassword } =
    useParentAdminActions();
  const [isResending, setIsResending] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const accountStatus = isActive
    ? "Active — can sign in to parent portal"
    : userId
      ? "Account created — awaiting activation"
      : pendingInvitation
        ? "Invitation sent — not yet accepted"
        : "No login account";

  const handleResend = async () => {
    if (!pendingInvitation) return;
    setIsResending(true);
    try {
      const result = await resendParentInvitation(pendingInvitation.id);
      toast.success(`Invitation resent to ${result.email}`);
      onUpdated?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to resend invitation",
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleRevoke = async () => {
    if (!pendingInvitation) return;
    setIsRevoking(true);
    try {
      const result = await revokeParentInvitation(pendingInvitation.id);
      toast.success(result.message || "Invitation revoked");
      setRevokeOpen(false);
      onUpdated?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to revoke invitation",
      );
    } finally {
      setIsRevoking(false);
    }
  };

  const handleActivate = async () => {
    try {
      const result = await activateParentRecord(parentId);
      toast.success(result.message || "Parent activated");
      onUpdated?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to activate parent",
      );
    }
  };

  const showInviteActions =
    pendingInvitation &&
    (pendingInvitation.status === "PENDING" ||
      pendingInvitation.status === "ACCEPTED");

  return (
    <>
      <div className={`${parentsPanel} overflow-hidden`}>
        <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Account &amp; access
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Login status, invitation, and account actions
          </p>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50/80 px-3 py-2.5 dark:bg-slate-800/30">
              <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                <ShieldCheck className="h-3 w-3" />
                Account status
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                {accountStatus}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50/80 px-3 py-2.5 dark:bg-slate-800/30">
              <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                <KeyRound className="h-3 w-3" />
                Login linked
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                {userId ? "Yes — user account exists" : "No — invite not accepted"}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50/80 px-3 py-2.5 dark:bg-slate-800/30">
              <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                <Mail className="h-3 w-3" />
                Invitation
              </p>
              <div className="mt-1">
                {invitationStatusBadge(pendingInvitation)}
              </div>
            </div>

            <div className="rounded-lg bg-slate-50/80 px-3 py-2.5 dark:bg-slate-800/30">
              <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                <UserCheck className="h-3 w-3" />
                Profile complete
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                {hasCompletedProfile ? "Yes" : "No — details missing"}
              </p>
            </div>
          </div>

          {pendingInvitation ? (
            <div className="rounded-lg border border-slate-200/80 bg-slate-50/50 px-3 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-400">
              <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <dt className="text-slate-400">Sent</dt>
                  <dd className="font-medium text-slate-700 dark:text-slate-200">
                    {formatParentDate(pendingInvitation.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400">Expires</dt>
                  <dd className="font-medium text-slate-700 dark:text-slate-200">
                    {pendingInvitation.expiresAt
                      ? formatParentDate(pendingInvitation.expiresAt)
                      : "No expiry"}
                  </dd>
                </div>
                {pendingInvitation.invitedBy ? (
                  <div className="sm:col-span-2">
                    <dt className="text-slate-400">Invited by</dt>
                    <dd className="font-medium text-slate-700 dark:text-slate-200">
                      {pendingInvitation.invitedBy.name}
                      <span className="ml-1 font-normal text-slate-400">
                        ({pendingInvitation.invitedBy.email})
                      </span>
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {!isActive ? (
              <Button
                type="button"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => void handleActivate()}
                disabled={isActivating}
              >
                {isActivating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <UserCheck className="h-3.5 w-3.5" />
                )}
                {isActivating ? "Activating…" : "Activate account"}
              </Button>
            ) : null}

            {userId ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setPasswordDialogOpen(true)}
              >
                <KeyRound className="h-3.5 w-3.5" />
                Set password
              </Button>
            ) : null}

            {showInviteActions && pendingInvitation?.status === "PENDING" ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => void handleResend()}
                  disabled={isResending}
                >
                  {isResending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Mail className="h-3.5 w-3.5" />
                  )}
                  {isResending ? "Sending…" : "Resend invitation"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 border-red-200 text-xs text-red-700 hover:bg-red-50"
                  onClick={() => setRevokeOpen(true)}
                  disabled={isRevoking}
                >
                  Revoke invitation
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <AlertDialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              This cancels the invitation for {email}. They will no longer be
              able to accept it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRevoking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleRevoke();
              }}
              disabled={isRevoking}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRevoking ? "Revoking…" : "Revoke invitation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {userId ? (
        <SetTeacherPasswordDialog
          open={passwordDialogOpen}
          onOpenChange={setPasswordDialogOpen}
          teacherName={name}
          isSubmitting={isSettingPassword}
          onSubmit={async (password) => {
            await setParentPassword(userId, password);
            toast.success("Password updated");
            onUpdated?.();
          }}
        />
      ) : null}
    </>
  );
}
