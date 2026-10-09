"use client"

import { useParams, useRouter } from "next/navigation"
import { StudentContactTeacherSection } from "../components/StudentContactTeacherSection"

export default function StudentContactTeachersPage() {
  const params = useParams()
  const router = useRouter()
  const subdomain =
    typeof params.subdomain === "string"
      ? params.subdomain
      : Array.isArray(params.subdomain)
        ? params.subdomain[0]
        : ""

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-primary/5">
      <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-4xl mx-auto">
        <StudentContactTeacherSection
          subdomain={subdomain}
          onBack={() => router.back()}
          onOpenMessages={() => router.push("/student/messages")}
        />
      </div>
    </div>
  )
}
