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
          "max-w-full overflow-x-hidden bg-white md:rounded-xl md:ring-1 md:ring-slate-200/70",
          FEES_DETAIL.shadowSoft,
          FEES_MOBILE.planHeaderCard,
        )}
      >
        <div className="px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-2">
            <Link
              href={feesPlansHref()}
              scroll={false}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-primary active:bg-slate-100 md:h-auto md:w-auto md:gap-1 md:px-0 md:text-xs md:text-slate-500 md:hover:text-primary"
              aria-label="Back to plans"
            >
              <ArrowLeft className="h-5 w-5 md:h-3.5 md:w-3.5" />
              <span className="hidden md:inline">Plans</span>
            </Link>

            <div className="min-w-0 flex-1 md:hidden">
              <p
                className={cn(
                  "truncate text-[15px] font-semibold leading-tight text-slate-900",
                  FEES_LAYOUT.textWrap,
                )}
              >
                {structure.structureName}
              </p>
              {mobileMeta ? (
                <p className="mt-0.5 truncate text-[11px] text-slate-500">
                  {mobileMeta}
                </p>
              ) : null}
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
                    aria-label="Edit plan"
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
                    <DropdownMenuContent align="end" className="w-44">
                      {!showPrimaryEdit && !showSecondaryEdit && canModifyPlan ? (
                        <DropdownMenuItem onClick={onEdit}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit plan
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
          <div className="border-t border-slate-200/80 bg-slate-50 px-3 py-2.5 text-xs text-slate-600 sm:px-4">
            <span className="mr-2 inline-flex rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500">
              Inactive
            </span>
            {inactiveDetail}. Payments against existing balances remain available
            from{" "}
            <Link
              href={feesBalancesHref()}
              scroll={false}
              className="font-semibold text-primary hover:underline"
            >
              Balances
            </Link>
            .
          </div>
        ) : null}

        {hasBilling && collection ? (
          <div className="border-t border-slate-100/90 px-3 py-2.5 sm:px-4 max-md:bg-slate-50/60">
            <div className="flex items-center justify-between gap-2 text-xs">
              <p className="min-w-0 text-slate-600">
                <span className="font-semibold tabular-nums text-emerald-800">
                  {formatKes(collection.totalCollected)}
                </span>
                {collection.totalOutstanding > 0 ? (
                  <span className="tabular-nums text-slate-600">
                    {" "}
                    / {formatKes(collection.totalOutstanding)} due
                  </span>
                ) : null}
              </p>
              <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold tabular-nums text-emerald-800 ring-1 ring-emerald-200/80">
                {collectionPct}%
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200/80">
              <div
                className="h-full rounded-full transition-[width]"
                style={{
                  width: `${Math.min(100, collectionPct)}%`,
                  backgroundColor: FEES_BRAND.primary,
                }}
              />
            </div>
            <Link
              href={feesBalancesHref()}
              scroll={false}
              className="mt-2 inline-flex text-[11px] font-semibold text-primary active:opacity-70"
            >
              View balances →
            </Link>
          </div>
        ) : null}
      </div>
    </header>
  );
}
