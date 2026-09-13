'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { ALL_BREAK_TYPE_OPTIONS } from '@/lib/utils/timetable-break-types';
import { SCHOOL_DAYS } from '@/lib/constants/breakTypes';
import { sanitizeTimetableUserMessage } from '@/lib/utils/timetable-user-messages';
import { useTimetableWeekDays } from '../hooks/useTimetableWeekDays';

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

const BREAK_TYPES = ALL_BREAK_TYPE_OPTIONS.map((o) => ({
  value: o.gql,
  label: o.label,
  icon: o.icon,
  color: o.color,
}));

const WEEK_DAYS = [
  ...SCHOOL_DAYS.map((name, i) => ({ value: i + 1, name })),
  { value: 6, name: 'Saturday' },
  { value: 7, name: 'Sunday' },
];

export function BulkBreaksDrawer({ open, onClose }: BulkBreaksDrawerProps) {
  const {
    timeSlots,
    loadBreaks,
    loadDayTemplatePeriods,
    loadDayTemplates,
    selectedTermId,
  } = useTimetableStore();
  const { toast } = useToast();
  const { daysPerWeek } = useTimetableWeekDays();

  const weekDays = useMemo(
    () => WEEK_DAYS.filter((d) => d.value <= daysPerWeek),
    [daysPerWeek],
  );

  const [breakEntries, setBreakEntries] = useState<BreakEntry[]>([]);
  const [applyToAllDays, setApplyToAllDays] = useState(true);
  const [selectedDays, setSelectedDays] = useState<number[]>([1]);
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
      setSelectedDays([1]);
      
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

  const toggleDay = (dayValue: number) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayValue)) {
        const next = prev.filter((d) => d !== dayValue);
        return next.length > 0 ? next : prev;
      }
      return [...prev, dayValue].sort((a, b) => a - b);
    });
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

    // Resolve which day template(s) each break should be written to.
    setIsCreating(true);

    try {
      let targets: Array<{ dayTemplateId: string }>;

      if (applyToAllDays) {
        let slotWithTemplate = timeSlots.find((s) => s.dayTemplateId);
        if (!slotWithTemplate?.dayTemplateId) {
          await loadDayTemplatePeriods();
          const refreshed = useTimetableStore.getState().timeSlots;
          slotWithTemplate = refreshed.find((s) => s.dayTemplateId);
        }
        if (!slotWithTemplate?.dayTemplateId) {
          toast({
            title: 'No day template found',
            description: 'Please create a week template first.',
            variant: 'destructive',
          });
          setIsCreating(false);
          return;
        }
        targets = [{ dayTemplateId: slotWithTemplate.dayTemplateId }];
      } else {
        if (selectedDays.length === 0) {
          toast({
            title: 'Pick at least one day',
            description: 'Choose which day(s) these breaks should be added to.',
            variant: 'destructive',
          });
          setIsCreating(false);
          return;
        }

        const allTemplates = (await loadDayTemplates()) as Array<{
          id?: string;
          dayOfWeek?: number | null;
          termId?: string | null;
          weekTemplate?: { termId?: string | null } | null;
        }>;
        const termTemplates = selectedTermId
          ? allTemplates.filter(
              (t) =>
                t.termId === selectedTermId ||
                t.weekTemplate?.termId === selectedTermId,
            )
          : allTemplates;

        const templatesByDay = new Map<number, string[]>();
        termTemplates.forEach((t) => {
          if (t.id && typeof t.dayOfWeek === 'number') {
            const ids = templatesByDay.get(t.dayOfWeek) ?? [];
            ids.push(t.id);
            templatesByDay.set(t.dayOfWeek, ids);
          }
        });

        const missingDays = selectedDays.filter(
          (day) => !templatesByDay.get(day)?.length,
        );
        if (missingDays.length > 0) {
          const names = missingDays
            .map(
              (day) =>
                weekDays.find((w) => w.value === day)?.name ?? `Day ${day}`,
            )
            .join(', ');
          toast({
            title: 'No timetable day found',
            description: `No day template is set up for ${names}.`,
            variant: 'destructive',
          });
          setIsCreating(false);
          return;
        }

        targets = selectedDays.flatMap((day) =>
          (templatesByDay.get(day) ?? []).map((dayTemplateId) => ({
            dayTemplateId,
          })),
        );
      }

      type AliasMeta = { alias: string; label: string; entryId: string };
      const aliasMetas: AliasMeta[] = [];
      const mutationParts: string[] = [];

      // Build an aliased GraphQL mutation so we can tell which breaks saved.
      targets.forEach((target, targetIndex) => {
        breakEntries.forEach((entry, entryIndex) => {
          const alias = `break${targetIndex + 1}_${entryIndex + 1}`;
          const breakType = BREAK_TYPES.find((t) => t.value === entry.type);
          const breakName = breakType?.label || entry.type;
          const duration = parsePositiveInt(entry.durationMinutes);

          aliasMetas.push({ alias, label: breakName, entryId: entry.id });
          mutationParts.push(`
          ${alias}: createTimetableBreak(input: {
            dayTemplateId: "${target.dayTemplateId}"
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
        `);
        });
      });

      const fullMutation = `
        mutation CreateAllBreaks {
          ${mutationParts.join('\n')}
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
          query: fullMutation,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} - ${errorText.substring(0, 200)}`);
      }

      const result = (await response.json()) as {
        data?: Record<string, unknown> | null;
        errors?: Array<{ message?: string; path?: Array<string | number> }>;
      };

      // GraphQL executes aliased fields independently, so read the outcome of
      // each break instead of treating the whole batch as pass/fail.
      const errorsByAlias = new Map<string, string>();
      (result.errors ?? []).forEach((e) => {
        const alias = (e.path ?? []).find(
          (p): p is string => typeof p === 'string',
        );
        if (alias) errorsByAlias.set(alias, e.message || 'Unknown error');
      });

      const data = result.data ?? {};
      if (Object.keys(data).length === 0) {
        const firstError =
          Array.from(errorsByAlias.values())[0] ??
          'Invalid response format: missing data';
        throw new Error(firstError);
      }

      const succeeded = aliasMetas.filter((m) => data[m.alias]);
      const failed = aliasMetas.filter((m) => !data[m.alias]);

      // Refresh so the grid reflects what actually saved.
      await loadBreaks();

      if (failed.length === 0) {
        toast({
          title: 'Breaks created successfully!',
          description: `Created ${succeeded.length} break(s).`,
          variant: 'default',
        });
        onClose();
        return;
      }

      const failedLabels = Array.from(new Set(failed.map((f) => f.label)));
      const reason = sanitizeTimetableUserMessage(
        errorsByAlias.get(failed[0].alias) ?? '',
      );

      toast({
        title:
          succeeded.length > 0
            ? 'Some breaks were created'
            : 'Failed to create breaks',
        description:
          succeeded.length > 0
            ? `Created ${succeeded.length} of ${aliasMetas.length} breaks — '${failedLabels.join("', '")}' failed: ${reason}`
            : `Could not create ${failed.length} break(s): ${reason}`,
        variant: 'destructive',
      });

      // Keep only entries that did not save so a retry cannot duplicate the
      // breaks that already succeeded.
      const failedEntryIds = new Set(failed.map((f) => f.entryId));
      setBreakEntries((prev) =>
        prev.filter((entry) => failedEntryIds.has(entry.id)),
      );
    } catch (error) {
      console.error('Error creating breaks:', error);
      toast({
        title: 'Failed to create breaks',
        description: sanitizeTimetableUserMessage(error),
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
      <SheetContent
        side="right"
        className="w-full sm:max-w-[600px] overflow-y-auto"
      >
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
                : 'All breaks will only be added to the days you pick below.'}
            </p>
            {!applyToAllDays && (
              <div className="flex flex-wrap gap-1.5 pl-6">
                {weekDays.map((d) => {
                  const active = selectedDays.includes(d.value);
                  return (
                    <label
                      key={d.value}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-none border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                      }`}
                    >
                      <Checkbox
                        checked={active}
                        onCheckedChange={() => toggleDay(d.value)}
                        className={`h-3.5 w-3.5 ${
                          active
                            ? 'border-white data-[state=checked]:bg-white data-[state=checked]:text-slate-900'
                            : ''
                        }`}
                      />
                      {d.name}
                    </label>
                  );
                })}
              </div>
            )}
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

