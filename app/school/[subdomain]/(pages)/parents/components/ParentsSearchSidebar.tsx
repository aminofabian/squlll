"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ParentAvatar } from "./ParentAvatar";
import type { ParentsListItem } from "../utils/mapGraphqlParent";
import {
  parentsDirectoryMeta,
  parentsGhostButton,
  parentsSearchClearBtn,
  parentsSearchInput,
  parentsSectionLabel,
  parentsSidebarItem,
} from "./parents-ui";

interface ParentsSearchSidebarProps {
  parents: ParentsListItem[];
  totalCount: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedParentId: string | null;
  onParentSelect: (parentId: string) => void;
  displayedParentsCount: number;
  onLoadMore: () => void;
}

export function ParentsSearchSidebar({
  parents,
  totalCount,
  searchTerm,
  onSearchChange,
  selectedParentId,
  onParentSelect,
  displayedParentsCount,
  onLoadMore,
}: ParentsSearchSidebarProps) {
  const visible = parents.slice(0, displayedParentsCount);
  const activeCount = parents.filter((p) => p.status === "active").length;
  const hasFilters = parents.length !== totalCount;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center gap-2 px-0.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Users className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
            Directory
          </p>
          <p className="text-[11px] text-slate-400">Quick jump to a parent</p>
        </div>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
        <Input
          type="text"
          placeholder="Name, email, child, phone…"
          className={parentsSearchInput}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm ? (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className={parentsSearchClearBtn}
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <div className={parentsDirectoryMeta}>
        <p className={parentsSectionLabel}>Showing</p>
        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {parents.length}
          </span>
          {hasFilters ? (
            <span className="text-slate-400"> of {totalCount}</span>
          ) : null}{" "}
          parent{parents.length !== 1 ? "s" : ""}
          {activeCount > 0 ? (
            <>
              {" "}
              ·{" "}
              <span className="text-emerald-600 dark:text-emerald-400">
                {activeCount} active
              </span>
            </>
          ) : null}
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-0.5">
        {parents.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-400">
            {searchTerm || hasFilters
              ? "No matches for current filters"
              : "No parents yet"}
          </p>
        ) : (
          visible.map((parent) => {
            const isSelected = parent.id === selectedParentId;
            return (
              <button
                key={parent.id}
                type="button"
                onClick={() => onParentSelect(parent.id)}
                className={parentsSidebarItem(isSelected)}
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
                        aria-hidden
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

      {parents.length > displayedParentsCount ? (
        <div className="mt-2 shrink-0 border-t border-slate-200/45 pt-2 dark:border-slate-800/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            className={parentsGhostButton}
          >
            Show more ({Math.min(10, parents.length - displayedParentsCount)})
          </Button>
        </div>
      ) : null}
    </div>
  );
}
