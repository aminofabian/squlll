'use client'

import { Suspense } from 'react'
import { Outfit } from "next/font/google"

const outfit = Outfit({
  subsets: ["latin"],
  variable: '--font-outfit',
})

// Loading component for Suspense fallback
function SubdomainLayoutLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}

// Main layout component
function SubdomainLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${outfit.variable} font-sans`}>
      {children}
    </div>
  )
}

// Root layout component
export default function SubdomainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<SubdomainLayoutLoading />}>
      <SubdomainLayoutContent>
        {children}
      </SubdomainLayoutContent>
    </Suspense>
  )
} 