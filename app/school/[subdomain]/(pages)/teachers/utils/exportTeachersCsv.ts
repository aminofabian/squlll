import type { TeachersListItem } from "./mapGraphqlTeacher";
import { downloadTextFile, rowsToCsv } from "@/lib/utils/import-file";

type Column = { label: string; value: (teacher: TeachersListItem) => string };

const COLUMNS: Column[] = [
  { label: "Name", value: (t) => t.name },
  { label: "Employee ID", value: (t) => t.employeeId ?? "" },
  { label: "Email", value: (t) => t.contacts.email },
  { label: "Phone", value: (t) => t.contacts.phone },
  { label: "Department", value: (t) => t.department },
  {
    label: "Status",
    value: (t) => (t.status === "active" ? "Active" : "Not activated"),
  },
  { label: "Subjects", value: (t) => t.subjects.join("; ") },
  { label: "Grades", value: (t) => t.grades.join("; ") },
  { label: "Profile complete", value: (t) => (t.hasCompletedProfile ? "Yes" : "No") },
  { label: "Date joined", value: (t) => t.joinDate ?? "" },
];

export function exportTeachersToCsv(
  teachers: TeachersListItem[],
  filename = "teachers-export.csv",
) {
  const rows = teachers.map((teacher) => COLUMNS.map((col) => col.value(teacher)));
  downloadTextFile(filename, rowsToCsv(COLUMNS.map((c) => c.label), rows), "text/csv;charset=utf-8");
}

export function exportTeachersToJson(
  teachers: TeachersListItem[],
  filename = "teachers-export.json",
) {
  const records = teachers.map((teacher) =>
    Object.fromEntries(COLUMNS.map((col) => [col.label, col.value(teacher)])),
  );
  downloadTextFile(filename, JSON.stringify(records, null, 2), "application/json");
}
