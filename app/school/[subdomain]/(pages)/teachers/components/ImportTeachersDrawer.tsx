"use client"

import React, { useMemo, useRef, useState } from "react"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  FileJson,
  FileSpreadsheet,
  Loader2,
  RotateCcw,
  Upload,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { requestInviteTeacher } from "@/lib/api/invite-teacher"
import { sanitizeApiUserMessage } from "@/lib/utils/api-user-messages"
import { downloadTextFile, rowsToCsv } from "@/lib/utils/import-file"
import {
  TEACHER_IMPORT_COLUMNS,
  buildTeacherInviteRequest,
  csvTeacherTemplate,
  jsonTeacherTemplate,
  parseTeacherFile,
  resolveTeacherRows,
  type ResolvedTeacherRow,
} from "@/lib/utils/teacher-import"

export type ImportTriggerVariant = "header" | "hero" | "toolbar"

type Step = "upload" | "preview" | "importing" | "done"

type ImportFailure = { index: number; name: string; reason: string }
type ImportResult = {
  added: number
  emailWarnings: number
  failures: ImportFailure[]
}

interface ImportTeachersDrawerProps {
  onImported: () => void
  defaultOpen?: boolean
  triggerVariant?: ImportTriggerVariant
}

const triggerStyles: Record<ImportTriggerVariant, string> = {
  header: "h-9 gap-2 px-3.5 text-xs",
  hero: "h-11 gap-2.5 px-6 text-sm",
  toolbar: "h-8 gap-1.5 px-3 text-xs",
}

export function ImportTeachersDrawer({
  onImported,
  defaultOpen = false,
  triggerVariant = "header",
}: ImportTeachersDrawerProps) {
  const queryClient = useQueryClient()

  const [open, setOpen] = useState(defaultOpen)
  const [step, setStep] = useState<Step>("upload")
  const [fileName, setFileName] = useState("")
  const [parseError, setParseError] = useState<string | null>(null)
  const [rows, setRows] = useState<ResolvedTeacherRow[]>([])
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [result, setResult] = useState<ImportResult | null>(null)
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const inputRef = useRef<HTMLInputElement>(null)

  const readyRows = useMemo(() => rows.filter((r) => r.errors.length === 0), [rows])
  const problemCount = rows.length - readyRows.length

  const reset = () => {
    setStep("upload")
    setFileName("")
    setParseError(null)
    setRows([])
    setProgress({ done: 0, total: 0 })
    setResult(null)
    setDepartmentFilter("all")
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleFile = async (file: File) => {
    setParseError(null)
    try {
      const raw = await parseTeacherFile(file)
      setFileName(file.name)
      setRows(resolveTeacherRows(raw))
      setStep("preview")
    } catch (err) {
      setParseError(
        err instanceof Error ? err.message : "We couldn't read that file.",
      )
    }
  }

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  const runImport = async () => {
    const toImport = readyRows
    if (toImport.length === 0) return
    setStep("importing")
    setProgress({ done: 0, total: toImport.length })

    let added = 0
    let emailWarnings = 0
    const failures: ImportFailure[] = []

    for (const row of toImport) {
      try {
        await requestInviteTeacher(buildTeacherInviteRequest(row))
        added += 1
      } catch (err) {
        if ((err as { code?: string }).code === "EMAIL_SEND_FAILED") {
          // Invitation was created; only the email failed. Count as added.
          added += 1
          emailWarnings += 1
        } else {
          failures.push({
            index: row.index,
            name: row.name,
            reason: sanitizeApiUserMessage(err, "Could not invite this teacher."),
          })
        }
      }
      setProgress((prev) => ({ ...prev, done: prev.done + 1 }))
    }

    setResult({ added, emailWarnings, failures })
    setStep("done")

    if (added > 0) {
      void queryClient.invalidateQueries({ queryKey: ["getTeachers"] })
      onImported()
      toast.success(
        added === 1 ? "1 teacher invited" : `${added} teachers invited`,
        {
          description: failures.length
            ? `${failures.length} couldn't be invited.`
            : emailWarnings > 0
              ? `${emailWarnings} invitation email(s) couldn't be sent — resend from the pending list.`
              : undefined,
        },
      )
    } else {
      toast.error("No teachers were invited", {
        description: "Check the problems listed and try again.",
      })
    }
  }

  const downloadFailures = () => {
    if (!result || result.failures.length === 0) return
    const csv = rowsToCsv(
      ["row", "name", "reason"],
      result.failures.map((f) => [f.index, f.name, f.reason]),
    )
    downloadTextFile("teachers-not-invited.csv", csv, "text/csv;charset=utf-8")
  }

  const availableDepartments = useMemo(() => {
    const seen = new Set<string>()
    for (const row of rows) seen.add(row.department)
    return [...seen].sort()
  }, [rows])

  const visibleRows = useMemo(
    () =>
      departmentFilter === "all"
        ? rows
        : rows.filter((r) => r.department === departmentFilter),
    [rows, departmentFilter],
  )

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DrawerTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-none border border-[#1a4d42]/20 bg-white font-medium text-[#0a1f1a] transition-colors hover:border-[#246a59]/50 hover:bg-[#246a59]/[0.04] hover:text-[#246a59] dark:border-white/15 dark:bg-[#0c1a17] dark:text-white/85",
            triggerStyles[triggerVariant],
          )}
        >
          <Upload className="h-3.5 w-3.5 shrink-0" />
          Import teachers
        </button>
      </DrawerTrigger>

      <DrawerContent
        className="ml-auto flex h-[100dvh] max-h-[100dvh] w-full flex-col border-l border-[#1a4d42]/12 bg-white dark:border-white/10 dark:bg-[#071411] sm:max-w-[560px]"
        data-vaul-drawer-direction="right"
      >
        <DrawerHeader className="shrink-0 border-b border-[#1a4d42]/12 px-5 py-4 dark:border-white/10">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DrawerTitle className="font-display text-left text-lg tracking-tight text-[#0a1f1a] dark:text-white">
                Import teachers
              </DrawerTitle>
              <DrawerDescription className="mt-0.5 text-left text-sm text-[#1a4d42]/55 dark:text-white/45">
                Invite many teachers at once from a spreadsheet or list
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center justify-center text-[#1a4d42]/40 hover:bg-[#f3f7f5] hover:text-[#0a1f1a] dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="relative flex-1 overflow-y-auto px-5 py-5">
          {step === "upload" ? (
            <UploadStep
              dragging={dragging}
              fileName={fileName}
              parseError={parseError}
              onPick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            />
          ) : null}

          {step === "preview" ? (
            <PreviewStep
              fileName={fileName}
              rows={visibleRows}
              totalRows={rows.length}
              readyCount={readyRows.length}
              problemCount={problemCount}
              departments={availableDepartments}
              departmentFilter={departmentFilter}
              onDepartmentFilterChange={setDepartmentFilter}
            />
          ) : null}

          {step === "importing" ? <ImportingStep progress={progress} /> : null}

          {step === "done" && result ? (
            <DoneStep result={result} onDownloadFailures={downloadFailures} />
          ) : null}

          <input
            ref={inputRef}
            type="file"
            accept=".csv,.tsv,.txt,.xlsx,.json,application/json,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleFile(file)
            }}
          />
        </div>

        {step !== "importing" ? (
          <DrawerFooter className="shrink-0 border-t border-[#1a4d42]/12 px-5 py-4 dark:border-white/10">
            {step === "upload" ? (
              <DrawerClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 rounded-none px-4 text-[#1a4d42]/70 hover:bg-[#f3f7f5] dark:text-white/55 dark:hover:bg-white/10"
                >
                  Cancel
                </Button>
              </DrawerClose>
            ) : null}

            {step === "preview" ? (
              <div className="flex w-full gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={reset}
                  className="h-10 rounded-none px-4 text-[#1a4d42]/70 hover:bg-[#f3f7f5] dark:text-white/55 dark:hover:bg-white/10"
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Choose another file
                </Button>
                <Button
                  type="button"
                  onClick={() => void runImport()}
                  disabled={readyRows.length === 0}
                  className="h-10 flex-1 gap-2 rounded-none bg-[#0a1f1a] text-white shadow-none hover:bg-[#246a59] disabled:opacity-50"
                >
                  Invite {readyRows.length} teacher{readyRows.length === 1 ? "" : "s"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : null}

            {step === "done" ? (
              <div className="flex w-full gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={reset}
                  className="h-10 rounded-none px-4 text-[#1a4d42]/70 hover:bg-[#f3f7f5] dark:text-white/55 dark:hover:bg-white/10"
                >
                  <RotateCcw className="mr-1.5 h-4 w-4" />
                  Import another
                </Button>
                <DrawerClose asChild>
                  <Button
                    type="button"
                    className="h-10 flex-1 rounded-none bg-[#0a1f1a] text-white shadow-none hover:bg-[#246a59]"
                  >
                    Done
                  </Button>
                </DrawerClose>
              </div>
            ) : null}
          </DrawerFooter>
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}

function UploadStep({
  dragging,
  fileName,
  parseError,
  onPick,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  dragging: boolean
  fileName: string
  parseError: string | null
  onPick: () => void
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
}) {
  return (
    <div className="space-y-5">
      <div className="border border-[#1a4d42]/12 bg-[#f8fbfa] p-4 dark:border-white/10 dark:bg-white/[0.03]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#246a59]">
          How to format the list
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-[#1a4d42]/65 dark:text-white/50">
          Use the headings below in the first row. Invitations go out by email, so{" "}
          <span className="font-semibold text-[#0a1f1a] dark:text-white">Name</span>,{" "}
          <span className="font-semibold text-[#0a1f1a] dark:text-white">Email</span>{" "}
          and{" "}
          <span className="font-semibold text-[#0a1f1a] dark:text-white">Phone</span>{" "}
          are required — Department and Gender are optional.
        </p>

        <div className="mt-3 overflow-hidden border border-[#1a4d42]/12 dark:border-white/10">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#f3f7f5] text-[10px] uppercase tracking-wide text-[#1a4d42]/55 dark:bg-white/5 dark:text-white/45">
                <th className="px-2.5 py-1.5 font-semibold">Column</th>
                <th className="px-2.5 py-1.5 font-semibold">Required</th>
                <th className="px-2.5 py-1.5 font-semibold">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a4d42]/10 dark:divide-white/10">
              {TEACHER_IMPORT_COLUMNS.map((col) => (
                <tr key={col.key}>
                  <td className="px-2.5 py-1.5 align-top">
                    <span className="font-mono font-medium text-[#0a1f1a] dark:text-white">
                      {col.key}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-[#1a4d42]/45 dark:text-white/35">
                      {col.help}
                    </span>
                  </td>
                  <td className="px-2.5 py-1.5 align-top">
                    {col.required ? (
                      <span className="font-semibold text-[#246a59]">Yes</span>
                    ) : (
                      <span className="text-[#1a4d42]/40 dark:text-white/35">Optional</span>
                    )}
                  </td>
                  <td className="px-2.5 py-1.5 align-top font-mono text-[10px] text-[#1a4d42]/60 dark:text-white/45">
                    {col.example}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              downloadTextFile(
                "teachers-template.csv",
                csvTeacherTemplate(),
                "text/csv;charset=utf-8",
              )
            }
            className="inline-flex items-center gap-1.5 border border-[#1a4d42]/15 bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#0a1f1a] transition-colors hover:border-[#246a59]/50 hover:text-[#246a59] dark:border-white/15 dark:bg-[#0c1a17] dark:text-white/85"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Spreadsheet template (CSV)
          </button>
          <button
            type="button"
            onClick={() =>
              downloadTextFile(
                "teachers-template.json",
                jsonTeacherTemplate(),
                "application/json",
              )
            }
            className="inline-flex items-center gap-1.5 border border-[#1a4d42]/15 bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#0a1f1a] transition-colors hover:border-[#246a59]/50 hover:text-[#246a59] dark:border-white/15 dark:bg-[#0c1a17] dark:text-white/85"
          >
            <FileJson className="h-3.5 w-3.5" />
            JSON template
          </button>
        </div>
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center border-2 border-dashed px-4 py-10 text-center transition-colors",
          dragging
            ? "border-[#246a59] bg-[#246a59]/[0.06]"
            : "border-[#1a4d42]/20 bg-[#f8fbfa] dark:border-white/15 dark:bg-white/[0.03]",
        )}
      >
        <div className="flex h-11 w-11 items-center justify-center border border-[#246a59]/25 bg-[#246a59]/8 text-[#246a59]">
          <Upload className="h-5 w-5" />
        </div>
        <p className="mt-3 text-sm font-medium text-[#0a1f1a] dark:text-white">
          Drop your file here
        </p>
        <p className="mt-1 text-xs text-[#1a4d42]/55 dark:text-white/45">
          CSV, Excel (.xlsx), TSV or JSON
        </p>
        <button
          type="button"
          onClick={onPick}
          className="mt-4 inline-flex items-center gap-1.5 rounded-none bg-[#0a1f1a] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#246a59]"
        >
          Choose a file
        </button>
        {fileName ? (
          <p className="mt-3 truncate max-w-full text-[11px] text-[#1a4d42]/50 dark:text-white/40">
            {fileName}
          </p>
        ) : null}
      </div>

      {parseError ? (
        <div className="flex items-start gap-2.5 border border-red-300/50 bg-red-50 p-3 text-xs text-red-800 dark:border-red-800/40 dark:bg-red-950/40 dark:text-red-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{parseError}</span>
        </div>
      ) : null}
    </div>
  )
}

function PreviewStep({
  fileName,
  rows,
  totalRows,
  readyCount,
  problemCount,
  departments,
  departmentFilter,
  onDepartmentFilterChange,
}: {
  fileName: string
  rows: ResolvedTeacherRow[]
  totalRows: number
  readyCount: number
  problemCount: number
  departments: string[]
  departmentFilter: string
  onDepartmentFilterChange: (value: string) => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 border border-emerald-600/25 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-700/40 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {readyCount} ready
        </span>
        {problemCount > 0 ? (
          <span className="inline-flex items-center gap-1.5 border border-amber-500/30 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 dark:border-amber-700/40 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertTriangle className="h-3.5 w-3.5" />
            {problemCount} to skip
          </span>
        ) : null}
        <span className="truncate text-[11px] text-[#1a4d42]/45 dark:text-white/35">
          {fileName}
        </span>
      </div>

      {problemCount > 0 ? (
        <p className="text-xs leading-relaxed text-[#1a4d42]/60 dark:text-white/45">
          Rows with problems are skipped — fix them in your file and import again,
          or continue and invite the {readyCount} ready{" "}
          {readyCount === 1 ? "teacher" : "teachers"} now.
        </p>
      ) : null}

      {departments.length > 1 ? (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#1a4d42]/60 dark:text-white/45">
            Department
          </span>
          <Select value={departmentFilter} onValueChange={onDepartmentFilterChange}>
            <SelectTrigger className="h-8 w-[200px] rounded-none border-[#1a4d42]/15 bg-white text-xs dark:border-white/15 dark:bg-[#0c1a17]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="max-h-[min(26rem,52vh)] overflow-auto border border-[#1a4d42]/12 dark:border-white/10">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 bg-[#f3f7f5] text-[10px] uppercase tracking-wide text-[#1a4d42]/55 dark:bg-[#0c1a17] dark:text-white/45">
            <tr>
              <th className="px-2.5 py-2 font-semibold">#</th>
              <th className="px-2.5 py-2 font-semibold">Name</th>
              <th className="px-2.5 py-2 font-semibold">Email</th>
              <th className="px-2.5 py-2 font-semibold">Department</th>
              <th className="px-2.5 py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a4d42]/10 dark:divide-white/10">
            {rows.map((row) => (
              <tr
                key={row.index}
                className={cn(
                  row.errors.length > 0
                    ? "bg-red-50/60 dark:bg-red-950/20"
                    : "bg-white dark:bg-[#071411]",
                )}
              >
                <td className="px-2.5 py-2 align-top tabular-nums text-[#1a4d42]/45 dark:text-white/35">
                  {row.index}
                </td>
                <td className="px-2.5 py-2 align-top font-medium text-[#0a1f1a] dark:text-white">
                  {row.name || <span className="text-red-600">—</span>}
                </td>
                <td className="px-2.5 py-2 align-top text-[#1a4d42]/70 dark:text-white/55">
                  {row.email || "—"}
                </td>
                <td className="px-2.5 py-2 align-top capitalize text-[#1a4d42]/70 dark:text-white/55">
                  {row.department}
                </td>
                <td className="px-2.5 py-2 align-top">
                  {row.errors.length > 0 ? (
                    <ul className="space-y-0.5 text-[11px] text-red-700 dark:text-red-300">
                      {row.errors.map((err) => (
                        <li key={err}>{err}</li>
                      ))}
                    </ul>
                  ) : row.warnings.length > 0 ? (
                    <ul className="space-y-0.5 text-[11px] text-amber-700 dark:text-amber-300/90">
                      {row.warnings.map((warn) => (
                        <li key={warn}>{warn}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" />
                      Ready
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-[#1a4d42]/45 dark:text-white/35">
        Showing {rows.length} of {totalRows} row{totalRows === 1 ? "" : "s"}.
      </p>
    </div>
  )
}

function ImportingStep({ progress }: { progress: { done: number; total: number } }) {
  const pct = progress.total === 0 ? 0 : Math.round((progress.done / progress.total) * 100)
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-[#246a59]" />
      <p className="mt-3 text-sm font-medium text-[#0a1f1a] dark:text-white">
        Inviting teachers…
      </p>
      <p className="mt-1 text-xs tabular-nums text-[#1a4d42]/55 dark:text-white/45">
        {progress.done} of {progress.total}
      </p>
      <div className="mt-4 h-1.5 w-52 overflow-hidden bg-[#1a4d42]/10 dark:bg-white/10">
        <div
          className="h-full bg-[#246a59] transition-all duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function DoneStep({
  result,
  onDownloadFailures,
}: {
  result: ImportResult
  onDownloadFailures: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 border border-emerald-600/25 bg-emerald-50/90 p-4 dark:border-emerald-700/40 dark:bg-emerald-950/40">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-emerald-600/30 bg-emerald-100 dark:bg-emerald-900/50">
          <CheckCircle2 className="h-5 w-5 text-emerald-700" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">
            {result.added === 0
              ? "No teachers were invited"
              : result.added === 1
                ? "1 teacher invited"
                : `${result.added} teachers invited`}
          </p>
          <p className="mt-1 text-sm text-emerald-800/85 dark:text-emerald-300/90">
            They&apos;ll each get an email to set up their account.
          </p>
        </div>
      </div>

      {result.emailWarnings > 0 ? (
        <div className="flex items-start gap-2.5 border border-amber-500/30 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700/40 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {result.emailWarnings} invitation email
            {result.emailWarnings === 1 ? "" : "s"} couldn&apos;t be sent. Use{" "}
            <span className="font-semibold">Resend</span> on the pending invitations
            list.
          </span>
        </div>
      ) : null}

      {result.failures.length > 0 ? (
        <div className="border border-amber-500/30 bg-amber-50 p-4 dark:border-amber-700/40 dark:bg-amber-950/30">
          <div className="flex items-center justify-between gap-2">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-900 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4" />
              {result.failures.length} couldn&apos;t be invited
            </p>
            <button
              type="button"
              onClick={onDownloadFailures}
              className="inline-flex items-center gap-1.5 border border-amber-600/30 bg-white px-2 py-1 text-[11px] font-medium text-amber-900 transition-colors hover:border-amber-600 dark:border-amber-700/40 dark:bg-transparent dark:text-amber-200"
            >
              <Download className="h-3 w-3" />
              Download
            </button>
          </div>
          <ul className="mt-2.5 max-h-48 space-y-1.5 overflow-y-auto text-xs text-amber-900/90 dark:text-amber-200/90">
            {result.failures.map((failure) => (
              <li key={`${failure.index}-${failure.name}`} className="flex gap-2">
                <span className="tabular-nums text-amber-700/70 dark:text-amber-300/60">
                  {failure.index}
                </span>
                <span className="font-medium">{failure.name}</span>
                <span className="text-amber-800/80 dark:text-amber-200/70">
                  {failure.reason}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
