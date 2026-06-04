"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { FEES_BRAND, FEES_LAYOUT } from "../../lib/fees-ui";
import type { ProcessedFeeStructure } from "./types";
import {
  feePlanTermProgress,
  feePlanYearTotalKes,
} from "../../lib/feePlanSlug";
import { feePlanDetailHref, feesOverviewHref } from "../../lib/feesRoutes";
import {
  buildAcademicYearPlanGroups,
  getPlanLinkedGradeCount,
  type SchoolGradeRef,
} from "../../lib/feePlanYearLinkage";
import type { FeeAssignmentGroup } from "../../types";
import { KesAmount } from "../KesAmount";
import type { FeePlanCollectionStats } from "../../lib/feePlanCollection";
import { FeePlansYearSection } from "./FeePlansYearSection";
import {
  getFeePlanReadiness,
  type FeePlanReadinessTone,
} from "../../lib/feePlanReadiness";
import { useTerm } from "../../../contexts/TermContext";

function normalizeAcademicYearLabel(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function academicYearsMatch(planYear: string, schoolYear: string): boolean {
  const a = normalizeAcademicYearLabel(planYear);
  const b = normalizeAcademicYearLabel(schoolYear);
  if (a === b) return true;
  const digitsA = a.replace(/\D/g, "");
  const digitsB = b.replace(/\D/g, "");
  return digitsA.length >= 8 && digitsA === digitsB;
}

interface FeePlansTableProps {
  structures: ProcessedFeeStructure[];
  getLinkedClassCount: (feeStructureId: string) => number;
  collectionByPlanId?: Map<string, FeePlanCollectionStats>;
  assignments?: FeeAssignmentGroup[];
  schoolGrades?: SchoolGradeRef[];
  pageLevelConflictAlert?: boolean;
  className?: string;
}

const readinessStyles: Record<
  FeePlanReadinessTone,
  { badge: string }
> = {
  success: { badge: "bg-emerald-50 text-emerald-800 border-emerald-200/80" },
  warn: { badge: "bg-amber-50 text-amber-800 border-amber-200/80" },
  neutral: { badge: "bg-slate-50 text-slate-700 border-slate-200/80" },
  muted: { badge: "bg-slate-50 text-slate-500 border-slate-200/60" },
};

function ColumnHint({
  label,
  hint,
  className,
}: {
  label: string;
  hint: string;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          "cursor-default text-left text-xs font-semibold uppercase tracking-wide text-slate-500 underline decoration-dotted decoration-slate-400 underline-offset-2",
          className,
        )}
      >
        {label}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[13rem] text-xs">
        {hint}
      </TooltipContent>
    </Tooltip>
  );
}

/** Only show when something needs attention (not default Active + Ready). */
function PlanAttentionBadge({
  structure,
  linked,
}: {
  structure: ProcessedFeeStructure;
  linked: number;
}) {
  if (!structure.isActive) {
    return (
      <span className="inline-flex rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
        Inactive
      </span>
    );
  }

  const readiness = getFeePlanReadiness(structure, linked);
  if (readiness.label === "Ready") {
    return null;
  }

  const styles = readinessStyles[readiness.tone];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex cursor-default rounded-md border px-2 py-0.5 text-[11px] font-semibold",
            styles.badge,
          )}
        >
          {readiness.label}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[14rem] text-xs">
        {readiness.detail}
      </TooltipContent>
    </Tooltip>
  );
}

function TermsCell({
  termProgress,
}: {
  termProgress: { configured: number; total: number };
}) {
  if (termProgress.total === 0) {
    return <span className="text-sm text-slate-400">—</span>;
  }

  const termsReady = termProgress.configured === termProgress.total;
  const label = `${termProgress.configured}/${termProgress.total} terms`;

  return (
    <span
      className={cn(
        "text-sm tabular-nums",
        termsReady ? "text-slate-600" : "font-medium text-amber-700",
      )}
    >
      {label}
    </span>
  );
}

function PlanGradesLinked({ linked }: { linked: number }) {
  if (linked === 0) {
    return (
      <span className="text-sm font-medium text-amber-800">None linked</span>
    );
  }

  return (
    <span className="text-sm font-medium tabular-nums text-slate-800">
      {linked} grade{linked === 1 ? "" : "s"}
    </span>
  );
}

function NotBilledBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border border-amber-200/90 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900",
        className,
      )}
    >
      Not billed yet
    </span>
  );
}

function CollectionCellContent({
  stats,
  yearTotal,
  compactUnbilled,
}: {
  stats: FeePlanCollectionStats | undefined;
  yearTotal: number;
  /** Year-level note covers billing — avoid repeating badges on every row. */
  compactUnbilled?: boolean;
}) {
  if (!stats || !stats.hasBilling) {
    return (
      <div className="min-w-0 space-y-0.5 text-left">
        {!compactUnbilled ? <NotBilledBadge /> : null}
        <p className="break-words text-[11px] text-slate-600 [overflow-wrap:anywhere]">
          {stats && stats.assignedStudents > 0 ? (
            <>
              {stats.assignedStudents} student
              {stats.assignedStudents === 1 ? "" : "s"}
              {" · "}
            </>
          ) : compactUnbilled ? (
            "Awaiting billing · "
          ) : null}
          <span className="font-medium text-slate-800">
            <KesAmount amount={yearTotal} size="sm" />
          </span>
          <span className="text-slate-500"> / year</span>
        </p>
      </div>
    );
  }

  const pct = Math.round(stats.collectionRate);

  return (
    <div className="min-w-0 max-w-full space-y-1.5">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, pct)}%`,
            backgroundColor: FEES_BRAND.primary,
          }}
        />
      </div>
      <p className="break-words text-[11px] leading-snug text-slate-700 [overflow-wrap:anywhere]">
        <span className="font-medium text-emerald-800">
          <KesAmount amount={stats.totalCollected} size="sm" />
        </span>
        {" · "}
        {stats.totalOutstanding > 0 ? (
          <>
            <KesAmount amount={stats.totalOutstanding} size="sm" /> due
          </>
        ) : (
          <span className="text-emerald-700">paid up</span>
        )}
      </p>
      <p className="text-[10px] tabular-nums text-slate-500">
        {pct}% · {stats.assignedStudents} student
        {stats.assignedStudents === 1 ? "" : "s"}
      </p>
    </div>
  );
}

function BillOnOverviewRowLink() {
  return (
    <Link
      href={feesOverviewHref()}
      scroll={false}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "mt-1.5 inline-flex items-center gap-0.5 text-[11px] font-semibold transition-opacity duration-150",
        "hover:underline",
        "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
        "max-md:pointer-events-none max-md:absolute max-md:h-px max-md:w-px max-md:overflow-hidden max-md:opacity-0",
      )}
      style={{ color: FEES_BRAND.primary }}
    >
      Bill on Overview
      <span aria-hidden>→</span>
    </Link>
  );
}

function CollectionCell({
  stats,
  yearTotal,
  showChevron = false,
  compactUnbilled = false,
}: {
  stats: FeePlanCollectionStats | undefined;
  yearTotal: number;
  showChevron?: boolean;
  compactUnbilled?: boolean;
}) {
  const unbilled = !stats || !stats.hasBilling;

  return (
    <div className="grid min-w-0 max-w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-1">
      <div className="min-w-0">
        <CollectionCellContent
          stats={stats}
          yearTotal={yearTotal}
          compactUnbilled={compactUnbilled && unbilled}
        />
        {unbilled && !compactUnbilled ? <BillOnOverviewRowLink /> : null}
      </div>
      {showChevron ? (
        <ChevronRight
          className="mt-1.5 h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-slate-700 group-focus-visible:text-slate-700"
          aria-hidden
        />
      ) : null}
    </div>
  );
}

function PlanRowContent({
  structure,
  linked,
  yearTotal,
  termProgress,
  collection,
}: {
  structure: ProcessedFeeStructure;
  linked: number;
  yearTotal: number;
  termProgress: { configured: number; total: number };
  collection?: FeePlanCollectionStats;
}) {
  const termsReady =
    termProgress.total === 0 ||
    termProgress.configured === termProgress.total;

  return (
    <>
      <div className="flex min-w-0 items-start gap-2">
        <span
          className={cn(
            "min-w-0 font-medium text-slate-900",
            "line-clamp-2 md:truncate md:line-clamp-none",
            FEES_LAYOUT.textWrap,
          )}
          title={structure.structureName}
        >
          {structure.structureName}
        </span>
        <span className="shrink-0">
          <PlanAttentionBadge structure={structure} linked={linked} />
        </span>
      </div>
      {!termsReady && termProgress.total > 0 && (
        <div className="mt-1 md:hidden">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700">
            <AlertCircle className="h-3 w-3" />
            {termProgress.configured}/{termProgress.total} terms configured
          </span>
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 md:hidden">
        <PlanGradesLinked linked={linked} />
        {collection?.hasBilling ? (
          <span className="text-emerald-800">
            <KesAmount amount={collection.totalCollected} size="sm" /> collected
          </span>
        ) : (
          <span className="text-slate-600">
            <KesAmount amount={yearTotal} size="sm" /> / year
          </span>
        )}
      </div>
    </>
  );
}

export function FeePlansTable({
  structures,
  getLinkedClassCount,
  collectionByPlanId,
  assignments,
  schoolGrades = [],
  pageLevelConflictAlert = false,
  className,
}: FeePlansTableProps) {
  const router = useRouter();
  const { availableTerms } = useTerm();
  const schoolCurrentTerm = useMemo(
    () =>
      availableTerms.find((t) => t.isCurrent) ??
      availableTerms.find((t) => t.isActive) ??
      null,
    [availableTerms],
  );
  const currentTermName = schoolCurrentTerm?.name ?? null;
  const currentSchoolYearName =
    schoolCurrentTerm?.academicYear?.name ?? null;

  const yearGroups = useMemo(
    () =>
      buildAcademicYearPlanGroups(
        structures,
        assignments,
        schoolGrades,
      ),
    [structures, assignments, schoolGrades],
  );

  if (yearGroups.length === 0) {
    return null;
  }

  const navigate = (href: string) => router.push(href);
  const prefetch = (href: string) => router.prefetch(href);

  const planLinkedCount = (structure: ProcessedFeeStructure) =>
    assignments
      ? getPlanLinkedGradeCount(structure, assignments)
      : getLinkedClassCount(structure.structureId);

  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn(FEES_LAYOUT.page, "space-y-4", className)}>
        {yearGroups.map((group) => {
          const isCurrentSchoolYear =
            !!currentSchoolYearName &&
            academicYearsMatch(group.academicYear, currentSchoolYearName);

          const allPlansUnbilled = group.plans.every((structure) => {
            const stats = collectionByPlanId?.get(structure.structureId);
            return !stats?.hasBilling;
          });

          return (
            <FeePlansYearSection
              key={group.academicYearId || group.academicYear}
              group={group}
              currentTermName={currentTermName}
              isCurrentSchoolYear={isCurrentSchoolYear}
              pageLevelConflictAlert={pageLevelConflictAlert}
              allPlansUnbilled={allPlansUnbilled}
            >
              <ul className="flex flex-col gap-2 p-3 md:hidden">
                {group.plans.map((structure) => {
                  const href = feePlanDetailHref(structure);
                  const linked = planLinkedCount(structure);
                  const yearTotal = feePlanYearTotalKes(structure);
                  const termProgress = feePlanTermProgress(structure);
                  const collection = collectionByPlanId?.get(
                    structure.structureId,
                  );
                  const unbilled = !collection?.hasBilling;

                  return (
                    <li key={structure.structureId} className="group">
                      <div
                        className={cn(
                          "overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-sm",
                          !structure.isActive && "opacity-75",
                        )}
                      >
                        <button
                          type="button"
                          className="w-full p-4 text-left hover:bg-[#e8f2ef]/40"
                          onClick={() => navigate(href)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <PlanRowContent
                                structure={structure}
                                linked={linked}
                                yearTotal={yearTotal}
                                termProgress={termProgress}
                                collection={collection}
                              />
                            </div>
                            <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-300" />
                          </div>
                        </button>
                        {unbilled && !allPlansUnbilled ? (
                          <div className="border-t border-slate-100 bg-[#f4f7f5]/80 px-4 py-2">
                            <Link
                              href={feesOverviewHref()}
                              scroll={false}
                              className="text-[11px] font-semibold hover:underline"
                              style={{ color: FEES_BRAND.primary }}
                            >
                              Bill on Overview →
                            </Link>
                          </div>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className={cn("hidden md:block", FEES_LAYOUT.tableContained)}>
                <Table className="w-full table-fixed">
                  <colgroup>
                    <col style={{ width: "36%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "34%" }} />
                  </colgroup>
                  <TableHeader>
                    <TableRow className="bg-slate-50/60 hover:bg-slate-50/60">
                      <TableHead className="min-w-0">
                        <ColumnHint label="Structure" hint="Fee structure name and status" />
                      </TableHead>
                      <TableHead className="min-w-0">
                        <ColumnHint
                          label="Terms"
                          hint="Terms with fee amounts configured"
                        />
                      </TableHead>
                      <TableHead className="min-w-0">
                        <ColumnHint
                          label="Classes"
                          hint="Grades linked to this structure"
                        />
                      </TableHead>
                      <TableHead className="min-w-0">
                        <ColumnHint
                          label="Billing"
                          hint="Collection and whether students have been billed"
                        />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.plans.map((structure) => {
                      const href = feePlanDetailHref(structure);
                      const linked = planLinkedCount(structure);
                      const yearTotal = feePlanYearTotalKes(structure);
                      const termProgress = feePlanTermProgress(structure);
                      const collection = collectionByPlanId?.get(
                        structure.structureId,
                      );

                      return (
                        <TableRow
                          key={structure.structureId}
                          role="link"
                          tabIndex={0}
                          className={cn(
                            "group cursor-pointer border-b border-slate-100/80 transition-colors last:border-b-0 hover:bg-[#e8f2ef]/45",
                            !structure.isActive && "opacity-70",
                          )}
                          onClick={() => navigate(href)}
                          onMouseEnter={() => prefetch(href)}
                          onFocus={() => prefetch(href)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              navigate(href);
                            }
                          }}
                        >
                          <TableCell className="min-w-0 overflow-hidden py-3">
                            <PlanRowContent
                              structure={structure}
                              linked={linked}
                              yearTotal={yearTotal}
                              termProgress={termProgress}
                              collection={collection}
                            />
                          </TableCell>
                          <TableCell className="min-w-0 whitespace-nowrap">
                            <TermsCell termProgress={termProgress} />
                          </TableCell>
                          <TableCell className="min-w-0 whitespace-nowrap">
                            <PlanGradesLinked linked={linked} />
                          </TableCell>
                          <TableCell className="min-w-0 overflow-hidden py-3 align-top">
                            <CollectionCell
                              stats={collection}
                              yearTotal={yearTotal}
                              showChevron
                              compactUnbilled={allPlansUnbilled}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </FeePlansYearSection>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
