import { headers } from 'next/headers'
import { normalizeHostname } from '@/lib/hostname'
import { resolveHostViaBackend } from '@/lib/host-resolution'
import {
  fetchPublicHomepageConfigMeta,
  fetchPublicSchoolLevelsServer,
} from '@/app/school/[subdomain]/(pages)/components/homepage/homepage-api.server'
import {
  getSection,
  type HomepageConfig,
  type HomepageSeo,
  type PublicSchoolLevel,
} from '@/lib/types/homepage-config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.squl.co.ke'

/** `mirema-school` → `Mirema School`. Fallback when the tenant record is unreachable. */
export function schoolNameFromSubdomain(subdomain: string): string {
  return subdomain
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

/** Absolute origin for a host — `http://` on localhost, `https://` everywhere else. */
export function originForHost(host: string | null | undefined): string {
  if (!host) return SITE_URL
  const isLocal = host === 'localhost' || host.endsWith('.localhost')
  return `${isLocal ? 'http' : 'https'}://${host}`
}

/** Canonical origin of a school's own platform subdomain. */
function platformSchoolOrigin(subdomain: string, host: string | null): string {
  const isLocal =
    !host || host === 'localhost' || host.endsWith('.localhost')
  return isLocal
    ? `http://${subdomain}.localhost`
    : `https://${subdomain}.squl.co.ke`
}

export interface TenantIdentity {
  subdomain: string
  /** Best-known display name — the tenant record's name when resolvable. */
  name: string
  /** Host the request arrived on (a platform subdomain or the school's own domain). */
  host: string | null
  /** Absolute origin for canonical URLs and structured data. */
  origin: string
}

/**
 * Resolve the tenant name and canonical origin for the current request. The
 * backend `resolveHost` lookup is cached in-process, so this is cheap enough to
 * call from both `generateMetadata` and the page body.
 */
export async function getTenantIdentity(subdomain: string): Promise<TenantIdentity> {
  const headerList = await headers()
  const host = normalizeHostname(
    headerList.get('x-forwarded-host') ?? headerList.get('host'),
  )
  const resolution = host ? await resolveHostViaBackend(host) : null
  const name = str(resolution?.tenantName) ?? schoolNameFromSubdomain(subdomain)

  // Canonicalize to the host the tenant is actually served on. When the route
  // is reached on the platform apex (e.g. `squl.co.ke/school/x` directly), host
  // resolution yields no tenant — point canonical at the school's subdomain
  // rather than the apex so the right host gets indexed.
  const origin =
    resolution?.tenantId && host
      ? originForHost(host)
      : platformSchoolOrigin(subdomain, host)

  return { subdomain, name, host, origin }
}

/**
 * Display name precedence: the SEO profile's `schoolName` (set by the school in
 * Website Studio) → the tenant record's name → the subdomain-derived fallback.
 */
export function resolveSchoolName(
  config: HomepageConfig,
  fallback: string,
): string {
  return str(config.seo?.schoolName) ?? fallback
}

export interface SchoolSeoFields {
  description: string
  slogan?: string
  logoUrl?: string
  imageUrl?: string
  email?: string
  phone?: string
  streetAddress?: string
  addressLocality?: string
  addressRegion?: string
  postalCode?: string
  addressCountry?: string
  latitude?: number
  longitude?: number
  motto?: string
  schoolType?: string
  foundedYear?: number
}

/**
 * Pull the SEO-relevant data out of a published homepage config: the hero
 * supplies the headline copy, the footer the contact fallbacks, and the
 * optional `seo` profile the address / geo coordinates for local search.
 */
export function describeHomepage(
  config: HomepageConfig,
  schoolName: string,
): SchoolSeoFields {
  const hero = getSection<{
    eyebrow?: string
    headline?: string
    subcopy?: string
    backgroundImage?: string
  }>(config, 'hero')?.slots
  const footer = getSection<{ blurb?: string; email?: string; phone?: string }>(
    config,
    'footer',
  )?.slots
  const seo: HomepageSeo = config.seo ?? {}

  const description =
    str(hero?.subcopy) ??
    str(footer?.blurb) ??
    str(seo.motto) ??
    `Official website and parent portal for ${schoolName}. Admissions, fees, CBC academics, transport and daily school updates — all on SQUL.`

  const logoUrl = str(config.logoUrl)

  return {
    description,
    slogan: str(hero?.eyebrow),
    logoUrl,
    imageUrl: str(hero?.backgroundImage) ?? logoUrl,
    email: str(seo.email) ?? str(footer?.email),
    phone: str(seo.phone) ?? str(footer?.phone),
    streetAddress: str(seo.streetAddress),
    addressLocality: str(seo.addressLocality),
    addressRegion: str(seo.addressRegion),
    postalCode: str(seo.postalCode),
    addressCountry: str(seo.addressCountry),
    latitude: seo.latitude,
    longitude: seo.longitude,
    motto: str(seo.motto),
    schoolType: str(seo.schoolType),
    foundedYear: seo.foundedYear,
  }
}

export interface TenantSeo extends SchoolSeoFields {
  identity: TenantIdentity
  /** Final display name (SEO override → tenant record → subdomain). */
  name: string
  /** Whether the school has published a homepage config (drives indexing). */
  published: boolean
  config: HomepageConfig
  levels: PublicSchoolLevel[]
}

/** Everything the tenant site needs for `<head>` metadata and structured data. */
export async function getTenantSeo(subdomain: string): Promise<TenantSeo> {
  const identity = await getTenantIdentity(subdomain)
  const [meta, levels] = await Promise.all([
    fetchPublicHomepageConfigMeta(subdomain, identity.name),
    fetchPublicSchoolLevelsServer(subdomain),
  ])
  const { config, published } = meta
  const name = resolveSchoolName(config, identity.name)
  return {
    identity,
    name,
    published,
    config,
    levels,
    ...describeHomepage(config, name),
  }
}

export interface SchoolSchemaInput extends SchoolSeoFields {
  name: string
  origin: string
}

function buildPostalAddress(
  input: SchoolSeoFields,
): Record<string, unknown> | undefined {
  const { streetAddress, addressLocality, addressRegion, postalCode } = input
  const addressCountry = input.addressCountry ?? 'KE'
  if (
    !streetAddress &&
    !addressLocality &&
    !addressRegion &&
    !postalCode &&
    !input.addressCountry
  ) {
    return undefined
  }
  const address: Record<string, unknown> = {
    '@type': 'PostalAddress',
    addressCountry,
  }
  if (streetAddress) address.streetAddress = streetAddress
  if (addressLocality) address.addressLocality = addressLocality
  if (addressRegion) address.addressRegion = addressRegion
  if (postalCode) address.postalCode = postalCode
  return address
}

function buildGeoCoordinates(
  input: SchoolSeoFields,
): Record<string, unknown> | undefined {
  if (typeof input.latitude !== 'number' || typeof input.longitude !== 'number') {
    return undefined
  }
  return {
    '@type': 'GeoCoordinates',
    latitude: input.latitude,
    longitude: input.longitude,
  }
}

/**
 * schema.org `School` node for a tenant homepage. Emitting this lets search
 * engines treat each school as a distinct educational organisation (brand
 * panel, knowledge graph) and, when the school fills in its profile, surfaces
 * address and geo coordinates for local search results.
 */
export function buildSchoolJsonLd(
  input: SchoolSchemaInput,
): Record<string, unknown> {
  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'School',
    name: input.name,
    url: `${input.origin}/`,
    description: input.description,
    areaServed: { '@type': 'Country', name: 'Kenya' },
  }
  if (input.logoUrl) node.logo = input.logoUrl
  if (input.imageUrl) node.image = input.imageUrl
  if (input.email) node.email = input.email
  if (input.phone) node.telephone = input.phone
  if (input.schoolType) node.keywords = input.schoolType
  const slogan = input.motto ?? input.slogan
  if (slogan) node.slogan = slogan
  if (input.foundedYear) node.foundingDate = String(input.foundedYear)

  const address = buildPostalAddress(input)
  if (address) node.address = address
  const geo = buildGeoCoordinates(input)
  if (geo) node.geo = geo

  return node
}
