import type { TermDraft } from "./school-calendar-presets";

/**
 * Terms already stored for an academic year. Only `name` is required; the dates
 * are accepted so callers can pass API records straight through.
 */
export type ExistingTermLike = {
  name: string;
  startDate?: string | null;
  endDate?: string | null;
};

/** Trimmed, case-insensitive, whitespace-collapsed term name. */
export function normalizeTermName(name: string | null | undefined): string {
  return (name ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Drafts that still need a `createTerm` call: excluded drafts, drafts already
 * saved for this academic year (by name) and duplicates inside the draft list
 * are all dropped.
 *
 * Onboarding must be re-runnable. Without this filter a school that already has
 * "Term 1" is sent back to step 2 forever: the wizard keeps posting "Term 1",
 * the API answers CONFLICT, and the step never advances.
 */
export function pendingTermDrafts(
  drafts: readonly TermDraft[],
  existingTerms: readonly ExistingTermLike[],
): TermDraft[] {
  const existingNames = new Set(
    existingTerms.map((term) => normalizeTermName(term.name)),
  );
  const seen = new Set<string>();
  const pending: TermDraft[] = [];

  for (const draft of drafts) {
    if (draft.included === false) continue;

    const key = normalizeTermName(draft.name);
    if (!key || existingNames.has(key) || seen.has(key)) continue;

    seen.add(key);
    pending.push(draft);
  }

  return pending;
}

export type ApiErrorLike = {
  error?: unknown;
  message?: unknown;
  details?: unknown;
};

type GraphQLErrorLike = {
  message?: unknown;
  extensions?: { code?: unknown };
};

function collectErrorMessages(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") return [];

  const body = payload as ApiErrorLike;
  const messages: string[] = [];

  if (Array.isArray(body.details)) {
    for (const detail of body.details) {
      if (typeof detail === "string") {
        messages.push(detail);
      } else if (
        detail &&
        typeof detail === "object" &&
        typeof (detail as GraphQLErrorLike).message === "string"
      ) {
        messages.push((detail as GraphQLErrorLike).message as string);
      }
    }
  } else if (typeof body.details === "string") {
    messages.push(body.details);
  }

  if (typeof body.message === "string") messages.push(body.message);
  if (typeof body.error === "string") messages.push(body.error);

  return messages.filter((message) => message.trim().length > 0);
}

/**
 * True when the API rejected a term because it is already stored. Treated as a
 * successful outcome so a partially completed onboarding can move forward.
 */
export function isDuplicateTermError(payload: unknown): boolean {
  return collectErrorMessages(payload).some(
    (message) =>
      /already exists/i.test(message) || /duplicate key value/i.test(message),
  );
}

/**
 * True when the API rejected a term because its dates overlap a term already on
 * the server. This also means the year is not empty — the local academic-year
 * query was stale or the term was saved from another tab. Onboarding should
 * treat the period as covered instead of retrying forever.
 */
export function isOverlappingTermError(payload: unknown): boolean {
  return collectErrorMessages(payload).some((message) =>
    /dates overlap with/i.test(message),
  );
}

/** First human-readable message carried by an API error body. */
export function termErrorMessage(
  payload: unknown,
  fallback = "Could not save term",
): string {
  return collectErrorMessages(payload)[0] ?? fallback;
}
