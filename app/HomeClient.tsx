'use client'

import { Header } from "@/components/Header"
import { SqulWordmark } from "@/components/brand/SqulMark"
import Image from "next/image"
import Link from "next/link"
import { LEGAL_META } from "@/lib/legal/legal-meta"
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import type { ReactNode } from "react"
import {
  Play,
  Search,
  LayoutGrid,
  Users2,
  CalendarClock,
  CreditCard,
  FileCheck,
  Clock,
  Bell,
  Radio,
  ClipboardList,
  NotebookPen,
  Smartphone,
  Monitor,
  UserCheck,
  Shield,
  Building2,
  CircleHelp,
  ArrowRight,
  ArrowUpRight,
  Globe,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"
import {
  ConnectDomainPreview,
  LiveDomainPreview,
  type PreviewImage,
} from "@/components/marketing/DomainPreviews"
import { WalkthroughDialog } from "@/components/marketing/WalkthroughDialog"
import {
  LANDING_FAQ_ITEMS as LANDING_FAQ_DATA,
  type LandingFaqIconName,
} from "./landing-faq"

/** Optional real captures — drop into public/screenshots/ and fill these in. */
const DOMAIN_HOME_SHOTS: { connect?: PreviewImage; live?: PreviewImage } = {}

const DOMAIN_HOME_HIGHLIGHTS: {
  icon: LucideIcon
  title: string
  body: string
}[] = [
  {
    icon: Globe,
    title: "Use a domain you own",
    body: "Point myschool.ac.ke at your SQUL site — no developer, no DNS headaches.",
  },
  {
    icon: ShieldCheck,
    title: "Free, auto-renewed HTTPS",
    body: "We issue and renew the certificate, so every page loads securely.",
  },
  {
    icon: CreditCard,
    title: "Or buy the domain right here",
    body: "Search, order, and pay with M-Pesa — we register it and wire up the site.",
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

const LANDING_DEEP_DIVES: {
  id: string
  icon: LucideIcon
  title: string
  intro: string
  image?: string
  imageAlt?: string
  imageRight: boolean
  imageKind: "report" | "photo" | "ledger"
  items: { title: string; description: string }[]
}[] = [
  {
    id: "cbc",
    icon: NotebookPen,
    title: "CBC marks & class setup",
    intro:
      "Teachers enter rubrics and exam marks once—SQUL holds class lists, subject registers, and the term reports parents collect on closing day.",
    imageRight: true,
    imageKind: "report",
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
    imageKind: "photo",
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
    imageRight: true,
    imageKind: "ledger",
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


const FAQ_ICON_COMPONENTS: Record<LandingFaqIconName, LucideIcon> = {
  shield: Shield,
  campus: Building2,
  help: CircleHelp,
  clock: Clock,
  parents: Users2,
  mobile: Smartphone,
}

const LANDING_FAQ_ITEMS: {
  icon: LucideIcon
  question: string
  answer: string
}[] = LANDING_FAQ_DATA.map((item) => ({
  icon: FAQ_ICON_COMPONENTS[item.icon],
  question: item.question,
  answer: item.answer,
}))

const LANDING_FOOTER_PERIODS: { time: string; label: string; href: string }[] = [
  { time: "07:30", label: "Admissions & records", href: "/register" },
  { time: "09:10", label: "Fees & M-Pesa", href: "/register" },
  { time: "11:00", label: "CBC & report cards", href: "/register" },
  { time: "13:30", label: "Timetables & attendance", href: "/register" },
  { time: "15:00", label: "Parent SMS", href: "/register" },
  { time: "16:00", label: "Custom domains", href: "/custom-domains" },
]

function SchoolBell({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 3v1.8" />
      <path d="M7.2 17h9.6l-1.6-2.8V9.7a3.2 3.2 0 0 0-6.4 0v4.5L7.2 17Z" />
      <path d="M5.8 17h12.4" />
      <path d="M9.8 19a2.2 2.2 0 0 0 4.4 0" />
    </svg>
  )
}

/**
 * Public download for the SQUL mobile app (Android APK).
 *
 * Current build: 2026-10-09 (runtime 0.1.0, mobile commit a70dd8b — transport
 * map + logout fixes, admin SMS credits, and announcements to students,
 * parents and teachers).
 *
 * The fallback points at a **stable** GitHub Release asset (fixed tag
 * `app-android-latest`, re-uploaded with `--clobber` on each build) so the link
 * survives the EAS artifact's ~2-week expiry. `NEXT_PUBLIC_APP_DOWNLOAD_URL`
 * still overrides it; swap to an App Store / Play Store listing once it exists.
 */
const LANDING_APP_DOWNLOAD_URL =
  process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL?.trim() ||
  "https://github.com/aminofabian/squlll/releases/download/app-android-latest/squl-app.apk"

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
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${className} transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      {children}
    </div>
  )
}

/** Editorial section opener: kicker + display headline on the left, lede on the right. */
function SectionIntro({
  kicker,
  title,
  description,
  aside,
}: {
  kicker: string
  title: ReactNode
  description: ReactNode
  aside?: ReactNode
}) {
  return (
    <Reveal>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <p className="mk-eyebrow">{kicker}</p>
          <h2 className="mk-h2 mt-7">{title}</h2>
        </div>
        <div className="flex flex-col justify-end gap-8 pb-1 lg:col-span-4 lg:col-start-9">
          <p className="mk-lede">{description}</p>
          {aside}
        </div>
      </div>
    </Reveal>
  )
}

/**
 * The six modules, set as a ledger rather than a card grid.
 * A hairline between rows does the work six shadows used to.
 */
function PlatformLedger() {
  return (
    <Reveal className="mt-14 sm:mt-16">
      <div>
        {LANDING_PLATFORM_MODULES.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div
              key={feature.title}
              className="mk-row group grid gap-x-8 gap-y-1.5 md:grid-cols-[2.5rem_15rem_1fr_8rem] md:items-baseline"
            >
              <span className="font-mono text-[0.6875rem] tabular-nums text-[#14201b]/25">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="flex items-baseline gap-3 font-display text-[1.35rem] leading-snug tracking-[-0.01em] text-[#14201b] transition-colors duration-200 group-hover:text-[#1c3d32]">
                <Icon
                  className="h-[15px] w-[15px] shrink-0 self-center text-[#1c3d32]/45"
                  strokeWidth={1.5}
                  aria-hidden
                />
                {feature.title}
              </h3>
              <p className="max-w-[46ch] text-[0.9375rem] leading-[1.65] text-[#4d574f]">
                {feature.description}
              </p>
              <span className="hidden justify-self-end text-right text-[0.625rem] uppercase tracking-[0.16em] text-[#7c857d] md:block">
                {feature.highlight}
              </span>
              <span className="text-[0.625rem] uppercase tracking-[0.16em] text-[#7c857d] md:hidden">
                {feature.highlight}
              </span>
            </div>
          )
        })}
      </div>
    </Reveal>
  )
}

function WorkflowEntry({
  num,
  icon: Icon,
  title,
  description,
  bullets,
}: (typeof LANDING_WORKFLOW_BLOCKS)[number]) {
  return (
    <article className="group border-t border-[#14201b]/12 pt-7">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.625rem] tabular-nums tracking-[0.1em] text-[#14201b]/30">
          {num}
        </span>
        <Icon
          className="h-4 w-4 text-[#1c3d32]/40 transition-colors duration-200 group-hover:text-[#1c3d32]/70"
          strokeWidth={1.5}
          aria-hidden
        />
      </div>
      <h3 className="mk-h3 mt-6">{title}</h3>
      <p className="mt-3 text-[0.9375rem] leading-[1.7] text-[#4d574f]">{description}</p>
      <ul className="mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-2">
        {bullets.map((item) => (
          <li key={item} className="flex items-baseline gap-2.5 text-[0.8125rem] text-[#4d574f]">
            <span className="h-[3px] w-[3px] shrink-0 translate-y-[-3px] rounded-full bg-[#a98a55]" />
            {item}
          </li>
        ))}
      </ul>
    </article>
  )
}

/** A quiet brass stamp — a detail, not a badge. */
function TermStamp() {
  return (
    <div
      className="relative flex h-[7.5rem] w-[7.5rem] shrink-0 items-center justify-center rounded-full border border-[#1c3d32]/20"
      role="img"
      aria-label="Term ready for 2026"
    >
      <div className="absolute inset-[6px] rounded-full border border-[#1c3d32]/10" />
      <div className="relative text-center">
        <p className="text-[0.5rem] font-medium uppercase tracking-[0.26em] text-[#1c3d32]/55">
          Term
        </p>
        <p className="font-display text-[1.55rem] leading-none tracking-[-0.02em] text-[#1c3d32]">
          Ready
        </p>
        <span className="mx-auto mt-2 block h-px w-6 bg-[#a98a55]/50" />
        <p className="mt-2 font-mono text-[0.5625rem] tabular-nums tracking-[0.1em] text-[#1c3d32]/45">
          2026
        </p>
      </div>
    </div>
  )
}

function BursarSnapshot({
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
    { label: "Learners on roll", value: activeStudents.toLocaleString() },
    { label: "Fees collected", value: `${feeCollectionRate}%` },
    { label: "Classes timetabled", value: totalClasses.toLocaleString() },
    { label: "Subjects taught", value: totalSubjects.toLocaleString() },
  ]

  return (
    <div className="mt-20 grid gap-10 border-y border-[#14201b]/10 py-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-4">
        <p className="mk-eyebrow">The morning view</p>
        <h3 className="mt-5 font-display text-[1.75rem] leading-[1.1] tracking-[-0.015em]">
          Bursar &amp; admin snapshot
        </h3>
        <p className="mt-4 max-w-sm text-[0.9375rem] leading-[1.7] text-[#4d574f]">
          Enrolment, fee collection and class setup on one screen — the numbers your
          principal asks for before staff meeting.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:col-span-8 lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="border-l border-[#14201b]/12 pl-6">
            <p className="font-display text-[2.4rem] leading-none tracking-[-0.02em] text-[#14201b]">
              {tile.value}
            </p>
            <p className="mt-3 text-[0.625rem] uppercase leading-relaxed tracking-[0.15em] text-[#7c857d]">
              {tile.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Product capture in a restrained browser frame — no fake widgets, no glare. */
/** A term report, set like a document rather than a screenshot. */
function ReportCardVisual() {
  const rows = [
    { subject: "Mathematics", score: "88", grade: "A" },
    { subject: "English", score: "81", grade: "B+" },
    { subject: "Biology", score: "86", grade: "A" },
    { subject: "History", score: "79", grade: "B+" },
    { subject: "Computer Studies", score: "92", grade: "A" },
  ]

  return (
    <figure>
      <div className="relative overflow-hidden border border-[#14201b]/10 bg-[#fcfaf4]">
        <span className="absolute inset-x-0 top-0 h-px bg-[#a98a55]/50" aria-hidden />
        <div className="px-6 py-7 sm:px-9 sm:py-9">
          <div className="flex items-start justify-between gap-6 border-b border-[#14201b]/12 pb-6">
            <div>
              <p className="text-[0.5625rem] uppercase tracking-[0.2em] text-[#7c857d]">
                Term 2 · 2026 · CBC
              </p>
              <p className="mt-2.5 font-display text-[1.75rem] leading-none tracking-[-0.015em]">
                Grace Wanjiku
              </p>
              <p className="mt-2 text-[0.6875rem] text-[#7c857d]">
                Form 2 East · Admission #2043
              </p>
            </div>
            <span
              className="flex h-16 w-16 shrink-0 -rotate-6 flex-col items-center justify-center rounded-full border border-[#a98a55]/45 text-center text-[0.4375rem] font-medium uppercase leading-[1.5] tracking-[0.12em] text-[#a98a55]/80"
              aria-hidden
            >
              Ready
              <br />
              to print
            </span>
          </div>

          <div className="mt-1">
            <div className="grid grid-cols-[1fr_3rem_2.5rem] gap-4 py-3 text-[0.5rem] uppercase tracking-[0.16em] text-[#7c857d]">
              <span>Subject</span>
              <span className="text-right">Score</span>
              <span className="text-right">Grade</span>
            </div>
            {rows.map((row) => (
              <div
                key={row.subject}
                className="grid grid-cols-[1fr_3rem_2.5rem] items-baseline gap-4 border-t border-[#14201b]/8 py-3"
              >
                <span className="text-[0.8125rem] text-[#14201b]">{row.subject}</span>
                <span className="text-right font-mono text-[0.6875rem] tabular-nums text-[#7c857d]">
                  {row.score}
                </span>
                <span className="text-right font-display text-[1.05rem] leading-none text-[#14201b]">
                  {row.grade}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-end justify-between border-t border-[#14201b]/12 pt-5">
            <div>
              <p className="text-[0.5rem] uppercase tracking-[0.18em] text-[#7c857d]">Mean score</p>
              <p className="mt-1.5 font-display text-[2.5rem] leading-none tracking-[-0.02em]">
                84.5
              </p>
            </div>
            <p className="max-w-[11rem] text-right text-[0.625rem] leading-relaxed text-[#7c857d]">
              Marks entered once. Printed for every parent on closing day.
            </p>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 flex items-center justify-between text-[0.5625rem] uppercase tracking-[0.18em] text-[#7c857d]">
        <span>Term report · Form 2</span>
        <span>CBC</span>
      </figcaption>
    </figure>
  )
}

/** M-Pesa reconciliation as a quiet morning ledger. */
function FeeLedgerVisual() {
  const rows = [
    { name: "Amina Karanja", ref: "SFH7K2 · Paybill", amount: "12,400", status: "Matched" },
    { name: "Brian Ochieng", ref: "SFH6P9 · Till", amount: "8,000", status: "Matched" },
    { name: "David Mutua", ref: "No reference", amount: "5,500", status: "Review" },
  ]

  return (
    <figure>
      <div className="relative overflow-hidden border border-[#14201b]/10 bg-[#fcfaf4]">
        <span className="absolute inset-x-0 top-0 h-px bg-[#a98a55]/50" aria-hidden />
        <div className="px-6 py-7 sm:px-8 sm:py-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[0.5625rem] uppercase tracking-[0.2em] text-[#7c857d]">
                Bursar · live
              </p>
              <p className="mt-2 font-display text-[1.6rem] leading-none tracking-[-0.015em]">
                M-Pesa, matched.
              </p>
            </div>
            <p className="text-right font-mono text-[0.5rem] uppercase leading-[1.7] tracking-[0.1em] text-[#7c857d]">
              Tue · 10:14
              <br />
              Paybill 4107
            </p>
          </div>

          <div className="mt-7 flex items-end justify-between border-y border-[#14201b]/10 py-4">
            <div>
              <p className="text-[0.5rem] uppercase tracking-[0.16em] text-[#7c857d]">
                Collected today
              </p>
              <p className="mt-1.5 font-display text-[2rem] leading-none tabular-nums tracking-[-0.02em]">
                KES 25,900
              </p>
            </div>
            <p className="text-[0.625rem] text-[#a98a55]">+12% on last Tuesday</p>
          </div>

          <div className="mt-1">
            {rows.map((row) => (
              <div
                key={row.name}
                className="grid grid-cols-[1fr_auto_4.75rem] items-center gap-3 border-b border-[#14201b]/8 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-[0.8125rem] text-[#14201b]">{row.name}</p>
                  <p className="mt-0.5 font-mono text-[0.4375rem] uppercase tracking-[0.1em] text-[#7c857d]">
                    {row.ref}
                  </p>
                </div>
                <p className="font-mono text-[0.6875rem] tabular-nums text-[#14201b]">
                  {row.amount}
                </p>
                <p
                  className={`flex items-center justify-end gap-1.5 text-[0.5rem] uppercase tracking-[0.1em] ${
                    row.status === "Matched" ? "text-[#1c3d32]" : "text-[#a98a55]"
                  }`}
                >
                  <span
                    className={`h-1 w-1 rounded-full ${
                      row.status === "Matched" ? "bg-[#1c3d32]/60" : "bg-[#a98a55]"
                    }`}
                    aria-hidden
                  />
                  {row.status}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between text-[0.625rem] text-[#7c857d]">
            <span>Receipts sent to 2 parents by SMS</span>
            <span>1 to review</span>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 flex items-center justify-between text-[0.5625rem] uppercase tracking-[0.18em] text-[#7c857d]">
        <span>Fee reconciliation · Morning</span>
        <span>M-Pesa</span>
      </figcaption>
    </figure>
  )
}

function PhotoFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <figure>
      <div className="mk-frame relative aspect-[5/4] w-full">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-cover"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d201a]/30 via-transparent to-transparent"
          aria-hidden
        />
      </div>
      <figcaption className="mt-3 flex items-center justify-between text-[0.5625rem] uppercase tracking-[0.18em] text-[#7c857d]">
        <span>From the schoolroom</span>
        <span>Kenya</span>
      </figcaption>
    </figure>
  )
}

function DeepDive({
  index,
  icon: Icon,
  title,
  intro,
  items,
  image,
  imageAlt,
  imageRight,
  imageKind,
}: (typeof LANDING_DEEP_DIVES)[number] & { index: number }) {
  const visual = (
    <div
      className={`lg:col-span-7 ${imageRight ? "lg:order-2" : "lg:order-1"}`}
    >
      {imageKind === "photo" ? (
        <PhotoFrame src={image ?? "/students/sq.png"} alt={imageAlt ?? ""} />
      ) : imageKind === "report" ? (
        <ReportCardVisual />
      ) : (
        <FeeLedgerVisual />
      )}
    </div>
  )

  const copy = (
    <div className={`lg:col-span-5 ${imageRight ? "lg:order-1" : "lg:order-2"}`}>
      <div className="flex items-center gap-3">
        <span className="font-mono text-[0.625rem] tabular-nums text-[#14201b]/30">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="h-px w-6 bg-[#14201b]/20" aria-hidden />
        <Icon className="h-3.5 w-3.5 text-[#1c3d32]/45" strokeWidth={1.5} aria-hidden />
      </div>
      <h3 className="mt-5 font-display text-[clamp(2rem,3.4vw,2.9rem)] leading-[1.03] tracking-[-0.02em]">
        {title}
      </h3>
      <p className="mt-5 text-[1rem] leading-[1.7] text-[#4d574f]">{intro}</p>
      <dl className="mt-8">
        {items.map((item) => (
          <div key={item.title} className="border-t border-[#14201b]/10 py-4">
            <dt className="text-[0.8125rem] font-medium text-[#14201b]">{item.title}</dt>
            <dd className="mt-1.5 text-[0.8125rem] leading-[1.6] text-[#4d574f]">
              {item.description}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )

  return (
    <article className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
      {copy}
      {visual}
    </article>
  )
}

/** FAQ as a quiet accordion — one answer at a time, hairline rules, 260ms. */
function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div>
      {LANDING_FAQ_ITEMS.map((item, index) => {
        const isOpen = open === index
        return (
          <div key={item.question} className="border-t border-[#14201b]/10 last:border-b">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="group flex w-full items-start justify-between gap-8 py-6 text-left"
            >
              <span className="flex items-baseline gap-5">
                <span className="font-mono text-[0.625rem] tabular-nums text-[#14201b]/25">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-[1.3rem] leading-snug tracking-[-0.01em] text-[#14201b] transition-colors duration-200 group-hover:text-[#1c3d32] sm:text-[1.45rem]">
                  {item.question}
                </span>
              </span>
              <span className="relative mt-2 flex h-3 w-3 shrink-0 items-center justify-center">
                <span className="absolute h-px w-3 bg-[#14201b]/45" aria-hidden />
                <span
                  className={`absolute h-3 w-px bg-[#14201b]/45 transition-[transform,opacity] duration-200 ${
                    isOpen ? "rotate-90 opacity-0" : "opacity-100"
                  }`}
                  aria-hidden
                />
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-[58ch] pb-7 pl-[2.3rem] pr-10 text-[0.9375rem] leading-[1.7] text-[#4d574f]">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Trust numbers as a light breathing strip between the hero and the platform. */
function TrustStrip() {
  return (
    <div className="border-b border-[#14201b]/10 bg-[#f7f4ec]">
      <div className="mk-container py-10 sm:py-12">
        <p className="mk-caption">Trusted across Kenya</p>
        <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
          {HERO_TRUST_STATS.map((stat, index) => (
            <TrustStat
              key={stat.label}
              target={stat.target}
              format={stat.format}
              label={stat.label}
              delay={index * 90}
              decimals={"decimals" in stat ? stat.decimals : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function TrustStat({
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
    delay: delay + 200,
    decimals: decimals ?? (Number.isInteger(target) ? 0 : 1),
  })
  return (
    <div>
      <p className="font-display text-[2.1rem] leading-none tracking-[-0.02em] tabular-nums text-[#14201b] sm:text-[2.4rem]">
        {format(value)}
      </p>
      <p className="mt-3 text-[0.625rem] uppercase leading-relaxed tracking-[0.15em] text-[#7c857d]">
        {label}
      </p>
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

const DESKTOP_PREVIEW_QUERY = "(min-width: 1024px)"

function subscribeDesktopPreview(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_PREVIEW_QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

function getDesktopPreviewSnapshot() {
  return window.matchMedia(DESKTOP_PREVIEW_QUERY).matches
}

function getDesktopPreviewServerSnapshot() {
  return false
}

function HeroPreviewToggle({
  mode,
  onChange,
}: {
  mode: HeroPreviewMode
  onChange: (mode: HeroPreviewMode) => void
}) {
  return (
    <div
      className="flex w-fit items-center border border-white/15 bg-[#0b1a15]/55 backdrop-blur-md"
      role="group"
      aria-label="Preview layout"
    >
      <button
        type="button"
        onClick={() => onChange("phone")}
        aria-pressed={mode === "phone"}
        className={`flex items-center gap-2 px-3.5 py-2 text-[0.5625rem] font-medium uppercase tracking-[0.16em] transition-colors duration-200 ${
          mode === "phone"
            ? "bg-[#f7f4ec] text-[#14201b]"
            : "text-white/45 hover:text-white"
        }`}
      >
        <Smartphone className="h-3 w-3" strokeWidth={1.75} />
        App
      </button>
      <button
        type="button"
        onClick={() => onChange("desktop")}
        aria-pressed={mode === "desktop"}
        className={`flex items-center gap-2 px-3.5 py-2 text-[0.5625rem] font-medium uppercase tracking-[0.16em] transition-colors duration-200 ${
          mode === "desktop"
            ? "bg-[#f7f4ec] text-[#14201b]"
            : "text-white/45 hover:text-white"
        }`}
      >
        <Monitor className="h-3 w-3" strokeWidth={1.75} />
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
      <div className="hero-desktop-window relative overflow-hidden rounded-2xl bg-[#e8ecea] shadow-[0_40px_90px_-24px_rgba(0,0,0,0.65)] ring-1 ring-white/20">
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
            <Image
              src={student.src}
              alt=""
              width={80}
              height={80}
              sizes="64px"
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
                        <Image
                          src={match.src}
                          alt=""
                          width={80}
                          height={80}
                          sizes="64px"
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
                      <Image
                        src={rowStudent.src}
                        alt=""
                        width={80}
                        height={80}
                        sizes="64px"
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
              <Image
                src={student.src}
                alt=""
                width={80}
                height={80}
                sizes="64px"
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
              <Image
                src={student.src}
                alt=""
                width={80}
                height={80}
                sizes="64px"
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
    <div className="mt-8 w-full border-t border-white/10 pt-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.5625rem] font-medium uppercase tracking-[0.2em] text-[#d8c9ab]/75">
          See it update live
        </p>
        <p className="text-[0.5625rem] uppercase tracking-[0.16em] text-white/40">
          Choose a learner
        </p>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex shrink-0 -space-x-2.5">
          {HERO_STUDENTS.map((student, i) => {
            const isSelected = student.id === selectedStudentId
            return (
              <button
                key={student.id}
                type="button"
                onClick={() => onSelectStudent(student.id)}
                className={`hero-stat-pop relative h-8 w-8 overflow-hidden rounded-full ring-1 transition-all duration-200 hover:z-10 hover:scale-105 sm:h-9 sm:w-9 ${
                  isSelected
                    ? "ring-[#d8c9ab] ring-offset-2 ring-offset-[#0b1a15]"
                    : "ring-white/25 hover:ring-white/60"
                }`}
                style={{ animationDelay: `${500 + i * 70}ms` }}
                aria-label={`${student.name}, ${student.status}`}
                aria-pressed={isSelected}
              >
                <Image
                  src={student.src}
                  alt=""
                  width={80}
                  height={80}
                  sizes="64px"
                  className="h-full w-full scale-[1.55] object-cover object-[center_20%]"
                />
              </button>
            )
          })}
        </div>
        <p
          key={selectedStudent.id}
          className="hero-profile-in min-w-0 flex-1 text-left text-[0.8125rem] font-medium leading-snug text-white/75"
        >
          {selectedStudent.pitchLine}
        </p>
      </div>
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
  const [hoveredModule, setHoveredModule] = useState<string | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState(HERO_DEFAULT_STUDENT_ID)
  // undefined = derive from student; null = Home overview; string = explicit module
  const [moduleOverride, setModuleOverride] = useState<string | null | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [demoPaused, setDemoPaused] = useState(false)
  // Desktop gets the full product view; phones keep the app frame.
  const isDesktopViewport = useSyncExternalStore(
    subscribeDesktopPreview,
    getDesktopPreviewSnapshot,
    getDesktopPreviewServerSnapshot,
  )
  const [previewOverride, setPreviewOverride] = useState<HeroPreviewMode | null>(null)
  const previewMode: HeroPreviewMode =
    previewOverride ?? (isDesktopViewport ? "desktop" : "phone")
  const [walkthroughOpen, setWalkthroughOpen] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)
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
  
  return (
    <div className="squl-marketing font-sans">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0b1a15]">
        <Header variant="hero" />

        <div className="absolute inset-0" aria-hidden>
          <Image
            src="/students/sq.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[70%_42%] opacity-90 saturate-[0.9] lg:object-[62%_45%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1a15] via-[#0b1a15]/95 to-[#0b1a15]/30 lg:via-[#0b1a15]/85 lg:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1a15] via-transparent to-[#0b1a15]/55" />
          <div className="mk-grain mk-grain--light" />
        </div>

        <div className="relative mk-container pb-16 pt-32 sm:pt-36 lg:pb-20 lg:pt-40">
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
            <div className="order-1 lg:col-span-6 xl:col-span-5">
              <p className="mk-eyebrow mk-eyebrow--light">School operations, connected</p>

              <h1 className="mt-8 font-display text-[clamp(2.6rem,4vw,3.55rem)] leading-[0.99] tracking-[-0.025em] text-[#f7f4ec]">
                School management
                <span className="mt-2 block italic text-[#d8c9ab]">built for Kenyan schools.</span>
              </h1>

              <p className="mt-7 max-w-[35rem] text-[1.0625rem] leading-[1.7] text-pretty text-white/65">
                The software that holds admissions, M-Pesa fees, CBC marks and parent SMS
                in one quiet system — so your office runs the way it should.
              </p>

              <HeroLiveDemoStrip
                selectedStudent={selectedStudent}
                selectedStudentId={selectedStudentId}
                onSelectStudent={selectStudent}
              />

              <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <Link href="/register" className="mk-btn mk-btn--paper w-full sm:w-auto">
                  Start your free term
                  <ArrowRight className="mk-arrow h-4 w-4" aria-hidden />
                </Link>
                <button
                  type="button"
                  onClick={() => setDemoOpen(true)}
                  className="mk-btn mk-btn--ghost-light w-full sm:w-auto"
                >
                  <Play className="h-3 w-3 fill-current" aria-hidden />
                  See SQUL in motion
                </button>
              </div>

              <p className="mt-6 text-[0.625rem] uppercase tracking-[0.17em] text-white/45">
                90-day free term · No credit card · Full access
              </p>
            </div>

            <div className="order-2 lg:col-span-6 lg:col-start-7">
              <div className="mb-5 flex justify-end">
                <HeroPreviewToggle
                  mode={previewMode}
                  onChange={(mode) => {
                    setPreviewOverride(mode)
                    setDemoPaused(true)
                  }}
                />
              </div>
              <div
                key={previewMode}
                className={`hero-profile-in ${
                  previewMode === "phone" ? "flex justify-center" : "overflow-visible pb-6"
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
        </div>
      </section>

      <main>
        <TrustStrip />

        {/* ── Platform ──────────────────────────────────────────────────── */}
        <section id="platform" className="mk-section scroll-mt-24">
          <div className="mk-container">
            <SectionIntro
              kicker="The platform"
              title={
                <>
                  Everything the office runs on,
                  <span className="block">
                    <em>under one roof.</em>
                  </span>
                </>
              }
              description="Six modules, one record. Enter an admission, a payment or a mark once — and it stays true in the bursar's office, the staff room and the parent's phone."
              aside={<TermStamp />}
            />

            <PlatformLedger />

            <Reveal>
              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#14201b]/10 pt-6">
                <p className="text-[0.625rem] uppercase tracking-[0.16em] text-[#7c857d]">
                  All six modules included in every term
                </p>
                <Link href="/register" className="mk-link text-[0.8125rem]">
                  Begin with your learner list
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Day to day ────────────────────────────────────────────────── */}
        <section className="mk-section border-t border-[#14201b]/10 bg-[#f2ede0]">
          <div className="mk-container">
            <SectionIntro
              kicker="Day to day"
              title={
                <>
                  Every job in your week,
                  <span className="block">
                    <em>joined end to end.</em>
                  </span>
                </>
              }
              description="From CBC marks in the staff room to M-Pesa in the bursar's office, SQUL follows the way your team already works — without a second register."
            />

            <div className="mt-16 grid gap-x-16 gap-y-14 md:grid-cols-2">
              {LANDING_WORKFLOW_BLOCKS.map((block, index) => (
                <Reveal key={block.id} delay={index * 60}>
                  <WorkflowEntry {...block} />
                </Reveal>
              ))}
            </div>

            <Reveal>
              <BursarSnapshot
                activeStudents={1284}
                feeCollectionRate={94}
                totalClasses={38}
                totalSubjects={12}
              />
            </Reveal>
          </div>
        </section>

        {/* ── Testimonial ───────────────────────────────────────────────── */}
        <section className="mk-section">
          <div className="mk-container">
            <Reveal>
              <figure className="mx-auto max-w-4xl text-center">
                <p className="mk-caption">What a bursar says</p>
                <blockquote className="mt-10 text-balance font-display text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.2] tracking-[-0.015em] text-[#14201b]">
                  “We stopped chasing parents for fees in the office. SQUL matches the
                  M-Pesa payments and the SMS reminders do the chasing for us.”
                </blockquote>
                <figcaption className="mt-10 flex flex-col items-center">
                  <span className="h-px w-8 bg-[#a98a55]/60" aria-hidden />
                  <p className="mt-6 text-[0.8125rem] font-medium text-[#14201b]">Jane Njeri</p>
                  <p className="mt-1.5 text-[0.625rem] uppercase tracking-[0.16em] text-[#7c857d]">
                    Bursar · Unity Secondary School, Nakuru
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </section>

        {/* ── In the schoolroom ─────────────────────────────────────────── */}
        <section className="mk-section border-t border-[#14201b]/10">
          <div className="mk-container">
            <SectionIntro
              kicker="In the schoolroom"
              title={
                <>
                  See SQUL in the work
                  <span className="block">
                    <em>your team already does.</em>
                  </span>
                </>
              }
              description="Kenyan classrooms, bursar counters and staff rooms — each view below is a job your administrators run every week."
            />

            <div className="mt-20 space-y-24 lg:space-y-32">
              {LANDING_DEEP_DIVES.map((dive, index) => (
                <Reveal key={dive.id} delay={index * 60}>
                  <DeepDive {...dive} index={index} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Domains ───────────────────────────────────────────────────── */}
        <section
          id="custom-domains"
          className="mk-section scroll-mt-24 border-t border-[#14201b]/10 bg-[#f2ede0]"
        >
          <div className="mk-container">
            <SectionIntro
              kicker="Your own web address"
              title={
                <>
                  A domain parents
                  <span className="block">
                    <em>already trust.</em>
                  </span>
                </>
              }
              description="Run your school site on myschool.ac.ke with free HTTPS — connect a domain you already own, or buy a new one and pay with M-Pesa from your dashboard."
            />

            <div className="mt-16 grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
              <Reveal className="lg:col-span-7">
                <div className="grid gap-5 sm:grid-cols-2">
                  <ConnectDomainPreview image={DOMAIN_HOME_SHOTS.connect} />
                  <LiveDomainPreview image={DOMAIN_HOME_SHOTS.live} />
                </div>
              </Reveal>

              <div className="lg:col-span-4 lg:col-start-9">
                <ul>
                  {DOMAIN_HOME_HIGHLIGHTS.map((item) => (
                    <li key={item.title} className="border-t border-[#14201b]/12 py-5 last:border-b">
                      <div className="flex items-center gap-3">
                        <item.icon
                          className="h-3.5 w-3.5 shrink-0 text-[#1c3d32]/50"
                          strokeWidth={1.5}
                          aria-hidden
                        />
                        <p className="text-[0.8125rem] font-medium text-[#14201b]">{item.title}</p>
                      </div>
                      <p className="mt-2 pl-[1.6rem] text-[0.8125rem] leading-[1.65] text-[#4d574f]">
                        {item.body}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href="/custom-domains"
                    className="mk-btn mk-btn--ink h-11 px-5 text-[0.8125rem]"
                  >
                    How domains work
                    <ArrowRight className="mk-arrow h-3.5 w-3.5" aria-hidden />
                  </Link>
                  <Link
                    href="/register"
                    className="mk-btn mk-btn--outline h-11 px-5 text-[0.8125rem]"
                  >
                    Start free term
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <section className="mk-section border-t border-[#14201b]/10">
          <div className="mk-container">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-4">
                <p className="mk-eyebrow">Before you sign up</p>
                <h2 className="mk-h2 mt-7">
                  Questions,
                  <span className="block">
                    <em>answered plainly.</em>
                  </span>
                </h2>
                <p className="mk-lede mt-6">
                  Data, timelines, parents and phones — no enterprise jargon.
                </p>
                <a
                  href={`mailto:${LEGAL_META.contactEmail}`}
                  className="mk-link mt-8 text-[0.8125rem]"
                >
                  Ask us anything
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </a>
              </div>
              <div className="lg:col-span-7 lg:col-start-6">
                <FaqAccordion />
              </div>
            </div>
          </div>
        </section>

        {/* ── Closing ───────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#0d201a]">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(247,244,236,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(247,244,236,0.045) 1px, transparent 1px)",
              backgroundSize: "88px 44px",
            }}
            aria-hidden
          />
          <div className="mk-grain mk-grain--light" aria-hidden />
          <div className="relative mk-container py-24 text-center sm:py-32">
            <Reveal>
              <p className="mk-eyebrow mk-eyebrow--light justify-center">Next term</p>
              <h2 className="mx-auto mt-8 max-w-3xl font-display text-[clamp(2.6rem,5.6vw,4.6rem)] leading-[1.02] tracking-[-0.025em] text-[#f7f4ec]">
                Begin the term
                <span className="mt-1 block italic text-[#d8c9ab]">with a calmer office.</span>
              </h2>
              <p className="mx-auto mt-7 max-w-xl text-[1rem] leading-[1.7] text-white/55">
                Import your learner list, match your fee structure, and go live before
                parents&apos; reporting day. No IT project, no consultants.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/register" className="mk-btn mk-btn--paper w-full sm:w-auto">
                  Start your free term
                  <ArrowRight className="mk-arrow h-4 w-4" aria-hidden />
                </Link>
                <button
                  type="button"
                  onClick={() => setDemoOpen(true)}
                  className="mk-btn mk-btn--ghost-light w-full sm:w-auto"
                >
                  <Play className="h-3 w-3 fill-current" aria-hidden />
                  See SQUL in motion
                </button>
              </div>
              <p className="mt-7 text-[0.625rem] uppercase tracking-[0.18em] text-white/40">
                90-day free term · No credit card · Cancel anytime
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <footer className="relative overflow-hidden bg-[#0d201a] text-[#f7f4ec]">
          <div className="mk-grain mk-grain--light" aria-hidden />
          <div className="relative mk-container">
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-5">
              <div className="flex items-center gap-2.5 text-[0.625rem] font-medium uppercase tracking-[0.18em] text-[#d8c9ab]/70">
                <SchoolBell className="h-3.5 w-3.5" />
                End of day · 4:00 PM
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-white/40">
                <span>Nairobi · 1°17′S 36°49′E</span>
                <span>Term 1 / 2026</span>
              </div>
            </div>

            <div className="grid gap-14 py-16 lg:grid-cols-12 lg:gap-10 lg:py-24">
              <div className="lg:col-span-6">
                <p className="mk-eyebrow mk-eyebrow--light">The gate is open</p>
                <h2 className="mt-6 font-display text-[clamp(2.75rem,6vw,5rem)] leading-[0.95] tracking-[-0.03em] text-[#f7f4ec]">
                  School&apos;s out.
                  <span className="mt-2 block text-balance italic text-[#d8c9ab]">
                    The next term starts here.
                  </span>
                </h2>
                <p className="mt-6 max-w-md text-sm leading-[1.7] text-white/50">
                  One system for admissions, M-Pesa fees, CBC marks and parent SMS — built
                  in Nairobi for Kenyan schools.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/register" className="mk-btn mk-btn--paper h-11 px-5 text-[0.8125rem]">
                    Start your free term
                  </Link>
                  <Link
                    href="/login"
                    className="mk-btn mk-btn--ghost-light h-11 px-5 text-[0.8125rem]"
                  >
                    Sign in
                  </Link>
                </div>
                <p className="mt-5 text-[0.625rem] uppercase tracking-[0.16em] text-white/30">
                  90-day free trial · No credit card
                </p>
              </div>

              <div className="lg:col-span-6 lg:pl-8">
                <div className="bg-[#f7f4ec] p-6 text-[#14201b] sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#14201b]/10 pb-5">
                    <div>
                      <p className="text-[0.5625rem] font-medium uppercase tracking-[0.2em] text-[#1c3d32]">
                        The week, in links
                      </p>
                      <p className="mt-2 font-display text-2xl leading-tight tracking-[-0.015em]">
                        Six periods. One system.
                      </p>
                    </div>
                    <div className="text-right font-mono text-[0.5625rem] uppercase leading-relaxed tracking-[0.12em] text-[#14201b]/35">
                      <p>Periods 01—06</p>
                      <p>07:30 — 16:00</p>
                    </div>
                  </div>

                  <div>
                    {LANDING_FOOTER_PERIODS.map((period, index) => (
                      <Link
                        key={period.label}
                        href={period.href}
                        className="group grid grid-cols-[3rem_1.1rem_1fr_auto] items-center gap-3 border-b border-[#14201b]/8 py-3.5 transition-colors duration-200 hover:bg-[#14201b]/[0.03]"
                      >
                        <span className="font-mono text-[0.5625rem] tabular-nums text-[#14201b]/35">
                          {period.time}
                        </span>
                        <span className="font-mono text-[0.5625rem] tabular-nums text-[#14201b]/20">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="font-display text-[1.1rem] leading-snug tracking-[-0.01em] text-[#14201b] transition-colors duration-200 group-hover:text-[#1c3d32]">
                          {period.label}
                        </span>
                        <ArrowUpRight
                          className="h-3.5 w-3.5 text-[#1c3d32]/30 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#1c3d32]"
                          aria-hidden
                        />
                      </Link>
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.6875rem] font-medium text-[#14201b]/50">
                    <Link href="/schools" className="transition-colors hover:text-[#1c3d32]">
                      Schools on SQUL
                    </Link>
                    <button
                      type="button"
                      onClick={() => setWalkthroughOpen(true)}
                      className="transition-colors hover:text-[#1c3d32]"
                    >
                      Book a walkthrough
                    </button>
                    <a
                      href={LANDING_APP_DOWNLOAD_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="transition-colors hover:text-[#1c3d32]"
                    >
                      Download the app
                    </a>
                    <Link href="/login" className="transition-colors hover:text-[#1c3d32]">
                      Sign in
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-8 border-t border-white/10 py-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <Link href="/" className="inline-flex items-center" aria-label="SQUL home">
                  <SqulWordmark tone="light" markSize={28} />
                </Link>
                <p className="mt-4 max-w-xs text-xs leading-relaxed text-white/35">
                  School operations, connected. Built in Nairobi for Kenyan classrooms.
                </p>
              </div>
              <div className="lg:col-span-4">
                <p className="text-[0.5625rem] font-medium uppercase tracking-[0.2em] text-[#d8c9ab]/60">
                  Talk to us
                </p>
                <div className="mt-4 flex flex-col gap-1.5 text-xs text-white/40">
                  <a
                    href={`mailto:${LEGAL_META.contactEmail}`}
                    className="transition-colors hover:text-[#d8c9ab]"
                  >
                    {LEGAL_META.contactEmail}
                  </a>
                  <a
                    href={`tel:${LEGAL_META.contactPhoneHref}`}
                    className="transition-colors hover:text-[#d8c9ab]"
                  >
                    {LEGAL_META.contactPhone}
                  </a>
                  <span>{LEGAL_META.postalAddress}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 lg:col-span-3 lg:items-end">
                <div className="flex gap-5 text-xs text-white/40">
                  <Link href="/privacy" className="transition-colors hover:text-[#d8c9ab]">
                    Privacy
                  </Link>
                  <Link href="/terms" className="transition-colors hover:text-[#d8c9ab]">
                    Terms
                  </Link>
                </div>
                <p className="font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-white/35">
                  © {new Date().getFullYear()} SQUL · All rights reserved
                </p>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <WalkthroughDialog open={walkthroughOpen} onOpenChange={setWalkthroughOpen} />
      <WalkthroughDialog variant="demo" open={demoOpen} onOpenChange={setDemoOpen} />
    </div>
  )
}
