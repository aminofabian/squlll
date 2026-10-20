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
      "Match Paybill and till payments to the right learner, with receipts sent before the parent leaves.",
    highlight: "Auto receipts",
  },
  {
    icon: ClipboardList,
    title: "Admissions & student files",
    description:
      "Issue admission numbers, assign classes and link guardians in one flow.",
    highlight: "ID in minutes",
  },
  {
    icon: NotebookPen,
    title: "CBC marks & reports",
    description:
      "Enter CBC rubrics and exam marks once; term reports print themselves.",
    highlight: "Term reports",
  },
  {
    icon: Smartphone,
    title: "Parent SMS alerts",
    description:
      "Fee reminders, absence alerts and exam notices by SMS — nothing lost in a group chat.",
    highlight: "Bulk SMS",
  },
  {
    icon: CalendarClock,
    title: "Timetables & duty rosters",
    description:
      "Publish class timetables and teacher duty lists your team can trust.",
    highlight: "Live schedules",
  },
  {
    icon: UserCheck,
    title: "Daily attendance",
    description:
      "Morning roll call on phone or desktop, with an SMS to the parent.",
    highlight: "Same-day SMS",
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
      { threshold: 0.08, rootMargin: "0px 0px -5% 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${className} transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      {children}
    </div>
  )
}

/** Section opener: a numbered eyebrow, a large statement, an optional aside. */
function SectionHead({
  index,
  kicker,
  title,
  lede,
}: {
  index: string
  kicker: string
  title: ReactNode
  lede?: ReactNode
}) {
  return (
    <Reveal>
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <p className="flex items-center gap-4 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-[#7c857d]">
            <span className="text-[#1c3d32]">{index}</span>
            <span className="h-px w-7 bg-[#14201b]/20" aria-hidden />
            {kicker}
          </p>
          <h2 className="mt-7 max-w-[24ch] font-display text-[clamp(2.4rem,4.3vw,3.9rem)] leading-[0.98] tracking-[-0.03em] text-[#14201b]">
            {title}
          </h2>
        </div>
        {lede ? (
          <div className="flex items-end lg:col-span-4 lg:col-start-9">
            <p className="mk-lede">{lede}</p>
          </div>
        ) : null}
      </div>
    </Reveal>
  )
}

/** The six modules, as a quiet two-column index rather than a card grid. */
function ModulesIndex() {
  return (
    <div className="grid gap-x-14 sm:grid-cols-2">
      {LANDING_PLATFORM_MODULES.map((feature, index) => {
        return (
          <div
            key={feature.title}
            className="group border-t border-[#14201b]/12 py-6 transition-colors duration-200"
          >
            <span className="font-mono text-[0.5625rem] tabular-nums text-[#7c857d]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-4 font-display text-[1.35rem] leading-[1.1] tracking-[-0.015em] text-[#14201b]">
              {feature.title}
            </h3>
            <p className="mt-2 max-w-[40ch] text-[0.8125rem] leading-[1.6] text-[#4d574f]">
              {feature.description}
            </p>
          </div>
        )
      })}
    </div>
  )
}

const DAY_TO_DAY = [
  {
    n: "01",
    title: "Admissions",
    body: "Enquiry, interview, class placement and admission number in a single flow.",
  },
  {
    n: "02",
    title: "Fees & M-Pesa",
    body: "Paybill and till payments matched to the right learner, receipt sent the same morning.",
  },
  {
    n: "03",
    title: "Academics",
    body: "CBC strands, exam marks and term reports — entered once, printed once.",
  },
  {
    n: "04",
    title: "Families",
    body: "Fee reminders, absence alerts and exam notices by SMS, not another WhatsApp group.",
  },
]

function DayToDay() {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
      <Reveal className="lg:col-span-5">
        <figure>
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#e8e2d4]">
            <Image
              src="/students/sq.png"
              alt="A teacher and learners during a lesson in a Kenyan classroom"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="mk-photo object-cover object-[55%_45%]"
            />
          </div>
          <figcaption className="mt-3 flex items-center justify-between font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-[#7c857d]">
            <span>A Kenyan classroom</span>
            <span>Morning</span>
          </figcaption>
        </figure>
      </Reveal>

      <div className="lg:col-span-6 lg:col-start-7">
        <p className="flex items-center gap-4 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-[#7c857d]">
          <span className="text-[#1c3d32]">03</span>
          <span className="h-px w-7 bg-[#14201b]/20" aria-hidden />
          Day to day
        </p>
        <h2 className="mt-7 max-w-[15ch] font-display text-[clamp(2.3rem,3.9vw,3.5rem)] leading-[0.99] tracking-[-0.03em] text-[#14201b]">
          The work that keeps a term moving.
        </h2>

        <div className="mt-9">
          {DAY_TO_DAY.map((item) => (
            <div
              key={item.n}
              className="grid grid-cols-[2.25rem_1fr] gap-4 border-t border-[#14201b]/12 py-5 last:border-b"
            >
              <span className="pt-1 font-mono text-[0.5625rem] tabular-nums text-[#a98a55]">
                {item.n}
              </span>
              <div>
                <h3 className="text-[0.9375rem] font-medium text-[#14201b]">{item.title}</h3>
                <p className="mt-1 max-w-[44ch] text-[0.8125rem] leading-[1.6] text-[#4d574f]">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** A term report, set like a printed document. */
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
              <p className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-[#7c857d]">
                Term 2 · 2026 · CBC
              </p>
              <p className="mt-2.5 font-display text-[1.9rem] leading-none tracking-[-0.02em]">
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
            <div className="grid grid-cols-[1fr_3rem_2.5rem] gap-4 py-3 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-[#7c857d]">
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
                <span className="text-right font-display text-[1.1rem] leading-none text-[#14201b]">
                  {row.grade}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-end justify-between border-t border-[#14201b]/12 pt-5">
            <div>
              <p className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-[#7c857d]">
                Mean score
              </p>
              <p className="mt-1.5 font-display text-[2.6rem] leading-none tracking-[-0.02em]">
                84.5
              </p>
            </div>
            <p className="max-w-[11rem] text-right text-[0.625rem] leading-relaxed text-[#7c857d]">
              Marks entered once. Printed for every parent on closing day.
            </p>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 flex items-center justify-between font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-[#7c857d]">
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
              <p className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-[#7c857d]">
                Bursar · live
              </p>
              <p className="mt-2 font-display text-[1.7rem] leading-none tracking-[-0.015em]">
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
              <p className="font-mono text-[0.5rem] uppercase tracking-[0.14em] text-[#7c857d]">
                Collected today
              </p>
              <p className="mt-1.5 font-display text-[2.2rem] leading-none tabular-nums tracking-[-0.02em]">
                KES 25,900
              </p>
            </div>
            <p className="font-mono text-[0.625rem] text-[#a98a55]">+12%</p>
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
                  className={`flex items-center justify-end gap-1.5 font-mono text-[0.5rem] uppercase tracking-[0.08em] ${
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
      <figcaption className="mt-3 flex items-center justify-between font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-[#7c857d]">
        <span>Fee reconciliation · Morning</span>
        <span>M-Pesa</span>
      </figcaption>
    </figure>
  )
}

function DeepDive({
  index,
  title,
  intro,
  items,
  imageRight,
  children,
}: {
  index: number
  title: string
  intro: string
  items: { title: string; description: string }[]
  imageRight: boolean
  children: ReactNode
}) {
  const copy = (
    <div className={`lg:col-span-5 ${imageRight ? "lg:order-1" : "lg:order-2 lg:col-start-8"}`}>
      <p className="font-mono text-[0.5625rem] tabular-nums text-[#a98a55]">
        {String(index + 1).padStart(2, "0")}
      </p>
      <h3 className="mt-4 max-w-[16ch] font-display text-[clamp(2rem,3.1vw,2.6rem)] leading-[1.02] tracking-[-0.025em] text-[#14201b]">
        {title}
      </h3>
      <p className="mt-5 max-w-[38ch] text-[0.9375rem] leading-[1.65] text-[#4d574f]">{intro}</p>
      <dl className="mt-8">
        {items.map((item) => (
          <div key={item.title} className="border-t border-[#14201b]/12 py-4 last:border-b">
            <dt className="text-[0.8125rem] font-medium text-[#14201b]">{item.title}</dt>
            <dd className="mt-1.5 text-[0.8125rem] leading-[1.6] text-[#4d574f]">
              {item.description}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )

  const visual = (
    <div
      className={`lg:col-span-6 ${imageRight ? "lg:order-2 lg:col-start-7" : "lg:order-1"}`}
    >
      {children}
    </div>
  )

  return (
    <article className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
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
          <div key={item.question} className="border-t border-[#14201b]/12 last:border-b">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="group flex w-full items-start justify-between gap-8 py-5 text-left"
            >
              <span className="flex items-baseline gap-5">
                <span className="font-mono text-[0.5625rem] tabular-nums text-[#7c857d]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="max-w-[30ch] font-display text-[1.3rem] leading-[1.15] tracking-[-0.015em] text-[#14201b] transition-colors duration-200 group-hover:text-[#1c3d32] sm:max-w-none sm:text-[1.45rem]">
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
                <p className="max-w-[62ch] pb-6 pl-[2.3rem] pr-10 text-[0.875rem] leading-[1.7] text-[#4d574f]">
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
        <div className="pointer-events-none absolute -left-[2px] top-28 h-8 w-[3px] rounded-l-sm bg-[#fcfaf4]/20" />
        <div className="pointer-events-none absolute -left-[2px] top-40 h-12 w-[3px] rounded-l-sm bg-[#fcfaf4]/20" />
        <div className="pointer-events-none absolute -right-[2px] top-36 h-14 w-[3px] rounded-r-sm bg-[#fcfaf4]/20" />

        <div className="relative overflow-hidden rounded-[1.65rem] bg-[#fcfaf4]">
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
    <div className="relative mx-auto w-full max-w-[1020px]">
      {/* Desktop app window */}
      <div className="relative overflow-hidden rounded-[2px] bg-[#f7f4ec] shadow-[0_60px_140px_-40px_rgba(0,0,0,0.8)] ring-1 ring-white/15">
        {/* Title bar */}
        <div className="flex h-10 items-center justify-between gap-4 border-b border-[#14201b]/10 bg-[#efeadd] px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#a98a55]" aria-hidden />
            <span className="truncate font-mono text-[0.5rem] uppercase tracking-[0.14em] text-[#4d574f]">
              SQUL · School Admin
            </span>
          </div>
          <span className="hidden font-mono text-[0.5rem] uppercase tracking-[0.12em] text-[#7c857d] sm:block">
            app.squl.co.ke
          </span>
        </div>

        {/* App content */}
        <div className="overflow-hidden bg-[#fcfaf4] ">{children}</div>
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
            isActive ? "text-[#1c3d32]" : "text-[#7c857d]"
          }`}
        >
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-[2px] transition-colors ${
              isActive ? "bg-[#efeadd] text-[#1c3d32]" : ""
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
                isActive ? "text-[#1c3d32]" : "text-[#4d574f]"
              }`
            : `w-full flex-col items-center gap-0.5 px-1 py-1.5 ${
                isActive ? "text-[#1c3d32]" : "text-[#4d574f] hover:text-[#3f4a43]"
              }`
        }`}
      >
        <span
          className={`flex items-center justify-center ${
            compact ? "h-8 w-8" : "h-8 w-8 sm:h-9 sm:w-9"
          } ${isActive || isLinked ? "bg-[#e7ebe2]" : ""}`}
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
          : "flex h-[380px] w-full flex-col overflow-hidden bg-[#fcfaf4] sm:h-[420px] md:h-[500px] md:flex-row md:items-stretch lg:h-[540px]"
      }
    >
      {/* Desktop sidebar with labels */}
      {!isPhone && (
        <aside className="flex w-[132px] shrink-0 flex-col border-r border-[#14201b]/10 bg-[#f7f9f8] py-3 sm:w-[148px]">
          <button
            type="button"
            onClick={() => onSelectModule(null)}
            className="mx-3 mb-3 flex items-center gap-2 rounded-[2px] px-2 py-1.5 text-left transition-colors hover:bg-[#fcfaf4]"
            aria-label="Home"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[2px] bg-[#1c3d32] text-[11px] font-bold text-white ">
              SQ
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold text-[#14201b]">SQUL</span>
              <span className="block truncate text-[10px] text-[#7c857d]">Admin</span>
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
                  className={`flex items-center gap-2.5 rounded-[2px] px-2.5 py-2 text-left text-[12px] transition-colors ${
                    isActive
                      ? "bg-[#fcfaf4] font-semibold text-[#1c3d32]  ring-1 ring-[#e7ebe2]"
                      : "font-medium text-[#4d574f] hover:bg-[#fcfaf4]/80 hover:text-[#14201b]"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${isActive ? "text-[#1c3d32]" : "text-[#7c857d]"}`}
                    strokeWidth={isActive ? 2.25 : 1.75}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              )
            })}
          </nav>
          <div className="mx-3 mt-2 border-t border-[#14201b]/10 pt-2">
            <p className="truncate px-1 text-[10px] text-[#7c857d]">Term 2 · 2026</p>
          </div>
        </aside>
      )}

      {/* Main canvas */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#fcfaf4]">
        {/* Phone status bar */}
        {isPhone && (
          <div className="flex shrink-0 items-end justify-between px-6 pb-1 pt-3 text-[11px] font-semibold text-[#14201b]">
            <span className="tabular-nums">9:41</span>
            <div className="flex items-center gap-1.5 text-[#14201b]">
              <span className="text-[9px] font-bold tracking-tight">5G</span>
              <span className="flex h-2.5 items-end gap-[2px]" aria-hidden>
                <span className="h-1 w-[3px] rounded-sm bg-[#14201b]" />
                <span className="h-1.5 w-[3px] rounded-sm bg-[#14201b]" />
                <span className="h-2 w-[3px] rounded-sm bg-[#14201b]" />
                <span className="h-2.5 w-[3px] rounded-sm bg-[#14201b]/35" />
              </span>
              <span className="relative h-[11px] w-[22px] rounded-[3px] border border-[#14201b]/80">
                <span className="absolute inset-[2px] right-[3px] rounded-[1px] bg-[#1c3d32]" />
                <span className="absolute -right-[3px] top-1/2 h-[5px] w-[1.5px] -translate-y-1/2 rounded-r-sm bg-[#14201b]/80" />
              </span>
            </div>
          </div>
        )}

        {/* App header */}
        <header
          className={`flex shrink-0 items-center gap-2 border-b border-[#14201b]/8 ${
            isPhone ? "px-4 pb-3 pt-2" : "gap-3 px-4 py-3"
          }`}
        >
          {isPhone && (
            <button
              type="button"
              onClick={() => onSelectModule(null)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] bg-[#1c3d32] text-[11px] font-bold text-white "
              aria-label="Home"
            >
              SQ
            </button>
          )}
          <div className="min-w-0 flex-1">
            <p
              className={`truncate font-semibold text-[#14201b] ${
                isPhone ? "text-[15px]" : "text-sm"
              }`}
            >
              {linkedModule ?? "Dashboard"}
            </p>
            <p
              className={`truncate text-[#7c857d] ${
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
            className={`flex shrink-0 items-center gap-1 bg-[#efeadd] ring-1 ring-[#e7ebe2] ${
              isPhone ? "rounded-full px-2.5 py-1" : "rounded-md px-2.5 py-1"
            }`}
          >
            <Radio
              className={`text-[#1c3d32] ${isPhone ? "h-3 w-3" : "h-3.5 w-3.5"}`}
            />
            <span
              className={`font-bold uppercase tracking-wide text-[#1c3d32] ${
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
                      ? "bg-[#efeadd] text-[#1c3d32]"
                      : "bg-[#efeadd] text-[#4d574f]"
                  }`
                : `h-8 w-8 rounded-[2px] ${
                    notificationsOpen
                      ? "bg-[#efeadd] text-[#1c3d32]"
                      : "text-[#7c857d] hover:bg-[#efeadd]"
                  }`
            }`}
          >
            <Bell className={isPhone ? "h-4 w-4" : "h-4 w-4"} />
            {!notificationsOpen && (
              <span
                className={`absolute bg-[#1c3d32] ${
                  isPhone ? "right-2 top-2 h-2 w-2 rounded-full" : "right-1.5 top-1.5 h-2 w-2 rounded-full"
                }`}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => onSelectStudent(student.id)}
            className={`shrink-0 overflow-hidden bg-[#e7ebe2] ring-1 ring-[#cfd8cc] transition-shadow hover:ring-[#a98a55] ${
              isPhone ? "h-9 w-9 rounded-full" : "h-8 w-8 rounded-[2px]"
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
            className={`border-b border-[#e7ebe2] bg-[#efeadd]/80 ${
              isPhone ? "px-4 py-3" : "px-2.5 py-2 sm:px-3"
            }`}
          >
            <p className={`font-semibold text-[#14201b] ${isPhone ? "text-xs" : "text-[10px]"}`}>
              3 new updates today
            </p>
            <p className={`mt-0.5 text-[#1c3d32]/80 ${isPhone ? "text-[11px]" : "text-[9px]"}`}>
              M-Pesa matched · Admission #2043 · CBC reminder sent
            </p>
          </div>
        )}

        <div
          className={`min-h-0 flex-1 space-y-2.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            isPhone
              ? "bg-[#f4f6f5] px-3 py-3"
              : "space-y-3 bg-[#f7f4ec] p-3.5 [scrollbar-width:thin]"
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
                      ? `min-w-[88px] shrink-0 rounded-[2px] border px-3 py-2.5 text-left transition-all active:scale-[0.98] ${
                          isActive
                            ? "border-[#b9c4b6] bg-[#fcfaf4]  shadow-[#14201b]/5"
                            : "border-transparent bg-[#fcfaf4]/80"
                        }`
                      : `rounded-[2px] border px-3 py-2.5 text-left transition-colors ${
                          isActive
                            ? "border-[#cfd8cc] bg-[#efeadd]/90 "
                            : "border-[#14201b]/10 bg-[#fcfaf4] hover:border-[#14201b]/15 hover:bg-[#f7f4ec]"
                        }`
                  }
                >
                  <p
                    className={`font-medium uppercase tracking-wide text-[#7c857d] ${
                      isPhone ? "text-[9px]" : "text-[10px]"
                    }`}
                  >
                    {stat.label}
                  </p>
                  <p
                    className={`mt-0.5 font-semibold tabular-nums text-[#14201b] ${
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
            className={`relative bg-[#fcfaf4]  ${
              isPhone
                ? "rounded-[2px] border border-[#14201b]/10 p-3"
                : "rounded-[2px] border border-[#14201b]/10 p-3"
            }`}
          >
            <div className="flex items-center gap-2">
              <Search
                className={`shrink-0 text-[#7c857d] ${isPhone ? "h-4 w-4" : "h-3.5 w-3.5"}`}
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
                className={`min-w-0 flex-1 truncate bg-transparent font-medium text-[#14201b] outline-none placeholder:text-[#7c857d] ${
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
              className={`hero-profile-in mt-1.5 flex items-center gap-1.5 text-[#4d574f] ${
                isPhone ? "text-xs" : "text-[9px] sm:text-[11px]"
              }`}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1c3d32]" />
              <span className="line-clamp-2 sm:truncate">{student.detail}</span>
            </p>

            {showSearchResults && (
              <div
                className={`absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden border border-[#14201b]/10 bg-[#fcfaf4] shadow-lg ${
                  isPhone ? "rounded-[2px]" : ""
                }`}
              >
                {searchMatches.length === 0 ? (
                  <p className="px-3 py-2.5 text-[11px] text-[#4d574f]">
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
                      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-[#efeadd] ${
                        match.id === student.id ? "bg-[#efeadd]/70" : ""
                      }`}
                    >
                      <div
                        className={`h-8 w-8 shrink-0 overflow-hidden bg-[#efeadd] ring-1 ring-slate-200 ${
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
                        <p className="truncate text-sm font-medium text-[#14201b]">{match.name}</p>
                        <p className="truncate text-[11px] text-[#4d574f]">
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
                      ? `flex items-center gap-2.5 rounded-[2px] border px-3 py-3 text-left transition-all active:scale-[0.98] ${
                          isLinked
                            ? "border-[#b9c4b6] bg-[#efeadd] "
                            : "border-transparent bg-[#fcfaf4]"
                        }`
                      : `flex items-center gap-3 rounded-[2px] border px-3 py-2.5 text-left transition-colors ${
                          isLinked
                            ? "border-[#cfd8cc] bg-[#efeadd]/90 "
                            : "border-[#14201b]/10 bg-[#fcfaf4] hover:border-[#14201b]/15 hover:bg-[#f7f4ec]"
                        }`
                  }
                >
                  <span
                    className={`flex shrink-0 items-center justify-center ${
                      isPhone ? "h-10 w-10 rounded-[2px]" : "h-9 w-9 rounded-[2px]"
                    } ${isLinked ? "bg-[#1c3d32] text-white" : "bg-[#efeadd] text-[#7c857d]"}`}
                  >
                    <Icon className={isPhone ? "h-4 w-4" : "h-4 w-4"} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate ${
                        isPhone ? "text-[13px]" : "text-[13px]"
                      } ${isLinked ? "font-semibold text-[#14201b]" : "font-medium text-[#4d574f]"}`}
                    >
                      {mod.label}
                    </p>
                    <p
                      className={`truncate tabular-nums ${
                        isPhone ? "text-[11px]" : "text-xs"
                      } ${isLinked ? "font-semibold text-[#1c3d32]" : "text-[#4d574f]"}`}
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
            className={`overflow-hidden bg-[#fcfaf4] ${
              isPhone
                ? "rounded-[2px] border border-[#14201b]/10"
                : "border border-[#14201b]/10"
            }`}
          >
            <div
              className={`flex items-center justify-between border-b border-[#14201b]/8 ${
                isPhone ? "px-3.5 py-2.5" : "px-2 py-1.5 sm:px-2.5 sm:py-2 md:px-3"
              }`}
            >
              <p
                className={`font-semibold text-[#3f4a43] ${
                  isPhone ? "text-[13px]" : "text-[10px] sm:text-[11px]"
                }`}
              >
                Recent activity
              </p>
              <p className={`text-[#7c857d] ${isPhone ? "text-[11px]" : "text-[9px]"}`}>Today</p>
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
                        ? `gap-3 px-3.5 py-3 active:bg-[#f7f4ec] ${
                            isSelected ? "bg-[#efeadd]" : ""
                          }`
                        : `gap-1.5 px-2 py-1.5 sm:gap-2 sm:px-2.5 sm:py-2 md:px-3 md:py-2.5 ${
                            isSelected ? "bg-[#efeadd]/60" : "hover:bg-[#f7f4ec]"
                          }`
                    }`}
                  >
                    <div
                      className={`shrink-0 overflow-hidden bg-[#efeadd] ring-1 ${
                        isPhone
                          ? `h-10 w-10 rounded-full ${
                              isSelected ? "ring-[#a98a55]" : "ring-slate-200"
                            }`
                          : `h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 ${
                              isSelected ? "ring-[#b9c4b6]" : "ring-slate-200"
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
                            ? "font-semibold text-[#14201b]"
                            : "font-medium text-[#3f4a43]"
                        }`}
                      >
                        {row.title}
                      </p>
                      <p
                        className={`truncate text-[#4d574f] ${
                          isPhone ? "mt-0.5 text-[11px]" : "hidden text-[9px] sm:block sm:text-[10px]"
                        }`}
                      >
                        {row.meta}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 tabular-nums text-[#7c857d] ${
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
            className="flex shrink-0 items-center gap-1.5 border-t border-[#14201b]/8 bg-[#f7f4ec]/80 px-2.5 py-1.5 text-left transition-colors hover:bg-[#efeadd]/50 sm:gap-2 sm:px-3 sm:py-2 md:px-4"
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
              className="hero-profile-in min-w-0 text-[9px] leading-snug text-[#4d574f] sm:text-[10px] md:text-[11px]"
            >
              <span className="font-semibold text-[#14201b]">{student.shortName}</span>
              <span className="text-[#7c857d]"> — </span>
              <span className="line-clamp-2 md:truncate">{student.insight}</span>
            </p>
          </button>
        )}

        {/* Phone context chip above tab bar */}
        {isPhone && (
          <button
            type="button"
            onClick={() => onSelectStudent(student.id)}
            className="mx-3 mb-1 flex shrink-0 items-center gap-2.5 rounded-[2px] border border-[#e7ebe2] bg-[#fcfaf4] px-3 py-2.5 text-left "
          >
            <div
              key={student.id}
              className="hero-profile-in h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-[#e7ebe2]"
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
              className="hero-profile-in min-w-0 text-xs leading-snug text-[#4d574f]"
            >
              <span className="font-semibold text-[#14201b]">{student.shortName}</span>
              <span className="text-[#7c857d]"> · </span>
              <span className="line-clamp-1">{student.insight}</span>
            </p>
          </button>
        )}

        {/* Bottom nav — phone only */}
        {isPhone && (
          <nav className="flex shrink-0 items-center border-t border-[#14201b]/10 bg-[#fcfaf4] px-1 pb-[calc(0.35rem+env(safe-area-inset-bottom))] pt-1">
            {HERO_SIDEBAR_NAV.map((item) => renderNavItem(item, true))}
          </nav>
        )}

        {isPhone && (
          <div className="flex shrink-0 justify-center bg-[#fcfaf4] pb-2 pt-0.5" aria-hidden>
            <div className="h-1 w-28 rounded-full bg-[#14201b]/80" />
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
  fees: "bg-[#e7ebe2] text-[#1c3d32]",
  attendance: "bg-[#e7ebe2] text-[#4d574f]",
  admission: "bg-[#f0e6d2] text-[#8a6a3a]",
  exams: "bg-[#e9e2d8] text-[#6b5a43]",
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
  
  const cbcDive = LANDING_DEEP_DIVES.find((dive) => dive.id === "cbc") ?? LANDING_DEEP_DIVES[0]
  const bursarDive = LANDING_DEEP_DIVES.find((dive) => dive.id === "bursar") ?? LANDING_DEEP_DIVES[2]

  return (
    <div className="squl-marketing font-sans">
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#f7f4ec]">
        <div className="mk-container pb-16 pt-10 sm:pt-14 lg:pb-20 lg:pt-16">
          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6 lg:pt-8">
              <p className="flex items-center gap-4 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-[#7c857d]">
                <span className="h-px w-7 bg-[#14201b]/25" aria-hidden />
                For Kenyan schools
              </p>

              <h1 className="mt-8 font-display text-[clamp(3rem,5.2vw,4.9rem)] leading-[0.93] tracking-[-0.035em] text-[#14201b]">
                School management,
                <span className="mt-1 block italic text-[#1c3d32]">without the paperwork.</span>
              </h1>

              <p className="mt-8 max-w-[33rem] text-[1.0625rem] leading-[1.62] text-[#3f4a43]">
                Admissions, M-Pesa fees, CBC marks and parent SMS in one quiet
                system — so your office runs the way it should.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                <Link href="/register" className="mk-btn mk-btn--ink h-14 px-8 text-[0.9375rem]">
                  Start your free term
                  <ArrowRight className="mk-arrow h-4 w-4" aria-hidden />
                </Link>
                <button
                  type="button"
                  onClick={() => setDemoOpen(true)}
                  className="mk-link text-[0.875rem]"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#14201b]/20">
                    <Play className="ml-0.5 h-2.5 w-2.5 fill-current" aria-hidden />
                  </span>
                  See SQUL in motion
                </button>
              </div>

              <p className="mt-6 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-[#7c857d]">
                90 days free · No card · Full access
              </p>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <figure className="relative">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#e8e2d4]">
                  <Image
                    src="/schooll.png"
                    alt="Students studying together in a light-filled school building"
                    fill
                    priority
                    sizes="(min-width: 1024px) 46vw, 100vw"
                    className="mk-photo object-cover object-[62%_55%]"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d201a]/35 via-transparent to-transparent"
                    aria-hidden
                  />
                </div>

                <div className="relative mt-4 border border-[#14201b]/10 bg-[#fcfaf4] p-4 sm:absolute sm:bottom-5 sm:left-5 sm:mt-0 sm:w-[18rem]">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-[#1c3d32]">
                      Fees · live
                    </p>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#a98a55]" aria-hidden />
                  </div>
                  <p className="mt-3 font-display text-[1.7rem] leading-none tracking-[-0.02em] text-[#14201b]">
                    KES 12,400
                  </p>
                  <p className="mt-2 text-[0.6875rem] text-[#4d574f]">
                    Amina Karanja · Form 2 East
                  </p>
                  <p className="mt-3 border-t border-[#14201b]/10 pt-2.5 text-[0.625rem] leading-relaxed text-[#7c857d]">
                    Receipt sent to parent via SMS
                  </p>
                </div>

                <figcaption className="mt-3 flex items-center justify-between font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-[#7c857d]">
                  <span>A school morning</span>
                  <span>08:45</span>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>

        {/* Trust figures */}
        <div className="border-y border-[#14201b]/10 bg-[#f2ede0]/60">
          <div className="mk-container grid grid-cols-2 gap-y-8 py-9 sm:grid-cols-4 sm:divide-x sm:divide-[#14201b]/10">
            {[
              { value: "340+", label: "Schools across Kenya" },
              { value: "50,000+", label: "Learners managed" },
              { value: "3,500+", label: "Parents updated daily" },
              { value: "99.9%", label: "Uptime" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={index === 0 ? "sm:pr-8" : "sm:px-8"}
              >
                <p className="font-display text-[2.4rem] leading-none tracking-[-0.03em] text-[#14201b]">
                  {stat.value}
                </p>
                <p className="mt-2.5 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-[#7c857d]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main>
        {/* ── Statement ─────────────────────────────────────────────────── */}
        <section className="mk-section">
          <div className="mk-container">
            <Reveal>
              <div className="mx-auto max-w-4xl text-center">
                <span className="mx-auto block h-px w-10 bg-[#a98a55]/70" aria-hidden />
                <p className="mk-statement mt-10 text-[#14201b]">
                  A school runs on trust.
                  <span className="block italic text-[#1c3d32]">
                    The administration should feel the same.
                  </span>
                </p>
                <p className="mx-auto mt-7 max-w-lg text-[0.875rem] leading-[1.7] text-[#4d574f]">
                  SQUL is the school management system for Kenyan schools that
                  would rather do less, better.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Product ───────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#0d201a] py-20 lg:py-24">
          <div className="mk-grain mk-grain--light" aria-hidden />
          <div className="relative mk-container">
            <div className="flex flex-wrap items-end justify-between gap-8">
              <div>
                <p className="flex items-center gap-4 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-white/35">
                  <span className="text-[#d8c9ab]">01</span>
                  <span className="h-px w-7 bg-[#fcfaf4]/15" aria-hidden />
                  The product
                </p>
                <h2 className="mt-7 max-w-2xl font-display text-[clamp(2.5rem,4.6vw,4rem)] leading-[0.98] tracking-[-0.03em] text-[#f7f4ec]">
                  The whole term,
                  <span className="block italic text-[#d8c9ab]">on one screen.</span>
                </h2>
              </div>
              <p className="max-w-sm text-[0.875rem] leading-[1.65] text-white/45">
                Match a payment, enter a mark, send a receipt — every number
                updates where the next person will look.
              </p>
            </div>

            <div className="mt-12">
              <div className="mb-4 flex justify-end">
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
                  previewMode === "phone" ? "flex justify-center" : "overflow-visible"
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

            <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-white/30">
              <span>Fees · M-Pesa</span>
              <span>Academics · CBC</span>
              <span>Families · SMS</span>
              <span>One record</span>
            </div>
          </div>
        </section>

        {/* ── Modules ───────────────────────────────────────────────────── */}
        <section id="platform" className="mk-section scroll-mt-24">
          <div className="mk-container">
            <SectionHead
              index="02"
              kicker="The platform"
              title={
                <>
                  The whole office,
                  <span className="block italic text-[#1c3d32]">quietly joined up.</span>
                </>
              }
              lede="Six modules, one record. Enter a detail once and it stays true in the bursar's office, the staff room and the parent's phone."
            />

            <Reveal className="mt-14">
              <ModulesIndex />
            </Reveal>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#14201b]/10 pt-5">
              <p className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-[#7c857d]">
                All six included in every term
              </p>
              <Link href="/register" className="mk-link text-[0.8125rem]">
                Begin with your learner list
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Day to day ────────────────────────────────────────────────── */}
        <section className="mk-section border-t border-[#14201b]/10 bg-[#f2ede0]/60">
          <div className="mk-container">
            <Reveal>
              <DayToDay />
            </Reveal>
          </div>
        </section>

        {/* ── Quote ─────────────────────────────────────────────────────── */}
        <section className="mk-section">
          <div className="mk-container">
            <Reveal>
              <figure className="mx-auto max-w-3xl text-center">
                <p className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-[#7c857d]">
                  A bursar, Nakuru
                </p>
                <blockquote className="mt-8 text-balance font-display text-[clamp(1.8rem,3.4vw,3rem)] leading-[1.16] tracking-[-0.025em] text-[#14201b]">
                  “We stopped chasing parents for fees in the office. SQUL matches
                  the M-Pesa payments and the SMS reminders do the chasing for us.”
                </blockquote>
                <figcaption className="mt-8 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-[#7c857d]">
                  Jane Njeri · Unity Secondary School
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </section>

        {/* ── Two moments ───────────────────────────────────────────────── */}
        <section className="mk-section border-t border-[#14201b]/10">
          <div className="mk-container">
            <SectionHead
              index="04"
              kicker="In the work"
              title={
                <>
                  Two moments that decide
                  <span className="block italic text-[#1c3d32]">the term.</span>
                </>
              }
              lede="Not features — the two jobs your office is judged on every week: marks that are right, and fees that are reconciled."
            />

            <div className="mt-16 space-y-24 lg:space-y-28">
              <Reveal>
                <DeepDive
                  index={0}
                  title="Marks entered once."
                  intro="Teachers record CBC strands and exam marks in one place. Term reports print themselves."
                  items={cbcDive.items.slice(0, 2)}
                  imageRight
                >
                  <ReportCardVisual />
                </DeepDive>
              </Reveal>

              <Reveal>
                <DeepDive
                  index={1}
                  title="Fees matched before the parent leaves."
                  intro="Paybill and till payments match to the right learner, and the receipt reaches the parent before they leave the gate."
                  items={bursarDive.items.slice(0, 2)}
                  imageRight={false}
                >
                  <FeeLedgerVisual />
                </DeepDive>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Domains ───────────────────────────────────────────────────── */}
        <section
          id="custom-domains"
          className="mk-section scroll-mt-24 border-t border-[#14201b]/10 bg-[#f2ede0]/60"
        >
          <div className="mk-container">
            <SectionHead
              index="05"
              kicker="Your own address"
              title={
                <>
                  A domain parents
                  <span className="block italic text-[#1c3d32]">already trust.</span>
                </>
              }
              lede="Run your school site on myschool.ac.ke with free HTTPS — connect a domain you own, or buy one and pay with M-Pesa."
            />

            <div className="mt-14 grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
              <Reveal className="lg:col-span-7">
                <div className="grid gap-5 sm:grid-cols-2">
                  <ConnectDomainPreview image={DOMAIN_HOME_SHOTS.connect} />
                  <LiveDomainPreview image={DOMAIN_HOME_SHOTS.live} />
                </div>
              </Reveal>

              <div className="lg:col-span-4 lg:col-start-9">
                <ul>
                  {DOMAIN_HOME_HIGHLIGHTS.map((item) => (
                    <li key={item.title} className="border-t border-[#14201b]/12 py-4 last:border-b">
                      <p className="text-[0.8125rem] font-medium text-[#14201b]">{item.title}</p>
                      <p className="mt-1.5 text-[0.75rem] leading-[1.6] text-[#4d574f]">
                        {item.body}
                      </p>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex flex-wrap items-center gap-5">
                  <Link href="/custom-domains" className="mk-btn mk-btn--ink h-11 px-5 text-[0.75rem]">
                    How domains work
                    <ArrowRight className="mk-arrow h-3.5 w-3.5" aria-hidden />
                  </Link>
                  <Link href="/register" className="mk-link text-[0.75rem]">
                    Start free term
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <section id="faq" className="mk-section">
          <div className="mk-container">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-4">
                <p className="flex items-center gap-4 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-[#7c857d]">
                  <span className="text-[#1c3d32]">06</span>
                  <span className="h-px w-7 bg-[#14201b]/20" aria-hidden />
                  Questions
                </p>
                <h2 className="mt-7 font-display text-[clamp(2.3rem,3.6vw,3.4rem)] leading-[0.99] tracking-[-0.03em] text-[#14201b]">
                  Before you
                  <span className="block italic text-[#1c3d32]">sign up.</span>
                </h2>
                <p className="mt-6 max-w-xs text-[0.875rem] leading-[1.65] text-[#4d574f]">
                  Data, timelines, parents and phones — answered plainly.
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
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(247,244,236,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(247,244,236,0.04) 1px, transparent 1px)",
              backgroundSize: "96px 48px",
            }}
            aria-hidden
          />
          <div className="mk-grain mk-grain--light" aria-hidden />
          <div className="relative mk-container py-24 text-center sm:py-28">
            <Reveal>
              <p className="mx-auto flex w-fit items-center gap-4 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-white/35">
                <span className="h-px w-7 bg-[#fcfaf4]/20" aria-hidden />
                Next term
                <span className="h-px w-7 bg-[#fcfaf4]/20" aria-hidden />
              </p>
              <h2 className="mx-auto mt-8 max-w-3xl font-display text-[clamp(2.8rem,5.6vw,5rem)] leading-[0.96] tracking-[-0.035em] text-[#f7f4ec]">
                Begin the term
                <span className="block italic text-[#d8c9ab]">with a calmer office.</span>
              </h2>
              <p className="mx-auto mt-7 max-w-lg text-[0.9375rem] leading-[1.65] text-white/45">
                Import your learner list, match your fee structure, and go live
                before parents&apos; reporting day.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/register" className="mk-btn mk-btn--paper h-14 px-8 text-[0.9375rem]">
                  Start your free term
                  <ArrowRight className="mk-arrow h-4 w-4" aria-hidden />
                </Link>
                <button
                  type="button"
                  onClick={() => setDemoOpen(true)}
                  className="mk-btn mk-btn--ghost-light h-14 px-7 text-[0.875rem]"
                >
                  See SQUL in motion
                </button>
              </div>
              <p className="mt-7 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-white/35">
                90 days free · No card · Cancel anytime
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <footer className="relative overflow-hidden bg-[#0d201a] text-[#f7f4ec]">
          <div className="mk-grain mk-grain--light" aria-hidden />
          <div className="relative mk-container border-t border-white/10 py-14">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-5">
                <Link href="/" aria-label="SQUL home" className="inline-flex">
                  <SqulWordmark tone="light" />
                </Link>
                <p className="mt-6 max-w-[18rem] text-[0.8125rem] leading-[1.7] text-white/35">
                  School operations, connected. Built in Nairobi for Kenyan
                  classrooms.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
                <div>
                  <p className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-[#d8c9ab]/60">
                    Platform
                  </p>
                  <ul className="mt-4 space-y-2.5 text-[0.75rem] text-white/45">
                    <li><Link href="/#platform" className="hover:text-[#d8c9ab]">Overview</Link></li>
                    <li><Link href="/schools" className="hover:text-[#d8c9ab]">Schools</Link></li>
                    <li><Link href="/custom-domains" className="hover:text-[#d8c9ab]">Domains</Link></li>
                  </ul>
                </div>
                <div>
                  <p className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-[#d8c9ab]/60">
                    Resources
                  </p>
                  <ul className="mt-4 space-y-2.5 text-[0.75rem] text-white/45">
                    <li><Link href="/blog" className="hover:text-[#d8c9ab]">Guides</Link></li>
                    <li><Link href="/#faq" className="hover:text-[#d8c9ab]">FAQ</Link></li>
                    <li><Link href="/register" className="hover:text-[#d8c9ab]">Start free</Link></li>
                    <li>
                      <a href={LANDING_APP_DOWNLOAD_URL} target="_blank" rel="noreferrer" className="hover:text-[#d8c9ab]">
                        Download app
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-[#d8c9ab]/60">
                    Contact
                  </p>
                  <ul className="mt-4 space-y-2.5 text-[0.75rem] text-white/45">
                    <li>
                      <a href={`mailto:${LEGAL_META.contactEmail}`} className="hover:text-[#d8c9ab]">
                        {LEGAL_META.contactEmail}
                      </a>
                    </li>
                    <li>
                      <a href={`tel:${LEGAL_META.contactPhoneHref}`} className="hover:text-[#d8c9ab]">
                        {LEGAL_META.contactPhone}
                      </a>
                    </li>
                    <li className="leading-relaxed">{LEGAL_META.postalAddress}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
              <p className="font-mono text-[0.5rem] uppercase tracking-[0.14em] text-white/25">
                © {new Date().getFullYear()} SQUL · All rights reserved
              </p>
              <div className="flex gap-6 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-white/30">
                <Link href="/privacy" className="hover:text-[#d8c9ab]">Privacy</Link>
                <Link href="/terms" className="hover:text-[#d8c9ab]">Terms</Link>
                <Link href="/login" className="hover:text-[#d8c9ab]">Sign in</Link>
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
