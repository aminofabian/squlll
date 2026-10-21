"use client";

import { useCallback, useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import {
  fetchPingAfricaCreditBalance,
  fetchPlatformSmsSettings,
  testPlatformSms,
  updatePlatformSmsSettings,
  type PlatformSmsSettingsRecord,
} from "@/lib/superadmin/smsApi";
import { Loader2, MessageSquareText, RefreshCw, Send } from "lucide-react";

const PING_DEFAULT_BASE_URL = "https://bulk.ping.africa/api";

/**
 * Super-admin SMS gateway control panel (TextSMS / Africa's Talking /
 * Ping Africa). The API key is write-only — it is never returned, only
 * `hasApiKey`.
 */
export function SmsGatewayPanel() {
  const { toast } = useToast();

  const [settings, setSettings] = useState<PlatformSmsSettingsRecord | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState("TEXTSMS");
  const [username, setUsername] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [senderId, setSenderId] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [notifyFeePayment, setNotifyFeePayment] = useState(true);
  const [notifyTransportEmergency, setNotifyTransportEmergency] = useState(true);
  const [notifyTransportNoShow, setNotifyTransportNoShow] = useState(true);

  const [testTo, setTestTo] = useState("");
  const [testMessage, setTestMessage] = useState("");

  const [pingBalance, setPingBalance] = useState<number | null>(null);
  const [pingBalanceMessage, setPingBalanceMessage] = useState<string | null>(
    null,
  );
  const [pingBalanceOk, setPingBalanceOk] = useState<boolean | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  const apply = useCallback((record: PlatformSmsSettingsRecord) => {
    setSettings(record);
    setEnabled(record.enabled);
    setProvider(record.provider);
    setUsername(record.username ?? "");
    setPartnerId(record.partnerId ?? "");
    setSenderId(record.senderId ?? "");
    setBaseUrl(record.baseUrl ?? "");
    setNotifyFeePayment(record.notifyFeePayment);
    setNotifyTransportEmergency(record.notifyTransportEmergency);
    setNotifyTransportNoShow(record.notifyTransportNoShow);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const record = await fetchPlatformSmsSettings();
        if (active) apply(record);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Could not load SMS settings",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [apply]);

  const handleSave = async (override?: { clearApiKey?: boolean }) => {
    try {
      setSaving(true);
      setError(null);
      const next = await updatePlatformSmsSettings({
        enabled,
        provider,
        username,
        partnerId,
        senderId,
        baseUrl,
        notifyFeePayment,
        notifyTransportEmergency,
        notifyTransportNoShow,
        ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
        ...(override?.clearApiKey ? { clearApiKey: true } : {}),
      });
      apply(next);
      setApiKey("");
      toast({ title: "Saved", description: "SMS gateway settings updated" });
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Could not save",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testTo.trim()) {
      toast({
        title: "Number required",
        description: "Enter a phone number to send the test to.",
        variant: "destructive",
      });
      return;
    }
    try {
      setTesting(true);
      setTestResult(null);
      const result = await testPlatformSms(
        testTo.trim(),
        testMessage.trim() || undefined,
      );
      setTestResult(result.message);
      toast({
        title: result.reachable ? "Test sent" : "Test issue",
        description: result.message,
        variant: result.reachable ? "default" : "destructive",
      });
    } catch (err) {
      toast({
        title: "Test failed",
        description: err instanceof Error ? err.message : "Could not send",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleRefreshBalance = useCallback(async () => {
    try {
      setLoadingBalance(true);
      const result = await fetchPingAfricaCreditBalance();
      setPingBalanceOk(result.ok);
      setPingBalance(result.balance);
      setPingBalanceMessage(result.message);
      if (!result.ok) {
        toast({
          title: "Balance check failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      setPingBalanceOk(false);
      setPingBalance(null);
      setPingBalanceMessage(
        err instanceof Error ? err.message : "Could not fetch balance",
      );
      toast({
        title: "Balance check failed",
        description: err instanceof Error ? err.message : "Could not fetch",
        variant: "destructive",
      });
    } finally {
      setLoadingBalance(false);
    }
  }, [toast]);

  useEffect(() => {
    if (
      !loading &&
      settings?.configured &&
      settings.provider === "PING_AFRICA"
    ) {
      void handleRefreshBalance();
    }
  }, [
    loading,
    settings?.configured,
    settings?.provider,
    handleRefreshBalance,
  ]);

  const apiKeyPlaceholder = settings?.hasApiKey
    ? "••••••••"
    : provider === "TEXTSMS"
      ? "TextSMS API key"
      : provider === "PING_AFRICA"
        ? "Ping Africa API token"
        : "Africa's Talking API key";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
      <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <h2 className="flex items-center text-sm font-semibold text-slate-800 dark:text-slate-200">
          <MessageSquareText className="mr-2 h-4 w-4" />
          SMS gateway (parents)
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Sends the “payment received” confirmation to guardians when a fee
          payment settles. Provider credentials stay on SQUL and are encrypted
          at rest.
        </p>
      </div>

      <div className="space-y-5 p-5">
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        ) : null}

        {settings && !settings.encryptionConfigured ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-950">
            Encryption key missing on the API — the API key cannot be stored
            until <code>APP_PAYMENTS_ENCRYPTION_KEY</code> is set and the API is
            redeployed.
          </p>
        ) : null}

        {loading || !settings ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enabled</Label>
                <Switch checked={enabled} onCheckedChange={setEnabled} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Fee payment confirmation</Label>
                  <p className="text-[11px] text-slate-500">
                    Text guardians when a payment settles.
                  </p>
                </div>
                <Switch
                  checked={notifyFeePayment}
                  onCheckedChange={setNotifyFeePayment}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Bus emergency alerts</Label>
                  <p className="text-[11px] text-slate-500">
                    Text affected guardians when a bus emergency is raised.
                  </p>
                </div>
                <Switch
                  checked={notifyTransportEmergency}
                  onCheckedChange={setNotifyTransportEmergency}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Child not on the bus</Label>
                  <p className="text-[11px] text-slate-500">
                    Text guardians when their child is marked not present at a stop.
                  </p>
                </div>
                <Switch
                  checked={notifyTransportNoShow}
                  onCheckedChange={setNotifyTransportNoShow}
                />
              </div>

              <div className="space-y-2">
                <Label>Provider</Label>
                <Select
                  value={provider}
                  onValueChange={(next) => {
                    setProvider(next);
                    if (next === "PING_AFRICA" && !baseUrl.trim()) {
                      setBaseUrl(PING_DEFAULT_BASE_URL);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEXTSMS">TextSMS</SelectItem>
                    <SelectItem value="AFRICASTALKING">
                      Africa&apos;s Talking
                    </SelectItem>
                    <SelectItem value="PING_AFRICA">Ping Africa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {provider === "TEXTSMS" ? (
                <div className="space-y-2">
                  <Label>Partner ID</Label>
                  <Input
                    value={partnerId}
                    onChange={(e) => setPartnerId(e.target.value)}
                    placeholder="e.g. 12345"
                  />
                </div>
              ) : null}

              {provider === "AFRICASTALKING" ? (
                <div className="space-y-2">
                  <Label>Username (app name)</Label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. squl"
                  />
                </div>
              ) : null}

              {provider === "PING_AFRICA" ? (
                <div className="space-y-2">
                  <Label>Base URL</Label>
                  <Input
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder={PING_DEFAULT_BASE_URL}
                  />
                  <p className="text-[11px] text-slate-500">
                    API root from Ping Africa (no trailing slash). Default:{" "}
                    {PING_DEFAULT_BASE_URL}
                  </p>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label>
                  {provider === "PING_AFRICA" ? "API token" : "API key"}
                  {settings.hasApiKey ? " (saved · leave blank to keep)" : ""}
                </Label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={apiKeyPlaceholder}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label>
                  {provider === "TEXTSMS" ? "Shortcode / sender ID" : "Sender ID"}{" "}
                  (optional)
                </Label>
                <Input
                  value={senderId}
                  onChange={(e) => setSenderId(e.target.value)}
                  placeholder={
                    provider === "PING_AFRICA" ? "e.g. PING-AFRICA" : "e.g. SQUL"
                  }
                />
                <p className="text-[11px] text-slate-500">
                  Alphanumeric sender IDs must be pre-approved by the provider.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => void handleSave()} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save gateway"
                  )}
                </Button>
                {settings.hasApiKey ? (
                  <Button
                    variant="outline"
                    onClick={() => void handleSave({ clearApiKey: true })}
                    disabled={saving}
                  >
                    Clear API key
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <div>
                <Label>Send a test SMS</Label>
                <p className="text-[11px] text-slate-500">
                  Uses the saved settings — save first if you just changed them.
                </p>
              </div>
              <div className="space-y-2">
                <Input
                  value={testTo}
                  onChange={(e) => setTestTo(e.target.value)}
                  placeholder="07XX XXX XXX"
                  inputMode="tel"
                />
                <Input
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Optional custom message"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => void handleTest()}
                disabled={testing}
              >
                {testing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send test
                  </>
                )}
              </Button>
              {testResult ? (
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {testResult}
                </p>
              ) : null}
              <p className="text-[11px] text-slate-500">
                Status:{" "}
                {settings.configured ? (
                  <span className="font-medium text-emerald-600">
                    configured
                  </span>
                ) : (
                  <span className="font-medium text-amber-600">
                    not configured
                  </span>
                )}
              </p>

              {provider === "PING_AFRICA" ? (
                <div className="space-y-2 border-t border-slate-200/70 pt-4 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <Label>Ping Africa credits</Label>
                      <p className="text-[11px] text-slate-500">
                        Live org balance from Ping (needs View Credits on the
                        token).
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void handleRefreshBalance()}
                      disabled={loadingBalance || !settings.configured}
                    >
                      {loadingBalance ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                  {pingBalanceOk === true && pingBalance != null ? (
                    <p className="text-lg font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                      {pingBalance.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      <span className="text-xs font-normal text-slate-500">
                        credits
                      </span>
                    </p>
                  ) : pingBalanceMessage ? (
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      {pingBalanceMessage}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      {settings.configured
                        ? "Save credentials, then refresh."
                        : "Configure base URL + API token first."}
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
