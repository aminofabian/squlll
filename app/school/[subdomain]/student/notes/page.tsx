"use client"

import { useParams, useRouter } from "next/navigation"
import DownloadNotesComponent from "../components/DownloadNotesComponent"
import { StudentPage } from "../_ui"

export default function StudentNotesPage() {
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
      <DownloadNotesComponent
        subdomain={subdomain}
        onBack={() => router.push("/student")}
      />
    </StudentPage>
  )
}
