import { superAdminGraphqlRequest } from "./graphql";
import type {
  CancelSubscriptionInput,
  UpdateSubscriptionInput,
} from "./subscriptions";
import type { SubscriptionRecord } from "./types";

const SUBSCRIPTION_FIELDS = `
  id
  status
  startDate
  endDate
  trialEndDate
  graceEndDate
  autoRenew
  cancellationReason
  cancelledAt
  createdAt
  tenant { id name }
  plan { id name monthlyPrice }
`;

const SUBSCRIPTIONS_QUERY = `
  query AllTenantSubscriptions {
    allTenantSubscriptions {
      success
      subscriptions {
        ${SUBSCRIPTION_FIELDS}
      }
    }
  }
`;

export async function fetchAllSubscriptions(): Promise<SubscriptionRecord[]> {
  const data = await superAdminGraphqlRequest<{
    allTenantSubscriptions: {
      success: boolean;
      subscriptions: SubscriptionRecord[];
    };
  }>(SUBSCRIPTIONS_QUERY);

  return data.allTenantSubscriptions?.subscriptions ?? [];
}

export async function updateSubscription(
  input: UpdateSubscriptionInput,
): Promise<SubscriptionRecord> {
  const data = await superAdminGraphqlRequest<{
    updateSubscription: {
      success: boolean;
      message?: string;
      subscription?: SubscriptionRecord;
    };
  }>(
    `
      mutation UpdateSubscription($input: UpdateSubscriptionInput!) {
        updateSubscription(input: $input) {
          success
          message
          subscription {
            ${SUBSCRIPTION_FIELDS}
          }
        }
      }
    `,
    { input },
  );

  const result = data.updateSubscription;
  if (!result?.success || !result.subscription) {
    throw new Error(result?.message || "Failed to update subscription");
  }

  return result.subscription;
}

export async function cancelSubscription(
  input: CancelSubscriptionInput,
): Promise<SubscriptionRecord> {
  const data = await superAdminGraphqlRequest<{
    cancelSubscription: {
      success: boolean;
      message?: string;
      subscription?: SubscriptionRecord;
    };
  }>(
    `
      mutation CancelSubscription($input: CancelSubscriptionInput!) {
        cancelSubscription(input: $input) {
          success
          message
          subscription {
            ${SUBSCRIPTION_FIELDS}
          }
        }
      }
    `,
    { input },
  );

  const result = data.cancelSubscription;
  if (!result?.success || !result.subscription) {
    throw new Error(result?.message || "Failed to cancel subscription");
  }

  return result.subscription;
}
