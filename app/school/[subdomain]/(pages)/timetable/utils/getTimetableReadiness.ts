/**
 * Single source of truth for "how ready is this timetable?".
 *
 * The health panel, status meter, journey and share drawer all derive their
 * verdict, progress and next-step copy from this helper so they can never
 * disagree (e.g. one saying "Ready to publish" while another says "3 empty
 * slots left").
 */

export type TimetablePublishState = "unpublished" | "published" | "stale";

export type TimetableReadinessVerdict =
  | "no-structure"
  | "not-started"
  | "clashes"
  | "in-progress"
  | "almost"
  | "ready";

export interface TimetableReadinessInput {
  hasScheduleStructure: boolean;
  hasAnyLessons: boolean;
  filledSlots: number;
  totalSlots: number;
  clashCount: number;
  /** Coverage gaps + workload notes — things worth a look but not blockers. */
  advisoryCount?: number;
  publishState?: TimetablePublishState;
  /** Whether an academic term is selected. Defaults to true. */
  hasTerm?: boolean;
}

export interface TimetableReadiness {
  verdict: TimetableReadinessVerdict;
  fillPct: number;
  filledSlots: number;
  totalSlots: number;
  emptySlots: number;
  clashCount: number;
  advisoryCount: number;
  /** Short status label — use verbatim on every surface. */
  label: string;
  /** One sentence describing what to do next. */
  nextStep: string;
  /** Publishing is possible: term + structure + lessons + no clashes. */
  canPublish: boolean;
  /** Every slot filled with no clashes. */
  isComplete: boolean;
}

export const READINESS_LABELS: Record<TimetableReadinessVerdict, string> = {
  "no-structure": "Not started",
  "not-started": "Not started",
  clashes: "Needs attention",
  "in-progress": "In progress",
  almost: "Almost there",
  ready: "Ready to publish",
};

/**
 * Fill threshold for the "Almost there" band. Clashes always take precedence;
 * 100% is required for the full "Ready to publish" verdict.
 */
export const ALMOST_READY_PCT = 85;

const plural = (count: number, singular: string, pluralForm: string) =>
  `${count} ${count === 1 ? singular : pluralForm}`;

export function getTimetableReadiness(
  input: TimetableReadinessInput,
): TimetableReadiness {
  const {
    hasScheduleStructure,
    hasAnyLessons,
    filledSlots,
    totalSlots,
    clashCount,
    advisoryCount = 0,
    publishState = "unpublished",
    hasTerm = true,
  } = input;

  const fillPct =
    totalSlots > 0
      ? Math.min(100, Math.round((filledSlots / totalSlots) * 100))
      : 0;
  const emptySlots = Math.max(0, totalSlots - filledSlots);
  const canPublish =
    hasTerm && hasScheduleStructure && hasAnyLessons && clashCount === 0;
  const isComplete =
    hasAnyLessons && totalSlots > 0 && emptySlots === 0 && clashCount === 0;

  let verdict: TimetableReadinessVerdict;
  if (!hasScheduleStructure) verdict = "no-structure";
  else if (!hasAnyLessons) verdict = "not-started";
  else if (clashCount > 0) verdict = "clashes";
  else if (isComplete) verdict = "ready";
  else if (fillPct >= ALMOST_READY_PCT) verdict = "almost";
  else verdict = "in-progress";

  let nextStep: string;
  switch (verdict) {
    case "no-structure":
      nextStep = "Set up the school day before adding lessons.";
      break;
    case "not-started":
      nextStep =
        "No lessons on the grid yet. Auto-fill the timetable, or add lessons by hand.";
      break;
    case "clashes":
      nextStep = `${plural(clashCount, "clash", "clashes")} must be fixed before sharing.`;
      break;
    case "almost":
      nextStep = `${plural(emptySlots, "empty slot", "empty slots")} left — nearly ready to publish.`;
      break;
    case "ready":
      nextStep =
        publishState === "published"
          ? "Published. Teachers can see this timetable."
          : publishState === "stale"
            ? "Edited since publishing — publish again so staff see the changes."
            : "Every slot is filled with no clashes. Ready to publish.";
      break;
    case "in-progress":
    default:
      nextStep = `${plural(emptySlots, "empty slot", "empty slots")} left to fill.`;
      break;
  }

  return {
    verdict,
    fillPct,
    filledSlots,
    totalSlots,
    emptySlots,
    clashCount,
    advisoryCount,
    label: READINESS_LABELS[verdict],
    nextStep,
    canPublish,
    isComplete,
  };
}
