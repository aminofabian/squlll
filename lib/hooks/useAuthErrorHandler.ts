import { useCallback } from 'react';
import { handleAuthenticationError, isAuthenticationError } from '@/lib/utils/auth-redirect';

/**
 * Hook for handling authentication errors consistently across the application
 */
export function useAuthErrorHandler() {
  const handleError = useCallback((error: any) => {
    if (isAuthenticationError(error)) {
      handleAuthenticationError(error);
      return true; // Indicates the error was handled
    }
    return false; // Indicates the error was not handled
  }, []);

  return { handleError, isAuthenticationError };
}
