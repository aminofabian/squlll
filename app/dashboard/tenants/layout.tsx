import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schools",
  description: "Manage schools registered on the platform",
};

export default function SchoolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
