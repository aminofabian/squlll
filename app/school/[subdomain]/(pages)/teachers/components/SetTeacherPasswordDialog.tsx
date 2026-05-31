"use client";

import { useState } from "react";
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
import { KeyRound, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SetTeacherPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacherName: string;
  onSubmit: (password: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function SetTeacherPasswordDialog({
  open,
  onOpenChange,
  teacherName,
  onSubmit,
  isSubmitting = false,
}: SetTeacherPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setPassword("");
    setConfirmPassword("");
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await onSubmit(password);
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set password");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-xl border-slate-200/80 p-0 sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-0 border-b border-slate-100 px-4 py-3 text-left dark:border-slate-800">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 shrink-0 text-slate-400" />
              <div className="min-w-0">
                <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Set password
                </DialogTitle>
                <DialogDescription className="truncate text-[11px] text-slate-500">
                  Login password for {teacherName}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 px-4 py-3">
            <div className="space-y-1">
              <Label
                htmlFor="teacher-new-password"
                className="text-[11px] font-medium text-slate-500"
              >
                New password
              </Label>
              <Input
                id="teacher-new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                minLength={6}
                required
                className="h-8 text-xs"
                placeholder="Min. 6 characters"
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="teacher-confirm-password"
                className="text-[11px] font-medium text-slate-500"
              >
                Confirm password
              </Label>
              <Input
                id="teacher-confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                minLength={6}
                required
                className="h-8 text-xs"
                placeholder="Re-enter password"
              />
            </div>
            {error ? (
              <p
                className="rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-[11px] text-red-600"
                role="alert"
              >
                {error}
              </p>
            ) : (
              <p className="text-[10px] text-slate-400">
                They can sign in immediately with this password.
              </p>
            )}
          </div>

          <DialogFooter className="border-t border-slate-100 px-4 py-2.5 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="h-8 flex-1 text-xs sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className={cn("h-8 flex-[2] text-xs sm:flex-none sm:min-w-[7rem]")}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
