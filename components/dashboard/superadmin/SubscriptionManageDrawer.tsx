"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  formatSubscriptionDate,
  getSubscriptionDaysRemaining,
  MANAGEABLE_SUBSCRIPTION_STATUSES,
} from "@/lib/superadmin/subscriptions";
import type { PlanRecord } from "@/lib/superadmin/plans";
import type { SubscriptionRecord } from "@/lib/superadmin/types";
import { cn } from "@/lib/utils";

interface SubscriptionManageDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: SubscriptionRecord | null;
  plans: PlanRecord[];
  saving?: boolean;
  onSave: (values: {
    id: string;
    planId?: number;
    status?: string;
    autoRenew?: boolean;
  }) => Promise<unknown>;
  onCancel: (values: {
    subscriptionId: string;
    reason?: string;
  }) => Promise<unknown>;
}

export function SubscriptionManageDrawer({
  open,
  onOpenChange,
  subscription,
  plans,
  saving,
  onSave,
  onCancel,
}: SubscriptionManageDrawerProps) {
  const [planId, setPlanId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [autoRenew, setAutoRenew] = useState(false);
  const [cancelMode, setCancelMode] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !subscription) return;
    setPlanId(String(subscription.plan?.id ?? ""));
    setStatus(subscription.status);
    setAutoRenew(Boolean(subscription.autoRenew));
    setCancelMode(false);
    setCancelReason("");
    setFormError(null);
  }, [open, subscription]);

  if (!subscription) return null;

  const remaining = getSubscriptionDaysRemaining(subscription.endDate);
  const isCancelled = subscription.status === "CANCELLED";

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const nextPlanId = planId ? Number(planId) : undefined;
    const payload: {
      id: string;
      planId?: number;
      status?: string;
      autoRenew?: boolean;
    } = { id: subscription.id };

    if (nextPlanId && nextPlanId !== subscription.plan?.id) {
      payload.planId = nextPlanId;
    }
    if (status && status !== subscription.status) {
      payload.status = status;
    }
    if (autoRenew !== Boolean(subscription.autoRenew)) {
      payload.autoRenew = autoRenew;
    }

    if (
      payload.planId == null &&
      payload.status == null &&
      payload.autoRenew == null
    ) {
      setFormError("No changes to save");
      return;
    }

    try {
      await onSave(payload);
      onOpenChange(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not save subscription",
      );
    }
  };

  const handleCancel = async () => {
    setFormError(null);
    try {
      await onCancel({
        subscriptionId: subscription.id,
        reason: cancelReason.trim() || undefined,
      });
      onOpenChange(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not cancel subscription",
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-hidden sm:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle>Manage subscription</SheetTitle>
          <SheetDescription>
            {subscription.tenant?.name || "School"} — adjust plan, status, or
            billing settings.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-1 py-2">
          <div className="rounded-xl border border-slate-200/60 bg-slate-50/80 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">Current period</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {formatSubscriptionDate(subscription.startDate)} –{" "}
                {formatSubscriptionDate(subscription.endDate)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-slate-500">Time left</span>
              <span
                className={cn(
                  "font-medium tabular-nums",
                  remaining.urgent ? "text-red-500" : "text-slate-700 dark:text-slate-300",
                )}
              >
                {remaining.label}
              </span>
            </div>
          </div>

          {cancelMode ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                <div className="text-sm text-red-700 dark:text-red-300">
                  Cancelling stops auto-renew and marks this subscription as
                  cancelled. The school may lose access based on plan rules.
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancel-reason">Reason (optional)</Label>
                <Textarea
                  id="cancel-reason"
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                  placeholder="Why is this subscription being cancelled?"
                  className="min-h-[88px] rounded-xl"
                />
              </div>
            </div>
          ) : (
            <form id="subscription-form" onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select
                  value={planId}
                  onValueChange={setPlanId}
                  disabled={isCancelled || saving}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={String(plan.id)}>
                        {plan.name}
                        {plan.isDefault ? " (default)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={setStatus}
                  disabled={isCancelled || saving}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {MANAGEABLE_SUBSCRIPTION_STATUSES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200/60 px-4 py-3 dark:border-slate-800">
                <div>
                  <Label htmlFor="auto-renew">Auto-renew</Label>
                  <p className="text-xs text-slate-500">
                    Automatically renew when the period ends
                  </p>
                </div>
                <Switch
                  id="auto-renew"
                  checked={autoRenew}
                  onCheckedChange={setAutoRenew}
                  disabled={isCancelled || saving}
                />
              </div>
            </form>
          )}

          {formError ? (
            <p className="text-sm text-red-600">{formError}</p>
          ) : null}
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-col">
          {cancelMode ? (
            <>
              <Button
                variant="destructive"
                className="w-full rounded-xl"
                onClick={handleCancel}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Confirm cancellation"
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => setCancelMode(false)}
                disabled={saving}
              >
                Back
              </Button>
            </>
          ) : (
            <>
              {!isCancelled ? (
                <Button
                  type="submit"
                  form="subscription-form"
                  className="w-full rounded-xl"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              ) : null}
              {!isCancelled ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl text-red-600 hover:text-red-700"
                  onClick={() => setCancelMode(true)}
                  disabled={saving}
                >
                  Cancel subscription
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                className="w-full rounded-xl"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Close
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
