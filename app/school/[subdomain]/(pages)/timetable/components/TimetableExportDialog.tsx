"use client";

import { useState } from "react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { PrintOrientation } from "../utils/printableTimetable";
import { tt } from "../utils/timetableTheme";

type TimetableExportDialogProps = {
  open: boolean;
  classLabel: string;
  downloading: boolean;
  onOpenChange: (open: boolean) => void;
  onPrint: (orientation: PrintOrientation) => void;
  onDownload: (orientation: PrintOrientation) => void;
};

const PREVIEW_CELLS = 9;
const PREVIEW_ACCENT_EVERY = 4;

const ORIENTATIONS: { id: PrintOrientation; label: string; hint: string; pageClass: string }[] = [
  { id: "landscape", label: "Landscape", hint: "Wide page, roomier lessons. Best for notice boards.", pageClass: "h-12 w-[4.25rem]" },
  { id: "portrait", label: "Portrait", hint: "Tall page that fits a file or a teacher's folder.", pageClass: "h-[4.25rem] w-12" },
];

export function TimetableExportDialog({
  open,
  classLabel,
  downloading,
  onOpenChange,
  onPrint,
  onDownload,
}: TimetableExportDialogProps) {
  const [orientation, setOrientation] = useState<PrintOrientation>("landscape");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Print or download</DialogTitle>
          <DialogDescription>
            {classLabel}&apos;s week on one A4 page, with breaks and double lessons laid out like the grid.
          </DialogDescription>
        </DialogHeader>

        <fieldset className="grid grid-cols-2 gap-2">
          <legend className="sr-only">Page orientation</legend>
          {ORIENTATIONS.map((option) => (
            <OrientationOption
              key={option.id}
              {...option}
              selected={orientation === option.id}
              onSelect={() => setOrientation(option.id)}
            />
          ))}
        </fieldset>

        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" className="gap-1.5 rounded-lg" onClick={() => onPrint(orientation)}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button className={cn("gap-1.5 rounded-lg", tt.accentBtn)} disabled={downloading} onClick={() => onDownload(orientation)}>
            <Download className="h-4 w-4" />
            {downloading ? "Preparing PDF…" : "Download PDF"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function OrientationOption({ label, hint, pageClass, selected, onSelect }: {
  label: string;
  hint: string;
  pageClass: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        tt.focus,
        "flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-colors",
        selected
          ? "border-[#246a59] bg-[#246a59]/[0.06] ring-1 ring-[#246a59]/40"
          : "border-[#1a4d42]/15 hover:border-[#246a59]/40 dark:border-white/15",
      )}
    >
      <span className="flex h-[4.5rem] items-center justify-center">
        <span className={cn(pageClass, "grid grid-cols-3 gap-0.5 rounded-sm border border-slate-300 bg-white p-1 shadow-sm")} aria-hidden>
          {Array.from({ length: PREVIEW_CELLS }, (_, i) => (
            <span key={i} className={cn("rounded-[1px]", i % PREVIEW_ACCENT_EVERY === 0 ? "bg-[#246a59]/40" : "bg-slate-200")} />
          ))}
        </span>
      </span>
      <span className="text-[13px] font-semibold text-slate-900 dark:text-white">{label} · A4</span>
      <span className="text-[11.5px] leading-snug text-slate-600 dark:text-slate-400">{hint}</span>
    </button>
  );
}
