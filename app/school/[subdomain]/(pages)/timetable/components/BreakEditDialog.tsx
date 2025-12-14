'use client';

import { useState, useEffect } from 'react';
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';
import type { Break } from '@/lib/types/timetable';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Loader2 } from 'lucide-react';

interface BreakEditDialogProps {
  breakData: (Break & { isNew?: boolean }) | null;
  onClose: () => void;
}

// Match GraphQL enum types
const BREAK_TYPES = [
  { value: 'ASSEMBLY', label: 'Assembly', icon: '🏫', color: '#8B5CF6' },
  { value: 'SHORT_BREAK', label: 'Short Break', icon: '☕', color: '#3B82F6' },
  { value: 'LUNCH', label: 'Lunch', icon: '🍽️', color: '#F59E0B' },
  { value: 'LONG_BREAK', label: 'Long Break', icon: '⏰', color: '#06B6D4' },
  { value: 'TEA_BREAK', label: 'Tea Break', icon: '🫖', color: '#10B981' },
  { value: 'RECESS', label: 'Recess', icon: '🏃', color: '#EC4899' },
  { value: 'SNACK_BREAK', label: 'Snack Break', icon: '🍎', color: '#EF4444' },
  { value: 'GAMES_BREAK', label: 'Games Break', icon: '⚽', color: '#22C55E' },
] as const;

export function BreakEditDialog({ breakData, onClose }: BreakEditDialogProps) {
  const {
    timeSlots,
    updateBreak,
    addBreak,
    deleteBreak,
    loadDayTemplatePeriods,
    loadBreaks,
  } = useTimetableStore();
  
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'SHORT_BREAK',
    afterPeriod: 0,
    durationMinutes: 15,
    icon: '☕',
    color: '#3B82F6',
  });
  const [applyToAllDays, setApplyToAllDays] = useState(false);

  useEffect(() => {
    if (breakData && !breakData.isNew) {
      // Editing existing break
      setFormData({
        name: breakData.name,
        type: breakData.type.toUpperCase(),
        afterPeriod: breakData.afterPeriod,
        durationMinutes: breakData.durationMinutes,
        icon: breakData.icon || '☕',
        color: breakData.color || '#3B82F6',
      });
      setApplyToAllDays(breakData.applyToAllDays || false);
    } else if (breakData && breakData.isNew) {
      // Creating new break
      const selectedType = BREAK_TYPES[1]; // Default to SHORT_BREAK
      setFormData({
        name: selectedType.label,
        type: selectedType.value,
        afterPeriod: breakData.afterPeriod || 0,
        durationMinutes: 15,
        icon: selectedType.icon,
        color: selectedType.color,
      });
      setApplyToAllDays(false);
    }
  }, [breakData]);

  const handleTypeChange = (type: string) => {
    const selectedType = BREAK_TYPES.find((t) => t.value === type);
    if (selectedType) {
      setFormData({
        ...formData,
        type,
        name: selectedType.label,
        icon: selectedType.icon,
        color: selectedType.color,
      });
    }
  };

  const handleSave = async () => {
    if (!breakData || !formData.name.trim()) return;

    setIsSaving(true);

    try {
      if (breakData.isNew) {
        // Get dayTemplateId from timeSlots
        const slotWithTemplate = timeSlots.find((s) => s.dayTemplateId);
        if (!slotWithTemplate?.dayTemplateId) {
          await loadDayTemplatePeriods();
          const refreshed = useTimetableStore.getState().timeSlots;
          const refreshedSlot = refreshed.find((s) => s.dayTemplateId);
          if (!refreshedSlot?.dayTemplateId) {
            throw new Error('No day template found. Please load a day template first.');
          }
        }

        const dayTemplateId = slotWithTemplate?.dayTemplateId || 
          useTimetableStore.getState().timeSlots.find((s) => s.dayTemplateId)?.dayTemplateId;

        if (!dayTemplateId) {
          throw new Error('No day template ID available');
        }

        // Call GraphQL mutation
        const mutation = `
          mutation CreateTimetableBreak($input: CreateDayTemplateBreakInput!) {
            createTimetableBreak(input: $input) {
              id
              name
              type
              afterPeriod
              durationMinutes
              icon
              color
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
            variables: {
              input: {
                dayTemplateId,
                name: formData.name,
                type: formData.type,
                afterPeriod: formData.afterPeriod,
                durationMinutes: formData.durationMinutes,
                icon: formData.icon,
                color: formData.color,
                applyToAllDays,
              },
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

        if (!result.data || !result.data.createTimetableBreak) {
          throw new Error('Invalid response format');
        }

        // Close dialog - parent will reload data
        onClose();
      } else {
        // Update existing break using GraphQL mutation
        // Following the documented updateDayTemplateBreak mutation
        const mutation = `
          mutation UpdateDayTemplateBreak($id: ID!, $input: UpdateDayTemplateBreakInput!) {
            updateDayTemplateBreak(id: $id, input: $input) {
              id
              name
              type
              afterPeriod
              durationMinutes
              icon
              color
              applyToAllDays
              dayTemplateId
            }
          }
        `;

        // Build input object - handle dayTemplateId based on applyToAllDays
        // The backend handles conversion between "all days" and "day-specific"
        const input: any = {
          name: formData.name,
          type: formData.type,
          afterPeriod: formData.afterPeriod,
          durationMinutes: formData.durationMinutes,
          icon: formData.icon,
          color: formData.color,
          applyToAllDays,
        };

        // Handle dayTemplateId based on applyToAllDays state
        if (applyToAllDays) {
          // When applying to all days, set dayTemplateId to null
          input.dayTemplateId = null;
        } else {
          // When applying to specific day, we need a dayTemplateId
          // Use existing dayTemplateId if available, otherwise get from timeSlots
          let dayTemplateId = breakData.dayTemplateId;
          
          if (!dayTemplateId) {
            // Converting from "all days" to "day-specific" - get dayTemplateId from timeSlots
            const slotWithTemplate = timeSlots.find((s) => s.dayTemplateId);
            if (!slotWithTemplate?.dayTemplateId) {
              // Try loading day template periods if not found
              await loadDayTemplatePeriods();
              const refreshed = useTimetableStore.getState().timeSlots;
              const refreshedSlot = refreshed.find((s) => s.dayTemplateId);
              if (refreshedSlot?.dayTemplateId) {
                dayTemplateId = refreshedSlot.dayTemplateId;
              }
            } else {
              dayTemplateId = slotWithTemplate.dayTemplateId;
            }
            
            if (!dayTemplateId) {
              throw new Error('No day template found. Please ensure a day template is loaded.');
            }
          }
          
          input.dayTemplateId = dayTemplateId;
        }

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
            variables: {
              id: breakData.id,
              input,
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

        if (!result.data || !result.data.updateDayTemplateBreak) {
          throw new Error('Invalid response format: missing updateDayTemplateBreak data');
        }

        // Close dialog - parent will reload data to reflect updated break timing
        onClose();
      }
    } catch (error) {
      console.error('Error saving break:', error);
      alert(error instanceof Error ? error.message : 'Failed to save break');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (breakData && !breakData.isNew && confirm('Delete this break?')) {
      try {
        setIsSaving(true);
        await deleteBreak(breakData.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete break:', error);
        alert(error instanceof Error ? error.message : 'Failed to delete break');
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (!breakData) return null;

  const isNew = breakData.isNew;
  const selectedType = BREAK_TYPES.find((t) => t.value === formData.type);

  return (
    <Drawer open={!!breakData} onOpenChange={onClose} direction="right">
      <DrawerContent className="w-full sm:w-[500px] h-full flex flex-col">
        <DrawerHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
            <DrawerTitle className="text-xl font-bold flex items-center gap-3">
              <span className="text-2xl">{formData.icon}</span>
              <span>{isNew ? 'Add Break' : 'Edit Break'}</span>
            </DrawerTitle>
              <DrawerDescription className="mt-2">
                {isNew 
                  ? 'Add a new break time to the timetable schedule.'
                  : 'Edit the break details including type, duration, and timing.'}
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {/* Break Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-semibold">
              Break Type
            </Label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger id="type" className="h-11">
                <div className="flex items-center gap-2">
                  {selectedType && (
                    <>
                      <span className="text-lg">{selectedType.icon}</span>
                      <span className="font-medium">{selectedType.label}</span>
                    </>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent>
                {BREAK_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{type.icon}</span>
                      <span className="font-medium">{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Break Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Break Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Morning Break"
              className="h-11"
            />
          </div>

          {/* After Period */}
          <div className="space-y-2">
            <Label htmlFor="afterPeriod" className="text-sm font-semibold">
              Occurs After Period
            </Label>
            <Select
              value={formData.afterPeriod.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, afterPeriod: parseInt(value) })
              }
            >
              <SelectTrigger id="afterPeriod" className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Before Period 0 (Start of day)</SelectItem>
                {Array.from(
                  new Map(timeSlots.map((slot) => [slot.periodNumber, slot])).values()
                )
                  .sort((a, b) => a.periodNumber - b.periodNumber)
                  .map((slot) => (
                    <SelectItem key={slot.periodNumber} value={slot.periodNumber.toString()}>
                      After Period {slot.periodNumber} ({slot.time})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-semibold">
              Duration (minutes)
            </Label>
            <Input
              id="duration"
              type="number"
              min="5"
              max="120"
              value={formData.durationMinutes}
              onChange={(e) =>
                setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 15 })
              }
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Typical: 15 min (short), 45 min (lunch)
            </p>
          </div>

          {/* Apply to All Days */}
          <div className="flex items-center space-x-3 p-4 border rounded-lg bg-muted/50">
            <Checkbox
              id="applyToAllDays"
              checked={applyToAllDays}
              onCheckedChange={(checked) => setApplyToAllDays(checked === true)}
            />
            <Label htmlFor="applyToAllDays" className="cursor-pointer font-medium flex-1">
              Apply to all weekdays (Monday-Friday)
            </Label>
          </div>

          {/* Preview */}
          <div className="border-l-4 p-4 rounded-r-lg" style={{ borderColor: formData.color }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center text-3xl bg-muted rounded">
                {formData.icon}
              </div>
              <div className="flex-1">
                <div className="font-bold text-base">{formData.name}</div>
                <div className="text-sm text-muted-foreground">
                  {formData.durationMinutes} minutes • After Period {formData.afterPeriod}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t px-6 py-4">
          <div className="flex gap-3 w-full">
            {!isNew && (
              <Button variant="destructive" onClick={handleDelete} className="flex-1">
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={onClose} disabled={isSaving} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name.trim() || isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                isNew ? 'Add Break' : 'Save'
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
