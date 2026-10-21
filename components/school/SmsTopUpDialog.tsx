"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  MessageSquareText,
  Phone,
  ShieldCheck,
  Smartphone,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  fetchSmsCreditBalance,
  fetchSmsCreditPurchaseStatus,
  purchaseSmsCredits,
  type SmsCreditBalance,
} from "@/lib/school/smsCreditsApi";

const FALLBACK_PRESETS = [50, 100, 250, 500, 1000, 2000];
const POLL_MS = 3000;
const MAX_WAIT_MS = 3 * 60 * 1000;

type Step = "choose" | "pending" | "success" | "failed";

function formatPhone(value: string): string {
  let cleaned = value.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("0")) cleaned = `+254${cleaned.slice(1)}`;
  else if (cleaned && /^\d/.test(cleaned) && !cleaned.startsWith("+")) {
    cleaned = `+254${cleaned}`;
  }
  if (cleaned.startsWith("+2540")) cleaned = `+254${cleaned.slice(5)}`;
  if (cleaned.startsWith("+254") && cleaned.length > 13) {
    cleaned = cleaned.slice(0, 13);
  }
  return cleaned;
}

function isValidPhone(value: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(value);
}

/**
 * One-screen M-Pesa top-up. The modal keeps the whole flow (package → phone →
 * STK prompt → confirmation) in one place, with no page navigation.
 */
export function SmsTopUpDialog({
  open,
  onOpenChange,
  onSuccess,
  initialBalance,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (balance: SmsCreditBalance | null) => void;
  initialBalance?: SmsCreditBalance | null;
}) {
  const [balance, setBalance] = useState<SmsCreditBalance | null>(
    initialBalance ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("choose");
  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAt = useRef<number>(0);

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    try {
      setLoading(true);
      const next = await fetchSmsCreditBalance();
      setBalance(next);
      return next;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      stopPolling();
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting the modal when it opens
    setStep("choose");
    setMessage(null);
    setPurchaseId(null);
    setSubmitting(false);
    const remembered =
      typeof window !== "undefined"
        ? window.localStorage.getItem("sms_topup_phone")
        : null;
    setPhone(remembered || "+254");
    void refreshBalance();
    return stopPolling;
  }, [open, refreshBalance, stopPolling]);

  const min = balance?.minPurchaseCredits ?? 10;
  const max = balance?.maxPurchaseCredits ?? 10000;
  const presets = (balance?.presetCredits?.length
    ? balance.presetCredits
    : FALLBACK_PRESETS
  ).filter((preset) => preset >= min && preset <= max);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- default to the first available package
    if (selected === null && presets.length) setSelected(presets[0]);
  }, [presets, selected]);

  const customNumber = custom.trim() ? Number(custom) : NaN;
  const credits = Number.isFinite(customNumber)
    ? Math.round(customNumber)
    : selected ?? 0;
  const creditsValid =
    Number.isFinite(credits) && credits >= min && credits <= max;
  const phoneValid = isValidPhone(phone);
  const available = balance?.available ?? 0;

  const finishSuccess = useCallback(
    async (statusMessage: string | null) => {
      stopPolling();
      const next = await refreshBalance();
      setStep("success");
      setMessage(statusMessage);
      setSubmitting(false);
      onSuccess?.(next);
      toast.success("SMS credits added to your balance.");
    },
    [onSuccess, refreshBalance, stopPolling],
  );

  const poll = useCallback(
    (id: string) => {
      stopPolling();
      startedAt.current = Date.now();
      pollTimer.current = setInterval(async () => {
        if (Date.now() - startedAt.current > MAX_WAIT_MS) {
          stopPolling();
          setStep("failed");
          setMessage(
            "The M-Pesa request timed out. If you completed the payment, it will be added automatically — refresh in a moment.",
          );
          setSubmitting(false);
          return;
        }
        try {
          const status = await fetchSmsCreditPurchaseStatus(id);
          if (status.status === "PAID") {
            await finishSuccess(
              status.mpesaReceipt
                ? `M-Pesa receipt ${status.mpesaReceipt}`
                : "Payment confirmed",
            );
          } else if (status.status === "FAILED") {
            stopPolling();
            setStep("failed");
            setMessage(
              status.needsRetry
                ? "The payment was not completed. You can try again."
                : "The M-Pesa request was declined.",
            );
            setSubmitting(false);
          } else if (status.status === "EXPIRED") {
            stopPolling();
            setStep("failed");
            setMessage("The M-Pesa request expired. Try again.");
            setSubmitting(false);
          }
        } catch {
          // Keep polling; transient network errors are expected.
        }
      }, POLL_MS);
    },
    [finishSuccess, stopPolling],
  );

  const submit = async () => {
    if (!creditsValid) {
      toast.error(`Choose between ${min} and ${max} messages.`);
      return;
    }
    if (!phoneValid) {
      toast.error("Enter a valid M-Pesa phone number.");
      return;
    }
    try {
      setSubmitting(true);
      setMessage(null);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("sms_topup_phone", phone);
      }
      const purchase = await purchaseSmsCredits({
        credits,
        phone,
      });
      setPurchaseId(purchase.id);
      if (purchase.status === "PAID") {
        await finishSuccess("Payment confirmed");
        return;
      }
      if (purchase.status === "FAILED") {
        setStep("failed");
        setMessage(purchase.message || "The M-Pesa request was declined.");
        setSubmitting(false);
        return;
      }
      setStep("pending");
      setMessage(
        purchase.message ||
          "Check your phone and enter your M-Pesa PIN to complete the payment.",
      );
      poll(purchase.id);
    } catch (error) {
      setSubmitting(false);
      setStep("failed");
      setMessage(
        error instanceof Error ? error.message : "Could not start the payment.",
      );
    }
  };

  const close = () => {
    if (step === "pending" && submitting) {
      const leave = window.confirm(
        "M-Pesa is still waiting for your PIN. Close anyway? The payment can still complete.",
      );
      if (!leave) return;
    }
    stopPolling();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto p-0">
        <DialogHeader className="border-b border-border px-6 pb-4 pt-6">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageSquareText className="h-4 w-4" />
            </span>
            Top up SMS
          </DialogTitle>
          <DialogDescription>
            Buy messages instantly with M-Pesa. One message is one SMS.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/25 px-4 py-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Current balance
              </p>
              <p className="mt-0.5 text-2xl font-semibold tabular-nums">
                {loading && !balance ? "—" : available.toLocaleString()}
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>{balance?.purchasedBalance ?? 0} bought</p>
              <p>{balance?.includedRemaining ?? 0} monthly</p>
            </div>
          </div>

          {step === "choose" ? (
            <>
              <div className="space-y-2">
                <Label>How many messages?</Label>
                <div className="grid grid-cols-3 gap-2">
                  {presets.map((preset) => {
                    const active = selected === preset && !custom.trim();
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setSelected(preset);
                          setCustom("");
                        }}
                        className={cn(
                          "relative rounded-xl border px-2 py-3 text-center transition-all",
                          active
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border bg-background hover:border-primary/40",
                        )}
                      >
                        <span className="block text-lg font-semibold tabular-nums">
                          {preset.toLocaleString()}
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          messages
                        </span>
                        {preset === 500 ? (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-white">
                            Popular
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    min={min}
                    max={max}
                    value={custom}
                    onChange={(event) => {
                      setCustom(event.target.value);
                      setSelected(null);
                    }}
                    placeholder={`Or enter a custom amount (${min}–${max})`}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topup-phone">M-Pesa phone number</Label>
                <div className="relative">
                  <Smartphone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="topup-phone"
                    value={phone}
                    onChange={(event) => setPhone(formatPhone(event.target.value))}
                    placeholder="+254712345678"
                    inputMode="tel"
                    className="h-11 pl-9"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  We&apos;ll send an STK prompt to this number. Enter your PIN on
                  your phone to confirm.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background p-3.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">You are buying</span>
                  <span className="font-semibold">
                    {creditsValid ? `${credits.toLocaleString()} messages` : "—"}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">New balance</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {creditsValid
                      ? `${(available + credits).toLocaleString()} messages`
                      : "—"}
                  </span>
                </div>
                <div className="mt-3 flex items-start gap-1.5 border-t border-border pt-2 text-[11px] text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  Secure M-Pesa payment. Credits are added automatically after
                  confirmation.
                </div>
              </div>
            </>
          ) : null}

          {step === "pending" ? (
            <div className="space-y-4 py-4 text-center">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
                <Phone className="relative h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-base font-semibold">Check your phone</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {message ??
                    "Enter your M-Pesa PIN on the prompt to complete the payment."}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Sending to <strong>{phone}</strong>
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Waiting for confirmation…
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  stopPolling();
                  setStep("choose");
                  setSubmitting(false);
                }}
              >
                I didn&apos;t get a prompt
              </Button>
            </div>
          ) : null}

          {step === "success" ? (
            <div className="space-y-4 py-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <p className="text-base font-semibold">Messages added</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {credits.toLocaleString()} SMS credits are now available.
                  {message ? ` ${message}.` : ""}
                </p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {balance?.available?.toLocaleString() ?? available + credits}
                </p>
                <p className="text-xs text-muted-foreground">messages available</p>
              </div>
            </div>
          ) : null}

          {step === "failed" ? (
            <div className="space-y-4 py-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
                <XCircle className="h-8 w-8" />
              </div>
              <div>
                <p className="text-base font-semibold">Payment not completed</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {message ?? "The M-Pesa request was not completed."}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-6 py-4">
          {step === "choose" ? (
            <>
              <Button variant="ghost" onClick={close}>
                Cancel
              </Button>
              <Button
                onClick={() => void submit()}
                disabled={!creditsValid || !phoneValid || submitting}
                className="min-w-[160px]"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Smartphone className="h-4 w-4" />
                )}
                Pay with M-Pesa
              </Button>
            </>
          ) : step === "pending" ? (
            <Button variant="outline" className="w-full" onClick={close}>
              Close and wait
            </Button>
          ) : step === "success" ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setStep("choose");
                  setMessage(null);
                  setSubmitting(false);
                }}
              >
                Top up again
              </Button>
              <Button onClick={close}>
                Done <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={close}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setStep("choose");
                  setMessage(null);
                  setSubmitting(false);
                }}
              >
                Try again
              </Button>
            </>
          )}
        </DialogFooter>

        {step === "choose" && purchaseId ? (
          <p className="px-6 pb-4 text-center text-[10px] text-muted-foreground">
            Request {purchaseId.slice(0, 8)} · powered by M-Pesa
          </p>
        ) : null}
        {step === "choose" && !phoneValid && phone.length > 4 ? (
          <p className="flex items-center justify-center gap-1 px-6 pb-4 text-[11px] text-amber-600">
            <TriangleAlert className="h-3 w-3" />
            Use the format +254712345678
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
