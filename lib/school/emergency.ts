import type {
  EmergencyAlertSource,
  EmergencyAlertStatus,
  EmergencyAlertType,
} from "./transportApi";

export type AlertTone = "danger" | "warning" | "success";

/** Human label for an alert type. */
export function alertTypeLabel(type: EmergencyAlertType): string {
  switch (type) {
    case "PANIC":
      return "Emergency (panic)";
    case "BREAKDOWN":
      return "Breakdown";
    case "DEVIATION":
      return "Route deviation";
    case "LONG_STOP":
      return "Long stop";
    case "UNRESPONSIVE":
      return "Not reporting";
    default:
      return String(type);
  }
}

/** Badge tone for an alert type (panic is the loudest). */
export function alertTypeTone(type: EmergencyAlertType): AlertTone {
  return type === "PANIC" ? "danger" : "warning";
}

/** Badge tone for an alert's lifecycle status. */
export function alertStatusTone(status: EmergencyAlertStatus): AlertTone {
  switch (status) {
    case "OPEN":
      return "danger";
    case "ACKED":
      return "warning";
    default:
      return "success";
  }
}

/** Who raised the alert — the crew or the automatic monitor. */
export function alertSourceLabel(source: EmergencyAlertSource): string {
  return source === "SYSTEM" ? "Auto-detected" : "Driver";
}

/** "45s" / "1m 30s" / "2h 5m", or an em dash when there's no history. */
export function formatMttr(seconds?: number | null): string {
  if (seconds == null || seconds < 0) return "—";
  const total = Math.round(seconds);
  if (total < 60) return `${total}s`;
  const minutes = Math.floor(total / 60);
  const restSeconds = total % 60;
  if (minutes < 60) return `${minutes}m ${restSeconds}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}
