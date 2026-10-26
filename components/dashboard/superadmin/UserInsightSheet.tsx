"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  Mail,
  MessageCircle,
  Phone,
  Shield,
  Sparkles,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { AdminUserListItem } from "@/lib/superadmin/types";
import {
  primaryMembership,
  resolveUserRole,
  roleLabel,
} from "@/lib/superadmin/userRoles";
import {
  RoleGlyph,
  roleVisual,
  statusVisual,
} from "@/components/dashboard/superadmin/userRoleVisuals";
import {
  LOGIN_FRESHNESS_STYLES,
  accountAgeLabel,
  formatExactLogin,
  formatPhoneDisplay,
  formatRelativeLogin,
  loginCountLabel,
  loginFreshness,
  phoneToTelHref,
  phoneToWhatsAppHref,
} from "@/lib/superadmin/userActivity";
import { cn } from "@/lib/utils";

interface UserInsightSheetProps {
  user: AdminUserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserInsightSheet({
  user,
  open,
  onOpenChange,
}: UserInsightSheetProps) {
  if (!user) return null;

  const membership = primaryMembership(user);
  const role = resolveUserRole(user);
  const roleStyle = roleVisual(role);
  const freshness = loginFreshness(user.lastLoginAt);
  const tone = LOGIN_FRESHNESS_STYLES[freshness];
  const telHref = phoneToTelHref(user.phoneNumber);
  const whatsappHref = phoneToWhatsAppHref(user.phoneNumber);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-md">
        <SheetHeader className="border-b border-slate-100 p-6 pr-14 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-lg font-bold text-primary dark:from-primary/25 dark:to-primary/10">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <SheetTitle className="truncate text-lg text-slate-900 dark:text-slate-100">
                {user.name}
              </SheetTitle>
              <SheetDescription className="truncate text-xs">
                {user.email}
              </SheetDescription>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                roleStyle.chip,
              )}
            >
              <RoleGlyph role={role} className="h-3 w-3" />
              {roleLabel(role)}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-medium dark:bg-slate-800/70",
                tone.text,
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  tone.dot,
                  freshness === "live" && "animate-pulse",
                )}
              />
              {tone.label}
            </span>
            {user.isGlobalAdmin ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500">
                <Shield className="h-3 w-3" /> Platform admin
              </span>
            ) : null}
          </div>
        </SheetHeader>

        <div className="space-y-6 p-6">
          {/* Contact */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Contact
            </h3>
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4 dark:border-slate-800/70 dark:bg-slate-900/40">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-400">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Phone
                  </p>
                  {user.phoneNumber ? (
                    <>
                      <p className="mt-0.5 font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {formatPhoneDisplay(user.phoneNumber)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Captured during onboarding
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {telHref ? (
                          <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 rounded-lg px-2.5 text-xs">
                            <a href={telHref}>
                              <Phone className="h-3.5 w-3.5" /> Call
                            </a>
                          </Button>
                        ) : null}
                        {whatsappHref ? (
                          <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 rounded-lg px-2.5 text-xs text-emerald-700 hover:text-emerald-800 dark:text-emerald-400">
                            <a href={whatsappHref} target="_blank" rel="noreferrer">
                              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                            </a>
                          </Button>
                        ) : null}
                        <CopyButton value={user.phoneNumber} />
                      </div>
                    </>
                  ) : (
                    <div className="mt-1 flex items-start gap-2 rounded-xl border border-dashed border-amber-300/70 bg-amber-50/60 px-3 py-2 text-xs text-amber-700 dark:border-amber-700/50 dark:bg-amber-950/20 dark:text-amber-400">
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                      <span>
                        No phone captured during onboarding. Add one next time
                        you create a user, or ask this person to update their
                        profile.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-start gap-3 border-t border-slate-200/70 pt-4 dark:border-slate-800/70">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Email
                  </p>
                  <a
                    href={`mailto:${user.email}`}
                    className="mt-0.5 block truncate text-sm font-medium text-slate-800 hover:text-primary dark:text-slate-200"
                  >
                    {user.email}
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Sign-in activity */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Sign-in activity
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat
                icon={<Clock3 className="h-3.5 w-3.5" />}
                label="Last sign-in"
                value={formatRelativeLogin(user.lastLoginAt)}
                helper={formatExactLogin(user.lastLoginAt)}
                accent={tone.text}
              />
              <MiniStat
                icon={<BadgeCheck className="h-3.5 w-3.5" />}
                label="Total sign-ins"
                value={String(user.loginCount ?? 0)}
                helper={loginCountLabel(user.loginCount)}
              />
            </div>

            <div className="relative rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-slate-800/70 dark:bg-slate-900/60">
              <TimelineRow
                icon={<CalendarDays className="h-3.5 w-3.5" />}
                title="Account created"
                detail={new Date(user.createdAt).toLocaleString("en-KE", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
                sub={accountAgeLabel(user.createdAt)}
                complete
              />
              <TimelineRow
                icon={<Clock3 className="h-3.5 w-3.5" />}
                title={user.lastLoginAt ? "Last sign-in" : "Awaiting first sign-in"}
                detail={formatExactLogin(user.lastLoginAt)}
                sub={
                  user.lastLoginAt
                    ? `${loginCountLabel(user.loginCount)} since onboarding`
                    : "This account has not signed in since it was created."
                }
                complete={Boolean(user.lastLoginAt)}
                last
              />
            </div>
          </section>

          {/* Membership */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              School access
            </h3>
            {user.memberships.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400 dark:border-slate-800">
                No school membership linked yet.
              </div>
            ) : (
              <div className="space-y-2">
                {user.memberships.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-3 dark:border-slate-800/70 dark:bg-slate-900/60"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Building2 className="h-4 w-4 flex-shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                          {item.tenantName}
                        </p>
                        <p className="truncate text-[11px] text-slate-400">
                          {item.tenantSubdomain}.squl.co.ke
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-medium",
                          roleVisual(item.role).chip,
                        )}
                        title={roleLabel(item.role)}
                      >
                        {roleLabel(item.role)}
                        {item.id === membership?.id ? (
                          <span className="text-[8px] font-semibold uppercase tracking-wide opacity-70">
                            primary
                          </span>
                        ) : null}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-medium",
                          statusVisual(item.status).chip,
                        )}
                      >
                        <span
                          className={cn(
                            "h-1 w-1 rounded-full",
                            statusVisual(item.status).dot,
                          )}
                        />
                        {statusVisual(item.status).label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <p className="text-center text-[11px] leading-relaxed text-slate-400">
            Activity updates automatically each time this user signs in.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MiniStat({
  icon,
  label,
  value,
  helper,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-3.5 dark:border-slate-800/70 dark:bg-slate-900/60">
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>
      <p className={cn("mt-1 text-lg font-bold tracking-tight", accent ?? "text-slate-900 dark:text-slate-100")}>
        {value}
      </p>
      <p className="mt-0.5 truncate text-[11px] text-slate-400" title={helper}>
        {helper}
      </p>
    </div>
  );
}

function TimelineRow({
  icon,
  title,
  detail,
  sub,
  complete,
  last,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  sub: string;
  complete?: boolean;
  last?: boolean;
}) {
  return (
    <div className="relative flex gap-3 pb-4 last:pb-0">
      {!last ? (
        <span className="absolute left-[13px] top-7 h-[calc(100%-1rem)] w-px bg-slate-200 dark:bg-slate-700" />
      ) : null}
      <span
        className={cn(
          "relative z-10 mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border",
          complete
            ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
            : "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {title}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{detail}</p>
        <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>
      </div>
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard permission can be denied; the number stays visible.
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="h-8 gap-1.5 rounded-lg px-2.5 text-xs"
      onClick={() => void copy()}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" /> Copy
        </>
      )}
    </Button>
  );
}
