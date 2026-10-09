"use client"

import { useParams, useRouter } from "next/navigation"
import { StudentPage } from "../_ui"
import PendingAssignmentsComponent from "../components/PendingAssignmentsComponent"

export default function StudentAssignmentsPage() {
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
      <PendingAssignmentsComponent
        subdomain={subdomain}
        onBack={() => router.push("/student")}
      />
    </StudentPage>
  )
}
