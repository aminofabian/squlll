"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  createEmptyPlanForm,
  PLAN_FEATURES,
  planToFormValues,
  type PlanFormValues,
  type PlanRecord,
} from "@/lib/superadmin/plans";

interface PlanFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: PlanRecord | null;
  saving?: boolean;
  onSubmit: (values: PlanFormValues) => Promise<void>;
}

export function PlanFormDrawer({
  open,
  onOpenChange,
  plan,
  saving,
  onSubmit,
}: PlanFormDrawerProps) {
  const [values, setValues] = useState<PlanFormValues>(createEmptyPlanForm());
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFormError(null);
    setValues(plan ? planToFormValues(plan) : createEmptyPlanForm());
  }, [open, plan]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!values.name.trim()) {
      setFormError("Plan name is required");
      return;
    }

    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not save this plan",
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
          <SheetTitle>{plan ? "Edit plan" : "Create plan"}</SheetTitle>
          <SheetDescription>
            {plan
              ? "Update pricing, features, and limits for this subscription plan."
              : "Set up a new subscription plan for schools on the platform."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-6 overflow-y-auto px-1 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan-name">Plan name</Label>
                <Input
                  id="plan-name"
                  value={values.name}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Standard"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-description">Description</Label>
                <Textarea
                  id="plan-description"
                  value={values.description}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe who this plan is for"
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthly-price">Monthly price (USD)</Label>
                <Input
                  id="monthly-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.monthlyPrice}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      monthlyPrice: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearly-price">Yearly price (USD)</Label>
                <Input
                  id="yearly-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.yearlyPrice}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      yearlyPrice: event.target.value,
                    }))
                  }
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trial-days">Trial days</Label>
                <Input
                  id="trial-days"
                  type="number"
                  min="0"
                  value={values.trialDays}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      trialDays: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grace-days">Grace days</Label>
                <Input
                  id="grace-days"
                  type="number"
                  min="0"
                  value={values.graceDays}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      graceDays: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Features
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {PLAN_FEATURES.map((feature) => (
                  <label
                    key={feature.key}
                    className="flex items-center gap-3 rounded-lg border border-slate-200/70 px-3 py-2.5 dark:border-slate-800"
                  >
                    <Checkbox
                      checked={values.features[feature.key]}
                      onCheckedChange={(checked) =>
                        setValues((current) => ({
                          ...current,
                          features: {
                            ...current.features,
                            [feature.key]: checked === true,
                          },
                        }))
                      }
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {feature.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Limits
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="max-students">Max students</Label>
                  <Input
                    id="max-students"
                    type="number"
                    value={values.limits.maxStudents}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        limits: {
                          ...current.limits,
                          maxStudents: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-teachers">Max teachers</Label>
                  <Input
                    id="max-teachers"
                    type="number"
                    value={values.limits.maxTeachers}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        limits: {
                          ...current.limits,
                          maxTeachers: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-storage">Storage (GB)</Label>
                  <Input
                    id="max-storage"
                    type="number"
                    value={values.limits.maxStorage}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        limits: {
                          ...current.limits,
                          maxStorage: event.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Use -1 for unlimited capacity.
              </p>
            </div>

            <div className="space-y-4 rounded-xl border border-slate-200/70 p-4 dark:border-slate-800">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Default plan</p>
                  <p className="text-xs text-slate-400">
                    New schools start on this plan
                  </p>
                </div>
                <Switch
                  checked={values.isDefault}
                  onCheckedChange={(checked) =>
                    setValues((current) => ({
                      ...current,
                      isDefault: checked,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-slate-400">
                    Inactive plans cannot be assigned
                  </p>
                </div>
                <Switch
                  checked={values.isActive}
                  onCheckedChange={(checked) =>
                    setValues((current) => ({
                      ...current,
                      isActive: checked,
                    }))
                  }
                />
              </div>
            </div>

            {formError ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                {formError}
              </p>
            ) : null}
          </div>

          <SheetFooter className="border-t border-slate-200 pt-4 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : plan ? (
                "Save changes"
              ) : (
                "Create plan"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
