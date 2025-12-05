'use client';

import { useState, useEffect, useRef } from 'react';
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';
import { useTimeSlots } from '@/lib/hooks/useTimeSlots';
import type { TimeSlot } from '@/lib/types/timetable';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface TimeslotEditDialogProps {
  timeslot: TimeSlot | null;
  onClose: () => void;
}

export function TimeslotEditDialog({ timeslot, onClose }: TimeslotEditDialogProps) {
  const { updateTimeSlot: updateStoreTimeSlot } = useTimetableStore();
  const { updateTimeSlot } = useTimeSlots();

  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    duration: 0,
    displayTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isParsingDisplayTime = useRef(false);

  // Helper functions
  const calculateDurationFromTimes = (start: string, end: string): number | null => {
    if (!start || !end) return null;
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    return endTotalMinutes - startTotalMinutes;
  };

  const calculateEndTimeFromDuration = (start: string, durationMinutes: number): string => {
    if (!start || durationMinutes <= 0) return '';
    const [hours, minutes] = start.split(':').map(Number);
    const startTotalMinutes = hours * 60 + minutes;
    const endTotalMinutes = startTotalMinutes + durationMinutes;
    const endHours = Math.floor(endTotalMinutes / 60);
    const endMins = endTotalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const formatDisplayTime = (start: string, end: string): string => {
    if (!start || !end) return '';
    const formatTime = (time24: string) => {
      const [hours, minutes] = time24.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    };
    return `${formatTime(start)} – ${formatTime(end)}`;
  };

  const parseDisplayTime = (displayTime: string): { startTime: string; endTime: string } | null => {
    if (!displayTime) return null;
    
    // Match patterns like "8:00 AM – 8:45 AM" or "8:00 AM - 8:45 AM"
    const timePattern = /(\d{1,2}):(\d{2})\s*(AM|PM)\s*[–-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i;
    const match = displayTime.match(timePattern);
    
    if (!match) return null;
    
    const parse12HourTime = (hours: number, minutes: number, period: string): string => {
      let hour24 = hours;
      if (period.toUpperCase() === 'PM' && hours !== 12) {
        hour24 = hours + 12;
      } else if (period.toUpperCase() === 'AM' && hours === 12) {
        hour24 = 0;
      }
      return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };
    
    const startHours = parseInt(match[1], 10);
    const startMinutes = parseInt(match[2], 10);
    const startPeriod = match[3];
    const endHours = parseInt(match[4], 10);
    const endMinutes = parseInt(match[5], 10);
    const endPeriod = match[6];
    
    return {
      startTime: parse12HourTime(startHours, startMinutes, startPeriod),
      endTime: parse12HourTime(endHours, endMinutes, endPeriod),
    };
  };

  useEffect(() => {
    if (timeslot) {
      const initialDuration = calculateDurationFromTimes(timeslot.startTime, timeslot.endTime);
      const displayTime = timeslot.time || formatDisplayTime(timeslot.startTime, timeslot.endTime);
      setFormData({
        startTime: timeslot.startTime,
        endTime: timeslot.endTime,
        duration: initialDuration || 0,
        displayTime,
      });
      setError(null);
    }
  }, [timeslot]);

  // Update duration when times change
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const calculatedDuration = calculateDurationFromTimes(formData.startTime, formData.endTime);
      if (calculatedDuration !== null) {
        setFormData(prev => ({ ...prev, duration: calculatedDuration }));
      }
    }
  }, [formData.startTime, formData.endTime]);

  // Update display time when start/end times change (skip if we're parsing display time)
  useEffect(() => {
    if (isParsingDisplayTime.current) {
      isParsingDisplayTime.current = false;
      return;
    }
    
    if (formData.startTime && formData.endTime) {
      const newDisplayTime = formatDisplayTime(formData.startTime, formData.endTime);
      setFormData(prev => ({ ...prev, displayTime: newDisplayTime }));
    }
  }, [formData.startTime, formData.endTime]);

  const duration = calculateDurationFromTimes(formData.startTime, formData.endTime);
  const isValidDuration = duration !== null && duration > 0;

  const handleSave = async () => {
    if (!timeslot || !isValidDuration) return;

    setLoading(true);
    setError(null);

    try {
      // Convert 24-hour time to 12-hour display format
      const formatTime = (time24: string) => {
        const [hours, minutes] = time24.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
      };

      const newDisplayTime = formData.displayTime || `${formatTime(formData.startTime)} – ${formatTime(formData.endTime)}`;

      // Update local store immediately for optimistic UI
      updateStoreTimeSlot(timeslot.id, {
        startTime: formData.startTime,
        endTime: formData.endTime,
        time: newDisplayTime,
      });

      // Call GraphQL update mutation (if available)
      try {
        const result = await updateTimeSlot({
          id: timeslot.id,
          periodNumber: timeslot.periodNumber,
          displayTime: newDisplayTime,
          startTime: formData.startTime,
          endTime: formData.endTime,
          color: timeslot.color || 'border-l-primary'
        });

        console.log('Successfully updated time slot:', result);
      } catch (mutationError) {
        // Check if the error is because the mutation isn't implemented yet
        const errorMessage = mutationError instanceof Error ? mutationError.message : String(mutationError);
        const isMutationNotImplemented = errorMessage.includes('Unknown type "UpdateTimeSlotInput"') ||
                                         errorMessage.includes('Cannot query field "updateTimeSlot"');

        if (isMutationNotImplemented) {
          // If mutation isn't implemented, keep local changes but show a warning
          console.warn('Time slot update mutation not available on server, keeping local changes only');
          // Don't revert local changes since the mutation simply doesn't exist yet
        } else {
          // For other errors, revert local changes
          updateStoreTimeSlot(timeslot.id, {
            startTime: timeslot.startTime,
            endTime: timeslot.endTime,
            time: timeslot.time,
          });
          throw mutationError;
        }
      }

      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update time slot';
      setError(errorMessage);
      console.error('Error updating time slot:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!timeslot) return null;

  return (
    <Drawer open={!!timeslot} onOpenChange={onClose} direction="right">
      <DrawerContent className="w-full sm:w-[500px] lg:w-[600px] h-full flex flex-col">
        <DrawerHeader className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b-2 border-primary/20 px-6 py-5">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-2xl font-bold text-primary flex items-center gap-3">
              <span className="text-3xl">⏰</span>
              <span>Edit Period {timeslot.periodNumber}</span>
            </DrawerTitle>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary hover:bg-primary/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gradient-to-b from-background to-primary/5">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          {/* Primary: Display Time - Simple and Clear */}
          <div className="space-y-1.5">
            <Label htmlFor="displayTime" className="text-sm text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
              <span>Time Range</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">(required)</span>
            </Label>
            <Input
              id="displayTime"
              type="text"
              value={formData.displayTime}
              onChange={(e) => {
                const newDisplayTime = e.target.value;
                setFormData(prev => ({ ...prev, displayTime: newDisplayTime }));
                
                // Try to parse and update start/end times
                const parsed = parseDisplayTime(newDisplayTime);
                if (parsed) {
                  isParsingDisplayTime.current = true;
                  const formattedDisplayTime = formatDisplayTime(parsed.startTime, parsed.endTime);
                  setFormData(prev => ({
                    ...prev,
                    displayTime: formattedDisplayTime,
                    startTime: parsed.startTime,
                    endTime: parsed.endTime,
                  }));
                }
              }}
              onBlur={(e) => {
                const parsed = parseDisplayTime(e.target.value);
                if (!parsed && formData.startTime && formData.endTime) {
                  const regenerated = formatDisplayTime(formData.startTime, formData.endTime);
                  setFormData(prev => ({ ...prev, displayTime: regenerated }));
                }
              }}
              disabled={loading}
              className="h-10 text-base font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-slate-100"
              placeholder="8:00 AM – 8:45 AM"
            />
            <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <span>💡</span>
              <span>Enter time range in format: "8:00 AM – 8:45 AM"</span>
            </p>
          </div>

          {/* Secondary: Time Details - Collapsible/Expandable Info */}
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors list-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 p-3">
              <span className="flex items-center gap-2">
                <span>Advanced: Edit Start & End Times</span>
                <span className="text-xs">▼</span>
              </span>
            </summary>
            <div className="mt-3 space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="startTime" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Start Time
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    disabled={loading}
                    className="h-10 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="endTime" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    End Time
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    disabled={loading}
                    className="h-10 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </details>

          {/* Summary Info - Clean and Minimal */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-sm">
            <span className="text-slate-700 dark:text-slate-300 font-medium">Duration</span>
            <span className={`font-bold text-lg ${
              isValidDuration ? 'text-slate-900 dark:text-slate-100' : 'text-red-600 dark:text-red-400'
            }`}>
              {isValidDuration ? `${duration} min` : 'Invalid'}
            </span>
          </div>

          {/* Warning - Subtle */}
          <div className="flex items-start gap-2 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <span className="text-amber-600 dark:text-amber-400 text-sm">⚠️</span>
            <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
              This change will affect all lessons scheduled in this time slot across all grades.
            </p>
          </div>

          {/* Preview */}
          <div className="border-l-4 border-primary bg-slate-50 dark:bg-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 flex items-center justify-center text-4xl text-primary">
                ⏰
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1">
                  Period {timeslot.periodNumber}
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                  {formData.displayTime || 'Enter time range'}
                </div>
                {isValidDuration && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Duration: {duration} minutes
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DrawerFooter className="bg-gradient-to-t from-primary/10 via-primary/5 to-background border-t-2 border-primary/20 px-6 py-4 gap-3">
          <div className="flex items-center justify-end w-full gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold h-10">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValidDuration || loading || !formData.startTime || !formData.endTime}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm disabled:opacity-50 h-10"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

