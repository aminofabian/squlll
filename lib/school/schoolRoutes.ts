/**
 * Build in-app paths for school pages.
 * On a school subdomain (e.g. mirema-school.localhost), use short paths (/exams/…)
 * so middleware rewrites once. On the apex host, include /school/[subdomain].
 */
export function schoolPath(subdomain: string, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`

  if (typeof window !== 'undefined') {
    const host = window.location.host
    const isProd = host.includes('squl.co.ke')
    const isSchoolSubdomain =
      (isProd ? host.endsWith('.squl.co.ke') : host.includes('.localhost:')) &&
      !host.startsWith('www.') &&
      host !== (isProd ? 'squl.co.ke' : 'localhost:3000')

    if (isSchoolSubdomain) {
      return normalized
    }
  }

  return `/school/${subdomain}${normalized}`
}

export function examSessionPath(subdomain: string, sessionId: string): string {
  return schoolPath(subdomain, `/exams/${sessionId}`)
}

export function examsListPath(subdomain: string): string {
  return schoolPath(subdomain, '/exams')
}
