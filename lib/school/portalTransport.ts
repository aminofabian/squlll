/** Journey-timeline helpers shared by the student and parent transport views. */

export type JourneyTone = "success" | "warning" | "danger" | "neutral";

const EVENT_LABELS: Record<string, string> = {
  BOARDED: "Boarded the bus",
  DROPPED_AT_SCHOOL: "Arrived at school",
  PICKED_FROM_SCHOOL: "Picked up from school",
  DROPPED_AT_HOME: "Dropped off at home",
  MARKED_ABSENT: "Marked absent",
  NO_SHOW: "Not present at the pickup point",
  EXCUSED: "Excused",
};

const EVENT_TONES: Record<string, JourneyTone> = {
  BOARDED: "success",
  DROPPED_AT_SCHOOL: "success",
  PICKED_FROM_SCHOOL: "success",
  DROPPED_AT_HOME: "success",
  NO_SHOW: "danger",
  MARKED_ABSENT: "warning",
  EXCUSED: "warning",
};

export function journeyEventLabel(type: string): string {
  return EVENT_LABELS[type] ?? type.replace(/_/g, " ").toLowerCase();
}

export function journeyEventTone(type: string): JourneyTone {
  return EVENT_TONES[type] ?? "neutral";
}

/**
 * The child's current stage, derived from the latest journey event (oldest-first
 * input). With no events yet, they're waiting for the bus.
 */
export function journeyStage(events: Array<{ type: string }>): {
  label: string;
  tone: JourneyTone;
} {
  const last = events[events.length - 1]?.type;
  switch (last) {
    case "BOARDED":
      return { label: "On the bus", tone: "success" };
    case "PICKED_FROM_SCHOOL":
      return { label: "On the bus (going home)", tone: "success" };
    case "DROPPED_AT_SCHOOL":
      return { label: "Arrived at school", tone: "success" };
    case "DROPPED_AT_HOME":
      return { label: "Dropped off safely", tone: "success" };
    case "NO_SHOW":
      return { label: "Not present at pickup", tone: "danger" };
    case "MARKED_ABSENT":
      return { label: "Marked absent", tone: "warning" };
    case "EXCUSED":
      return { label: "Excused", tone: "warning" };
    default:
      return { label: "Waiting for the bus", tone: "neutral" };
  }
}
