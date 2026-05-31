export const PLAN_FEATURES = [
  { key: "TIMETABLE", label: "Timetable" },
  { key: "LIBRARY", label: "Library" },
  { key: "EXAM_MODULE", label: "Exam module" },
  { key: "SMS_ALERTS", label: "SMS alerts" },
  { key: "FINANCE", label: "Finance" },
  { key: "HOSTEL_MANAGEMENT", label: "Hostel management" },
  { key: "TRANSPORT", label: "Transport" },
  { key: "ANALYTICS", label: "Analytics" },
] as const;

export type PlanFeatureKey = (typeof PLAN_FEATURES)[number]["key"];

export interface PlanRecord {
  id: string;
  name: string;
  description?: string | null;
  monthlyPrice: number;
  yearlyPrice?: number | null;
  trialDays: number;
  graceDays: number;
  features: Record<string, boolean>;
  limits: Record<string, number>;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlanFormValues {
  name: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  trialDays: string;
  graceDays: string;
  features: Record<PlanFeatureKey, boolean>;
  limits: {
    maxStudents: string;
    maxTeachers: string;
    maxStorage: string;
  };
  isDefault: boolean;
  isActive: boolean;
}

export const DEFAULT_PLAN_FEATURES: Record<PlanFeatureKey, boolean> = {
  TIMETABLE: true,
  LIBRARY: false,
  EXAM_MODULE: true,
  SMS_ALERTS: false,
  FINANCE: false,
  HOSTEL_MANAGEMENT: false,
  TRANSPORT: false,
  ANALYTICS: false,
};

export const DEFAULT_PLAN_LIMITS = {
  maxStudents: "100",
  maxTeachers: "10",
  maxStorage: "1",
};

export function createEmptyPlanForm(): PlanFormValues {
  return {
    name: "",
    description: "",
    monthlyPrice: "0",
    yearlyPrice: "",
    trialDays: "30",
    graceDays: "15",
    features: { ...DEFAULT_PLAN_FEATURES },
    limits: { ...DEFAULT_PLAN_LIMITS },
    isDefault: false,
    isActive: true,
  };
}

export function planToFormValues(plan: PlanRecord): PlanFormValues {
  return {
    name: plan.name,
    description: plan.description ?? "",
    monthlyPrice: String(plan.monthlyPrice ?? 0),
    yearlyPrice:
      plan.yearlyPrice != null ? String(plan.yearlyPrice) : "",
    trialDays: String(plan.trialDays ?? 0),
    graceDays: String(plan.graceDays ?? 0),
    features: PLAN_FEATURES.reduce(
      (acc, feature) => ({
        ...acc,
        [feature.key]: Boolean(plan.features?.[feature.key]),
      }),
      {} as Record<PlanFeatureKey, boolean>,
    ),
    limits: {
      maxStudents: String(plan.limits?.maxStudents ?? 100),
      maxTeachers: String(plan.limits?.maxTeachers ?? 10),
      maxStorage: String(plan.limits?.maxStorage ?? 1),
    },
    isDefault: plan.isDefault,
    isActive: plan.isActive,
  };
}

export function formatPlanPrice(price: number): string {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function formatPlanLimit(value: number, label: string): string {
  if (value === -1) return `Unlimited ${label.toLowerCase()}`;
  return `${value} ${label.toLowerCase()}`;
}

export const PLAN_LIMIT_LABELS: Record<string, string> = {
  maxStudents: "Students",
  maxTeachers: "Teachers",
  maxStorage: "GB storage",
};
