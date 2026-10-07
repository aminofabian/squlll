import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Walkthrough leads",
  description: "Review and follow up on walkthrough requests from schools",
};

export default function WalkthroughsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
