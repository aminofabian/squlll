"use client";

import { useEffect, useMemo, useState } from "react";
import { Banknote, Check, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AcademicYear } from "@/lib/hooks/useAcademicYears";
import type { StudentDetailSummary } from "@/types/student";
import { useStudentInvoices } from "../../fees/hooks/useStudentInvoices";
import { roundToNearestTen } from "../../fees/lib/feesAmounts";
import { studentsEnrollLink, studentsPanel } from "./students-ui";

const METHODS = [
  { id: "CASH", label: "Cash", hint: "Counted at the office" },
  { id: "MPESA", label: "M-Pesa", hint: "Till or paybill" },
  { id: "BANK_TRANSFER", label: "Bank", hint: "Transfer slip" },
  { id: "CHEQUE", label: "Cheque", hint: "Cheque number" },
] as const;

type PaymentMethodId = (typeof METHODS)[number]["id"];

interface Receipt {
  receiptNumber: string;
  amount: number;
  paymentMethod: string;
}

const fieldClass =
  "h-9 rounded-lg border-[#1a4d42]/15 bg-white text-sm shadow-none focus-visible:border-[#246a59]/50 focus-visible:ring-[#246a59]/20 dark:border-white/15 dark:bg-[#071411]";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

function suggestedAmounts(balance: number) {
  if (balance <= 0) return [];
  const full = Math.round(balance);
  const half = roundToNearestTen(full / 2);
  const chips = [{ label: "Full", amount: full }];
  if (half > 0 && half < full) chips.push({ label: "Half", amount: half });
  for (const amount of [1000, 5000, 10000]) {
    if (amount < full) chips.push({ label: formatCurrency(amount), amount });
  }
  return chips.slice(0, 4);
}

function currentTermId(activeYear: AcademicYear | null) {
  const terms = activeYear?.terms ?? [];
  return (terms.find((term) => term.isCurrent) ?? terms.find((term) => term.isActive) ?? terms[0])?.id;
}

async function graphqlRequest<T>(query: string, variables: Record<string, unknown>, field: string): Promise<T> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const body = await response.json();
  if (body.errors?.length) {
    throw new Error(body.errors[0].message ?? "Request failed");
  }
  const data = body.data?.[field];
  if (data == null) throw new Error("Request failed");
  return data as T;
}

interface StudentPaymentDeskProps {
  student: StudentDetailSummary;
  activeYear: AcademicYear | null;
  onRecorded: () => void;
}

export function StudentPaymentDesk({ student, activeYear, onRecorded }: StudentPaymentDeskProps) {
  const balance = Math.max(0, student.feeSummary.balance);
  const { invoices, loading, refetch } = useStudentInvoices(student.id, {
    name: student.studentName,
    admissionNumber: student.admissionNumber,
    className: student.gradeLevelName,
  });
  const openInvoices = useMemo(
    () => invoices.filter((invoice) => invoice.amountDue > 0),
    [invoices],
  );
  const [invoiceId, setInvoiceId] = useState("");
  const [method, setMethod] = useState<PaymentMethodId>("CASH");
  const [amount, setAmount] = useState(balance > 0 ? String(Math.round(balance)) : "");
  const [reference, setReference] = useState("");
  const [paidOn, setPaidOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState<"bill" | "pay" | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    if (!invoiceId && openInvoices[0]) setInvoiceId(openInvoices[0].id);
  }, [invoiceId, openInvoices]);

  const selected = openInvoices.find((invoice) => invoice.id === invoiceId) ?? openInvoices[0];
  const due = selected?.amountDue ?? balance;
  const parsedAmount = Number(amount);
  const chips = suggestedAmounts(due);

  const openBill = async () => {
    const termId = currentTermId(activeYear);
    if (!termId) {
      toast.error("Set up an active term before opening a bill");
      return;
    }
    setBusy("bill");
    try {
      const today = new Date().toISOString().slice(0, 10);
      const created = await graphqlRequest<Array<{ id: string; balanceAmount: number }>>(
        `mutation GenerateInvoices($input: CreateInvoiceInput!) {
          generateInvoices(input: $input) { id balanceAmount }
        }`,
        { input: { studentId: student.id, termId, issueDate: today, dueDate: today } },
        "generateInvoices",
      );
      const bill = created[0];
      if (!bill) throw new Error("No bill was opened");
      setInvoiceId(bill.id);
      if (bill.balanceAmount > 0) setAmount(String(Math.round(bill.balanceAmount)));
      toast.success("Bill opened. You can stamp the receipt now.");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not open a bill");
    } finally {
      setBusy(null);
    }
  };

  const stampReceipt = async () => {
    if (!selected) {
      toast.error("Open a bill before recording this payment");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      toast.error("Enter an amount greater than zero");
      return;
    }
    setBusy("pay");
    try {
      const payment = await graphqlRequest<Receipt>(
        `mutation CreatePayment($input: CreatePaymentInput!) {
          createPayment(input: $input) { receiptNumber amount paymentMethod }
        }`,
        {
          input: {
            invoiceId: selected.id,
            amount: roundToNearestTen(parsedAmount),
            paymentMethod: method,
            transactionReference: reference.trim() || undefined,
            paymentDate: new Date(paidOn).toISOString(),
            notes: `Recorded from ${student.studentName}'s fee till`,
          },
        },
        "createPayment",
      );
      setReceipt(payment);
      setReference("");
      toast.success(`Receipt ${payment.receiptNumber} stamped`);
      refetch();
      onRecorded();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not record payment");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className={cn(studentsPanel, "relative overflow-hidden")}>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-dashed border-[#1a4d42]/20 px-4 py-4 sm:px-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1a4d42]/45">
            Fee till
          </p>
          <h3 className="mt-1 text-sm font-semibold text-[#0a1f1a] dark:text-white">
            Take a payment for {student.studentName.split(" ")[0] || "this student"}
          </h3>
        </div>
        <p className={cn("text-2xl font-semibold tabular-nums", balance > 0 ? "text-amber-800" : "text-[#246a59]")}>
          {formatCurrency(balance)}
          <span className="mt-0.5 block text-right text-[10px] font-medium uppercase tracking-[0.14em] text-[#1a4d42]/40">
            {balance > 0 ? "Still due" : "Settled"}
          </span>
        </p>
      </div>

      {receipt ? (
        <ReceiptSlip receipt={receipt} onAnother={() => setReceipt(null)} />
      ) : (
        <TillForm
          loading={loading}
          openInvoices={openInvoices.map((invoice) => ({
            id: invoice.id,
            label: `${invoice.term} · ${formatCurrency(invoice.amountDue)}`,
          }))}
          invoiceId={selected?.id ?? ""}
          onInvoice={setInvoiceId}
          method={method}
          onMethod={setMethod}
          amount={amount}
          onAmount={setAmount}
          chips={chips}
          reference={reference}
          onReference={setReference}
          paidOn={paidOn}
          onPaidOn={setPaidOn}
          needsBill={!loading && openInvoices.length === 0 && balance > 0}
          busy={busy}
          onOpenBill={() => void openBill()}
          onStamp={() => void stampReceipt()}
          extra={parsedAmount > due && due > 0}
        />
      )}
    </div>
  );
}

function TillForm(props: {
  loading: boolean;
  openInvoices: { id: string; label: string }[];
  invoiceId: string;
  onInvoice: (id: string) => void;
  method: PaymentMethodId;
  onMethod: (method: PaymentMethodId) => void;
  amount: string;
  onAmount: (amount: string) => void;
  chips: { label: string; amount: number }[];
  reference: string;
  onReference: (value: string) => void;
  paidOn: string;
  onPaidOn: (value: string) => void;
  needsBill: boolean;
  busy: "bill" | "pay" | null;
  onOpenBill: () => void;
  onStamp: () => void;
  extra: boolean;
}) {
  return (
    <div className="space-y-4 p-4 sm:p-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {METHODS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => props.onMethod(option.id)}
            className={cn(
              "border px-2 py-2 text-left",
              props.method === option.id
                ? "border-[#0a1f1a] bg-[#0a1f1a] text-white"
                : "border-[#1a4d42]/12 bg-[#f8fbfa] text-[#0a1f1a] hover:border-[#246a59]/40 dark:bg-[#071411] dark:text-white",
            )}
          >
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              {option.id === "MPESA" ? <Smartphone className="h-3.5 w-3.5" /> : <Banknote className="h-3.5 w-3.5" />}
              {option.label}
            </span>
            <span className={cn("mt-0.5 block text-[10px]", props.method === option.id ? "text-white/70" : "text-[#1a4d42]/45")}>
              {option.hint}
            </span>
          </button>
        ))}
      </div>

      {props.needsBill ? (
        <div className="border border-dashed border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-900">
          <p>This balance has no open bill yet.</p>
          <Button type="button" size="sm" className={cn(studentsEnrollLink, "mt-2 h-8")} onClick={props.onOpenBill} disabled={props.busy != null}>
            {props.busy === "bill" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Open a bill
          </Button>
        </div>
      ) : null}

      {props.openInvoices.length > 1 ? (
        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">Bill</span>
          <select
            className={cn(fieldClass, "w-full px-2")}
            value={props.invoiceId}
            onChange={(event) => props.onInvoice(event.target.value)}
          >
            {props.openInvoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>{invoice.label}</option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">Amount</span>
          <Input className={fieldClass} inputMode="decimal" value={props.amount} onChange={(event) => props.onAmount(event.target.value)} placeholder="0" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">Paid on</span>
          <Input className={fieldClass} type="date" value={props.paidOn} onChange={(event) => props.onPaidOn(event.target.value)} />
        </label>
      </div>

      {props.chips.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {props.chips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              className="border border-[#1a4d42]/15 bg-white px-2.5 py-1 text-xs text-[#1a4d42] hover:border-[#246a59] hover:text-[#246a59] dark:bg-[#071411] dark:text-white"
              onClick={() => props.onAmount(String(chip.amount))}
            >
              {chip.label}
            </button>
          ))}
        </div>
      ) : null}

      {props.method !== "CASH" ? (
        <label className="block">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">Reference</span>
          <Input className={fieldClass} value={props.reference} onChange={(event) => props.onReference(event.target.value)} placeholder="M-Pesa code or slip number" />
        </label>
      ) : null}

      {props.extra ? (
        <p className="text-xs text-[#1a4d42]/55">Anything above this bill stays on the account as credit.</p>
      ) : null}

      <Button type="button" className={cn(studentsEnrollLink, "h-9 px-3")} onClick={props.onStamp} disabled={props.busy != null || props.loading}>
        {props.busy === "pay" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        Stamp receipt
      </Button>
    </div>
  );
}

function ReceiptSlip({ receipt, onAnother }: { receipt: Receipt; onAnother: () => void }) {
  return (
    <div className="relative mx-4 my-4 border border-dashed border-[#1a4d42]/25 bg-[#f8fbfa] px-4 py-5 dark:bg-[#071411] sm:mx-5">
      <span className="pointer-events-none absolute right-5 top-6 -rotate-12 border-2 border-[#246a59] px-2 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#246a59]">
        Paid
      </span>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1a4d42]/45">Receipt</p>
      <p className="mt-2 font-mono text-sm text-[#0a1f1a] dark:text-white">{receipt.receiptNumber}</p>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-[#0a1f1a] dark:text-white">
        {formatCurrency(receipt.amount)}
      </p>
      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#1a4d42]/50">
        {receipt.paymentMethod.split("_").join(" ")}
      </p>
      <Button type="button" variant="outline" size="sm" className="mt-4 h-8 rounded-lg text-xs" onClick={onAnother}>
        Take another
      </Button>
    </div>
  );
}
