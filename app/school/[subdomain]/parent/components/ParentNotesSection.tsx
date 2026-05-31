'use client'

import { BookOpen, ExternalLink, FileText, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useParentChildNotes } from '@/lib/parent/useParentChildNotes'
import type { ParentPortalChild } from '@/lib/parent/types'

interface ParentNotesSectionProps {
  subdomain: string
  child?: ParentPortalChild
}

export function ParentNotesSection({ subdomain, child }: ParentNotesSectionProps) {
  const studentId = child?.studentId ?? null
  const gradeId = child?.gradeId ?? null
  const isDemo = !studentId || studentId.startsWith('demo-')
  const { notes, loading, error, refetch } = useParentChildNotes(
    subdomain,
    isDemo ? null : studentId,
    isDemo ? null : gradeId,
  )

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary via-primary to-primary/80 p-6 text-white shadow-2xl md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black md:text-4xl">Study Notes</h1>
            <p className="text-sm text-white/90 md:text-base">
              {child ? `${child.name} — teacher-published resources` : 'Notes'}
            </p>
          </div>
          {!isDemo ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void refetch()}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          ) : null}
        </div>
      </div>

      {isDemo ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Link a child to your parent account to see study notes.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="rounded-2xl border-2 border-primary/20 bg-white shadow-xl">
        <div className="border-b-2 border-primary/20 p-4 md:p-6">
          <h2 className="flex items-center gap-2 text-lg font-black text-primary md:text-xl">
            <BookOpen className="h-5 w-5" />
            Available Notes ({notes.length})
          </h2>
        </div>
        <div className="space-y-3 p-4 md:p-6">
          {loading && notes.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading notes…</p>
          ) : null}
          {!loading && !isDemo && notes.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No study notes published yet.
            </p>
          ) : null}
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border-2 border-primary/20 p-4 hover:bg-primary/5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-black text-slate-800">{note.title}</p>
                  <p className="text-sm text-slate-600">
                    {note.subject} · {note.teacher}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-700">
                    {note.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              {note.links.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {note.links.map((url, index) => (
                    <a
                      key={`${note.id}-${index}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      Resource {index + 1}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              ) : null}
              <p className="mt-2 text-xs text-slate-500">
                Published {note.uploadDate}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
