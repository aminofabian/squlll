# 🎨 Frontend Implementation Guide

## 🎯 **What YOU Need to Do (Frontend Only)**

This guide shows how to update your frontend to work with the backend API.

---

## 📦 **1. Install API Client Libraries**

```bash
# Choose ONE of these approaches:

# Option A: React Query (Recommended for REST API)
npm install @tanstack/react-query axios

# Option B: Apollo Client (If backend uses GraphQL)
npm install @apollo/client graphql

# Option C: tRPC (If backend uses tRPC)
npm install @trpc/client @trpc/react-query
```

**Recommendation**: Use **React Query** - it's perfect for REST APIs and has excellent caching.

---

## 🔧 **2. Create API Client**

### **Create `lib/api/timetable-client.ts`**

```typescript
// lib/api/timetable-client.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const timetableAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token if needed
timetableAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
timetableAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 🎣 **3. Create API Hooks**

### **Create `lib/hooks/api/useTimetableAPI.ts`**

```typescript
// lib/hooks/api/useTimetableAPI.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timetableAPI } from '@/lib/api/timetable-client';
import type { 
  TimetableResponse, 
  CreateEntryRequest, 
  TimetableEntry 
} from '@/lib/types/timetable';

// Get Timetable
export function useTimetable(gradeId: string, termId?: string) {
  return useQuery({
    queryKey: ['timetable', gradeId, termId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (termId) params.set('term', termId);
      
      const { data } = await timetableAPI.get<TimetableResponse>(
        `/timetable/${gradeId}?${params}`
      );
      return data;
    },
    enabled: !!gradeId, // Only fetch if gradeId exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create Entry
export function useCreateTimetableEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: CreateEntryRequest) => {
      const { data } = await timetableAPI.post('/timetable/entries', entry);
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch timetable
      queryClient.invalidateQueries({ 
        queryKey: ['timetable', variables.gradeId] 
      });
    },
    onError: (error: any) => {
      // Handle conflicts
      if (error.response?.status === 409) {
        throw new Error('Teacher conflict detected');
      }
    },
  });
}

// Update Entry
export function useUpdateTimetableEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateEntryRequest> }) => {
      const response = await timetableAPI.put(`/timetable/entries/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      // Refresh all timetables
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
    },
  });
}

// Delete Entry
export function useDeleteTimetableEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => {
      await timetableAPI.delete(`/timetable/entries/${entryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
    },
  });
}

// Get Teachers
export function useTeachers(schoolId: string) {
  return useQuery({
    queryKey: ['teachers', schoolId],
    queryFn: async () => {
      const { data } = await timetableAPI.get(`/teachers?schoolId=${schoolId}`);
      return data.teachers;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (teachers don't change often)
  });
}

// Get Subjects
export function useSubjects(schoolId: string) {
  return useQuery({
    queryKey: ['subjects', schoolId],
    queryFn: async () => {
      const { data } = await timetableAPI.get(`/subjects?schoolId=${schoolId}`);
      return data.subjects;
    },
    staleTime: 30 * 60 * 1000,
  });
}

// Get Grades
export function useGrades(schoolId: string) {
  return useQuery({
    queryKey: ['grades', schoolId],
    queryFn: async () => {
      const { data } = await timetableAPI.get(`/grades?schoolId=${schoolId}`);
      return data.grades;
    },
    staleTime: 30 * 60 * 1000,
  });
}

// Detect Conflicts
export function useDetectConflicts(termId: string) {
  return useQuery({
    queryKey: ['conflicts', termId],
    queryFn: async () => {
      const { data } = await timetableAPI.post('/timetable/conflicts/detect', { termId });
      return data;
    },
    enabled: false, // Only run manually
  });
}
```

---

## 🔄 **4. Update Your Store (Remove Local State)**

### **Update `lib/stores/useTimetableStore.ts`**

```typescript
// lib/stores/useTimetableStore.ts
import { create } from 'zustand';

// ⚠️ REMOVE: All data fetching logic
// ⚠️ REMOVE: loadMockData, forceReloadMockData
// ⚠️ KEEP: Only UI state

interface TimetableStore {
  // UI State only (not data)
  selectedGrade: string | null;
  selectedTerm: string | null;
  searchTerm: string;
  showConflicts: boolean;
  isSummaryMinimized: boolean;
  
  // Actions
  setSelectedGrade: (gradeId: string) => void;
  setSelectedTerm: (termId: string) => void;
  setSearchTerm: (term: string) => void;
  toggleConflicts: () => void;
  toggleSummary: () => void;
}

export const useTimetableStore = create<TimetableStore>((set) => ({
  // UI State
  selectedGrade: null,
  selectedTerm: null,
  searchTerm: '',
  showConflicts: false,
  isSummaryMinimized: false,

  // Actions
  setSelectedGrade: (gradeId) => set({ selectedGrade: gradeId }),
  setSelectedTerm: (termId) => set({ selectedTerm: termId }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  toggleConflicts: () => set((state) => ({ showConflicts: !state.showConflicts })),
  toggleSummary: () => set((state) => ({ isSummaryMinimized: !state.isSummaryMinimized })),
}));

// ✅ Data now comes from React Query hooks, not Zustand!
```

---

## 🎨 **5. Update Your Timetable Page**

### **Update `app/school/[subdomain]/(pages)/timetable/page.tsx`**

```typescript
'use client'

import React, { useState } from 'react';
import { useTimetable, useCreateTimetableEntry, useTeachers, useSubjects } from '@/lib/hooks/api/useTimetableAPI';
import { useTimetableStore } from '@/lib/stores/useTimetableStore';
import { TimetableGrid } from './components';
import { toast } from 'sonner'; // or your toast library

const SmartTimetable = () => {
  // Get UI state from store
  const { selectedGrade, selectedTerm, searchTerm } = useTimetableStore();

  // Fetch data from API (React Query handles caching!)
  const { data: timetableData, isLoading, error } = useTimetable(
    selectedGrade || '',
    selectedTerm
  );

  const { data: teachers } = useTeachers('school-id'); // Get from context/props
  const { data: subjects } = useSubjects('school-id');

  // Mutations
  const createEntry = useCreateTimetableEntry();

  // Handle create entry
  const handleCreateEntry = async (entryData: CreateEntryRequest) => {
    try {
      await createEntry.mutateAsync(entryData);
      toast.success('Lesson added successfully!');
    } catch (error: any) {
      if (error.message.includes('conflict')) {
        toast.error('Teacher conflict detected! Choose another time slot.');
      } else {
        toast.error('Failed to add lesson');
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">
          Error loading timetable. Please try again.
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <TimetableGrid
        entries={timetableData?.entries || []}
        timeSlots={timetableData?.timeSlots || []}
        breaks={timetableData?.breaks || []}
        teachers={teachers || []}
        subjects={subjects || []}
        onCreateEntry={handleCreateEntry}
      />
    </DashboardLayout>
  );
};

export default SmartTimetable;
```

---

## 🎯 **6. Set Up React Query Provider**

### **Update `app/layout.tsx`**

```typescript
// app/layout.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function RootLayout({ children }: { children: React.Node }) {
  // Create query client (don't create outside component to avoid SSR issues)
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          {/* Only in development */}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

---

## 🔄 **7. Add Optimistic Updates** (Optional but Nice)

### **For Better UX**

```typescript
// lib/hooks/api/useTimetableAPI.ts
export function useCreateTimetableEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: CreateEntryRequest) => {
      const { data } = await timetableAPI.post('/timetable/entries', entry);
      return data;
    },
    
    // Optimistic update (instant UI feedback)
    onMutate: async (newEntry) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['timetable', newEntry.gradeId] });

      // Snapshot previous value
      const previousTimetable = queryClient.getQueryData(['timetable', newEntry.gradeId]);

      // Optimistically update
      queryClient.setQueryData(['timetable', newEntry.gradeId], (old: any) => {
        return {
          ...old,
          entries: [
            ...old.entries,
            {
              id: 'temp-' + Date.now(), // Temporary ID
              ...newEntry,
            },
          ],
        };
      });

      return { previousTimetable };
    },

    // Rollback on error
    onError: (err, newEntry, context) => {
      queryClient.setQueryData(
        ['timetable', newEntry.gradeId],
        context?.previousTimetable
      );
    },

    // Always refetch after error or success
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['timetable', variables.gradeId] 
      });
    },
  });
}
```

---

## 🌐 **8. Add Environment Variables**

### **Create `.env.local`**

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SCHOOL_ID=your-school-id
```

### **Use in Code**

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SCHOOL_ID = process.env.NEXT_PUBLIC_SCHOOL_ID;
```

---

## 🎨 **9. Update TypeScript Types**

### **Create `lib/types/timetable.ts`**

```typescript
// lib/types/timetable.ts

// Match the API contract exactly
export interface TimetableResponse {
  grade: {
    id: string;
    name: string;
    displayName: string;
  };
  term: {
    id: string;
    name: string;
  };
  timeSlots: TimeSlot[];
  breaks: Break[];
  entries: TimetableEntry[];
}

export interface TimeSlot {
  id: string;
  periodNumber: number;
  time: string;
  startTime: string;
  endTime: string;
  color: string;
}

export interface Break {
  id: string;
  name: string;
  type: string;
  dayOfWeek: number;
  afterPeriod: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  icon?: string;
  color?: string;
}

export interface TimetableEntry {
  id: string;
  dayOfWeek: number;
  timeSlotId: string;
  subject: {
    id: string;
    name: string;
    color?: string;
  };
  teacher: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
  };
  roomNumber?: string;
  isDoublePeriod: boolean;
  notes?: string;
}

export interface CreateEntryRequest {
  gradeId: string;
  subjectId: string;
  teacherId: string;
  timeSlotId: string;
  dayOfWeek: number;
  roomNumber?: string;
  isDoublePeriod?: boolean;
  notes?: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email?: string;
  subjects: Subject[];
  color?: string;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  color?: string;
  department?: string;
  isCore: boolean;
}
```

---

## 🧪 **10. Testing with Mock API**

### **While Backend is in Development**

```typescript
// lib/api/mock-api.ts
export const mockTimetableData: TimetableResponse = {
  grade: {
    id: 'grade-1',
    name: 'Grade 7',
    displayName: 'F1'
  },
  term: {
    id: 'term-1',
    name: 'Term 1'
  },
  timeSlots: [
    {
      id: 'slot-1',
      periodNumber: 1,
      time: '8:00 AM - 8:45 AM',
      startTime: '08:00',
      endTime: '08:45',
      color: 'border-l-primary'
    }
  ],
  breaks: [
    {
      id: 'break-1',
      name: 'Morning Break',
      type: 'short_break',
      dayOfWeek: 1,
      afterPeriod: 3,
      startTime: '10:00',
      endTime: '10:15',
      durationMinutes: 15
    }
  ],
  entries: []
};

// Use with React Query
export function useTimetable(gradeId: string) {
  return useQuery({
    queryKey: ['timetable', gradeId],
    queryFn: async () => {
      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockTimetableData;
    },
  });
}
```

---

## 📋 **Summary: What Changed**

### **Before (With Mock Data)**
```typescript
// Data in Zustand store
const { mainTimetable } = useTimetableStore();
const subjects = mainTimetable.subjects;
```

### **After (With Real API)**
```typescript
// Data from React Query
const { data } = useTimetable(gradeId);
const entries = data?.entries;
```

### **Key Differences:**
1. ✅ **No more Zustand for data** - Only UI state
2. ✅ **React Query handles caching** - Automatic
3. ✅ **React Query handles loading** - Built-in
4. ✅ **React Query handles errors** - Built-in
5. ✅ **Optimistic updates** - Instant UI feedback
6. ✅ **Automatic refetching** - When data changes

---

## 🚀 **Migration Checklist**

- [ ] Install React Query
- [ ] Create API client (`timetable-client.ts`)
- [ ] Create API hooks (`useTimetableAPI.ts`)
- [ ] Update types to match API contract
- [ ] Remove data logic from Zustand (keep only UI state)
- [ ] Update components to use React Query hooks
- [ ] Set up QueryClientProvider
- [ ] Add error handling
- [ ] Add loading states
- [ ] Test with mock API first
- [ ] Connect to real backend when ready

---

## 🎯 **Next Steps**

1. ✅ Share `FRONTEND_API_CONTRACT.md` with backend team
2. ✅ Install React Query: `npm install @tanstack/react-query`
3. ✅ Create the API client and hooks
4. ✅ Test with mock data first
5. ✅ Connect to real API when backend is ready

**Your frontend code stays almost the same - just changes where data comes from!**

