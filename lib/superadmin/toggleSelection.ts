/** Returns a new selection with `ids` added (checked) or removed. */
export function toggleSelection(
  selected: ReadonlySet<string>,
  ids: string[],
  checked: boolean,
): Set<string> {
  const next = new Set(selected);
  for (const id of ids) {
    if (checked) next.add(id);
    else next.delete(id);
  }
  return next;
}
