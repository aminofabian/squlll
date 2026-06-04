"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  GraduationCap,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatCurrency } from "../utils";
import {
  FeeAssignmentGroup,
  StudentAssignment,
  FeeItemAssignment,
} from "../types";
import { FEES_BRAND, FEES_LAYOUT, FEES_MOBILE } from "../lib/fees-ui";
import { feePlanDetailHref, feesPlansHref } from "../lib/feesRoutes";
import { assignmentLine, gradeNames } from "../lib/feeAssignmentDisplay";
import { FeeAssignmentsTableSkeleton } from "./FeeAssignmentsSkeletons";
import { FeeAssignmentsGradeChips } from "./FeeAssignmentsGradeChips";

type PlanGroup = {
  structureId: string;
  structureName: string;
  assignments: FeeAssignmentGroup[];
  totalStudents: number;
  gradeNames: string[];
  hasInactive: boolean;
};

type EmptyVariant = "none" | "filtered";

interface FeeAssignmentsDataTableProps {
  groups: FeeAssignmentGroup[];
  isLoading?: boolean;
  showStatusColumn?: boolean;
  emptyVariant?: EmptyVariant;
}

export const FeeAssignmentsDataTable = ({
  groups,
  isLoading = false,
  showStatusColumn = false,
  emptyVariant = "filtered",
}: FeeAssignmentsDataTableProps) => {
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());
  const [expandedAssignments, setExpandedAssignments] = useState<Set<string>>(
    new Set(),
  );

  const planGroups = useMemo(() => groupByPlan(groups), [groups]);

  const togglePlan = (id: string) => {
    setExpandedPlans((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAssignment = (id: string) => {
    setExpandedAssignments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return <FeeAssignmentsTableSkeleton showStatusColumn={showStatusColumn} />;
  }

  if (groups.length === 0) {
    return <EmptyState variant={emptyVariant} />;
  }

  return (
    <>
      <div className={cn("md:hidden", FEES_MOBILE.listGroup)}>
        <ul>
          {planGroups.map((plan, planIndex) => (
            <MobilePlanBlock
              key={plan.structureId}
              plan={plan}
              planIndex={planIndex}
              expandedPlans={expandedPlans}
              expandedAssignments={expandedAssignments}
              onTogglePlan={togglePlan}
              onToggleAssignment={toggleAssignment}
              showStatusColumn={showStatusColumn}
            />
          ))}
        </ul>
      </div>

      <div className={cn("hidden md:block", FEES_LAYOUT.tableContained)}>
        <Table className="w-full table-fixed">
          <colgroup>
            <col style={{ width: "2.5rem" }} />
            <col style={{ width: showStatusColumn ? "32%" : "36%" }} />
            <col style={{ width: showStatusColumn ? "40%" : "44%" }} />
            <col style={{ width: "4.5rem" }} />
            {showStatusColumn ? <col style={{ width: "5.5rem" }} /> : null}
          </colgroup>
          <TableHeader>
            <TableRow className="bg-slate-50/90 hover:bg-slate-50/90">
              <TableHead className="w-10" />
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Structure & period
              </TableHead>
              <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Classes
              </TableHead>
              <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Students
              </TableHead>
              {showStatusColumn ? (
                <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {planGroups.map((plan) => {
              const multi = plan.assignments.length > 1;
              const planExpanded = expandedPlans.has(plan.structureId);

              if (!multi) {
                const group = plan.assignments[0];
                return (
                  <AssignmentRows
                    key={group.feeAssignment.id}
                    group={group}
                    isExpanded={expandedAssignments.has(
                      group.feeAssignment.id,
                    )}
                    onToggle={() =>
                      toggleAssignment(group.feeAssignment.id)
                    }
                    showStatusColumn={showStatusColumn}
                    indent={false}
                  />
                );
              }

              return (
                <Fragment key={plan.structureId}>
                  <TableRow
                    className="cursor-pointer border-slate-100 hover:bg-[#e8f2ef]/40"
                    onClick={() => togglePlan(plan.structureId)}
                  >
                    <TableCell className="py-2">
                      {planExpanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-500" />
                      )}
                    </TableCell>
                    <TableCell className="min-w-0 py-2">
                      <PlanNameLink
                        structureId={plan.structureId}
                        structureName={plan.structureName}
                      />
                      <p className="text-[11px] text-slate-500">
                        {plan.assignments.length} billing period
                        {plan.assignments.length === 1 ? "" : "s"}
                      </p>
                    </TableCell>
                    <TableCell className="min-w-0 py-2">
                      <FeeAssignmentsGradeChips
                        names={plan.gradeNames}
                        maxVisible={2}
                      />
                    </TableCell>
                    <TableCell className="py-2 text-right">
                      <StudentCount count={plan.totalStudents} />
                    </TableCell>
                    {showStatusColumn ? (
                      <TableCell className="py-2">
                        {plan.hasInactive ? (
                          <span className="text-xs text-amber-700">Mixed</span>
                        ) : (
                          <StatusBadge isActive={true} />
                        )}
                      </TableCell>
                    ) : null}
                  </TableRow>
                  {planExpanded
                    ? plan.assignments.map((group) => (
                        <AssignmentRows
                          key={group.feeAssignment.id}
                          group={group}
                          isExpanded={expandedAssignments.has(
                            group.feeAssignment.id,
                          )}
                          onToggle={() =>
                            toggleAssignment(group.feeAssignment.id)
                          }
                          showStatusColumn={showStatusColumn}
                          indent
                        />
                      ))
                    : null}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

function groupByPlan(groups: FeeAssignmentGroup[]): PlanGroup[] {
  const map = new Map<string, PlanGroup>();

  for (const group of groups) {
    const id = group.feeAssignment.feeStructureId;
    const name = group.feeAssignment.feeStructure.name;
    const existing = map.get(id) ?? {
      structureId: id,
      structureName: name,
      assignments: [],
      totalStudents: 0,
      gradeNames: [],
      hasInactive: false,
    };
    existing.assignments.push(group);
    existing.totalStudents += group.totalStudents;
    if (!group.feeAssignment.isActive) existing.hasInactive = true;
    const gradeSet = new Set(existing.gradeNames);
    for (const n of gradeNames(group)) gradeSet.add(n);
    existing.gradeNames = [...gradeSet].sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
    );
    map.set(id, existing);
  }

  return [...map.values()].sort((a, b) =>
    a.structureName.localeCompare(b.structureName),
  );
}

function PlanNameLink({
  structureId,
  structureName,
}: {
  structureId: string;
  structureName: string;
}) {
  return (
    <Link
      href={feePlanDetailHref({
        structureId,
        structureName,
      })}
      scroll={false}
      onClick={(e) => e.stopPropagation()}
      className="block truncate text-sm font-medium hover:underline"
      style={{ color: FEES_BRAND.primaryDark }}
    >
      {structureName}
    </Link>
  );
}

function AssignmentRows({
  group,
  isExpanded,
  onToggle,
  showStatusColumn,
  indent,
}: {
  group: FeeAssignmentGroup;
  isExpanded: boolean;
  onToggle: () => void;
  showStatusColumn: boolean;
  indent: boolean;
}) {
  const { feeAssignment, studentAssignments, totalStudents } = group;
  const line = assignmentLine(
    feeAssignment.description,
    feeAssignment.feeStructure.name,
  );
  const classes = gradeNames(group);
  const colSpan = showStatusColumn ? 5 : 4;
  const canExpand = totalStudents > 0;

  return (
    <>
      <TableRow
        className={cn(
          "border-slate-100",
          canExpand && "hover:bg-slate-50/80",
          !feeAssignment.isActive && "opacity-80",
        )}
      >
        <TableCell className={cn("w-9 py-2", indent && "pl-6")}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            disabled={!canExpand}
            className="h-7 w-7 p-0"
            title={
              canExpand
                ? isExpanded
                  ? "Hide students"
                  : "View students"
                : "No students linked"
            }
            aria-expanded={canExpand ? isExpanded : undefined}
          >
            {canExpand &&
              (isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              ))}
          </Button>
        </TableCell>
        <TableCell className="min-w-0 py-2">
          {indent ? (
            <p className="truncate text-sm font-medium text-slate-800">
              {line}
            </p>
          ) : (
            <PlanNameLink
              structureId={feeAssignment.feeStructureId}
              structureName={feeAssignment.feeStructure.name}
            />
          )}
          {indent ? null : line !== feeAssignment.feeStructure.name ? (
            <p className="truncate text-[11px] text-slate-500">{line}</p>
          ) : (
            <p className="text-[11px] text-slate-500">Fee assignment</p>
          )}
        </TableCell>
        <TableCell className="min-w-0 py-2">
          {indent ? (
            <span className="text-xs text-slate-400">See structure row</span>
          ) : (
            <FeeAssignmentsGradeChips names={classes} maxVisible={3} />
          )}
        </TableCell>
        <TableCell className="py-2 text-right">
          <StudentCount count={totalStudents} warnIfZero={feeAssignment.isActive} />
        </TableCell>
        {showStatusColumn ? (
          <TableCell className="py-2">
            <StatusBadge isActive={feeAssignment.isActive} />
          </TableCell>
        ) : null}
      </TableRow>

      {isExpanded && studentAssignments.length > 0 ? (
        <TableRow>
          <TableCell colSpan={colSpan} className="bg-slate-50/60 p-0">
            <StudentAssignmentsList assignments={studentAssignments} />
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}

function StudentCount({
  count,
  warnIfZero = false,
}: {
  count: number;
  warnIfZero?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-end gap-1 text-sm font-semibold tabular-nums",
        count > 0
          ? "text-slate-800"
          : warnIfZero
            ? "text-amber-700"
            : "text-slate-400",
      )}
      title={
        count === 0 && warnIfZero
          ? "Classes linked but no students on fee lines yet"
          : undefined
      }
    >
      <Users className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      {count}
    </span>
  );
}

function MobilePlanBlock({
  plan,
  planIndex,
  expandedPlans,
  expandedAssignments,
  onTogglePlan,
  onToggleAssignment,
  showStatusColumn,
}: {
  plan: PlanGroup;
  planIndex: number;
  expandedPlans: Set<string>;
  expandedAssignments: Set<string>;
  onTogglePlan: (id: string) => void;
  onToggleAssignment: (id: string) => void;
  showStatusColumn: boolean;
}) {
  const multi = plan.assignments.length > 1;
  const planExpanded = expandedPlans.has(plan.structureId);

  if (!multi) {
    const group = plan.assignments[0];
    return (
      <MobileAssignmentCard
        group={group}
        isExpanded={expandedAssignments.has(group.feeAssignment.id)}
        onToggle={() => onToggleAssignment(group.feeAssignment.id)}
        showStatusColumn={showStatusColumn}
        borderTop={planIndex > 0}
      />
    );
  }

  return (
    <li className={cn(planIndex > 0 && "border-t border-slate-100")}>
      <button
        type="button"
        className={cn(FEES_MOBILE.listRow, "w-full text-left")}
        onClick={() => onTogglePlan(plan.structureId)}
        aria-expanded={planExpanded}
      >
        {planExpanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">
            {plan.structureName}
          </p>
          <p className="text-[11px] text-slate-500">
            {plan.assignments.length} periods · {plan.gradeNames.length} classes
          </p>
        </div>
        <StudentCount count={plan.totalStudents} />
      </button>
      {planExpanded
        ? plan.assignments.map((group, i) => (
            <MobileAssignmentCard
              key={group.feeAssignment.id}
              group={group}
              isExpanded={expandedAssignments.has(group.feeAssignment.id)}
              onToggle={() => onToggleAssignment(group.feeAssignment.id)}
              showStatusColumn={showStatusColumn}
              nested
              borderTop={i > 0}
            />
          ))
        : null}
    </li>
  );
}

function MobileAssignmentCard({
  group,
  isExpanded,
  onToggle,
  showStatusColumn,
  nested = false,
  borderTop = false,
}: {
  group: FeeAssignmentGroup;
  isExpanded: boolean;
  onToggle: () => void;
  showStatusColumn: boolean;
  nested?: boolean;
  borderTop?: boolean;
}) {
  const { feeAssignment, studentAssignments, totalStudents } = group;
  const line = assignmentLine(
    feeAssignment.description,
    feeAssignment.feeStructure.name,
  );
  const classes = gradeNames(group);
  const canExpand = totalStudents > 0;
  const title = nested
    ? line
    : feeAssignment.feeStructure.name;

  return (
    <div className={cn(borderTop && "border-t border-slate-100")}>
      <div
        className={cn(
          FEES_MOBILE.listRow,
          nested && "bg-slate-50/50 pl-8",
        )}
      >
        <button
          type="button"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md disabled:opacity-30"
          onClick={onToggle}
          disabled={!canExpand}
          aria-expanded={canExpand ? isExpanded : undefined}
        >
          {canExpand &&
            (isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            ))}
        </button>
        <div className="min-w-0 flex-1">
          {nested ? (
            <p className="truncate text-sm font-medium text-slate-800">
              {title}
            </p>
          ) : (
            <PlanNameLink
              structureId={feeAssignment.feeStructureId}
              structureName={feeAssignment.feeStructure.name}
            />
          )}
          {!nested && line !== feeAssignment.feeStructure.name ? (
            <p className="truncate text-[11px] text-slate-500">{line}</p>
          ) : null}
          <div className="mt-1.5">
            <FeeAssignmentsGradeChips
              names={classes}
              maxVisible={2}
              linkToBalances={!nested}
            />
          </div>
          {showStatusColumn ? (
            <div className="mt-1">
              <StatusBadge isActive={feeAssignment.isActive} />
            </div>
          ) : null}
        </div>
        <StudentCount
          count={totalStudents}
          warnIfZero={feeAssignment.isActive}
        />
      </div>
      {isExpanded && studentAssignments.length > 0 ? (
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 pb-3">
          <StudentAssignmentsList assignments={studentAssignments} compact />
        </div>
      ) : null}
    </div>
  );
}

function StudentAssignmentsList({
  assignments,
  compact = false,
}: {
  assignments: StudentAssignment[];
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "border-t border-slate-100",
        compact ? "px-0 py-2" : "px-3 py-2 sm:px-4",
      )}
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {assignments.length} student{assignments.length === 1 ? "" : "s"}
      </p>
      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200/80 bg-white">
        {assignments.map((a) => {
          const total = calculateTotalAmount(a.feeItems);
          return (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-900">
                  {a.student.user.name}
                </p>
                <p className="text-xs text-slate-500">
                  {a.student.grade.gradeLevel.name}
                </p>
              </div>
              <div className="text-right text-xs">
                <p className="font-semibold tabular-nums text-slate-800">
                  {formatCurrency(total)}
                </p>
                <p className="text-slate-500">
                  {a.feeItems.length} line item
                  {a.feeItems.length === 1 ? "" : "s"}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-5 px-1.5 text-[10px] font-medium",
        isActive
          ? "border-emerald-200/80 bg-emerald-50/80 text-emerald-800"
          : "border-rose-200/80 bg-rose-50/80 text-rose-800",
      )}
    >
      {isActive ? (
        <>
          <CheckCircle2 className="mr-0.5 h-3 w-3" />
          Active
        </>
      ) : (
        <>
          <XCircle className="mr-0.5 h-3 w-3" />
          Inactive
        </>
      )}
    </Badge>
  );
}

function EmptyState({ variant }: { variant: EmptyVariant }) {
  if (variant === "none") {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 px-4 py-12 text-center">
        <GraduationCap className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-800">
          No class links yet
        </p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
          Link fee structures to grades from{" "}
          <Link
            href={feesPlansHref()}
            scroll={false}
            className="font-semibold hover:underline"
            style={{ color: FEES_BRAND.primary }}
          >
            Fee structures
          </Link>
          . Each link defines which classes are billed for a term or period.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-slate-200 px-4 py-12 text-center">
      <FileText className="mx-auto h-10 w-10 text-slate-300" />
      <p className="mt-3 text-sm font-medium text-slate-800">
        No links match this view
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Try another filter or clear your search.
      </p>
    </div>
  );
}

function calculateTotalAmount(feeItems: FeeItemAssignment[]): number {
  return feeItems.reduce((sum, item) => sum + item.amount, 0);
}
