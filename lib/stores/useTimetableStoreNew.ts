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
  loadTimeSlots: (termId?: string) => Promise<void>;
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

      loadTimeSlots: async (termIdParam?: string) => {
        try {
          // Get termId from parameter, state, or throw error
          const state = get();
          const termId = termIdParam || state.selectedTermId;
          
          if (!termId) {
            throw new Error('No term selected. Please select a term first or pass termId as a parameter to loadTimeSlots().');
          }

          // Use getWholeSchoolTimetable to get time slots (same as loadEntries)
          const query = `
            query GetWholeSchoolTimetable($termId: String!) {
              getWholeSchoolTimetable(termId: $termId) {
                timeSlots {
                  id
                  periodNumber
                  displayTime
                  startTime
                  endTime
                  color
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
              variables: { termId },
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

          if (!result.data || !result.data.getWholeSchoolTimetable) {
            throw new Error('Invalid response format: missing getWholeSchoolTimetable data');
          }

          // Convert response to TimeSlot format and update store
          const formatTime = (timeStr: string) => {
            if (!timeStr) return '';
            if (timeStr.length === 5) return timeStr;
            if (timeStr.length === 8) return timeStr.substring(0, 5);
            return timeStr;
          };

          const fetchedTimeSlots = (result.data.getWholeSchoolTimetable.timeSlots || []).map((slot: any) => ({
            id: slot.id,
            periodNumber: slot.periodNumber,
            time: slot.displayTime || `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`,
            startTime: formatTime(slot.startTime),
            endTime: formatTime(slot.endTime),
            color: slot.color || 'border-l-primary'
          }));

          set((state) => ({
            timeSlots: fetchedTimeSlots,
            lastUpdated: new Date().toISOString(),
          }));

          console.log(`Loaded ${fetchedTimeSlots.length} time slots using getWholeSchoolTimetable`);
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
            query GetWholeSchoolTimetable($termId: String!) {
              getWholeSchoolTimetable(termId: $termId) {
                timeSlots {
                  id
                  periodNumber
                  displayTime
                  startTime
                  endTime
                  color
                }
                entries {
                  id
                  gradeId
                  subjectId
                  teacherId
                  timeSlotId
                  dayOfWeek
                  roomNumber
                  grade {
                    id
                    name
                    gradeLevel {
                      name
                    }
                  }
                  subject {
                    id
                    name
                  }
                  teacher {
                    id
                    fullName
                    firstName
                    lastName
                    email
                    phoneNumber
                    gender
                    department
                    role
                    isActive
                    user {
                      id
                      name
                    }
                  }
                  timeSlot {
                    id
                    periodNumber
                    displayTime
                    startTime
                    endTime
                    color
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
                termId,
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

          if (!result.data || !result.data.getWholeSchoolTimetable) {
            console.error('Invalid response format:', result);
            throw new Error('Invalid response format: missing getWholeSchoolTimetable data');
          }

          const timetableData = result.data.getWholeSchoolTimetable;
          
          // Extract and store time slots if available
          if (timetableData.timeSlots && timetableData.timeSlots.length > 0) {
            const formatTime = (timeStr: string) => {
              if (!timeStr) return '';
              if (timeStr.length === 5) return timeStr;
              if (timeStr.length === 8) return timeStr.substring(0, 5);
              return timeStr;
            };

            const fetchedTimeSlots = timetableData.timeSlots.map((slot: any) => ({
              id: slot.id,
              periodNumber: slot.periodNumber,
              time: slot.displayTime || `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`,
              startTime: formatTime(slot.startTime),
              endTime: formatTime(slot.endTime),
              color: slot.color || 'border-l-primary'
            }));

            set((state) => ({
              timeSlots: fetchedTimeSlots,
              lastUpdated: new Date().toISOString(),
            }));

            console.log(`Loaded ${fetchedTimeSlots.length} time slots from getWholeSchoolTimetable`);
          }

          // Filter entries by gradeId
          const allEntries = timetableData.entries || [];
          const entriesData = allEntries.filter((entry: any) => entry.gradeId === gradeId);
          
          console.log(`Filtered ${entriesData.length} entries for grade ${gradeId} from ${allEntries.length} total entries`);
          console.log(`Fetched ${entriesData.length} timetable entries from API`);

          // Get current state to match teachers by name if needed
          const state = get();
          const { teachers: allTeachers } = state;

          // Convert response to TimetableEntry format
          const fetchedEntries: TimetableEntry[] = entriesData
            .map((entry: any) => {
              // Use teacherId directly from entry (new structure provides it)
              // Fallback to teacher.id if teacherId is not available
              const teacherId = entry.teacherId || entry.teacher?.id;
              
              if (!teacherId) {
                console.warn(`Skipping entry ${entry.id} - no valid teacher ID found. Teacher data:`, entry.teacher);
                return null;
              }

              return {
                id: entry.id,
                gradeId: entry.gradeId || entry.grade?.id,
                subjectId: entry.subjectId || entry.subject?.id,
                teacherId: teacherId,
                timeSlotId: entry.timeSlotId || entry.timeSlot?.id,
                dayOfWeek: entry.dayOfWeek,
                roomNumber: entry.roomNumber || undefined,
                isDoublePeriod: false, // Default, can be updated if API provides this
                notes: undefined, // Default, can be updated if API provides this
              };
            })
            .filter((entry: TimetableEntry | null): entry is TimetableEntry => entry !== null);

          console.log(`Processed ${fetchedEntries.length} timetable entries (filtered from ${entriesData.length} total)`);

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
      onRehydrateStorage: () => (state) => {
        // After rehydration, check if we need to preserve fresh entries
        if (state) {
          console.log('Store rehydrated. Entries count:', state.entries.length);
          // Don't clear entries on rehydration - let loadEntries handle it
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

