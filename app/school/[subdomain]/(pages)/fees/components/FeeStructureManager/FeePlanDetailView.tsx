"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FEES_BTN, FEES_DETAIL, FEES_LAYOUT, FEES_MOBILE } from "../../lib/fees-ui";
import { FeeStructureCard } from "./FeeStructureCard";
import { FeePlanDetailHeader } from "./FeePlanDetailHeader";
import { FeePlanLinkedClasses } from "./FeePlanLinkedClasses";
import { FeePlanNextSteps } from "./FeePlanNextSteps";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { FeePlanDocument, FeePlanSection } from "./FeePlanSection";
import type { LinkedClassEntry } from "../../lib/feePlanLinkage";
import { feePlanTermProgress, feePlanSlug } from "../../lib/feePlanSlug";
import { resolveTermIdForPlan, FEE_TERM_QUERY } from "../../lib/feePlanDetailUrl";
import { buildFeesHref } from "../../lib/feesRoutes";
import type { FeePlanCollectionStats } from "../../lib/feePlanCollection";
import type { ProcessedFeeStructure } from "./types";
import type { FeeStructure } from "../../types";
import {
  fetchFeePlanDeleteEligibility,
  isFeePlanEditable,
  type FeePlanDeleteEligibility,
} from "../../lib/feePlanLifecycle";
interface FeePlanDetailViewProps {
  structure: ProcessedFeeStructure;
  planSlug: string;
  linkedClasses: LinkedClassEntry[];
  totalStudents: number;
  collection?: FeePlanCollectionStats;
  canManage: boolean;
  canBill: boolean;
  onEdit: (feeStructure: FeeStructure) => void;
  onAssignToGrade: (
    feeStructureId: string,
    name: string,
    academicYear?: string,
    academicYearId?: string,
    termId?: string,
  ) => void;
  onGenerateInvoices: (feeStructureId: string, term: string) => void;
  onDelete?: (id: string, name: string) => void;
  onUpdateFeeItem: (
    itemId: string,
    amount: number,
    isMandatory: boolean,
    bucketName: string,
    feeStructureName: string,
    bucketId?: string,
  ) => void;
  isDeleting?: boolean;
}

function toLegacyFeeStructure(s: ProcessedFeeStructure): FeeStructure {
  return {
    id: s.structureId,
    name: s.structureName,
    isActive: s.isActive,
    academicYear: s.academicYear,
    grade: "",
    boardingType: "day",
    createdDate: s.createdAt || "",
    lastModified: s.updatedAt || "",
    termStructures: [],
  };
}

export function FeePlanDetailView({
  structure,
  planSlug,
  linkedClasses,
  totalStudents,
  collection,
  canManage,
  canBill,
  onEdit,
  onAssignToGrade,
  onGenerateInvoices,
  onDelete,
  onUpdateFeeItem,
  isDeleting,
}: FeePlanDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteEligibility, setDeleteEligibility] =
    useState<FeePlanDeleteEligibility | null>(null);
  const [deleteEligibilityLoading, setDeleteEligibilityLoading] = useState(false);

  const planEditable = isFeePlanEditable(structure);
  const canModifyPlan = canManage && planEditable;

  const termFromUrl = searchParams.get(FEE_TERM_QUERY);
  const [selectedTermId, setSelectedTermId] = useState(() =>
    resolveTermIdForPlan(structure, termFromUrl),
  );

  const canonicalSlug = feePlanSlug(structure);

  const syncTermToUrl = useCallback(
    (termId: string) => {
      router.replace(
        buildFeesHref({
          section: "plans",
          plan: canonicalSlug,
          term: termId,
        }),
        { scroll: false },
      );
    },
    [router, canonicalSlug],
  );

  const handleTermChange = useCallback(
    (termId: string) => {
      setSelectedTermId(termId);
      syncTermToUrl(termId);
    },
    [syncTermToUrl],
  );

  useEffect(() => {
    const resolved = resolveTermIdForPlan(
      structure,
      searchParams.get(FEE_TERM_QUERY),
    );
    setSelectedTermId((prev) =>
      resolved && resolved !== prev ? resolved : prev,
    );
  }, [structure.structureId, searchParams]);

  useEffect(() => {
    const decoded = decodeURIComponent(planSlug.trim());
    if (decoded !== canonicalSlug) {
      router.replace(
        buildFeesHref({
          section: "plans",
          plan: canonicalSlug,
          term: searchParams.get(FEE_TERM_QUERY) || undefined,
        }),
        { scroll: false },
      );
    }
  }, [planSlug, canonicalSlug, router, searchParams]);

  useEffect(() => {
    const prev = document.title;
    document.title = `${structure.structureName} · Fee plans`;
    return () => {
      document.title = prev;
    };
  }, [structure.structureName]);

  const billingTermName = useMemo(() => {
    const fromSelection = structure.terms?.find((t) => t.id === selectedTermId)?.name;
    return fromSelection || structure.termName || "this term";
  }, [structure.terms, structure.termName, selectedTermId]);

  const openLinkClasses = () =>
    onAssignToGrade(
      structure.structureId,
      structure.structureName,
      structure.academicYear,
      structure.academicYearId,
      structure.termId,
    );

  const billThisPlan = () => {
    onGenerateInvoices(structure.structureId, billingTermName);
  };

  const termProgress = feePlanTermProgress(structure);
  const termsReady =
    termProgress.total === 0 ||
    termProgress.configured === termProgress.total;
  const billingReady = termsReady && linkedClasses.length > 0;
  const termsLabel =
    termProgress.total > 0
      ? `${termProgress.configured} of ${termProgress.total} terms still need amounts`
      : "Add term amounts in Edit plan";

  const assignedForDelete =
    collection?.assignedStudents ?? totalStudents;

  useEffect(() => {
    if (!deleteDialogOpen || !canManage || !onDelete) {
      return;
    }

    let cancelled = false;
    setDeleteEligibilityLoading(true);
    setDeleteEligibility(null);

    fetchFeePlanDeleteEligibility(structure.structureId)
      .then((result) => {
        if (!cancelled) {
          setDeleteEligibility(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDeleteEligibility({
            canDelete: false,
            blockReasons: ["Unable to verify delete eligibility"],
            studentAssignmentCount: assignedForDelete,
            outstandingBalanceCount: 0,
            paymentRecordCount: 0,
            invoiceCount: 0,
          });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDeleteEligibilityLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    deleteDialogOpen,
    canManage,
    onDelete,
    structure.structureId,
    assignedForDelete,
  ]);

  const openDeleteDialog = () => setDeleteDialogOpen(true);

  const linkClassesAction =
    canModifyPlan ? (
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={cn(FEES_BTN.secondary, "h-8 px-2.5 text-xs")}
        onClick={openLinkClasses}
        disabled={isDeleting}
      >
        <Link2 className="h-3.5 w-3.5" />
        {linkedClasses.length > 0 ? "Manage" : "Link"}
      </Button>
    ) : null;

  return (
    <div
      className={cn(
        "mx-auto w-full",
        FEES_LAYOUT.page,
        FEES_LAYOUT.textWrap,
        FEES_LAYOUT.planPageBottom,
        FEES_DETAIL.planPageWidth,
        FEES_DETAIL.planPageGap,
        FEES_MOBILE.stack,
        FEES_MOBILE.planPageShell,
        "max-md:gap-3",
      )}
    >
      <FeePlanDetailHeader
        structure={structure}
        linkedClassCount={linkedClasses.length}
        totalStudents={totalStudents}
        collection={collection}
        canManage={canManage}
        canModifyPlan={canModifyPlan}
        canBill={canBill && planEditable}
        onEdit={() => onEdit(toLegacyFeeStructure(structure))}
        onLinkClasses={openLinkClasses}
        onBillStudents={canBill && planEditable ? billThisPlan : undefined}
        onRequestDelete={
          canManage && onDelete ? openDeleteDialog : undefined
        }
        isDeleting={isDeleting}
      />

      {!billingReady ? (
        <FeePlanNextSteps
          termsReady={termsReady}
          termsLabel={termsLabel}
          classesLinked={linkedClasses.length}
        />
      ) : null}

      <FeePlanDocument className="min-w-0 max-md:!bg-transparent">
        <FeeStructureCard
          structure={structure}
          layout="detail"
          detailPart="amounts"
          hideHeader
          planSlug={canonicalSlug}
          selectedTermId={selectedTermId}
          onSelectedTermIdChange={handleTermChange}
          canManage={canModifyPlan}
          onEdit={onEdit}
          onAssignToGrade={onAssignToGrade}
          onGenerateInvoices={() =>
            onGenerateInvoices(structure.structureId, billingTermName)
          }
          onDelete={
            canManage && onDelete ? openDeleteDialog : undefined
          }
          onUpdateFeeItem={onUpdateFeeItem}
          isDeleting={isDeleting}
        />

        <FeePlanSection
          id="linked-classes"
          compact
          hideStep
          title="Linked classes"
          description={
            linkedClasses.length > 0
              ? `${linkedClasses.length} linked · A–Z`
              : "None linked yet"
          }
          action={linkClassesAction}
        >
          <FeePlanLinkedClasses
            embedded
            compact
            classes={linkedClasses}
            onLinkMore={canManage ? openLinkClasses : undefined}
          />
        </FeePlanSection>

        <FeeStructureCard
          structure={structure}
          layout="detail"
          detailPart="letter"
          hideHeader
          planSlug={canonicalSlug}
          selectedTermId={selectedTermId}
          onSelectedTermIdChange={handleTermChange}
          canManage={canModifyPlan}
          onEdit={onEdit}
          onAssignToGrade={onAssignToGrade}
          onGenerateInvoices={() =>
            onGenerateInvoices(structure.structureId, billingTermName)
          }
          onUpdateFeeItem={onUpdateFeeItem}
          isDeleting={isDeleting}
        />
      </FeePlanDocument>

      {canManage && onDelete ? (
        <DeleteConfirmationDialog
          isOpen={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          structureToDelete={{
            id: structure.structureId,
            name: structure.structureName,
          }}
          eligibility={deleteEligibility}
          eligibilityLoading={deleteEligibilityLoading}
          onConfirmDelete={() =>
            onDelete(structure.structureId, structure.structureName)
          }
        />
      ) : null}
    </div>
  );
}
