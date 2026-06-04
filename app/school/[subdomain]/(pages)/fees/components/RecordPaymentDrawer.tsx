"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import type {
  FeeInvoice,
  RecordPaymentForm,
  StudentSummaryFromAPI,
} from "../types";
import { useStudentInvoices } from "../hooks/useStudentInvoices";
import { useStudentSummary } from "../hooks/useStudentSummary";
import { useGraphQLInvoices } from "../hooks/useGraphQLInvoices";
import { useAcademicYears } from "@/lib/hooks/useAcademicYears";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "../utils";

interface RecordPaymentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  form: RecordPaymentForm;
  setForm: (updater: (prev: RecordPaymentForm) => RecordPaymentForm) => void;
  onSubmit: () => void | Promise<boolean>;
  isSubmitting?: boolean;
  studentId: string | null;
  students?: StudentSummaryFromAPI[];
  studentInfo?: {
    name: string;
    admissionNumber: string;
    className: string;
  };
  onPaymentSuccess?: () => void;
  canOverrideAllocation?: boolean;
}

export default function RecordPaymentDrawer({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  isSubmitting = false,
  studentId,
  students = [],
  studentInfo,
  onPaymentSuccess,
  canOverrideAllocation = false,
}: RecordPaymentDrawerProps) {
  const { toast } = useToast();
  const { generateInvoices, isGenerating: isGeneratingInvoice } =
    useGraphQLInvoices();
  const { getActiveAcademicYear, loading: academicYearsLoading } =
    useAcademicYears();
  const [pickedStudentId, setPickedStudentId] = useState<string | null>(
    studentId,
  );
  const [studentSearch, setStudentSearch] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPickedStudentId(studentId);
      setStudentSearch("");
    }
  }, [isOpen, studentId]);

  const effectiveStudentId = pickedStudentId;
  const pickedStudent = students.find((s) => s.id === effectiveStudentId);
  const effectiveStudentInfo = pickedStudent
    ? {
        name: pickedStudent.studentName,
        admissionNumber: pickedStudent.admissionNumber,
        className: pickedStudent.gradeLevelName,
      }
    : studentInfo;

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return students.slice(0, 50);
    return students
      .filter(
        (s) =>
          s.studentName.toLowerCase().includes(q) ||
          s.admissionNumber.toLowerCase().includes(q) ||
          s.gradeLevelName.toLowerCase().includes(q),
      )
      .slice(0, 50);
  }, [students, studentSearch]);

  const {
    invoices,
    loading: invoicesLoading,
    error: invoicesError,
    refetch: refetchInvoices,
  } = useStudentInvoices(effectiveStudentId, effectiveStudentInfo);

  const { studentData: studentDetail } = useStudentSummary(effectiveStudentId);

  const unpaidFeeItems =
    studentDetail?.feeSummary.feeItems.filter(
      (item) => (item.balance ?? item.amount - (item.amountPaid ?? 0)) > 0,
    ) ?? [];

  const arrears = Math.max(0, pickedStudent?.feeSummary.balance ?? 0);
  const creditBalance = pickedStudent?.feeSummary.creditBalance ?? 0;
  const totalBilled = pickedStudent?.feeSummary.totalOwed ?? 0;
  const totalPaid = pickedStudent?.feeSummary.totalPaid ?? 0;
  const balanceDue = arrears;

  const needsBilling =
    Boolean(effectiveStudentId) &&
    !invoicesLoading &&
    !invoicesError &&
    invoices.length === 0 &&
    balanceDue > 0;

  const handleGenerateBill = async () => {
    if (!effectiveStudentId) return;

    const activeYear = getActiveAcademicYear();
    const termId = activeYear?.terms?.[0]?.id;
    if (!termId) {
      toast({
        title: "No term available",
        description:
          "Set up an active academic year with terms before generating bills.",
        variant: "destructive",
      });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const result = await generateInvoices({
      studentId: effectiveStudentId,
      termId,
      issueDate: today,
      dueDate: today,
    });

    if (result?.length) {
      const invoice = result[0];
      toast({
        title: "Bill generated",
        description: `Invoice ${invoice.invoiceNumber} created for ${effectiveStudentInfo?.name ?? "student"}.`,
      });
      refetchInvoices();
      setForm((prev) => ({
        ...prev,
        invoiceId: invoice.id,
        amountPaid:
          prev.amountPaid || String(invoice.balanceAmount ?? balanceDue),
      }));
      return;
    }

    toast({
      title: "Could not generate bill",
      description:
        "No invoice was created. Confirm the fee structure is linked to this student's grade and includes the current term.",
      variant: "destructive",
    });
  };

  useEffect(() => {
    if (!effectiveStudentId || invoicesLoading || form.invoiceId) return;
    const owing = invoices.find((inv) => inv.amountDue > 0);
    if (owing) {
      setForm((prev) => ({
        ...prev,
        invoiceId: owing.id,
        amountPaid: prev.amountPaid || String(owing.amountDue),
      }));
    }
  }, [effectiveStudentId, invoices, invoicesLoading, form.invoiceId, setForm]);

  const payFullBalance = () => {
    const target =
      invoices.find((i) => i.id === form.invoiceId && i.amountDue > 0) ||
      invoices.find((i) => i.amountDue > 0);
    if (target) {
      setForm((prev) => ({
        ...prev,
        invoiceId: target.id,
        amountPaid: String(target.amountDue),
      }));
    } else if (balanceDue > 0) {
      setForm((prev) => ({
        ...prev,
        amountPaid: String(balanceDue),
      }));
    }
  };

  const handleChange = (
    field: keyof RecordPaymentForm,
    value: string | boolean,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    try {
      const ok = await onSubmit();
      if (!ok) return;

      refetchInvoices();
      onPaymentSuccess?.();
    } catch (error) {
      console.error("Error during payment submission:", error);
      toast({
        title: "Could not record payment",
        description: "Something went wrong. Try again once.",
        variant: "destructive",
      });
    }
  };

  const paymentMethods = [
    { value: "MPESA", label: "M-Pesa" },
    { value: "CASH", label: "Cash" },
    { value: "BANK_TRANSFER", label: "Bank transfer" },
    { value: "CHEQUE", label: "Cheque" },
    { value: "OTHER", label: "Other" },
  ];

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      direction="right"
    >
      <DrawerContent className="flex h-full max-h-[100dvh] max-w-xl flex-col">
        <DrawerHeader className="shrink-0">
          <DrawerTitle className="text-lg">Record payment</DrawerTitle>
        </DrawerHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {!effectiveStudentId ? (
            <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/80 p-4">
              <p className="text-sm text-amber-900 font-medium">
                First, choose the student who paid
              </p>
              <Input
                placeholder="Search by name or admission number…"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredStudents.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">
                    No students match your search.
                  </p>
                ) : (
                  filteredStudents.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setPickedStudentId(s.id);
                        setForm((prev) => ({
                          ...prev,
                          studentId: s.id,
                          paymentDate:
                            prev.paymentDate ||
                            new Date().toISOString().split("T")[0],
                        }));
                      }}
                      className="w-full text-left rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:border-primary hover:bg-primary/5"
                    >
                      <span className="font-medium text-slate-900">
                        {s.studentName}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {s.admissionNumber} · {s.gradeLevelName}
                        {s.feeSummary.balance > 0 &&
                          ` · ${s.feeSummary.balance.toLocaleString()} due`}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">
                    {effectiveStudentInfo?.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {effectiveStudentInfo?.admissionNumber} ·{" "}
                    {effectiveStudentInfo?.className}
                  </p>
                </div>
                {students.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs shrink-0"
                    onClick={() => {
                      setPickedStudentId(null);
                      setForm((prev) => ({
                        ...prev,
                        studentId: "",
                        invoiceId: "",
                        amountPaid: "",
                      }));
                    }}
                  >
                    Change
                  </Button>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Total billed
                  </p>
                  <p className="text-sm font-semibold tabular-nums text-slate-900">
                    KES {totalBilled.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Total paid
                  </p>
                  <p className="text-sm font-semibold tabular-nums text-emerald-800">
                    KES {totalPaid.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-rose-100 bg-rose-50/80 px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-rose-700 uppercase tracking-wide">
                    Arrears (outstanding)
                  </p>
                  <p className="text-2xl font-bold tabular-nums text-rose-900">
                    KES {balanceDue.toLocaleString()}
                  </p>
                  <p className="mt-1 text-[11px] text-rose-700/80">
                    Payments apply to oldest balances first (FIFO).
                  </p>
                </div>
                {balanceDue > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 border-rose-200 text-rose-800 hover:bg-rose-100"
                    onClick={payFullBalance}
                  >
                    Pay arrears
                  </Button>
                )}
              </div>
              {creditBalance > 0 ? (
                <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50/80 px-3 py-2">
                  <p className="text-xs text-blue-900">
                    Credit balance:{" "}
                    <span className="font-semibold tabular-nums">
                      KES {creditBalance.toLocaleString()}
                    </span>
                  </p>
                  <label className="flex items-center gap-2 text-xs text-blue-900">
                    <Checkbox
                      checked={form.applyCreditBalance}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({
                          ...prev,
                          applyCreditBalance: checked === true,
                        }))
                      }
                    />
                    Apply credit to this invoice first
                  </label>
                </div>
              ) : null}
            </>
          )}

          {effectiveStudentId && (
            <>
              {needsBilling && (
                <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-sm text-amber-950">
                  <p>
                    This student owes{" "}
                    <span className="font-semibold tabular-nums">
                      KES {balanceDue.toLocaleString()}
                    </span>{" "}
                    from linked fee structures, but no bill has been generated yet.
                  </p>
                  <p className="text-xs text-amber-800">
                    Linking grades assigns fees to students. Billing (generating
                    invoices) is a separate step before you can record payments.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleGenerateBill}
                    disabled={isGeneratingInvoice || academicYearsLoading}
                  >
                    {isGeneratingInvoice ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating bill…
                      </>
                    ) : (
                      "Generate bill for this student"
                    )}
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="invoice">Bill / invoice</Label>
                <Select
                  value={form.invoiceId}
                  onValueChange={(v) => handleChange("invoiceId", v)}
                  disabled={needsBilling}
                >
                  <SelectTrigger id="invoice">
                    <SelectValue
                      placeholder={
                        invoicesLoading
                          ? "Loading invoices..."
                          : "Select invoice"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {invoicesLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="ml-2">Loading invoices...</span>
                      </div>
                    ) : invoicesError ? (
                      <div className="p-4 text-sm text-red-600">
                        Error loading invoices: {invoicesError}
                      </div>
                    ) : invoices.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500">
                        {needsBilling
                          ? "Generate a bill above to continue"
                          : "No invoices found for this student"}
                      </div>
                    ) : (
                      invoices.map((inv) => (
                        <SelectItem key={inv.id} value={inv.id}>
                          {inv.feeType.toUpperCase()} • Due{" "}
                          {new Date(inv.dueDate).toLocaleDateString()} • KES{" "}
                          {inv.amountDue.toLocaleString()}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount Paid (KES)</Label>
                <Input
                  id="amount"
                  inputMode="decimal"
                  value={form.amountPaid}
                  onChange={(e) => handleChange("amountPaid", e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select
                  value={form.paymentMethod}
                  onValueChange={(v) => handleChange("paymentMethod", v)}
                >
                  <SelectTrigger id="method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Payment Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.paymentDate}
                  onChange={(e) => handleChange("paymentDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ref">Reference Number</Label>
                <Input
                  id="ref"
                  value={form.referenceNumber}
                  onChange={(e) =>
                    handleChange("referenceNumber", e.target.value)
                  }
                  placeholder={
                    form.paymentMethod === "mpesa"
                      ? "M-Pesa confirmation code"
                      : "Receipt or transaction reference"
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={form.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Optional notes"
                />
              </div>

              {canOverrideAllocation && unpaidFeeItems.length > 0 && (
                <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Checkbox
                      checked={form.useManualAllocation}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({
                          ...prev,
                          useManualAllocation: checked === true,
                          allocations: {},
                        }))
                      }
                    />
                    Manual allocation override
                  </label>
                  {form.useManualAllocation && (
                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-500">
                        Amounts must sum to the invoice portion of this payment.
                      </p>
                      {unpaidFeeItems.map((item) => {
                        const due =
                          item.balance ??
                          item.amount - (item.amountPaid ?? 0);
                        return (
                          <div
                            key={item.id}
                            className="grid grid-cols-[1fr_7rem] gap-2 items-center"
                          >
                            <div className="min-w-0 text-xs">
                              <p className="font-medium text-slate-800 truncate">
                                {item.feeBucketName}
                              </p>
                              <p className="text-slate-500 truncate">
                                {item.feeStructureName} · {formatCurrency(due)}{" "}
                                due
                              </p>
                            </div>
                            <Input
                              inputMode="decimal"
                              placeholder="0"
                              value={form.allocations[item.id] ?? ""}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  allocations: {
                                    ...prev.allocations,
                                    [item.id]: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="partial"
                  checked={form.partialPayment}
                  onCheckedChange={(checked) =>
                    handleChange("partialPayment", Boolean(checked))
                  }
                />
                <Label htmlFor="partial">Mark as partial payment</Label>
              </div>
            </>
          )}
        </div>

        <DrawerFooter className="shrink-0 border-t pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex gap-2">
            <Button
              onClick={() => void handleSubmit()}
              disabled={
                isSubmitting ||
                !effectiveStudentId ||
                !form.invoiceId ||
                !form.amountPaid ||
                !form.paymentDate ||
                invoicesLoading ||
                needsBilling ||
                isGeneratingInvoice
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : invoicesLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Save & receipt"
              )}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
