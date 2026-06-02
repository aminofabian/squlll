"use client";

import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { FEES_BTN } from "../../lib/fees-ui";
import {
  FeeLetterPreviewMeta,
  feeLetterPreviewMetaLabel,
  type FeeLetterPreviewMetaProps,
} from "./FeeLetterPreviewMeta";

type FeeLetterPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Used for screen readers only. */
  title?: string;
  meta?: FeeLetterPreviewMetaProps | null;
  onPrint: () => void;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
};

export function FeeLetterPreviewDialog({
  open,
  onOpenChange,
  title,
  meta,
  onPrint,
  headerActions,
  children,
}: FeeLetterPreviewDialogProps) {
  const metaLabel = meta ? feeLetterPreviewMetaLabel(meta) : null;
  const accessibleTitle = title || metaLabel || "Fee letter";
  const hasMetaRow = !!(
    meta &&
    (meta.grade || meta.academicYear || meta.terms)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex w-full max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl",
          "max-h-[92vh]",
          "max-md:fixed max-md:inset-0 max-md:h-[100dvh] max-md:max-h-[100dvh] max-md:max-w-full",
          "max-md:translate-x-0 max-md:translate-y-0 max-md:rounded-none max-md:border-0",
        )}
      >
        <DialogTitle className="sr-only">{accessibleTitle}</DialogTitle>

        <header className="shrink-0 border-b border-slate-200/90 bg-white">
          <div className="px-4 py-3">
            <div className="flex items-center gap-2">
              {hasMetaRow && meta ? (
                <FeeLetterPreviewMeta {...meta} />
              ) : (
                <span className="flex-1" aria-hidden />
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                onClick={() => onOpenChange(false)}
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div
              className={cn(
                "flex items-center gap-2",
                hasMetaRow ? "mt-2.5" : "",
                headerActions ? "grid grid-cols-[auto_1fr]" : "",
              )}
            >
              {headerActions}
              <Button
                type="button"
                size="sm"
                className={cn(
                  FEES_BTN.primary,
                  "h-9 w-full gap-2 text-xs font-semibold shadow-sm",
                )}
                onClick={onPrint}
              >
                <Download className="h-4 w-4 shrink-0" />
                Download PDF
              </Button>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#e8eaed] p-2 sm:p-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
