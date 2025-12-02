import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// GraphQL query for fetching pending invitations
const GET_PENDING_INVITATIONS_QUERY = `
  query GetPendingInvitations($tenantId: String!) {
    getPendingInvitations(tenantId: $tenantId) {
      id
      email
      role
      status
      createdAt
      expiresAt
      invitedBy {
        id
        name
        email
      }
    }
  }
`;

export interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  expiresAt?: string; // Optional since some invitations might not have expiration
  invitedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface GetPendingInvitationsResponse {
  getPendingInvitations: PendingInvitation[];
}

interface PendingInvitationsState {
  invitations: PendingInvitation[];
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean; // Add flag to track if we've already fetched
  
  // Setters
  setInvitations: (invitations: PendingInvitation[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Getters
  getInvitationById: (invitationId: string) => PendingInvitation | undefined;
  getInvitationsByRole: (role: string) => PendingInvitation[];
  getInvitationByEmail: (email: string) => PendingInvitation | undefined;
  
  // Actions
  addInvitation: (invitation: PendingInvitation) => void;
  updateInvitation: (invitationId: string, updates: Partial<PendingInvitation>) => void;
  removeInvitation: (invitationId: string) => void;
  
  // Fetch function
  fetchPendingInvitations: (tenantId: string) => Promise<GetPendingInvitationsResponse>;
  
  // Reset
  reset: () => void;
}

const initialState = {
  invitations: [],
  isLoading: false,
  error: null,
  hasFetched: false,
};

// Global flag to prevent multiple simultaneous fetches
let globalFetchInProgress = false;
let globalFetchPromise: Promise<GetPendingInvitationsResponse> | null = null;
let moduleInitialized = false; // Module-level flag to ensure fetch only happens once

// Only enable devtools in browser environment
const createStore = (set: any, get: any) => ({
      ...initialState,

      // Setters
      setInvitations: (invitations: PendingInvitation[]) => {
        console.log('Setting pending invitations:', invitations.length);
        set({ invitations, error: null });
      },
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),

      // Getters
      getInvitationById: (invitationId: string) => {
        const state = get();
        return state.invitations.find((invitation: PendingInvitation) => invitation.id === invitationId);
      },

      getInvitationsByRole: (role: string) => {
        const state = get();
        return state.invitations.filter((invitation: PendingInvitation) => invitation.role === role);
      },

      getInvitationByEmail: (email: string) => {
        const state = get();
        return state.invitations.find((invitation: PendingInvitation) => invitation.email === email);
      },

      // Actions
      addInvitation: (invitation: PendingInvitation) => {
        const state = get();
        set({ invitations: [...state.invitations, invitation] });
      },

      updateInvitation: (invitationId: string, updates: Partial<PendingInvitation>) => {
        const state = get();
        set({
          invitations: state.invitations.map((invitation: PendingInvitation) =>
            invitation.id === invitationId ? { ...invitation, ...updates } : invitation
          )
        });
      },

      removeInvitation: (invitationId: string) => {
        const state = get();
        set({
          invitations: state.invitations.filter((invitation: PendingInvitation) => invitation.id !== invitationId)
        });
      },

      // Fetch function - now part of the store with global protection
      fetchPendingInvitations: async (tenantId: string): Promise<GetPendingInvitationsResponse> => {
        const state = get();
        
        console.log('Store: fetchPendingInvitations called with tenantId:', tenantId);
        console.log('Store: Current state - isLoading:', state.isLoading, 'hasFetched:', state.hasFetched, 'invitations count:', state.invitations.length);
        console.log('Store: Global fetch in progress:', globalFetchInProgress);
        console.log('Store: Module initialized:', moduleInitialized);
        
        // Always fetch fresh data for now to debug the issue
        // Remove caching logic temporarily
        console.log('Store: Forcing fresh fetch to debug issue');
        
        // If there's already a global fetch in progress, wait for it
        if (globalFetchInProgress && globalFetchPromise) {
          console.log('Store: Global fetch in progress, waiting for existing promise...');
          return globalFetchPromise;
        }
        
        // If local loading state is true, return current data
        if (state.isLoading) {
          console.log('Store: Local loading state is true, returning current data');
          return { getPendingInvitations: state.invitations };
        }
        
        console.log('Store: Starting new fetch for pending invitations...');
        
        // Set global flags
        globalFetchInProgress = true;
        moduleInitialized = true;
        set({ isLoading: true, error: null });
        
        // Create the fetch promise
        globalFetchPromise = (async () => {
          try {
            // Use the dedicated API endpoint
            const response = await fetch(`/api/teachers/pending-invitations?tenantId=${tenantId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            console.log('Store: Successfully fetched pending invitations:', data.getPendingInvitations?.length || 0);
            
            // Update store with new data
            set({ 
              invitations: data.getPendingInvitations || [], 
              error: null, 
              hasFetched: true,
              isLoading: false 
            });
            
            return data;
          } catch (error) {
            console.error('Store: Error fetching pending invitations:', error);
            const errorMessage = error instanceof Error ? error.message : 'An error occurred';
            set({ error: errorMessage, isLoading: false });
            throw error;
          } finally {
            // Reset global flags
            globalFetchInProgress = false;
            globalFetchPromise = null;
          }
        })();
        
        return globalFetchPromise;
      },

      // Reset
      reset: () => {
        globalFetchInProgress = false;
        globalFetchPromise = null;
        moduleInitialized = false;
        set(initialState);
      },
});

export const usePendingInvitationsStore = create<PendingInvitationsState>()(
  typeof window !== 'undefined'
    ? devtools(createStore, { name: 'pending-invitations-store' })
    : createStore
);

// React Query hook for fetching pending invitations - now just returns the store function
export const usePendingInvitationsQuery = () => {
  const { fetchPendingInvitations } = usePendingInvitationsStore();

  return {
    fetchPendingInvitations,
    refetch: fetchPendingInvitations,
  };
}; 