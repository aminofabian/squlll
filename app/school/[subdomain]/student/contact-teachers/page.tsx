"use client"

import { useParams, useRouter } from "next/navigation"
import { StudentContactTeacherSection } from "../components/StudentContactTeacherSection"
import { StudentPage } from "../_ui"

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
    <StudentPage>
      <StudentContactTeacherSection
        subdomain={subdomain}
        onBack={() => router.back()}
        onOpenMessages={() => router.push("/student/messages")}
      />
    </StudentPage>
  )
}
