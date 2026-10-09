"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  User,
  Mail,
  Hash,
  GraduationCap,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrentStudent } from "@/lib/hooks/useCurrentStudent"

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="w-4 h-4" />
        {label}
      </span>
      <span className="text-sm font-medium text-right">
        {value && value.trim() ? value : "—"}
      </span>
    </div>
  )
}

export default function StudentProfilePage() {
  const params = useParams()
  const subdomain =
    typeof params.subdomain === "string"
      ? params.subdomain
      : Array.isArray(params.subdomain)
        ? params.subdomain[0]
        : ""

  const { student, loading, error, refetch } = useCurrentStudent()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-primary/5">
      <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-3xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="p-2">
            <Link href={`/school/${subdomain}/student`}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-sm text-muted-foreground">
              Your student account details
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card className="border-destructive/20">
            <CardContent className="p-8 text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => void refetch()}>Try again</Button>
            </CardContent>
          </Card>
        ) : !student ? (
          <Card>
            <CardContent className="p-8 text-center space-y-2">
              <User className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="font-medium">Profile unavailable</p>
              <p className="text-sm text-muted-foreground">
                We could not load your student details right now.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-background">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold truncate">
                    {student.name || "Student"}
                  </h2>
                  <p className="text-sm text-muted-foreground truncate">
                    {student.email || "No email on file"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailRow
                  icon={Hash}
                  label="Admission number"
                  value={student.admissionNumber}
                />
                <DetailRow
                  icon={GraduationCap}
                  label="Grade"
                  value={typeof student.grade === "string" ? student.grade : ""}
                />
                <DetailRow icon={Users} label="Stream" value={student.streamName} />
                <DetailRow icon={Mail} label="Email" value={student.email} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
