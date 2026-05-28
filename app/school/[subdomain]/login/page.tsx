"use client"

import { Suspense } from "react"
import SchoolLoginPage from "./SchoolLoginContent"

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-gray-600 font-medium">Loading sign in…</p>
        </div>
      }
    >
      <SchoolLoginPage />
    </Suspense>
  )
}
