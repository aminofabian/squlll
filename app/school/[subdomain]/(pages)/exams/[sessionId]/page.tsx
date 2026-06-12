'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
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
} from 'lucide-react'
import { useExamSession } from '@/lib/hooks/useExamSessions'
import { getSessionGrades } from '@/lib/exams/examSessions'
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
import { ExamSessionTabNav } from '../components/ExamSessionTabNav'
import { ExamSessionOverview } from '../components/ExamSessionOverview'
import {
  ExamSessionHero,
  ExamSessionLoadingState,
} from '../components/ExamSessionHero'
import {
  examCreativeSurfaceClass,
  examPageShellClass,
  examPanelBodyClass,
  examSessionMicroScopeClass,
} from '../components/exam-session-ui'

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
      <div className={examPageShellClass}>
        <ExamSessionLoadingState />
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className={cn(examPageShellClass, 'items-center justify-center')}>
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 p-8">
          <p className="text-slate-600 dark:text-slate-400">Exam session not found.</p>
          <Button variant="outline" className="rounded-xl" asChild>
            <Link href={examsListPath(subdomain)}>Back to exams</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(examPageShellClass, examSessionMicroScopeClass)}>
      {/* Ambient dot grid */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35] dark:opacity-[0.12]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(36,106,89,0.35) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden
      />

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
          <ExamSessionHero
            subdomain={subdomain}
            session={session}
            subtitle={headerSubtitle}
            selectedGradeLabel={selectedGrade?.displayName}
            showGradeControls={sessionGradeIds.length > 0}
            showMobileGradeButton={sessionGradeIds.length > 0}
            gradePanelOpen={isGradePanelOpen}
            onOpenGrades={() => setIsGradeSheetOpen(true)}
            onToggleGradePanel={() => setIsGradePanelOpen((open) => !open)}
          />

          <div className="flex-1 pb-8 sm:pb-10">
            <div className="mx-auto max-w-6xl px-3 sm:px-6">
              <div className={examCreativeSurfaceClass}>
                <ExamSessionTabNav
                  tabs={TABS}
                  activeTab={tab}
                  onTabChange={(id) => setTab(id as Tab)}
                />

                <div className={examPanelBodyClass}>
              {tab === 'overview' && (
                <ExamSessionOverview
                  session={session}
                  onNavigate={(next) => setTab(next)}
                />
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
                <SessionMarksPanel
                  subdomain={subdomain}
                  sessionId={sessionId}
                  session={session}
                  gradeFilter={gradeFilter}
                />
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
