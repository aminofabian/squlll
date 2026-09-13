'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';
import { useCurrentAcademicYear } from '@/lib/hooks/useAcademicYears';
import { useSelectedTerm } from '@/lib/hooks/useSelectedTerm';
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
import { Loader2, Calendar, Clock, GraduationCap, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';
import { tt } from '../utils/timetableTheme';

interface WeekTemplateSummary {
  id: string;
  name: string;
  termId: string;
}

interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCurrent: boolean;
  academicYear?: {
    name: string;
  };
}

interface BulkScheduleDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function BulkScheduleDrawer({ open, onClose }: BulkScheduleDrawerProps) {
  const { selectedTermId: storeTermId, setSelectedTerm: setStoreTerm, grades } = useTimetableStore();
  const { selectedTerm: contextTerm, setSelectedTerm: setContextTerm } = useSelectedTerm();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getActiveAcademicYear } = useCurrentAcademicYear();
  const currentAcademicYear = getActiveAcademicYear();

  const effectiveTermId = contextTerm?.id ?? storeTermId ?? null;

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
                isCurrent
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

  const selectTerm = useCallback(
    (termId: string) => {
      setStoreTerm(termId);
      const term = terms?.find((t) => t.id === termId);
      if (term) {
        setContextTerm({
          id: term.id,
          name: term.name,
          startDate: term.startDate,
          endDate: term.endDate,
          isActive: term.isActive,
          isCurrent: term.isCurrent,
          academicYear: { name: term.academicYear?.name ?? currentAcademicYear?.name ?? '' },
        });
      }
    },
    [terms, setStoreTerm, setContextTerm, currentAcademicYear?.name],
  );

  useEffect(() => {
    if (!open || !terms?.length) return;

    if (contextTerm?.id && terms.some((t) => t.id === contextTerm.id)) {
      if (storeTermId !== contextTerm.id) setStoreTerm(contextTerm.id);
      return;
    }

    if (storeTermId && terms.some((t) => t.id === storeTermId)) {
      if (!contextTerm || contextTerm.id !== storeTermId) selectTerm(storeTermId);
      return;
    }

    const defaultTerm = terms.find((t) => t.isActive) ?? terms[0];
    if (defaultTerm) selectTerm(defaultTerm.id);
  }, [open, terms, contextTerm, storeTermId, selectTerm, setStoreTerm]);

  const { data: allWeekTemplates = [], isLoading: weekTemplatesLoading } = useQuery<WeekTemplateSummary[]>({
    queryKey: ['weekTemplates', 'bulk-drawer'],
    queryFn: async () => {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          query: `
            query GetWeekTemplates($input: GetWeekTemplatesInput!) {
              getWeekTemplates(input: $input) {
                id
                name
                termId
              }
            }
          `,
          variables: { input: { includeDetails: false } },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to load existing timetables');
      }

      const result = await response.json();
      if (result.errors?.length) {
        throw new Error(result.errors.map((e: { message: string }) => e.message).join(', '));
      }

      return (result.data?.getWeekTemplates ?? []) as WeekTemplateSummary[];
    },
    enabled: open,
    staleTime: 0,
  });

  const templatesByTermId = useMemo(() => {
    const map = new Map<string, WeekTemplateSummary>();
    for (const template of allWeekTemplates) {
      if (template.termId) map.set(template.termId, template);
    }
    return map;
  }, [allWeekTemplates]);

  const existingWeekTemplate = effectiveTermId ? templatesByTermId.get(effectiveTermId) ?? null : null;
  const selectedTerm = terms?.find((t) => t.id === effectiveTermId);

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
    if (effectiveTermId && terms && currentAcademicYear) {
      const term = terms.find((t) => t.id === effectiveTermId);
      const generatedName = generateTimetableName(term, currentAcademicYear);
      if (generatedName) {
        setFormData((prev) => ({ ...prev, name: generatedName }));
      }
    }
  }, [effectiveTermId, terms, currentAcademicYear]);

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
      if (effectiveTermId && terms && currentAcademicYear) {
        const term = terms.find((t) => t.id === effectiveTermId);
        const generatedName = generateTimetableName(term, currentAcademicYear);
        if (generatedName) {
          setFormData((prev) => ({ ...prev, name: generatedName }));
        }
      }
    }
  }, [open, grades, effectiveTermId, terms, currentAcademicYear]);

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

  const handleCreateClick = () => {
    void handleSubmit(!!existingWeekTemplate);
  };

  const handleSubmit = async (replaceExisting: boolean) => {
    if (!effectiveTermId) {
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
              termId: effectiveTermId,
              gradeLevelIds: tenantGradeLevelIds,
              streamIds: [],
              replaceExisting,
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
        title: replaceExisting ? 'Timetable replaced successfully!' : 'Timetable created successfully!',
        description: `${replaceExisting ? 'Replaced' : 'Created'} "${weekTemplate.name}" with ${weekTemplate.dayTemplates.length} day(s) and ${weekTemplate.dayTemplates[0]?.periods?.length || 0} lesson periods per day for ${selectedGradeIds.length} grade(s).`,
        variant: 'default',
      });

      await queryClient.invalidateQueries({ queryKey: ['weekTemplates'] });
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
      <SheetContent
        side="right"
        className="w-full sm:max-w-[600px] overflow-y-auto"
      >
        <SheetHeader className={`border-b pb-2.5 px-4 pt-3 ${tt.border.hair}`}>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-none bg-[#246a59]/10 dark:bg-[#246a59]/20">
              <Calendar className="h-3.5 w-3.5 text-[#246a59] dark:text-[#7eb8a8]" />
            </div>
            <div className="flex-1">
              <SheetTitle className={`${tt.text.small} font-semibold uppercase tracking-wide`}>
                Advanced: lesson times
              </SheetTitle>
              <SheetDescription className={`${tt.text.caption} ${tt.ink.muted}`}>
                {existingWeekTemplate
                  ? 'Replaces period start times and counts for this term. Use guided setup for first-time schools.'
                  : 'Power-user tool to define periods. New schools should use guided setup on the main page.'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {weekTemplatesLoading && effectiveTermId && (
          <div className={`mx-4 mt-3 flex items-center gap-2 rounded-none border bg-[#f8fbfa] dark:bg-white/[0.02] px-3 py-2 ${tt.text.caption} ${tt.ink.muted} ${tt.border.soft}`}>
            <Loader2 className="h-3 w-3 animate-spin" />
            Checking for existing timetables…
          </div>
        )}

        {!weekTemplatesLoading && existingWeekTemplate && effectiveTermId && (
          <div className="sticky top-0 z-10 mx-4 mt-3 flex items-start gap-2.5 rounded-none border border-amber-300 bg-amber-50 px-3 py-3 text-amber-950 shadow-sm dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className={`${tt.text.small} leading-relaxed`}>
              A timetable already exists for <span className="font-semibold">{selectedTerm?.name ?? 'this term'}</span>{' '}
              (<span className="font-semibold">{existingWeekTemplate.name}</span>). Creating again will replace it and
              remove any scheduled lesson entries on that template.
            </p>
          </div>
        )}

        <div className="flex flex-col items-center px-4 py-3">
          <div className="w-full max-w-2xl space-y-4">
          {/* Step 1 - Term Selection */}
          <div className="space-y-1.5 pb-4 border-b-2 border-[#1a4d42]/12 dark:border-white/10">
            <div className="flex items-center gap-1.5">
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-none bg-[#0a1f1a] text-white dark:bg-[#246a59] ${tt.text.micro} font-semibold`}>
                1
              </div>
              <Label className={`${tt.text.micro} font-semibold uppercase tracking-wide`}>Select Term</Label>
            </div>
            {termsLoading ? (
              <div className={`flex items-center justify-center gap-1.5 rounded-none border bg-[#f8fbfa] dark:bg-white/[0.02] p-2 ${tt.text.caption} ${tt.ink.muted} ${tt.border.soft}`}>
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading terms...
              </div>
            ) : !currentAcademicYear ? (
              <div className={`rounded-none border bg-[#f8fbfa] dark:bg-white/[0.02] p-2 text-center ${tt.text.caption} ${tt.ink.muted} ${tt.border.soft}`}>
                No academic year available
              </div>
            ) : !terms || terms.length === 0 ? (
              <div className={`rounded-none border bg-[#f8fbfa] dark:bg-white/[0.02] p-2 text-center ${tt.text.caption} ${tt.ink.muted} ${tt.border.soft}`}>
                No terms available
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {terms.map((term) => {
                  const isSelected = term.id === effectiveTermId;
                  const dateRange = formatDateRange(term.startDate, term.endDate);
                  const weeks = calculateWeeks(term.startDate, term.endDate);
                  const termTemplate = templatesByTermId.get(term.id);

                  return (
                    <button
                      key={term.id}
                      type="button"
                      onClick={() => selectTerm(term.id)}
                      className={`group relative flex flex-col items-start gap-1 rounded-none border-2 p-2.5 text-left transition-all duration-200 cursor-pointer ${tt.focus} ${
                        isSelected
                          ? 'border-[#0a1f1a] bg-[#0a1f1a] text-white shadow-md shadow-[#0a1f1a]/20 scale-[1.02] dark:border-[#246a59] dark:bg-[#246a59]'
                          : 'border-[#1a4d42]/12 bg-white hover:border-[#246a59]/60 hover:bg-[#246a59]/5 hover:shadow-sm active:scale-[0.98] dark:border-white/10 dark:bg-[#0c1a17] dark:hover:border-[#7eb8a8]/50'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className={`${tt.text.small} font-bold uppercase tracking-wide ${isSelected ? 'text-white' : 'text-[#0a1f1a] dark:text-white group-hover:text-[#246a59] dark:group-hover:text-[#7eb8a8]'}`}>
                          {term.name}
                        </span>
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-white animate-in fade-in zoom-in-95" />
                          </div>
                        )}
                        {!isSelected && term.isActive && (
                          <span className={`flex-shrink-0 rounded-none bg-emerald-100 px-1.5 py-0.5 ${tt.text.micro} font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300`}>
                            Active
                          </span>
                        )}
                        {termTemplate && (
                          <span className={`flex-shrink-0 rounded-none bg-amber-100 px-1.5 py-0.5 ${tt.text.micro} font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200`}>
                            Has timetable
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5 w-full">
                        {dateRange && (
                          <span className={`${tt.text.micro} ${isSelected ? 'text-white/80' : 'text-[#1a4d42]/55 dark:text-white/45 group-hover:text-[#246a59]/70 dark:group-hover:text-[#7eb8a8]/70'}`}>
                            {dateRange}
                          </span>
                        )}
                        {weeks !== null && (
                          <span className={`${tt.text.micro} font-semibold ${tt.numeral} ${isSelected ? 'text-white' : 'text-[#1a4d42]/55 dark:text-white/45 group-hover:text-[#246a59]/80 dark:group-hover:text-[#7eb8a8]/80'}`}>
                            {weeks} {weeks === 1 ? 'week' : 'weeks'}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 rounded-none bg-white/5 pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 2 - Timetable Name */}
          {effectiveTermId && (
            <div className="space-y-1.5 rounded-none border border-[#1a4d42]/12 bg-white p-2.5 transition-all pb-4 border-b-2 dark:border-white/10 dark:bg-[#0c1a17]">
              <div className="flex items-center gap-1.5">
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-none bg-[#0a1f1a] text-white dark:bg-[#246a59] ${tt.text.micro} font-semibold`}>
                  2
                </div>
                <Label className={`${tt.text.micro} font-semibold uppercase tracking-wide`}>Timetable Name</Label>
              </div>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                placeholder="e.g., TERM 1 TIMETABLE 2016"
                className={`h-8 rounded-none border focus:border-[#246a59]/50 ${tt.text.small} uppercase font-normal tracking-wide`}
              />
            </div>
          )}

          {/* Grades Selection */}
          {effectiveTermId && (
            <div className="space-y-2 rounded-none border border-[#1a4d42]/12 bg-white p-3 pb-4 border-b-2 dark:border-white/10 dark:bg-[#0c1a17]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-[#246a59] dark:text-[#7eb8a8]" />
                <Label className={`${tt.text.micro} font-semibold uppercase tracking-wide`}>
                  Grade Levels <span className={`${tt.text.micro} font-normal ${tt.ink.muted} normal-case ${tt.numeral}`}>({selectedGradeIds.length}/{grades.length})</span>
                </Label>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleSelectAllGrades}
                  disabled={grades.length === 0}
                  className={`h-6 rounded-none ${tt.text.micro} px-1.5`}
                >
                  All
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleClearGrades}
                  disabled={selectedGradeIds.length === 0}
                  className={`h-6 rounded-none ${tt.text.micro} px-1.5`}
                >
                  Clear
                </Button>
              </div>
            </div>
            {grades.length === 0 ? (
              <div className={`rounded-none border bg-[#f8fbfa] dark:bg-white/[0.02] p-1.5 text-center ${tt.text.caption} ${tt.ink.muted} ${tt.border.soft}`}>
                No grades available
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {grades.map((grade) => {
                  const isSelected = selectedGradeIds.includes(grade.id);
                  return (
                    <label
                      key={grade.id}
                      className={`group flex cursor-pointer items-center gap-1 rounded-none border-2 px-2 py-1 transition-all ${
                        isSelected
                          ? 'border-[#0a1f1a] bg-[#0a1f1a] text-white dark:border-[#246a59] dark:bg-[#246a59] dark:text-white'
                          : 'border-[#1a4d42]/12 bg-white hover:border-[#246a59]/60 hover:bg-[#f3f7f5] dark:border-white/10 dark:bg-[#0c1a17] dark:hover:bg-white/[0.03]'
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleGradeToggle(grade.id, checked)}
                        className="h-3 w-3"
                      />
                      <span className={`${tt.text.caption} font-medium whitespace-nowrap`}>
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
          {effectiveTermId && (
            <div className="space-y-2 rounded-none border border-[#1a4d42]/12 bg-white p-2.5 dark:border-white/10 dark:bg-[#0c1a17]">
              <div className="flex items-center gap-1.5">
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-none bg-[#0a1f1a] text-white dark:bg-[#246a59] ${tt.text.micro} font-semibold`}>
                  3
                </div>
                <Label className={`${tt.text.micro} font-semibold uppercase tracking-wide`}>Lesson Periods</Label>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="startTime" className={`${tt.text.caption} font-medium flex items-center gap-1 uppercase tracking-wide`}>
                      <Clock className="h-2.5 w-2.5" />
                      Start Time
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className={`h-8 rounded-none border focus:border-[#246a59]/50 ${tt.text.small}`}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor="periodDuration" className={`${tt.text.caption} font-medium uppercase tracking-wide`}>
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
                      className={`h-8 rounded-none border focus:border-[#246a59]/50 ${tt.text.small}`}
                      placeholder="40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="periodCount" className={`${tt.text.caption} font-medium uppercase tracking-wide`}>
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
                      className={`h-8 rounded-none border focus:border-[#246a59]/50 ${tt.text.small}`}
                      placeholder="8"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor="numberOfDays" className={`${tt.text.caption} font-medium uppercase tracking-wide`}>
                      Days/Week
                    </Label>
                    <Input
                      id="numberOfDays"
                      type="number"
                      min="1"
                      max="7"
                      value={formData.numberOfDays}
                      onChange={(e) => setFormData({ ...formData, numberOfDays: e.target.value })}
                      className={`h-8 rounded-none border focus:border-[#246a59]/50 ${tt.text.small}`}
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="rounded-none border-2 border-[#246a59]/20 bg-gradient-to-br from-[#246a59]/5 to-[#246a59]/10 p-2">
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
                          <Clock className="h-3 w-3 text-[#246a59] dark:text-[#7eb8a8]" />
                          <span className={`${tt.text.caption} font-semibold text-[#246a59] dark:text-[#7eb8a8] uppercase tracking-wide`}>Schedule Preview</span>
                        </div>
                        {isValid ? (
                          <>
                          <div className={`grid grid-cols-2 gap-2 ${tt.text.caption}`}>
                            <div className="space-y-0.5">
                              <span className={`${tt.ink.muted} block ${tt.text.micro}`}>Day starts</span>
                              <span className={`font-semibold ${tt.text.small} ${tt.numeral}`}>{formData.startTime}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className={`${tt.ink.muted} block ${tt.text.micro}`}>Day ends</span>
                              <span className={`font-semibold ${tt.text.small} ${tt.numeral}`}>{lastLessonEndTime}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className={`${tt.ink.muted} block ${tt.text.micro}`}>Periods per day</span>
                              <span className={`font-semibold ${tt.text.small} ${tt.numeral}`}>{periodCount}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className={`${tt.ink.muted} block ${tt.text.micro}`}>Total time</span>
                              <span className={`font-semibold ${tt.text.small} ${tt.numeral}`}>
                                {totalMinutes ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : '—'}
                              </span>
                            </div>
                          </div>
                          <p className={`mt-1.5 ${tt.text.micro} leading-snug ${tt.ink.muted}`}>
                            Periods only — breaks you add next will extend the day.
                          </p>
                          </>
                        ) : (
                          <p className={`${tt.text.caption} ${tt.ink.muted} text-center py-0.5`}>
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
          <div className={`sticky bottom-0 border-t bg-white dark:bg-[#0c1a17] pt-2 mt-3 ${tt.border.hair}`}>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isCreating}
                className={`flex-1 h-8 rounded-none ${tt.text.small}`}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateClick}
                disabled={isCreating || !effectiveTermId || selectedGradeIds.length === 0 || weekTemplatesLoading}
                className={`flex-1 h-8 ${tt.text.small} font-semibold ${tt.accentBtn}`}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    {existingWeekTemplate ? 'Replacing...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-1.5 h-3 w-3" />
                    {existingWeekTemplate ? 'Replace Timetable' : 'Create Timetable'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Info Popup - Below Actions */}
          {showInfoPopup && (
            <div className="flex justify-end mt-2">
              <div className={`relative bg-white dark:bg-[#0c1a17] border border-[#1a4d42]/12 dark:border-white/10 shadow-xl px-3 py-2 max-w-xs rounded-none ${tt.ink.base}`}>
                <button
                  type="button"
                  onClick={() => setShowInfoPopup(false)}
                  className={`absolute top-2 right-2 transition-colors p-0.5 rounded-none hover:bg-[#e8f2ef] dark:hover:bg-white/10 ${tt.ink.faint} hover:text-[#0a1f1a] dark:hover:text-white ${tt.focus}`}
                  aria-label="Close info"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-start gap-2.5 pr-5">
                  <div className="mt-0.5 flex-shrink-0">
                    <div className="h-5 w-5 rounded-none bg-[#246a59]/10 dark:bg-[#246a59]/20 flex items-center justify-center">
                      <Info className="h-3 w-3 text-[#246a59] dark:text-[#7eb8a8]" />
                    </div>
                  </div>
                  <p className={`${tt.text.small} leading-relaxed ${tt.ink.base}`}>
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
