"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, Download, Printer, Share2 } from "lucide-react";
import {
  getFigtreePrintFontLinks,
  figtreePrintBodyCss,
} from "@/lib/fonts/figtree";
import { cn } from "@/lib/utils";
import { formatCurrency } from "../utils";
import {
  buildReceiptShareText,
  downloadReceiptHtml,
  downloadPdfDataUrl,
  formatPaymentMethodLabel,
  formatReceiptDateTime,
  shareReceipt,
  type PaymentReceiptData,
} from "../lib/paymentReceipt";
import { useToast } from "@/components/ui/use-toast";
import { useGraphQLPayments } from "../hooks/useGraphQLPayments";

interface PaymentReceiptDialogProps {
  receipt: PaymentReceiptData | null;
  open: boolean;
  onClose: () => void;
  schoolName?: string;
}

function ReceiptRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span
        className={cn(
          "text-right text-sm font-medium text-slate-900",
          highlight && "font-bold text-emerald-800",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function PaymentReceiptDialog({
  receipt,
  open,
  onClose,
  schoolName,
}: PaymentReceiptDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { generateReceiptPdf, isGeneratingPdf } = useGraphQLPayments();
  const [sharing, setSharing] = useState(false);

  if (!receipt) return null;

  const gradeLabel = receipt.student.streamName
    ? `${receipt.student.gradeLevelName} · ${receipt.student.streamName}`
    : receipt.student.gradeLevelName;

  const termLabel =
    receipt.invoice.termName && receipt.invoice.academicYearName
      ? `${receipt.invoice.termName} · ${receipt.invoice.academicYearName}`
      : receipt.invoice.termName;

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank", "width=720,height=900");
    if (!printWindow) {
      toast({
        title: "Pop-up blocked",
        description: "Allow pop-ups to print this receipt.",
        variant: "destructive",
      });
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt ${receipt.receiptNumber}</title>
          ${getFigtreePrintFontLinks()}
          <style>
            body { ${figtreePrintBodyCss("color: #0f172a; padding: 32px;")} }
            h1 { font-size: 20px; margin: 0 0 4px; }
            .sub { color: #64748b; font-size: 13px; margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
            .label { color: #64748b; }
            .value { font-weight: 600; text-align: right; }
            .highlight { color: #246a59; font-size: 15px; }
            .footer { margin-top: 24px; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDownloadPdf = async () => {
    const dataUrl = await generateReceiptPdf(receipt.paymentId);
    if (!dataUrl) {
      toast({
        title: "PDF failed",
        description: "Could not generate the server PDF. Try HTML download instead.",
        variant: "destructive",
      });
      return;
    }

    downloadPdfDataUrl(
      dataUrl,
      `receipt-${receipt.receiptNumber.replace(/\s+/g, "-")}.pdf`,
    );
    toast({ title: "PDF downloaded", description: "Receipt saved as PDF." });
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      const result = await shareReceipt(receipt);
      toast({
        title: result === "shared" ? "Receipt shared" : "Receipt copied",
        description:
          result === "shared"
            ? "Share sheet opened successfully."
            : "Receipt details copied to clipboard.",
      });
    } catch {
      toast({
        title: "Could not share",
        description: "Copy the receipt manually or try download instead.",
        variant: "destructive",
      });
    } finally {
      setSharing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildReceiptShareText(receipt));
      toast({ title: "Copied", description: "Receipt details copied." });
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-700" />
            </div>
            <div className="min-w-0">
              <DialogTitle>Payment recorded</DialogTitle>
              <DialogDescription>
                Receipt {receipt.receiptNumber} saved successfully.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div
          ref={printRef}
          className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3"
        >
          {schoolName && (
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {schoolName}
            </p>
          )}
          <ReceiptRow label="Receipt no." value={receipt.receiptNumber} />
          <ReceiptRow label="Student" value={receipt.student.name} />
          <ReceiptRow
            label="Admission no."
            value={receipt.student.admissionNumber}
          />
          <ReceiptRow label="Grade / stream" value={gradeLabel} />
          {termLabel && <ReceiptRow label="Term" value={termLabel} />}
          <ReceiptRow
            label="Amount paid"
            value={formatCurrency(receipt.amount)}
            highlight
          />
          <ReceiptRow
            label="Payment method"
            value={formatPaymentMethodLabel(receipt.paymentMethod)}
          />
          {receipt.transactionReference && (
            <ReceiptRow
              label="Reference"
              value={receipt.transactionReference}
            />
          )}
          <ReceiptRow
            label="Date & time"
            value={formatReceiptDateTime(receipt.paymentDate)}
          />
          {receipt.receivedBy && (
            <ReceiptRow label="Received by" value={receipt.receivedBy} />
          )}
          <ReceiptRow
            label="Remaining balance"
            value={formatCurrency(receipt.remainingBalance)}
          />
          {receipt.creditBalance > 0 && (
            <ReceiptRow
              label="Credit balance"
              value={formatCurrency(receipt.creditBalance)}
            />
          )}
          {receipt.notes && (
            <ReceiptRow label="Notes" value={receipt.notes} />
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <div className="grid w-full grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={handlePrint}
            >
              <Printer className="mr-1.5 h-4 w-4" />
              Print
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
            >
              <Download className="mr-1.5 h-4 w-4" />
              {isGeneratingPdf ? "PDF…" : "PDF"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={() => downloadReceiptHtml(receipt, schoolName)}
            >
              <Download className="mr-1.5 h-4 w-4" />
              HTML
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={handleShare}
              disabled={sharing}
            >
              <Share2 className="mr-1.5 h-4 w-4" />
              Share
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={handleCopy}
            >
              <Copy className="mr-1.5 h-4 w-4" />
              Copy
            </Button>
          </div>
          <Button type="button" className="h-10 w-full" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
