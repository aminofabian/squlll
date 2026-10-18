import type { Metadata } from "next";
import { ReceiptUnverified } from "@/components/payments/ReceiptUnverified";

export const metadata: Metadata = {
  title: "Fee receipt",
  robots: { index: false, follow: false },
};

export default function LegacyReceiptPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <ReceiptUnverified />
    </main>
  );
}
