const STORAGE_PREFIX = "squl-timetable-shared";

export interface TimetableShareRecord {
  termId: string;
  sharedAt: string;
  sharedByLabel?: string;
  note?: string;
}

function storageKey(termId: string): string {
  return `${STORAGE_PREFIX}:${termId}`;
}

export function getTimetableShareRecord(
  termId: string | null | undefined,
): TimetableShareRecord | null {
  if (!termId || typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(termId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TimetableShareRecord;
    if (parsed.termId !== termId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setTimetableShareRecord(record: TimetableShareRecord): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(record.termId), JSON.stringify(record));
}

export function clearTimetableShareRecord(termId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey(termId));
}
