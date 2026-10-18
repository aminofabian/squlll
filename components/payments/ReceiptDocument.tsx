import type { ReactNode } from "react";
import { BadgeCheck, CircleSlash } from "lucide-react";
import type { VerifiedReceipt } from "@/lib/receipts/verified-receipt";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  MPESA: "M-Pesa",
  M_PESA: "M-Pesa",
  BANK_TRANSFER: "Bank transfer",
  CASH: "Cash",
  CHEQUE: "Cheque",
  CARD: "Card",
};

const KES_FORMATTER = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

const DATE_FORMATTER = new Intl.DateTimeFormat("en-KE", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Nairobi",
});

interface ReceiptDocumentProps {
  receipt: VerifiedReceipt;
  actions?: ReactNode;
}

export function ReceiptDocument({ receipt, actions }: ReceiptDocumentProps) {
  return (
    <article className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card text-card-foreground print:max-w-none print:rounded-lg print:border-0">
      <ReceiptHeader receipt={receipt} />
      <ReceiptStatus isVoided={receipt.isVoided} />
      <ReceiptDetails receipt={receipt} />
      {actions ? (
        <div className="border-t border-border px-6 py-5 print:hidden">{actions}</div>
      ) : null}
      <p className="border-t border-border px-6 py-4 text-center text-xs leading-relaxed text-muted-foreground">
        Verified by SQUL on behalf of {receipt.schoolName}. Questions? Contact the
        school office.
      </p>
    </article>
  );
}

function ReceiptHeader({ receipt }: { receipt: VerifiedReceipt }) {
  return (
    <header className="px-6 pb-6 pt-7">
      <p className="text-sm font-medium text-muted-foreground">{receipt.schoolName}</p>
      <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight">
        {KES_FORMATTER.format(receipt.amount)}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        received for {receipt.studentName}
      </p>
    </header>
  );
}

function ReceiptStatus({ isVoided }: { isVoided: boolean }) {
  if (isVoided) {
    return (
      <div className="mx-6 flex items-center gap-2 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
        <CircleSlash className="size-4 shrink-0" aria-hidden />
        This receipt has been adjusted by the school. Ask the office for the latest copy.
      </div>
    );
  }
  return (
    <div className="mx-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
      <BadgeCheck className="size-4 shrink-0" aria-hidden />
      Payment confirmed by the school.
    </div>
  );
}

function ReceiptDetails({ receipt }: { receipt: VerifiedReceipt }) {
  const method = receipt.paymentMethod
    ? PAYMENT_METHOD_LABELS[receipt.paymentMethod] ?? receipt.paymentMethod
    : null;
  const term = [receipt.termName, receipt.academicYearName].filter(Boolean).join(", ");

  return (
    <dl className="mt-4 divide-y divide-border px-6">
      <ReceiptRow label="Receipt number" value={receipt.receiptNumber} mono />
      <ReceiptRow label="Date" value={DATE_FORMATTER.format(new Date(receipt.receiptDate))} />
      <ReceiptRow label="Student" value={receipt.studentName} />
      <ReceiptRow label="Admission number" value={receipt.admissionNumber} mono />
      <ReceiptRow label="Class" value={receipt.className} />
      <ReceiptRow label="Term" value={term || null} />
      <ReceiptRow label="Paid by" value={method} />
      <ReceiptRow label="Reference" value={receipt.transactionReference} mono />
    </dl>
  );
}

function ReceiptRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={mono ? "text-right font-mono text-sm tabular-nums" : "text-right text-sm font-medium"}>
        {value}
      </dd>
    </div>
  );
}
