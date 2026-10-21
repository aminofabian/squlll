"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  MessageSquareText,
  Pencil,
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
const FALLBACK_UNIT_PRICE = 0.8;
const POLL_MS = 3000;
const MAX_WAIT_MS = 3 * 60 * 1000;
const STK_COUNTDOWN_S = 60;
const LOW_BALANCE_HINT = 100;
const POPULAR_PRESET = 500;
const BEST_VALUE_PRESET = 1000;

type Step = "choose" | "pending" | "success" | "failed";

function formatKes(amount: number): string {
  const rounded = Math.round(amount * 100) / 100;
  const formatted =
    Number.isInteger(rounded) || Math.abs(rounded - Math.round(rounded)) < 0.001
      ? Math.round(rounded).toLocaleString("en-KE")
      : rounded.toLocaleString("en-KE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  return `KES ${formatted}`;
}

/**
 * Pack badges for conversion. Pricing is flat today — “Save %” needs real
 * volume tiers on the API before we can show discount percentages honestly.
 */
function packBadge(
  credits: number,
): { label: string; tone: "popular" | "value" } | null {
  if (credits === POPULAR_PRESET) return { label: "Popular", tone: "popular" };
  if (credits >= BEST_VALUE_PRESET) return { label: "Best value", tone: "value" };
  return null;
}

function priceFor(credits: number, unitPrice: number): number {
  return Math.round(credits * unitPrice * 100) / 100;
}

/**
 * Normalize Kenyan M-Pesa numbers to +2547… / +2541… as the user types.
 * Accepts 07…, 01…, 7…, 1…, and +254….
 */
function formatPhone(value: string): string {
  let cleaned = value.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("00")) cleaned = `+${cleaned.slice(2)}`;
  if (cleaned.startsWith("0") && cleaned.length >= 2) {
    cleaned = `+254${cleaned.slice(1)}`;
  } else if (/^[17]\d*$/.test(cleaned)) {
    cleaned = `+254${cleaned}`;
  } else if (cleaned.startsWith("254") && !cleaned.startsWith("+")) {
    cleaned = `+${cleaned}`;
  } else if (cleaned && /^\d/.test(cleaned) && !cleaned.startsWith("+")) {
    cleaned = `+254${cleaned}`;
  }
  if (cleaned.startsWith("+2540")) cleaned = `+254${cleaned.slice(5)}`;
  if (cleaned.startsWith("+254") && cleaned.length > 13) {
    cleaned = cleaned.slice(0, 13);
  }
  return cleaned;
}

/** Safaricom / Airtel Kenya mobile: +254 7xx / 1xx + 8 digits. */
function isValidPhone(value: string): boolean {
  return /^\+254[17]\d{8}$/.test(value);
}

function pickDefaultPreset(presets: number[], available: number): number | null {
  if (!presets.length) return null;
  if (presets.includes(POPULAR_PRESET)) return POPULAR_PRESET;
  if (available < LOW_BALANCE_HINT) {
    return presets.find((p) => p >= 250) ?? presets[presets.length - 1] ?? null;
  }
  return presets[Math.min(2, presets.length - 1)] ?? null;
}

function useCountUp(from: number, to: number, active: boolean, durationMs = 900) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!active) {
      setValue(to);
      return;
    }
    setValue(from);
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(from + (to - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, durationMs, from, to]);

  return value;
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
  const packGroupId = useId();
  const [balance, setBalance] = useState<SmsCreditBalance | null>(
    initialBalance ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("choose");
  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneEditing, setPhoneEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);
  const [failureKind, setFailureKind] = useState<
    "cancelled" | "timeout" | "insufficient" | "declined" | null
  >(null);
  const [countdown, setCountdown] = useState(STK_COUNTDOWN_S);
  const [balanceBeforeSuccess, setBalanceBeforeSuccess] = useState(0);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAt = useRef<number>(0);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  const defaultsApplied = useRef(false);

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  const stopCountdown = useCallback(() => {
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    stopCountdown();
    setCountdown(STK_COUNTDOWN_S);
    countdownTimer.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          stopCountdown();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopCountdown]);

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
      stopCountdown();
      defaultsApplied.current = false;
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting the modal when it opens
    setStep("choose");
    setMessage(null);
    setPurchaseId(null);
    setSubmitting(false);
    setFailureKind(null);
    setCustom("");
    setSelected(null);
    setPhoneEditing(false);
    const remembered =
      typeof window !== "undefined"
        ? window.localStorage.getItem("sms_topup_phone")
        : null;
    setPhone(remembered ? formatPhone(remembered) : "+254");
    setPhoneEditing(!remembered);
    void refreshBalance();
    return () => {
      stopPolling();
      stopCountdown();
    };
  }, [open, refreshBalance, stopCountdown, stopPolling]);

  const min = balance?.minPurchaseCredits ?? 10;
  const max = balance?.maxPurchaseCredits ?? 10000;
  const unitPrice = balance?.unitPriceKes ?? FALLBACK_UNIT_PRICE;
  const presets = (balance?.presetCredits?.length
    ? balance.presetCredits
    : FALLBACK_PRESETS
  ).filter((preset) => preset >= min && preset <= max);
  const available = balance?.available ?? 0;
  const lowBalance =
    balance?.lowBalance || available < LOW_BALANCE_HINT;

  useEffect(() => {
    if (!open || defaultsApplied.current || !presets.length) return;
    if (selected !== null || custom.trim()) return;
    defaultsApplied.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- default package when balance loads
    setSelected(pickDefaultPreset(presets, available));
  }, [available, custom, open, presets, selected]);

  const customNumber = custom.trim() ? Number(custom) : NaN;
  const usingCustom = custom.trim().length > 0;
  const credits = usingCustom
    ? Math.round(customNumber)
    : selected ?? 0;
  const creditsValid =
    Number.isFinite(credits) && credits >= min && credits <= max;
  const phoneValid = isValidPhone(phone);
  const phoneTouched = phone.length > 4;
  const totalKes = creditsValid ? priceFor(credits, unitPrice) : 0;
  const formDisabled = submitting || step === "pending";

  const animatedBalance = useCountUp(
    balanceBeforeSuccess,
    balance?.available ?? available,
    step === "success",
  );

  const classifyFailure = (raw: string | null | undefined) => {
    const text = (raw ?? "").toLowerCase();
    if (text.includes("insufficient") || text.includes("not enough")) {
      return "insufficient" as const;
    }
    if (text.includes("cancel") || text.includes("1032")) {
      return "cancelled" as const;
    }
    if (text.includes("expir") || text.includes("timeout") || text.includes("timed out")) {
      return "timeout" as const;
    }
    return "declined" as const;
  };

  const finishSuccess = useCallback(
    async (statusMessage: string | null) => {
      stopPolling();
      stopCountdown();
      setBalanceBeforeSuccess(available);
      const next = await refreshBalance();
      setStep("success");
      setMessage(statusMessage);
      setSubmitting(false);
      onSuccess?.(next);
      toast.success("SMS credits added to your balance.");
    },
    [available, onSuccess, refreshBalance, stopCountdown, stopPolling],
  );

  const poll = useCallback(
    (id: string) => {
      stopPolling();
      startedAt.current = Date.now();
      pollTimer.current = setInterval(async () => {
        if (Date.now() - startedAt.current > MAX_WAIT_MS) {
          stopPolling();
          stopCountdown();
          setStep("failed");
          setFailureKind("timeout");
          setMessage(
            "The M-Pesa request timed out. If you completed the payment, credits will appear automatically — refresh in a moment.",
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
            stopCountdown();
            const msg = status.needsRetry
              ? "The payment was not completed. You can try again."
              : "The M-Pesa request was declined.";
            setStep("failed");
            setFailureKind(classifyFailure(msg));
            setMessage(msg);
            setSubmitting(false);
          } else if (status.status === "EXPIRED") {
            stopPolling();
            stopCountdown();
            setStep("failed");
            setFailureKind("timeout");
            setMessage("The M-Pesa request expired. Try again.");
            setSubmitting(false);
          }
        } catch {
          // Keep polling; transient network errors are expected.
        }
      }, POLL_MS);
    },
    [finishSuccess, stopCountdown, stopPolling],
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
      setFailureKind(null);
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
        setFailureKind(classifyFailure(purchase.message));
        setMessage(purchase.message || "The M-Pesa request was declined.");
        setSubmitting(false);
        return;
      }
      setStep("pending");
      setMessage(
        purchase.message ||
          "Check your phone and enter your M-Pesa PIN to complete the payment.",
      );
      startCountdown();
      poll(purchase.id);
    } catch (error) {
      setSubmitting(false);
      setStep("failed");
      const msg =
        error instanceof Error ? error.message : "Could not start the payment.";
      setFailureKind(classifyFailure(msg));
      setMessage(msg);
    }
  };

  const resendPrompt = async () => {
    stopPolling();
    stopCountdown();
    setSubmitting(true);
    setMessage(null);
    try {
      const purchase = await purchaseSmsCredits({ credits, phone });
      setPurchaseId(purchase.id);
      if (purchase.status === "PAID") {
        await finishSuccess("Payment confirmed");
        return;
      }
      if (purchase.status === "FAILED") {
        setStep("failed");
        setFailureKind(classifyFailure(purchase.message));
        setMessage(purchase.message || "The M-Pesa request was declined.");
        setSubmitting(false);
        return;
      }
      setStep("pending");
      setMessage("New prompt sent. Enter your M-Pesa PIN on your phone.");
      startCountdown();
      poll(purchase.id);
    } catch (error) {
      setSubmitting(false);
      setStep("failed");
      const msg =
        error instanceof Error ? error.message : "Could not resend the prompt.";
      setFailureKind(classifyFailure(msg));
      setMessage(msg);
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
    stopCountdown();
    onOpenChange(false);
  };

  const selectPreset = (preset: number) => {
    if (formDisabled) return;
    setSelected(preset);
    setCustom("");
  };

  const onPackKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!presets.length || usingCustom) return;
    const index = selected == null ? -1 : presets.indexOf(selected);
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const next = presets[(Math.max(index, 0) + 1) % presets.length];
      selectPreset(next);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const prev =
        presets[(index <= 0 ? presets.length : index) - 1] ?? presets[0];
      selectPreset(prev);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectPreset(presets[0]);
    } else if (event.key === "End") {
      event.preventDefault();
      selectPreset(presets[presets.length - 1]);
    }
  };

  const failureTitle =
    failureKind === "insufficient"
      ? "Insufficient M-Pesa funds"
      : failureKind === "cancelled"
        ? "Payment cancelled"
        : failureKind === "timeout"
          ? "Prompt timed out"
          : "Payment not completed";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent className="flex max-h-[92vh] max-w-md flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-border px-6 pb-4 pt-6">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageSquareText className="h-4 w-4" />
            </span>
            Top up SMS
          </DialogTitle>
          <DialogDescription>
            Buy messages instantly with M-Pesa. One message is one SMS ·{" "}
            {formatKes(unitPrice)} / SMS
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="rounded-xl border border-border bg-muted/25 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Current balance
                </p>
                <p className="mt-0.5 text-2xl font-semibold tabular-nums">
                  {loading && !balance
                    ? "—"
                    : step === "success"
                      ? animatedBalance.toLocaleString()
                      : available.toLocaleString()}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>
                  {(balance?.purchasedBalance ?? 0).toLocaleString()} purchased
                </p>
                {(balance?.includedRemaining ?? 0) > 0 ? (
                  <p>
                    {(balance?.includedRemaining ?? 0).toLocaleString()} monthly
                    left
                  </p>
                ) : null}
              </div>
            </div>
            {step === "choose" && lowBalance ? (
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400">
                <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                Low balance — top up before your next campaign.
              </p>
            ) : null}
          </div>

          {step === "choose" ? (
            <fieldset disabled={formDisabled} className="space-y-5 border-0 p-0">
              <div className="space-y-2">
                <Label id={`${packGroupId}-label`}>How many messages?</Label>
                <div
                  role="radiogroup"
                  aria-labelledby={`${packGroupId}-label`}
                  onKeyDown={onPackKeyDown}
                  className="grid grid-cols-3 gap-2.5 pt-1"
                >
                  {presets.map((preset) => {
                    const active = selected === preset && !usingCustom;
                    const badge = packBadge(preset);
                    const packPrice = priceFor(preset, unitPrice);
                    return (
                      <button
                        key={preset}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        tabIndex={active || (selected == null && !usingCustom && preset === presets[0]) ? 0 : -1}
                        onClick={() => selectPreset(preset)}
                        className={cn(
                          "relative rounded-xl border-2 px-2 pb-2.5 pt-3 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border bg-background hover:border-primary/40",
                        )}
                      >
                        {badge ? (
                          <span
                            className={cn(
                              "absolute -top-2 left-2 z-10 rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-white shadow-sm",
                              badge.tone === "popular"
                                ? "bg-primary text-primary-foreground"
                                : "bg-emerald-700",
                            )}
                          >
                            {badge.label}
                          </span>
                        ) : null}
                        {active ? (
                          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="h-2.5 w-2.5" strokeWidth={3} />
                          </span>
                        ) : null}
                        <span className="block text-lg font-semibold tabular-nums leading-none">
                          {preset.toLocaleString()}
                        </span>
                        <span className="mt-1 block text-[10px] font-medium uppercase tracking-wide text-foreground/65">
                          messages
                        </span>
                        <span className="mt-1.5 block text-[11px] font-medium tabular-nums text-foreground/80">
                          {formatKes(packPrice)}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="space-y-1.5 pt-0.5">
                  <Input
                    type="number"
                    min={min}
                    max={max}
                    value={custom}
                    onChange={(event) => {
                      setCustom(event.target.value);
                      setSelected(null);
                    }}
                    placeholder="Or enter a custom amount"
                    className="h-10"
                    aria-describedby={`${packGroupId}-custom-hint`}
                  />
                  <p
                    id={`${packGroupId}-custom-hint`}
                    className="text-[11px] text-muted-foreground"
                  >
                    Min {min.toLocaleString()} · max {max.toLocaleString()}
                    {usingCustom && creditsValid
                      ? ` · ${formatKes(totalKes)}`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="topup-phone">M-Pesa phone number</Label>
                  {!phoneEditing && phoneValid ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setPhoneEditing(true);
                        requestAnimationFrame(() => phoneInputRef.current?.focus());
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                      Use a different number
                    </button>
                  ) : null}
                </div>
                <div className="relative">
                  <Smartphone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    ref={phoneInputRef}
                    id="topup-phone"
                    value={phone}
                    readOnly={!phoneEditing && phoneValid}
                    onChange={(event) => {
                      setPhoneEditing(true);
                      setPhone(formatPhone(event.target.value));
                    }}
                    onFocus={() => setPhoneEditing(true)}
                    placeholder="+254712345678"
                    inputMode="tel"
                    autoComplete="tel"
                    aria-invalid={phoneTouched && !phoneValid}
                    className={cn(
                      "h-11 pl-9 pr-9",
                      phoneValid &&
                        "border-emerald-500 focus-visible:ring-emerald-500/30",
                      phoneTouched &&
                        !phoneValid &&
                        "border-rose-500 focus-visible:ring-rose-500/30",
                    )}
                  />
                  {phoneValid ? (
                    <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
                  ) : null}
                </div>
                {phoneTouched && !phoneValid ? (
                  <p className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400">
                    <TriangleAlert className="h-3 w-3 shrink-0" />
                    Use +254 7xx or 1xx (e.g. +254712345678)
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    We&apos;ll send an STK prompt to this number. Enter your PIN
                    on your phone to confirm.
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-border bg-background p-3.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">You are buying</span>
                  <span className="font-semibold">
                    {creditsValid
                      ? `${credits.toLocaleString()} messages`
                      : "—"}
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
                <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-sm">
                  <span className="font-medium text-foreground">Total</span>
                  <span className="text-base font-bold tabular-nums">
                    {creditsValid ? formatKes(totalKes) : "—"}
                  </span>
                </div>
                <div className="mt-3 flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  Secure M-Pesa payment. Credits are added automatically after
                  confirmation.
                </div>
              </div>
            </fieldset>
          ) : null}

          {step === "pending" ? (
            <div className="space-y-4 py-2 text-center">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
                <Phone className="relative h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-base font-semibold">
                  Check your phone and enter your M-Pesa PIN
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {message ??
                    "Enter your M-Pesa PIN on the prompt to complete the payment."}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Sending to <strong>{phone}</strong>
                  {creditsValid ? (
                    <>
                      {" "}
                      · <strong>{formatKes(totalKes)}</strong>
                    </>
                  ) : null}
                </p>
              </div>
              <div className="mx-auto max-w-[220px] space-y-2">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-linear"
                    style={{
                      width: `${Math.max(0, (countdown / STK_COUNTDOWN_S) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs tabular-nums text-muted-foreground">
                  {countdown > 0
                    ? `Waiting for confirmation · ${countdown}s`
                    : "Still waiting — you can resend the prompt"}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Listening for M-Pesa confirmation…
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={submitting && countdown > 45}
                onClick={() => void resendPrompt()}
              >
                Resend prompt
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
                  {credits.toLocaleString()} SMS credits are now available
                  {totalKes ? ` · ${formatKes(totalKes)}` : ""}.
                  {message ? ` ${message}.` : ""}
                </p>
                <p className="mt-3 text-3xl font-semibold tabular-nums">
                  {animatedBalance.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  messages available
                  {balanceBeforeSuccess !== animatedBalance
                    ? ` · was ${balanceBeforeSuccess.toLocaleString()}`
                    : ""}
                </p>
              </div>
            </div>
          ) : null}

          {step === "failed" ? (
            <div className="space-y-4 py-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
                <XCircle className="h-8 w-8" />
              </div>
              <div>
                <p className="text-base font-semibold">{failureTitle}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {message ?? "The M-Pesa request was not completed."}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="sticky bottom-0 z-10 mt-0 flex flex-wrap items-center justify-between gap-2 border-t border-border bg-background px-6 py-4 sm:justify-between">
          {step === "choose" ? (
            <>
              <Button
                variant="ghost"
                onClick={close}
                disabled={submitting}
                className="text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={() => void submit()}
                disabled={!creditsValid || !phoneValid || submitting}
                className="min-w-[180px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending prompt…
                  </>
                ) : (
                  <>
                    <Smartphone className="h-4 w-4" />
                    {creditsValid
                      ? `Pay ${formatKes(totalKes)} with M-Pesa`
                      : "Pay with M-Pesa"}
                  </>
                )}
              </Button>
            </>
          ) : step === "pending" ? (
            <Button variant="outline" className="w-full" onClick={close}>
              Close and wait
            </Button>
          ) : step === "success" ? (
            <>
              <Button
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => {
                  setStep("choose");
                  setMessage(null);
                  setSubmitting(false);
                  setFailureKind(null);
                  defaultsApplied.current = false;
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
              <Button
                variant="ghost"
                className="text-muted-foreground"
                onClick={close}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setStep("choose");
                  setMessage(null);
                  setSubmitting(false);
                  setFailureKind(null);
                }}
              >
                Try again
              </Button>
            </>
          )}
        </DialogFooter>

        {step === "choose" && purchaseId ? (
          <p className="px-6 pb-3 text-center text-[10px] text-muted-foreground">
            Request {purchaseId.slice(0, 8)} · powered by M-Pesa
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
