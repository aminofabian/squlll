import type { Metadata } from "next";
import { ReceiptDocument } from "@/components/payments/ReceiptDocument";
import { ReceiptShareActions } from "@/components/payments/ReceiptShareActions";
import { ReceiptUnverified } from "@/components/payments/ReceiptUnverified";
import { fetchVerifiedReceipt } from "@/lib/receipts/fetchVerifiedReceipt";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fee receipt",
  robots: { index: false, follow: false },
};

interface ReceiptPageProps {
  params: Promise<{ subdomain: string; token: string }>;
}

export default async function VerifiedReceiptPage({ params }: ReceiptPageProps) {
  const { subdomain, token } = await params;
  const receipt = await fetchVerifiedReceipt(subdomain, token);

  return (
    <main className="min-h-screen bg-background px-4 py-10 print:bg-white print:p-0">
      {receipt ? (
        <ReceiptDocument
          receipt={receipt}
          actions={
            <ReceiptShareActions
              title={`Fee receipt — ${receipt.studentName}`}
              summary={`${receipt.schoolName} fee receipt ${receipt.receiptNumber} for ${receipt.studentName}.`}
            />
          }
        />
      ) : (
        <ReceiptUnverified />
      )}
    </main>
  );
}
