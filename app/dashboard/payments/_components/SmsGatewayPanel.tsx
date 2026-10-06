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
  fetchPlatformSmsSettings,
  testPlatformSms,
  updatePlatformSmsSettings,
  type PlatformSmsSettingsRecord,
} from "@/lib/superadmin/smsApi";
import { Loader2, MessageSquareText, Send } from "lucide-react";

/**
 * Super-admin SMS gateway control panel (TextSMS / Africa's Talking). The API
 * key is write-only — it is never returned, only `hasApiKey`.
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
  const [notifyFeePayment, setNotifyFeePayment] = useState(true);

  const [testTo, setTestTo] = useState("");
  const [testMessage, setTestMessage] = useState("");

  const apply = useCallback((record: PlatformSmsSettingsRecord) => {
    setSettings(record);
    setEnabled(record.enabled);
    setProvider(record.provider);
    setUsername(record.username ?? "");
    setPartnerId(record.partnerId ?? "");
    setSenderId(record.senderId ?? "");
    setNotifyFeePayment(record.notifyFeePayment);
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
        notifyFeePayment,
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

              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEXTSMS">TextSMS</SelectItem>
                    <SelectItem value="AFRICASTALKING">
                      Africa&apos;s Talking
                    </SelectItem>
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
              ) : (
                <div className="space-y-2">
                  <Label>Username (app name)</Label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. squl"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>
                  API key
                  {settings.hasApiKey ? " (saved · leave blank to keep)" : ""}
                </Label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    settings.hasApiKey
                      ? "••••••••"
                      : provider === "TEXTSMS"
                        ? "TextSMS API key"
                        : "Africa's Talking API key"
                  }
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
                  placeholder="e.g. SQUL"
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
