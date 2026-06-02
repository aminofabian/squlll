import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.squl.co.ke";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "SQUL | Kenya School Management System",
  description:
    "SQUL helps schools manage students, academics, fees, timetable, and staff in one secure platform.",
  icons: {
    // Use the brand logo for consistent search icons.
    icon: "/squl-logo.svg",
    shortcut: "/squl-logo.svg",
    apple: "/squl-logo.svg",
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
        url: "/screenshots/ai-generated-9041893_1920.jpg",
        width: 1200,
        height: 630,
        alt: "SQUL school management platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SQUL | Kenya School Management System",
    description:
      "SQUL helps schools manage students, academics, fees, timetable, and staff in one secure platform.",
    images: ["/screenshots/ai-generated-9041893_1920.jpg"],
  },
};