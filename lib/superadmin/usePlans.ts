"use client";

import { useCallback, useEffect, useState } from "react";
import { createPlan, fetchPlans, updatePlan } from "./plansApi";
import type { PlanFormValues, PlanRecord } from "./plans";

export function usePlans() {
  const [plans, setPlans] = useState<PlanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchPlans();
      setPlans(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const savePlan = useCallback(
    async (values: PlanFormValues, planId?: string) => {
      setSaving(true);
      setError(null);
      try {
        const saved = planId
          ? await updatePlan(Number(planId), values)
          : await createPlan(values);

        setPlans((current) => {
          const withoutSaved = current.filter((plan) => plan.id !== saved.id);
          const normalized = saved.isDefault
            ? withoutSaved.map((plan) => ({ ...plan, isDefault: false }))
            : withoutSaved;
          return [...normalized, saved].sort(
            (a, b) => Number(a.isDefault) - Number(b.isDefault) || a.name.localeCompare(b.name),
          );
        });

        return saved;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to save plan";
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  return {
    plans,
    loading,
    saving,
    error,
    refresh,
    savePlan,
  };
}
