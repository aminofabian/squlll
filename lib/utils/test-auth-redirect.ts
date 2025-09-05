/**
 * Test utility for auth redirect functionality
 * This can be used to test the redirect behavior in development
 */

import { redirectToLogin, isAuthenticationError, handleAuthenticationError } from './auth-redirect';

/**
 * Test function to verify auth error detection
 */
export function testAuthErrorDetection() {
  console.log('=== Testing Auth Error Detection ===');
  
  // Test "Forbidden resource" error
  const forbiddenError = {
    errors: [{
      message: 'Forbidden resource',
      extensions: { code: 'FORBIDDEN' }
    }]
  };
  console.log('Forbidden resource error detected:', isAuthenticationError(forbiddenError));
  
  // Test 401 response
  const unauthorizedError = {
    response: { status: 401 }
  };
  console.log('401 error detected:', isAuthenticationError(unauthorizedError));
  
  // Test authentication required error
  const authRequiredError = {
    errors: [{
      message: 'Authentication required. Please log in again.',
      extensions: { 
        code: 'AUTHENTICATION_REQUIRED',
        redirectToLogin: true
      }
    }]
  };
  console.log('Authentication required error detected:', isAuthenticationError(authRequiredError));
  
  // Test non-auth error
  const regularError = {
    errors: [{
      message: 'Some other error',
      extensions: { code: 'INTERNAL_ERROR' }
    }]
  };
  console.log('Regular error detected (should be false):', isAuthenticationError(regularError));
  
  console.log('=== Auth Error Detection Tests Complete ===');
}

/**
 * Test function to simulate auth error handling (doesn't actually redirect)
 */
export function simulateAuthErrorHandling(error: any) {
  console.log('=== Simulating Auth Error Handling ===');
  console.log('Error:', error);
  console.log('Is auth error:', isAuthenticationError(error));
  
  if (isAuthenticationError(error)) {
    console.log('Would redirect to login page...');
    console.log('Current URL would be:', typeof window !== 'undefined' ? window.location.href : 'N/A (server-side)');
    
    // Simulate redirect logic without actually redirecting
    if (typeof window !== 'undefined') {
      const currentHost = window.location.host;
      const isSubdomain = currentHost.includes('.') && 
        !currentHost.startsWith('www.') && 
        (currentHost.includes('localhost') || currentHost.includes('squl.co.ke'));
      
      if (isSubdomain) {
        const subdomain = currentHost.split('.')[0];
        const baseUrl = currentHost.includes('localhost') ? 'localhost:3000' : 'squl.co.ke';
        const protocol = currentHost.includes('localhost') ? 'http://' : 'https://';
        const targetUrl = `${protocol}${subdomain}.${baseUrl}/login`;
        console.log('Would redirect to school login:', targetUrl);
      } else {
        console.log('Would redirect to admin login: http://amino.localhost:3000/login');
      }
    }
  } else {
    console.log('No redirect needed - not an auth error');
  }
  
  console.log('=== Auth Error Handling Simulation Complete ===');
}

// Export for use in browser console during development
if (typeof window !== 'undefined') {
  (window as any).testAuthRedirect = {
    testAuthErrorDetection,
    simulateAuthErrorHandling,
    isAuthenticationError,
    redirectToLogin
  };
}
