import type { StudentRow } from "../components/StudentsTable";
import { downloadTextFile, rowsToCsv } from "@/lib/utils/import-file";

type Column = { label: string; value: (student: StudentRow) => string };

const COLUMNS: Column[] = [
  { label: "Name", value: (s) => s.name },
  { label: "Admission number", value: (s) => s.admissionNumber },
  { label: "Grade", value: (s) => s.grade },
  { label: "Stream", value: (s) => s.stream },
  {
    label: "Status",
    value: (s) => (s.status === "active" ? "Active" : "Inactive"),
  },
  { label: "Class assigned", value: (s) => (s.missingStream ? "No" : "Yes") },
];

export function exportStudentsToCsv(
  students: StudentRow[],
  filename = "students-export.csv",
) {
  const rows = students.map((student) => COLUMNS.map((col) => col.value(student)));
  downloadTextFile(filename, rowsToCsv(COLUMNS.map((c) => c.label), rows), "text/csv;charset=utf-8");
}

export function exportStudentsToJson(
  students: StudentRow[],
  filename = "students-export.json",
) {
  const records = students.map((student) =>
    Object.fromEntries(COLUMNS.map((col) => [col.label, col.value(student)])),
  );
  downloadTextFile(filename, JSON.stringify(records, null, 2), "application/json");
}
