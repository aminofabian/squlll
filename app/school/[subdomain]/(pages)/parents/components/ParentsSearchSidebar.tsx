"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ParentAvatar } from "./ParentAvatar";
import type { ParentsListItem } from "../utils/mapGraphqlParent";

interface ParentsSearchSidebarProps {
  parents: ParentsListItem[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedParentId: string | null;
  onParentSelect: (parentId: string) => void;
  displayedParentsCount: number;
  onLoadMore: () => void;
}

export function ParentsSearchSidebar({
  parents,
  searchTerm,
  onSearchChange,
  selectedParentId,
  onParentSelect,
  displayedParentsCount,
  onLoadMore,
}: ParentsSearchSidebarProps) {
  const filtered = React.useMemo(() => {
    if (!searchTerm.trim()) return parents;
    const q = searchTerm.toLowerCase();
    return parents.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.students.some(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.admissionNumber.toLowerCase().includes(q),
        ),
    );
  }, [parents, searchTerm]);

  const visible = filtered.slice(0, displayedParentsCount);
  const activeCount = parents.filter((p) => p.status === "active").length;

  return (
    <div className="flex h-full flex-col pt-2">
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
        <Input
          type="text"
          placeholder="Search name, child, phone…"
          className="h-9 border-slate-200/80 bg-white pl-8 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm ? (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-2 rounded p-0.5 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <div className="mb-3 rounded-lg border border-slate-200/80 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
          Directory
        </p>
        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {parents.length}
          </span>{" "}
          parents ·{" "}
          <span className="text-emerald-600">{activeCount} active</span>
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-0.5">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-400">
            {searchTerm ? "No matches" : "No parents yet"}
          </p>
        ) : (
          visible.map((parent) => {
            const isSelected = parent.id === selectedParentId;
            return (
              <button
                key={parent.id}
                type="button"
                onClick={() => onParentSelect(parent.id)}
                className={cn(
                  "w-full rounded-lg border px-2.5 py-2 text-left transition-all",
                  isSelected
                    ? "border-slate-300 bg-white shadow-sm ring-1 ring-slate-200 dark:border-slate-600 dark:bg-slate-900 dark:ring-slate-700"
                    : "border-transparent hover:border-slate-200/80 hover:bg-white/90 dark:hover:border-slate-700 dark:hover:bg-slate-900/60",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <ParentAvatar name={parent.name} size="sm" ring={isSelected} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                        {parent.name}
                      </span>
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          parent.status === "active"
                            ? "bg-emerald-500"
                            : "bg-amber-400",
                        )}
                      />
                    </div>
                    <p className="truncate text-[11px] text-slate-400">
                      {parent.studentCount} child
                      {parent.studentCount !== 1 ? "ren" : ""}
                      {parent.grades[0] ? ` · ${parent.grades[0]}` : ""}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {filtered.length > displayedParentsCount ? (
        <div className="mt-2 shrink-0 border-t border-slate-200/80 pt-2 dark:border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            className="h-7 w-full text-xs text-slate-500 hover:text-slate-700"
          >
            Show more ({Math.min(10, filtered.length - displayedParentsCount)})
          </Button>
        </div>
      ) : null}
    </div>
  );
}
