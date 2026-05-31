import { useMemo } from "react";
import { SCHOOL_SETUP_STEPS } from "@/lib/dashboard/setup-steps";
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore";
import { useTenantStatistics } from "@/lib/hooks/useTenantStatistics";
import { useGetTeachers } from "@/lib/hooks/useTeachers";
import {
  getTenantIdFromCookies,
  isSchoolOnboardingComplete,
} from "@/lib/utils/school-onboarding";

export interface SetupStepWithStatus {
  id: string;
  label: string;
  description: string;
  path: string;
  icon: (typeof SCHOOL_SETUP_STEPS)[number]["icon"];
  isComplete: boolean;
}

function computeStepCompletion(
  stepId: string,
  options: {
    hasStreams: boolean;
    hasGrades: boolean;
    hasStudents: boolean;
    hasTeachers: boolean;
    hasSubjects: boolean;
    hasSchoolProfile: boolean;
  },
): boolean {
  switch (stepId) {
    case "classes":
      return options.hasStreams || options.hasGrades;
    case "students":
      return options.hasStudents;
    case "teachers":
      return options.hasTeachers;
    case "subjects":
      return options.hasSubjects;
    case "school-details":
      return options.hasSchoolProfile;
    default:
      return false;
  }
}

export function useSchoolSetupProgress() {
  const { config } = useSchoolConfigStore();
  const { data: tenantStats, isLoading: statsLoading } = useTenantStatistics();
  const { teachers, isLoading: teachersLoading } = useGetTeachers();
  const tenantId = getTenantIdFromCookies();

  const flags = useMemo(() => {
    const levels = config?.selectedLevels ?? [];
    const hasGrades = levels.some((level) => (level.gradeLevels?.length ?? 0) > 0);
    const hasStreams = levels.some((level) =>
      level.gradeLevels?.some((grade) => (grade.streams?.length ?? 0) > 0),
    );
    const hasSubjects = levels.some((level) => (level.subjects?.length ?? 0) > 0);
    const hasStudents = (tenantStats?.studentCount ?? 0) > 0;
    const hasTeachers =
      (tenantStats?.teacherCount ?? 0) > 0 || teachers.length > 0;
    const hasSchoolProfile = isSchoolOnboardingComplete(tenantId);

    return {
      hasGrades,
      hasStreams,
      hasSubjects,
      hasStudents,
      hasTeachers,
      hasSchoolProfile,
    };
  }, [config?.selectedLevels, tenantStats, teachers.length, tenantId]);

  const steps: SetupStepWithStatus[] = useMemo(
    () =>
      SCHOOL_SETUP_STEPS.map((step) => ({
        ...step,
        isComplete: computeStepCompletion(step.id, flags),
      })),
    [flags],
  );

  const completedCount = steps.filter((step) => step.isComplete).length;
  const nextStep = steps.find((step) => !step.isComplete) ?? null;
  const isComplete = completedCount === steps.length;

  return {
    steps,
    completedCount,
    totalCount: steps.length,
    nextStep,
    isComplete,
    isLoading: statsLoading || teachersLoading,
  };
}
