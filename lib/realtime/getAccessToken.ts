/** Read access token from localStorage (set on school login). */
export function getAccessTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('accessToken')
}

/** Fetch token from API (reads httpOnly cookie server-side). */
export async function fetchAccessToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/ws-token', { credentials: 'include' })
    if (!res.ok) return getAccessTokenFromStorage()
    const data = (await res.json()) as { token?: string }
    return data.token ?? getAccessTokenFromStorage()
  } catch {
    return getAccessTokenFromStorage()
  }
}
