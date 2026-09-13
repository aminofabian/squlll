'use client';

import { useState, useEffect } from 'react';
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';
import { sanitizeTimetableUserMessage } from '@/lib/utils/timetable-user-messages';
import { useTimeSlots } from '@/lib/hooks/useTimeSlots';
import type { TimeSlot } from '@/lib/types/timetable';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { X, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { tt } from '../utils/timetableTheme';

interface TimeslotEditDialogProps {
  timeslot: TimeSlot | null;
  onClose: () => void;
}

export function TimeslotEditDialog({ timeslot, onClose }: TimeslotEditDialogProps) {
  const { updateTimeSlot: updateStoreTimeSlot } = useTimetableStore();
  const { updateTimeSlot } = useTimeSlots();
  const { updateDayTemplatePeriod } = useTimetableStore();

  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    duration: 0,
    displayTime: '',
    label: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper functions
  const calculateDurationFromTimes = (start: string, end: string): number | null => {
    if (!start || !end) return null;
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    return endTotalMinutes - startTotalMinutes;
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

  useEffect(() => {
    if (timeslot) {
      const initialDuration = calculateDurationFromTimes(timeslot.startTime, timeslot.endTime);
      const displayTime = timeslot.time || formatDisplayTime(timeslot.startTime, timeslot.endTime);
      setFormData({
        startTime: timeslot.startTime,
        endTime: timeslot.endTime,
        duration: initialDuration || 0,
        displayTime,
        label: timeslot.label || '',
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

  // Keep the display label in sync with the start/end times
  useEffect(() => {
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
        label: formData.label || undefined,
      });

      // Prefer new day template period mutation; fallback to legacy timeslot mutation
      try {
        await updateDayTemplatePeriod(timeslot.id, {
          startTime: formData.startTime,
          endTime: formData.endTime,
          label: formData.label || undefined,
        });
      } catch (mutationError) {
        try {
          const result = await updateTimeSlot({
            id: timeslot.id,
            periodNumber: timeslot.periodNumber,
            displayTime: newDisplayTime,
            startTime: formData.startTime,
            endTime: formData.endTime,
            color: timeslot.color || 'border-l-primary',
          });
          console.log('Fallback updateTimeSlot success:', result);
        } catch (legacyError) {
          updateStoreTimeSlot(timeslot.id, {
            startTime: timeslot.startTime,
            endTime: timeslot.endTime,
            time: timeslot.time,
            label: timeslot.label,
          });
          throw legacyError;
        }
      }

      onClose();
    } catch (err) {
      setError(sanitizeTimetableUserMessage(err));
      console.error('Error updating time slot:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!timeslot) return null;

  return (
    <Drawer open={!!timeslot} onOpenChange={onClose} direction="right">
      <DrawerContent className="flex h-full w-full flex-col rounded-none sm:w-[500px] lg:w-[600px]">
        <DrawerHeader className="border-b border-[#1a4d42]/12 bg-[#f8fbfa] px-6 py-5 dark:border-white/10 dark:bg-[#071411]">
          <div className="flex items-center justify-between">
            <div className="flex-1">
            <DrawerTitle className={cn("flex items-center gap-3", tt.text.metric, tt.ink.strong, tt.numeral)}>
              <span className="flex h-11 w-11 items-center justify-center border border-[#1a4d42]/12 bg-[#f3f7f5] text-[#246a59] dark:border-white/10 dark:bg-[#071411] dark:text-[#7eb8a8]">
                <Clock className="h-5 w-5" />
              </span>
              <span>Edit Period {timeslot.periodNumber}</span>
            </DrawerTitle>
              <DrawerDescription className={cn("mt-2", tt.text.small, tt.ink.muted)}>
                Change when this period starts and ends — every lesson placed here moves with it.
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 hover:bg-[#e8f2ef] dark:hover:bg-white/5", tt.ink.base, tt.focus)}
              >
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 space-y-6 overflow-y-auto bg-white px-6 py-6 dark:bg-[#0c1a17]">
          {/* Error Display */}
          {error && (
            <div className={cn("border border-red-200 bg-red-50 px-3 py-2 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400", tt.text.body)}>
              {error}
            </div>
          )}

          {/* Primary: Start & End Times */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startTime" className={cn("font-medium", tt.text.caption, tt.ink.muted)}>
                Start time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                disabled={loading}
                className={cn("h-10 border border-[#1a4d42]/12 bg-white font-medium focus:border-[#246a59] focus:ring-1 focus:ring-[#246a59]/35 dark:border-white/10 dark:bg-[#0c1a17]", tt.text.body, tt.ink.strong)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endTime" className={cn("font-medium", tt.text.caption, tt.ink.muted)}>
                End time
              </Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                disabled={loading}
                className={cn("h-10 border border-[#1a4d42]/12 bg-white font-medium focus:border-[#246a59] focus:ring-1 focus:ring-[#246a59]/35 dark:border-white/10 dark:bg-[#0c1a17]", tt.text.body, tt.ink.strong)}
              />
            </div>
          </div>
          {formData.startTime && formData.endTime && !isValidDuration ? (
            <p className={cn("font-medium", tt.text.small, "text-red-600 dark:text-red-400")}>
              End time must be after the start time.
            </p>
          ) : null}

          {/* Label (optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="label" className={cn("flex items-center gap-2 font-medium", tt.text.caption, tt.ink.muted)}>
              <span>Label</span>
              <span className={cn("font-normal", tt.text.caption, tt.ink.faint)}>(optional)</span>
            </Label>
            <Input
              id="label"
              type="text"
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              placeholder="e.g., Double Period"
              disabled={loading}
              className={cn("h-10 border border-[#1a4d42]/12 bg-white font-medium focus:border-[#246a59] focus:ring-1 focus:ring-[#246a59]/35 dark:border-white/10 dark:bg-[#0c1a17]", tt.text.body, tt.ink.strong)}
            />
          </div>

          {/* Summary Info - Clean and Minimal */}
          <div className={cn("flex items-center justify-between border border-[#1a4d42]/12 bg-white p-4 dark:border-white/10 dark:bg-[#0c1a17]", tt.text.body)}>
            <span className={cn("font-medium", tt.ink.base)}>Duration</span>
            <span className={cn(
              tt.text.display,
              tt.numeral,
              isValidDuration ? tt.ink.strong : 'text-red-600 dark:text-red-400'
            )}>
              {isValidDuration ? `${duration} min` : 'Invalid'}
            </span>
          </div>

          {/* Warning - Subtle */}
          <div className="flex items-start gap-2 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className={cn(tt.text.small, "text-amber-800 dark:text-amber-200")}>
              This change will affect all lessons scheduled in this period across all grades.
            </p>
          </div>

          {/* Preview */}
          <div className="border-l-4 border-[#246a59] bg-[#f8fbfa] p-5 shadow-sm dark:bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center bg-[#246a59]/10 text-[#246a59] dark:bg-[#246a59]/20 dark:text-[#7eb8a8]">
                <Clock className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <div className={cn("mb-1", tt.text.display, tt.ink.strong, tt.numeral)}>
                  Period {timeslot.periodNumber}
                </div>
                <div className={cn("font-medium", tt.text.body, tt.ink.base)}>
                  {formData.displayTime || 'Enter time range'}
                </div>
                {isValidDuration && (
                  <div className={cn("mt-1", tt.text.caption, tt.ink.faint, tt.numeral)}>
                    Duration: {duration} minutes
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DrawerFooter className="gap-3 border-t border-[#1a4d42]/12 bg-[#f8fbfa] px-6 py-4 dark:border-white/10 dark:bg-[#071411]">
          <div className="flex w-full items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading} className={cn("h-10 flex-1 border border-[#1a4d42]/12 font-semibold hover:bg-[#e8f2ef] dark:border-white/10 dark:hover:bg-white/10", tt.ink.base, tt.focus)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValidDuration || loading || !formData.startTime || !formData.endTime}
              className={cn("h-10 flex-1 font-semibold disabled:opacity-50", tt.accentBtn, tt.focus)}
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

