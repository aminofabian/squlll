"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AdminPageHeader } from "@/components/dashboard/superadmin/AdminPageChrome";
import { ChangePasswordForm } from "@/components/dashboard/superadmin/ChangePasswordForm";
import { DashboardErrorBanner } from "@/components/dashboard/superadmin/DashboardStatCards";
import {
  SettingsQuickLinks,
  SystemStatusPanel,
} from "@/components/dashboard/superadmin/SettingsPanels";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useSuperAdminSettings } from "@/lib/superadmin/useSuperAdminSettings";
import { Settings, Shield } from "lucide-react";

function AccountSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

export default function SettingsPage() {
  const {
    account,
    health,
    loadingHealth,
    healthError,
    changingPassword,
    refreshHealth,
    updatePassword,
  } = useSuperAdminSettings();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <AdminPageHeader
          icon={Settings}
          title="Settings"
          description="Account security and platform status for your super admin session"
          loading={loadingHealth}
          onRefresh={refreshHealth}
        />

        {healthError ? (
          <DashboardErrorBanner message={healthError} onRetry={refreshHealth} />
        ) : null}

        <SystemStatusPanel
          health={health}
          loading={loadingHealth}
          onRefresh={refreshHealth}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
            <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <h2 className="flex items-center text-sm font-semibold text-slate-800 dark:text-slate-200">
                <Shield className="mr-2 h-4 w-4" />
                Your account
              </h2>
            </div>
            <div className="space-y-4 p-5">
              {!account ? (
                <AccountSkeleton />
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={account.name || "—"}
                      disabled
                      className="rounded-xl border-slate-200/60 bg-slate-50 dark:border-slate-700/60 dark:bg-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={account.email || "—"}
                      disabled
                      className="rounded-xl border-slate-200/60 bg-slate-50 dark:border-slate-700/60 dark:bg-slate-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input
                      value={account.role || "Super admin"}
                      disabled
                      className="rounded-xl border-slate-200/60 bg-slate-50 dark:border-slate-700/60 dark:bg-slate-800"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
            <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <h2 className="flex items-center text-sm font-semibold text-slate-800 dark:text-slate-200">
                <Shield className="mr-2 h-4 w-4" />
                Change password
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Use a strong password with uppercase, lowercase, numbers, and
                symbols
              </p>
            </div>
            <div className="p-5">
              <ChangePasswordForm
                saving={changingPassword}
                onSubmit={updatePassword}
              />
            </div>
          </div>
        </div>

        <SettingsQuickLinks />
      </div>
    </DashboardLayout>
  );
}
