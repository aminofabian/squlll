"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, LogOut, Mail, RefreshCw, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCurrentStudent } from "@/lib/hooks/useCurrentStudent"
import { useSignout } from "@/lib/hooks/useSignout"

export default function StudentSettingsPage() {
  const params = useParams()
  const subdomain =
    typeof params.subdomain === "string"
      ? params.subdomain
      : Array.isArray(params.subdomain)
        ? params.subdomain[0]
        : ""

  const { student, loading } = useCurrentStudent()
  const { signOut, isSigningOut } = useSignout()

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
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your student account
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Loading your account…
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">
                    {student?.name || "Student"}
                  </span>
                </div>
                {student?.email ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{student.email}</span>
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Signing out ends your session on this device.
            </p>
            <Button
              variant="outline"
              onClick={signOut}
              disabled={isSigningOut}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 disabled:opacity-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isSigningOut ? "Signing out…" : "Sign out"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
