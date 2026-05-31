import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plans",
  description: "Manage subscription plans and pricing",
};

export default function PlansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
