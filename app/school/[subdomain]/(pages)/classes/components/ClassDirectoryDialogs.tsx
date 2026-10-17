"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDisplayErrorMessage } from "@/lib/utils/graphql-errors";
import type { CampusClassUnit } from "./ClassesCampusOverview";

interface EditClassDialogProps {
  open: boolean;
  unit: CampusClassUnit | null;
  saving: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}

export function EditClassDialog({
  open,
  unit,
  saving,
  onClose,
  onSave,
}: EditClassDialogProps) {
  const [name, setName] = useState(unit?.gradeName ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Enter a class name");
      return;
    }
    setError(null);
    try {
      await onSave(name);
      onClose();
    } catch (err) {
      setError(getDisplayErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit class name</DialogTitle>
          <DialogDescription>
            This changes the class name for every stream in it. Existing
            rosters and links stay attached.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-class-name">Class name</Label>
            <Input
              id="edit-class-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
              }}
              placeholder="e.g. Baby Class"
              autoFocus
            />
            {error ? (
              <p className="text-xs font-medium text-rose-600" role="alert">
                {error}
              </p>
            ) : null}
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save class name"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface EditStreamDialogProps {
  open: boolean;
  unit: CampusClassUnit | null;
  saving: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}

export function EditStreamDialog({
  open,
  unit,
  saving,
  onClose,
  onSave,
}: EditStreamDialogProps) {
  const [name, setName] = useState(unit?.streamName ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Enter a stream name");
      return;
    }
    setError(null);
    try {
      await onSave(name);
      onClose();
    } catch (err) {
      setError(getDisplayErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit stream</DialogTitle>
          <DialogDescription>
            Change the stream name for {unit?.gradeName ?? "this class"}. The
            stream capacity and enrolled students stay unchanged.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-stream-name">Stream name</Label>
            <Input
              id="edit-stream-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError(null);
              }}
              placeholder="e.g. East, Blue"
              autoFocus
            />
            {error ? (
              <p className="text-xs font-medium text-rose-600" role="alert">
                {error}
              </p>
            ) : null}
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save stream"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteClassesDialogProps {
  open: boolean;
  units: CampusClassUnit[];
  allUnits: CampusClassUnit[];
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteClassesDialog({
  open,
  units,
  allUnits,
  deleting,
  onClose,
  onConfirm,
}: DeleteClassesDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const details = useMemo(() => {
    const byGrade = new Map<string, CampusClassUnit[]>();
    for (const unit of units) {
      const group = byGrade.get(unit.gradeId) ?? [];
      group.push(unit);
      byGrade.set(unit.gradeId, group);
    }
    let wholeGrades = 0;
    let streams = 0;
    for (const [gradeId, selected] of byGrade) {
      const total = allUnits.filter((unit) => unit.gradeId === gradeId).length;
      if (selected.length === total) wholeGrades += 1;
      else streams += selected.length;
    }
    return { wholeGrades, streams };
  }, [units, allUnits]);

  const handleConfirm = async () => {
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(getDisplayErrorMessage(err));
    }
  };

  const title =
    units.length === 1
      ? `Delete ${units[0]?.label ?? "class"}?`
      : `Delete ${units.length} classes?`;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <Trash2 className="h-4 w-4" />
            </span>
            {title}
          </DialogTitle>
          <DialogDescription>
            This removes the selected classes from the directory. Classes with
            students cannot be deleted — move those students first. Any class
            teacher or subject links on these classes will also be removed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
            <ul className="space-y-1.5 text-sm text-slate-700">
              {units.slice(0, 6).map((unit) => (
                <li key={unit.id} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  {unit.label}
                </li>
              ))}
              {units.length > 6 ? (
                <li className="text-xs text-slate-500">
                  +{units.length - 6} more
                </li>
              ) : null}
            </ul>
          </div>

          <p className="text-xs leading-relaxed text-slate-500">
            {details.wholeGrades > 0
              ? `${details.wholeGrades} grade${details.wholeGrades === 1 ? "" : "s"} will be removed with all its classes. `
              : ""}
            {details.streams > 0
              ? `${details.streams} individual stream${details.streams === 1 ? "" : "s"} will be removed.`
              : ""}
          </p>

          {error ? (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => void handleConfirm()}
            disabled={deleting || units.length === 0}
          >
            {deleting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Deleting…
              </>
            ) : (
              `Delete ${units.length === 1 ? "class" : `${units.length} classes`}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
