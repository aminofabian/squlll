/**
 * Tenant communications & reminders API. Same fetch pattern as the rest of the
 * school dashboard: same-origin `/api/graphql`, cookies + Bearer fallback.
 *
 * The engine is: calendar events × reminder rules → an outbox the server
 * drains onto SMS / email / in-app, honouring quiet hours, opt-outs and caps.
 */

export type CalendarEventType =
  | "OPENING"
  | "CLOSING"
  | "HALF_TERM"
  | "PARENTS_MEETING"
  | "EXAM"
  | "HOLIDAY"
  | "SPORTS_DAY"
  | "FEE_DUE"
  | "CUSTOM";

export type CalendarEventSource = "MANUAL" | "SYSTEM";
export type CommunicationChannelType = "SMS" | "EMAIL" | "IN_APP";
export type ReminderSource = "CALENDAR" | "FEE_DUE";
export type ScheduledMessageStatus =
  | "PENDING"
  | "SENDING"
  | "SENT"
  | "FAILED"
  | "SKIPPED"
  | "CANCELLED";
export type OptOutChannel = "ALL" | "SMS" | "EMAIL";

export type CommunicationSettings = {
  timezone: string;
  smsEnabled: boolean;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  dailySmsCap: number | null;
  smsSenderName: string | null;
  optOutFooter: string | null;
};

export type UpdateCommunicationSettingsInput = Partial<CommunicationSettings>;

export type CalendarEvent = {
  id: string;
  type: CalendarEventType;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  allDay: boolean;
  location: string | null;
  source: CalendarEventSource;
  termId: string | null;
};

export type ReminderOffset = { daysBefore: number; atTime: string };

export type ReminderAudience = {
  type: string;
  gradeId?: string;
  streamId?: string;
  studentIds?: string[];
};

export type ReminderRule = {
  id: string;
  name: string;
  source: ReminderSource;
  eventType: CalendarEventType | null;
  channels: CommunicationChannelType[];
  audience: ReminderAudience;
  offsets: ReminderOffset[];
  condition: { minBalance?: number } | null;
  templateId: string | null;
  enabled: boolean;
  lastRunAt: string | null;
};

export type ReminderTemplate = {
  id: string;
  name: string;
  description: string | null;
  eventType: CalendarEventType | null;
  subject: string | null;
  bodySms: string | null;
  bodyEmail: string | null;
  isDefault: boolean;
};

export type CommunicationOptOut = {
  id: string;
  channel: OptOutChannel;
  phone: string | null;
  email: string | null;
  parentId: string | null;
  reason: string | null;
  source: string;
  createdAt: string;
};

export type ScheduledMessage = {
  id: string;
  channel: CommunicationChannelType;
  status: ScheduledMessageStatus;
  recipientKind: string;
  recipientName: string | null;
  recipientPhone: string | null;
  recipientEmail: string | null;
  subject: string | null;
  body: string;
  sendAt: string;
  sentAt: string | null;
  deliveryStatus: "DELIVERED" | "UNDELIVERED" | null;
  deliveredAt: string | null;
  lastError: string | null;
  ruleId: string | null;
};

export type ReminderPreview = {
  smsBody: string;
  smsSegments: number;
  emailSubject: string | null;
  emailBody: string | null;
  recipients: { total: number; withPhone: number; withEmail: number };
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
  return payload.data as T;
}

// ── field projections ────────────────────────────────────────────────

const SETTINGS_FIELDS = `
  timezone smsEnabled emailEnabled inAppEnabled
  quietHoursStart quietHoursEnd dailySmsCap smsSenderName optOutFooter
`;

const CALENDAR_FIELDS = `
  id type title description startDate endDate allDay location source termId
`;

const TEMPLATE_FIELDS = `
  id name description eventType subject bodySms bodyEmail isDefault
`;

const RULE_FIELDS = `
  id name source eventType channels audience offsets condition templateId enabled lastRunAt
`;

const OPTOUT_FIELDS = `
  id channel phone email parentId reason source createdAt
`;

const SCHEDULED_FIELDS = `
  id channel status recipientKind recipientName recipientPhone recipientEmail
  subject body sendAt sentAt deliveryStatus deliveredAt lastError ruleId
`;

// ── settings ─────────────────────────────────────────────────────────

export async function fetchCommunicationSettings(): Promise<CommunicationSettings> {
  const data = await gqlRequest<{ communicationSettings: CommunicationSettings }>(
    { query: `query { communicationSettings { ${SETTINGS_FIELDS} } }` },
  );
  return data.communicationSettings;
}

export async function updateCommunicationSettings(
  input: UpdateCommunicationSettingsInput,
): Promise<CommunicationSettings> {
  const data = await gqlRequest<{
    updateCommunicationSettings: CommunicationSettings;
  }>({
    query: `mutation ($input: UpdateCommunicationSettingsInput!) {
      updateCommunicationSettings(input: $input) { ${SETTINGS_FIELDS} }
    }`,
    variables: { input },
  });
  return data.updateCommunicationSettings;
}

// ── calendar ─────────────────────────────────────────────────────────

export async function fetchCalendarEvents(
  from?: string,
  to?: string,
): Promise<CalendarEvent[]> {
  const data = await gqlRequest<{ schoolCalendarEvents: CalendarEvent[] }>({
    query: `query ($from: Date, $to: Date) {
      schoolCalendarEvents(from: $from, to: $to) { ${CALENDAR_FIELDS} }
    }`,
    variables: { from: from ?? null, to: to ?? null },
  });
  return data.schoolCalendarEvents ?? [];
}

export async function createCalendarEvent(input: {
  type: CalendarEventType;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  allDay?: boolean;
  location?: string;
}): Promise<CalendarEvent> {
  const data = await gqlRequest<{ createCalendarEvent: CalendarEvent }>({
    query: `mutation ($input: CreateCalendarEventInput!) {
      createCalendarEvent(input: $input) { ${CALENDAR_FIELDS} }
    }`,
    variables: { input },
  });
  return data.createCalendarEvent;
}

export async function deleteCalendarEvent(id: string): Promise<boolean> {
  const data = await gqlRequest<{ deleteCalendarEvent: boolean }>({
    query: `mutation ($id: ID!) { deleteCalendarEvent(id: $id) }`,
    variables: { id },
  });
  return data.deleteCalendarEvent;
}

export async function syncSchoolCalendar(): Promise<{ events: number }> {
  const data = await gqlRequest<{ syncSchoolCalendar: { events: number } }>({
    query: `mutation { syncSchoolCalendar { events } }`,
  });
  return data.syncSchoolCalendar;
}

// ── templates ────────────────────────────────────────────────────────

export async function fetchTemplates(): Promise<ReminderTemplate[]> {
  const data = await gqlRequest<{ reminderTemplates: ReminderTemplate[] }>({
    query: `query { reminderTemplates { ${TEMPLATE_FIELDS} } }`,
  });
  return data.reminderTemplates ?? [];
}

export async function createReminderTemplate(input: {
  name: string;
  description?: string;
  eventType?: CalendarEventType;
  subject?: string;
  bodySms?: string;
  bodyEmail?: string;
}): Promise<ReminderTemplate> {
  const data = await gqlRequest<{ createReminderTemplate: ReminderTemplate }>({
    query: `mutation ($input: CreateReminderTemplateInput!) {
      createReminderTemplate(input: $input) { ${TEMPLATE_FIELDS} }
    }`,
    variables: { input },
  });
  return data.createReminderTemplate;
}

export async function updateReminderTemplate(
  id: string,
  input: {
    name?: string;
    description?: string;
    eventType?: CalendarEventType;
    subject?: string;
    bodySms?: string;
    bodyEmail?: string;
  },
): Promise<ReminderTemplate> {
  const data = await gqlRequest<{ updateReminderTemplate: ReminderTemplate }>({
    query: `mutation ($id: ID!, $input: UpdateReminderTemplateInput!) {
      updateReminderTemplate(id: $id, input: $input) { ${TEMPLATE_FIELDS} }
    }`,
    variables: { id, input },
  });
  return data.updateReminderTemplate;
}

export async function deleteReminderTemplate(id: string): Promise<boolean> {
  const data = await gqlRequest<{ deleteReminderTemplate: boolean }>({
    query: `mutation ($id: ID!) { deleteReminderTemplate(id: $id) }`,
    variables: { id },
  });
  return data.deleteReminderTemplate;
}

// ── rules ────────────────────────────────────────────────────────────

export async function fetchRules(): Promise<ReminderRule[]> {
  const data = await gqlRequest<{ reminderRules: ReminderRule[] }>({
    query: `query { reminderRules { ${RULE_FIELDS} } }`,
  });
  return data.reminderRules ?? [];
}

export type ReminderRuleInput = {
  name: string;
  source: ReminderSource;
  eventType?: CalendarEventType;
  channels: CommunicationChannelType[];
  audience: ReminderAudience;
  offsets: ReminderOffset[];
  templateId?: string;
  condition?: { minBalance?: number };
  enabled?: boolean;
};

export async function createReminderRule(
  input: ReminderRuleInput,
): Promise<ReminderRule> {
  const data = await gqlRequest<{ createReminderRule: ReminderRule }>({
    query: `mutation ($input: CreateReminderRuleInput!) {
      createReminderRule(input: $input) { ${RULE_FIELDS} }
    }`,
    variables: { input },
  });
  return data.createReminderRule;
}

export async function updateReminderRule(
  id: string,
  input: Partial<ReminderRuleInput>,
): Promise<ReminderRule> {
  const data = await gqlRequest<{ updateReminderRule: ReminderRule }>({
    query: `mutation ($id: ID!, $input: UpdateReminderRuleInput!) {
      updateReminderRule(id: $id, input: $input) { ${RULE_FIELDS} }
    }`,
    variables: { id, input },
  });
  return data.updateReminderRule;
}

export async function setReminderRuleEnabled(
  id: string,
  enabled: boolean,
): Promise<ReminderRule> {
  const data = await gqlRequest<{ setReminderRuleEnabled: ReminderRule }>({
    query: `mutation ($id: ID!, $enabled: Boolean!) {
      setReminderRuleEnabled(id: $id, enabled: $enabled) { ${RULE_FIELDS} }
    }`,
    variables: { id, enabled },
  });
  return data.setReminderRuleEnabled;
}

export async function deleteReminderRule(id: string): Promise<boolean> {
  const data = await gqlRequest<{ deleteReminderRule: boolean }>({
    query: `mutation ($id: ID!) { deleteReminderRule(id: $id) }`,
    variables: { id },
  });
  return data.deleteReminderRule;
}

export async function bulkSetReminderRulesEnabled(
  ids: string[],
  enabled: boolean,
): Promise<number> {
  const data = await gqlRequest<{ bulkSetReminderRulesEnabled: number }>({
    query: `mutation ($ids: [ID!]!, $enabled: Boolean!) {
      bulkSetReminderRulesEnabled(ids: $ids, enabled: $enabled)
    }`,
    variables: { ids, enabled },
  });
  return data.bulkSetReminderRulesEnabled;
}

export async function bulkDeleteReminderRules(ids: string[]): Promise<number> {
  const data = await gqlRequest<{ bulkDeleteReminderRules: number }>({
    query: `mutation ($ids: [ID!]!) { bulkDeleteReminderRules(ids: $ids) }`,
    variables: { ids },
  });
  return data.bulkDeleteReminderRules;
}

export async function bulkDeleteReminderTemplates(ids: string[]): Promise<number> {
  const data = await gqlRequest<{ bulkDeleteReminderTemplates: number }>({
    query: `mutation ($ids: [ID!]!) { bulkDeleteReminderTemplates(ids: $ids) }`,
    variables: { ids },
  });
  return data.bulkDeleteReminderTemplates;
}

export async function copyReminderRulesToAudience(
  ids: string[],
  audience: ReminderAudience,
): Promise<number> {
  const data = await gqlRequest<{ copyReminderRulesToAudience: number }>({
    query: `mutation ($ids: [ID!]!, $audience: ReminderAudienceInput!) {
      copyReminderRulesToAudience(ids: $ids, audience: $audience)
    }`,
    variables: { ids, audience },
  });
  return data.copyReminderRulesToAudience;
}

// ── opt-outs ─────────────────────────────────────────────────────────

export async function fetchOptOuts(): Promise<CommunicationOptOut[]> {
  const data = await gqlRequest<{ communicationOptOuts: CommunicationOptOut[] }>(
    { query: `query { communicationOptOuts { ${OPTOUT_FIELDS} } }` },
  );
  return data.communicationOptOuts ?? [];
}

export async function addOptOut(input: {
  channel?: OptOutChannel;
  phone?: string;
  email?: string;
  reason?: string;
}): Promise<CommunicationOptOut> {
  const data = await gqlRequest<{ addCommunicationOptOut: CommunicationOptOut }>(
    {
      query: `mutation ($input: CreateOptOutInput!) {
        addCommunicationOptOut(input: $input) { ${OPTOUT_FIELDS} }
      }`,
      variables: { input },
    },
  );
  return data.addCommunicationOptOut;
}

export async function removeOptOut(id: string): Promise<boolean> {
  const data = await gqlRequest<{ removeCommunicationOptOut: boolean }>({
    query: `mutation ($id: ID!) { removeCommunicationOptOut(id: $id) }`,
    variables: { id },
  });
  return data.removeCommunicationOptOut;
}

// ── delivery log ─────────────────────────────────────────────────────

export async function fetchScheduledMessages(
  status?: ScheduledMessageStatus,
  limit = 50,
): Promise<ScheduledMessage[]> {
  const data = await gqlRequest<{ scheduledMessages: ScheduledMessage[] }>({
    query: `query ($status: ScheduledMessageStatus, $limit: Int) {
      scheduledMessages(status: $status, limit: $limit) { ${SCHEDULED_FIELDS} }
    }`,
    variables: { status: status ?? null, limit },
  });
  return data.scheduledMessages ?? [];
}

export async function fetchUpcomingScheduledMessages(
  limit = 6,
): Promise<ScheduledMessage[]> {
  const data = await gqlRequest<{ upcomingScheduledMessages: ScheduledMessage[] }>({
    query: `query ($limit: Int) {
      upcomingScheduledMessages(limit: $limit) { ${SCHEDULED_FIELDS} }
    }`,
    variables: { limit },
  });
  return data.upcomingScheduledMessages ?? [];
}

export async function bulkCancelScheduledMessages(
  ids: string[],
): Promise<number> {
  const data = await gqlRequest<{ bulkCancelScheduledMessages: number }>({
    query: `mutation ($ids: [ID!]!) { bulkCancelScheduledMessages(ids: $ids) }`,
    variables: { ids },
  });
  return data.bulkCancelScheduledMessages;
}

export async function bulkRetryScheduledMessages(
  ids: string[],
): Promise<number> {
  const data = await gqlRequest<{ bulkRetryScheduledMessages: number }>({
    query: `mutation ($ids: [ID!]!) { bulkRetryScheduledMessages(ids: $ids) }`,
    variables: { ids },
  });
  return data.bulkRetryScheduledMessages;
}

// ── preview + test ───────────────────────────────────────────────────

export async function previewReminder(input: {
  channels: CommunicationChannelType[];
  templateId?: string;
  bodySms?: string;
  bodyEmail?: string;
  subject?: string;
}): Promise<ReminderPreview> {
  const data = await gqlRequest<{ previewReminder: ReminderPreview }>({
    query: `query ($input: PreviewReminderInput!) {
      previewReminder(input: $input) {
        smsBody smsSegments emailSubject emailBody
        recipients { total withPhone withEmail }
      }
    }`,
    variables: { input },
  });
  return data.previewReminder;
}

export async function sendTestReminder(input: {
  channel: CommunicationChannelType;
  to: string;
  body: string;
  subject?: string;
}): Promise<{ ok: boolean; message: string }> {
  const data = await gqlRequest<{
    sendTestReminder: { ok: boolean; message: string };
  }>({
    query: `mutation ($input: SendTestReminderInput!) {
      sendTestReminder(input: $input) { ok message }
    }`,
    variables: { input },
  });
  return data.sendTestReminder;
}

// ── audience pickers + seeding ───────────────────────────────────────

export type GradeOption = { id: string; name: string };
export type StreamOption = {
  id: string;
  name: string;
  gradeName: string | null;
};
export type CommunicationAudienceOptions = {
  grades: GradeOption[];
  streams: StreamOption[];
};
export type StudentOption = {
  id: string;
  name: string;
  admissionNumber: string | null;
};

export async function fetchCommunicationAudienceOptions(): Promise<CommunicationAudienceOptions> {
  const data = await gqlRequest<{
    communicationAudienceOptions: CommunicationAudienceOptions;
  }>({
    query: `query {
      communicationAudienceOptions {
        grades { id name }
        streams { id name gradeName }
      }
    }`,
  });
  return data.communicationAudienceOptions;
}

export async function searchCommunicationStudents(
  term: string,
  limit = 20,
): Promise<StudentOption[]> {
  const data = await gqlRequest<{ searchCommunicationStudents: StudentOption[] }>({
    query: `query ($term: String, $limit: Int) {
      searchCommunicationStudents(term: $term, limit: $limit) {
        id name admissionNumber
      }
    }`,
    variables: { term: term || null, limit },
  });
  return data.searchCommunicationStudents ?? [];
}

export async function seedCommunicationDefaults(): Promise<{
  templates: number;
  rules: number;
}> {
  const data = await gqlRequest<{
    seedCommunicationDefaults: { templates: number; rules: number };
  }>({
    query: `mutation { seedCommunicationDefaults { templates rules } }`,
  });
  return data.seedCommunicationDefaults;
}

// ── campaigns (one-off broadcasts) ───────────────────────────────────

export type CampaignStatus = "SCHEDULED" | "CANCELLED";

export type CommunicationCampaign = {
  id: string;
  name: string;
  channels: CommunicationChannelType[];
  audience: ReminderAudience;
  templateId: string | null;
  subject: string | null;
  bodySms: string | null;
  bodyEmail: string | null;
  scheduledAt: string | null;
  status: CampaignStatus;
  recipientCount: number;
  createdAt: string;
};

export type CreateCampaignInput = {
  name: string;
  channels: CommunicationChannelType[];
  audience: ReminderAudience;
  templateId?: string;
  subject?: string;
  bodySms?: string;
  bodyEmail?: string;
  scheduledAt?: string;
};

const CAMPAIGN_FIELDS = `
  id name channels audience templateId subject bodySms bodyEmail
  scheduledAt status recipientCount createdAt
`;

export async function fetchCommunicationCampaigns(): Promise<
  CommunicationCampaign[]
> {
  const data = await gqlRequest<{
    communicationCampaigns: CommunicationCampaign[];
  }>({ query: `query { communicationCampaigns { ${CAMPAIGN_FIELDS} } }` });
  return data.communicationCampaigns ?? [];
}

export async function createCommunicationCampaign(
  input: CreateCampaignInput,
): Promise<CommunicationCampaign> {
  const data = await gqlRequest<{
    createCommunicationCampaign: CommunicationCampaign;
  }>({
    query: `mutation ($input: CreateCampaignInput!) {
      createCommunicationCampaign(input: $input) { ${CAMPAIGN_FIELDS} }
    }`,
    variables: { input },
  });
  return data.createCommunicationCampaign;
}

export async function cancelCommunicationCampaign(
  id: string,
): Promise<CommunicationCampaign> {
  const data = await gqlRequest<{
    cancelCommunicationCampaign: CommunicationCampaign;
  }>({
    query: `mutation ($id: ID!) {
      cancelCommunicationCampaign(id: $id) { ${CAMPAIGN_FIELDS} }
    }`,
    variables: { id },
  });
  return data.cancelCommunicationCampaign;
}

export async function deleteCommunicationCampaign(id: string): Promise<boolean> {
  const data = await gqlRequest<{ deleteCommunicationCampaign: boolean }>({
    query: `mutation ($id: ID!) { deleteCommunicationCampaign(id: $id) }`,
    variables: { id },
  });
  return data.deleteCommunicationCampaign;
}

export type CampaignPreview = {
  recipientCount: number;
  withPhone: number;
  withEmail: number;
  smsBody: string;
  smsSegments: number;
  emailSubject: string | null;
  emailBody: string | null;
  samples: Array<{
    name: string | null;
    studentName: string | null;
    phone: string | null;
    email: string | null;
  }>;
};

export async function previewCampaign(input: {
  channels: CommunicationChannelType[];
  audience: ReminderAudience;
  templateId?: string;
  subject?: string;
  bodySms?: string;
  bodyEmail?: string;
}): Promise<CampaignPreview> {
  const data = await gqlRequest<{ previewCampaign: CampaignPreview }>({
    query: `query ($input: PreviewCampaignInput!) {
      previewCampaign(input: $input) {
        recipientCount withPhone withEmail smsBody smsSegments emailSubject emailBody
        samples { name studentName phone email }
      }
    }`,
    variables: { input },
  });
  return data.previewCampaign;
}
