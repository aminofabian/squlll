"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AdminPageHeader } from "@/components/dashboard/superadmin/AdminPageChrome";
import { MapsSettingsPanel } from "./_components/MapsSettingsPanel";
import { Map } from "lucide-react";

export default function MapsSettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <AdminPageHeader
          icon={Map}
          title="Maps"
          description="Tile provider and client key for live transport maps across web and mobile"
          onRefresh={() => window.location.reload()}
        />
        <MapsSettingsPanel />
      </div>
    </DashboardLayout>
  );
}
