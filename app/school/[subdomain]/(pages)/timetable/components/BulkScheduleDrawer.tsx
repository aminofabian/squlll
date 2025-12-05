'use client';

import { useState, useMemo, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Clock, Coffee, UtensilsCrossed, Megaphone, Sparkles, X } from 'lucide-react';
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
  type: 'short_break' | 'lunch' | 'assembly' | 'long_break' | 'afternoon_break' | 'games';
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
      name: 'Long Break',
      afterPeriod: 4,
      durationMinutes: 45,
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
  const [showCustomTemplate, setShowCustomTemplate] = useState(false);
  const [activeTab, setActiveTab] = useState('setup');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editMode, setEditMode] = useState<'edit' | 'create' | null>(null);
  const [customBreaks, setCustomBreaks] = useState<Array<{
    afterPeriod: number;
    type: 'short_break' | 'lunch' | 'assembly' | 'games' | 'long_break' | 'afternoon_break';
    durationMinutes: number;
  }>>([
    { afterPeriod: 8, type: 'games', durationMinutes: 40 },
  ]);

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
      case 'games':
        return '⚽';
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
    
    // Handle assembly/breaks at the start (afterPeriod: 0)
    const breaksAtStart = breaks.filter((b) => b.enabled && b.afterPeriod === 0);
    for (const breakAtStart of breaksAtStart) {
      for (let day = 1; day <= 5; day++) {
        // Map break types to supported Break type
        let breakType: 'short_break' | 'lunch' | 'assembly' = 'short_break';
        if (breakAtStart.type === 'lunch') breakType = 'lunch';
        else if (breakAtStart.type === 'assembly') breakType = 'assembly';
        // games, long_break, afternoon_break map to short_break
        
        generatedBreaks.push({
          id: `break-0-${breakAtStart.name}-${day}`,
          name: breakAtStart.name,
          type: breakType,
          dayOfWeek: day,
          afterPeriod: 0,
          startTime: currentTime,
          endTime: addMinutes(currentTime, breakAtStart.durationMinutes),
          durationMinutes: breakAtStart.durationMinutes,
          icon: breakAtStart.icon,
          color: getBreakTypeColor(breakAtStart.type),
        });
      }
      currentTime = addMinutes(currentTime, breakAtStart.durationMinutes);
    }
    
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
        // Map break types to supported Break type
        let breakType: 'short_break' | 'lunch' | 'assembly' = 'short_break';
        if (breakAfter.type === 'lunch') breakType = 'lunch';
        else if (breakAfter.type === 'assembly') breakType = 'assembly';
        // games, long_break, afternoon_break map to short_break
        
        // Add break times for all days
        for (let day = 1; day <= 5; day++) {
          generatedBreaks.push({
            id: `break-${periodNumber}-${breakAfter.name}-${day}`,
            name: breakAfter.name,
            type: breakType,
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

  // Delete a time slot (period)
  const deleteTimeSlot = (periodNumber: number) => {
    if (!preview) return;
    
    // Calculate new number of periods
    const newNumberOfPeriods = Math.max(1, formData.numberOfPeriods - 1);
    
    // Remove breaks that are after the deleted period, and adjust break afterPeriod values
    const updatedBreaks = breaks
      .filter((b) => b.afterPeriod !== periodNumber)
      .map((b) => {
        if (b.afterPeriod > periodNumber) {
          return { ...b, afterPeriod: Math.max(0, b.afterPeriod - 1) };
        }
        return b;
      });
    
    // Update breaks first
    setBreaks(updatedBreaks);
    
    // Update form data with new number of periods
    const updatedFormData = {
      ...formData,
      numberOfPeriods: newNumberOfPeriods,
    };
    setFormData(updatedFormData);
    
    // Regenerate preview with updated data - use the updated values directly
    const { startTime, lessonDuration } = updatedFormData;
    const timeSlots: TimeSlot[] = [];
    const generatedBreaks: Break[] = [];
    
    let currentTime = startTime;
    
    // Handle assembly/breaks at the start (afterPeriod: 0)
    const breaksAtStart = updatedBreaks.filter((b) => b.enabled && b.afterPeriod === 0);
    for (const breakAtStart of breaksAtStart) {
      for (let day = 1; day <= 5; day++) {
        let breakType: 'short_break' | 'lunch' | 'assembly' = 'short_break';
        if (breakAtStart.type === 'lunch') breakType = 'lunch';
        else if (breakAtStart.type === 'assembly') breakType = 'assembly';
        
        generatedBreaks.push({
          id: `break-0-${breakAtStart.name}-${day}`,
          name: breakAtStart.name,
          type: breakType,
          dayOfWeek: day,
          afterPeriod: 0,
          startTime: currentTime,
          endTime: addMinutes(currentTime, breakAtStart.durationMinutes),
          durationMinutes: breakAtStart.durationMinutes,
          icon: breakAtStart.icon,
          color: getBreakTypeColor(breakAtStart.type),
        });
      }
      currentTime = addMinutes(currentTime, breakAtStart.durationMinutes);
    }
    
    for (let i = 0; i < newNumberOfPeriods; i++) {
      const periodNumber = i + 1;
      const periodStart = currentTime;
      const periodEnd = addMinutes(currentTime, lessonDuration);
      
      timeSlots.push({
        id: `slot-${periodNumber}`,
        periodNumber,
        time: `${formatTime12Hour(periodStart)} – ${formatTime12Hour(periodEnd)}`,
        startTime: periodStart,
        endTime: periodEnd,
        color: 'border-l-primary',
      });
      
      currentTime = periodEnd;
      
      const breaksAfter = updatedBreaks.filter((b) => b.enabled && b.afterPeriod === periodNumber);
      for (const breakAfter of breaksAfter) {
        let breakType: 'short_break' | 'lunch' | 'assembly' = 'short_break';
        if (breakAfter.type === 'lunch') breakType = 'lunch';
        else if (breakAfter.type === 'assembly') breakType = 'assembly';
        
        for (let day = 1; day <= 5; day++) {
          generatedBreaks.push({
            id: `break-${periodNumber}-${breakAfter.name}-${day}`,
            name: breakAfter.name,
            type: breakType,
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
  };

  // Delete a break
  const deleteBreak = (breakName: string, afterPeriod: number) => {
    const updatedBreaks = breaks.filter((b) => !(b.name === breakName && b.afterPeriod === afterPeriod));
    setBreaks(updatedBreaks);
    
    // Regenerate preview immediately with updated breaks
    const { startTime, lessonDuration, numberOfPeriods } = formData;
    const timeSlots: TimeSlot[] = [];
    const generatedBreaks: Break[] = [];
    
    let currentTime = startTime;
    
    // Handle assembly/breaks at the start (afterPeriod: 0)
    const breaksAtStart = updatedBreaks.filter((b) => b.enabled && b.afterPeriod === 0);
    for (const breakAtStart of breaksAtStart) {
      for (let day = 1; day <= 5; day++) {
        let breakType: 'short_break' | 'lunch' | 'assembly' = 'short_break';
        if (breakAtStart.type === 'lunch') breakType = 'lunch';
        else if (breakAtStart.type === 'assembly') breakType = 'assembly';
        
        generatedBreaks.push({
          id: `break-0-${breakAtStart.name}-${day}`,
          name: breakAtStart.name,
          type: breakType,
          dayOfWeek: day,
          afterPeriod: 0,
          startTime: currentTime,
          endTime: addMinutes(currentTime, breakAtStart.durationMinutes),
          durationMinutes: breakAtStart.durationMinutes,
          icon: breakAtStart.icon,
          color: getBreakTypeColor(breakAtStart.type),
        });
      }
      currentTime = addMinutes(currentTime, breakAtStart.durationMinutes);
    }
    
    for (let i = 0; i < numberOfPeriods; i++) {
      const periodNumber = i + 1;
      const periodStart = currentTime;
      const periodEnd = addMinutes(currentTime, lessonDuration);
      
      timeSlots.push({
        id: `slot-${periodNumber}`,
        periodNumber,
        time: `${formatTime12Hour(periodStart)} – ${formatTime12Hour(periodEnd)}`,
        startTime: periodStart,
        endTime: periodEnd,
        color: 'border-l-primary',
      });
      
      currentTime = periodEnd;
      
      const breaksAfter = updatedBreaks.filter((b) => b.enabled && b.afterPeriod === periodNumber);
      for (const breakAfter of breaksAfter) {
        let breakType: 'short_break' | 'lunch' | 'assembly' = 'short_break';
        if (breakAfter.type === 'lunch') breakType = 'lunch';
        else if (breakAfter.type === 'assembly') breakType = 'assembly';
        
        for (let day = 1; day <= 5; day++) {
          generatedBreaks.push({
            id: `break-${periodNumber}-${breakAfter.name}-${day}`,
            name: breakAfter.name,
            type: breakType,
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
  };

  // Apply the schedule
  const handleApply = async () => {
    if (!preview) return;
    
      setIsCreating(true);
    
    // Show info toast about replacement
    toast({
      title: 'Replacing schedule...',
      description: 'Your current schedule will be replaced with the new one.',
      variant: 'default',
    });
    
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
        title: 'Schedule updated successfully!',
          description: `Created ${preview.timeSlots.length} time slot${preview.timeSlots.length !== 1 ? 's' : ''} and ${preview.breaks.length} break${preview.breaks.length !== 1 ? 's' : ''}.`,
        variant: 'default',
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
  };

  const updateBreak = (index: number, updates: Partial<BreakConfig>) => {
    setBreaks((prev) =>
      prev.map((b, i) => (i === index ? { ...b, ...updates } : b))
    );
  };

  const addBreak = (type: 'morning' | 'lunch' | 'afternoon' | 'assembly' | 'custom') => {
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
      assembly: {
        name: 'Assembly',
        afterPeriod: 0,
        durationMinutes: 15,
        type: 'assembly' as const,
        icon: '📢',
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

  // Get break type icon and name
  const getBreakTypeInfo = (type: 'short_break' | 'lunch' | 'assembly' | 'games' | 'long_break' | 'afternoon_break') => {
    switch (type) {
      case 'lunch':
        return { icon: '🍽️', name: 'Lunch', color: 'orange' };
      case 'assembly':
        return { icon: '📢', name: 'Assembly', color: 'purple' };
      case 'games':
        return { icon: '⚽', name: 'Games', color: 'green' };
      case 'long_break':
        return { icon: '☕', name: 'Long Break', color: 'indigo' };
      case 'afternoon_break':
        return { icon: '☕', name: 'Afternoon Break', color: 'amber' };
      default:
        return { icon: '☕', name: 'Short Break', color: 'blue' };
    }
  };

  // Apply custom template
  const applyCustomTemplate = () => {
    const breakConfigs: BreakConfig[] = customBreaks.map((cb, index) => {
      const info = getBreakTypeInfo(cb.type);
      // Map custom types to BreakConfig types (all types are now supported)
      const breakType = cb.type as BreakConfig['type'];
      
      return {
        enabled: true,
        name: info.name,
        afterPeriod: cb.afterPeriod,
        durationMinutes: cb.durationMinutes,
        type: breakType,
        icon: info.icon,
      };
    });
    
    setBreaks(breakConfigs);
    setShowCustomTemplate(false);
    setShowPreview(false);
    
    // Generate preview for step 1 display
    setTimeout(() => {
      generatePreview();
    }, 0);
    
    toast({
      title: 'Custom template applied!',
      description: `Applied ${breakConfigs.length} break${breakConfigs.length !== 1 ? 's' : ''} to your schedule.`,
      variant: 'default',
    });
  };

  const addCustomBreak = () => {
    setCustomBreaks([...customBreaks, { afterPeriod: 4, type: 'short_break', durationMinutes: 15 }]);
  };

  const removeCustomBreak = (index: number) => {
    setCustomBreaks(customBreaks.filter((_, i) => i !== index));
  };

  const updateCustomBreak = (index: number, updates: Partial<typeof customBreaks[0]>) => {
    setCustomBreaks(customBreaks.map((cb, i) => i === index ? { ...cb, ...updates } : cb));
  };

  // Template display names
  const getTemplateDisplayName = (template: string): string => {
    const names: Record<string, string> = {
      standard: 'Standard',
      extended: 'Extended',
      compact: 'Compact',
      early_break: 'Early Break',
      regular_breaks: 'Regular',
      structured: 'Structured',
      structured_45: 'Structured 45',
      balanced: 'Balanced',
      intensive: 'Intensive',
      games_focused: 'Games Focus',
      custom: 'Custom',
    };
    return names[template] || 'Custom';
  };

  // Template descriptions for hover
  const getTemplateDescription = (template: string): string => {
    const descriptions: Record<string, string> = {
      standard: '8 periods with 45-minute lessons. Includes morning break after period 3 and lunch after period 5. Perfect for most schools.',
      extended: '10 periods with 50-minute lessons. Includes morning break, lunch, and afternoon break. Ideal for schools with longer days.',
      compact: '7 periods with 40-minute lessons. Single lunch break. Great for shorter school days.',
      early_break: '8 periods with assembly at start, morning break after 2 lessons, lunch, and afternoon break. Balanced schedule.',
      regular_breaks: '8 periods with 45-minute lessons. Single short break after period 4. Simple and straightforward.',
      structured: '8 periods with 40-minute lessons. Assembly at start, short break after 2 lessons, long break after 4, lunch after 6, and games after 8.',
      structured_45: '8 periods with 45-minute lessons. Assembly at start, short break after 2 lessons, long break after 4, lunch after 6, and games after 8.',
      balanced: '8 periods with 45-minute lessons. Morning break, lunch, afternoon break, and games. Evenly distributed breaks.',
      intensive: '9 periods with 50-minute lessons. Minimal breaks for maximum learning time. Starts at 7:30 AM.',
      games_focused: '8 periods with 40-minute lessons. Two games periods for schools emphasizing physical activity.',
      custom: 'Build your own template with full control over periods, breaks, and timing.',
    };
    return descriptions[template] || 'Custom template configuration.';
  };

  // Quick templates
  const applyTemplate = (template: 'standard' | 'extended' | 'compact' | 'early_break' | 'regular_breaks' | 'structured' | 'structured_45' | 'balanced' | 'intensive' | 'games_focused' | 'custom') => {
    if (template === 'custom') {
      // Reset to default: games after lessons
      setCustomBreaks([{ afterPeriod: formData.numberOfPeriods, type: 'games', durationMinutes: 40 }]);
      setShowCustomTemplate(true);
      setSelectedTemplate('custom');
      return;
    }
    
    setSelectedTemplate(template);
    const templates = {
      standard: {
        startTime: '08:00',
        lessonDuration: 45,
        numberOfPeriods: 8,
        breaks: [
          { enabled: true, name: 'Morning Break', afterPeriod: 3, durationMinutes: 15, type: 'short_break' as const, icon: '☕' },
          { enabled: true, name: 'Lunch', afterPeriod: 5, durationMinutes: 45, type: 'lunch' as const, icon: '🍽️' },
        ],
      },
      extended: {
        startTime: '07:30',
        lessonDuration: 50,
        numberOfPeriods: 10,
        breaks: [
          { enabled: true, name: 'Morning Break', afterPeriod: 3, durationMinutes: 20, type: 'short_break' as const, icon: '☕' },
          { enabled: true, name: 'Lunch', afterPeriod: 6, durationMinutes: 60, type: 'lunch' as const, icon: '🍽️' },
          { enabled: true, name: 'Afternoon Break', afterPeriod: 8, durationMinutes: 15, type: 'short_break' as const, icon: '☕' },
        ],
      },
      compact: {
        startTime: '08:30',
        lessonDuration: 40,
        numberOfPeriods: 7,
        breaks: [
          { enabled: true, name: 'Lunch', afterPeriod: 4, durationMinutes: 40, type: 'lunch' as const, icon: '🍽️' },
        ],
      },
      early_break: {
        startTime: '08:00',
        lessonDuration: 45,
        numberOfPeriods: 8,
        breaks: [
          { enabled: true, name: 'Assembly', afterPeriod: 0, durationMinutes: 15, type: 'assembly' as const, icon: '📢' },
          { enabled: true, name: 'Morning Break', afterPeriod: 2, durationMinutes: 15, type: 'short_break' as const, icon: '☕' },
          { enabled: true, name: 'Lunch', afterPeriod: 5, durationMinutes: 45, type: 'lunch' as const, icon: '🍽️' },
          { enabled: true, name: 'Afternoon Break', afterPeriod: 7, durationMinutes: 15, type: 'short_break' as const, icon: '☕' },
        ],
      },
      regular_breaks: {
        startTime: '08:00',
        lessonDuration: 45,
        numberOfPeriods: 8,
        breaks: [
          { enabled: true, name: 'Short Break', afterPeriod: 4, durationMinutes: 15, type: 'short_break' as const, icon: '☕' },
        ],
      },
      structured: {
        startTime: '08:00',
        lessonDuration: 40,
        numberOfPeriods: 8,
        breaks: [
          { enabled: true, name: 'Morning Assembly', afterPeriod: 0, durationMinutes: 15, type: 'assembly' as const, icon: '📢' },
          { enabled: true, name: 'Short Break', afterPeriod: 2, durationMinutes: 15, type: 'short_break' as const, icon: '☕' },
          { enabled: true, name: 'Long Break', afterPeriod: 4, durationMinutes: 30, type: 'short_break' as const, icon: '☕' },
          { enabled: true, name: 'Lunch', afterPeriod: 6, durationMinutes: 45, type: 'lunch' as const, icon: '🍽️' },
          { enabled: true, name: 'Games', afterPeriod: 8, durationMinutes: 40, type: 'short_break' as const, icon: '⚽' },
        ],
      },
      structured_45: {
        startTime: '08:00',
        lessonDuration: 45,
        numberOfPeriods: 8,
        breaks: [
          { enabled: true, name: 'Morning Assembly', afterPeriod: 0, durationMinutes: 15, type: 'assembly' as const, icon: '📢' },
          { enabled: true, name: 'Short Break', afterPeriod: 2, durationMinutes: 15, type: 'short_break' as const, icon: '☕' },
          { enabled: true, name: 'Long Break', afterPeriod: 4, durationMinutes: 30, type: 'short_break' as const, icon: '☕' },
          { enabled: true, name: 'Lunch', afterPeriod: 6, durationMinutes: 45, type: 'lunch' as const, icon: '🍽️' },
          { enabled: true, name: 'Games', afterPeriod: 8, durationMinutes: 40, type: 'short_break' as const, icon: '⚽' },
        ],
      },
      balanced: {
        startTime: '08:00',
        lessonDuration: 45,
        numberOfPeriods: 8,
        breaks: [
          { enabled: true, name: 'Morning Break', afterPeriod: 2, durationMinutes: 20, type: 'short_break' as const, icon: '☕' },
          { enabled: true, name: 'Lunch', afterPeriod: 4, durationMinutes: 50, type: 'lunch' as const, icon: '🍽️' },
          { enabled: true, name: 'Afternoon Break', afterPeriod: 6, durationMinutes: 15, type: 'short_break' as const, icon: '☕' },
          { enabled: true, name: 'Games', afterPeriod: 8, durationMinutes: 45, type: 'short_break' as const, icon: '⚽' },
        ],
      },
      intensive: {
        startTime: '07:30',
        lessonDuration: 50,
        numberOfPeriods: 9,
        breaks: [
          { enabled: true, name: 'Short Break', afterPeriod: 3, durationMinutes: 10, type: 'short_break' as const, icon: '☕' },
          { enabled: true, name: 'Lunch', afterPeriod: 5, durationMinutes: 40, type: 'lunch' as const, icon: '🍽️' },
          { enabled: true, name: 'Short Break', afterPeriod: 7, durationMinutes: 10, type: 'short_break' as const, icon: '☕' },
        ],
      },
      games_focused: {
        startTime: '08:00',
        lessonDuration: 40,
        numberOfPeriods: 8,
        breaks: [
          { enabled: true, name: 'Morning Break', afterPeriod: 2, durationMinutes: 15, type: 'short_break' as const, icon: '☕' },
          { enabled: true, name: 'Lunch', afterPeriod: 4, durationMinutes: 45, type: 'lunch' as const, icon: '🍽️' },
          { enabled: true, name: 'Games Period 1', afterPeriod: 6, durationMinutes: 40, type: 'short_break' as const, icon: '⚽' },
          { enabled: true, name: 'Games Period 2', afterPeriod: 8, durationMinutes: 40, type: 'short_break' as const, icon: '⚽' },
        ],
      },
    };

    const selected = templates[template];
    setFormData({
      startTime: selected.startTime,
      lessonDuration: selected.lessonDuration,
      numberOfPeriods: selected.numberOfPeriods,
      applyToAllDays: true,
    });
    setBreaks(selected.breaks);
    setShowPreview(false);
    setSelectedTemplate(template);
    
    // Generate preview for step 1 display
    setTimeout(() => {
      generatePreview();
    }, 0);
  };

  // Visual timeline preview (real-time)
  const timelinePreview = useMemo(() => {
    const { startTime, lessonDuration, numberOfPeriods } = formData;
    const timeline: Array<{ 
      type: 'period' | 'break'; 
      period?: number; 
      break?: BreakConfig; 
      startTime: string;
      endTime: string;
    }> = [];
    
    let currentTime = startTime;
    
    // Handle breaks at the start (afterPeriod: 0, e.g., assembly)
    const breaksAtStart = breaks.filter((b) => b.enabled && b.afterPeriod === 0);
    for (const breakAtStart of breaksAtStart) {
      const breakEndTime = addMinutes(currentTime, breakAtStart.durationMinutes);
      timeline.push({ 
        type: 'break', 
        break: breakAtStart, 
        startTime: currentTime,
        endTime: breakEndTime
      });
      currentTime = breakEndTime;
    }
    
    for (let i = 0; i < numberOfPeriods; i++) {
      const periodNumber = i + 1;
      const periodStart = currentTime;
      const periodEnd = addMinutes(currentTime, lessonDuration);
      timeline.push({ 
        type: 'period', 
        period: periodNumber, 
        startTime: periodStart,
        endTime: periodEnd
      });
      currentTime = periodEnd;
      
      const breaksAfter = breaks.filter((b) => b.enabled && b.afterPeriod === periodNumber);
      for (const breakAfter of breaksAfter) {
        const breakStart = currentTime;
        const breakEnd = addMinutes(currentTime, breakAfter.durationMinutes);
        timeline.push({ 
          type: 'break', 
          break: breakAfter, 
          startTime: breakStart,
          endTime: breakEnd
        });
        currentTime = breakEnd;
      }
    }
    
    return timeline;
  }, [formData, breaks]);

  // Auto-regenerate preview when formData or breaks change (if preview is already showing or in step 1)
  useEffect(() => {
    if (showPreview || currentStep === 1) {
      generatePreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.startTime, formData.lessonDuration, formData.numberOfPeriods, showPreview, currentStep]);

  // Auto-regenerate preview when breaks change (if preview is already showing or in step 1)
  useEffect(() => {
    if (showPreview || currentStep === 1) {
      generatePreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breaks, showPreview, currentStep]);

  // Reset to step 1 when drawer opens
  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      setSelectedTemplate(null);
      setShowPreview(false);
      setEditMode(null);
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[700px] overflow-y-auto p-0">
        <SheetHeader className="bg-white dark:bg-slate-900 px-6 pt-6 pb-4 border-b border-slate-300 dark:border-slate-600">
          <SheetTitle className="text-xl font-bold text-primary">Bulk Schedule Setup</SheetTitle>
          <SheetDescription className="text-sm text-slate-600 dark:text-slate-400">
            Configure your entire timetable structure step by step
          </SheetDescription>
        </SheetHeader>

        {/* Step Indicator */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 flex items-center justify-center text-sm font-semibold transition-colors ${
                      currentStep === step
                        ? 'bg-primary text-white'
                        : currentStep > step
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {currentStep > step ? '✓' : step}
                  </div>
                  <span className="text-xs mt-1 text-center text-slate-600 dark:text-slate-400">
                    {step === 1 && 'Setup'}
                    {step === 2 && editMode === 'edit' ? 'Edit' : 'Review'}
                    {step === 3 && 'Save'}
                  </span>
                </div>
                {step < 3 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      currentStep > step ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 bg-slate-50 dark:bg-slate-900">
            {/* Step 1: Template Selection */}
            {currentStep === 1 && (
          <div className="space-y-4">
              {/* Quick Templates */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    Quick Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {/* First Row */}
                    <button
                      type="button"
                      onClick={() => applyTemplate('standard')}
                      className={`group relative overflow-visible rounded border-2 p-2.5 text-left transition-all duration-200 active:scale-95 ${
                        selectedTemplate === 'standard'
                          ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md'
                      }`}
                      title={getTemplateDescription('standard')}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                          selectedTemplate === 'standard'
                            ? 'bg-blue-500 text-white'
                            : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                        }`}>
                          {selectedTemplate === 'standard' ? (
                            <span className="text-sm">✓</span>
                          ) : (
                            <span className="text-sm">📚</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm ${
                            selectedTemplate === 'standard'
                              ? 'text-blue-900'
                              : 'text-gray-900 group-hover:text-blue-700'
                          }`}>Standard</div>
                          <div className="text-xs text-gray-500">8 periods, 2 breaks</div>
                        </div>
                      </div>
                      <div className={`absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 to-transparent transition-opacity ${
                        selectedTemplate === 'standard' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`} />
                      <div className="absolute left-0 right-0 top-full mt-1 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {getTemplateDescription('standard')}
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => applyTemplate('extended')}
                      className={`group relative overflow-visible rounded-lg border-2 p-2.5 text-left transition-all duration-200 active:scale-95 ${
                        selectedTemplate === 'extended'
                          ? 'border-purple-500 bg-purple-50 shadow-md ring-2 ring-purple-200'
                          : 'border-gray-200 bg-white hover:border-purple-400 hover:bg-purple-50 hover:shadow-md'
                      }`}
                      title={getTemplateDescription('extended')}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                          selectedTemplate === 'extended'
                            ? 'bg-purple-500 text-white'
                            : 'bg-purple-100 text-purple-600 group-hover:bg-purple-200'
                        }`}>
                          {selectedTemplate === 'extended' ? (
                            <span className="text-sm">✓</span>
                          ) : (
                            <span className="text-sm">⏰</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm ${
                            selectedTemplate === 'extended'
                              ? 'text-purple-900'
                              : 'text-gray-900 group-hover:text-purple-700'
                          }`}>Extended</div>
                          <div className="text-xs text-gray-500">10 periods, 3 breaks</div>
                        </div>
                      </div>
                      <div className={`absolute inset-0 -z-10 bg-gradient-to-br from-purple-50 to-transparent transition-opacity ${
                        selectedTemplate === 'extended' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`} />
                      <div className="absolute left-0 right-0 top-full mt-1 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {getTemplateDescription('extended')}
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => applyTemplate('compact')}
                      className={`group relative overflow-visible rounded-lg border-2 p-2.5 text-left transition-all duration-200 active:scale-95 ${
                        selectedTemplate === 'compact'
                          ? 'border-green-500 bg-green-50 shadow-md ring-2 ring-green-200'
                          : 'border-gray-200 bg-white hover:border-green-400 hover:bg-green-50 hover:shadow-md'
                      }`}
                      title={getTemplateDescription('compact')}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                          selectedTemplate === 'compact'
                            ? 'bg-green-500 text-white'
                            : 'bg-green-100 text-green-600 group-hover:bg-green-200'
                        }`}>
                          {selectedTemplate === 'compact' ? (
                            <span className="text-sm">✓</span>
                          ) : (
                            <span className="text-sm">⚡</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm ${
                            selectedTemplate === 'compact'
                              ? 'text-green-900'
                              : 'text-gray-900 group-hover:text-green-700'
                          }`}>Compact</div>
                          <div className="text-xs text-gray-500">7 periods, 1 break</div>
                        </div>
                      </div>
                      <div className={`absolute inset-0 -z-10 bg-gradient-to-br from-green-50 to-transparent transition-opacity ${
                        selectedTemplate === 'compact' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`} />
                      <div className="absolute left-0 right-0 top-full mt-1 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {getTemplateDescription('compact')}
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => applyTemplate('early_break')}
                      className={`group relative overflow-visible rounded-lg border-2 p-2.5 text-left transition-all duration-200 active:scale-95 ${
                        selectedTemplate === 'early_break'
                          ? 'border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-200'
                          : 'border-gray-200 bg-white hover:border-orange-400 hover:bg-orange-50 hover:shadow-md'
                      }`}
                      title={getTemplateDescription('early_break')}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                          selectedTemplate === 'early_break'
                            ? 'bg-orange-500 text-white'
                            : 'bg-orange-100 text-orange-600 group-hover:bg-orange-200'
                        }`}>
                          {selectedTemplate === 'early_break' ? (
                            <span className="text-sm">✓</span>
                          ) : (
                            <span className="text-sm">🌅</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm ${
                            selectedTemplate === 'early_break'
                              ? 'text-orange-900'
                              : 'text-gray-900 group-hover:text-orange-700'
                          }`}>Early Break</div>
                          <div className="text-xs text-gray-500">8 periods, assembly</div>
                        </div>
                      </div>
                      <div className={`absolute inset-0 -z-10 bg-gradient-to-br from-orange-50 to-transparent transition-opacity ${
                        selectedTemplate === 'early_break' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`} />
                      <div className="absolute left-0 right-0 top-full mt-1 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {getTemplateDescription('early_break')}
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => applyTemplate('regular_breaks')}
                      className={`group relative overflow-visible rounded-lg border-2 p-2.5 text-left transition-all duration-200 active:scale-95 ${
                        selectedTemplate === 'regular_breaks'
                          ? 'border-indigo-500 bg-indigo-50 shadow-md ring-2 ring-indigo-200'
                          : 'border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md'
                      }`}
                      title={getTemplateDescription('regular_breaks')}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                          selectedTemplate === 'regular_breaks'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200'
                        }`}>
                          {selectedTemplate === 'regular_breaks' ? (
                            <span className="text-sm">✓</span>
                          ) : (
                            <span className="text-sm">🔄</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm ${
                            selectedTemplate === 'regular_breaks'
                              ? 'text-indigo-900'
                              : 'text-gray-900 group-hover:text-indigo-700'
                          }`}>Regular</div>
                          <div className="text-xs text-gray-500">8 periods, 1 break</div>
                        </div>
                      </div>
                      <div className={`absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 to-transparent transition-opacity ${
                        selectedTemplate === 'regular_breaks' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`} />
                      <div className="absolute left-0 right-0 top-full mt-1 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {getTemplateDescription('regular_breaks')}
                      </div>
                    </button>
                    
                    {/* Second Row */}
                    <button
                      type="button"
                      onClick={() => applyTemplate('structured')}
                      className={`group relative overflow-visible rounded-lg border-2 p-2.5 text-left transition-all duration-200 active:scale-95 ${
                        selectedTemplate === 'structured'
                          ? 'border-cyan-500 bg-cyan-50 shadow-md ring-2 ring-cyan-200'
                          : 'border-gray-200 bg-white hover:border-cyan-400 hover:bg-cyan-50 hover:shadow-md'
                      }`}
                      title={getTemplateDescription('structured')}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                          selectedTemplate === 'structured'
                            ? 'bg-cyan-500 text-white'
                            : 'bg-cyan-100 text-cyan-600 group-hover:bg-cyan-200'
                        }`}>
                          {selectedTemplate === 'structured' ? (
                            <span className="text-sm">✓</span>
                          ) : (
                            <span className="text-sm">📋</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm ${
                            selectedTemplate === 'structured'
                              ? 'text-cyan-900'
                              : 'text-gray-900 group-hover:text-cyan-700'
                          }`}>Structured</div>
                          <div className="text-xs text-gray-500">40min lessons + breaks</div>
                        </div>
                      </div>
                      <div className={`absolute inset-0 -z-10 bg-gradient-to-br from-cyan-50 to-transparent transition-opacity ${
                        selectedTemplate === 'structured' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`} />
                      <div className="absolute left-0 right-0 top-full mt-1 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {getTemplateDescription('structured')}
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => applyTemplate('structured_45')}
                      className={`group relative overflow-visible rounded-lg border-2 p-2.5 text-left transition-all duration-200 active:scale-95 ${
                        selectedTemplate === 'structured_45'
                          ? 'border-sky-500 bg-sky-50 shadow-md ring-2 ring-sky-200'
                          : 'border-gray-200 bg-white hover:border-sky-400 hover:bg-sky-50 hover:shadow-md'
                      }`}
                      title={getTemplateDescription('structured_45')}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                          selectedTemplate === 'structured_45'
                            ? 'bg-sky-500 text-white'
                            : 'bg-sky-100 text-sky-600 group-hover:bg-sky-200'
                        }`}>
                          {selectedTemplate === 'structured_45' ? (
                            <span className="text-sm">✓</span>
                          ) : (
                            <span className="text-sm">📐</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm ${
                            selectedTemplate === 'structured_45'
                              ? 'text-sky-900'
                              : 'text-gray-900 group-hover:text-sky-700'
                          }`}>Structured 45</div>
                          <div className="text-xs text-gray-500">45min lessons + breaks</div>
                        </div>
                      </div>
                      <div className={`absolute inset-0 -z-10 bg-gradient-to-br from-sky-50 to-transparent transition-opacity ${
                        selectedTemplate === 'structured_45' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`} />
                      <div className="absolute left-0 right-0 top-full mt-1 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {getTemplateDescription('structured_45')}
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => applyTemplate('balanced')}
                      className={`group relative overflow-visible rounded-lg border-2 p-2.5 text-left transition-all duration-200 active:scale-95 ${
                        selectedTemplate === 'balanced'
                          ? 'border-pink-500 bg-pink-50 shadow-md ring-2 ring-pink-200'
                          : 'border-gray-200 bg-white hover:border-pink-400 hover:bg-pink-50 hover:shadow-md'
                      }`}
                      title={getTemplateDescription('balanced')}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                          selectedTemplate === 'balanced'
                            ? 'bg-pink-500 text-white'
                            : 'bg-pink-100 text-pink-600 group-hover:bg-pink-200'
                        }`}>
                          {selectedTemplate === 'balanced' ? (
                            <span className="text-sm">✓</span>
                          ) : (
                            <span className="text-sm">⚖️</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm ${
                            selectedTemplate === 'balanced'
                              ? 'text-pink-900'
                              : 'text-gray-900 group-hover:text-pink-700'
                          }`}>Balanced</div>
                          <div className="text-xs text-gray-500">Even breaks + games</div>
                        </div>
                      </div>
                      <div className={`absolute inset-0 -z-10 bg-gradient-to-br from-pink-50 to-transparent transition-opacity ${
                        selectedTemplate === 'balanced' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`} />
                      <div className="absolute left-0 right-0 top-full mt-1 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {getTemplateDescription('balanced')}
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => applyTemplate('intensive')}
                      className={`group relative overflow-visible rounded-lg border-2 p-2.5 text-left transition-all duration-200 active:scale-95 ${
                        selectedTemplate === 'intensive'
                          ? 'border-red-500 bg-red-50 shadow-md ring-2 ring-red-200'
                          : 'border-gray-200 bg-white hover:border-red-400 hover:bg-red-50 hover:shadow-md'
                      }`}
                      title={getTemplateDescription('intensive')}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                          selectedTemplate === 'intensive'
                            ? 'bg-red-500 text-white'
                            : 'bg-red-100 text-red-600 group-hover:bg-red-200'
                        }`}>
                          {selectedTemplate === 'intensive' ? (
                            <span className="text-sm">✓</span>
                          ) : (
                            <span className="text-sm">🔥</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm ${
                            selectedTemplate === 'intensive'
                              ? 'text-red-900'
                              : 'text-gray-900 group-hover:text-red-700'
                          }`}>Intensive</div>
                          <div className="text-xs text-gray-500">9 periods, minimal breaks</div>
                        </div>
                      </div>
                      <div className={`absolute inset-0 -z-10 bg-gradient-to-br from-red-50 to-transparent transition-opacity ${
                        selectedTemplate === 'intensive' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`} />
                      <div className="absolute left-0 right-0 top-full mt-1 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {getTemplateDescription('intensive')}
                      </div>
                    </button>
                    
                    {/* Third Row */}
                    <button
                      type="button"
                      onClick={() => applyTemplate('games_focused')}
                      className={`group relative overflow-visible rounded-lg border-2 p-2.5 text-left transition-all duration-200 active:scale-95 ${
                        selectedTemplate === 'games_focused'
                          ? 'border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-200'
                          : 'border-gray-200 bg-white hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-md'
                      }`}
                      title={getTemplateDescription('games_focused')}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                          selectedTemplate === 'games_focused'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200'
                        }`}>
                          {selectedTemplate === 'games_focused' ? (
                            <span className="text-sm">✓</span>
                          ) : (
                            <span className="text-sm">⚽</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm ${
                            selectedTemplate === 'games_focused'
                              ? 'text-emerald-900'
                              : 'text-gray-900 group-hover:text-emerald-700'
                          }`}>Games Focus</div>
                          <div className="text-xs text-gray-500">Double games period</div>
                        </div>
                      </div>
                      <div className={`absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50 to-transparent transition-opacity ${
                        selectedTemplate === 'games_focused' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`} />
                      <div className="absolute left-0 right-0 top-full mt-1 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {getTemplateDescription('games_focused')}
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => applyTemplate('custom')}
                      className={`group relative col-span-2 overflow-visible rounded-lg border-2 p-2.5 text-left transition-all duration-200 active:scale-95 ${
                        selectedTemplate === 'custom'
                          ? 'border-teal-500 bg-teal-50 shadow-md ring-2 ring-teal-200 border-solid'
                          : 'border-dashed border-gray-300 bg-gray-50 hover:border-teal-400 hover:bg-teal-50 hover:shadow-md'
                      }`}
                      title={getTemplateDescription('custom')}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                          selectedTemplate === 'custom'
                            ? 'bg-teal-500 text-white'
                            : 'bg-teal-100 text-teal-600 group-hover:bg-teal-200'
                        }`}>
                          {selectedTemplate === 'custom' ? (
                            <span className="text-sm">✓</span>
                          ) : (
                            <span className="text-sm">✨</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm ${
                            selectedTemplate === 'custom'
                              ? 'text-teal-900'
                              : 'text-gray-900 group-hover:text-teal-700'
                          }`}>Custom</div>
                          <div className="text-xs text-gray-500">Build your own template with full control</div>
                        </div>
                      </div>
                      <div className={`absolute inset-0 -z-10 bg-gradient-to-br from-teal-50 to-transparent transition-opacity ${
                        selectedTemplate === 'custom' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`} />
                      <div className="absolute left-0 right-0 top-full mt-1 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {getTemplateDescription('custom')}
                      </div>
                    </button>
                  </div>
                  
                  {/* Custom Template Builder */}
                  {showCustomTemplate && (
                    <div className="mt-4 rounded-lg border-2 border-teal-200 bg-teal-50/50 p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-teal-600" />
                          <h4 className="font-semibold text-sm text-teal-900">Custom Template Builder</h4>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCustomTemplate(false)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-teal-700 font-medium">
                            Configure breaks: Choose number of breaks, after how many lessons, and break type
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addCustomBreak}
                            className="h-7 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Break
                          </Button>
                        </div>

                        {customBreaks.length === 0 ? (
                          <div className="text-center py-6 text-sm text-muted-foreground">
                            No breaks added. Click "Add Break" to add one.
                          </div>
                        ) : (
            <div className="space-y-2">
                            {customBreaks.map((customBreak, index) => {
                              const info = getBreakTypeInfo(customBreak.type);
                              return (
                                <div
                                  key={index}
                                  className="bg-white rounded-lg border border-teal-200 p-3 space-y-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">{info.icon}</span>
                                      <span className="font-medium text-sm">Break {index + 1}</span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeCustomBreak(index)}
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-1">
                                      <Label className="text-xs text-muted-foreground">After Period</Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        max={formData.numberOfPeriods}
                                        value={customBreak.afterPeriod}
                                        onChange={(e) => {
                                          const value = parseInt(e.target.value);
                                          updateCustomBreak(index, { afterPeriod: isNaN(value) ? 0 : Math.max(0, value) });
                                        }}
                                        className="h-8 text-xs"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs text-muted-foreground">Break Type</Label>
                                      <Select
                                        value={customBreak.type}
                                        onValueChange={(value) => {
                                          updateCustomBreak(index, { type: value as typeof customBreak.type });
                                        }}
                                      >
                                        <SelectTrigger className="h-8 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="assembly">
                                            <span className="flex items-center gap-2">
                                              <Megaphone className="h-3 w-3" />
                                              Assembly
                                            </span>
                                          </SelectItem>
                                          <SelectItem value="short_break">
                                            <span className="flex items-center gap-2">
                                              <Coffee className="h-3 w-3" />
                                              Short Break
                                            </span>
                                          </SelectItem>
                                          <SelectItem value="long_break">
                                            <span className="flex items-center gap-2">
                                              <Coffee className="h-3 w-3" />
                                              Long Break
                                            </span>
                                          </SelectItem>
                                          <SelectItem value="lunch">
                                            <span className="flex items-center gap-2">
                                              <UtensilsCrossed className="h-3 w-3" />
                                              Lunch
                                            </span>
                                          </SelectItem>
                                          <SelectItem value="afternoon_break">
                                            <span className="flex items-center gap-2">
                                              <Coffee className="h-3 w-3" />
                                              Afternoon Break
                                            </span>
                                          </SelectItem>
                                          <SelectItem value="games">
                                            <span className="flex items-center gap-2">
                                              <span>⚽</span>
                                              Games
                                            </span>
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs text-muted-foreground">Duration (min)</Label>
                                      <Input
                                        type="number"
                                        min="5"
                                        max="120"
                                        value={customBreak.durationMinutes}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          if (value === '') {
                                            updateCustomBreak(index, { durationMinutes: 0 });
                                          } else {
                                            const numValue = parseInt(value, 10);
                                            if (!isNaN(numValue)) {
                                              updateCustomBreak(index, {
                                                durationMinutes: Math.max(5, Math.min(120, numValue)),
                                              });
                                            }
                                          }
                                        }}
                                        onBlur={(e) => {
                                          const value = parseInt(e.target.value, 10);
                                          if (isNaN(value) || value < 5) {
                                            updateCustomBreak(index, { durationMinutes: 15 });
                                          }
                                        }}
                                        className="h-8 text-xs"
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-teal-200">
                        <Button
                          type="button"
                          size="sm"
                          onClick={applyCustomTemplate}
                          className="bg-teal-600 hover:bg-teal-700 text-white flex-1"
                          disabled={customBreaks.length === 0}
                        >
                          Apply Custom Template
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCustomTemplate(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Basic Settings - Compact Grid */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    Basic Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="startTime" className="text-xs">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="h-9"
              />
            </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lessonDuration" className="text-xs">Lesson Duration</Label>
              <Input
                id="lessonDuration"
                type="number"
                min="30"
                max="90"
                value={formData.lessonDuration}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setFormData({ ...formData, lessonDuration: 0 });
                  } else {
                    const numValue = parseInt(value, 10);
                    if (!isNaN(numValue)) {
                      setFormData({
                        ...formData,
                        lessonDuration: Math.max(30, Math.min(90, numValue)),
                      });
                    }
                  }
                }}
                onBlur={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (isNaN(value) || value < 30) {
                    setFormData({ ...formData, lessonDuration: 45 });
                  }
                }}
                        className="h-9"
              />
            </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="numberOfPeriods" className="text-xs">Periods</Label>
              <Input
                id="numberOfPeriods"
                type="number"
                min="4"
                max="12"
                value={formData.numberOfPeriods}
                onChange={(e) =>
                  setFormData({ ...formData, numberOfPeriods: parseInt(e.target.value) || 8 })
                }
                        className="h-9"
              />
            </div>
          </div>
                </CardContent>
              </Card>

              {/* Recommended Template Banner */}
              {!selectedTemplate && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-primary mb-0.5">✨ Recommended</p>
                        <p className="text-xs text-muted-foreground">
                          We recommend <span className="font-semibold text-primary">Structured 45</span> - A balanced schedule with 45-minute lessons, assembly, breaks, lunch, and games.
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => applyTemplate('structured_45')}
                        className="ml-3"
                      >
                        Use This
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Edit or Create Choice */}
              {preview && !editMode && (
                <Card>
                  <CardHeader className="pb-2 pt-3">
                    <CardTitle className="text-xs font-semibold">Next Step</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditMode('edit');
                          setCurrentStep(2);
                        }}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left group"
                      >
                        <div className="font-semibold text-sm mb-1 group-hover:text-primary">Edit Schedule</div>
                        <div className="text-xs text-muted-foreground">Customize breaks and timing before saving</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditMode('create');
                          setCurrentStep(3);
                        }}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left group"
                      >
                        <div className="font-semibold text-sm mb-1 group-hover:text-primary">Create Directly</div>
                        <div className="text-xs text-muted-foreground">Save the schedule as-is without editing</div>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Schedule Preview Button */}
              {preview && (
                <Card>
                  <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
                      <div className="grid grid-cols-5 gap-2 flex-1">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground leading-tight">Start</span>
                          <span className="text-sm font-semibold mt-0.5">{formatTime12Hour(formData.startTime)}</span>
            </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground leading-tight">End</span>
                          <span className="text-sm font-semibold mt-0.5">{formatTime12Hour(preview.endTime)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground leading-tight">Periods</span>
                          <span className="text-sm font-semibold mt-0.5">{preview.timeSlots.length}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground leading-tight">Breaks</span>
                          <span className="text-sm font-semibold mt-0.5">{breaks.filter((b) => b.enabled).length}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground leading-tight">Duration</span>
                          <span className="text-sm font-semibold mt-0.5">
                            {Math.floor(totalDuration() / 60)}h {totalDuration() % 60}m
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          generatePreview();
                          setShowPreviewModal(true);
                        }}
                        className="ml-4"
                      >
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        View Full Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              </div>
            )}

            {/* Step 2: Edit Breaks or Review */}
            {currentStep === 2 && editMode === 'edit' && (
              <div className="space-y-3">
                {/* Break Configuration */}
                <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Coffee className="h-3.5 w-3.5" />
                      Break Schedule
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addBreak('assembly')}
                        className="h-7 px-2 text-xs"
                      >
                        <Megaphone className="h-3 w-3 mr-1" />
                        Assembly
                      </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBreak('morning')}
                        className="h-7 px-2 text-xs"
              >
                        <Coffee className="h-3 w-3 mr-1" />
                        Morning
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBreak('lunch')}
                        className="h-7 px-2 text-xs"
              >
                        <UtensilsCrossed className="h-3 w-3 mr-1" />
                        Lunch
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBreak('afternoon')}
                        className="h-7 px-2 text-xs"
              >
                        <Coffee className="h-3 w-3 mr-1" />
                        Afternoon
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBreak('custom')}
                        className="h-7 px-2 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                        Custom
              </Button>
            </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
            {breaks.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground">
                      No breaks added. Click buttons above to add breaks.
              </div>
            ) : (
                    <div className="space-y-2">
                {breaks.map((breakConfig, index) => (
                  <div
                    key={index}
                          className={`border rounded-lg p-2.5 space-y-2 ${
                            breakConfig.enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
                    }`}
                  >
                          <div className="flex items-center gap-2">
                        <Checkbox
                          checked={breakConfig.enabled}
                          onCheckedChange={(checked) =>
                            updateBreak(index, { enabled: checked as boolean })
                          }
                              className="h-4 w-4"
                            />
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-base">{breakConfig.icon}</span>
                              <Input
                                value={breakConfig.name}
                                onChange={(e) => updateBreak(index, { name: e.target.value })}
                                placeholder="Break name"
                                className="h-7 text-sm font-medium border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                              />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBreak(index)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                              <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {breakConfig.enabled && (
                            <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Type</Label>
                          <Select
                            value={breakConfig.type}
                            onValueChange={(value) => {
                                    const newType = value as 'short_break' | 'lunch' | 'assembly' | 'long_break' | 'afternoon_break' | 'games';
                              const newIcon = getBreakTypeIcon(newType);
                              updateBreak(index, { type: newType, icon: newIcon });
                            }}
                          >
                                  <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                    <SelectItem value="assembly">
                                      <span className="flex items-center gap-2">
                                        <Megaphone className="h-3 w-3" />
                                        Assembly
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="short_break">
                                      <span className="flex items-center gap-2">
                                        <Coffee className="h-3 w-3" />
                                        Short Break
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="long_break">
                                      <span className="flex items-center gap-2">
                                        <Coffee className="h-3 w-3" />
                                        Long Break
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="lunch">
                                      <span className="flex items-center gap-2">
                                        <UtensilsCrossed className="h-3 w-3" />
                                        Lunch
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="afternoon_break">
                                      <span className="flex items-center gap-2">
                                        <Coffee className="h-3 w-3" />
                                        Afternoon Break
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="games">
                                      <span className="flex items-center gap-2">
                                        <span>⚽</span>
                                        Games
                                      </span>
                                    </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                          <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">After Period</Label>
                            <Input
                              type="number"
                                  min="0"
                              max={formData.numberOfPeriods}
                              value={breakConfig.afterPeriod}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    updateBreak(index, { afterPeriod: isNaN(value) ? 0 : Math.max(0, value) });
                                  }}
                                  className="h-7 text-xs"
                                  placeholder="0 = at start"
                            />
                          </div>
                          <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Duration (min)</Label>
                            <Input
                              type="number"
                              min="5"
                              max="120"
                              value={breakConfig.durationMinutes}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') {
                                  // Allow empty value during editing
                                  updateBreak(index, { durationMinutes: 0 });
                                } else {
                                  const numValue = parseInt(value, 10);
                                  if (!isNaN(numValue)) {
                                    updateBreak(index, {
                                      durationMinutes: Math.max(5, Math.min(120, numValue)),
                                    });
                                  }
                                }
                              }}
                              onBlur={(e) => {
                                // Ensure minimum value on blur if empty or invalid
                                const value = parseInt(e.target.value, 10);
                                if (isNaN(value) || value < 5) {
                                  updateBreak(index, { durationMinutes: 15 });
                                }
                              }}
                                  className="h-7 text-xs"
                            />
                          </div>
                        </div>
                          )}
                        </div>
                      ))}
                        </div>
                  )}
                </CardContent>
              </Card>
                {/* Preview Button */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-4 pb-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        generatePreview();
                        setShowPreviewModal(true);
                      }}
                      className="w-full border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      View Full Preview
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 2: Review (Create Mode) */}
            {currentStep === 2 && editMode === 'create' && preview && (
              <div className="space-y-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Schedule Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Total Periods</p>
                        <p className="text-lg font-semibold">{preview.timeSlots.length}</p>
                        </div>
                        <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Total Breaks</p>
                        <p className="text-lg font-semibold">{breaks.filter((b) => b.enabled).length}</p>
                        </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Start Time</p>
                        <p className="text-lg font-semibold">{formatTime12Hour(formData.startTime)}</p>
                  </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">End Time</p>
                        <p className="text-lg font-semibold">{formatTime12Hour(preview.endTime)}</p>
              </div>
                      <div className="space-y-1 col-span-2">
                        <p className="text-xs text-muted-foreground">Total Duration</p>
                        <p className="text-lg font-semibold">
                          {Math.floor(totalDuration() / 60)}h {totalDuration() % 60}m
                        </p>
          </div>
                    </div>
                  </CardContent>
                </Card>

          {/* Preview Button */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-4 pb-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        generatePreview();
                        setShowPreviewModal(true);
                      }}
                      className="w-full border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      View Full Preview
          </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Final Review and Save */}
            {currentStep === 3 && preview && (
              <div className="space-y-3">
                {editMode === 'create' ? (
                  /* Create Directly Mode - Simple Confirmation */
                  <Card className="border-primary/20">
                    <CardHeader className="pb-2 pt-3 bg-primary/5">
                      <CardTitle className="text-sm font-semibold text-primary">Ready to Create Schedule</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 pb-3">
                      <div className="grid grid-cols-5 gap-2 mb-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground leading-tight">Periods</span>
                          <span className="text-sm font-semibold mt-0.5">{preview.timeSlots.length}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground leading-tight">Breaks</span>
                          <span className="text-sm font-semibold mt-0.5">{breaks.filter((b) => b.enabled).length}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground leading-tight">Start</span>
                          <span className="text-sm font-semibold mt-0.5">{formatTime12Hour(formData.startTime)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground leading-tight">End</span>
                          <span className="text-sm font-semibold mt-0.5">{formatTime12Hour(preview.endTime)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground leading-tight">Duration</span>
                          <span className="text-sm font-semibold mt-0.5">
                            {Math.floor(totalDuration() / 60)}h {totalDuration() % 60}m
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-primary/20">
                        <p className="text-xs text-muted-foreground">
                          This schedule will be saved directly to your timetable. Click "Create Schedule" to proceed.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  /* Edit Mode - Full Review with Delete Options */
                  <>
                    <Card>
                      <CardHeader className="pb-2 pt-3">
                        <CardTitle className="text-xs font-semibold">Schedule Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2 pb-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between py-1">
                            <span className="text-xs text-muted-foreground">Total Periods</span>
                            <span className="text-sm font-semibold">{preview.timeSlots.length}</span>
                          </div>
                          <div className="flex items-center justify-between py-1">
                            <span className="text-xs text-muted-foreground">Total Breaks</span>
                            <span className="text-sm font-semibold">{breaks.filter((b) => b.enabled).length}</span>
                          </div>
                          <div className="flex items-center justify-between py-1">
                            <span className="text-xs text-muted-foreground">Start Time</span>
                            <span className="text-sm font-semibold">{formatTime12Hour(formData.startTime)}</span>
                          </div>
                          <div className="flex items-center justify-between py-1">
                            <span className="text-xs text-muted-foreground">End Time</span>
                            <span className="text-sm font-semibold">{formatTime12Hour(preview.endTime)}</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-t pt-1.5 mt-1">
                            <span className="text-xs text-muted-foreground font-medium">Total Duration</span>
                            <span className="text-sm font-semibold">
                              {Math.floor(totalDuration() / 60)}h {totalDuration() % 60}m
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Full Schedule</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1 max-h-[350px] overflow-y-auto">
                        {/* Show breaks at start (afterPeriod: 0) */}
                        {breaks.filter((b) => b.enabled && b.afterPeriod === 0).map((breakAtStart, idx) => {
                          const breakTime = preview.breaks.find(
                            (br) => br.name === breakAtStart.name && br.afterPeriod === 0
                          );
                          return (
                            <div
                              key={`start-break-${idx}`}
                              className={`flex items-center justify-between text-xs p-2 rounded border group ${
                                breakAtStart.type === 'lunch'
                                  ? 'bg-orange-50 border-orange-200'
                                  : breakAtStart.type === 'assembly'
                                    ? 'bg-purple-50 border-purple-200'
                                    : 'bg-blue-50 border-blue-200'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span className="text-base">{breakAtStart.icon}</span>
                                <span className="font-medium">{breakAtStart.name}</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {breakTime && breakTime.startTime && breakTime.endTime
                                    ? `${formatTime12Hour(breakTime.startTime)} - ${formatTime12Hour(breakTime.endTime)}`
                                    : `${breakAtStart.durationMinutes} min`}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteBreak(breakAtStart.name, 0)}
                                  className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                        {preview.timeSlots.map((slot) => {
                  const breaksAfter = breaks.filter(
                    (b) => b.enabled && b.afterPeriod === slot.periodNumber
                  );
                  return (
                    <div key={slot.id} className="space-y-1">
                              <div className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded border border-gray-200 group">
                                <span className="font-semibold">Period {slot.periodNumber}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground font-mono text-xs">{slot.time}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteTimeSlot(slot.periodNumber)}
                                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                      </div>
                      {breaksAfter.map((breakAfter, breakIndex) => (
                        <div
                          key={`${slot.id}-break-${breakIndex}`}
                                  className={`flex items-center justify-between text-xs p-2 rounded ml-4 border group ${
                            breakAfter.type === 'lunch'
                                      ? 'bg-orange-50 border-orange-200'
                              : breakAfter.type === 'assembly'
                                        ? 'bg-purple-50 border-purple-200'
                                        : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                                  <span className="flex items-center gap-2">
                                    <span className="text-base">{breakAfter.icon}</span>
                                    <span className="font-medium">{breakAfter.name}</span>
                          </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{breakAfter.durationMinutes} min</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteBreak(breakAfter.name, slot.periodNumber)}
                                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
                        </CardContent>
                      </Card>
                  </>
                )}

                {/* Preview Button */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-4 pb-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        generatePreview();
                        setShowPreviewModal(true);
                      }}
                      className="w-full border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      View Full Preview
                    </Button>
                  </CardContent>
                </Card>
            </div>
          )}
        </div>

        <SheetFooter className="gap-3 px-6 py-4 border-t border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 flex-row justify-between">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={isCreating} className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium h-10 rounded">
              Cancel
            </Button>
            
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => {
                  if (currentStep === 2) {
                    // If going back from step 2, reset edit mode
                    setEditMode(null);
                    setCurrentStep(1);
                  } else if (currentStep === 3 && editMode === 'create') {
                    // If going back from step 3 in create mode, go to step 1
                    setEditMode(null);
                    setCurrentStep(1);
                  } else {
                    setCurrentStep(currentStep - 1);
                  }
                }}
                disabled={isCreating}
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium h-10 rounded"
              >
                Back
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            {currentStep === 1 ? (
              <Button
                onClick={() => {
                  if (!selectedTemplate) {
                    toast({
                      title: 'Please select a template',
                      description: 'Choose a template to continue.',
                      variant: 'default',
                    });
                    return;
                  }
                  if (!preview) {
                    generatePreview();
                  }
                  // If no edit mode selected, default to edit mode
                  if (!editMode) {
                    setEditMode('edit');
                  }
                  // Navigate based on edit mode, default to step 2 (edit)
                  setCurrentStep(editMode === 'create' ? 3 : 2);
                }}
                disabled={isCreating || !preview}
                className="bg-primary hover:bg-primary/90 text-white font-medium h-10 border border-primary disabled:opacity-50 rounded"
              >
                Continue
              </Button>
            ) : currentStep === 2 ? (
              <Button
                onClick={() => {
                  if (!showPreview) {
                    generatePreview();
                  }
                  setCurrentStep(3);
                }}
                disabled={isCreating}
                className="bg-primary hover:bg-primary/90 text-white font-medium h-10 border border-primary disabled:opacity-50 rounded"
              >
                Continue to Review
              </Button>
            ) : (
              <Button
                onClick={handleApply}
                disabled={isCreating || !preview}
                className="bg-primary hover:bg-primary/90 text-white font-medium h-10 border border-primary disabled:opacity-50 rounded"
              >
                {isCreating 
                  ? 'Creating...' 
                  : editMode === 'create' 
                    ? 'Create Schedule' 
                    : 'Save Schedule'}
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>

      {/* Full Timetable Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-hidden p-0">
          <DialogHeader className="bg-white dark:bg-slate-900 px-6 pt-5 pb-3 border-b border-slate-300 dark:border-slate-600">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold text-primary">Schedule Preview</DialogTitle>
                <DialogDescription className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {selectedTemplate && `${getTemplateDisplayName(selectedTemplate)} template`}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {preview && (
            <div className="flex flex-col h-[calc(95vh-100px)]">
              {/* Summary Stats */}
              <div className="px-6 py-3 border-b border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600 dark:text-slate-400">Start:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{formatTime12Hour(formData.startTime)}</span>
                    <span className="text-slate-600 dark:text-slate-400">End:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{formatTime12Hour(preview.endTime)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600 dark:text-slate-400">Periods:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{preview.timeSlots.length}</span>
                    <span className="text-slate-600 dark:text-slate-400">Breaks:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{breaks.filter((b) => b.enabled).length}</span>
                    <span className="text-slate-600 dark:text-slate-400">Duration:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {Math.floor(totalDuration() / 60)}h {totalDuration() % 60}m
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Timetable - Box Design */}
              <div className="flex-1 overflow-y-auto px-6 py-4 bg-slate-50 dark:bg-slate-900">
                <div className="grid grid-cols-1 gap-2">
                  {timelinePreview.map((item, idx) => {
                    const isBreak = item.type === 'break';
                    const breakType = item.break?.type;
                    
                    return (
                      <div
                        key={idx}
                        className={`border p-3 ${
                          isBreak 
                            ? 'bg-primary/5 border-primary/30' 
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Time */}
                          <div className="flex-shrink-0 w-20">
                            <div className="font-mono text-xs text-slate-600 dark:text-slate-400">
                              {formatTime12Hour(item.startTime)}
                            </div>
                            <div className="font-mono text-[10px] text-slate-500 dark:text-slate-500">
                              {formatTime12Hour(item.endTime)}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 flex items-center gap-3">
                            {isBreak ? (
                              <>
                                <span className="text-lg">{item.break?.icon}</span>
                                <div className="flex-1">
                                  <div className="text-sm font-semibold text-primary">{item.break?.name}</div>
                                  <div className="text-xs text-slate-600 dark:text-slate-400 capitalize">
                                    {breakType?.replace('_', ' ')} • {item.break?.durationMinutes}min
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-7 h-7 bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-300 dark:border-slate-600">
                                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{item.period}</span>
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Period {item.period}</div>
                                  <div className="text-xs text-slate-600 dark:text-slate-400">
                                    {formData.lessonDuration}min
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}

