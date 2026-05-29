const STORAGE_PREFIX = 'squl_school_onboarding_complete_'

export function getOnboardingStorageKey(tenantId: string): string {
  return `${STORAGE_PREFIX}${tenantId}`
}

export function isSchoolOnboardingComplete(tenantId: string | null | undefined): boolean {
  if (!tenantId || typeof window === 'undefined') return false
  return localStorage.getItem(getOnboardingStorageKey(tenantId)) === 'true'
}

export function markSchoolOnboardingComplete(tenantId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(getOnboardingStorageKey(tenantId), 'true')
}

export function getTenantIdFromCookies(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('tenantId='))
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null
}
