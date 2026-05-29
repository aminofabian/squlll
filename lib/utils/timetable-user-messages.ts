/** Pull user-facing text from a GraphQL JSON body or thrown Error. */
export function extractGraphqlErrorMessage(
  source: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (source && typeof source === "object" && "errors" in source) {
    const errors = (source as { errors?: { message?: string }[] }).errors;
    if (errors?.length) {
      const text = errors
        .map((e) => e.message?.trim())
        .filter(Boolean)
        .join(" ");
      if (text) return text;
    }
  }
  if (source instanceof Error && source.message.trim()) {
    return source.message.trim();
  }
  if (typeof source === "string" && source.trim()) {
    return source.trim();
  }
  return fallback;
}

/**
 * Maps technical errors to plain language for school staff.
 */
export function sanitizeTimetableUserMessage(error: unknown): string {
  const raw =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";

  if (!raw.trim()) {
    return "Something went wrong. Please try again.";
  }

  const technical =
    /uuid|daytemplateperiod|graphql|timeslot|time slot|not found in store|invalid id|badrequest|internal server/i.test(
      raw,
    );

  if (technical) {
    return "Something did not load correctly. Please refresh the page and try again.";
  }

  if (/validation|required|missing/i.test(raw)) {
    return "Please check that every field is filled in correctly.";
  }

  if (raw.length > 140) {
    return "Could not complete this action. Please try again.";
  }

  return raw;
}

export function formatBreakTypeLabel(type: string): string {
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function dayNameFromNumber(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek - 1] ?? `Day ${dayOfWeek}`;
}
