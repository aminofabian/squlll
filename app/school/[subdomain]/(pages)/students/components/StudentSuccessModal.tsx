"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Copy,
  Check,
  Key,
  Phone,
  Hash,
  ExternalLink,
  Users,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { LinkParentDrawer } from './LinkParentDrawer';

interface StudentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentData: {
    user: { id: string; email: string; name: string };
    student: { id: string; admission_number: string; grade: { id: string }; gender: string; phone: string; gradeName: string };
    generatedPassword: string;
  };
  schoolSubdomain?: string;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function CopyRow({
  label,
  value,
  mono = false,
  secret = false,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  mono?: boolean;
  secret?: boolean;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="group flex items-center gap-2 rounded-xl bg-white/80 p-2.5 ring-1 ring-inset ring-primary/10 dark:bg-slate-900/60 dark:ring-primary/15">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p
          className={cn(
            "mt-0.5 truncate text-sm font-medium text-slate-800 dark:text-slate-100",
            mono && "font-mono text-[13px]",
            secret && "tracking-wide",
          )}
        >
          {value}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onCopy}
        className={cn(
          "h-9 shrink-0 gap-1.5 rounded-lg px-2.5 text-xs",
          copied
            ? "bg-primary/10 text-primary hover:bg-primary/10"
            : "text-slate-500 hover:bg-primary/5 hover:text-primary",
        )}
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            Copy
          </>
        )}
      </Button>
    </div>
  );
}

export function StudentSuccessModal({
  isOpen,
  onClose,
  studentData,
  schoolSubdomain = 'school',
}: StudentSuccessModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const portalUrl = `${schoolSubdomain}.squl.co.ke/student`;

  const copyText = async (text: string, field: string, message: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(message);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyAllCredentials = async () => {
    const block = [
      `Student: ${studentData.user.name}`,
      `Admission: ${studentData.student.admission_number}`,
      `Email: ${studentData.user.email}`,
      `Password: ${studentData.generatedPassword}`,
      `Portal: ${portalUrl}`,
    ].join('\n');

    await navigator.clipboard.writeText(block);
    setCopiedField('all');
    toast.success("All credentials copied!");
    setTimeout(() => setCopiedField(null), 2000);
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
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
              <CheckCircle2 className="h-7 w-7" strokeWidth={1.75} />
            </div>
            <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Student enrolled
            </DialogTitle>
            <DialogDescription className="mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">
              <span className="font-medium text-slate-700 dark:text-slate-300">{studentData.user.name}</span>
              {' '}is on the register. Save the login details below — they won&apos;t be shown again.
            </DialogDescription>
          </div>
        </div>

        <div className="max-h-[min(70vh,560px)] space-y-4 overflow-y-auto bg-slate-50/80 px-5 py-5 dark:bg-slate-950/80">
          {/* Student card */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-dark via-slate-800 to-primary/70 p-[1px] shadow-md shadow-primary/10">
            <div className="rounded-[15px] bg-gradient-to-br from-primary-dark to-slate-800 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-base font-bold text-white ring-1 ring-white/20">
                  {initialsFromName(studentData.user.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{studentData.user.name}</p>
                  <p className="mt-0.5 truncate font-mono text-xs text-white/55">
                    {studentData.student.admission_number}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge className="h-5 border-0 bg-white/10 px-2 text-[10px] font-medium text-white/90 hover:bg-white/10">
                      {studentData.student.gradeName}
                    </Badge>
                    <Badge className="h-5 border-0 bg-white/10 px-2 text-[10px] font-medium capitalize text-white/90 hover:bg-white/10">
                      {studentData.student.gender}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
                <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                  <Phone className="h-3 w-3 shrink-0" />
                  <span className="truncate">{studentData.student.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                  <Hash className="h-3 w-3 shrink-0" />
                  <span className="truncate">{studentData.student.admission_number}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Credentials */}
          <div className="overflow-hidden rounded-2xl border border-primary/15 bg-primary/[0.04] dark:border-primary/20 dark:bg-primary/10">
            <div className="flex items-center justify-between border-b border-primary/10 px-4 py-3 dark:border-primary/15">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Key className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Portal login</p>
                  <p className="text-[11px] text-slate-500">Share with the student or guardian</p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={copyAllCredentials}
                className="h-8 gap-1.5 rounded-full border-primary/20 bg-white text-xs text-primary hover:bg-primary/5 dark:bg-slate-900"
              >
                {copiedField === 'all' ? (
                  <>
                    <Check className="h-3 w-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy all
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2 p-3">
              <CopyRow
                label="Email"
                value={studentData.user.email}
                mono
                onCopy={() => copyText(studentData.user.email, 'email', 'Email copied')}
                copied={copiedField === 'email'}
              />
              <CopyRow
                label="Password"
                value={studentData.generatedPassword}
                mono
                secret
                onCopy={() => copyText(studentData.generatedPassword, 'password', 'Password copied')}
                copied={copiedField === 'password'}
              />
              <CopyRow
                label="Portal URL"
                value={portalUrl}
                mono
                onCopy={() => copyText(portalUrl, 'portal', 'Portal URL copied')}
                copied={copiedField === 'portal'}
              />
            </div>
          </div>

          {/* Next steps */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Next steps
            </p>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                Share the credentials — they are not emailed automatically.
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                Link a parent so they can access fees and grades in the portal.
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                Student can change their password after first login.
              </li>
            </ul>
          </div>

          {/* Security notice */}
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/80 px-3.5 py-3 dark:border-amber-900/40 dark:bg-amber-950/20">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200/90">
              This is your only chance to view the password. Copy it now before closing.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-2 border-t border-slate-200/80 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
          <LinkParentDrawer
            student={{
              id: studentData.student.id,
              name: studentData.user.name,
              admissionNumber: studentData.student.admission_number,
              gradeLevelName: studentData.student.gradeName,
            }}
            onLinked={onClose}
            trigger={
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-full border-primary/25 text-primary hover:bg-primary/5"
              >
                <Users className="mr-2 h-4 w-4" />
                Link a parent now
              </Button>
            }
          />
          <Button
            onClick={onClose}
            className="h-11 w-full rounded-full bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-dark"
          >
            Done — I&apos;ve saved the credentials
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
