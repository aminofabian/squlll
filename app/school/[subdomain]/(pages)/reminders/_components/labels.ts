import type {
  CalendarEventType,
  CommunicationChannelType,
  ScheduledMessageStatus,
} from "@/lib/school/communicationsApi";

export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  OPENING: "Opening day",
  CLOSING: "Closing day",
  HALF_TERM: "Half-term break",
  PARENTS_MEETING: "Parents' meeting",
  EXAM: "Examinations",
  HOLIDAY: "Holiday",
  SPORTS_DAY: "Sports day",
  FEE_DUE: "Fee due date",
  CUSTOM: "Custom",
};

export const CHANNEL_LABELS: Record<CommunicationChannelType, string> = {
  SMS: "SMS",
  EMAIL: "Email",
  IN_APP: "In-app",
};

export const STATUS_LABELS: Record<ScheduledMessageStatus, string> = {
  PENDING: "Pending",
  SENDING: "Sending",
  SENT: "Sent",
  FAILED: "Failed",
  SKIPPED: "Skipped",
  CANCELLED: "Cancelled",
};

export const STATUS_TONE: Record<ScheduledMessageStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  SENDING: "bg-sky-50 text-sky-700 border-sky-200",
  SENT: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  SKIPPED: "bg-slate-100 text-slate-600 border-slate-200",
  CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
};

export const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPE_LABELS).map(
  ([value, label]) => ({ value: value as CalendarEventType, label }),
);

export const ALL_CHANNELS: CommunicationChannelType[] = [
  "SMS",
  "EMAIL",
  "IN_APP",
];

export function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toIsoFromDateInput(value: string): string {
  // A `<input type="date">` value (YYYY-MM-DD) → ISO at local midnight.
  return new Date(`${value}T00:00:00`).toISOString();
}
