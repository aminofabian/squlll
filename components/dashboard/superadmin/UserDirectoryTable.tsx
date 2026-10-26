"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUpDown,
  Building2,
  Check,
  Copy,
  LockKeyhole,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { UserRowActions } from "@/components/dashboard/superadmin/UserRowActions";
import {
  RoleGlyph,
  roleVisual,
  statusVisual,
  userInitials,
} from "@/components/dashboard/superadmin/userRoleVisuals";
import type { AdminUserListItem } from "@/lib/superadmin/types";
import {
  LOGIN_FRESHNESS_STYLES,
  formatExactLogin,
  formatPhoneDisplay,
  formatRelativeLogin,
  loginCountLabel,
  loginFreshness,
  phoneToTelHref,
  phoneToWhatsAppHref,
} from "@/lib/superadmin/userActivity";
import {
  extraSchoolCount,
  groupUsersByRole,
  NO_STATUS,
  primaryMembership,
  resolveUserRole,
  resolveUserStatus,
  roleLabel,
  type UserSortKey,
} from "@/lib/superadmin/userRoles";
import { cn } from "@/lib/utils";

interface UserDirectoryTableProps {
  /** Users for the current page, already sorted. */
  users: AdminUserListItem[];
  grouped: boolean;
  /** Total users per primary role in the filtered result set. */
  roleTotals: Record<string, number>;
  now: Date;
  actionLoadingId: string | null;
  sort: UserSortKey;
  onSortChange: (sort: UserSortKey) => void;
  onOpenUser: (user: AdminUserListItem) => void;
  onToggleStatus: (user: AdminUserListItem) => void;
  onDeleteUser: (user: AdminUserListItem) => void;
  onFilterRole: (role: string) => void;
  emptyState: ReactNode;
}

const ROW_CLASS =
  "group cursor-pointer border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80 focus:bg-slate-50/80 focus:outline-none dark:border-slate-800/60 dark:hover:bg-slate-800/30 dark:focus:bg-slate-800/30";

const HEADER_CLASS =
  "whitespace-nowrap px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500";

function sortDirection(sort: UserSortKey): "ascending" | "descending" {
  return sort === "lastLogin" || sort === "created"
    ? "descending"
    : "ascending";
}

export function UserDirectoryTable({
  users,
  grouped,
  roleTotals,
  now,
  actionLoadingId,
  sort,
  onSortChange,
  onOpenUser,
  onToggleStatus,
  onDeleteUser,
  onFilterRole,
  emptyState,
}: UserDirectoryTableProps) {
  if (users.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800/70 dark:bg-slate-900/80">
        {emptyState}
      </div>
    );
  }

  const groups = grouped ? groupUsersByRole(users) : [];
  const columnCount = grouped ? 6 : 7;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800/70 dark:bg-slate-900/80">
      <div className="overflow-x-auto">
        <table className="w-full min-w-0 border-collapse text-left sm:min-w-[520px]">
          <thead className="bg-slate-50/90 dark:bg-slate-900">
            <tr className="border-b border-slate-200/80 dark:border-slate-800">
              <SortableHeader
                label="Name"
                sortKey="name"
                activeSort={sort}
                onSort={onSortChange}
              />
              <th
                scope="col"
                className={cn(HEADER_CLASS, "hidden min-[1400px]:table-cell")}
              >
                Contact
              </th>
              {!grouped ? (
                <SortableHeader
                  label="Role"
                  sortKey="role"
                  activeSort={sort}
                  onSort={onSortChange}
                  className="hidden sm:table-cell"
                />
              ) : null}
              <SortableHeader
                label="School"
                sortKey="school"
                activeSort={sort}
                onSort={onSortChange}
                className="hidden xl:table-cell"
              />
              <th
                scope="col"
                className={cn(HEADER_CLASS, "hidden sm:table-cell")}
              >
                Status
              </th>
              <SortableHeader
                label="Last sign-in"
                sortKey="lastLogin"
                activeSort={sort}
                onSort={onSortChange}
                className="hidden xl:table-cell"
              />
              <th scope="col" className={cn(HEADER_CLASS, "text-right")}>
                Actions
              </th>
            </tr>
          </thead>

          {grouped ? (
            groups.map((group) => {
              const visual = roleVisual(group.role);
              const total = roleTotals[group.role] ?? group.users.length;

              return (
                <tbody key={group.role}>
                  <tr className="border-y border-slate-200/70 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/60">
                    <td colSpan={columnCount} className="px-3 py-2">
                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => onFilterRole(group.role)}
                          title={`Show only ${group.plural.toLowerCase()}`}
                          className="group/header inline-flex items-center gap-2 rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                          <span
                            className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-lg",
                              visual.iconTile,
                            )}
                          >
                            <RoleGlyph
                              role={group.role}
                              className="h-3.5 w-3.5"
                            />
                          </span>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {group.plural}
                          </span>
                          <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                            {total.toLocaleString()}
                          </span>
                          <span className="hidden text-[10px] font-medium uppercase tracking-wide text-slate-400 opacity-0 transition-opacity group-hover/header:opacity-100 sm:inline">
                            Filter
                          </span>
                        </button>
                        {total > group.users.length ? (
                          <span className="text-[10px] text-slate-400">
                            {group.users.length} on this page
                          </span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                  {group.users.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      now={now}
                      grouped
                      actionLoadingId={actionLoadingId}
                      onOpenUser={onOpenUser}
                      onToggleStatus={onToggleStatus}
                      onDeleteUser={onDeleteUser}
                    />
                  ))}
                </tbody>
              );
            })
          ) : (
            <tbody>
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  now={now}
                  actionLoadingId={actionLoadingId}
                  onOpenUser={onOpenUser}
                  onToggleStatus={onToggleStatus}
                  onDeleteUser={onDeleteUser}
                />
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}

function SortableHeader({
  label,
  sortKey,
  activeSort,
  onSort,
  className,
}: {
  label: string;
  sortKey: UserSortKey;
  activeSort: UserSortKey;
  onSort: (sort: UserSortKey) => void;
  className?: string;
}) {
  const active = activeSort === sortKey;

  return (
    <th
      scope="col"
      aria-sort={active ? sortDirection(sortKey) : "none"}
      className={cn(HEADER_CLASS, className)}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "group/sort inline-flex items-center gap-1 rounded-md transition-colors hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:hover:text-slate-300",
          active && "text-primary dark:text-primary-light",
        )}
        title={`Sort by ${label.toLowerCase()}`}
      >
        {label}
        <ArrowUpDown
          className={cn(
            "h-3 w-3 transition-opacity",
            active
              ? "opacity-100"
              : "opacity-0 group-hover/sort:opacity-60 group-focus-visible/sort:opacity-60",
          )}
        />
      </button>
    </th>
  );
}

function UserRow({
  user,
  now,
  grouped = false,
  actionLoadingId,
  onOpenUser,
  onToggleStatus,
  onDeleteUser,
}: {
  user: AdminUserListItem;
  now: Date;
  grouped?: boolean;
  actionLoadingId: string | null;
  onOpenUser: (user: AdminUserListItem) => void;
  onToggleStatus: (user: AdminUserListItem) => void;
  onDeleteUser: (user: AdminUserListItem) => void;
}) {
  const membership = primaryMembership(user);
  const role = resolveUserRole(user);
  const status = resolveUserStatus(user);
  const visual = roleVisual(role);
  // A global admin has no school membership, so "No access" would be
  // misleading — show the platform grant instead.
  const displayStatus =
    user.isGlobalAdmin && status === NO_STATUS ? "PLATFORM" : status;
  const statusTone = statusVisual(displayStatus);
  const extras = extraSchoolCount(user);

  return (
    <tr
      tabIndex={0}
      aria-label={`Open profile for ${user.name}`}
      onClick={() => onOpenUser(user)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenUser(user);
        }
      }}
      title="Open user profile"
      className={ROW_CLASS}
    >
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold",
              visual.avatar,
            )}
          >
            {userInitials(user.name)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="max-w-[180px] truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {user.name}
              </p>
              {user.isGlobalAdmin ? (
                <span
                  title="Platform administrator"
                  className="inline-flex flex-shrink-0 items-center gap-0.5 rounded-full bg-rose-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
                >
                  <ShieldCheck className="h-2.5 w-2.5" />
                  Platform
                </span>
              ) : null}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:hidden">
              {!grouped ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                    visual.chip,
                  )}
                >
                  <RoleGlyph role={role} className="h-2.5 w-2.5" />
                  {roleLabel(role)}
                </span>
              ) : null}
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                  statusTone.chip,
                )}
              >
                <span
                  className={cn("h-1 w-1 rounded-full", statusTone.dot)}
                  aria-hidden
                />
                {statusTone.label}
              </span>
            </div>
            <p className="mt-0.5 truncate text-[11px] text-slate-400 min-[1400px]:hidden">
              {user.email}
            </p>
          </div>
        </div>
      </td>

      <td
        className="hidden px-3 py-3 min-[1400px]:table-cell"
        onClick={(event) => event.stopPropagation()}
      >
        <ContactCell user={user} />
      </td>

      {!grouped ? (
        <td className="hidden px-3 py-3 sm:table-cell">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium",
              visual.chip,
            )}
            title={roleLabel(role)}
          >
            <RoleGlyph role={role} className="h-3 w-3" />
            {roleLabel(role)}
          </span>
        </td>
      ) : null}

      <td className="hidden px-3 py-3 xl:table-cell">
        {membership ? (
          <div className="flex min-w-0 items-center gap-2">
            <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-slate-300 dark:text-slate-600" />
            <div className="min-w-0">
              <p className="max-w-[170px] truncate text-sm text-slate-600 dark:text-slate-300">
                {membership.tenantName}
              </p>
              <p className="max-w-[170px] truncate text-[11px] text-slate-400">
                {extras > 0
                  ? `+${extras} more school${extras === 1 ? "" : "s"}`
                  : membership.tenantSubdomain
                    ? `${membership.tenantSubdomain}.squl.co.ke`
                    : "—"}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-400">No school linked</span>
        )}
      </td>

      <td className="hidden px-3 py-3 sm:table-cell">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium",
            statusTone.chip,
          )}
        >
          <span
            className={cn("h-1.5 w-1.5 rounded-full", statusTone.dot)}
            aria-hidden
          />
          {statusTone.label}
        </span>
      </td>

      <td className="hidden px-3 py-3 xl:table-cell">
        <LastSignInCell user={user} now={now} />
      </td>

      <td
        className="px-3 py-3 text-right"
        onClick={(event) => event.stopPropagation()}
      >
        {user.isGlobalAdmin ? (
          <span
            title="Platform administrators cannot be suspended or deleted here"
            aria-label="Protected platform administrator"
            className="inline-flex h-8 w-8 items-center justify-center text-slate-300 dark:text-slate-600"
          >
            <LockKeyhole className="h-3.5 w-3.5" />
          </span>
        ) : (
          <UserRowActions
            status={status}
            loading={actionLoadingId === user.id}
            onToggleStatus={() => onToggleStatus(user)}
            onDelete={() => onDeleteUser(user)}
          />
        )}
      </td>
    </tr>
  );
}

function ContactCell({ user }: { user: AdminUserListItem }) {
  const telHref = phoneToTelHref(user.phoneNumber);
  const whatsappHref = phoneToWhatsAppHref(user.phoneNumber);

  return (
    <div className="min-w-0 max-w-[195px]">
      <p className="truncate text-sm text-slate-600 dark:text-slate-400">
        {user.email}
      </p>
      {user.phoneNumber ? (
        <div className="mt-1 flex items-center gap-1.5">
          {telHref ? (
            <a
              href={telHref}
              className="truncate font-mono text-[11px] font-medium text-slate-500 hover:text-primary hover:underline dark:text-slate-400"
              title="Call"
            >
              {formatPhoneDisplay(user.phoneNumber)}
            </a>
          ) : (
            <span className="truncate font-mono text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {formatPhoneDisplay(user.phoneNumber)}
            </span>
          )}
          <span className="flex flex-shrink-0 items-center gap-0.5">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                title="Message on WhatsApp"
                className="rounded-md p-1 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
              >
                <MessageCircle className="h-3 w-3" />
              </a>
            ) : null}
            <CopyPhoneButton value={user.phoneNumber} />
          </span>
        </div>
      ) : (
        <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
          <Phone className="h-3 w-3" />
          No phone
        </p>
      )}
    </div>
  );
}

function LastSignInCell({
  user,
  now,
}: {
  user: AdminUserListItem;
  now: Date;
}) {
  const freshness = loginFreshness(user.lastLoginAt, now);
  const tone = LOGIN_FRESHNESS_STYLES[freshness];

  return (
    <div
      title={formatExactLogin(user.lastLoginAt)}
      className="min-w-0 max-w-[140px]"
    >
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "h-1.5 w-1.5 flex-shrink-0 rounded-full",
            tone.dot,
            freshness === "live" && "animate-pulse",
          )}
        />
        <span
          suppressHydrationWarning
          className={cn("truncate text-sm font-medium", tone.text)}
        >
          {formatRelativeLogin(user.lastLoginAt, now)}
        </span>
      </div>
      <p className="mt-0.5 truncate text-[11px] text-slate-400">
        {loginCountLabel(user.loginCount)}
      </p>
    </div>
  );
}

function CopyPhoneButton({ value }: { value: string }) {
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
      // Clipboard permissions can be denied; the number remains visible.
    }
  };

  return (
    <button
      type="button"
      onClick={() => void copy()}
      title={copied ? "Copied" : "Copy phone number"}
      aria-label={copied ? "Copied" : "Copy phone number"}
      className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-600" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  );
}
