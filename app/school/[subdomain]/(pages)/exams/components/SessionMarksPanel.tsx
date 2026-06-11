'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Save, Search, Upload, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  bulkImportExamPaperMarks,
  fetchExamSessionMarkProgress,
  fetchExamSessionPaperMarkEntry,
  type ExamPaperMarkProgress,
} from '@/lib/exams/examSessions'
import { enterStudentMarks } from '@/lib/teacher/teacherMarks'

interface SessionMarksPanelProps {
  subdomain: string
  sessionId: string
}

export function SessionMarksPanel({ subdomain, sessionId }: SessionMarksPanelProps) {
  const queryClient = useQueryClient()
  const [selectedPaper, setSelectedPaper] = useState<ExamPaperMarkProgress | null>(null)
  const [marks, setMarks] = useState<Record<string, number | undefined>>({})
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  const parseMarksCsv = (text: string) => {
    const lines = text.trim().split(/\r?\n/).filter(Boolean)
    if (lines.length < 2) {
      throw new Error('CSV must include a header row and at least one data row')
    }
    const header = lines[0].toLowerCase().split(',').map((c) => c.trim())
    const admIdx = header.findIndex(
      (h) =>
        h.includes('admission') || h === 'adm' || h === 'admission_number' || h === 'admno',
    )
    const scoreIdx = header.findIndex(
      (h) => h.includes('score') || h === 'mark' || h === 'marks',
    )
    if (admIdx < 0 || scoreIdx < 0) {
      throw new Error('CSV must have admission and score columns')
    }
    return lines.slice(1).map((line) => {
      const cols = line.split(',').map((c) => c.trim())
      const score = Number(cols[scoreIdx])
      if (isNaN(score)) throw new Error(`Invalid score in row: ${line}`)
      return { admissionNumber: cols[admIdx], score }
    })
  }

  const handleCsvImport = async (file: File) => {
    if (!selectedPaper) return
    setImporting(true)
    try {
      const text = await file.text()
      const rows = parseMarksCsv(text)
      const result = await bulkImportExamPaperMarks(subdomain, {
        sessionId,
        paperId: selectedPaper.paperId,
        rows,
      })
      toast.success(`Imported ${result.importedCount} marks`, {
        description:
          result.errors.length > 0
            ? `${result.skippedCount} skipped · ${result.errors.slice(0, 2).join('; ')}`
            : undefined,
      })
      await queryClient.invalidateQueries({
        queryKey: ['examSessionMarkProgress', subdomain, sessionId],
      })
      await entryQuery.refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const progressQuery = useQuery({
    queryKey: ['examSessionMarkProgress', subdomain, sessionId],
    queryFn: () => fetchExamSessionMarkProgress(subdomain, sessionId),
    enabled: Boolean(subdomain && sessionId),
  })

  const entryQuery = useQuery({
    queryKey: ['examSessionPaperMarkEntry', subdomain, sessionId, selectedPaper?.paperId],
    queryFn: () =>
      fetchExamSessionPaperMarkEntry(subdomain, sessionId, selectedPaper!.paperId),
    enabled: Boolean(subdomain && sessionId && selectedPaper?.paperId),
  })

  useEffect(() => {
    if (!entryQuery.data) return
    const initial: Record<string, number | undefined> = {}
    for (const s of entryQuery.data.students) {
      if (s.score != null) initial[s.id] = s.score
    }
    setMarks(initial)
    setSearch('')
    setError(null)
  }, [entryQuery.data])

  const filteredStudents = useMemo(() => {
    const students = entryQuery.data?.students ?? []
    if (!search.trim()) return students
    const q = search.toLowerCase()
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q),
    )
  }, [entryQuery.data?.students, search])

  const handleMarkChange = (studentId: string, value: string) => {
    setError(null)
    if (value === '') {
      setMarks((prev) => {
        const next = { ...prev }
        delete next[studentId]
        return next
      })
      return
    }
    const num = Number(value)
    const maxScore = entryQuery.data?.maxScore ?? 100
    if (isNaN(num) || num < 0) {
      setError('Marks must be a non-negative number')
      return
    }
    if (num > maxScore) {
      setError(`Marks must be between 0 and ${maxScore}`)
      return
    }
    setMarks((prev) => ({ ...prev, [studentId]: num }))
  }

  const saveMarks = useCallback(async () => {
    if (!entryQuery.data) return
    const entries = Object.entries(marks).filter(
      ([, score]) => score !== undefined && !isNaN(score),
    ) as [string, number][]
    if (entries.length === 0) {
      toast.error('Enter at least one mark before saving')
      return
    }

    setSaving(true)
    try {
      const inputs = entries.map(([studentId, score]) => ({
        studentId,
        marks: [{ assessmentId: entryQuery.data.assessmentId, score }],
      }))
      await enterStudentMarks(subdomain, inputs)
      toast.success('Marks saved')
      await queryClient.invalidateQueries({
        queryKey: ['examSessionMarkProgress', subdomain, sessionId],
      })
      await queryClient.invalidateQueries({
        queryKey: ['examSessionResults', subdomain, sessionId],
      })
      await entryQuery.refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save marks')
    } finally {
      setSaving(false)
    }
  }, [marks, entryQuery, subdomain, sessionId, queryClient])

  const papers = progressQuery.data ?? []
  const totalEntered = papers.reduce((sum, p) => sum + p.marksEntered, 0)
  const totalExpected = papers.reduce((sum, p) => sum + p.totalStudents, 0)
  const overallPct =
    totalExpected > 0 ? Math.round((totalEntered / totalExpected) * 100) : 0

  if (progressQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading mark entry…
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Mark entry progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm text-slate-600">
            <span>
              {totalEntered} of {totalExpected} marks entered
            </span>
            <span>{overallPct}%</span>
          </div>
          <Progress value={overallPct} className="h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Papers</CardTitle>
        </CardHeader>
        <CardContent>
          {papers.length === 0 ? (
            <p className="text-sm text-slate-500">No papers in this session.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 px-2">Subject</th>
                    <th className="py-2 px-2">Grade</th>
                    <th className="py-2 px-2">Progress</th>
                    <th className="py-2 px-2">Max</th>
                    <th className="py-2 px-2" />
                  </tr>
                </thead>
                <tbody>
                  {papers.map((paper) => {
                    const pct =
                      paper.totalStudents > 0
                        ? Math.round(
                            (paper.marksEntered / paper.totalStudents) * 100,
                          )
                        : 0
                    return (
                      <tr key={paper.paperId} className="border-b border-slate-100">
                        <td className="py-2 px-2">{paper.subjectName}</td>
                        <td className="py-2 px-2">{paper.gradeName}</td>
                        <td className="py-2 px-2">
                          {paper.marksEntered}/{paper.totalStudents} ({pct}%)
                        </td>
                        <td className="py-2 px-2">{paper.maxScore}</td>
                        <td className="py-2 px-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedPaper(paper)}
                          >
                            Enter marks
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPaper && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="font-semibold">
                  {entryQuery.data?.subjectName ?? selectedPaper.subjectName} —{' '}
                  {entryQuery.data?.gradeName ?? selectedPaper.gradeName}
                </h3>
                <p className="text-xs text-slate-500">
                  Max score: {entryQuery.data?.maxScore ?? selectedPaper.maxScore}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPaper(null)}
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 border-b flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={importing}
                onClick={() =>
                  document.getElementById('exam-marks-csv-input')?.click()
                }
              >
                {importing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Import CSV
              </Button>
              <input
                id="exam-marks-csv-input"
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                disabled={importing}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleCsvImport(file)
                  e.target.value = ''
                }}
              />
              <span className="text-xs text-slate-500">
                Columns: admission_number, score
              </span>
            </div>

            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search students…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 mt-2">{error}</p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {entryQuery.isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 py-2 border-b border-slate-50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{student.name}</p>
                        <p className="text-xs text-slate-500">
                          {student.admissionNumber}
                        </p>
                      </div>
                      <Input
                        type="number"
                        min={0}
                        max={entryQuery.data?.maxScore ?? 100}
                        className="w-24"
                        value={marks[student.id] ?? ''}
                        onChange={(e) =>
                          handleMarkChange(student.id, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedPaper(null)}>
                Close
              </Button>
              <Button onClick={saveMarks} disabled={saving || entryQuery.isLoading}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save marks
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
