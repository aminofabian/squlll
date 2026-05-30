import type { Teacher as GraphqlTeacher } from "@/lib/hooks/useTeachers";

export type TeachersListItem = {
  id: string;
  userId: string;
  name: string;
  title?: string;
  gender: "male" | "female";
  dateOfBirth: string;
  joinDate: string;
  employeeId: string;
  status: "active" | "on leave" | "former" | "substitute" | "retired";
  designation: string;
  department: string;
  subjects: string[];
  classesAssigned: string[];
  grades: string[];
  contacts: {
    phone: string;
    email: string;
    address?: string;
  };
  academic: {
    qualification: string;
    specialization: string;
    experience: number;
    certifications: string[];
  };
  performance: {
    rating: number;
    lastEvaluation: string;
    studentPerformance: string;
    trend: "improving" | "declining" | "stable";
  };
  responsibilities: string[];
  extraCurricular: { clubs: string[]; sports: string[]; committees: string[] };
};

export function mapGraphqlTeacherToListItem(
  teacher: GraphqlTeacher,
): TeachersListItem {
  const name =
    teacher.fullName?.trim() ||
    [teacher.firstName, teacher.lastName].filter(Boolean).join(" ").trim() ||
    teacher.user?.name?.trim() ||
    "Unknown Teacher";

  const email = teacher.email || teacher.user?.email || "";
  const subjects =
    teacher.tenantSubjects?.map((s) => s.name).filter(Boolean) ?? [];
  const grades =
    teacher.tenantGradeLevels
      ?.map((g) => g.gradeLevel?.name)
      .filter((n): n is string => !!n) ?? [];

  return {
    id: teacher.id,
    userId: teacher.user?.id ?? "",
    name,
    employeeId: `TCH/${new Date().getFullYear()}/${teacher.id.slice(-6).toUpperCase()}`,
    gender: "male",
    dateOfBirth: "1980-01-01",
    joinDate: new Date().toISOString().split("T")[0],
    status: teacher.isActive ? "active" : "former",
    designation: teacher.role || "teacher",
    department: teacher.department || "General",
    subjects: subjects.length > 0 ? subjects : ["General"],
    classesAssigned: [],
    grades,
    contacts: {
      phone: teacher.phoneNumber || "+254700000000",
      email,
      address: "Address not provided",
    },
    academic: {
      qualification: "bachelors",
      specialization: "General Education",
      experience: 1,
      certifications: [],
    },
    performance: {
      rating: 4.0,
      lastEvaluation: new Date().toISOString().split("T")[0],
      studentPerformance: "Good",
      trend: "stable",
    },
    responsibilities: [],
    extraCurricular: { clubs: [], sports: [], committees: [] },
  };
}
