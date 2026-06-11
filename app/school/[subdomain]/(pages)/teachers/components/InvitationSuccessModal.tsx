"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Copy,
  Check,
  Mail,
  Sparkles,
  ShieldAlert,
  Clock,
  ExternalLink,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InvitationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitationData: {
    email: string;
    fullName: string;
    status: string;
    createdAt: string;
    emailSent?: boolean;
  };
  schoolSubdomain?: string;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatSentAt(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function InvitationSuccessModal({
  isOpen,
  onClose,
  invitationData,
  schoolSubdomain = "school",
}: InvitationSuccessModalProps) {
  const [copied, setCopied] = useState(false);
  const emailFailed = invitationData.emailSent === false;
  const portalUrl = `${schoolSubdomain}.squl.co.ke/teacher`;

  const copyEmail = async () => {
    await navigator.clipboard.writeText(invitationData.email);
    setCopied(true);
    toast.success("Email copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="gap-0 overflow-hidden border-0 p-0 sm:max-w-[460px]">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-primary/10 bg-gradient-to-br from-primary/[0.08] via-white to-primary/[0.04] px-6 pb-5 pt-6 dark:from-primary/15 dark:via-slate-900 dark:to-primary/5">
          <div
            className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-primary/15 blur-3xl"
            aria-hidden
          />
          <div className="relative flex flex-col items-center text-center">
            <div
              className={cn(
                "mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg",
                emailFailed
                  ? "bg-amber-500 shadow-amber-500/25"
                  : "bg-primary shadow-primary/30",
              )}
            >
              {emailFailed ? (
                <AlertTriangle className="h-7 w-7" strokeWidth={1.75} />
              ) : (
                <CheckCircle2 className="h-7 w-7" strokeWidth={1.75} />
              )}
            </div>
            <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              {emailFailed ? "Teacher registered" : "Invitation sent"}
            </DialogTitle>
            <DialogDescription className="mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">
              {emailFailed ? (
                <>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {invitationData.fullName}
                  </span>{" "}
                  is saved — resend the invite when email is working.
                </>
              ) : (
                <>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {invitationData.fullName}
                  </span>{" "}
                  will get an email to set up their account.
                </>
              )}
            </DialogDescription>
          </div>
        </div>

        <div className="max-h-[min(70vh,520px)] space-y-4 overflow-y-auto bg-slate-50/80 px-5 py-5 dark:bg-slate-950/80">
          {/* Teacher card */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-dark via-slate-800 to-primary/70 p-[1px] shadow-md shadow-primary/10">
            <div className="rounded-[15px] bg-gradient-to-br from-primary-dark to-slate-800 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-base font-bold text-white ring-1 ring-white/20">
                  {initialsFromName(invitationData.fullName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">
                    {invitationData.fullName}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-xs text-white/55">
                    {invitationData.email}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge
                      className={cn(
                        "h-5 border-0 px-2 text-[10px] font-medium capitalize hover:bg-transparent",
                        emailFailed
                          ? "bg-amber-500/20 text-amber-100"
                          : "bg-primary-light/30 text-white/90",
                      )}
                    >
                      {invitationData.status.toLowerCase()}
                    </Badge>
                    <span className="flex items-center gap-1 text-[10px] text-white/45">
                      <Clock className="h-3 w-3" />
                      {formatSentAt(invitationData.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Email copy */}
          <div className="overflow-hidden rounded-2xl border border-primary/15 bg-primary/[0.04] dark:border-primary/20 dark:bg-primary/10">
            <div className="flex items-center justify-between border-b border-primary/10 px-4 py-3 dark:border-primary/15">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Invitation email
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {emailFailed ? "Copy and share manually if needed" : "Sent to this address"}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void copyEmail()}
                className="h-8 gap-1.5 rounded-full border-primary/20 bg-white text-xs text-primary hover:bg-primary/5 dark:bg-slate-900"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="p-3">
              <p className="truncate rounded-xl bg-white/80 px-3 py-2.5 font-mono text-sm text-slate-800 ring-1 ring-inset ring-primary/10 dark:bg-slate-900/60 dark:text-slate-100">
                {invitationData.email}
              </p>
              {!emailFailed && (
                <p className="mt-2 truncate font-mono text-[11px] text-slate-500">
                  Portal: {portalUrl}
                </p>
              )}
            </div>
          </div>

          {/* Next steps — single panel */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              What happens next
            </p>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              {emailFailed ? (
                <>
                  <li className="flex items-start gap-2">
                    <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                    Open{" "}
                    <Link
                      href="/teachers"
                      className="font-medium text-primary hover:underline"
                      onClick={onClose}
                    >
                      Pending invitations
                    </Link>{" "}
                    on the Teachers page and tap Resend.
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    The teacher record is already saved — nothing else to re-enter.
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    They&apos;ll receive a link to create their password and join.
                  </li>
                  <li className="flex items-start gap-2">
                    <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    Assign grades and subjects from their profile once they sign in.
                  </li>
                  <li className="flex items-start gap-2">
                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    They&apos;ll appear in your teachers list after accepting.
                  </li>
                </>
              )}
            </ul>
          </div>

          {emailFailed && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/80 px-3.5 py-3 dark:border-amber-900/40 dark:bg-amber-950/20">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200/90">
                Email delivery failed — often a mail config issue in dev. Resend from Pending invitations when ready.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200/80 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
          <Button
            onClick={onClose}
            className="h-11 w-full rounded-full bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-dark"
          >
            {emailFailed ? "Got it — I'll resend later" : "Done"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
