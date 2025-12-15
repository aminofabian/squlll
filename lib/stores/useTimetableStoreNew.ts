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
import { useSchoolConfigStore } from './useSchoolConfigStore';

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
  createDayTemplates: (templates: DayTemplateInput[]) => Promise<void>;
  createDayTemplate: (template: DayTemplateInput) => Promise<void>;
  createWeekTemplate: (input: CreateWeekTemplateInput) => Promise<any>;
  loadWeekTemplates: (includeDetails?: boolean) => Promise<any[]>;
  updateWeekTemplate: (input: { id: string; defaultStartTime?: string }) => Promise<any>;
  rebuildWeekTemplatePeriods: (input: { id: string; startTime: string; periodCount: number; periodDuration: number; force?: boolean }) => Promise<any>;
  addPeriodsToDayTemplate: (dayTemplateId: string, extraPeriods: number) => Promise<any[]>;
  updateDayTemplatePeriod: (periodId: string, input: { startTime?: string; endTime?: string; label?: string }) => Promise<void>;
  resetDayTemplatePeriods: (input: { dayTemplateId: string; startTime?: string; periodCount?: number; periodDuration?: number }) => Promise<void>;
  loadTimeSlots: (termId?: string) => Promise<void>;
  loadDayTemplatePeriods: (dayTemplateId?: string) => Promise<void>;
  loadDayTemplates: () => Promise<any[]>;
  deleteTimeSlot: (id: string) => Promise<void>;
  deleteAllTimeSlots: () => Promise<void>;
  
  // GraphQL grade actions
  loadGrades: () => Promise<void>;
  
  // GraphQL subject actions
  loadSubjects: (gradeId?: string) => Promise<void>;
  
  // GraphQL teacher actions
  loadTeachers: () => Promise<void>;
  
  // GraphQL timetable entry actions
  loadEntries: (termId: string, gradeId: string) => Promise<void>;
  deleteEntriesForTerm: (termId: string) => Promise<string | undefined>;
  deleteTimetableForTerm: (termId: string) => Promise<string | undefined>;
  loadSchoolTimetable: (termId: string) => Promise<any>;
  
  // Break actions
  addBreak: (breakData: Omit<Break, 'id'>) => Break;
  createBreaks: (breaks: Omit<Break, 'id'>[]) => Promise<void>;
  createAllBreaksForTemplate: (breaks: Array<{
    dayTemplateId: string;
    name: string;
    type: string;
    afterPeriod: number;
    durationMinutes: number;
    icon?: string;
    color?: string;
    applyToAllDays?: boolean;
  }>) => Promise<void>;
  loadBreaks: () => Promise<void>;
  updateBreak: (id: string, updates: Partial<Break>) => void;
  deleteBreak: (id: string) => Promise<void>;
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

type DayTemplateInput = {
  dayOfWeek: number;
  startTime: string;
  periodCount: number;
  defaultPeriodDuration: number;
  gradeLevelIds: string[];
};

type CreateWeekTemplateInput = {
  name: string;
  startTime: string;
  periodCount: number;
  periodDuration: number;
  numberOfDays: number;
  gradeLevelIds: string[];
  streamIds?: string[];
  replaceExisting?: boolean;
};

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

      createDayTemplates: async (templates: DayTemplateInput[]) => {
        try {
          const response = await fetch('/api/school/time-slot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(templates),
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
        } catch (error) {
          console.error('Error creating day templates:', error);
          throw error;
        }
      },

      createDayTemplate: async (template: DayTemplateInput) => {
        return get().createDayTemplates([template]);
      },

      createWeekTemplate: async (input: CreateWeekTemplateInput) => {
        try {
          const mutation = `
            mutation CreateWeekTemplate($input: CreateWeekTemplateInput!) {
              createWeekTemplate(input: $input) {
                id
                name
                dayTemplates {
                  id
                  dayOfWeek
                  startTime
                  periods {
                    id
                    periodNumber
                    startTime
                    endTime
                  }
                }
              }
            }
          `;

          const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
            },
            credentials: 'include',
            body: JSON.stringify({
              query: mutation,
              variables: { input },
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

          if (!result.data || !result.data.createWeekTemplate) {
            throw new Error('Invalid response format: missing createWeekTemplate data');
          }

          return result.data.createWeekTemplate;
        } catch (error) {
          console.error('Error creating week template:', error);
          throw error;
        }
      },

      loadWeekTemplates: async (includeDetails = false) => {
        try {
          console.log('Loading week templates with includeDetails:', includeDetails);
          
          const query = `
            query GetWeekTemplates($input: GetWeekTemplatesInput!) {
              getWeekTemplates(input: $input) {
                id
                name
                numberOfDays
                termId
                ${includeDetails ? `
                dayTemplates {
                  id
                  dayOfWeek
                  startTime
                  periodCount
                  gradeLevels {
                    id
                    name
                  }
                  streams {
                    id
                    stream {
                      name
                    }
                  }
                  periods {
                    id
                    periodNumber
                    startTime
                    endTime
                  }
                }
                ` : ''}
              }
            }
          `;

          const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
            },
            credentials: 'include',
            body: JSON.stringify({
              query,
              variables: { input: { includeDetails } },
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

          if (!result.data || !result.data.getWeekTemplates) {
            throw new Error('Invalid response format: missing getWeekTemplates data');
          }

          return result.data.getWeekTemplates;
        } catch (error) {
          console.error('Error loading week templates:', error);
          throw error;
        }
      },

      updateWeekTemplate: async (input: { id: string; defaultStartTime?: string }) => {
        try {
          const mutation = `
            mutation UpdateWeekTemplate($input: UpdateWeekTemplateInput!) {
              updateWeekTemplate(input: $input) {
                id
                defaultStartTime
                dayTemplates {
                  id
                  dayOfWeek
                  startTime
                  periods {
                    periodNumber
                    startTime
                    endTime
                  }
                }
              }
            }
          `;

          const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
            },
            credentials: 'include',
            body: JSON.stringify({
              query: mutation,
              variables: { input },
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

          if (!result.data || !result.data.updateWeekTemplate) {
            throw new Error('Invalid response format: missing updateWeekTemplate data');
          }

          return result.data.updateWeekTemplate;
        } catch (error) {
          console.error('Error updating week template:', error);
          throw error;
        }
      },

      rebuildWeekTemplatePeriods: async (input: { 
        id: string; 
        startTime: string; 
        periodCount: number; 
        periodDuration: number; 
        force?: boolean;
      }) => {
        try {
          const mutation = `
            mutation RebuildWeekTemplatePeriods(
              $id: String!
              $startTime: String!
              $periodCount: Int!
              $periodDuration: Int!
              $force: Boolean
            ) {
              rebuildWeekTemplatePeriods(
                id: $id
                startTime: $startTime
                periodCount: $periodCount
                periodDuration: $periodDuration
                force: $force
              ) {
                id
                defaultPeriodCount
                dayTemplates {
                  id
                  periods {
                    id
                    periodNumber
                    startTime
                    endTime
                  }
                }
              }
            }
          `;

          const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
            },
            credentials: 'include',
            body: JSON.stringify({
              query: mutation,
              variables: input,
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

          if (!result.data || !result.data.rebuildWeekTemplatePeriods) {
            throw new Error('Invalid response format: missing rebuildWeekTemplatePeriods data');
          }

          return result.data.rebuildWeekTemplatePeriods;
        } catch (error) {
          console.error('Error rebuilding week template periods:', error);
          throw error;
        }
      },

      addPeriodsToDayTemplate: async (dayTemplateId: string, extraPeriods: number) => {
        try {
          const mutation = `
            mutation AddPeriodsToDayTemplate($dayTemplateId: String!, $extraPeriods: Int!) {
              addPeriodsToDayTemplate(dayTemplateId: $dayTemplateId, extraPeriods: $extraPeriods) {
                id
                periodNumber
                startTime
                endTime
              }
            }
          `;

          const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
            },
            credentials: 'include',
            body: JSON.stringify({
              query: mutation,
              variables: { dayTemplateId, extraPeriods },
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

          if (!result.data || !result.data.addPeriodsToDayTemplate) {
            throw new Error('Invalid response format: missing addPeriodsToDayTemplate data');
          }

          // Refresh periods to pull in dayOfWeek mapping
          await get().loadDayTemplatePeriods();

          return result.data.addPeriodsToDayTemplate;
        } catch (error) {
          console.error('Error adding periods to day template:', error);
          throw error;
        }
      },

      updateDayTemplatePeriod: async (periodId: string, input: { startTime?: string; endTime?: string; label?: string }) => {
        try {
          const mutation = `
            mutation UpdateDayTemplatePeriod($periodId: String!, $input: UpdateDayTemplatePeriodInput!) {
              updateDayTemplatePeriod(periodId: $periodId, input: $input) {
                id
                periodNumber
                startTime
                endTime
                label
              }
            }
          `;

          const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
            },
            credentials: 'include',
            body: JSON.stringify({
              query: mutation,
              variables: { periodId, input },
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

          if (!result.data || !result.data.updateDayTemplatePeriod) {
            throw new Error('Invalid response format: missing updateDayTemplatePeriod data');
          }

          // Refresh periods to include latest changes
          await get().loadDayTemplatePeriods();
        } catch (error) {
          console.error('Error updating day template period:', error);
          throw error;
        }
      },

      resetDayTemplatePeriods: async (input: { dayTemplateId: string; startTime?: string; periodCount?: number; periodDuration?: number }) => {
        try {
          const mutation = `
            mutation ResetDayTemplatePeriods($input: ResetDayTemplatePeriodsInput!) {
              resetDayTemplatePeriods(input: $input) {
                id
                periodNumber
                startTime
                endTime
                label
                tenantId
              }
            }
          `;

          const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
            },
            credentials: 'include',
            body: JSON.stringify({
              query: mutation,
              variables: { input },
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

          if (!result.data || !result.data.resetDayTemplatePeriods) {
            throw new Error('Invalid response format: missing resetDayTemplatePeriods data');
          }

          // Refresh periods to reflect new schedule
          await get().loadDayTemplatePeriods();
        } catch (error) {
          console.error('Error resetting day template periods:', error);
          throw error;
        }
      },

      loadDayTemplatePeriods: async (dayTemplateIdParam?: string) => {
        try {
          // Fetch templates first to map dayTemplateId -> dayOfWeek
          const templates = await get().loadDayTemplates();
          const templateDayMap = new Map<string, number>();
          templates.forEach((t: any) => {
            if (t?.id && typeof t.dayOfWeek === 'number') {
              templateDayMap.set(t.id, t.dayOfWeek);
            }
          });

          const targetTemplateId = dayTemplateIdParam || templates?.[0]?.id;
          if (!targetTemplateId) {
            throw new Error('No day template available to load periods.');
          }

          const query = `
            query GetDayTemplatePeriods($dayTemplateId: String!) {
              getAllDayTemplatePeriods1(dayTemplateId: $dayTemplateId) {
                id
                periodNumber
                startTime
                endTime
                label
                dayTemplateId
              }
            }
          `;

          const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
            },
            credentials: 'include',
            body: JSON.stringify({ query, variables: { dayTemplateId: targetTemplateId } }),
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

          const periodsData =
            result.data?.getAllDayTemplatePeriods1 ||
            result.data?.getAllDayTemplatePeriods ||
            null;

          if (!periodsData) {
            throw new Error('Invalid response format: missing day template periods data');
          }

          const formatTime = (timeStr: string) => {
            if (!timeStr) return '';
            if (timeStr.length === 5) return timeStr;
            if (timeStr.length === 8) return timeStr.substring(0, 5);
            return timeStr;
          };

          const periods = periodsData;
          const mappedSlots: TimeSlot[] = periods.map((p: any) => ({
            id: p.id,
            periodNumber: p.periodNumber,
            time: `${formatTime(p.startTime)} - ${formatTime(p.endTime)}`,
            startTime: formatTime(p.startTime),
            endTime: formatTime(p.endTime),
            color: 'border-l-primary',
            dayOfWeek: templateDayMap.get(p.dayTemplateId),
            label: p.label,
            dayTemplateId: p.dayTemplateId,
          }));

          set((state) => ({
            timeSlots: mappedSlots,
            lastUpdated: new Date().toISOString(),
          }));
        } catch (error) {
          console.error('Error loading day template periods:', error);
          throw error;
        }
      },

      loadDayTemplates: async () => {
        try {
          const query = `
            query GetAllDayTemplates {
              getAllDayTemplates {
                id
                dayOfWeek
                tenantId
                breaks {
                  id
                  durationMinutes
                  applyToAllDays
                  afterPeriod
                  type
                }
              }
            }
          `;

          const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
            },
            credentials: 'include',
            body: JSON.stringify({ query }),
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

          if (!result.data || !result.data.getAllDayTemplates) {
            throw new Error('Invalid response format: missing getAllDayTemplates data');
          }

          return result.data.getAllDayTemplates;
        } catch (error) {
          console.error('Error loading day templates:', error);
          throw error;
        }
      },

      loadTimeSlots: async (termIdParam?: string) => {
        try {
          // Deprecated per new template/period flow: use day template periods instead
          await get().loadDayTemplatePeriods();
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

      loadSubjects: async (gradeId?: string) => {
        try {
          // Load subjects from backend GraphQL API (tenantSubjects) to get correct backend IDs
          const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              query: `
                query GetTenantSubjects {
                  tenantSubjects {
                    id
                    subjectType
                    isCompulsory
                    isActive
                    subject {
                      id
                      name
                      code
                      category
                      department
                      shortName
                    }
                    customSubject {
                      id
                      name
                      code
                      category
                      department
                      shortName
                    }
                  }
                }
              `,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch subjects: ${response.statusText}`);
          }

          const result = await response.json();

          if (result.errors) {
            console.error('GraphQL errors loading subjects:', result.errors);
            throw new Error(`GraphQL errors: ${result.errors.map((e: any) => e.message).join(', ')}`);
          }

          // Extract subjects from tenantSubjects - use tenantSubject.id (the assignment ID)
          const tenantSubjects = result.data?.tenantSubjects || [];
          const subjectsMap = new Map<string, any>();

          tenantSubjects.forEach((tenantSubject: any) => {
            // Use the actual subject (either subject or customSubject) for name/code/etc.
            const actualSubject = tenantSubject.subject || tenantSubject.customSubject;
            if (actualSubject && actualSubject.name) {
              // IMPORTANT: Use tenantSubject.id (the assignment ID), NOT subject.id
              // The backend timetable entry expects the tenantSubject.id, not the subject.id
              const tenantSubjectId = tenantSubject.id;
              const subjectName = actualSubject.name;
              
              // Use tenantSubjectId as key to avoid duplicates
              if (!subjectsMap.has(tenantSubjectId)) {
                subjectsMap.set(tenantSubjectId, {
                  id: tenantSubjectId, // This is tenantSubject.id (the assignment ID)
                  name: subjectName,
                  code: actualSubject.code || actualSubject.shortName || '',
                  color: undefined,
                  department: actualSubject.department || actualSubject.category || '',
                  // Store the underlying subject ID for reference if needed
                  _subjectId: actualSubject.id,
                });
              }
            } else {
              console.warn('TenantSubject missing subject or customSubject:', tenantSubject);
            }
          });

          const fetchedSubjects = Array.from(subjectsMap.values());
          console.log('Loaded subjects from backend:', fetchedSubjects.length, 'subjects');
          console.log('Sample tenantSubject IDs (first 3):', fetchedSubjects.slice(0, 3).map(s => ({
            tenantSubjectId: s.id, // This is the tenantSubject.id (assignment ID)
            name: s.name,
            code: s.code,
            underlyingSubjectId: s._subjectId, // The actual subject.id for reference
          })));

          set((state) => ({
            subjects: fetchedSubjects,
            lastUpdated: new Date().toISOString(),
          }));
        } catch (error) {
          console.error('Error loading subjects:', error);
          // Fallback to school config if backend fails
          try {
            const schoolConfigStore = useSchoolConfigStore.getState();
            const config = schoolConfigStore.config;
            if (config) {
              const allSubjects = schoolConfigStore.getAllSubjects();
              const fallbackSubjects = allSubjects.map((s: any) => ({
                id: s.id,
                name: s.name,
                code: s.code || s.shortName,
                color: undefined,
                department: s.department || s.category,
              }));
              console.warn('Using fallback subjects from school config:', fallbackSubjects.length);
              set((state) => ({
                subjects: fallbackSubjects,
                lastUpdated: new Date().toISOString(),
              }));
            } else {
              throw error; // Re-throw if no fallback available
            }
          } catch (fallbackError) {
            throw error; // Re-throw original error
          }
        }
      },

      loadTeachers: async () => {
        try {
          console.log('Loading teachers from /api/school/teacher...');
          const response = await fetch('/api/school/teacher', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          });

          console.log('Teachers API response status:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Teachers API error response:', errorText);
            throw new Error(`Request failed: ${response.status} - ${errorText.substring(0, 200)}`);
          }

          const result = await response.json();
          console.log('Teachers API response:', result);

          // Handle error responses from API
          if (result.error) {
            console.error('API returned error:', result.error);
            // If feature not available, set empty array instead of throwing
            if (result.featureNotAvailable) {
              console.warn('Teachers feature not available, using empty array');
              set((state) => ({
                teachers: [],
                lastUpdated: new Date().toISOString(),
              }));
              return;
            }
            throw new Error(result.error);
          }

          if (result.errors) {
            const errorMessages = result.errors.map((e: any) => e.message).join(', ');
            console.error('GraphQL errors:', errorMessages);
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data || !result.data.getTeachers) {
            console.error('Invalid response format:', result);
            throw new Error('Invalid response format: missing getTeachers data');
          }

          const teachersData = result.data.getTeachers;
          console.log(`Fetched ${teachersData.length} teachers`);

          // Convert response to Teacher format and update store
          const fetchedTeachers = teachersData
            .filter((teacher: any) => {
              // Filter out teachers with no user (they can't be assigned)
              // But keep teachers with user: null if they have subjects
              return teacher.user !== null || (teacher.tenantSubjects && teacher.tenantSubjects.length > 0);
            })
            .map((teacher: any) => {
              // Parse name into firstName and lastName
              const fullName = teacher.user?.name || `Teacher ${teacher.id.slice(-6)}`;
              const nameParts = fullName.trim().split(/\s+/);
              const firstName = nameParts[0] || '';
              const lastName = nameParts.slice(1).join(' ') || '';

              // Extract subject names from tenantSubjects (remove duplicates)
              const subjectNames = Array.from(
                new Set(teacher.tenantSubjects?.map((ts: any) => ts.name).filter(Boolean) || [])
              );

              // Extract grade level names from tenantGradeLevels
              const gradeLevelNames = Array.from(
                new Set(
                  teacher.tenantGradeLevels?.map((tgl: any) => tgl.gradeLevel?.name).filter(Boolean) || []
                )
              );

              const processedTeacher = {
                id: teacher.id,
                firstName,
                lastName,
                name: fullName,
                email: teacher.user?.email || undefined,
                subjects: subjectNames, // Array of subject names (not IDs, as per interface)
                gradeLevels: gradeLevelNames, // Array of grade level names
                color: undefined, // Can be set later if needed
              };

              console.log('Processed teacher:', processedTeacher);
              return processedTeacher;
            });

          console.log(`Processed ${fetchedTeachers.length} teachers (filtered from ${teachersData.length} total)`);
          set((state) => ({
            teachers: fetchedTeachers,
            lastUpdated: new Date().toISOString(),
          }));
        } catch (error) {
          console.error('Error loading teachers:', error);
          // Set empty array on error to prevent UI from breaking
          set((state) => ({
            teachers: [],
            lastUpdated: new Date().toISOString(),
          }));
          // Still throw so calling code knows there was an error
          throw error;
        }
      },

      loadEntries: async (termId: string, gradeId: string) => {
        try {
          console.log('Loading timetable entries for term:', termId, 'grade:', gradeId);
          
          const query = `
            query GetSchoolTimetable($input: GetSchoolTimetableInput!) {
              getSchoolTimetable(input: $input) {
                termId
                termName
                totalDays
                totalPeriods
                totalOccupiedSlots
                totalFreeSlots
                generatedAt
                timetableByGrade {
                  gradeLevel {
                    id
                    name
                    shortName
                  }
                  stream {
                    id
                    name
                  }
                  totalPeriods
                  occupiedPeriods
                  freePeriods
                  days {
                    dayTemplate {
                      id
                      dayOfWeek
                      dayName
                      startTime
                      endTime
                      periodCount
                    }
                    periods {
                      period {
                        id
                        periodNumber
                        startTime
                        endTime
                        label
                      }
                      entry {
                        id
                        subject {
                          id
                          name
                        }
                        teacher {
                          id
                          name
                          email
                        }
                        gradeLevel {
                          id
                          name
                        }
                        stream {
                          id
                        }
                        room {
                          id
                          name
                        }
                      }
                      isBreak
                      breakInfo {
                        id
                        name
                        type
                        durationMinutes
                        icon
                        color
                      }
                    }
                    gradeLevels { id name shortName }
                    streams { id name }
                    totalPeriods
                    occupiedPeriods
                    freePeriods
                  }
                }
                schedule {
                  dayTemplate {
                    id
                    dayOfWeek
                    dayName
                    startTime
                    endTime
                  }
                  gradeLevels { id name }
                  streams { id name }
                  periods {
                    period {
                      periodNumber
                      startTime
                      endTime
                    }
                    entry {
                      subject { name }
                      teacher { name }
                      room { name }
                    }
                    isBreak
                    breakInfo {
                      name
                      type
                      durationMinutes
                    }
                  }
                }
              }
            }
          `;

          const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
            },
            credentials: 'include',
            body: JSON.stringify({
              query,
              variables: {
                input: { termId },
              },
            }),
          });

          console.log('Timetable entries API response status:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Timetable entries API error response:', errorText);
            throw new Error(`Request failed: ${response.status} - ${errorText.substring(0, 200)}`);
          }

          const result = await response.json();
          console.log('Timetable entries API response:', result);

          // Handle error responses from API
          if (result.error) {
            console.error('API returned error:', result.error);
            throw new Error(result.error);
          }

          if (result.errors) {
            const errorMessages = result.errors.map((e: any) => e.message).join(', ');
            console.error('GraphQL errors:', errorMessages);
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data || !result.data.getSchoolTimetable) {
            console.error('Invalid response format:', result);
            throw new Error('Invalid response format: missing getSchoolTimetable data');
          }

          const timetableData = result.data.getSchoolTimetable;
          const timetableByGrade = timetableData.timetableByGrade || [];

          const formatTime = (timeStr: string) => {
            if (!timeStr) return '';
            if (timeStr.length === 5) return timeStr;
            if (timeStr.length === 8) return timeStr.substring(0, 5);
            return timeStr;
          };

          // Pick the grade block matching the selected grade (id first, then name/shortName)
          const gradeIdLower = (gradeId || '').toLowerCase();
          const gradeBlock =
            timetableByGrade.find((g: any) => {
              const id = g.gradeLevel?.id;
              const name = g.gradeLevel?.name?.toLowerCase();
              const shortName = g.gradeLevel?.shortName?.toLowerCase();
              return (
                (!!id && id === gradeId) ||
                (!!name && name === gradeIdLower) ||
                (!!shortName && shortName === gradeIdLower)
              );
            }) ||
            timetableByGrade[0] ||
            null;

          if (!gradeBlock) {
            console.warn('No grade block found for grade:', gradeId);
            set((state) => ({
              entries: state.entries.filter((e) => e.gradeId !== gradeId),
              lastUpdated: new Date().toISOString(),
            }));
            return;
          }

          const timeSlotMap = new Map<string, TimeSlot>();
          const fetchedEntries: TimetableEntry[] = [];

          // Collect time slots from the selected grade block (they're shared across grades anyway)
          // Process only the selected grade block for entries (more efficient)
          if (Array.isArray(gradeBlock.days)) {
            gradeBlock.days.forEach((dayItem: any) => {
              const dayTemplate = dayItem.dayTemplate;
              const dayOfWeek = dayTemplate?.dayOfWeek;
              const dayTemplateId = dayTemplate?.id;
              
              (dayItem.periods || []).forEach((p: any) => {
                const period = p?.period;
                
                // Skip breaks - they shouldn't be in time slots
                if (p?.isBreak) {
                  return;
                }
                
                // Collect time slots (only non-break periods)
                if (period?.id && !period.id.startsWith('break-') && !timeSlotMap.has(period.id)) {
                  timeSlotMap.set(period.id, {
                    id: period.id,
                    periodNumber: period.periodNumber,
                    time: `${formatTime(period.startTime)} - ${formatTime(period.endTime)}`,
                    startTime: formatTime(period.startTime),
                    endTime: formatTime(period.endTime),
                    color: 'border-l-primary',
                    dayOfWeek: dayOfWeek,
                    label: period.label,
                    dayTemplateId: dayTemplateId || undefined,
                  });
                }

                // Process entries from this grade block (only non-break periods)
                if (p?.entry && period?.id && !p?.isBreak) {
                  const entry = p.entry;
                  // Use the entry's own gradeLevel.id - entries know which grade they belong to
                  const entryGradeLevelId = entry.gradeLevel?.id;
                  
                  // Only include entries that match the requested grade
                  // The backend returns all entries across the timetable, but we filter by grade
                  if (!entryGradeLevelId || entryGradeLevelId !== gradeId) {
                    // Skip entries that don't belong to the requested grade
                    return;
                  }

                  const subjectId = entry.subject?.id;
                  const teacherId = entry.teacher?.id;
                  const timeSlotId = period.id;
                  if (!subjectId || !teacherId) {
                    console.warn('Skipping entry due to missing subject/teacher', entry);
                    return;
                  }
                  
                  fetchedEntries.push({
                    id: entry.id,
                    gradeId: entryGradeLevelId, // Use entry's own gradeLevel.id
                    subjectId,
                    teacherId,
                    timeSlotId,
                    dayOfWeek: typeof dayOfWeek === 'number' ? dayOfWeek : 1,
                    roomNumber: entry.room?.name || undefined,
                    isDoublePeriod: false,
                    notes: undefined,
                  });
                }
              });
            });
          }

          const fetchedTimeSlots = Array.from(timeSlotMap.values());
          set((state) => ({
            timeSlots: fetchedTimeSlots,
            lastUpdated: new Date().toISOString(),
          }));
          console.log(`Loaded ${fetchedTimeSlots.length} time slots from timetableByGrade`);

          console.log(`Processed ${fetchedEntries.length} timetable entries from timetableByGrade`);
          // Update store with entries for this grade
          // Remove existing entries for this grade and add new ones
          set((state) => {
            const existingEntries = state.entries || [];
            const otherGradeEntries = existingEntries.filter((e) => e.gradeId !== gradeId);
            const newEntries = [...otherGradeEntries, ...fetchedEntries];
            
            console.log('Updating store entries:', {
              existingCount: existingEntries.length,
              otherGradeCount: otherGradeEntries.length,
              fetchedCount: fetchedEntries.length,
              newTotalCount: newEntries.length,
              gradeId,
            });
            
            const updatedState = {
              entries: newEntries,
              lastUpdated: new Date().toISOString(),
            };
            
            // Log immediately after setting
            console.log('Store updated. New entries count:', newEntries.length);
            console.log('Entries for this grade:', newEntries.filter(e => e.gradeId === gradeId).length);
            
            return updatedState;
          });
          
          // Double-check entries were persisted
          const finalState = get();
          console.log('Final verification - Store entries count:', finalState.entries.length);
          console.log('Final verification - Entries for grade', gradeId, ':', finalState.entries.filter(e => e.gradeId === gradeId).length);
        } catch (error) {
          console.error('Error loading timetable entries:', error);
          // Don't clear entries on error - keep existing ones
          throw error;
        }
      },

      loadSchoolTimetable: async (termId: string) => {
        try {
          console.log('Loading complete school timetable for term:', termId);
          
          const query = `
            query GetSchoolTimetable($input: GetSchoolTimetableInput!) {
              getSchoolTimetable(input: $input) {
                termId
                termName
                totalDays
                totalPeriods
                totalOccupiedSlots
                totalFreeSlots
                generatedAt
                timetableByGrade {
                  gradeLevel {
                    id
                    name
                    shortName
                  }
                  stream {
                    id
                    name
                  }
                  totalPeriods
                  occupiedPeriods
                  freePeriods
                  days {
                    dayTemplate {
                      id
                      dayOfWeek
                      dayName
                      startTime
                      endTime
                      periodCount
                    }
                    periods {
                      period {
                        id
                        periodNumber
                        startTime
                        endTime
                        label
                      }
                      entry {
                        id
                        subject {
                          id
                          name
                        }
                        teacher {
                          id
                          name
                          email
                        }
                        gradeLevel {
                          id
                          name
                        }
                        stream {
                          id
                        }
                        room {
                          id
                          name
                        }
                      }
                      isBreak
                      breakInfo {
                        id
                        name
                        type
                        durationMinutes
                        icon
                        color
                      }
                    }
                    gradeLevels { id name shortName }
                    streams { id name }
                    totalPeriods
                    occupiedPeriods
                    freePeriods
                  }
                }
                schedule {
                  dayTemplate {
                    id
                    dayOfWeek
                    dayName
                    startTime
                    endTime
                  }
                  gradeLevels { id name }
                  streams { id name }
                  periods {
                    period {
                      periodNumber
                      startTime
                      endTime
                    }
                    entry {
                      subject { name }
                      teacher { name }
                      room { name }
                    }
                    isBreak
                    breakInfo {
                      name
                      type
                      durationMinutes
                      icon
                      color
                    }
                  }
                }
              }
            }
          `;

          const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
            },
            credentials: 'include',
            body: JSON.stringify({
              query,
              variables: {
                input: { termId },
              },
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

          if (!result.data || !result.data.getSchoolTimetable) {
            throw new Error('Invalid response format: missing getSchoolTimetable data');
          }

          const timetableData = result.data.getSchoolTimetable;
          
          // Transform and store time slots with breaks
          const formatTime = (timeStr: string) => {
            if (!timeStr) return '';
            if (timeStr.length === 5) return timeStr;
            if (timeStr.length === 8) return timeStr.substring(0, 5);
            return timeStr;
          };

          const timeSlotMap = new Map<string, TimeSlot>();
          const allEntries: TimetableEntry[] = [];

          // Process all grades
          (timetableData.timetableByGrade || []).forEach((gradeBlock: any) => {
            const gradeId = gradeBlock.gradeLevel?.id;
            
            (gradeBlock.days || []).forEach((dayItem: any) => {
              const dayTemplate = dayItem.dayTemplate;
              const dayOfWeek = dayTemplate?.dayOfWeek;
              const dayTemplateId = dayTemplate?.id;
              
              (dayItem.periods || []).forEach((p: any) => {
                const period = p?.period;
                
                // Skip breaks - they are loaded separately via loadBreaks() from GetAllDayTemplateBreaks query
                if (p?.isBreak) {
                  return;
                }
                
                // Only collect time slots for non-break periods
                if (period?.id && !period.id.startsWith('break-') && !timeSlotMap.has(period.id)) {
                  timeSlotMap.set(period.id, {
                    id: period.id,
                    periodNumber: period.periodNumber,
                    time: `${formatTime(period.startTime)} - ${formatTime(period.endTime)}`,
                    startTime: formatTime(period.startTime),
                    endTime: formatTime(period.endTime),
                    color: 'border-l-primary',
                    dayOfWeek: dayOfWeek,
                    label: period.label || null,
                    dayTemplateId: dayTemplateId || undefined,
                  });
                }

                // Collect entries (only for non-break periods with actual entries)
                if (p?.entry && period?.id && !p?.isBreak) {
                  const entry = p.entry;
                  // Use the entry's own gradeLevel.id - entries know which grade they belong to
                  const entryGradeLevelId = entry.gradeLevel?.id;
                  
                  if (!entryGradeLevelId) {
                    console.warn('Skipping entry with missing gradeLevel:', entry.id);
                    return;
                  }
                  
                  allEntries.push({
                    id: entry.id,
                    subjectId: entry.subject?.id || '',
                    teacherId: entry.teacher?.id || '',
                    timeSlotId: period.id,
                    gradeId: entryGradeLevelId, // Use entry's own gradeLevel.id
                    dayOfWeek: dayOfWeek || 1, // Default to Monday if missing
                    roomNumber: entry.room?.name || undefined,
                  });
                }
              });
            });
          });

          // Update store with time slots and entries (breaks are loaded separately via loadBreaks())
          set((state) => ({
            timeSlots: Array.from(timeSlotMap.values()),
            entries: allEntries,
            lastUpdated: new Date().toISOString(),
            // Preserve existing breaks - they are loaded via loadBreaks() from GetAllDayTemplateBreaks query
            breaks: state.breaks,
          }));

          console.log('School timetable loaded:', {
            timeSlots: timeSlotMap.size,
            entries: allEntries.length,
          });

          return timetableData;
        } catch (error) {
          console.error('Error loading school timetable:', error);
          throw error;
        }
      },

      deleteEntriesForTerm: async (termId: string) => {
        try {
          if (!termId) {
            throw new Error('No term selected. Please select a term to delete its entries.');
          }

          const mutation = `
            mutation DeleteTimetableEntriesForTerm($termId: String!) {
              deleteTimetableEntriesForTerm(termId: $termId)
            }
          `;

          const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
            },
            credentials: 'include',
            body: JSON.stringify({ query: mutation, variables: { termId } }),
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

          // Mutation returns a string message; we just clear entries locally
          set(() => ({
            entries: [],
            lastUpdated: new Date().toISOString(),
          }));

          return result.data?.deleteTimetableEntriesForTerm as string | undefined;
        } catch (error) {
          console.error('Error deleting timetable entries for term:', error);
          throw error;
        }
      },

      deleteTimetableForTerm: async (termId: string) => {
        try {
          if (!termId) {
            throw new Error('No term selected. Please select a term to delete its timetable.');
          }

          const mutation = `
            mutation DeleteTimetableForTerm($termId: String!) {
              deleteTimetableForTerm(termId: $termId)
            }
          `;

          const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
            },
            credentials: 'include',
            body: JSON.stringify({ query: mutation, variables: { termId } }),
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

          // Clear timetable data locally
          set(() => ({
            entries: [],
            timeSlots: [],
            breaks: [],
            lastUpdated: new Date().toISOString(),
          }));

          return result.data?.deleteTimetableForTerm as string | undefined;
        } catch (error) {
          console.error('Error deleting timetable for term:', error);
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
          const newBreaks: Break[] = Object.values(result.data).map((breakItem: any) => {
            // GraphQL returns dayOfWeek as 0-indexed (0=Monday), frontend uses 1-indexed (1=Monday)
            const dayOfWeek = (breakItem.dayOfWeek ?? 0) + 1;
            
            // Map GraphQL enum to frontend type
            const typeMap: Record<string, 'short_break' | 'lunch' | 'assembly'> = {
              'SHORT_BREAK': 'short_break',
              'LUNCH': 'lunch',
              'ASSEMBLY': 'assembly',
            };
            const breakType: 'short_break' | 'lunch' | 'assembly' = typeMap[breakItem.type] || 'short_break';
            
            return {
              id: breakItem.id,
              name: breakItem.name,
              type: breakType,
              dayOfWeek,
              afterPeriod: breakItem.afterPeriod,
              durationMinutes: breakItem.durationMinutes,
              icon: breakItem.icon || '☕',
              color: breakItem.color || 'bg-blue-500',
            } as Break;
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

      createAllBreaksForTemplate: async (breaksInput) => {
        try {
          const response = await fetch('/api/school/break', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(breaksInput),
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

          const newBreaks: Break[] = Object.values(result.data).map((breakItem: any) => {
            const dayOfWeek = typeof breakItem.dayOfWeek === 'number' ? (breakItem.dayOfWeek + 1) : 1;
            const typeMap: Record<string, Break['type']> = {
              'SHORT_BREAK': 'short_break',
              'LUNCH': 'lunch',
              'ASSEMBLY': 'assembly',
              'LONG_BREAK': 'long_break',
              'TEA_BREAK': 'afternoon_break',
              'RECESS': 'recess',
              'SNACK_BREAK': 'snack',
              'GAMES_BREAK': 'games',
            };
            const mappedType = typeMap[breakItem.type] || 'short_break';

            return {
              id: breakItem.id,
              name: breakItem.name,
              type: mappedType as Break['type'],
              dayOfWeek,
              afterPeriod: breakItem.afterPeriod,
              durationMinutes: breakItem.durationMinutes,
              icon: breakItem.icon || '☕',
              color: breakItem.color || 'bg-blue-500',
              applyToAllDays: breakItem.applyToAllDays,
            } as Break;
          });

          set((state) => ({
            breaks: [...state.breaks, ...newBreaks],
            lastUpdated: new Date().toISOString(),
          }));
        } catch (error) {
          console.error('Error creating all breaks:', error);
          throw error;
        }
      },

      loadBreaks: async () => {
        try {
          const query = `
            query GetAllDayTemplateBreaks {
              getAllDayTemplateBreaks {
                id
                name
                type
                afterPeriod
                durationMinutes
                icon
                color
                applyToAllDays
                dayTemplateId
                dayTemplate {
                  id
                  dayOfWeek
                  startTime
                }
              }
            }
          `;

          const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ query }),
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

          if (!result.data || !result.data.getAllDayTemplateBreaks) {
            throw new Error('Invalid response format: missing getAllDayTemplateBreaks data');
          }

          // Convert response to Break format and update store
          const fetchedBreaks = result.data.getAllDayTemplateBreaks.map((breakItem: any) => {
            // Get dayOfWeek from dayTemplate if available, otherwise use 1 as default
            const dayOfWeek = breakItem.dayTemplate?.dayOfWeek || 1;
            
            // Map GraphQL enum to frontend type
            const typeMap: Record<string, string> = {
              'SHORT_BREAK': 'short_break',
              'LONG_BREAK': 'long_break',
              'LUNCH': 'lunch',
              'ASSEMBLY': 'assembly',
              'RECESS': 'recess',
              'SNACK_BREAK': 'snack',
              'TEA_BREAK': 'afternoon_break',
              'GAMES': 'games',
            };
            const breakType = typeMap[breakItem.type] || breakItem.type.toLowerCase();
            
            return {
              id: breakItem.id,
              name: breakItem.name,
              type: breakType,
              dayOfWeek,
              afterPeriod: breakItem.afterPeriod,
              durationMinutes: breakItem.durationMinutes,
              icon: breakItem.icon || '☕',
              color: breakItem.color || '#3B82F6',
              dayTemplateId: breakItem.dayTemplateId || null,
              applyToAllDays: breakItem.applyToAllDays || false,
            };
          });

          set((state) => ({
            breaks: fetchedBreaks,
            lastUpdated: new Date().toISOString(),
          }));

          console.log('Loaded breaks:', fetchedBreaks.length);
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

      deleteBreak: async (id: string) => {
        try {
          // First check if the break exists and has a day template association
          const state = get();
          const breakToDelete = state.breaks.find(b => b.id === id);
          
          console.log('Attempting to delete break:', {
            id,
            breakFound: !!breakToDelete,
            breakDetails: breakToDelete ? {
              name: breakToDelete.name,
              dayTemplateId: breakToDelete.dayTemplateId,
              dayOfWeek: breakToDelete.dayOfWeek,
              afterPeriod: breakToDelete.afterPeriod,
            } : null,
          });
          
          if (!breakToDelete) {
            throw new Error('Break not found in store');
          }
          
          if (!breakToDelete.dayTemplateId) {
            throw new Error('Cannot delete break: Break is not associated with a day template. This break may be orphaned and needs to be fixed or deleted from the database directly.');
          }

          const mutation = `
            mutation DeleteDayTemplateBreak($id: ID!) {
              deleteDayTemplateBreak(id: $id) {
                success
                message
              }
            }
          `;

          console.log('Sending delete mutation for break ID:', id);

          const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
            },
            credentials: 'include',
            body: JSON.stringify({
              query: mutation,
              variables: { id },
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('HTTP error response:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
          }

          const result = await response.json();
          console.log('Delete break response:', result);

          if (result.errors) {
            const errors = result.errors.map((e: any) => ({
              message: e.message,
              code: e.extensions?.code,
              path: e.path,
            }));
            console.error('GraphQL errors:', errors);
            
            // Handle specific error types
            const errorMessages = result.errors.map((e: any) => e.message).join(', ');
            if (errorMessages.includes('INTERNAL_SERVER_ERROR')) {
              throw new Error('Server error while deleting break. This may be due to database constraints or related records. Check server logs for details.');
            }
            
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data?.deleteDayTemplateBreak?.success) {
            const errorMsg = result.data?.deleteDayTemplateBreak?.message || 'Failed to delete break';
            console.error('Deletion failed:', errorMsg);
            throw new Error(errorMsg);
          }

          // Remove break from store
          set((state) => ({
            breaks: state.breaks.filter((breakItem) => breakItem.id !== id),
            lastUpdated: new Date().toISOString(),
          }));

          console.log('Break deleted successfully:', result.data.deleteDayTemplateBreak.message);
        } catch (error) {
          console.error('Error deleting break:', error);
          throw error;
        }
      },

      deleteAllBreaks: async () => {
        try {
          const mutation = `
            mutation DeleteAllTimetableBreaks {
              deleteAllTimetableBreaks
            }
          `;

          const response = await fetch('/api/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
            },
            credentials: 'include',
            body: JSON.stringify({
              query: mutation,
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

          // Check if deletion was successful
          if (result.data?.deleteAllTimetableBreaks) {
            // Clear all breaks from store
            set((state) => ({
              breaks: [],
              lastUpdated: new Date().toISOString(),
            }));
            
            console.log('All breaks deleted successfully');
          } else {
            throw new Error('Failed to delete all breaks');
          }
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
        // Breaks are not cached - always loaded fresh from backend
        timeSlots: state.timeSlots,
        subjects: state.subjects,
        teachers: state.teachers,
        grades: state.grades,
        entries: state.entries,
        lastUpdated: state.lastUpdated,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, check if we need to preserve fresh entries
        if (state) {
          console.log('Store rehydrated. Entries count:', state.entries.length);
          // Clear breaks on rehydration - they should always be loaded fresh from backend
          state.breaks = [];
        }
      },
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
    enrichEntry: (entry: TimetableEntry) => {
      const subject = store.subjects.find((s) => s.id === entry.subjectId);
      const teacher = store.teachers.find((t) => t.id === entry.teacherId);
      const timeSlot = store.timeSlots.find((ts) => ts.id === entry.timeSlotId);
      const grade = store.grades.find((g) => g.id === entry.gradeId);

      // If any required data is missing, log a warning but still return the entry
      if (!subject || !teacher || !timeSlot || !grade) {
        console.warn('Missing data for entry:', {
          entryId: entry.id,
          hasSubject: !!subject,
          hasTeacher: !!teacher,
          hasTimeSlot: !!timeSlot,
          hasGrade: !!grade,
          subjectId: entry.subjectId,
          teacherId: entry.teacherId,
          timeSlotId: entry.timeSlotId,
          gradeId: entry.gradeId,
        });
      }

      return {
        ...entry,
        subject: subject || { id: entry.subjectId, name: 'Unknown Subject' } as any,
        teacher: teacher || { id: entry.teacherId, name: 'Unknown Teacher', firstName: '', lastName: '', subjects: [] } as any,
        timeSlot: timeSlot || { id: entry.timeSlotId, periodNumber: 0, time: 'Unknown', startTime: '', endTime: '', color: '' } as any,
        grade: grade || { id: entry.gradeId, name: 'Unknown Grade', level: 0 } as any,
      };
    },
  };
};

