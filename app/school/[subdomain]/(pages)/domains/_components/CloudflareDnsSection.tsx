"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
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
import { cn } from "@/lib/utils";

const ACTION_LABEL: Record<CloudflareDnsResult["action"], string> = {
  created: "Added",
  updated: "Updated",
  unchanged: "Already correct",
  failed: "Failed",
};

function actionClass(action: CloudflareDnsResult["action"]): string {
  if (action === "created" || action === "unchanged") {
    return "bg-emerald-600 text-white hover:bg-emerald-600";
  }
  if (action === "updated") {
    return "bg-amber-600 text-white hover:bg-amber-600";
  }
  return "bg-red-600 text-white hover:bg-red-600";
}

/**
 * "Add these records for me" affordance shown inside a pending domain card.
 * Without a connection it opens the dialog; with one it writes the rows to
 * Cloudflare and reports per-record results.
 */
export function CloudflareDnsSection({
  connected,
  applying,
  results,
  onAddRecords,
  onConnect,
}: {
  connected: boolean;
  applying: boolean;
  results: CloudflareDnsResult[] | undefined;
  onAddRecords: () => void;
  onConnect: () => void;
}) {
  const failed = results?.filter((row) => row.action === "failed") ?? [];

  return (
    <div className="rounded-md border border-dashed p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Add DNS records automatically</span>
        </div>
        {connected ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onAddRecords}
            disabled={applying}
          >
            {applying ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Cloud className="mr-1.5 h-3.5 w-3.5" />
            )}
            Add records in Cloudflare
          </Button>
        ) : (
          <Button type="button" size="sm" onClick={onConnect}>
            <Cloud className="mr-1.5 h-3.5 w-3.5" />
            Connect Cloudflare
          </Button>
        )}
      </div>

      {!connected ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Already have this domain on Cloudflare? Connect it once and we will
          create the rows above for you.
        </p>
      ) : null}

      {results?.length ? (
        <div className="mt-3 space-y-1.5">
          {results.map((row) => (
            <div
              key={`${row.type}-${row.name}-${row.value}`}
              className="flex flex-wrap items-center gap-2 text-xs"
            >
              <Badge className={cn("text-[10px] uppercase", actionClass(row.action))}>
                {ACTION_LABEL[row.action]}
              </Badge>
              <span className="font-mono">{row.type}</span>
              <span className="font-mono break-all">{row.name}</span>
              {row.message ? (
                <span className="text-red-600">{row.message}</span>
              ) : null}
            </div>
          ))}
          {failed.length ? (
            <p className="text-xs text-red-600">
              {failed.length} record(s) could not be written. Fix the message
              above and try again.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Records are in Cloudflare. Click <strong>Check connection</strong>{" "}
              to activate the domain.
            </p>
          )}
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
          <DialogTitle>Connect Cloudflare</DialogTitle>
          <DialogDescription>
            Cloudflare lets us add the DNS rows for you with a short-lived API
            token. You stay signed in to Cloudflare in this browser.
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
              zone (or all zones), press <em>Continue</em>, then{" "}
              <em>Create token</em> and copy it — Cloudflare shows it once.
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
            onClick={() => onOpenChange(false)}
            disabled={connecting}
          >
            Cancel
          </Button>
          <Button type="button" onClick={() => void submit()} disabled={connecting}>
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
