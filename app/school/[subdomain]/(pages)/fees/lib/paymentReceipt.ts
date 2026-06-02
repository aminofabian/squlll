import {
  getFigtreePrintFontLinks,
  figtreePrintBodyCss,
} from "@/lib/fonts/figtree";

export interface PaymentReceiptInvoiceInfo {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  termName?: string;
  academicYearName?: string;
}

export interface PaymentReceiptStudentInfo {
  id: string;
  name: string;
  admissionNumber: string;
  gradeLevelName: string;
  streamName?: string;
  email?: string;
}

export interface PaymentReceiptData {
  paymentId: string;
  receiptNumber: string;
  amount: number;
  paymentMethod: string;
  transactionReference?: string;
  paymentDate: string;
  notes?: string;
  receivedBy?: string;
  student: PaymentReceiptStudentInfo;
  invoice: PaymentReceiptInvoiceInfo;
  remainingBalance: number;
  creditBalance: number;
}

export function formatPaymentMethodLabel(method: string): string {
  const normalized = method.toUpperCase().replace(/-/g, "_");
  const labels: Record<string, string> = {
    CASH: "Cash",
    MPESA: "M-Pesa",
    BANK: "Bank Transfer",
    BANK_TRANSFER: "Bank Transfer",
    CHEQUE: "Cheque",
    CARD: "Card",
    ONLINE: "Online",
    OTHER: "Other",
  };
  return labels[normalized] ?? method;
}

export function formatReceiptDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function buildReceiptShareText(data: PaymentReceiptData): string {
  const lines = [
    `Payment Receipt ${data.receiptNumber}`,
    `Student: ${data.student.name} (${data.student.admissionNumber})`,
    `Class: ${data.student.gradeLevelName}${data.student.streamName ? ` · ${data.student.streamName}` : ""}`,
    `Amount paid: KES ${data.amount.toLocaleString()}`,
    `Method: ${formatPaymentMethodLabel(data.paymentMethod)}`,
  ];

  if (data.transactionReference) {
    lines.push(`Reference: ${data.transactionReference}`);
  }

  lines.push(
    `Date: ${formatReceiptDateTime(data.paymentDate)}`,
    `Remaining balance: KES ${data.remainingBalance.toLocaleString()}`,
  );

  if (data.creditBalance > 0) {
    lines.push(`Credit balance: KES ${data.creditBalance.toLocaleString()}`);
  }

  return lines.join("\n");
}

export function computeBalancesAfterPayment(
  priorArrears: number,
  priorCredit: number,
  amountPaid: number,
): { remainingBalance: number; creditBalance: number } {
  const appliedToArrears = Math.min(amountPaid, Math.max(0, priorArrears));
  const overpayment = Math.max(0, amountPaid - appliedToArrears);

  return {
    remainingBalance: Math.max(0, priorArrears - appliedToArrears),
    creditBalance: priorCredit + overpayment,
  };
}

export function buildReceiptHtml(data: PaymentReceiptData, schoolName = "School"): string {
  const rows = [
    ["Receipt number", data.receiptNumber],
    ["Student", data.student.name],
    ["Admission no.", data.student.admissionNumber],
    [
      "Grade / stream",
      `${data.student.gradeLevelName}${data.student.streamName ? ` · ${data.student.streamName}` : ""}`,
    ],
    ["Invoice", data.invoice.invoiceNumber],
    ...(data.invoice.termName
      ? [["Term", `${data.invoice.termName}${data.invoice.academicYearName ? ` · ${data.invoice.academicYearName}` : ""}`]]
      : []),
    ["Amount paid", `KES ${data.amount.toLocaleString()}`],
    ["Payment method", formatPaymentMethodLabel(data.paymentMethod)],
    ...(data.transactionReference
      ? [["Reference", data.transactionReference]]
      : []),
    ["Date & time", formatReceiptDateTime(data.paymentDate)],
    ...(data.receivedBy ? [["Received by", data.receivedBy]] : []),
    ["Remaining balance", `KES ${data.remainingBalance.toLocaleString()}`],
    ...(data.creditBalance > 0
      ? [["Credit balance", `KES ${data.creditBalance.toLocaleString()}`]]
      : []),
  ];

  const tableRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;color:#64748b;font-size:13px;width:40%">${label}</td><td style="padding:8px 12px;font-weight:600;font-size:13px">${value}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  ${getFigtreePrintFontLinks()}
  <title>Receipt ${data.receiptNumber}</title>
  <style>
    body { ${figtreePrintBodyCss("color: #0f172a; max-width: 640px; margin: 40px auto; padding: 24px;")} }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .meta { color: #64748b; font-size: 13px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    tr + tr { border-top: 1px solid #f1f5f9; }
    .footer { margin-top: 24px; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <h1>Payment Receipt</h1>
  <p class="meta">${schoolName}</p>
  <table>${tableRows}</table>
  ${data.notes ? `<p style="margin-top:16px;font-size:13px"><strong>Notes:</strong> ${data.notes}</p>` : ""}
  <p class="footer">Generated ${new Date().toLocaleString("en-KE")}</p>
</body>
</html>`;
}

export function downloadReceiptHtml(data: PaymentReceiptData, schoolName?: string): void {
  const html = buildReceiptHtml(data, schoolName);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `receipt-${data.receiptNumber.replace(/\s+/g, "-")}.html`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadPdfDataUrl(dataUrl: string, filename: string): void {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.click();
}

export async function shareReceipt(data: PaymentReceiptData): Promise<"shared" | "copied"> {
  const text = buildReceiptShareText(data);

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title: `Receipt ${data.receiptNumber}`,
        text,
      });
      return "shared";
    } catch {
      // User cancelled or share failed — fall through to clipboard
    }
  }

  await navigator.clipboard.writeText(text);
  return "copied";
}
