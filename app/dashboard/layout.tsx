import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | Super Admin",
  description: "Platform overview for schools, subscriptions, and users",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 