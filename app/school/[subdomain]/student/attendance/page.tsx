"use client"

import { useParams, useRouter } from "next/navigation"
import { StudentAttendanceSection } from "../components/StudentAttendanceSection"
import { StudentPage } from "../_ui"

export default function StudentAttendancePage() {
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
      <StudentAttendanceSection
        subdomain={subdomain}
        onBack={() => router.push("/student")}
      />
    </StudentPage>
  )
}
