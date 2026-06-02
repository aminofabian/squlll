import type { Teacher as GraphqlTeacher } from "@/lib/hooks/useTeachers";

export type TeachersListItem = {
  id: string;
  userId: string;
  name: string;
  gender: "male" | "female";
  dateOfBirth: string | null;
  joinDate: string | null;
  employeeId: string | null;
  status: "active" | "inactive" | "on leave" | "former" | "substitute" | "retired";
  designation: string;
  department: string;
  subjects: string[];
  grades: string[];
  qualifications: string | null;
  hasCompletedProfile: boolean;
  contacts: {
    phone: string;
    email: string;
    address?: string;
  };
};

export function isTeacherProfileIncomplete(teacher: {
  employeeId?: string | null;
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  qualifications?: string | null;
  hasCompletedProfile?: boolean;
  contacts?: { phone?: string; email?: string; address?: string };
}): boolean {
  if (teacher.hasCompletedProfile === false) return true;

  const email = teacher.email ?? teacher.contacts?.email;
  const phone = teacher.phoneNumber ?? teacher.contacts?.phone;

  return (
    !teacher.employeeId?.trim() ||
    !teacher.dateOfBirth ||
    !email?.trim() ||
    !phone?.trim() ||
    !teacher.qualifications?.trim()
  );
}

export function mapGraphqlTeacherToListItem(
  teacher: GraphqlTeacher,
): TeachersListItem {
  const name =
    teacher.fullName?.trim() ||
    [teacher.firstName, teacher.lastName].filter(Boolean).join(" ").trim() ||
    teacher.user?.name?.trim() ||
    "Unknown Teacher";

  const email = teacher.email || teacher.user?.email || "";
  const phone = teacher.phoneNumber?.trim() || "";
  const subjects =
    teacher.tenantSubjects?.map((s) => s.name).filter(Boolean) ?? [];
  const grades =
    teacher.tenantGradeLevels
      ?.map((g) => g.gradeLevel?.name)
      .filter((n): n is string => !!n) ?? [];

  const joinDate = teacher.createdAt
    ? new Date(teacher.createdAt).toISOString().split("T")[0]
    : null;

  const dateOfBirth = teacher.dateOfBirth
    ? new Date(teacher.dateOfBirth).toISOString().split("T")[0]
    : null;

  const contacts = {
    phone,
    email,
    address: teacher.address?.trim() || undefined,
  };

  return {
    id: teacher.id,
    userId: teacher.user?.id ?? "",
    name,
    employeeId: teacher.employeeId?.trim() || null,
    gender:
      teacher.gender?.toLowerCase() === "female" ? "female" : "male",
    dateOfBirth,
    joinDate,
    status: teacher.isActive ? "active" : "inactive",
    designation: teacher.role || "teacher",
    department: teacher.department || "General",
    subjects: subjects.length > 0 ? subjects : [],
    grades,
    qualifications: teacher.qualifications?.trim() || null,
    hasCompletedProfile: teacher.hasCompletedProfile ?? false,
    contacts,
  };
}
