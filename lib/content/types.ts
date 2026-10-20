/**
 * Structured content model for the SQUL blog / SEO topic clusters.
 *
 * Article bodies live as JSON under `lib/content/data/*.json` — one file per
 * article — and are rendered by `app/blog/[slug]/page.tsx`. Keeping content as
 * data (rather than MDX) means there is no extra markdown dependency, and the
 * same objects drive the routes, the index, the sitemap and the JSON-LD schema.
 *
 * Inline formatting inside any string uses a small, safe markdown subset:
 *   **bold**, *italic*, [link text](https://example.com)
 * parsed by `lib/content/rich-text.tsx`. No raw HTML is ever rendered.
 */

export type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | {
      type: 'table'
      caption?: string
      headers: string[]
      rows: string[][]
    }
  | { type: 'callout'; variant?: 'note' | 'tip' | 'warning'; title?: string; text: string }
  | { type: 'quote'; text: string; cite?: string }
  | { type: 'steps'; items: { title: string; text: string }[] }
  /** A photographic / contextual image from /public. */
  | { type: 'image'; src: string; alt: string; caption?: string }
  /** An on-brand, illustrative product-UI figure (not a real screenshot). */
  | {
      type: 'mock'
      variant: 'fees' | 'whatsapp' | 'reports' | 'timetable' | 'attendance'
      caption?: string
    }
  /**
   * A richer, illustrative product-UI scene used by the CBC & academic
   * management cluster. Like `mock`, these are drawn in the DOM — no real
   * learner data and no raster screenshots that go stale.
   */
  | { type: 'figure'; scene: FigureScene; caption?: string }
  /** A grid of links used by a pillar to lay out its spoke cluster. */
  | { type: 'guides'; title?: string; intro?: string; items: GuideLink[] }

export type FigureScene =
  | 'assessment-workflow'
  | 'term-calendar'
  | 'cbc-rubric-grid'
  | 'formative-summative'
  | 'report-card'
  | 'streams-matrix'
  | 'transfer-record'
  | 'kpsea-kjsea'
  | 'knec-portal'
  | 'exam-timetable'
  | 'progress-6-9'
  | 'data-audit'

export type GuideLink = {
  title: string
  href: string
  text?: string
  kicker?: string
}

export type Section = {
  /** Anchor id, also used by the auto-generated table of contents. */
  id: string
  heading: string
  level: 2 | 3
  blocks: Block[]
}

export type Faq = {
  question: string
  answer: string
}

export type Link = {
  title: string
  href: string
}

export type Article = {
  /** URL slug without the parent path, e.g. "whatsapp-integration-school-management-system". */
  slug: string
  /** Absolute site path, e.g. "/blog/whatsapp-integration-school-management-system". */
  path: string
  kind: 'pillar' | 'cluster'
  /**
   * Topic cluster this article belongs to, e.g. "School management software"
   * or "Running a school". Drives grouping on the blog index. Defaults when
   * omitted so older articles keep working.
   */
  topic?: string
  status: 'published'
  /** <title> tag content. */
  title: string
  /** On-page H1. */
  h1: string
  /** 140–155 character meta description. */
  description: string
  primaryKeyword: string
  secondaryKeywords: string[]
  intent: string
  funnelStage: 'ToFu' | 'MoFu' | 'BoFu'
  author: string
  /** ISO date, e.g. "2026-09-01". */
  updated: string
  /** Small label rendered above the H1. */
  kicker: string
  /** Hero intro paragraphs (inline formatting supported). */
  intro: string[]
  /** Optional "quick answer" callout used by the pillar and comparison pages. */
  quickAnswer?: string
  sections: Section[]
  faqs: Faq[]
  cta: {
    heading: string
    body: string
    label: string
    /** Defaults to /register when omitted. */
    href?: string
  }
  related: Link[]
  /** Optional social/OG image path under /public. */
  image?: string
}

export type ArticleWithMeta = Article & {
  /** Estimated reading time in whole minutes. */
  readingMinutes: number
  /** Linked cluster siblings (resolved), excluding self. */
  relatedArticles: Article[]
}
