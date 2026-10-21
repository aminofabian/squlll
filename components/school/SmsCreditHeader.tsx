"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, MessageSquareText, Plus } from "lucide-react";
import { SmsTopUpDialog } from "@/components/school/SmsTopUpDialog";
import { cn } from "@/lib/utils";
import {
  fetchSmsCreditBalance,
  type SmsCreditBalance,
} from "@/lib/school/smsCreditsApi";

/**
 * Always-visible SMS balance and top-up entry point in the school header.
 * Refreshes periodically so a campaign send is reflected without a reload.
 */
export function SmsCreditHeader() {
  const [balance, setBalance] = useState<SmsCreditBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setBalance(await fetchSmsCreditBalance());
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async balance fetch owns the loading state
    void load();
    const timer = setInterval(() => void load(), 60_000);
    return () => clearInterval(timer);
  }, [load]);

  if (failed && !balance) return null;

  const available = balance?.available ?? 0;
  const low = balance?.lowBalance || available === 0;
  const label = loading && !balance ? "—" : available.toLocaleString();

  return (
    <>
    <button
      type="button"
      onClick={() => setTopUpOpen(true)}
      title={`${label} SMS credits available — click to top up`}
      aria-label={`${label} SMS credits available. Top up.`}
      className={cn(
        "group flex h-8 items-center gap-1.5 border px-2 text-xs font-semibold transition-colors",
        low
          ? "border-amber-300/70 bg-amber-50 text-amber-800 hover:border-amber-400 hover:bg-amber-100 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200"
          : "border-[#246a59]/20 bg-[#246a59]/8 text-[#1a4d42] hover:border-[#246a59]/45 hover:bg-[#246a59]/12 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100",
      )}
    >
      {loading && !balance ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <MessageSquareText className="h-3.5 w-3.5" />
      )}
      <span className="tabular-nums">{label}</span>
      <span className="hidden text-[10px] font-medium opacity-70 sm:inline">SMS</span>
      <span
        className={cn(
          "ml-0.5 flex items-center gap-0.5 border-l pl-1.5 text-[10px] font-semibold",
          low
            ? "border-amber-400/40"
            : "border-[#246a59]/20 dark:border-emerald-400/20",
        )}
      >
        <Plus className="h-3 w-3" />
        <span className="hidden md:inline">Top up</span>
      </span>
    </button>
    <SmsTopUpDialog
      open={topUpOpen}
      onOpenChange={setTopUpOpen}
      initialBalance={balance}
      onSuccess={(next) => {
        if (next) setBalance(next);
        else void load();
      }}
    />
    </>
  );
}
