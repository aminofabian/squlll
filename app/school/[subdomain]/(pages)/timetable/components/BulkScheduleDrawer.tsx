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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Clock, Loader2 } from 'lucide-react';

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
    periodDuration: 40,
    periodCount: 8,
    numberOfDays: 5,
  });
  const [selectedGradeIds, setSelectedGradeIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        name: 'Standard School Week',
        startTime: '08:00',
        periodDuration: 40,
        periodCount: 8,
        numberOfDays: 5,
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
              periodCount: formData.periodCount,
              periodDuration: formData.periodDuration,
              numberOfDays: formData.numberOfDays,
              termId: selectedTermId,
              gradeLevelIds: selectedGradeIds,
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
    const [hours, mins] = formData.startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + (formData.periodCount * formData.periodDuration);
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-primary">Create Week Template</SheetTitle>
          <SheetDescription className="text-sm text-slate-600 dark:text-slate-400">
            Set up your school week structure with periods and timing
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Select Term
              </CardTitle>
            </CardHeader>
            <CardContent>
              {termsLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading terms...
                </div>
              ) : !currentAcademicYear ? (
                <div className="text-sm text-slate-500">No academic year available.</div>
              ) : !terms || terms.length === 0 ? (
                <div className="text-sm text-slate-500">No terms available for this academic year.</div>
              ) : (
                <Select
                  value={selectedTermId || ''}
                  onValueChange={(value) => setSelectedTerm(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a term" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((term) => (
                      <SelectItem key={term.id} value={term.id}>
                        {term.name} {term.isActive && '(Active)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Template Name
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Standard School Week"
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Select Grade Levels
              </CardTitle>
            </CardHeader>
            <CardContent>
              {grades.length === 0 ? (
                <div className="text-sm text-slate-500">No grades available.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {grades.map((grade) => {
                    const isSelected = selectedGradeIds.includes(grade.id);
                    return (
                      <label
                        key={grade.id}
                        className={`flex items-center gap-2 rounded border px-3 py-2 text-sm cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-slate-300 hover:border-primary/60 text-slate-700'
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleGradeToggle(grade.id, checked)}
                        />
                        <span>{grade.displayName || grade.name || 'Grade'}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Time Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime" className="text-sm font-medium">
                    Start Time
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="periodDuration" className="text-sm font-medium">
                    Period Duration (minutes)
                  </Label>
                  <Input
                    id="periodDuration"
                    type="number"
                    min="30"
                    max="90"
                    value={formData.periodDuration}
                    onChange={(e) =>
                      setFormData({ ...formData, periodDuration: parseInt(e.target.value) || 40 })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="periodCount" className="text-sm font-medium">
                    Periods per Day
                  </Label>
                  <Input
                    id="periodCount"
                    type="number"
                    min="4"
                    max="12"
                    value={formData.periodCount}
                    onChange={(e) =>
                      setFormData({ ...formData, periodCount: parseInt(e.target.value) || 8 })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="numberOfDays" className="text-sm font-medium">
                    Days per Week
                  </Label>
                  <Input
                    id="numberOfDays"
                    type="number"
                    min="1"
                    max="7"
                    value={formData.numberOfDays}
                    onChange={(e) =>
                      setFormData({ ...formData, numberOfDays: parseInt(e.target.value) || 5 })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">School day:</span>
                    <span className="font-medium">
                      {formData.startTime} - {calculateEndTime()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Total periods:</span>
                    <span className="font-medium">{formData.periodCount} periods/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Total time:</span>
                    <span className="font-medium">
                      {formData.periodCount * formData.periodDuration} minutes
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isCreating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isCreating || !selectedTermId || selectedGradeIds.length === 0}
              className="flex-1"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Week Template'
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
