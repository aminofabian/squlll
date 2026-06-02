/** Public URL for the current school tenant (browser only). */
export function getSchoolPortalUrl(): string {
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

export function formatPortalUrlForDisplay(url: string): string {
  if (!url) return ''
  try {
    const u = new URL(url)
    return u.host + (u.port && !u.host.includes(':') ? `:${u.port}` : '')
  } catch {
    return url.replace(/^https?:\/\//, '')
  }
}

export async function copyPortalUrl(url: string): Promise<boolean> {
  if (!url || typeof navigator === 'undefined') return false
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    return false
  }
}
