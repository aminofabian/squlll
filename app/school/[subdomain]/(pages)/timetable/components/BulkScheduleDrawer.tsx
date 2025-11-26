'use client';

import { useState } from 'react';
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';
import { useToast } from '@/components/ui/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import type { TimeSlot, Break } from '@/lib/types/timetable';

interface BulkScheduleDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface BreakConfig {
  enabled: boolean;
  name: string;
  afterPeriod: number;
  durationMinutes: number;
  type: 'short_break' | 'lunch' | 'assembly';
  icon: string;
}

export function BulkScheduleDrawer({ open, onClose }: BulkScheduleDrawerProps) {
  const { bulkSetSchedule, createTimeSlots } = useTimetableStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    startTime: '08:00',
    lessonDuration: 45,
    numberOfPeriods: 10,
    applyToAllDays: true,
  });

  const [breaks, setBreaks] = useState<BreakConfig[]>([
    {
      enabled: true,
      name: 'Morning Break',
      afterPeriod: 3,
      durationMinutes: 15,
      type: 'short_break' as const,
      icon: '☕',
    },
    {
      enabled: true,
      name: 'Lunch',
      afterPeriod: 6,
      durationMinutes: 45,
      type: 'lunch' as const,
      icon: '🍽️',
    },
    {
      enabled: true,
      name: 'Afternoon Break',
      afterPeriod: 8,
      durationMinutes: 15,
      type: 'short_break' as const,
      icon: '☕',
    },
  ]);

  const [preview, setPreview] = useState<{
    timeSlots: TimeSlot[];
    breaks: Break[];
    endTime: string;
  } | null>(null);

  const [showPreview, setShowPreview] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Helper: Add minutes to time string
  const addMinutes = (timeStr: string, minutes: number): string => {
    const [hours, mins] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  };

  // Helper: Format time to 12-hour format
  const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Helper: Get break type icon
  const getBreakTypeIcon = (type: string) => {
    switch (type) {
      case 'lunch':
        return '🍽️';
      case 'assembly':
        return '📢';
      default:
        return '☕';
    }
  };

  // Helper: Get break type color
  const getBreakTypeColor = (type: string) => {
    switch (type) {
      case 'lunch':
        return 'bg-orange-500';
      case 'assembly':
        return 'bg-purple-500';
      default:
        return 'bg-blue-500';
    }
  };

  // Generate preview
  const generatePreview = () => {
    const { startTime, lessonDuration, numberOfPeriods } = formData;
    const timeSlots: TimeSlot[] = [];
    const generatedBreaks: Break[] = [];
    
    let currentTime = startTime;
    
    for (let i = 0; i < numberOfPeriods; i++) {
      const periodNumber = i + 1;
      const periodStart = currentTime;
      const periodEnd = addMinutes(currentTime, lessonDuration);
      
      // Create time slot
      timeSlots.push({
        id: `slot-${periodNumber}`,
        periodNumber,
        time: `${formatTime12Hour(periodStart)} – ${formatTime12Hour(periodEnd)}`,
        startTime: periodStart,
        endTime: periodEnd,
        color: 'border-l-primary',
      });
      
      currentTime = periodEnd;
      
      // Check if there are breaks after this period (handle multiple breaks)
      const breaksAfter = breaks.filter((b) => b.enabled && b.afterPeriod === periodNumber);
      for (const breakAfter of breaksAfter) {
        // Add break times for all days
        for (let day = 1; day <= 5; day++) {
          generatedBreaks.push({
            id: `break-${periodNumber}-${breakAfter.name}-${day}`,
            name: breakAfter.name,
            type: breakAfter.type,
            dayOfWeek: day,
            afterPeriod: periodNumber,
            startTime: currentTime,
            endTime: addMinutes(currentTime, breakAfter.durationMinutes),
            durationMinutes: breakAfter.durationMinutes,
            icon: breakAfter.icon,
            color: getBreakTypeColor(breakAfter.type),
          });
        }
        currentTime = addMinutes(currentTime, breakAfter.durationMinutes);
      }
    }
    
    setPreview({
      timeSlots,
      breaks: generatedBreaks,
      endTime: currentTime,
    });
    setShowPreview(true);
  };

  // Apply the schedule
  const handleApply = async () => {
    if (!preview) return;
    
    if (confirm('This will replace your current schedule. Are you sure?')) {
      setIsCreating(true);
      try {
        // Convert TimeSlot[] to TimeSlotInput[] for API
        const timeSlotInputs = preview.timeSlots.map((slot) => ({
          periodNumber: slot.periodNumber,
          displayTime: slot.time,
          startTime: slot.startTime,
          endTime: slot.endTime,
          color: slot.color || '#3B82F6',
        }));

        // Create time slots via API
        await createTimeSlots(timeSlotInputs);
        
        // Update local store with breaks
        bulkSetSchedule(preview.timeSlots, preview.breaks);

        // Show success toast
        toast({
          title: 'Time slots created successfully!',
          description: `Created ${preview.timeSlots.length} time slot${preview.timeSlots.length !== 1 ? 's' : ''} and ${preview.breaks.length} break${preview.breaks.length !== 1 ? 's' : ''}.`,
          variant: 'success',
        });

        onClose();
      } catch (error) {
        console.error('Error creating time slots:', error);
        toast({
          title: 'Failed to create time slots',
          description: error instanceof Error ? error.message : 'An error occurred while creating time slots.',
          variant: 'destructive',
        });
      } finally {
        setIsCreating(false);
      }
    }
  };

  const updateBreak = (index: number, updates: Partial<BreakConfig>) => {
    setBreaks((prev) =>
      prev.map((b, i) => (i === index ? { ...b, ...updates } : b))
    );
  };

  const addBreak = (type: 'morning' | 'lunch' | 'afternoon' | 'custom') => {
    const breakDefaults = {
      morning: {
        name: 'Morning Break',
        afterPeriod: Math.min(3, formData.numberOfPeriods),
        durationMinutes: 15,
        type: 'short_break' as const,
        icon: '☕',
      },
      lunch: {
        name: 'Lunch',
        afterPeriod: Math.min(6, formData.numberOfPeriods),
        durationMinutes: 45,
        type: 'lunch' as const,
        icon: '🍽️',
      },
      afternoon: {
        name: 'Afternoon Break',
        afterPeriod: Math.min(8, formData.numberOfPeriods),
        durationMinutes: 15,
        type: 'short_break' as const,
        icon: '☕',
      },
      custom: {
        name: 'Break',
        afterPeriod: Math.min(5, formData.numberOfPeriods),
        durationMinutes: 15,
        type: 'short_break' as const,
        icon: '☕',
      },
    };

    const newBreak: BreakConfig = {
      enabled: true,
      ...breakDefaults[type],
    };

    setBreaks((prev) => [...prev, newBreak].sort((a, b) => a.afterPeriod - b.afterPeriod));
  };

  const removeBreak = (index: number) => {
    setBreaks((prev) => prev.filter((_, i) => i !== index));
  };

  const totalDuration = () => {
    if (!preview) return 0;
    const start = formData.startTime.split(':').map(Number);
    const end = preview.endTime.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    return endMinutes - startMinutes;
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Bulk Schedule Setup</SheetTitle>
          <SheetDescription>
            Configure your entire timetable structure in one go
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Settings</h3>
            
            <div className="space-y-2">
              <Label htmlFor="startTime">School Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lessonDuration">Lesson Duration (minutes)</Label>
              <Input
                id="lessonDuration"
                type="number"
                min="30"
                max="90"
                value={formData.lessonDuration}
                onChange={(e) =>
                  setFormData({ ...formData, lessonDuration: parseInt(e.target.value) || 45 })
                }
              />
              <p className="text-xs text-gray-500">Typical: 40-45 minutes</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfPeriods">Number of Periods</Label>
              <Input
                id="numberOfPeriods"
                type="number"
                min="4"
                max="12"
                value={formData.numberOfPeriods}
                onChange={(e) =>
                  setFormData({ ...formData, numberOfPeriods: parseInt(e.target.value) || 8 })
                }
              />
              <p className="text-xs text-gray-500">Typical: 8-10 periods per day</p>
            </div>
          </div>

          {/* Break Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Break Schedule</h3>
            </div>

            {/* Quick Add Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBreak('morning')}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Morning Break
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBreak('lunch')}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Lunch
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBreak('afternoon')}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Afternoon Break
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBreak('custom')}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Custom Break
              </Button>
            </div>
            
            {breaks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No breaks added yet. Use the buttons above to add breaks.
              </div>
            ) : (
              <div className="space-y-3">
                {breaks.map((breakConfig, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 space-y-3 ${
                      breakConfig.enabled ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={breakConfig.enabled}
                          onCheckedChange={(checked) =>
                            updateBreak(index, { enabled: checked as boolean })
                          }
                        />
                        <span className="font-medium">
                          {breakConfig.icon} {breakConfig.name}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBreak(index)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {breakConfig.enabled && (
                      <>
                        <div className="space-y-1">
                          <Label className="text-xs">Break Type</Label>
                          <Select
                            value={breakConfig.type}
                            onValueChange={(value) => {
                              const newType = value as 'short_break' | 'lunch' | 'assembly';
                              const newIcon = getBreakTypeIcon(newType);
                              updateBreak(index, { type: newType, icon: newIcon });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="short_break">☕ Short Break</SelectItem>
                              <SelectItem value="lunch">🍽️ Lunch</SelectItem>
                              <SelectItem value="assembly">📢 Assembly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">After Period</Label>
                            <Input
                              type="number"
                              min="1"
                              max={formData.numberOfPeriods}
                              value={breakConfig.afterPeriod}
                              onChange={(e) =>
                                updateBreak(index, { afterPeriod: parseInt(e.target.value) || 1 })
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Duration (min)</Label>
                            <Input
                              type="number"
                              min="5"
                              max="120"
                              value={breakConfig.durationMinutes}
                              onChange={(e) =>
                                updateBreak(index, {
                                  durationMinutes: parseInt(e.target.value) || 15,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Break Name</Label>
                          <Input
                            value={breakConfig.name}
                            onChange={(e) => updateBreak(index, { name: e.target.value })}
                            placeholder="e.g., Morning Break, Lunch, Afternoon Break"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Icon (emoji)</Label>
                          <Input
                            value={breakConfig.icon}
                            onChange={(e) => updateBreak(index, { icon: e.target.value })}
                            placeholder="☕"
                            maxLength={2}
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview Button */}
          <Button onClick={generatePreview} className="w-full" variant="outline">
            Generate Preview
          </Button>

          {/* Preview Section */}
          {showPreview && preview && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">📊 Schedule Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total Periods:</span>
                    <span className="font-medium">{preview.timeSlots.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Breaks:</span>
                    <span className="font-medium">{breaks.filter((b) => b.enabled).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Start Time:</span>
                    <span className="font-medium">{formatTime12Hour(formData.startTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>End Time:</span>
                    <span className="font-medium">{formatTime12Hour(preview.endTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Duration:</span>
                    <span className="font-medium">
                      {Math.floor(totalDuration() / 60)}h {totalDuration() % 60}m
                    </span>
                  </div>
                </div>
              </div>

              {/* Schedule Preview */}
              <div className="border rounded-lg p-4 space-y-2 max-h-[300px] overflow-y-auto">
                <h4 className="font-semibold text-sm mb-3">Schedule Preview:</h4>
                {preview.timeSlots.map((slot, index) => {
                  const breaksAfter = breaks.filter(
                    (b) => b.enabled && b.afterPeriod === slot.periodNumber
                  );
                  return (
                    <div key={slot.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                        <span className="font-medium">Period {slot.periodNumber}</span>
                        <span className="text-gray-600">{slot.time}</span>
                      </div>
                      {breaksAfter.map((breakAfter, breakIndex) => (
                        <div
                          key={`${slot.id}-break-${breakIndex}`}
                          className={`flex items-center justify-between text-sm p-2 rounded ml-4 ${
                            breakAfter.type === 'lunch'
                              ? 'bg-orange-50'
                              : breakAfter.type === 'assembly'
                                ? 'bg-purple-50'
                                : 'bg-blue-50'
                          }`}
                        >
                          <span>
                            {breakAfter.icon} {breakAfter.name}
                          </span>
                          <span className="text-gray-600">{breakAfter.durationMinutes} min</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={!showPreview || isCreating}>
            {isCreating ? 'Creating...' : 'Apply Schedule'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

