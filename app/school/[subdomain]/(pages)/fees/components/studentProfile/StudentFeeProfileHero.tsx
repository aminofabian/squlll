"use client";

import { cn } from "@/lib/utils";
import { FEES_BRAND } from "../../lib/fees-ui";

type HeroStatus = "paid" | "partial" | "owing" | "clear";

function resolveStatus(balance: number, paid: number): HeroStatus {
  if (balance <= 0 && paid > 0) return "paid";
  if (balance > 0 && paid > 0) return "partial";
  if (balance > 0) return "owing";
  return "clear";
}

const STATUS_COPY: Record<
  HeroStatus,
  { label: string; hint: string; accent: string }
> = {
  paid: {
    label: "Cleared",
    hint: "All fees settled for now",
    accent: "from-emerald-400/30 to-emerald-600/10",
  },
  partial: {
    label: "In progress",
    hint: "Part paid — balance remains",
    accent: "from-amber-400/25 to-amber-600/5",
  },
  owing: {
    label: "Outstanding",
    hint: "No payments recorded yet",
    accent: "from-rose-400/20 to-rose-600/5",
  },
  clear: {
    label: "No fees",
    hint: "Nothing assigned on this profile",
    accent: "from-white/10 to-white/5",
  },
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function formatKesCompact(amount: number) {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 10_000) return `${Math.round(amount / 1_000)}K`;
  return amount.toLocaleString("en-KE");
}

export function StudentFeeProfileHero({
  name,
  admissionNumber,
  classLabel,
  totalOwed,
  totalPaid,
  balance,
}: {
  name: string;
  admissionNumber: string;
  classLabel: string;
  totalOwed: number;
  totalPaid: number;
  balance: number;
}) {
  const status = resolveStatus(balance, totalPaid);
  const meta = STATUS_COPY[status];
  const paidPct =
    totalOwed > 0 ? Math.min(100, Math.round((totalPaid / totalOwed) * 100)) : 0;
  const ringRadius = 36;
  const circumference = 2 * Math.PI * ringRadius;
  const strokeDash = (paidPct / 100) * circumference;

  return (
    <div
      className="relative shrink-0 overflow-hidden text-white"
      style={{
        background: `linear-gradient(145deg, ${FEES_BRAND.primaryDark} 0%, ${FEES_BRAND.primary} 42%, #2f8f78 100%)`,
      }}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80",
          meta.accent,
        )}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-12 -top-10 h-40 w-40 rounded-full bg-white/[0.07]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-8 h-36 w-36 rounded-full bg-black/[0.08]"
        aria-hidden
      />

      <div className="relative px-4 pb-5 pt-4">
        <div className="flex items-start gap-3">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/15 text-lg font-bold tracking-tight shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm"
            aria-hidden
          >
            {initials(name)}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="truncate text-lg font-bold leading-tight tracking-tight">
              {name}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-white/75">
              {admissionNumber}
              {classLabel ? ` · ${classLabel}` : ""}
            </p>
            <span className="mt-2 inline-flex rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              {meta.label}
            </span>
          </div>

          <div className="relative shrink-0" aria-label={`${paidPct}% of fees collected`}>
            <svg width="88" height="88" className="-rotate-90">
              <circle
                cx="44"
                cy="44"
                r={ringRadius}
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="6"
              />
              <circle
                cx="44"
                cy="44"
                r={ringRadius}
                fill="none"
                stroke="rgba(167,243,208,0.95)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${strokeDash} ${circumference}`}
                className="transition-[stroke-dasharray] duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold tabular-nums leading-none">
                {paidPct}%
              </span>
              <span className="text-[9px] font-medium uppercase tracking-wide text-white/70">
                paid
              </span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-white/80">{meta.hint}</p>

        <div className="mt-4 rounded-2xl border border-white/15 bg-black/10 p-3 backdrop-blur-sm">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">
                Balance due
              </p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums tracking-tight">
                KES {formatKesCompact(balance)}
              </p>
            </div>
            <div className="text-right text-[11px] text-white/75">
              <p>
                <span className="font-semibold text-emerald-200">
                  KES {formatKesCompact(totalPaid)}
                </span>{" "}
                collected
              </p>
              <p className="mt-0.5">
                of KES {formatKesCompact(totalOwed)} assessed
              </p>
            </div>
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-white/15"
            role="progressbar"
            aria-valuenow={paidPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-emerald-400 shadow-[0_0_12px_rgba(110,231,183,0.45)] transition-all duration-700"
              style={{ width: `${paidPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
