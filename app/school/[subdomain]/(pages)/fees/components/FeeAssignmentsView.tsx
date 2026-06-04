"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { FeeAssignmentsDataTable } from "./FeeAssignmentsDataTable";
import { FeeAssignmentsSummary } from "./FeeAssignmentsSummary";
import {
  FeeAssignmentsToolbar,
  type ClassLinksFilter,
  type FilterCounts,
} from "./FeeAssignmentsToolbar";
import { FeeAssignmentsSummarySkeleton } from "./FeeAssignmentsSkeletons";
import { useFeeAssignments } from "../hooks/useFeeAssignments";
import { FEES_LAYOUT } from "../lib/fees-ui";
import { downloadCsv } from "../lib/exportCsv";
import {
  assignmentLine,
  buildClassLinksStats,
  gradeLabels,
} from "../lib/feeAssignmentDisplay";

function matchesFilter(
  filter: ClassLinksFilter,
  totalStudents: number,
  isActive: boolean,
): boolean {
  if (filter === "all") return true;
  if (filter === "ready") return isActive && totalStudents > 0;
  if (filter === "needs_students") return isActive && totalStudents === 0;
  if (filter === "inactive") return !isActive;
  return true;
}

export const FeeAssignmentsView = () => {
  const { data, loading, error, refetch } = useFeeAssignments();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ClassLinksFilter>("all");

  const stats = useMemo(
    () => (data ? buildClassLinksStats(data) : null),
    [data],
  );

  const filterCounts = useMemo((): FilterCounts | null => {
    if (!data) return null;
    const list = data.feeAssignments;
    return {
      all: list.length,
      ready: list.filter(
        (g) => g.feeAssignment.isActive && g.totalStudents > 0,
      ).length,
      needs_students: list.filter(
        (g) => g.feeAssignment.isActive && g.totalStudents === 0,
      ).length,
      inactive: list.filter((g) => !g.feeAssignment.isActive).length,
    };
  }, [data]);

  const filteredGroups = useMemo(() => {
    if (!data?.feeAssignments) return [];
    let list = data.feeAssignments.filter((g) =>
      matchesFilter(
        filter,
        g.totalStudents,
        g.feeAssignment.isActive,
      ),
    );

    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter((g) => {
      const a = g.feeAssignment;
      const haystack = [
        a.feeStructure.name,
        a.description,
        gradeLabels(g),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [data, filter, search]);

  const handleExport = () => {
    if (!data) return;
    const date = new Date().toISOString().split("T")[0];
    downloadCsv(`class-links-${date}.csv`, [
      ["Fee structure", "Billing period", "Classes", "Students", "Status", "Created"],
      ...filteredGroups.map((g) => {
        const a = g.feeAssignment;
        return [
          a.feeStructure.name,
          assignmentLine(a.description, a.feeStructure.name),
          gradeLabels(g),
          String(g.totalStudents),
          a.isActive ? "Active" : "Inactive",
          new Date(a.createdAt).toLocaleDateString("en-KE"),
        ];
      }),
    ]);
  };

  const emptyVariant =
    !data || data.feeAssignments.length === 0 ? "none" : "filtered";

  return (
    <div className={cn(FEES_LAYOUT.page, "space-y-0")}>
      {loading && !stats ? <FeeAssignmentsSummarySkeleton /> : null}
      {stats ? <FeeAssignmentsSummary stats={stats} /> : null}

      <FeeAssignmentsToolbar
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        counts={filterCounts}
        showInactiveFilter={stats?.showInactive ?? false}
        loading={loading}
        showingCount={data && !loading ? filteredGroups.length : null}
        totalCount={data && !loading ? data.feeAssignments.length : null}
        onRefresh={() => refetch()}
        onExport={handleExport}
        exportDisabled={!data || filteredGroups.length === 0}
      />

      {error ? (
        <div className="mx-3 mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 sm:mx-4">
          Could not load class links: {error}
        </div>
      ) : null}

      <div className="p-2 sm:p-3">
        <FeeAssignmentsDataTable
          groups={filteredGroups}
          isLoading={loading}
          showStatusColumn={stats?.showInactive ?? false}
          emptyVariant={emptyVariant}
        />
      </div>
    </div>
  );
};
