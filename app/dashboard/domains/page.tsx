"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AdminPageHeader } from "@/components/dashboard/superadmin/AdminPageChrome";
import { cn } from "@/lib/utils";
import { DomainsRegistryPanel } from "./_components/DomainsRegistryPanel";
import { DomainControlPlanePanel } from "./_components/DomainControlPlanePanel";
import { DomainOrdersPanel } from "./_components/DomainOrdersPanel";

type Tab = "registry" | "orders" | "settings";

export default function DomainsPage() {
  const [tab, setTab] = useState<Tab>("registry");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AdminPageHeader
          icon={Globe}
          title="Custom domains"
          description="Connect schools to domains they own, and configure the provider plumbing."
        />

        <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
          {(
            [
              { id: "registry", label: "Registry" },
              { id: "orders", label: "Orders" },
              { id: "settings", label: "Provider settings" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                tab === item.id
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "registry" ? (
          <DomainsRegistryPanel />
        ) : tab === "orders" ? (
          <DomainOrdersPanel />
        ) : (
          <DomainControlPlanePanel />
        )}
      </div>
    </DashboardLayout>
  );
}
