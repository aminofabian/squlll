'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Calendar, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  publishExamSessionResults,
  publicationStateLabel,
  scheduleExamSessionPublication,
  unpublishExamSessionResults,
  updateExamSessionSettings,
  type ExamSessionRecord,
} from '@/lib/exams/examSessions'
import { seedCurriculumGradingSchemes } from '@/lib/exams/gradingScales'

interface SessionSettingsPanelProps {
  subdomain: string
  session: ExamSessionRecord
}

export function SessionSettingsPanel({
  subdomain,
  session,
}: SessionSettingsPanelProps) {
  const queryClient = useQueryClient()
  const [releaseAt, setReleaseAt] = useState('')
  const [parentVisibility, setParentVisibility] = useState(session.parentVisibility ?? true)
  const [studentVisibility, setStudentVisibility] = useState(
    session.studentVisibility ?? true,
  )
  const [publishing, setPublishing] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [seedingSchemes, setSeedingSchemes] = useState(false)
  const [rankingEnabled, setRankingEnabled] = useState(session.rankingEnabled ?? true)
  const [hidePositionsFromParents, setHidePositionsFromParents] = useState(
    session.hidePositionsFromParents ?? false,
  )
  const [savingSettings, setSavingSettings] = useState(false)

  const invalidateSession = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['examSession', subdomain, session.id],
    })
    await queryClient.invalidateQueries({
      queryKey: ['examSessions', subdomain],
    })
  }

  const handlePublishNow = async () => {
    setPublishing(true)
    try {
      if (session.resultsPublished) {
        await unpublishExamSessionResults(subdomain, session.id)
        toast.success('Results hidden from portal')
      } else {
        await publishExamSessionResults(subdomain, session.id)
        toast.success('Results published to portal')
      }
      await invalidateSession()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update publication')
    } finally {
      setPublishing(false)
    }
  }

  const handleSchedule = async () => {
    if (!releaseAt) {
      toast.error('Select a release date and time')
      return
    }
    setScheduling(true)
    try {
      await scheduleExamSessionPublication(subdomain, {
        sessionId: session.id,
        releaseAt: new Date(releaseAt).toISOString(),
        parentVisibility,
        studentVisibility,
      })
      toast.success('Results release scheduled')
      await invalidateSession()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to schedule release')
    } finally {
      setScheduling(false)
    }
  }

  const handleSaveGovernance = async () => {
    setSavingSettings(true)
    try {
      await updateExamSessionSettings(subdomain, {
        sessionId: session.id,
        rankingEnabled,
        hidePositionsFromParents,
        parentVisibility,
        studentVisibility,
      })
      toast.success('Session settings saved')
      await invalidateSession()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleSeedSchemes = async () => {
    setSeedingSchemes(true)
    try {
      const scales = await seedCurriculumGradingSchemes(subdomain)
      toast.success(`Loaded ${scales.length} grading schemes (KCSE, CBC, IGCSE, A-Level)`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to seed schemes')
    } finally {
      setSeedingSchemes(false)
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Grading schemes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-3">
            Seed Kenyan KCSE, CBC, IGCSE, and A-Level scales for this school.
          </p>
          <Button variant="outline" onClick={handleSeedSchemes} disabled={seedingSchemes}>
            {seedingSchemes && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Seed curriculum schemes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Governance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="rankingEnabled">Enable rankings</Label>
            <Switch
              id="rankingEnabled"
              checked={rankingEnabled}
              onCheckedChange={setRankingEnabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="hidePositionsFromParents">Hide positions from parents</Label>
            <Switch
              id="hidePositionsFromParents"
              checked={hidePositionsFromParents}
              onCheckedChange={setHidePositionsFromParents}
            />
          </div>
          <Button variant="outline" onClick={handleSaveGovernance} disabled={savingSettings}>
            {savingSettings && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save governance settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Publication status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {publicationStateLabel(session.publicationState ?? 'HIDDEN')}
            </Badge>
            {session.releaseAt && (
              <span className="text-sm text-slate-500">
                Release: {new Date(session.releaseAt).toLocaleString()}
              </span>
            )}
            {session.publishDate && session.resultsPublished && (
              <span className="text-sm text-slate-500">
                Published: {new Date(session.publishDate).toLocaleString()}
              </span>
            )}
          </div>
          <Button onClick={handlePublishNow} disabled={publishing}>
            {publishing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {session.resultsPublished ? 'Unpublish results' : 'Publish results now'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule release
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="releaseAt">Release date & time</Label>
            <Input
              id="releaseAt"
              type="datetime-local"
              value={releaseAt}
              onChange={(e) => setReleaseAt(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {studentVisibility ? (
                <Eye className="h-4 w-4 text-slate-500" />
              ) : (
                <EyeOff className="h-4 w-4 text-slate-500" />
              )}
              <Label htmlFor="studentVisibility">Visible to students</Label>
            </div>
            <Switch
              id="studentVisibility"
              checked={studentVisibility}
              onCheckedChange={setStudentVisibility}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {parentVisibility ? (
                <Eye className="h-4 w-4 text-slate-500" />
              ) : (
                <EyeOff className="h-4 w-4 text-slate-500" />
              )}
              <Label htmlFor="parentVisibility">Visible to parents</Label>
            </div>
            <Switch
              id="parentVisibility"
              checked={parentVisibility}
              onCheckedChange={setParentVisibility}
            />
          </div>
          <Button variant="outline" onClick={handleSchedule} disabled={scheduling}>
            {scheduling && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Schedule release
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
