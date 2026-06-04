import type { FeesSetupWizardResult } from "../components/FeesSetupWizardDialog";
import {
  gradesWithFeesInDraft,
  loadFeesSetupDraft,
} from "./feesSetupDraft";

export type FeePlanFlowPhase = "setup" | "plan";

export type FeePlanSetupIntent = "initial" | "revise";

/** Draft is complete enough to open the publish (fee structure) drawer */
export function hasValidSetupDraft(): boolean {
  const draft = loadFeesSetupDraft();
  if (!draft?.academicYearId) return false;
  if (!draft.categories?.length) return false;
  const grades = gradesWithFeesInDraft(draft);
  return grades.some((g) => (draft.gradeAmounts[g] ?? 0) > 0);
}

export function getSetupDraftSummary(draft: FeesSetupWizardResult | null) {
  if (!draft) return null;
  const grades = gradesWithFeesInDraft(draft);
  return {
    yearName: draft.academicYearName ?? "—",
    categoryCount: draft.categories.length,
    gradeCount: grades.length,
    termCount: draft.termCount,
  };
}
