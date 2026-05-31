import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "School details",
  description: "School profile, subscriptions, and users",
};

export default function TenantDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
