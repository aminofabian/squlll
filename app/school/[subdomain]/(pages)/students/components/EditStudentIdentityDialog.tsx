"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, Pencil, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface StudentIdentityTarget {
  id: string;
  name: string;
  admissionNumber: string;
  email?: string | null;
}

export function EditStudentIdentityDialog({
  student,
  open,
  onOpenChange,
  onSaved,
}: {
  student: StudentIdentityTarget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !student) return;
    setAdmissionNumber(student.admissionNumber ?? "");
    setEmail(student.email ?? "");
    setError(null);
  }, [open, student]);

  const save = async () => {
    if (!student) return;
    const nextAdmission = admissionNumber.trim();
    const nextEmail = email.trim().toLowerCase();
    if (!nextAdmission) {
      setError("Admission number is required.");
      return;
    }
    if (!nextEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: `
            mutation UpdateStudentIdentity($input: UpdateStudentIdentityInput!) {
              updateStudentIdentity(input: $input)
            }
          `,
          variables: {
            input: {
              studentId: student.id,
              admissionNumber: nextAdmission,
              email: nextEmail,
            },
          },
        }),
      });
      const body = await response.json();
      if (body.errors?.length) {
        throw new Error(body.errors[0].message ?? "Could not update student");
      }
      if (!body.data?.updateStudentIdentity) {
        throw new Error("Could not update student");
      }
      toast.success("Student identity updated", {
        description: `${nextAdmission} · ${nextEmail}`,
      });
      onSaved();
      onOpenChange(false);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not update student",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-2xl border-[#1a4d42]/12 bg-[#f8fbfa] p-0 dark:border-white/10 dark:bg-[#0c1a17]">
        <DialogHeader className="border-b border-[#1a4d42]/10 px-5 py-4 text-left dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#246a59]/10 text-[#246a59] dark:bg-[#246a59]/20 dark:text-[#9dcec1]">
              <Pencil className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle className="text-[15px] font-semibold text-[#0a1f1a] dark:text-white">
                Edit admission number & email
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-[11px] text-[#1a4d42]/50 dark:text-white/40">
                {student?.name ?? "Student"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="student-admission" className="text-[11px] font-semibold text-[#0a1f1a] dark:text-white">
              Admission number
            </Label>
            <Input
              id="student-admission"
              value={admissionNumber}
              onChange={(event) => setAdmissionNumber(event.target.value)}
              autoComplete="off"
              className="h-10 rounded-lg border-[#1a4d42]/15 bg-white text-sm dark:border-white/15 dark:bg-[#071411]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="student-email" className="text-[11px] font-semibold text-[#0a1f1a] dark:text-white">
              Login email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#1a4d42]/35" />
              <Input
                id="student-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="off"
                className="h-10 rounded-lg border-[#1a4d42]/15 bg-white pl-9 text-sm dark:border-white/15 dark:bg-[#071411]"
              />
            </div>
            <p className="flex items-start gap-1.5 text-[10.5px] leading-relaxed text-[#1a4d42]/45 dark:text-white/35">
              <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0" />
              Changing the email signs the student out of existing sessions.
            </p>
          </div>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter className="border-t border-[#1a4d42]/8 bg-white px-5 py-3 dark:border-white/10 dark:bg-[#071411]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saving}
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-lg text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={saving}
            onClick={() => void save()}
            className="h-9 gap-1.5 rounded-lg bg-[#0a1f1a] text-xs text-white hover:bg-[#246a59]"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
