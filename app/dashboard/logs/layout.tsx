import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Logs",
  description: "Platform actions performed by super admins",
};

export default function LogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
