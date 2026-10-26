import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Logs",
  description: "Super-admin audit trail across users, schools, billing and portal access",
};

export default function LogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
