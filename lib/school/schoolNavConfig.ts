import {
  LayoutDashboard,
  Building2,
  Clock,
  Users2,
  GraduationCap,
  Users,
  Briefcase,
  CreditCard,
  FileCheck,
  BookMarked,
  CalendarCheck,
  FileText,
  PieChart,
  UserRoundPlus,
  Medal,
  CheckSquare,
  Trophy,
  MessageCircle,
  Settings,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";

export interface SchoolNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  center?: boolean;
  /** Short label for the icon rail (defaults to title) */
  shortLabel?: string;
}

export interface SchoolNavGroup {
  items: SchoolNavItem[];
}

/** Icon rail groups — slim sidebar with icon + short label */
export const SCHOOL_RAIL_GROUPS: SchoolNavGroup[] = [
  {
    items: [
      { title: "Dashboard", shortLabel: "Home", href: "/dashboard", icon: LayoutGrid },
      { title: "Students", shortLabel: "Students", href: "/students", icon: Users2 },
      { title: "Classes", shortLabel: "Classes", href: "/classes", icon: Building2 },
      { title: "Teachers", shortLabel: "Teachers", href: "/teachers", icon: GraduationCap },
    ],
  },
  {
    items: [
      { title: "Timetable", shortLabel: "Schedule", href: "/timetable", icon: Clock },
      { title: "Fees & Invoices", shortLabel: "Fees", href: "/fees?section=plans", icon: CreditCard },
      { title: "Exams", shortLabel: "Exams", href: "/exams", icon: FileCheck },
    ],
  },
  {
    items: [
      { title: "Settings", shortLabel: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

/** Daily-use pages — shown in expanded panel */
export const SCHOOL_PRIMARY_NAV: SchoolNavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Classes", href: "/classes", icon: Building2 },
  { title: "Students", href: "/students", icon: Users2 },
  { title: "Teachers", href: "/teachers", icon: GraduationCap },
  { title: "Timetable", href: "/timetable", icon: Clock },
  { title: "Fees & Invoices", href: "/fees?section=plans", icon: CreditCard },
  { title: "Exams", href: "/exams", icon: FileCheck },
];

/** Less frequent pages — tucked under "More" */
export const SCHOOL_SECONDARY_NAV: SchoolNavItem[] = [
  { title: "Parents", href: "/parents", icon: Users },
  { title: "Staff", href: "/staff", icon: Briefcase },
  { title: "Attendances", href: "/attendances", icon: CheckSquare },
  { title: "Grading", href: "/grading", icon: Trophy },
  { title: "Curriculum", href: "/curriculum", icon: BookMarked },
  { title: "School Years", href: "/school-years", icon: CalendarCheck },
  { title: "Reports", href: "/reports", icon: FileText },
  { title: "Analytics", href: "/analytics", icon: PieChart },
  { title: "Applications", href: "/admissions/applications", icon: UserRoundPlus },
  { title: "Enrollment", href: "/enrollment", icon: Medal },
  { title: "Communication", href: "/communication", icon: MessageCircle },
];

export interface SchoolNavSection {
  id: string;
  label: string;
  items: SchoolNavItem[];
}

/** Grouped nav for workspace home "Content" tab */
export const SCHOOL_NAV_SECTIONS: SchoolNavSection[] = [
  {
    id: "academic",
    label: "Academic",
    items: [
      { title: "Classes", href: "/classes", icon: Building2 },
      { title: "Timetable", href: "/timetable", icon: Clock },
      { title: "Curriculum", href: "/curriculum", icon: BookMarked },
      { title: "Exams", href: "/exams", icon: FileCheck },
      { title: "Grading", href: "/grading", icon: Trophy },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      { title: "Students", href: "/students", icon: Users2 },
      { title: "Teachers", href: "/teachers", icon: GraduationCap },
      { title: "Parents", href: "/parents", icon: Users },
      { title: "Staff", href: "/staff", icon: Briefcase },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    items: [
      { title: "Fees & Invoices", href: "/fees?section=plans", icon: CreditCard },
      { title: "Attendances", href: "/attendances", icon: CheckSquare },
      { title: "School Years", href: "/school-years", icon: CalendarCheck },
      { title: "Reports", href: "/reports", icon: FileText },
      { title: "Analytics", href: "/analytics", icon: PieChart },
      { title: "Applications", href: "/admissions/applications", icon: UserRoundPlus },
      { title: "Enrollment", href: "/enrollment", icon: Medal },
      { title: "Communication", href: "/communication", icon: MessageCircle },
    ],
  },
];

export function isSchoolNavActive(pathname: string, href: string): boolean {
  const path = href.split("?")[0];
  const normalized = pathname.split("?")[0];

  if (path === "/dashboard") {
    return (
      normalized === "/dashboard" ||
      normalized.endsWith("/dashboard")
    );
  }

  return (
    normalized === path ||
    normalized.endsWith(path) ||
    normalized.includes(`${path}/`)
  );
}

/** Mobile bottom nav — center home tab */
export const SCHOOL_HOME_TAB: SchoolNavItem = {
  title: "Home",
  href: "/dashboard",
  icon: LayoutDashboard,
  center: true,
};

/** Mobile bottom nav — primary tabs (excluding center home) */
export const SCHOOL_PRIMARY_TABS: SchoolNavItem[] = [
  { title: "Students", href: "/students", icon: Users2 },
  { title: "Classes", href: "/classes", icon: Building2 },
  { title: "Teachers", href: "/teachers", icon: GraduationCap },
  { title: "Timetable", href: "/timetable", icon: Clock },
];

/** Mobile bottom nav — overflow items shown in "More" sheet */
export const SCHOOL_MORE_ITEMS: SchoolNavItem[] = [
  ...SCHOOL_SECONDARY_NAV,
  { title: "Settings", href: "/settings", icon: Settings },
];
