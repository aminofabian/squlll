import { sanitizeApiUserMessage } from "./api-user-messages"

type CodedError = Error & { code?: string; status?: number }

/** Student-specific backend error codes mapped to plain language. */
const BY_CODE: Record<string, string> = {
  STUDENT_ADMISSION_EXISTS:
    "A learner with that admission number is already on your register. Check the number or use a different one.",
  USER_ALREADY_EXISTS:
    "That portal email is already in use. Use a different email, or leave it blank and we'll create one for you.",
  GRADE_LEVEL_NOT_FOUND:
    "That class isn't set up for your school yet. Please pick a class from the list.",
  USER_NOT_IN_TENANT:
    "You don't have access to this school right now. Please sign in again.",
}

/** Student-specific fallbacks for raw messages with no error code. */
const BY_PATTERN: { pattern: RegExp; message: string }[] = [
  {
    pattern: /admission number[^.]*already exists/i,
    message:
      "A learner with that admission number is already on your register. Check the number or use a different one.",
  },
  {
    pattern: /stream is required/i,
    message: "Please choose a stream for this class before enrolling.",
  },
  {
    pattern: /stream does not belong/i,
    message:
      "That stream doesn't belong to the selected class. Please choose another.",
  },
  {
    pattern: /no streams/i,
    message: "This class doesn't use streams, so you can leave the stream blank.",
  },
  {
    pattern: /grade level|not part of the configured school/i,
    message:
      "That class isn't available for your school. Please pick one from the list.",
  },
  {
    pattern: /user with email[^.]*already exists|email[^.]*already exists/i,
    message:
      "That portal email is already in use. Use a different email, or leave it blank and we'll create one for you.",
  },
]

/**
 * Turns a raw backend error from student enrollment into a friendly,
 * jargon-free message safe to show in a toast.
 */
export function sanitizeStudentUserMessage(
  error: unknown,
  fallback = "We couldn't add the learner just now. Please check the details and try again.",
): string {
  if (!error) return fallback

  const raw =
    error instanceof Error ? error.message : typeof error === "string" ? error : ""
  const coded = error as CodedError
  const code =
    typeof coded?.code === "string" ? coded.code.toUpperCase() : undefined

  if (code && BY_CODE[code]) return BY_CODE[code]

  for (const { pattern, message } of BY_PATTERN) {
    if (pattern.test(raw)) return message
  }

  return sanitizeApiUserMessage(error, fallback)
}
