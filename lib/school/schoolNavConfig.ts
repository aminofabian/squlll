import type { LucideIcon } from "lucide-react";
import {
  BookMarked,
  Briefcase,
  Building2,
  CalendarCheck,
  CheckSquare,
  Clock,
  CreditCard,
  FileCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Medal,
  MessageCircle,
  PieChart,
  Trophy,
  UserRoundPlus,
  Users,
  Users2,
} from "lucide-react";

export type SchoolNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  tab?: "primary" | "more";
  center?: boolean;
};

/** Normalize `/school/{subdomain}/dashboard` → `/dashboard` */
export function getSchoolAdminPath(pathname: string): string {
  const schoolMatch = pathname.match(/^\/school\/[^/]+(\/.*)?$/);
  if (schoolMatch) {
    const rest = schoolMatch[1] ?? "/dashboard";
    if (rest === "/" || rest === "") return "/dashboard";
    return rest.replace(/\/$/, "") || "/dashboard";
  }
  if (pathname === "/" || pathname === "") return "/dashboard";
  return pathname.replace(/\/$/, "") || "/dashboard";
}

export function isSchoolNavActive(pathname: string, href: string): boolean {
  const current = getSchoolAdminPath(pathname);
  if (href === "/dashboard") {
    return current === "/dashboard";
  }
  return current === href || current.startsWith(`${href}/`);
}

export const SCHOOL_PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/classes": "Classes",
  "/timetable": "Timetable",
  "/students": "Students",
  "/teachers": "Teachers",
  "/parents": "Parents",
  "/staff": "Staff",
  "/fees": "Fees & Invoices",
  "/exams": "Exams",
  "/curriculum": "Curriculum",
  "/school-years": "School Years",
  "/reports": "Reports",
  "/analytics": "Analytics",
  "/admissions/applications": "Applications",
  "/enrollment": "Enrollment",
  "/attendances": "Attendances",
  "/grading": "Grading",
  "/communication": "Communication",
};

export function getSchoolPageTitle(pathname: string): string {
  const path = getSchoolAdminPath(pathname);
  if (SCHOOL_PAGE_TITLES[path]) return SCHOOL_PAGE_TITLES[path];

  const match = Object.entries(SCHOOL_PAGE_TITLES)
    .filter(([href]) => href !== "/dashboard")
    .sort((a, b) => b[0].length - a[0].length)
    .find(([href]) => path.startsWith(`${href}/`));

  return match?.[1] ?? "School";
}

export const SCHOOL_NAV_ITEMS: SchoolNavItem[] = [
  {
    title: "Classes",
    href: "/classes",
    icon: Building2,
    tab: "primary",
  },
  {
    title: "Students",
    href: "/students",
    icon: Users2,
    tab: "primary",
  },
  {
    title: "Home",
    href: "/dashboard",
    icon: LayoutDashboard,
    tab: "primary",
    center: true,
  },
  {
    title: "Teachers",
    href: "/teachers",
    icon: GraduationCap,
    tab: "primary",
  },
  {
    title: "Timetable",
    href: "/timetable",
    icon: Clock,
    tab: "primary",
  },
  { title: "Parents", href: "/parents", icon: Users, tab: "more" },
  { title: "Staff", href: "/staff", icon: Briefcase, tab: "more" },
  { title: "Fees", href: "/fees", icon: CreditCard, tab: "more" },
  { title: "Exams", href: "/exams", icon: FileCheck, tab: "more" },
  { title: "Curriculum", href: "/curriculum", icon: BookMarked, tab: "more" },
  {
    title: "School Years",
    href: "/school-years",
    icon: CalendarCheck,
    tab: "more",
  },
  { title: "Reports", href: "/reports", icon: FileText, tab: "more" },
  { title: "Analytics", href: "/analytics", icon: PieChart, tab: "more" },
  {
    title: "Applications",
    href: "/admissions/applications",
    icon: UserRoundPlus,
    tab: "more",
  },
  { title: "Enrollment", href: "/enrollment", icon: Medal, tab: "more" },
  {
    title: "Attendance",
    href: "/attendances",
    icon: CheckSquare,
    tab: "more",
  },
  { title: "Grading", href: "/grading", icon: Trophy, tab: "more" },
  {
    title: "Messages",
    href: "/communication",
    icon: MessageCircle,
    tab: "more",
  },
];

export const SCHOOL_PRIMARY_TABS = SCHOOL_NAV_ITEMS.filter(
  (item) => item.tab === "primary",
);

export const SCHOOL_MORE_ITEMS = SCHOOL_NAV_ITEMS.filter(
  (item) => item.tab === "more",
);

export const SCHOOL_HOME_TAB = SCHOOL_NAV_ITEMS.find((item) => item.center)!;
