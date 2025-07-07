import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { graphqlClient } from '../graphql-client';
import { gql } from 'graphql-request';

const GET_PENDING_INVITATIONS = gql`
  query GetPendingInvitations($tenantId: String!) {
    getPendingInvitations(tenantId: $tenantId) {
      id
      email
      role
      status
      createdAt
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
  
  // Reset
  reset: () => void;
}

const initialState = {
  invitations: [],
  isLoading: false,
  error: null,
};

export const usePendingInvitationsStore = create<PendingInvitationsState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Setters
      setInvitations: (invitations) => {
        console.log('Setting pending invitations:', invitations.length);
        set({ invitations, error: null });
      },
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Getters
      getInvitationById: (invitationId) => {
        const state = get();
        return state.invitations.find(invitation => invitation.id === invitationId);
      },

      getInvitationsByRole: (role) => {
        const state = get();
        return state.invitations.filter(invitation => invitation.role === role);
      },

      getInvitationByEmail: (email) => {
        const state = get();
        return state.invitations.find(invitation => invitation.email === email);
      },

      // Actions
      addInvitation: (invitation) => {
        const state = get();
        set({ invitations: [...state.invitations, invitation] });
      },

      updateInvitation: (invitationId, updates) => {
        const state = get();
        set({
          invitations: state.invitations.map(invitation =>
            invitation.id === invitationId ? { ...invitation, ...updates } : invitation
          )
        });
      },

      removeInvitation: (invitationId) => {
        const state = get();
        set({
          invitations: state.invitations.filter(invitation => invitation.id !== invitationId)
        });
      },

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'pending-invitations-store',
    }
  )
);

// React Query hook for fetching pending invitations
export const usePendingInvitationsQuery = () => {
  const { setInvitations, setLoading, setError } = usePendingInvitationsStore();

  const fetchPendingInvitations = async (tenantId: string): Promise<GetPendingInvitationsResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await graphqlClient.request<GetPendingInvitationsResponse>(
        GET_PENDING_INVITATIONS,
        { tenantId }
      );
      
      console.log('Fetched pending invitations:', response.getPendingInvitations.length);
      setInvitations(response.getPendingInvitations);
      return response;
    } catch (error) {
      console.error('Error fetching pending invitations:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchPendingInvitations,
    refetch: (tenantId: string) => fetchPendingInvitations(tenantId),
  };
}; 