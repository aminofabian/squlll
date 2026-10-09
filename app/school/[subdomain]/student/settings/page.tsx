"use client"

import { useParams, useRouter } from "next/navigation"
import { LogOut, Mail, RefreshCw, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCurrentStudent } from "@/lib/hooks/useCurrentStudent"
import { useSignout } from "@/lib/hooks/useSignout"
import { PageHeader, Section, StudentPage } from "../_ui"

export default function StudentSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const subdomain =
    typeof params.subdomain === "string"
      ? params.subdomain
      : Array.isArray(params.subdomain)
        ? params.subdomain[0]
        : ""

  const { student, loading } = useCurrentStudent()
  const { signOut, isSigningOut } = useSignout()

  return (
    <StudentPage>
      <PageHeader
        title="Settings"
        subtitle="Manage your student account"
        onBack={() => router.push(`/school/${subdomain}/student`)}
      />

      <div className="space-y-6">
        <Section title="Account" icon={User}>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading your account…
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">
                  {student?.name || "Student"}
                </span>
              </div>
              {student?.email ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{student.email}</span>
                </div>
              ) : null}
            </div>
          )}
        </Section>

        <Section title="Session" icon={LogOut}>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Signing out ends your session on this device.
            </p>
            <Button
              variant="destructive"
              onClick={signOut}
              disabled={isSigningOut}
            >
              <LogOut className="h-4 w-4" />
              {isSigningOut ? "Signing out…" : "Sign out"}
            </Button>
          </div>
        </Section>
      </div>
    </StudentPage>
  )
}
