import { useCallback, useEffect, useState } from "react";
import { publishTermTimetable } from "@/lib/utils/timetable-publish";
import {
  getTimetableShareRecord,
  setTimetableShareRecord,
  type TimetableShareRecord,
} from "../utils/timetableShareStatus";

export function useTimetableShareStatus(
  termId: string | null | undefined,
  serverPublishedAt?: string | null,
) {
  const [record, setRecord] = useState<TimetableShareRecord | null>(null);
  const [publishedAt, setPublishedAt] = useState<string | null>(
    serverPublishedAt ?? null,
  );

  useEffect(() => {
    setRecord(getTimetableShareRecord(termId));
  }, [termId]);

  useEffect(() => {
    setPublishedAt(serverPublishedAt ?? null);
  }, [serverPublishedAt]);

  const markShared = useCallback(
    async (note?: string): Promise<string | null> => {
      if (!termId) return null;
      const serverAt = await publishTermTimetable(termId);
      setPublishedAt(serverAt);
      const next: TimetableShareRecord = {
        termId,
        sharedAt: serverAt,
        note,
      };
      setTimetableShareRecord(next);
      setRecord(next);
      return serverAt;
    },
    [termId],
  );

  const sharedAt = publishedAt ?? record?.sharedAt ?? null;

  const hasChangesSinceShare = useCallback(
    (lastUpdatedIso: string | null | undefined) => {
      if (!sharedAt || !lastUpdatedIso) return false;
      return new Date(lastUpdatedIso) > new Date(sharedAt);
    },
    [sharedAt],
  );

  return {
    record,
    markShared,
    hasChangesSinceShare,
    sharedAt,
    isPublished: Boolean(publishedAt),
  };
}
