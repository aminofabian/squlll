import type { Metadata } from "next"
import { getTenantSeo } from "@/lib/school/tenant-seo"
import { RealtimeWrapper } from "./RealtimeWrapper"

/**
 * Per-host SEO: a school served on its own domain self-canonicalizes to that
 * domain instead of the platform apex, so search engines index the right host.
 * Title, description and social image come from the school's published
 * homepage config so each campus can rank for its own name and location.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>
}): Promise<Metadata> {
  const { subdomain } = await params
  const seo = await getTenantSeo(subdomain)
  const { identity, description, imageUrl, name, published } = seo

  const title = `${name} | SQUL`

  return {
    metadataBase: new URL(identity.origin),
    applicationName: "SQUL",
    title: { default: title, template: `%s | ${name}` },
    description,
    // Canonicalize to the host the visitor actually used (custom domain or subdomain).
    alternates: { canonical: "/" },
    icons: {
      icon: [
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      shortcut: "/icon-192.png",
      apple: "/apple-icon.png",
    },
    openGraph: {
      type: "website",
      url: `${identity.origin}/`,
      siteName: name,
      title,
      description,
      images: imageUrl ? [{ url: imageUrl, alt: name }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    // Keep thin, unpublished sites out of the index; index proper published sites.
    robots: published
      ? { index: true, follow: true }
      : { index: false, follow: false },
  }
}

export default function SubdomainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen font-sans">
      <RealtimeWrapper>{children}</RealtimeWrapper>
    </div>
  )
}
