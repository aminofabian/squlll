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
  
  // Check response status
  if (error.response?.status === 401 || error.status === 401) {
    return true;
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
