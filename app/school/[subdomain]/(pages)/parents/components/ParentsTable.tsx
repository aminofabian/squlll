"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ParentAvatar } from "./ParentAvatar";
import { parentsPanel, parentsSectionHead, parentsTh } from "./parents-ui";
import {
  formatRelationship,
  relationshipBadgeClass,
} from "../utils/parents-utils";
import type { ParentsListItem } from "../utils/mapGraphqlParent";
import { isParentProfileIncomplete } from "../utils/mapGraphqlParent";
import { AlertTriangle, ChevronRight, User } from "lucide-react";

interface ParentsTableProps {
  parents: ParentsListItem[];
  onParentSelect: (parentId: string) => void;
  totalCount?: number;
}

function statusBadge(status: ParentsListItem["status"]) {
  if (status === "active") {
    return "rounded-none border-[#246a59]/25 bg-[#e8f2ef] text-[#1a4d42]";
  }
  return "rounded-none border-amber-200/80 bg-amber-50 text-amber-800";
}

function statusLabel(status: ParentsListItem["status"]) {
  return status === "active" ? "Active" : "Not activated";
}

export function ParentsTable({
  parents,
  onParentSelect,
  totalCount,
}: ParentsTableProps) {
  const incompleteCount = parents.filter(isParentProfileIncomplete).length;
  const filteredFromTotal =
    totalCount !== undefined && totalCount !== parents.length;

  return (
    <div className={parentsPanel}>
      <div
        className={cn(
          parentsSectionHead,
          "flex flex-wrap items-center justify-between gap-2 px-3 py-1.5",
        )}
      >
        <div className="min-w-0">
          <h2 className="text-xs font-semibold text-[#0a1f1a] dark:text-white">
            Directory
          </h2>
          <p className="truncate text-[10px] text-[#1a4d42]/45">
            {filteredFromTotal
              ? `${parents.length} of ${totalCount} shown`
              : `${parents.length} shown`}
          </p>
        </div>
      </div>

      {parents.length === 0 ? (
        <div className="px-3 py-10 text-center">
          <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-none bg-[#246a59]/10">
            <User className="h-4 w-4 text-[#246a59]" />
          </div>
          <p className="text-sm font-medium text-[#0a1f1a] dark:text-white">
            No parents match
          </p>
          <p className="mt-0.5 text-[11px] text-[#1a4d42]/50">
            Try a different filter or search.
          </p>
        </div>
      ) : (
        <>
          <div className="max-h-[min(52vh,420px)] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-[#1a4d42]/10 bg-[#f8fbfa] text-left dark:border-white/10 dark:bg-[#071411]">
                  <th className={cn(parentsTh, "w-8 px-2 py-1.5")}>#</th>
                  <th className={cn(parentsTh, "px-2 py-1.5")}>Parent</th>
                  <th className={cn(parentsTh, "px-2 py-1.5")}>Status</th>
                  <th className={cn(parentsTh, "hidden px-2 py-1.5 sm:table-cell")}>
                    Contact
                  </th>
                  <th className={cn(parentsTh, "px-2 py-1.5")}>Relation</th>
                  <th className={cn(parentsTh, "hidden px-2 py-1.5 md:table-cell")}>
                    Children
                  </th>
                  <th className={cn(parentsTh, "hidden px-2 py-1.5 lg:table-cell")}>
                    Grades
                  </th>
                  <th className={cn(parentsTh, "w-8 px-1 py-1.5")} />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a4d42]/08 dark:divide-white/10">
                {parents.map((parent, index) => {
                  const isIncomplete = isParentProfileIncomplete(parent);
                  return (
                    <tr
                      key={parent.id}
                      className={cn(
                        "group cursor-pointer text-[#1a4d42]/80 transition-colors hover:bg-[#f8fbfa] dark:text-white/70 dark:hover:bg-white/5",
                        isIncomplete && "bg-amber-50/40 dark:bg-amber-950/10",
                      )}
                      onClick={() => onParentSelect(parent.id)}
                    >
                      <td className="px-2 py-1.5 text-[10px] tabular-nums text-[#1a4d42]/35">
                        {index + 1}
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-2">
                          <ParentAvatar name={parent.name} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-[#0a1f1a] dark:text-white">
                              {parent.name}
                            </p>
                            {parent.occupation ? (
                              <p className="truncate text-[10px] text-[#1a4d42]/40">
                                {parent.occupation}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-1.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-normal",
                            statusBadge(parent.status),
                          )}
                        >
                          {statusLabel(parent.status)}
                        </Badge>
                      </td>
                      <td className="hidden px-2 py-1.5 sm:table-cell">
                        <p
                          className="max-w-[140px] truncate text-[11px] text-[#1a4d42]/65"
                          title={parent.email}
                        >
                          {parent.email || "—"}
                        </p>
                        <p className="text-[10px] text-[#1a4d42]/40">
                          {parent.phone || "—"}
                        </p>
                      </td>
                      <td className="px-2 py-1.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-normal capitalize",
                            relationshipBadgeClass(parent.relationship),
                          )}
                        >
                          {formatRelationship(parent.relationship)}
                        </Badge>
                      </td>
                      <td className="hidden px-2 py-1.5 md:table-cell">
                        <p className="text-[11px] text-[#1a4d42]/65">
                          {parent.studentCount}{" "}
                          {parent.studentCount === 1 ? "child" : "children"}
                        </p>
                        {parent.students[0] ? (
                          <p className="max-w-[140px] truncate text-[10px] text-[#1a4d42]/40">
                            {parent.students[0].name}
                            {parent.studentCount > 1
                              ? ` +${parent.studentCount - 1}`
                              : ""}
                          </p>
                        ) : null}
                      </td>
                      <td className="hidden px-2 py-1.5 lg:table-cell">
                        <p className="max-w-[120px] truncate text-[11px] text-[#1a4d42]/65">
                          {parent.grades.length > 0
                            ? parent.grades.slice(0, 2).join(", ") +
                              (parent.grades.length > 2
                                ? ` +${parent.grades.length - 2}`
                                : "")
                            : "—"}
                        </p>
                      </td>
                      <td className="px-1 py-1.5">
                        <ChevronRight className="h-3.5 w-3.5 text-[#1a4d42]/25 transition-transform group-hover:translate-x-0.5 group-hover:text-[#246a59]" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {incompleteCount > 0 ? (
            <div className="flex items-center gap-1.5 border-t border-[#246a59]/15 bg-[#e8f2ef] px-3 py-1.5 text-[10px] text-[#1a4d42] dark:border-[#246a59]/25 dark:bg-[#246a59]/15 dark:text-[#d4e8e2]">
              <AlertTriangle className="h-3 w-3 shrink-0 text-[#246a59]" />
              {incompleteCount} incomplete profile
              {incompleteCount !== 1 ? "s" : ""} — open a row to finish.
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
