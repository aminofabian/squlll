"use client";

import { useParams, useSearchParams } from "next/navigation";
import { CheckCircle2, Copy, Mail, MessageCircle, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLayoutSchoolName } from "@/lib/schoolLogo";

function kes(value: number) {
  return `KES ${Math.round(value).toLocaleString("en-KE")}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function PublicReceiptPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subdomain =
    typeof params?.subdomain === "string" ? params.subdomain : "school";

  const ref = searchParams.get("ref") ?? "";
  const student = searchParams.get("student") ?? "";
  const admission = searchParams.get("admission") ?? "";
  const className = searchParams.get("class") ?? "";
  const amount = Number(searchParams.get("amount") ?? 0);
  const date = searchParams.get("date") ?? "";
  const phone = searchParams.get("phone") ?? "";
  const schoolName = getLayoutSchoolName(subdomain);
  const valid = Boolean(ref && student && amount > 0);

  return (
    <main className="min-h-screen bg-[#f3f7f5] px-3 py-8 print:bg-white print:p-0">
      <div className="mx-auto w-full max-w-lg border border-[#1a4d42]/15 bg-white shadow-[4px_4px_0_0_rgba(10,31,26,0.08)] print:border-0 print:shadow-none">
        <div className="border-b border-[#1a4d42]/12 bg-[#0a1f1a] px-5 py-5 text-white print:bg-white print:text-[#0a1f1a]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300/80 print:text-[#246a59]">
            {schoolName}
          </p>
          <h1 className="mt-1 font-display text-2xl tracking-tight">
            Fee payment receipt
          </h1>
          <p className="mt-1 text-[11px] text-white/55 print:text-[#1a4d42]/55">
            Keep this receipt for your records.
          </p>
        </div>

        {valid ? (
          <>
            <div className="flex items-center gap-3 border-b border-[#1a4d42]/10 bg-emerald-50 px-5 py-4 print:bg-white">
              <CheckCircle2 className="h-5 w-5 text-emerald-700" />
              <div>
                <p className="text-sm font-semibold text-emerald-950">
                  Payment received
                </p>
                <p className="text-[11px] text-emerald-900/70">
                  Fees have been updated on the school account.
                </p>
              </div>
            </div>

            <dl className="divide-y divide-[#1a4d42]/10 px-5">
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-[11px] text-[#1a4d42]/50">Amount paid</dt>
                <dd className="text-right text-lg font-semibold tabular-nums text-[#0a1f1a]">
                  {kes(amount)}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-[11px] text-[#1a4d42]/50">Student</dt>
                <dd className="text-right text-sm font-medium text-[#0a1f1a]">
                  {student}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-[11px] text-[#1a4d42]/50">Admission no.</dt>
                <dd className="text-right font-mono text-[12px] text-[#0a1f1a]">
                  {admission || "—"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-[11px] text-[#1a4d42]/50">Class</dt>
                <dd className="text-right text-sm text-[#0a1f1a]">
                  {className || "—"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-[11px] text-[#1a4d42]/50">M-Pesa reference</dt>
                <dd className="text-right font-mono text-[12px] font-medium text-[#0a1f1a]">
                  {ref}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="text-[11px] text-[#1a4d42]/50">Date</dt>
                <dd className="text-right text-sm text-[#0a1f1a]">
                  {formatDate(date)}
                </dd>
              </div>
              {phone ? (
                <div className="flex items-start justify-between gap-4 py-3">
                  <dt className="text-[11px] text-[#1a4d42]/50">Paid from</dt>
                  <dd className="text-right text-sm text-[#0a1f1a]">{phone}</dd>
                </div>
              ) : null}
            </dl>

            <div className="border-t border-[#1a4d42]/10 px-5 py-4 print:hidden">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 gap-1.5 border-[#1a4d42]/15 text-xs"
                  onClick={() => {
                    const url = window.location.href;
                    const text = `${student} — ${kes(amount)} paid. M-Pesa ref ${ref}. View receipt: ${url}`;
                    if (typeof navigator !== "undefined" && navigator.clipboard) {
                      void navigator.clipboard.writeText(url);
                    }
                    window.open(
                      `https://wa.me/?text=${encodeURIComponent(text)}`,
                      "_blank",
                      "noopener,noreferrer",
                    );
                  }}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 gap-1.5 border-[#1a4d42]/15 text-xs"
                  onClick={() => {
                    window.location.href = `mailto:?subject=${encodeURIComponent(
                      `Fee receipt — ${student}`,
                    )}&body=${encodeURIComponent(
                      `${student} paid ${kes(amount)}. M-Pesa reference ${ref}. View receipt: ${window.location.href}`,
                    )}`;
                  }}
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 gap-1.5 border-[#1a4d42]/15 text-xs"
                  onClick={() => {
                    if (navigator.clipboard) {
                      void navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy link
                </Button>
                <Button
                  type="button"
                  className="h-9 gap-1.5 bg-[#0a1f1a] text-white hover:bg-[#246a59]"
                  onClick={() => window.print()}
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </Button>
              </div>
              <p className="mt-3 text-center text-[10px] leading-relaxed text-[#1a4d42]/40">
                Issued by {schoolName}. For questions, contact the school office
                through the SQUL portal.
              </p>
            </div>
          </>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold text-[#0a1f1a]">
              This receipt link is incomplete
            </p>
            <p className="mt-1 text-xs text-[#1a4d42]/55">
              Ask the school office to resend the payment receipt.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
