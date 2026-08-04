/** NestJS GraphQL URL for server-side Next.js API routes. */
export function resolveGraphqlEndpoint(): string {
  const raw =
    process.env.GRAPHQL_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:3001/graphql';

  return normalizeGraphqlUrl(raw);
}

/**
 * Recovered local Nest for dual-flow timetable ops that are not on production yet.
 * Falls back to the primary endpoint when unset.
 */
export function resolveLocalGraphqlEndpoint(): string {
  const raw =
    process.env.LOCAL_GRAPHQL_API_URL ||
    process.env.DUAL_FLOW_GRAPHQL_API_URL ||
    '';
  if (!raw.trim()) return resolveGraphqlEndpoint();
  return normalizeGraphqlUrl(raw);
}

function normalizeGraphqlUrl(raw: string): string {
  let url = raw.trim().replace(/\/+$/, '');
  if (!url.endsWith('/graphql')) {
    url = `${url}/graphql`;
  }
  return url;
}

/**
 * Field names that must hit the recovered local Nest (dual-flow / restored timetable).
 * Everything else (academicYears, stats, rich Teacher, school config, …) stays on
 * production / GRAPHQL_API_URL.
 */
const LOCAL_DUAL_FLOW_FIELD_RE =
  /\b(createTeacherLessonAllocation|updateTeacherLessonAllocation|deleteTeacherLessonAllocation|teacherLessonAllocations|upsertTeacherWorkloadRules|deleteTeacherWorkloadRules|teacherWorkloadRules|teacherWorkloadRulesForTeacher|timetableGenerationPreflight|generateTimetable|bulkCreateTimetableEntries|seedTimetableReferenceData|createWeekTemplate|getWeekTemplates|getWeekTemplate|createTimetableBreak|getSchoolTimetable|getTimetableEntries|createTimetableEntry|deleteTimetableEntry)\b/;

export function shouldUseLocalDualFlowGraphql(query?: string): boolean {
  if (!query) return false;
  const localUrl = process.env.LOCAL_GRAPHQL_API_URL || process.env.DUAL_FLOW_GRAPHQL_API_URL;
  if (!localUrl?.trim()) return false;
  return LOCAL_DUAL_FLOW_FIELD_RE.test(query);
}

export function resolveUpstreamGraphqlEndpoint(query?: string): string {
  if (shouldUseLocalDualFlowGraphql(query)) {
    return resolveLocalGraphqlEndpoint();
  }
  return resolveGraphqlEndpoint();
}
