import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle2, Lightbulb, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RichText } from '@/lib/content/rich-text'
import type { ArticleWithMeta, Block, Section } from '@/lib/content/types'

const CALLOUT_STYLES: Record<
  NonNullable<Extract<Block, { type: 'callout' }>['variant']>,
  { box: string; icon: typeof Lightbulb; iconClass: string }
> = {
  note: { box: 'border-[#1a4d42]/20 bg-[#f2f6f4]', icon: CheckCircle2, iconClass: 'text-[#246a59]' },
  tip: { box: 'border-emerald-200 bg-emerald-50', icon: Lightbulb, iconClass: 'text-emerald-700' },
  warning: { box: 'border-amber-300 bg-amber-50', icon: TriangleAlert, iconClass: 'text-amber-700' },
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="mt-4 text-[1.02rem] leading-8 text-[#25443d] first:mt-0">
          <RichText text={block.text} />
        </p>
      )

    case 'list':
      return block.ordered ? (
        <ol className="mt-4 space-y-3" role="list">
          {block.items.map((item, index) => (
            <li key={index} className="flex gap-3 text-[1.02rem] leading-8 text-[#25443d]">
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center bg-[#1d5547] text-xs font-semibold text-white">
                {index + 1}
              </span>
              <span>
                <RichText text={item} />
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <ul className="mt-4 space-y-3" role="list">
          {block.items.map((item, index) => (
            <li key={index} className="flex gap-3 text-[1.02rem] leading-8 text-[#25443d]">
              <span className="mt-3.5 h-1.5 w-1.5 shrink-0 bg-emerald-600/70" />
              <span>
                <RichText text={item} />
              </span>
            </li>
          ))}
        </ul>
      )

    case 'table':
      return (
        <div className="mt-6">
          <div className="overflow-x-auto border border-[#1a4d42]/15 bg-white shadow-[4px_4px_0_0_rgba(10,31,26,0.04)]">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#0a1f1a] text-white">
                  {block.headers.map((header, index) => (
                    <th key={index} className="px-4 py-3 font-ui text-xs uppercase tracking-wide">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={rowIndex % 2 === 1 ? 'bg-[#f6faf8]' : 'bg-white'}
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border-t border-[#1a4d42]/10 px-4 py-3 align-top text-[#25443d]"
                      >
                        <RichText text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption ? (
            <p className="mt-2 text-sm text-[#1a4d42]/70">
              <RichText text={block.caption} />
            </p>
          ) : null}
        </div>
      )

    case 'callout': {
      const variant = block.variant ?? 'note'
      const style = CALLOUT_STYLES[variant]
      const Icon = style.icon
      return (
        <div className={`mt-6 border-l-4 ${style.box} px-5 py-4`}>
          <div className="flex gap-3">
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconClass}`} aria-hidden />
            <div>
              {block.title ? (
                <p className="font-ui text-sm font-semibold text-[#0a1f1a]">{block.title}</p>
              ) : null}
              <p className="mt-1 text-[0.97rem] leading-7 text-[#25443d]">
                <RichText text={block.text} />
              </p>
            </div>
          </div>
        </div>
      )
    }

    case 'quote':
      return (
        <blockquote className="mt-6 border-l-4 border-[#1d5547]/40 pl-5 italic text-[#25443d]">
          <p className="leading-8">
            <RichText text={block.text} />
          </p>
          {block.cite ? (
            <cite className="mt-2 block font-ui text-sm not-italic text-[#1a4d42]/70">
              {block.cite}
            </cite>
          ) : null}
        </blockquote>
      )

    case 'steps':
      return (
        <ol className="mt-6 space-y-5" role="list">
          {block.items.map((item, index) => (
            <li key={index} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#1d5547] font-ui text-sm font-semibold text-white">
                {index + 1}
              </span>
              <div>
                <p className="font-ui text-sm font-semibold text-[#0a1f1a]">{item.title}</p>
                <p className="mt-1 text-[1.02rem] leading-8 text-[#25443d]">
                  <RichText text={item.text} />
                </p>
              </div>
            </li>
          ))}
        </ol>
      )

    case 'image':
      return <ArticleImage src={block.src} alt={block.alt} caption={block.caption} />

    case 'mock':
      return <MockFigure variant={block.variant} caption={block.caption} />

    default:
      return null
  }
}

function SectionView({ section }: { section: Section }) {
  if (section.level === 3) {
    return (
      <div className="mt-10">
        <h3 id={section.id} className="scroll-mt-24 text-xl text-[#0a1f1a] sm:text-2xl">
          {section.heading}
        </h3>
        {section.blocks.map((block, index) => (
          <BlockView key={index} block={block} />
        ))}
      </div>
    )
  }

  return (
    <section className="mt-12">
      <h2
        id={section.id}
        className="scroll-mt-24 border-b border-[#1a4d42]/12 pb-3 text-2xl text-[#0a1f1a] sm:text-3xl"
      >
        {section.heading}
      </h2>
      {section.blocks.map((block, index) => (
        <BlockView key={index} block={block} />
      ))}
    </section>
  )
}

function TableOfContents({ sections }: { sections: Section[] }) {
  const topLevel = sections.filter((section) => section.level === 2)
  if (topLevel.length < 3) return null

  return (
    <nav
      aria-label="In this guide"
      className="mt-8 border border-[#1a4d42]/15 bg-[#f6faf8] p-5 sm:p-6"
    >
      <p className="font-ui text-xs font-semibold uppercase tracking-[0.18em] text-[#1d5547]">
        In this guide
      </p>
      <ol className="mt-3 grid gap-2 sm:grid-cols-2">
        {topLevel.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="text-sm text-[#25443d] underline decoration-[#1d5547]/25 underline-offset-2 transition-colors hover:text-[#1d5547] hover:decoration-[#1d5547]"
            >
              {index + 1}. {section.heading}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function ArticleBody({ article }: { article: ArticleWithMeta }) {
  return (
    <>
      {article.quickAnswer ? (
        <div className="mt-8 border-l-4 border-[#246a59] bg-[#f2f6f4] px-5 py-4">
          <p className="text-sm leading-7 text-[#25443d]">
            <RichText text={article.quickAnswer} />
          </p>
        </div>
      ) : null}

      <div className="mt-8 space-y-4">
        {article.intro.map((paragraph, index) => (
          <p
            key={index}
            className="text-[1.08rem] leading-8 text-[#25443d] sm:text-[1.12rem]"
          >
            <RichText text={paragraph} />
          </p>
        ))}
      </div>

      <TableOfContents sections={article.sections} />

      {article.sections.map((section) => (
        <SectionView key={section.id} section={section} />
      ))}

      {article.faqs.length > 0 ? (
        <section className="mt-14">
          <h2
            id="faq"
            className="scroll-mt-24 border-b border-[#1a4d42]/12 pb-3 text-2xl text-[#0a1f1a] sm:text-3xl"
          >
            Frequently asked questions
          </h2>
          <div className="mt-6 divide-y divide-[#1a4d42]/10 border border-[#1a4d42]/15 bg-white">
            {article.faqs.map((faq, index) => (
              <div key={index} className="px-5 py-5 sm:px-6">
                <h3 className="text-lg text-[#0a1f1a]">{faq.question}</h3>
                <p className="mt-2 text-[0.98rem] leading-7 text-[#25443d]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  )
}

export function ArticleCta({ cta }: { cta: ArticleWithMeta['cta'] }) {
  return (
    <section className="mt-14 border border-[#1a4d42]/15 bg-[#0a1f1a] p-8 text-white sm:p-10">
      <h2 className="text-2xl text-white sm:text-3xl">{cta.heading}</h2>
      <p className="mt-3 max-w-2xl text-[1.02rem] leading-7 text-white/75">{cta.body}</p>
      <div className="mt-6">
        <Link href={cta.href ?? '/register'}>
          <Button className="h-11 rounded-lg border-0 bg-emerald-500 px-6 font-semibold text-[#0a1f1a] hover:bg-emerald-400">
            {cta.label}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  )
}

export function ArticleRelated({ article }: { article: ArticleWithMeta }) {
  if (article.relatedArticles.length === 0) return null

  return (
    <section className="mt-14">
      <h2 className="text-2xl text-[#0a1f1a] sm:text-3xl">Keep reading</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {article.relatedArticles.map((related) => (
          <Link
            key={related.path}
            href={related.path}
            className="group border border-[#1a4d42]/15 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#1d5547]/25 hover:shadow-md"
          >
            <span className="font-ui text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1d5547]/80">
              {related.kicker}
            </span>
            <p className="mt-2 text-[0.98rem] font-medium leading-6 text-[#0a1f1a] group-hover:text-[#1d5547]">
              <RichText text={related.title} />
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}

function ArticleImage({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="mt-6">
      <div className="relative aspect-[16/9] w-full overflow-hidden border border-[#1a4d42]/15 bg-[#eef4f1]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </div>
      {caption ? (
        <figcaption className="mt-2 text-sm text-[#1a4d42]/70">
          <RichText text={caption} />
        </figcaption>
      ) : null}
    </figure>
  )
}

type MockVariant = 'fees' | 'whatsapp' | 'reports' | 'timetable' | 'attendance'

const MOCK_TITLES: Record<MockVariant, string> = {
  fees: 'Fees · M-Pesa reconciliation',
  whatsapp: 'Parent messaging · WhatsApp & SMS',
  reports: 'Academics · Term report card',
  timetable: 'Operations · Timetable & duty roster',
  attendance: 'Attendance · Class & dorm roll',
}

function MockBody({ variant }: { variant: MockVariant }) {
  switch (variant) {
    case 'fees':
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 border border-emerald-200 bg-emerald-50 px-3 py-2.5">
            <div className="min-w-0">
              <p className="font-ui text-xs font-semibold text-[#0a1f1a]">Paybill payment received</p>
              <p className="text-xs text-[#1a4d42]/70">KES 15,000 · Ref 2043 · 07:42</p>
            </div>
            <span className="shrink-0 bg-[#1d5547] px-2 py-1 font-ui text-[10px] font-semibold uppercase tracking-wide text-white">
              Matched
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="border border-[#1a4d42]/12 bg-[#f6faf8] p-3">
              <p className="font-ui text-[10px] uppercase tracking-wide text-[#1a4d42]/60">Admission #2043</p>
              <p className="mt-1 text-sm font-semibold text-[#0a1f1a]">Brian Otieno · Form 2 East</p>
            </div>
            <div className="border border-[#1a4d42]/12 bg-[#f6faf8] p-3">
              <p className="font-ui text-[10px] uppercase tracking-wide text-[#1a4d42]/60">Balance</p>
              <p className="mt-1 text-sm font-semibold text-[#0a1f1a]">
                <span className="text-[#1a4d42]/45 line-through">45,000</span> → 30,000
              </p>
            </div>
          </div>
          <p className="text-xs text-[#1a4d42]/70">
            Receipt sent to the guardian on WhatsApp — before they left the gate.
          </p>
        </div>
      )

    case 'whatsapp':
      return (
        <div className="space-y-3">
          {[
            { side: 'in', text: 'Fee reminder: KES 12,000 outstanding for Term 3. Pay via Paybill 522522, Acc 2043.', meta: '07:45' },
            { side: 'out', text: 'Received, thank you. Paying now.', meta: '07:46 · delivered' },
            { side: 'in', text: 'Payment received. Receipt attached. New balance: KES 0.', meta: '07:52 · read' },
          ].map((message, index) => (
            <div
              key={index}
              className={
                message.side === 'out'
                  ? 'ml-auto max-w-[85%] bg-[#1d5547] p-3 text-sm text-white'
                  : 'max-w-[85%] border border-[#1a4d42]/12 bg-[#f6faf8] p-3 text-sm text-[#25443d]'
              }
            >
              {message.text}
              <p
                className={
                  message.side === 'out'
                    ? 'mt-1 text-[10px] text-white/60'
                    : 'mt-1 text-[10px] text-[#1a4d42]/50'
                }
              >
                {message.meta}
              </p>
            </div>
          ))}
        </div>
      )

    case 'reports':
      return (
        <div className="overflow-hidden border border-[#1a4d42]/12">
          <div className="grid grid-cols-3 bg-[#0a1f1a] px-3 py-2 font-ui text-[10px] uppercase tracking-wide text-white/80">
            <span>Strand</span>
            <span>Rubric</span>
            <span>Teacher</span>
          </div>
          {[
            ['Numbers', 'Exceeding', 'Mrs. Wanjiru'],
            ['Reading', 'Meeting', 'Mr. Kiptoo'],
            ['Environment', 'Approaching', 'Ms. Achieng'],
          ].map((row, index) => (
            <div
              key={index}
              className={`grid grid-cols-3 px-3 py-2 text-xs text-[#25443d] ${index % 2 ? 'bg-[#f6faf8]' : 'bg-white'}`}
            >
              {row.map((cell, cellIndex) => (
                <span key={cellIndex}>{cell}</span>
              ))}
            </div>
          ))}
          <p className="border-t border-[#1a4d42]/10 bg-white px-3 py-2 text-xs text-[#1a4d42]/70">
            Term report ready to print — parents and auditors see the same numbers.
          </p>
        </div>
      )

    case 'timetable':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
              <div key={day} className="space-y-2">
                <p className="font-ui text-[10px] uppercase tracking-wide text-[#1a4d42]/60">{day}</p>
                <div className="bg-[#e8f5f0] px-1 py-1 text-center text-[10px] font-medium text-[#1d5547]">
                  Maths
                </div>
                <div className="bg-[#f6faf8] px-1 py-1 text-center text-[10px] text-[#25443d]">Eng</div>
                <div className="bg-[#f6faf8] px-1 py-1 text-center text-[10px] text-[#25443d]">
                  {index % 2 ? 'Bio' : 'Chem'}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#1a4d42]/70">
            Duty roster · Mon–Fri: matron (A. Njeri), kitchen (P. Otieno), security (J. Mwangi).
          </p>
        </div>
      )

    case 'attendance':
      return (
        <div className="space-y-2">
          {[
            ['Grace Wambui', 'Present', true],
            ['Kevin Mwenda', 'Absent', false],
            ['Faith Njeri', 'Present', true],
          ].map(([name, status, present], index) => (
            <div
              key={index}
              className="flex items-center justify-between border border-[#1a4d42]/12 px-3 py-2"
            >
              <span className="text-sm text-[#25443d]">{name as string}</span>
              <span
                className={`px-2 py-0.5 font-ui text-[10px] font-semibold uppercase tracking-wide ${
                  present ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {status as string}
              </span>
            </div>
          ))}
          <p className="text-xs text-[#1a4d42]/70">
            Absence alert sent to Kevin&apos;s guardian by SMS at 08:05 — the same morning.
          </p>
        </div>
      )

    default:
      return null
  }
}

function MockFigure({ variant, caption }: { variant: MockVariant; caption?: string }) {
  return (
    <figure className="mt-6">
      <div className="overflow-hidden border border-[#1a4d42]/15 bg-white shadow-[4px_4px_0_0_rgba(10,31,26,0.04)]">
        <div className="flex items-center gap-1.5 border-b border-[#1a4d42]/10 bg-[#0a1f1a] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="ml-2 font-ui text-xs font-semibold tracking-wide text-emerald-300">
            {MOCK_TITLES[variant]}
          </span>
          <span className="ml-auto font-ui text-[10px] font-semibold uppercase tracking-widest text-white/35">
            Illustrative UI
          </span>
        </div>
        <div className="p-4 sm:p-5">
          <MockBody variant={variant} />
        </div>
      </div>
      {caption ? (
        <figcaption className="mt-2 text-sm text-[#1a4d42]/70">
          <RichText text={caption} />
        </figcaption>
      ) : null}
    </figure>
  )
}
