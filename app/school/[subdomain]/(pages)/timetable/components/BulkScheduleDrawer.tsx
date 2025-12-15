'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';
import { useCurrentAcademicYear } from '@/lib/hooks/useAcademicYears';
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
import { Loader2 } from 'lucide-react';

interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  academicYear?: {
    name: string;
  };
}

interface BulkScheduleDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function BulkScheduleDrawer({ open, onClose }: BulkScheduleDrawerProps) {
  const { selectedGradeId, selectedTermId, setSelectedTerm, grades } = useTimetableStore();
  const { toast } = useToast();
  const { getActiveAcademicYear } = useCurrentAcademicYear();
  const currentAcademicYear = getActiveAcademicYear();

  const parsePositiveInt = (value: string): number | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const num = Number(trimmed);
    if (!Number.isFinite(num)) return null;
    const int = Math.trunc(num);
    if (int <= 0) return null;
    return int;
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const formatter = new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short' });
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return '';
    }

    return `${formatter.format(start)} – ${formatter.format(end)}`;
  };

  // Query terms for the current academic year
  const { data: terms, isLoading: termsLoading } = useQuery<Term[]>({
    queryKey: ['termsByAcademicYear', currentAcademicYear?.id],
    queryFn: async () => {
      if (!currentAcademicYear?.id) return [];

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          query: `
            query GetTermsForAcademicYear($academicYearId: ID!) {
              termsByAcademicYear(academicYearId: $academicYearId) {
                id
                name
                startDate
                endDate
                isActive
                academicYear {
                  name
                }
              }
            }
          `,
          variables: { academicYearId: currentAcademicYear.id },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch terms');
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors.map((e: any) => e.message).join(', '));
      }

      return result.data.termsByAcademicYear as Term[];
    },
    enabled: !!currentAcademicYear?.id && open,
  });

  // Set active term as default when terms load
  useEffect(() => {
    if (terms && terms.length > 0 && !selectedTermId) {
      const activeTerm = terms.find((term) => term.isActive) || terms[0];
      if (activeTerm) {
        setSelectedTerm(activeTerm.id);
      }
    }
  }, [terms, selectedTermId, setSelectedTerm]);

  const [formData, setFormData] = useState({
    name: 'Standard School Week',
    startTime: '08:00',
    periodDuration: '40',
    periodCount: '8',
    numberOfDays: '5',
  });
  const [selectedGradeIds, setSelectedGradeIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        name: 'Standard School Week',
        startTime: '08:00',
        periodDuration: '40',
        periodCount: '8',
        numberOfDays: '5',
      });
      if (selectedGradeId) {
        setSelectedGradeIds([selectedGradeId]);
      } else {
        setSelectedGradeIds([]);
      }
    }
  }, [open, selectedGradeId]);

  const handleGradeToggle = (gradeId: string, checked: boolean | 'indeterminate') => {
    setSelectedGradeIds((prev) => {
      if (checked === true) {
        return Array.from(new Set([...prev, gradeId]));
      }
      return prev.filter((id) => id !== gradeId);
    });
  };

  const handleSelectAllGrades = () => {
    setSelectedGradeIds(grades.map((g) => g.id));
  };

  const handleClearGrades = () => {
    setSelectedGradeIds([]);
  };

  const handleSubmit = async () => {
    if (!selectedTermId) {
      toast({
        title: 'No term selected',
        description: 'Please select a term before creating a week template.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedGradeIds.length === 0) {
      toast({
        title: 'Select at least one grade',
        description: 'Choose one or more grades to apply this week template.',
        variant: 'destructive',
      });
      return;
    }

    const periodCount = parsePositiveInt(formData.periodCount);
    const periodDuration = parsePositiveInt(formData.periodDuration);
    const numberOfDays = parsePositiveInt(formData.numberOfDays);

    if (!formData.name.trim()) {
      toast({
        title: 'Template name is required',
        description: 'Please enter a name for this week template.',
        variant: 'destructive',
      });
      return;
    }

    if (!periodCount || periodCount < 1 || periodCount > 20) {
      toast({
        title: 'Invalid periods per day',
        description: 'Please enter a valid number of periods per day.',
        variant: 'destructive',
      });
      return;
    }

    if (!periodDuration || periodDuration < 1 || periodDuration > 240) {
      toast({
        title: 'Invalid period duration',
        description: 'Please enter a valid period duration (in minutes).',
        variant: 'destructive',
      });
      return;
    }

    if (!numberOfDays || numberOfDays < 1 || numberOfDays > 7) {
      toast({
        title: 'Invalid days per week',
        description: 'Please enter a valid number of days per week (1–7).',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      const mutation = `
        mutation CreateWeekTemplate($input: CreateWeekTemplateInput!) {
          createWeekTemplate(input: $input) {
            id
            name
            dayTemplates {
              id
              dayOfWeek
              startTime
              periods {
                id
                periodNumber
                startTime
                endTime
              }
            }
          }
        }
      `;

      // Map selected grade IDs to tenant grade level IDs
      // The backend expects tenant grade level IDs, not gradeLevel.id
      const tenantGradeLevelIds = selectedGradeIds
        .map((gradeId) => {
          const grade = grades.find((g) => g.id === gradeId);
          // Use tenantGradeLevelId if available, otherwise fall back to id
          return (grade as any)?.tenantGradeLevelId || gradeId;
        })
        .filter((id): id is string => !!id);

      if (tenantGradeLevelIds.length === 0) {
        toast({
          title: 'Invalid grade selection',
          description: 'Could not resolve tenant grade level IDs for selected grades.',
          variant: 'destructive',
        });
        setIsCreating(false);
        return;
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
            input: {
              name: formData.name,
              startTime: formData.startTime,
              periodCount,
              periodDuration,
              numberOfDays,
              termId: selectedTermId,
              gradeLevelIds: tenantGradeLevelIds,
              streamIds: [],
              replaceExisting: false,
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

      if (!result.data || !result.data.createWeekTemplate) {
        throw new Error('Invalid response format: missing createWeekTemplate data');
      }

      const weekTemplate = result.data.createWeekTemplate;

      toast({
        title: 'Week template created successfully!',
        description: `Created "${weekTemplate.name}" with ${weekTemplate.dayTemplates.length} day(s) for ${selectedGradeIds.length} grade(s).`,
        variant: 'default',
      });

      onClose();
    } catch (error) {
      console.error('Error creating week template:', error);
      toast({
        title: 'Failed to create week template',
        description: error instanceof Error ? error.message : 'An error occurred while creating the week template.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const calculateEndTime = () => {
    const periodCount = parsePositiveInt(formData.periodCount);
    const periodDuration = parsePositiveInt(formData.periodDuration);
    if (!periodCount || !periodDuration) return '--:--';

    const [hours, mins] = formData.startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + periodCount * periodDuration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
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
          <SheetTitle className="text-lg font-semibold">Create Week Template</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Set up your school week structure with periods and timing
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-5 px-8">
          {/* Step 1 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center bg-primary/10 text-xs font-semibold text-primary">
                1
              </span>
              <Label className="text-sm font-medium text-foreground">Template Name</Label>
            </div>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Standard School Week"
              className="w-full rounded-none"
            />
          </div>

          {/* Step 2 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center bg-primary/10 text-xs font-semibold text-primary">
                2
              </span>
              <Label className="text-sm font-medium text-foreground">Select Term</Label>
            </div>
              {termsLoading ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading terms...
                </div>
              ) : !currentAcademicYear ? (
              <div className="text-xs text-muted-foreground">No academic year available.</div>
              ) : !terms || terms.length === 0 ? (
              <div className="text-xs text-muted-foreground">No terms available.</div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {terms.map((term) => {
                  const isSelected = term.id === selectedTermId;
                  const dateRange = formatDateRange(term.startDate, term.endDate);

                  return (
                    <Button
                      key={term.id}
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      onClick={() => setSelectedTerm(term.id)}
                      className="h-auto w-full flex-col items-start gap-0.5 px-3 py-2 rounded-none"
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="truncate text-xs font-medium">{term.name}</span>
                        {term.isActive && (
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            }`}
                          >
                            Active
                          </span>
                        )}
                      </div>
                      {dateRange && (
                        <span
                          className={`text-[10px] ${
                            isSelected ? 'text-white/70' : 'text-muted-foreground'
                          }`}
                        >
                          {dateRange}
                        </span>
              )}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Grades (inline with Step 2) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <Label className="text-sm font-medium text-foreground">
                Grade Levels{' '}
                <span className="text-xs font-normal text-muted-foreground">
                  ({selectedGradeIds.length} selected)
                </span>
              </Label>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleSelectAllGrades}
                  disabled={grades.length === 0}
                  className="h-7 px-2 text-xs rounded-none"
                >
                  Select all
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleClearGrades}
                  disabled={selectedGradeIds.length === 0}
                  className="h-7 px-2 text-xs rounded-none"
                >
                  Clear
                </Button>
              </div>
            </div>
              {grades.length === 0 ? (
              <div className="text-xs text-muted-foreground">No grades available.</div>
              ) : (
              <div className="flex flex-wrap gap-1.5">
                  {grades.map((grade) => {
                    const isSelected = selectedGradeIds.includes(grade.id);
                    return (
                      <label
                        key={grade.id}
                      className={`flex items-center gap-1.5 border px-2.5 py-1.5 text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                          : 'border-input hover:border-primary/60 text-foreground'
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleGradeToggle(grade.id, checked)}
                        className="h-3.5 w-3.5"
                        />
                      <span className="whitespace-nowrap">
                        {grade.displayName || grade.name || 'Grade'}
                      </span>
                      </label>
                    );
                  })}
                </div>
              )}
          </div>

          {/* Step 3 */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center bg-primary/10 text-xs font-semibold text-primary">
                3
              </span>
              <Label className="text-sm font-medium text-foreground">Time Configuration</Label>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="startTime" className="text-xs font-medium text-muted-foreground">
                    Start Time
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="h-9 rounded-none"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="periodDuration" className="text-xs font-medium text-muted-foreground">
                    Period (min)
                  </Label>
                  <Input
                    id="periodDuration"
                    type="number"
                    min="30"
                    max="90"
                    value={formData.periodDuration}
                    onChange={(e) => setFormData({ ...formData, periodDuration: e.target.value })}
                    className="h-9 rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="periodCount" className="text-xs font-medium text-muted-foreground">
                    Periods/Day
                  </Label>
                  <Input
                    id="periodCount"
                    type="number"
                    min="4"
                    max="12"
                    value={formData.periodCount}
                    onChange={(e) => setFormData({ ...formData, periodCount: e.target.value })}
                    className="h-9 rounded-none"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="numberOfDays" className="text-xs font-medium text-muted-foreground">
                    Days/Week
                  </Label>
                  <Input
                    id="numberOfDays"
                    type="number"
                    min="1"
                    max="7"
                    value={formData.numberOfDays}
                    onChange={(e) => setFormData({ ...formData, numberOfDays: e.target.value })}
                    className="h-9 rounded-none"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="border bg-muted/50 p-2.5">
                {(() => {
                  const periodCount = parsePositiveInt(formData.periodCount);
                  const periodDuration = parsePositiveInt(formData.periodDuration);
                  const totalMinutes =
                    periodCount && periodDuration ? periodCount * periodDuration : null;
                  const lastLessonEndTime = calculateEndTime();

                  return (
                    <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                        <span className="text-muted-foreground">School day starts</span>
                        <span className="font-medium">{formData.startTime}</span>
                  </div>
                  <div className="flex justify-between">
                        <span className="text-muted-foreground">Last lesson ends</span>
                        <span className="font-medium">{lastLessonEndTime}</span>
                  </div>
                  <div className="flex justify-between">
                        <span className="text-muted-foreground">Total periods</span>
                    <span className="font-medium">
                          {periodCount ? `${periodCount} periods` : '—'}
                    </span>
                  </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total time</span>
                        <span className="font-medium">{totalMinutes ? `${totalMinutes} min` : '—'}</span>
                      </div>
                </div>
                  );
                })()}
              </div>
            </div>
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
              disabled={isCreating || !selectedTermId || selectedGradeIds.length === 0}
                className="flex-1 h-9 rounded-none"
            >
              {isCreating ? (
                <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                  'Create Template'
              )}
            </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
