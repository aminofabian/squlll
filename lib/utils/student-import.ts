import type { CreateStudentRequest } from "@/lib/api/create-student"
import { readImportMatrix, type ImportMatrix } from "./import-file"

export { downloadTextFile, rowsToCsv } from "./import-file"

export type ImportColumn =
  | "name"
  | "class"
  | "stream"
  | "admission_number"
  | "gender"
  | "phone"
  | "email"

export type RawImportRow = Partial<Record<ImportColumn, string>>

export type GradeOption = {
  id: string
  name: string
  shortName?: string | null
  streams: { id: string; name: string }[]
}

export type ResolvedRow = {
  /** 1-based data row number (excluding the header row). */
  index: number
  raw: RawImportRow
  name: string
  className: string
  streamName: string
  admissionNumber: string
  admissionGenerated: boolean
  gender: "male" | "female"
  phone: string
  email: string
  emailGenerated: boolean
  gradeId?: string
  gradeName?: string
  streamId?: string
  resolvedStreamName?: string
  errors: string[]
  warnings: string[]
}

export type ImportColumnMeta = {
  key: ImportColumn
  label: string
  required: boolean
  aliases: string[]
  example: string
  help: string
}

export const IMPORT_COLUMNS: ImportColumnMeta[] = [
  {
    key: "name",
    label: "Name",
    required: true,
    aliases: ["full_name", "student_name", "learner"],
    example: "Jane Wanjiku",
    help: "The learner's full name.",
  },
  {
    key: "class",
    label: "Class",
    required: true,
    aliases: ["grade", "grade_level", "level", "form"],
    example: "Grade 4",
    help: "Must match a class already set up for your school.",
  },
  {
    key: "stream",
    label: "Stream",
    required: false,
    aliases: ["section", "class_stream", "stream_name"],
    example: "A",
    help: "Only for classes split into streams (A, B, …).",
  },
  {
    key: "admission_number",
    label: "Admission number",
    required: false,
    aliases: ["admission", "adm_no", "reg_no", "roll_number"],
    example: "KPS/2026/001",
    help: "We generate one when left blank.",
  },
  {
    key: "gender",
    label: "Gender",
    required: false,
    aliases: ["sex"],
    example: "female",
    help: "Male or female. Defaults to male.",
  },
  {
    key: "phone",
    label: "Phone",
    required: false,
    aliases: ["mobile", "guardian_phone", "parent_phone", "contact"],
    example: "+254712345678",
    help: "Guardian's phone number.",
  },
  {
    key: "email",
    label: "Email",
    required: false,
    aliases: ["student_email", "portal_email", "email_address"],
    example: "jane@example.com",
    help: "Portal login. We generate one from the name when blank.",
  },
]

const ALIASES: Record<ImportColumn, string[]> = IMPORT_COLUMNS.reduce(
  (acc, col) => {
    acc[col.key] = [col.key, ...col.aliases]
    return acc
  },
  {} as Record<ImportColumn, string[]>,
)

export function emailFromName(name: string): string {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, "")
  return cleanName ? `${cleanName}@squl.ac.ke` : "studentname@squl.ac.ke"
}

function normalizeHeader(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
}

function columnFromHeader(header: string): ImportColumn | null {
  const normalized = normalizeHeader(header)
  for (const [column, aliases] of Object.entries(ALIASES) as [
    ImportColumn,
    string[],
  ][]) {
    if (aliases.includes(normalized)) return column
  }
  return null
}

function matrixToRows(matrix: ImportMatrix): RawImportRow[] {
  if (matrix.headers.length === 0) return []

  const columns = matrix.headers.map((header) => columnFromHeader(header))
  if (!columns.some(Boolean)) {
    throw new Error(
      "We couldn't find a Name column. The first row should be headings such as Name, Class, Stream.",
    )
  }

  const rows: RawImportRow[] = []
  for (const cells of matrix.rows) {
    const raw: RawImportRow = {}
    let hasValue = false
    for (let c = 0; c < columns.length; c += 1) {
      const column = columns[c]
      if (!column) continue
      const value = (cells[c] ?? "").trim()
      if (value) hasValue = true
      raw[column] = value
    }
    if (hasValue) rows.push(raw)
  }
  return rows
}

/**
 * Reads a CSV, TSV, JSON or XLSX file into normalised rows keyed by column.
 * Throws a friendly Error when the file can't be understood.
 */
export async function parseImportFile(file: File): Promise<RawImportRow[]> {
  const rows = matrixToRows(await readImportMatrix(file))
  if (rows.length === 0) {
    throw new Error(
      "No students found. Add a heading row (Name, Class …) then one row per learner.",
    )
  }
  return rows
}

function randomToken(length: number): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let out = ""
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return out
}

function norm(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim()
}

function parseGender(value: string): { value: "male" | "female"; ok: boolean } {
  const s = value.trim().toLowerCase()
  if (!s) return { value: "male", ok: true }
  if (["male", "m", "boy", "b", "1"].includes(s)) return { value: "male", ok: true }
  if (["female", "f", "girl", "g", "2"].includes(s)) return { value: "female", ok: true }
  return { value: "male", ok: false }
}

/**
 * Matches a typed class against the school's grades. Also understands a stream
 * glued to the class, e.g. "Grade 4A" or "Grade 4 A".
 */
function resolveGrade(
  rawClass: string,
  grades: GradeOption[],
): { grade?: GradeOption; stream?: { id: string; name: string } } {
  const target = norm(rawClass)
  if (!target) return {}

  for (const grade of grades) {
    if (norm(grade.name) === target) return { grade }
    if (grade.shortName && norm(grade.shortName) === target) return { grade }
  }

  const byLength = [...grades].sort((a, b) => norm(b.name).length - norm(a.name).length)
  for (const grade of byLength) {
    const gradeName = norm(grade.name)
    if (!target.startsWith(gradeName)) continue
    const rest = target.slice(gradeName.length).trim()
    if (!rest) continue
    const stream = grade.streams.find((s) => norm(s.name) === rest)
    if (stream) return { grade, stream }
  }

  return {}
}

export function resolveImportRows(
  rawRows: RawImportRow[],
  grades: GradeOption[],
): ResolvedRow[] {
  return rawRows.map((raw, i) => {
    const errors: string[] = []
    const warnings: string[] = []

    const name = (raw.name ?? "").trim()
    const className = (raw.class ?? "").trim()
    if (!name) errors.push("Name is required.")
    if (!className) errors.push("Class is required.")

    // Admission number is optional — generate a short, editable placeholder.
    let admissionNumber = (raw.admission_number ?? "").trim()
    const admissionGenerated = !admissionNumber
    if (admissionGenerated) {
      admissionNumber = `AUTO-${randomToken(6)}`
      warnings.push("Admission number auto-generated.")
    }

    const genderParse = parseGender(raw.gender ?? "")
    if (!genderParse.ok) warnings.push("Gender not recognised — set to male.")

    let email = (raw.email ?? "").trim().toLowerCase()
    const emailGenerated = !email
    if (emailGenerated) {
      email = emailFromName(name)
      warnings.push("Portal email auto-generated.")
    }

    const phone = (raw.phone ?? "").trim()
    if (!phone) warnings.push("No phone number — left blank.")

    const row: ResolvedRow = {
      index: i + 1,
      raw,
      name,
      className,
      streamName: (raw.stream ?? "").trim(),
      admissionNumber,
      admissionGenerated,
      gender: genderParse.value,
      phone,
      email,
      emailGenerated,
      errors,
      warnings,
    }

    if (className && grades.length > 0) {
      const { grade, stream } = resolveGrade(className, grades)
      if (!grade) {
        const available = grades.map((g) => g.name).slice(0, 6).join(", ")
        errors.push(`Class "${className}" isn't set up. Try: ${available}.`)
      } else {
        row.gradeId = grade.id
        row.gradeName = grade.name

        if (stream) {
          // Stream was part of the class cell, e.g. "Grade 4A".
          row.streamId = stream.id
          row.resolvedStreamName = stream.name
        } else if (row.streamName) {
          const match = grade.streams.find(
            (s) => norm(s.name) === norm(row.streamName),
          )
          if (match) {
            row.streamId = match.id
            row.resolvedStreamName = match.name
          } else if (grade.streams.length === 0) {
            warnings.push("This class has no streams — the stream was ignored.")
          } else {
            errors.push(
              `Stream "${row.streamName}" isn't in ${grade.name} (${grade.streams
                .map((s) => s.name)
                .join(", ")}).`,
            )
          }
        } else if (grade.streams.length === 1) {
          row.streamId = grade.streams[0].id
          row.resolvedStreamName = grade.streams[0].name
        } else if (grade.streams.length > 1) {
          errors.push(
            `Choose a stream for ${grade.name} (${grade.streams
              .map((s) => s.name)
              .join(", ")}).`,
          )
        }
      }
    } else if (className && grades.length === 0) {
      errors.push("No classes are set up yet. Add classes first, then import.")
    }

    return row
  })
}

export function buildCreateRequestFromRow(
  row: ResolvedRow,
): CreateStudentRequest {
  return {
    name: row.name,
    admission_number: row.admissionNumber,
    gender: row.gender,
    grade: row.gradeId as string,
    stream: row.streamId,
    phone: row.phone || "N/A",
    student_email: row.email,
  }
}

export function csvTemplate(): string {
  const header = IMPORT_COLUMNS.map((c) => c.key).join(",")
  const rows = [
    "Jane Wanjiku,Grade 4,A,,female,+254712345678,",
    "Brian Otieno,Grade 4,B,KPS/2026/001,male,+254701234567,brian@example.com",
    "Amina Yusuf,Grade 5,,,female,,",
  ]
  return [header, ...rows].join("\n")
}

export function jsonTemplate(): string {
  return JSON.stringify(
    [
      {
        name: "Jane Wanjiku",
        class: "Grade 4",
        stream: "A",
        gender: "female",
        phone: "+254712345678",
      },
      {
        name: "Brian Otieno",
        class: "Grade 4",
        stream: "B",
        admission_number: "KPS/2026/001",
        gender: "male",
        phone: "+254701234567",
        email: "brian@example.com",
      },
    ],
    null,
    2,
  )
}
