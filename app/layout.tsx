// Polyfill localStorage for SSR before anything else
import "@/lib/polyfills/localStorage";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryClientWrapper } from "./QueryClientWrapper";
import { ApolloWrapper } from "./ApolloWrapper";
import { ErrorHandler } from "@/components/ErrorHandler";

const geistSans = Geist({
  subsets: ["latin"],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: '--font-geist-mono',
});

// Server component root layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add cache control headers for production */}
        {process.env.NODE_ENV === 'production' && (
          <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryClientWrapper>
          <ApolloWrapper>
            <ErrorHandler />
            {children}
          </ApolloWrapper>
        </QueryClientWrapper>
      </body>
    </html>
  )
}
