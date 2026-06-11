'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ATTENDANCE_STATUS_LABELS,
  bulkRecordExamAttendance,
  fetchExamSessionAttendanceSheet,
  fetchExamSessionMarkProgress,
  type ExamAttendanceStatus,
  type ExamSessionRecord,
} from '@/lib/exams/examSessions'

interface SessionAttendancePanelProps {
  subdomain: string
  sessionId: string
  session: ExamSessionRecord
}

export function SessionAttendancePanel({
  subdomain,
  sessionId,
  session,
}: SessionAttendancePanelProps) {
  const papers = useMemo(() => {
    return (session.papers ?? []).map((p) => ({
      id: p.id,
      label: `${p.tenantSubject?.subject?.name ?? 'Subject'} — ${p.tenantGradeLevel?.gradeLevel?.name ?? 'Grade'}`,
    }))
  }, [session.papers])

  const [paperId, setPaperId] = useState(papers[0]?.id ?? '')
  const [statuses, setStatuses] = useState<Record<string, ExamAttendanceStatus>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!paperId && papers[0]?.id) setPaperId(papers[0].id)
  }, [papers, paperId])

  const sheetQuery = useQuery({
    queryKey: ['examSessionAttendanceSheet', subdomain, sessionId, paperId],
    queryFn: () => fetchExamSessionAttendanceSheet(subdomain, sessionId, paperId),
    enabled: Boolean(paperId),
  })

  useEffect(() => {
    if (!sheetQuery.data) return
    const initial: Record<string, ExamAttendanceStatus> = {}
    for (const row of sheetQuery.data.rows) {
      if (row.status) initial[row.studentId] = row.status
    }
    setStatuses(initial)
  }, [sheetQuery.data])

  const progressQuery = useQuery({
    queryKey: ['examSessionMarkProgress', subdomain, sessionId],
    queryFn: () => fetchExamSessionMarkProgress(subdomain, sessionId),
  })

  const handleSave = async () => {
    if (!paperId || !sheetQuery.data) return
    const rows = Object.entries(statuses).map(([studentId, status]) => ({
      studentId,
      status,
    }))
    if (rows.length === 0) {
      toast.error('Mark attendance for at least one student')
      return
    }
    setSaving(true)
    try {
      await bulkRecordExamAttendance(subdomain, {
        examSessionId: sessionId,
        examPaperId: paperId,
        rows,
      })
      toast.success('Attendance saved')
      await sheetQuery.refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  const markAll = (status: ExamAttendanceStatus) => {
    if (!sheetQuery.data) return
    const next: Record<string, ExamAttendanceStatus> = {}
    for (const row of sheetQuery.data.rows) {
      next[row.studentId] = status
    }
    setStatuses(next)
  }

  if (papers.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-slate-500">
          No exam papers in this session.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="py-3 text-sm text-blue-800 dark:text-blue-200">
          Record attendance before mark entry. Only registered candidates appear here.
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Select value={paperId} onValueChange={setPaperId}>
          <SelectTrigger className="sm:w-72">
            <SelectValue placeholder="Select paper" />
          </SelectTrigger>
          <SelectContent>
            {papers.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => markAll('PRESENT')}>
            All present
          </Button>
          <Button size="sm" variant="outline" onClick={() => markAll('ABSENT')}>
            All absent
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            {sheetQuery.data
              ? `${sheetQuery.data.subjectName} — ${sheetQuery.data.gradeName}`
              : 'Attendance roll'}
          </CardTitle>
          <Button size="sm" onClick={handleSave} disabled={saving || sheetQuery.isLoading}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save attendance
          </Button>
        </CardHeader>
        <CardContent>
          {sheetQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (sheetQuery.data?.rows.length ?? 0) === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              No registered candidates for this paper. Register candidates first.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 px-2">Student</th>
                    <th className="py-2 px-2">Adm. no.</th>
                    <th className="py-2 px-2">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {sheetQuery.data?.rows.map((row) => (
                    <tr key={row.studentId} className="border-b border-slate-100">
                      <td className="py-2 px-2">{row.studentName}</td>
                      <td className="py-2 px-2">{row.admissionNumber}</td>
                      <td className="py-2 px-2">
                        <Select
                          value={statuses[row.studentId] ?? ''}
                          onValueChange={(v) =>
                            setStatuses((prev) => ({
                              ...prev,
                              [row.studentId]: v as ExamAttendanceStatus,
                            }))
                          }
                        >
                          <SelectTrigger className="w-[200px] h-8">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ATTENDANCE_STATUS_LABELS).map(
                              ([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {progressQuery.data && (
        <p className="text-xs text-slate-500">
          Tip: mark entry uses registered candidates only (
          {progressQuery.data.reduce((s, p) => s + p.totalStudents, 0)} expected
          marks across papers).
        </p>
      )}
    </div>
  )
}
