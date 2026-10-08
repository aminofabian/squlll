"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getDisplayErrorMessage } from "@/lib/utils/graphql-errors";
import {
  fetchTransportSafetySettings,
  updateTransportSafetySettings,
  type TransportSafetyThresholds,
} from "@/lib/school/transportApi";

/** Mirrors the backend defaults/bounds (transport-safety.defaults.ts). */
const DEFAULTS = { longStopRadiusM: 50, longStopMinutes: 10, deviationRadiusM: 500 };

const BOUNDS = {
  longStopRadiusM: { min: 10, max: 1000 },
  longStopMinutes: { min: 1, max: 120 },
  deviationRadiusM: { min: 50, max: 5000 },
} as const;

type Field = keyof typeof BOUNDS;
type FormState = Record<Field, string>;

const FIELDS: {
  key: Field;
  label: string;
  unit: string;
  hint: string;
}[] = [
  {
    key: "longStopMinutes",
    label: "Long-stop duration",
    unit: "minutes",
    hint: "How long a bus must sit still before it flags a possible long stop.",
  },
  {
    key: "longStopRadiusM",
    label: "Long-stop movement tolerance",
    unit: "metres",
    hint: "How far the bus may wander and still count as stationary.",
  },
  {
    key: "deviationRadiusM",
    label: "Route-deviation distance",
    unit: "metres",
    hint: "How far off the stop-to-stop corridor the bus may go before it flags a deviation.",
  },
];

function toForm(thresholds: TransportSafetyThresholds): FormState {
  return {
    longStopRadiusM: String(thresholds.longStopRadiusM),
    longStopMinutes: String(thresholds.longStopMinutes),
    deviationRadiusM: String(thresholds.deviationRadiusM),
  };
}

/**
 * Per-tenant automatic-detection thresholds. The value the detectors use; a
 * school tunes these to its own roads instead of living with a hard-coded radius.
 */
export function SafetySettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<FormState>(toForm(DEFAULTS));
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const apply = useCallback((thresholds: TransportSafetyThresholds) => {
    setForm(toForm(thresholds));
    setUpdatedAt(thresholds.updatedAt ?? null);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const thresholds = await fetchTransportSafetySettings();
        if (active) apply(thresholds);
      } catch (err) {
        toast.error(getDisplayErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [apply]);

  const save = async (values: FormState) => {
    const payload: Partial<Record<Field, number>> = {};
    for (const { key, label } of FIELDS) {
      const raw = values[key].trim();
      const num = Number(raw);
      if (!raw || !Number.isInteger(num)) {
        toast.error(`${label} must be a whole number`);
        return;
      }
      const { min, max } = BOUNDS[key];
      if (num < min || num > max) {
        toast.error(`${label} must be between ${min} and ${max}`);
        return;
      }
      payload[key] = num;
    }

    setBusy(true);
    try {
      const saved = await updateTransportSafetySettings(payload);
      apply(saved);
      toast.success("Safety thresholds saved");
    } catch (err) {
      toast.error(getDisplayErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Skeleton className="h-64 w-full rounded-2xl" />;

  return (
    <section className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground">Safety detection</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These thresholds decide when the system raises an automatic route-deviation
          or long-stop alert. They apply to every route in your school.
        </p>
      </div>

      <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
        {FIELDS.map(({ key, label, unit, hint }) => (
          <div key={key} className="space-y-1">
            <Label htmlFor={`safety-${key}`}>
              {label} <span className="font-normal text-muted-foreground">({unit})</span>
            </Label>
            <Input
              id={`safety-${key}`}
              type="number"
              min={BOUNDS[key].min}
              max={BOUNDS[key].max}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              {hint} Between {BOUNDS[key].min} and {BOUNDS[key].max} {unit}.
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {updatedAt ? `Last updated ${new Date(updatedAt).toLocaleString()}` : "Using defaults"}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setForm(toForm(DEFAULTS))}
            disabled={busy}
          >
            Restore defaults
          </Button>
          <Button onClick={() => void save(form)} disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </section>
  );
}
