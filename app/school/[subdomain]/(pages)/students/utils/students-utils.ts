import type { StudentRow } from "../components/StudentsTable";

export type StudentFilter = "all" | "active" | "inactive" | "missing-class";

export function matchesStudentFilter(
  student: Pick<StudentRow, "status" | "missingStream">,
  filter: StudentFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "active") return student.status === "active";
  if (filter === "inactive") return student.status === "inactive";
  if (filter === "missing-class") return !!student.missingStream;
  return true;
}
