/**
 * Authentication hook for accessing user tokens and auth state
 */

import { useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'student' | 'parent' | 'admin';
  tenantId?: string;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Hook for managing authentication state
 * This is a simplified version - in a real app, this would integrate with your auth provider
 */
export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // In a real implementation, this would:
    // 1. Check for stored tokens in localStorage/cookies
    // 2. Validate tokens with your auth server
    // 3. Refresh tokens if needed
    // 4. Set up token refresh intervals
    
    // For now, we'll simulate getting auth data
    const loadAuthData = async () => {
      try {
        // Check localStorage for auth data
        const storedToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          const user = JSON.parse(storedUser);
          setAuthState({
            user,
            accessToken: storedToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // For development/demo purposes, create a mock teacher user
          const mockUser: AuthUser = {
            id: 'teacher-123',
            email: 'teacher@school.com',
            name: 'John Doe',
            role: 'teacher',
            tenantId: 'school-tenant-123',
          };
          
          // In a real app, you would get this from your auth provider
          // Replace this with your actual Skool API access token
          const mockToken = 'your_actual_access_token_here'; // <-- PUT YOUR REAL TOKEN HERE
          
          // Store in localStorage for persistence
          localStorage.setItem('user', JSON.stringify(mockUser));
          localStorage.setItem('accessToken', mockToken);
          
          setAuthState({
            user: mockUser,
            accessToken: mockToken,
            isAuthenticated: true,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
        setAuthState({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    loadAuthData();
  }, []);

  return authState;
}

/**
 * Hook for getting just the access token
 */
export function useAccessToken(): string | null {
  const { accessToken } = useAuth();
  return accessToken;
}

/**
 * Utility function to clear auth data (logout)
 */
export function clearAuthData() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  window.location.reload(); // Simple way to reset app state
}
