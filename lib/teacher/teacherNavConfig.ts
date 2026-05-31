import type { LucideIcon } from "lucide-react";
import {
  BookMarked,
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Home,
  LayoutDashboard,
  MessageSquare,
  Settings,
  User,
} from "lucide-react";

export type TeacherNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  tab?: "primary" | "more";
  center?: boolean;
};

export function getTeacherPath(pathname: string): string {
  const idx = pathname.indexOf("/teacher");
  if (idx === -1) return "/teacher";
  const rest = pathname.slice(idx);
  return rest === "/teacher/" ? "/teacher" : rest.replace(/\/$/, "") || "/teacher";
}

export function isTeacherNavActive(pathname: string, href: string): boolean {
  const current = getTeacherPath(pathname);
  if (href === "/teacher") {
    return current === "/teacher";
  }
  return current === href || current.startsWith(`${href}/`);
}

export const TEACHER_PAGE_TITLES: Record<string, string> = {
  "/teacher": "Home",
  "/teacher/timetable": "Timetable",
  "/teacher/assignments": "Assignments",
  "/teacher/assessments": "Assessments",
  "/teacher/attendance": "Attendance",
  "/teacher/lesson-plans": "Lesson Plans",
  "/teacher/messages": "Messages",
  "/teacher/exams": "Exams",
  "/teacher/profile": "Profile",
  "/teacher/settings": "Settings",
};

export function getTeacherPageTitle(pathname: string): string {
  const path = getTeacherPath(pathname);
  if (TEACHER_PAGE_TITLES[path]) return TEACHER_PAGE_TITLES[path];

  const match = Object.entries(TEACHER_PAGE_TITLES)
    .filter(([href]) => href !== "/teacher")
    .sort((a, b) => b[0].length - a[0].length)
    .find(([href]) => path.startsWith(`${href}/`));

  return match?.[1] ?? "Teacher";
}

export const TEACHER_NAV_ITEMS: TeacherNavItem[] = [
  { title: "Home", href: "/teacher", icon: Home, tab: "primary", center: true },
  {
    title: "Timetable",
    href: "/teacher/timetable",
    icon: CalendarDays,
    tab: "primary",
  },
  {
    title: "Assignments",
    href: "/teacher/assignments",
    icon: BookOpen,
    tab: "primary",
  },
  {
    title: "Messages",
    href: "/teacher/messages",
    icon: MessageSquare,
    tab: "primary",
  },
  {
    title: "Assessments",
    href: "/teacher/assessments",
    icon: GraduationCap,
    tab: "more",
  },
  {
    title: "Attendance",
    href: "/teacher/attendance",
    icon: ClipboardList,
    tab: "more",
  },
  {
    title: "Lesson Plans",
    href: "/teacher/lesson-plans",
    icon: BookMarked,
    tab: "more",
  },
  { title: "Profile", href: "/teacher/profile", icon: User, tab: "more" },
  { title: "Settings", href: "/teacher/settings", icon: Settings, tab: "more" },
];

export const TEACHER_PRIMARY_TABS = TEACHER_NAV_ITEMS.filter(
  (item) => item.tab === "primary",
);

export const TEACHER_MORE_ITEMS = TEACHER_NAV_ITEMS.filter(
  (item) => item.tab === "more",
);

export const TEACHER_HOME_TAB = TEACHER_NAV_ITEMS.find((item) => item.center)!;

export const TEACHER_SIDEBAR_ITEMS: TeacherNavItem[] = [
  { title: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  ...TEACHER_NAV_ITEMS.filter((item) => !item.center),
];
