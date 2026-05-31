"use client";

import { useState } from "react";
import {
  AlertCircle,
  CreditCard,
  Plus,
  RefreshCw,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PlanCard } from "@/components/dashboard/superadmin/PlanCard";
import { PlanFormDrawer } from "@/components/dashboard/superadmin/PlanFormDrawer";
import { DashboardErrorBanner } from "@/components/dashboard/superadmin/DashboardStatCards";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { PlanRecord } from "@/lib/superadmin/plans";
import { usePlans } from "@/lib/superadmin/usePlans";

function PlansSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-800/60 dark:bg-slate-900/80"
        >
          <Skeleton className="mx-auto h-6 w-32" />
          <Skeleton className="mx-auto mt-3 h-4 w-48" />
          <Skeleton className="mx-auto mt-6 h-10 w-24" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 6 }).map((__, row) => (
              <Skeleton key={row} className="h-4 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PlansEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200/80 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        <CreditCard className="h-6 w-6 text-slate-400" />
      </div>
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
        No plans yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        Create your first subscription plan so schools can subscribe to the
        platform.
      </p>
      <Button className="mt-6" onClick={onCreate}>
        <Plus className="mr-2 h-4 w-4" />
        Create first plan
      </Button>
    </div>
  );
}

export default function PlansPage() {
  const { plans, loading, saving, error, refresh, savePlan } = usePlans();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanRecord | null>(null);

  const openCreateDrawer = () => {
    setEditingPlan(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (plan: PlanRecord) => {
    setEditingPlan(plan);
    setDrawerOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="border-b border-slate-200 pb-6 dark:border-slate-700">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Plans
                </h1>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage subscription plans, pricing, and what each school can
                access
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={loading}
                className="h-9 gap-2"
              >
                <RefreshCw
                  className={cn("h-3.5 w-3.5", loading && "animate-spin")}
                />
                Refresh
              </Button>
              <Button size="sm" onClick={openCreateDrawer}>
                <Plus className="mr-2 h-4 w-4" />
                New plan
              </Button>
            </div>
          </div>
        </div>

        {error ? (
          <DashboardErrorBanner message={error} onRetry={refresh} />
        ) : null}

        {loading ? (
          <PlansSkeleton />
        ) : plans.length === 0 ? (
          <PlansEmptyState onCreate={openCreateDrawer} />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onEdit={openEditDrawer} />
            ))}
          </div>
        )}

        {!loading && plans.length > 0 ? (
          <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>
              The default plan is assigned to new schools automatically. Use
              edit to change pricing, features, or limits.
            </p>
          </div>
        ) : null}
      </div>

      <PlanFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        plan={editingPlan}
        saving={saving}
        onSubmit={async (values) => {
          await savePlan(values, editingPlan?.id);
        }}
      />
    </DashboardLayout>
  );
}
