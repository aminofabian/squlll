"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { deletionConfirmationPhrase } from "@/lib/superadmin/deletionConfirmationPhrase";
import type { TenantRecord } from "@/lib/superadmin/types";

const MAX_LISTED_SCHOOLS = 5;

interface DeleteSchoolsDialogProps {
  schools: TenantRecord[];
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteSchoolsDialog({
  schools,
  deleting,
  onCancel,
  onConfirm,
}: DeleteSchoolsDialogProps) {
  const [typed, setTyped] = useState("");
  const isOpen = schools.length > 0;
  const isSingle = schools.length === 1;
  const phrase = deletionConfirmationPhrase(schools);
  const canConfirm = typed.trim() === phrase && !deleting;
  const hiddenCount = schools.length - MAX_LISTED_SCHOOLS;
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !deleting && onCancel()}
    >
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {isSingle ? "Delete school" : `Delete ${schools.length} schools`}
          </DialogTitle>
          <DialogDescription>
            This permanently deletes{" "}
            {isSingle ? <strong>{schools[0].name}</strong> : "these schools"}{" "}
            and all of their data: students, staff, parents, finance records,
            exams, timetables, messages, transport and custom domains. Accounts
            that belong only to {isSingle ? "this school" : "these schools"} are
            deleted too. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!isSingle ? (
            <ul className="space-y-1 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {schools.slice(0, MAX_LISTED_SCHOOLS).map((school) => (
                <li key={school.id} className="truncate">
                  {school.name}{" "}
                  <span className="opacity-60">({school.subdomain})</span>
                </li>
              ))}
              {hiddenCount > 0 ? (
                <li className="opacity-70">and {hiddenCount} more</li>
              ) : null}
            </ul>
          ) : null}
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Type <strong className="select-all">{phrase}</strong> to confirm:
          </p>
          <Input
            autoFocus
            className="rounded-xl"
            placeholder={phrase}
            value={typed}
            disabled={deleting}
            onChange={(event) => setTyped(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && canConfirm) onConfirm();
            }}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-xl"
            disabled={deleting}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="gap-2 rounded-xl"
            disabled={!canConfirm}
            onClick={onConfirm}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {deleting ? "Deleting..." : "Delete permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
