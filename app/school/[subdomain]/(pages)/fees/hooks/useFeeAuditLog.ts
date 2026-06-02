"use client";

import { useCallback, useState } from "react";
import { getCookie } from "@/lib/utils";

export type FeeAuditAction =
  | "fee_plan_created"
  | "fee_plan_deleted"
  | "plan_assigned"
  | "invoices_generated"
  | "payment_recorded"
  | "payment_voided"
  | "adjustment_logged"
  | "adjustment_applied"
  | "reminder_queued";

export interface FeeAuditEntry {
  id: string;
  action: FeeAuditAction;
  summary: string;
  actor?: string;
  createdAt: string;
  meta?: Record<string, string | number>;
}

const STORAGE_KEY = "fee-audit-log";

function read(): FeeAuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FeeAuditEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: FeeAuditEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 500)));
}

export function useFeeAuditLog() {
  const [entries, setEntries] = useState<FeeAuditEntry[]>([]);

  const refresh = useCallback(() => {
    setEntries(read());
  }, []);

  const append = useCallback(
    (entry: Omit<FeeAuditEntry, "id" | "createdAt">) => {
      const actor = typeof window !== "undefined" ? getActorName() : undefined;
      const row: FeeAuditEntry = {
        ...entry,
        id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
        actor,
      };
      const next = [row, ...read()];
      write(next);
      setEntries(next);
      return row;
    },
    [],
  );

  return { entries, refresh, append };
}

function getActorName(): string | undefined {
  return getCookie("userName") || getCookie("email") || undefined;
}
