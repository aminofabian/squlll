import type { InviteTeacherRequest } from "@/lib/api/invite-teacher"
import { readImportMatrix, type ImportMatrix } from "./import-file"

export type TeacherImportColumn =
  | "name"
  | "email"
  | "phone"
  | "department"
  | "gender"

export type RawTeacherRow = Partial<Record<TeacherImportColumn, string>>

export type ResolvedTeacherRow = {
  index: number
  raw: RawTeacherRow
  name: string
  email: string
  phone: string
  department: string
  departmentDefaulted: boolean
  gender: "MALE" | "FEMALE"
  errors: string[]
  warnings: string[]
}

export type TeacherColumnMeta = {
  key: TeacherImportColumn
  label: string
  required: boolean
  aliases: string[]
  example: string
  help: string
}

export const TEACHER_IMPORT_COLUMNS: TeacherColumnMeta[] = [
  {
    key: "name",
    label: "Name",
    required: true,
    aliases: ["full_name", "teacher_name", "staff_name", "teacher"],
    example: "Grace Mwangi",
    help: "The teacher's full name.",
  },
  {
    key: "email",
    label: "Email",
    required: true,
    aliases: ["e_mail", "email_address", "work_email"],
    example: "grace@example.com",
    help: "Where we send the invitation to set up their account.",
  },
  {
    key: "phone",
    label: "Phone",
    required: true,
    aliases: ["phone_number", "mobile", "mobile_number", "contact", "tel"],
    example: "+254712345678",
    help: "International format, starting with +.",
  },
  {
    key: "department",
    label: "Department",
    required: false,
    aliases: ["dept", "section", "subject_department"],
    example: "Mathematics",
    help: "Defaults to General when left blank.",
  },
  {
    key: "gender",
    label: "Gender",
    required: false,
    aliases: ["sex"],
    example: "female",
    help: "Male or female. Defaults to male.",
  },
]

const ALIASES: Record<TeacherImportColumn, string[]> =
  TEACHER_IMPORT_COLUMNS.reduce(
    (acc, col) => {
      acc[col.key] = [col.key, ...col.aliases]
      return acc
    },
    {} as Record<TeacherImportColumn, string[]>,
  )

export const DEFAULT_TEACHER_DEPARTMENT = "general"

function normalizeHeader(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
}

function columnFromHeader(header: string): TeacherImportColumn | null {
  const normalized = normalizeHeader(header)
  for (const [column, aliases] of Object.entries(ALIASES) as [
    TeacherImportColumn,
    string[],
  ][]) {
    if (aliases.includes(normalized)) return column
  }
  return null
}

function matrixToRows(matrix: ImportMatrix): RawTeacherRow[] {
  if (matrix.headers.length === 0) return []

  const columns = matrix.headers.map((header) => columnFromHeader(header))
  if (!columns.some(Boolean)) {
    throw new Error(
      "We couldn't find a Name column. The first row should be headings such as Name, Email, Phone.",
    )
  }

  const rows: RawTeacherRow[] = []
  for (const cells of matrix.rows) {
    const raw: RawTeacherRow = {}
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

export async function parseTeacherFile(file: File): Promise<RawTeacherRow[]> {
  const rows = matrixToRows(await readImportMatrix(file))
  if (rows.length === 0) {
    throw new Error(
      "No teachers found. Add a heading row (Name, Email, Phone …) then one row per teacher.",
    )
  }
  return rows
}

export function splitFullName(fullName: string): {
  firstName: string
  lastName: string
  fullName: string
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return { firstName: "", lastName: "", fullName: "" }
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: parts[0], fullName: parts[0] }
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
    fullName: parts.join(" "),
  }
}

function parseGender(value: string): { value: "MALE" | "FEMALE"; ok: boolean } {
  const s = value.trim().toLowerCase()
  if (!s) return { value: "MALE", ok: true }
  if (["male", "m", "boy", "b", "1"].includes(s)) return { value: "MALE", ok: true }
  if (["female", "f", "girl", "g", "2"].includes(s)) return { value: "FEMALE", ok: true }
  return { value: "MALE", ok: false }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+[0-9]{10,15}$/

export function resolveTeacherRows(rawRows: RawTeacherRow[]): ResolvedTeacherRow[] {
  return rawRows.map((raw, i) => {
    const errors: string[] = []
    const warnings: string[] = []

    const name = (raw.name ?? "").trim()
    if (!name) errors.push("Name is required.")
    else if (name.length < 2) errors.push("Name looks too short.")

    const email = (raw.email ?? "").trim().toLowerCase()
    if (!email) errors.push("Email is required.")
    else if (!EMAIL_RE.test(email)) errors.push(`Email "${email}" doesn't look right.`)

    const phone = (raw.phone ?? "").trim()
    if (!phone) errors.push("Phone is required.")
    else if (!PHONE_RE.test(phone)) {
      errors.push(`Phone "${phone}" should be like +254712345678.`)
    }

    let department = (raw.department ?? "").trim().toLowerCase()
    const departmentDefaulted = !department
    if (departmentDefaulted) {
      department = DEFAULT_TEACHER_DEPARTMENT
      warnings.push("Department defaulted to General.")
    }

    const genderParse = parseGender(raw.gender ?? "")
    if (!genderParse.ok) warnings.push("Gender not recognised — set to male.")

    return {
      index: i + 1,
      raw,
      name,
      email,
      phone,
      department,
      departmentDefaulted,
      gender: genderParse.value,
      errors,
      warnings,
    }
  })
}

export function buildTeacherInviteRequest(
  row: ResolvedTeacherRow,
): InviteTeacherRequest {
  const { firstName, lastName, fullName } = splitFullName(row.name)
  return {
    email: row.email,
    fullName: fullName || row.name,
    firstName,
    lastName,
    gender: row.gender,
    department: row.department,
    phoneNumber: row.phone,
  }
}

export function csvTeacherTemplate(): string {
  const header = TEACHER_IMPORT_COLUMNS.map((c) => c.key).join(",")
  const rows = [
    "Grace Mwangi,grace@example.com,+254712345678,Mathematics,female",
    "Peter Kamau,peter@example.com,+254701234567,,male",
  ]
  return [header, ...rows].join("\n")
}

export function jsonTeacherTemplate(): string {
  return JSON.stringify(
    [
      {
        name: "Grace Mwangi",
        email: "grace@example.com",
        phone: "+254712345678",
        department: "Mathematics",
        gender: "female",
      },
      {
        name: "Peter Kamau",
        email: "peter@example.com",
        phone: "+254701234567",
      },
    ],
    null,
    2,
  )
}
