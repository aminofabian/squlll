import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Super admin account and platform status",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
