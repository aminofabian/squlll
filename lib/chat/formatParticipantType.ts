const LABELS: Record<string, string> = {
  superadmin: 'Technical support',
  admin: 'School admin',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent / guardian',
  staff: 'Staff',
}

export function formatParticipantType(type: string): string {
  const normalized = type.trim().toLowerCase()
  if (!normalized) return ''
  return LABELS[normalized] ?? normalized.charAt(0).toUpperCase() + normalized.slice(1)
}
