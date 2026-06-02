import type { ProcessedFeeStructure } from "../components/FeeStructureManager/types";
import type { GraphQLFeeStructure } from "../hooks/useGraphQLFeeStructures";

type DateLike = string | Date | null | undefined;

export function resolvePlanEndDate(
  academicYear?: { endDate?: DateLike } | null,
  terms?: Array<{ endDate?: DateLike }> | null,
): Date | null {
  const dates: Date[] = [];

  if (academicYear?.endDate) {
    dates.push(new Date(academicYear.endDate));
  }

  if (terms?.length) {
    for (const term of terms) {
      if (term.endDate) {
        dates.push(new Date(term.endDate));
      }
    }
  }

  if (!dates.length) {
    return null;
  }

  return dates.reduce((latest, current) =>
    current.getTime() > latest.getTime() ? current : latest,
  );
}

export function isPlanExpired(
  endDate: Date | null,
  now: Date = new Date(),
): boolean {
  if (!endDate) {
    return false;
  }

  const endOfDay = new Date(endDate);
  endOfDay.setHours(23, 59, 59, 999);
  return now.getTime() > endOfDay.getTime();
}

export function getPlanValidUntil(
  structure: Pick<
    ProcessedFeeStructure,
    "validUntil" | "academicYearEndDate" | "terms"
  >,
): Date | null {
  if (structure.validUntil) {
    return new Date(structure.validUntil);
  }

  return resolvePlanEndDate(
    structure.academicYearEndDate
      ? { endDate: structure.academicYearEndDate }
      : null,
    structure.terms,
  );
}

export function isFeePlanEditable(
  structure: Pick<ProcessedFeeStructure, "isActive">,
): boolean {
  return structure.isActive;
}

export function getInactivePlanDetail(
  structure: Pick<
    ProcessedFeeStructure,
    "isActive" | "isExpired" | "validUntil" | "academicYearEndDate" | "terms"
  >,
): string {
  const validUntil = getPlanValidUntil(structure);
  const expired = structure.isExpired ?? isPlanExpired(validUntil);

  if (expired && validUntil) {
    return `Expired ${validUntil.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })} — read-only`;
  }

  return "Inactive — read-only for historical reference";
}

export function enrichGraphQLStructureLifecycle(
  structure: GraphQLFeeStructure,
): GraphQLFeeStructure & {
  validUntil: string | null;
  isExpired: boolean;
} {
  const validUntilDate = resolvePlanEndDate(
    structure.academicYear,
    structure.terms,
  );

  return {
    ...structure,
    validUntil: validUntilDate?.toISOString() ?? null,
    isExpired: isPlanExpired(validUntilDate),
  };
}

export interface FeePlanDeleteEligibility {
  canDelete: boolean;
  blockReasons: string[];
  studentAssignmentCount: number;
  outstandingBalanceCount: number;
  paymentRecordCount: number;
  invoiceCount: number;
}

export async function fetchFeePlanDeleteEligibility(
  feeStructureId: string,
): Promise<FeePlanDeleteEligibility> {
  const query = `
    query FeePlanDeleteEligibility($id: ID!) {
      feePlanDeleteEligibility(id: $id) {
        canDelete
        blockReasons
        studentAssignmentCount
        outstandingBalanceCount
        paymentRecordCount
        invoiceCount
      }
    }
  `;

  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { id: feeStructureId },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to check delete eligibility");
  }

  const result = await response.json();
  if (result.errors?.length) {
    throw new Error(result.errors.map((e: { message: string }) => e.message).join(", "));
  }

  const eligibility = result.data?.feePlanDeleteEligibility;
  if (!eligibility) {
    throw new Error("Missing delete eligibility response");
  }

  return eligibility;
}
