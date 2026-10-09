"use client"

import { useParams, useRouter } from "next/navigation"
import { StudentPage } from "../_ui"
import StudentExamResultsComponent from "../components/StudentExamResultsComponent"

export default function StudentExamResultsPage() {
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
      <StudentExamResultsComponent
        subdomain={subdomain}
        onBack={() => router.push("/student")}
      />
    </StudentPage>
  )
}
