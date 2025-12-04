// lib/utils/timetable-adjustments.ts
// Utility functions to adjust timeslot times based on breaks

import type { TimeSlot, Break } from '../types/timetable';

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Format time for display (converts 24h to 12h with AM/PM)
 */
export function formatTimeForDisplay(timeStr: string): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Calculate adjusted timeslots for a specific day, factoring in breaks
 * 
 * Logic:
 * 1. Start with base timeslots (sorted by period number)
 * 2. Find all breaks that apply to this day (or all days)
 * 3. For each period, calculate cumulative break time from all breaks that occur before it
 * 4. Adjust the period's start and end times by adding the cumulative break time
 */
export function calculateAdjustedTimeSlots(
  baseTimeSlots: TimeSlot[],
  breaks: Break[],
  dayOfWeek: number
): TimeSlot[] {
  // Sort timeslots by period number
  const sortedSlots = [...baseTimeSlots].sort((a, b) => a.periodNumber - b.periodNumber);
  
  // Find breaks that apply to this day
  // Each break has a specific dayOfWeek (when "apply to all days" is selected,
  // separate break entries are created for each day)
  const applicableBreaks = breaks.filter((breakItem) => {
    return breakItem.dayOfWeek === dayOfWeek;
  });

  // Sort breaks by afterPeriod (breaks that occur earlier come first)
  const sortedBreaks = [...applicableBreaks].sort((a, b) => a.afterPeriod - b.afterPeriod);

  // Calculate cumulative break time for each period
  // cumulativeBreakTime[periodNumber] = total minutes of breaks before this period
  const cumulativeBreakTime: Record<number, number> = {};
  
  // Initialize with 0 for all periods
  sortedSlots.forEach((slot) => {
    cumulativeBreakTime[slot.periodNumber] = 0;
  });

  // For each break, add its duration to all periods that come after it
  sortedBreaks.forEach((breakItem) => {
    const breakDuration = breakItem.durationMinutes || 0;
    sortedSlots.forEach((slot) => {
      if (slot.periodNumber > breakItem.afterPeriod) {
        cumulativeBreakTime[slot.periodNumber] += breakDuration;
      }
    });
  });

  // Create adjusted timeslots
  return sortedSlots.map((slot) => {
    const adjustmentMinutes = cumulativeBreakTime[slot.periodNumber] || 0;
    
    if (adjustmentMinutes === 0) {
      // No adjustment needed, return original
      return slot;
    }

    // Convert start and end times to minutes
    const startMinutes = timeToMinutes(slot.startTime);
    const endMinutes = timeToMinutes(slot.endTime);

    // Calculate duration of the period
    const periodDuration = endMinutes - startMinutes;

    // Adjust start time by adding cumulative break time
    const adjustedStartMinutes = startMinutes + adjustmentMinutes;
    const adjustedEndMinutes = adjustedStartMinutes + periodDuration;

    // Convert back to time strings
    const adjustedStartTime = minutesToTime(adjustedStartMinutes);
    const adjustedEndTime = minutesToTime(adjustedEndMinutes);

    // Format for display
    const adjustedDisplayTime = `${formatTimeForDisplay(adjustedStartTime)} – ${formatTimeForDisplay(adjustedEndTime)}`;

    return {
      ...slot,
      startTime: adjustedStartTime,
      endTime: adjustedEndTime,
      time: adjustedDisplayTime,
    };
  });
}

/**
 * Get adjusted timeslots for all days (returns a map of dayOfWeek -> adjusted timeslots)
 */
export function calculateAdjustedTimeSlotsForAllDays(
  baseTimeSlots: TimeSlot[],
  breaks: Break[]
): Record<number, TimeSlot[]> {
  const result: Record<number, TimeSlot[]> = {};
  
  // Calculate for each day (1-5 = Monday-Friday)
  for (let day = 1; day <= 5; day++) {
    result[day] = calculateAdjustedTimeSlots(baseTimeSlots, breaks, day);
  }
  
  return result;
}

