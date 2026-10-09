/**
 * True when a GraphQL error means "nothing to show yet" rather than a real
 * failure — e.g. a report card requested before any marks exist, where the API
 * answers 404 / "No marks found …". Callers render an empty state instead.
 */
export function isNoResultsError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : String(error ?? '')
  const lower = message.toLowerCase()
  return (
    lower.includes('no marks found') ||
    lower.includes('no report card') ||
    lower.includes('no performance') ||
    lower.includes('no results') ||
    // A plain 404 from these read endpoints is "no data", not a failure.
    lower.includes('(404)')
  )
}
