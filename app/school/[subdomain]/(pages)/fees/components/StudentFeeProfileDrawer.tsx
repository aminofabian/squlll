"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Receipt, Send, FileText, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudentSummaryDetail } from "../types";
import { FeeSummaryCard } from "./FeeSummaryCard";
import StudentPayments from "./StudentPayments";
import { StudentInvoicesTable } from "./StudentInvoicesTable";
import { useStudentInvoices } from "../hooks/useStudentInvoices";
import { useFeeReminderLog } from "../hooks/useFeeReminderLog";
import { useEffect } from "react";
import {
  getFigtreePrintFontLinks,
  figtreePrintBodyCss,
} from "@/lib/fonts/figtree";

function feeStatus(balance: number, paid: number): {
  label: string;
  className: string;
} {
  if (balance <= 0 && paid > 0) {
    return { label: "Paid", className: "bg-emerald-100 text-emerald-800" };
  }
  if (balance > 0 && paid > 0) {
    return { label: "Partial", className: "bg-amber-100 text-amber-800" };
  }
  if (balance > 0) {
    return { label: "Owing", className: "bg-rose-100 text-rose-800" };
  }
  return { label: "No fees", className: "bg-slate-100 text-slate-600" };
}

interface StudentFeeProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string | null;
  studentData: StudentSummaryDetail | null;
  loading: boolean;
  error: string | null;
  onRefresh?: () => void;
  onRecordPayment?: () => void;
  onSendReminder?: () => void;
  onLogAdjustment?: () => void;
  canVoidPayments?: boolean;
  onPaymentVoided?: (paymentId: string, reason: string) => void;
}

export const StudentFeeProfileDrawer = ({
  isOpen,
  onClose,
  studentId,
  studentData,
  loading,
  error,
  onRefresh,
  onRecordPayment,
  onSendReminder,
  onLogAdjustment,
  canVoidPayments = false,
  onPaymentVoided,
}: StudentFeeProfileDrawerProps) => {
  const { forStudent, refresh } = useFeeReminderLog();

  useEffect(() => {
    if (isOpen) refresh();
  }, [isOpen, refresh]);

  const studentReminders = studentId ? forStudent(studentId) : [];

  const studentInfo = studentData
    ? {
        name: studentData.studentName,
        admissionNumber: studentData.admissionNumber,
        className: [studentData.gradeLevelName, studentData.streamName]
          .filter(Boolean)
          .join(" "),
      }
    : undefined;

  const {
    invoices,
    loading: invoicesLoading,
    error: invoicesError,
  } = useStudentInvoices(studentId, studentInfo ?? undefined);

  const summary = studentData?.feeSummary;
  const status = summary
    ? feeStatus(summary.balance, summary.totalPaid)
    : null;

  const classLabel = studentData
    ? [studentData.gradeLevelName, studentData.streamName]
        .filter(Boolean)
        .join(" · ")
    : "";

  const printStatement = () => {
    if (!studentData || !summary) return;
    const rows = (summary.feeItems ?? [])
      .map(
        (item) =>
          `<tr><td>${item.feeBucketName}</td><td style="text-align:right">KES ${item.amount.toLocaleString()}</td></tr>`,
      )
      .join("");
    const html = `<!DOCTYPE html><html><head><title>Fee Statement</title>
      ${getFigtreePrintFontLinks()}
      <style>body{${figtreePrintBodyCss("padding:24px")}}table{width:100%;border-collapse:collapse}td,th{padding:8px;border-bottom:1px solid #eee}</style></head>
      <body><h1>${studentData.studentName}</h1><p>${studentData.admissionNumber} · ${classLabel}</p>
      <table><thead><tr><th>Item</th><th>Amount</th></tr></thead><tbody>${rows}
      <tr><td><strong>Balance due</strong></td><td style="text-align:right"><strong>KES ${summary.balance.toLocaleString()}</strong></td></tr></tbody></table></body></html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.print();
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[92vh]">
        <DrawerHeader className="border-b border-slate-100 pb-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading student…
            </div>
          ) : error ? (
            <DrawerTitle className="text-rose-700">
              Could not load profile
            </DrawerTitle>
          ) : studentData ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <DrawerTitle className="text-xl">
                    {studentData.studentName}
                  </DrawerTitle>
                  <DrawerDescription className="mt-1">
                    {studentData.admissionNumber}
                    {classLabel ? ` · ${classLabel}` : ""}
                  </DrawerDescription>
                </div>
                {status && (
                  <Badge className={cn("shrink-0", status.className)}>
                    {status.label}
                  </Badge>
                )}
              </div>

              {summary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="rounded-lg bg-rose-50 border border-rose-100 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-rose-600 font-medium">
                      Balance
                    </p>
                    <p className="text-lg font-bold tabular-nums text-rose-800">
                      KES {summary.balance.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">
                      Total fees
                    </p>
                    <p className="text-lg font-bold tabular-nums text-slate-900">
                      KES {summary.totalOwed.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-emerald-600 font-medium">
                      Paid
                    </p>
                    <p className="text-lg font-bold tabular-nums text-emerald-800">
                      KES {summary.totalPaid.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-end col-span-2 sm:col-span-1">
                    {onRecordPayment && (
                      <Button size="sm" onClick={onRecordPayment}>
                        <Receipt className="h-3.5 w-3.5 mr-1" />
                        Record payment
                      </Button>
                    )}
                    {onSendReminder && summary.balance > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={onSendReminder}
                      >
                        <Send className="h-3.5 w-3.5 mr-1" />
                        Remind
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <DrawerTitle>Student fee profile</DrawerTitle>
          )}
        </DrawerHeader>

        {studentId && studentData && !error && (
          <div className="overflow-y-auto px-4 pb-6">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-slate-100 p-1">
                <TabsTrigger value="summary" className="text-xs">
                  Summary
                </TabsTrigger>
                <TabsTrigger value="payments" className="text-xs">
                  Payments
                </TabsTrigger>
                <TabsTrigger value="invoices" className="text-xs">
                  Invoices
                </TabsTrigger>
                <TabsTrigger value="statement" className="text-xs">
                  Statement
                </TabsTrigger>
                <TabsTrigger value="adjustments" className="text-xs">
                  Adjustments
                </TabsTrigger>
                <TabsTrigger value="reminders" className="text-xs">
                  Reminders
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-4">
                <FeeSummaryCard
                  studentData={studentData}
                  invoiceData={invoices}
                  loading={loading || invoicesLoading}
                  error={error || invoicesError}
                />
              </TabsContent>

              <TabsContent value="payments" className="mt-4">
                <StudentPayments
                  studentId={studentId}
                  canVoid={canVoidPayments}
                  onPaymentVoided={onPaymentVoided}
                />
              </TabsContent>

              <TabsContent value="invoices" className="mt-4">
                <StudentInvoicesTable
                  invoices={invoices}
                  studentName={studentData.studentName}
                  onViewInvoice={() => {}}
                />
              </TabsContent>

              <TabsContent value="statement" className="mt-4 space-y-3">
                <p className="text-sm text-slate-600">
                  Running balance for this student. Export PDF when your school
                  letterhead is configured.
                </p>
                <div className="rounded-lg border border-slate-200 overflow-hidden text-sm">
                  <table className="w-full">
                    <thead className="bg-slate-50 text-left text-xs text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Item</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(summary?.feeItems ?? []).map((item) => (
                        <tr
                          key={item.id}
                          className="border-t border-slate-100"
                        >
                          <td className="px-3 py-2">{item.feeBucketName}</td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            KES {item.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t border-slate-200 font-medium">
                        <td className="px-3 py-2">Balance due</td>
                        <td className="px-3 py-2 text-right tabular-nums text-rose-700">
                          KES {(summary?.balance ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <Button variant="outline" size="sm" onClick={printStatement}>
                  <Download className="h-4 w-4 mr-2" />
                  Print statement
                </Button>
              </TabsContent>

              <TabsContent value="adjustments" className="mt-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 space-y-3">
                  {summary && summary.balance < 0 && (
                    <p className="text-blue-800 bg-blue-50 border border-blue-100 rounded-md px-3 py-2 text-xs">
                      This student has a credit of KES{" "}
                      {Math.abs(summary.balance).toLocaleString()}. You can
                      carry it forward to the next term, apply to a sibling, or
                      process a refund — log the decision below.
                    </p>
                  )}
                  <p>
                    Log discounts, waivers, scholarships, or transport removals.
                    Entries appear in Reports → Adjustments log.
                  </p>
                  {onLogAdjustment && (
                    <Button size="sm" onClick={onLogAdjustment}>
                      Log adjustment
                    </Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reminders" className="mt-4">
                <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-600 space-y-3">
                  {studentReminders.length === 0 ? (
                    <p>No reminders logged for this student yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {studentReminders.map((r) => (
                        <li
                          key={r.id}
                          className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2"
                        >
                          <p className="text-xs text-slate-500">
                            {new Date(r.sentAt).toLocaleString()} ·{" "}
                            {r.channel.toUpperCase()} · {r.status}
                          </p>
                          <p className="text-sm text-slate-800 mt-1 line-clamp-2">
                            {r.message}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                  {onSendReminder && summary && summary.balance > 0 && (
                    <Button size="sm" variant="outline" onClick={onSendReminder}>
                      <Send className="h-4 w-4 mr-2" />
                      Send fee reminder
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {onRefresh && (
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={onRefresh}>
                  Refresh data
                </Button>
              </div>
            )}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};
