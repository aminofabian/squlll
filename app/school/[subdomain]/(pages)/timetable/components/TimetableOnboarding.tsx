'use client';

import { useCurrentAcademicYear } from '@/lib/hooks/useAcademicYears';
import { useSelectedTerm } from '@/lib/hooks/useSelectedTerm';
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Coffee, BookOpen, CheckCircle2 } from 'lucide-react';

interface TimetableOnboardingProps {
  onCreateWeekTemplate: () => void;
  onCreateBreaks: () => void;
  onCreateLessons: () => void;
  onOpenAcademicYearDrawer: () => void;
  onOpenCreateTermDrawer: () => void;
}

export function TimetableOnboarding({
  onCreateWeekTemplate,
  onCreateBreaks,
  onCreateLessons,
  onOpenAcademicYearDrawer,
  onOpenCreateTermDrawer,
}: TimetableOnboardingProps) {
  const { academicYears, loading: academicYearsLoading } = useCurrentAcademicYear();
  const { selectedTerm } = useSelectedTerm();
  const { timeSlots, breaks } = useTimetableStore();

  // Check onboarding state
  const hasAcademicYear = academicYears.length > 0;
  const hasTerm = !!selectedTerm;
  const hasWeekTemplate = timeSlots.length > 0;
  const hasBreaks = breaks.length > 0;

  // If everything is set up, don't show onboarding
  if (academicYearsLoading) {
    return null;
  }

  // Only hide onboarding if all steps including breaks are complete
  if (hasAcademicYear && hasTerm && hasWeekTemplate && hasBreaks) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Welcome to Timetable Setup
        </h2>
        <p className="text-sm text-muted-foreground">
          Let's get your timetable ready in 5 simple steps
        </p>
      </div>

      <div className="space-y-4">
        {/* Step 1: Academic Year */}
        <div
          className={`border p-5 ${
            !hasAcademicYear
              ? 'border-primary bg-primary/5'
              : 'border-border bg-muted/20'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex h-10 w-10 items-center justify-center ${
                hasAcademicYear
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-primary/10 text-primary'
              }`}
            >
              {hasAcademicYear ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <span className="text-sm font-semibold">1</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Create Academic Year
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {hasAcademicYear
                  ? `Academic year "${academicYears[0]?.name}" is set up`
                  : 'Start by creating an academic year to organize your school calendar'}
              </p>
              {!hasAcademicYear && (
                <Button
                  size="sm"
                  onClick={onOpenAcademicYearDrawer}
                  className="h-8 rounded-none"
                >
                  <Calendar className="h-3.5 w-3.5 mr-2" />
                  Set Academic Year
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Term */}
        <div
          className={`border p-5 ${
            hasAcademicYear && !hasTerm
              ? 'border-primary bg-primary/5'
              : 'border-border bg-muted/20'
          } ${!hasAcademicYear ? 'opacity-50' : ''}`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex h-10 w-10 items-center justify-center ${
                hasTerm
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : hasAcademicYear
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {hasTerm ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <span className="text-sm font-semibold">2</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Create Terms
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {hasTerm
                  ? `Term "${selectedTerm.name}" is active`
                  : 'Add terms (e.g., Term 1, Term 2, Term 3) to divide your academic year'}
              </p>
              {hasAcademicYear && !hasTerm && (
                <Button
                  size="sm"
                  onClick={onOpenCreateTermDrawer}
                  className="h-8 rounded-none"
                >
                  <Calendar className="h-3.5 w-3.5 mr-2" />
                  Create Terms
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Week Template */}
        <div
          className={`border p-5 ${
            hasTerm && !hasWeekTemplate
              ? 'border-primary bg-primary/5'
              : 'border-border bg-muted/20'
          } ${!hasTerm ? 'opacity-50' : ''}`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex h-10 w-10 items-center justify-center ${
                hasWeekTemplate
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : hasTerm
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {hasWeekTemplate ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <span className="text-sm font-semibold">3</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Create Week Template
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {hasWeekTemplate
                  ? `Week template created with ${timeSlots.length} periods`
                  : 'Define your weekly schedule with periods and timing'}
              </p>
              {hasTerm && !hasWeekTemplate && (
                <Button
                  size="sm"
                  onClick={onCreateWeekTemplate}
                  className="h-8 rounded-none"
                >
                  <Clock className="h-3.5 w-3.5 mr-2" />
                  Create Week Template
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Step 4: Create Breaks */}
        <div
          className={`border p-5 ${
            hasWeekTemplate && !hasBreaks
              ? 'border-primary bg-primary/5'
              : 'border-border bg-muted/20'
          } ${!hasWeekTemplate ? 'opacity-50' : ''}`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex h-10 w-10 items-center justify-center ${
                hasBreaks
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : hasWeekTemplate
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {hasBreaks ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <span className="text-sm font-semibold">4</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Create Breaks
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {hasBreaks
                  ? `${breaks.length} break${breaks.length !== 1 ? 's' : ''} configured`
                  : 'Add breaks like assembly, lunch, and short breaks to your schedule'}
              </p>
              {hasWeekTemplate && !hasBreaks && (
                <Button
                  size="sm"
                  onClick={onCreateBreaks}
                  className="h-8 rounded-none"
                >
                  <Coffee className="h-3.5 w-3.5 mr-2" />
                  Create Breaks
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Step 5: Create Lessons */}
        <div
          className={`border p-5 border-border bg-muted/20 ${
            !hasBreaks ? 'opacity-50' : ''
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex h-10 w-10 items-center justify-center ${
                hasBreaks
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <span className="text-sm font-semibold">5</span>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Create Lessons
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Start adding lessons to your timetable for each grade
              </p>
              {hasBreaks && (
                <Button
                  size="sm"
                  onClick={onCreateLessons}
                  className="h-8 rounded-none"
                >
                  <BookOpen className="h-3.5 w-3.5 mr-2" />
                  Create Lessons
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

