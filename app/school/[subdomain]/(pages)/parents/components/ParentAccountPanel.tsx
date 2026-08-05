"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
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
import { parentsActionButton, parentsPanel, parentsSectionLabel } from "./parents-ui";
import type { ParentInvitation } from "../types";
import { toast } from "sonner";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  KeyRound,
  Loader2,
  LogIn,
  Mail,
  Shield,
  ShieldCheck,
  UserCheck,
  XCircle,
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

type AccountPhase =
  | "active"
  | "pending_invite"
  | "expired_invite"
  | "inactive_user"
  | "no_account";

function resolveAccountPhase(
  isActive: boolean,
  userId: string | null | undefined,
  invitation: ParentInvitation | null | undefined,
): AccountPhase {
  if (isActive && userId) return "active";

  const isExpired =
    invitation?.expiresAt && new Date(invitation.expiresAt) < new Date();

  if (invitation?.status === "PENDING") {
    return isExpired ? "expired_invite" : "pending_invite";
  }

  if (userId && !isActive) return "inactive_user";
  return "no_account";
}

const phaseConfig: Record<
  AccountPhase,
  {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
    badge: string;
    badgeClass: string;
  }
> = {
  active: {
    title: "Portal access enabled",
    description: "This parent can sign in and view linked children.",
    icon: CheckCircle2,
    accent: "bg-[#f8fbfa] dark:bg-[#071411]",
    badge: "Active",
    badgeClass:
      "rounded-none border-[#246a59]/25 bg-[#e8f2ef] text-[#1a4d42]",
  },
  pending_invite: {
    title: "Invitation pending",
    description: "Waiting for the parent to accept the email invitation.",
    icon: Mail,
    accent: "bg-[#f8fbfa] dark:bg-[#071411]",
    badge: "Pending signup",
    badgeClass:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300",
  },
  expired_invite: {
    title: "Invitation expired",
    description: "Resend a new invitation or revoke and register again.",
    icon: Clock,
    accent: "bg-[#f8fbfa] dark:bg-[#071411]",
    badge: "Invite expired",
    badgeClass:
      "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300",
  },
  inactive_user: {
    title: "Account needs activation",
    description: "A user record exists but portal access is not enabled yet.",
    icon: UserCheck,
    accent: "bg-[#f8fbfa] dark:bg-[#071411]",
    badge: "Not activated",
    badgeClass:
      "rounded-none border-amber-200 bg-amber-50 text-amber-800",
  },
  no_account: {
    title: "No login account",
    description: "Send an invitation from the parents list to enable portal access.",
    icon: LogIn,
    accent: "bg-[#f8fbfa] dark:bg-[#071411]",
    badge: "No invite",
    badgeClass:
      "border-[#1a4d42]/12 bg-[#f8fbfa] text-[#1a4d42]/70 dark:border-white/15 dark:bg-[#0c1a17] dark:text-[#1a4d42]/45",
  },
};

function AccountMetric({
  label,
  value,
  icon: Icon,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-none border border-[#1a4d42]/10 bg-white px-3 py-2.5 dark:border-white/10 dark:bg-[#0c1a17]">
      <p className={cn(parentsSectionLabel, "flex items-center gap-1")}>
        <Icon className="h-3 w-3 shrink-0" />
        {label}
      </p>
      <div className={cn("mt-1 text-sm font-medium text-[#0a1f1a] dark:text-white", valueClassName)}>
        {value}
      </div>
    </div>
  );
}

function invitationStatusBadge(invitation: ParentInvitation | undefined | null) {
  if (!invitation) {
    return (
      <Badge
        variant="outline"
        className="border-[#1a4d42]/12 bg-[#f8fbfa] text-[10px] font-medium text-[#1a4d42]/70"
      >
        None
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
            ? "border-[#246a59]/25 bg-[#e8f2ef] text-[#1a4d42]"
            : "border-[#1a4d42]/12 bg-[#f8fbfa] text-[#1a4d42]/70",
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

  const phase = useMemo(
    () => resolveAccountPhase(isActive, userId, pendingInvitation),
    [isActive, userId, pendingInvitation],
  );

  const config = phaseConfig[phase];
  const PhaseIcon = config.icon;

  const showInviteActions =
    pendingInvitation &&
    pendingInvitation.status === "PENDING";

  const daysUntilExpiry = useMemo(() => {
    if (!pendingInvitation?.expiresAt) return null;
    const diff =
      new Date(pendingInvitation.expiresAt).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [pendingInvitation?.expiresAt]);

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

  return (
    <>
      <div className="space-y-4">
        <article
          className={cn(
            parentsPanel,
            "overflow-hidden",
            config.accent,
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 sm:px-5">
            <div className="flex min-w-0 gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-none",
                  phase === "active"
                    ? "bg-[#e8f2ef] text-[#246a59]"
                    : phase === "pending_invite" || phase === "expired_invite"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                      : "bg-[#e8f2ef] text-[#1a4d42]/70 dark:bg-[#0c1a17] dark:text-[#1a4d42]/45",
                )}
              >
                <PhaseIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#0a1f1a] dark:text-white">
                    {config.title}
                  </h3>
                  <Badge variant="outline" className={cn("text-[10px] font-medium", config.badgeClass)}>
                    {config.badge}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-[#1a4d42]/55 dark:text-[#1a4d42]/45">
                  {config.description}
                </p>
                <p className="mt-2 truncate text-xs text-[#1a4d42]/70 dark:text-white/70">
                  <span className="text-[#1a4d42]/45">Login email · </span>
                  {email || "—"}
                </p>
              </div>
            </div>

            {phase === "active" ? (
              <Button variant="outline" size="sm" className={cn(parentsActionButton, "shrink-0")} asChild>
                <Link href="/parent">Open parent portal</Link>
              </Button>
            ) : null}
          </div>
        </article>

        {!hasCompletedProfile ? (
          <div className="flex items-center gap-2 rounded-none border border-[#246a59]/20 bg-[#e8f2ef] px-3 py-2 text-[11px] text-[#1a4d42]">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#246a59]" />
            <p>
              <span className="font-semibold">Profile incomplete.</span> Add
              contact details on the Details tab before signup.
            </p>
          </div>
        ) : null}

        <div className={parentsPanel}>
          <div className="border-b border-[#1a4d42]/10 bg-[#f8fbfa] px-4 py-2.5 dark:border-white/10 dark:bg-[#071411] sm:px-5">
            <h4 className="text-sm font-semibold text-[#0a1f1a] dark:text-white">
              Access summary
            </h4>
          </div>
          <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
            <AccountMetric
              label="Portal login"
              icon={LogIn}
              value={userId ? "Linked" : "Not linked"}
              valueClassName={userId ? "text-[#246a59]" : undefined}
            />
            <AccountMetric
              label="Activation"
              icon={ShieldCheck}
              value={isActive ? "Enabled" : "Disabled"}
              valueClassName={
                isActive
                  ? "text-[#246a59]"
                  : "text-amber-700 dark:text-amber-400"
              }
            />
            <AccountMetric
              label="Invitation"
              icon={Mail}
              value={invitationStatusBadge(pendingInvitation)}
            />
            <AccountMetric
              label="Profile"
              icon={UserCheck}
              value={hasCompletedProfile ? "Complete" : "Incomplete"}
              valueClassName={
                hasCompletedProfile
                  ? "text-[#246a59]"
                  : "text-amber-700 dark:text-amber-400"
              }
            />
          </div>
        </div>

        {pendingInvitation ? (
          <div className={cn(parentsPanel, "overflow-hidden")}>
            <div className="border-b border-amber-100/80 bg-amber-50/40 px-4 py-3 dark:border-amber-900/30 dark:bg-amber-950/15 sm:px-5">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-[#0a1f1a] dark:text-white">
                <CalendarClock className="h-4 w-4 text-amber-600" />
                Invitation details
              </h4>
              {daysUntilExpiry !== null && pendingInvitation.status === "PENDING" ? (
                <p className="mt-0.5 text-xs text-[#1a4d42]/55">
                  {daysUntilExpiry > 0
                    ? `Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? "s" : ""}`
                    : "Invitation has expired"}
                </p>
              ) : null}
            </div>
            <dl className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
              <div>
                <dt className={parentsSectionLabel}>Sent</dt>
                <dd className="mt-1 text-sm font-medium text-[#0a1f1a] dark:text-white">
                  {formatParentDate(pendingInvitation.createdAt) ?? "—"}
                </dd>
              </div>
              <div>
                <dt className={parentsSectionLabel}>Expires</dt>
                <dd className="mt-1 text-sm font-medium text-[#0a1f1a] dark:text-white">
                  {pendingInvitation.expiresAt
                    ? formatParentDate(pendingInvitation.expiresAt)
                    : "No expiry set"}
                </dd>
              </div>
              {pendingInvitation.invitedBy ? (
                <div className="sm:col-span-2">
                  <dt className={parentsSectionLabel}>Invited by</dt>
                  <dd className="mt-1 text-sm font-medium text-[#0a1f1a] dark:text-white">
                    {pendingInvitation.invitedBy.name}
                    <span className="ml-1 font-normal text-[#1a4d42]/45">
                      ({pendingInvitation.invitedBy.email})
                    </span>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : null}

        <div className={parentsPanel}>
          <div className="border-b border-[#1a4d42]/10 px-4 py-3 dark:border-white/10 sm:px-5">
            <h4 className="text-sm font-semibold text-[#0a1f1a] dark:text-white">
              Actions
            </h4>
            <p className="mt-0.5 text-xs text-[#1a4d42]/55">
              Manage activation, password, and invitations
            </p>
          </div>
          <div className="space-y-4 p-4 sm:p-5">
            <div>
              <p className={cn(parentsSectionLabel, "mb-2")}>Account</p>
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
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-none border border-[#246a59]/25 bg-[#e8f2ef] px-3 py-1.5 text-xs text-[#1a4d42]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#246a59]" />
                    Account is active
                  </span>
                )}

                {userId ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={parentsActionButton}
                    onClick={() => setPasswordDialogOpen(true)}
                    disabled={isSettingPassword}
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    Set password
                  </Button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-none border border-dashed border-[#1a4d42]/12 px-3 py-1.5 text-xs text-[#1a4d42]/45 dark:border-white/15">
                    <KeyRound className="h-3.5 w-3.5" />
                    Set password after signup
                  </span>
                )}
              </div>
            </div>

            {showInviteActions ? (
              <div className="border-t border-[#1a4d42]/10 pt-4 dark:border-white/10">
                <p className={cn(parentsSectionLabel, "mb-2")}>Invitation</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={parentsActionButton}
                    onClick={() => void handleResend()}
                    disabled={isResending || isRevoking}
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
                    className="h-8 gap-1.5 border-red-200/80 text-xs text-red-700 ring-1 ring-inset ring-red-200/60 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:ring-red-900/40 dark:hover:bg-red-950/30"
                    onClick={() => setRevokeOpen(true)}
                    disabled={isResending || isRevoking}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Revoke invitation
                  </Button>
                </div>
              </div>
            ) : phase === "no_account" ? (
              <p className="border-t border-[#1a4d42]/10 pt-4 text-xs text-[#1a4d42]/55 dark:border-white/10">
                Use <strong className="font-medium text-[#1a4d42]/80 dark:text-white/70">Add parent</strong> on the parents list to send a new invitation to {email || "this guardian"}.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <AlertDialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              This cancels the invitation for{" "}
              <span className="font-medium text-[#1a4d42]/80 dark:text-white/70">
                {email}
              </span>
              . They will no longer be able to accept it.
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
