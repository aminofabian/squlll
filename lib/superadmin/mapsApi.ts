import { superAdminGraphqlRequest } from "./graphql";

/**
 * Super-admin platform map settings API.
 *
 * The tile provider + key live server-side (never in the app bundle); this is
 * the control plane the super admin edits from. Keys pasted here should be
 * **restricted client keys** (referrer/domain-locked at the provider), because
 * the resolved style URL is served to authenticated clients.
 */

export type MapProviderKind = "MAPTILER" | "PROTOTOMAPS" | "STADIA" | "CUSTOM";

export interface PlatformMapSettingsRecord {
  enabled: boolean;
  provider: MapProviderKind;
  styleUrl: string | null;
  /** Whether a key is stored; the key itself is never sent to the browser. */
  hasApiKey: boolean;
  /** Whether the server has an encryption key configured (needed to store one). */
  encryptionConfigured: boolean;
  attribution: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
}

export interface UpdatePlatformMapSettingsInput {
  enabled?: boolean;
  provider?: MapProviderKind;
  styleUrl?: string;
  /** Omit to keep the stored key; send a value to replace it. */
  apiKey?: string;
  clearApiKey?: boolean;
  attribution?: string;
}

const FIELDS = `enabled provider styleUrl hasApiKey encryptionConfigured attribution updatedBy updatedAt`;

export async function fetchPlatformMapSettings(): Promise<PlatformMapSettingsRecord> {
  const data = await superAdminGraphqlRequest<{
    platformMapSettings: PlatformMapSettingsRecord;
  }>(`query PlatformMapSettings { platformMapSettings { ${FIELDS} } }`);
  return data.platformMapSettings;
}

export async function updatePlatformMapSettings(
  input: UpdatePlatformMapSettingsInput,
): Promise<PlatformMapSettingsRecord> {
  const data = await superAdminGraphqlRequest<{
    updatePlatformMapSettings: PlatformMapSettingsRecord;
  }>(
    `mutation UpdatePlatformMapSettings($input: UpdatePlatformMapSettingsInput!) {
      updatePlatformMapSettings(input: $input) { ${FIELDS} }
    }`,
    { input },
  );
  return data.updatePlatformMapSettings;
}
