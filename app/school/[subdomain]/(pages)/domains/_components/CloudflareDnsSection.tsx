"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CLOUDFLARE_TOKEN_TEMPLATE_URL,
  type CloudflareDnsResult,
} from "@/lib/school/domainsApi";
import { CloudflareLogo } from "./CloudflareLogo";

/**
 * The "we can do this for you" panel. Plain-language copy: the school admin
 * should never need to know what a TXT or CNAME record is to use this.
 */
export function CloudflareDnsSection({
  connected,
  oauthAvailable,
  applying,
  results,
  onAddRecords,
  onConnect,
  onConnectOAuth,
  onCheckLive,
  onShowManual,
}: {
  connected: boolean;
  oauthAvailable: boolean;
  applying: boolean;
  results: CloudflareDnsResult[] | undefined;
  onAddRecords: () => void;
  onConnect: () => void;
  onConnectOAuth: () => void;
  onCheckLive: () => void;
  onShowManual: () => void;
}) {
  const failed = results?.filter((row) => row.action === "failed") ?? [];
  const written =
    results?.filter((row) => row.action !== "failed").length ?? 0;
  const allDone = Boolean(results?.length) && failed.length === 0;

  return (
    <div className="rounded-xl border border-[#F38020]/30 bg-[#F38020]/[0.06] p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white shadow-sm ring-1 ring-black/5 dark:bg-white/10 dark:ring-white/10">
          <CloudflareLogo className="h-5 w-5 text-[#F38020]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">
              Let us add these settings for you
            </p>
            {connected ? (
              <Badge
                variant="outline"
                className="border-emerald-600/30 bg-emerald-50 text-[10px] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              >
                Cloudflare connected
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {connected
              ? "We'll copy the settings for this domain into your Cloudflare account. It usually takes less than a minute."
              : "Cloudflare keeps your domain's settings. Connect it once — you approve on Cloudflare's website — and we'll add everything for you."}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        {connected ? (
          <Button
            type="button"
            size="sm"
            className="bg-[#F38020] text-white hover:bg-[#d9700e]"
            onClick={onAddRecords}
            disabled={applying}
          >
            {applying ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CloudflareLogo className="mr-2 h-4 w-4" />
            )}
            {applying ? "Adding settings…" : "Add settings now"}
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            className="bg-[#F38020] text-white hover:bg-[#d9700e]"
            onClick={oauthAvailable ? onConnectOAuth : onConnect}
          >
            <CloudflareLogo className="mr-2 h-4 w-4" />
            Connect Cloudflare
          </Button>
        )}

        <button
          type="button"
          onClick={onShowManual}
          className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          I&apos;d rather add them myself
        </button>

        {!connected && oauthAvailable ? (
          <button
            type="button"
            onClick={onConnect}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Use an API token
          </button>
        ) : null}
      </div>

      {results?.length ? (
        <div className="mt-3 space-y-1.5">
          {results.map((row) => (
            <div
              key={`${row.type}-${row.name}-${row.value}`}
              className="flex items-start gap-2 text-xs"
            >
              {row.action === "failed" ? (
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              )}
              <span className={row.action === "failed" ? "text-red-600" : ""}>
                {row.action === "failed"
                  ? (row.message ?? `Could not add ${row.type} for ${row.name}.`)
                  : `${row.type} setting for ${row.name}`}
              </span>
            </div>
          ))}

          {allDone ? (
            <div className="mt-2 rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
              <p className="font-medium">Settings added — nice work.</p>
              <p className="mt-0.5">
                Next, check that the internet has picked them up. This can take
                a few minutes.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-2 h-7 border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50 dark:bg-transparent"
                onClick={onCheckLive}
              >
                Check if it&apos;s live
              </Button>
            </div>
          ) : null}

          {failed.length ? (
            <p className="text-xs text-red-600">
              {written} setting(s) added, {failed.length} failed. Fix the message
              above and try again — or add them yourself below.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function CloudflareConnectDialog({
  open,
  onOpenChange,
  connecting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connecting: boolean;
  onSubmit: (token: string) => Promise<unknown>;
}) {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setToken("");
      setError(null);
    }
    onOpenChange(next);
  };

  const submit = async () => {
    const value = token.trim();
    if (!value) {
      setError("Paste the token Cloudflare shows you.");
      return;
    }
    try {
      setError(null);
      await onSubmit(value);
      handleOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CloudflareLogo className="h-5 w-5 text-[#F38020]" />
            Connect Cloudflare with a token
          </DialogTitle>
          <DialogDescription>
            This is the manual way in. Most schools can just press the orange
            Connect button instead.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-sm">1. Create the token</Label>
            <Button asChild variant="outline" size="sm" className="w-full">
              <a
                href={CLOUDFLARE_TOKEN_TEMPLATE_URL}
                target="_blank"
                rel="noreferrer"
              >
                Open Cloudflare with permissions pre-selected
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
            <p className="text-xs text-muted-foreground">
              The form opens with <strong>Zone:Read</strong> and{" "}
              <strong>DNS:Edit</strong> already selected. Choose the school&apos;s
              zone, press <em>Continue</em>, then <em>Create token</em> and copy
              it — Cloudflare shows it once.
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="cloudflare-token" className="text-sm">
              2. Paste the token
            </Label>
            <Textarea
              id="cloudflare-token"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Paste the API token here"
              rows={2}
              spellCheck={false}
              autoComplete="off"
              className="font-mono text-xs"
            />
          </div>

          <div className="flex items-start gap-2 rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              The token is encrypted at rest and can only read zones and edit DNS
              records. Remove it any time with <em>Disconnect</em>.
            </span>
          </div>

          {error ? (
            <div className="flex items-start gap-2 text-xs text-red-600">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={connecting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#F38020] text-white hover:bg-[#d9700e]"
            onClick={() => void submit()}
            disabled={connecting}
          >
            {connecting ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
            )}
            Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
