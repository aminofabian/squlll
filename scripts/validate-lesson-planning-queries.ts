/**
 * Temporary verification script: validates every GraphQL document issued by
 * lib/lesson-planning/api.ts against the live schema, so fragment composition
 * mistakes fail here instead of in the browser.
 *
 * Run with: bun scripts/validate-lesson-planning-queries.ts
 */
import {
  buildClientSchema,
  getIntrospectionQuery,
  parse,
  validate,
} from 'graphql'
import * as api from '../lib/lesson-planning/api'

const endpoint = 'http://127.0.0.1:3001/graphql'

const introspection = await fetch(endpoint, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ query: getIntrospectionQuery() }),
}).then((response) => response.json())

if (!introspection?.data?.__schema) {
  console.error('Could not introspect schema:', introspection)
  process.exit(1)
}

const schema = buildClientSchema(introspection.data)

const documents: string[] = []
const realFetch = globalThis.fetch
globalThis.fetch = (async (_input: unknown, init?: RequestInit) => {
  const body = JSON.parse(String(init?.body ?? '{}'))
  documents.push(body.query)
  return new Response(JSON.stringify({ data: null }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}) as typeof fetch

const s = 'mirema'
const id = '00000000-0000-4000-8000-000000000000'
const calls: Array<() => Promise<unknown>> = [
  () => api.fetchMyLessonWeek(s, id, '2027-01-04'),
  () => api.fetchMyLessonPlans(s, id),
  () => api.fetchLessonPlan(s, id),
  () => api.fetchLessonPlanForPeriod(s, id, '2027-01-04'),
  () =>
    api.startLessonPlan(s, {
      timetableEntryId: id,
      termId: id,
      date: '2027-01-04',
    }),
  () =>
    api.saveLessonPlan(s, {
      termId: id,
      gradeLevelId: id,
      subjectId: id,
      lessonDate: '2027-01-04',
    }),
  () => api.submitLessonPlan(s, id),
  () => api.deleteLessonPlan(s, id),
  () =>
    api.saveLessonRecord(s, {
      termId: id,
      lessonDate: '2027-01-04',
      status: 'TAUGHT',
    }),
  () => api.fetchMySchemesOfWork(s, id),
  () => api.fetchSchemeOfWork(s, id),
  () =>
    api.saveSchemeOfWork(s, {
      termId: id,
      gradeLevelId: id,
      subjectId: id,
    }),
  () => api.saveSchemeEntry(s, { schemeOfWorkId: id, weekNumber: 1, topic: 'x' }),
  () => api.deleteSchemeEntry(s, id),
  () => api.generatePlansFromScheme(s, { schemeOfWorkId: id }),
  () => api.fetchAcademicSupervision(s, id),
  () => api.fetchLessonPlansForReview(s, id),
  () =>
    api.reviewLessonPlan(s, {
      lessonPlanId: id,
      action: 'APPROVE',
    }),
]

for (const call of calls) {
  try {
    await call()
  } catch {
    // The stub returns no data, so every call rejects — the document is what
    // matters here.
  }
}

globalThis.fetch = realFetch

let failures = 0
for (const document of new Set(documents)) {
  let parsed
  try {
    parsed = parse(document)
  } catch (error) {
    failures += 1
    console.error('Parse error:', (error as Error).message)
    continue
  }
  const errors = validate(schema, parsed)
  if (errors.length > 0) {
    failures += 1
    console.error('Invalid document:', errors.map((error) => error.message))
  }
}

console.log(`${new Set(documents).size} documents checked, ${failures} invalid`)
process.exit(failures === 0 ? 0 : 1)
