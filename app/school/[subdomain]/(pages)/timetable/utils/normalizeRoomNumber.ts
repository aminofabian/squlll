/** Reuse an existing room label when the name matches case-insensitively. */
export function normalizeRoomNumber(
  input: string,
  knownRooms: string[],
): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const match = knownRooms.find(
    (r) => r.localeCompare(trimmed, undefined, { sensitivity: "base" }) === 0,
  );
  return match ?? trimmed;
}
