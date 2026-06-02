"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ParentAvatar } from "./ParentAvatar";
import { parentsPanel, parentsTh } from "./parents-ui";
import {
  formatRelationship,
  relationshipBadgeClass,
} from "../utils/parents-utils";
import type { ParentsListItem } from "../utils/mapGraphqlParent";
import { isParentProfileIncomplete } from "../utils/mapGraphqlParent";
import { ChevronRight, User } from "lucide-react";

interface ParentsTableProps {
  parents: ParentsListItem[];
  onParentSelect: (parentId: string) => void;
}

function statusBadge(status: ParentsListItem["status"]) {
  if (status === "active") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-700";
}

function statusLabel(status: ParentsListItem["status"]) {
  return status === "active" ? "Active" : "Not activated";
}

export function ParentsTable({ parents, onParentSelect }: ParentsTableProps) {
  const incompleteCount = parents.filter(isParentProfileIncomplete).length;

  return (
    <div className={parentsPanel}>
      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <h2 className="text-sm font-medium text-slate-800 dark:text-slate-100">
          All parents
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Click a row to view full profile · {parents.length} shown
        </p>
      </div>

      {parents.length === 0 ? (
        <div className="px-4 py-14 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <User className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            No parents match
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Try a different filter or search term.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left dark:border-slate-800 dark:bg-slate-900/60">
                <th className={cn(parentsTh, "w-10")}>#</th>
                <th className={parentsTh}>Parent</th>
                <th className={parentsTh}>Status</th>
                <th className={cn(parentsTh, "hidden sm:table-cell")}>Contact</th>
                <th className={parentsTh}>Relationship</th>
                <th className={cn(parentsTh, "hidden md:table-cell")}>Children</th>
                <th className={cn(parentsTh, "hidden lg:table-cell")}>Grades</th>
                <th className={cn(parentsTh, "w-10")} />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {parents.map((parent, index) => {
                const isIncomplete = isParentProfileIncomplete(parent);
                return (
                <tr
                  key={parent.id}
                  className={cn(
                    "group cursor-pointer text-slate-700 transition-colors hover:bg-slate-50/80 dark:text-slate-300 dark:hover:bg-slate-800/40",
                    isIncomplete && "bg-amber-50/30 dark:bg-amber-950/10",
                  )}
                  onClick={() => onParentSelect(parent.id)}
                >
                  <td className="px-4 py-3 text-xs tabular-nums text-slate-400">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ParentAvatar name={parent.name} size="md" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                          {parent.name}
                        </p>
                        {parent.occupation ? (
                          <p className="truncate text-[11px] text-slate-400">
                            {parent.occupation}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-normal",
                        statusBadge(parent.status),
                      )}
                    >
                      {statusLabel(parent.status)}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <p
                      className="max-w-[160px] truncate text-xs text-slate-600"
                      title={parent.email}
                    >
                      {parent.email || "—"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {parent.phone || "—"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-normal capitalize",
                        relationshipBadgeClass(parent.relationship),
                      )}
                    >
                      {formatRelationship(parent.relationship)}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {parent.studentCount}{" "}
                      {parent.studentCount === 1 ? "child" : "children"}
                    </p>
                    {parent.students[0] ? (
                      <p className="max-w-[180px] truncate text-[11px] text-slate-400">
                        {parent.students[0].name}
                        {parent.studentCount > 1
                          ? ` +${parent.studentCount - 1} more`
                          : ""}
                      </p>
                    ) : null}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <div className="flex max-w-[160px] flex-wrap gap-1">
                      {parent.grades.slice(0, 2).map((grade) => (
                        <Badge
                          key={grade}
                          variant="outline"
                          className="border-sky-200 bg-sky-50 px-1.5 py-0 text-[10px] font-normal text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-400"
                        >
                          {grade}
                        </Badge>
                      ))}
                      {parent.grades.length > 2 ? (
                        <span className="text-[11px] text-slate-400">
                          +{parent.grades.length - 2}
                        </span>
                      ) : null}
                      {parent.grades.length === 0 ? (
                        <span className="text-xs text-slate-400">—</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
          {incompleteCount > 0 ? (
            <div className="flex items-center gap-2 border-t border-amber-100 bg-amber-50/50 px-4 py-2.5 text-xs text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400">
              {incompleteCount} parent{incompleteCount !== 1 ? "s have" : " has"}{" "}
              incomplete profiles — open the profile to review missing details.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
