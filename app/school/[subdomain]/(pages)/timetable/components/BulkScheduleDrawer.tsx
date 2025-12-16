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
import { Loader2, Calendar, Clock, GraduationCap, CheckCircle2, ChevronRight, Info, X } from 'lucide-react';

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

  const calculateWeeks = (startDate: string, endDate: string): number | null => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return null;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.ceil(diffDays / 7);
    
    return weeks;
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
    name: '',
    startTime: '08:00',
    periodDuration: '40',
    periodCount: '8',
    numberOfDays: '5',
  });
  const [selectedGradeIds, setSelectedGradeIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(true);

  // Generate timetable name from selected term and academic year
  const generateTimetableName = (term: Term | undefined, academicYear: typeof currentAcademicYear): string => {
    if (!term || !academicYear) return '';
    
    // Extract year from academic year name (e.g., "2016-2017" -> "2016" or "2016" -> "2016")
    const yearMatch = academicYear.name.match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : '';
    
    return `${term.name.toUpperCase()} TIMETABLE ${year}`.trim();
  };

  // Update name when term or academic year changes
  useEffect(() => {
    if (selectedTermId && terms && currentAcademicYear) {
      const selectedTerm = terms.find((t) => t.id === selectedTermId);
      const generatedName = generateTimetableName(selectedTerm, currentAcademicYear);
      if (generatedName) {
        setFormData((prev) => ({ ...prev, name: generatedName }));
      }
    }
  }, [selectedTermId, terms, currentAcademicYear]);

  useEffect(() => {
    if (open) {
      setFormData((prev) => ({
        ...prev,
        startTime: '08:00',
        periodDuration: '40',
        periodCount: '8',
        numberOfDays: '5',
      }));
      // Auto-select all grade levels by default
      if (grades.length > 0) {
        setSelectedGradeIds(grades.map((g) => g.id));
      } else {
        setSelectedGradeIds([]);
      }
      // Reset info popup visibility when drawer opens
      setShowInfoPopup(true);
      
      // Generate timetable name if we have the necessary data
      if (selectedTermId && terms && currentAcademicYear) {
        const selectedTerm = terms.find((t) => t.id === selectedTermId);
        const generatedName = generateTimetableName(selectedTerm, currentAcademicYear);
        if (generatedName) {
          setFormData((prev) => ({ ...prev, name: generatedName }));
        }
      }
    }
  }, [open, grades, selectedTermId, terms, currentAcademicYear]);

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

  // Helper function to abbreviate grade names
  const abbreviateGrade = (gradeName: string): string => {
    const lowerName = gradeName.toLowerCase().trim();
    
    // Handle special cases first
    if (
      lowerName === 'baby' ||
      lowerName === 'play group' ||
      lowerName === 'playgroup' ||
      lowerName.startsWith('baby') ||
      lowerName.startsWith('play group') ||
      lowerName.includes('play group') ||
      lowerName.includes('baby class') ||
      (lowerName.includes('baby') && !lowerName.includes('pp1') && !lowerName.includes('pp2'))
    ) {
      return 'PG';
    }
    if (lowerName === 'pp1' || lowerName.includes('pp1') || lowerName.includes('pre-primary 1')) return 'PP1';
    if (lowerName === 'pp2' || lowerName.includes('pp2') || lowerName.includes('pre-primary 2')) return 'PP2';
    if (lowerName === 'pp3' || lowerName.includes('pp3') || lowerName.includes('pre-primary 3')) return 'PP3';
    if (lowerName.includes('early childhood')) return 'EC';
    if (lowerName.includes('kindergarten')) return 'KG';
    if (lowerName.includes('nursery')) return 'NS';
    if (lowerName.includes('reception')) return 'RC';

    // Extract number from grade name
    const match = gradeName.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      
      // G1-G6 display as G1, G2, etc.
      if (num >= 1 && num <= 6) {
        return `G${num}`;
      }
      
      // G7+ display as F1, F2, F3, etc.
      // G7 = F1, G8 = F2, G9 = F3, G10 = F4, G11 = F5, G12 = F6
      if (num >= 7) {
        const formNumber = num - 6; // G7 -> F1, G8 -> F2, etc.
        return `F${formNumber}`;
      }
    }

    // If no number found, return first 2 characters
    return gradeName.slice(0, 2).toUpperCase();
  };

  const handleSubmit = async () => {
    if (!selectedTermId) {
      toast({
        title: 'No term selected',
        description: 'Please select a term before creating the timetable.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedGradeIds.length === 0) {
      toast({
        title: 'Select at least one grade',
        description: 'Choose one or more grades to apply this timetable.',
        variant: 'destructive',
      });
      return;
    }

    const periodCount = parsePositiveInt(formData.periodCount);
    const periodDuration = parsePositiveInt(formData.periodDuration);
    const numberOfDays = parsePositiveInt(formData.numberOfDays);

    if (!formData.name.trim()) {
      toast({
        title: 'Timetable name is required',
        description: 'Please enter a name for this timetable.',
        variant: 'destructive',
      });
      return;
    }

    if (!periodCount || periodCount < 1 || periodCount > 20) {
      toast({
        title: 'Invalid lesson periods per day',
        description: 'Please enter a valid number of lesson periods per day.',
        variant: 'destructive',
      });
      return;
    }

    if (!periodDuration || periodDuration < 1 || periodDuration > 240) {
      toast({
        title: 'Invalid lesson period duration',
        description: 'Please enter a valid lesson period duration (in minutes).',
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
        title: 'Timetable created successfully!',
        description: `Created "${weekTemplate.name}" with ${weekTemplate.dayTemplates.length} day(s) and ${weekTemplate.dayTemplates[0]?.periods?.length || 0} lesson periods per day for ${selectedGradeIds.length} grade(s).`,
        variant: 'default',
      });

      onClose();
    } catch (error) {
      console.error('Error creating timetable:', error);
      toast({
        title: 'Failed to create timetable',
        description: error instanceof Error ? error.message : 'An error occurred while creating the timetable.',
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
        <SheetHeader className="border-b pb-2.5 px-4 pt-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-xs font-semibold uppercase tracking-wide">Create Timetable</SheetTitle>
              <SheetDescription className="text-[11px] text-muted-foreground">
                Set up lesson periods for your selected term
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-col items-center px-4 py-3">
          <div className="w-full max-w-2xl space-y-4">
          {/* Step 1 - Term Selection */}
          <div className="space-y-1.5 pb-4 border-b-2 border-border/50">
            <div className="flex items-center gap-1.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground text-teal-100">
                1
              </div>
              <Label className="text-[10px] font-semibold uppercase tracking-wide">Select Term</Label>
            </div>
            {termsLoading ? (
              <div className="flex items-center justify-center gap-1.5 rounded-md border bg-muted/50 p-2 text-[11px] text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading terms...
              </div>
            ) : !currentAcademicYear ? (
              <div className="rounded-md border bg-muted/50 p-2 text-center text-[11px] text-muted-foreground">
                No academic year available
              </div>
            ) : !terms || terms.length === 0 ? (
              <div className="rounded-md border bg-muted/50 p-2 text-center text-[11px] text-muted-foreground">
                No terms available
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {terms.map((term) => {
                  const isSelected = term.id === selectedTermId;
                  const dateRange = formatDateRange(term.startDate, term.endDate);
                  const weeks = calculateWeeks(term.startDate, term.endDate);

                  return (
                    <button
                      key={term.id}
                      type="button"
                      onClick={() => setSelectedTerm(term.id)}
                      className={`group relative flex flex-col items-start gap-1 rounded-lg border-2 p-2.5 text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-md shadow-primary/20 scale-[1.02]'
                          : 'border-border bg-card hover:border-primary/60 hover:bg-primary/5 hover:shadow-sm active:scale-[0.98]'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className={`text-xs font-bold uppercase tracking-wide ${isSelected ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
                          {term.name}
                        </span>
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-primary animate-in fade-in zoom-in-95" />
                          </div>
                        )}
                        {!isSelected && term.isActive && (
                          <span className="flex-shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5 w-full">
                        {dateRange && (
                          <span className={`text-[10px] ${isSelected ? 'text-primary/80' : 'text-muted-foreground group-hover:text-primary/70'}`}>
                            {dateRange}
                          </span>
                        )}
                        {weeks !== null && (
                          <span className={`text-[10px] font-semibold ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/80'}`}>
                            {weeks} {weeks === 1 ? 'week' : 'weeks'}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 rounded-lg bg-primary/5 pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2 - Timetable Name */}
          {selectedTermId && (
            <div className="space-y-1.5 rounded-md border bg-card p-2.5 transition-all pb-4 border-b-2 border-border/50">
              <div className="flex items-center gap-1.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground text-teal-100">
                  2
                </div>
                <Label className="text-[10px] font-semibold uppercase tracking-wide">Timetable Name</Label>
              </div>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                placeholder="e.g., TERM 1 TIMETABLE 2016"
                className="h-8 rounded-md border-2 focus:border-primary text-xs uppercase font-semibold tracking-wide"
              />
            </div>
          )}

          {/* Grades Selection */}
          {selectedTermId && (
            <div className="space-y-2 rounded-md border bg-card p-3 pb-4 border-b-2 border-border/50">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                <Label className="text-[10px] font-semibold uppercase tracking-wide">
                  Grade Levels <span className="text-[9px] font-normal text-muted-foreground normal-case">({selectedGradeIds.length}/{grades.length})</span>
                </Label>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleSelectAllGrades}
                  disabled={grades.length === 0}
                  className="h-6 rounded-md text-[10px] px-1.5"
                >
                  All
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleClearGrades}
                  disabled={selectedGradeIds.length === 0}
                  className="h-6 rounded-md text-[10px] px-1.5"
                >
                  Clear
                </Button>
              </div>
            </div>
            {grades.length === 0 ? (
              <div className="rounded-md border bg-muted/50 p-1.5 text-center text-[11px] text-muted-foreground">
                No grades available
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {grades.map((grade) => {
                  const isSelected = selectedGradeIds.includes(grade.id);
                  return (
                    <label
                      key={grade.id}
                      className={`group flex cursor-pointer items-center gap-1 rounded-md border-2 px-2 py-1 transition-all hover:border-primary/60 ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card hover:bg-accent/50'
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleGradeToggle(grade.id, checked)}
                        className="h-3 w-3"
                      />
                      <span className="text-[11px] font-medium whitespace-nowrap">
                        {abbreviateGrade(grade.displayName || grade.name || 'Grade')}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          )}

          {/* Step 3 - Lesson Periods Configuration */}
          {selectedTermId && (
            <div className="space-y-2 rounded-md border bg-card p-2.5">
              <div className="flex items-center gap-1.5">
                <div className="flex h-5 w-5 text-teal-100 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  3
                </div>
                <Label className="text-[10px] font-semibold uppercase tracking-wide">Lesson Periods</Label>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="startTime" className="text-[11px] font-medium flex items-center gap-1 uppercase tracking-wide">
                      <Clock className="h-2.5 w-2.5" />
                      Start Time
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="h-8 rounded-md border-2 focus:border-primary text-xs"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor="periodDuration" className="text-[11px] font-medium uppercase tracking-wide">
                      Duration (min)
                    </Label>
                    <Input
                      id="periodDuration"
                      type="number"
                      min="15"
                      max="120"
                      step="5"
                      value={formData.periodDuration}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || (Number(value) >= 15 && Number(value) <= 120)) {
                          setFormData({ ...formData, periodDuration: value });
                        }
                      }}
                      className="h-8 rounded-md border-2 focus:border-primary text-xs"
                      placeholder="40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="periodCount" className="text-[11px] font-medium uppercase tracking-wide">
                      Periods/Day
                    </Label>
                    <Input
                      id="periodCount"
                      type="number"
                      min="1"
                      max="15"
                      value={formData.periodCount}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || (Number(value) >= 1 && Number(value) <= 15)) {
                          setFormData({ ...formData, periodCount: value });
                        }
                      }}
                      className="h-8 rounded-md border-2 focus:border-primary text-xs"
                      placeholder="8"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor="numberOfDays" className="text-[11px] font-medium uppercase tracking-wide">
                      Days/Week
                    </Label>
                    <Input
                      id="numberOfDays"
                      type="number"
                      min="1"
                      max="7"
                      value={formData.numberOfDays}
                      onChange={(e) => setFormData({ ...formData, numberOfDays: e.target.value })}
                      className="h-8 rounded-md border-2 focus:border-primary text-xs"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="rounded-md border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-2">
                  {(() => {
                    const periodCount = parsePositiveInt(formData.periodCount);
                    const periodDuration = parsePositiveInt(formData.periodDuration);
                    const totalMinutes =
                      periodCount && periodDuration ? periodCount * periodDuration : null;
                    const lastLessonEndTime = calculateEndTime();
                    const isValid = periodCount && periodDuration && formData.startTime;

                    return (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1 mb-1">
                          <Clock className="h-3 w-3 text-primary" />
                          <span className="text-[11px] font-semibold text-primary uppercase tracking-wide">Schedule Preview</span>
                        </div>
                        {isValid ? (
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="space-y-0.5">
                              <span className="text-muted-foreground block text-[9px]">Day starts</span>
                              <span className="font-semibold text-xs">{formData.startTime}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-muted-foreground block text-[9px]">Day ends</span>
                              <span className="font-semibold text-xs">{lastLessonEndTime}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-muted-foreground block text-[9px]">Periods per day</span>
                              <span className="font-semibold text-xs">{periodCount}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-muted-foreground block text-[9px]">Total time</span>
                              <span className="font-semibold text-xs">
                                {totalMinutes ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : '—'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-muted-foreground text-center py-0.5">
                            Enter values to see preview
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="sticky bottom-0 border-t bg-background pt-2 mt-3">
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isCreating}
                className="flex-1 h-8 rounded-md text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isCreating || !selectedTermId || selectedGradeIds.length === 0}
                className="flex-1 h-8 rounded-md text-xs font-semibold"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-1.5 h-3 w-3" />
                    Create Timetable
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Info Popup - Below Actions */}
          {showInfoPopup && (
            <div className="flex justify-end mt-2">
              <div className="relative bg-white border border-gray-200 shadow-xl text-gray-700 px-3 py-2 max-w-xs rounded-lg">
                <button
                  type="button"
                  onClick={() => setShowInfoPopup(false)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-sm hover:bg-gray-100"
                  aria-label="Close info"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-start gap-2.5 pr-5">
                  <div className="mt-0.5 flex-shrink-0">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Info className="h-3 w-3 text-primary" />
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-700">
                    This is a template. Breaks will be added in the next step.
                  </p>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
