/**
 * Utility functions for handling authentication redirects
 */

/**
 * Redirects to the appropriate login page based on the current URL
 */
export function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  
  const currentUrl = window.location.href;
  const currentHost = window.location.host;
  
  // Check if we're on a subdomain (school-specific page)
  const isSubdomain = currentHost.includes('.') && 
    !currentHost.startsWith('www.') && 
    (currentHost.includes('localhost') || currentHost.includes('squl.co.ke'));
  
  if (isSubdomain) {
    // Extract subdomain for school-specific login
    const subdomain = currentHost.split('.')[0];
    const baseUrl = currentHost.includes('localhost') ? 'localhost:3000' : 'squl.co.ke';
    const protocol = currentHost.includes('localhost') ? 'http://' : 'https://';
    
    window.location.href = `${protocol}${subdomain}.${baseUrl}/login`;
  } else {
    // Default admin login
    window.location.href = 'http://amino.localhost:3000/login';
  }
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
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  if (typeof error === 'string' && error.trim()) {
    return error.trim();
  }
  return fallback;
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
