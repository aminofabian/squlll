'use client';

import { useState, useEffect, useRef } from 'react';
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';
import { useTimeSlots } from '@/lib/hooks/useTimeSlots';
import type { TimeSlot } from '@/lib/types/timetable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
    <Dialog open={!!timeslot} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Edit Period {timeslot.periodNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Error Display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Primary: Display Time - Simple and Clear */}
          <div className="space-y-2">
            <Label htmlFor="displayTime" className="text-sm font-medium">
              Time Range
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
              className="h-11 text-base font-medium"
              placeholder="8:00 AM – 8:45 AM"
            />
            <p className="text-xs text-muted-foreground">
              Enter time range in format: "8:00 AM – 8:45 AM"
            </p>
          </div>

          {/* Secondary: Time Details - Collapsible/Expandable Info */}
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors list-none">
              <span className="flex items-center gap-2">
                <span>Advanced: Edit Start & End Times</span>
                <span className="text-xs">▼</span>
              </span>
            </summary>
            <div className="mt-3 space-y-3 pt-3 border-t">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-xs font-medium text-muted-foreground">
                    Start Time
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    disabled={loading}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-xs font-medium text-muted-foreground">
                    End Time
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    disabled={loading}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </div>
          </details>

          {/* Summary Info - Clean and Minimal */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md text-sm">
            <span className="text-muted-foreground">Duration</span>
            <span className={`font-semibold ${
              isValidDuration ? 'text-foreground' : 'text-destructive'
            }`}>
              {isValidDuration ? `${duration} min` : 'Invalid'}
            </span>
          </div>

          {/* Warning - Subtle */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-md border border-amber-200 dark:border-amber-800">
            <span className="text-amber-600 dark:text-amber-400 text-sm">⚠️</span>
            <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
              This change will affect all lessons scheduled in this time slot across all grades.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1 sm:flex-initial">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValidDuration || loading || !formData.startTime || !formData.endTime}
            className="flex-1 sm:flex-initial"
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

