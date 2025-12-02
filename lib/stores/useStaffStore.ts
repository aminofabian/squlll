import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useCallback, useRef } from 'react';

// Staff user type from GraphQL
interface StaffUser {
  id: string;
  name: string;
  email: string;
}

interface GetStaffByTenantResponse {
  usersByTenant: StaffUser[];
}

interface StaffState {
  staff: StaffUser[];
  isLoading: boolean;
  error: string | null;
  
  // Setters
  setStaff: (staff: StaffUser[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Getters
  getStaffById: (staffId: string) => StaffUser | undefined;
  getStaffByEmail: (email: string) => StaffUser | undefined;
  getStaffByName: (name: string) => StaffUser | undefined;
  
  // Actions
  addStaff: (staff: StaffUser) => void;
  updateStaff: (staffId: string, updates: Partial<StaffUser>) => void;
  removeStaff: (staffId: string) => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  staff: [],
  isLoading: false,
  error: null,
};

// Only enable devtools in browser environment
const createStore = (set: any, get: any) => ({
      ...initialState,

      // Setters
      setStaff: (staff: StaffUser[]) => {
        console.log('Setting staff:', staff.length);
        set({ staff, error: null });
      },
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),

      // Getters
      getStaffById: (staffId: string) => {
        const state = get();
        return state.staff.find((staff: StaffUser) => staff.id === staffId);
      },

      getStaffByEmail: (email: string) => {
        const state = get();
        return state.staff.find((staff: StaffUser) => staff.email === email);
      },

      getStaffByName: (name: string) => {
        const state = get();
        return state.staff.find((staff: StaffUser) => staff.name === name);
      },

      // Actions
      addStaff: (staff: StaffUser) => {
        const state = get();
        set({ staff: [...state.staff, staff] });
      },

      updateStaff: (staffId: string, updates: Partial<StaffUser>) => {
        const state = get();
        set({
          staff: state.staff.map((staff: StaffUser) =>
            staff.id === staffId ? { ...staff, ...updates } : staff
          )
        });
      },

      removeStaff: (staffId: string) => {
        const state = get();
        set({
          staff: state.staff.filter((staff: StaffUser) => staff.id !== staffId)
        });
      },

      // Reset
      reset: () => set(initialState),
});

export const useStaffStore = create<StaffState>()(
  typeof window !== 'undefined'
    ? devtools(createStore, { name: 'staff-store' })
    : createStore
);

// Hook for fetching staff by tenant
export const useStaffByTenantQuery = () => {
  const { setStaff, setLoading, setError } = useStaffStore();
  const isFetchingRef = useRef(false);

  const fetchStaffByTenant = useCallback(async (tenantId: string): Promise<GetStaffByTenantResponse> => {
    if (!tenantId || tenantId.trim() === '') {
      const error = new Error('Tenant ID is required');
      setError(error.message);
      throw error;
    }

    // Prevent multiple simultaneous requests
    if (isFetchingRef.current) {
      console.log('Staff fetch already in progress, skipping...');
      return { usersByTenant: [] };
    }

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // Use the simple API route
      const response = await fetch('/api/staff', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch staff');
      }

      const result = await response.json();
      
      console.log('Fetched staff by tenant:', result.usersByTenant?.length || 0);
      setStaff(result.usersByTenant || []);
      return { usersByTenant: result.usersByTenant || [] };
    } catch (error) {
      console.error('Error fetching staff by tenant:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []); // Empty dependency array

  return {
    fetchStaffByTenant,
    refetch: (tenantId: string) => fetchStaffByTenant(tenantId),
  };
};

// Hook to access staff data from the store
export const useStaffData = () => {
  const { staff, isLoading, error } = useStaffStore();
  
  return {
    staff,
    isLoading,
    error,
  };
}; 