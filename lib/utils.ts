import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get a cookie value by name (client-side only)
 */
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

/**
 * Get tenant information from cookies
 */
export function getTenantInfo() {
  if (typeof window === 'undefined') return null;
  
  const tenantId = getCookie('tenantId');
  const tenantName = getCookie('tenantName');
  const tenantSubdomain = getCookie('tenantSubdomain');
  
  return {
    tenantId: tenantId || null,
    tenantName: tenantName ? decodeURIComponent(tenantName) : null,
    tenantSubdomain: tenantSubdomain || null,
    hasTenantInfo: !!(tenantId && tenantName && tenantSubdomain)
  };
}

/**
 * Check authentication status by examining cookies
 */
export function checkAuthStatus() {
  if (typeof window === 'undefined') return null;
  
  const userId = getCookie('userId');
  const email = getCookie('email');
  const accessToken = getCookie('accessToken');
  const tenantId = getCookie('tenantId');
  const tenantName = getCookie('tenantName');
  const tenantSubdomain = getCookie('tenantSubdomain');
  
  const status = {
    isAuthenticated: !!(userId && email),
    hasAccessToken: !!accessToken,
    userId: userId || null,
    email: email || null,
    tenantId: tenantId || null,
    tenantName: tenantName ? decodeURIComponent(tenantName) : null,
    tenantSubdomain: tenantSubdomain || null,
    debug: {
      allCookies: document.cookie.split(';').map(c => {
        const [name, value] = c.trim().split('=');
        return { name, hasValue: !!value, valueLength: value?.length || 0 };
      })
    }
  };
  
  console.log('Auth status check:', status);
  return status;
}

/**
 * Debug function to log all relevant authentication information
 */
export function debugAuth() {
  if (typeof window === 'undefined') {
    console.log('debugAuth: Running on server side, cannot access cookies');
    return;
  }
  
  console.log('=== Authentication Debug Info ===');
  console.log('URL:', window.location.href);
  console.log('Cookies:', document.cookie);
  
  const authStatus = checkAuthStatus();
  console.log('Auth Status:', authStatus);
  
  // Check URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const hasAuthParams = urlParams.has('accessToken') || urlParams.has('userId') || urlParams.has('tenantId');
  console.log('Has auth params in URL:', hasAuthParams);
  
  if (hasAuthParams) {
    console.log('URL Auth Params:', {
      userId: urlParams.get('userId') ? `${urlParams.get('userId')?.substring(0, 10)}...` : 'none',
      email: urlParams.get('email') ? `${urlParams.get('email')?.substring(0, 5)}...` : 'none',
      tenantId: urlParams.get('tenantId') ? `${urlParams.get('tenantId')?.substring(0, 10)}...` : 'none',
      tenantName: urlParams.get('tenantName') || 'none',
      tenantSubdomain: urlParams.get('tenantSubdomain') || 'none',
      hasAccessToken: !!urlParams.get('accessToken'),
      newRegistration: urlParams.get('newRegistration')
    });
  }
  
  console.log('=== End Auth Debug ===');
}
