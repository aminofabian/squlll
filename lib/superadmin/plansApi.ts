import { superAdminGraphqlRequest } from "./graphql";
import type { PlanFormValues, PlanRecord } from "./plans";

interface PlansQueryResult {
  plans: {
    success: boolean;
    plans: PlanRecord[];
  };
}

interface PlanMutationResult {
  createPlan?: {
    success: boolean;
    message?: string;
    plan?: PlanRecord;
  };
  updatePlan?: {
    success: boolean;
    message?: string;
    plan?: PlanRecord;
  };
  deletePlan?: {
    success: boolean;
    message?: string;
  };
}

const PLANS_QUERY = `
  query SuperAdminPlans {
    plans {
      success
      plans {
        id
        name
        description
        monthlyPrice
        yearlyPrice
        trialDays
        graceDays
        features
        limits
        isDefault
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

function formToInput(values: PlanFormValues, id?: number) {
  const limits = {
    maxStudents: Number(values.limits.maxStudents) || 0,
    maxTeachers: Number(values.limits.maxTeachers) || 0,
    maxStorage: Number(values.limits.maxStorage) || 0,
  };

  const base = {
    name: values.name.trim(),
    description: values.description.trim() || null,
    monthlyPrice: Number(values.monthlyPrice) || 0,
    yearlyPrice: values.yearlyPrice ? Number(values.yearlyPrice) : null,
    trialDays: Number(values.trialDays) || 0,
    graceDays: Number(values.graceDays) || 0,
    features: values.features,
    limits,
    isDefault: values.isDefault,
    isActive: values.isActive,
  };

  if (id != null) {
    return { id, ...base };
  }

  return base;
}

export async function fetchPlans(): Promise<PlanRecord[]> {
  const data = await superAdminGraphqlRequest<PlansQueryResult>(PLANS_QUERY);
  return data.plans?.plans ?? [];
}

export async function createPlan(values: PlanFormValues): Promise<PlanRecord> {
  const data = await superAdminGraphqlRequest<PlanMutationResult>(
    `
      mutation CreatePlan($input: CreatePlanInput!) {
        createPlan(input: $input) {
          success
          message
          plan {
            id
            name
            description
            monthlyPrice
            yearlyPrice
            trialDays
            graceDays
            features
            limits
            isDefault
            isActive
            createdAt
            updatedAt
          }
        }
      }
    `,
    { input: formToInput(values) },
  );

  const result = data.createPlan;
  if (!result?.success || !result.plan) {
    throw new Error(result?.message || "Failed to create plan");
  }

  return result.plan;
}

export async function updatePlan(
  id: number,
  values: PlanFormValues,
): Promise<PlanRecord> {
  const data = await superAdminGraphqlRequest<PlanMutationResult>(
    `
      mutation UpdatePlan($input: UpdatePlanInput!) {
        updatePlan(input: $input) {
          success
          message
          plan {
            id
            name
            description
            monthlyPrice
            yearlyPrice
            trialDays
            graceDays
            features
            limits
            isDefault
            isActive
            createdAt
            updatedAt
          }
        }
      }
    `,
    { input: formToInput(values, id) },
  );

  const result = data.updatePlan;
  if (!result?.success || !result.plan) {
    throw new Error(result?.message || "Failed to update plan");
  }

  return result.plan;
}

export async function deletePlan(id: number): Promise<void> {
  const data = await superAdminGraphqlRequest<PlanMutationResult>(
    `
      mutation DeletePlan($id: Int!) {
        deletePlan(id: $id) {
          success
          message
        }
      }
    `,
    { id },
  );

  const result = data.deletePlan;
  if (!result?.success) {
    throw new Error(result?.message || "Failed to deactivate plan");
  }
}
