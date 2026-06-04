'use client'

import { Header } from "@/components/Header"
import { AuthWrapper } from "@/components/auth/AuthFormWrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useStudentsStore } from "@/lib/stores/useStudentsStore"
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore"
import { mockClasses } from "@/lib/data/mockclasses"
import { useEffect, useMemo, useState } from "react"
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  Play,
  Search,
  LayoutGrid,
  Users2,
  CreditCard,
  FileCheck,
  Clock,
  Bell,
  Radio,
  ClipboardList,
  NotebookPen,
  CalendarClock,
  Smartphone,
  UserCheck,
  Shield,
  Building2,
  CircleHelp,
  Mail,
  MapPin,
  Phone,
  type LucideIcon,
} from "lucide-react"

const LANDING_FEATURE_CARDS: {
  icon: LucideIcon
  title: string
  description: string
}[] = [
  {
    icon: ClipboardList,
    title: "Digital Admissions & Records",
    description:
      "Admission #2043 in minutes—issue numbers, assign class, and file the profile. No stack of forms in the bursar's office.",
  },
  {
    icon: NotebookPen,
    title: "Academic Performance",
    description:
      "Capture CBC rubrics, exam marks, and report cards in one place—parents and auditors get the full picture without retyping.",
  },
  {
    icon: CalendarClock,
    title: "Staff & Operations",
    description:
      "Timetables, attendance, and duty rosters in one hub—no more WhatsApp threads about who is teaching, when, or where.",
  },
]

const LANDING_PLATFORM_MODULES: {
  icon: LucideIcon
  title: string
  description: string
  highlight: string
}[] = [
  {
    icon: CreditCard,
    title: "M-Pesa & fee balances",
    description:
      "Match Paybill and till payments to the right student—balances and receipts update before the parent leaves the gate.",
    highlight: "Auto receipts",
  },
  {
    icon: ClipboardList,
    title: "Admissions & student files",
    description:
      "Issue admission numbers, assign class, and link guardians in one flow—no duplicate registers in the bursar's office.",
    highlight: "ID in minutes",
  },
  {
    icon: NotebookPen,
    title: "CBC marks & reports",
    description:
      "Enter rubrics and exam marks once—term reports ready for parents and auditors without retyping from exercise books.",
    highlight: "Term reports",
  },
  {
    icon: Smartphone,
    title: "Parent SMS alerts",
    description:
      "Fee reminders, absence notices, and exam updates by SMS—not another WhatsApp group drowning your staff.",
    highlight: "Bulk SMS",
  },
  {
    icon: CalendarClock,
    title: "Timetables & duty rosters",
    description:
      "Publish class timetables and teacher duty lists your team can trust—no more guessing who teaches Form 2 East on Friday.",
    highlight: "Live schedules",
  },
  {
    icon: UserCheck,
    title: "Daily attendance",
    description:
      "Morning roll call on phone or desktop—parents get an SMS when their child is marked present or absent.",
    highlight: "Same-day SMS",
  },
]

function LandingPlatformIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="mb-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1d5547] shadow-md ring-1 ring-[#1d5547]/30">
      <Icon size={22} strokeWidth={2} className="text-white" aria-hidden />
    </div>
  )
}

const LANDING_WORKFLOW_BLOCKS: {
  id: string
  num: string
  icon: LucideIcon
  title: string
  description: string
  bullets: string[]
}[] = [
  {
    id: "cbc",
    num: "01",
    icon: NotebookPen,
    title: "CBC & exam records",
    description:
      "Capture rubrics, continuous assessments, and end-of-term exams once—reports parents and auditors actually use.",
    bullets: ["CBC rubrics & strands", "Exam timetables", "Term report cards", "Per-subject gradebooks"],
  },
  {
    id: "students",
    num: "02",
    icon: Users2,
    title: "Student & guardian files",
    description:
      "Every learner has one profile—admission number, class, guardian contacts, and history without a second register.",
    bullets: ["Admission profiles", "Guardian & emergency SMS", "Class & stream lists", "Notes & discipline"],
  },
  {
    id: "fees",
    num: "04",
    icon: CreditCard,
    title: "Fees & M-Pesa",
    description:
      "Reconcile Paybill and till payments, track arrears by term, and print bursar summaries your board expects.",
    bullets: ["Paybill matching", "Term fee structures", "Balances & arrears", "Bursar PDF reports"],
  },
  {
    id: "comms",
    num: "05",
    icon: Bell,
    title: "Parent communication",
    description:
      "Send fee reminders, absence alerts, and exam notices by SMS—parents stay informed without another WhatsApp group.",
    bullets: ["Fee reminder SMS", "Absence alerts", "Exam notifications", "Guardian contact lists"],
  },
]

function LandingWorkflowIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#1d5547] shadow-md ring-1 ring-[#1d5547]/25">
      <Icon size={26} strokeWidth={2} className="text-white" aria-hidden />
    </div>
  )
}

function LandingWorkflowCard({
  num,
  icon,
  title,
  description,
  bullets,
}: (typeof LANDING_WORKFLOW_BLOCKS)[number]) {
  return (
    <div className="group relative h-full">
      <div className="relative flex h-full flex-col rounded-xl border border-emerald-900/10 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1d5547]/20 hover:shadow-md">
        <div className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-sm border border-emerald-900/10 bg-white font-ui text-xs font-semibold tabular-nums text-[#1d5547] shadow-sm">
          {num}
        </div>
        <div className="mb-6 flex items-start gap-5">
          <LandingWorkflowIcon icon={icon} />
          <div className="min-w-0 pt-1">
            <h3 className="font-display text-2xl leading-snug text-slate-900">{title}</h3>
            <div className="mt-2 h-0.5 w-10 bg-gradient-to-r from-[#1d5547]/60 to-transparent" />
          </div>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-slate-600">{description}</p>
        <ul className="mt-auto grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {bullets.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600/70" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const LANDING_DEEP_DIVES: {
  id: string
  icon: LucideIcon
  title: string
  intro: string
  image: string
  imageAlt: string
  imageRight: boolean
  items: { title: string; description: string }[]
}[] = [
  {
    id: "cbc",
    icon: NotebookPen,
    title: "CBC marks & class setup",
    intro:
      "Teachers enter rubrics and exam marks once—SQUL holds class lists, subject registers, and the term reports parents collect on closing day.",
    image: "/screenshots/class.jpg",
    imageAlt: "Teachers reviewing class lists in a Kenyan school",
    imageRight: true,
    items: [
      {
        title: "Streams & subjects",
        description: "Form 2 East, Grade 7 Blue—every stream and subject combination your timetable already uses.",
      },
      {
        title: "CBC rubrics & assessments",
        description: "Capture strand marks in SQUL instead of a separate Excel file per teacher.",
      },
      {
        title: "Term report cards",
        description: "Print-ready reports parents recognise—without retyping marks from exercise books.",
      },
    ],
  },
  {
    id: "records",
    icon: ClipboardList,
    title: "Student files & admissions",
    intro:
      "From Admission #2043 to morning roll call—one profile per learner with guardians, health notes, and attendance your bursar can trust.",
    image: "/students/sq.png",
    imageAlt: "Learners in a Kenyan classroom",
    imageRight: false,
    items: [
      {
        title: "Digital admissions",
        description: "Enquiry, interview, class placement, and issued admission number in a single flow.",
      },
      {
        title: "Guardian contacts",
        description: "Phone numbers for fee reminders and absence SMS—kept current in one place.",
      },
      {
        title: "Attendance & notes",
        description: "Roll call on phone or desktop—parents notified the same day a learner is absent.",
      },
    ],
  },
  {
    id: "bursar",
    icon: CreditCard,
    title: "Bursar desk & M-Pesa",
    intro:
      "The work that happens before the principal's Monday meeting—matched payments, class arrears, and summaries the board expects.",
    image: "/screenshots/teachers.jpg",
    imageAlt: "School staff coordinating fees and administration",
    imageRight: true,
    items: [
      {
        title: "M-Pesa reconciliation",
        description: "Paybill and till receipts matched to the right student—balances update the same morning.",
      },
      {
        title: "Term fee structures",
        description: "Tuition, boarding, and activity levies broken down the way parents and auditors expect.",
      },
      {
        title: "Arrears & reports",
        description: "Who owes what, by class and stream—exportable before parents queue at the office.",
      },
    ],
  },
]

const LANDING_FAQ_ITEMS: {
  icon: LucideIcon
  question: string
  answer: string
}[] = [
  {
    icon: Shield,
    question: "How is learner data kept safe?",
    answer:
      "Role-based access—bursars see fees, teachers see their classes, and only admins export full registers. Data is encrypted in transit and backed up daily.",
  },
  {
    icon: Building2,
    question: "Can we run more than one campus?",
    answer:
      "Yes. Run your main school and a satellite campus separately—each with its own classes and fee structures—while your principal sees consolidated reports.",
  },
  {
    icon: CircleHelp,
    question: "Do we get help during setup?",
    answer:
      "Yes. Support through your first onboarding week—import your existing student list, train the bursar, and go live before parents' reporting day.",
  },
  {
    icon: Clock,
    question: "How fast can we go live?",
    answer:
      "Most schools import learners and start fee collection within the first two weeks of a term. You do not need a six-month IT project.",
  },
  {
    icon: Users2,
    question: "How do parents get updates?",
    answer:
      "Fee receipts, absence alerts, and exam reminders by SMS—the channel parents already check. A parent portal is optional, not required.",
  },
  {
    icon: Smartphone,
    question: "Can staff use phones?",
    answer:
      "Teachers mark attendance and view class lists in the browser on any phone. The bursar can reconcile M-Pesa from mobile or desktop.",
  },
]

const LANDING_FOOTER_PRODUCT_LINKS: { label: string; href: string }[] = [
  { label: "M-Pesa & fee balances", href: "/register" },
  { label: "Admissions & records", href: "/register" },
  { label: "CBC & report cards", href: "/register" },
  { label: "Timetables & attendance", href: "/register" },
]

const LANDING_FOOTER_SCHOOL_LINKS: { label: string; href: string }[] = [
  { label: "Start free term", href: "/register" },
  { label: "Sign in", href: "/login" },
  { label: "Book a walkthrough", href: "/login" },
]

function LandingFaqIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1d5547] shadow-sm">
      <Icon size={18} strokeWidth={2} className="text-white" aria-hidden />
    </div>
  )
}

function LandingFaqCard({ icon, question, answer }: (typeof LANDING_FAQ_ITEMS)[number]) {
  return (
    <div className="rounded-xl border border-emerald-900/10 bg-white p-6 shadow-sm transition-shadow hover:border-[#1d5547]/20 hover:shadow-md">
      <div className="flex gap-4">
        <LandingFaqIcon icon={icon} />
        <div className="min-w-0">
          <h3 className="font-ui text-base font-semibold leading-snug text-slate-900">{question}</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{answer}</p>
        </div>
      </div>
    </div>
  )
}

function LandingDeepDiveBlock({
  icon,
  title,
  intro,
  items,
  image,
  imageAlt,
  imageRight,
}: (typeof LANDING_DEEP_DIVES)[number]) {
  const copy = (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <LandingWorkflowIcon icon={icon} />
        <div className="min-w-0 pt-1">
          <h3 className="font-display text-2xl leading-snug text-slate-900 sm:text-3xl">{title}</h3>
        </div>
      </div>
      <p className="text-base leading-relaxed text-slate-600">{intro}</p>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-lg border border-emerald-900/10 bg-white px-5 py-4 shadow-sm"
          >
            <h4 className="font-ui text-sm font-semibold text-[#1d5547]">{item.title}</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const visual = (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-900/10 shadow-[0_20px_50px_rgba(10,31,26,0.12)]">
      <img src={image} alt={imageAlt} className="h-[min(380px,55vw)] w-full object-cover md:h-[420px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f1a]/50 via-transparent to-transparent" />
    </div>
  )

  return (
    <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14 lg:gap-16">
      {imageRight ? (
        <>
          {copy}
          {visual}
        </>
      ) : (
        <>
          {visual}
          {copy}
        </>
      )}
    </div>
  )
}

function LandingBursarSnapshot({
  activeStudents,
  feeCollectionRate,
  totalClasses,
  totalSubjects,
}: {
  activeStudents: number
  feeCollectionRate: number
  totalClasses: number
  totalSubjects: number
}) {
  const tiles = [
    { label: "Learners on roll", value: activeStudents.toLocaleString(), icon: Users, tone: "text-emerald-700" },
    { label: "Fees collected", value: `${feeCollectionRate}%`, icon: DollarSign, tone: "text-[#1d5547]" },
    { label: "Classes timetabled", value: totalClasses.toLocaleString(), icon: GraduationCap, tone: "text-emerald-800" },
    { label: "Subjects taught", value: totalSubjects.toLocaleString(), icon: BookOpen, tone: "text-[#1d5547]" },
  ]

  return (
    <div className="group relative">
      <div className="relative overflow-hidden rounded-xl border border-[#1d5547]/15 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-sm border border-emerald-900/10 bg-white font-ui text-xs font-semibold tabular-nums text-[#1d5547] shadow-sm">
          03
        </div>
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start">
          <LandingWorkflowIcon icon={LayoutGrid} />
          <div className="min-w-0">
            <h3 className="font-display text-2xl leading-snug text-slate-900">Bursar & admin snapshot</h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
              See enrolment, fee collection, and class setup on one screen—the numbers your principal asks for before staff meeting.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {tiles.map((tile) => {
            const Icon = tile.icon
            return (
              <div
                key={tile.label}
                className="rounded-lg border border-emerald-900/8 bg-emerald-50/50 px-4 py-4 transition-colors group-hover:bg-emerald-50"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${tile.tone}`} strokeWidth={2} />
                  <span className={`font-ui text-xl font-bold tabular-nums ${tile.tone}`}>{tile.value}</span>
                </div>
                <p className="text-xs leading-snug text-slate-600">{tile.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function LandingTermReadyBadge() {
  return (
    <div
      className="relative flex h-28 w-28 shrink-0 items-center justify-center sm:h-[7.75rem] sm:w-[7.75rem]"
      role="img"
      aria-label="Term ready for 2026"
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#e8f5f0] via-white to-[#dceee6] shadow-[0_10px_40px_rgba(29,85,71,0.14)] ring-1 ring-[#1d5547]/20" />
      <div className="absolute inset-[5px] rounded-full border border-[#1d5547]/12" />
      <div className="relative text-center">
        <p className="font-ui text-[8px] font-semibold uppercase tracking-[0.22em] text-[#1d5547]/65">
          Term
        </p>
        <p className="font-display text-[1.35rem] leading-none tracking-tight text-[#1d5547] sm:text-2xl">
          Ready
        </p>
        <div className="mx-auto mt-1.5 h-px w-8 bg-[#1d5547]/20" />
        <p className="font-ui mt-1.5 text-[9px] font-medium tabular-nums text-emerald-700">2026</p>
      </div>
    </div>
  )
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function useAnimatedNumber(
  target: number,
  { duration = 1800, delay = 0, enabled = true, decimals = 0 } = {}
) {
  const [value, setValue] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!enabled) return
    let frame = 0
    let startTime: number | null = null
    const timeout = window.setTimeout(() => {
      const tick = (now: number) => {
        if (startTime === null) startTime = now
        const progress = Math.min((now - startTime) / duration, 1)
        const eased = easeOutCubic(progress)
        const raw = target * eased
        const next =
          decimals > 0
            ? Math.round(raw * 10 ** decimals) / 10 ** decimals
            : Math.round(raw)
        setValue(next)
        if (progress < 1) {
          frame = requestAnimationFrame(tick)
        } else {
          setDone(true)
        }
      }
      frame = requestAnimationFrame(tick)
    }, delay)

    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(frame)
    }
  }, [target, duration, delay, enabled, decimals])

  return { value, done }
}

function HeroDashboardPanel({
  student,
  linkedModule,
  hoveredModule,
  studentsMetric,
  feeMetric,
  onModuleHover,
}: {
  student: HeroStudent
  linkedModule: string
  hoveredModule: string | null
  studentsMetric: number
  feeMetric: number
  onModuleHover: (module: string | null) => void
}) {
  const activeModule = hoveredModule ?? linkedModule

  const renderNavItem = (item: (typeof HERO_SIDEBAR_NAV)[number], compact = false) => {
    const Icon = item.icon
    const isActive = item.module === activeModule
    const isLinked = item.module === linkedModule

    return (
      <button
        key={`${compact ? "m" : "d"}-${item.label}`}
        type="button"
        onMouseEnter={() => item.module && onModuleHover(item.module)}
        onMouseLeave={() => onModuleHover(null)}
        onFocus={() => item.module && onModuleHover(item.module)}
        onBlur={() => onModuleHover(null)}
        className={`flex transition-colors ${
          compact
            ? `min-w-0 flex-1 flex-col items-center gap-0.5 py-1.5 ${
                isActive ? "text-[#0073ea]" : "text-slate-500"
              }`
            : `w-full flex-col items-center gap-0.5 px-1 py-1.5 ${
                isActive ? "text-[#0073ea]" : "text-slate-500 hover:text-slate-700"
              }`
        }`}
      >
        <span
          className={`flex items-center justify-center rounded-lg ${
            compact ? "h-8 w-8" : "h-8 w-8 sm:h-9 sm:w-9"
          } ${isActive || isLinked ? "bg-[#dcebfd]" : ""}`}
        >
          <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} />
        </span>
        <span
          className={`truncate text-center font-medium leading-tight ${
            compact ? "max-w-[56px] text-[8px]" : "max-w-[48px] text-[8px] sm:text-[9px]"
          }`}
        >
          {item.shortLabel}
        </span>
      </button>
    )
  }

  return (
    <div
      key={student.id}
      className="hero-profile-in flex w-full min-h-[320px] max-h-[min(520px,68dvh)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_56px_-10px_rgba(0,0,0,0.42)] sm:min-h-[380px] sm:max-h-[min(580px,68dvh)] md:min-h-[420px] md:max-h-[min(640px,72dvh)] md:flex-row md:items-start lg:min-h-[480px] lg:max-h-none xl:min-h-[520px] xl:shadow-[0_28px_72px_-14px_rgba(0,0,0,0.5)]"
    >
      {/* Icon rail — desktop / tablet */}
      <aside className="hidden shrink-0 flex-col items-center border-slate-200/70 bg-white py-2.5 md:flex md:w-[52px] lg:w-[56px] md:border-r">
        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-[10px] font-bold text-white">
          SQ
        </div>
        <nav className="flex flex-1 flex-col items-center gap-0.5">
          {HERO_SIDEBAR_NAV.map((item) => renderNavItem(item))}
        </nav>
      </aside>

      {/* Main canvas */}
      <div className="flex min-w-0 flex-col bg-white md:flex-1">
        {/* App header */}
        <header className="flex shrink-0 items-center gap-1.5 border-b border-slate-200/60 px-2.5 py-2 sm:gap-2 sm:px-3 sm:py-2.5 md:px-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-900 sm:text-sm">Dashboard</p>
            <p className="truncate text-[9px] text-slate-400 sm:text-[10px] md:hidden">
              Term 2, 2026
            </p>
            <p className="hidden truncate text-[10px] text-slate-400 md:block">
              Overview of your school · Term 2, 2026
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 ring-1 ring-emerald-100 sm:px-2">
            <Radio className="h-2.5 w-2.5 text-emerald-600 sm:h-3 sm:w-3" />
            <span className="text-[8px] font-bold uppercase tracking-wide text-emerald-700 sm:text-[9px]">Live</span>
          </span>
          <button
            type="button"
            className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 sm:flex"
            aria-hidden
          >
            <Bell className="h-3.5 w-3.5" />
          </button>
          <div className="h-6 w-6 shrink-0 rounded-full bg-emerald-100 ring-1 ring-emerald-200 sm:h-7 sm:w-7" />
        </header>

        <div className="space-y-2 overflow-y-auto bg-slate-50 p-2 sm:space-y-2.5 sm:p-2.5 md:p-3 lg:overflow-visible [scrollbar-width:thin]">
          {/* Stat bar */}
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {[
              { label: "Students", value: studentsMetric.toLocaleString() },
              { label: "Teachers", value: "48" },
              { label: "Fees", value: `${feeMetric}%` },
              { label: "Attendance", value: "96%" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-md border border-slate-100 bg-white px-2 py-1.5 sm:px-2.5 sm:py-2"
              >
                <p className="text-[7px] font-medium uppercase tracking-wide text-slate-400 sm:text-[9px]">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold tabular-nums text-slate-800 sm:text-sm">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Student search */}
          <div className="rounded-lg border border-slate-200/80 bg-white p-2 shadow-sm sm:p-2.5 md:p-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-slate-800 sm:text-sm">
                {student.name}
              </span>
              <span
                className={`max-w-[42%] shrink-0 truncate rounded-full px-1.5 py-0.5 text-[8px] font-semibold sm:max-w-none sm:px-2 sm:text-[10px] ${HERO_STUDENT_STATUS_COLORS[student.statusType]}`}
              >
                {student.status}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-[9px] text-slate-500 sm:mt-1.5 sm:text-[11px]">
              <span className="h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
              <span className="line-clamp-2 sm:truncate">{student.detail}</span>
            </p>
          </div>

          {/* Module summary */}
          <div className="grid grid-cols-2 gap-1.5">
            {HERO_DASHBOARD_MODULES.map((mod) => {
              const isLinked = mod.module === linkedModule
              const metric = getHeroModuleMetric(mod.label, student, studentsMetric, feeMetric)
              const Icon = mod.icon
              return (
                <div
                  key={mod.label}
                  onMouseEnter={() => onModuleHover(mod.module)}
                  onMouseLeave={() => onModuleHover(null)}
                  className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors sm:px-2.5 sm:py-2 ${
                    isLinked ? "border-emerald-200 bg-emerald-50/90" : "border-slate-200/70 bg-white"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md sm:h-8 sm:w-8 ${
                      isLinked ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-[10px] sm:text-[11px] ${
                        isLinked ? "font-semibold text-slate-900" : "font-medium text-slate-600"
                      }`}
                    >
                      {mod.label}
                    </p>
                    <p
                      className={`truncate text-[9px] tabular-nums sm:text-[10px] ${
                        isLinked ? "font-semibold text-emerald-700" : "text-slate-500"
                      }`}
                    >
                      {metric}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Activity feed — scroll on small screens; full list on desktop */}
          <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-2 py-1.5 sm:px-2.5 sm:py-2 md:px-3">
              <p className="text-[10px] font-semibold text-slate-700 sm:text-[11px]">Recent activity</p>
              <p className="text-[9px] text-slate-400">Today</p>
            </div>
            <div className="max-h-[108px] divide-y divide-slate-100 overflow-y-auto sm:max-h-[132px] md:max-h-[148px] lg:max-h-none lg:overflow-visible [scrollbar-width:thin]">
              {HERO_ACTIVITY_ROWS.map((row) => {
                const rowStudent = HERO_STUDENTS.find((s) => s.id === row.id)!
                const isSelected = row.id === student.id
                return (
                  <div
                    key={row.id}
                    className={`flex items-center gap-1.5 px-2 py-1.5 sm:gap-2 sm:px-2.5 sm:py-2 md:px-3 md:py-2.5 ${
                      isSelected ? "bg-emerald-50/60" : ""
                    }`}
                  >
                    <div className="h-5 w-5 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200 sm:h-6 sm:w-6 md:h-7 md:w-7">
                      <img
                        src={rowStudent.src}
                        alt=""
                        className="h-full w-full object-cover object-[center_20%] scale-[1.55]"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate text-[9px] sm:text-[10px] md:text-[11px] ${
                          isSelected ? "font-semibold text-slate-900" : "font-medium text-slate-700"
                        }`}
                      >
                        {row.title}
                      </p>
                      <p className="hidden truncate text-[9px] text-slate-500 sm:block sm:text-[10px]">
                        {row.meta}
                      </p>
                    </div>
                    <span className="shrink-0 text-[8px] tabular-nums text-slate-400 sm:text-[9px]">{row.time}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Status footer */}
        <div className="flex shrink-0 items-center gap-1.5 border-t border-slate-200/60 bg-slate-50/80 px-2.5 py-1.5 sm:gap-2 sm:px-3 sm:py-2 md:px-4">
          <div className="h-5 w-5 shrink-0 overflow-hidden rounded-full ring-1 ring-slate-200 sm:h-6 sm:w-6">
            <img src={student.src} alt="" className="h-full w-full object-cover object-[center_20%] scale-[1.55]" />
          </div>
          <p className="min-w-0 text-[9px] leading-snug text-slate-600 sm:text-[10px] md:text-[11px]">
            <span className="font-semibold text-slate-800">{student.shortName}</span>
            <span className="text-slate-400"> — </span>
            <span className="line-clamp-2 md:truncate">{student.insight}</span>
          </p>
        </div>

        {/* Mobile bottom nav — matches school app */}
        <nav className="flex shrink-0 items-center border-t border-slate-200/70 bg-white px-1 py-0.5 md:hidden">
          {HERO_SIDEBAR_NAV.map((item) => renderNavItem(item, true))}
        </nav>
      </div>
    </div>
  )
}

function HeroLiveDemoStrip({
  selectedStudent,
  selectedStudentId,
  onSelectStudent,
}: {
  selectedStudent: HeroStudent
  selectedStudentId: string
  onSelectStudent: (id: string) => void
}) {
  return (
    <div className="mt-5 w-full rounded-xl border border-white/15 bg-black/25 p-3.5 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
          See it update live
        </p>
        <p className="text-[10px] text-white/45">Tap a student →</p>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex shrink-0 -space-x-2.5">
          {HERO_STUDENTS.map((student, i) => {
            const isSelected = student.id === selectedStudentId
            return (
              <button
                key={student.id}
                type="button"
                onClick={() => onSelectStudent(student.id)}
                className={`hero-stat-pop relative h-9 w-9 overflow-hidden rounded-full ring-2 transition-all hover:z-10 hover:scale-105 sm:h-10 sm:w-10 ${
                  isSelected
                    ? "ring-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.35)]"
                    : "ring-[#0a1f1a]/80 hover:ring-emerald-400/60"
                }`}
                style={{ animationDelay: `${500 + i * 70}ms` }}
                aria-label={`${student.name}, ${student.status}`}
                aria-pressed={isSelected}
              >
                <img
                  src={student.src}
                  alt=""
                  className="h-full w-full object-cover object-[center_20%] scale-[1.55]"
                />
              </button>
            )
          })}
        </div>
        <p
          key={selectedStudent.id}
          className="hero-profile-in min-w-0 flex-1 text-left text-sm font-medium leading-snug text-white"
        >
          {selectedStudent.pitchLine}
        </p>
      </div>
    </div>
  )
}

function HeroTrustBar() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#0a1f1a]/92 shadow-[0_16px_56px_rgba(0,0,0,0.55)] backdrop-blur-lg">
      <div className="border-b border-white/10 px-4 py-3 text-center sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70">
          Trusted across Kenya
        </p>
      </div>
      <div className="grid grid-cols-2 divide-x divide-y divide-white/10 sm:grid-cols-4 sm:divide-y-0">
        {HERO_TRUST_STATS.map((stat, i) => (
          <HeroTrustStat
            key={stat.label}
            target={stat.target}
            format={stat.format}
            label={stat.label}
            delay={i * 100}
            decimals={"decimals" in stat ? stat.decimals : undefined}
          />
        ))}
      </div>
    </div>
  )
}

function HeroTrustStat({
  target,
  format,
  label,
  delay = 0,
  decimals,
}: {
  target: number
  format: (v: number) => string
  label: string
  delay?: number
  decimals?: number
}) {
  const { value } = useAnimatedNumber(target, {
    delay: delay + 300,
    decimals: decimals ?? (Number.isInteger(target) ? 0 : 1),
  })
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-3 py-4 text-center sm:px-5 sm:py-5">
      <p className="text-lg font-bold tabular-nums text-white sm:text-xl">{format(value)}</p>
      <p className="mt-1 max-w-[10rem] text-[10px] leading-snug text-white/65 sm:text-[11px]">{label}</p>
    </div>
  )
}

type HeroStudent = {
  id: string
  src: string
  name: string
  shortName: string
  class: string
  status: string
  statusType: "fees" | "attendance" | "admission" | "exams"
  detail: string
  metric: { label: string; value: string }
  enrolled: string
  guardian: string
  lastUpdate: string
  pitchLine: string
  insight: string
  moduleMetric: string
  activity?: string
}

const HERO_STUDENT_STATUS_COLORS: Record<HeroStudent["statusType"], string> = {
  fees: "bg-emerald-100 text-emerald-700",
  attendance: "bg-sky-100 text-sky-700",
  admission: "bg-amber-100 text-amber-700",
  exams: "bg-violet-100 text-violet-700",
}

const HERO_STUDENT_MODULE_MAP: Record<HeroStudent["statusType"], string> = {
  fees: "Fees",
  attendance: "Students",
  admission: "Students",
  exams: "Exams",
}

const HERO_DEMO_STATS = {
  students: { target: 1284, delta: "+156 this term" },
  feeCollection: { target: 94, delta: "+12% vs last term" },
  feesCollected: { target: 4.8, delta: "+820K this month" },
} as const

const HERO_DASHBOARD_MODULES = [
  { label: "Students", module: "Students" as const, icon: Users2, metricKey: "students" as const, format: (v: number) => `${v.toLocaleString()} enrolled` },
  { label: "Fees", module: "Fees" as const, icon: CreditCard, metricKey: "feeCollection" as const, format: (v: number) => `M-Pesa · ${v}% collected` },
  { label: "Exams", module: "Exams" as const, icon: FileCheck, metricStatic: "CBC · 12 scheduled" },
  { label: "Timetable", module: "Timetable" as const, icon: Clock, metricStatic: "38 classes · Week 6" },
] as const

const HERO_SIDEBAR_NAV = [
  { label: "Home", shortLabel: "Home", icon: LayoutGrid, module: null },
  { label: "Students", shortLabel: "Students", icon: Users2, module: "Students" },
  { label: "Fees", shortLabel: "Fees", icon: CreditCard, module: "Fees" },
  { label: "Exams", shortLabel: "Exams", icon: FileCheck, module: "Exams" },
  { label: "Schedule", shortLabel: "Schedule", icon: Clock, module: "Timetable" },
] as const

const HERO_ACTIVITY_ROWS = [
  { id: "amina", time: "10:14 AM", title: "M-Pesa payment received", meta: "KES 12,400 · receipt sent to parent" },
  { id: "brian", time: "8:02 AM", title: "Attendance marked present", meta: "Parent notified via SMS" },
  { id: "grace", time: "8:45 AM", title: "Admission #2043 created", meta: "Class assigned · ID issued" },
  { id: "david", time: "7:30 AM", title: "CBC assessment scheduled", meta: "Fee reminder sent · parent notified" },
] as const

const HERO_TRUST_STATS = [
  { target: 340, format: (v: number) => `${Math.round(v)}+`, label: "Schools across Kenya" },
  { target: 50000, format: (v: number) => `${Math.round(v).toLocaleString()}+`, label: "Students managed" },
  { target: 3500, format: (v: number) => `${Math.round(v).toLocaleString()}+`, label: "Parents updated daily" },
  { target: 99.9, format: (v: number) => `${v.toFixed(1)}%`, label: "Uptime", decimals: 1 as const },
] as const

const HERO_DEFAULT_STUDENT_ID = "grace"

const HERO_STUDENTS: HeroStudent[] = [
  {
    id: "grace",
    src: "/students/student3.png",
    name: "Grace Wanjiku",
    shortName: "Grace W.",
    class: "Form 1 West",
    status: "Admission #2043",
    statusType: "admission",
    detail: "Profile created · guardian linked · class assigned",
    metric: { label: "Admission", value: "#2043" },
    enrolled: "Today",
    guardian: "Anne Wanjiku",
    lastUpdate: "Admitted 8:45 AM",
    pitchLine: "Admission #2043 · profile created in 2 min",
    insight: "Admission #2043 · class assigned · ID issued",
    moduleMetric: "Admission #2043 · today",
    activity: "Admission #2043 · guardian linked",
  },
  {
    id: "amina",
    src: "/students/student1.png",
    name: "Amina Karanja",
    shortName: "Amina K.",
    class: "Form 2 East",
    status: "M-Pesa received",
    statusType: "fees",
    detail: "Receipt auto-sent · parent notified via SMS",
    metric: { label: "Payment", value: "KES 12,400" },
    enrolled: "Jan 2026",
    guardian: "Mary Karanja",
    lastUpdate: "Paid 10:14 AM today",
    pitchLine: "M-Pesa payment matched instantly",
    insight: "Fee receipt sent to parent automatically",
    moduleMetric: "M-Pesa received · KES 12,400",
  },
  {
    id: "brian",
    src: "/students/student2.png",
    name: "Brian Ochieng",
    shortName: "Brian O.",
    class: "Grade 8 Blue",
    status: "Present today",
    statusType: "attendance",
    detail: "Roll call logged · parent SMS sent 8:02 AM",
    metric: { label: "Attendance", value: "98%" },
    enrolled: "2024",
    guardian: "James Ochieng",
    lastUpdate: "Marked present 8:02 AM",
    pitchLine: "Parent notified via SMS",
    insight: "Present · parent SMS sent 8:02 AM",
    moduleMetric: "Present · SMS sent 8:02 AM",
  },
  {
    id: "david",
    src: "/students/student4.png",
    name: "David Mutua",
    shortName: "David M.",
    class: "Grade 7",
    status: "CBC assessment",
    statusType: "exams",
    detail: "CBC assessment Fri · fee reminder already sent",
    metric: { label: "Next exam", value: "Fri, 9 AM" },
    enrolled: "2023",
    guardian: "Peter Mutua",
    lastUpdate: "Reminder sent 7:30 AM",
    pitchLine: "Exam reminder sent · parent notified via SMS",
    insight: "CBC assessment · Fri 9 AM · parent notified",
    moduleMetric: "CBC assessment · Fri 9 AM",
    activity: "Fee reminder sent · parent notified",
  },
]

function getHeroModuleMetric(
  modLabel: string,
  selectedStudent: HeroStudent,
  studentsMetric: number,
  feeMetric: number
) {
  const linkedModule = HERO_STUDENT_MODULE_MAP[selectedStudent.statusType]
  if (modLabel === linkedModule) return selectedStudent.moduleMetric

  const mod = HERO_DASHBOARD_MODULES.find((m) => m.label === modLabel)
  if (!mod) return ""
  if ("metricKey" in mod && mod.metricKey === "students") return mod.format(studentsMetric)
  if ("metricKey" in mod && mod.metricKey === "feeCollection") return mod.format(feeMetric)
  if ("metricStatic" in mod) return mod.metricStatic
  return ""
}

export default function Home() {
  const { students } = useStudentsStore()
  const { config } = useSchoolConfigStore()
  const [hoveredModule, setHoveredModule] = useState<string | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState(HERO_DEFAULT_STUDENT_ID)
  const [demoPaused, setDemoPaused] = useState(false)
  const studentsMetric = useAnimatedNumber(HERO_DEMO_STATS.students.target, { delay: 400 })
  const feeMetric = useAnimatedNumber(HERO_DEMO_STATS.feeCollection.target, { delay: 500 })

  const selectedStudent = HERO_STUDENTS.find((s) => s.id === selectedStudentId) ?? HERO_STUDENTS[0]
  const linkedModule = HERO_STUDENT_MODULE_MAP[selectedStudent.statusType]

  const selectStudent = (id: string) => {
    setSelectedStudentId(id)
  }

  useEffect(() => {
    if (demoPaused) return
    const timer = window.setInterval(() => {
      setSelectedStudentId((prev) => {
        const idx = HERO_STUDENTS.findIndex((s) => s.id === prev)
        const next = HERO_STUDENTS[(idx + 1) % HERO_STUDENTS.length]
        return next.id
      })
    }, 6500)
    return () => window.clearInterval(timer)
  }, [demoPaused])
  
  // Calculate real statistics from the stores
  const stats = useMemo(() => {
    const totalStudents = students.length
    const activeStudents = students.filter(s => s.isActive).length
    const totalFeesOwed = students.reduce((sum, s) => sum + s.feesOwed, 0)
    const totalFeesPaid = students.reduce((sum, s) => sum + s.totalFeesPaid, 0)
    const totalClasses = mockClasses.filter(c => c.status === 'active').length
    const totalSubjects = config?.selectedLevels.reduce((sum, level) => sum + level.subjects.length, 0) || 0
    
    // Calculate gender distribution
    const maleStudents = students.filter(s => s.gender.toLowerCase() === 'male').length
    const femaleStudents = students.filter(s => s.gender.toLowerCase() === 'female').length
    
    // Calculate fee collection rate
    const feeCollectionRate = totalFeesPaid > 0 ? Math.round((totalFeesPaid / (totalFeesPaid + totalFeesOwed)) * 100) : 0
    
    return {
      totalStudents,
      activeStudents,
      totalFeesOwed,
      totalFeesPaid,
      totalClasses,
      totalSubjects,
      maleStudents,
      femaleStudents,
      feeCollectionRate
    }
  }, [students, config])

  return (
    <div className="squl-marketing bg-background font-sans">
      {/* Hero — two-column pitch + product preview */}
      <section className="relative overflow-x-hidden bg-[#0f2923]">
        <Header variant="hero" />

        <div className="absolute inset-0">
          <img
            src="/students/sq.png"
            alt=""
            aria-hidden
            className="h-full w-full object-cover object-[42%_center] lg:object-[55%_center]"
          />
          <div className="absolute inset-0 bg-[#0a1f1a]/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1f1a] from-0% via-[#0a1f1a]/95 via-50% to-[#0a1f1a]/55 to-100% lg:via-[#0a1f1a]/88 lg:to-[#0a1f1a]/25" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1f1a]/90 via-transparent via-60% to-[#0f2923]" />
          <div className="landing-hero-tail pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 sm:h-48 lg:h-56" aria-hidden />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-0 pt-[4.5rem] sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-7 sm:gap-8 lg:grid-cols-12 lg:items-start lg:gap-8 lg:pt-3 xl:gap-10">
            {/* Left — pitch */}
            <div
              className="relative z-20 order-1 flex w-full min-w-0 flex-col justify-self-center rounded-2xl border border-white/15 bg-[#0a1f1a]/92 px-5 py-6 text-center shadow-[0_16px_56px_rgba(0,0,0,0.55)] backdrop-blur-lg sm:px-6 sm:py-7 lg:order-none lg:col-span-6 lg:h-auto lg:justify-self-auto lg:text-left xl:col-span-5"
              onMouseEnter={() => setDemoPaused(true)}
              onMouseLeave={() => setDemoPaused(false)}
            >
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border-0 bg-white px-3 py-1.5 text-xs font-semibold text-[#0a1f1a] shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Built for Kenyan schools
              </div>

              <h1 className="font-display w-full leading-[1.06] tracking-tight text-white drop-shadow-[0_2px_28px_rgba(0,0,0,0.9)]">
                <span className="block text-[1.7rem] tracking-[0.01em] sm:text-[2rem] lg:whitespace-nowrap lg:text-[2.28rem] xl:text-[2.35rem]">
                  Stop running your school through
                </span>
                <span className="mt-1 block text-[1.7rem] italic text-emerald-200 drop-shadow-[0_2px_20px_rgba(0,0,0,0.85)] sm:text-[2rem] sm:whitespace-nowrap lg:text-[2.35rem] xl:text-[2.42rem]">
                  WhatsApp, Excel &amp; paper
                </span>
              </h1>

              <p className="mt-3 font-sans text-sm leading-relaxed text-pretty text-white/95 sm:mt-3.5 sm:text-[15px] lg:text-[15px] xl:text-base">
                Trusted by schools across Kenya to manage admissions, fees, academics, exams, and parent communication.
              </p>

              <HeroLiveDemoStrip
                selectedStudent={selectedStudent}
                selectedStudentId={selectedStudentId}
                onSelectStudent={selectStudent}
              />

              <div className="mt-6 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="h-12 w-full border-0 bg-emerald-500 px-8 text-sm font-semibold text-white shadow-lg shadow-emerald-950/40 hover:bg-emerald-400 sm:h-[3.25rem] sm:w-auto sm:px-10 sm:text-base"
                  >
                    Start Your Free Term
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-11 w-full border-white/50 bg-white/10 px-6 text-sm font-semibold text-white shadow-sm backdrop-blur-sm hover:bg-white/20 hover:text-white sm:w-auto"
                  >
                    <Play className="mr-2 h-3.5 w-3.5 fill-white" />
                    See a demo
                  </Button>
                </Link>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-white/90 sm:text-sm">
                90-Day Free Trial · Full School Term Access · No Credit Card Required
              </p>
            </div>

            {/* Right — dashboard preview */}
            <div
              className="relative order-2 z-10 w-full min-w-0 lg:order-none lg:col-span-6 xl:col-span-7"
              onMouseEnter={() => setDemoPaused(true)}
              onMouseLeave={() => setDemoPaused(false)}
            >
              <HeroDashboardPanel
                student={selectedStudent}
                linkedModule={linkedModule}
                hoveredModule={hoveredModule}
                studentsMetric={studentsMetric.value}
                feeMetric={feeMetric.value}
                onModuleHover={setHoveredModule}
              />
            </div>
          </div>

          <div className="mt-6 sm:mt-7 lg:mt-8">
            <HeroTrustBar />
          </div>

          {/* Feature cards — dark zone, continuous with hero */}
          <div className="relative mt-8 pb-10 sm:mt-10 sm:pb-12 lg:mt-10 lg:pb-14">
            <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55 sm:mb-7">
              What you get
            </p>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 md:gap-7 [&>div]:md:min-h-[19.5rem]">
              {LANDING_FEATURE_CARDS.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex h-full flex-col rounded-2xl border border-white/15 bg-[#0a1f1a]/88 p-9 shadow-[0_16px_48px_rgba(0,0,0,0.4)] backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-[#0a1f1a]/95 sm:p-10"
                >
                  <div className="mb-7 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-600 shadow-sm sm:h-[3.25rem] sm:w-[3.25rem]">
                    <Icon className="h-6 w-6 text-white sm:h-7 sm:w-7" strokeWidth={1.75} aria-hidden />
                  </div>
                  <h3 className="mb-4 shrink-0 text-lg text-white sm:text-xl">{title}</h3>
                  <p className="min-h-[6.5rem] flex-1 text-sm leading-[1.7] text-white/75 sm:min-h-[6.75rem] sm:text-[15px]">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="relative">
        {/* Second screen — blends from dark hero into light content */}
        <section className="landing-section-blend relative -mt-px overflow-hidden pb-24 sm:pb-28">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[min(480px,55vh)] overflow-hidden opacity-[0.18]" aria-hidden>
            <img
              src="/students/sq.png"
              alt=""
              className="h-full w-full object-cover object-[50%_25%] lg:object-[58%_30%]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f2923]/90 via-[#1a332c]/75 to-transparent" />
          </div>
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-[38%] left-1/4 h-[55%] w-px bg-gradient-to-b from-primary/15 via-primary/25 to-transparent" />
            <div className="absolute top-[38%] right-1/4 h-[55%] w-px bg-gradient-to-b from-primary/15 via-primary/25 to-transparent" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">
            <div className="relative mb-12 sm:mb-14">
              <div className="overflow-hidden rounded-2xl border border-white/30 bg-white/95 shadow-[0_24px_64px_rgba(10,31,26,0.18)] backdrop-blur-md">
                <div className="absolute left-0 top-0 hidden h-full w-1 bg-gradient-to-b from-emerald-500 to-emerald-700/40 sm:block" />
                <div className="px-6 py-8 sm:px-8 sm:py-9 lg:pl-10">
                  <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1d5547] sm:text-left">
                    Beyond the dashboard
                  </p>
                  <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:items-center sm:gap-10 sm:text-left">
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-4xl leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
                        Run admissions, fees, and CBC
                        <span className="block text-[#1d5547]">from one Kenyan-built system</span>
                      </h2>
                      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
                        SQUL keeps your bursar, teachers, and parents on the same page—M-Pesa receipts, class lists, CBC marks, and SMS updates stay in sync from opening day through Term 3 reports.
                      </p>
                    </div>
                    <LandingTermReadyBadge />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 md:gap-7 lg:grid-cols-3 lg:gap-8">
              {LANDING_PLATFORM_MODULES.map((feature, index) => {
                return (
                  <div key={feature.title} className="group relative">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-600/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative flex h-full flex-col rounded-xl border border-emerald-900/10 bg-white p-8 shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-[#1d5547]/25 group-hover:shadow-md">
                      <div className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-sm border border-emerald-900/10 bg-white font-ui text-xs font-semibold tabular-nums text-[#1d5547] shadow-sm">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <LandingPlatformIcon icon={feature.icon} />
                      <h3 className="mb-3 font-display text-xl leading-snug text-slate-900">
                        {feature.title}
                      </h3>
                      <p className="mb-6 flex-grow text-sm leading-relaxed text-slate-600">
                        {feature.description}
                      </p>
                      <span className="font-ui w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-[#1d5547] ring-1 ring-emerald-100">
                        {feature.highlight}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="relative mt-16 overflow-hidden rounded-2xl border border-[#1d5547]/15 bg-gradient-to-r from-[#1d5547]/8 via-white to-[#1d5547]/8 sm:mt-20">
              <div className="relative flex flex-col items-center gap-8 p-8 sm:p-10 md:flex-row md:justify-between md:gap-10">
                <div className="text-center md:text-left">
                  <h3 className="font-display text-2xl tracking-tight text-slate-900 sm:text-[1.65rem]">
                    Ready to run your next term on SQUL?
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 sm:text-base">
                    90-day free trial · full term access · no credit card
                  </p>
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12 w-full border-[#1d5547]/30 px-6 font-semibold text-[#1d5547] hover:bg-emerald-50 sm:w-auto"
                    >
                      See Platform
                    </Button>
                  </Link>
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="h-12 w-full border-0 bg-[#1d5547] px-8 font-semibold text-white shadow-md hover:bg-[#2d8570] sm:w-auto"
                    >
                      Start Free
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Third screen — day-to-day workflows */}
        <section className="relative border-t border-emerald-900/8 bg-gradient-to-b from-white via-[#f6faf8] to-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative mb-12 sm:mb-14">
              <div className="relative overflow-hidden rounded-2xl border border-emerald-900/10 bg-white px-6 py-8 shadow-sm sm:px-8 sm:py-9">
                <div className="absolute left-0 top-0 hidden h-full w-1 bg-gradient-to-b from-emerald-500 to-[#1d5547]/40 sm:block" />
                <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1d5547] sm:pl-6 sm:text-left">
                  How schools run day to day
                </p>
                <h2 className="font-display text-center text-4xl leading-[1.1] tracking-tight text-slate-900 sm:pl-6 sm:text-left md:text-5xl">
                  Everything your admin team touches—
                  <span className="block text-[#1d5547]">in one Kenyan-built system</span>
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-center text-lg leading-relaxed text-slate-600 sm:pl-6 sm:text-left">
                  From CBC marks in the staff room to M-Pesa in the bursar&apos;s office—SQUL connects the workflows your team already runs, without forcing a new way of working.
                </p>
              </div>
            </div>

            <div className="grid gap-8">
              <div className="grid gap-8 md:grid-cols-2">
                {LANDING_WORKFLOW_BLOCKS.slice(0, 2).map((block) => (
                  <LandingWorkflowCard key={block.id} {...block} />
                ))}
              </div>

              <LandingBursarSnapshot
                activeStudents={stats.activeStudents}
                feeCollectionRate={stats.feeCollectionRate}
                totalClasses={stats.totalClasses}
                totalSubjects={stats.totalSubjects}
              />

              <div className="grid gap-8 md:grid-cols-2">
                {LANDING_WORKFLOW_BLOCKS.slice(2, 4).map((block) => (
                  <LandingWorkflowCard key={block.id} {...block} />
                ))}
              </div>
            </div>

            <div className="relative mt-16 overflow-hidden rounded-2xl border border-[#1d5547]/15 bg-gradient-to-r from-[#1d5547]/8 via-white to-[#1d5547]/8 sm:mt-20">
              <div className="relative flex flex-col items-center gap-8 p-8 sm:p-10 md:flex-row md:justify-between">
                <div className="text-center md:text-left">
                  <h3 className="font-display text-2xl tracking-tight text-slate-900">
                    See how SQUL fits your school
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 sm:text-base">
                    Walk through fees, admissions, and CBC with your team—free for a full term.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12 w-full border-[#1d5547]/30 px-6 font-semibold text-[#1d5547] hover:bg-emerald-50 sm:w-auto"
                    >
                      Book a walkthrough
                    </Button>
                  </Link>
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="h-12 w-full border-0 bg-[#1d5547] px-8 font-semibold text-white shadow-md hover:bg-[#2d8570] sm:w-auto"
                    >
                      Start free term
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fourth screen — in the schoolroom */}
        <section className="relative border-t border-emerald-900/10 bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative mb-14 sm:mb-20">
              <div className="relative overflow-hidden rounded-2xl border border-emerald-900/10 bg-[#f6faf8] px-6 py-8 sm:px-8 sm:py-9">
                <div className="absolute left-0 top-0 hidden h-full w-1 bg-gradient-to-b from-emerald-500 to-[#1d5547]/40 sm:block" />
                <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1d5547] sm:pl-6 sm:text-left">
                  Built for real schoolrooms
                </p>
                <h2 className="font-display text-center text-4xl leading-[1.1] tracking-tight text-slate-900 sm:pl-6 sm:text-left md:text-5xl">
                  See SQUL in the work
                  <span className="block text-[#1d5547]">your team already does</span>
                </h2>
                <p className="mx-auto mt-5 max-w-3xl text-center text-lg leading-relaxed text-slate-600 sm:pl-6 sm:text-left">
                  Kenyan classrooms, bursar counters, and staff rooms—not stock photos of generic offices. Each block below maps to a job your administrators run every week.
                </p>
              </div>
            </div>

            <div className="space-y-20 sm:space-y-24">
              {LANDING_DEEP_DIVES.map((dive) => (
                <LandingDeepDiveBlock key={dive.id} {...dive} />
              ))}
            </div>
          </div>
        </section>

        {/* Fifth screen — questions principals & bursars ask */}
        <section className="relative border-t border-emerald-900/10 bg-gradient-to-b from-[#f6faf8] to-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative mb-12 sm:mb-14">
              <div className="relative overflow-hidden rounded-2xl border border-emerald-900/10 bg-white px-6 py-8 shadow-sm sm:px-8 sm:py-9">
                <div className="absolute left-0 top-0 hidden h-full w-1 bg-gradient-to-b from-emerald-500 to-[#1d5547]/40 sm:block" />
                <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1d5547] sm:pl-6 sm:text-left">
                  Before you sign up
                </p>
                <h2 className="font-display text-center text-4xl leading-[1.1] tracking-tight text-slate-900 sm:pl-6 sm:text-left md:text-5xl">
                  Questions principals
                  <span className="block text-[#1d5547]">and bursars ask us</span>
                </h2>
                <p className="mx-auto mt-5 max-w-2xl text-center text-lg leading-relaxed text-slate-600 sm:pl-6 sm:text-left">
                  Straight answers about data, timelines, parents, and phones—no enterprise jargon.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {LANDING_FAQ_ITEMS.map((item) => (
                <LandingFaqCard key={item.question} {...item} />
              ))}
            </div>

            <div className="relative mt-14 overflow-hidden rounded-2xl border border-[#1d5547]/15 bg-gradient-to-r from-[#1d5547]/8 via-white to-[#1d5547]/8 sm:mt-16">
              <div className="relative flex flex-col items-center gap-8 p-8 sm:p-10 md:flex-row md:justify-between">
                <div className="text-center md:text-left">
                  <h3 className="font-display text-2xl tracking-tight text-slate-900">
                    Still deciding for next term?
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 sm:text-base">
                    Talk to us about your learner list, fee structure, and go-live date—90-day trial, no card required.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12 w-full border-[#1d5547]/30 px-6 font-semibold text-[#1d5547] hover:bg-emerald-50 sm:w-auto"
                    >
                      Ask a question
                    </Button>
                  </Link>
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="h-12 w-full border-0 bg-[#1d5547] px-8 font-semibold text-white shadow-md hover:bg-[#2d8570] sm:w-auto"
                    >
                      Start free term
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative overflow-hidden border-t border-emerald-900/25 bg-[#0a1f1a] text-white">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#1d5547]/12 via-transparent to-[#1d5547]/8"
            aria-hidden
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 py-16 sm:py-20 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-5">
                <Link href="/" className="inline-flex items-center gap-3 transition-opacity hover:opacity-90">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#2d8570]/40 bg-gradient-to-b from-[#246a59] to-[#1a4c40]">
                    <GraduationCap size={20} className="text-white" aria-hidden />
                  </div>
                  <span className="font-display text-2xl tracking-wide text-white">SQUL</span>
                </Link>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
                  School management built for Kenyan classrooms—M-Pesa fees, CBC marks, admissions, and the day-to-day work bursars and principals already run.
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300/90">
                  90-day trial · No card required
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="h-11 w-full border-0 bg-[#1d5547] px-6 font-semibold text-white hover:bg-[#2d8570] sm:w-auto"
                    >
                      Start free term
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-11 w-full border-white/25 bg-transparent px-6 font-semibold text-white hover:bg-white/10 sm:w-auto"
                    >
                      Sign in
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
                <div>
                  <h3 className="font-ui text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300/90">
                    On the platform
                  </h3>
                  <ul className="mt-5 space-y-3">
                    {LANDING_FOOTER_PRODUCT_LINKS.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-white/65 transition-colors hover:text-emerald-200"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-ui text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300/90">
                    For your school
                  </h3>
                  <ul className="mt-5 space-y-3">
                    {LANDING_FOOTER_SCHOOL_LINKS.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-white/65 transition-colors hover:text-emerald-200"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-ui text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300/90">
                    Talk to us
                  </h3>
                  <ul className="mt-5 space-y-4">
                    <li>
                      <a
                        href="mailto:support@squl.edu"
                        className="flex items-start gap-3 text-sm text-white/65 transition-colors hover:text-emerald-200"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/8 ring-1 ring-white/10">
                          <Mail size={16} className="text-emerald-300/90" aria-hidden />
                        </span>
                        <span className="pt-1.5">support@squl.edu</span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="tel:+254700000000"
                        className="flex items-start gap-3 text-sm text-white/65 transition-colors hover:text-emerald-200"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/8 ring-1 ring-white/10">
                          <Phone size={16} className="text-emerald-300/90" aria-hidden />
                        </span>
                        <span className="pt-1.5">+254 700 000 000</span>
                      </a>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-white/65">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/8 ring-1 ring-white/10">
                        <MapPin size={16} className="text-emerald-300/90" aria-hidden />
                      </span>
                      <span className="pt-1.5 leading-relaxed">
                        Nairobi, Kenya
                        <span className="block text-white/45">Support for schools nationwide</span>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-8 sm:flex-row">
              <p className="text-center text-sm text-white/50 sm:text-left">
                © {new Date().getFullYear()} SQUL. Built for Kenyan schools.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                {["Privacy", "Terms"].map((text) => (
                  <Link
                    key={text}
                    href="/register"
                    className="text-white/50 transition-colors hover:text-emerald-200"
                  >
                    {text}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}