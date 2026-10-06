"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, PlugZap, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardErrorBanner } from "@/components/dashboard/superadmin/DashboardStatCards";
import {
  fetchPlatformDomainSettings,
  testPlatformDomainProvider,
  testPlatformRegistrar,
  updatePlatformDomainSettings,
  type DomainProviderKind,
  type PlatformDomainSettingsRecord,
  type PlatformZone,
  type RegistrarProviderKind,
  type UpdatePlatformDomainSettingsInput,
} from "@/lib/superadmin/domainsApi";

function zonesToText(zones: PlatformZone[]): string {
  return zones
    .map((z) =>
      [
        z.zone,
        z.country,
        z.locale,
        z.currency,
        z.timeZone,
        z.isPrimary ? "true" : "false",
        z.isActive ? "true" : "false",
      ].join(" | "),
    )
    .join("\n");
}

function textToZones(text: string): PlatformZone[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [zone, country, locale, currency, timeZone, isPrimary, isActive] =
        line.split("|").map((s) => s.trim());
      return {
        zone,
        country,
        locale,
        currency,
        timeZone,
        isPrimary: isPrimary === "true",
        isActive: isActive !== "false",
      };
    });
}

function whoisToText(whois: Record<string, string>): string {
  return Object.entries(whois)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
}

function textToWhois(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return out;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
      <div className="border-b border-slate-100 px-5 py-3 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {title}
        </h2>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
      {label}
    </label>
  );
}

export function DomainControlPlanePanel() {
  const [settings, setSettings] = useState<PlatformDomainSettingsRecord | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<DomainProviderKind | null>(null);
  const [testingRegistrar, setTestingRegistrar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Draft (editable, strings for simplicity).
  const [provider, setProvider] = useState<DomainProviderKind>("COOLIFY");
  const [coolifyBaseUrl, setCoolifyBaseUrl] = useState("");
  const [coolifyToken, setCoolifyToken] = useState("");
  const [coolifyAppUuid, setCoolifyAppUuid] = useState("");
  const [coolifyServerUuid, setCoolifyServerUuid] = useState("");
  const [coolifyRedeploy, setCoolifyRedeploy] = useState(true);
  const [cloudflareToken, setCloudflareToken] = useState("");
  const [cloudflareZoneId, setCloudflareZoneId] = useState("");
  const [cloudflareSaas, setCloudflareSaas] = useState(false);
  const [cloudflareFallback, setCloudflareFallback] = useState("");
  const [aTarget, setATarget] = useState("");
  const [aaaaTarget, setAaaaTarget] = useState("");
  const [cnameTarget, setCnameTarget] = useState("");
  const [ownershipPrefix, setOwnershipPrefix] = useState("_squl-verify");
  const [zonesText, setZonesText] = useState("");
  const [reservedText, setReservedText] = useState("");
  const [selfServe, setSelfServe] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [certProbe, setCertProbe] = useState(true);
  const [certInterval, setCertInterval] = useState("60000");
  const [registrarProvider, setRegistrarProvider] =
    useState<RegistrarProviderKind>("MANUAL");
  const [registrarBaseUrl, setRegistrarBaseUrl] = useState("");
  const [registrarEmail, setRegistrarEmail] = useState("");
  const [registrarApiKey, setRegistrarApiKey] = useState("");
  const [registrarCurrency, setRegistrarCurrency] = useState("");
  const [registrarTlds, setRegistrarTlds] = useState("");
  const [registrarSearchBaseUrl, setRegistrarSearchBaseUrl] = useState("");
  const [registrarSearchApiKey, setRegistrarSearchApiKey] = useState("");
  const [registrarWhois, setRegistrarWhois] = useState("");
  const [billingStub, setBillingStub] = useState(true);
  const [orderSync, setOrderSync] = useState(false);
  const [orderSyncInterval, setOrderSyncInterval] = useState("60000");

  const apply = useCallback((record: PlatformDomainSettingsRecord) => {
    setSettings(record);
    setProvider(record.provider);
    setCoolifyBaseUrl(record.coolifyBaseUrl ?? "");
    setCoolifyAppUuid(record.coolifyAppUuid ?? "");
    setCoolifyServerUuid(record.coolifyServerUuid ?? "");
    setCoolifyRedeploy(record.coolifyRedeployOnAttach);
    setCloudflareZoneId(record.cloudflareZoneId ?? "");
    setCloudflareSaas(record.cloudflareSaasEnabled);
    setCloudflareFallback(record.cloudflareFallbackOrigin ?? "");
    setATarget(record.connectATarget ?? "");
    setAaaaTarget(record.connectAaaaTarget ?? "");
    setCnameTarget(record.connectCnameTarget ?? "");
    setOwnershipPrefix(record.ownershipTxtPrefix);
    setZonesText(zonesToText(record.platformZones));
    setReservedText(record.reservedHostnames.join("\n"));
    setSelfServe(record.selfServeEnabled);
    setRequireApproval(record.requireSuperadminApproval);
    setCertProbe(record.certProbeEnabled);
    setCertInterval(String(record.certProbeIntervalMs));
    setRegistrarProvider(record.registrarProvider);
    setRegistrarBaseUrl(record.registrarBaseUrl ?? "");
    setRegistrarEmail(record.registrarEmail ?? "");
    setRegistrarCurrency(record.registrarCurrency ?? "");
    setRegistrarTlds(record.registrarAllowedTlds ?? "");
    setRegistrarSearchBaseUrl(record.registrarSearchBaseUrl ?? "");
    setRegistrarWhois(whoisToText(record.registrarWhois ?? {}));
    setBillingStub(record.domainCheckoutBillingStubEnabled);
    setOrderSync(record.domainOrderSyncEnabled);
    setOrderSyncInterval(String(record.domainOrderSyncIntervalMs));
    setRegistrarApiKey("");
    setRegistrarSearchApiKey("");
    setCoolifyToken("");
    setCloudflareToken("");
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      apply(await fetchPlatformDomainSettings());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load settings");
    } finally {
      setLoading(false);
    }
  }, [apply]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const input: UpdatePlatformDomainSettingsInput = {
        provider,
        coolifyBaseUrl,
        coolifyAppUuid,
        coolifyServerUuid,
        coolifyRedeployOnAttach: coolifyRedeploy,
        cloudflareZoneId,
        cloudflareSaasEnabled: cloudflareSaas,
        cloudflareFallbackOrigin: cloudflareFallback,
        connectATarget: aTarget,
        connectAaaaTarget: aaaaTarget,
        connectCnameTarget: cnameTarget,
        ownershipTxtPrefix: ownershipPrefix,
        platformZones: textToZones(zonesText),
        reservedHostnames: reservedText
          .split(/[\n,]/)
          .map((s) => s.trim())
          .filter(Boolean),
        selfServeEnabled: selfServe,
        requireSuperadminApproval: requireApproval,
        certProbeEnabled: certProbe,
        certProbeIntervalMs: Number(certInterval) || 60000,
        registrarProvider,
        registrarBaseUrl,
        registrarEmail,
        registrarCurrency,
        registrarAllowedTlds: registrarTlds,
        registrarSearchBaseUrl,
        registrarWhois: textToWhois(registrarWhois),
        domainCheckoutBillingStubEnabled: billingStub,
        domainOrderSyncEnabled: orderSync,
        domainOrderSyncIntervalMs: Number(orderSyncInterval) || 60000,
      };
      if (coolifyToken.trim()) input.coolifyApiToken = coolifyToken.trim();
      if (cloudflareToken.trim())
        input.cloudflareApiToken = cloudflareToken.trim();
      if (registrarApiKey.trim())
        input.registrarApiKey = registrarApiKey.trim();
      if (registrarSearchApiKey.trim())
        input.registrarSearchApiKey = registrarSearchApiKey.trim();

      apply(await updatePlatformDomainSettings(input));
      toast.success("Domain settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (kind: DomainProviderKind) => {
    setTesting(kind);
    try {
      const result = await testPlatformDomainProvider(kind);
      if (result.configured && result.reachable !== false) {
        toast.success(result.message);
      } else {
        toast.warning(result.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Test failed");
    } finally {
      setTesting(null);
    }
  };

  const handleTestRegistrar = async () => {
    setTestingRegistrar(true);
    try {
      const result = await testPlatformRegistrar();
      if (result.configured && result.reachable !== false) {
        toast.success(result.message);
      } else {
        toast.warning(result.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Test failed");
    } finally {
      setTestingRegistrar(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading settings…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? <DashboardErrorBanner message={error} onRetry={load} /> : null}

      {settings && !settings.encryptionConfigured ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          Secret storage is not configured on the API (missing
          <code className="mx-1">APP_PAYMENTS_ENCRYPTION_KEY</code>). Provider
          tokens cannot be saved until it is set.
        </div>
      ) : null}

      <Section title="Provider">
        <div className="space-y-1.5">
          <Label className="text-sm">Active provider</Label>
          <select
            value={provider}
            onChange={(e) =>
              setProvider(e.target.value as DomainProviderKind)
            }
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="COOLIFY">Coolify (Traefik + Let&apos;s Encrypt)</option>
            <option value="CLOUDFLARE">Cloudflare for SaaS</option>
            <option value="STATIC">Static ingress (DNS only)</option>
          </select>
        </div>
      </Section>

      <Section title="Coolify">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="API base URL"
            value={coolifyBaseUrl}
            onChange={setCoolifyBaseUrl}
            placeholder="https://coolify.example.com:8000"
          />
          <Field
            label="API token"
            type="password"
            value={coolifyToken}
            onChange={setCoolifyToken}
            placeholder={
              settings?.hasCoolifyApiToken ? "•••• set (leave blank to keep)" : "paste token"
            }
          />
          <Field
            label="Application UUID"
            value={coolifyAppUuid}
            onChange={setCoolifyAppUuid}
          />
          <Field
            label="Server UUID"
            value={coolifyServerUuid}
            onChange={setCoolifyServerUuid}
          />
        </div>
        <Toggle
          label="Trigger a redeploy after attaching a domain"
          checked={coolifyRedeploy}
          onChange={setCoolifyRedeploy}
        />
        <Button
          variant="outline"
          size="sm"
          disabled={testing === "COOLIFY"}
          onClick={() => void handleTest("COOLIFY")}
        >
          {testing === "COOLIFY" ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <PlugZap className="mr-1.5 h-3.5 w-3.5" />
          )}
          Test connection
        </Button>
      </Section>

      <Section title="Cloudflare (optional)">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="API token"
            type="password"
            value={cloudflareToken}
            onChange={setCloudflareToken}
            placeholder={
              settings?.hasCloudflareApiToken
                ? "•••• set (leave blank to keep)"
                : "paste token"
            }
          />
          <Field
            label="Zone ID"
            value={cloudflareZoneId}
            onChange={setCloudflareZoneId}
          />
          <Field
            label="Fallback origin"
            value={cloudflareFallback}
            onChange={setCloudflareFallback}
          />
        </div>
        <Toggle
          label="Use Cloudflare for SaaS custom hostnames"
          checked={cloudflareSaas}
          onChange={setCloudflareSaas}
        />
        <Button
          variant="outline"
          size="sm"
          disabled={testing === "CLOUDFLARE"}
          onClick={() => void handleTest("CLOUDFLARE")}
        >
          {testing === "CLOUDFLARE" ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <PlugZap className="mr-1.5 h-3.5 w-3.5" />
          )}
          Test connection
        </Button>
      </Section>

      <Section title="DNS connect targets">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="A record target" value={aTarget} onChange={setATarget} placeholder="148.113.255.170" />
          <Field label="AAAA record target" value={aaaaTarget} onChange={setAaaaTarget} placeholder="(optional)" />
          <Field
            label="CNAME target"
            value={cnameTarget}
            onChange={setCnameTarget}
            placeholder="connect.squl.co.ke"
          />
          <Field
            label="Ownership TXT prefix"
            value={ownershipPrefix}
            onChange={setOwnershipPrefix}
            placeholder="_squl-verify"
          />
        </div>
      </Section>

      <Section title="Platform zones">
        <p className="text-xs text-muted-foreground">
          One per line:{" "}
          <code>zone | country | locale | currency | timeZone | primary | active</code>.
          Empty falls back to the built-in defaults.
        </p>
        <textarea
          value={zonesText}
          onChange={(e) => setZonesText(e.target.value)}
          rows={4}
          spellCheck={false}
          className="w-full rounded-md border border-input bg-background p-3 font-mono text-xs"
          placeholder="squl.co.ke | KE | en-KE | KES | Africa/Nairobi | true | true"
        />
      </Section>

      <Section title="Policy">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Reserved hostnames (one per line or comma-separated).
          </p>
          <textarea
            value={reservedText}
            onChange={(e) => setReservedText(e.target.value)}
            rows={3}
            spellCheck={false}
            className="w-full rounded-md border border-input bg-background p-3 font-mono text-xs"
          />
        </div>
        <Toggle
          label="Allow schools to connect their own domains"
          checked={selfServe}
          onChange={setSelfServe}
        />
        <Toggle
          label="Require super-admin approval before a domain goes live"
          checked={requireApproval}
          onChange={setRequireApproval}
        />
        <Toggle
          label="Background certificate probe"
          checked={certProbe}
          onChange={setCertProbe}
        />
        <Field
          label="Probe interval (ms)"
          value={certInterval}
          onChange={setCertInterval}
        />
      </Section>

      <Section title="Registrar & checkout">
        <div className="space-y-1.5">
          <Label className="text-sm">Registrar</Label>
          <select
            value={registrarProvider}
            onChange={(e) =>
              setRegistrarProvider(e.target.value as RegistrarProviderKind)
            }
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="MANUAL">Manual (operator registers)</option>
            <option value="HOSTAFRICA">HostAfrica DomainsReseller</option>
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Registrar API base URL"
            value={registrarBaseUrl}
            onChange={setRegistrarBaseUrl}
            placeholder="https://my.hostafrica.com/modules/addons/DomainsReseller/api/index.php"
          />
          <Field
            label="Registrar email (username)"
            value={registrarEmail}
            onChange={setRegistrarEmail}
          />
          <Field
            label="Registrar API key"
            type="password"
            value={registrarApiKey}
            onChange={setRegistrarApiKey}
            placeholder={
              settings?.hasRegistrarApiKey
                ? "•••• set (leave blank to keep)"
                : "paste key"
            }
          />
          <Field
            label="Currency"
            value={registrarCurrency}
            onChange={setRegistrarCurrency}
            placeholder="KES"
          />
          <Field
            label="Allowed TLDs"
            value={registrarTlds}
            onChange={setRegistrarTlds}
            placeholder="co.ke,or.ke,com"
          />
          <Field
            label="Availability API base URL"
            value={registrarSearchBaseUrl}
            onChange={setRegistrarSearchBaseUrl}
            placeholder="https://api.hostafrica.com"
          />
          <Field
            label="Availability API key"
            type="password"
            value={registrarSearchApiKey}
            onChange={setRegistrarSearchApiKey}
            placeholder={
              settings?.hasRegistrarSearchApiKey
                ? "•••• set (leave blank to keep)"
                : "Bearer key"
            }
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={testingRegistrar}
          onClick={() => void handleTestRegistrar()}
        >
          {testingRegistrar ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <PlugZap className="mr-1.5 h-3.5 w-3.5" />
          )}
          Test registrar
        </Button>
        <div className="space-y-1">
          <Label className="text-sm">WHOIS contact (one key=value per line)</Label>
          <textarea
            value={registrarWhois}
            onChange={(e) => setRegistrarWhois(e.target.value)}
            rows={6}
            spellCheck={false}
            className="w-full rounded-md border border-input bg-background p-3 font-mono text-xs"
            placeholder={
              "firstname=Platform\nlastname=Operator\nemail=domains@squl.co.ke\naddress1=...\ncity=Nairobi\nstate=Nairobi\npostcode=00100\ncountry=KE\nphonenumber=+254700000000"
            }
          />
        </div>
        <Toggle
          label="Settle domain orders offline (billing stub)"
          checked={billingStub}
          onChange={setBillingStub}
        />
        <Toggle
          label="Background order sync (provisioning → live)"
          checked={orderSync}
          onChange={setOrderSync}
        />
        <Field
          label="Order sync interval (ms)"
          value={orderSyncInterval}
          onChange={setOrderSyncInterval}
        />
      </Section>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-1.5 h-4 w-4" />
          )}
          Save settings
        </Button>
      </div>
    </div>
  );
}
