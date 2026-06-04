"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { FEES_LAYOUT } from "../lib/fees-ui";

const TABLE_ROWS = 7;

/** Matches FeeAssignmentsSummary while assignments load. */
export function FeeAssignmentsSummarySkeleton() {
  return (
    <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-3 py-3 sm:px-4">
      <div className="flex justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="mt-2 h-8 w-44 sm:h-9" />
          <Skeleton className="mt-2 h-3 w-full max-w-md" />
        </div>
        <Skeleton className="h-8 w-24 shrink-0 rounded-lg" />
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:max-w-2xl">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-200/80 bg-white px-2 py-1.5 text-center"
          >
            <Skeleton className="mx-auto h-2 w-14" />
            <Skeleton className="mx-auto mt-1.5 h-3.5 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Matches FeeAssignmentsDataTable (fee structure / grades / students). */
export function FeeAssignmentsTableSkeleton({
  showStatusColumn = false,
}: {
  showStatusColumn?: boolean;
}) {
  const colCount = showStatusColumn ? 5 : 4;

  return (
    <div className={FEES_LAYOUT.tableContained}>
      <Table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: "2.5rem" }} />
          <col style={{ width: showStatusColumn ? "30%" : "34%" }} />
          <col style={{ width: showStatusColumn ? "38%" : "44%" }} />
          <col style={{ width: "4.5rem" }} />
          {showStatusColumn ? <col style={{ width: "5.5rem" }} /> : null}
        </colgroup>
        <TableHeader>
          <TableRow className="bg-slate-50/90 hover:bg-transparent">
            <TableHead className="w-10" />
            <TableHead>
              <Skeleton className="h-2.5 w-20" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-2.5 w-14" />
            </TableHead>
            <TableHead className="text-right">
              <Skeleton className="ml-auto h-2.5 w-14" />
            </TableHead>
            {showStatusColumn ? (
              <TableHead>
                <Skeleton className="h-2.5 w-10" />
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: TABLE_ROWS }).map((_, row) => (
            <TableRow
              key={row}
              className="border-slate-100 hover:bg-transparent [&>td]:py-2"
            >
              <TableCell>
                <Skeleton className="h-4 w-4" />
              </TableCell>
              <TableCell className="min-w-0">
                <Skeleton
                  className={cn(
                    "h-4",
                    row % 3 === 0 ? "w-[72%]" : row % 3 === 1 ? "w-[58%]" : "w-[64%]",
                  )}
                />
                <Skeleton className="mt-1 h-3 w-[48%]" />
              </TableCell>
              <TableCell className="min-w-0">
                <div className="flex flex-wrap gap-1">
                  <Skeleton className="h-5 w-14 rounded-md" />
                  <Skeleton className="h-5 w-12 rounded-md" />
                  {row % 2 === 0 ? (
                    <Skeleton className="h-5 w-10 rounded-md" />
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-8" />
              </TableCell>
              {showStatusColumn ? (
                <TableCell>
                  <Skeleton className="h-5 w-14 rounded-md" />
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
