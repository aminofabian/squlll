import type { Metadata } from "next";
import { SuperAdminAuthGuard } from "@/components/dashboard/superadmin/SuperAdminAuthGuard";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | Super Admin",
  },
  description: "Platform overview for schools, subscriptions, and users",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SuperAdminAuthGuard>{children}</SuperAdminAuthGuard>;
}
