import {
  Briefcase,
  Bus,
  ClipboardList,
  GraduationCap,
  Presentation,
  School,
  ShieldCheck,
  UserCog,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { normalizeRoleKey, roleTone, type RoleTone } from "@/lib/superadmin/userRoles";

/**
 * Visual tokens for roles and statuses.
 *
 * Each tone keeps literal Tailwind classes so the palette stays greppable and
 * the JIT compiler can see every class name. Tones are resolved in
 * `lib/superadmin/userRoles.ts`; this file only decides how they look.
 */
export interface RoleVisual {
  /** Badge used in table rows and the insight sheet. */
  chip: string;
  /** Stronger variant for a selected role-filter chip. */
  chipActive: string;
  /** Focus ring for filter chips. */
  ring: string;
  dot: string;
  avatar: string;
  iconTile: string;
  text: string;
  bar: string;
}

export const ROLE_TONE_VISUALS: Record<RoleTone, RoleVisual> = {
  rose: {
    chip: "border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300",
    chipActive:
      "border-rose-300 bg-rose-100 text-rose-800 dark:border-rose-700 dark:bg-rose-900/50 dark:text-rose-200",
    ring: "ring-rose-400/40",
    dot: "bg-rose-500",
    avatar:
      "bg-rose-50 text-rose-600 ring-1 ring-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900/60",
    iconTile:
      "bg-rose-100/80 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300",
    text: "text-rose-600 dark:text-rose-400",
    bar: "bg-rose-500",
  },
  indigo: {
    chip: "border-indigo-200/80 bg-indigo-50 text-indigo-700 dark:border-indigo-900/70 dark:bg-indigo-950/40 dark:text-indigo-300",
    chipActive:
      "border-indigo-300 bg-indigo-100 text-indigo-800 dark:border-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200",
    ring: "ring-indigo-400/40",
    dot: "bg-indigo-500",
    avatar:
      "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-900/60",
    iconTile:
      "bg-indigo-100/80 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300",
    text: "text-indigo-600 dark:text-indigo-400",
    bar: "bg-indigo-500",
  },
  sky: {
    chip: "border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-300",
    chipActive:
      "border-sky-300 bg-sky-100 text-sky-800 dark:border-sky-700 dark:bg-sky-900/50 dark:text-sky-200",
    ring: "ring-sky-400/40",
    dot: "bg-sky-500",
    avatar:
      "bg-sky-50 text-sky-600 ring-1 ring-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900/60",
    iconTile: "bg-sky-100/80 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300",
    text: "text-sky-600 dark:text-sky-400",
    bar: "bg-sky-500",
  },
  emerald: {
    chip: "border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300",
    chipActive:
      "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200",
    ring: "ring-emerald-400/40",
    dot: "bg-emerald-500",
    avatar:
      "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900/60",
    iconTile:
      "bg-emerald-100/80 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300",
    text: "text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
  },
  amber: {
    chip: "border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300",
    chipActive:
      "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-200",
    ring: "ring-amber-400/40",
    dot: "bg-amber-500",
    avatar:
      "bg-amber-50 text-amber-600 ring-1 ring-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60",
    iconTile:
      "bg-amber-100/80 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300",
    text: "text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500",
  },
  slate: {
    chip: "border-slate-200/80 bg-slate-50 text-slate-700 dark:border-slate-700/70 dark:bg-slate-800/50 dark:text-slate-300",
    chipActive:
      "border-slate-300 bg-slate-200/80 text-slate-800 dark:border-slate-600 dark:bg-slate-700/60 dark:text-slate-200",
    ring: "ring-slate-400/40",
    dot: "bg-slate-400",
    avatar:
      "bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
    iconTile:
      "bg-slate-100/80 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300",
    text: "text-slate-600 dark:text-slate-400",
    bar: "bg-slate-400",
  },
  stone: {
    chip: "border-stone-200/80 bg-stone-50 text-stone-600 dark:border-stone-700/70 dark:bg-stone-800/50 dark:text-stone-300",
    chipActive:
      "border-stone-300 bg-stone-200/80 text-stone-700 dark:border-stone-600 dark:bg-stone-700/60 dark:text-stone-200",
    ring: "ring-stone-400/40",
    dot: "bg-stone-400",
    avatar:
      "bg-stone-100 text-stone-500 ring-1 ring-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:ring-stone-700",
    iconTile:
      "bg-stone-100/80 text-stone-500 dark:bg-stone-800/80 dark:text-stone-300",
    text: "text-stone-500 dark:text-stone-400",
    bar: "bg-stone-400",
  },
  orange: {
    chip: "border-orange-200/80 bg-orange-50 text-orange-700 dark:border-orange-900/70 dark:bg-orange-950/40 dark:text-orange-300",
    chipActive:
      "border-orange-300 bg-orange-100 text-orange-800 dark:border-orange-700 dark:bg-orange-900/50 dark:text-orange-200",
    ring: "ring-orange-400/40",
    dot: "bg-orange-500",
    avatar:
      "bg-orange-50 text-orange-600 ring-1 ring-orange-200/80 dark:bg-orange-950/40 dark:text-orange-300 dark:ring-orange-900/60",
    iconTile:
      "bg-orange-100/80 text-orange-600 dark:bg-orange-950/60 dark:text-orange-300",
    text: "text-orange-600 dark:text-orange-400",
    bar: "bg-orange-500",
  },
  blue: {
    chip: "border-blue-200/80 bg-blue-50 text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-300",
    chipActive:
      "border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-200",
    ring: "ring-blue-400/40",
    dot: "bg-blue-500",
    avatar:
      "bg-blue-50 text-blue-600 ring-1 ring-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/60",
    iconTile:
      "bg-blue-100/80 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300",
    text: "text-blue-600 dark:text-blue-400",
    bar: "bg-blue-500",
  },
  cyan: {
    chip: "border-cyan-200/80 bg-cyan-50 text-cyan-700 dark:border-cyan-900/70 dark:bg-cyan-950/40 dark:text-cyan-300",
    chipActive:
      "border-cyan-300 bg-cyan-100 text-cyan-800 dark:border-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-200",
    ring: "ring-cyan-400/40",
    dot: "bg-cyan-500",
    avatar:
      "bg-cyan-50 text-cyan-600 ring-1 ring-cyan-200/80 dark:bg-cyan-950/40 dark:text-cyan-300 dark:ring-cyan-900/60",
    iconTile:
      "bg-cyan-100/80 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-300",
    text: "text-cyan-600 dark:text-cyan-400",
    bar: "bg-cyan-500",
  },
  teal: {
    chip: "border-teal-200/80 bg-teal-50 text-teal-700 dark:border-teal-900/70 dark:bg-teal-950/40 dark:text-teal-300",
    chipActive:
      "border-teal-300 bg-teal-100 text-teal-800 dark:border-teal-700 dark:bg-teal-900/50 dark:text-teal-200",
    ring: "ring-teal-400/40",
    dot: "bg-teal-500",
    avatar:
      "bg-teal-50 text-teal-600 ring-1 ring-teal-200/80 dark:bg-teal-950/40 dark:text-teal-300 dark:ring-teal-900/60",
    iconTile:
      "bg-teal-100/80 text-teal-600 dark:bg-teal-950/60 dark:text-teal-300",
    text: "text-teal-600 dark:text-teal-400",
    bar: "bg-teal-500",
  },
};

export function roleVisual(role?: string | null): RoleVisual {
  return ROLE_TONE_VISUALS[roleTone(role)] ?? ROLE_TONE_VISUALS.stone;
}

/**
 * Role glyph rendered with an explicit switch so each icon stays a static
 * component. Keeps the directory table free of "components created during
 * render" warnings.
 */
export function RoleGlyph({
  role,
  className,
}: {
  role?: string | null;
  className?: string;
}) {
  const iconProps = { className, "aria-hidden": true } as const;

  switch (normalizeRoleKey(role)) {
    case "SUPER_ADMIN":
      return <ShieldCheck {...iconProps} />;
    case "SCHOOL_ADMIN":
      return <School {...iconProps} />;
    case "SCHOOL_MANAGER":
      return <Briefcase {...iconProps} />;
    case "TEACHER":
      return <Presentation {...iconProps} />;
    case "TREASURER":
      return <Wallet {...iconProps} />;
    case "STAFF":
      return <UserCog {...iconProps} />;
    case "STUDENT":
      return <GraduationCap {...iconProps} />;
    case "PARENT":
      return <Users {...iconProps} />;
    case "DRIVER":
      return <Bus {...iconProps} />;
    case "CONDUCTOR":
      return <ClipboardList {...iconProps} />;
    default:
      return <UserRound {...iconProps} />;
  }
}

export interface StatusVisual {
  label: string;
  dot: string;
  chip: string;
}

export const STATUS_VISUALS: Record<string, StatusVisual> = {
  ACTIVE: {
    label: "Active",
    dot: "bg-emerald-500",
    chip: "border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  PENDING: {
    label: "Pending",
    dot: "bg-amber-500",
    chip: "border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300",
  },
  SUSPENDED: {
    label: "Suspended",
    dot: "bg-rose-500",
    chip: "border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300",
  },
  EXPIRED: {
    label: "Expired",
    dot: "bg-slate-400",
    chip: "border-slate-200/80 bg-slate-50 text-slate-600 dark:border-slate-700/70 dark:bg-slate-800/50 dark:text-slate-300",
  },
  NONE: {
    label: "No access",
    dot: "bg-stone-400",
    chip: "border-stone-200/80 bg-stone-50 text-stone-500 dark:border-stone-700/70 dark:bg-stone-800/50 dark:text-stone-400",
  },
  PLATFORM: {
    label: "Platform",
    dot: "bg-rose-400",
    chip: "border-rose-200/80 bg-rose-50/70 text-rose-600 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300",
  },
};

export function statusVisual(status?: string | null): StatusVisual {
  return STATUS_VISUALS[normalizeRoleKey(status)] ?? STATUS_VISUALS.NONE;
}

/** "Jane Wanjiku" → "JW"; falls back to a single letter. */
export function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
