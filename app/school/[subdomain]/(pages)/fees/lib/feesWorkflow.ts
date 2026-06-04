/** Single source of truth for fees onboarding → daily operations */

export const FEES_WORKFLOW_STEPS = [
  {
    step: 0,
    title: "Create fee structure",
    subtitle: "Amounts per term and category",
    actionLabel: "Create fee structure",
  },
  {
    step: 1,
    title: "Link to classes",
    subtitle: "Which grades use this structure",
    actionLabel: "Link structure to classes",
  },
  {
    step: 2,
    title: "Send term invoices",
    subtitle: "Bill students for the term",
    actionLabel: "Send term invoices",
  },
  {
    step: 3,
    title: "Record payments",
    subtitle: "Cash, M-Pesa, bank — daily work",
    actionLabel: "Record payment",
  },
] as const;

export const FEES_SETUP_STEP_COUNT = 3;

export function getNextWorkflowStep(completedSteps: number[]): number {
  for (let i = 0; i < FEES_SETUP_STEP_COUNT; i++) {
    if (!completedSteps.includes(i)) return i;
  }
  return 3;
}

export function setupMilestonesComplete(completedSteps: number[]): boolean {
  return [0, 1, 2].every((s) => completedSteps.includes(s));
}

export function hasMeaningfulFeeMetrics(metrics: {
  totalExpected: number;
  totalCollected: number;
  todayPaymentCount: number;
}): boolean {
  return (
    metrics.totalExpected > 0 ||
    metrics.totalCollected > 0 ||
    metrics.todayPaymentCount > 0
  );
}
