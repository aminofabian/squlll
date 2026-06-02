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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, Upload } from "lucide-react";
import {
  BULK_PAYMENT_CSV_TEMPLATE,
  downloadBulkPaymentTemplate,
  parseBulkPaymentCsv,
  type BulkPaymentCsvRow,
} from "../lib/bulkPaymentImport";
import { useGraphQLPayments } from "../hooks/useGraphQLPayments";
import { useToast } from "@/components/ui/use-toast";

interface BulkPaymentImportDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function BulkPaymentImportDialog({
  open,
  onClose,
  onComplete,
}: BulkPaymentImportDialogProps) {
  const { toast } = useToast();
  const { bulkImportPayments, isBulkImporting } = useGraphQLPayments();
  const [csvText, setCsvText] = useState(BULK_PAYMENT_CSV_TEMPLATE);
  const [dryRun, setDryRun] = useState(true);
  const [preview, setPreview] = useState<BulkPaymentCsvRow[]>([]);
  const [lastResult, setLastResult] = useState<Awaited<
    ReturnType<typeof bulkImportPayments>
  > | null>(null);

  const handleParse = () => {
    const rows = parseBulkPaymentCsv(csvText);
    setPreview(rows);
    setLastResult(null);
    if (rows.length === 0) {
      toast({
        title: "No valid rows",
        description: "Check your CSV headers and amount column.",
        variant: "destructive",
      });
    }
  };

  const handleFile = async (file: File) => {
    const text = await file.text();
    setCsvText(text);
    const rows = parseBulkPaymentCsv(text);
    setPreview(rows);
    setLastResult(null);
  };

  const handleImport = async () => {
    const rows = preview.length > 0 ? preview : parseBulkPaymentCsv(csvText);
    if (rows.length === 0) {
      toast({
        title: "Nothing to import",
        description: "Paste or upload a CSV with at least one valid row.",
        variant: "destructive",
      });
      return;
    }

    const result = await bulkImportPayments({
      rows: rows.map((row) => ({
        admissionNumber: row.admissionNumber,
        phone: row.phone,
        studentName: row.studentName,
        amount: row.amount,
        paymentMethod: row.paymentMethod,
        transactionReference: row.transactionReference,
        paymentDate: row.paymentDate,
      })),
      defaultPaymentMethod: "MPESA",
      dryRun,
    });

    if (!result) {
      toast({
        title: "Import failed",
        description: "Could not process bulk payments.",
        variant: "destructive",
      });
      return;
    }

    setLastResult(result);
    toast({
      title: dryRun ? "Preview complete" : "Import complete",
      description: `${result.successCount} matched, ${result.unmatchedCount} unmatched, ${result.errorCount} errors.`,
    });

    if (!dryRun) {
      onComplete?.();
    }
  };

  const handleClose = () => {
    setLastResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk payment import</DialogTitle>
          <DialogDescription>
            Import M-Pesa or bank statement payments. Students are matched by
            admission number, phone, or exact name.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadBulkPaymentTemplate}
            >
              <Download className="mr-1.5 h-4 w-4" />
              Template
            </Button>
            <label className="inline-flex">
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
              <Button type="button" variant="outline" size="sm" asChild>
                <span>
                  <Upload className="mr-1.5 h-4 w-4" />
                  Upload CSV
                </span>
              </Button>
            </label>
            <Button type="button" size="sm" variant="secondary" onClick={handleParse}>
              Preview rows
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bulk-csv">CSV data</Label>
            <Textarea
              id="bulk-csv"
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={dryRun}
              onCheckedChange={(checked) => setDryRun(checked === true)}
            />
            Preview only (dry run — no payments recorded)
          </label>

          {preview.length > 0 && (
            <p className="text-xs text-slate-600">
              {preview.length} valid row{preview.length !== 1 ? "s" : ""} ready
            </p>
          )}

          {lastResult && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2 max-h-48 overflow-y-auto">
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-800">
                  {lastResult.successCount} matched
                </Badge>
                <Badge variant="outline" className="bg-amber-50 text-amber-800">
                  {lastResult.unmatchedCount} unmatched
                </Badge>
                <Badge variant="outline" className="bg-rose-50 text-rose-800">
                  {lastResult.errorCount} errors
                </Badge>
              </div>
              <ul className="space-y-1 text-xs text-slate-700">
                {lastResult.results.slice(0, 20).map((row) => (
                  <li key={row.rowIndex}>
                    Row {row.rowIndex + 1}: {row.status}
                    {row.studentName ? ` · ${row.studentName}` : ""}
                    {row.receiptNumber ? ` · ${row.receiptNumber}` : ""}
                    {row.message ? ` — ${row.message}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={isBulkImporting}
          >
            {isBulkImporting ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : dryRun ? (
              "Run preview"
            ) : (
              "Import payments"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
