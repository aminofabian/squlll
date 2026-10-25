"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  RefreshCw,
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

function statusMeta(status: string): { text: string; className: string } {
  switch (status) {
    case "ACTIVE":
      return {
        text: "Live",
        className: "bg-emerald-600 text-white hover:bg-emerald-600",
      };
    case "VERIFYING":
      return { text: "Securing certificate…", className: "" };
    case "FAILED":
      return { text: "Failed", className: "bg-red-600 text-white hover:bg-red-600" };
    case "SUSPENDED":
      return { text: "Removed", className: "" };
    default:
      return { text: "Add DNS records", className: "" };
  }
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
    <div className="overflow-hidden rounded-md border">
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
  const showRecords = domain.status !== "ACTIVE" && instruction;

  return (
    <Card className="border-2 border-border">
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{domain.hostname}</span>
            {domain.isPrimary ? (
              <Badge variant="outline" className="text-[10px]">
                Primary
              </Badge>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn("text-[10px] uppercase", meta.className)}>
              {meta.text}
            </Badge>
            {domain.status === "ACTIVE" ? (
              <Button asChild variant="ghost" size="sm" className="h-7 px-2">
                <a
                  href={`https://${domain.hostname}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        {domain.lastError ? (
          <p className="text-xs text-amber-700 dark:text-amber-500">
            {domain.lastError}
          </p>
        ) : null}

        {showRecords ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">{instruction.note}</p>
            <DnsTable rows={instruction.recommendedRecords} />
            <div>
              <p className="mb-1 text-xs font-medium">
                Ownership record (proves you control this domain)
              </p>
              <DnsTable rows={[instruction.ownership]} />
            </div>
            <CloudflareDnsSection
              connected={cloudflareConnected}
              oauthAvailable={cloudflareOauthAvailable}
              applying={cloudflareApplying}
              results={cloudflareResults}
              onAddRecords={onAddRecords}
              onConnect={onConnectCloudflare}
              onConnectOAuth={onConnectCloudflareOAuth}
            />
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
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
            Check connection
          </Button>
          {domain.status === "ACTIVE" && !domain.isPrimary ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSetPrimary(domain.id)}
              disabled={busy}
            >
              <Star className="mr-1.5 h-3.5 w-3.5" />
              Make primary
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
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function DomainSettingsPanel() {
  const { toast } = useToast();
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
        description: "Now add the DNS records for your domain.",
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
        description: "Add the DNS records below, then check the connection.",
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
        title:
          updated.status === "ACTIVE"
            ? "Domain is live"
            : "Not live yet",
        description: updated.lastError ?? "Checked just now.",
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
        title: failed ? "Some records need attention" : "DNS records added",
        description: failed
          ? `${rows.length - failed} written, ${failed} failed. See the messages on the domain card.`
          : "Now choose Check connection to activate the domain.",
        variant: failed ? "destructive" : undefined,
      });
    } catch (err) {
      toast({
        title: "Could not add records",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-border">
        <CardHeader className="bg-muted/50">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="text-primary">Custom domain</CardTitle>
          </div>
          <CardDescription>
            Point a domain you own at your school site. Add the DNS records we
            show, then choose <strong>Check connection</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="hostname" className="text-sm font-medium">
              Domain
            </Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="hostname"
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                placeholder="school.ac.ke"
                autoComplete="off"
                spellCheck={false}
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
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a domain you already own, without <code>https://</code> or
              the <code>www</code>.
            </p>
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      {cloudflare.connection?.connected ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs">
          <span className="flex items-center gap-1.5">
            <Cloud className="h-3.5 w-3.5 text-primary" />
            Cloudflare connected
            {cloudflare.connection.accountName
              ? ` as ${cloudflare.connection.accountName}`
              : ""}
            {" · "}
            {cloudflare.connection.zones.length} zone(s)
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

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading domains…
        </div>
      ) : domains.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No custom domains yet. Your school already has a free address.
        </p>
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

      <CloudflareConnectDialog
        open={cloudflareOpen}
        onOpenChange={setCloudflareOpen}
        connecting={cloudflare.connecting}
        onSubmit={handleConnectCloudflare}
      />
    </div>
  );
}
