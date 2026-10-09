const INITIALS_COUNT = 2
const FALLBACK_INITIAL = '?'

export function getInitials(label: string): string {
  const initials = label
    .trim()
    .split(/\s+/)
    .filter((word) => /^\p{L}/u.test(word))
    .slice(0, INITIALS_COUNT)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
  return initials || FALLBACK_INITIAL
}
