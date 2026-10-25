"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Circle,
  Copy,
  ExternalLink,
  Globe,
  HelpCircle,
  Loader2,
  RefreshCw,
  ShoppingCart,
  Star,
  Trash2,
} from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import type {
  CloudflareDnsResult,
  DnsRecord,
  TenantDomain,
} from "@/lib/school/domainsApi";
import { cn } from "@/lib/utils";
import { useTenantDomains } from "../useTenantDomains";
import { useCloudflareDns } from "../useCloudflareDns";
import {
  CloudflareConnectDialog,
  CloudflareDnsSection,
} from "./CloudflareDnsSection";
import { CloudflareLogo } from "./CloudflareLogo";


/**
 * Backend messages are precise but technical. Translate the common ones into
 * something a school administrator can act on, and keep the original text
 * available under "Technical details" for support.
 */
function friendlyCheckMessage(raw: string): string {
  const message = raw.toLowerCase();
  if (message.includes("no txt record")) {
    return "We haven't found the proof code yet. Make sure the settings were added, then give it a few minutes and check again.";
  }
  if (message.includes("does not match the expected token")) {
    return "The proof code doesn't match yet. Re-add the settings, or check for a typo in the value.";
  }
  if (message.includes("no connect target")) {
    return "Our side still needs its connection address configured. Please contact SQUL support and mention this domain.";
  }
  if (message.includes("coolify") || message.includes("not configured")) {
    return "Our hosting connection isn't set up yet. Please contact SQUL support and mention this domain.";
  }
  if (message.includes("certificate") || message.includes("tls")) {
    return "The security certificate is still being issued. Give it a few minutes and check again.";
  }
  if (message.includes("has no a/cname") || message.includes("a record") || message.includes("cname")) {
    return "The domain still points somewhere else. The settings may not have been added at your registrar yet.";
  }
  return raw;
}

function normalizeInput(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(/[/?#:]/)[0]
    .replace(/\.$/, "");
}

function statusMeta(status: string): {
  label: string;
  className: string;
} {
  switch (status) {
    case "ACTIVE":
      return {
        label: "Live",
        className:
          "bg-emerald-600 text-white hover:bg-emerald-600 border-transparent",
      };
    case "VERIFYING":
      return {
        label: "Almost ready",
        className:
          "border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
      };
    case "FAILED":
      return {
        label: "Needs attention",
        className:
          "border-red-300 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
      };
    case "SUSPENDED":
      return { label: "Removed", className: "" };
    default:
      return {
        label: "Setting up",
        className:
          "border-sky-300 bg-sky-50 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300",
      };
  }
}

function CopyButton({ value }: { value: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ title: "Copy failed", description: "Copy the value manually." });
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-7 px-2"
      onClick={onCopy}
      aria-label="Copy value"
    >
      {copied ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}

function DnsTable({ rows }: { rows: DnsRecord[] }) {
  if (!rows.length) return null;
  return (
    <div className="overflow-hidden rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={`${row.type}-${row.name}-${index}`}>
              <TableCell className="font-mono text-xs font-semibold">
                {row.type}
              </TableCell>
              <TableCell className="font-mono text-xs">{row.name}</TableCell>
              <TableCell className="font-mono text-xs break-all">
                {row.value}
              </TableCell>
              <TableCell>
                <CopyButton value={row.value} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Step({
  done,
  current,
  label,
}: {
  done: boolean;
  current: boolean;
  label: string;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-1.5",
        done
          ? "text-emerald-700 dark:text-emerald-400"
          : current
            ? "text-foreground"
            : "text-muted-foreground",
      )}
    >
      {done ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <Circle
          className={cn("h-4 w-4", current ? "text-primary" : "opacity-40")}
        />
      )}
      <span className="text-xs font-medium">{label}</span>
    </li>
  );
}

function RegistrarLink({
  name,
  note,
  href,
}: {
  name: string;
  note: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2 transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      <span>
        <span className="block text-sm font-medium">{name}</span>
        <span className="block text-xs text-muted-foreground">{note}</span>
      </span>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    </a>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-lg border px-3 py-2">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium">
        {q}
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</p>
    </details>
  );
}

function DomainCard({
  domain,
  busy,
  cloudflareConnected,
  cloudflareOauthAvailable,
  cloudflareApplying,
  cloudflareResults,
  onVerify,
  onSetPrimary,
  onRemove,
  onAddRecords,
  onConnectCloudflare,
  onConnectCloudflareOAuth,
}: {
  domain: TenantDomain;
  busy: boolean;
  cloudflareConnected: boolean;
  cloudflareOauthAvailable: boolean;
  cloudflareApplying: boolean;
  cloudflareResults: CloudflareDnsResult[] | undefined;
  onVerify: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onRemove: (id: string) => void;
  onAddRecords: () => void;
  onConnectCloudflare: () => void;
  onConnectCloudflareOAuth: () => void;
}) {
  const meta = statusMeta(domain.status);
  const instruction = domain.dnsInstruction;
  const isLive = domain.status === "ACTIVE";
  const isVerifying = domain.status === "VERIFYING";
  const recordsWritten = Boolean(
    cloudflareResults?.length &&
      cloudflareResults.every((row) => row.action !== "failed"),
  );
  const settingsDone = isLive || isVerifying || recordsWritten;
  const [manualOpen, setManualOpen] = useState(!cloudflareOauthAvailable);

  return (
    <Card
      className={cn(
        "border-2",
        isLive ? "border-emerald-200 dark:border-emerald-500/30" : "border-border",
      )}
    >
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate font-semibold">{domain.hostname}</span>
            {domain.isPrimary ? (
              <Badge variant="outline" className="text-[10px]">
                Main address
              </Badge>
            ) : null}
          </div>
          <Badge className={cn("text-[10px] uppercase", meta.className)}>
            {meta.label}
          </Badge>
        </div>

        <ol className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-y py-2.5">
          <Step done label="Domain added" current={false} />
          <Step
            done={settingsDone}
            current={!settingsDone}
            label="Settings added"
          />
          <Step done={isLive} current={settingsDone && !isLive} label="Live" />
        </ol>

        {isLive ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              Your school is live at {domain.hostname}
            </p>
            <p className="mt-1 text-xs text-emerald-800/80 dark:text-emerald-300/80">
              Share it on WhatsApp, school letters, Google Business and your
              social pages. Visitors no longer see the long free address.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <a
                  href={`https://${domain.hostname}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit your site
                  <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                </a>
              </Button>
              {!domain.isPrimary ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSetPrimary(domain.id)}
                  disabled={busy}
                >
                  <Star className="mr-1.5 h-3.5 w-3.5" />
                  Make main address
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            {isVerifying ? (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin" />
                <span>
                  Almost there — we&apos;re setting up the security certificate.
                  This usually finishes in a few minutes, sometimes a little
                  longer.
                </span>
              </div>
            ) : null}

            {domain.lastError ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                <p className="font-medium">What still needs checking</p>
                <p className="mt-0.5 break-words">
                  {friendlyCheckMessage(domain.lastError)}
                </p>
                <details className="mt-1.5">
                  <summary className="cursor-pointer text-[11px] text-amber-700/80 underline-offset-2 hover:underline dark:text-amber-300/80">
                    Technical details
                  </summary>
                  <p className="mt-1 break-words font-mono text-[11px] text-amber-800/80 dark:text-amber-300/70">
                    {domain.lastError}
                  </p>
                </details>
              </div>
            ) : null}

            {instruction ? (
              <CloudflareDnsSection
                connected={cloudflareConnected}
                oauthAvailable={cloudflareOauthAvailable}
                applying={cloudflareApplying}
                results={cloudflareResults}
                onAddRecords={onAddRecords}
                onConnect={onConnectCloudflare}
                onConnectOAuth={onConnectCloudflareOAuth}
                onCheckLive={() => onVerify(domain.id)}
                onShowManual={() => setManualOpen(true)}
              />
            ) : (
              <p className="text-xs text-muted-foreground">
                We&apos;re preparing the settings for this domain. Refresh in a
                moment.
              </p>
            )}

            {manualOpen && instruction ? (
              <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
                <div>
                  <p className="text-sm font-medium">
                    Add the settings yourself
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Log in to where you bought the domain. In Truehost or
                    HostPinnacle go to <strong>cPanel → Zone Editor</strong>; in
                    Cloudflare go to <strong>DNS → Records</strong>. Add the rows
                    below and leave your email (MX) records alone.
                  </p>
                </div>
                <DnsTable rows={instruction.recommendedRecords} />
                <div>
                  <p className="mb-1 text-xs font-medium">
                    Proof that you own the domain
                  </p>
                  <p className="mb-1 text-xs text-muted-foreground">
                    This one-time code stops someone else from claiming your
                    address.
                  </p>
                  <DnsTable rows={[instruction.ownership]} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Not comfortable doing this? Your registrar&apos;s support can
                  add them for you — just send them this list.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setManualOpen(false)}
                >
                  Hide settings
                </Button>
              </div>
            ) : null}
          </>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {!isLive ? (
            <Button
              size="sm"
              onClick={() => onVerify(domain.id)}
              disabled={busy}
            >
              {busy ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              )}
              Check if it&apos;s live
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700"
            onClick={() => onRemove(domain.id)}
            disabled={busy}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Remove domain
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function DomainSettingsPanel() {
  const { toast } = useToast();
  const routeParams = useParams<{ subdomain?: string }>();
  const subdomain =
    typeof routeParams?.subdomain === "string" ? routeParams.subdomain : "";
  const freeAddress = subdomain ? `${subdomain}.squl.co.ke` : null;

  const {
    domains,
    loading,
    busyId,
    error,
    connect,
    verify,
    setPrimary,
    disconnect,
  } = useTenantDomains();
  const cloudflare = useCloudflareDns();
  const { refresh: refreshCloudflare } = cloudflare;
  const [hostname, setHostname] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [cloudflareOpen, setCloudflareOpen] = useState(false);
  const handledCloudflareReturn = useRef(false);

  useEffect(() => {
    if (handledCloudflareReturn.current) return;
    const params = new URLSearchParams(window.location.search);
    const status = params.get("cloudflare");
    if (!status) return;
    handledCloudflareReturn.current = true;

    if (status === "connected") {
      toast({
        title: "Cloudflare connected",
        description: "Now add the settings for your domain.",
      });
      void refreshCloudflare();
    } else {
      toast({
        title: "Cloudflare connection failed",
        description: params.get("reason") ?? "Please try again.",
        variant: "destructive",
      });
    }

    params.delete("cloudflare");
    params.delete("reason");
    const query = params.toString();
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
  }, [refreshCloudflare, toast]);

  const handleConnect = async () => {
    const value = normalizeInput(hostname);
    if (!value) return;
    setConnecting(true);
    try {
      await connect(value);
      setHostname("");
      toast({
        title: "Domain added",
        description: "Next: add the settings so we can switch it on.",
      });
    } catch (err) {
      toast({
        title: "Could not add domain",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      const updated = await verify(id);
      toast({
        title: updated.status === "ACTIVE" ? "You're live!" : "Not live yet",
        description:
          updated.status === "ACTIVE"
            ? "Your school site is now on this address."
            : (updated.lastError ??
              "Give it a few minutes and check again."),
      });
    } catch (err) {
      toast({
        title: "Check failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleConnectOAuth = async () => {
    try {
      const url = await cloudflare.startOAuth();
      window.location.assign(url);
    } catch (err) {
      toast({
        title: "Could not start Cloudflare sign-in",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleConnectCloudflare = async (token: string) => {
    const next = await cloudflare.connect(token);
    toast({
      title: "Cloudflare connected",
      description: next.accountName
        ? `Signed in to ${next.accountName} — ${next.zones.length} zone(s) available.`
        : `${next.zones.length} zone(s) available.`,
    });
  };

  const handleDisconnectCloudflare = async () => {
    try {
      await cloudflare.disconnect();
      toast({ title: "Cloudflare disconnected" });
    } catch (err) {
      toast({
        title: "Could not disconnect",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleAddRecords = async (domain: TenantDomain) => {
    try {
      const rows = await cloudflare.apply(domain.id);
      const failed = rows.filter((row) => row.action === "failed").length;
      toast({
        title: failed ? "A settings row needs attention" : "Settings added",
        description: failed
          ? `${rows.length - failed} written, ${failed} failed. The details are on the domain card.`
          : "Now check if your site is live — it can take a few minutes.",
        variant: failed ? "destructive" : undefined,
      });
    } catch (err) {
      toast({
        title: "Could not add settings",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-2">
        <div className="bg-gradient-to-br from-primary/10 via-background to-[#F38020]/10 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-white/10 dark:ring-white/10">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold sm:text-xl">
                Give your school its own web address
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Something parents will remember — like{" "}
                <span className="font-medium text-foreground">mirema.ac.ke</span>{" "}
                — instead of a long free link. It looks professional on letters,
                WhatsApp and Google, and you keep it even if you change schools.
              </p>
              {freeAddress ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Your free address today:{" "}
                  <span className="font-medium text-foreground">
                    {freeAddress}
                  </span>
                </p>
              ) : null}
            </div>
          </div>

          <ol className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              {
                title: "Add your domain",
                desc: "Type the address you own — or buy one in the Get a domain tab.",
              },
              {
                title: "Add the settings",
                desc: "One click with Cloudflare, or copy the list yourself.",
              },
              {
                title: "Go live",
                desc: "We check everything and switch your site on.",
              },
            ].map((step, index) => (
              <li
                key={step.title}
                className="rounded-lg border bg-background/80 p-3"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                  Step {index + 1}
                </span>
                <p className="mt-1 text-sm font-medium">{step.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Card>

      <details className="group rounded-xl border bg-card p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-sm font-medium">
            <ShoppingCart className="h-4 w-4 text-primary" />
            Don&apos;t have a domain yet? Here&apos;s how to get one
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 text-sm dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <p className="font-medium text-emerald-900 dark:text-emerald-200">
              Easiest: buy it right here
            </p>
            <p className="mt-0.5 text-xs text-emerald-800/80 dark:text-emerald-300/80">
              Switch to the <strong>Get a domain</strong> tab above. One year
              costs <strong>KES 1,800</strong>, paid with M-Pesa — we register it
              and connect it to your school site for you.
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Prefer a registrar? A domain costs roughly{" "}
            <strong>KES 1,000–2,500 a year</strong>; buy it in your school&apos;s
            name from any registrar — these are popular in Kenya:
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            <RegistrarLink
              name="Truehost Kenya"
              note="Kenyan registrar and hosting, local support"
              href="https://truehost.co.ke"
            />
            <RegistrarLink
              name="HostPinnacle"
              note="Kenyan registrar and hosting"
              href="https://hostpinnacle.co.ke"
            />
            <RegistrarLink
              name="Namecheap"
              note="International, prices in USD"
              href="https://www.namecheap.com/domains/"
            />
            <RegistrarLink
              name="Cloudflare Registrar"
              note="At-cost domains, for the more technical"
              href="https://www.cloudflare.com/products/registrar/"
            />
          </div>

          <div className="rounded-lg bg-muted/40 p-4">
            <p className="text-sm font-medium">How to choose a good name</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
              <li>
                Use your school&apos;s name —{" "}
                <span className="font-mono text-xs">mirema.ac.ke</span> is easy
                to say and easy to remember.
              </li>
              <li>
                Keep it short. Avoid hyphens, numbers and long phrases — they
                get misspelled when people share it.
              </li>
              <li>
                <strong>.co.ke</strong> for Kenya, <strong>.com</strong> if you
                also serve families abroad, <strong>.ac.ke</strong> only if you
                qualify as an academic institution.
              </li>
              <li>
                Make sure it isn&apos;t another school&apos;s name or brand
                before you pay.
              </li>
              <li>
                Remember to renew it every year — put a reminder in your
                calendar.
              </li>
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">
            Bought it? Add it below. You don&apos;t need to change nameservers or
            touch your email — and if the technical part feels like too much, the
            registrar&apos;s support can add the settings we show you.
          </p>
        </div>
      </details>

      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              1
            </span>
            <CardTitle className="text-base">Add your web address</CardTitle>
          </div>
          <CardDescription>
            Type the domain you own. We&apos;ll take it from there.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="hostname" className="text-sm font-medium">
            Your domain
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="hostname"
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
              placeholder="mirema.ac.ke"
              autoComplete="off"
              spellCheck={false}
              inputMode="url"
              className="h-11 border-2 focus:border-primary"
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleConnect();
              }}
            />
            <Button
              onClick={handleConnect}
              disabled={connecting || !hostname.trim()}
              className="h-11"
            >
              {connecting ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : null}
              Add domain
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Just the address, for example <strong>mirema.ac.ke</strong>. Leave
            out https:// and www — we&apos;ll handle those.
          </p>

          {error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      {cloudflare.connection?.connected ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#F38020]/30 bg-[#F38020]/[0.06] px-3 py-2.5 text-xs">
          <span className="flex items-center gap-2">
            <CloudflareLogo className="h-4 w-4 text-[#F38020]" />
            <span>
              Cloudflare connected
              {cloudflare.connection.accountName
                ? ` · ${cloudflare.connection.accountName}`
                : ""}
              . We can add settings for you automatically.
            </span>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => void handleDisconnectCloudflare()}
          >
            Disconnect
          </Button>
        </div>
      ) : null}

      {cloudflare.error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{cloudflare.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Your domains</h3>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading your domains…
          </div>
        ) : domains.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center">
            <Globe className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="mt-2 text-sm font-medium">No custom domains yet</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
              Your school already works on its free address. Add your own domain
              above whenever you&apos;re ready — you can&apos;t break anything by
              trying.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {domains.map((domain) => (
              <DomainCard
                key={domain.id}
                domain={domain}
                busy={busyId === domain.id}
                cloudflareConnected={cloudflare.connection?.connected ?? false}
                cloudflareOauthAvailable={
                  cloudflare.connection?.oauthAvailable ?? false
                }
                cloudflareApplying={cloudflare.applyingId === domain.id}
                cloudflareResults={cloudflare.results[domain.id]}
                onVerify={handleVerify}
                onSetPrimary={(id) => void setPrimary(id)}
                onRemove={(id) => void disconnect(id)}
                onAddRecords={() => void handleAddRecords(domain)}
                onConnectCloudflare={() => setCloudflareOpen(true)}
                onConnectCloudflareOAuth={() => void handleConnectOAuth()}
              />
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HelpCircle className="h-4 w-4 text-primary" />
            Common questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Faq
            q="Will this change my email?"
            a="No. We only add the few settings shown for the website. Your email (MX) records are left exactly as they are."
          />
          <Faq
            q="How long does it take?"
            a="Usually a few minutes after the settings are added. Occasionally the wider internet takes a few hours to catch up. You can keep checking — nothing breaks while you wait."
          />
          <Faq
            q="What is Cloudflare, and do I need it?"
            a="Cloudflare is a free service that manages a domain's settings. If your domain uses Cloudflare, the orange button adds everything for you. If it doesn't, use the 'add them myself' list and your registrar's support can help."
          />
          <Faq
            q="Can I use a domain I already own?"
            a="Yes — that's the most common case. Add it above and either connect Cloudflare or add the settings yourself. Your existing website, if any, will be replaced by your school site."
          />
          <Faq
            q="I'm stuck. Who can help?"
            a="Your registrar's support team can add the settings — send them the list from 'Add the settings yourself'. For anything about SQUL itself, contact SQUL support and mention the domain name."
          />
        </CardContent>
      </Card>

      <CloudflareConnectDialog
        open={cloudflareOpen}
        onOpenChange={setCloudflareOpen}
        connecting={cloudflare.connecting}
        onSubmit={handleConnectCloudflare}
      />
    </div>
  );
}
