export type PlatformSchool = {
  id: string
  name: string
  subdomain: string
  description: string | null
  logoUrl: string | null
  tagline: string | null
  /** Whether the school has published its homepage (its site is live). */
  published: boolean
  /** Town / city from the school's SEO profile. */
  addressLocality: string | null
  /** County from the school's SEO profile. */
  addressRegion: string | null
}
