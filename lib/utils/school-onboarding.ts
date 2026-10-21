const STORAGE_PREFIX = 'squl_school_onboarding_complete_'
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

export function getOnboardingStorageKey(tenantId: string): string {
  return `${STORAGE_PREFIX}${tenantId}`
}

function hasCompletionCookie(key: string): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie
    .split(';')
    .map((part) => part.trim())
    .some((part) => part === `${key}=true`)
}

function writeCompletionCookie(key: string): void {
  if (typeof document === 'undefined') return
  try {
    document.cookie = `${key}=true; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
  } catch {
    // Cookies blocked too — nothing else we can persist locally.
  }
}

export function isSchoolOnboardingComplete(tenantId: string | null | undefined): boolean {
  if (!tenantId || typeof window === 'undefined') return false
  const key = getOnboardingStorageKey(tenantId)

  try {
    if (window.localStorage.getItem(key) === 'true') return true
  } catch {
    // Storage can be unavailable (private browsing, quota, blocked cookies).
  }

  if (hasCompletionCookie(key)) return true

  try {
    return window.sessionStorage.getItem(key) === 'true'
  } catch {
    return false
  }
}

export function markSchoolOnboardingComplete(tenantId: string): void {
  if (typeof window === 'undefined') return
  const key = getOnboardingStorageKey(tenantId)

  try {
    window.localStorage.setItem(key, 'true')
    return
  } catch {
    // Fall through to a cookie/sessionStorage so onboarding can still finish
    // instead of bouncing between /dashboard and /onboarding.
  }

  writeCompletionCookie(key)

  try {
    window.sessionStorage.setItem(key, 'true')
  } catch {
    // Both stores are blocked; the wizard still routes to the dashboard.
  }
}

export function getTenantIdFromCookies(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('tenantId='))
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null
}
