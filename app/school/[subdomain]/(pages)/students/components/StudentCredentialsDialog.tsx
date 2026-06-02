"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Check,
  Copy,
  Info,
  KeyRound,
  Loader2,
  Mail,
  RefreshCw,
  User,
} from "lucide-react";
import type { StudentCredentials } from "@/lib/hooks/useStudentCredentials";

interface StudentCredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  credentials: StudentCredentials | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}

function CredentialRow({
  label,
  value,
  field,
  copiedField,
  onCopy,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string;
  field: string;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-lg border border-emerald-200/80 bg-emerald-50/50 px-3 py-3 dark:border-emerald-900/40 dark:bg-emerald-950/20"
          : "rounded-lg bg-slate-50/80 px-3 py-3 dark:bg-slate-800/30"
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            <Icon className="h-3 w-3 shrink-0" />
            {label}
          </p>
          <p
            className={
              highlight
                ? "mt-1 break-all font-mono text-lg font-semibold text-emerald-800 dark:text-emerald-300"
                : "mt-1 break-all text-sm font-medium text-slate-800 dark:text-slate-100"
            }
          >
            {value}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onCopy(value, field)}
          className="shrink-0 rounded p-1 text-slate-400 hover:text-slate-600"
          aria-label={`Copy ${label}`}
        >
          {copiedField === field ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

export function StudentCredentialsDialog({
  open,
  onOpenChange,
  studentName,
  credentials,
  loading,
  error,
  onRetry,
  copiedField,
  onCopy,
}: StudentCredentialsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-xl border-slate-200/80 p-0 sm:max-w-md">
        <DialogHeader className="space-y-0 border-b border-slate-100 px-4 py-3 text-left dark:border-slate-800">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 shrink-0 text-slate-400" />
            <div className="min-w-0">
              <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Login credentials
              </DialogTitle>
              <DialogDescription className="truncate text-[11px] text-slate-500">
                Portal access for {studentName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 px-4 py-4">
          {loading ? (
            <div className="flex flex-col items-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading credentials…
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-xs text-red-600">{error}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={onRetry}
              >
                <RefreshCw className="mr-1.5 h-3 w-3" />
                Retry
              </Button>
            </div>
          ) : credentials ? (
            <>
              <CredentialRow
                label="Full name"
                value={credentials.name}
                field="name"
                copiedField={copiedField}
                onCopy={onCopy}
                icon={User}
              />
              <CredentialRow
                label="Email"
                value={credentials.email}
                field="email"
                copiedField={copiedField}
                onCopy={onCopy}
                icon={Mail}
              />
              <CredentialRow
                label="Password (admission no.)"
                value={credentials.password}
                field="password"
                copiedField={copiedField}
                onCopy={onCopy}
                icon={KeyRound}
                highlight
              />
              <p className="flex items-start gap-1.5 text-[10px] text-slate-400">
                <Info className="mt-0.5 h-3 w-3 shrink-0" />
                Default password is the admission number. Share credentials only
                with authorized staff.
              </p>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
