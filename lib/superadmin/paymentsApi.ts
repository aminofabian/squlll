import { superAdminGraphqlRequest } from "./graphql";

export type PlatformDarajaSettings = {
  enabled: boolean;
  environment: string;
  shortcodeType: string;
  shortcode: string | null;
  hasConsumerKey: boolean;
  hasConsumerSecret: boolean;
  hasPasskey: boolean;
  encryptionConfigured: boolean;
  updatedAt: string | null;
};

export type PlatformMpesaCustodySettings = {
  custodyProvider: string;
  updatedAt: string | null;
};

export type PlatformDarajaTestResult = {
  ok: boolean;
  message: string;
};

const DARAJA_QUERY = `
  query PlatformDarajaSettings {
    platformDarajaSettings {
      enabled
      environment
      shortcodeType
      shortcode
      hasConsumerKey
      hasConsumerSecret
      hasPasskey
      encryptionConfigured
      updatedAt
    }
  }
`;

const CUSTODY_QUERY = `
  query PlatformMpesaCustodySettings {
    platformMpesaCustodySettings {
      custodyProvider
      updatedAt
    }
  }
`;

const UPDATE_DARAJA = `
  mutation UpdatePlatformDarajaSettings($input: UpdatePlatformDarajaSettingsInput!) {
    updatePlatformDarajaSettings(input: $input) {
      enabled
      environment
      shortcodeType
      shortcode
      hasConsumerKey
      hasConsumerSecret
      hasPasskey
      encryptionConfigured
      updatedAt
    }
  }
`;

const TEST_DARAJA = `
  mutation TestPlatformDarajaConnection {
    testPlatformDarajaConnection {
      ok
      message
    }
  }
`;

const UPDATE_CUSTODY = `
  mutation UpdatePlatformMpesaCustody($input: UpdatePlatformMpesaCustodyInput!) {
    updatePlatformMpesaCustody(input: $input) {
      custodyProvider
      updatedAt
    }
  }
`;

export async function fetchPlatformDarajaSettings(): Promise<PlatformDarajaSettings> {
  const data = await superAdminGraphqlRequest<{
    platformDarajaSettings: PlatformDarajaSettings;
  }>(DARAJA_QUERY);
  return data.platformDarajaSettings;
}

export async function fetchPlatformMpesaCustody(): Promise<PlatformMpesaCustodySettings> {
  const data = await superAdminGraphqlRequest<{
    platformMpesaCustodySettings: PlatformMpesaCustodySettings;
  }>(CUSTODY_QUERY);
  return data.platformMpesaCustodySettings;
}

export async function updatePlatformDarajaSettings(
  input: Record<string, unknown>,
): Promise<PlatformDarajaSettings> {
  const data = await superAdminGraphqlRequest<{
    updatePlatformDarajaSettings: PlatformDarajaSettings;
  }>(UPDATE_DARAJA, { input });
  return data.updatePlatformDarajaSettings;
}

export async function testPlatformDarajaConnection(): Promise<PlatformDarajaTestResult> {
  const data = await superAdminGraphqlRequest<{
    testPlatformDarajaConnection: PlatformDarajaTestResult;
  }>(TEST_DARAJA);
  return data.testPlatformDarajaConnection;
}

export async function updatePlatformMpesaCustody(
  custodyProvider: string,
): Promise<PlatformMpesaCustodySettings> {
  const data = await superAdminGraphqlRequest<{
    updatePlatformMpesaCustody: PlatformMpesaCustodySettings;
  }>(UPDATE_CUSTODY, { input: { custodyProvider } });
  return data.updatePlatformMpesaCustody;
}
