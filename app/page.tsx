import type { Metadata } from 'next'
import Home from './HomeClient'
import { LANDING_FAQ_ITEMS } from './landing-faq'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.squl.co.ke'

const title = 'School Management Software in Kenya (M-Pesa, CBC) | SQUL'
const description =
  'Run admissions, M-Pesa fee collection, CBC marks and parent SMS in one system built for Kenyan schools. Start a 90-day free term — no credit card.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  // Consolidate apex/www onto the canonical host (NEXT_PUBLIC_SITE_URL).
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'SQUL',
    title,
    description,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SQUL — school management software for Kenyan schools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'SQUL',
  url: `${siteUrl}/`,
  logo: `${siteUrl}/squl-logo.png`,
  description:
    'SQUL is a school management system for Kenyan schools — admissions, M-Pesa fees, CBC academics, timetables, and parent communication.',
  areaServed: { '@type': 'Country', name: 'Kenya' },
}

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'SQUL',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, Android',
  url: `${siteUrl}/`,
  description,
  areaServed: { '@type': 'Country', name: 'Kenya' },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KES',
    description: '90-day free term, no credit card required',
  },
}

/** FAQ questions are the same items rendered by the homepage (see landing-faq.ts). */
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: LANDING_FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationSchema, softwareSchema, faqSchema]),
        }}
      />
      <Home />
    </>
  )
}
