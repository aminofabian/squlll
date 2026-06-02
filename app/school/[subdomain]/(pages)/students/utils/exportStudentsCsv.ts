import type { StudentRow } from "../components/StudentsTable";

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportStudentsToCsv(
  students: StudentRow[],
  filename = "students-export.csv",
) {
  const headers = [
    "Name",
    "Admission number",
    "Grade",
    "Stream",
    "Status",
    "Class assigned",
  ];

  const rows = students.map((student) => [
    student.name,
    student.admissionNumber,
    student.grade,
    student.stream,
    student.status === "active" ? "Active" : "Inactive",
    student.missingStream ? "No" : "Yes",
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => escapeCsv(String(cell))).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
