"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  MessageSquareText,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  fetchSmsCreditBalance,
  fetchSmsCreditLedger,
  fetchSmsCreditPurchaseStatus,
  purchaseSmsCredits,
  type SmsCreditBalance,
  type SmsCreditLedgerRow,
} from "@/lib/school/smsCreditsApi";

/** Fallback message-count packages; the platform may override these. */
const PRESETS = [50, 100, 250, 500, 1000, 2000];

function ledgerKindLabel(kind: string): string {
  switch (kind) {
    case "INCLUDED_SPEND":
      return "Included message";
    case "PURCHASED_SPEND":
      return "Bought message";
    case "PURCHASE":
      return "Top-up";
    case "GRANT":
      return "Grant";
    case "REFUND":
      return "Refund";
    case "CYCLE_RESET":
      return "Monthly reset";
    default:
      return kind.replaceAll("_", " ").toLowerCase();
  }
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SmsCreditsPanel() {
  const [balance, setBalance] = useState<SmsCreditBalance | null>(null);
  const [ledger, setLedger] = useState<SmsCreditLedgerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [bal, rows] = await Promise.all([
        fetchSmsCreditBalance(),
        fetchSmsCreditLedger(25),
      ]);
      setBalance(bal);
      setLedger(rows);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load SMS credits",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    return stopPolling;
  }, [refresh, stopPolling]);

  const minMessages = balance?.minPurchaseCredits ?? 10;
  const maxMessages = balance?.maxPurchaseCredits ?? 10000;

  useEffect(() => {
    if (selected === null && balance) {
      const list = balance.presetCredits?.length
        ? balance.presetCredits
        : PRESETS;
      const preset = list.find((p) => p >= minMessages && p <= maxMessages);
      setSelected(preset ?? minMessages);
    }
  }, [balance, selected, minMessages, maxMessages]);

  const presetList = balance?.presetCredits?.length
    ? balance.presetCredits
    : PRESETS;
  const validPresets = presetList.filter(
    (p) => p >= minMessages && p <= maxMessages,
  );

  const customNumber = custom.trim() ? Number(custom) : NaN;
  const effectiveMessages = Number.isFinite(customNumber)
    ? Math.round(customNumber)
    : (selected ?? 0);
  const messagesValid =
    Number.isFinite(effectiveMessages) &&
    effectiveMessages >= minMessages &&
    effectiveMessages <= maxMessages;

  const pollUntilSettled = useCallback(
    (purchaseId: string) => {
      stopPolling();
      pollTimer.current = setInterval(async () => {
        try {
          const status = await fetchSmsCreditPurchaseStatus(purchaseId);
          if (status.status === "PAID") {
            stopPolling();
            setSaving(false);
            setStatusMessage(null);
            toast.success("Messages added to your balance.");
            void refresh();
          } else if (status.status === "FAILED" || status.status === "EXPIRED") {
            stopPolling();
            setSaving(false);
            setStatusMessage(null);
            toast.error(
              status.status === "EXPIRED"
                ? "Payment request expired — try again."
                : "Payment was not completed. You can retry.",
            );
          }
        } catch {
          /* keep polling */
        }
      }, 2500);
    },
    [refresh, stopPolling],
  );

  const onBuy = async () => {
    if (!messagesValid) {
      toast.error(`Enter between ${minMessages} and ${maxMessages} messages.`);
      return;
    }
    if (!phone.trim()) {
      toast.error("Enter the M-Pesa phone number.");
      return;
    }
    setSaving(true);
    setStatusMessage(null);
    try {
      const purchase = await purchaseSmsCredits({
        credits: effectiveMessages,
        phone: phone.trim(),
      });
      if (purchase.status === "PENDING") {
        setStatusMessage("Check your phone to complete the M-Pesa payment.");
        toast.info("Check your phone to complete M-Pesa payment.");
        pollUntilSettled(purchase.id);
      } else if (purchase.status === "FAILED") {
        toast.error(purchase.message || "Payment request was declined.");
        setSaving(false);
      } else {
        toast.success("Messages added to your balance.");
        setSaving(false);
        void refresh();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Payment request failed.",
      );
      setSaving(false);
    }
  };

  const available = balance?.available ?? 0;
  const purchased = balance?.purchasedBalance ?? 0;
  const allowance = balance?.includedAllowance ?? 0;
  const used = balance ? Math.max(0, allowance - balance.includedRemaining) : 0;
  const includeProgress =
    allowance > 0 ? Math.min(100, Math.round((used / allowance) * 100)) : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-16 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" aria-hidden />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="size-4" aria-hidden />
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquareText className="size-4" aria-hidden />
              Messages
            </CardTitle>
            <CardDescription>
              One message is one SMS. Included messages reset each month; bought
              messages roll over.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-semibold tracking-tight">
                  {available.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  messages available
                </p>
              </div>
              {balance?.lowBalance ? (
                <Badge variant="destructive">Low balance</Badge>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                <p className="text-xs text-muted-foreground">Free this month</p>
                <p className="font-medium">
                  {balance?.includedRemaining ?? 0} of {allowance}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                <p className="text-xs text-muted-foreground">Bought</p>
                <p className="font-medium">{purchased.toLocaleString()}</p>
              </div>
            </div>

            {allowance > 0 ? <Progress value={includeProgress} /> : null}

            {balance && !balance.isPayingTenant ? (
              <p className="rounded-lg border border-dashed border-border/70 bg-muted/15 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                Your free monthly messages come with an active plan. Buy
                messages below to send now, or upgrade to get the monthly
                allowance.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Buy messages</CardTitle>
            <CardDescription>
              Pick how many messages you need and pay with M-Pesa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {balance && !balance.meteringEnabled ? (
              <p className="rounded-lg border border-dashed border-border/70 bg-muted/15 px-3 py-2 text-xs text-muted-foreground">
                SMS billing is currently turned off by the platform. Messages
                are free right now.
              </p>
            ) : null}

            {validPresets.length > 0 ? (
              <div className="space-y-2">
                <Label>Packages</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {validPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        setSelected(preset);
                        setCustom("");
                      }}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                        selected === preset && !custom.trim()
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      {preset.toLocaleString()} msg
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="sms-custom-messages">
                Custom messages ({minMessages}–{maxMessages})
              </Label>
              <Input
                id="sms-custom-messages"
                type="number"
                min={minMessages}
                max={maxMessages}
                step={1}
                placeholder={`e.g. ${minMessages}`}
                value={custom}
                disabled={saving}
                onChange={(e) => setCustom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sms-phone">M-Pesa phone</Label>
              <div className="relative">
                <Smartphone
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
                  aria-hidden
                />
                <Input
                  id="sms-phone"
                  type="tel"
                  className="pl-9"
                  placeholder="2547…"
                  value={phone}
                  disabled={saving}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/60 pt-3">
              <span className="text-sm text-muted-foreground">You will get</span>
              <span className="text-sm font-semibold">
                {messagesValid ? effectiveMessages.toLocaleString() : 0} messages
              </span>
            </div>

            {statusMessage ? (
              <p className="text-xs text-muted-foreground">{statusMessage}</p>
            ) : null}

            <Button
              type="button"
              className="w-full"
              disabled={saving || !messagesValid}
              onClick={onBuy}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  Waiting for M-Pesa…
                </>
              ) : (
                "Pay with M-Pesa"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent movements</CardTitle>
        </CardHeader>
        <CardContent>
          {ledger.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No message activity yet.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {ledger.map((row) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{ledgerKindLabel(row.kind)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(row.createdAt)}
                      {row.reason ? ` · ${row.reason}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "font-medium",
                        row.delta > 0 ? "text-emerald-600" : "text-foreground",
                      )}
                    >
                      {row.delta > 0 ? `+${row.delta}` : row.delta}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      balance {row.balanceAfter}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
