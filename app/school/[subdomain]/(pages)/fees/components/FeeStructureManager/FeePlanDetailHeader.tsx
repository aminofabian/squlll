"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Edit,
  FileStack,
  Link2,
  MoreHorizontal,
  Trash2,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FEES_BRAND,
  FEES_BTN,
  FEES_DETAIL,
  FEES_LAYOUT,
  FEES_MOBILE,
  FEES_PANEL,
} from "../../lib/fees-ui";
import type { ProcessedFeeStructure } from "./types";
import { feePlanTermProgress } from "../../lib/feePlanSlug";
import { formatKes } from "../../lib/feePlanStats";
import { getFeePlanReadiness } from "../../lib/feePlanReadiness";
import { getInactivePlanDetail } from "../../lib/feePlanLifecycle";
import { feesBalancesHref, feesPlansHref } from "../../lib/feesRoutes";
import type { FeePlanCollectionStats } from "../../lib/feePlanCollection";

interface FeePlanDetailHeaderProps {
  structure: ProcessedFeeStructure;
  linkedClassCount: number;
  totalStudents: number;
  collection?: FeePlanCollectionStats;
  canManage: boolean;
  canModifyPlan?: boolean;
  canBill: boolean;
  onEdit: () => void;
  onLinkClasses: () => void;
  onBillStudents?: () => void;
  onRequestDelete?: () => void;
  isDeleting?: boolean;
  className?: string;
}

export function FeePlanDetailHeader({
  structure,
  linkedClassCount,
  collection,
  canManage,
  canModifyPlan = canManage,
  canBill,
  onEdit,
  onLinkClasses,
  onBillStudents,
  onRequestDelete,
  isDeleting,
  className,
}: FeePlanDetailHeaderProps) {
  const { configured, total } = feePlanTermProgress(structure);
  const classesLinked = linkedClassCount > 0;
  const readiness = getFeePlanReadiness(structure, linkedClassCount);
  const isReady = readiness.label === "Ready";
  const termsIncomplete = total > 0 && configured < total;

  const hasBilling = collection?.hasBilling ?? false;
  const collectionPct = Math.round(collection?.collectionRate ?? 0);

  const showPrimaryBill = canBill && isReady && !!onBillStudents;
  const showPrimaryLink = canModifyPlan && !classesLinked;
  const showPrimaryEdit =
    canModifyPlan && classesLinked && (!termsIncomplete || !showPrimaryBill);
  const showSecondaryEdit = showPrimaryBill && canModifyPlan;
  const showActions = canManage || canBill;
  const inactiveDetail = !structure.isActive
    ? getInactivePlanDetail(structure)
    : null;

  const mobileMeta = [
    structure.academicYear,
    linkedClassCount > 0
      ? `${linkedClassCount} class${linkedClassCount === 1 ? "" : "es"}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <header
      className={cn(
        "sticky top-0 z-30",
        FEES_DETAIL.stickyNav,
        FEES_MOBILE.planStickyTop,
        className,
      )}
    >
      <h1 className="sr-only">{structure.structureName}</h1>

      <div
        className={cn(
          "max-w-full overflow-x-hidden bg-white",
          FEES_PANEL,
          FEES_MOBILE.planHeaderCard,
        )}
      >
        <div className="px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-2">
            <Link
              href={feesPlansHref()}
              scroll={false}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-none text-[#246a59] hover:bg-[#f3f7f5] active:bg-[#e8f2ef] md:h-auto md:w-auto md:gap-1 md:px-1.5 md:py-1 md:text-xs md:text-[#1a4d42]/55 md:hover:text-[#246a59]"
              aria-label="Back to structures"
            >
              <ArrowLeft className="h-5 w-5 md:h-3.5 md:w-3.5" />
              <span className="hidden md:inline">Structures</span>
            </Link>

            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate font-display text-[1.05rem] font-normal leading-tight text-[#0a1f1a] md:text-xl",
                  FEES_LAYOUT.textWrap,
                )}
              >
                {structure.structureName}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-[#1a4d42]/50">
                {mobileMeta || structure.academicYear}
                {total > 0 ? (
                  <span className="hidden sm:inline">
                    {" "}
                    · {configured}/{total} terms
                  </span>
                ) : null}
              </p>
            </div>

            {showActions ? (
              <div
                className={cn(
                  FEES_LAYOUT.planHeaderActions,
                  "shrink-0 justify-end",
                )}
              >
                {showPrimaryBill ? (
                  <Button
                    type="button"
                    size="sm"
                    className={cn(
                      FEES_BTN.primary,
                      FEES_MOBILE.touchBtn,
                      "h-9 min-w-[4.25rem] px-3 text-xs",
                    )}
                    onClick={onBillStudents}
                    disabled={isDeleting}
                  >
                    <FileStack className="h-3.5 w-3.5 shrink-0" />
                    Bill
                  </Button>
                ) : null}
                {showPrimaryLink ? (
                  <Button
                    type="button"
                    size="sm"
                    className={cn(
                      FEES_BTN.primary,
                      FEES_MOBILE.touchBtn,
                      "h-9 min-w-[4.25rem] px-3 text-xs",
                    )}
                    onClick={onLinkClasses}
                    disabled={isDeleting}
                  >
                    <Link2 className="h-3.5 w-3.5 shrink-0" />
                    Link
                  </Button>
                ) : null}
                {showPrimaryEdit && !showPrimaryBill ? (
                  <Button
                    type="button"
                    size="sm"
                    className={cn(
                      FEES_BTN.primary,
                      FEES_MOBILE.touchBtn,
                      "h-9 min-w-[4.25rem] px-3 text-xs",
                    )}
                    onClick={onEdit}
                    disabled={isDeleting}
                  >
                    <Edit className="h-3.5 w-3.5 shrink-0" />
                    Edit
                  </Button>
                ) : null}
                {showSecondaryEdit ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className={cn(
                      FEES_BTN.secondary,
                      FEES_MOBILE.touchBtn,
                      "h-9 w-9 shrink-0 p-0",
                    )}
                    onClick={onEdit}
                    disabled={isDeleting}
                    aria-label="Edit structure"
                  >
                    <Edit className="h-3.5 w-3.5 shrink-0" />
                  </Button>
                ) : null}
                {canManage ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className={cn(FEES_BTN.icon, FEES_MOBILE.touchBtn, "h-9 w-9")}
                        aria-label="More actions"
                        disabled={isDeleting}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-44 rounded-none"
                    >
                      {!showPrimaryEdit && !showSecondaryEdit && canModifyPlan ? (
                        <DropdownMenuItem onClick={onEdit}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit structure
                        </DropdownMenuItem>
                      ) : null}
                      {!showPrimaryLink && canModifyPlan ? (
                        <DropdownMenuItem onClick={onLinkClasses}>
                          <Link2 className="mr-2 h-4 w-4" />
                          Link classes
                        </DropdownMenuItem>
                      ) : null}
                      {!showPrimaryBill && canBill && onBillStudents ? (
                        <DropdownMenuItem onClick={onBillStudents}>
                          <FileStack className="mr-2 h-4 w-4" />
                          Bill students
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem asChild>
                        <Link href={feesBalancesHref()} scroll={false}>
                          <Wallet className="mr-2 h-4 w-4" />
                          Balances
                        </Link>
                      </DropdownMenuItem>
                      {onRequestDelete ? (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:bg-red-50 focus:text-red-700"
                            onClick={onRequestDelete}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {!structure.isActive && inactiveDetail ? (
          <div className="border-t border-[#1a4d42]/10 bg-[#f8fbfa] px-3 py-2.5 text-xs text-[#1a4d42]/65 sm:px-4">
            <span className="mr-2 inline-flex rounded-none border border-[#1a4d42]/12 bg-white px-2 py-0.5 text-[11px] font-semibold text-[#1a4d42]/45">
              Inactive
            </span>
            {inactiveDetail}. Payments against existing balances remain available
            from{" "}
            <Link
              href={feesBalancesHref()}
              scroll={false}
              className="font-semibold text-[#246a59] hover:underline"
            >
              Balances
            </Link>
            .
          </div>
        ) : null}

        {hasBilling && collection ? (
          <div className="border-t border-[#1a4d42]/10 px-3 py-2.5 sm:px-4 max-md:bg-[#f8fbfa]/80">
            <div className="flex items-center justify-between gap-2 text-xs">
              <p className="min-w-0 text-[#1a4d42]/60">
                <span className="font-semibold tabular-nums text-[#246a59]">
                  {formatKes(collection.totalCollected)}
                </span>
                {collection.totalOutstanding > 0 ? (
                  <span className="tabular-nums">
                    {" "}
                    / {formatKes(collection.totalOutstanding)} due
                  </span>
                ) : null}
              </p>
              <span className="shrink-0 rounded-none border border-[#246a59]/25 bg-[#e8f2ef] px-2 py-0.5 text-[10px] font-semibold tabular-nums text-[#1a4d42]">
                {collectionPct}%
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-none bg-[#1a4d42]/10">
              <div
                className="h-full rounded-none transition-[width]"
                style={{
                  width: `${Math.min(100, collectionPct)}%`,
                  backgroundColor: FEES_BRAND.primary,
                }}
              />
            </div>
            <Link
              href={feesBalancesHref()}
              scroll={false}
              className="mt-2 inline-flex text-[11px] font-semibold text-[#246a59] hover:underline active:opacity-70"
            >
              View balances →
            </Link>
          </div>
        ) : null}
      </div>
    </header>
  );
}
