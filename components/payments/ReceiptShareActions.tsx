"use client";

import { useEffect, useState } from "react";
import { Check, Link2, Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const COPIED_RESET_MS = 1800;

interface ReceiptShareActionsProps {
  title: string;
  summary: string;
}

export function ReceiptShareActions({ title, summary }: ReceiptShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => setCanShare("share" in navigator), []);

  const copyLink = async () => {
    await navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), COPIED_RESET_MS);
  };

  const share = () =>
    navigator.share({ title, text: summary, url: window.location.href }).catch(() => undefined);

  return (
    <div className="grid grid-cols-2 gap-2">
      {canShare ? (
        <Button type="button" variant="outline" className="rounded-xl" onClick={() => void share()}>
          <Share2 aria-hidden />
          Share
        </Button>
      ) : (
        <Button type="button" variant="outline" className="rounded-xl" onClick={() => void copyLink()}>
          {copied ? <Check aria-hidden /> : <Link2 aria-hidden />}
          {copied ? "Link copied" : "Copy link"}
        </Button>
      )}
      <Button type="button" className="rounded-xl" onClick={() => window.print()}>
        <Printer aria-hidden />
        Print
      </Button>
    </div>
  );
}
