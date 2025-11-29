// lib/stores/useTimetableStoreNew.ts
// NEW: Clean store with normalized data structure

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TimeSlotInput } from '../hooks/useTimeSlots';
import type {
  TimetableData,
  TimetableUIState,
  TimetableEntry,
  CreateEntryRequest,
  TimeSlot,
  Break,
} from '../types/timetable';

interface TimetableStore extends TimetableData, TimetableUIState {
  // Actions for data
  addEntry: (entry: CreateEntryRequest) => TimetableEntry;
  createEntry: (entry: CreateEntryRequest) => TimetableEntry; // Alias for backward compatibility
  updateEntry: (id: string, updates: Partial<TimetableEntry>) => void;
  deleteEntry: (id: string) => void;
  updateTimeSlot: (id: string, updates: Partial<TimeSlot>) => void;

  // GraphQL time slot actions
  createTimeSlots: (timeSlots: TimeSlotInput[]) => Promise<void>;
  createTimeSlot: (timeSlot: TimeSlotInput) => Promise<void>;
  loadTimeSlots: () => Promise<void>;
  deleteTimeSlot: (id: string) => Promise<void>;
  deleteAllTimeSlots: () => Promise<void>;
  
  // GraphQL grade actions
  loadGrades: () => Promise<void>;
  
  // Break actions
  addBreak: (breakData: Omit<Break, 'id'>) => Break;
  createBreaks: (breaks: Omit<Break, 'id'>[]) => Promise<void>;
  loadBreaks: () => Promise<void>;
  updateBreak: (id: string, updates: Partial<Break>) => void;
  deleteBreak: (id: string) => void;
  deleteAllBreaks: () => Promise<void>;
  
  // Bulk actions
  bulkSetSchedule: (timeSlots: TimeSlot[], breaks: Break[]) => void;
  bulkCreateEntries: (termId: string, gradeId: string, entries: CreateEntryRequest[]) => Promise<void>;
  
  loadMockData: () => void;
  
  // Actions for UI state
  setSelectedGrade: (gradeId: string | null) => void;
  setSelectedTerm: (termId: string | null) => void;
  setSearchTerm: (term: string) => void;
  toggleConflicts: () => void;
  toggleSummary: () => void;
}

// Helper to generate simple IDs
let entryCounter = 1000;
let breakCounter = 100;
const generateId = () => `entry-${++entryCounter}`;
const generateBreakId = () => `break-${++breakCounter}`;

// Create empty initial state (no mock data)
const emptyInitialState: TimetableData = {
  timeSlots: [],
  breaks: [],
  subjects: [],
  teachers: [],
  grades: [],
  entries: [],
  lastUpdated: new Date().toISOString(),
};

// Create store
export const useTimetableStore = create<TimetableStore>()(
  persist(
    (set, get) => ({
      // Initial data - empty arrays (will be loaded from backend)
      ...emptyInitialState,
      
      // Initial UI state
      selectedGradeId: null,
      selectedTermId: null,
      searchTerm: '',
      showConflicts: false,
      isSummaryMinimized: false,

      // Data actions
      addEntry: (entryData: CreateEntryRequest) => {
        const newEntry: TimetableEntry = {
          id: generateId(),
          ...entryData,
        };

        set((state) => ({
          entries: [...state.entries, newEntry],
          lastUpdated: new Date().toISOString(),
        }));

        return newEntry;
      },

      // Backward compatibility alias
      createEntry: (entryData: CreateEntryRequest) => {
        return get().addEntry(entryData);
      },

      updateEntry: (id: string, updates: Partial<TimetableEntry>) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, ...updates } : entry
          ),
          lastUpdated: new Date().toISOString(),
        }));
      },

      deleteEntry: (id: string) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
          lastUpdated: new Date().toISOString(),
        }));
      },

      updateTimeSlot: (id: string, updates: Partial<TimeSlot>) => {
        set((state) => ({
          timeSlots: state.timeSlots.map((slot) =>
            slot.id === id ? { ...slot, ...updates } : slot
          ),
          lastUpdated: new Date().toISOString(),
        }));
      },

      // GraphQL time slot actions - directly call API
      createTimeSlots: async (timeSlots: TimeSlotInput[]) => {
        try {
          const response = await fetch('/api/school/time-slot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(timeSlots),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed: ${response.status} - ${errorText.substring(0, 200)}`);
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors.map((e: any) => e.message).join(', ');
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data) {
            throw new Error('Invalid response format: missing data');
          }

          // Convert response to TimeSlot format and update store
          const newTimeSlots = Object.values(result.data).map((slot: any) => ({
            id: slot.id,
            periodNumber: slot.periodNumber,
            time: slot.displayTime || `${slot.startTime} - ${slot.endTime}`,
            startTime: slot.startTime || '',
            endTime: slot.endTime || '',
            color: slot.color || 'border-l-primary'
          }));

          set((state) => ({
            timeSlots: [...state.timeSlots, ...newTimeSlots],
            lastUpdated: new Date().toISOString(),
          }));
        } catch (error) {
          console.error('Error creating time slots:', error);
          throw error;
        }
      },

      createTimeSlot: async (timeSlot: TimeSlotInput) => {
        return get().createTimeSlots([timeSlot]);
      },

      loadTimeSlots: async () => {
        try {
          const response = await fetch('/api/school/time-slot', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed: ${response.status} - ${errorText.substring(0, 200)}`);
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors.map((e: any) => e.message).join(', ');
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data || !result.data.getTimeSlots) {
            throw new Error('Invalid response format: missing getTimeSlots data');
          }

          // Convert response to TimeSlot format and update store
          const fetchedTimeSlots = result.data.getTimeSlots.map((slot: any) => {
            // Handle time format: backend returns "HH:MM:SS", we need "HH:MM"
            const formatTime = (timeStr: string) => {
              if (!timeStr) return '';
              // If already in HH:MM format, return as is
              if (timeStr.length === 5) return timeStr;
              // If in HH:MM:SS format, remove seconds
              if (timeStr.length === 8) return timeStr.substring(0, 5);
              return timeStr;
            };

            return {
              id: slot.id,
              periodNumber: slot.periodNumber,
              time: slot.displayTime || `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`,
              startTime: formatTime(slot.startTime),
              endTime: formatTime(slot.endTime),
              color: slot.color || 'border-l-primary'
            };
          });

          set((state) => ({
            timeSlots: fetchedTimeSlots,
            lastUpdated: new Date().toISOString(),
          }));
        } catch (error) {
          console.error('Error loading time slots:', error);
          throw error;
        }
      },

      deleteTimeSlot: async (id: string) => {
        try {
          const response = await fetch(`/api/school/time-slot?id=${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed: ${response.status} - ${errorText.substring(0, 200)}`);
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors.map((e: any) => e.message).join(', ');
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          // Check if deletion was successful
          if (result.data?.deleteTimeSlot !== true && result.data?.deleteTimeSlot !== false) {
            // If the mutation isn't implemented, still remove from local store
            if (result.featureNotAvailable) {
              console.warn('Time slot delete mutation not available on server, removing from local store only');
            } else {
              throw new Error('Invalid response format: deleteTimeSlot result missing');
            }
          }

          // Remove from store
          set((state) => ({
            timeSlots: state.timeSlots.filter((slot) => slot.id !== id),
            // Also remove any entries that reference this timeslot
            entries: state.entries.filter((entry) => entry.timeSlotId !== id),
            lastUpdated: new Date().toISOString(),
          }));
        } catch (error) {
          console.error('Error deleting time slot:', error);
          throw error;
        }
      },

      deleteAllTimeSlots: async () => {
        try {
          const response = await fetch('/api/school/time-slot?all=true', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed: ${response.status} - ${errorText.substring(0, 200)}`);
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors.map((e: any) => e.message).join(', ');
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          // Check if deletion was successful
          if (result.data?.deleteAllTimeSlots !== true && result.data?.deleteAllTimeSlots !== false) {
            // If the mutation isn't implemented, still remove from local store
            if (result.featureNotAvailable) {
              console.warn('Delete all time slots mutation not available on server, removing from local store only');
            } else {
              throw new Error('Invalid response format: deleteAllTimeSlots result missing');
            }
          }

          // Clear all time slots from store and remove entries that reference them
          set((state) => {
            const timeSlotIds = new Set(state.timeSlots.map((slot) => slot.id));
            return {
              timeSlots: [],
              // Also remove any entries that reference any timeslot
              entries: state.entries.filter((entry) => !timeSlotIds.has(entry.timeSlotId)),
              lastUpdated: new Date().toISOString(),
            };
          });
        } catch (error) {
          console.error('Error deleting all time slots:', error);
          throw error;
        }
      },

      loadGrades: async () => {
        try {
          const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: `
                query GradeLevelsForSchoolType {
                  gradeLevelsForSchoolType {
                    id
                    isActive
                    shortName
                    sortOrder
                    gradeLevel {
                      id
                      name
                    }
                  }
                }
              `
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed: ${response.status} - ${errorText.substring(0, 200)}`);
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors.map((e: any) => e.message).join(', ');
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data || !result.data.gradeLevelsForSchoolType) {
            throw new Error('Invalid response format: missing gradeLevelsForSchoolType data');
          }

          // Convert response to Grade format and update store
          const fetchedGrades = result.data.gradeLevelsForSchoolType
            .filter((item: any) => item.isActive) // Only include active grades
            .map((item: any) => {
              // Extract level number from name (e.g., "Grade 7" -> 7, "Form 1" -> 1)
              const name = item.gradeLevel?.name || item.shortName || 'Unknown';
              const levelMatch = name.match(/\d+/);
              const level = levelMatch ? parseInt(levelMatch[0], 10) : item.sortOrder || 0;

              return {
                id: item.id,
                name: name,
                level: level,
                displayName: item.shortName || name,
              };
            })
            .sort((a: any, b: any) => a.level - b.level); // Sort by level

          set((state) => ({
            grades: fetchedGrades,
            lastUpdated: new Date().toISOString(),
          }));
        } catch (error) {
          console.error('Error loading grades:', error);
          throw error;
        }
      },

      // Break management actions
      addBreak: (breakData: Omit<Break, 'id'>) => {
        const newBreak: Break = {
          id: generateBreakId(),
          ...breakData,
        };

        set((state) => ({
          breaks: [...state.breaks, newBreak],
          lastUpdated: new Date().toISOString(),
        }));

        return newBreak;
      },

      createBreaks: async (breaks: Omit<Break, 'id'>[]) => {
        try {
          const response = await fetch('/api/school/break', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(breaks),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed: ${response.status} - ${errorText.substring(0, 200)}`);
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors.map((e: any) => e.message).join(', ');
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data) {
            throw new Error('Invalid response format: missing data');
          }

          // Convert response to Break format and update store
          // The response has keys like break1, break2, etc.
          const newBreaks = Object.values(result.data).map((breakItem: any) => {
            // GraphQL returns dayOfWeek as 0-indexed (0=Monday), frontend uses 1-indexed (1=Monday)
            const dayOfWeek = (breakItem.dayOfWeek ?? 0) + 1;
            
            // Map GraphQL enum to frontend type
            const typeMap: Record<string, string> = {
              'SHORT_BREAK': 'short_break',
              'LUNCH': 'lunch',
              'ASSEMBLY': 'assembly',
            };
            const breakType = typeMap[breakItem.type] || 'short_break';
            
            return {
              id: breakItem.id,
              name: breakItem.name,
              type: breakType,
              dayOfWeek,
              afterPeriod: breakItem.afterPeriod,
              durationMinutes: breakItem.durationMinutes,
              icon: breakItem.icon || '☕',
              color: breakItem.color || 'bg-blue-500',
            };
          });

          set((state) => ({
            breaks: [...state.breaks, ...newBreaks],
            lastUpdated: new Date().toISOString(),
          }));
        } catch (error) {
          console.error('Error creating breaks:', error);
          throw error;
        }
      },

      loadBreaks: async () => {
        try {
          const response = await fetch('/api/school/break', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed: ${response.status} - ${errorText.substring(0, 200)}`);
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors.map((e: any) => e.message).join(', ');
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data || !result.data.getTimetableBreaks) {
            throw new Error('Invalid response format: missing getTimetableBreaks data');
          }

          // Convert response to Break format and update store
          const fetchedBreaks = result.data.getTimetableBreaks.map((breakItem: any) => {
            // GraphQL returns dayOfWeek as 0-indexed (0=Monday), frontend uses 1-indexed (1=Monday)
            const dayOfWeek = (breakItem.dayOfWeek ?? 0) + 1;
            
            // Map GraphQL enum to frontend type
            const typeMap: Record<string, string> = {
              'SHORT_BREAK': 'short_break',
              'LUNCH': 'lunch',
              'ASSEMBLY': 'assembly',
            };
            const breakType = typeMap[breakItem.type] || 'short_break';
            
            return {
              id: breakItem.id,
              name: breakItem.name,
              type: breakType,
              dayOfWeek,
              afterPeriod: breakItem.afterPeriod,
              durationMinutes: breakItem.durationMinutes,
              icon: breakItem.icon || '☕',
              color: breakItem.color || 'bg-blue-500',
            };
          });

          set((state) => ({
            breaks: fetchedBreaks,
            lastUpdated: new Date().toISOString(),
          }));
        } catch (error) {
          console.error('Error loading breaks:', error);
          throw error;
        }
      },

      updateBreak: (id: string, updates: Partial<Break>) => {
        set((state) => ({
          breaks: state.breaks.map((breakItem) =>
            breakItem.id === id ? { ...breakItem, ...updates } : breakItem
          ),
          lastUpdated: new Date().toISOString(),
        }));
      },

      deleteBreak: (id: string) => {
        set((state) => ({
          breaks: state.breaks.filter((breakItem) => breakItem.id !== id),
          lastUpdated: new Date().toISOString(),
        }));
      },

      deleteAllBreaks: async () => {
        try {
          const response = await fetch('/api/school/break?all=true', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed: ${response.status} - ${errorText.substring(0, 200)}`);
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors.map((e: any) => e.message).join(', ');
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          // Check if deletion was successful
          if (result.data?.deleteAllTimetableBreaks !== true && result.data?.deleteAllTimetableBreaks !== false) {
            // If the mutation isn't implemented, still remove from local store
            if (result.featureNotAvailable) {
              console.warn('Delete all breaks mutation not available on server, removing from local store only');
            } else {
              throw new Error('Invalid response format: deleteAllTimetableBreaks result missing');
            }
          }

          // Clear all breaks from store
          set((state) => ({
            breaks: [],
            lastUpdated: new Date().toISOString(),
          }));
        } catch (error) {
          console.error('Error deleting all breaks:', error);
          throw error;
        }
      },

      // Bulk schedule setup
      bulkSetSchedule: (timeSlots: TimeSlot[], breaks: Break[]) => {
        set((state) => ({
          timeSlots,
          breaks,
          // Clear existing entries as timeslot IDs have changed
          entries: [],
          lastUpdated: new Date().toISOString(),
        }));
      },

      // Bulk create timetable entries via GraphQL
      bulkCreateEntries: async (termId: string, gradeId: string, entries: CreateEntryRequest[]) => {
        try {
          const response = await fetch('/api/school/timetable/entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              termId,
              gradeId,
              entries: entries.map((entry) => ({
                subjectId: entry.subjectId,
                teacherId: entry.teacherId,
                timeSlotId: entry.timeSlotId,
                dayOfWeek: entry.dayOfWeek,
                roomNumber: entry.roomNumber || null,
              })),
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed: ${response.status} - ${errorText.substring(0, 200)}`);
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors.map((e: any) => e.message).join(', ');
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data || !result.data.bulkCreateTimetableEntries) {
            throw new Error('Invalid response format: missing bulkCreateTimetableEntries data');
          }

          // Convert response entries to TimetableEntry format and update store
          // Match response entries with original entries by index (order should be preserved)
          const createdEntries: TimetableEntry[] = result.data.bulkCreateTimetableEntries.map((responseEntry: any, index: number) => {
            const originalEntry = entries[index];
            return {
              id: responseEntry.id,
              gradeId,
              subjectId: originalEntry.subjectId,
              teacherId: originalEntry.teacherId,
              timeSlotId: originalEntry.timeSlotId,
              dayOfWeek: responseEntry.dayOfWeek,
              roomNumber: originalEntry.roomNumber || '',
            };
          });

          set((state) => ({
            entries: [...state.entries, ...createdEntries],
            lastUpdated: new Date().toISOString(),
          }));
        } catch (error) {
          console.error('Error creating bulk timetable entries:', error);
          throw error;
        }
      },

      // DEPRECATED: This function is kept for backward compatibility but should not be used
      // Use loadTimeSlots() and other backend methods instead
      loadMockData: () => {
        console.warn('loadMockData is deprecated. Use loadTimeSlots() and other backend methods instead.');
        // Do nothing - return empty state
        set({
          ...emptyInitialState,
          lastUpdated: new Date().toISOString(),
        });
      },

      // UI actions
      setSelectedGrade: (gradeId) => set({ selectedGradeId: gradeId }),
      setSelectedTerm: (termId) => set({ selectedTermId: termId }),
      setSearchTerm: (term) => set({ searchTerm: term }),
      toggleConflicts: () => set((state) => ({ showConflicts: !state.showConflicts })),
      toggleSummary: () => set((state) => ({ isSummaryMinimized: !state.isSummaryMinimized })),
    }),
    {
      name: 'timetable-store-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist data, not UI state
        timeSlots: state.timeSlots,
        breaks: state.breaks,
        subjects: state.subjects,
        teachers: state.teachers,
        grades: state.grades,
        entries: state.entries,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Selectors (optimized accessors)
export const useTimetableSelectors = () => {
  const store = useTimetableStore();

  return {
    // Get entries for currently selected grade
    selectedGradeEntries: store.entries.filter(
      (entry) => entry.gradeId === store.selectedGradeId
    ),

    // Get specific subject by ID
    getSubject: (id: string) => store.subjects.find((s) => s.id === id),

    // Get specific teacher by ID
    getTeacher: (id: string) => store.teachers.find((t) => t.id === id),

    // Get specific time slot by ID
    getTimeSlot: (id: string) => store.timeSlots.find((ts) => ts.id === id),

    // Get specific grade by ID
    getGrade: (id: string) => store.grades.find((g) => g.id === id),

    // Get breaks for a specific day
    getBreaksForDay: (dayOfWeek: number) =>
      store.breaks.filter((b) => b.dayOfWeek === dayOfWeek),

    // Get entries for specific grade and day
    getEntriesForGradeAndDay: (gradeId: string, dayOfWeek: number) =>
      store.entries.filter(
        (entry) => entry.gradeId === gradeId && entry.dayOfWeek === dayOfWeek
      ),

    // Enrich an entry with full data
    enrichEntry: (entry: TimetableEntry) => ({
      ...entry,
      subject: store.subjects.find((s) => s.id === entry.subjectId)!,
      teacher: store.teachers.find((t) => t.id === entry.teacherId)!,
      timeSlot: store.timeSlots.find((ts) => ts.id === entry.timeSlotId)!,
      grade: store.grades.find((g) => g.id === entry.gradeId)!,
    }),
  };
};

