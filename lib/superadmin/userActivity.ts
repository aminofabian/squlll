import type { AdminUserListItem } from "./types";

export type LoginFreshness = "live" | "today" | "week" | "stale" | "never";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const LIVE_WINDOW = 15 * MINUTE;
const WEEK_WINDOW = 7 * DAY;

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Normalize `0712 345 678` / `+254712345678` to digits for tel/WhatsApp links. */
export function phoneDigits(phone?: string | null): string {
  return (phone ?? "").replace(/\D/g, "");
}

/** Friendly display form: `+254 712 345 678`. */
export function formatPhoneDisplay(phone?: string | null): string {
  const digits = phoneDigits(phone);
  if (!digits) return "—";

  if (digits.startsWith("254") && digits.length === 12) {
    return `+254 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }

  if ((phone ?? "").trim().startsWith("+")) {
    return `+${digits}`;
  }

  return phone!.trim();
}

export function phoneToTelHref(phone?: string | null): string | null {
  const digits = phoneDigits(phone);
  return digits ? `tel:+${digits}` : null;
}

export function phoneToWhatsAppHref(phone?: string | null): string | null {
  const digits = phoneDigits(phone);
  return digits ? `https://wa.me/${digits}` : null;
}

export function loginFreshness(
  lastLoginAt?: string | null,
  now: Date = new Date(),
): LoginFreshness {
  const date = parseDate(lastLoginAt);
  if (!date) return "never";

  const diff = now.getTime() - date.getTime();
  // Clock skew between the browser and DB: treat a future timestamp as fresh.
  if (diff < 0) return "live";

  if (diff <= LIVE_WINDOW) return "live";
  if (isSameCalendarDay(date, now)) return "today";
  if (diff <= WEEK_WINDOW) return "week";
  return "stale";
}

export function formatRelativeLogin(
  lastLoginAt?: string | null,
  now: Date = new Date(),
): string {
  const date = parseDate(lastLoginAt);
  if (!date) return "Never signed in";

  const diff = Math.max(0, now.getTime() - date.getTime());

  if (diff < MINUTE) return "Just now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < WEEK_WINDOW) return `${Math.floor(diff / DAY)}d ago`;

  return date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year:
      date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

export function formatExactLogin(lastLoginAt?: string | null): string {
  const date = parseDate(lastLoginAt);
  if (!date) return "No sign-in recorded";

  return date.toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function loginCountLabel(loginCount?: number | null): string {
  const count = Number(loginCount ?? 0);
  if (count <= 0) return "No sign-ins yet";
  return count === 1 ? "1 sign-in" : `${count} sign-ins`;
}

export function accountAgeLabel(
  createdAt?: string | null,
  now: Date = new Date(),
): string {
  const date = parseDate(createdAt);
  if (!date) return "—";

  const days = Math.max(0, Math.floor((now.getTime() - date.getTime()) / DAY));
  if (days === 0) return "Joined today";
  if (days === 1) return "Joined yesterday";
  if (days < 30) return `Joined ${days} days ago`;

  const months = Math.floor(days / 30);
  if (months < 12) {
    return months === 1 ? "Joined 1 month ago" : `Joined ${months} months ago`;
  }

  const years = Math.floor(months / 12);
  return years === 1 ? "Joined 1 year ago" : `Joined ${years} years ago`;
}

export interface LoginPulseCounts {
  live: number;
  today: number;
  thisWeek: number;
  never: number;
  signedIn: number;
}

/**
 * Compact funnel used by the users page: how many people are online now, how
 * many have shown up today / this week, and who has never signed in at all.
 */
export function countLoginActivity(
  users: AdminUserListItem[],
  now: Date = new Date(),
): LoginPulseCounts {
  const counts: LoginPulseCounts = {
    live: 0,
    today: 0,
    thisWeek: 0,
    never: 0,
    signedIn: 0,
  };

  for (const user of users) {
    const freshness = loginFreshness(user.lastLoginAt, now);
    if (freshness === "never") {
      counts.never += 1;
      continue;
    }

    counts.signedIn += 1;
    if (freshness === "live") counts.live += 1;
    if (freshness === "live" || freshness === "today") counts.today += 1;
    if (freshness !== "stale") counts.thisWeek += 1;
  }

  return counts;
}

export const LOGIN_FRESHNESS_STYLES: Record<
  LoginFreshness,
  { dot: string; text: string; label: string }
> = {
  live: {
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    label: "Signed in <15m",
  },
  today: {
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    label: "Signed in today",
  },
  week: {
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    label: "Signed in this week",
  },
  stale: {
    dot: "bg-slate-400",
    text: "text-slate-600 dark:text-slate-400",
    label: "Inactive recently",
  },
  never: {
    dot: "bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    label: "Never signed in",
  },
};
