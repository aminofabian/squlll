'use client'

import { useMemo, useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  downloadPdfDataUrl,
  generateSessionReportCardsPdf,
} from '@/lib/exams/reportCards'
import type { ExamSessionRecord } from '@/lib/exams/examSessions'

interface SessionReportCardsPanelProps {
  subdomain: string
  session: ExamSessionRecord
}

export function SessionReportCardsPanel({
  subdomain,
  session,
}: SessionReportCardsPanelProps) {
  const [gradeFilter, setGradeFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)

  const grades = useMemo(() => {
    const map = new Map<string, string>()
    for (const paper of session.papers ?? []) {
      map.set(
        paper.tenantGradeLevelId,
        paper.tenantGradeLevel?.gradeLevel?.name ?? paper.tenantGradeLevelId,
      )
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [session.papers])

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const result = await generateSessionReportCardsPdf(subdomain, {
        sessionId: session.id,
        tenantGradeLevelId: gradeFilter === 'all' ? undefined : gradeFilter,
      })
      const gradeLabel =
        grades.find((g) => g.id === gradeFilter)?.name ?? 'all-grades'
      downloadPdfDataUrl(
        result.pdfDataUrl,
        `${session.name.replace(/\s+/g, '-')}-${gradeLabel}-report-cards.pdf`,
      )
      toast.success(`Generated ${result.generatedCount} report cards`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate PDFs')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Session report cards
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-500">
          Generate PDF report cards from processed session results. Run processing
          on the Processing tab before generating.
        </p>
        {grades.length > 0 && (
          <div className="space-y-2">
            <Label>Grade scope</Label>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All grades in session</SelectItem>
                {grades.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          Download bulk PDF
        </Button>
      </CardContent>
    </Card>
  )
}
