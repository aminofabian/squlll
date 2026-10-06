/**
 * Shared helpers for reading tabular uploads (CSV, TSV, JSON, Excel) into a
 * header + rows shape. Domain modules map the headers to their own columns.
 */

export type ImportMatrix = {
  headers: string[]
  rows: string[][]
}

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
}

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : value.toISOString().slice(0, 10)
  }
  return String(value).trim()
}

function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ""
  const candidates = [",", ";", "\t"]
  let best = ","
  let bestCount = -1
  for (const candidate of candidates) {
    const count = firstLine.split(candidate).length - 1
    if (count > bestCount) {
      best = candidate
      bestCount = count
    }
  }
  return best
}

/** Minimal RFC-4180-ish parser that handles quoted fields and CRLF. */
function parseDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === delimiter) {
      row.push(field)
      field = ""
    } else if (char === "\n") {
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else if (char === "\r") {
      if (text[i + 1] !== "\n") {
        row.push(field)
        rows.push(row)
        row = []
        field = ""
      }
    } else {
      field += char
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter((r) => r.some((c) => c.trim() !== ""))
}

function jsonToMatrix(parsed: unknown): string[][] {
  let items: unknown[]
  if (Array.isArray(parsed)) {
    items = parsed
  } else if (parsed && typeof parsed === "object") {
    const container = parsed as Record<string, unknown>
    const key = ["students", "teachers", "data", "rows", "list"].find((k) =>
      Array.isArray(container[k]),
    )
    if (!key) {
      throw new Error(
        "We expected a JSON array, e.g. [{ \"name\": \"Jane\", \"class\": \"Grade 4\" }].",
      )
    }
    items = container[key] as unknown[]
  } else {
    throw new Error("That JSON file couldn't be read. Please check it and try again.")
  }

  const headers: string[] = []
  const seen = new Set<string>()
  for (const item of items) {
    if (!item || typeof item !== "object") continue
    for (const key of Object.keys(item as Record<string, unknown>)) {
      if (!seen.has(key)) {
        seen.add(key)
        headers.push(key)
      }
    }
  }
  if (headers.length === 0) {
    throw new Error("No rows found in that JSON file.")
  }

  const rows = items
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => headers.map((header) => cellToString(item[header])))

  return [headers, ...rows]
}

async function readRawMatrix(file: File): Promise<string[][]> {
  const name = file.name.toLowerCase()
  const extension = name.includes(".") ? name.split(".").pop() ?? "" : ""

  if (extension === "json" || file.type === "application/json") {
    let parsed: unknown
    try {
      parsed = JSON.parse(stripBom(await file.text()))
    } catch {
      throw new Error("That JSON file couldn't be read. Please check it and try again.")
    }
    return jsonToMatrix(parsed)
  }

  if (
    extension === "csv" ||
    extension === "tsv" ||
    extension === "txt" ||
    file.type === "text/csv"
  ) {
    const text = stripBom(await file.text())
    const delimiter = extension === "tsv" ? "\t" : detectDelimiter(text)
    return parseDelimited(text, delimiter)
  }

  if (extension === "xlsx") {
    const { default: readXlsxFile } = await import("read-excel-file/browser")
    const matrix = (await readXlsxFile(file)) as unknown as unknown[][]
    return matrix.map((row) => (row ?? []).map((cell) => cellToString(cell)))
  }

  if (extension === "xls") {
    throw new Error(
      "Old .xls files aren't supported. Save the sheet as .xlsx or .csv and try again.",
    )
  }

  throw new Error("Unsupported file. Please upload a .csv, .xlsx, .json or .tsv file.")
}

export async function readImportMatrix(file: File): Promise<ImportMatrix> {
  const matrix = await readRawMatrix(file)
  if (matrix.length === 0) return { headers: [], rows: [] }
  const [headers, ...rows] = matrix
  return { headers: headers.map(cellToString), rows }
}

/** Serialises rows to CSV, quoting values that need it. */
export function rowsToCsv(headers: string[], rows: (string | number)[][]): string {
  const escape = (value: string | number) => {
    const text = String(value ?? "")
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  return [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n")
}

export function downloadTextFile(
  filename: string,
  content: string,
  mime = "text/plain;charset=utf-8",
): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
