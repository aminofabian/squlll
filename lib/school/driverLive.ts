/**
 * Driver live-cockpit helpers: throttling for position publishing and small
 * display formatters. Mirrors the mobile `driver/position.ts` + `transport/live.ts`
 * so the web run sheet behaves the same as the app.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Foreground position publishing is throttled client-side so a stationary bus
 * doesn't stream pings. A sample is sent when **either** the report interval has
 * elapsed (a heartbeat, so a parked bus still shows as live) **or** the bus has
 * moved meaningfully since the last report.
 */
export const MIN_REPORT_INTERVAL_MS = 10_000;
export const MIN_REPORT_DISTANCE_M = 15;

const EARTH_RADIUS_M = 6_371_000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Great-circle distance between two fixes, in metres. */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Whether `next` is worth sending, given the last sent fix/time. */
export function shouldReport(
  last: LatLng | null,
  next: LatLng,
  lastSentAtMs: number,
  nowMs: number,
  options: { minIntervalMs?: number; minDistanceM?: number } = {},
): boolean {
  if (!last) return true;
  const minIntervalMs = options.minIntervalMs ?? MIN_REPORT_INTERVAL_MS;
  const minDistanceM = options.minDistanceM ?? MIN_REPORT_DISTANCE_M;
  if (nowMs - lastSentAtMs >= minIntervalMs) return true;
  return haversineMeters(last, next) >= minDistanceM;
}

/** "320 m" / "2.4 km". */
export function formatDistance(metres?: number | null): string | null {
  if (metres == null || metres < 0) return null;
  if (metres < 950) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

/** "0.4 km" / "2.3 km" — the straight-line distance to the next pick. */
export function formatKm(metres?: number | null): string | null {
  if (metres == null || metres < 0) return null;
  return `${(metres / 1000).toFixed(1)} km`;
}

/** "about 7 min" / "less than a minute", or null when there's no estimate. */
export function formatEta(seconds?: number | null): string | null {
  if (seconds == null || seconds < 0) return null;
  if (seconds < 60) return "less than a minute";
  const minutes = Math.round(seconds / 60);
  if (minutes <= 1) return "about 1 min";
  return `about ${minutes} min`;
}
