import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle2, Lightbulb, TriangleAlert } from 'lucide-react'
import { RichText } from '@/lib/content/rich-text'
import type { ArticleWithMeta, Block, Section } from '@/lib/content/types'
import { ProductFigure } from './cbc-figures'

const CALLOUT_STYLES: Record<
  NonNullable<Extract<Block, { type: 'callout' }>['variant']>,
  { box: string; icon: typeof Lightbulb; iconClass: string }
> = {
  note: { box: 'border-[#a98a55]/60 bg-[#efeadd]/60', icon: CheckCircle2, iconClass: 'text-[#1c3d32]' },
  tip: { box: 'border-[#a98a55]/60 bg-[#efeadd]/60', icon: Lightbulb, iconClass: 'text-[#a98a55]' },
  warning: { box: 'border-[#a98a55] bg-[#efeadd]/80', icon: TriangleAlert, iconClass: 'text-[#8a6a3a]' },
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="mt-5 text-[1.0625rem] leading-[1.75] text-[#3f4a43] first:mt-0">
          <RichText text={block.text} />
        </p>
      )

    case 'list':
      return block.ordered ? (
        <ol className="mt-4 space-y-3" role="list">
          {block.items.map((item, index) => (
            <li key={index} className="flex gap-3 text-[1.0625rem] leading-[1.75] text-[#3f4a43]">
              <span className="mt-1.5 w-5 shrink-0 font-mono text-[0.625rem] tabular-nums text-[#a98a55]">
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
            <li key={index} className="flex gap-3 text-[1.0625rem] leading-[1.75] text-[#3f4a43]">
              <span className="mt-[0.7rem] h-[3px] w-[3px] shrink-0 rounded-full bg-[#a98a55]" />
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
          <div className="overflow-x-auto border-y border-[#14201b]/15 bg-[#fcfaf4]">
            <table className="w-full border-collapse text-left text-[0.8125rem]">
              <thead>
                <tr className="bg-[#efeadd] text-[#14201b]">
                  {block.headers.map((header, index) => (
                    <th key={index} className="px-4 py-3.5 text-[0.5625rem] font-medium uppercase tracking-[0.14em]">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={rowIndex % 2 === 1 ? 'bg-[#f7f4ec]' : 'bg-[#fcfaf4]'}
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border-t border-[#14201b]/8 px-4 py-3.5 align-top leading-relaxed text-[#3f4a43]"
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
            <p className="mt-2.5 text-[0.6875rem] leading-relaxed text-[#7c857d]">
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
        <div className={`mt-7 border-l-2 ${style.box} px-5 py-4`}>
          <div className="flex gap-3">
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.iconClass}`} strokeWidth={1.5} aria-hidden />
            <div>
              {block.title ? (
                <p className="text-[0.75rem] font-medium uppercase tracking-[0.1em] text-[#14201b]">{block.title}</p>
              ) : null}
              <p className="mt-2 text-[0.875rem] leading-[1.7] text-[#3f4a43]">
                <RichText text={block.text} />
              </p>
            </div>
          </div>
        </div>
      )
    }

    case 'quote':
      return (
        <blockquote className="mt-9 border-l-2 border-[#a98a55]/60 pl-6">
          <p className="font-display text-[1.35rem] italic leading-[1.4] tracking-[-0.01em] text-[#14201b]">
            <RichText text={block.text} />
          </p>
          {block.cite ? (
            <cite className="mt-3 block text-[0.625rem] not-italic uppercase tracking-[0.14em] text-[#7c857d]">
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
              <span className="w-7 shrink-0 pt-0.5 font-display text-[1.4rem] leading-none tabular-nums text-[#a98a55]">
                {index + 1}
              </span>
              <div>
                <p className="text-[0.8125rem] font-medium text-[#14201b]">{item.title}</p>
                <p className="mt-1.5 text-[1rem] leading-[1.7] text-[#3f4a43]">
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

    case 'figure':
      return <ProductFigure scene={block.scene} caption={block.caption} />

    case 'guides':
      return <GuideLinks block={block} />

    default:
      return null
  }
}

function GuideLinks({ block }: { block: Extract<Block, { type: 'guides' }> }) {
  return (
    <div className="mt-8">
      {block.title ? (
        <p className="text-[0.5625rem] font-medium uppercase tracking-[0.18em] text-[#7c857d]">
          {block.title}
        </p>
      ) : null}
      {block.intro ? (
        <p className="mt-2 max-w-2xl text-[0.9375rem] leading-[1.7] text-[#3f4a43]">
          <RichText text={block.intro} />
        </p>
      ) : null}
      <div className="mt-4 grid gap-px border border-[#14201b]/10 bg-[#14201b]/10 sm:grid-cols-2">
        {block.items.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex flex-col bg-[#f7f4ec] p-4 transition-colors duration-200 hover:bg-[#efeadd]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[9px] tabular-nums text-[#a98a55]">
                {String(index + 1).padStart(2, '0')}
              </span>
              {item.kicker ? (
                <span className="text-[0.5rem] uppercase tracking-[0.14em] text-[#7c857d]">
                  {item.kicker}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-[0.8125rem] font-medium leading-snug text-[#14201b] transition-colors duration-200 group-hover:text-[#1c3d32]">
              {item.title}
            </p>
            {item.text ? (
              <p className="mt-1.5 flex-1 text-[0.6875rem] leading-relaxed text-[#4d574f]">
                {item.text}
              </p>
            ) : null}
            <span className="mt-3 inline-flex items-center gap-1.5 text-[0.5rem] uppercase tracking-[0.16em] text-[#1c3d32]">
              Read guide
              <ArrowRight
                className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden
              />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function SectionView({ section }: { section: Section }) {
  if (section.level === 3) {
    return (
      <div className="mt-10">
        <h3 id={section.id} className="scroll-mt-24 font-display text-[1.45rem] leading-tight tracking-[-0.015em] text-[#14201b] sm:text-[1.6rem]">
          {section.heading}
        </h3>
        {section.blocks.map((block, index) => (
          <BlockView key={index} block={block} />
        ))}
      </div>
    )
  }

  return (
    <section className="mt-14">
      <h2
        id={section.id}
        className="scroll-mt-24 border-b border-[#14201b]/10 pb-3 font-display text-[1.8rem] leading-tight tracking-[-0.02em] text-[#14201b] sm:text-[2rem]"
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
      className="mt-9 border-y border-[#14201b]/10 py-5"
    >
      <p className="text-[0.5625rem] font-medium uppercase tracking-[0.18em] text-[#7c857d]">
        In this guide
      </p>
      <ol className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
        {topLevel.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="text-[0.8125rem] leading-snug text-[#3f4a43] underline decoration-[#14201b]/20 underline-offset-4 transition-colors duration-200 hover:text-[#14201b] hover:decoration-[#14201b]/60"
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
        <div className="mt-8 border-l-2 border-[#a98a55] pl-5">
          <p className="text-[0.9375rem] leading-[1.75] text-[#3f4a43]">
            <RichText text={article.quickAnswer} />
          </p>
        </div>
      ) : null}

      <div className="mt-8 space-y-4">
        {article.intro.map((paragraph, index) => (
          <p
            key={index}
            className="text-[1.0925rem] leading-[1.75] text-[#2f3a34] sm:text-[1.125rem]"
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
          <div className="mt-6">
            {article.faqs.map((faq, index) => (
              <div key={index} className="border-t border-[#14201b]/10 py-5 last:border-b">
                <h3 className="font-display text-[1.2rem] leading-snug text-[#14201b]">{faq.question}</h3>
                <p className="mt-2 text-[0.875rem] leading-[1.75] text-[#3f4a43]">{faq.answer}</p>
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
    <section className="relative mt-16 overflow-hidden bg-[#0d201a] px-7 py-10 text-white sm:px-10">
      <div className="mk-grain mk-grain--light" aria-hidden />
      <div className="relative">
        <h2 className="font-display text-[1.9rem] leading-[1.08] tracking-[-0.02em] text-[#f7f4ec]">
          {cta.heading}
        </h2>
        <p className="mt-3 max-w-2xl text-[0.9375rem] leading-[1.7] text-white/55">{cta.body}</p>
        <div className="mt-7">
          <Link href={cta.href ?? '/register'} className="mk-btn mk-btn--paper h-11 px-5 text-[0.8125rem]">
            {cta.label}
            <ArrowRight className="mk-arrow h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export function ArticleRelated({ article }: { article: ArticleWithMeta }) {
  if (article.relatedArticles.length === 0) return null

  return (
    <section className="mt-14">
      <h2 className="font-display text-[1.9rem] leading-tight tracking-[-0.02em] text-[#14201b]">Keep reading</h2>
      <div className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {article.relatedArticles.map((related) => (
          <Link
            key={related.path}
            href={related.path}
            className="group border-t border-[#14201b]/12 pt-4"
          >
            <span className="text-[0.5625rem] uppercase tracking-[0.16em] text-[#7c857d]">
              {related.kicker}
            </span>
            <p className="mt-2 text-[0.875rem] font-medium leading-snug text-[#14201b] transition-colors duration-200 group-hover:text-[#1c3d32]">
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
      <div className="overflow-hidden border border-[#1a4d42]/15 bg-white shadow-sm">
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
