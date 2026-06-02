import type { TeachersListItem } from "./mapGraphqlTeacher";

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportTeachersToCsv(
  teachers: TeachersListItem[],
  filename = "teachers-export.csv",
) {
  const headers = [
    "Name",
    "Employee ID",
    "Email",
    "Phone",
    "Department",
    "Status",
    "Subjects",
    "Grades",
    "Profile complete",
    "Date joined",
  ];

  const rows = teachers.map((teacher) => [
    teacher.name,
    teacher.employeeId ?? "",
    teacher.contacts.email,
    teacher.contacts.phone,
    teacher.department,
    teacher.status === "active" ? "Active" : "Not activated",
    teacher.subjects.join("; "),
    teacher.grades.join("; "),
    teacher.hasCompletedProfile ? "Yes" : "No",
    teacher.joinDate ?? "",
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
