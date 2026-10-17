"use client";

import Link from "next/link";
import { ExternalLink, Globe, Pencil } from "lucide-react";

interface DashboardWebsiteCardProps {
  subdomain: string;
  schoolName?: string;
}

function prettyName(subdomain: string): string {
  return subdomain
    .replace(/-/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "S"
  );
}

export function DashboardWebsiteCard({
  subdomain,
  schoolName,
}: DashboardWebsiteCardProps) {
  const name = schoolName?.trim() || prettyName(subdomain);

  return (
    <section className="overflow-hidden border border-[#1a4d42]/12 bg-white shadow-[3px_3px_0_0_rgba(10,31,26,0.05)] dark:border-white/10 dark:bg-[#0c1a17]">
      <div className="flex items-center justify-between gap-2 border-b border-[#1a4d42]/10 bg-[#f8fbfa] px-3 py-2 dark:border-white/10 dark:bg-[#071411]">
        <div className="flex min-w-0 items-center gap-2">
          <Globe className="h-3.5 w-3.5 shrink-0 text-[#246a59]" />
          <h2 className="truncate font-display text-base tracking-tight text-[#0a1f1a] dark:text-white">
            School website
          </h2>
        </div>
        <Link
          href="/domains"
          className="shrink-0 text-[10px] font-medium text-[#1a4d42]/50 transition-colors hover:text-[#0a1f1a] dark:text-white/40 dark:hover:text-white"
        >
          Custom domain
        </Link>
      </div>

      <div className="p-3">
        <div className="relative overflow-hidden border border-[#1a4d42]/10 bg-[#0a1f1a]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 70% 80% at 100% 0%, rgba(200,169,106,0.55), transparent 55%), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "auto, 32px 32px, 32px 32px",
            }}
          />
          <div className="relative flex items-center gap-3 px-3.5 py-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/15 bg-white/[0.04] font-display text-lg tracking-[0.08em] text-[#e6c98e]">
              {initials(name)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-lg leading-none tracking-tight text-white">
                {name}
              </p>
              <p className="mt-1.5 truncate text-[9px] font-semibold uppercase tracking-[0.18em] text-[#e6c98e]">
                Public school website
              </p>
            </div>
          </div>
          <div className="relative flex items-center justify-between gap-2 border-t border-white/10 px-3.5 py-1.5 text-[9px] uppercase tracking-[0.16em] text-white/50">
            <span className="truncate">Admissions, academics &amp; campus life</span>
            <span className="shrink-0 text-[#e6c98e]/80">Live</span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 border border-[#1a4d42]/15 bg-white px-3 text-[11px] font-medium text-[#0a1f1a] transition-colors hover:border-[#246a59]/40 hover:bg-[#f3f7f5] dark:border-white/15 dark:bg-[#0c1a17] dark:text-white/80 dark:hover:bg-white/5"
          >
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
            View site
          </Link>
          <Link
            href="/website"
            className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 bg-[#0a1f1a] px-3 text-[11px] font-medium text-white transition-colors hover:bg-[#246a59] dark:bg-emerald-300 dark:text-[#071411] dark:hover:bg-emerald-200"
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
            Edit website
          </Link>
        </div>
      </div>
    </section>
  );
}
