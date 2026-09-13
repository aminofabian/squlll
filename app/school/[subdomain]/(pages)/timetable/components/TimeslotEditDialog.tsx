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
      <DrawerContent className="w-full sm:w-[500px] lg:w-[600px] h-full flex flex-col">
        <DrawerHeader className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b-2 border-primary/20 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
            <DrawerTitle className="text-2xl font-bold text-primary flex items-center gap-3">
              <span className="text-3xl">⏰</span>
              <span>Edit Period {timeslot.periodNumber}</span>
            </DrawerTitle>
              <DrawerDescription className="mt-2">
                Update this period's start time, end time, and duration.
              </DrawerDescription>
            </div>
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

          {/* Primary: Start & End Times */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startTime" className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                Start time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                disabled={loading}
                className="h-10 text-base font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endTime" className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                End time
              </Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                disabled={loading}
                className="h-10 text-base font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          {formData.startTime && formData.endTime && !isValidDuration ? (
            <p className="text-xs font-medium text-red-600 dark:text-red-400">
              End time must be after the start time.
            </p>
          ) : null}

          {/* Label (optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="label" className="text-sm text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
              <span>Label</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">(optional)</span>
            </Label>
            <Input
              id="label"
              type="text"
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              placeholder="e.g., Double Period"
              disabled={loading}
              className="h-10 text-base font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-slate-100"
            />
          </div>

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
              This change will affect all lessons scheduled in this period across all grades.
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

