/** Read access token from localStorage (set on school login). */
export function getAccessTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('accessToken')
}

/**
 * True when the browser carries a session.
 *
 * `accessToken` / `refreshToken` are httpOnly and therefore never visible to
 * `document.cookie`; `userId` is the readable marker the auth routes set
 * alongside them (see `app/api/auth/login/route.ts`).
 */
export function hasSessionCookie(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie
    .split(';')
    .some((cookie) => cookie.trim().startsWith('userId='))
}

/** Fetch token from API (reads httpOnly cookie server-side). */
export async function fetchAccessToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/ws-token', { credentials: 'include' })
    if (res.ok) {
      const data = (await res.json()) as { token?: string }
      return data.token ?? getAccessTokenFromStorage()
    }
  } catch {
    // Network/route failure — fall back to the client-side copy below.
  }
  return getAccessTokenFromStorage()
}
