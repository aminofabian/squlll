import type {
  CommAudience,
  CommAudienceOptions,
  CommCampaignStatus,
  CommChannel,
  CommPermissionKey,
  CommStatus,
} from "./communicationsHubApi";

export const CHANNEL_META: Record<
  CommChannel,
  { label: string; short: string; tone: string; dot: string }
> = {
  SMS: {
    label: "SMS",
    short: "SMS",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  EMAIL: {
    label: "Email",
    short: "Email",
    tone: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20",
    dot: "bg-sky-500",
  },
  WHATSAPP: {
    label: "WhatsApp",
    short: "WhatsApp",
    tone: "bg-lime-50 text-lime-700 border-lime-200 dark:bg-lime-500/10 dark:text-lime-300 dark:border-lime-500/20",
    dot: "bg-lime-500",
  },
  IN_APP: {
    label: "In-app",
    short: "In-app",
    tone: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20",
    dot: "bg-violet-500",
  },
};

export const CAMPAIGN_STATUS_META: Record<
  CommCampaignStatus,
  { label: string; tone: string; description: string }
> = {
  DRAFT: {
    label: "Draft",
    tone: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-slate-200 dark:border-white/10",
    description: "Saved but not sending. Edit or send when ready.",
  },
  SCHEDULED: {
    label: "Scheduled",
    tone: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20",
    description: "Queued for a future time.",
  },
  SENDING: {
    label: "Sending",
    tone: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
    description: "Messages are being delivered.",
  },
  SENT: {
    label: "Sent",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
    description: "Every queued message reached a terminal state.",
  },
  PARTIALLY_SENT: {
    label: "Partly sent",
    tone: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20",
    description: "Some recipients failed. Review and retry from the report.",
  },
  FAILED: {
    label: "Failed",
    tone: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20",
    description: "No message could be delivered.",
  },
  CANCELLED: {
    label: "Cancelled",
    tone: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10",
    description: "Withdrawn before sending.",
  },
};

export const MESSAGE_STATUS_META: Record<
  CommStatus,
  { label: string; tone: string }
> = {
  PENDING: {
    label: "Queued",
    tone: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/20",
  },
  SENDING: {
    label: "Sending",
    tone: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
  },
  SENT: {
    label: "Sent",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
  },
  FAILED: {
    label: "Failed",
    tone: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20",
  },
  SKIPPED: {
    label: "Skipped",
    tone: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/10",
  },
  CANCELLED: {
    label: "Cancelled",
    tone: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10",
  },
};

export const AUDIENCE_LABELS: Record<string, string> = {
  ALL_PARENTS: "All parents",
  ALL_STAFF: "All staff",
  ALL_TEACHERS: "All teachers",
  ADMINS: "School administrators",
  DEBTORS: "Parents with a balance",
  GRADE: "A grade",
  STREAM: "A class",
  STUDENTS: "Selected students",
  PARENTS_WITH_ACCOUNT: "Parents with a portal account",
  PARENTS_WITHOUT_ACCOUNT: "Parents without a portal account",
  EVENT_RECIPIENTS: "People involved in the event",
};

export const MERGE_TAG_GROUPS: Array<{ label: string; tags: string[] }> = [
  {
    label: "School",
    tags: ["school.name"],
  },
  {
    label: "Recipient",
    tags: ["recipient.name", "parent.name", "teacher.name"],
  },
  {
    label: "Student",
    tags: [
      "student.name",
      "student.class",
      "student.grade",
      "student.stream",
      "student.admissionNumber",
    ],
  },
  {
    label: "Money",
    tags: [
      "payment.amount",
      "payment.receiptNumber",
      "payment.invoiceNumber",
      "balance",
    ],
  },
  {
    label: "Event",
    tags: ["event.title", "event.date", "attendance.date"],
  },
];

export function can(
  permissions: CommPermissionKey[] | undefined,
  permission: CommPermissionKey,
): boolean {
  return Boolean(permissions?.includes(permission));
}

export function formatDateTime(value: string | null | undefined): string {
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

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatRelative(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (Math.abs(seconds) < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return `${minutes}m ${minutes < 0 ? "from now" : "ago"}`;
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return `${hours}h ${hours < 0 ? "from now" : "ago"}`;
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 7) return `${days}d ${days < 0 ? "from now" : "ago"}`;
  return formatDate(value);
}

export function formatNumber(value: number | null | undefined): string {
  return Number(value ?? 0).toLocaleString();
}

export function channelListLabel(channels: CommChannel[]): string {
  if (!channels?.length) return "No channels";
  return channels.map((channel) => CHANNEL_META[channel]?.label ?? channel).join(" · ");
}

export function audienceLabel(
  audience: CommAudience | null | undefined,
  options?: CommAudienceOptions | null,
): string {
  if (!audience) return "No audience";
  const base = AUDIENCE_LABELS[audience.type] ?? audience.type.replaceAll("_", " ");
  if (audience.type === "GRADE") {
    const name =
      options?.grades.find((grade) => grade.id === audience.gradeId)?.name ??
      (audience.gradeIds?.length
        ? `${audience.gradeIds.length} grades`
        : null);
    return name ? `${base}: ${name}` : base;
  }
  if (audience.type === "STREAM") {
    const name =
      options?.streams.find((stream) => stream.id === audience.streamId)?.name ??
      (audience.streamIds?.length
        ? `${audience.streamIds.length} classes`
        : null);
    return name ? `${base}: ${name}` : base;
  }
  if (audience.type === "STUDENTS") {
    const count = audience.studentIds?.length ?? 0;
    return `${base}: ${count} student${count === 1 ? "" : "s"}`;
  }
  return base;
}

export function insertMergeTag(
  value: string,
  tag: string,
  selectionStart?: number | null,
  selectionEnd?: number | null,
): { value: string; cursor: number } {
  const start = selectionStart ?? value.length;
  const end = selectionEnd ?? value.length;
  const token = `{{${tag}}}`;
  const next = `${value.slice(0, start)}${token}${value.slice(end)}`;
  return { value: next, cursor: start + token.length };
}

export function truncate(value: string | null | undefined, length = 120): string {
  if (!value) return "";
  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}

export function deliveryTone(rate: number): string {
  if (rate >= 95) return "text-emerald-600 dark:text-emerald-400";
  if (rate >= 80) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

export function isSendable(status: CommCampaignStatus): boolean {
  return status === "DRAFT";
}

export function canEdit(status: CommCampaignStatus): boolean {
  return status === "DRAFT";
}

export function canCancel(status: CommCampaignStatus): boolean {
  return ["SCHEDULED", "SENDING", "DRAFT"].includes(status);
}

export function canDelete(status: CommCampaignStatus): boolean {
  return ["DRAFT", "CANCELLED"].includes(status);
}

/** SMS segments are estimated client-side only for the composer helper text. */
export function estimateSegments(text: string): number {
  if (!text) return 0;
  const gsm =
    /^[@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&'()*+,\-./0-9:;<=>?¡A-ZÄÖÑÜ§¿a-zäöñüà]*$/.test(
      text,
    );
  const single = gsm ? 160 : 70;
  const multi = gsm ? 153 : 67;
  return text.length <= single ? 1 : Math.ceil(text.length / multi);
}

export function audienceIsValid(audience: CommAudience): boolean {
  if (!audience?.type) return false;
  if (audience.type === "GRADE") {
    return Boolean(audience.gradeId || audience.gradeIds?.length);
  }
  if (audience.type === "STREAM") {
    return Boolean(audience.streamId || audience.streamIds?.length);
  }
  if (audience.type === "STUDENTS") {
    return Boolean(audience.studentIds?.length);
  }
  return true;
}
