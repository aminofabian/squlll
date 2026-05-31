import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscriptions",
  description: "View and manage school subscriptions",
};

export default function SubscriptionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
