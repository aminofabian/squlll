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
import { FEES_LAYOUT, FEES_MOBILE } from "../lib/fees-ui";

const TABLE_ROWS = 8;
const MOBILE_ROWS = 7;

/** Matches ArrearsSummaryPanel layout while summary loads. */
export function ArrearsSummarySkeleton() {
  return (
    <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
      <div className="px-3 py-3 sm:px-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-2 h-8 w-36 sm:h-9" />
        <Skeleton className="mt-2 h-3 w-28" />
        <div className="mt-3 grid grid-cols-3 gap-2 sm:max-w-md">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200/80 bg-white px-2 py-2"
            >
              <Skeleton className="mx-auto h-2 w-10" />
              <Skeleton className="mx-auto mt-1.5 h-4 w-14" />
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-[4.5rem] rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeesDataTableSkeleton({
  embedded = false,
  streamlined = true,
}: {
  embedded?: boolean;
  streamlined?: boolean;
}) {
  const colCount = streamlined ? 4 : 8;

  return (
    <div
      className={cn(
        "min-w-0",
        embedded ? "" : FEES_MOBILE.card,
        "overflow-x-hidden md:border md:border-slate-200 md:bg-white",
      )}
    >
      {/* Mobile list */}
      <div className="md:hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-2.5">
          <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
          <Skeleton className="h-3 w-24" />
        </div>
        <ul>
          {Array.from({ length: MOBILE_ROWS }).map((_, i) => (
            <li
              key={i}
              className={cn(i > 0 && "border-t border-slate-100")}
            >
              <div className="flex items-center gap-3 px-4 py-3.5">
                <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-[58%]" />
                  <Skeleton className="h-3 w-[42%]" />
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-14 rounded-md" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Desktop table */}
      <div className={cn(FEES_LAYOUT.tableScroll, "hidden md:block")}>
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="w-12">
                <Skeleton className="h-4 w-4" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-3 w-14" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-3 w-10" />
              </TableHead>
              {streamlined ? (
                <TableHead className="text-right">
                  <Skeleton className="ml-auto h-3 w-12" />
                </TableHead>
              ) : (
                Array.from({ length: colCount - 3 }).map((_, i) => (
                  <TableHead key={i}>
                    <Skeleton className="h-3 w-12" />
                  </TableHead>
                ))
              )}
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: TABLE_ROWS }).map((_, row) => (
              <TableRow
                key={row}
                className="border-slate-100 hover:bg-transparent [&>td]:py-2.5"
              >
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-1 h-3 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                {streamlined ? (
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-20" />
                    <Skeleton className="ml-auto mt-1 h-3 w-28" />
                  </TableCell>
                ) : (
                  Array.from({ length: colCount - 3 }).map((_, i) => (
                    <TableCell key={i}>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  ))
                )}
                <TableCell>
                  <Skeleton className="h-8 w-14 rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
