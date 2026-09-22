"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AdminPageHeader } from "@/components/dashboard/superadmin/AdminPageChrome";
import { DashboardErrorBanner } from "@/components/dashboard/superadmin/DashboardStatCards";
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
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { usePlatformPayments } from "@/lib/superadmin/usePlatformPayments";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";

export default function PlatformPaymentsPage() {
  const { toast } = useToast();
  const {
    daraja,
    custody,
    loading,
    saving,
    testing,
    error,
    testResult,
    refresh,
    saveDaraja,
    runTest,
    setCustodyProvider,
  } = usePlatformPayments();

  const [enabled, setEnabled] = useState(false);
  const [environment, setEnvironment] = useState("sandbox");
  const [shortcodeType, setShortcodeType] = useState("paybill");
  const [shortcode, setShortcode] = useState("");
  const [consumerKey, setConsumerKey] = useState("");
  const [consumerSecret, setConsumerSecret] = useState("");
  const [passkey, setPasskey] = useState("");

  useEffect(() => {
    if (!daraja) return;
    setEnabled(daraja.enabled);
    setEnvironment(daraja.environment);
    setShortcodeType(daraja.shortcodeType);
    setShortcode(daraja.shortcode ?? "");
  }, [daraja]);

  const handleSaveDaraja = async () => {
    try {
      await saveDaraja({
        enabled,
        environment,
        shortcodeType,
        shortcode: shortcode || undefined,
        ...(consumerKey.trim() ? { consumerKey: consumerKey.trim() } : {}),
        ...(consumerSecret.trim()
          ? { consumerSecret: consumerSecret.trim() }
          : {}),
        ...(passkey.trim() ? { passkey: passkey.trim() } : {}),
      });
      setConsumerKey("");
      setConsumerSecret("");
      setPasskey("");
      toast({
        title: "Saved",
        description: "Platform Daraja settings updated",
      });
    } catch (e) {
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : "Could not save",
        variant: "destructive",
      });
    }
  };

  const handleTest = async () => {
    const result = await runTest();
    toast({
      title: result.ok ? "Connection OK" : "Connection issue",
      description: result.message,
      variant: result.ok ? "default" : "destructive",
    });
  };

  const handleCustody = async (provider: string) => {
    try {
      await setCustodyProvider(provider);
      toast({
        title: "Custody updated",
        description:
          provider === "DARAJA"
            ? "Schools can now enter till/paybill only"
            : "Till/paybill Express rail is OFF",
      });
    } catch (e) {
      toast({
        title: "Update failed",
        description: e instanceof Error ? e.message : "Could not update",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <AdminPageHeader
          icon={CreditCard}
          title="M-Pesa payments"
          description="One Lipa Na M-Pesa Express Go Live for all schools — they only enter till or HO paybill"
          loading={loading}
          onRefresh={refresh}
        />

        {error ? (
          <DashboardErrorBanner message={error} onRetry={refresh} />
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
            <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <h2 className="flex items-center text-sm font-semibold text-slate-800 dark:text-slate-200">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Platform Daraja (Go Live)
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Consumer key/secret and passkey stay on SQUL. Schools never see
                them. Password = Base64(shortcode + passkey + timestamp).
              </p>
            </div>
            <div className="space-y-4 p-5">
              {loading || !daraja ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <Label>Enabled</Label>
                    <Switch checked={enabled} onCheckedChange={setEnabled} />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Environment</Label>
                      <Select value={environment} onValueChange={setEnvironment}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sandbox">Sandbox</SelectItem>
                          <SelectItem value="production">Production</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Shortcode type</Label>
                      <Select
                        value={shortcodeType}
                        onValueChange={setShortcodeType}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paybill">Paybill</SelectItem>
                          <SelectItem value="till">Till</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Go Live shortcode (BusinessShortCode)</Label>
                    <Input
                      value={shortcode}
                      onChange={(e) => setShortcode(e.target.value)}
                      placeholder="5–7 digits"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Consumer key
                      {daraja.hasConsumerKey ? " (saved · leave blank to keep)" : ""}
                    </Label>
                    <Input
                      type="password"
                      value={consumerKey}
                      onChange={(e) => setConsumerKey(e.target.value)}
                      placeholder={daraja.hasConsumerKey ? "••••••••" : ""}
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Consumer secret
                      {daraja.hasConsumerSecret
                        ? " (saved · leave blank to keep)"
                        : ""}
                    </Label>
                    <Input
                      type="password"
                      value={consumerSecret}
                      onChange={(e) => setConsumerSecret(e.target.value)}
                      placeholder={daraja.hasConsumerSecret ? "••••••••" : ""}
                      autoComplete="off"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Lipa Na M-Pesa passkey
                      {daraja.hasPasskey ? " (saved · leave blank to keep)" : ""}
                    </Label>
                    <Input
                      type="password"
                      value={passkey}
                      onChange={(e) => setPasskey(e.target.value)}
                      placeholder={daraja.hasPasskey ? "••••••••" : "From Go Live email"}
                      autoComplete="off"
                    />
                    <p className="text-[11px] text-slate-500">
                      Not the sandbox bfb279f9… key on production. OAuth can pass
                      while STK password is wrong — use Test connection.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => void handleSaveDaraja()}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        "Save Daraja"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => void handleTest()}
                      disabled={testing}
                    >
                      {testing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Testing…
                        </>
                      ) : (
                        "Test connection"
                      )}
                    </Button>
                  </div>

                  {testResult ? (
                    <p
                      className={`text-xs ${
                        testResult.ok ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {testResult.message}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
            <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Custody rail (till / paybill only)
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                When ON, schools enter Buy Goods till or HO paybill — STK uses
                platform BusinessShortCode and their till as PartyB. No B2B.
                Bank shared paybills (NCBA 880100) are refused.
              </p>
            </div>
            <div className="space-y-4 p-5">
              {loading || !custody ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select
                      value={custody.custodyProvider}
                      onValueChange={(v) => void handleCustody(v)}
                      disabled={saving}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OFF">OFF</SelectItem>
                        <SelectItem value="DARAJA">DARAJA (Express)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950">
                    Hard constraint: each school till must sit under SQUL’s M-Pesa
                    Head Office (Org portal onboarding). Foreign shortcodes and
                    bank paybills are out of scope for this rail.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
