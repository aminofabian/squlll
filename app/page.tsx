'use client'

import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useStudentsStore } from "@/lib/stores/useStudentsStore"
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore"
import { mockClasses } from "@/lib/data/mockclasses"
import { useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
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
  Monitor,
  Star,
  UserCheck,
  Shield,
  Building2,
  CircleHelp,
  Mail,
  MapPin,
  Phone,
  type LucideIcon,
} from "lucide-react"

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
    <div className="mb-5 flex h-12 w-12 shrink-0 items-center justify-center bg-[#1d5547] shadow-md ring-1 ring-[#1d5547]/30">
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
    <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-[#1d5547] shadow-md ring-1 ring-[#1d5547]/25">
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
      <div className="relative flex h-full flex-col border border-emerald-900/10 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1d5547]/20 hover:shadow-md">
        <div className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center border border-emerald-900/10 bg-white font-ui text-xs font-semibold tabular-nums text-[#1d5547] shadow-sm">
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
              <span className="h-1.5 w-1.5 shrink-0 bg-emerald-600/70" />
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
    <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#1d5547] shadow-sm">
      <Icon size={18} strokeWidth={2} className="text-white" aria-hidden />
    </div>
  )
}

function LandingFaqCard({ icon, question, answer }: (typeof LANDING_FAQ_ITEMS)[number]) {
  return (
    <div className="h-full border border-emerald-900/10 bg-white p-6 shadow-sm transition-shadow hover:border-[#1d5547]/20 hover:shadow-md">
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

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${className} transition-all duration-700 ease-out will-change-transform motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      {children}
    </div>
  )
}

function LandingSectionHeader({
  kicker,
  title,
  description,
  tone = "white",
  wide = false,
}: {
  kicker: string
  title: ReactNode
  description: ReactNode
  tone?: "white" | "soft"
  wide?: boolean
}) {
  return (
    <Reveal>
      <div className="relative mb-12 sm:mb-14">
        <div
          className={`relative overflow-hidden border border-emerald-900/10 px-6 py-8 sm:px-8 sm:py-9 ${
            tone === "soft" ? "bg-[#f6faf8]" : "bg-white shadow-sm"
          }`}
        >
          <div className="absolute left-0 top-0 hidden h-full w-1 bg-gradient-to-b from-emerald-500 to-[#1d5547]/40 sm:block" />
          <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1d5547] sm:pl-6 sm:text-left">
            {kicker}
          </p>
          <h2 className="font-display text-center text-4xl leading-[1.1] tracking-tight text-slate-900 sm:pl-6 sm:text-left md:text-5xl">
            {title}
          </h2>
          <p
            className={`mx-auto mt-5 text-center text-lg leading-relaxed text-slate-600 sm:pl-6 sm:text-left ${
              wide ? "max-w-3xl" : "max-w-2xl"
            }`}
          >
            {description}
          </p>
        </div>
      </div>
    </Reveal>
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
            className="border border-emerald-900/10 bg-white px-5 py-4 shadow-sm"
          >
            <h4 className="font-ui text-sm font-semibold text-[#1d5547]">{item.title}</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )

  const visual = (
    <div className="relative overflow-hidden border border-emerald-900/10 shadow-[0_20px_50px_rgba(10,31,26,0.12)]">
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
      <div className="relative overflow-hidden border border-[#1d5547]/15 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center border border-emerald-900/10 bg-white font-ui text-xs font-semibold tabular-nums text-[#1d5547] shadow-sm">
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
                className="border border-emerald-900/8 bg-emerald-50/50 px-4 py-4 transition-colors group-hover:bg-emerald-50"
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
      <div className="absolute inset-0 bg-gradient-to-br from-[#e8f5f0] via-white to-[#dceee6] shadow-[0_10px_40px_rgba(29,85,71,0.14)] ring-1 ring-[#1d5547]/20" />
      <div className="absolute inset-[5px] border border-[#1d5547]/12" />
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

type HeroPreviewMode = "phone" | "desktop"

function HeroPreviewToggle({
  mode,
  onChange,
}: {
  mode: HeroPreviewMode
  onChange: (mode: HeroPreviewMode) => void
}) {
  return (
    <div
      className="mx-auto flex w-fit items-center gap-1 rounded-full border border-white/15 bg-[#0a1f1a]/80 p-1 shadow-lg backdrop-blur-md"
      role="group"
      aria-label="Preview layout"
    >
      <button
        type="button"
        onClick={() => onChange("phone")}
        aria-pressed={mode === "phone"}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
          mode === "phone"
            ? "bg-emerald-500 text-white shadow-sm"
            : "text-white/60 hover:text-white"
        }`}
      >
        <Smartphone className="h-3.5 w-3.5" strokeWidth={2} />
        App
      </button>
      <button
        type="button"
        onClick={() => onChange("desktop")}
        aria-pressed={mode === "desktop"}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
          mode === "desktop"
            ? "bg-emerald-500 text-white shadow-sm"
            : "text-white/60 hover:text-white"
        }`}
      >
        <Monitor className="h-3.5 w-3.5" strokeWidth={2} />
        Desktop
      </button>
    </div>
  )
}

function HeroPhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="hero-phone-frame relative mx-auto w-full max-w-[340px] sm:max-w-[360px]">
      <div className="relative overflow-hidden rounded-[2.15rem] bg-[#0b1210] p-[10px] shadow-[0_28px_80px_-16px_rgba(0,0,0,0.65)] ring-1 ring-white/15">
        {/* Side buttons */}
        <div className="pointer-events-none absolute -left-[2px] top-28 h-8 w-[3px] rounded-l-sm bg-white/20" />
        <div className="pointer-events-none absolute -left-[2px] top-40 h-12 w-[3px] rounded-l-sm bg-white/20" />
        <div className="pointer-events-none absolute -right-[2px] top-36 h-14 w-[3px] rounded-r-sm bg-white/20" />

        <div className="relative overflow-hidden rounded-[1.65rem] bg-white">
          {/* Dynamic Island */}
          <div className="pointer-events-none absolute left-1/2 top-2 z-30 h-[22px] w-[96px] -translate-x-1/2 rounded-full bg-black" />
          {children}
        </div>
      </div>
    </div>
  )
}

function HeroDesktopFrame({ children }: { children: ReactNode }) {
  return (
    <div className="hero-desktop-scene relative mx-auto w-full max-w-[820px] xl:max-w-[880px]">
      <div
        className="pointer-events-none absolute inset-x-[10%] -bottom-2 h-12 rounded-[100%] bg-black/35 blur-2xl"
        aria-hidden
      />

      {/* Desktop app window */}
      <div className="hero-desktop-window relative overflow-hidden rounded-xl bg-[#e8ecea] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.65)] ring-1 ring-white/20">
        {/* Title bar */}
        <div className="flex h-9 items-center gap-3 border-b border-black/5 bg-gradient-to-b from-[#f4f6f5] to-[#e4e9e7] px-3">
          <div className="flex items-center gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] shadow-[inset_0_-0.5px_0_rgba(0,0,0,0.15)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e] shadow-[inset_0_-0.5px_0_rgba(0,0,0,0.15)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] shadow-[inset_0_-0.5px_0_rgba(0,0,0,0.15)]" />
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-center">
            <div className="flex max-w-[240px] items-center gap-1.5 truncate rounded-md bg-white/70 px-3 py-1 text-[11px] font-medium text-slate-600 shadow-sm ring-1 ring-black/5">
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm bg-emerald-600 text-[7px] font-bold text-white">
                SQ
              </span>
              <span className="truncate">SQUL — School Admin</span>
            </div>
          </div>
          <div className="w-[42px]" aria-hidden />
        </div>

        {/* App content */}
        <div className="overflow-hidden bg-white">{children}</div>
      </div>

      {/* Monitor chin + stand */}
      <div className="relative mx-auto mt-0 flex flex-col items-center">
        <div className="h-2 w-full rounded-b-lg bg-gradient-to-b from-[#2a3330] to-[#141a18] shadow-md ring-1 ring-white/10" />
        <div className="h-8 w-16 bg-gradient-to-b from-[#3a4441] to-[#1c2220] sm:h-9 sm:w-[4.5rem]" />
        <div className="h-1.5 w-36 rounded-full bg-gradient-to-b from-[#2a3330] to-[#0e1211] shadow-[0_4px_12px_rgba(0,0,0,0.4)] ring-1 ring-white/10 sm:w-44" />
      </div>
    </div>
  )
}

function HeroDashboardPanel({
  student,
  linkedModule,
  hoveredModule,
  studentsMetric,
  feeMetric,
  teacherMetric,
  attendanceMetric,
  searchQuery,
  notificationsOpen,
  previewMode,
  onModuleHover,
  onSelectModule,
  onSelectStudent,
  onSearchChange,
  onToggleNotifications,
}: {
  student: HeroStudent
  linkedModule: string | null
  hoveredModule: string | null
  studentsMetric: number
  feeMetric: number
  teacherMetric: number
  attendanceMetric: number
  searchQuery: string
  notificationsOpen: boolean
  previewMode: HeroPreviewMode
  onModuleHover: (module: string | null) => void
  onSelectModule: (module: string | null) => void
  onSelectStudent: (id: string) => void
  onSearchChange: (query: string) => void
  onToggleNotifications: () => void
}) {
  const [searchFocused, setSearchFocused] = useState(false)
  const isPhone = previewMode === "phone"
  const activeModule = hoveredModule ?? linkedModule

  const searchMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    return HERO_STUDENTS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.shortName.toLowerCase().includes(q) ||
        s.class.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q) ||
        s.guardian.toLowerCase().includes(q)
    )
  }, [searchQuery])

  const showSearchResults = searchFocused && searchQuery.trim().length > 0

  const renderNavItem = (item: (typeof HERO_SIDEBAR_NAV)[number], compact = false) => {
    const Icon = item.icon
    const isActive =
      item.module === activeModule || (item.module === null && activeModule === null)
    const isLinked = item.module !== null && item.module === linkedModule

    if (compact && isPhone) {
      return (
        <button
          key={`p-${item.label}`}
          type="button"
          onClick={() => onSelectModule(item.module)}
          aria-pressed={isActive}
          aria-label={item.label}
          className={`flex min-w-0 flex-1 flex-col items-center gap-1 py-2 transition-colors ${
            isActive ? "text-emerald-600" : "text-slate-400"
          }`}
        >
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
              isActive ? "bg-emerald-50 text-emerald-600" : ""
            }`}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.25 : 1.75} />
          </span>
          <span className="max-w-[56px] truncate text-center text-[10px] font-semibold leading-none">
            {item.shortLabel}
          </span>
        </button>
      )
    }

    return (
      <button
        key={`${compact ? "m" : "d"}-${item.label}`}
        type="button"
        onClick={() => onSelectModule(item.module)}
        onMouseEnter={() => item.module && onModuleHover(item.module)}
        onMouseLeave={() => onModuleHover(null)}
        onFocus={() => item.module && onModuleHover(item.module)}
        onBlur={() => onModuleHover(null)}
        aria-pressed={isActive}
        aria-label={item.label}
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
          className={`flex items-center justify-center ${
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

  const stats = [
    { label: "Students", value: studentsMetric.toLocaleString(), module: "Students" as const },
    { label: "Teachers", value: teacherMetric.toLocaleString(), module: "Timetable" as const },
    { label: "Fees", value: `${feeMetric}%`, module: "Fees" as const },
    {
      label: "Attendance",
      value: `${attendanceMetric}%`,
      module: "Students" as const,
      studentId: "brian",
    },
  ]

  const panel = (
    <div
      className={
        isPhone
          ? "flex h-[560px] w-full flex-col bg-[#f4f6f5] sm:h-[600px]"
          : "flex h-[380px] w-full flex-col overflow-hidden bg-white sm:h-[400px] md:h-[420px] md:flex-row md:items-stretch lg:h-[440px] xl:h-[460px]"
      }
    >
      {/* Desktop sidebar with labels */}
      {!isPhone && (
        <aside className="flex w-[132px] shrink-0 flex-col border-r border-slate-200/80 bg-[#f7f9f8] py-3 sm:w-[148px]">
          <button
            type="button"
            onClick={() => onSelectModule(null)}
            className="mx-3 mb-3 flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white"
            aria-label="Home"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-[11px] font-bold text-white shadow-sm">
              SQ
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold text-slate-900">SQUL</span>
              <span className="block truncate text-[10px] text-slate-400">Admin</span>
            </span>
          </button>
          <nav className="flex flex-1 flex-col gap-0.5 px-2">
            {HERO_SIDEBAR_NAV.map((item) => {
              const Icon = item.icon
              const isActive =
                item.module === activeModule ||
                (item.module === null && activeModule === null)
              return (
                <button
                  key={`desk-${item.label}`}
                  type="button"
                  onClick={() => onSelectModule(item.module)}
                  onMouseEnter={() => item.module && onModuleHover(item.module)}
                  onMouseLeave={() => onModuleHover(null)}
                  aria-pressed={isActive}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12px] transition-colors ${
                    isActive
                      ? "bg-white font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-100"
                      : "font-medium text-slate-500 hover:bg-white/80 hover:text-slate-800"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${isActive ? "text-emerald-600" : "text-slate-400"}`}
                    strokeWidth={isActive ? 2.25 : 1.75}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              )
            })}
          </nav>
          <div className="mx-3 mt-2 border-t border-slate-200/80 pt-2">
            <p className="truncate px-1 text-[10px] text-slate-400">Term 2 · 2026</p>
          </div>
        </aside>
      )}

      {/* Main canvas */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
        {/* Phone status bar */}
        {isPhone && (
          <div className="flex shrink-0 items-end justify-between px-6 pb-1 pt-3 text-[11px] font-semibold text-slate-900">
            <span className="tabular-nums">9:41</span>
            <div className="flex items-center gap-1.5 text-slate-800">
              <span className="text-[9px] font-bold tracking-tight">5G</span>
              <span className="flex h-2.5 items-end gap-[2px]" aria-hidden>
                <span className="h-1 w-[3px] rounded-sm bg-slate-900" />
                <span className="h-1.5 w-[3px] rounded-sm bg-slate-900" />
                <span className="h-2 w-[3px] rounded-sm bg-slate-900" />
                <span className="h-2.5 w-[3px] rounded-sm bg-slate-900/35" />
              </span>
              <span className="relative h-[11px] w-[22px] rounded-[3px] border border-slate-900/80">
                <span className="absolute inset-[2px] right-[3px] rounded-[1px] bg-emerald-500" />
                <span className="absolute -right-[3px] top-1/2 h-[5px] w-[1.5px] -translate-y-1/2 rounded-r-sm bg-slate-900/80" />
              </span>
            </div>
          </div>
        )}

        {/* App header */}
        <header
          className={`flex shrink-0 items-center gap-2 border-b border-slate-200/60 ${
            isPhone ? "px-4 pb-3 pt-2" : "gap-3 px-4 py-3"
          }`}
        >
          {isPhone && (
            <button
              type="button"
              onClick={() => onSelectModule(null)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-[11px] font-bold text-white shadow-sm"
              aria-label="Home"
            >
              SQ
            </button>
          )}
          <div className="min-w-0 flex-1">
            <p
              className={`truncate font-semibold text-slate-900 ${
                isPhone ? "text-[15px]" : "text-sm"
              }`}
            >
              {linkedModule ?? "Dashboard"}
            </p>
            <p
              className={`truncate text-slate-400 ${
                isPhone ? "text-[11px]" : "text-xs"
              }`}
            >
              {isPhone
                ? "Term 2, 2026"
                : linkedModule
                  ? `${linkedModule} overview · Term 2, 2026`
                  : "Overview of your school · Term 2, 2026"}
            </p>
          </div>
          <span
            className={`flex shrink-0 items-center gap-1 bg-emerald-50 ring-1 ring-emerald-100 ${
              isPhone ? "rounded-full px-2.5 py-1" : "rounded-md px-2.5 py-1"
            }`}
          >
            <Radio
              className={`text-emerald-600 ${isPhone ? "h-3 w-3" : "h-3.5 w-3.5"}`}
            />
            <span
              className={`font-bold uppercase tracking-wide text-emerald-700 ${
                isPhone ? "text-[10px]" : "text-[10px]"
              }`}
            >
              Live
            </span>
          </span>
          <button
            type="button"
            onClick={onToggleNotifications}
            aria-pressed={notificationsOpen}
            aria-label={notificationsOpen ? "Hide notifications" : "Show notifications"}
            className={`relative flex shrink-0 items-center justify-center transition-colors ${
              isPhone
                ? `h-9 w-9 rounded-full ${
                    notificationsOpen
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`
                : `h-8 w-8 rounded-lg ${
                    notificationsOpen
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-400 hover:bg-slate-100"
                  }`
            }`}
          >
            <Bell className={isPhone ? "h-4 w-4" : "h-4 w-4"} />
            {!notificationsOpen && (
              <span
                className={`absolute bg-emerald-500 ${
                  isPhone ? "right-2 top-2 h-2 w-2 rounded-full" : "right-1.5 top-1.5 h-2 w-2 rounded-full"
                }`}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => onSelectStudent(student.id)}
            className={`shrink-0 overflow-hidden bg-emerald-100 ring-1 ring-emerald-200 transition-shadow hover:ring-emerald-400 ${
              isPhone ? "h-9 w-9 rounded-full" : "h-8 w-8 rounded-lg"
            }`}
            aria-label={`Focus ${student.name}`}
          >
            <img
              src={student.src}
              alt=""
              className="h-full w-full object-cover object-[center_20%] scale-[1.55]"
            />
          </button>
        </header>

        {notificationsOpen && (
          <div
            className={`border-b border-emerald-100 bg-emerald-50/80 ${
              isPhone ? "px-4 py-3" : "px-2.5 py-2 sm:px-3"
            }`}
          >
            <p className={`font-semibold text-emerald-800 ${isPhone ? "text-xs" : "text-[10px]"}`}>
              3 new updates today
            </p>
            <p className={`mt-0.5 text-emerald-700/80 ${isPhone ? "text-[11px]" : "text-[9px]"}`}>
              M-Pesa matched · Admission #2043 · CBC reminder sent
            </p>
          </div>
        )}

        <div
          className={`min-h-0 flex-1 space-y-2.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            isPhone
              ? "bg-[#f4f6f5] px-3 py-3"
              : "space-y-3 bg-slate-50 p-3.5 [scrollbar-width:thin]"
          }`}
        >
          {/* Stat bar */}
          <div
            className={
              isPhone
                ? "flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                : "grid grid-cols-4 gap-2.5"
            }
          >
            {stats.map((stat) => {
              const isActive =
                linkedModule === stat.module &&
                (!("studentId" in stat) || student.id === stat.studentId)
              return (
                <button
                  key={stat.label}
                  type="button"
                  onClick={() => {
                    if ("studentId" in stat && stat.studentId) {
                      onSelectStudent(stat.studentId)
                    } else {
                      onSelectModule(stat.module)
                    }
                  }}
                  className={
                    isPhone
                      ? `min-w-[88px] shrink-0 rounded-2xl border px-3 py-2.5 text-left transition-all active:scale-[0.98] ${
                          isActive
                            ? "border-emerald-300 bg-white shadow-sm shadow-emerald-900/5"
                            : "border-transparent bg-white/80"
                        }`
                      : `rounded-lg border px-3 py-2.5 text-left transition-colors ${
                          isActive
                            ? "border-emerald-200 bg-emerald-50/90 shadow-sm"
                            : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`
                  }
                >
                  <p
                    className={`font-medium uppercase tracking-wide text-slate-400 ${
                      isPhone ? "text-[9px]" : "text-[10px]"
                    }`}
                  >
                    {stat.label}
                  </p>
                  <p
                    className={`mt-0.5 font-semibold tabular-nums text-slate-800 ${
                      isPhone ? "text-base" : "text-lg"
                    }`}
                  >
                    {stat.value}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Student search */}
          <div
            className={`relative bg-white shadow-sm ${
              isPhone
                ? "rounded-2xl border border-slate-200/70 p-3"
                : "rounded-lg border border-slate-200/80 p-3"
            }`}
          >
            <div className="flex items-center gap-2">
              <Search
                className={`shrink-0 text-slate-400 ${isPhone ? "h-4 w-4" : "h-3.5 w-3.5"}`}
              />
              <input
                type="search"
                value={searchFocused || searchQuery ? searchQuery : student.name}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => {
                  setSearchFocused(true)
                  if (!searchQuery) onSearchChange("")
                }}
                onBlur={() => {
                  window.setTimeout(() => {
                    setSearchFocused(false)
                    onSearchChange("")
                  }, 150)
                }}
                placeholder="Search students…"
                aria-label="Search students"
                className={`min-w-0 flex-1 truncate bg-transparent font-medium text-slate-800 outline-none placeholder:text-slate-400 ${
                  isPhone ? "text-sm" : "text-[11px] sm:text-sm"
                }`}
              />
              <span
                key={student.id}
                className={`hero-profile-in shrink-0 truncate font-semibold ${
                  isPhone
                    ? "max-w-[40%] rounded-full px-2.5 py-1 text-[10px]"
                    : `max-w-[42%] px-1.5 py-0.5 text-[8px] sm:max-w-none sm:px-2 sm:text-[10px] ${HERO_STUDENT_STATUS_COLORS[student.statusType]}`
                } ${isPhone ? HERO_STUDENT_STATUS_COLORS[student.statusType] : ""}`}
              >
                {student.status}
              </span>
            </div>
            <p
              key={`${student.id}-detail`}
              className={`hero-profile-in mt-1.5 flex items-center gap-1.5 text-slate-500 ${
                isPhone ? "text-xs" : "text-[9px] sm:text-[11px]"
              }`}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span className="line-clamp-2 sm:truncate">{student.detail}</span>
            </p>

            {showSearchResults && (
              <div
                className={`absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden border border-slate-200 bg-white shadow-lg ${
                  isPhone ? "rounded-2xl" : ""
                }`}
              >
                {searchMatches.length === 0 ? (
                  <p className="px-3 py-2.5 text-[11px] text-slate-500">
                    No students match “{searchQuery}”
                  </p>
                ) : (
                  searchMatches.map((match) => (
                    <button
                      key={match.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        onSelectStudent(match.id)
                        onSearchChange("")
                        setSearchFocused(false)
                      }}
                      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-emerald-50 ${
                        match.id === student.id ? "bg-emerald-50/70" : ""
                      }`}
                    >
                      <div
                        className={`h-8 w-8 shrink-0 overflow-hidden bg-slate-100 ring-1 ring-slate-200 ${
                          isPhone ? "rounded-full" : ""
                        }`}
                      >
                        <img
                          src={match.src}
                          alt=""
                          className="h-full w-full object-cover object-[center_20%] scale-[1.55]"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">{match.name}</p>
                        <p className="truncate text-[11px] text-slate-500">
                          {match.class} · {match.status}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Module summary */}
          <div className={`grid grid-cols-2 ${isPhone ? "gap-2" : "gap-2.5"}`}>
            {HERO_DASHBOARD_MODULES.map((mod) => {
              const isLinked = mod.module === linkedModule || mod.module === activeModule
              const metric = getHeroModuleMetric(
                mod.label,
                student,
                studentsMetric,
                feeMetric,
                linkedModule
              )
              const Icon = mod.icon
              return (
                <button
                  key={mod.label}
                  type="button"
                  onClick={() => onSelectModule(mod.module)}
                  onMouseEnter={() => !isPhone && onModuleHover(mod.module)}
                  onMouseLeave={() => !isPhone && onModuleHover(null)}
                  aria-pressed={mod.module === linkedModule}
                  className={
                    isPhone
                      ? `flex items-center gap-2.5 rounded-2xl border px-3 py-3 text-left transition-all active:scale-[0.98] ${
                          isLinked
                            ? "border-emerald-300 bg-emerald-50 shadow-sm"
                            : "border-transparent bg-white"
                        }`
                      : `flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                          isLinked
                            ? "border-emerald-200 bg-emerald-50/90 shadow-sm"
                            : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`
                  }
                >
                  <span
                    className={`flex shrink-0 items-center justify-center ${
                      isPhone ? "h-10 w-10 rounded-2xl" : "h-9 w-9 rounded-lg"
                    } ${isLinked ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"}`}
                  >
                    <Icon className={isPhone ? "h-4 w-4" : "h-4 w-4"} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate ${
                        isPhone ? "text-[13px]" : "text-[13px]"
                      } ${isLinked ? "font-semibold text-slate-900" : "font-medium text-slate-600"}`}
                    >
                      {mod.label}
                    </p>
                    <p
                      className={`truncate tabular-nums ${
                        isPhone ? "text-[11px]" : "text-xs"
                      } ${isLinked ? "font-semibold text-emerald-700" : "text-slate-500"}`}
                    >
                      {metric}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Activity feed */}
          <div
            className={`overflow-hidden bg-white ${
              isPhone
                ? "rounded-2xl border border-slate-200/70"
                : "border border-slate-200/80"
            }`}
          >
            <div
              className={`flex items-center justify-between border-b border-slate-100 ${
                isPhone ? "px-3.5 py-2.5" : "px-2 py-1.5 sm:px-2.5 sm:py-2 md:px-3"
              }`}
            >
              <p
                className={`font-semibold text-slate-700 ${
                  isPhone ? "text-[13px]" : "text-[10px] sm:text-[11px]"
                }`}
              >
                Recent activity
              </p>
              <p className={`text-slate-400 ${isPhone ? "text-[11px]" : "text-[9px]"}`}>Today</p>
            </div>
            <div
              className={
                isPhone
                  ? "divide-y divide-slate-100"
                  : "max-h-[120px] divide-y divide-slate-100 overflow-y-auto [scrollbar-width:thin]"
              }
            >
              {HERO_ACTIVITY_ROWS.map((row) => {
                const rowStudent = HERO_STUDENTS.find((s) => s.id === row.id)!
                const isSelected = row.id === student.id
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => onSelectStudent(row.id)}
                    aria-pressed={isSelected}
                    className={`flex w-full items-center text-left transition-colors ${
                      isPhone
                        ? `gap-3 px-3.5 py-3 active:bg-slate-50 ${
                            isSelected ? "bg-emerald-50" : ""
                          }`
                        : `gap-1.5 px-2 py-1.5 sm:gap-2 sm:px-2.5 sm:py-2 md:px-3 md:py-2.5 ${
                            isSelected ? "bg-emerald-50/60" : "hover:bg-slate-50"
                          }`
                    }`}
                  >
                    <div
                      className={`shrink-0 overflow-hidden bg-slate-100 ring-1 ${
                        isPhone
                          ? `h-10 w-10 rounded-full ${
                              isSelected ? "ring-emerald-400" : "ring-slate-200"
                            }`
                          : `h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 ${
                              isSelected ? "ring-emerald-300" : "ring-slate-200"
                            }`
                      }`}
                    >
                      <img
                        src={rowStudent.src}
                        alt=""
                        className="h-full w-full object-cover object-[center_20%] scale-[1.55]"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate ${
                          isPhone ? "text-[13px]" : "text-[9px] sm:text-[10px] md:text-[11px]"
                        } ${
                          isSelected
                            ? "font-semibold text-slate-900"
                            : "font-medium text-slate-700"
                        }`}
                      >
                        {row.title}
                      </p>
                      <p
                        className={`truncate text-slate-500 ${
                          isPhone ? "mt-0.5 text-[11px]" : "hidden text-[9px] sm:block sm:text-[10px]"
                        }`}
                      >
                        {row.meta}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 tabular-nums text-slate-400 ${
                        isPhone ? "text-[11px]" : "text-[8px] sm:text-[9px]"
                      }`}
                    >
                      {row.time}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Status footer — desktop / non-phone */}
        {!isPhone && (
          <button
            type="button"
            onClick={() => onSelectStudent(student.id)}
            className="flex shrink-0 items-center gap-1.5 border-t border-slate-200/60 bg-slate-50/80 px-2.5 py-1.5 text-left transition-colors hover:bg-emerald-50/50 sm:gap-2 sm:px-3 sm:py-2 md:px-4"
          >
            <div
              key={student.id}
              className="hero-profile-in h-5 w-5 shrink-0 overflow-hidden ring-1 ring-slate-200 sm:h-6 sm:w-6"
            >
              <img
                src={student.src}
                alt=""
                className="h-full w-full object-cover object-[center_20%] scale-[1.55]"
              />
            </div>
            <p
              key={`${student.id}-insight`}
              className="hero-profile-in min-w-0 text-[9px] leading-snug text-slate-600 sm:text-[10px] md:text-[11px]"
            >
              <span className="font-semibold text-slate-800">{student.shortName}</span>
              <span className="text-slate-400"> — </span>
              <span className="line-clamp-2 md:truncate">{student.insight}</span>
            </p>
          </button>
        )}

        {/* Phone context chip above tab bar */}
        {isPhone && (
          <button
            type="button"
            onClick={() => onSelectStudent(student.id)}
            className="mx-3 mb-1 flex shrink-0 items-center gap-2.5 rounded-2xl border border-emerald-100 bg-white px-3 py-2.5 text-left shadow-sm"
          >
            <div
              key={student.id}
              className="hero-profile-in h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-emerald-100"
            >
              <img
                src={student.src}
                alt=""
                className="h-full w-full object-cover object-[center_20%] scale-[1.55]"
              />
            </div>
            <p
              key={`${student.id}-insight`}
              className="hero-profile-in min-w-0 text-xs leading-snug text-slate-600"
            >
              <span className="font-semibold text-slate-800">{student.shortName}</span>
              <span className="text-slate-400"> · </span>
              <span className="line-clamp-1">{student.insight}</span>
            </p>
          </button>
        )}

        {/* Bottom nav — phone only */}
        {isPhone && (
          <nav className="flex shrink-0 items-center border-t border-slate-200/70 bg-white px-1 pb-[calc(0.35rem+env(safe-area-inset-bottom))] pt-1">
            {HERO_SIDEBAR_NAV.map((item) => renderNavItem(item, true))}
          </nav>
        )}

        {isPhone && (
          <div className="flex shrink-0 justify-center bg-white pb-2 pt-0.5" aria-hidden>
            <div className="h-1 w-28 rounded-full bg-slate-900/80" />
          </div>
        )}
      </div>
    </div>
  )

  if (isPhone) {
    return <HeroPhoneFrame>{panel}</HeroPhoneFrame>
  }

  return <HeroDesktopFrame>{panel}</HeroDesktopFrame>
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
    <div className="mt-6 w-full border-t border-white/10 pt-5">
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
                className={`hero-stat-pop rounded-full relative h-9 w-9 overflow-hidden ring-2 transition-all hover:z-10 hover:scale-105 sm:h-10 sm:w-10 ${
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
          className="hero-profile-in rounded-none min-w-0 flex-1 text-left text-sm font-medium leading-snug text-white"
        >
          {selectedStudent.pitchLine}
        </p>
      </div>
    </div>
  )
}

function HeroTrustBar() {
  return (
    <div className="overflow-hidden border border-white/15 bg-[#0a1f1a]/92 shadow-[0_16px_56px_rgba(0,0,0,0.55)] backdrop-blur-lg">
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

const HERO_MODULE_STUDENT_MAP: Record<string, string> = {
  Students: "grace",
  Fees: "amina",
  Exams: "david",
  Timetable: "brian",
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
  { label: "Timetable", shortLabel: "Timetable", icon: Clock, module: "Timetable" },
] as const

const HERO_ACTIVITY_ROWS = [
  { id: "amina", time: "10:14 AM", title: "M-Pesa payment received", meta: "KES 12,400 · receipt sent to parent" },
  { id: "grace", time: "8:45 AM", title: "Admission #2043 created", meta: "Class assigned · ID issued" },
  { id: "brian", time: "8:02 AM", title: "Attendance marked present", meta: "Parent notified via SMS" },
  { id: "david", time: "7:30 AM", title: "CBC assessment scheduled", meta: "CBC assessment Fri 9 AM · parent notified" },
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
  feeMetric: number,
  activeLinkedModule?: string | null
) {
  const studentModule = HERO_STUDENT_MODULE_MAP[selectedStudent.statusType]
  const highlightModule = activeLinkedModule ?? studentModule
  if (modLabel === highlightModule) return selectedStudent.moduleMetric

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
  // undefined = derive from student; null = Home overview; string = explicit module
  const [moduleOverride, setModuleOverride] = useState<string | null | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [demoPaused, setDemoPaused] = useState(false)
  const [previewMode, setPreviewMode] = useState<HeroPreviewMode>("phone")
  const studentsMetric = useAnimatedNumber(HERO_DEMO_STATS.students.target, { delay: 400 })
  const feeMetric = useAnimatedNumber(HERO_DEMO_STATS.feeCollection.target, { delay: 500 })
  const teacherMetric = useAnimatedNumber(48, { delay: 600 })
  const attendanceMetric = useAnimatedNumber(96, { delay: 700 })

  const selectedStudent = HERO_STUDENTS.find((s) => s.id === selectedStudentId) ?? HERO_STUDENTS[0]
  const linkedModule =
    moduleOverride === undefined
      ? HERO_STUDENT_MODULE_MAP[selectedStudent.statusType]
      : moduleOverride

  const selectStudent = (id: string) => {
    setDemoPaused(true)
    setSelectedStudentId(id)
    setModuleOverride(undefined)
    setSearchQuery("")
  }

  const selectModule = (module: string | null) => {
    setDemoPaused(true)
    setModuleOverride(module)
    if (module && HERO_MODULE_STUDENT_MAP[module]) {
      setSelectedStudentId(HERO_MODULE_STUDENT_MAP[module])
    }
    setSearchQuery("")
  }

  useEffect(() => {
    if (demoPaused) return
    const timer = window.setInterval(() => {
      setSelectedStudentId((prev) => {
        const idx = HERO_STUDENTS.findIndex((s) => s.id === prev)
        const next = HERO_STUDENTS[(idx + 1) % HERO_STUDENTS.length]
        return next.id
      })
      setModuleOverride(undefined)
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

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-[4.5rem] sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
          <div className="grid grid-cols-1 gap-7 sm:gap-8 lg:grid-cols-12 lg:items-center lg:gap-8 lg:pt-3 xl:gap-10">
            {/* Left — pitch */}
            <div
              className="relative z-20 order-1 flex w-full min-w-0 flex-col justify-self-center border border-white/15 bg-[#0a1f1a]/92 px-6 py-8 text-center shadow-[0_16px_56px_rgba(0,0,0,0.55)] backdrop-blur-lg sm:px-8 sm:py-10 lg:order-none lg:col-span-6 lg:h-auto lg:justify-self-auto lg:text-left"
              onMouseEnter={() => setDemoPaused(true)}
              onMouseLeave={() => setDemoPaused(false)}
            >
              <h1 className="font-display w-full leading-[1.08] tracking-tight text-white drop-shadow-[0_2px_28px_rgba(0,0,0,0.9)]">
                <span className="block text-[1.7rem] tracking-[0.01em] sm:text-[2rem] lg:text-[2.3rem] xl:text-[2.35rem]">
                  Stop running your school through
                </span>
                <span className="mt-1.5 block text-[1.7rem] italic text-emerald-200 drop-shadow-[0_2px_20px_rgba(0,0,0,0.85)] sm:text-[2rem] lg:text-[2.3rem] xl:text-[2.35rem]">
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
                    className="rounded-lg h-12 w-full border-0 bg-emerald-500 px-8 text-sm font-semibold text-white shadow-lg shadow-emerald-950/40 hover:bg-emerald-400 sm:h-[3.25rem] sm:w-auto sm:px-10 sm:text-base"
                  >
                    Start Your Free Term
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-lg h-12 w-full border-white/50 bg-white/10 px-6 text-sm font-semibold text-white shadow-sm backdrop-blur-sm hover:bg-white/20 hover:text-white sm:h-[3.25rem] sm:w-auto sm:px-8 sm:text-base"
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
              className="relative order-2 z-10 w-full min-w-0 overflow-visible lg:order-none lg:col-span-6"
              onMouseEnter={() => setDemoPaused(true)}
              onMouseLeave={() => setDemoPaused(false)}
            >
              <div className="mb-4 flex justify-center lg:mb-5">
                <HeroPreviewToggle
                  mode={previewMode}
                  onChange={(mode) => {
                    setPreviewMode(mode)
                    setDemoPaused(true)
                  }}
                />
              </div>
              <div
                key={previewMode}
                className={`hero-profile-in ${
                  previewMode === "phone"
                    ? "flex justify-center"
                    : "overflow-visible pb-8 pt-1"
                }`}
              >
                <HeroDashboardPanel
                  student={selectedStudent}
                  linkedModule={linkedModule}
                  hoveredModule={hoveredModule}
                  studentsMetric={studentsMetric.value}
                  feeMetric={feeMetric.value}
                  teacherMetric={teacherMetric.value}
                  attendanceMetric={attendanceMetric.value}
                  searchQuery={searchQuery}
                  notificationsOpen={notificationsOpen}
                  previewMode={previewMode}
                  onModuleHover={setHoveredModule}
                  onSelectModule={selectModule}
                  onSelectStudent={selectStudent}
                  onSearchChange={(query) => {
                    setDemoPaused(true)
                    setSearchQuery(query)
                  }}
                  onToggleNotifications={() => {
                    setDemoPaused(true)
                    setNotificationsOpen((open) => !open)
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 sm:mt-9 lg:mt-10">
            <HeroTrustBar />
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
            <Reveal>
            <div className="relative mb-12 sm:mb-14">
              <div className="overflow-hidden border border-white/30 bg-white/95 shadow-[0_24px_64px_rgba(10,31,26,0.18)] backdrop-blur-md">
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
            </Reveal>

            <div className="grid gap-6 md:grid-cols-2 md:gap-7 lg:grid-cols-3 lg:gap-8">
              {LANDING_PLATFORM_MODULES.map((feature, index) => {
                return (
                  <Reveal key={feature.title} delay={index * 60}>
                  <div className="group relative h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative flex h-full flex-col border border-emerald-900/10 bg-white p-8 shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-[#1d5547]/25 group-hover:shadow-md">
                      <div className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center border border-emerald-900/10 bg-white font-ui text-xs font-semibold tabular-nums text-[#1d5547] shadow-sm">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <LandingPlatformIcon icon={feature.icon} />
                      <h3 className="mb-3 font-display text-xl leading-snug text-slate-900">
                        {feature.title}
                      </h3>
                      <p className="mb-6 flex-grow text-sm leading-relaxed text-slate-600">
                        {feature.description}
                      </p>
                      <span className="font-ui w-fit bg-emerald-50 px-3 py-1 text-xs font-semibold text-[#1d5547] ring-1 ring-emerald-100">
                        {feature.highlight}
                      </span>
                    </div>
                  </div>
                  </Reveal>
                )
              })}
            </div>

          </div>
        </section>

        {/* Third screen — day-to-day workflows */}
        <section className="relative border-t border-emerald-900/8 bg-gradient-to-b from-white via-[#f6faf8] to-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <LandingSectionHeader
              kicker="How schools run day to day"
              title={
                <>
                  Everything your admin team touches—
                  <span className="block text-[#1d5547]">in one Kenyan-built system</span>
                </>
              }
              description="From CBC marks in the staff room to M-Pesa in the bursar&apos;s office—SQUL connects the workflows your team already runs, without forcing a new way of working."
            />

            <div className="grid gap-8">
              <div className="grid gap-8 md:grid-cols-2">
                {LANDING_WORKFLOW_BLOCKS.slice(0, 2).map((block, i) => (
                  <Reveal key={block.id} delay={i * 80} className="h-full">
                    <LandingWorkflowCard {...block} />
                  </Reveal>
                ))}
              </div>

              <Reveal>
                <LandingBursarSnapshot
                  activeStudents={stats.activeStudents}
                  feeCollectionRate={stats.feeCollectionRate}
                  totalClasses={stats.totalClasses}
                  totalSubjects={stats.totalSubjects}
                />
              </Reveal>

              <div className="grid gap-8 md:grid-cols-2">
                {LANDING_WORKFLOW_BLOCKS.slice(2, 4).map((block, i) => (
                  <Reveal key={block.id} delay={i * 80} className="h-full">
                    <LandingWorkflowCard {...block} />
                  </Reveal>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Testimonial */}
        <section className="relative border-t border-emerald-900/10 bg-[#f6faf8] py-20 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Reveal>
            <figure className="text-center">
              <div className="mb-8 flex items-center justify-center gap-4">
                <span className="h-px w-10 bg-[#1d5547]/30" aria-hidden />
                <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1d5547]">
                  What a bursar says
                </span>
                <span className="h-px w-10 bg-[#1d5547]/30" aria-hidden />
              </div>
              <blockquote className="font-display text-2xl leading-snug tracking-tight text-slate-900 sm:text-[1.75rem]">
                “We stopped chasing parents for fees in the office. SQUL matches the M-Pesa
                payments and the SMS reminders do the chasing for us.”
              </blockquote>
              <figcaption className="mt-8">
                <div className="mb-3 flex items-center justify-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                  ))}
                </div>
                <p className="font-ui text-sm font-semibold text-slate-900">Jane Njeri</p>
                <p className="mt-0.5 text-sm text-slate-500">Bursar, Unity Secondary School · Nakuru</p>
              </figcaption>
            </figure>
            </Reveal>
          </div>
        </section>

        {/* Fourth screen — in the schoolroom */}
        <section className="relative border-t border-emerald-900/10 bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <LandingSectionHeader
              tone="soft"
              wide
              kicker="Built for real schoolrooms"
              title={
                <>
                  See SQUL in the work
                  <span className="block text-[#1d5547]">your team already does</span>
                </>
              }
              description="Kenyan classrooms, bursar counters, and staff rooms—not stock photos of generic offices. Each block below maps to a job your administrators run every week."
            />

            <div className="space-y-20 sm:space-y-24">
              {LANDING_DEEP_DIVES.map((dive, i) => (
                <Reveal key={dive.id} delay={i * 80}>
                  <LandingDeepDiveBlock {...dive} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Fifth screen — questions principals & bursars ask */}
        <section className="relative border-t border-emerald-900/10 bg-gradient-to-b from-[#f6faf8] to-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <LandingSectionHeader
              kicker="Before you sign up"
              title={
                <>
                  Questions principals
                  <span className="block text-[#1d5547]">and bursars ask us</span>
                </>
              }
              description="Straight answers about data, timelines, parents, and phones—no enterprise jargon."
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {LANDING_FAQ_ITEMS.map((item, i) => (
                <Reveal key={item.question} delay={i * 50} className="h-full">
                  <LandingFaqCard {...item} />
                </Reveal>
              ))}
            </div>

            <Reveal>
            <div className="relative mt-14 overflow-hidden bg-[#0a1f1a] sm:mt-16">
              <div
                className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:44px_44px]"
                aria-hidden
              />
              <div className="absolute -top-28 left-1/2 h-64 w-[560px] -translate-x-1/2 bg-[#1d5547]/45 blur-[120px]" aria-hidden />
              <div className="relative flex flex-col items-center px-6 py-16 text-center sm:px-10 sm:py-20">
                <p className="font-ui text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  Next term starts here
                </p>
                <h3 className="font-display mt-5 text-3xl leading-[1.12] tracking-tight text-white sm:text-4xl md:text-5xl">
                  Ready to run your next term
                  <span className="block text-emerald-200">on SQUL?</span>
                </h3>
                <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
                  Import your learner list, match your fee structure, and go live before
                  parents&apos; reporting day. No IT project, no consultants.
                </p>
                <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="rounded-lg h-12 w-full border-0 bg-emerald-500 px-8 font-semibold text-white shadow-lg shadow-emerald-950/40 hover:bg-emerald-400 sm:w-auto sm:px-10 sm:text-base"
                    >
                      Start Your Free Term
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="rounded-lg h-12 w-full border-white/25 bg-transparent px-8 font-semibold text-white hover:bg-white/10 sm:w-auto"
                    >
                      <Play className="mr-2 h-3.5 w-3.5 fill-white" />
                      See a demo
                    </Button>
                  </Link>
                </div>
                <p className="mt-6 font-ui text-xs font-medium uppercase tracking-[0.14em] text-white/45">
                  90-day free trial · full term access · no credit card
                </p>
              </div>
            </div>
            </Reveal>
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
                  <div className="flex h-10 w-10 items-center justify-center border border-[#2d8570]/40 bg-gradient-to-b from-[#246a59] to-[#1a4c40]">
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
                      className="rounded-lg h-11 w-full border-0 bg-[#1d5547] px-6 font-semibold text-white hover:bg-[#2d8570] sm:w-auto"
                    >
                      Start free term
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="rounded-lg h-11 w-full border-white/25 bg-transparent px-6 font-semibold text-white hover:bg-white/10 sm:w-auto"
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
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-white/8 ring-1 ring-white/10">
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
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-white/8 ring-1 ring-white/10">
                          <Phone size={16} className="text-emerald-300/90" aria-hidden />
                        </span>
                        <span className="pt-1.5">+254 700 000 000</span>
                      </a>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-white/65">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-white/8 ring-1 ring-white/10">
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
                © {new Date().getFullYear()} SQUL. All rights reserved.
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