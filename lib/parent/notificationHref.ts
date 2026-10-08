/**
 * Notification deep-links are authored as mobile paths (e.g. `/parent/transport`),
 * so clicking one on the web parent portal has to be mapped onto the SPA's tab
 * keys. This keeps the backend hrefs single-source while the web resolves them.
 */

/** Mobile href last-segment → web parent-portal tab key. */
const SEGMENT_TO_TAB: Record<string, string> = {
  parent: 'dashboard',
  student: 'dashboard',
  dashboard: 'dashboard',
  home: 'dashboard',
  timetable: 'schedule',
  schedule: 'schedule',
  attendance: 'attendance',
  grades: 'grades',
  fees: 'payments',
  payments: 'payments',
  transport: 'transport',
  reports: 'reports',
  report: 'reports',
  messages: 'messages',
  notifications: 'notifications',
};

/** The parent-portal tab a notification href points at, or null if unknown. */
export function parentTabForNotificationHref(
  href?: string | null,
): string | null {
  if (!href) return null;
  const path = href.split(/[?#]/)[0];
  const segment = path.split('/').filter(Boolean).pop();
  if (!segment) return null;
  return SEGMENT_TO_TAB[segment] ?? null;
}
