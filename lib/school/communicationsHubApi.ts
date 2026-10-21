/**
 * Unified communications API client.
 *
 * Same request convention as the rest of the school dashboard: same-origin
 * `/api/graphql`, cookies with a Bearer fallback. All calls are tenant-scoped
 * server-side; nothing here needs to pass a tenant id.
 */

export type CommChannel = "EMAIL" | "SMS" | "WHATSAPP" | "IN_APP";

/**
 * GraphQL serializes permission enums by their enum name (VIEW, ...), not the
 * internal dotted value used by the server guard. Keep this union aligned with
 * the `CommunicationPermission` enum.
 */
export type CommPermissionKey =
  | "VIEW"
  | "CAMPAIGNS_CREATE"
  | "CAMPAIGNS_SEND"
  | "CAMPAIGNS_MANAGE"
  | "TEMPLATES_MANAGE"
  | "AUTOMATIONS_MANAGE"
  | "SETTINGS_MANAGE"
  | "REPORTS_VIEW"
  | "CREDITS_VIEW"
  | "AUDIT_VIEW"
  | "TESTS_SEND";

export type CommPermissionInfo = {
  key: CommPermissionKey;
  label: string;
  description: string;
  group: string;
};

export type CommPermissions = {
  role: string | null;
  permissions: CommPermissionKey[];
  catalog: CommPermissionInfo[];
};

export type CommChannelHealth = {
  channel: CommChannel;
  enabled: boolean;
  configured: boolean;
  detail: string;
};

export type CommStatus =
  | "PENDING"
  | "SENDING"
  | "SENT"
  | "FAILED"
  | "SKIPPED"
  | "CANCELLED";

export type CommCampaignStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "SENDING"
  | "SENT"
  | "PARTIALLY_SENT"
  | "FAILED"
  | "CANCELLED";

export type CommAuditEntry = {
  id: string;
  action: string;
  actorName: string | null;
  actorRole: string | null;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type CommMessage = {
  id: string;
  campaignId: string | null;
  automationId: string | null;
  communicationEventId: string | null;
  channel: CommChannel;
  status: CommStatus;
  recipientKind: string;
  recipientName: string | null;
  recipientPhone: string | null;
  recipientEmail: string | null;
  studentId: string | null;
  subject: string | null;
  body: string;
  sendAt: string;
  sentAt: string | null;
  deliveryStatus: "DELIVERED" | "UNDELIVERED" | null;
  deliveredAt: string | null;
  provider: string | null;
  failureCode: string | null;
  attempts: number;
  maxAttempts: number;
  lastError: string | null;
  createdAt: string;
};

export type CommMessagePage = {
  rows: CommMessage[];
  total: number;
  hasMore: boolean;
};

export type CommMessageFilter = {
  campaignId?: string | null;
  automationId?: string | null;
  channel?: CommChannel | null;
  status?: CommStatus | null;
  search?: string | null;
  from?: string | null;
  to?: string | null;
  limit?: number;
  offset?: number;
};

export type CommDeliveryBreakdown = {
  channel: CommChannel;
  total: number;
  sent: number;
  delivered: number;
  undelivered: number;
  failed: number;
  skipped: number;
  queued: number;
};

export type CommDeliveryReport = {
  windowDays: number;
  total: number;
  sent: number;
  delivered: number;
  undelivered: number;
  failed: number;
  skipped: number;
  queued: number;
  cancelled: number;
  deliveryRate: number;
  byChannel: CommDeliveryBreakdown[];
};

export type CommOverview = {
  sentLast30Days: number;
  deliveredLast30Days: number;
  failedLast30Days: number;
  queued: number;
  deliveryRate: number;
  activeAutomations: number;
  totalAutomations: number;
  scheduledCampaigns: number;
  campaignsSentLast30Days: number;
  smsCreditsAvailable: number;
  smsLowBalance: boolean;
  smsMeteringEnabled: boolean;
  channelHealth: CommChannelHealth[];
  recentMessages: CommMessage[];
  recentAudit: CommAuditEntry[];
};

export type CommAudience = {
  type: string;
  gradeId?: string | null;
  streamId?: string | null;
  gradeIds?: string[] | null;
  streamIds?: string[] | null;
  studentIds?: string[] | null;
};

export type CommCampaignStats = {
  total: number;
  queued: number;
  sending: number;
  sent: number;
  failed: number;
  skipped: number;
  cancelled: number;
  delivered: number;
  undelivered: number;
  deliveryRate: number;
};

export type CommCampaign = {
  id: string;
  name: string;
  description: string | null;
  channels: CommChannel[];
  audience: CommAudience;
  templateId: string | null;
  templateName: string | null;
  subject: string | null;
  bodySms: string | null;
  bodyEmail: string | null;
  bodyWhatsApp: string | null;
  scheduledAt: string | null;
  status: CommCampaignStatus;
  effectiveStatus: CommCampaignStatus;
  recipientCount: number;
  createdByName: string | null;
  startedAt: string | null;
  completedAt: string | null;
  stats: CommCampaignStats;
  createdAt: string;
  updatedAt: string;
};

export type CommCampaignPreview = {
  recipientCount: number;
  withPhone: number;
  withEmail: number;
  withWhatsApp: number;
  smsBody: string;
  smsSegments: number;
  whatsAppBody: string;
  emailSubject: string | null;
  emailBody: string | null;
  estimatedSmsCredits: number;
  creditsAvailable: number;
  smsMeteringEnabled: boolean;
  lowBalance: boolean;
  samples: Array<{
    name: string | null;
    studentName: string | null;
    phone: string | null;
    email: string | null;
  }>;
};

export type CommAudienceOptions = {
  grades: Array<{ id: string; name: string }>;
  streams: Array<{ id: string; name: string; gradeName: string | null }>;
};

export type CommStudentOption = {
  id: string;
  name: string;
  admissionNumber: string | null;
};

export type CommAutomation = {
  id: string;
  name: string;
  description: string | null;
  eventType: string;
  channels: CommChannel[];
  audience: CommAudience;
  templateId: string | null;
  templateName: string | null;
  delayMinutes: number;
  condition: Record<string, unknown> | null;
  enabled: boolean;
  lastRunAt: string | null;
  sentLast30Days: number;
  createdAt: string;
};

export type CommTrigger = {
  type: string;
  label: string;
  group: string;
  description: string;
  defaultAudience: string;
  defaultChannels: CommChannel[];
  variables: string[];
};

export type CommTemplate = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  eventType: string | null;
  subject: string | null;
  bodySms: string | null;
  bodyEmail: string | null;
  bodyWhatsApp: string | null;
  isDefault: boolean;
  variables: string[];
  createdAt: string;
  updatedAt: string;
};

export type CommTemplatePreview = {
  subject: string | null;
  smsBody: string;
  smsSegments: number;
  emailBody: string | null;
  whatsAppBody: string;
  variables: string[];
};

export type CommSettings = {
  timezone: string;
  smsEnabled: boolean;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  whatsappEnabled: boolean;
  whatsappSenderName: string | null;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  dailySmsCap: number | null;
  smsSenderName: string | null;
  optOutFooter: string | null;
};

export type CommCampaignInput = {
  name: string;
  description?: string | null;
  channels: CommChannel[];
  audience: CommAudience;
  templateId?: string | null;
  subject?: string | null;
  bodySms?: string | null;
  bodyEmail?: string | null;
  bodyWhatsApp?: string | null;
  scheduledAt?: string | null;
  mode?: "DRAFT" | "SEND_NOW" | "SCHEDULE";
};

export type CommTestInput = {
  channel: CommChannel;
  to: string;
  subject?: string | null;
  bodySms?: string | null;
  bodyEmail?: string | null;
  bodyWhatsApp?: string | null;
  templateId?: string | null;
  sampleName?: string | null;
};

async function gqlRequest<T>(body: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const accessToken =
    typeof window !== "undefined"
      ? window.localStorage.getItem("accessToken")
      : null;
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch("/api/graphql", {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message?: string }>;
  };
  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message || "Request failed");
  }
  if (!payload.data) throw new Error("Request returned no data");
  return payload.data;
}

const CHANNEL_HEALTH_FIELDS = `
  channel enabled configured detail
`;

const MESSAGE_FIELDS = `
  id campaignId automationId communicationEventId channel status
  recipientKind recipientName recipientPhone recipientEmail studentId
  subject body sendAt sentAt deliveryStatus deliveredAt provider failureCode
  attempts maxAttempts lastError createdAt
`;

const AUDIT_FIELDS = `
  id action actorName actorRole entityType entityId metadata createdAt
`;

const CAMPAIGN_FIELDS = `
  id name description channels audience templateId templateName
  subject bodySms bodyEmail bodyWhatsApp scheduledAt status effectiveStatus
  recipientCount createdByName startedAt completedAt createdAt updatedAt
  stats {
    total queued sending sent failed skipped cancelled delivered undelivered deliveryRate
  }
`;

const TEMPLATE_FIELDS = `
  id name description category eventType subject bodySms bodyEmail bodyWhatsApp
  isDefault variables createdAt updatedAt
`;

const AUTOMATION_FIELDS = `
  id name description eventType channels audience templateId templateName
  delayMinutes condition enabled lastRunAt sentLast30Days createdAt
`;

const SETTINGS_FIELDS = `
  timezone smsEnabled emailEnabled inAppEnabled whatsappEnabled whatsappSenderName
  quietHoursStart quietHoursEnd dailySmsCap smsSenderName optOutFooter
`;

export async function fetchCommPermissions(): Promise<CommPermissions> {
  const data = await gqlRequest<{ commPermissions: CommPermissions }>({
    query: `query { commPermissions { role permissions catalog { key label description group } } }`,
  });
  return data.commPermissions;
}

export async function fetchCommOverview(): Promise<CommOverview> {
  const data = await gqlRequest<{ commOverview: CommOverview }>({
    query: `query {
      commOverview {
        sentLast30Days deliveredLast30Days failedLast30Days queued deliveryRate
        activeAutomations totalAutomations scheduledCampaigns campaignsSentLast30Days
        smsCreditsAvailable smsLowBalance smsMeteringEnabled
        channelHealth { ${CHANNEL_HEALTH_FIELDS} }
        recentMessages { ${MESSAGE_FIELDS} }
        recentAudit { ${AUDIT_FIELDS} }
      }
    }`,
  });
  return data.commOverview;
}

export async function fetchCommCampaigns(
  status?: string | null,
  search?: string | null,
): Promise<CommCampaign[]> {
  const data = await gqlRequest<{ commCampaigns: CommCampaign[] }>({
    query: `query ($status: String, $search: String) {
      commCampaigns(status: $status, search: $search) { ${CAMPAIGN_FIELDS} }
    }`,
    variables: { status: status ?? null, search: search ?? null },
  });
  return data.commCampaigns ?? [];
}

export async function fetchCommCampaign(id: string): Promise<CommCampaign> {
  const data = await gqlRequest<{ commCampaign: CommCampaign }>({
    query: `query ($id: ID!) { commCampaign(id: $id) { ${CAMPAIGN_FIELDS} } }`,
    variables: { id },
  });
  return data.commCampaign;
}

export async function previewCommCampaign(
  input: CommCampaignInput,
): Promise<CommCampaignPreview> {
  const data = await gqlRequest<{
    previewCommCampaign: CommCampaignPreview;
  }>({
    query: `query ($input: SaveCommunicationCampaignInput!) {
      previewCommCampaign(input: $input) {
        recipientCount withPhone withEmail withWhatsApp
        smsBody smsSegments whatsAppBody emailSubject emailBody
        estimatedSmsCredits creditsAvailable smsMeteringEnabled lowBalance
        samples { name studentName phone email }
      }
    }`,
    variables: { input },
  });
  return data.previewCommCampaign;
}

export async function saveCommCampaign(
  input: CommCampaignInput,
  id?: string | null,
): Promise<CommCampaign> {
  const data = await gqlRequest<{ saveCommCampaign: CommCampaign }>({
    query: `mutation ($input: SaveCommunicationCampaignInput!, $id: ID) {
      saveCommCampaign(input: $input, id: $id) { ${CAMPAIGN_FIELDS} }
    }`,
    variables: { input, id: id ?? null },
  });
  return data.saveCommCampaign;
}

export async function sendCommCampaign(id: string): Promise<CommCampaign> {
  const data = await gqlRequest<{ sendCommCampaign: CommCampaign }>({
    query: `mutation ($id: ID!) { sendCommCampaign(id: $id) { ${CAMPAIGN_FIELDS} } }`,
    variables: { id },
  });
  return data.sendCommCampaign;
}

export async function scheduleCommCampaign(
  id: string,
  scheduledAt: string,
): Promise<CommCampaign> {
  const data = await gqlRequest<{ scheduleCommCampaign: CommCampaign }>({
    query: `mutation ($id: ID!, $scheduledAt: Date!) {
      scheduleCommCampaign(id: $id, scheduledAt: $scheduledAt) { ${CAMPAIGN_FIELDS} }
    }`,
    variables: { id, scheduledAt },
  });
  return data.scheduleCommCampaign;
}

export async function cancelCommCampaign(id: string): Promise<CommCampaign> {
  const data = await gqlRequest<{ cancelCommCampaign: CommCampaign }>({
    query: `mutation ($id: ID!) { cancelCommCampaign(id: $id) { ${CAMPAIGN_FIELDS} } }`,
    variables: { id },
  });
  return data.cancelCommCampaign;
}

export async function duplicateCommCampaign(id: string): Promise<CommCampaign> {
  const data = await gqlRequest<{ duplicateCommCampaign: CommCampaign }>({
    query: `mutation ($id: ID!) { duplicateCommCampaign(id: $id) { ${CAMPAIGN_FIELDS} } }`,
    variables: { id },
  });
  return data.duplicateCommCampaign;
}

export async function deleteCommCampaign(id: string): Promise<boolean> {
  const data = await gqlRequest<{ deleteCommCampaign: boolean }>({
    query: `mutation ($id: ID!) { deleteCommCampaign(id: $id) }`,
    variables: { id },
  });
  return data.deleteCommCampaign;
}

export async function sendCommTest(input: CommTestInput): Promise<{
  ok: boolean;
  message: string;
  provider: string;
  messageId: string | null;
}> {
  const data = await gqlRequest<{
    sendCommTest: {
      ok: boolean;
      message: string;
      provider: string;
      messageId: string | null;
    };
  }>({
    query: `mutation ($input: CommunicationCampaignTestSendInput!) {
      sendCommTest(input: $input) { ok message provider messageId }
    }`,
    variables: { input },
  });
  return data.sendCommTest;
}

export async function fetchCommAutomations(): Promise<CommAutomation[]> {
  const data = await gqlRequest<{ commAutomations: CommAutomation[] }>({
    query: `query { commAutomations { ${AUTOMATION_FIELDS} } }`,
  });
  return data.commAutomations ?? [];
}

export async function fetchCommAutomationCatalog(): Promise<CommTrigger[]> {
  const data = await gqlRequest<{ commAutomationCatalog: CommTrigger[] }>({
    query: `query {
      commAutomationCatalog {
        type label group description defaultAudience defaultChannels variables
      }
    }`,
  });
  return data.commAutomationCatalog ?? [];
}

export type CommAutomationInput = {
  name: string;
  description?: string | null;
  eventType: string;
  channels: CommChannel[];
  audience: CommAudience;
  templateId?: string | null;
  delayMinutes?: number;
  enabled?: boolean;
};

export async function saveCommAutomation(
  input: CommAutomationInput,
  id?: string | null,
): Promise<CommAutomation> {
  const data = await gqlRequest<{ saveCommAutomation: CommAutomation }>({
    query: `mutation ($input: CommunicationAutomationInput!, $id: ID) {
      saveCommAutomation(input: $input, id: $id) { ${AUTOMATION_FIELDS} }
    }`,
    variables: { input, id: id ?? null },
  });
  return data.saveCommAutomation;
}

export async function toggleCommAutomation(
  id: string,
  enabled: boolean,
): Promise<CommAutomation> {
  const data = await gqlRequest<{ toggleCommAutomation: CommAutomation }>({
    query: `mutation ($id: ID!, $enabled: Boolean!) {
      toggleCommAutomation(id: $id, enabled: $enabled) { ${AUTOMATION_FIELDS} }
    }`,
    variables: { id, enabled },
  });
  return data.toggleCommAutomation;
}

export async function duplicateCommAutomation(
  id: string,
): Promise<CommAutomation> {
  const data = await gqlRequest<{ duplicateCommAutomation: CommAutomation }>({
    query: `mutation ($id: ID!) { duplicateCommAutomation(id: $id) { ${AUTOMATION_FIELDS} } }`,
    variables: { id },
  });
  return data.duplicateCommAutomation;
}

export async function deleteCommAutomation(id: string): Promise<boolean> {
  const data = await gqlRequest<{ deleteCommAutomation: boolean }>({
    query: `mutation ($id: ID!) { deleteCommAutomation(id: $id) }`,
    variables: { id },
  });
  return data.deleteCommAutomation;
}

export async function fetchCommTemplates(): Promise<CommTemplate[]> {
  const data = await gqlRequest<{ commTemplates: CommTemplate[] }>({
    query: `query { commTemplates { ${TEMPLATE_FIELDS} } }`,
  });
  return data.commTemplates ?? [];
}

export type CommTemplateInput = {
  name: string;
  description?: string | null;
  category?: string;
  eventType?: string | null;
  subject?: string | null;
  bodySms?: string | null;
  bodyEmail?: string | null;
  bodyWhatsApp?: string | null;
};

export async function saveCommTemplate(
  input: CommTemplateInput,
  id?: string | null,
): Promise<CommTemplate> {
  const data = await gqlRequest<{ saveCommTemplate: CommTemplate }>({
    query: `mutation ($input: SaveCommunicationTemplateInput!, $id: ID) {
      saveCommTemplate(input: $input, id: $id) { ${TEMPLATE_FIELDS} }
    }`,
    variables: { input, id: id ?? null },
  });
  return data.saveCommTemplate;
}

export async function duplicateCommTemplate(id: string): Promise<CommTemplate> {
  const data = await gqlRequest<{ duplicateCommTemplate: CommTemplate }>({
    query: `mutation ($id: ID!) { duplicateCommTemplate(id: $id) { ${TEMPLATE_FIELDS} } }`,
    variables: { id },
  });
  return data.duplicateCommTemplate;
}

export async function deleteCommTemplate(id: string): Promise<boolean> {
  const data = await gqlRequest<{ deleteCommTemplate: boolean }>({
    query: `mutation ($id: ID!) { deleteCommTemplate(id: $id) }`,
    variables: { id },
  });
  return data.deleteCommTemplate;
}

export async function previewCommTemplate(input: {
  templateId?: string | null;
  subject?: string | null;
  bodySms?: string | null;
  bodyEmail?: string | null;
  bodyWhatsApp?: string | null;
  sampleName?: string | null;
}): Promise<CommTemplatePreview> {
  const data = await gqlRequest<{ previewCommTemplate: CommTemplatePreview }>({
    query: `mutation ($input: PreviewCommunicationTemplateInput!) {
      previewCommTemplate(input: $input) {
        subject smsBody smsSegments emailBody whatsAppBody variables
      }
    }`,
    variables: { input },
  });
  return data.previewCommTemplate;
}

export async function fetchCommMessages(
  filter: CommMessageFilter = {},
): Promise<CommMessagePage> {
  const data = await gqlRequest<{ commMessages: CommMessagePage }>({
    query: `query ($filter: CommunicationMessageFilterInput) {
      commMessages(filter: $filter) {
        total hasMore
        rows { ${MESSAGE_FIELDS} }
      }
    }`,
    variables: { filter },
  });
  return data.commMessages;
}

export async function fetchCommDeliveryReport(
  days = 30,
): Promise<CommDeliveryReport> {
  const data = await gqlRequest<{ commDeliveryReport: CommDeliveryReport }>({
    query: `query ($days: Int) {
      commDeliveryReport(days: $days) {
        windowDays total sent delivered undelivered failed skipped queued cancelled deliveryRate
        byChannel { channel total sent delivered undelivered failed skipped queued }
      }
    }`,
    variables: { days },
  });
  return data.commDeliveryReport;
}

export async function fetchCommAuditLogs(
  limit = 50,
): Promise<CommAuditEntry[]> {
  const data = await gqlRequest<{ commAuditLogs: CommAuditEntry[] }>({
    query: `query ($limit: Int) { commAuditLogs(limit: $limit) { ${AUDIT_FIELDS} } }`,
    variables: { limit },
  });
  return data.commAuditLogs ?? [];
}

export async function retryCommMessages(ids: string[]): Promise<number> {
  const data = await gqlRequest<{ retryCommMessages: number }>({
    query: `mutation ($ids: [ID!]!) { retryCommMessages(ids: $ids) }`,
    variables: { ids },
  });
  return data.retryCommMessages;
}

export async function cancelCommMessages(ids: string[]): Promise<number> {
  const data = await gqlRequest<{ cancelCommMessages: number }>({
    query: `mutation ($ids: [ID!]!) { cancelCommMessages(ids: $ids) }`,
    variables: { ids },
  });
  return data.cancelCommMessages;
}

export async function fetchCommSettings(): Promise<CommSettings> {
  const data = await gqlRequest<{ communicationSettings: CommSettings }>({
    query: `query { communicationSettings { ${SETTINGS_FIELDS} } }`,
  });
  return data.communicationSettings;
}

export async function updateCommSettings(
  input: Partial<CommSettings>,
): Promise<CommSettings> {
  const data = await gqlRequest<{ updateCommunicationSettings: CommSettings }>({
    query: `mutation ($input: UpdateCommunicationSettingsInput!) {
      updateCommunicationSettings(input: $input) { ${SETTINGS_FIELDS} }
    }`,
    variables: { input },
  });
  return data.updateCommunicationSettings;
}

export async function fetchCommAudienceOptions(): Promise<CommAudienceOptions> {
  const data = await gqlRequest<{ communicationAudienceOptions: CommAudienceOptions }>(
    {
      query: `query {
        communicationAudienceOptions {
          grades { id name }
          streams { id name gradeName }
        }
      }`,
    },
  );
  return data.communicationAudienceOptions;
}

export async function searchCommStudents(
  term: string,
  limit = 20,
): Promise<CommStudentOption[]> {
  const data = await gqlRequest<{ searchCommunicationStudents: CommStudentOption[] }>(
    {
      query: `query ($term: String, $limit: Int) {
        searchCommunicationStudents(term: $term, limit: $limit) {
          id name admissionNumber
        }
      }`,
      variables: { term, limit },
    },
  );
  return data.searchCommunicationStudents ?? [];
}

export async function seedCommDefaults(): Promise<{
  templates: number;
  rules: number;
  automations: number;
}> {
  const data = await gqlRequest<{
    seedCommunicationDefaults: {
      templates: number;
      rules: number;
      automations: number;
    };
  }>({
    query: `mutation {
      seedCommunicationDefaults { templates rules automations }
    }`,
  });
  return data.seedCommunicationDefaults;
}
