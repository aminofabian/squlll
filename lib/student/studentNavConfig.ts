import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  FileText,
  Home,
  LayoutDashboard,
  MessageSquare,
  Phone,
  Printer,
  Settings,
  TrendingUp,
  User,
  UserCheck,
  Wallet,
} from "lucide-react";

export type StudentNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Shown in bottom tab bar */
  tab?: "primary" | "more";
  /** Center elevated home button */
  center?: boolean;
};

/** Normalize `/school/{subdomain}/student/...` → `/student/...` */
export function getStudentPath(pathname: string): string {
  const idx = pathname.indexOf("/student");
  if (idx === -1) return "/student";
  const rest = pathname.slice(idx);
  return rest === "/student/" ? "/student" : rest.replace(/\/$/, "") || "/student";
}

export function isStudentNavActive(pathname: string, href: string): boolean {
  const current = getStudentPath(pathname);
  if (href === "/student") {
    return current === "/student";
  }
  return current === href || current.startsWith(`${href}/`);
}

export const STUDENT_PAGE_TITLES: Record<string, string> = {
  "/student": "Home",
  "/student/timetable": "Timetable",
  "/student/messages": "Messages",
  "/student/assignments": "Assignments",
  "/student/exam-results": "Exam Results",
  "/student/notes": "Notes",
  "/student/attendance": "Attendance",
  "/student/performance": "Performance",
  "/student/upcoming-tests": "Upcoming Tests",
  "/student/contact-teachers": "Contact Teachers",
  "/student/report-cards": "Report Cards",
  "/student/exam-timetable": "Exam Timetable",
  "/student/profile": "Profile",
  "/student/settings": "Settings",
  "/student/fees": "My Fees",
};

export function getStudentPageTitle(pathname: string): string {
  const path = getStudentPath(pathname);
  if (STUDENT_PAGE_TITLES[path]) return STUDENT_PAGE_TITLES[path];

  const match = Object.entries(STUDENT_PAGE_TITLES)
    .filter(([href]) => href !== "/student")
    .sort((a, b) => b[0].length - a[0].length)
    .find(([href]) => path.startsWith(`${href}/`));

  return match?.[1] ?? "Student";
}

/** Sidebar + bottom nav source of truth */
export const STUDENT_NAV_ITEMS: StudentNavItem[] = [
  { title: "Home", href: "/student", icon: Home, tab: "primary", center: true },
  {
    title: "Timetable",
    href: "/student/timetable",
    icon: CalendarDays,
    tab: "primary",
  },
  {
    title: "Tests",
    href: "/student/upcoming-tests",
    icon: CalendarCheck,
    tab: "primary",
  },
  {
    title: "Messages",
    href: "/student/messages",
    icon: MessageSquare,
    tab: "primary",
  },
  {
    title: "Assignments",
    href: "/student/assignments",
    icon: BookOpen,
    tab: "more",
  },
  {
    title: "Exam Results",
    href: "/student/exam-results",
    icon: BarChart3,
    tab: "more",
  },
  { title: "Notes", href: "/student/notes", icon: FileText, tab: "more" },
  {
    title: "Attendance",
    href: "/student/attendance",
    icon: UserCheck,
    tab: "more",
  },
  {
    title: "My Fees",
    href: "/student/fees",
    icon: Wallet,
    tab: "more",
  },
  {
    title: "Performance",
    href: "/student/performance",
    icon: TrendingUp,
    tab: "more",
  },
  {
    title: "Contact Teachers",
    href: "/student/contact-teachers",
    icon: Phone,
    tab: "more",
  },
  {
    title: "Report Cards",
    href: "/student/report-cards",
    icon: Printer,
    tab: "more",
  },
  { title: "Profile", href: "/student/profile", icon: User, tab: "more" },
  { title: "Settings", href: "/student/settings", icon: Settings, tab: "more" },
];

export const STUDENT_PRIMARY_TABS = STUDENT_NAV_ITEMS.filter(
  (item) => item.tab === "primary",
);

export const STUDENT_MORE_ITEMS = STUDENT_NAV_ITEMS.filter(
  (item) => item.tab === "more",
);

export const STUDENT_HOME_TAB = STUDENT_NAV_ITEMS.find((item) => item.center)!;

export const STUDENT_SIDEBAR_ITEMS: StudentNavItem[] = [
  { title: "Dashboard", href: "/student", icon: LayoutDashboard },
  ...STUDENT_NAV_ITEMS.filter((item) => !item.center),
];
