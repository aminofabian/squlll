/**
 * Homepage config types, defaults, template registry, and validation —
 * re-exported from the canonical @squl/shared package so the backend and
 * frontend can never drift apart.
 */
export {
  HOMEPAGE_TEMPLATE_IDS,
  HOMEPAGE_TEMPLATES,
  HOMEPAGE_TEMPLATE_THEMES,
  applyTemplateKeepContent,
  createDefaultHomepageConfig,
  getSection,
  parseHomepageConfig,
} from '@squl/shared'

import type {
  HomepageCta,
  HomepageConfig,
  HomepageGalleryImage,
  HomepageNavLink,
  HomepageOfferingItem,
  HomepageSection,
  HomepageSectionType,
  HomepageStatItem,
  HomepageTemplateId,
  HomepageTemplateMeta,
  HomepageTestimonial,
  HomepageTheme,
  PublicSchoolGradeLevel,
  PublicSchoolLevel,
} from '@squl/shared'

export type {
  HomepageCta,
  HomepageConfig,
  HomepageGalleryImage,
  HomepageNavLink,
  HomepageOfferingItem,
  HomepageSection,
  HomepageSectionType,
  HomepageStatItem,
  HomepageTemplateId,
  HomepageTemplateMeta,
  HomepageTestimonial,
  HomepageTheme,
  PublicSchoolGradeLevel,
  PublicSchoolLevel,
}

export type HomepageConfigRecord = {
  draft: HomepageConfig
  published: HomepageConfig | null
  publishedAt?: string | null
  updatedAt?: string | null
}
