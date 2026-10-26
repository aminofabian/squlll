"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { getDisplayErrorMessage } from "@/lib/utils/graphql-errors";
import { cn } from "@/lib/utils";
import {
  FEE_PLAN_QUERY,
  findFeePlanBySlug,
} from "./lib/feePlanSlug";
import {
  FEE_BALANCE_CLASS_QUERY,
  FEE_SECTION_QUERY,
  buildFeesHref,
  feesPlansHref,
  parseFeesSection,
} from "./lib/feesRoutes";
import { buildFeePlanCollectionByPlanId } from "./lib/feePlanCollection";
import {
  groupFeeStructuresByPlan,
  dedupeTermsById,
  getPlanDisplayName,
} from "./lib/feePlanGrouping";
import {
  isPlanExpired,
  resolvePlanEndDate,
  isFeePlanEditable,
} from "./lib/feePlanLifecycle";
import { FEES_BRAND, FEES_LAYOUT, FEES_MOBILE } from "./lib/fees-ui";
import {
  buildLinkedClassCountByPlanId,
  countStudentsForPlan,
  findPlanForStructureId,
  getGradePlanLinks,
  getLinkedAssignmentGroupsForPlan,
  getLinkedClassesForPlan,
  type LinkedAssignmentGroup,
} from "./lib/feePlanLinkage";
import type { AcademicYearPlanGroup } from "./lib/feePlanYearLinkage";
import type { ProcessedFeeStructure } from "./components/FeeStructureManager/types";
import { Download, FileStack, Upload } from "lucide-react";

// Import modular components and hooks
import { FeesPageShell } from "./components/FeesPageShell";
import { FeesPageChrome } from "./components/FeesPageChrome";
import {
  hasMeaningfulFeeMetrics,
  setupMilestonesComplete,
} from "./lib/feesWorkflow";
import { FeesPanel } from "./components/FeesPanel";
import { FeesOverviewBoard } from "./components/FeesOverviewBoard";
import { OwnerPaymentsDrawer } from "../dashboard/components/OwnerPaymentsDrawer";
import { readIsSchoolOwner } from "@/lib/school/isSchoolOwner";
import { OverviewStatsCards } from "./components/OverviewStatsCards";
import { FiltersSection } from "./components/FiltersSection";
import { FeesDataTable } from "./components/FeesDataTable";
import { BalancesGradeSidebar } from "./components/BalancesGradeSidebar";
import { ArrearsSummaryPanel } from "./components/ArrearsSummaryPanel";
import { StudentInvoicesTable } from "./components/StudentInvoicesTable";
import { FeeStructureDrawer } from "./components/FeeStructureDrawer";
import RecordPaymentDrawer from "./components/RecordPaymentDrawer";
import { PaymentReceiptDialog } from "./components/PaymentReceiptDialog";
import { BulkPaymentImportDialog } from "./components/BulkPaymentImportDialog";
import StudentPayments from "./components/StudentPayments";
import { FeeStructureManager } from "./components/FeeStructureManager";
import { BulkInvoiceGenerator } from "./components/BulkInvoiceGenerator";
import { FeeSummaryCard } from "./components/FeeSummaryCard";
import NewInvoiceDrawer from "./components/NewInvoiceDrawer";
import { StudentFeeProfileDrawer } from "./components/StudentFeeProfileDrawer";
import { useBursarDashboardMetrics, BALANCE_ALERT_KES } from "./hooks/useBursarDashboardMetrics";
import { WorkflowGuidance } from "./components/WorkflowGuidance";
import type { FeesSection } from "./components/FeesSectionTabs";
import { FeeAssignmentsView } from "./components/FeeAssignmentsView";
import PaymentReminderDrawer from "./components/PaymentReminderDrawer";
import { FeeStructuresTab } from "./components/FeeStructureManager/FeeStructuresTab";
import { AssignFeeStructureModal } from "./components/AssignFeeStructureModal";
import { LinkMissingGradesDialog } from "./components/LinkMissingGradesDialog";
import { useFeeAssignments } from "./hooks/useFeeAssignments";
import { useFeeReminderLog } from "./hooks/useFeeReminderLog";
import { useFeesAccess } from "./hooks/useFeesAccess";
import { useTerm } from "../contexts/TermContext";
import { useFeeAuditLog } from "./hooks/useFeeAuditLog";
import { resolveTermWindow } from "./lib/termWindow";
import { FeesReportsPanel } from "./components/FeesReportsPanel";
import {
  FeeAdjustmentDrawer,
  type FeeAdjustmentForm,
} from "./components/FeeAdjustmentDrawer";
import { downloadCsv } from "./lib/exportCsv";
import {
  computeBalancesAfterPayment,
  type PaymentReceiptData,
} from "./lib/paymentReceipt";
import { schoolNameFromSubdomain } from "./lib/feesDocumentDefaults";
import {
  mapAdjustmentType,
  useGraphQLFeeAdjustments,
} from "./hooks/useGraphQLFeeAdjustments";
import { useFeesData } from "./hooks/useFeesData";
import { useFormHandlers } from "./hooks/useFormHandlers";
import { useFeeStructures } from "./hooks/useFeeStructures";
import {
  useGraphQLFeeStructures,
  UpdateFeeStructureInput,
} from "./hooks/useGraphQLFeeStructures";
import { useGradeData } from "./hooks/useGradeData";
import { useStudentSummary } from "./hooks/useStudentSummary";
import { useStudentDetailSummary } from "@/lib/hooks/useStudentDetailSummary";
import { useAllStudentsSummary } from "./hooks/useAllStudentsSummary";
import { useSchoolArrearsSummary } from "./hooks/useSchoolArrearsSummary";
import {
  FeeInvoice,
  FeeStructure,
  FeeStructureForm,
  BulkInvoiceGeneration,
  StudentSummaryFromAPI,
} from "./types";

// Helper function for status colors
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "overdue":
      return "bg-red-100 text-red-800";
    case "partial":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function FeesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const planSlugFromUrl = searchParams.get(FEE_PLAN_QUERY);
  const receiptSchoolName = schoolNameFromSubdomain(
    typeof params?.subdomain === "string" ? params.subdomain : undefined,
  );

  const feesAccess = useFeesAccess();
  const { selectedTerm, availableTerms, termsLoading } = useTerm();
  const {
    applyFeeAdjustment,
    isApplying: isApplyingAdjustment,
    error: adjustmentError,
    clearError: clearAdjustmentError,
  } = useGraphQLFeeAdjustments();

  const feesSection = useMemo((): FeesSection => {
    if (planSlugFromUrl) return "plans";
    return parseFeesSection(searchParams.get(FEE_SECTION_QUERY));
  }, [planSlugFromUrl, searchParams]);

  const navigateToFeesSection = useCallback(
    (section: FeesSection, opts?: { replace?: boolean }) => {
      const href = buildFeesHref({ section });
      if (opts?.replace) {
        router.replace(href, { scroll: false });
      } else {
        router.push(href, { scroll: false });
      }
    },
    [router],
  );

  const [currentView, setCurrentView] = useState<
    "dashboard" | "structures" | "invoices"
  >("dashboard");
  const [showAdjustmentDrawer, setShowAdjustmentDrawer] = useState(false);
  const [showPaymentsDrawer, setShowPaymentsDrawer] = useState(false);
  const isSchoolOwner = useMemo(() => readIsSchoolOwner(), []);
  const [adjustmentForm, setAdjustmentForm] = useState<FeeAdjustmentForm>({
    type: "discount",
    amount: "",
    reason: "",
    studentFeeItemId: "",
  });

  useEffect(() => {
    if (showAdjustmentDrawer) clearAdjustmentError();
  }, [showAdjustmentDrawer, clearAdjustmentError]);

  const { entries: auditEntries, append: appendAudit, refresh: refreshAudit } =
    useFeeAuditLog();
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(
    null,
  );
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedStudentsForTable, setSelectedStudentsForTable] = useState<
    string[]
  >([]);
  const [viewingStudent, setViewingStudent] =
    useState<StudentSummaryFromAPI | null>(null);
  const [showStudentDetailsDrawer, setShowStudentDetailsDrawer] =
    useState(false);
  const [balancesStatusFilter, setBalancesStatusFilter] = useState("all");
  const [paymentReceipt, setPaymentReceipt] = useState<PaymentReceiptData | null>(
    null,
  );
  const [showPaymentReceipt, setShowPaymentReceipt] = useState(false);
  const [showBulkPaymentImport, setShowBulkPaymentImport] = useState(false);

  // Fee Structure states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false);
  const [selectedStructure, setSelectedStructure] =
    useState<FeeStructure | null>(null);
  const [selectedGraphQLStructure, setSelectedGraphQLStructure] =
    useState<any>(null);
  const [selectedProcessedStructure, setSelectedProcessedStructure] =
    useState<any>(null);
  const [preselectedStructureId, setPreselectedStructureId] =
    useState<string>("");
  const [preselectedTerm, setPreselectedTerm] = useState<string>("");

  // Track if we've already fetched on mount to prevent request floods
  const hasFetchedOnMount = useRef(false);

  // Track if a delete is in progress to prevent multiple simultaneous deletions
  const deletingStructureId = useRef<string | null>(null);

  // Assign to grades modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [feeStructureToAssign, setFeeStructureToAssign] = useState<{
    id: string;
    name: string;
    academicYear?: string;
    isActive?: boolean;
    /** Grades already linked to this plan — shown separately in the drawer. */
    linkedGrades?: Array<{ id: string; name: string }>;
    /** Assignment batches already linked to this plan, for unlink. */
    linkedAssignments?: LinkedAssignmentGroup[];
    /** Grades already on another plan for overlapping terms. */
    conflictingGrades?: Array<{
      gradeId: string;
      gradeName: string;
      planNames: string[];
      termNames: string[];
    }>;
    /** Term labels for the current plan, shown in the drawer summary. */
    planTermNames?: string[];
    /** Grade levels configured on the plan — used to scope the drawer list. */
    gradeLevelIds?: string[];
  } | null>(null);

  /** Grades preselected when a year-level “link missing grades” flow opens. */
  const [pendingLinkGradeIds, setPendingLinkGradeIds] = useState<string[]>([]);
  const [missingGradesGroup, setMissingGradesGroup] =
    useState<AcademicYearPlanGroup | null>(null);
  const [showLinkMissingGrades, setShowLinkMissingGrades] = useState(false);

  const {
    selectedStudent,
    setSelectedStudent,
    searchTerm,
    setSearchTerm,
    selectedFeeType,
    setSelectedFeeType,
    selectedStatus,
    setSelectedStatus,
    selectedClass,
    setSelectedClass,
    dueDateFilter,
    setDueDateFilter,
    filteredInvoices,
    summaryStats,
    filteredStudents,
    selectedStudentInvoices,
    selectedStudentInvoicesLoading,
    selectedStudentInvoicesError,
  } = useFeesData();

  // Fee Structure hooks
  const {
    feeStructures,
    grades: feeStructureGrades,
    createFeeStructure,
    deleteFeeStructure,
    assignFeeStructureToGrade,
    generateBulkInvoices,
  } = useFeeStructures();

  // GraphQL Fee Structure hooks
  const {
    updateFeeStructure: graphqlUpdateFeeStructure,
    deleteFeeStructure: graphqlDeleteFeeStructure,
    isUpdating,
    updateError,
    isDeleting,
    deleteError,
    structures: graphQLStructures,
    isLoading: structuresLoading,
    error: structuresError,
    fetchFeeStructures,
    lastFetchTime,
  } = useGraphQLFeeStructures();

  // Get grade data for fee structures
  const {
    grades,
    isLoading: isLoadingGrades,
    error: gradesError,
    fetchGradeData,
  } = useGradeData();

  // Process GraphQL structures for display - Group by base plan name + academic year
  const processedFeeStructures = useMemo(() => {
    if (!graphQLStructures || graphQLStructures.length === 0) return [];

    const groupedStructures = groupFeeStructuresByPlan(graphQLStructures);

    // Process each group
    return Array.from(groupedStructures.entries()).map(
      ([groupKey, structures]) => {
        const allTerms = dedupeTermsById(
          structures.flatMap((s) => s.terms || []),
        );

        // Combine all grade levels (unique)
        const gradeLevelMap = new Map();
        structures.forEach((s) => {
          s.gradeLevels?.forEach((gl: any) => {
            gradeLevelMap.set(gl.id, gl);
          });
        });

        // Create a map of term ID to fee buckets for that specific term
        const termFeesMap = new Map<string, any[]>();

        structures.forEach((structure) => {
          const structureTerms = structure.terms || [];

          if (structureTerms.length === 0) {
            console.warn(`Structure ${structure.name} has no terms, skipping`);
            return;
          }

          // Create buckets from items for THIS structure
          const buckets: any[] = [];
          if (structure.items && structure.items.length > 0) {
            const bucketMap = new Map();
            structure.items.forEach((item: any) => {
              const bucketKey = item.feeBucket.id;
              const existingBucket = bucketMap.get(bucketKey);

              if (existingBucket) {
                existingBucket.totalAmount += item.amount;
                existingBucket.isOptional =
                  existingBucket.isOptional && !item.isMandatory;
              } else {
                bucketMap.set(bucketKey, {
                  id: item.feeBucket.id,
                  name: item.feeBucket.name,
                  totalAmount: item.amount,
                  isOptional: !item.isMandatory,
                  firstItemId: item.id,
                  feeBucketId: item.feeBucket.id,
                });
              }
            });
            buckets.push(...Array.from(bucketMap.values()));
          }

          const applyBucketsToTerm = (termId: string) => {
            const existingBuckets = termFeesMap.get(termId) || [];
            const mergedBucketMap = new Map<string, (typeof buckets)[0]>();

            existingBuckets.forEach((bucket) => {
              mergedBucketMap.set(bucket.feeBucketId, { ...bucket });
            });

            buckets.forEach((bucket) => {
              const existing = mergedBucketMap.get(bucket.feeBucketId);
              if (existing) {
                existing.totalAmount += bucket.totalAmount;
                existing.isOptional = existing.isOptional && bucket.isOptional;
              } else {
                mergedBucketMap.set(bucket.feeBucketId, { ...bucket });
              }
            });

            termFeesMap.set(termId, Array.from(mergedBucketMap.values()));
          };

          if (structureTerms.length === 1) {
            applyBucketsToTerm(structureTerms[0].id);
          } else {
            structureTerms.forEach((term: { id: string }) => {
              applyBucketsToTerm(term.id);
            });
          }
        });

        // Use the first structure as the base
        const baseStructure = structures[0];
        const planDisplayName = getPlanDisplayName(baseStructure);

        // Get buckets for first term (default display)
        const defaultTermId = allTerms[0]?.id || "";
        const defaultBuckets = termFeesMap.get(defaultTermId) || [];
        const academicYearEndDate =
          baseStructure.academicYear?.endDate ?? null;
        const validUntilDate = resolvePlanEndDate(
          baseStructure.academicYear,
          allTerms,
        );
        const planExpired = isPlanExpired(validUntilDate);
        const planIsActive =
          structures.some((s) => s.isActive) && !planExpired;

        return {
          structureId: baseStructure.id,
          structureName: planDisplayName,
          planLabel: baseStructure.planLabel ?? planDisplayName,
          academicYear: baseStructure.academicYear?.name || "N/A",
          academicYearId: baseStructure.academicYear?.id || "",
          termName: allTerms.length > 0 ? allTerms[0].name : "N/A",
          termId: defaultTermId,
          terms: allTerms,
          gradeLevels: Array.from(gradeLevelMap.values()),
          buckets: defaultBuckets, // Default to first term's buckets
          termFeesMap: Object.fromEntries(termFeesMap), // Store all term-specific fees
          allStructures: structures, // Store original structures for reference
          isActive: planIsActive,
          isExpired: planExpired,
          validUntil: validUntilDate?.toISOString() ?? null,
          academicYearEndDate,
          createdAt: baseStructure.createdAt,
          updatedAt: structures.reduce((latest, s) => {
            return s.updatedAt > latest ? s.updatedAt : latest;
          }, baseStructure.updatedAt),
        };
      },
    );
  }, [graphQLStructures]);

  const currentPlanStructureIds = useMemo(() => {
    const currentYearName = selectedTerm?.academicYear?.name;
    if (!currentYearName) return null;
    const ids = new Set<string>();
    for (const plan of processedFeeStructures) {
      if (plan.academicYear !== currentYearName) continue;
      ids.add(plan.structureId);
      for (const item of plan.allStructures ?? []) {
        if (item?.id) ids.add(item.id);
      }
    }
    return ids;
  }, [processedFeeStructures, selectedTerm?.academicYear?.name]);

  const backToFeePlanList = useCallback(() => {
    router.push(feesPlansHref(), { scroll: false });
  }, [router]);

  useEffect(() => {
    const classFromUrl = searchParams.get(FEE_BALANCE_CLASS_QUERY);
    if (classFromUrl && feesSection === "balances") {
      setSelectedClass(decodeURIComponent(classFromUrl));
    }
  }, [searchParams, feesSection, setSelectedClass]);

  const {
    data: feeAssignmentsData,
    loading: feeAssignmentsLoading,
    error: feeAssignmentsError,
    refetch: refetchFeeAssignments,
  } = useFeeAssignments();

  const tenantGradeLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of grades) {
      map.set(g.tenantGradeLevelId, g.name);
      if (g.id !== g.tenantGradeLevelId) map.set(g.id, g.name);
    }
    return map;
  }, [grades]);

  const schoolGradesForLinkage = useMemo(() => {
    const byId = new Map<string, { id: string; name: string }>();
    for (const g of grades) {
      if (!g.tenantGradeLevelId) continue;
      if (!byId.has(g.tenantGradeLevelId)) {
        byId.set(g.tenantGradeLevelId, {
          id: g.tenantGradeLevelId,
          name: g.name,
        });
      }
    }
    return [...byId.values()];
  }, [grades]);

  /** Every school grade has at least one active fee link. */
  const allGradesLinked = useMemo(() => {
    if (
      schoolGradesForLinkage.length === 0 ||
      feeAssignmentsLoading ||
      feeAssignmentsError ||
      termsLoading
    ) {
      return false;
    }

    const linked = new Set<string>();
    for (const group of feeAssignmentsData?.feeAssignments ?? []) {
      if (group.feeAssignment?.isActive === false) continue;
      if (
        currentPlanStructureIds &&
        !currentPlanStructureIds.has(group.feeAssignment.feeStructureId)
      ) {
        continue;
      }
      for (const id of group.feeAssignment?.tenantGradeLevelIds ?? []) {
        if (id) linked.add(id);
      }
      for (const gradeLevel of group.feeAssignment?.gradeLevels ?? []) {
        if (gradeLevel.tenantGradeLevelId) {
          linked.add(gradeLevel.tenantGradeLevelId);
        }
      }
      for (const assignment of group.studentAssignments ?? []) {
        if (assignment.isActive === false) continue;
        const id =
          assignment.student?.grade?.id ||
          assignment.student?.grade?.gradeLevel?.id;
        if (id) linked.add(id);
      }
    }

    return schoolGradesForLinkage.every((grade) => linked.has(grade.id));
  }, [
    schoolGradesForLinkage,
    feeAssignmentsData?.feeAssignments,
    feeAssignmentsLoading,
    feeAssignmentsError,
    currentPlanStructureIds,
    termsLoading,
  ]);

  useEffect(() => {
    if (currentView !== "dashboard") return;

    const sectionParam = searchParams.get(FEE_SECTION_QUERY);

    if (planSlugFromUrl && sectionParam !== "plans") {
      router.replace(
        buildFeesHref({ section: "plans", plan: planSlugFromUrl }),
        { scroll: false },
      );
      return;
    }

    if (!planSlugFromUrl && !sectionParam) {
      if (feeAssignmentsLoading || termsLoading) return;
      router.replace(
        allGradesLinked
          ? buildFeesHref({ section: "overview" })
          : feesPlansHref(),
        { scroll: false },
      );
    }
  }, [
    currentView,
    planSlugFromUrl,
    router,
    searchParams,
    allGradesLinked,
    feeAssignmentsLoading,
    termsLoading,
  ]);

  const linkedClassCountByPlan = useMemo(
    () =>
      buildLinkedClassCountByPlanId(
        processedFeeStructures,
        feeAssignmentsData?.feeAssignments,
      ),
    [processedFeeStructures, feeAssignmentsData?.feeAssignments],
  );

  const getLinkedClassCount = useCallback(
    (feeStructureId: string) =>
      linkedClassCountByPlan.get(feeStructureId) ?? 0,
    [linkedClassCountByPlan],
  );

  const getLinkedClasses = useCallback(
    (feeStructureId: string) => {
      const plan = findPlanForStructureId(
        processedFeeStructures,
        feeStructureId,
      );
      if (!plan) return [];
      return getLinkedClassesForPlan(
        plan,
        feeAssignmentsData?.feeAssignments,
        tenantGradeLabelMap,
      );
    },
    [
      processedFeeStructures,
      feeAssignmentsData?.feeAssignments,
      tenantGradeLabelMap,
    ],
  );

  const getTotalStudents = useCallback(
    (feeStructureId: string) => {
      const plan = findPlanForStructureId(
        processedFeeStructures,
        feeStructureId,
      );
      if (!plan) return 0;
      return countStudentsForPlan(
        plan,
        feeAssignmentsData?.feeAssignments,
      );
    },
    [processedFeeStructures, feeAssignmentsData?.feeAssignments],
  );

  const handleUpdateFeeItem = () => {
    /* Inline bucket edit removed — use Edit on the fee structure card */
  };


  const openBulkInvoiceGenerator = (
    structureId?: string,
    term?: string,
  ) => {
    if (!feesAccess.canBillStudents) {
      toast({ title: "View only", description: "Your role cannot bill students." });
      return;
    }
    if (processedFeeStructures.length === 0) {
      toast({
        title: "Create a fee plan first",
        description: "Add a fee plan before billing students.",
      });
      handleCreateNew();
      return;
    }

    const targetId =
      structureId || processedFeeStructures[0]?.structureId || "";
    if (targetId && getLinkedClassCount(targetId) === 0) {
      toast({
        title: "Link structure to classes first",
        description:
          "Apply this fee plan to grades or classes before generating bills.",
        variant: "destructive",
      });
      handleAssignToGrade(targetId);
      return;
    }

    if (assignedClassCount === 0) {
      toast({
        title: "Link structure to classes first",
        description:
          "Apply a fee plan to your classes before billing students.",
        variant: "destructive",
      });
      handleAssignToGradeAction();
      return;
    }

    if (structureId) setPreselectedStructureId(structureId);
    if (term) setPreselectedTerm(term);
    setShowInvoiceGenerator(true);
  };

  // Auto-fetch fee structures on mount (only once)
  useEffect(() => {
    if (!hasFetchedOnMount.current) {
      hasFetchedOnMount.current = true;
      fetchFeeStructures().catch((err) => {
        console.error("Failed to fetch fee structures on mount:", err);
        hasFetchedOnMount.current = false; // Reset on error so we can retry
      });
    }
  }, []); // Empty deps - only run once on mount

  // Auto-fetch when user clicks to view fee structures (if not already loaded)
  // Use a ref to prevent multiple fetches
  const isFetchingRef = useRef(false);

  useEffect(() => {
    // Only fetch if:
    // 1. User clicked to view fee structures
    // 2. We have no structures loaded
    // 3. We're not currently loading
    // 4. We're not currently fetching (prevent flood)
    // 5. We've already done the initial mount fetch
    if (
      feesSection === "plans" &&
      !lastFetchTime &&
      graphQLStructures.length === 0 &&
      !structuresLoading &&
      !structuresError &&
      hasFetchedOnMount.current &&
      !isFetchingRef.current
    ) {
      isFetchingRef.current = true;
      fetchFeeStructures()
        .then(() => {
          isFetchingRef.current = false;
        })
        .catch((err) => {
          console.error("Failed to fetch fee structures when viewing:", err);
          isFetchingRef.current = false;
        });
    }
  }, [
    feesSection,
    graphQLStructures.length,
    structuresLoading,
    structuresError,
    fetchFeeStructures,
    lastFetchTime,
  ]);

  // Student Summary hook for detailed student data
  const {
    studentData: detailedStudentData,
    loading: studentDataLoading,
    error: studentDataError,
    refetch: refetchStudentData,
  } = useStudentSummary(selectedStudent);

  // Fallback hook using the existing working implementation
  const {
    studentDetail: fallbackStudentData,
    loading: fallbackLoading,
    error: fallbackError,
    refetch: refetchFallback,
  } = useStudentDetailSummary(selectedStudent || "");

  // Use fallback data if main hook fails
  const finalStudentData = detailedStudentData || fallbackStudentData;
  const finalLoading = studentDataLoading || fallbackLoading;
  const finalError = studentDataError || fallbackError;

  const {
    students: allStudentsSummary,
    loading: studentsLoading,
    error: studentsError,
    refetch: refetchStudents,
  } = useAllStudentsSummary();

  const {
    summary: schoolArrearsSummary,
    loading: arrearsSummaryLoading,
    error: arrearsSummaryError,
    refetch: refetchArrearsSummary,
  } = useSchoolArrearsSummary();

  const collectionByPlanId = useMemo(
    () =>
      buildFeePlanCollectionByPlanId(
        processedFeeStructures,
        feeAssignmentsData?.feeAssignments,
        allStudentsSummary,
      ),
    [
      processedFeeStructures,
      feeAssignmentsData?.feeAssignments,
      allStudentsSummary,
    ],
  );

  const finalRefetch = async () => {
    await Promise.all([
      refetchStudentData(),
      refetchFallback(),
      refetchStudents(),
      refetchArrearsSummary(),
    ]);
  };

  const forcePageRefresh = () => {
    void finalRefetch();
  };

  const { append: appendReminderLog, refresh: refreshReminderLog } =
    useFeeReminderLog();

  const {
    showNewInvoiceDrawer,
    setShowNewInvoiceDrawer,
    showPaymentReminderDrawer,
    setShowPaymentReminderDrawer,
    showRecordPaymentDrawer,
    setShowRecordPaymentDrawer,
    newInvoiceForm,
    setNewInvoiceForm,
    reminderForm,
    setReminderForm,
    paymentForm,
    setPaymentForm,
    handleNewInvoice,
    handleSendReminder,
    handleRecordPayment,
    handleCreatePaymentPlan,
    handleSubmitPayment,
    handleSubmitReminder,
    handleSubmitInvoice,
    isGeneratingInvoices,
    isSubmittingPayment,
  } = useFormHandlers(
    selectedStudent,
    filteredInvoices,
    forcePageRefresh,
    (entry) => {
      appendReminderLog(entry);
      refreshReminderLog();
      appendAudit({
        action: "reminder_queued",
        summary: `Reminder queued (${entry.channel}) for ${entry.studentIds.length} student(s)`,
      });
    },
    (payment) => {
      const studentSummary = allStudentsSummary.find(
        (s) => s.id === payment.studentId,
      );
      const priorArrears = studentSummary?.feeSummary.balance ?? 0;
      const priorCredit = studentSummary?.feeSummary.creditBalance ?? 0;
      const { remainingBalance, creditBalance } = computeBalancesAfterPayment(
        priorArrears,
        priorCredit,
        payment.amount,
      );

      const apiStudent = payment.payment.student;
      const gradeLevelName =
        apiStudent.grade?.gradeLevel?.name ??
        studentSummary?.gradeLevelName ??
        "—";

      setPaymentReceipt({
        paymentId: payment.payment.id,
        receiptNumber: payment.payment.receiptNumber,
        amount: payment.payment.amount,
        paymentMethod: payment.payment.paymentMethod,
        transactionReference: payment.payment.transactionReference,
        paymentDate: payment.payment.paymentDate,
        notes: payment.payment.notes,
        receivedBy: payment.payment.receivedByUser?.name,
        student: {
          id: apiStudent.id,
          name: apiStudent.user.name,
          admissionNumber: apiStudent.admission_number,
          gradeLevelName,
          streamName: apiStudent.stream?.name,
          email: apiStudent.user.email,
        },
        invoice: {
          id: payment.payment.invoice.id,
          invoiceNumber: payment.payment.invoice.invoiceNumber,
          totalAmount: payment.payment.invoice.totalAmount,
          paidAmount: payment.payment.invoice.paidAmount,
          balanceAmount: payment.payment.invoice.balanceAmount,
          termName: payment.payment.invoice.term?.name,
          academicYearName: payment.payment.invoice.academicYear?.name,
        },
        remainingBalance,
        creditBalance,
      });
      setShowPaymentReceipt(true);

      appendAudit({
        action: "payment_recorded",
        summary: `Payment KES ${payment.amount.toLocaleString()} recorded${payment.receiptNumber ? ` · ${payment.receiptNumber}` : ""}`,
        meta: { studentId: payment.studentId },
      });
    },
  );

  useEffect(() => {
    refreshAudit();
  }, [refreshAudit]);

  const overviewStudents = useMemo(() => {
    if (!selectedClass || selectedClass === "all") return allStudentsSummary;
    return allStudentsSummary.filter(
      (student) =>
        student.gradeLevelName === selectedClass ||
        student.gradeLevelName?.includes(selectedClass),
    );
  }, [allStudentsSummary, selectedClass]);

  const overviewStudentIdSet = useMemo(
    () =>
      selectedClass && selectedClass !== "all"
        ? new Set(overviewStudents.map((student) => student.id))
        : undefined,
    [overviewStudents, selectedClass],
  );

  const bursarMetrics = useBursarDashboardMetrics(overviewStudents, {
    studentIds: overviewStudentIdSet,
  });

  const reminderTermWindow = useMemo(
    () => resolveTermWindow(availableTerms ?? []),
    [availableTerms],
  );
  const reminderNextTerm = reminderTermWindow.next;

  const reminderNextTermFeesByGrade = useMemo(() => {
    const byGrade: Record<string, number> = {};
    const termId = reminderNextTerm?.id;
    if (!termId) return byGrade;

    for (const plan of processedFeeStructures) {
      const buckets = plan.termFeesMap?.[termId] ?? [];
      const total = buckets.reduce(
        (sum, bucket) => sum + (bucket.totalAmount || 0),
        0,
      );
      if (total <= 0) continue;
      for (const gradeLevel of plan.gradeLevels ?? []) {
        const name = gradeLevel.name || gradeLevel.gradeLevel?.name;
        if (name && byGrade[name] == null) byGrade[name] = total;
      }
    }
    return byGrade;
  }, [processedFeeStructures, reminderNextTerm?.id]);

  const overviewBootstrapping =
    studentsLoading || feeAssignmentsLoading;

  const assignedClassCount = useMemo(() => {
    let total = 0;
    linkedClassCountByPlan.forEach((n) => {
      total += n;
    });
    return total;
  }, [linkedClassCountByPlan]);

  const billingStarted = useMemo(
    () =>
      allStudentsSummary.some((s) => s.feeSummary.numberOfFeeItems > 0) ||
      Number(summaryStats?.totalCollected ?? 0) > 0,
    [allStudentsSummary, summaryStats?.totalCollected],
  );

  const feeWorkflowCompleted = useMemo(() => {
    const steps: number[] = [];
    const planCount =
      processedFeeStructures.length ||
      graphQLStructures.length ||
      feeStructures.length;
    if (planCount > 0) steps.push(0);
    if (assignedClassCount > 0) steps.push(1);
    if (billingStarted) steps.push(2);
    if (Number(summaryStats?.totalCollected ?? 0) > 0) steps.push(3);
    return steps;
  }, [
    processedFeeStructures.length,
    graphQLStructures.length,
    feeStructures.length,
    assignedClassCount,
    billingStarted,
    summaryStats?.totalCollected,
  ]);

  const filteredStudentsForBalances = useMemo(() => {
    let list = allStudentsSummary;
    if (selectedClass && selectedClass !== "all") {
      list = list.filter(
        (s) =>
          s.gradeLevelName === selectedClass ||
          s.gradeLevelName?.includes(selectedClass),
      );
    }
    return list;
  }, [allStudentsSummary, selectedClass]);

  const balanceClassOptions = useMemo(() => {
    const names = new Set<string>();
    for (const s of allStudentsSummary) {
      if (s.gradeLevelName) names.add(s.gradeLevelName);
    }
    return Array.from(names).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true }),
    );
  }, [allStudentsSummary]);

  const displayedStudentsForBalances = useMemo(() => {
    let list = filteredStudentsForBalances;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (s) =>
          s.studentName.toLowerCase().includes(q) ||
          s.admissionNumber.toLowerCase().includes(q),
      );
    }
    if (balancesStatusFilter === "all") return list;
    return list.filter((s) => {
      const { balance, totalPaid, numberOfFeeItems } = s.feeSummary;
      if (balancesStatusFilter === "owing") return balance > 0;
      if (balancesStatusFilter === "high")
        return balance >= BALANCE_ALERT_KES;
      if (balancesStatusFilter === "paid")
        return balance === 0 && totalPaid > 0;
      if (balancesStatusFilter === "pending")
        return balance === 0 && totalPaid === 0 && numberOfFeeItems === 0;
      return true;
    });
  }, [filteredStudentsForBalances, balancesStatusFilter, searchTerm]);

  // Access the toast function
  const { toast } = useToast();

  /** Single path: open the 3-step fee schedule wizard */
  const startCreateFeePlan = useCallback(() => {
    if (!feesAccess.canManagePlans) {
      toast({
        title: "View only",
        description: "Your role cannot create fee schedules.",
      });
      return;
    }
    setSelectedStructure(null);
    navigateToFeesSection("plans");
    setShowCreateForm(true);
  }, [feesAccess.canManagePlans, toast, navigateToFeesSection]);

  const openGuidedSetup = startCreateFeePlan;
  const handleCreateNew = startCreateFeePlan;

  // Event handlers
  const handleViewInvoice = (invoice: FeeInvoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId],
    );
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === filteredInvoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(filteredInvoices.map((inv) => inv.id));
    }
  };

  // Handlers for new students table
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentsForTable((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudentsForTable.length === allStudentsSummary.length) {
      setSelectedStudentsForTable([]);
    } else {
      setSelectedStudentsForTable(allStudentsSummary.map((s) => s.id));
    }
  };

  const handleViewStudent = (student: StudentSummaryFromAPI) => {
    setViewingStudent(student);
    setSelectedStudent(student.id);
    setShowStudentDetailsDrawer(true);
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudent(studentId);
    setSelectedInvoices([]);
    setShowStudentDetailsDrawer(true);
  };

  const handleClearStudentSelection = () => {
    setSelectedStudent(null);
    setShowStudentDetailsDrawer(false);
  };

  // Wrapper functions for PageHeader
  const handleSendReminderWrapper = () => {
    handleSendReminder(selectedInvoices);
  };

  // Fee Structure handlers
  const handleEdit = (feeStructure: FeeStructure) => {
    const processedStructure = processedFeeStructures.find(
      (s) => s.structureId === feeStructure.id,
    );

    if (processedStructure && !isFeePlanEditable(processedStructure)) {
      toast({
        title: "Structure is inactive",
        description:
          "Expired fee plans are read-only. Existing balances can still be collected from Balances.",
        variant: "destructive",
      });
      return;
    }

    const graphQLStructure =
      processedStructure?.allStructures?.[0] ||
      graphQLStructures.find((s) => s.id === feeStructure.id);

    // If we have a processed structure, we can get all terms from it
    // Otherwise, we'll need to fetch terms from the academic year
    setSelectedStructure(feeStructure);
    setSelectedGraphQLStructure(graphQLStructure || null);
    setSelectedProcessedStructure(processedStructure || null);
    setShowEditForm(true);
  };

  const handleDelete = async (
    feeStructureId: string,
    structureName?: string,
  ) => {
    // Prevent multiple simultaneous deletions
    if (deletingStructureId.current !== null) {
      return;
    }

    if (deletingStructureId.current === feeStructureId) {
      return;
    }

    try {
      deletingStructureId.current = feeStructureId;

      toast({
        title: "Deleting fee plan...",
        description: structureName
          ? `Please wait while we delete "${structureName}".`
          : "Please wait while we delete this fee plan.",
      });

      const success = await graphqlDeleteFeeStructure(feeStructureId);

      if (success) {
        try {
          await fetchFeeStructures();
        } catch (refreshError) {
          console.error(
            "Failed to refresh fee plans list, but deletion succeeded:",
            refreshError,
          );
          // Don't show error to user since deletion succeeded
        }

        appendAudit({
          action: "fee_plan_deleted",
          summary: structureName
            ? `Fee plan "${structureName}" deleted`
            : "Fee plan deleted",
        });

        toast({
          title: "Fee plan deleted",
          description: structureName
            ? `"${structureName}" has been successfully deleted.`
            : "The fee plan has been successfully deleted.",
          variant: "default",
        });

        const deletedWasOpen =
          planSlugFromUrl &&
          findFeePlanBySlug(processedFeeStructures, planSlugFromUrl)
            ?.structureId === feeStructureId;
        if (deletedWasOpen) {
          backToFeePlanList();
        }
      } else {
        const errorMsg =
          deleteError ||
          "Failed to delete fee plan. It may be in use or you may not have permission to delete it.";
        console.error(`Delete failed for ${feeStructureId}:`, errorMsg);
        toast({
          title: "Deletion failed",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (error) {
      // Show unexpected error toast
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(
        `Unexpected error deleting fee structure ${feeStructureId}:`,
        error,
      );
      toast({
        title: "Unexpected error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      deletingStructureId.current = null;
    }
  };

  const handleSaveStructure = async (
    formData: FeeStructureForm | any,
  ): Promise<string | null> => {
    try {
      let result: string | null = null;

      // Check if structure was already created by the wizard (has id property)
      if ((formData as any).id && !selectedStructure) {
        // Structure was already created by createFeeStructureWithItems in the wizard
        // Just refresh the list and return the ID
        result = (formData as any).id;
        await fetchFeeStructures();
      } else if (selectedStructure) {
        // FeeStructureWizard already persisted metadata + line-item amounts in edit mode
        if ((formData as { id?: string }).id) {
          result = (formData as { id: string }).id;
        } else {
          const currentStructure = graphQLStructures.find(
            (s) => s.id === selectedStructure.id,
          );
          const gradeLevelIds =
            currentStructure?.gradeLevels?.map((gl) => gl.id) || [];

          const updateInput: UpdateFeeStructureInput = {
            name: formData.name,
            isActive: true,
            gradeLevelIds: gradeLevelIds.length > 0 ? gradeLevelIds : undefined,
          };

          result = await graphqlUpdateFeeStructure(
            selectedStructure.id,
            updateInput,
          );
          if (!result) {
            throw new Error(
              `GraphQL update failed: ${updateError || "Unknown error"}`,
            );
          }
        }

        await fetchFeeStructures();
      } else {
        // For create mode, use the local function (only if termStructures exists)
        if ((formData as FeeStructureForm).termStructures) {
          result = await createFeeStructure(formData as FeeStructureForm);
          // Refresh the list after creation
          await fetchFeeStructures();
        } else {
          // If no termStructures, assume it was already created
          result = (formData as any).id || null;
          await fetchFeeStructures();
        }
      }

      // Reset UI state
      setShowCreateForm(false);
      setShowEditForm(false);
      setSelectedStructure(null);

      const wasCreate = !selectedStructure;

      toast({
        title: wasCreate ? "Fee plan created" : "Fee plan updated",
        description: wasCreate
          ? "Next, apply it to your classes so students can be billed."
          : "Your changes have been saved.",
        variant: "default",
      });

      if (result) {
        appendAudit({
          action: "fee_plan_created",
          summary: wasCreate
            ? `Fee plan "${(formData as { name?: string }).name || "New plan"}" created`
            : `Fee plan updated`,
        });
      }

      if (wasCreate && result) {
        const name =
          (formData as { name?: string }).name ||
          graphQLStructures.find((s) => s.id === result)?.name ||
          "Fee plan";
        setFeeStructureToAssign({
          id: result,
          name,
          isActive: true,
          linkedGrades: [],
          linkedAssignments: [],
          gradeLevelIds: [],
        });
        setPendingLinkGradeIds([]);
        setIsAssignModalOpen(true);
      }

      return result;
    } catch (error) {
      const errorMessage = getDisplayErrorMessage(error);
      console.error("Error saving fee structure:", error);

      toast({
        title: selectedStructure ? "Could not update fee plan" : "Could not create fee plan",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    }
  };

  const handleGenerateInvoices = (feeStructureId: string, term: string) => {
    const structure = processedFeeStructures.find(
      (s) => s.structureId === feeStructureId,
    );

    if (structure && !isFeePlanEditable(structure)) {
      toast({
        title: "Structure is inactive",
        description:
          "Cannot generate new invoices from an expired fee plan. Collect against existing balances instead.",
        variant: "destructive",
      });
      return;
    }

    openBulkInvoiceGenerator(feeStructureId, term);
  };

  const handleBulkGeneration = (generation: BulkInvoiceGeneration) => {
    try {
      const newInvoices = generateBulkInvoices(generation);

      appendAudit({
        action: "invoices_generated",
        summary: `Generated ${newInvoices.length} invoice${newInvoices.length !== 1 ? "s" : ""}`,
      });

      toast({
        title: "Success",
        description: `Generated ${newInvoices.length} invoice${newInvoices.length !== 1 ? "s" : ""} successfully`,
        variant: "default",
      });

      // Switch to invoices view to show the new invoices
      setCurrentView("invoices");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Failed to generate invoices:", error);

      // Show error toast
      toast({
        title: "Error",
        description: `Failed to generate invoices: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const openLinkGradesDrawer = (
    feeStructureId: string,
    initialGradeIds: string[] = [],
  ) => {
    if (feeAssignmentsLoading) {
      toast({
        title: "Checking current grade links",
        description:
          "Give it a moment, then try again. This stops a grade being linked twice.",
      });
      return;
    }
    if (feeAssignmentsError) {
      toast({
        title: "Could not check grade links",
        description: "Refresh the page and try again before linking.",
        variant: "destructive",
      });
      return;
    }

    const structure = processedFeeStructures.find(
      (s) => s.structureId === feeStructureId,
    );

    if (structure && !isFeePlanEditable(structure)) {
      toast({
        title: "Structure is inactive",
        description:
          "Cannot link classes or create new assignments from an expired fee plan.",
        variant: "destructive",
      });
      return;
    }

    if (structure) {
      const plan = findPlanForStructureId(
        processedFeeStructures,
        structure.structureId,
      );
      const planTermIds = new Set(structure.terms.map((term) => term.id));
      const ownStructureIds = new Set<string>([
        structure.structureId,
        ...(plan?.allStructures?.map((item: { id: string }) => item.id) ?? []),
      ]);
      const conflictsByGrade = new Map<
        string,
        {
          gradeId: string;
          gradeName: string;
          planNames: Set<string>;
          termNames: Set<string>;
        }
      >();

      for (const link of getGradePlanLinks(
        processedFeeStructures,
        feeAssignmentsData?.feeAssignments,
      )) {
        if (
          link.planId === structure.structureId ||
          ownStructureIds.has(link.feeStructureId)
        ) {
          continue;
        }
        const overlappingTerms = link.termIds
          .map((id, index) => ({
            id,
            name: link.termNames[index] ?? "Term",
          }))
          .filter((term) => planTermIds.has(term.id));
        if (overlappingTerms.length === 0) continue;

        const key = link.gradeId;
        const existing = conflictsByGrade.get(key) ?? {
          gradeId: link.gradeId,
          gradeName: tenantGradeLabelMap.get(link.gradeId) ?? "Grade",
          planNames: new Set<string>(),
          termNames: new Set<string>(),
        };
        existing.planNames.add(link.planName);
        for (const term of overlappingTerms) {
          existing.termNames.add(term.name);
        }
        conflictsByGrade.set(key, existing);
      }

      setPendingLinkGradeIds(initialGradeIds);
      setFeeStructureToAssign({
        id: structure.structureId,
        name: structure.structureName,
        academicYear: structure.academicYear,
        isActive: structure.isActive,
        linkedGrades: getLinkedClasses(structure.structureId),
        linkedAssignments: plan
          ? getLinkedAssignmentGroupsForPlan(
              plan,
              feeAssignmentsData?.feeAssignments,
            )
          : [],
        conflictingGrades: [...conflictsByGrade.values()].map((conflict) => ({
          gradeId: conflict.gradeId,
          gradeName: conflict.gradeName,
          planNames: [...conflict.planNames],
          termNames: [...conflict.termNames],
        })),
        planTermNames: structure.terms.map((term) => term.name),
        gradeLevelIds: structure.gradeLevels
          .map((gradeLevel) => gradeLevel.id)
          .filter(Boolean),
      });
      setIsAssignModalOpen(true);
    } else {
      console.error("Fee structure not found:", feeStructureId);
      toast({
        title: "Error",
        description:
          "Fee plan not found. Please refresh the page and try again.",
        variant: "destructive",
      });
    }
  };

  /** Standard row/detail action: open the drawer with no preselected grades. */
  const handleAssignToGrade = (feeStructureId: string) =>
    openLinkGradesDrawer(feeStructureId);

  // Handle assignment success
  const handleAssignmentSuccess = (assignmentResult: any) => {
    appendAudit({
      action: "plan_assigned",
      summary: `Fee plan linked to classes`,
    });
    Promise.all([
      fetchFeeStructures(),
      fetchGradeData(),
      refetchFeeAssignments(),
    ]).catch((err) => {
      console.error("Failed to refresh data after assignment:", err);
      toast({
        title: "Warning",
        description:
          "Assignment successful but failed to refresh data. Please refresh the page.",
        variant: "destructive",
      });
    });
  };

  const handleUnlinkAssignment = async (
    assignmentId: string,
  ): Promise<boolean> => {
    if (!feesAccess.canManagePlans) {
      toast({
        title: "View only",
        description: "Your role cannot change grade links.",
      });
      return false;
    }

    try {
      const response = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation RemoveFeeAssignment($id: ID!) {
              removeFeeAssignment(id: $id)
            }
          `,
          variables: { id: assignmentId },
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(`GraphQL request failed with status ${response.status}`);
      }
      if (result.errors?.length) {
        throw new Error(
          result.errors[0]?.message || "Failed to unlink this fee plan",
        );
      }
      if (result.data?.removeFeeAssignment !== true) {
        throw new Error("The fee plan link could not be removed.");
      }

      await Promise.all([
        refetchFeeAssignments(),
        fetchFeeStructures(),
        fetchGradeData(),
      ]).catch((refreshError) => {
        console.error("Link removed, but refresh failed:", refreshError);
        toast({
          title: "Link removed — refresh needed",
          description:
            "Future billing stopped, but the list may look stale. Refresh the page to update it.",
        });
      });

      appendAudit({
        action: "plan_unlinked",
        summary: "Fee plan link removed and unpaid fee items cleared",
      });

      toast({
        title: "Link removed",
        description:
          "Unpaid fee items created by this link were removed. No invoices or payments were deleted.",
      });
      return true;
    } catch (error) {
      const message = getDisplayErrorMessage(error);
      toast({
        title: "Could not unlink",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  const handleOpenLinkMissingGrades = (group: AcademicYearPlanGroup) => {
    if (feeAssignmentsLoading) {
      toast({
        title: "Checking current grade links",
        description:
          "Give it a moment, then try again. This stops a grade being linked twice.",
      });
      return;
    }
    if (feeAssignmentsError) {
      toast({
        title: "Could not check grade links",
        description: "Refresh the page and try again before linking.",
        variant: "destructive",
      });
      return;
    }
    setMissingGradesGroup(group);
    setShowLinkMissingGrades(true);
  };

  const handleSelectPlanForMissingGrades = (plan: ProcessedFeeStructure) => {
    const gradeIds =
      missingGradesGroup?.unlinkedGrades.map((grade) => grade.id) ?? [];
    setShowLinkMissingGrades(false);
    setMissingGradesGroup(null);
    openLinkGradesDrawer(plan.structureId, gradeIds);
  };

  const handleSendRemindersFromSelection = () => {
    if (!feesAccess.canSendReminders) return;
    const ids =
      selectedStudentsForTable.length > 0
        ? selectedStudentsForTable
        : displayedStudentsForBalances
            .filter((s) => s.feeSummary.balance > 0)
            .map((s) => s.id);

    if (ids.length === 0) {
      toast({
        title: "No students selected",
        description:
          "Select students on the balances tab, or filter to students who owe fees.",
      });
      navigateToFeesSection("balances");
      return;
    }

    setReminderForm((prev) => ({ ...prev, studentIds: ids }));
    setShowPaymentReminderDrawer(true);
  };

  // Action handlers for dashboard
  const handleViewStructures = () => {
    navigateToFeesSection("plans");
  };

  const handleViewInvoices = () => {
    navigateToFeesSection("balances");
  };

  const handleViewAssignments = () => {
    navigateToFeesSection("assignments");
  };

  const handleViewHighBalances = () => {
    navigateToFeesSection("balances");
    setBalancesStatusFilter("high");
  };

  const handleReminderForStudent = (studentId: string) => {
    if (!feesAccess.canSendReminders) return;
    setReminderForm((prev) => ({ ...prev, studentIds: [studentId] }));
    setShowPaymentReminderDrawer(true);
  };

  const handleLogAdjustment = () => {
    if (!feesAccess.canAdjustFees) {
      toast({ title: "View only", description: "Your role cannot log adjustments." });
      return;
    }
    if (!selectedStudent) {
      toast({
        title: "Select a student first",
        description: "Open a student from Balances before logging an adjustment.",
        variant: "destructive",
      });
      return;
    }
    setAdjustmentForm({
      type: "discount",
      amount: "",
      reason: "",
      studentFeeItemId: "",
    });
    setShowAdjustmentDrawer(true);
  };

  const handleSubmitAdjustment = async () => {
    if (!selectedStudent || !finalStudentData) {
      toast({
        title: "Student not ready",
        description:
          "Wait for the student profile to load, then try again.",
        variant: "destructive",
      });
      return;
    }

    const reason = adjustmentForm.reason.trim();
    if (reason.length < 3) {
      toast({
        title: "Reason required",
        description: "Enter at least 3 characters explaining this adjustment.",
        variant: "destructive",
      });
      return;
    }

    const amount = Number(adjustmentForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({
        title: "Enter an amount",
        description: "Adjustment amount must be greater than zero.",
        variant: "destructive",
      });
      return;
    }

    const { record: result, errorMessage } = await applyFeeAdjustment({
      studentId: finalStudentData.id,
      type: mapAdjustmentType(adjustmentForm.type),
      amount,
      reason: adjustmentForm.reason.trim(),
      studentFeeItemId: adjustmentForm.studentFeeItemId || undefined,
    });

    if (!result) {
      toast({
        title: "Adjustment failed",
        description:
          errorMessage ??
          "Could not apply the fee adjustment. Check that the student has unpaid fee lines and try again.",
        variant: "destructive",
      });
      return;
    }

    appendAudit({
      action: "adjustment_applied",
      summary: `${adjustmentForm.type} of KES ${result.amount.toLocaleString()} for ${finalStudentData.studentName}: ${adjustmentForm.reason.trim()}`,
      meta: { studentId: finalStudentData.id, adjustmentId: result.id },
    });
    setShowAdjustmentDrawer(false);
    setAdjustmentForm({
      type: "discount",
      amount: "",
      reason: "",
      studentFeeItemId: "",
    });
    await finalRefetch();
    toast({
      title: "Adjustment applied",
      description: `KES ${result.amount.toLocaleString()} credited. Balance and invoices updated.`,
    });
  };

  const exportBalancesCsv = () => {
    if (!feesAccess.canExport) return;
    downloadCsv(`student-balances-${new Date().toISOString().split("T")[0]}.csv`, [
      ["Name", "Admission", "Class", "Total owed", "Paid", "Balance"],
      ...displayedStudentsForBalances.map((s) => [
        s.studentName,
        s.admissionNumber,
        s.gradeLevelName,
        String(s.feeSummary.totalOwed),
        String(s.feeSummary.totalPaid),
        String(s.feeSummary.balance),
      ]),
    ]);
  };

  const handlePaymentVoided = (paymentId: string, reason: string) => {
    appendAudit({
      action: "payment_voided",
      summary: `Payment reversed: ${reason}`,
      meta: { paymentId },
    });
    toast({ title: "Payment reversed", description: "Balances will refresh." });
    forcePageRefresh();
  };

  const handleAssignToGradeAction = () => {
    navigateToFeesSection("plans");

    if (processedFeeStructures.length === 0) {
      toast({
        title: "Create a fee plan first",
        description: "Add a fee plan, then apply it to your classes.",
      });
      setShowCreateForm(true);
      return;
    }

    if (processedFeeStructures.length === 1) {
      handleAssignToGrade(processedFeeStructures[0].structureId);
      return;
    }

    toast({
      title: "Choose a fee plan",
      description:
        "Open the structure you want below, then tap Apply to class on that card.",
    });
  };

  const handleFeeWorkflowStep = (step: number) => {
    switch (step) {
      case 0:
        navigateToFeesSection("plans");
        handleCreateNew();
        break;
      case 1:
        handleAssignToGradeAction();
        break;
      case 2:
        navigateToFeesSection("overview");
        openBulkInvoiceGenerator();
        break;
      case 3:
        navigateToFeesSection("overview");
        openRecordPayment();
        break;
      default:
        break;
    }
  };

  const openRecordPayment = (studentId?: string) => {
    if (!feesAccess.canRecordPayments) {
      toast({
        title: "View only",
        description: "Your role cannot record payments on this page.",
      });
      return;
    }
    const id = studentId || selectedStudent || null;
    if (id) {
      setSelectedStudent(id);
      setPaymentForm((prev) => ({
        ...prev,
        studentId: id,
        paymentDate: prev.paymentDate || new Date().toISOString().split("T")[0],
      }));
    } else {
      setPaymentForm((prev) => ({
        ...prev,
        studentId: "",
        invoiceId: "",
        paymentDate: new Date().toISOString().split("T")[0],
      }));
    }
    setShowRecordPaymentDrawer(true);
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col w-full max-w-full overflow-x-hidden">
        {/* Header with Back Button when not on dashboard */}
        {currentView !== "dashboard" && (
          <div className="border-b border-slate-200 bg-white px-5 py-2.5">
            <Button
              variant="ghost"
              onClick={() => setCurrentView("dashboard")}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
            >
              ← Back to Dashboard
            </Button>
          </div>
        )}

        {/* Content Based on Current View */}
        {currentView === "dashboard" ? (
          <FeesPageShell>
            <div className="flex min-h-0 flex-1 flex-col">
              <FeesPageChrome
                feesSection={feesSection}
                planDetailMode={
                  !!planSlugFromUrl && feesSection === "plans"
                }
                assignmentCount={
                  feeAssignmentsData?.totalFeeAssignments ?? undefined
                }
                hideReports={!feesAccess.canViewReports}
                isReadOnly={feesAccess.isReadOnly}
                onNavigateReports={() => navigateToFeesSection("reports")}
                header={{
                  collectionRate: bursarMetrics.collectionRate,
                  totalExpected: bursarMetrics.totalExpected,
                  totalCollected: bursarMetrics.totalCollected,
                  todayPaymentCount: bursarMetrics.todayPaymentCount,
                  overviewSetupMode:
                    feesSection === "overview" &&
                    !overviewBootstrapping &&
                    !hasMeaningfulFeeMetrics({
                      totalExpected: bursarMetrics.totalExpected,
                      totalCollected: bursarMetrics.totalCollected,
                      todayPaymentCount: bursarMetrics.todayPaymentCount,
                    }) &&
                    !setupMilestonesComplete(feeWorkflowCompleted),
                  isReadOnly: feesAccess.isReadOnly,
                  selectedStudent: selectedStudent,
                  searchTerm,
                  setSearchTerm,
                  filteredStudents,
                  onStudentSelect: handleStudentSelect,
                  onClearSelection: handleClearStudentSelection,
                  selectedGrade: selectedClass || "all",
                  onGradeChange: setSelectedClass,
                  gradeOptions: balanceClassOptions,
                }}
              />

              <div className="flex min-h-0 min-w-0 max-w-full flex-1 flex-col overflow-x-hidden lg:flex-row">
                {(feesSection === "overview" || feesSection === "balances") && (
                  <BalancesGradeSidebar
                    selectedGradeName={selectedClass || "all"}
                    onGradeNameChange={setSelectedClass}
                  />
                )}

                <div
                  className={cn(
                    "flex min-h-0 min-w-0 max-w-full flex-1 flex-col overflow-x-hidden",
                    FEES_MOBILE.stack,
                  )}
                >
              {feesSection === "overview" && (
                <FeesOverviewBoard
                  metrics={bursarMetrics}
                  completedSteps={feeWorkflowCompleted}
                  bootstrapping={overviewBootstrapping}
                  onStepClick={handleFeeWorkflowStep}
                  onViewBalances={handleViewInvoices}
                  onViewHighBalances={handleViewHighBalances}
                  onGenerateInvoices={() => openBulkInvoiceGenerator()}
                  onRecordPayment={() => openRecordPayment()}
                  onOpenPaymentSettings={() => {
                    if (!isSchoolOwner) {
                      toast({
                        title: "School owner only",
                        description:
                          "Ask the school owner to add or change payment details.",
                      });
                      return;
                    }
                    setShowPaymentsDrawer(true);
                  }}
                  onGuidedSetup={
                    feesAccess.canManagePlans ? openGuidedSetup : undefined
                  }
                  onSendReminders={
                    feesAccess.canSendReminders
                      ? handleSendRemindersFromSelection
                      : undefined
                  }
                />
              )}

              {feesSection === "reports" && feesAccess.canViewReports && (
                <FeesPanel
                  dense
                  noPadding
                  className="flex min-h-0 flex-1 flex-col border-0 bg-transparent shadow-none"
                >
                <div className="flex min-h-0 flex-1 flex-col overflow-auto p-2 sm:p-3">
                <FeesReportsPanel
                  embedded
                  students={allStudentsSummary}
                  auditEntries={auditEntries}
                  canExport={feesAccess.canExport}
                  onTermInvoices={
                    !feesAccess.isReadOnly
                      ? () => openBulkInvoiceGenerator()
                      : undefined
                  }
                />
                </div>
                </FeesPanel>
              )}

              {feesSection === "plans" && !feesAccess.canManagePlans && (
                <FeesPanel>
                <p className="text-sm text-slate-600">
                  Your role cannot edit fee plans. Open Reports or Student
                  balances instead.
                </p>
                </FeesPanel>
              )}

              {feesSection === "plans" && feesAccess.canManagePlans && (
                <FeesPanel
                  dense
                  noPadding
                  className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden border-0 bg-transparent shadow-none"
                >
                  <div
                    className={cn(
                      "min-h-0 min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto",
                      planSlugFromUrl
                        ? "max-md:p-0 md:p-2 md:sm:p-3"
                        : "p-2",
                    )}
                    style={
                      planSlugFromUrl
                        ? { backgroundColor: FEES_BRAND.surface }
                        : undefined
                    }
                  >
                  <FeeStructuresTab
                    isLoading={structuresLoading}
                    error={structuresError}
                    structures={graphQLStructures}
                    graphQLStructures={processedFeeStructures}
                    fallbackFeeStructures={[]}
                    onEdit={handleEdit}
                    onAssignToGrade={handleAssignToGrade}
                    onGenerateInvoices={handleGenerateInvoices}
                    onDelete={handleDelete}
                    onUpdateFeeItem={handleUpdateFeeItem}
                    onCreateNew={handleCreateNew}
                    fetchFeeStructures={fetchFeeStructures}
                    getLinkedClassCount={getLinkedClassCount}
                    getLinkedClasses={getLinkedClasses}
                    getTotalStudents={getTotalStudents}
                    collectionByPlanId={collectionByPlanId}
                    feeAssignments={feeAssignmentsData?.feeAssignments}
                    schoolGrades={schoolGradesForLinkage}
                    onLinkMissingGrades={handleOpenLinkMissingGrades}
                    onGuidedSetup={openGuidedSetup}
                    hasFetched={!!lastFetchTime}
                    isDeleting={isDeleting}
                    selectedPlanSlug={planSlugFromUrl}
                    onBackToPlanList={backToFeePlanList}
                    canManage={feesAccess.canManagePlans}
                    canBill={feesAccess.canBillStudents}
                  />
                  </div>
                </FeesPanel>
              )}

              {feesSection === "balances" && (
                <FeesPanel
                  dense
                  noPadding
                  title="Student balances"
                  description={
                    studentsLoading || arrearsSummaryLoading
                      ? "Loading balances…"
                      : [
                          `${displayedStudentsForBalances.length} shown`,
                          selectedClass && selectedClass !== "all"
                            ? selectedClass
                            : null,
                          balancesStatusFilter !== "all"
                            ? balancesStatusFilter.replace(/_/g, " ")
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")
                  }
                  className={cn(
                    "flex min-h-0 min-w-0 flex-1 flex-col",
                    FEES_MOBILE.panelGhost,
                  )}
                  action={
                    <div
                      className={cn(
                        FEES_LAYOUT.panelActions,
                        "min-[480px]:items-stretch max-md:[&_button]:h-11 max-md:[&_button]:rounded-xl",
                      )}
                    >
                      <Select
                        value={balancesStatusFilter}
                        onValueChange={setBalancesStatusFilter}
                      >
                        <SelectTrigger className="h-9 w-full border-slate-200 bg-white text-xs min-[480px]:h-8 min-[480px]:w-[10.5rem]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All students</SelectItem>
                          <SelectItem value="owing">Amount due</SelectItem>
                          <SelectItem value="high">
                            Above KES {BALANCE_ALERT_KES.toLocaleString()}
                          </SelectItem>
                          <SelectItem value="paid">Paid up</SelectItem>
                          <SelectItem value="pending">No fees yet</SelectItem>
                        </SelectContent>
                      </Select>
                      {feesAccess.canRecordPayments && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-full text-xs min-[480px]:h-8 min-[480px]:w-auto"
                          onClick={() => setShowBulkPaymentImport(true)}
                        >
                          <Upload className="mr-1 h-3.5 w-3.5" />
                          Bulk import
                        </Button>
                      )}
                      {feesAccess.canExport && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-full text-xs min-[480px]:h-8 min-[480px]:w-auto"
                          onClick={exportBalancesCsv}
                        >
                          <Download className="mr-1 h-3.5 w-3.5" />
                          Export
                        </Button>
                      )}
                      {feesAccess.canSendReminders && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-full text-xs min-[480px]:h-8 min-[480px]:w-auto"
                          onClick={handleSendRemindersFromSelection}
                          disabled={
                            selectedStudentsForTable.length === 0 &&
                            !displayedStudentsForBalances.some(
                              (s) => s.feeSummary.balance > 0,
                            )
                          }
                        >
                          Remind
                        </Button>
                      )}
                    </div>
                  }
                >
                  <ArrearsSummaryPanel
                    summary={schoolArrearsSummary}
                    loading={arrearsSummaryLoading}
                    error={arrearsSummaryError}
                    selectedGrade={selectedClass || "all"}
                  />
                  <div className="min-h-0 flex-1 overflow-auto max-md:p-0 sm:p-3">
                  <FeesDataTable
                    embedded
                    streamlined
                    students={displayedStudentsForBalances}
                    loading={studentsLoading}
                    error={studentsError}
                    selectedStudents={selectedStudentsForTable}
                    onSelectStudent={handleSelectStudent}
                    onSelectAll={handleSelectAllStudents}
                    onViewStudent={handleViewStudent}
                  />
                  </div>
                </FeesPanel>
              )}

              {feesSection === "assignments" && (
                <FeesPanel
                  dense
                  noPadding
                  className="flex min-h-0 flex-1 flex-col overflow-auto border-0 bg-transparent shadow-none"
                >
                  <FeeAssignmentsView />
                </FeesPanel>
              )}
                </div>
              </div>
            </div>
          </FeesPageShell>
        ) : currentView === "structures" ? (
          <FeesPageShell>
            <div className="space-y-6">
              <WorkflowGuidance
                completedSteps={feeWorkflowCompleted}
                onStepClick={handleFeeWorkflowStep}
              />

              <FeesPanel title="Manage fee plans" noPadding>
                <div className="p-5 sm:p-6">
              <FeeStructureManager
                onCreateNew={handleCreateNew}
                onEdit={handleEdit}
                onGenerateInvoices={handleGenerateInvoices}
                onAssignToGrade={handleAssignToGrade}
                onDelete={handleDelete}
              />
                </div>
              </FeesPanel>
            </div>
          </FeesPageShell>
        ) : (
          <div className="flex-1 flex flex-col">
            {/* Main Content Area */}
            <div className="flex-1 p-6">
              {selectedStudent ? (
                // Student-specific view (unified invoice view)
                <div className="space-y-6">
                  {/* Fee Summary Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Fee Summary
                      </h2>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowStudentDetailsDrawer(true)}
                      >
                        View Full Details
                      </Button>
                    </div>
                    <FeeSummaryCard
                      studentData={finalStudentData}
                      loading={finalLoading}
                      error={finalError}
                    />
                  </div>

                  {/* Fee Invoices Section */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Fee Invoices
                    </h2>
                    <StudentInvoicesTable
                      invoices={selectedStudentInvoices}
                      studentName={finalStudentData?.studentName || "Student"}
                      onViewInvoice={handleViewInvoice}
                    />
                  </div>

                  {/* Payment History Section */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Payment History
                    </h2>
                    <StudentPayments studentId={selectedStudent} />
                  </div>
                </div>
              ) : (
                // General overview view
                <div className="space-y-6">
                  {/* Overview Stats */}
                  <OverviewStatsCards
                    selectedStudent={selectedStudent}
                    selectedStudentInvoices={selectedStudentInvoices}
                    summaryStats={summaryStats}
                    allStudents={filteredStudents}
                  />

                  {/* Filters */}
                  <FiltersSection
                    selectedFeeType={selectedFeeType}
                    setSelectedFeeType={setSelectedFeeType}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    selectedClass=""
                    setSelectedClass={() => {}}
                    dueDateFilter=""
                    setDueDateFilter={() => {}}
                  />

                  {/* Data Table - Using new allStudentsSummary query */}
                  <FeesDataTable
                    students={allStudentsSummary}
                    loading={studentsLoading}
                    error={studentsError}
                    selectedStudents={selectedStudentsForTable}
                    onSelectStudent={handleSelectStudent}
                    onSelectAll={handleSelectAllStudents}
                    onViewStudent={handleViewStudent}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Student</Label>
                  <p className="text-sm text-gray-600">
                    {selectedInvoice.studentName}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Admission Number
                  </Label>
                  <p className="text-sm text-gray-600">
                    {selectedInvoice.admissionNumber}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Class</Label>
                  <p className="text-sm text-gray-600">
                    {selectedInvoice.class} - {selectedInvoice.section}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Fee Type</Label>
                  <p className="text-sm text-gray-600 capitalize">
                    {selectedInvoice.feeType}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Amount</Label>
                  <p className="text-sm text-gray-600">
                    KES {selectedInvoice.totalAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount Due</Label>
                  <p className="text-sm text-gray-600">
                    KES {selectedInvoice.amountDue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Due Date</Label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  {selectedInvoice && (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedInvoice.paymentStatus)}`}
                    >
                      {selectedInvoice.paymentStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInvoiceModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast notifications */}
      <Toaster />

      {/* Fee Structure Drawer */}
      <FeeStructureDrawer
        isOpen={showCreateForm || showEditForm}
        onClose={() => {
          setShowCreateForm(false);
          setShowEditForm(false);
          setSelectedStructure(null);
          setSelectedGraphQLStructure(null);
          setSelectedProcessedStructure(null);
        }}
        onSave={handleSaveStructure}
        mode={showEditForm ? "edit" : "create"}
        structureId={selectedStructure?.id}
        structureData={selectedGraphQLStructure}
        processedStructureData={selectedProcessedStructure}
        initialData={
          selectedStructure
            ? {
                name: selectedStructure.name,
                grade: selectedStructure.grade,
                boardingType: selectedStructure.boardingType,
                academicYear: selectedStructure.academicYear,
                academicYearId:
                  selectedGraphQLStructure?.academicYearId ||
                  selectedGraphQLStructure?.academicYear?.id,
                termStructures: selectedStructure.termStructures.map(
                  (term) => ({
                    term: term.term as string,
                    academicYear: selectedStructure.academicYear,
                    dueDate: term.dueDate,
                    latePaymentFee: term.latePaymentFee.toString(),
                    earlyPaymentDiscount:
                      term.earlyPaymentDiscount?.toString() || "0",
                    earlyPaymentDeadline: term.earlyPaymentDeadline || "",
                    buckets: term.buckets.map((bucket) => ({
                      id: bucket.id,
                      type: bucket.type,
                      name: bucket.name,
                      description: bucket.description,
                      isOptional: bucket.isOptional,
                      components: bucket.components.map((component) => ({
                        name: component.name,
                        description: component.description,
                        amount: component.amount.toString(),
                        category: component.category,
                      })),
                    })),
                  }),
                ),
              }
            : undefined
        }
        availableGrades={grades}
      />

      <BulkInvoiceGenerator
        isOpen={showInvoiceGenerator}
        onClose={() => setShowInvoiceGenerator(false)}
        onGenerate={handleBulkGeneration}
        preselectedStructureId={preselectedStructureId}
        preselectedTerm={preselectedTerm}
        getLinkedClassCount={getLinkedClassCount}
        getLinkedClasses={getLinkedClasses}
        onNeedClassAssignment={handleAssignToGrade}
      />

      <PaymentReminderDrawer
        isOpen={showPaymentReminderDrawer}
        onClose={() => setShowPaymentReminderDrawer(false)}
        form={reminderForm}
        setForm={setReminderForm}
        onSubmit={handleSubmitReminder}
        students={allStudentsSummary}
        currentTermName={reminderTermWindow.current?.name}
        nextTermName={reminderNextTerm?.name}
        nextTermStartDate={reminderNextTerm?.startDate}
        nextTermFeesByGrade={reminderNextTermFeesByGrade}
      />

      {/* Record Payment Drawer */}
      <RecordPaymentDrawer
        isOpen={showRecordPaymentDrawer}
        onClose={() => setShowRecordPaymentDrawer(false)}
        form={paymentForm}
        setForm={setPaymentForm}
        onSubmit={handleSubmitPayment}
        isSubmitting={isSubmittingPayment}
        studentId={paymentForm.studentId || selectedStudent}
        students={allStudentsSummary}
        studentInfo={
          finalStudentData
            ? {
                name: finalStudentData.studentName,
                admissionNumber: finalStudentData.admissionNumber,
                className: finalStudentData.gradeLevelName,
              }
            : undefined
        }
        onPaymentSuccess={forcePageRefresh}
        canOverrideAllocation={feesAccess.canRecordPayments}
      />

      <PaymentReceiptDialog
        receipt={paymentReceipt}
        open={showPaymentReceipt}
        onClose={() => {
          setShowPaymentReceipt(false);
          setPaymentReceipt(null);
        }}
        schoolName={receiptSchoolName}
      />

      <BulkPaymentImportDialog
        open={showBulkPaymentImport}
        onClose={() => setShowBulkPaymentImport(false)}
        onComplete={forcePageRefresh}
      />

      {/* New Invoice Drawer */}
      <NewInvoiceDrawer
        isOpen={showNewInvoiceDrawer}
        onClose={() => setShowNewInvoiceDrawer(false)}
        form={newInvoiceForm}
        setForm={setNewInvoiceForm}
        onSubmit={handleSubmitInvoice}
        selectedStudent={selectedStudent}
        allStudents={filteredStudents}
        isGenerating={isGeneratingInvoices}
      />

      <StudentFeeProfileDrawer
        isOpen={showStudentDetailsDrawer}
        onClose={() => {
          setShowStudentDetailsDrawer(false);
          setViewingStudent(null);
        }}
        studentId={selectedStudent}
        studentData={finalStudentData}
        loading={finalLoading}
        error={finalError}
        onRefresh={finalRefetch}
        onRecordPayment={() => {
          if (selectedStudent) openRecordPayment(selectedStudent);
        }}
        onSendReminder={() => {
          if (selectedStudent) handleReminderForStudent(selectedStudent);
        }}
        onLogAdjustment={handleLogAdjustment}
        canVoidPayments={feesAccess.canRecordPayments}
        onPaymentVoided={handlePaymentVoided}
      />

      <FeeAdjustmentDrawer
        isOpen={showAdjustmentDrawer}
        onClose={() => setShowAdjustmentDrawer(false)}
        student={finalStudentData}
        form={adjustmentForm}
        setForm={setAdjustmentForm}
        onSubmit={handleSubmitAdjustment}
        isSubmitting={isApplyingAdjustment}
        submitError={adjustmentError}
      />

      {isSchoolOwner ? (
        <OwnerPaymentsDrawer
          open={showPaymentsDrawer}
          onOpenChange={setShowPaymentsDrawer}
          defaultRail="bank"
        />
      ) : null}

      <LinkMissingGradesDialog
        open={showLinkMissingGrades}
        onOpenChange={(open) => {
          setShowLinkMissingGrades(open);
          if (!open) setMissingGradesGroup(null);
        }}
        group={missingGradesGroup}
        onSelectPlan={handleSelectPlanForMissingGrades}
        onCreateNew={() => {
          setShowLinkMissingGrades(false);
          setMissingGradesGroup(null);
          handleCreateNew();
        }}
      />

      {/* Assign Fee Structure to Grades Modal */}
      <AssignFeeStructureModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setFeeStructureToAssign(null);
          setPendingLinkGradeIds([]);
        }}
        feeStructure={feeStructureToAssign}
        availableGrades={grades}
        initialSelectedGradeIds={pendingLinkGradeIds}
        linkedGradesLoading={feeAssignmentsLoading}
        onSuccess={handleAssignmentSuccess}
        onUnlinkAssignment={handleUnlinkAssignment}
        onReviewConflicts={() => {
          setIsAssignModalOpen(false);
          setFeeStructureToAssign(null);
          setPendingLinkGradeIds([]);
          navigateToFeesSection("assignments");
        }}
      />
    </div>
  );
}
