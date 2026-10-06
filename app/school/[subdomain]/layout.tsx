import type { Metadata } from "next"
import { headers } from "next/headers"
import { normalizeHostname } from "@/lib/hostname"
import { RealtimeWrapper } from "./RealtimeWrapper"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.squl.co.ke"

function schoolNameFromSubdomain(subdomain: string): string {
  return subdomain
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

/**
 * Per-host SEO: a school served on its own domain self-canonicalizes to that
 * domain instead of the platform apex, so search engines index the right host.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ subdomain: string }>
}): Promise<Metadata> {
  const { subdomain } = await params
  const headerList = await headers()
  const host = normalizeHostname(
    headerList.get("x-forwarded-host") ?? headerList.get("host"),
  )
  const isLocal =
    host === "localhost" || (host?.endsWith(".localhost") ?? false)
  const base = host ? `${isLocal ? "http" : "https"}://${host}` : SITE_URL
  const name = schoolNameFromSubdomain(subdomain)

  return {
    metadataBase: new URL(base),
    title: `${name} | SQUL`,
    description: `Official site and portal for ${name} on SQUL.`,
    // Canonicalize to the host the visitor actually used (custom domain or subdomain).
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: base,
      siteName: name,
      title: `${name} | SQUL`,
      description: `Official site and portal for ${name} on SQUL.`,
    },
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
