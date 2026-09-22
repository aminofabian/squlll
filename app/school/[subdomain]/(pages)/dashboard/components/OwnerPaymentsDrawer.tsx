"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Building2,
  CheckCircle2,
  Landmark,
  Loader2,
  Smartphone,
  Sparkles,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CustodyMpesaSettingsPanel } from "../../fees/components/CustodyMpesaSettingsPanel";
import { SchoolBankAccountsPanel } from "../../fees/components/SchoolBankAccountsPanel";
import { useMpesaCustody } from "../../fees/hooks/useMpesaCustody";
import { readIsSchoolOwner } from "@/lib/school/isSchoolOwner";

type Rail = "mpesa" | "bank";

type OwnerPaymentsDrawerProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Custom trigger — omitted when controlled-only */
  trigger?: ReactNode;
  defaultRail?: Rail;
};

export function OwnerPaymentsDrawer({
  open: controlledOpen,
  onOpenChange,
  trigger,
  defaultRail = "mpesa",
}: OwnerPaymentsDrawerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [rail, setRail] = useState<Rail>(defaultRail);
  const isOwner = useMemo(() => readIsSchoolOwner(), []);
  const { destination, availability, loading, custodyLine } = useMpesaCustody();

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  useEffect(() => {
    if (open) setRail(defaultRail);
  }, [open, defaultRail]);

  if (!isOwner) return null;

  const tillReady = Boolean(destination && availability?.custodyProvider === "DARAJA");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger ? <SheetTrigger asChild>{trigger}</SheetTrigger> : null}
      <SheetContent
        side="right"
        className={cn(
          "flex w-full flex-col gap-0 overflow-hidden border-l border-[#1a4d42]/15 p-0 sm:max-w-md",
          "bg-[#f3f7f5] dark:bg-[#071411]",
        )}
      >
        <div
          className="relative overflow-hidden border-b border-[#1a4d42]/15 bg-[#0a1f1a] px-5 pb-5 pt-6 text-white"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 80% 60% at 100% 0%, rgba(36,106,89,0.55), transparent 55%),
              radial-gradient(ellipse 50% 40% at 0% 100%, rgba(16,185,129,0.18), transparent 50%)
            `,
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            aria-hidden
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)
              `,
              backgroundSize: "24px 24px",
            }}
          />
          <SheetHeader className="relative space-y-2 p-0 text-left">
            <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300/90">
              <Sparkles className="h-3 w-3" />
              Owner · payment rails
            </p>
            <SheetTitle className="font-display text-xl tracking-tight text-white">
              How parents pay
            </SheetTitle>
            <SheetDescription className="max-w-[22rem] text-[13px] leading-relaxed text-white/65">
              Till for M-Pesa Express PIN prompts, and bank details for fee
              letters — only you can edit these.
            </SheetDescription>
          </SheetHeader>

          <div className="relative mt-4 flex items-center gap-2">
            {loading ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-white/70">
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking till…
              </span>
            ) : tillReady && custodyLine ? (
              <span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-1 text-[11px] text-emerald-100">
                <CheckCircle2 className="h-3 w-3 shrink-0" />
                <span className="truncate">{custodyLine}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/25 bg-amber-400/10 px-2.5 py-1 text-[11px] text-amber-100">
                Till not set yet
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-1 border-b border-[#1a4d42]/10 bg-white/70 px-3 py-2 dark:bg-[#0c1a17]/80">
          <RailTab
            active={rail === "mpesa"}
            onClick={() => setRail("mpesa")}
            icon={Smartphone}
            label="M-Pesa Express"
            hint="Till / paybill"
          />
          <RailTab
            active={rail === "bank"}
            onClick={() => setRail("bank")}
            icon={Landmark}
            label="Bank"
            hint="Fee letters"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="rounded-none border border-[#1a4d42]/12 bg-white p-4 shadow-[3px_3px_0_0_rgba(10,31,26,0.05)] dark:border-white/10 dark:bg-[#0c1a17]">
            {rail === "mpesa" ? (
              <CustodyMpesaSettingsPanel compact />
            ) : (
              <SchoolBankAccountsPanel compact />
            )}
          </div>

          <p className="mt-4 flex items-start gap-2 px-0.5 text-[11px] leading-relaxed text-[#1a4d42]/55 dark:text-white/40">
            <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Express money lands on your till (PartyB). Bank accounts only print
            on letters — they are not for STK.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function RailTab({
  active,
  onClick,
  icon: Icon,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Smartphone;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center gap-2 px-2.5 py-2 text-left transition-colors",
        active
          ? "border border-[#246a59]/25 bg-[#246a59]/[0.08] text-[#0a1f1a] dark:text-white"
          : "border border-transparent text-[#1a4d42]/55 hover:bg-[#1a4d42]/[0.04] dark:text-white/50",
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center border",
          active
            ? "border-[#246a59] bg-[#0a1f1a] text-white"
            : "border-[#1a4d42]/15 bg-[#f3f7f5] text-[#246a59] dark:border-white/15 dark:bg-[#071411]",
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0">
        <span className="block text-[12px] font-semibold leading-tight">{label}</span>
        <span className="block text-[10px] opacity-60">{hint}</span>
      </span>
    </button>
  );
}
