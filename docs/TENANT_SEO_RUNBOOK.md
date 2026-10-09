# Runbook: Per-school SEO (tenant ranking)

How each school's public site — `https://<subdomain>.squl.co.ke` or its own custom
domain — is optimised for search, how schools fill in the data that powers it,
and the Search Console steps that actually get the sites indexed and ranked.

This complements `CUSTOM_DOMAINS_SCOPE.md` (host routing + per-host canonical
foundations). Everything below is implemented unless marked **follow-up**.

---

## 1. What the code emits per school host

| Concern | Where | Behaviour |
|---|---|---|
| Title / description / OG / Twitter | `frontend/app/school/[subdomain]/layout.tsx` (`generateMetadata`) | Title `"<School Name> \| SQUL"` with a `%s \| <School Name>` template; description from the school's own copy; social image from the hero photo or logo. |
| Canonical | same | Self-canonicalises to the **host the visitor used** (custom domain or `*.squl.co.ke`). |
| Structured data | `frontend/app/school/[subdomain]/page.tsx` | schema.org `School` JSON-LD: name, url, logo, image, description, email, telephone, slogan, foundingDate, and — when the profile is filled in — `PostalAddress`, `GeoCoordinates`, and `keywords` (from school type). Emitted only for schools that have published a homepage. |
| Page indexing | `frontend/app/school/[subdomain]/layout.tsx` | `robots` meta is `index,follow` for published schools and `noindex,nofollow` for un-published ones (the default/placeholder template), applied to the homepage and its sub-pages. |
| Sitemap | `frontend/app/sitemap.ts` | Host-aware. A tenant host gets `/`, `/admissions`, `/apply`. The apex keeps the marketing + blog sitemap. |
| robots.txt | `frontend/app/robots.ts` | Host-aware. Tenant hosts get `Allow: /` with the admin/portal routes disallowed and `Sitemap: https://<host>/sitemap.xml`. |
| Directory hub | `frontend/app/schools/page.tsx` | `ItemList` JSON-LD linking every **published** school site; canonical `/schools`. Un-published schools are filtered out so the hub never links to noindex pages. |

The shared helper that ties it together is `frontend/lib/school/tenant-seo.ts`:
`getTenantIdentity` (tenant name + canonical origin via the cached backend
`resolveHost`), `describeHomepage` (copy + profile), and `buildSchoolJsonLd`.

### Name resolution order
`config.seo.schoolName` → tenant record `name` (via `resolveHost`) → name derived
from the subdomain (`mirema-school` → "Mirema School").

### Canonical edge case
If a school page is opened on the apex path directly
(`https://squl.co.ke/school/mirema-school`), host resolution returns no tenant, so
the canonical is rewritten to the school's own subdomain
(`https://mirema-school.squl.co.ke/`) rather than the apex. This stops the apex
being treated as the canonical of every school page.

---

## 2. The school profile (SEO fields)

Address, geo, and contact details live **inside the published homepage config**
(`tenant_homepage_config.published.seo`) — no separate table or endpoint. They
ride the existing Website Studio save/publish flow and the public
`publicHomepageConfig` read, and are validated by `@squl/shared`
(`homepageSeoSchema`).

**How a school fills them in:** Website Studio → **Brand** tab → **School
profile** (bottom of the panel). Fields:

| Field | Schema key | Used for |
|---|---|---|
| Official school name | `schoolName` | `<title>`, JSON-LD `name`, OG siteName |
| School type | `schoolType` | JSON-LD `keywords` |
| Motto | `motto` | JSON-LD `slogan` |
| Year founded | `foundedYear` | JSON-LD `foundingDate` |
| Street address | `streetAddress` | JSON-LD `PostalAddress` |
| Town / city | `addressLocality` | JSON-LD `PostalAddress` |
| County | `addressRegion` | JSON-LD `PostalAddress` |
| Postal code | `postalCode` | JSON-LD `PostalAddress` |
| Country | `addressCountry` | JSON-LD `PostalAddress` (defaults to Kenya) |
| Contact phone | `phone` | JSON-LD `telephone` (falls back to the footer phone) |
| Contact email | `email` | JSON-LD `email` (falls back to the footer email) |
| Latitude / Longitude | `latitude` / `longitude` | JSON-LD `GeoCoordinates` |

A school is only eligible for **local** results once `streetAddress` +
`addressLocality` (and ideally lat/lng) are set. Coordinate and year inputs are
coerced from strings, trimmed, and bounded on read (`parseHomepageConfig`), so bad
stored data can never break the public page.

> **Changing the schema.** The canonical source is
> `backend/shared/src/homepage-config.ts`. After editing it:
> ```sh
> cd backend/shared && npm run build && npm test && npm run sync:frontend
> ```
> `sync:frontend` copies the compiled package into `frontend/shared` **and**
> refreshes `frontend/node_modules/@squl/shared` when present (the frontend's
> `file:` dependency is copied, not symlinked, so an install copy would otherwise
> go stale).

---

## 3. Search Console + sitemap submission

On-page markup is necessary but not sufficient — verify the properties and submit
the sitemaps so Google crawls and ranks them.

### 3.1 Verify the platform
1. Add a **Domain property** for `squl.co.ke` in Google Search Console and verify
   by DNS TXT. A Domain property covers the apex **and every `*.squl.co.ke`
   subdomain**, so all school sites are covered by one verification.
2. Submit `https://squl.co.ke/sitemap.xml`.

### 3.2 Custom domains
Each school on its own domain (`school.ac.ke`) is a *different* host and needs its
own verification:
- Preferred: a **Domain property** per custom domain (DNS TXT), or
- URL-prefix property with the HTML-file / meta-tag method (the site already
  serves the school's own `<head>`, so a meta tag can be injected by the school
  if DNS is not accessible).
- Submit `https://<custom-domain>/sitemap.xml` for each.

`/schools` links to every school host, so Google discovers them from the hub even
before per-domain verification — but verification is what gives you the URL
Inspection tool, coverage reports, and the ability to request indexing.

### 3.3 Request indexing & monitor
- **URL Inspection → Request indexing** for a newly published school so the first
  crawl happens immediately instead of waiting for the sitemap tick.
- Watch **Pages → "Crawled - currently not indexed"**. A large cluster of these
  usually means schools with no profile/published content are emitting
  near-duplicate default pages — see §4.

### 3.4 Google Business Profile (local ranking)
For "<school> in <town>" queries, the strongest lever is a **Google Business
Profile** per school, with the same name, address, and coordinates the school
entered in its SQUL profile (NAP consistency). SQUL's JSON-LD provides the
machine-readable address; the GBP provides the local pack presence. Neither
replaces the other.

---

## 4. Follow-ups / known limits

- **`schoolType`** is emitted as JSON-LD `keywords` (a soft signal — schema.org's
  `keywords` is not defined on `Organization`, but Google tolerates it). A cleaner
  mapping to `additionalType` URLs is possible later.
- **Per-school sitemap pagination** is intentionally omitted; tenant sitemaps list
  the handful of public pages.
- **Multi-zone (`squl.co.tz`, …)** hreflang + per-zone sitemaps are scoped
  separately in `MULTI_COUNTRY_CCTLD_DOMAINS_SCOPE.md`.
- **Address/geo are self-reported** by schools; there is no verification step yet.
- **Un-published sites are `noindex`** but still reachable (a school can preview
  and publish). The `/schools` directory lists only published schools
  (`publicPlatformSchools` now returns a `published` flag).

---

## 5. Verifying a change locally

```sh
# 1. Build the shared schema and mirror it to the frontend install
cd backend/shared && npm run build && npm test && npm run sync:frontend

# 2. Check the emitted markup for a tenant host
cd ../../frontend
npm run build
# then, against a running server:
curl -s https://<sub>.squl.co.ke/ | grep -E 'application/ld\+json|<title>|canonical'
curl -s https://<sub>.squl.co.ke/robots.txt
curl -s https://<sub>.squl.co.ke/sitemap.xml
```

Paste a school URL into Google's **Rich Results Test** to confirm the `School`
node is valid, and use **URL Inspection** to confirm the self-canonical.
