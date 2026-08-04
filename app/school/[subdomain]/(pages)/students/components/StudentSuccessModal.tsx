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
    <div className="group flex items-center gap-2 rounded-none bg-white p-2.5 ring-1 ring-inset ring-[#1a4d42]/12 dark:bg-[#071411] dark:ring-white/10">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#1a4d42]/45">{label}</p>
        <p
          className={cn(
            "mt-0.5 truncate text-sm font-medium text-[#0a1f1a] dark:text-white",
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
          "h-9 shrink-0 gap-1.5 rounded-none px-2.5 text-xs",
          copied
            ? "bg-[#246a59]/10 text-[#246a59] hover:bg-[#246a59]/10"
            : "text-[#1a4d42]/55 hover:bg-[#246a59]/[0.06] hover:text-[#246a59]",
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
      <DialogContent className="gap-0 overflow-hidden rounded-none border border-[#1a4d42]/12 p-0 sm:max-w-[460px]">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-[#1a4d42]/12 bg-[#f8fbfa] px-6 pb-5 pt-6 dark:border-white/10 dark:bg-[#071411]">
          <div className="relative flex flex-col items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-none bg-[#0a1f1a] text-white">
              <CheckCircle2 className="h-7 w-7" strokeWidth={1.75} />
            </div>
            <DialogTitle className="font-display text-xl tracking-tight text-[#0a1f1a] dark:text-white">
              Student enrolled
            </DialogTitle>
            <DialogDescription className="mt-1 max-w-xs text-sm text-[#1a4d42]/55 dark:text-white/45">
              <span className="font-medium text-[#0a1f1a] dark:text-white/80">{studentData.user.name}</span>
              {' '}is on the register. Save the login details below — they won&apos;t be shown again.
            </DialogDescription>
          </div>
        </div>

        <div className="max-h-[min(70vh,560px)] space-y-4 overflow-y-auto bg-[#f3f7f5] px-5 py-5 dark:bg-[#071411]/80">
          {/* Student card */}
          <div className="overflow-hidden rounded-none border border-[#1a4d42]/20 bg-[#0a1f1a] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-[#246a59] text-base font-bold text-white">
                {initialsFromName(studentData.user.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{studentData.user.name}</p>
                <p className="mt-0.5 truncate font-mono text-xs text-white/55">
                  {studentData.student.admission_number}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge className="h-5 rounded-none border-0 bg-white/10 px-2 text-[10px] font-medium text-white/90 hover:bg-white/10">
                    {studentData.student.gradeName}
                  </Badge>
                  <Badge className="h-5 rounded-none border-0 bg-white/10 px-2 text-[10px] font-medium capitalize text-white/90 hover:bg-white/10">
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

          {/* Credentials */}
          <div className="overflow-hidden rounded-none border border-[#1a4d42]/12 bg-[#f8fbfa] dark:border-white/10 dark:bg-[#0c1a17]">
            <div className="flex items-center justify-between border-b border-[#1a4d42]/10 px-4 py-3 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-none bg-[#246a59]/10 text-[#246a59]">
                  <Key className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0a1f1a] dark:text-white">Portal login</p>
                  <p className="text-[11px] text-[#1a4d42]/55">Share with the student or guardian</p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={copyAllCredentials}
                className="h-8 gap-1.5 rounded-none border-[#1a4d42]/15 bg-white text-xs text-[#246a59] hover:bg-[#246a59]/[0.06] dark:border-white/15 dark:bg-[#0c1a17]"
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
          <div className="rounded-none border border-[#1a4d42]/12 bg-white p-4 dark:border-white/10 dark:bg-[#0c1a17]">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#1a4d42]/45">
              Next steps
            </p>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5 text-xs text-[#1a4d42]/70 dark:text-white/55">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#246a59]" />
                Share the credentials — they are not emailed automatically.
              </li>
              <li className="flex items-start gap-2.5 text-xs text-[#1a4d42]/70 dark:text-white/55">
                <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#246a59]" />
                Link a parent so they can access fees and grades in the portal.
              </li>
              <li className="flex items-start gap-2.5 text-xs text-[#1a4d42]/70 dark:text-white/55">
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#246a59]" />
                Student can change their password after first login.
              </li>
            </ul>
          </div>

          {/* Security notice */}
          <div className="flex items-start gap-2.5 rounded-none border border-amber-200/80 bg-amber-50/80 px-3.5 py-3 dark:border-amber-900/40 dark:bg-amber-950/20">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200/90">
              This is your only chance to view the password. Copy it now before closing.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-2 border-t border-[#1a4d42]/12 bg-white px-5 py-4 dark:border-white/10 dark:bg-[#0c1a17]">
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
                className="h-11 w-full rounded-none border-[#1a4d42]/15 text-[#246a59] hover:bg-[#246a59]/[0.06]"
              >
                <Users className="mr-2 h-4 w-4" />
                Link a parent now
              </Button>
            }
          />
          <Button
            onClick={onClose}
            className="h-11 w-full rounded-none bg-[#0a1f1a] text-white shadow-none hover:bg-[#246a59]"
          >
            Done — I&apos;ve saved the credentials
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
