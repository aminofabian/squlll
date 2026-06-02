// Polyfill localStorage for SSR before anything else
import "@/lib/polyfills/localStorage";

import { Figtree } from "next/font/google";
import "./globals.css";
import { QueryClientWrapper } from "./QueryClientWrapper";
import { ApolloWrapper } from "./ApolloWrapper";
import { ErrorHandler } from "@/components/ErrorHandler";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
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
      <body className={`${figtree.variable} font-sans antialiased`}>
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
