import { superAdminGraphqlRequest } from "./graphql";

export type PlatformSmsSettingsRecord = {
  enabled: boolean;
  provider: string;
  username: string | null;
  partnerId: string | null;
  senderId: string | null;
  hasApiKey: boolean;
  notifyFeePayment: boolean;
  notifyTransportEmergency: boolean;
  notifyTransportNoShow: boolean;
  configured: boolean;
  encryptionConfigured: boolean;
  updatedBy: string | null;
  updatedAt: string | null;
};

export type UpdatePlatformSmsSettingsInput = {
  enabled?: boolean;
  provider?: string;
  username?: string;
  partnerId?: string;
  apiKey?: string;
  clearApiKey?: boolean;
  senderId?: string;
  notifyFeePayment?: boolean;
  notifyTransportEmergency?: boolean;
  notifyTransportNoShow?: boolean;
};

export type SmsTestResult = {
  provider: string;
  configured: boolean;
  missing: string[];
  reachable: boolean | null;
  to: string | null;
  message: string;
};

const SETTINGS_FIELDS = `
  enabled
  provider
  username
  partnerId
  senderId
  hasApiKey
  notifyFeePayment
  notifyTransportEmergency
  notifyTransportNoShow
  configured
  encryptionConfigured
  updatedBy
  updatedAt
`;

const SETTINGS_QUERY = `
  query PlatformSmsSettings {
    platformSmsSettings { ${SETTINGS_FIELDS} }
  }
`;

const UPDATE_SETTINGS = `
  mutation UpdatePlatformSmsSettings($input: UpdatePlatformSmsSettingsInput!) {
    updatePlatformSmsSettings(input: $input) { ${SETTINGS_FIELDS} }
  }
`;

const TEST_SMS = `
  mutation TestPlatformSms($to: String!, $message: String) {
    testPlatformSms(to: $to, message: $message) {
      provider
      configured
      missing
      reachable
      to
      message
    }
  }
`;

export async function fetchPlatformSmsSettings(): Promise<PlatformSmsSettingsRecord> {
  const data = await superAdminGraphqlRequest<{
    platformSmsSettings: PlatformSmsSettingsRecord;
  }>(SETTINGS_QUERY);
  return data.platformSmsSettings;
}

export async function updatePlatformSmsSettings(
  input: UpdatePlatformSmsSettingsInput,
): Promise<PlatformSmsSettingsRecord> {
  const data = await superAdminGraphqlRequest<{
    updatePlatformSmsSettings: PlatformSmsSettingsRecord;
  }>(UPDATE_SETTINGS, { input });
  return data.updatePlatformSmsSettings;
}

export async function testPlatformSms(
  to: string,
  message?: string,
): Promise<SmsTestResult> {
  const data = await superAdminGraphqlRequest<{
    testPlatformSms: SmsTestResult;
  }>(TEST_SMS, { to, message: message ?? null });
  return data.testPlatformSms;
}
