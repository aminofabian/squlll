"use client"

import { useState } from "react"
import {
  Download,
  Search,
  Filter,
  BookOpen,
  User,
  Star,
  ChevronDown,
  ChevronUp,
  SortAsc,
  SortDesc,
  Grid,
  List,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileSpreadsheet,
  FileText as FilePdf,
  FileText as FileWord,
  Presentation as FilePowerpoint,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { EmptyState, PageHeader, Section, StateMessage } from "../_ui"
import { useStudentNotes } from "@/lib/student/useStudentNotes"
import type { StudentNoteItem, StudentNoteFileType } from "@/lib/student/types"

interface DownloadNotesComponentProps {
  subdomain: string
  onBack: () => void
}

export default function DownloadNotesComponent({
  subdomain,
  onBack,
}: DownloadNotesComponentProps) {
  const {
    notes: fetchedNotes,
    subjects,
    loading,
    error,
    refetch,
  } = useStudentNotes(subdomain)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("All Subjects")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  const notes = fetchedNotes.map((note) => ({
    ...note,
    isFavorite: favoriteIds.has(note.id),
  }))

  const getFileIcon = (fileType: StudentNoteFileType) => {
    const iconClass = "h-[18px] w-[18px]"
    switch (fileType) {
      case "pdf":
        return <FilePdf className={iconClass} />
      case "docx":
        return <FileWord className={iconClass} />
      case "pptx":
        return <FilePowerpoint className={iconClass} />
      case "xlsx":
        return <FileSpreadsheet className={iconClass} />
      case "jpg":
      case "png":
        return <FileImage className={iconClass} />
      case "mp4":
        return <FileVideo className={iconClass} />
      case "mp3":
        return <FileAudio className={iconClass} />
      case "zip":
        return <FileArchive className={iconClass} />
      default:
        return <File className={iconClass} />
    }
  }

  const handleDownload = (note: StudentNoteItem) => {
    if (note.links.length > 0) {
      window.open(note.links[0], "_blank", "noopener,noreferrer")
      return
    }
    alert(note.description.slice(0, 2000))
  }

  const handleToggleFavorite = (noteId: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (next.has(noteId)) next.delete(noteId)
      else next.add(noteId)
      return next
    })
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleSubjectFilter = (subject: string) => {
    setSelectedSubject(subject)
  }

  const handleSort = (sortField: string) => {
    if (sortBy === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(sortField)
      setSortOrder("desc")
    }
  }

  // Filter and sort notes. Derived during render (never in an effect): `notes`
  // is rebuilt every render, so an effect keyed on it would loop forever.
  let filteredNotes = notes

  if (searchTerm) {
    filteredNotes = filteredNotes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    )
  }

  if (selectedSubject !== "All Subjects") {
    filteredNotes = filteredNotes.filter(
      (note) => note.subject === selectedSubject,
    )
  }

  if (favoritesOnly) {
    filteredNotes = filteredNotes.filter((note) => note.isFavorite)
  }

  filteredNotes = [...filteredNotes].sort((a, b) => {
    const dir = sortOrder === "asc" ? 1 : -1

    switch (sortBy) {
      case "title":
        return a.title.toLowerCase().localeCompare(b.title.toLowerCase()) * dir
      case "subject":
        return (
          a.subject.toLowerCase().localeCompare(b.subject.toLowerCase()) * dir
        )
      case "downloads":
        return (a.downloadCount - b.downloadCount) * dir
      case "size":
        return (parseFloat(a.fileSize) - parseFloat(b.fileSize)) * dir
      case "date":
      default:
        return (
          (new Date(a.uploadDate).getTime() -
            new Date(b.uploadDate).getTime()) *
          dir
        )
    }
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Download Notes"
          subtitle="Access and download your course materials"
          onBack={onBack}
        />
        <Section>
          <StateMessage variant="loading" title="Loading notes…" />
        </Section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Download Notes"
          subtitle="Access and download your course materials"
          onBack={onBack}
        />
        <Section>
          <StateMessage
            variant="error"
            description={error}
            onRetry={() => void refetch()}
          />
        </Section>
      </div>
    )
  }

  const renderGridItem = (note: StudentNoteItem) => (
    <Card key={note.id} className="group transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {getFileIcon(note.fileType)}
            </span>
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                {note.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{note.subject}</p>
            </div>
          </div>
          <button
            onClick={() => handleToggleFavorite(note.id)}
            aria-label={note.isFavorite ? "Remove from favorites" : "Add to favorites"}
            className={cn(
              "rounded-full p-1 transition-colors",
              note.isFavorite
                ? "text-amber-500 hover:text-amber-600"
                : "text-muted-foreground hover:text-amber-500",
            )}
          >
            <Star
              className="h-4 w-4"
              fill={note.isFavorite ? "currentColor" : "none"}
            />
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
          {note.description}
        </p>

        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{note.fileSize}</span>
          <span>{note.downloadCount} downloads</span>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{note.grade}</Badge>
          {note.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span className="truncate">{note.teacher}</span>
          </div>
          <Button size="sm" onClick={() => handleDownload(note)}>
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderListItem = (note: StudentNoteItem) => (
    <Card key={note.id} className="group transition-shadow hover:shadow-md">
      <CardContent className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {getFileIcon(note.fileType)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
              {note.title}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {note.subject} · {note.teacher}
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-4 text-xs text-muted-foreground md:flex">
          <span>{note.fileSize}</span>
          <span>{note.downloadCount} downloads</span>
          <span>{note.uploadDate}</span>
        </div>

        <div className="hidden shrink-0 md:block">
          <Badge variant="secondary">{note.grade}</Badge>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => handleToggleFavorite(note.id)}
            aria-label={note.isFavorite ? "Remove from favorites" : "Add to favorites"}
            className={cn(
              "rounded-full p-1 transition-colors",
              note.isFavorite
                ? "text-amber-500 hover:text-amber-600"
                : "text-muted-foreground hover:text-amber-500",
            )}
          >
            <Star
              className="h-4 w-4"
              fill={note.isFavorite ? "currentColor" : "none"}
            />
          </button>
          <Button size="sm" onClick={() => handleDownload(note)}>
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Download Notes"
        subtitle="Access and download your course materials"
        onBack={onBack}
        actions={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <BookOpen className="h-4 w-4 text-primary" />
            {filteredNotes.length} notes
          </span>
        }
      />

      <Section title="Search & filters" icon={Filter}>
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notes by title, subject, or tags…"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                Filters
                {showFilters ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              <Select value={selectedSubject} onValueChange={handleSubjectFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  aria-label="Grid view"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  aria-label="List view"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <label
                  htmlFor="favoritesOnly"
                  className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                >
                  <Checkbox
                    id="favoritesOnly"
                    checked={favoritesOnly}
                    onCheckedChange={(value) => setFavoritesOnly(value === true)}
                  />
                  Favorites only
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">Sort by</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSort("date")}
                  >
                    Date
                    {sortBy === "date" &&
                      (sortOrder === "asc" ? (
                        <SortAsc className="h-3.5 w-3.5" />
                      ) : (
                        <SortDesc className="h-3.5 w-3.5" />
                      ))}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSort("downloads")}
                  >
                    Downloads
                    {sortBy === "downloads" &&
                      (sortOrder === "asc" ? (
                        <SortAsc className="h-3.5 w-3.5" />
                      ) : (
                        <SortDesc className="h-3.5 w-3.5" />
                      ))}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Section>

      {filteredNotes.length === 0 ? (
        <Section>
          <EmptyState
            icon={BookOpen}
            title="No notes found"
            description="Try adjusting your search criteria or filters."
          />
        </Section>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-3"
          }
        >
          {filteredNotes.map((note) =>
            viewMode === "grid" ? renderGridItem(note) : renderListItem(note),
          )}
        </div>
      )}
    </div>
  )
}
