/**
 * Utility functions for handling authentication redirects
 */

/**
 * Redirects to the appropriate login page based on the current URL
 */
export function redirectToLogin(): void {
  if (typeof window === 'undefined') return

  const { origin, pathname, search, host } = window.location
  const isSubdomain =
    host.includes('.') &&
    !host.startsWith('www.') &&
    (host.includes('localhost') || host.includes('squl.co.ke'))

  // Preserve the real host and port. Hard-coding :3000 broke local auth
  // redirects on :3002 and sent users to an unreachable page.
  const isSuperadminArea = !isSubdomain && pathname.startsWith('/dashboard')
  const loginPath = isSuperadminArea ? '/superadmin/login' : '/login'
  const next = encodeURIComponent(`${pathname}${search}`)
  window.location.href = `${origin}${loginPath}?next=${next}`
}

/**
 * Checks if an error indicates authentication failure and should trigger a redirect
 */
export function isAuthenticationError(error: any): boolean {
  if (!error) return false;
  
  // Check GraphQL errors array
  if (error.errors && Array.isArray(error.errors)) {
    return error.errors.some((err: any) => 
      err.message?.includes('Forbidden resource') ||
      err.message?.includes('Authentication required') ||
      err.message?.includes('Unauthorized') ||
      err.extensions?.code === 'AUTHENTICATION_REQUIRED' ||
      err.extensions?.code === 'FORBIDDENEXCEPTION' ||
      err.extensions?.code === 'FORBIDDEN' ||
      err.extensions?.code === 'UNAUTHENTICATED' ||
      err.extensions?.redirectToLogin === true
    );
  }
  
  // Check single error object
  if (error.message) {
    return error.message.includes('Forbidden resource') ||
           error.message.includes('Authentication required') ||
           error.message.includes('Unauthorized');
  }
  
  // Custom shape from useSchoolConfig / fetch wrappers
  if (error.response?.status === 401 || error.response?.status === 403) {
    return true;
  }

  // Check response status
  if (error.status === 401 || error.status === 403) {
    return true;
  }
  
  return false;
}

export function getGraphqlFailureMessage(
  error: unknown,
  fallback = 'Something went wrong',
): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const res = (
      error as {
        response?: { status?: number; errors?: Array<{ message?: string }> };
      }
    ).response;
    const first = res?.errors?.[0]?.message?.trim();
    if (first) return first;
    if (res?.status === 401) return 'Please sign in again.';
    if (res?.status === 403) return 'You do not have permission to view this school.';
    if (res?.status === 404) return 'School setup is not complete yet.';
    if (res?.status === 503) return getGraphqlConnectionMessage();
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  if (typeof error === 'string' && error.trim()) {
    return error.trim();
  }
  return fallback;
}

/** User-facing message when Nest/GraphQL on :3001 is unreachable. */
export function getGraphqlConnectionMessage(): string {
  return 'Cannot reach the API server. Make sure the backend is running (port 3001).';
}

export function isGraphqlConnectionError(
  error: unknown,
  message?: string,
): boolean {
  const text = (
    message ??
    getGraphqlFailureMessage(error, '')
  ).toLowerCase();

  if (
    text.includes('failed to connect to graphql') ||
    text.includes('fetch failed') ||
    text.includes('network_error') ||
    text.includes('econnrefused') ||
    text.includes('cannot reach the api server')
  ) {
    return true;
  }

  if (error && typeof error === 'object' && 'response' in error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 503 || status === 502) return true;
  }

  return false;
}

/**
 * Handles authentication errors by redirecting to login if necessary
 */
export function handleAuthenticationError(error: any): void {
  if (isAuthenticationError(error)) {
    console.log('Authentication error detected, redirecting to login...');
    redirectToLogin();
  }
}
