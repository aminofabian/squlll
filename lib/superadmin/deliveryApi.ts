import { superAdminGraphqlRequest } from "./graphql";

/**
 * Super Admin delivery reporting for the communications engine — platform-wide
 * SMS delivery outcomes and a recent cross-tenant message feed.
 */

export type PlatformDeliveryStats = {
  windowDays: number;
  smsSent: number;
  smsDelivered: number;
  smsUndelivered: number;
  smsPending: number;
  smsFailed: number;
};

export type PlatformScheduledMessage = {
  id: string;
  tenantId: string;
  tenantName: string | null;
  channel: "SMS" | "EMAIL" | "IN_APP";
  status: "PENDING" | "SENDING" | "SENT" | "FAILED" | "SKIPPED" | "CANCELLED";
  deliveryStatus: "DELIVERED" | "UNDELIVERED" | null;
  recipientName: string | null;
  recipientPhone: string | null;
  recipientEmail: string | null;
  sendAt: string;
  sentAt: string | null;
  lastError: string | null;
};

const STATS_FIELDS = `
  windowDays smsSent smsDelivered smsUndelivered smsPending smsFailed
`;

const MESSAGE_FIELDS = `
  id tenantId tenantName channel status deliveryStatus
  recipientName recipientPhone recipientEmail sendAt sentAt lastError
`;

export async function fetchPlatformDeliveryStats(
  days = 30,
): Promise<PlatformDeliveryStats> {
  const data = await superAdminGraphqlRequest<{
    platformSmsDeliveryStats: PlatformDeliveryStats;
  }>(
    `query ($days: Int) { platformSmsDeliveryStats(days: $days) { ${STATS_FIELDS} } }`,
    { days },
  );
  return data.platformSmsDeliveryStats;
}

export async function fetchPlatformScheduledMessages(
  limit = 50,
  deliveryStatus?: "DELIVERED" | "UNDELIVERED",
): Promise<PlatformScheduledMessage[]> {
  const data = await superAdminGraphqlRequest<{
    platformScheduledMessages: PlatformScheduledMessage[];
  }>(
    `query ($limit: Int, $deliveryStatus: String) {
      platformScheduledMessages(limit: $limit, deliveryStatus: $deliveryStatus) {
        ${MESSAGE_FIELDS}
      }
    }`,
    { limit, deliveryStatus: deliveryStatus ?? null },
  );
  return data.platformScheduledMessages ?? [];
}
