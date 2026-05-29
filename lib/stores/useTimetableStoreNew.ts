// lib/stores/useTimetableStoreNew.ts
import { timetableBlockMatchesScope } from "@/lib/utils/timetable-setup";
// NEW: Clean store with normalized data structure

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { TimeSlotInput } from "../hooks/useTimeSlots";
import type {
  TimetableData,
  TimetableUIState,
  TimetableEntry,
  CreateEntryRequest,
  TimeSlot,
  Break,
} from "../types/timetable";
import { useSchoolConfigStore } from "./useSchoolConfigStore";
import { breakGraphQLToStoreType } from "@/lib/utils/timetable-break-types";
import {
  extractTimeSlotsFromTimetableData,
  uniquePeriodNumbers,
} from "@/app/school/[subdomain]/(pages)/timetable/utils/timetableSlots";

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
  updateWeekTemplate: (input: {
    id: string;
    defaultStartTime?: string;
  }) => Promise<any>;
  updateDayTemplate: (input: {
    dayTemplateId: string;
    periodCount?: number;
    startTime?: string;
    defaultPeriodDuration?: number;
  }) => Promise<any>;
  rebuildWeekTemplatePeriods: (input: {
    id: string;
    startTime: string;
    periodCount: number;
    periodDuration: number;
    force?: boolean;
  }) => Promise<any>;
  addPeriodsToDayTemplate: (
    dayTemplateId: string,
    extraPeriods: number,
  ) => Promise<any[]>;
  updateDayTemplatePeriod: (
    periodId: string,
    input: { startTime?: string; endTime?: string; label?: string },
  ) => Promise<void>;
  resetDayTemplatePeriods: (input: {
    dayTemplateId: string;
    startTime?: string;
    periodCount?: number;
    periodDuration?: number;
  }) => Promise<void>;
  loadTimeSlots: (termId?: string, gradeId?: string) => Promise<void>;
  loadDayTemplatePeriods: (
    dayTemplateId?: string,
    gradeId?: string,
  ) => Promise<void>;
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
  deleteTimetableEntry: (entryId: string) => Promise<void>;
  deleteEntriesForTerm: (termId: string) => Promise<string | undefined>;
  deleteTimetableForTerm: (termId: string) => Promise<string | undefined>;
  loadSchoolTimetable: (
    termId: string,
    options?: { gradeLevelId?: string; streamId?: string | null },
  ) => Promise<any>;

  // Break actions
  addBreak: (breakData: Omit<Break, "id">) => Break;
  createBreaks: (breaks: Omit<Break, "id">[]) => Promise<void>;
  createAllBreaksForTemplate: (
    breaks: Array<{
      dayTemplateId: string;
      name: string;
      type: string;
      afterPeriod: number;
      durationMinutes: number;
      icon?: string;
      color?: string;
      applyToAllDays?: boolean;
    }>,
  ) => Promise<void>;
  loadBreaks: () => Promise<void>;
  updateBreak: (id: string, updates: Partial<Break>) => void;
  deleteBreak: (id: string) => Promise<void>;
  deleteAllBreaks: () => Promise<void>;
  deleteAllBreaksByTerm: (termId: string) => Promise<{
    success: boolean;
    deletedBreaksCount: number;
    recalculatedDaysCount: number;
    message: string;
  }>;
  deleteBreaksByType: (
    termId: string,
    breakType: string,
  ) => Promise<{
    success: boolean;
    breakType: string;
    deletedBreaksCount: number;
    recalculatedDaysCount: number;
    message: string;
  }>;

  // Bulk actions
  bulkSetSchedule: (timeSlots: TimeSlot[], breaks: Break[]) => void;
  bulkCreateEntries: (
    termId: string,
    gradeId: string,
    entries: CreateEntryRequest[],
  ) => Promise<void>;

  loadMockData: () => void;

  // Actions for UI state
  setSelectedGrade: (gradeId: string | null) => void;
  setSelectedStream: (streamId: string | null) => void;
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
  periodNumbers: [],
  daysPerWeek: 5,
  conflicts: [],
  knownRoomNumbers: [],
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
      selectedStreamId: null,
      selectedTermId: null,
      searchTerm: "",
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
            entry.id === id ? { ...entry, ...updates } : entry,
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

      deleteTimetableEntry: async (entryId: string) => {
        try {
          const mutation = `
            mutation DeleteEntry {
              deleteTimetableEntry(id: "${entryId}")
            }
          `;

          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ query: mutation }),
          });

          const result = await response.json();

          if (result.errors) {
            throw new Error(
              result.errors[0]?.message || "Failed to delete entry",
            );
          }

          if (result.data?.deleteTimetableEntry !== true) {
            throw new Error("Delete entry returned unexpected response");
          }

          // Remove from local store
          set((state) => ({
            entries: state.entries.filter((entry) => entry.id !== entryId),
            lastUpdated: new Date().toISOString(),
          }));
        } catch (error) {
          console.error("Error deleting timetable entry:", error);
          throw error;
        }
      },

      updateTimeSlot: (id: string, updates: Partial<TimeSlot>) => {
        set((state) => ({
          timeSlots: state.timeSlots.map((slot) =>
            slot.id === id ? { ...slot, ...updates } : slot,
          ),
          lastUpdated: new Date().toISOString(),
        }));
      },

      // GraphQL time slot actions - directly call API
      createTimeSlots: async (timeSlots: TimeSlotInput[]) => {
        try {
          const response = await fetch("/api/school/time-slot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(timeSlots),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data) {
            throw new Error("Invalid response format: missing data");
          }

          // Convert response to TimeSlot format and update store
          const newTimeSlots = Object.values(result.data).map((slot: any) => ({
            id: slot.id,
            periodNumber: slot.periodNumber,
            time: slot.displayTime || `${slot.startTime} - ${slot.endTime}`,
            startTime: slot.startTime || "",
            endTime: slot.endTime || "",
            color: slot.color || "border-l-primary",
          }));

          set((state) => ({
            timeSlots: [...state.timeSlots, ...newTimeSlots],
            lastUpdated: new Date().toISOString(),
          }));
        } catch (error) {
          console.error("Error creating time slots:", error);
          throw error;
        }
      },

      createTimeSlot: async (timeSlot: TimeSlotInput) => {
        return get().createTimeSlots([timeSlot]);
      },

      createDayTemplates: async (templates: DayTemplateInput[]) => {
        try {
          const response = await fetch("/api/school/time-slot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(templates),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data) {
            throw new Error("Invalid response format: missing data");
          }
        } catch (error) {
          console.error("Error creating day templates:", error);
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

          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            credentials: "include",
            body: JSON.stringify({
              query: mutation,
              variables: { input },
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data || !result.data.createWeekTemplate) {
            throw new Error(
              "Invalid response format: missing createWeekTemplate data",
            );
          }

          return result.data.createWeekTemplate;
        } catch (error) {
          console.error("Error creating week template:", error);
          throw error;
        }
      },

      loadWeekTemplates: async (includeDetails = false) => {
        try {
          console.log(
            "Loading week templates with includeDetails:",
            includeDetails,
          );

          const query = `
            query GetWeekTemplates($input: GetWeekTemplatesInput!) {
              getWeekTemplates(input: $input) {
                id
                name
                numberOfDays
                termId
                ${
                  includeDetails
                    ? `
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
                `
                    : ""
                }
              }
            }
          `;

          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            credentials: "include",
            body: JSON.stringify({
              query,
              variables: { input: { includeDetails } },
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data || !result.data.getWeekTemplates) {
            throw new Error(
              "Invalid response format: missing getWeekTemplates data",
            );
          }

          return result.data.getWeekTemplates;
        } catch (error) {
          console.error("Error loading week templates:", error);
          throw error;
        }
      },

      updateWeekTemplate: async (input: {
        id: string;
        defaultStartTime?: string;
      }) => {
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

          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            credentials: "include",
            body: JSON.stringify({
              query: mutation,
              variables: { input },
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data || !result.data.updateWeekTemplate) {
            throw new Error(
              "Invalid response format: missing updateWeekTemplate data",
            );
          }

          return result.data.updateWeekTemplate;
        } catch (error) {
          console.error("Error updating week template:", error);
          throw error;
        }
      },

      updateDayTemplate: async (input: {
        dayTemplateId: string;
        periodCount?: number;
        startTime?: string;
        defaultPeriodDuration?: number;
      }) => {
        try {
          const mutation = `
            mutation UpdateDayTemplate($input: UpdateDayTemplateInput!) {
              updateDayTemplate(input: $input) {
                id
                startTime
                periodCount
                defaultPeriodDuration
                periods {
                  id
                  periodNumber
                  startTime
                  endTime
                }
              }
            }
          `;

          const variables: any = {
            input: {
              dayTemplateId: input.dayTemplateId,
            },
          };
          if (input.periodCount !== undefined)
            variables.input.periodCount = input.periodCount;
          if (input.startTime !== undefined)
            variables.input.startTime = input.startTime;
          if (input.defaultPeriodDuration !== undefined)
            variables.input.defaultPeriodDuration = input.defaultPeriodDuration;

          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            credentials: "include",
            body: JSON.stringify({
              query: mutation,
              variables,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          return result.data?.updateDayTemplate || null;
        } catch (error) {
          console.error("Error updating day template:", error);
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
              $id: ID!
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

          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            credentials: "include",
            body: JSON.stringify({
              query: mutation,
              variables: input,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data || !result.data.rebuildWeekTemplatePeriods) {
            throw new Error(
              "Invalid response format: missing rebuildWeekTemplatePeriods data",
            );
          }

          return result.data.rebuildWeekTemplatePeriods;
        } catch (error) {
          console.error("Error rebuilding week template periods:", error);
          throw error;
        }
      },

      addPeriodsToDayTemplate: async (
        dayTemplateId: string,
        extraPeriods: number,
      ) => {
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

          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            credentials: "include",
            body: JSON.stringify({
              query: mutation,
              variables: { dayTemplateId, extraPeriods },
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data || !result.data.addPeriodsToDayTemplate) {
            throw new Error(
              "Invalid response format: missing addPeriodsToDayTemplate data",
            );
          }

          // Refresh periods to pull in dayOfWeek mapping
          await get().loadDayTemplatePeriods();

          return result.data.addPeriodsToDayTemplate;
        } catch (error) {
          console.error("Error adding periods to day template:", error);
          throw error;
        }
      },

      updateDayTemplatePeriod: async (
        periodId: string,
        input: { startTime?: string; endTime?: string; label?: string },
      ) => {
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

          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            credentials: "include",
            body: JSON.stringify({
              query: mutation,
              variables: { periodId, input },
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data || !result.data.updateDayTemplatePeriod) {
            throw new Error(
              "Invalid response format: missing updateDayTemplatePeriod data",
            );
          }

          // Refresh periods to include latest changes
          await get().loadDayTemplatePeriods();
        } catch (error) {
          console.error("Error updating day template period:", error);
          throw error;
        }
      },

      resetDayTemplatePeriods: async (input: {
        dayTemplateId: string;
        startTime?: string;
        periodCount?: number;
        periodDuration?: number;
      }) => {
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

          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            credentials: "include",
            body: JSON.stringify({
              query: mutation,
              variables: { input },
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data || !result.data.resetDayTemplatePeriods) {
            throw new Error(
              "Invalid response format: missing resetDayTemplatePeriods data",
            );
          }

          // Refresh periods to reflect new schedule
          await get().loadDayTemplatePeriods();
        } catch (error) {
          console.error("Error resetting day template periods:", error);
          throw error;
        }
      },

      loadDayTemplatePeriods: async (
        dayTemplateIdParam?: string,
        gradeIdParam?: string,
      ) => {
        try {
          // Fetch templates first to map dayTemplateId -> dayOfWeek
          let templates: any[] = [];
          try {
            templates = await get().loadDayTemplates();
          } catch (err) {
            console.warn(
              "Could not load day templates, continuing without:",
              err,
            );
            templates = [];
          }

          const templateDayMap = new Map<string, number>();
          templates.forEach((t: any) => {
            if (t?.id && typeof t.dayOfWeek === "number") {
              templateDayMap.set(t.id, t.dayOfWeek);
            }
          });

          let templateIds = dayTemplateIdParam
            ? [dayTemplateIdParam]
            : templates.map((t: any) => t.id).filter(Boolean);

          if (templateIds.length === 0) {
            console.log(
              "No day templates available — timeSlots will remain empty.",
            );
            // Don't throw; just leave timeSlots as-is.
            return;
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

          const formatTime = (timeStr: string) => {
            if (!timeStr) return "";
            if (timeStr.length === 5) return timeStr;
            if (timeStr.length === 8) return timeStr.substring(0, 5);
            return timeStr;
          };

          // Fetch periods from matching day templates in parallel
          const allPeriodsResults = await Promise.allSettled(
            templateIds.map(async (templateId) => {
              const response = await fetch("/api/graphql", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Cache-Control": "no-cache",
                  Pragma: "no-cache",
                },
                credentials: "include",
                body: JSON.stringify({
                  query,
                  variables: { dayTemplateId: templateId },
                }),
              });

              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                  `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
                );
              }

              const result = await response.json();

              if (result.errors) {
                const errorMessages = result.errors
                  .map((e: any) => e.message)
                  .join(", ");
                throw new Error(`GraphQL errors: ${errorMessages}`);
              }

              const periodsData =
                result.data?.getAllDayTemplatePeriods1 ||
                result.data?.getAllDayTemplatePeriods ||
                null;

              return periodsData || [];
            }),
          );

          // Keep every period row — each day template has its own period ids.
          const seenPeriodIds = new Set<string>();
          const allSlots: TimeSlot[] = [];

          allPeriodsResults.forEach((r) => {
            if (r.status === "fulfilled" && Array.isArray(r.value)) {
              r.value.forEach((p: any) => {
                if (!p?.periodNumber || !p?.id || seenPeriodIds.has(p.id))
                  return;
                seenPeriodIds.add(p.id);
                allSlots.push({
                  id: p.id,
                  periodNumber: p.periodNumber,
                  time: `${formatTime(p.startTime)} - ${formatTime(p.endTime)}`,
                  startTime: formatTime(p.startTime),
                  endTime: formatTime(p.endTime),
                  color: "border-l-primary",
                  dayOfWeek: templateDayMap.get(p.dayTemplateId),
                  label: p.label,
                  dayTemplateId: p.dayTemplateId,
                });
              });
            }
          });

          // Sort by period number for consistent display
          allSlots.sort((a, b) => a.periodNumber - b.periodNumber);

          // Only update timeSlots if we actually fetched some periods.
          // If all fetches failed (allSlots is empty), keep whatever is
          // already in the store so the grid doesn't flip back to the wizard.
          if (allSlots.length > 0) {
            const lessonPeriodsPerDay = Math.max(
              0,
              ...allSlots.map((s) => s.periodNumber || 0),
            );
            set((state) => ({
              timeSlots: allSlots,
              periodNumbers: [
                ...new Set(allSlots.map((s) => s.periodNumber)),
              ].sort((a, b) => a - b),
              lessonPeriodsPerDay: Math.max(
                state.lessonPeriodsPerDay ?? 0,
                lessonPeriodsPerDay,
              ),
              lastUpdated: new Date().toISOString(),
            }));
          } else if (gradeIdParam) {
            set({
              timeSlots: [],
              periodNumbers: [],
              lessonPeriodsPerDay: 0,
              lastUpdated: new Date().toISOString(),
            });
          } else {
            console.warn(
              "No periods fetched from any day template — keeping existing timeSlots.",
            );
          }
        } catch (error) {
          console.error("Error loading day template periods:", error);
          // Don't rethrow — let the caller decide how to handle
          // The UI will show whatever timeSlots are already in the store.
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
                gradeLevels {
                  id
                  gradeLevel {
                    name
                  }
                }
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

          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            credentials: "include",
            body: JSON.stringify({ query }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data || !result.data.getAllDayTemplates) {
            throw new Error(
              "Invalid response format: missing getAllDayTemplates data",
            );
          }

          return result.data.getAllDayTemplates;
        } catch (error) {
          console.error("Error loading day templates:", error);
          throw error;
        }
      },

      loadTimeSlots: async (_termIdParam?: string, gradeIdParam?: string) => {
        try {
          const gradeId = gradeIdParam ?? get().selectedGradeId ?? undefined;
          await get().loadDayTemplatePeriods(undefined, gradeId);
        } catch (error) {
          console.error("Error loading time slots:", error);
          // Don't throw; the UI handles missing timeSlots via the setup wizard.
        }
      },

      deleteTimeSlot: async (id: string) => {
        try {
          const response = await fetch(
            `/api/school/time-slot?id=${encodeURIComponent(id)}`,
            {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
            },
          );

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          // Check if deletion was successful
          if (
            result.data?.deleteTimeSlot !== true &&
            result.data?.deleteTimeSlot !== false
          ) {
            // If the mutation isn't implemented, still remove from local store
            if (result.featureNotAvailable) {
              console.warn(
                "Time slot delete mutation not available on server, removing from local store only",
              );
            } else {
              throw new Error(
                "Invalid response format: deleteTimeSlot result missing",
              );
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
          console.error("Error deleting time slot:", error);
          throw error;
        }
      },

      deleteAllTimeSlots: async () => {
        try {
          const response = await fetch("/api/school/time-slot?all=true", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          // Check if deletion was successful
          if (
            result.data?.deleteAllTimeSlots !== true &&
            result.data?.deleteAllTimeSlots !== false
          ) {
            // If the mutation isn't implemented, still remove from local store
            if (result.featureNotAvailable) {
              console.warn(
                "Delete all time slots mutation not available on server, removing from local store only",
              );
            } else {
              throw new Error(
                "Invalid response format: deleteAllTimeSlots result missing",
              );
            }
          }

          // Clear all time slots from store and remove entries that reference them
          set((state) => {
            const timeSlotIds = new Set(state.timeSlots.map((slot) => slot.id));
            return {
              timeSlots: [],
              // Also remove any entries that reference any timeslot
              entries: state.entries.filter(
                (entry) => !timeSlotIds.has(entry.timeSlotId),
              ),
              lastUpdated: new Date().toISOString(),
            };
          });
        } catch (error) {
          console.error("Error deleting all time slots:", error);
          throw error;
        }
      },

      loadGrades: async () => {
        try {
          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `
                query GradeLevelsForSchoolType {
                  gradeLevelsForSchoolType {
                    id
                    isActive
                    shortName
                    sortOrder
                    tenantStreams {
                      id
                      stream {
                        id
                        name
                      }
                    }
                    gradeLevel {
                      id
                      name
                    }
                  }
                }
              `,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data || !result.data.gradeLevelsForSchoolType) {
            throw new Error(
              "Invalid response format: missing gradeLevelsForSchoolType data",
            );
          }

          // Convert response to Grade format and update store
          // IMPORTANT: Use gradeLevel.id as the grade ID to match entry.gradeLevel.id from timetable entries
          const fetchedGrades = result.data.gradeLevelsForSchoolType
            .filter((item: any) => item.isActive) // Only include active grades
            .map((item: any) => {
              // Extract level number from name (e.g., "Grade 7" -> 7, "Form 1" -> 1)
              const name = item.gradeLevel?.name || item.shortName || "Unknown";
              const levelMatch = name.match(/\d+/);
              const level = levelMatch
                ? parseInt(levelMatch[0], 10)
                : item.sortOrder || 0;

              const streams = (item.tenantStreams ?? [])
                .filter(
                  (ts: { id?: string; stream?: { name?: string } }) =>
                    ts.id && ts.stream?.name,
                )
                .map((ts: { id: string; stream: { name: string } }) => ({
                  tenantStreamId: ts.id,
                  name: ts.stream.name,
                }));

              return {
                // Use gradeLevel.id to match entries which use entry.gradeLevel.id
                id: item.gradeLevel?.id || item.id,
                tenantGradeLevelId: item.id, // Keep tenant ID for reference
                name: name,
                level: level,
                displayName: item.shortName || name,
                streams,
              };
            })
            .sort((a: any, b: any) => a.level - b.level); // Sort by level

          console.log("Grades loaded:", {
            count: fetchedGrades.length,
            grades: fetchedGrades.map((g: any) => ({
              id: g.id,
              name: g.name,
              displayName: g.displayName,
              tenantGradeLevelId: g.tenantGradeLevelId,
            })),
          });

          set((state) => ({
            grades: fetchedGrades,
            lastUpdated: new Date().toISOString(),
          }));
        } catch (error) {
          console.error("Error loading grades:", error);
          throw error;
        }
      },

      loadSubjects: async (gradeId?: string) => {
        try {
          // Load subjects from backend GraphQL API (tenantSubjects) to get correct backend IDs
          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
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
            console.error("GraphQL errors loading subjects:", result.errors);
            throw new Error(
              `GraphQL errors: ${result.errors.map((e: any) => e.message).join(", ")}`,
            );
          }

          // Extract subjects from tenantSubjects - use tenantSubject.id (the assignment ID)
          const tenantSubjects = result.data?.tenantSubjects || [];
          const subjectsMap = new Map<string, any>();

          tenantSubjects.forEach((tenantSubject: any) => {
            // Use the actual subject (either subject or customSubject) for name/code/etc.
            const actualSubject =
              tenantSubject.subject || tenantSubject.customSubject;
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
                  code: actualSubject.code || actualSubject.shortName || "",
                  color: undefined,
                  department:
                    actualSubject.department || actualSubject.category || "",
                  // Store the underlying subject ID for reference if needed
                  _subjectId: actualSubject.id,
                });
              }
            } else {
              console.warn(
                "TenantSubject missing subject or customSubject:",
                tenantSubject,
              );
            }
          });

          const fetchedSubjects = Array.from(subjectsMap.values());
          console.log(
            "Loaded subjects from backend:",
            fetchedSubjects.length,
            "subjects",
          );
          console.log(
            "Sample tenantSubject IDs (first 3):",
            fetchedSubjects.slice(0, 3).map((s) => ({
              tenantSubjectId: s.id, // This is the tenantSubject.id (assignment ID)
              name: s.name,
              code: s.code,
              underlyingSubjectId: s._subjectId, // The actual subject.id for reference
            })),
          );

          set((state) => ({
            subjects: fetchedSubjects,
            lastUpdated: new Date().toISOString(),
          }));
        } catch (error) {
          console.error("Error loading subjects:", error);
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
              console.warn(
                "Using fallback subjects from school config:",
                fallbackSubjects.length,
              );
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
          console.log("Loading teachers from /api/school/teacher...");
          const response = await fetch("/api/school/teacher", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });

          console.log("Teachers API response status:", response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error("Teachers API error response:", errorText);
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();
          console.log("Teachers API response:", result);

          // Handle error responses from API
          if (result.error) {
            console.error("API returned error:", result.error);
            // If feature not available, set empty array instead of throwing
            if (result.featureNotAvailable) {
              console.warn("Teachers feature not available, using empty array");
              set((state) => ({
                teachers: [],
                lastUpdated: new Date().toISOString(),
              }));
              return;
            }
            throw new Error(result.error);
          }

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            console.error("GraphQL errors:", errorMessages);
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data || !result.data.getTeachers) {
            console.error("Invalid response format:", result);
            throw new Error(
              "Invalid response format: missing getTeachers data",
            );
          }

          const teachersData = result.data.getTeachers;
          console.log(`Fetched ${teachersData.length} teachers`);

          // Convert response to Teacher format and update store
          const fetchedTeachers = teachersData
            .filter((teacher: any) => {
              // Filter out teachers with no user (they can't be assigned)
              // But keep teachers with user: null if they have subjects
              return (
                teacher.user !== null ||
                (teacher.tenantSubjects && teacher.tenantSubjects.length > 0)
              );
            })
            .map((teacher: any) => {
              // Parse name into firstName and lastName
              const fullName =
                teacher.user?.name || `Teacher ${teacher.id.slice(-6)}`;
              const nameParts = fullName.trim().split(/\s+/);
              const firstName = nameParts[0] || "";
              const lastName = nameParts.slice(1).join(" ") || "";

              // Extract subject names from tenantSubjects (remove duplicates)
              const subjectNames = Array.from(
                new Set(
                  teacher.tenantSubjects
                    ?.map((ts: any) => ts.name)
                    .filter(Boolean) || [],
                ),
              );

              // Extract grade level names from tenantGradeLevels
              const gradeLevelNames = Array.from(
                new Set(
                  teacher.tenantGradeLevels
                    ?.map((tgl: any) => tgl.gradeLevel?.name)
                    .filter(Boolean) || [],
                ),
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
                isActive:
                  teacher.isActive !== undefined ? teacher.isActive : true, // Default to true if not provided
              };

              console.log("Processed teacher:", processedTeacher);
              return processedTeacher;
            });

          console.log(
            `Processed ${fetchedTeachers.length} teachers (filtered from ${teachersData.length} total)`,
          );
          set((state) => ({
            teachers: fetchedTeachers,
            lastUpdated: new Date().toISOString(),
          }));
        } catch (error) {
          console.error("Error loading teachers:", error);
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
          console.log(
            "Loading timetable entries for term:",
            termId,
            "grade:",
            gradeId,
          );

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
                    periodCount
                  }
                  gradeLevels { id name }
                  streams { id name }
                  periods {
                    period {
                      id
                      periodNumber
                      startTime
                      endTime
                      label
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

          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            credentials: "include",
            body: JSON.stringify({
              query,
              variables: {
                input: { termId },
              },
            }),
          });

          console.log(
            "Timetable entries API response status:",
            response.status,
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error("Timetable entries API error response:", errorText);
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();
          console.log("Timetable entries API response:", result);

          // Handle error responses from API
          if (result.error) {
            console.error("API returned error:", result.error);
            throw new Error(result.error);
          }

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            console.error("GraphQL errors:", errorMessages);
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data || !result.data.getSchoolTimetable) {
            console.error("Invalid response format:", result);
            throw new Error(
              "Invalid response format: missing getSchoolTimetable data",
            );
          }

          const timetableData = result.data.getSchoolTimetable;
          const timetableByGrade = timetableData.timetableByGrade || [];

          const formatTime = (timeStr: string) => {
            if (!timeStr) return "";
            if (timeStr.length === 5) return timeStr;
            if (timeStr.length === 8) return timeStr.substring(0, 5);
            return timeStr;
          };

          if (timetableByGrade.length === 0) {
            console.warn("No grade blocks found in timetable");
            set((state) => ({
              entries: state.entries.filter((e) => e.gradeId !== gradeId),
              lastUpdated: new Date().toISOString(),
            }));
            return;
          }

          const timeSlotMap = new Map<string, TimeSlot>();
          const fetchedEntries: TimetableEntry[] = [];
          const seenEntryIds = new Set<string>();

          const streamId = get().selectedStreamId;

          timetableByGrade.forEach((gradeBlock: any) => {
            if (!timetableBlockMatchesScope(gradeBlock, gradeId, streamId)) {
              return;
            }
            if (!Array.isArray(gradeBlock.days)) return;

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

                // Collect time slots (only non-break periods) - shared across grades
                // NOTE: Do NOT set dayOfWeek on time slots - they should apply to ALL days
                // The dayOfWeek is only relevant for entries, not for period definitions
                if (
                  period?.id &&
                  !period.id.startsWith("break-") &&
                  !timeSlotMap.has(period.id)
                ) {
                  timeSlotMap.set(period.id, {
                    id: period.id,
                    periodNumber: period.periodNumber,
                    time: `${formatTime(period.startTime)} - ${formatTime(period.endTime)}`,
                    startTime: formatTime(period.startTime),
                    endTime: formatTime(period.endTime),
                    color: "border-l-primary",
                    // dayOfWeek intentionally omitted - slots apply to all days
                    label: period.label,
                    dayTemplateId: dayTemplateId || undefined,
                  });
                }

                // Process entries - check if they belong to the requested grade
                if (p?.entry && period?.id && !p?.isBreak) {
                  const entry = p.entry;
                  // Use the entry's own gradeLevel.id - entries know which grade they belong to
                  const entryGradeLevelId = entry.gradeLevel?.id;
                  const entryGradeLevelName = entry.gradeLevel?.name;

                  // Only include entries that match the requested grade
                  if (!entryGradeLevelId || entryGradeLevelId !== gradeId) {
                    return;
                  }

                  // Avoid duplicates (same entry might appear in multiple blocks)
                  if (seenEntryIds.has(entry.id)) {
                    return;
                  }
                  seenEntryIds.add(entry.id);

                  const subjectId = entry.subject?.id;
                  const teacherId = entry.teacher?.id;
                  const timeSlotId = period.id;
                  if (!subjectId || !teacherId) {
                    console.warn(
                      "Skipping entry due to missing subject/teacher",
                      entry,
                    );
                    return;
                  }

                  fetchedEntries.push({
                    id: entry.id,
                    gradeId: entryGradeLevelId,
                    streamId: entry.stream?.id ?? null,
                    gradeName: entryGradeLevelName,
                    subjectId,
                    teacherId,
                    timeSlotId,
                    dayOfWeek: typeof dayOfWeek === "number" ? dayOfWeek : 1,
                    roomNumber: entry.room?.name || undefined,
                    isDoublePeriod: entry.isDoublePeriod || false,
                    notes: undefined,
                  });
                }
              });
            });
          });

          const fetchedTimeSlots = Array.from(timeSlotMap.values());
          set((state) => ({
            timeSlots: fetchedTimeSlots,
            lastUpdated: new Date().toISOString(),
          }));
          console.log(
            `Loaded ${fetchedTimeSlots.length} time slots from timetableByGrade`,
          );

          console.log(
            `Processed ${fetchedEntries.length} timetable entries from timetableByGrade`,
          );
          // Update store with entries for this grade
          // Remove existing entries for this grade and add new ones
          set((state) => {
            const existingEntries = state.entries || [];
            const otherGradeEntries = existingEntries.filter(
              (e) => e.gradeId !== gradeId,
            );
            const newEntries = [...otherGradeEntries, ...fetchedEntries];

            console.log("Updating store entries:", {
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
            console.log("Store updated. New entries count:", newEntries.length);
            console.log(
              "Entries for this grade:",
              newEntries.filter((e) => e.gradeId === gradeId).length,
            );

            return updatedState;
          });

          // Double-check entries were persisted
          const finalState = get();
          console.log(
            "Final verification - Store entries count:",
            finalState.entries.length,
          );
          console.log(
            "Final verification - Entries for grade",
            gradeId,
            ":",
            finalState.entries.filter((e) => e.gradeId === gradeId).length,
          );
        } catch (error) {
          console.error("Error loading timetable entries:", error);
          // Don't clear entries on error - keep existing ones
          throw error;
        }
      },

      loadSchoolTimetable: async (
        termId: string,
        options?: { gradeLevelId?: string; streamId?: string | null },
      ) => {
        try {
          const rawGradeLevelId =
            options?.gradeLevelId ?? get().selectedGradeId ?? undefined;
          const gradeLevelId = rawGradeLevelId
            ? (get().grades.find((g) => g.id === rawGradeLevelId)
                ?.tenantGradeLevelId ?? rawGradeLevelId)
            : undefined;
          const streamId =
            options?.streamId !== undefined
              ? options.streamId
              : get().selectedStreamId;

          console.log("Loading school timetable for term:", termId, {
            gradeLevelId,
            streamId,
          });

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
                    periodCount
                  }
                  gradeLevels { id name }
                  streams { id name }
                  periods {
                    period {
                      id
                      periodNumber
                      startTime
                      endTime
                      label
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

          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            credentials: "include",
            body: JSON.stringify({
              query,
              variables: {
                input: {
                  termId,
                  ...(gradeLevelId ? { gradeLevelId } : {}),
                  ...(streamId ? { streamId } : {}),
                },
              },
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data || !result.data.getSchoolTimetable) {
            throw new Error(
              "Invalid response format: missing getSchoolTimetable data",
            );
          }

          const timetableData = result.data.getSchoolTimetable;

          // Period numbers and days per week come directly from the backend.
          // We only need to extract entries from the nested grade/stream blocks.
          const allEntries: TimetableEntry[] = [];

          const gradeBlocks = (timetableData.timetableByGrade || []).filter(
            (gradeBlock: any) =>
              gradeLevelId
                ? timetableBlockMatchesScope(gradeBlock, gradeLevelId, streamId)
                : true,
          );

          gradeBlocks.forEach((gradeBlock: any) => {
            (gradeBlock.days || []).forEach((dayItem: any) => {
              const dayOfWeek = dayItem.dayTemplate?.dayOfWeek;

              (dayItem.periods || []).forEach((p: any) => {
                if (p?.isBreak || !p?.entry || !p?.period?.id) return;
                const entry = p.entry;
                const entryGradeLevelId = entry.gradeLevel?.id;
                if (!entryGradeLevelId) return;

                allEntries.push({
                  id: entry.id,
                  subjectId: entry.subject?.id || "",
                  teacherId: entry.teacher?.id || "",
                  timeSlotId: p.period.id,
                  gradeId: entryGradeLevelId,
                  streamId: entry.stream?.id ?? null,
                  gradeName: entry.gradeLevel?.name,
                  dayOfWeek: dayOfWeek || 1,
                  roomNumber: entry.room?.name || undefined,
                  isDoublePeriod: entry.isDoublePeriod || false,
                });
              });
            });
          });

          const periodNumbersFromSchedule = [
            ...new Set<number>(
              (timetableData.schedule?.periods || [])
                .map((p: any) => p?.period?.periodNumber)
                .filter((n: unknown): n is number => typeof n === "number"),
            ),
          ].sort((a, b) => a - b);

          const periodNumbersFromGrades = [
            ...new Set<number>(
              (timetableData.timetableByGrade || []).flatMap(
                (gradeBlock: any) =>
                  (gradeBlock.days || []).flatMap((dayItem: any) =>
                    (dayItem.periods || [])
                      .filter((p: any) => !p?.isBreak)
                      .map((p: any) => p?.period?.periodNumber)
                      .filter(
                        (n: unknown): n is number => typeof n === "number",
                      ),
                  ),
              ),
            ),
          ].sort((a, b) => a - b);

          const resolvedPeriodNumbers =
            timetableData.periodNumbers?.length > 0
              ? timetableData.periodNumbers
              : periodNumbersFromSchedule.length > 0
                ? periodNumbersFromSchedule
                : periodNumbersFromGrades.length > 0
                  ? periodNumbersFromGrades
                  : typeof timetableData.totalPeriods === "number" &&
                      timetableData.totalPeriods > 0
                    ? Array.from(
                        { length: timetableData.totalPeriods },
                        (_, i) => i + 1,
                      )
                    : [];

          const resolvedDaysPerWeek =
            timetableData.daysPerWeek ||
            timetableData.totalDays ||
            (timetableData.timetableByGrade?.[0]?.days?.length ?? 5);

          const gradeScopedSlots =
            gradeLevelId && timetableData
              ? extractTimeSlotsFromTimetableData(timetableData, gradeLevelId)
              : [];

          const slotPeriodNumbers =
            gradeScopedSlots.length > 0
              ? uniquePeriodNumbers(gradeScopedSlots)
              : [];
          const mergedPeriodNumbers = [
            ...new Set([...slotPeriodNumbers, ...resolvedPeriodNumbers]),
          ].sort((a, b) => a - b);
          const mergedLessonPeriodsPerDay = Math.max(
            mergedPeriodNumbers.length > 0
              ? Math.max(...mergedPeriodNumbers)
              : 0,
            gradeScopedSlots.length > 0
              ? Math.max(...gradeScopedSlots.map((s) => s.periodNumber || 0), 0)
              : 0,
            resolvedPeriodNumbers.length > 0
              ? Math.max(...resolvedPeriodNumbers)
              : 0,
            typeof timetableData.totalPeriods === "number"
              ? timetableData.totalPeriods
              : 0,
          );

          const gradeSlotUpdate = gradeLevelId
            ? {
                timeSlots: gradeScopedSlots,
                periodNumbers: mergedPeriodNumbers,
                lessonPeriodsPerDay: mergedLessonPeriodsPerDay,
              }
            : gradeScopedSlots.length > 0
              ? {
                  timeSlots: gradeScopedSlots,
                  periodNumbers: mergedPeriodNumbers,
                  lessonPeriodsPerDay: mergedLessonPeriodsPerDay,
                }
              : {};

          // Use backend-provided periodNumbers, daysPerWeek, conflicts, and rooms.
          set((state) => ({
            entries: allEntries,
            periodNumbers: gradeLevelId
              ? mergedPeriodNumbers
              : resolvedPeriodNumbers,
            daysPerWeek: resolvedDaysPerWeek,
            conflicts: timetableData.conflicts || [],
            knownRoomNumbers: timetableData.knownRoomNumbers || [],
            ...gradeSlotUpdate,
            ...(gradeLevelId || gradeScopedSlots.length > 0
              ? {}
              : {
                  lessonPeriodsPerDay: Math.max(
                    state.lessonPeriodsPerDay ?? 0,
                    resolvedPeriodNumbers.length,
                  ),
                }),
            lastUpdated: new Date().toISOString(),
          }));

          return timetableData;
        } catch (error) {
          console.error("Error loading school timetable:", error);
          throw error;
        }
      },

      deleteEntriesForTerm: async (termId: string) => {
        try {
          if (!termId) {
            throw new Error(
              "No term selected. Please select a term to delete its entries.",
            );
          }

          const mutation = `
            mutation DeleteTimetableEntriesForTerm($termId: String!) {
              deleteTimetableEntriesForTerm(termId: $termId)
            }
          `;

          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            credentials: "include",
            body: JSON.stringify({ query: mutation, variables: { termId } }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          // Mutation returns a string message; we just clear entries locally
          set(() => ({
            entries: [],
            lastUpdated: new Date().toISOString(),
          }));

          return result.data?.deleteTimetableEntriesForTerm as
            | string
            | undefined;
        } catch (error) {
          console.error("Error deleting timetable entries for term:", error);
          throw error;
        }
      },

      deleteTimetableForTerm: async (termId: string) => {
        try {
          if (!termId) {
            throw new Error(
              "No term selected. Please select a term to delete its timetable.",
            );
          }

          const mutation = `
            mutation DeleteTimetableForTerm($termId: String!) {
              deleteTimetableForTerm(termId: $termId)
            }
          `;

          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            credentials: "include",
            body: JSON.stringify({ query: mutation, variables: { termId } }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
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
          console.error("Error deleting timetable for term:", error);
          throw error;
        }
      },

      // Break management actions
      addBreak: (breakData: Omit<Break, "id">) => {
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

      createBreaks: async (breaks: Omit<Break, "id">[]) => {
        try {
          const response = await fetch("/api/school/break", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(breaks),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data) {
            throw new Error("Invalid response format: missing data");
          }

          // Convert response to Break format and update store
          // The response has keys like break1, break2, etc.
          const newBreaks: Break[] = Object.values(result.data).map(
            (breakItem: any) => {
              // GraphQL returns dayOfWeek as 0-indexed (0=Monday), frontend uses 1-indexed (1=Monday)
              const dayOfWeek = (breakItem.dayOfWeek ?? 0) + 1;

              return {
                id: breakItem.id,
                name: breakItem.name,
                type: breakGraphQLToStoreType(breakItem.type),
                dayOfWeek,
                afterPeriod: breakItem.afterPeriod,
                durationMinutes: breakItem.durationMinutes,
                icon: breakItem.icon || "☕",
                color: breakItem.color || "bg-blue-500",
              } as Break;
            },
          );

          set((state) => ({
            breaks: [...state.breaks, ...newBreaks],
            lastUpdated: new Date().toISOString(),
          }));
        } catch (error) {
          console.error("Error creating breaks:", error);
          throw error;
        }
      },

      createAllBreaksForTemplate: async (breaksInput) => {
        try {
          const response = await fetch("/api/school/break", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(breaksInput),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data) {
            throw new Error("Invalid response format: missing data");
          }

          const newBreaks: Break[] = Object.values(result.data).map(
            (breakItem: any) => {
              const dayOfWeek =
                typeof breakItem.dayOfWeek === "number"
                  ? breakItem.dayOfWeek + 1
                  : 1;
              return {
                id: breakItem.id,
                name: breakItem.name,
                type: breakGraphQLToStoreType(breakItem.type),
                dayOfWeek,
                afterPeriod: breakItem.afterPeriod,
                durationMinutes: breakItem.durationMinutes,
                icon: breakItem.icon || "☕",
                color: breakItem.color || "bg-blue-500",
                applyToAllDays: breakItem.applyToAllDays,
              } as Break;
            },
          );

          set((state) => ({
            breaks: [...state.breaks, ...newBreaks],
            lastUpdated: new Date().toISOString(),
          }));
        } catch (error) {
          console.error("Error creating all breaks:", error);
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

          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ query }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data || !result.data.getAllDayTemplateBreaks) {
            throw new Error(
              "Invalid response format: missing getAllDayTemplateBreaks data",
            );
          }

          // Convert response to Break format and update store
          const fetchedBreaks = result.data.getAllDayTemplateBreaks.map(
            (breakItem: any) => {
              // Get dayOfWeek from dayTemplate if available, otherwise use 1 as default
              const dayOfWeek = breakItem.dayTemplate?.dayOfWeek || 1;

              return {
                id: breakItem.id,
                name: breakItem.name,
                type: breakGraphQLToStoreType(breakItem.type),
                dayOfWeek,
                afterPeriod: breakItem.afterPeriod,
                durationMinutes: breakItem.durationMinutes,
                icon: breakItem.icon || "☕",
                color: breakItem.color || "#3B82F6",
                dayTemplateId: breakItem.dayTemplateId || null,
                applyToAllDays: breakItem.applyToAllDays || false,
              };
            },
          );

          set((state) => ({
            breaks: fetchedBreaks,
            lastUpdated: new Date().toISOString(),
          }));

          console.log("Loaded breaks:", fetchedBreaks.length);
        } catch (error) {
          console.error("Error loading breaks:", error);
          throw error;
        }
      },

      updateBreak: (id: string, updates: Partial<Break>) => {
        set((state) => ({
          breaks: state.breaks.map((breakItem) =>
            breakItem.id === id ? { ...breakItem, ...updates } : breakItem,
          ),
          lastUpdated: new Date().toISOString(),
        }));
      },

      deleteBreak: async (id: string) => {
        try {
          const state = get();
          const breakToDelete = state.breaks.find((b) => b.id === id);

          if (!breakToDelete) {
            throw new Error("Break not found");
          }

          const mutation = `
            mutation DeleteTimetableBreak($breakId: String!) {
              deleteTimetableBreak(breakId: $breakId)
            }
          `;

          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            credentials: "include",
            body: JSON.stringify({
              query: mutation,
              variables: { breakId: id },
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            throw new Error(`Could not delete break: ${errorMessages}`);
          }

          if (!result.data?.deleteTimetableBreak) {
            throw new Error("Failed to delete break");
          }

          // Remove break from store
          set((state) => ({
            breaks: state.breaks.filter((breakItem) => breakItem.id !== id),
            lastUpdated: new Date().toISOString(),
          }));
        } catch (error) {
          console.error("Error deleting break:", error);
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

          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            credentials: "include",
            body: JSON.stringify({
              query: mutation,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          // Check if deletion was successful
          if (result.data?.deleteAllTimetableBreaks) {
            // Clear all breaks from store
            set((state) => ({
              breaks: [],
              lastUpdated: new Date().toISOString(),
            }));

            console.log("All breaks deleted successfully");
          } else {
            throw new Error("Failed to delete all breaks");
          }
        } catch (error) {
          console.error("Error deleting all breaks:", error);
          throw error;
        }
      },

      deleteAllBreaksByTerm: async (termId: string) => {
        try {
          const mutation = `
            mutation DeleteAllBreaksByTerm($input: DeleteBreaksByTermInput!) {
              deleteAllBreaksByTerm(input: $input) {
                success
                deletedBreaksCount
                recalculatedDaysCount
                message
                completedAt
              }
            }
          `;

          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            credentials: "include",
            body: JSON.stringify({
              query: mutation,
              variables: { input: { termId, confirmDeletion: true } },
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            throw new Error(
              result.errors[0]?.message || "Failed to delete breaks",
            );
          }

          const data = result.data?.deleteAllBreaksByTerm;
          if (!data?.success) {
            throw new Error(data?.message || "Failed to delete breaks");
          }

          return data;
        } catch (error) {
          console.error("Error deleting all breaks by term:", error);
          throw error;
        }
      },

      deleteBreaksByType: async (termId: string, breakType: string) => {
        try {
          const mutation = `
            mutation DeleteBreaksByType($input: DeleteBreaksByTypeInput!) {
              deleteBreaksByType(input: $input) {
                success
                breakType
                deletedBreaksCount
                recalculatedDaysCount
                message
                completedAt
              }
            }
          `;

          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
            credentials: "include",
            body: JSON.stringify({
              query: mutation,
              variables: {
                input: { termId, breakType, confirmDeletion: true },
              },
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            throw new Error(
              result.errors[0]?.message || "Failed to delete breaks",
            );
          }

          const data = result.data?.deleteBreaksByType;
          if (!data?.success) {
            throw new Error(data?.message || "Failed to delete breaks");
          }

          return data;
        } catch (error) {
          console.error("Error deleting breaks by type:", error);
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
      bulkCreateEntries: async (
        termId: string,
        gradeId: string,
        entries: CreateEntryRequest[],
      ) => {
        try {
          const tenantGradeLevelId =
            get().grades.find((g) => g.id === gradeId)?.tenantGradeLevelId ??
            gradeId;

          const response = await fetch("/api/school/timetable/entries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              termId,
              gradeId: tenantGradeLevelId,
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
            throw new Error(
              `Request failed: ${response.status} - ${errorText.substring(0, 200)}`,
            );
          }

          const result = await response.json();

          if (result.errors) {
            const errorMessages = result.errors
              .map((e: any) => e.message)
              .join(", ");
            throw new Error(`GraphQL errors: ${errorMessages}`);
          }

          if (!result.data || !result.data.bulkCreateTimetableEntries) {
            throw new Error(
              "Invalid response format: missing bulkCreateTimetableEntries data",
            );
          }

          // Convert response entries to TimetableEntry format and update store
          // Match response entries with original entries by index (order should be preserved)
          const createdEntries: TimetableEntry[] =
            result.data.bulkCreateTimetableEntries.map(
              (responseEntry: any, index: number) => {
                const originalEntry = entries[index];
                return {
                  id: responseEntry.id,
                  gradeId,
                  subjectId: originalEntry.subjectId,
                  teacherId: originalEntry.teacherId,
                  timeSlotId: originalEntry.timeSlotId,
                  dayOfWeek: responseEntry.dayOfWeek,
                  roomNumber: originalEntry.roomNumber || "",
                };
              },
            );

          set((state) => ({
            entries: [...state.entries, ...createdEntries],
            lastUpdated: new Date().toISOString(),
          }));
        } catch (error) {
          console.error("Error creating bulk timetable entries:", error);
          throw error;
        }
      },

      // DEPRECATED: This function is kept for backward compatibility but should not be used
      // Use loadTimeSlots() and other backend methods instead
      loadMockData: () => {
        console.warn(
          "loadMockData is deprecated. Use loadTimeSlots() and other backend methods instead.",
        );
        // Do nothing - return empty state
        set({
          ...emptyInitialState,
          lastUpdated: new Date().toISOString(),
        });
      },

      // UI actions
      setSelectedGrade: (gradeId) => {
        const grade = get().grades.find((g) => g.id === gradeId);
        const firstStream = grade?.streams?.[0]?.tenantStreamId ?? null;
        set({
          selectedGradeId: gradeId,
          selectedStreamId: grade?.streams?.length ? firstStream : null,
        });
      },
      setSelectedStream: (streamId) => set({ selectedStreamId: streamId }),
      setSelectedTerm: (termId) => set({ selectedTermId: termId }),
      setSearchTerm: (term) => set({ searchTerm: term }),
      toggleConflicts: () =>
        set((state) => ({ showConflicts: !state.showConflicts })),
      toggleSummary: () =>
        set((state) => ({ isSummaryMinimized: !state.isSummaryMinimized })),
    }),
    {
      name: "timetable-store-v3",
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist reference / cache data, not time-sensitive data.
        // timeSlots are excluded — they must always be fetched fresh
        // from the backend so the UI correctly reflects the current state.
        subjects: state.subjects,
        teachers: state.teachers,
        grades: state.grades,
        entries: state.entries,
        lastUpdated: state.lastUpdated,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, check if we need to preserve fresh entries
        if (state) {
          console.log("Store rehydrated. Entries count:", state.entries.length);
          // Clear breaks on rehydration - they should always be loaded fresh from backend
          state.breaks = [];
        }
      },
    },
  ),
);

// Selectors (optimized accessors)
export const useTimetableSelectors = () => {
  const store = useTimetableStore();

  return {
    // Get entries for currently selected grade
    selectedGradeEntries: store.entries.filter(
      (entry) => entry.gradeId === store.selectedGradeId,
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
        (entry) => entry.gradeId === gradeId && entry.dayOfWeek === dayOfWeek,
      ),

    // Enrich an entry with full data
    enrichEntry: (entry: TimetableEntry) => {
      const subject = store.subjects.find((s) => s.id === entry.subjectId);
      const teacher = store.teachers.find((t) => t.id === entry.teacherId);
      const timeSlot = store.timeSlots.find((ts) => ts.id === entry.timeSlotId);
      const grade = store.grades.find((g) => g.id === entry.gradeId);

      // If any required data is missing, log a warning but still return the entry
      if (!subject || !teacher || !timeSlot || !grade) {
        console.warn("Missing data for entry:", {
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
        subject:
          subject || ({ id: entry.subjectId, name: "Unknown Subject" } as any),
        teacher:
          teacher ||
          ({
            id: entry.teacherId,
            name: "Unknown Teacher",
            firstName: "",
            lastName: "",
            subjects: [],
          } as any),
        timeSlot:
          timeSlot ||
          ({
            id: entry.timeSlotId,
            periodNumber: 0,
            time: "Unknown",
            startTime: "",
            endTime: "",
            color: "",
          } as any),
        grade:
          grade ||
          ({ id: entry.gradeId, name: "Unknown Grade", level: 0 } as any),
      };
    },
  };
};
