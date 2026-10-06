"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, MessageSquareText, RefreshCw } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  fetchPlatformSmsCreditSettings,
  fetchPlatformSmsCreditTiers,
  fetchPlatformSmsCreditUsage,
  fetchTenantSmsCreditAccount,
  grantTenantSmsCredits,
  updatePlatformSmsCreditSettings,
  updateTenantSmsCreditAccount,
  upsertPlatformSmsCreditTier,
  type PlatformSmsTierAllowance,
  type SmsCreditUsage,
  type TenantSmsCreditAccount,
} from "@/lib/superadmin/smsCreditsApi";

export function SmsCreditsPanel() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tiers, setTiers] = useState<PlatformSmsTierAllowance[]>([]);
  const [usage, setUsage] = useState<SmsCreditUsage | null>(null);

  const [enabled, setEnabled] = useState(true);
  const [unitPrice, setUnitPrice] = useState("0.80");
  const [defaultIncluded, setDefaultIncluded] = useState("100");
  const [minBuy, setMinBuy] = useState("10");
  const [maxBuy, setMaxBuy] = useState("10000");
  const [lowThreshold, setLowThreshold] = useState("5");
  const [presetText, setPresetText] = useState("");
  const [receivingType, setReceivingType] = useState<
    "" | "till" | "paybill" | "bank"
  >("");
  const [receivingNumber, setReceivingNumber] = useState("");
  const [receivingAccount, setReceivingAccount] = useState("");
  const [receivingBankName, setReceivingBankName] = useState("");
  const [tierEdits, setTierEdits] = useState<Record<number, string>>({});

  const [tenantId, setTenantId] = useState("");
  const [account, setAccount] = useState<TenantSmsCreditAccount | null>(null);
  const [accountBusy, setAccountBusy] = useState(false);
  const [grantCredits, setGrantCredits] = useState("");
  const [grantNote, setGrantNote] = useState("");
  const [override, setOverride] = useState("");

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const [settings, planTiers, usageRecord] = await Promise.all([
        fetchPlatformSmsCreditSettings(),
        fetchPlatformSmsCreditTiers(),
        fetchPlatformSmsCreditUsage(),
      ]);
      setEnabled(settings.enabled);
      setUnitPrice(String(settings.unitPriceKes));
      setDefaultIncluded(String(settings.defaultIncludedSms));
      setMinBuy(String(settings.minPurchaseCredits));
      setMaxBuy(String(settings.maxPurchaseCredits));
      setLowThreshold(String(settings.lowBalanceThreshold));
      setPresetText((settings.presetCredits ?? []).join(", "));
      setReceivingType(settings.receivingType ?? "");
      setReceivingNumber(settings.receivingNumber ?? "");
      setReceivingAccount(settings.receivingAccount ?? "");
      setReceivingBankName(settings.receivingBankName ?? "");
      setTiers(planTiers);
      setTierEdits(
        Object.fromEntries(
          planTiers.map((t) => [t.planId, String(t.includedSmsPerMonth)]),
        ),
      );
      setUsage(usageRecord);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const receiving =
        receivingType === ""
          ? { clearReceiving: true }
          : {
              receivingType,
              receivingNumber: receivingNumber.trim(),
              receivingAccount:
                receivingType === "till" ? null : receivingAccount.trim(),
              receivingBankName:
                receivingType === "bank" ? receivingBankName.trim() : null,
            };
      const presetCredits = presetText
        .split(/[,\s]+/)
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0);
      await updatePlatformSmsCreditSettings({
        enabled,
        unitPriceKes: Number(unitPrice),
        defaultIncludedSms: Number(defaultIncluded),
        minPurchaseCredits: Number(minBuy),
        maxPurchaseCredits: Number(maxBuy),
        lowBalanceThreshold: Number(lowThreshold),
        presetCredits,
        ...receiving,
      });
      toast({ title: "Saved", description: "SMS credit settings updated" });
      await load();
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

  const handleSaveTier = async (planId: number) => {
    try {
      setSaving(true);
      const value = Number(tierEdits[planId] ?? "0");
      const next = await upsertPlatformSmsCreditTier(planId, {
        includedSmsPerMonth: value,
        active: true,
      });
      setTiers(next);
      toast({ title: "Saved", description: "Plan allowance updated" });
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

  const applyAccount = (record: TenantSmsCreditAccount) => {
    setAccount(record);
    setOverride(
      record.includedOverride === null ? "" : String(record.includedOverride),
    );
  };

  const handleLoadTenant = async () => {
    if (!tenantId.trim()) return;
    try {
      setAccountBusy(true);
      setError(null);
      applyAccount(await fetchTenantSmsCreditAccount(tenantId.trim()));
    } catch (err) {
      toast({
        title: "Load failed",
        description: err instanceof Error ? err.message : "Could not load",
        variant: "destructive",
      });
    } finally {
      setAccountBusy(false);
    }
  };

  const handleGrant = async () => {
    if (!tenantId.trim() || !grantCredits.trim()) return;
    try {
      setAccountBusy(true);
      const record = await grantTenantSmsCredits(tenantId.trim(), {
        credits: Number(grantCredits),
        ...(grantNote.trim() ? { note: grantNote.trim() } : {}),
      });
      applyAccount(record);
      setGrantCredits("");
      setGrantNote("");
      toast({ title: "Granted", description: "Messages added to the tenant" });
      void load();
    } catch (err) {
      toast({
        title: "Grant failed",
        description: err instanceof Error ? err.message : "Could not grant",
        variant: "destructive",
      });
    } finally {
      setAccountBusy(false);
    }
  };

  const handleOverride = async () => {
    if (!tenantId.trim()) return;
    try {
      setAccountBusy(true);
      const record = await updateTenantSmsCreditAccount(
        tenantId.trim(),
        override.trim() === "" ? null : Number(override),
      );
      applyAccount(record);
      toast({ title: "Saved", description: "Monthly allowance updated" });
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Could not save",
        variant: "destructive",
      });
    } finally {
      setAccountBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" aria-hidden />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquareText className="size-4" aria-hidden />
            SMS credits
          </CardTitle>
          <CardDescription>
            Per-message price for tenants, the free monthly allowance paying
            plans get, and purchase limits. Tenants only ever see message
            counts, never the price.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex items-center justify-between">
            <div>
              <Label>SMS billing enabled</Label>
              <p className="text-xs text-slate-500">
                When off, SMS is unmetered and tenants cannot buy.
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Price / message (KES)</Label>
              <Input
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <Label>Free messages / month</Label>
              <Input
                value={defaultIncluded}
                onChange={(e) => setDefaultIncluded(e.target.value)}
                inputMode="numeric"
              />
            </div>
            <div className="space-y-2">
              <Label>Min purchase</Label>
              <Input
                value={minBuy}
                onChange={(e) => setMinBuy(e.target.value)}
                inputMode="numeric"
              />
            </div>
            <div className="space-y-2">
              <Label>Max purchase</Label>
              <Input
                value={maxBuy}
                onChange={(e) => setMaxBuy(e.target.value)}
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Low-balance warning at</Label>
              <Input
                value={lowThreshold}
                onChange={(e) => setLowThreshold(e.target.value)}
                inputMode="numeric"
              />
            </div>
            <div className="space-y-2">
              <Label>Package presets (messages)</Label>
              <Input
                value={presetText}
                onChange={(e) => setPresetText(e.target.value)}
                placeholder="50, 100, 250, 500"
              />
              <p className="text-[11px] text-slate-500">
                Comma-separated message counts offered as one-tap buttons in
                the tenant buy dialog. Leave empty for custom entry only.
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border/60 p-3">
            <div>
              <Label>Receiving destination</Label>
              <p className="text-xs text-slate-500">
                Where SMS top-up payments are collected. Default uses the
                platform Go Live shortcode.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={receivingType === "" ? "default" : receivingType}
                  onValueChange={(value) =>
                    setReceivingType(
                      value === "default"
                        ? ""
                        : (value as "till" | "paybill" | "bank"),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">
                      Platform Go Live (default)
                    </SelectItem>
                    <SelectItem value="till">Buy Goods till</SelectItem>
                    <SelectItem value="paybill">Paybill</SelectItem>
                    <SelectItem value="bank">Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {receivingType !== "" ? (
                <div className="space-y-2">
                  <Label>
                    {receivingType === "till"
                      ? "Till number"
                      : receivingType === "bank"
                        ? "Bank shortcode"
                        : "Paybill number"}
                  </Label>
                  <Input
                    value={receivingNumber}
                    onChange={(e) => setReceivingNumber(e.target.value)}
                    inputMode="numeric"
                    placeholder="5–7 digits"
                  />
                </div>
              ) : null}

              {receivingType === "paybill" || receivingType === "bank" ? (
                <div className="space-y-2">
                  <Label>Account number</Label>
                  <Input
                    value={receivingAccount}
                    onChange={(e) => setReceivingAccount(e.target.value)}
                    placeholder="Account reference"
                  />
                </div>
              ) : null}

              {receivingType === "bank" ? (
                <div className="space-y-2">
                  <Label>Bank name</Label>
                  <Input
                    value={receivingBankName}
                    onChange={(e) => setReceivingBankName(e.target.value)}
                    placeholder="e.g. NCBA"
                  />
                </div>
              ) : null}
            </div>
            {receivingType === "bank" ? (
              <p className="text-[11px] text-slate-500">
                A bank destination collects like a paybill (M-Pesa Paybill into
                the bank shortcode). Confirm the bank shortcode supports Lipa Na
                M-Pesa before going live.
              </p>
            ) : null}
          </div>

          <Button onClick={() => void handleSaveSettings()} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            ) : null}
            Save settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Free messages per plan</CardTitle>
          <CardDescription>
            Included monthly messages a paying tenant gets on each plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {tiers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No plans found.</p>
          ) : (
            tiers.map((tier) => (
              <div
                key={tier.planId}
                className="flex flex-wrap items-end gap-3 border-b border-border/60 pb-3 last:border-0"
              >
                <div className="min-w-[10rem] flex-1">
                  <p className="text-sm font-medium">{tier.planName}</p>
                  <p className="text-xs text-muted-foreground">
                    Plan #{tier.planId}
                  </p>
                </div>
                <div className="w-32 space-y-1">
                  <Label className="text-xs">Messages / month</Label>
                  <Input
                    value={tierEdits[tier.planId] ?? ""}
                    inputMode="numeric"
                    onChange={(e) =>
                      setTierEdits((prev) => ({
                        ...prev,
                        [tier.planId]: e.target.value,
                      }))
                    }
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => void handleSaveTier(tier.planId)}
                  disabled={saving}
                >
                  Save
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {usage ? (
        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Usage this cycle</CardTitle>
              <CardDescription>
                Since {new Date(usage.cycleStartedAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => void load()}>
              <RefreshCw className="mr-2 size-4" aria-hidden />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <Stat label="Total sent" value={usage.totalSentThisCycle} />
              <Stat label="Included" value={usage.includedSentThisCycle} />
              <Stat label="Purchased" value={usage.purchasedSentThisCycle} />
              <Stat label="Depleted tenants" value={usage.depletedCount} />
            </div>

            {usage.topTenants.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 text-xs text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Tenant</th>
                      <th className="px-3 py-2 text-left">Plan</th>
                      <th className="px-3 py-2 text-right">Sent</th>
                      <th className="px-3 py-2 text-right">Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usage.topTenants.map((row) => (
                      <tr key={row.tenantId} className="border-t border-border/60">
                        <td className="px-3 py-2">{row.name}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {row.planName || "—"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {row.sentThisCycle}
                        </td>
                        <td className="px-3 py-2 text-right">{row.available}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tenant drill-down</CardTitle>
          <CardDescription>
            Look up a school by tenant id to grant messages or override their
            monthly allowance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[16rem] flex-1 space-y-2">
              <Label>Tenant id</Label>
              <Input
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                placeholder="e.g. 8f3c…"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => void handleLoadTenant()}
              disabled={accountBusy || !tenantId.trim()}
            >
              {accountBusy ? (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              ) : null}
              Load
            </Button>
          </div>

          {account ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <Stat label="Available" value={account.available} />
                <Stat label="Free left" value={account.includedRemaining} />
                <Stat label="Free used" value={account.includedUsed} />
                <Stat label="Bought" value={account.purchasedBalance} />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={account.isPayingTenant ? "default" : "secondary"}>
                  {account.isPayingTenant ? "Paying" : "Not paying"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Allowance {account.includedAllowance} · Override{" "}
                  {account.includedOverride ?? "—"}
                </span>
              </div>

              <div className="flex flex-wrap items-end gap-2">
                <div className="w-28 space-y-1">
                  <Label className="text-xs">Grant messages</Label>
                  <Input
                    value={grantCredits}
                    inputMode="numeric"
                    onChange={(e) => setGrantCredits(e.target.value)}
                  />
                </div>
                <div className="min-w-[10rem] flex-1 space-y-1">
                  <Label className="text-xs">Note (optional)</Label>
                  <Input
                    value={grantNote}
                    onChange={(e) => setGrantNote(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => void handleGrant()}
                  disabled={accountBusy || !grantCredits.trim()}
                >
                  Grant
                </Button>
              </div>

              <div className="flex flex-wrap items-end gap-2">
                <div className="w-40 space-y-1">
                  <Label className="text-xs">Monthly override</Label>
                  <Input
                    value={override}
                    placeholder="blank = plan default"
                    inputMode="numeric"
                    onChange={(e) => setOverride(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => void handleOverride()}
                  disabled={accountBusy}
                >
                  Save override
                </Button>
              </div>

              {account.recentPurchases.length > 0 ? (
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Recent top-ups</p>
                  {account.recentPurchases.slice(0, 5).map((p) => (
                    <p key={p.id}>
                      {p.credits} messages · KES {p.amountKes ?? "—"} · {p.status}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value.toLocaleString()}</p>
    </div>
  );
}
