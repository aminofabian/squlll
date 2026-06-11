'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  GraduationCap,
  ClipboardList,
  PenLine,
  BarChart3,
  Users,
  UserCheck,
  ShieldCheck,
  Settings,
  Calculator,
  Trophy,
  TrendingUp,
  FileText,
  Layers,
  Filter,
} from 'lucide-react'
import { useExamSession } from '@/lib/hooks/useExamSessions'
import {
  getSessionGrades,
  publicationStateLabel,
  statusLabel,
} from '@/lib/exams/examSessions'
import { examsListPath } from '@/lib/school/schoolRoutes'
import { SchoolSearchFilter } from '@/components/dashboard/SchoolSearchFilter'
import { DashboardGradeSheet } from '../../dashboard/components/DashboardGradeSheet'
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig'
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore'
import { formatGradeDisplayName } from '@/lib/utils/grade-display'
import { cn } from '@/lib/utils'
import { SessionPapersPanel } from '../components/SessionPapersPanel'
import { SessionTimetablePanel } from '../components/SessionTimetablePanel'
import { SessionMarksPanel } from '../components/SessionMarksPanel'
import { SessionResultsPanel } from '../components/SessionResultsPanel'
import { SessionCandidatesPanel } from '../components/SessionCandidatesPanel'
import { SessionAttendancePanel } from '../components/SessionAttendancePanel'
import { SessionApprovalsPanel } from '../components/SessionApprovalsPanel'
import { SessionSettingsPanel } from '../components/SessionSettingsPanel'
import { SessionProcessingPanel } from '../components/SessionProcessingPanel'
import { SessionRankingsPanel } from '../components/SessionRankingsPanel'
import { SessionAnalyticsPanel } from '../components/SessionAnalyticsPanel'
import { SessionReportCardsPanel } from '../components/SessionReportCardsPanel'

type Tab =
  | 'overview'
  | 'papers'
  | 'candidates'
  | 'timetable'
  | 'attendance'
  | 'marks'
  | 'approvals'
  | 'processing'
  | 'results'
  | 'rankings'
  | 'analytics'
  | 'report-cards'
  | 'settings'

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: ClipboardList },
  { id: 'papers', label: 'Papers', icon: Layers },
  { id: 'candidates', label: 'Candidates', icon: Users },
  { id: 'timetable', label: 'Timetable', icon: BookOpen },
  { id: 'attendance', label: 'Attendance', icon: UserCheck },
  { id: 'marks', label: 'Marks', icon: PenLine },
  { id: 'approvals', label: 'Approvals', icon: ShieldCheck },
  { id: 'processing', label: 'Processing', icon: Calculator },
  { id: 'results', label: 'Results', icon: BarChart3 },
  { id: 'rankings', label: 'Rankings', icon: Trophy },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'report-cards', label: 'Report Cards', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function ExamSessionDetailPage() {
  const params = useParams()
  const subdomain = params.subdomain as string
  const sessionId = params.sessionId as string
  const [tab, setTab] = useState<Tab>('overview')
  const [selectedGradeId, setSelectedGradeId] = useState<string>()
  const [selectedStreamId, setSelectedStreamId] = useState('')
  const [isGradePanelOpen, setIsGradePanelOpen] = useState(false)
  const [isGradeSheetOpen, setIsGradeSheetOpen] = useState(false)

  const { isLoading: configLoading } = useSchoolConfig()
  const { config } = useSchoolConfigStore()
  const { data: session, isLoading, error } = useExamSession(sessionId)

  const sessionGrades = useMemo(
    () => (session ? getSessionGrades(session) : []),
    [session],
  )

  const sessionGradeIds = useMemo(
    () => sessionGrades.map((grade) => grade.id),
    [sessionGrades],
  )

  const gradeFilter = selectedGradeId ?? 'all'

  useEffect(() => {
    const handleResize = () => {
      setIsGradePanelOpen(window.innerWidth >= 1280)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const selectedGrade = useMemo(() => {
    if (!selectedGradeId || !config) return null
    for (const level of config.selectedLevels) {
      const grade = level.gradeLevels?.find((g) => g.id === selectedGradeId)
      if (grade) {
        const stream = selectedStreamId
          ? grade.streams?.find((s) => s.id === selectedStreamId)
          : null
        return {
          name: grade.name,
          displayName: formatGradeDisplayName(grade.name),
          levelName: level.name,
          streamName: stream?.name,
        }
      }
    }
    const fromSession = sessionGrades.find((g) => g.id === selectedGradeId)
    if (fromSession) {
      return {
        name: fromSession.name,
        displayName: formatGradeDisplayName(fromSession.name),
        levelName: 'Exam session',
        streamName: undefined,
      }
    }
    return null
  }, [selectedGradeId, selectedStreamId, config, sessionGrades])

  const handleGradeSelect = useCallback((gradeId: string, _levelId: string) => {
    setSelectedGradeId(gradeId)
    setSelectedStreamId('')
  }, [])

  const handleStreamSelect = useCallback(
    (streamId: string, gradeId: string, _levelId: string) => {
      setSelectedGradeId(gradeId)
      setSelectedStreamId(streamId)
    },
    [],
  )

  const handleSelectAllGrades = useCallback(() => {
    setSelectedGradeId(undefined)
    setSelectedStreamId('')
  }, [])

  const headerSubtitle = selectedGrade
    ? `${selectedGrade.displayName}${selectedGrade.streamName ? ` · ${selectedGrade.streamName}` : ''} · ${selectedGrade.levelName}`
    : session
      ? `${session.academicYear} · Term ${session.term} · ${session.type}`
      : 'Exam session'

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Loading exam session…
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">Exam session not found.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href={examsListPath(subdomain)}>Back to exams</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col bg-[#f8f9fb] dark:bg-slate-950">
      <div className="flex min-w-0 flex-1">
        <aside
          className={cn(
            'hidden shrink-0 flex-col border-r border-slate-200/80 bg-[#f5f6f8] dark:border-slate-800 dark:bg-slate-900 lg:flex',
            isGradePanelOpen ? 'w-56' : 'w-0 overflow-hidden border-r-0',
          )}
          aria-label="Grade navigation"
        >
          {isGradePanelOpen ? (
            <div className="sticky top-[2.75rem] flex max-h-[calc(100vh-5.5rem)] flex-col overflow-hidden px-2 py-2">
              <SchoolSearchFilter
                className="h-full"
                variant="minimal"
                type="grades"
                onGradeSelect={handleGradeSelect}
                onStreamSelect={handleStreamSelect}
                onSelectAllClasses={handleSelectAllGrades}
                isLoading={configLoading}
                selectedGradeId={selectedGradeId ?? ''}
                selectedStreamId={selectedStreamId}
                allClassesSelected={!selectedGradeId}
                allowedGradeIds={sessionGradeIds}
              />
            </div>
          ) : null}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-20 shrink-0 border-b border-slate-200/60 bg-[#f8f9fb]/90 px-3 py-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 sm:px-4">
            <div className="mx-auto flex max-w-6xl items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 shrink-0 p-0"
                asChild
              >
                <Link href={examsListPath(subdomain)}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>

              <div className="min-w-0 flex-1">
                <h1 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100 sm:text-[15px]">
                  {session.name}
                </h1>
                <p className="hidden truncate text-[11px] text-slate-400 sm:block">
                  {headerSubtitle}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {sessionGradeIds.length > 0 ? (
                  <Button
                    type="button"
                    variant={selectedGradeId ? 'secondary' : 'outline'}
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs lg:hidden"
                    onClick={() => setIsGradeSheetOpen(true)}
                  >
                    <Filter className="h-3.5 w-3.5" />
                    <span className="hidden min-[380px]:inline">
                      {selectedGradeId ? 'Grades' : 'Browse'}
                    </span>
                  </Button>
                ) : null}

                {sessionGradeIds.length > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="hidden h-7 px-2 text-xs lg:inline-flex"
                    onClick={() => setIsGradePanelOpen((open) => !open)}
                  >
                    {isGradePanelOpen ? 'Hide panel' : 'Grades'}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">
                      {session.academicYear} · Term {session.term} · {session.type}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{statusLabel(session.status)}</Badge>
                      <Badge variant="outline">
                        {publicationStateLabel(session.publicationState ?? 'HIDDEN')}
                      </Badge>
                      {session.resultsPublished ? (
                        <Badge className="bg-emerald-600">Results published</Badge>
                      ) : (
                        <Badge variant="secondary">Hidden from portal</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-700">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium -mb-px ${
                      tab === id
                        ? 'border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>

              {tab === 'overview' && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Scope
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600 space-y-2">
                      <p>
                        {session.gradesCount} grades · {session.subjectsCount} subjects
                        <br />
                        {session.papersCount} exam papers
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => setTab('papers')}
                      >
                        Manage papers
                      </Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Dates
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600">
                      {session.startDate
                        ? new Date(session.startDate).toLocaleDateString()
                        : 'Not set'}
                      {session.endDate && session.endDate !== session.startDate && (
                        <>
                          {' – '}
                          {new Date(session.endDate).toLocaleDateString()}
                        </>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        Marking
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600">
                      Max {session.defaultMaxScore ?? '—'} · Pass{' '}
                      {session.defaultPassMark ?? '—'}
                    </CardContent>
                  </Card>
                  {session.description && (
                    <Card className="sm:col-span-3">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Description</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-slate-600 whitespace-pre-wrap">
                        {session.description}
                      </CardContent>
                    </Card>
                  )}
                  {session.instructions && (
                    <Card className="sm:col-span-3">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Instructions</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-slate-600 whitespace-pre-wrap">
                        {session.instructions}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {tab === 'papers' && (
                <SessionPapersPanel
                  subdomain={subdomain}
                  sessionId={sessionId}
                  session={session}
                  gradeFilter={gradeFilter}
                />
              )}

              {tab === 'candidates' && (
                <SessionCandidatesPanel subdomain={subdomain} sessionId={sessionId} />
              )}

              {tab === 'timetable' && (
                <SessionTimetablePanel
                  subdomain={subdomain}
                  sessionId={sessionId}
                  session={session}
                  gradeFilter={gradeFilter}
                />
              )}

              {tab === 'attendance' && (
                <SessionAttendancePanel
                  subdomain={subdomain}
                  sessionId={sessionId}
                  session={session}
                />
              )}

              {tab === 'marks' && (
                <SessionMarksPanel subdomain={subdomain} sessionId={sessionId} />
              )}

              {tab === 'approvals' && (
                <SessionApprovalsPanel subdomain={subdomain} sessionId={sessionId} />
              )}

              {tab === 'processing' && (
                <SessionProcessingPanel subdomain={subdomain} sessionId={sessionId} />
              )}

              {tab === 'results' && (
                <SessionResultsPanel
                  subdomain={subdomain}
                  sessionId={sessionId}
                  session={session}
                  gradeFilter={gradeFilter}
                  onGradeFilterChange={(id) =>
                    setSelectedGradeId(id === 'all' ? undefined : id)
                  }
                />
              )}

              {tab === 'rankings' && (
                <SessionRankingsPanel
                  subdomain={subdomain}
                  sessionId={sessionId}
                  session={session}
                />
              )}

              {tab === 'analytics' && (
                <SessionAnalyticsPanel subdomain={subdomain} sessionId={sessionId} />
              )}

              {tab === 'report-cards' && (
                <SessionReportCardsPanel subdomain={subdomain} session={session} />
              )}

              {tab === 'settings' && (
                <SessionSettingsPanel subdomain={subdomain} session={session} />
              )}
            </div>
          </div>
        </div>
      </div>

      <DashboardGradeSheet
        open={isGradeSheetOpen}
        onOpenChange={setIsGradeSheetOpen}
        onGradeSelect={handleGradeSelect}
        onStreamSelect={handleStreamSelect}
        onSelectAllClasses={handleSelectAllGrades}
        selectedGradeId={selectedGradeId ?? ''}
        selectedStreamId={selectedStreamId}
        allClassesSelected={!selectedGradeId}
        allowedGradeIds={sessionGradeIds}
        isLoading={configLoading}
      />
    </div>
  )
}
