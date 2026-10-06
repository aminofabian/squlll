type CodedError = Error & { code?: string; status?: number }

/** Backend error codes mapped to plain, jargon-free copy. */
const BY_CODE: Record<string, string> = {
  USER_ALREADY_EXISTS:
    "That email address is already in use. Try a different one, or leave it blank if it's optional.",
  AUTH_ERROR: "Your session has expired. Please sign in again, then try once more.",
  UNAUTHORIZED: "Your session has expired. Please sign in again, then try once more.",
  FORBIDDEN: "You don't have permission to do that. Ask a school admin for access.",
  NOT_FOUND: "We couldn't find that record. Please refresh the page and try again.",
  CONFLICT: "That's already in the system. Please check the details and try again.",
  VALIDATION_ERROR: "Some details need fixing. Please check the form and try again.",
  INTERNAL_SERVER_ERROR:
    "Something went wrong on our side. Please try again in a moment.",
}

/** Fallbacks for raw messages when no error code is available. */
const BY_PATTERN: { pattern: RegExp; message: string }[] = [
  {
    pattern: /invalid email|not a valid email|email[^.]*invalid/i,
    message:
      "That email address doesn't look right. Please check it and try again.",
  },
  {
    pattern: /already exists|already invited|already pending|duplicate/i,
    message:
      "That's already in the system. Check the details or use a different email.",
  },
  {
    pattern: /unauthor|unauthenticated|access token|authentication/i,
    message: "Your session has expired. Please sign in again, then try once more.",
  },
  {
    pattern: /forbidden|not allowed|permission/i,
    message: "You don't have permission to do that. Ask a school admin for access.",
  },
  {
    pattern: /not found/i,
    message: "We couldn't find that record. Please refresh the page and try again.",
  },
  {
    pattern: /validation|invalid|required|missing field|must be/i,
    message: "Some details need fixing. Please check the form and try again.",
  },
]

/**
 * Turns a raw backend error into a friendly, jargon-free message safe to show
 * in a toast. Shared across the school admin drawers (students, parents,
 * teachers, staff). Callers can pass a domain-specific `fallback`.
 */
export function sanitizeApiUserMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!error) return fallback

  const raw =
    error instanceof Error ? error.message : typeof error === "string" ? error : ""
  const coded = error as CodedError
  const code =
    typeof coded?.code === "string" ? coded.code.toUpperCase() : undefined
  const status = typeof coded?.status === "number" ? coded.status : undefined

  if (status === 401 || code === "UNAUTHORIZED" || code === "AUTH_ERROR") {
    return "Your session has expired. Please sign in again, then try once more."
  }

  if (code && BY_CODE[code]) return BY_CODE[code]

  for (const { pattern, message } of BY_PATTERN) {
    if (pattern.test(raw)) return message
  }

  if (
    error instanceof TypeError ||
    /failed to fetch|network ?error|load failed|network request failed/i.test(raw)
  ) {
    return "We couldn't reach the server. Check your connection and try again."
  }

  return fallback
}
