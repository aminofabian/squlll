"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { studentsPanel } from "./students-ui";
import { KeyRound, ShieldCheck } from "lucide-react";
import { SetTeacherPasswordDialog } from "../../teachers/components/SetTeacherPasswordDialog";
import { useStudentAdminActions } from "@/lib/hooks/useStudentAdminActions";
import { toast } from "sonner";

interface StudentAccountPanelProps {
  studentName: string;
  email: string;
  userId?: string | null;
  isActive: boolean;
  onViewCredentials: () => void;
}

export function StudentAccountPanel({
  studentName,
  email,
  userId,
  isActive,
  onViewCredentials,
}: StudentAccountPanelProps) {
  const { setStudentPassword, isSettingPassword } = useStudentAdminActions();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  return (
    <>
      <div className={`${studentsPanel} overflow-hidden`}>
        <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Account &amp; access
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            Student portal login for {studentName}
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
                {isActive
                  ? "Active — can sign in to student portal"
                  : "Inactive — login disabled"}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50/80 px-3 py-2.5 dark:bg-slate-800/30">
              <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                <KeyRound className="h-3 w-3" />
                Login linked
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                {userId ? "Yes — user account exists" : "No user account"}
              </p>
              {email ? (
                <p className="mt-0.5 truncate text-xs text-slate-400">{email}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={onViewCredentials}
            >
              <KeyRound className="h-3.5 w-3.5" />
              View login credentials
            </Button>
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
          </div>
        </div>
      </div>

      {userId ? (
        <SetTeacherPasswordDialog
          open={passwordDialogOpen}
          onOpenChange={setPasswordDialogOpen}
          teacherName={studentName}
          isSubmitting={isSettingPassword}
          onSubmit={async (password) => {
            await setStudentPassword(userId, password);
            toast.success(`Password updated for ${studentName}`);
          }}
        />
      ) : null}
    </>
  );
}
