"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Landmark,
  Loader2,
  MessageSquare,
  Smartphone,
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
import { findKenyaBankByName, bankShortName, formatBankPaybillLine } from "../../fees/lib/kenyaBanks";
import type { BankAccount } from "../../fees/types";
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
  const [previewIndex, setPreviewIndex] = useState(0);
  const handleActiveIndex = useCallback((index: number) => {
    setPreviewIndex(index);
  }, []);
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
  let savedIsEmpty = true;
  try {
    const parsed = JSON.parse(savedSnapshotRef.current ?? "[]") as unknown;
    savedIsEmpty = !Array.isArray(parsed) || parsed.length === 0;
  } catch {
    savedIsEmpty = true;
  }
  const canSaveBanks =
    readyCount > 0 || (cleanedAccounts.length === 0 && !savedIsEmpty);
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
        <DrawerContent className="flex h-full max-h-[100dvh] w-full flex-col border-l border-[#1a4d42]/10 bg-[#f6f8f6] p-0 data-[vaul-drawer-direction=right]:sm:max-w-[28rem]">
          <DrawerHeader className="relative shrink-0 bg-[#f6f8f6] px-4 pb-2 pt-4 pr-14 sm:px-5 sm:pt-5">
            <DrawerClose asChild>
              <button
                type="button"
                className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 sm:right-4 sm:top-4 lg:h-8 lg:w-8"
                aria-label="Close payment settings"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </DrawerClose>

            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6d7f78]">
              Payment settings
            </p>
            <DrawerTitle className="mt-1 font-display text-[1.85rem] font-normal tracking-tight text-[#0a1f1a]">
              How parents pay
            </DrawerTitle>
            <DrawerDescription className="mt-1 max-w-sm text-[13px] leading-relaxed text-slate-500">
              Tell us where fees should go. We print it on every fee letter.
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
                    ? "Not set up"
                    : bankReady
                      ? `${readyCount} ready`
                      : `${readyCount} of ${cleanedAccounts.length} ready`
                }
                tone={
                  cleanedAccounts.length === 0
                    ? "slate"
                    : bankReady
                      ? "emerald"
                      : "amber"
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
                        ? "Ready"
                        : "Paybill not set"
                      : "Not set up"
                }
                tone={railOn && tillReady ? "emerald" : railOn ? "amber" : "slate"}
              />
            </div>
            <p className="mt-3 text-[13px] text-slate-600">
              Turn on one or both. Parents pick whichever suits them.
            </p>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5">
            {rail === "bank" ? (
              <div className="space-y-4">
                <BankAccountsEditor
                  accounts={accounts}
                  onChange={setAccounts}
                  loading={banksLoading && !banksLoaded}
                  error={banksError}
                  focusAccountAfterPick
                  presentation="sheet"
                  onActiveIndex={handleActiveIndex}
                />
                <FeeLetterPreview
                  account={accounts[previewIndex] ?? accounts[0] ?? null}
                />
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

                <p className="px-1 text-[12px] leading-relaxed text-slate-500">
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

          <DrawerFooter className="shrink-0 border-t border-[#e4ebe7] bg-[#f6f8f6] px-4 py-3">
            {rail === "bank" ? (
              <div className="w-full space-y-2.5">
                {!canSaveBanks ? (
                  <p className="text-[13px] text-slate-600">
                    {cleanedAccounts.length === 0
                      ? "Add a bank and its account number to save."
                      : "Add at least one account number to save."}
                  </p>
                ) : null}
                <div className="flex w-full items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl border-[#d5ddd8] bg-white px-5 text-[13px] text-[#0a1f1a]"
                    onClick={closeDrawer}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="h-11 flex-1 rounded-xl bg-[#0a1f1a] text-[13px] text-white hover:bg-[#143b31] disabled:bg-[#e4eee9] disabled:text-[#8aa097] disabled:opacity-100"
                    onClick={() => void handleSaveBanks()}
                    disabled={saving || banksLoading || !canSaveBanks}
                  >
                    {saving ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : null}
                    {saving ? "Saving…" : "Save to fee letters"}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-xl border-[#d5ddd8] bg-white text-[13px]"
                onClick={closeDrawer}
              >
                Done
              </Button>
            )}
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
  tone,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Landmark;
  label: string;
  hint: string;
  tone: "slate" | "amber" | "emerald";
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex min-h-[4.25rem] cursor-pointer items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#246a59]/35",
        active
          ? "border-[#c5ddd0] bg-[#e7f3ec]"
          : "border-[#e4ebe7] bg-white hover:border-[#c5ddd0]",
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e4ebe7] bg-white text-[#1a4d42] shadow-[0_1px_0_rgba(10,31,26,0.04)]">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold leading-tight text-[#0a1f1a]">
          {label}
        </span>
        <span className="mt-1 flex items-center gap-1.5 text-[12px] text-slate-500">
          <span
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              tone === "amber" && "bg-amber-500",
              tone === "emerald" && "bg-emerald-500",
              tone === "slate" && "bg-slate-300",
            )}
          />
          <span className="truncate">{hint}</span>
        </span>
      </span>
    </button>
  );
}

function FeeLetterPreview({ account }: { account: BankAccount | null }) {
  const bank = account?.bankName ? findKenyaBankByName(account.bankName) : null;
  const title = bank
    ? bankShortName(bank)
    : account?.bankName?.trim() || "your bank";
  const paybill = formatBankPaybillLine(account?.branch).replace(/^Paybill\s*/, "");
  const accountNo = account?.accountNumber?.trim() ?? "";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          On the fee letter
        </p>
        <p className="text-[12px] text-slate-400">Updates as you type</p>
      </div>
      <div className="rounded-2xl border border-[#e3ebe6] bg-white px-4 py-3.5">
        <p className="text-[15px] font-semibold text-[#0a1f1a]">
          Pay school fees via {title}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
              Paybill
            </p>
            <p className="mt-1 font-mono text-[18px] font-semibold tracking-wide text-[#0a1f1a]">
              {paybill || "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
              Account no.
            </p>
            {accountNo ? (
              <p className="mt-1 font-mono text-[18px] font-semibold tracking-wide text-[#0a1f1a]">
                {accountNo}
              </p>
            ) : (
              <span className="mt-1.5 inline-flex rounded-lg border border-dashed border-orange-300 px-2 py-1 text-[12px] font-medium text-orange-700">
                Add account no.
              </span>
            )}
          </div>
        </div>
      </div>
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
