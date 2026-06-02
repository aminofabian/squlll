/** Shared shell tokens — keep sidebar, navbar, and pages visually aligned */
export const SCHOOL_SHELL = {
  rail: "bg-[#f5f6f8]",
  canvas: "bg-white",
  shell: "bg-[#f5f6f8]",
  accent: "#0073ea",
  accentBg: "bg-[#dcebfd]",
  accentText: "text-[#0073ea]",
  accentHover: "hover:bg-[#0073ea]/90",
  border: "border-slate-200/70",
} as const;

export function getSchoolPageTitle(pathname: string): string {
  const parts = pathname.split("?")[0].split("/").filter(Boolean);
  const segment = parts[parts.length - 1] ?? "dashboard";
  const titles: Record<string, string> = {
    dashboard: "Dashboard",
    classes: "Classes",
    students: "Students",
    teachers: "Teachers",
    timetable: "Timetable",
    fees: "Fees & Invoices",
    exams: "Exams",
    parents: "Parents",
    staff: "Staff",
    attendances: "Attendances",
    grading: "Grading",
    curriculum: "Curriculum",
    "school-years": "School Years",
    reports: "Reports",
    analytics: "Analytics",
    applications: "Applications",
    enrollment: "Enrollment",
    communication: "Communication",
    settings: "Settings",
    onboarding: "Onboarding",
  };
  return titles[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}
