import type { GraphQLParent } from "../hooks/useExactParents";

export type ParentsListItem = {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string;
  occupation: string;
  homeAddress: string;
  relationship: "father" | "mother" | "guardian" | "other";
  status: "active" | "inactive";
  registrationDate: string;
  updatedAt: string;
  students: {
    id: string;
    name: string;
    grade: string;
    admissionNumber: string;
    relationship: string;
    isPrimary: boolean;
  }[];
  studentCount: number;
  grades: string[];
};

function parseGrade(grade: unknown): string {
  if (!grade) return "Unknown";
  if (typeof grade === "string") {
    return grade === "[object Object]" ? "Unknown" : grade;
  }
  if (typeof grade === "object" && grade !== null) {
    const g = grade as { gradeLevel?: { name?: string }; name?: string };
    return g.gradeLevel?.name ?? g.name ?? "Unknown";
  }
  return "Unknown";
}

function sanitizeLastName(lastName?: string | null): string {
  if (!lastName?.trim()) return "";
  if (lastName.toLowerCase() === "amino") return "";
  return lastName.trim();
}

export function isParentProfileIncomplete(parent: {
  email?: string | null;
  phone?: string | null;
  homeAddress?: string | null;
}): boolean {
  return (
    !parent.email?.trim() ||
    !parent.phone?.trim() ||
    !parent.homeAddress?.trim()
  );
}

export function mapGraphqlParentToListItem(
  graphqlParent: GraphQLParent,
): ParentsListItem {
  const students = graphqlParent.students.map((student) => {
    const lastName = sanitizeLastName(student.lastName);
    return {
      id: student.id,
      name: `${student.firstName}${lastName ? ` ${lastName}` : ""}`.trim(),
      grade: parseGrade(student.grade),
      admissionNumber: student.admissionNumber,
      relationship: student.relationship,
      isPrimary: student.isPrimary,
    };
  });

  const grades = Array.from(
    new Set(students.map((s) => s.grade).filter((g) => g !== "Unknown")),
  );

  const primaryStudent = students.find((s) => s.isPrimary) ?? students[0];
  const relationship = (primaryStudent?.relationship?.toLowerCase() ||
    "other") as ParentsListItem["relationship"];

  return {
    id: graphqlParent.id,
    userId: graphqlParent.userId,
    name: graphqlParent.name,
    email: graphqlParent.email ?? "",
    phone: graphqlParent.phone ?? "",
    occupation: graphqlParent.occupation ?? "",
    homeAddress: graphqlParent.address ?? "",
    relationship: ["father", "mother", "guardian"].includes(relationship)
      ? relationship
      : "other",
    status: graphqlParent.isActive ? "active" : "inactive",
    registrationDate: graphqlParent.createdAt,
    updatedAt: graphqlParent.updatedAt,
    students,
    studentCount: students.length,
    grades,
  };
}
