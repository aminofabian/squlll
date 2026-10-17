"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  KeyRound,
  Loader2,
  Mail,
  MessageSquare,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { StudentDetailSummary } from "@/types/student";
import type { StudentCredentials } from "@/lib/hooks/useStudentCredentials";
import { cn } from "@/lib/utils";
import { studentsPanel } from "./students-ui";

interface StudentLoginCardProps {
  student: StudentDetailSummary;
  credentials: StudentCredentials | null;
  credentialsLoading: boolean;
  portalUrl: string;
  onView: () => void;
  onManageAccess: () => void;
  onSend: (channel: "SMS" | "EMAIL") => void;
  sendingChannel: "SMS" | "EMAIL" | null;
}

function LoginValue({
  label,
  value,
  icon: Icon,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  mono?: boolean;
  highlight?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-none border px-2.5 py-2",
        highlight
          ? "border-emerald-200/80 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20"
          : "border-[#1a4d42]/10 bg-[#f8fbfa] dark:border-white/10 dark:bg-[#071411]",
      )}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          highlight ? "text-emerald-700" : "text-[#1a4d42]/40",
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
          {label}
        </p>
        <p
          className={cn(
            "truncate text-[13px] font-medium text-[#0a1f1a] dark:text-white",
            mono && "font-mono text-xs",
            highlight && "text-emerald-800 dark:text-emerald-300",
          )}
          title={value}
        >
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={() => void copy()}
        className="shrink-0 rounded-none p-1 text-[#1a4d42]/35 hover:text-[#0a1f1a] dark:hover:text-white"
        aria-label={`Copy ${label}`}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-600" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

export function StudentLoginCard({
  student,
  credentials,
  credentialsLoading,
  portalUrl,
  onView,
  onManageAccess,
  onSend,
  sendingChannel,
}: StudentLoginCardProps) {
  const email = credentials?.email || student.email;
  const password = credentials?.password || student.admissionNumber;
  const hasAccount = Boolean(student.userId);
  const sending = Boolean(sendingChannel);

  return (
    <section
      className={cn(
        studentsPanel,
        "overflow-hidden lg:col-span-2",
      )}
    >
      <div className="flex flex-col gap-2 border-b border-[#1a4d42]/10 bg-[#f8fbfa] px-4 py-3 dark:border-white/10 dark:bg-[#071411] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-none bg-[#246a59]/10 text-[#246a59]">
            <KeyRound className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-[#0a1f1a] dark:text-white">
              Student login
            </h3>
            <p className="text-[11px] text-[#1a4d42]/50 dark:text-white/45">
              Portal credentials and sharing
            </p>
          </div>
          {credentialsLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1a4d42]/35" />
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={hasAccount ? onView : onManageAccess}
        >
          <KeyRound className="h-3.5 w-3.5" />
          {hasAccount ? "View & send" : "Manage access"}
        </Button>
      </div>

      {!hasAccount ? (
        <div className="px-4 py-6 text-center">
          <p className="text-sm font-medium text-[#1a4d42]/70 dark:text-white/70">
            No portal login yet
          </p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[#1a4d42]/45">
            Set up the student account so they can sign in to check fees,
            results and school updates.
          </p>
          <Button
            type="button"
            size="sm"
            className="mt-3 h-8 bg-[#246a59] text-xs"
            onClick={onManageAccess}
          >
            Manage portal access
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="min-w-0 space-y-2">
            <LoginValue
              label="Login email"
              value={email || "No email on file"}
              icon={Mail}
            />
            <LoginValue
              label={credentials ? "Current password" : "Default password"}
              value={password}
              icon={KeyRound}
              mono
              highlight
            />
            <a
              href={portalUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-[#246a59] hover:underline"
            >
              Open student portal
              <ExternalLink className="h-3 w-3" />
            </a>
            <p className="px-1 text-[10px] leading-relaxed text-[#1a4d42]/45">
              {credentials
                ? "These are the student's current sign-in details. Share only with the student or an authorised guardian."
                : "The default password is the admission number. Open View & send to load the current password and share it."}
            </p>
          </div>

          <div className="rounded-none border border-[#1a4d42]/10 bg-[#f8fbfa] p-3 dark:border-white/10 dark:bg-[#071411]">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
              <Send className="h-3 w-3" />
              Send login details
            </p>
            <div className="mt-2 space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-full justify-start gap-2 text-xs"
                onClick={() => onSend("SMS")}
                disabled={!student.phone || sending}
              >
                {sendingChannel === "SMS" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <MessageSquare className="h-3.5 w-3.5" />
                )}
                Send via SMS
                <span className="ml-auto truncate text-[10px] text-[#1a4d42]/35">
                  {student.phone || "No phone"}
                </span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-full justify-start gap-2 text-xs"
                onClick={() => onSend("EMAIL")}
                disabled={!email || sending}
              >
                {sendingChannel === "EMAIL" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Mail className="h-3.5 w-3.5" />
                )}
                Send via email
                <span className="ml-auto truncate text-[10px] text-[#1a4d42]/35">
                  {email ? "Email" : "No email"}
                </span>
              </Button>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-[#1a4d42]/40">
              Sends the email, password and portal link in one message.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
