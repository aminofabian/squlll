"use client"

import { useRouter } from "next/navigation"
import ViewAttendanceComponent from "../components/ViewAttendanceComponent"

export default function StudentAttendancePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-primary/5">
      <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-4xl mx-auto">
        <ViewAttendanceComponent onBack={() => router.push("/student")} />
      </div>
    </div>
  )
}
