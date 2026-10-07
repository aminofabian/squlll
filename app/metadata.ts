import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.squl.co.ke";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "SQUL | Kenya School Management System",
  description:
    "SQUL helps schools manage students, academics, fees, timetable, and staff in one secure platform.",
  icons: {
    // Brand mark: PNGs for search/browser icons, plus public/favicon.svg.
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon-192.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "SQUL | Kenya School Management System",
    description:
      "SQUL helps schools manage students, academics, fees, timetable, and staff in one secure platform.",
    siteName: "SQUL",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SQUL — Kenya School Management System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SQUL | Kenya School Management System",
    description:
      "SQUL helps schools manage students, academics, fees, timetable, and staff in one secure platform.",
    images: ["/og-image.png"],
  },
};