"use client";

import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CreditCard,
  Plus,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  AdminPageHeader,
} from "@/components/dashboard/superadmin/AdminPageChrome";
import { PlanCard } from "@/components/dashboard/superadmin/PlanCard";
import { PlanFormDrawer } from "@/components/dashboard/superadmin/PlanFormDrawer";
import { DashboardErrorBanner } from "@/components/dashboard/superadmin/DashboardStatCards";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
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
  const {
    plans,
    loading,
    saving,
    deletingId,
    error,
    refresh,
    savePlan,
    deactivatePlan,
  } = usePlans();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanRecord | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<PlanRecord | null>(
    null,
  );
  const [deactivateError, setDeactivateError] = useState("");

  const openCreateDrawer = () => {
    setEditingPlan(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (plan: PlanRecord) => {
    setEditingPlan(plan);
    setDrawerOpen(true);
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivateError("");
    try {
      await deactivatePlan(deactivateTarget.id);
      setDeactivateTarget(null);
    } catch (err) {
      setDeactivateError(
        err instanceof Error ? err.message : "Failed to deactivate plan",
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <AdminPageHeader
          icon={CreditCard}
          title="Plans"
          description="Manage subscription plans, pricing, and what each school can access"
          count={loading ? undefined : plans.length}
          loading={loading}
          onRefresh={refresh}
          actions={
            <Button size="sm" onClick={openCreateDrawer}>
              <Plus className="mr-2 h-4 w-4" />
              New plan
            </Button>
          }
        />

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
              <PlanCard
                key={plan.id}
                plan={plan}
                onEdit={openEditDrawer}
                onDeactivate={(target) => {
                  setDeactivateTarget(target);
                  setDeactivateError("");
                }}
                deactivating={deletingId === plan.id}
              />
            ))}
          </div>
        )}

        {!loading && plans.length > 0 ? (
          <div className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>
              The default plan is assigned to new schools automatically. Plans
              can be deactivated from the card menu (default plan cannot be
              removed).
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

      <Dialog
        open={!!deactivateTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeactivateTarget(null);
            setDeactivateError("");
          }
        }}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Deactivate plan
            </DialogTitle>
            <DialogDescription>
              Deactivate <strong>{deactivateTarget?.name}</strong>? It will no
              longer appear for new subscriptions. Existing subscriptions are
              not affected.
            </DialogDescription>
          </DialogHeader>
          {deactivateError ? (
            <p className="text-sm text-red-600">{deactivateError}</p>
          ) : null}
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setDeactivateTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={handleDeactivate}
              disabled={deletingId === deactivateTarget?.id}
            >
              {deletingId === deactivateTarget?.id
                ? "Deactivating..."
                : "Deactivate plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
