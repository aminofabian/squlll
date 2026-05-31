'use client'

import { ArrowLeft, Mail, MessageCircle, User, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useStudentClassTeacher } from '@/lib/student/useStudentClassTeacher'

interface StudentContactTeacherSectionProps {
  subdomain: string
  onBack: () => void
  onOpenMessages: (teacherUserId: string, teacherName: string) => void
}

export function StudentContactTeacherSection({
  subdomain,
  onBack,
  onOpenMessages,
}: StudentContactTeacherSectionProps) {
  const { classTeacher, loading, error, refetch } = useStudentClassTeacher(subdomain)

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Contact Class Teacher</h2>
          <p className="text-sm text-muted-foreground">Message your assigned class teacher</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
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
      ) : !classTeacher ? (
        <Card>
          <CardContent className="p-8 text-center space-y-2">
            <User className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="font-medium">No class teacher assigned</p>
            <p className="text-sm text-muted-foreground">
              Your school has not assigned a class teacher to your grade yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-primary/20">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{classTeacher.gradeName}</p>
                <h3 className="text-xl font-bold">{classTeacher.fullName}</h3>
                <p className="text-sm text-muted-foreground">Class teacher</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{classTeacher.email}</span>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={() =>
                onOpenMessages(classTeacher.teacherUserId, classTeacher.fullName)
              }
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Send message
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
