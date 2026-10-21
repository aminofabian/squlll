import {
  LayoutDashboard,
  Building2,
  Users2,
  GraduationCap,
  Users,
  Briefcase,
  FileCheck,
  BookMarked,
  CalendarCheck,
  PieChart,
  UserRoundPlus,
  Medal,
  ClipboardCheck,
  Trophy,
  MessageSquareText,
  Megaphone,
  Settings,
  LayoutGrid,
  Globe,
  Link2,
  type LucideIcon,
} from "lucide-react";

import { ICONS } from "@/lib/icons";

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
      { title: "Messages", shortLabel: "Chat", href: "/communication", icon: ICONS.messages },
      { title: "Communications", shortLabel: "Comms", href: "/communications", icon: Megaphone },
    ],
  },
  {
    items: [
      { title: "Timetable", shortLabel: "Timetable", href: "/timetable", icon: ICONS.timetable },
      { title: "Fees & Invoices", shortLabel: "Fees", href: "/fees?section=plans", icon: ICONS.fees },
      { title: "Exams", shortLabel: "Exams", href: "/exams", icon: FileCheck },
    ],
  },
  {
    items: [
      { title: "Website", shortLabel: "Website", href: "/website", icon: Globe },
      { title: "Transport", shortLabel: "Transport", href: "/transport", icon: ICONS.transport },
      { title: "Custom domain", shortLabel: "Domain", href: "/domains", icon: Link2 },
      { title: "Communications", shortLabel: "Comms", href: "/communications", icon: Megaphone },
      { title: "SMS messages", shortLabel: "SMS", href: "/sms-credits", icon: MessageSquareText },
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
  { title: "Messages", href: "/communication", icon: ICONS.messages },
  { title: "Communications", href: "/communications", icon: Megaphone },
  { title: "Timetable", href: "/timetable", icon: ICONS.timetable },
  { title: "Fees & Invoices", href: "/fees?section=plans", icon: ICONS.fees },
  { title: "Exams", href: "/exams", icon: FileCheck },
];

/** Less frequent pages — tucked under "More" */
export const SCHOOL_SECONDARY_NAV: SchoolNavItem[] = [
  { title: "Transport", href: "/transport", icon: ICONS.transport },
  { title: "Parents", href: "/parents", icon: Users },
  { title: "Staff", href: "/staff", icon: Briefcase },
  { title: "Attendances", href: "/attendances", icon: ICONS.attendance },
  { title: "Grading", href: "/grading", icon: Trophy },
  { title: "Curriculum", href: "/curriculum", icon: BookMarked },
  { title: "Lesson Plans", href: "/lesson-plans", icon: ClipboardCheck },
  { title: "School Years", href: "/school-years", icon: CalendarCheck },
  { title: "Reports", href: "/reports", icon: ICONS.reports },
  { title: "Analytics", href: "/analytics", icon: PieChart },
  { title: "Applications", href: "/admissions/applications", icon: UserRoundPlus },
  { title: "Enrollment", href: "/enrollment", icon: Medal },
  { title: "Communications", href: "/communications", icon: Megaphone },
  { title: "SMS messages", href: "/sms-credits", icon: MessageSquareText },
  { title: "Website", href: "/website", icon: Globe },
  { title: "Custom domain", href: "/domains", icon: Link2 },
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
      { title: "Timetable", href: "/timetable", icon: ICONS.timetable },
      { title: "Curriculum", href: "/curriculum", icon: BookMarked },
  { title: "Lesson Plans", href: "/lesson-plans", icon: ClipboardCheck },
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
      { title: "Fees & Invoices", href: "/fees?section=plans", icon: ICONS.fees },
      { title: "Attendances", href: "/attendances", icon: ICONS.attendance },
      { title: "School Years", href: "/school-years", icon: CalendarCheck },
      { title: "Reports", href: "/reports", icon: ICONS.reports },
      { title: "Analytics", href: "/analytics", icon: PieChart },
      { title: "Applications", href: "/admissions/applications", icon: UserRoundPlus },
      { title: "Enrollment", href: "/enrollment", icon: Medal },
      { title: "Transport", href: "/transport", icon: ICONS.transport },
      { title: "Communications", href: "/communications", icon: Megaphone },
      { title: "SMS messages", href: "/sms-credits", icon: MessageSquareText },
      { title: "Website", href: "/website", icon: Globe },
      { title: "Custom domain", href: "/domains", icon: Link2 },
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
  { title: "Messages", href: "/communication", icon: ICONS.messages },
  { title: "Communications", href: "/communications", icon: Megaphone },
  { title: "Timetable", href: "/timetable", icon: ICONS.timetable },
];

/** Mobile bottom nav — overflow items shown in "More" sheet */
export const SCHOOL_MORE_ITEMS: SchoolNavItem[] = [
  ...SCHOOL_SECONDARY_NAV,
  { title: "Website", href: "/website", icon: Globe },
  { title: "Settings", href: "/settings", icon: Settings },
];
