'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, PenLine, Save, Search, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  bulkImportExamPaperMarks,
  fetchExamSessionMarkProgress,
  fetchExamSessionPaperMarkEntry,
  type ExamPaperMarkProgress,
  type ExamSessionRecord,
} from '@/lib/exams/examSessions'
import {
  buildGradeOrderMap,
  organizeByClassAndSubject,
  sessionScopeStats,
} from '@/lib/exams/examSessionOrganize'
import { formatPaperDisplayName } from '@/lib/exams/examPaperComponents'
import { formatGradeDisplayName } from '@/lib/utils/grade-display'
import { enterStudentMarks } from '@/lib/teacher/teacherMarks'
import {
  SessionClassSection,
  SessionClassTable,
  SessionClassTableCell,
  SessionClassTableRow,
  SessionOrganizerEmpty,
  SessionScopeStrip,
} from './SessionClassOrganizer'

interface SessionMarksPanelProps {
  subdomain: string
  sessionId: string
  session: ExamSessionRecord
  gradeFilter: string
}

type EnrichedPaper = ExamPaperMarkProgress & {
  gradeId: string
  subjectId: string
  displayName: string
}

export function SessionMarksPanel({
  subdomain,
  sessionId,
  session,
  gradeFilter,
}: SessionMarksPanelProps) {
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
  const scopeStats = useMemo(() => sessionScopeStats(session), [session])

  const sessionPaperById = useMemo(() => {
    return new Map((session.papers ?? []).map((paper) => [paper.id, paper]))
  }, [session.papers])

  const gradeOrder = useMemo(() => buildGradeOrderMap(session), [session])

  const enrichedPapers = useMemo((): EnrichedPaper[] => {
    return papers.map((paper) => {
      const sessionPaper = sessionPaperById.get(paper.paperId)
      const gradeId = sessionPaper?.tenantGradeLevelId ?? paper.gradeName
      return {
        ...paper,
        gradeId,
        subjectId: sessionPaper?.tenantSubjectId ?? paper.subjectName,
        displayName: formatPaperDisplayName(
          paper.subjectName,
          sessionPaper?.paperLabel,
        ),
      }
    })
  }, [papers, sessionPaperById])

  const classGroups = useMemo(
    () =>
      organizeByClassAndSubject({
        items: enrichedPapers,
        gradeFilter,
        gradeOrder,
        getGradeId: (paper) => paper.gradeId,
        getSubjectId: (paper) => paper.subjectId,
        getSubjectName: (paper) => paper.subjectName,
        getSubjectCode: (paper) => {
          const sp = sessionPaperById.get(paper.paperId)
          return (
            sp?.tenantSubject?.subject?.code ??
            sp?.tenantSubject?.customSubject?.code ??
            undefined
          )
        },
        getGradeName: (paper, gradeId) =>
          formatGradeDisplayName(paper.gradeName || gradeId),
        sortPapers: (a, b) => a.displayName.localeCompare(b.displayName),
      }),
    [enrichedPapers, gradeFilter, gradeOrder, sessionPaperById],
  )

  const totalEntered = classGroups.reduce(
    (sum, group) =>
      sum + group.subjects.reduce(
        (n, subject) =>
          n + subject.papers.reduce((p, paper) => p + paper.marksEntered, 0),
        0,
      ),
    0,
  )
  const totalExpected = classGroups.reduce(
    (sum, group) =>
      sum + group.subjects.reduce(
        (n, subject) =>
          n + subject.papers.reduce((p, paper) => p + paper.totalStudents, 0),
        0,
      ),
    0,
  )
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
      <SessionScopeStrip
        gradeCount={gradeFilter === 'all' ? scopeStats.gradeCount : classGroups.length}
        subjectCount={classGroups.reduce((n, g) => n + g.subjectCount, 0)}
        paperCount={classGroups.reduce((n, g) => n + g.paperCount, 0)}
        extra={
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span>
                {totalEntered} of {totalExpected} marks entered
              </span>
              <span className="font-semibold tabular-nums text-[#246a59]">
                {overallPct}%
              </span>
            </div>
            <Progress value={overallPct} className="h-1.5" />
            {gradeFilter !== 'all' && classGroups[0] ? (
              <p className="text-[10px] text-slate-500">
                Showing <span className="font-medium">{classGroups[0].gradeName}</span> only
              </p>
            ) : null}
          </div>
        }
      />

      {classGroups.length === 0 ? (
        <SessionOrganizerEmpty
          title={papers.length === 0 ? 'No papers in this session' : 'No papers for this class'}
          description="Add papers on the Papers tab, then enter marks here by class and subject."
        />
      ) : (
        <div className="space-y-3">
          {classGroups.map((group, groupIndex) => {
            const groupEntered = group.subjects.reduce(
              (n, subject) =>
                n + subject.papers.reduce((p, paper) => p + paper.marksEntered, 0),
              0,
            )
            const groupExpected = group.subjects.reduce(
              (n, subject) =>
                n + subject.papers.reduce((p, paper) => p + paper.totalStudents, 0),
              0,
            )
            const groupPct =
              groupExpected > 0
                ? Math.round((groupEntered / groupExpected) * 100)
                : 0

            return (
              <SessionClassSection
                key={group.gradeId}
                gradeName={group.gradeName}
                gradeIndex={groupIndex}
                subjectCount={group.subjectCount}
                paperCount={group.paperCount}
                progress={groupPct}
                progressLabel={`${groupEntered}/${groupExpected} marks entered`}
                variant="table"
              >
                <SessionClassTable
                  columns={['Subject', 'Paper', 'Progress', 'Max', '']}
                >
                  {group.subjects.flatMap((subject) =>
                    subject.papers.map((paper, paperIndex) => {
                      const pct =
                        paper.totalStudents > 0
                          ? Math.round(
                              (paper.marksEntered / paper.totalStudents) * 100,
                            )
                          : 0
                      const sessionPaper = sessionPaperById.get(paper.paperId)
                      const paperLabel =
                        sessionPaper?.paperLabel &&
                        (subject.papers.length > 1 ||
                          sessionPaper.paperLabel !== 'Paper 1')
                          ? sessionPaper.paperLabel
                          : '—'

                      return (
                        <SessionClassTableRow key={paper.paperId}>
                          {paperIndex === 0 ? (
                            <SessionClassTableCell
                              rowSpan={subject.papers.length}
                              className="font-medium text-slate-900 dark:text-slate-100"
                            >
                              {subject.subjectName}
                            </SessionClassTableCell>
                          ) : null}
                          <SessionClassTableCell>{paperLabel}</SessionClassTableCell>
                          <SessionClassTableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={pct} className="h-1.5 w-20" />
                              <span className="text-xs tabular-nums text-slate-600">
                                {paper.marksEntered}/{paper.totalStudents} ({pct}%)
                              </span>
                            </div>
                          </SessionClassTableCell>
                          <SessionClassTableCell className="tabular-nums">
                            {paper.maxScore}
                          </SessionClassTableCell>
                          <SessionClassTableCell align="right">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => setSelectedPaper(paper)}
                            >
                              <PenLine className="h-3 w-3 mr-1" />
                              Enter marks
                            </Button>
                          </SessionClassTableCell>
                        </SessionClassTableRow>
                      )
                    }),
                  )}
                </SessionClassTable>
              </SessionClassSection>
            )
          })}
        </div>
      )}

      <Sheet
        open={Boolean(selectedPaper)}
        onOpenChange={(open) => {
          if (!open) setSelectedPaper(null)
        }}
      >
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
        >
          {selectedPaper ? (
            <>
              <SheetHeader className="border-b bg-gradient-to-r from-[#246a59]/10 via-white to-[#0073ea]/5 px-4 py-4 pr-12 dark:from-[#246a59]/20 dark:via-slate-900 dark:to-slate-900">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#246a59]">
                  {entryQuery.data?.gradeName ?? selectedPaper.gradeName}
                </p>
                <SheetTitle className="text-base">
                  {formatPaperDisplayName(
                    entryQuery.data?.subjectName ?? selectedPaper.subjectName,
                    sessionPaperById.get(selectedPaper.paperId)?.paperLabel,
                  )}
                </SheetTitle>
                <SheetDescription>
                  Max score: {entryQuery.data?.maxScore ?? selectedPaper.maxScore}
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  disabled={importing}
                  onClick={() =>
                    document.getElementById('exam-marks-csv-input')?.click()
                  }
                >
                  {importing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
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
                <span className="text-[10px] text-slate-500">
                  Columns: admission_number, score
                </span>
              </div>

              <div className="border-b px-4 py-2.5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search students…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 pl-9 text-sm"
                  />
                </div>
                {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
                {entryQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center gap-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{student.name}</p>
                          <p className="text-[10px] text-slate-500">
                            {student.admissionNumber}
                          </p>
                        </div>
                        <Input
                          type="number"
                          min={0}
                          max={entryQuery.data?.maxScore ?? 100}
                          className="h-8 w-20 text-sm"
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

              <SheetFooter className="flex-row justify-end gap-2 border-t px-4 py-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPaper(null)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-[#246a59] hover:bg-[#1a4c40]"
                  onClick={saveMarks}
                  disabled={saving || entryQuery.isLoading}
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  ) : (
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Save marks
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}
