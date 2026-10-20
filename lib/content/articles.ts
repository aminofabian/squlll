import type { Article, ArticleWithMeta, Link as ContentLink } from './types'

import pillar from './data/pillar-top-10-best-school-management-software-kenya.json'
import mpesa from './data/mpesa-fee-reconciliation.json'
import whatsapp from './data/whatsapp-integration.json'
import howToChoose from './data/how-to-choose.json'
import pricing from './data/pricing-in-kenya.json'
import cbc from './data/cbc-report-cards.json'
import freeVsPaid from './data/free-vs-paid.json'
import feeReminders from './data/fee-reminders.json'
import primarySecondary from './data/primary-vs-secondary.json'
import multiCampus from './data/multi-campus.json'
import paperVsDigital from './data/paper-vs-digital.json'
import timetabling from './data/timetabling.json'
import attendance from './data/attendance-alerts.json'
import bursar from './data/bursar-guide.json'
import excelMigration from './data/excel-migration.json'
import dataProtection from './data/data-protection.json'
import boarding from './data/boarding-schools.json'
import secondarySchools from './data/secondary-schools.json'
import nairobi from './data/nairobi.json'
import feeArrears from './data/fee-arrears.json'
import squlVsAlternatives from './data/squl-vs-alternatives.json'
import squlVsZeraki from './data/squl-vs-zeraki.json'
import zerakiAlternatives from './data/zeraki-alternatives.json'
import zerakiPricing from './data/zeraki-pricing.json'
import zerakiReview from './data/zeraki-review.json'
import howToManageSchool from './data/how-to-manage-a-school-in-kenya.json'
import schoolFinance from './data/school-finance-and-budgeting-kenya.json'
import schoolFeeStructure from './data/school-fee-structure-kenya.json'
import schoolStaff from './data/school-staff-management-kenya.json'
import cbcImplementation from './data/cbc-implementation-school-kenya.json'
import parentEngagement from './data/parent-engagement-school-kenya.json'
import schoolCompliance from './data/school-compliance-registration-kenya.json'
import schoolLeadership from './data/school-leadership-and-governance-kenya.json'
import schoolAdmissions from './data/school-admissions-learner-records-kenya.json'
import studentDiscipline from './data/student-discipline-and-welfare-kenya.json'
import boardingManagement from './data/boarding-school-management-kenya.json'
import healthSafety from './data/school-health-safety-security-kenya.json'
import facilitiesProcurement from './data/school-facilities-procurement-kenya.json'
import termPlanning from './data/school-calendar-term-planning-kenya.json'
import digitalTransformation from './data/digital-transformation-schools-kenya.json'
import featuresAnchor from './data/school-management-system-features.json'
import featureStudents from './data/student-information-system-kenya.json'
import featureTeachers from './data/teacher-management-software-kenya.json'
import featureClasses from './data/class-management-software-kenya.json'
import featureAttendance from './data/real-time-attendance-tracking-software-kenya.json'
import featureFees from './data/school-fees-management-software-kenya.json'
import featureReports from './data/school-reporting-analytics-software-kenya.json'
import featureAdministration from './data/school-administration-software-kenya.json'
import featureSchoolBus from './data/school-bus-tracking-software-kenya.json'
import featureStaff from './data/school-hr-payroll-software-kenya.json'
import cbcAssessmentAnchor from './data/cbc-assessment-management-complete-guide.json'
import cbcCaptureRubrics from './data/capture-cbc-rubrics-strands-without-excel.json'
import cbcFormativeSummative from './data/formative-vs-summative-assessment-kenya.json'
import cbcTermReportCards from './data/generate-cbc-term-report-cards-automatically.json'
import cbcMultipleStreams from './data/continuous-assessment-multiple-streams.json'
import cbcLearnerTransfers from './data/learner-transfers-mid-term-cbc.json'
import cbcHeadteacherReports from './data/headteacher-guide-kpsea-kjsea-reports.json'
import cbcKnecPortal from './data/knec-cba-portal-reports-guide.json'
import cbcExamTimetables from './data/exam-timetables-sync-cbc-schedules.json'
import cbcProgressSixToNine from './data/tracking-learner-progress-grade-6-to-9.json'
import cbcDataEntryMistakes from './data/common-cbc-data-entry-mistakes.json'

/**
 * JSON imports are widened by TypeScript (e.g. `level: number`, `status: string`),
 * so we assert to the authored `Article` shape once here.
 */
const ALL_ARTICLES: Article[] = [
  pillar,
  mpesa,
  whatsapp,
  howToChoose,
  pricing,
  cbc,
  freeVsPaid,
  feeReminders,
  primarySecondary,
  multiCampus,
  paperVsDigital,
  timetabling,
  attendance,
  bursar,
  excelMigration,
  dataProtection,
  boarding,
  secondarySchools,
  nairobi,
  feeArrears,
  squlVsAlternatives,
  squlVsZeraki,
  zerakiAlternatives,
  zerakiPricing,
  zerakiReview,
  howToManageSchool,
  schoolFinance,
  schoolFeeStructure,
  schoolStaff,
  cbcImplementation,
  parentEngagement,
  schoolCompliance,
  schoolLeadership,
  schoolAdmissions,
  studentDiscipline,
  boardingManagement,
  healthSafety,
  facilitiesProcurement,
  termPlanning,
  digitalTransformation,
  featuresAnchor,
  featureStudents,
  featureTeachers,
  featureClasses,
  featureAttendance,
  featureFees,
  featureReports,
  featureAdministration,
  featureSchoolBus,
  featureStaff,
  cbcAssessmentAnchor,
  cbcCaptureRubrics,
  cbcFormativeSummative,
  cbcTermReportCards,
  cbcMultipleStreams,
  cbcLearnerTransfers,
  cbcHeadteacherReports,
  cbcKnecPortal,
  cbcExamTimetables,
  cbcProgressSixToNine,
  cbcDataEntryMistakes,
] as unknown as Article[]

function countWords(value: unknown): number {
  if (typeof value === 'string') {
    return value.trim().split(/\s+/).filter(Boolean).length
  }
  if (Array.isArray(value)) {
    return value.reduce<number>((total, item) => total + countWords(item), 0)
  }
  if (value && typeof value === 'object') {
    return Object.values(value).reduce<number>((total, item) => total + countWords(item), 0)
  }
  return 0
}

function readingMinutes(article: Article): number {
  const { intro, sections, faqs } = article
  const words = countWords({ intro, sections, faqs })
  return Math.max(3, Math.round(words / 200))
}

function withMeta(article: Article): ArticleWithMeta {
  const relatedArticles = article.related
    .map((link) => ALL_ARTICLES.find((candidate) => candidate.path === link.href))
    .filter((candidate): candidate is Article => Boolean(candidate))

  return { ...article, readingMinutes: readingMinutes(article), relatedArticles }
}

export function getAllArticles(): ArticleWithMeta[] {
  return ALL_ARTICLES.map(withMeta)
}

export function getPillar(): ArticleWithMeta {
  const found = ALL_ARTICLES.find((article) => article.kind === 'pillar')
  if (!found) throw new Error('Pillar article not found')
  return withMeta(found)
}

export function getPillars(): ArticleWithMeta[] {
  return ALL_ARTICLES.filter((article) => article.kind === 'pillar').map(withMeta)
}

const DEFAULT_TOPIC = 'School management software'

function topicOf(article: Article): string {
  return article.topic?.trim() || DEFAULT_TOPIC
}

export type TopicGroup = {
  topic: string
  pillar?: ArticleWithMeta
  clusters: ArticleWithMeta[]
}

/**
 * Groups every article into its topic cluster for the blog index, preserving
 * the order in which topics first appear in the content set.
 */
export function getTopicGroups(): TopicGroup[] {
  const order: string[] = []
  const map = new Map<string, { pillar?: Article; clusters: Article[] }>()

  for (const article of ALL_ARTICLES) {
    const topic = topicOf(article)
    if (!map.has(topic)) {
      map.set(topic, { clusters: [] })
      order.push(topic)
    }
    const group = map.get(topic)!
    if (article.kind === 'pillar') group.pillar = article
    else group.clusters.push(article)
  }

  return order.map((topic) => {
    const group = map.get(topic)!
    return {
      topic,
      pillar: group.pillar ? withMeta(group.pillar) : undefined,
      clusters: group.clusters.map(withMeta),
    }
  })
}

export function getClusters(): ArticleWithMeta[] {
  return ALL_ARTICLES.filter((article) => article.kind === 'cluster').map(withMeta)
}

export function getArticle(slug: string): ArticleWithMeta | undefined {
  const found = ALL_ARTICLES.find((article) => article.slug === slug)
  return found ? withMeta(found) : undefined
}

export function getArticleByPath(path: string): ArticleWithMeta | undefined {
  const found = ALL_ARTICLES.find((article) => article.path === path)
  return found ? withMeta(found) : undefined
}

export function getArticleSlugs(): string[] {
  return ALL_ARTICLES.map((article) => article.slug)
}

export function resolveRelated(links: ContentLink[]): Article[] {
  return links
    .map((link) => ALL_ARTICLES.find((candidate) => candidate.path === link.href))
    .filter((candidate): candidate is Article => Boolean(candidate))
}
