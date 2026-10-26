"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Landmark,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SupportDialog } from "@/components/chat/SupportDialog";
import { CustodyMpesaSettingsPanel } from "../../fees/components/CustodyMpesaSettingsPanel";
import { BankAccountsEditor } from "../../fees/components/BankAccountsEditor";
import { useMpesaCustody } from "../../fees/hooks/useMpesaCustody";
import { useTenantFeeLetterSettings } from "../../fees/hooks/useTenantFeeLetterSettings";
import {
  cleanBankAccounts,
  isBankAccountReady,
} from "../../fees/lib/bankAccounts";
import { findKenyaBankByName, formatBankPaybillLine } from "../../fees/lib/kenyaBanks";
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
  defaultRail = "bank",
  allowDuringOnboarding = false,
}: OwnerPaymentsDrawerProps) {
  const params = useParams();
  const subdomain = typeof params?.subdomain === "string" ? params.subdomain : "";
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [rail, setRail] = useState<Rail>(defaultRail);
  const [supportOpen, setSupportOpen] = useState(false);
  const isOwner = useMemo(() => readIsSchoolOwner(), []);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  const { destination, availability, loading: mpesaLoading } = useMpesaCustody();
  const {
    details,
    setLocalDetails,
    loading: banksLoading,
    saving,
    saveNow,
    error: banksError,
    loaded: banksLoaded,
  } = useTenantFeeLetterSettings(subdomain, { enabled: open });

  // Baseline captured when the saved banks arrive, so closing the drawer only
  // writes when something actually changed.
  const savedSnapshotRef = useRef<string | null>(null);
  const wasLoadingRef = useRef(false);

  useEffect(() => {
    if (banksLoading) {
      wasLoadingRef.current = true;
      return;
    }
    if (wasLoadingRef.current || savedSnapshotRef.current === null) {
      wasLoadingRef.current = false;
      savedSnapshotRef.current = JSON.stringify(
        cleanBankAccounts(details.paymentModes.bankAccounts),
      );
    }
  }, [banksLoading, details]);

  if (!isOwner && !allowDuringOnboarding) return null;

  const railOn = availability?.custodyProvider === "DARAJA";
  const tillReady = Boolean(destination && railOn);

  const accounts = details.paymentModes.bankAccounts;
  const cleanedAccounts = cleanBankAccounts(accounts);
  const readyCount = cleanedAccounts.filter(isBankAccountReady).length;
  const bankReady =
    cleanedAccounts.length > 0 && readyCount === cleanedAccounts.length;
  const primaryAccount = cleanedAccounts.find((account) => account.bankName);
  const primaryBank = primaryAccount
    ? findKenyaBankByName(primaryAccount.bankName)
    : null;
  const primaryPaybill = primaryAccount
    ? formatBankPaybillLine(primaryAccount.branch).replace(/^Paybill\s*/, "")
    : "";
  const primaryAccountNumber = primaryAccount?.accountNumber ?? "";

  const closeDrawer = () => {
    // Keep what the owner typed even when they close with X, Esc or Done.
    // Removing every bank stays an explicit Save action so a stray close
    // can't wipe the school's bank details.
    if (banksLoaded && !banksError && !saving) {
      const cleaned = cleanBankAccounts(accounts);
      const snapshot = JSON.stringify(cleaned);
      if (cleaned.length > 0 && snapshot !== savedSnapshotRef.current) {
        void saveNow({
          ...details,
          paymentModes: { ...details.paymentModes, bankAccounts: cleaned },
        })
          .then(() => {
            savedSnapshotRef.current = snapshot;
          })
          .catch(() => {});
      }
    }
    setOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setRail(defaultRail);
      setOpen(true);
      return;
    }
    closeDrawer();
  };

  const setAccounts = (next: typeof accounts) => {
    setLocalDetails({
      ...details,
      paymentModes: { ...details.paymentModes, bankAccounts: next },
    });
  };

  const handleSaveBanks = async () => {
    const cleaned = cleanBankAccounts(accounts);
    const next = {
      ...details,
      paymentModes: { ...details.paymentModes, bankAccounts: cleaned },
    };
    setLocalDetails(next);

    try {
      await saveNow(next);
      savedSnapshotRef.current = JSON.stringify(cleaned);
      const missingAccountNumber = cleaned.filter(
        (account) => account.bankName && !account.accountNumber,
      ).length;
      if (!cleaned.length) {
        toast.success("Bank removed", {
          description:
            "No bank will print on fee letters until you add one.",
        });
      } else if (missingAccountNumber) {
        toast.warning("Bank saved for fee letters", {
          description: `${missingAccountNumber} bank account still needs its account number before parents can pay.`,
        });
      } else {
        toast.success("Bank saved for fee letters", {
          description:
            "Parents now see this paybill and account number on every fee letter.",
        });
      }
    } catch (e) {
      toast.error("Could not save banks", {
        description: e instanceof Error ? e.message : "Save failed",
      });
    }
  };

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={handleOpenChange}
        direction="right"
      >
        {trigger ? <DrawerTrigger asChild>{trigger}</DrawerTrigger> : null}
        <DrawerContent className="flex h-full max-h-[100dvh] w-full flex-col border-l border-[#1a4d42]/12 bg-[#f8fbfa] p-0 data-[vaul-drawer-direction=right]:sm:max-w-[42rem] data-[vaul-drawer-direction=right]:xl:w-[44vw] data-[vaul-drawer-direction=right]:xl:max-w-[46rem]">
          <DrawerHeader className="relative shrink-0 border-b border-[#1a4d42]/10 bg-[#f8fbfa] px-4 pb-3 pt-4 pr-14 sm:px-5 sm:pt-5">
            <DrawerClose asChild>
              <button
                type="button"
                className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 sm:right-4 sm:top-4 lg:h-8 lg:w-8"
                aria-label="Close payment settings"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </DrawerClose>

            <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#246a59]">
              <Sparkles className="h-3.5 w-3.5" />
              Payment settings
            </p>
            <DrawerTitle className="mt-1 font-display text-[1.65rem] font-normal tracking-tight text-[#0a1f1a] sm:text-[1.8rem]">
              How parents pay
            </DrawerTitle>
            <DrawerDescription className="mt-0.5 max-w-xl text-[11px] leading-relaxed text-slate-500">
              {rail === "bank"
                ? "Pick the school bank once. We fill the paybill and print the account number on every fee letter."
                : "Set the M-Pesa paybill parents pay into. They get a request on their phone and pay with their PIN."}
            </DrawerDescription>

            <div
              className="mt-3 grid grid-cols-2 gap-2"
              role="tablist"
              aria-label="How parents pay"
            >
              <RailCard
                active={rail === "bank"}
                onClick={() => setRail("bank")}
                icon={Landmark}
                label="Bank"
                hint={
                  cleanedAccounts.length === 0
                    ? "Prints on fee letters"
                    : bankReady
                      ? `Ready · ${readyCount} account${readyCount === 1 ? "" : "s"}`
                      : cleanedAccounts.length === 1
                        ? "Add account number"
                        : `${readyCount} of ${cleanedAccounts.length} ready`
                }
              />
              <RailCard
                active={rail === "mpesa"}
                onClick={() => setRail("mpesa")}
                icon={Smartphone}
                label="M-Pesa"
                hint={
                  mpesaLoading
                    ? "Checking…"
                    : railOn
                      ? tillReady
                        ? "Ready · phone request"
                        : "Paybill not set"
                      : "Not switched on"
                }
              />
            </div>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5">
            {rail === "bank" ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200/80 bg-white text-[10px]">
                  <SummaryCell
                    label="Prints on"
                    value="Fee letters"
                    hint="Every letter + invoice"
                  />
                  <SummaryCell
                    label="Bank accounts"
                    value={String(cleanedAccounts.length)}
                    hint={
                      cleanedAccounts.length === 0
                        ? "None added yet"
                        : cleanedAccounts.length === 1
                          ? "One account"
                          : "Shared on letters"
                    }
                    className="border-l border-slate-100"
                  />
                  <SummaryCell
                    label="Ready"
                    value={
                      cleanedAccounts.length === 0
                        ? "—"
                        : bankReady
                          ? "Yes"
                          : `${readyCount} of ${cleanedAccounts.length}`
                    }
                    hint={
                      cleanedAccounts.length === 0
                        ? "Add a bank"
                        : bankReady
                          ? "Parents can pay"
                          : "Needs details"
                    }
                    tone={
                      cleanedAccounts.length === 0
                        ? "slate"
                        : bankReady
                          ? "emerald"
                          : "amber"
                    }
                    className="border-l border-slate-100"
                  />
                </div>

                <SectionCard
                  icon={Landmark}
                  title="School bank"
                  description="Parents pay into this bank. The account number is the reference."
                  action={
                    cleanedAccounts.length ? (
                      <span className="rounded-full bg-[#e8f2ef] px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-[#1a4d42]/70">
                        {cleanedAccounts.length} account
                        {cleanedAccounts.length === 1 ? "" : "s"}
                      </span>
                    ) : null
                  }
                >
                  <BankAccountsEditor
                    accounts={accounts}
                    onChange={setAccounts}
                    loading={banksLoading && !banksLoaded}
                    error={banksError}
                    focusAccountAfterPick
                  />
                </SectionCard>

                <SectionCard
                  icon={Wallet}
                  title="How a parent pays"
                  description="No phone prompt and no cash handling."
                >
                  <ol className="space-y-1.5">
                    <PayStep
                      step="1"
                      title="Open M-Pesa or the bank app"
                      hint="M-Pesa → Lipa na M-Pesa → Pay Bill"
                    />
                    <PayStep
                      step="2"
                      title={
                        primaryPaybill
                          ? `Business no. ${primaryPaybill}`
                          : "Business no. from the letter"
                      }
                      hint={
                        primaryBank
                          ? `${primaryBank.name}`
                          : primaryAccount?.bankName || "Pick a bank above to fill this in"
                      }
                    />
                    <PayStep
                      step="3"
                      title={
                        primaryAccountNumber
                          ? `Account no. ${primaryAccountNumber}`
                          : "Account no. from the letter"
                      }
                      hint="The school account number is the reference."
                    />
                  </ol>
                </SectionCard>

                <p className="flex items-start gap-2 px-1 pb-1 text-[10px] leading-relaxed text-slate-400">
                  <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Bank payments do not ping a phone. Parents pay the paybill from
                  any bank app or agent and use the account number as the
                  reference.
                </p>
              </div>
            ) : mpesaLoading ? (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-6 text-[12px] text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking M-Pesa settings…
              </div>
            ) : railOn ? (
              <div className="space-y-3">
                <SectionCard
                  icon={Smartphone}
                  title="M-Pesa paybill"
                  description="Parents get a request on their phone and pay with their PIN."
                  action={
                    tillReady ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-emerald-800">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        Live
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-amber-800">
                        Not set
                      </span>
                    )
                  }
                >
                  <CustodyMpesaSettingsPanel compact />
                </SectionCard>

                <p className="flex items-start gap-2 px-1 text-[10px] leading-relaxed text-slate-400">
                  <Landmark className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  M-Pesa pays into the same school bank you picked under Bank.
                </p>
              </div>
            ) : (
              <MpesaUnavailable
                onSupport={() => setSupportOpen(true)}
                onBank={() => setRail("bank")}
              />
            )}
          </div>

          <DrawerFooter className="shrink-0 border-t border-[#1a4d42]/10 bg-white px-4 py-3">
            <div className="flex w-full items-center gap-2">
              <p className="hidden flex-1 items-center gap-1.5 text-[10px] text-slate-400 sm:flex">
                <ShieldCheck className="h-3 w-3" />
                Only the school owner can change these.
              </p>

              {rail === "bank" ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 flex-1 text-xs sm:h-9 sm:flex-none sm:px-5"
                    onClick={closeDrawer}
                  >
                    Done
                  </Button>
                  <Button
                    type="button"
                    className="h-11 flex-[1.35] gap-1.5 bg-[#0a1f1a] text-xs text-white hover:bg-[#143b31] sm:h-9 sm:flex-none sm:px-5"
                    onClick={() => void handleSaveBanks()}
                    disabled={saving || banksLoading}
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    {saving ? "Saving…" : "Save for fee letters"}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1 text-xs sm:ml-auto sm:h-9 sm:flex-none sm:px-5"
                  onClick={closeDrawer}
                >
                  Done
                </Button>
              )}
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

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

function RailCard({
  active,
  onClick,
  icon: Icon,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Landmark;
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
        "flex min-h-11 cursor-pointer items-start gap-2 rounded-xl border p-2.5 text-left transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246a59]/35",
        active
          ? "border-[#246a59] bg-[#e8f2ef] ring-1 ring-[#246a59]/20"
          : "border-slate-200 bg-white hover:border-[#246a59]/30 hover:bg-[#f8fbfa]",
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
          active
            ? "bg-[#0a1f1a] text-white"
            : "bg-[#eef7f1] text-[#1a4d42]",
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 text-[11.5px] font-semibold leading-tight text-[#0a1f1a]">
          {label}
          {active ? <Check className="h-3 w-3 text-[#246a59]" /> : null}
        </span>
        <span className="mt-0.5 block truncate text-[9px] text-slate-500">
          {hint}
        </span>
      </span>
    </button>
  );
}

function SummaryCell({
  label,
  value,
  hint,
  tone = "slate",
  className,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "slate" | "emerald" | "amber";
  className?: string;
}) {
  return (
    <div className={cn("px-2.5 py-2", className)}>
      <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 truncate text-[11px] font-semibold",
          tone === "emerald" && "text-emerald-800",
          tone === "amber" && "text-amber-800",
          tone === "slate" && "text-slate-900",
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 truncate text-[8.5px] text-slate-400">{hint}</p>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  description,
  action,
  children,
}: {
  icon: typeof Landmark;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-3.5 py-2.5">
        <div className="flex min-w-0 items-start gap-2">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#e8f2ef] text-[#1a4d42]">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-slate-900">{title}</h3>
            {description ? (
              <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-3.5">{children}</div>
    </section>
  );
}

function PayStep({
  step,
  title,
  hint,
}: {
  step: string;
  title: string;
  hint: string;
}) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e8f2ef] text-[9px] font-bold text-[#1a4d42]">
        {step}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[11px] font-semibold text-[#0a1f1a]">
          {title}
        </span>
        <span className="block truncate text-[9px] text-slate-400">{hint}</span>
      </span>
    </li>
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
      <SectionCard
        icon={Landmark}
        title="Set the school bank first"
        description="Phone requests are not switched on yet — parents can still pay from the bank on the letter."
      >
        <Button
          type="button"
          size="sm"
          className="h-10 w-full gap-1.5 bg-[#0a1f1a] text-xs text-white hover:bg-[#246a59]"
          onClick={onBank}
        >
          Choose the bank
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </SectionCard>

      <SectionCard
        icon={MessageSquare}
        title="Want a request on the parent’s phone?"
        description="Ask SQUL to switch M-Pesa on, then add the school paybill and send a KES 1 test."
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 w-full gap-1.5 text-xs"
          onClick={onSupport}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Message SQUL support
        </Button>
      </SectionCard>
    </div>
  );
}
