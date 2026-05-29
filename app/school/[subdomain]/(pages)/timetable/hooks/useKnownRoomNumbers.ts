import { useTimetableStore } from "@/lib/stores/useTimetableStoreNew";

/** Known room numbers from the backend. */
export function useKnownRoomNumbers(): string[] {
  return useTimetableStore((s) => s.knownRoomNumbers);
}
