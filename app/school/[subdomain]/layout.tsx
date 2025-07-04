'use client'

import { Suspense } from 'react'

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
  return <>{children}</>
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