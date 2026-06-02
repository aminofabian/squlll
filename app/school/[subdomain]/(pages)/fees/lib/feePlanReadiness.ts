import type { ProcessedFeeStructure } from "../components/FeeStructureManager/types";
import { feePlanTermProgress } from "./feePlanSlug";
import { getInactivePlanDetail } from "./feePlanLifecycle";

export type FeePlanReadinessTone = "neutral" | "warn" | "success" | "muted";

export type FeePlanReadiness = {
  label: string;
  detail: string;
  tone: FeePlanReadinessTone;
};

export function getFeePlanReadiness(
  structure: ProcessedFeeStructure,
  linkedClassCount: number,
): FeePlanReadiness {
  if (!structure.isActive) {
    return {
      label: "Inactive",
      detail: getInactivePlanDetail(structure),
      tone: "muted",
    };
  }

  const termProgress = feePlanTermProgress(structure);
  const termsReady =
    termProgress.total === 0 ||
    termProgress.configured === termProgress.total;

  if (!termsReady) {
    return {
      label: "Setup",
      detail: `${termProgress.configured} of ${termProgress.total} terms configured`,
      tone: "warn",
    };
  }

  if (linkedClassCount === 0) {
    return {
      label: "Unlinked",
      detail: "Assign grades before billing",
      tone: "warn",
    };
  }

  return {
    label: "Ready",
    detail: "Configured and linked — bill from Overview",
    tone: "success",
  };
}
