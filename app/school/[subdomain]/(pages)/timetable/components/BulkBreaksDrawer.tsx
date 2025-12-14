'use client';

import { useState, useEffect } from 'react';
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';
import { useToast } from '@/components/ui/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
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
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface BulkBreaksDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface BreakEntry {
  id: string;
  type: string;
  afterPeriod: number;
  durationMinutes: string;
}

const BREAK_TYPES = [
  { value: 'ASSEMBLY', label: 'Assembly', icon: '🏫', color: '#8B5CF6' },
  { value: 'SHORT_BREAK', label: 'Short Break', icon: '☕', color: '#3B82F6' },
  { value: 'TEA_BREAK', label: 'Tea Break', icon: '🫖', color: '#10B981' },
  { value: 'SNACK_BREAK', label: 'Snack Break', icon: '🍪', color: '#FBBF24' },
  { value: 'LONG_BREAK', label: 'Long Break', icon: '⏰', color: '#06B6D4' },
  { value: 'RECESS', label: 'Recess', icon: '🏃', color: '#EC4899' },
  { value: 'LUNCH', label: 'Lunch', icon: '🍽️', color: '#F59E0B' },
  { value: 'TEA_BREAK', label: 'Afternoon Break', icon: '🌅', color: '#F59E0B' },
  { value: 'GAMES_BREAK', label: 'Games', icon: '🎮', color: '#EF4444' },
] as const;

export function BulkBreaksDrawer({ open, onClose }: BulkBreaksDrawerProps) {
  const { timeSlots, loadBreaks, loadDayTemplatePeriods } = useTimetableStore();
  const { toast } = useToast();

  const [breakEntries, setBreakEntries] = useState<BreakEntry[]>([]);
  const [applyToAllDays, setApplyToAllDays] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(false);

  // Get unique periods from timeSlots, and add "Before Period 0" option (0)
  const availablePeriods = [
    0, // Before Period 0 (start of day)
    ...Array.from(
      new Set(timeSlots.map((slot) => slot.periodNumber).filter((p) => p != null))
    ).sort((a, b) => a - b)
  ];

  useEffect(() => {
    if (open) {
      setBreakEntries([
        {
          id: `entry-${Date.now()}`,
          type: 'SHORT_BREAK',
          afterPeriod: 0,
          durationMinutes: '15',
        }
      ]);
      setApplyToAllDays(true);
      
      // Load day template periods if timeSlots are empty
      if (timeSlots.length === 0) {
        setIsLoadingPeriods(true);
        loadDayTemplatePeriods()
          .then(() => {
            setIsLoadingPeriods(false);
          })
          .catch((error) => {
            console.error('Error loading day template periods:', error);
            setIsLoadingPeriods(false);
          });
      }
    }
  }, [open, timeSlots.length, loadDayTemplatePeriods]);

  const addBreakEntry = () => {
    setBreakEntries([
      ...breakEntries,
      {
        id: `entry-${Date.now()}`,
        type: 'SHORT_BREAK',
        afterPeriod: 0,
        durationMinutes: '15',
      }
    ]);
  };

  const removeBreakEntry = (id: string) => {
    setBreakEntries(breakEntries.filter(entry => entry.id !== id));
  };

  const updateBreakEntry = (id: string, updates: Partial<BreakEntry>) => {
    setBreakEntries(breakEntries.map(entry => 
      entry.id === id ? { ...entry, ...updates } : entry
    ));
  };

  const parsePositiveInt = (value: string): number | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const num = Number(trimmed);
    if (!Number.isFinite(num)) return null;
    const int = Math.trunc(num);
    if (int <= 0) return null;
    return int;
  };

  const handleSubmit = async () => {
    if (breakEntries.length === 0) {
      toast({
        title: 'No breaks configured',
        description: 'Please add at least one break.',
        variant: 'destructive',
      });
      return;
    }

    // Validate all entries
    const invalidEntry = breakEntries.find(entry => {
      const duration = parsePositiveInt(entry.durationMinutes);
      return !duration || duration <= 0;
    });

    if (invalidEntry) {
      toast({
        title: 'Invalid duration',
        description: 'Please enter valid durations (greater than 0) for all breaks.',
        variant: 'destructive',
      });
      return;
    }

    // Get dayTemplateId from timeSlots (same as BreakEditDialog)
    setIsCreating(true);

    try {
      // Get dayTemplateId from timeSlots
      let slotWithTemplate = timeSlots.find((s) => s.dayTemplateId);
      if (!slotWithTemplate?.dayTemplateId) {
        await loadDayTemplatePeriods();
        const refreshed = useTimetableStore.getState().timeSlots;
        slotWithTemplate = refreshed.find((s) => s.dayTemplateId);
        if (!slotWithTemplate?.dayTemplateId) {
          toast({
            title: 'No day template found',
            description: 'Please create a week template first.',
            variant: 'destructive',
          });
          setIsCreating(false);
          return;
        }
      }

      const dayTemplateId = slotWithTemplate.dayTemplateId;

      console.log('🔍 Creating breaks:', breakEntries);
      console.log('🔍 Apply to all days:', applyToAllDays);
      console.log('🔍 Using dayTemplateId:', dayTemplateId);
      
      // Build GraphQL mutation with multiple break creations
      const mutations = breakEntries.map((entry, index) => {
        const alias = `break${index + 1}`;
        const breakType = BREAK_TYPES.find(t => t.value === entry.type);
        const breakName = entry.afterPeriod === 0 
          ? `${breakType?.label} (Before Period 0)` 
          : `${breakType?.label} (After Period ${entry.afterPeriod})`;
        const duration = parsePositiveInt(entry.durationMinutes);
        
        return `
          ${alias}: createTimetableBreak(input: {
            dayTemplateId: "${dayTemplateId}"
            name: "${breakName}"
            type: ${entry.type}
            afterPeriod: ${entry.afterPeriod}
            durationMinutes: ${duration}
            icon: "${breakType?.icon || '☕'}"
            color: "${breakType?.color || '#3B82F6'}"
            applyToAllDays: ${applyToAllDays}
          }) {
            id
            name
            type
            afterPeriod
            durationMinutes
            icon
            color
          }
        `;
      }).join('\n');

      const fullMutation = `
        mutation CreateAllBreaks {
          ${mutations}
        }
      `;

      console.log('🔍 Full mutation:', fullMutation);

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        credentials: 'include',
        body: JSON.stringify({
          query: fullMutation,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} - ${errorText.substring(0, 200)}`);
      }

      const result = await response.json();
      
      console.log('🔍 GraphQL response:', result);

      if (result.errors) {
        console.error('❌ GraphQL errors:', result.errors);
        const errorMessages = result.errors.map((e: any) => e.message).join(', ');
        throw new Error(`GraphQL errors: ${errorMessages}`);
      }

      if (!result.data) {
        throw new Error('Invalid response format: missing data');
      }

      // Count how many breaks were actually created
      const createdBreaksCount = Object.keys(result.data).length;
      console.log('✅ Created breaks:', createdBreaksCount, result.data);

      // Reload breaks to show the new ones
      await loadBreaks();

      toast({
        title: 'Breaks created successfully!',
        description: `Created ${createdBreaksCount} break(s).`,
        variant: 'default',
      });

      onClose();
    } catch (error) {
      console.error('Error creating breaks:', error);
      toast({
        title: 'Failed to create breaks',
        description: error instanceof Error ? error.message : 'An error occurred while creating breaks.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <SheetContent side="right" className="w-[600px] overflow-y-auto">
        <SheetHeader className="border-b pb-4 px-8">
          <SheetTitle className="text-lg font-semibold">Create Bulk Breaks</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Add multiple breaks to your timetable at once. Each break can have different types and timing.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-5 px-8">
          {/* Break Entries */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                Breaks {' '}
                <span className="text-xs font-normal text-muted-foreground">
                  ({breakEntries.length} configured)
                </span>
              </Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addBreakEntry}
                className="h-7 px-2 text-xs rounded-none flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Break
              </Button>
            </div>
            
            {isLoadingPeriods ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading periods...
              </div>
            ) : availablePeriods.length <= 1 ? (
              <div className="text-xs text-muted-foreground">
                No periods available. Please create a week template first.
              </div>
            ) : (
              <div className="space-y-2">
                {breakEntries.map((entry, index) => {
                  const breakType = BREAK_TYPES.find(t => t.value === entry.type);
                  return (
                    <div key={entry.id} className="border p-3 bg-muted/20">
                      <div className="flex items-start gap-2">
                        <span className="flex h-5 w-5 items-center justify-center bg-primary/10 text-xs font-semibold text-primary mt-1">
                          {index + 1}
                        </span>
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Break Type</Label>
                              <Select 
                                value={entry.type} 
                                onValueChange={(value) => updateBreakEntry(entry.id, { type: value })}
                              >
                                <SelectTrigger className="h-8 text-xs rounded-none">
                                  <SelectValue>
                                    <div className="flex items-center gap-1.5">
                                      <span>{breakType?.icon}</span>
                                      <span>{breakType?.label}</span>
                                    </div>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {BREAK_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      <div className="flex items-center gap-1.5">
                                        <span>{type.icon}</span>
                                        <span>{type.label}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">After Period</Label>
                              <Select 
                                value={entry.afterPeriod.toString()} 
                                onValueChange={(value) => updateBreakEntry(entry.id, { afterPeriod: parseInt(value) })}
                              >
                                <SelectTrigger className="h-8 text-xs rounded-none">
                                  <SelectValue>
                                    {entry.afterPeriod === 0 ? 'Before Period 0' : `After Period ${entry.afterPeriod}`}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {availablePeriods.map((period) => (
                                    <SelectItem key={period} value={period.toString()}>
                                      {period === 0 ? 'Before Period 0' : `After Period ${period}`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Duration (minutes)</Label>
                            <Input
                              type="number"
                              min="5"
                              max="120"
                              value={entry.durationMinutes}
                              onChange={(e) => updateBreakEntry(entry.id, { durationMinutes: e.target.value })}
                              className="h-8 text-xs rounded-none"
                            />
                          </div>
                        </div>
                        
                        {breakEntries.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeBreakEntry(entry.id)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive rounded-none"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Apply to All Days */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <Checkbox
                id="applyToAllDays"
                checked={applyToAllDays}
                onCheckedChange={(checked) => setApplyToAllDays(checked === true)}
                className="h-4 w-4"
              />
              <Label htmlFor="applyToAllDays" className="text-sm font-medium text-foreground cursor-pointer">
                Apply to all days of the week
              </Label>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              {applyToAllDays
                ? 'All breaks will be added to all days in your week template.'
                : 'All breaks will only be added to the selected day.'}
            </p>
          </div>

          {/* Actions */}
          <div className="border-t pt-4 mt-6">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isCreating}
                className="flex-1 h-9 rounded-none"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isCreating || breakEntries.length === 0}
                className="flex-1 h-9 rounded-none"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Breaks'
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

