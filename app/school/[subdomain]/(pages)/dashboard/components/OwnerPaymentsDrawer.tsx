"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Landmark,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SupportDialog } from "@/components/chat/SupportDialog";
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
  /** Show even if role cookie is missing during first-run onboarding */
  allowDuringOnboarding?: boolean;
};

export function OwnerPaymentsDrawer({
  open: controlledOpen,
  onOpenChange,
  trigger,
  defaultRail = "mpesa",
  allowDuringOnboarding = false,
}: OwnerPaymentsDrawerProps) {
  const params = useParams();
  const subdomain = typeof params?.subdomain === "string" ? params.subdomain : "";
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [rail, setRail] = useState<Rail>(defaultRail);
  const [supportOpen, setSupportOpen] = useState(false);
  const isOwner = useMemo(() => readIsSchoolOwner(), []);
  const { destination, availability, loading, custodyLine } = useMpesaCustody();

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  if (!isOwner && !allowDuringOnboarding) return null;

  const railOn = availability?.custodyProvider === "DARAJA";
  const tillReady = Boolean(destination && railOn);

  const handleOpenChange = (next: boolean) => {
    if (next) setRail(defaultRail);
    setOpen(next);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        {trigger ? <SheetTrigger asChild>{trigger}</SheetTrigger> : null}
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 overflow-hidden border-l border-[#1a4d42]/12 bg-[#f8fbfa] p-0 dark:border-white/10 dark:bg-[#071411]"
        >
          <SheetHeader className="space-y-1 border-b border-[#1a4d42]/12 bg-white px-5 pb-4 pt-5 pr-12 text-left dark:border-white/10 dark:bg-[#0c1a17]">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#246a59]">
              <Sparkles className="h-3 w-3" />
              Payment settings
            </p>
            <SheetTitle className="font-display text-xl tracking-tight text-[#0a1f1a] dark:text-white">
              How parents pay
            </SheetTitle>
            <SheetDescription className="max-w-[26rem] text-[12px] leading-relaxed text-[#1a4d42]/60 dark:text-white/50">
              One place for the school&apos;s M-Pesa payment account and the bank details printed on fee letters. Parents pay from their phone — no cash handling.
            </SheetDescription>
            <div className="pt-1.5">
              {rail === "bank" ? (
                <span className="inline-flex items-center gap-1.5 border border-[#1a4d42]/15 bg-[#f8fbfa] px-2 py-1 text-[10px] font-medium text-[#1a4d42]/65 dark:border-white/10 dark:bg-[#071411] dark:text-white/55">
                  <Landmark className="h-3 w-3" />
                  Shown on fee letters
                </span>
              ) : loading ? (
                <span className="inline-flex items-center gap-1.5 border border-[#1a4d42]/12 bg-[#f8fbfa] px-2 py-1 text-[10px] font-medium text-[#1a4d42]/60 dark:border-white/10 dark:bg-[#071411]">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Checking payment rail…
                </span>
              ) : tillReady && custodyLine ? (
                <span className="inline-flex max-w-full items-center gap-1.5 border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-800">
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  <span className="truncate">{custodyLine}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-900">
                  <span className="h-1.5 w-1.5 bg-amber-500" />
                  {railOn ? "Till not set yet" : "M-Pesa not set up yet"}
                </span>
              )}
            </div>
          </SheetHeader>

          <div
            className="grid shrink-0 grid-cols-2 gap-1 border-b border-[#1a4d42]/10 bg-[#f8fbfa] px-3 py-2 dark:border-white/10 dark:bg-[#071411]"
            role="tablist"
            aria-label="Payment rail"
          >
            <RailTab
              active={rail === "mpesa"}
              onClick={() => setRail("mpesa")}
              icon={Smartphone}
              label="M-Pesa"
              hint={railOn ? "Phone request" : "Not on yet"}
            />
            <RailTab
              active={rail === "bank"}
              onClick={() => setRail("bank")}
              icon={Landmark}
              label="Bank"
              hint="On fee letters"
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            {rail === "mpesa" ? (
              loading ? (
                <div className="flex items-center gap-2 border border-[#1a4d42]/12 bg-white px-4 py-6 text-sm text-[#1a4d42]/60">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking M-Pesa settings…
                </div>
              ) : railOn ? (
                <div className="border border-[#1a4d42]/12 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0c1a17]">
                  <CustodyMpesaSettingsPanel compact />
                </div>
              ) : (
                <MpesaUnavailable
                  onSupport={() => setSupportOpen(true)}
                  onBank={() => setRail("bank")}
                />
              )
            ) : (
              <div className="border border-[#1a4d42]/12 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0c1a17]">
                <SchoolBankAccountsPanel compact />
              </div>
            )}

            <p className="mt-4 flex items-start gap-2 px-1 text-[10.5px] leading-relaxed text-[#1a4d42]/45 dark:text-white/40">
              <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Bank payments do not ping a phone. Parents pay the paybill on the letter and use the account number as the reference.
            </p>
          </div>

          <SheetFooter className="flex-row items-center justify-between gap-3 border-t border-[#1a4d42]/12 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#0c1a17]">
            <p className="flex items-center gap-1.5 text-[10px] text-[#1a4d42]/45 dark:text-white/40">
              <ShieldCheck className="h-3 w-3" />
              Only the school owner can change these.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 border-[#1a4d42]/15 px-3 text-xs"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {supportOpen ? (
        <SupportDialog
          open={supportOpen}
          onOpenChange={setSupportOpen}
          subdomain={subdomain}
        />
      ) : null}
    </>
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
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex min-w-0 cursor-pointer items-center gap-2 border px-2.5 py-2 text-left transition-all active:scale-[0.99]",
        active
          ? "border-[#246a59]/30 bg-white text-[#0a1f1a] shadow-sm dark:bg-[#0c1a17] dark:text-white"
          : "border-transparent text-[#1a4d42]/55 hover:bg-white/70 dark:text-white/45 dark:hover:bg-white/5",
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
        <span className="block truncate text-[11.5px] font-semibold leading-tight">
          {label}
        </span>
        <span className="block truncate text-[9.5px] opacity-60">{hint}</span>
      </span>
    </button>
  );
}

function MpesaUnavailable({
  onSupport,
  onBank,
}: {
  onSupport: () => void;
  onBank: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="border border-[#1a4d42]/12 bg-white p-4 dark:border-white/10 dark:bg-[#0c1a17]">
        <p className="text-[13px] font-semibold text-[#0a1f1a] dark:text-white">
          Set the school bank now
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-[#1a4d42]/65 dark:text-white/55">
          Phone requests are not switched on yet. Parents can still pay from the
          bank printed on the fee letter.
        </p>
        <Button
          type="button"
          size="sm"
          className="mt-3 h-9 w-full gap-1.5 bg-[#0a1f1a] text-xs text-white hover:bg-[#246a59]"
          onClick={onBank}
        >
          Choose the bank
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-[12px] font-semibold text-amber-950">
          Want a payment request on the parent&apos;s phone?
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-amber-900/80">
          Ask SQUL to switch M-Pesa on. Then add the school bank paybill (for example NCBA 880100) and send a KES 1 test.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 h-8 gap-1.5 border-amber-300 bg-white text-xs text-amber-950 hover:bg-amber-100"
          onClick={onSupport}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Message SQUL support
        </Button>
      </div>
    </div>
  );
}
