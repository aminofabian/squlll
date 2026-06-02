/** Default motto on fee letters when none is configured. */
export const DEFAULT_SCHOOL_MOTTO = 'Knowledge • Character • Excellence'

/** Same display name as dashboard sidebar/header (`layout.tsx`). */
export function getLayoutSchoolName(subdomain: string): string {
  if (!subdomain?.trim()) return 'School'
  return subdomain.charAt(0).toUpperCase() + subdomain.slice(1) + ' School'
}

/** Two-letter initials — matches `SchoolSidebar` logic. */
export function getSchoolInitials(schoolKey: string): string {
  const words = schoolKey.replace(/-/g, ' ').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return 'SC'
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

/** Deterministic brand gradient from school key. */
export function getSchoolColor(schoolKey: string): { from: string; to: string } {
  const hash = schoolKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const colorPairs = [
    { from: '#246a59', to: '#1a4d41' },
    { from: '#4a5568', to: '#2d3748' },
    { from: '#3182ce', to: '#2b6cb0' },
    { from: '#805ad5', to: '#6b46c1' },
    { from: '#dd6b20', to: '#c05621' },
    { from: '#e53e3e', to: '#c53030' },
    { from: '#38a169', to: '#2f855a' },
    { from: '#d69e2e', to: '#b7791f' },
  ]
  return colorPairs[hash % colorPairs.length]
}
