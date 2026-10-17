"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  Loader2,
  Mail,
  MessageCircle,
  Printer,
  Send,
  Smartphone,
} from "lucide-react";
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
import { toast } from "sonner";
import type { StudentDetailSummary } from "@/types/student";
import { useStudentInvoices } from "../../fees/hooks/useStudentInvoices";
import {
  useMpesaCustody,
  type MpesaStkIntent,
} from "../../fees/hooks/useMpesaCustody";
import { schoolPortalUrl } from "@/lib/auth/post-login-navigation";

type Phase = "form" | "waiting" | "success" | "failed";

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 90_000;

function kes(value: number) {
  return `KES ${Math.round(value).toLocaleString("en-KE")}`;
}

function invoiceLabel(invoice: {
  term: string;
  amountDue: number;
}) {
  return `${invoice.term || "This term"} · ${kes(invoice.amountDue)} due`;
}

async function sendReceiptEmail(paymentId: string, email: string) {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        mutation EmailReceipt($paymentId: ID!, $emailAddress: String!) {
          emailReceipt(paymentId: $paymentId, emailAddress: $emailAddress)
        }
      `,
      variables: { paymentId, emailAddress: email },
    }),
  });
  const body = await response.json();
  if (body.errors?.length) {
    throw new Error(body.errors[0]?.message ?? "Could not email receipt");
  }
}

interface StudentMpesaPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentDetailSummary;
  onSettled: () => void;
  onOpenMoney?: () => void;
}

export function StudentMpesaPromptDialog({
  open,
  onOpenChange,
  student,
  onSettled,
  onOpenMoney,
}: StudentMpesaPromptDialogProps) {
  const params = useParams();
  const subdomain =
    typeof params?.subdomain === "string" ? params.subdomain : "";
  const { invoices, loading: invoicesLoading, refetch: refetchInvoices } =
    useStudentInvoices(student.id, {
      name: student.studentName,
      admissionNumber: student.admissionNumber,
      className: student.gradeLevelName,
    });
  const { availability, destination, initiateStk, pollIntent } = useMpesaCustody();
  const openInvoices = useMemo(
    () => invoices.filter((invoice) => invoice.amountDue > 0),
    [invoices],
  );

  const [phase, setPhase] = useState<Phase>("form");
  const [selectedId, setSelectedId] = useState("");
  const [amountInput, setAmountInput] = useState<string | null>(null);
  const [phone, setPhone] = useState(student.phone ?? "");
  const [intent, setIntent] = useState<MpesaStkIntent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [copied, setCopied] = useState(false);
  const settledRef = useRef(false);

  const selected =
    openInvoices.find((invoice) => invoice.id === selectedId) ??
    openInvoices[0] ??
    null;
  const balance = Math.max(0, student.feeSummary.balance);
  const railOn = availability?.available === true;
  const paymentTarget =
    destination?.type === "paybill"
      ? `Paybill ${destination.businessNumber} · Account ${destination.accountNumber}`
      : destination?.type === "till"
        ? `Till ${destination.tillNumber}`
        : null;

  const amount =
    amountInput ??
    (selected ? String(Math.ceil(selected.amountDue)) : "");

  const selectedAmount = selected?.amountDue ?? balance;

  const settle = () => {
    if (settledRef.current) return;
    settledRef.current = true;
    onSettled();
    void refetchInvoices();
  };

  useEffect(() => {
    if (phase !== "waiting" || !intent?.id) return;
    let cancelled = false;
    const startedAt = Date.now();
    let timeout: number | undefined;

    const tick = async () => {
      if (cancelled) return;
      try {
        const latest = await pollIntent(intent.id);
        if (cancelled) return;
        setIntent(latest);
        if (latest.status === "SUCCESS") {
          settle();
          setPhase("success");
          return;
        }
        if (latest.status === "FAILED") {
          setPhase("failed");
          setError(latest.resultDesc ?? "M-Pesa could not complete the payment.");
          return;
        }
      } catch {
        // Keep polling on transient errors.
      }
      if (!cancelled && Date.now() - startedAt < POLL_TIMEOUT_MS) {
        timeout = window.setTimeout(tick, POLL_INTERVAL_MS);
      } else if (!cancelled) {
        setPhase("failed");
        setError(
          "Still waiting on M-Pesa. If the money left the account, the fee balance will update shortly.",
        );
      }
    };

    timeout = window.setTimeout(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      if (timeout) window.clearTimeout(timeout);
    };
  }, [phase, intent?.id, pollIntent]);

  const handleSend = async () => {
    if (!selected) {
      setError("Open a bill for this student first, then send an M-Pesa request.");
      return;
    }
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (numericAmount > selectedAmount) {
      setError(`The amount cannot be more than ${kes(selectedAmount)}.`);
      return;
    }
    if (phone.replace(/\D/g, "").length < 9) {
      setError("Enter the phone number that will receive the M-Pesa request.");
      return;
    }

    setSending(true);
    setError(null);
    setPhase("waiting");
    try {
      const created = await initiateStk({
        invoiceId: selected.id,
        amount: numericAmount,
        phone: phone.trim(),
        accountReference: student.admissionNumber,
        notes: `M-Pesa request from ${student.studentName}'s profile`,
      });
      setIntent(created);
      if (created.status === "SUCCESS") {
        settle();
        setPhase("success");
      } else if (created.status === "FAILED") {
        setPhase("failed");
        setError(created.resultDesc ?? "M-Pesa declined the request.");
      }
    } catch (err) {
      setPhase("failed");
      setError(
        err instanceof Error
          ? err.message
          : "Could not send the M-Pesa request.",
      );
    } finally {
      setSending(false);
    }
  };

  const receiptRef =
    intent?.mpesaReceipt ?? intent?.paymentId ?? intent?.id ?? "";
  const receiptLink = useMemo(() => {
    if (!intent || !receiptRef) return "";
    const query = new URLSearchParams({
      ref: receiptRef,
      student: student.studentName,
      admission: student.admissionNumber,
      class: `${student.gradeLevelName}${
        student.streamName ? ` · ${student.streamName}` : ""
      }`,
      amount: String(intent.amount),
      date: intent.createdAt,
      phone: intent.phone,
    });
    return schoolPortalUrl(subdomain, `/receipt?${query.toString()}`);
  }, [intent, receiptRef, student, subdomain]);

  const receiptText = useMemo(() => {
    if (!intent) return "";
    return [
      `Payment received — ${student.studentName}`,
      `Amount: ${kes(intent.amount)}`,
      `M-Pesa reference: ${receiptRef || "—"}`,
      `Date: ${new Date(intent.createdAt).toLocaleString("en-KE")}`,
      `New fee balance: ${kes(Math.max(0, balance - intent.amount))}`,
      receiptLink ? `View receipt: ${receiptLink}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }, [intent, receiptRef, student.studentName, balance, receiptLink]);

  const copyReceiptLink = async () => {
    if (!receiptLink) return;
    try {
      await navigator.clipboard.writeText(receiptLink);
      setCopied(true);
      toast.success("Receipt link copied — send it to the parent or student.");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy the receipt link.");
    }
  };

  const shareWhatsApp = () => {
    if (!intent) return;
    const digits = (intent.phone || phone).replace(/\D/g, "");
    const international = digits.startsWith("0")
      ? `254${digits.slice(1)}`
      : digits;
    window.open(
      `https://wa.me/${international}?text=${encodeURIComponent(receiptText)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const emailReceipt = async () => {
    if (!intent) return;
    if (!intent.paymentId) {
      window.location.href = `mailto:${student.email}?subject=${encodeURIComponent(
        "School fees receipt",
      )}&body=${encodeURIComponent(receiptText)}`;
      return;
    }
    if (!student.email) {
      toast.error("This student has no email address on file.");
      return;
    }
    setEmailing(true);
    try {
      await sendReceiptEmail(intent.paymentId, student.email);
      toast.success(`Receipt emailed to ${student.email}.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not email the receipt.",
      );
    } finally {
      setEmailing(false);
    }
  };

  const openMoney = () => {
    onOpenChange(false);
    onOpenMoney?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-none p-0 sm:max-w-md">
        <DialogHeader className="space-y-1 border-b border-[#1a4d42]/12 bg-[#f8fbfa] px-5 py-4 text-left dark:border-white/10 dark:bg-[#071411]">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center border border-[#246a59]/25 bg-[#e8f2ef] text-[#246a59]">
              <Smartphone className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle className="text-base text-[#0a1f1a] dark:text-white">
                Request M-Pesa payment
              </DialogTitle>
              <DialogDescription className="text-[11px] text-[#1a4d42]/55">
                Send a payment request to the parent&apos;s phone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {phase === "success" && intent ? (
          <div className="space-y-4 px-5 py-5">
            <div className="flex items-start gap-3 border border-emerald-200 bg-emerald-50 px-3.5 py-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              <div>
                <p className="text-sm font-semibold text-emerald-950">
                  Payment received
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-emerald-900/80">
                  {student.studentName}&apos;s fee balance has been updated
                  automatically.
                </p>
              </div>
            </div>

            <div className="border border-[#1a4d42]/12 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#0c1a17]">
              <div className="flex items-baseline justify-between gap-3 border-b border-[#1a4d42]/10 pb-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1a4d42]/45">
                  Amount
                </span>
                <span className="text-lg font-semibold tabular-nums text-[#0a1f1a] dark:text-white">
                  {kes(intent.amount)}
                </span>
              </div>
              <div className="mt-2.5 space-y-1.5 text-[11px]">
                <div className="flex justify-between gap-3">
                  <span className="text-[#1a4d42]/50">M-Pesa reference</span>
                  <span className="font-mono font-medium text-[#0a1f1a] dark:text-white">
                    {receiptRef}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[#1a4d42]/50">New balance</span>
                  <span className="font-medium tabular-nums text-[#0a1f1a] dark:text-white">
                    {kes(Math.max(0, balance - intent.amount))}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 justify-start gap-1.5 border-[#1a4d42]/15 text-xs"
                onClick={() => void copyReceiptLink()}
              >
                {copied ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied" : "Copy link"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 justify-start gap-1.5 border-[#1a4d42]/15 text-xs"
                onClick={shareWhatsApp}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                WhatsApp
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 justify-start gap-1.5 border-[#1a4d42]/15 text-xs"
                onClick={() => void emailReceipt()}
                disabled={emailing}
              >
                {emailing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Mail className="h-3.5 w-3.5" />
                )}
                Email receipt
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 justify-start gap-1.5 border-[#1a4d42]/15 text-xs"
                onClick={() =>
                  window.open(receiptLink, "_blank", "noopener,noreferrer")
                }
              >
                <Printer className="h-3.5 w-3.5" />
                View / print
              </Button>
            </div>

            <Button
              type="button"
              className="h-9 w-full bg-[#0a1f1a] text-xs text-white hover:bg-[#246a59]"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          </div>
        ) : phase === "waiting" && intent ? (
          <div className="space-y-4 px-5 py-8 text-center">
            <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#246a59]" />
            <div>
              <p className="text-sm font-semibold text-[#0a1f1a] dark:text-white">
                Request sent to {intent.phone}
              </p>
              <p className="mx-auto mt-1 max-w-xs text-[11px] leading-relaxed text-[#1a4d42]/55">
                Ask the parent to enter their M-Pesa PIN. The fee balance updates
                automatically once the payment is confirmed.
              </p>
            </div>
            <div className="border border-[#1a4d42]/10 bg-[#f8fbfa] px-3 py-2 text-[10px] text-[#1a4d42]/50 dark:bg-[#071411]">
              Waiting for M-Pesa confirmation…
            </div>
          </div>
        ) : phase === "failed" && error ? (
          <div className="space-y-4 px-5 py-6">
            <div className="border border-amber-200 bg-amber-50 px-3.5 py-3 text-[12px] leading-relaxed text-amber-950">
              {error}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 flex-1 text-xs"
                onClick={() => setPhase("form")}
              >
                Try again
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-9 flex-1 bg-[#0a1f1a] text-xs text-white"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 px-5 py-4">
            <div className="flex items-center justify-between gap-3 border border-[#1a4d42]/10 bg-[#f8fbfa] px-3 py-2.5 dark:border-white/10 dark:bg-[#071411]">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#0a1f1a] dark:text-white">
                  {student.studentName}
                </p>
                <p className="truncate text-[10px] text-[#1a4d42]/50">
                  {student.admissionNumber} · {student.gradeLevelName}
                  {student.streamName ? ` · ${student.streamName}` : ""}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-amber-800">
                {kes(balance)}
                <span className="block text-right text-[9px] font-normal uppercase tracking-[0.1em] text-[#1a4d42]/40">
                  due
                </span>
              </p>
            </div>

            {invoicesLoading || !availability ? (
              <div className="flex items-center gap-2 py-6 text-sm text-[#1a4d42]/55">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking the student bill and M-Pesa…
              </div>
            ) : !railOn ? (
              <div className="border border-amber-200 bg-amber-50 px-3.5 py-3 text-[11px] leading-relaxed text-amber-950">
                <p className="font-semibold">M-Pesa requests are not switched on yet.</p>
                <p className="mt-1">
                  Ask SQUL support to enable M-Pesa payments for your school. You
                  can still record cash or bank payments from the fee till.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-2 h-8 text-xs"
                  onClick={openMoney}
                >
                  Open fee till
                </Button>
              </div>
            ) : balance <= 0 && openInvoices.length === 0 ? (
              <div className="border border-[#1a4d42]/12 bg-[#f8fbfa] px-3.5 py-3 text-[11px] leading-relaxed text-[#1a4d42]/60">
                <p className="font-semibold text-[#0a1f1a] dark:text-white">
                  No outstanding fees.
                </p>
                <p className="mt-1">
                  This student&apos;s fees are settled, so there is nothing to
                  request right now.
                </p>
              </div>
            ) : openInvoices.length === 0 ? (
              <div className="border border-dashed border-amber-300 bg-amber-50 px-3.5 py-3 text-[11px] leading-relaxed text-amber-950">
                <p className="font-semibold">No open bill for this student.</p>
                <p className="mt-1">
                  Open the student&apos;s bill from the fee till first, then send an
                  M-Pesa request.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-2 h-8 text-xs"
                  onClick={openMoney}
                >
                  Go to fee till
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="mpesa-phone" className="text-xs">
                    Send request to phone
                  </Label>
                  <Input
                    id="mpesa-phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    inputMode="tel"
                    placeholder="07XX XXX XXX"
                    className="h-9 rounded-none border-[#1a4d42]/15 bg-white text-sm shadow-none"
                  />
                  <p className="text-[10px] leading-relaxed text-[#1a4d42]/45">
                    Prefilled from the student record. Change it to the parent
                    or guardian&apos;s M-Pesa number.
                  </p>
                </div>

                {openInvoices.length > 1 ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="mpesa-invoice" className="text-xs">
                      Bill
                    </Label>
                    <select
                      id="mpesa-invoice"
                      value={selected?.id ?? ""}
                      onChange={(event) => {
                        setSelectedId(event.target.value);
                        setAmountInput(null);
                      }}
                      className="h-9 w-full border border-[#1a4d42]/15 bg-white px-2 text-sm text-[#0a1f1a] outline-none focus:border-[#246a59]"
                    >
                      {openInvoices.map((invoice) => (
                        <option key={invoice.id} value={invoice.id}>
                          {invoiceLabel(invoice)}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                <div className="space-y-1.5">
                  <Label htmlFor="mpesa-amount" className="text-xs">
                    Amount to request
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="mpesa-amount"
                      value={amount}
                      onChange={(event) => setAmountInput(event.target.value)}
                      inputMode="numeric"
                      className="h-9 rounded-none border-[#1a4d42]/15 bg-white text-sm shadow-none"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 shrink-0 text-xs"
                      onClick={() =>
                        setAmountInput(String(Math.ceil(selectedAmount)))
                      }
                    >
                      Full {kes(selectedAmount)}
                    </Button>
                  </div>
                </div>

                <div className="border border-[#1a4d42]/10 bg-[#f8fbfa] px-3 py-2 text-[10px] leading-relaxed text-[#1a4d42]/55">
                  <p>
                    The parent gets an M-Pesa request on their phone. They enter
                    their M-Pesa PIN and the money goes straight to the school
                    bank account. This student&apos;s fee balance updates
                    automatically.
                  </p>
                  {paymentTarget ? (
                    <p className="mt-1 border-t border-[#1a4d42]/10 pt-1 font-medium text-[#1a4d42]/70">
                      {paymentTarget}
                    </p>
                  ) : null}
                </div>

                {error ? (
                  <p className="text-[11px] text-rose-700">{error}</p>
                ) : null}

                <Button
                  type="button"
                  className="h-10 w-full gap-2 bg-[#0a1f1a] text-xs text-white hover:bg-[#246a59]"
                  disabled={sending || !railOn}
                  onClick={() => void handleSend()}
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send M-Pesa request
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
