"use client";

import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Receipt,
  Send,
  Download,
  X,
  RefreshCw,
  LayoutGrid,
  Wallet,
  Files,
  ScrollText,
  SlidersHorizontal,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FEES_BRAND } from "../lib/fees-ui";
import type { StudentSummaryDetail } from "../types";
import StudentPayments from "./StudentPayments";
import { StudentInvoicesTable } from "./StudentInvoicesTable";
import { useStudentInvoices } from "../hooks/useStudentInvoices";
import { useFeeReminderLog } from "../hooks/useFeeReminderLog";
import {
  getFigtreePrintFontLinks,
  figtreePrintBodyCss,
} from "@/lib/fonts/figtree";
import { StudentFeeProfileHero } from "./studentProfile/StudentFeeProfileHero";
import { StudentFeeLedger, StudentFeeReceipt } from "./studentProfile/StudentFeeLedger";
import {
  StudentFeePanel,
  StudentFeeEmptyTimeline,
  ReminderTimelineItem,
} from "./studentProfile/StudentFeeProfilePanels";

const PROFILE_TABS = [
  { value: "summary", label: "Overview", icon: LayoutGrid },
  { value: "payments", label: "Payments", icon: Wallet },
  { value: "invoices", label: "Invoices", icon: Files },
  { value: "statement", label: "Statement", icon: ScrollText },
  { value: "adjustments", label: "Adjust", icon: SlidersHorizontal },
  { value: "reminders", label: "Reminders", icon: Bell },
] as const;

type ProfileTab = (typeof PROFILE_TABS)[number]["value"];

function formatKes(amount: number) {
  return `KES ${amount.toLocaleString("en-KE")}`;
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
  const [activeTab, setActiveTab] = useState<ProfileTab>("summary");

  useEffect(() => {
    if (isOpen) refresh();
  }, [isOpen, refresh]);

  useEffect(() => {
    if (isOpen) setActiveTab("summary");
  }, [isOpen, studentId]);

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
  const feeItems = summary?.feeItems ?? [];

  const classLabel = studentData
    ? [studentData.gradeLevelName, studentData.streamName]
        .filter(Boolean)
        .join(" · ")
    : "";

  const printStatement = () => {
    if (!studentData || !summary) return;
    const rows = feeItems
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

  const showBody = studentId && studentData && !error && summary;

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      direction="right"
    >
      <DrawerContent
        className={cn(
          "flex h-full max-h-[100dvh] w-full flex-col border-l p-0",
          "max-w-[min(100vw,28rem)] sm:max-w-md",
        )}
        style={{ backgroundColor: FEES_BRAND.surface }}
      >
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
            <Loader2
              className="h-8 w-8 animate-spin"
              style={{ color: FEES_BRAND.primary }}
            />
            <p className="text-sm text-slate-600">Opening student ledger…</p>
          </div>
        ) : null}

        {error ? (
          <div className="flex flex-1 flex-col p-6">
            <p className="text-sm font-medium text-rose-800">{error}</p>
            <Button variant="outline" size="sm" className="mt-4 w-fit" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : null}

        {showBody ? (
          <>
            <div className="relative shrink-0">
              <StudentFeeProfileHero
                name={studentData.studentName}
                admissionNumber={studentData.admissionNumber}
                classLabel={classLabel}
                totalOwed={summary.totalOwed}
                totalPaid={summary.totalPaid}
                balance={summary.balance}
              />
              <DrawerClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-3 h-9 w-9 rounded-full border border-white/20 bg-black/20 text-white hover:bg-black/30 hover:text-white"
                  aria-label="Close profile"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as ProfileTab)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="relative z-10 -mt-4 shrink-0 px-3">
                <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-[0_8px_24px_-6px_rgba(15,23,42,0.12)]">
                  {PROFILE_TABS.map(({ value, label, icon: Icon }) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className={cn(
                        "flex min-h-[2.75rem] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold leading-tight",
                        "text-slate-500 transition-all",
                        "data-[state=active]:bg-[#e8f2ef] data-[state=active]:text-[#1a4d42] data-[state=active]:shadow-sm",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-3">
                <TabsContent value="summary" className="mt-0 space-y-4">
                  <InsightChips
                    itemCount={feeItems.length}
                    balance={summary.balance}
                    reminderCount={studentReminders.length}
                  />
                  <StudentFeeLedger items={feeItems} />
                </TabsContent>

                <TabsContent value="payments" className="mt-0">
                  <StudentFeePanel
                    title="Payment history"
                    description="Recorded collections against this student."
                  >
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                      <StudentPayments
                        studentId={studentId}
                        canVoid={canVoidPayments}
                        onPaymentVoided={onPaymentVoided}
                      />
                    </div>
                  </StudentFeePanel>
                </TabsContent>

                <TabsContent value="invoices" className="mt-0">
                  <StudentFeePanel
                    title="Invoices"
                    description="Term bills generated for this student."
                  >
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                      <StudentInvoicesTable
                        invoices={invoices}
                        studentName={studentData.studentName}
                        onViewInvoice={() => {}}
                      />
                    </div>
                    {invoicesLoading ? (
                      <p className="text-xs text-slate-500">Loading invoices…</p>
                    ) : null}
                    {invoicesError ? (
                      <p className="text-xs text-rose-600">{invoicesError}</p>
                    ) : null}
                  </StudentFeePanel>
                </TabsContent>

                <TabsContent value="statement" className="mt-0 space-y-4">
                  <StudentFeePanel
                    title="Printable statement"
                    description="Share at parent meetings or archive for audits."
                  >
                    <StudentFeeReceipt
                      items={feeItems}
                      balance={summary.balance}
                      studentName={studentData.studentName}
                      admissionNumber={studentData.admissionNumber}
                      classLabel={classLabel}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full gap-2"
                      onClick={printStatement}
                    >
                      <Download className="h-4 w-4" />
                      Print / save PDF
                    </Button>
                  </StudentFeePanel>
                </TabsContent>

                <TabsContent value="adjustments" className="mt-0">
                  <StudentFeePanel title="Fee adjustments">
                    {summary.balance < 0 ? (
                      <div className="mb-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                        Credit of {formatKes(Math.abs(summary.balance))} on file.
                        Log how you will apply or refund it.
                      </div>
                    ) : null}
                    <StudentFeeEmptyTimeline
                      icon={SlidersHorizontal}
                      title="Waivers & discounts"
                      body="Scholarships, transport removals, and manual credits are logged here and sync to Reports → Adjustments."
                      action={
                        onLogAdjustment ? (
                          <Button size="sm" onClick={onLogAdjustment}>
                            Log adjustment
                          </Button>
                        ) : undefined
                      }
                    />
                  </StudentFeePanel>
                </TabsContent>

                <TabsContent value="reminders" className="mt-0">
                  <StudentFeePanel
                    title="Reminder trail"
                    description="SMS and other nudges sent to guardians."
                  >
                    {studentReminders.length === 0 ? (
                      <StudentFeeEmptyTimeline
                        icon={Bell}
                        title="Quiet inbox"
                        body="No reminders logged yet. Send one when balance is outstanding."
                        action={
                          onSendReminder && summary.balance > 0 ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={onSendReminder}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Compose reminder
                            </Button>
                          ) : undefined
                        }
                      />
                    ) : (
                      <div className="pt-1">
                        {studentReminders.map((r) => (
                          <ReminderTimelineItem
                            key={r.id}
                            sentAt={r.sentAt}
                            channel={r.channel}
                            status={r.status}
                            message={r.message}
                          />
                        ))}
                        {onSendReminder && summary.balance > 0 ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-4 w-full"
                            onClick={onSendReminder}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Send another
                          </Button>
                        ) : null}
                      </div>
                    )}
                  </StudentFeePanel>
                </TabsContent>
              </div>
            </Tabs>

            <DrawerFooter
              className={cn(
                "shrink-0 flex-row flex-wrap gap-2 border-t border-slate-200/80 px-4 py-3",
                "bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/75",
              )}
            >
              {onRecordPayment ? (
                <Button
                  size="sm"
                  className="gap-1.5 shadow-md"
                  style={{ backgroundColor: FEES_BRAND.primary }}
                  onClick={onRecordPayment}
                >
                  <Receipt className="h-3.5 w-3.5 text-white" />
                  <span className="text-white">Record payment</span>
                </Button>
              ) : null}
              {onSendReminder && summary.balance > 0 ? (
                <Button size="sm" variant="outline" onClick={onSendReminder}>
                  <Send className="mr-1 h-3.5 w-3.5" />
                  Remind
                </Button>
              ) : null}
              {onRefresh ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto gap-1 text-slate-600"
                  onClick={onRefresh}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </Button>
              ) : null}
            </DrawerFooter>
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
};

function InsightChips({
  itemCount,
  balance,
  reminderCount,
}: {
  itemCount: number;
  balance: number;
  reminderCount: number;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="rounded-full border border-slate-200/80 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-sm">
        {itemCount} fee line{itemCount === 1 ? "" : "s"}
      </span>
      <span
        className={cn(
          "rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm",
          balance > 0
            ? "border-rose-200/80 bg-rose-50 text-rose-800"
            : "border-emerald-200/80 bg-emerald-50 text-emerald-800",
        )}
      >
        {balance > 0 ? `${formatKes(balance)} due` : "Nothing due"}
      </span>
      {reminderCount > 0 ? (
        <span className="rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-900 shadow-sm">
          {reminderCount} reminder{reminderCount === 1 ? "" : "s"} sent
        </span>
      ) : null}
    </div>
  );
}
