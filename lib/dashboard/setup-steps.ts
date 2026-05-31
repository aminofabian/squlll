import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  School,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

export interface SchoolSetupStep {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  path: string;
}

export const SCHOOL_SETUP_STEPS: SchoolSetupStep[] = [
  {
    id: "classes",
    label: "Classes",
    description: "Add grades, streams, and class structure",
    icon: BookOpen,
    path: "/classes",
  },
  {
    id: "students",
    label: "Students",
    description: "Register and enroll students",
    icon: UserPlus,
    path: "/students?action=add",
  },
  {
    id: "teachers",
    label: "Teachers",
    description: "Invite and manage teaching staff",
    icon: GraduationCap,
    path: "/teachers?action=add",
  },
  {
    id: "subjects",
    label: "Subjects",
    description: "Configure curriculum subjects",
    icon: ClipboardList,
    path: "/classes?tab=subjects",
  },
  {
    id: "school-details",
    label: "School profile",
    description: "Complete your school profile",
    icon: School,
    path: "/onboarding",
  },
];
