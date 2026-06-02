"use client";

import { useCallback, useState } from "react";

export interface FeeReminderLogEntry {
  id: string;
  studentIds: string[];
  channel: string;
  message: string;
  sentAt: string;
  sentBy?: string;
  status: "queued" | "sent" | "failed";
}

const logKey = (tenantHint = "default") => `fee-reminder-log-${tenantHint}`;

function readLog(key: string): FeeReminderLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as FeeReminderLogEntry[]) : [];
  } catch {
    return [];
  }
}

function writeLog(key: string, entries: FeeReminderLogEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(entries.slice(0, 200)));
}

export function useFeeReminderLog() {
  const [entries, setEntries] = useState<FeeReminderLogEntry[]>([]);

  const refresh = useCallback(() => {
    setEntries(readLog(logKey()));
  }, []);

  const append = useCallback(
    (entry: Omit<FeeReminderLogEntry, "id" | "sentAt" | "status">) => {
      const newEntry: FeeReminderLogEntry = {
        ...entry,
        id: `rem-${Date.now()}`,
        sentAt: new Date().toISOString(),
        status: "queued",
      };
      const key = logKey();
      const next = [newEntry, ...readLog(key)];
      writeLog(key, next);
      setEntries(next);
      return newEntry;
    },
    [],
  );

  const forStudent = useCallback((studentId: string) => {
    return readLog(logKey()).filter((e) => e.studentIds.includes(studentId));
  }, []);

  return { entries, refresh, append, forStudent };
}
