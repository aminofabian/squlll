'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useParams } from 'next/navigation'
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  Eye,
  Globe,
  Loader2,
  Monitor,
  Paintbrush,
  RotateCcw,
  Save,
  Smartphone,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  applyTemplateKeepContent,
  createDefaultHomepageConfig,
  HOMEPAGE_TEMPLATES,
  type HomepageConfig,
  type HomepageCta,
  type HomepageGalleryImage,
  type HomepageNavLink,
  type HomepageOfferingItem,
  type HomepageSection,
  type HomepageSectionType,
  type HomepageStatItem,
  type HomepageTemplateId,
  type HomepageTestimonial,
  type HomepageTheme,
} from '@/lib/types/homepage-config'
import { uploadFile } from '@/lib/services/upload'
import { getAccessTokenFromStorage } from '@/lib/realtime/getAccessToken'
import { useSchoolConfig } from '@/lib/hooks/useSchoolConfig'
import {
  fetchAdminHomepageConfig,
  fetchPublicHomepageConfig,
  publishHomepageConfig,
  saveHomepageDraft,
} from '../components/homepage/homepage-api'
import { SchoolHomepage } from '../components/SchoolHomepage'

const LOCKED: HomepageSectionType[] = ['nav', 'hero', 'footer']

const SECTION_LABELS: Record<HomepageSectionType, string> = {
  nav: 'Navigation',
  hero: 'Hero',
  stats: 'Stats',
  offerings: 'Offerings',
  programs: 'Programs',
  feeDownloads: 'Fee downloads',
  gallery: 'Gallery',
  testimonials: 'Testimonials',
  cta: 'Call to action',
  footer: 'Footer',
}

type StudioTab = 'look' | 'brand' | 'sections'

const STUDIO_STEPS: {
  id: StudioTab
  step: number
  label: string
  short: string
  hint: string
}[] = [
  {
    id: 'look',
    step: 1,
    label: 'Look',
    short: 'Look',
    hint: 'Pick a layout — your words stay.',
  },
  {
    id: 'brand',
    step: 2,
    label: 'Brand',
    short: 'Brand',
    hint: 'Colors, logo, and hero photo.',
  },
  {
    id: 'sections',
    step: 3,
    label: 'Content',
    short: 'Content',
    hint: 'Toggle sections and edit copy.',
  },
]

const TEMPLATE_PALETTES: Record<string, string> = {
  'campus-dawn': 'from-[#0a1f1a] via-[#246a59] to-[#a7f3d0]',
  'assembly-hall': 'from-[#1e293b] via-[#f7f4ee] to-[#c4a574]',
  playfield: 'from-[#166534] via-[#22c55e] to-[#fef08a]',
  'garden-court': 'from-[#365314] via-[#86efac] to-[#ecfccb]',
  'crest-motto': 'from-[#1c1917] via-[#854d0e] to-[#fde68a]',
  'skyline-cbc': 'from-[#0f172a] via-[#334155] to-[#38bdf8]',
  'story-scroll': 'from-[#292524] via-[#78716c] to-[#fafaf9]',
  'horizon-board': 'from-[#0c4a6e] via-[#38bdf8] to-[#e0f2fe]',
  'studio-day': 'from-[#7c2d12] via-[#ea580c] to-[#fed7aa]',
  'night-lights': 'from-black via-[#134e4a] to-[#5eead4]',
}

const TEMPLATE_ACCENT: Record<string, string> = {
  'campus-dawn': '#246a59',
  'assembly-hall': '#c4a574',
  playfield: '#22c55e',
  'garden-court': '#65a30d',
  'crest-motto': '#854d0e',
  'skyline-cbc': '#38bdf8',
  'story-scroll': '#78716c',
  'horizon-board': '#0ea5e9',
  'studio-day': '#ea580c',
  'night-lights': '#5eead4',
}

function updateSection(
  config: HomepageConfig,
  type: HomepageSectionType,
  updater: (section: HomepageSection) => HomepageSection,
): HomepageConfig {
  return {
    ...config,
    sections: config.sections.map((s) => (s.type === type ? updater(s) : s)),
  }
}

function patchSlots(
  config: HomepageConfig,
  type: HomepageSectionType,
  patch: Record<string, unknown>,
): HomepageConfig {
  return updateSection(config, type, (s) => ({
    ...s,
    slots: { ...s.slots, ...patch },
  }))
}

function getSlots<T extends Record<string, unknown>>(
  config: HomepageConfig,
  type: HomepageSectionType,
): T {
  return (config.sections.find((s) => s.type === type)?.slots || {}) as T
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] font-medium text-slate-500">{label}</Label>
      {children}
    </div>
  )
}

/** Compact selectable look row — color strip + name, one click to apply */
function TemplateThumb({
  id,
  active,
  onSelect,
}: {
  id: HomepageTemplateId
  active: boolean
  onSelect: () => void
}) {
  const meta = HOMEPAGE_TEMPLATES.find((t) => t.id === id)!
  const accent = TEMPLATE_ACCENT[id] || '#246a59'
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        'group flex w-full items-stretch overflow-hidden border text-left transition',
        active
          ? 'border-[#0a1f1a] bg-[#0a1f1a] text-white'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
      )}
    >
      <span
        className={cn(
          'w-1.5 shrink-0 bg-gradient-to-b',
          TEMPLATE_PALETTES[id] || 'from-slate-400 to-slate-200',
        )}
        aria-hidden
      />
      <span
        className={cn(
          'm-2 h-9 w-9 shrink-0 bg-gradient-to-br',
          TEMPLATE_PALETTES[id],
        )}
        aria-hidden
      />
      <span className="min-w-0 flex-1 py-1.5 pr-2">
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              'truncate text-[13px] font-semibold leading-tight',
              active ? 'text-white' : 'text-slate-900',
            )}
          >
            {meta.name}
          </span>
          {active && (
            <Check
              className="h-3.5 w-3.5 shrink-0 text-[#a7f3d0]"
              strokeWidth={2.5}
            />
          )}
        </span>
        <span
          className={cn(
            'mt-0.5 block truncate text-[10px] leading-snug',
            active ? 'text-white/65' : 'text-slate-500',
          )}
        >
          {meta.tagline}
        </span>
        <span
          className={cn(
            'mt-1 inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em]',
            active ? 'text-white/45' : 'text-slate-400',
          )}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: active ? '#a7f3d0' : accent }}
          />
          {meta.mood}
        </span>
      </span>
      {!active && (
        <span className="flex shrink-0 items-center pr-2.5 text-[10px] font-semibold uppercase tracking-wide text-[#246a59] opacity-0 transition group-hover:opacity-100">
          Use
        </span>
      )}
    </button>
  )
}

export function WebsiteStudio() {
  const params = useParams()
  const subdomain = (params.subdomain as string) || 'school'
  const [config, setConfig] = useState<HomepageConfig>(() =>
    createDefaultHomepageConfig(),
  )
  const [published, setPublished] = useState<HomepageConfig | null>(null)
  const [publishedAt, setPublishedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [tab, setTab] = useState<StudioTab>('look')
  const [activeSection, setActiveSection] =
    useState<HomepageSectionType>('hero')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>(
    'desktop',
  )
  const [uploading, setUploading] = useState(false)

  // Authenticated school config — used to preview the real Programs section.
  const { data: schoolConfig } = useSchoolConfig()

  const schoolName = useMemo(() => {
    const hero = getSlots<{ headline?: string }>(config, 'hero')
    return hero.headline || subdomain
  }, [config, subdomain])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const record = await fetchAdminHomepageConfig()
        if (cancelled) return
        setConfig(record.draft)
        setPublished(record.published)
        setPublishedAt(record.publishedAt || null)
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Could not load homepage config',
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const setDraft = useCallback((next: HomepageConfig) => {
    setConfig(next)
    setDirty(true)
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const record = await saveHomepageDraft(config)
      setConfig(record.draft)
      setPublished(record.published)
      setDirty(false)
      toast.success('Draft saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }, [config])

  const handlePublish = async () => {
    if (
      !window.confirm(
        'Publish this homepage? Visitors will see your draft immediately.',
      )
    ) {
      return
    }
    setPublishing(true)
    try {
      const record = await publishHomepageConfig(config)
      if (!record.published) {
        throw new Error('Publish succeeded but no live config was returned')
      }
      if (record.published.templateId !== config.templateId) {
        throw new Error(
          `Published look mismatch (wanted ${config.templateId}, got ${record.published.templateId})`,
        )
      }
      setConfig(record.draft)
      setPublished(record.published)
      setPublishedAt(record.publishedAt || new Date().toISOString())
      setDirty(false)

      // Confirm the public API serves the new look (same path visitors hit).
      const live = await fetchPublicHomepageConfig(subdomain, schoolName)
      if (live.templateId !== record.published.templateId) {
        toast.error('Published, but the live site is still showing an old look', {
          description:
            'Wait a few seconds and hard-refresh the public homepage. If it persists, contact support.',
        })
      } else {
        toast.success('Homepage published', {
          description: `Live look: ${record.published.templateId}. Open the live site to verify.`,
        })
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Publish failed')
    } finally {
      setPublishing(false)
    }
  }

  const handleRevert = () => {
    if (!published) return
    if (
      !window.confirm('Discard your unsaved draft and go back to the published homepage?')
    ) {
      return
    }
    setConfig(published)
    setDirty(false)
    toast.message('Draft discarded — back to published')
  }

  // Warn before navigating away with unsaved changes
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  // Cmd/Ctrl+S saves the draft
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        if (dirty && !saving) void handleSave()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dirty, saving, handleSave])

  const handleUpload = async (
    file: File,
    onUrl: (url: string) => void,
  ) => {
    setUploading(true)
    try {
      const token = getAccessTokenFromStorage() || undefined
      const uploaded = await uploadFile(
        file,
        'homepage',
        `hero-${Date.now()}`,
        'Website studio asset',
        token,
      )
      onUrl(uploaded.url)
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const moveSection = (type: HomepageSectionType, dir: -1 | 1) => {
    if (LOCKED.includes(type)) return
    const sections = [...config.sections]
    const idx = sections.findIndex((s) => s.type === type)
    if (idx < 0) return
    const target = idx + dir
    if (target < 0 || target >= sections.length) return
    if (LOCKED.includes(sections[target].type)) return
    ;[sections[idx], sections[target]] = [sections[target], sections[idx]]
    setDraft({ ...config, sections })
  }

  const toggleSection = (type: HomepageSectionType, enabled: boolean) => {
    if (LOCKED.includes(type) && !enabled) return
    setDraft(
      updateSection(config, type, (s) => {
        const next = { ...s, enabled }
        if (enabled && type === 'gallery') {
          const images = (s.slots.images as HomepageGalleryImage[] | undefined) || []
          if (images.length === 0) {
            next.slots = {
              ...s.slots,
              images: [
                { url: '/schooll.png', caption: 'Campus life' },
                { url: '/schooll.png', caption: 'Learning together' },
                { url: '/schooll.png', caption: 'Community' },
              ],
            }
          }
        }
        if (enabled && type === 'testimonials') {
          const items = (s.slots.items as HomepageTestimonial[] | undefined) || []
          if (items.length === 0) {
            next.slots = {
              ...s.slots,
              items: [
                {
                  quote:
                    'Our child has thrived here — the teachers truly know every learner.',
                  name: 'Parent',
                  role: 'Grade 4 family',
                },
                {
                  quote:
                    'A warm community with clear standards and real care.',
                  name: 'Guardian',
                  role: 'Junior school',
                },
              ],
            }
          }
        }
        return next
      }),
    )
  }

  const resetSection = (type: HomepageSectionType) => {
    const defaults = createDefaultHomepageConfig(schoolName)
    const def = defaults.sections.find((s) => s.type === type)
    if (!def) return
    setDraft(
      updateSection(config, type, () => ({
        ...def,
        enabled:
          config.sections.find((s) => s.type === type)?.enabled ?? def.enabled,
      })),
    )
    toast.message('Section reset to defaults')
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const hero = getSlots<{
    backgroundImage?: string
    overlayStrength?: number
    eyebrow?: string
    headline?: string
    subcopy?: string
    primaryCta?: HomepageCta
    secondaryCta?: HomepageCta
  }>(config, 'hero')
  const theme = config.theme
  const stats = getSlots<{ items?: HomepageStatItem[] }>(config, 'stats')
  const offerings = getSlots<{
    eyebrow?: string
    headline?: string
    subcopy?: string
    items?: HomepageOfferingItem[]
  }>(config, 'offerings')
  const programs = getSlots<{
    eyebrow?: string
    headline?: string
    subcopy?: string
    useSchoolConfig?: boolean
    ctaLabel?: string
    href?: string
  }>(config, 'programs')
  const fees = getSlots<{
    eyebrow?: string
    headline?: string
    subcopy?: string
  }>(config, 'feeDownloads')
  const gallery = getSlots<{
    eyebrow?: string
    headline?: string
    images?: HomepageGalleryImage[]
  }>(config, 'gallery')
  const testimonials = getSlots<{
    eyebrow?: string
    headline?: string
    items?: HomepageTestimonial[]
  }>(config, 'testimonials')
  const cta = getSlots<{
    headline?: string
    body?: string
    primaryCta?: HomepageCta
    secondaryCta?: HomepageCta
  }>(config, 'cta')
  const footer = getSlots<{
    blurb?: string
    quickLinks?: HomepageNavLink[]
    email?: string
    phone?: string
  }>(config, 'footer')
  const nav = getSlots<{
    showTagline?: boolean
    portalLabel?: string
    applyLabel?: string
    links?: HomepageNavLink[]
  }>(config, 'nav')

  const activeLook =
    HOMEPAGE_TEMPLATES.find((t) => t.id === config.templateId) ||
    HOMEPAGE_TEMPLATES[0]
  const currentStep = STUDIO_STEPS.find((s) => s.id === tab) || STUDIO_STEPS[0]

  const applyLook = (id: HomepageTemplateId) => {
    if (id === config.templateId) return
    setDraft(applyTemplateKeepContent(config, id))
    const name = HOMEPAGE_TEMPLATES.find((t) => t.id === id)?.name || id
    toast.success(`Look applied: ${name}`, {
      description:
        'Your words and images were kept. Preview updates on the right.',
    })
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-[520px] flex-col bg-[#eef1ef] lg:h-[calc(100dvh-4rem)]">
      <header className="shrink-0 border-b border-slate-200/80 bg-white px-3 py-2.5 sm:px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#0a1f1a] text-white">
              <Globe className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-slate-900">
                  Website Studio
                </h1>
                {dirty ? (
                  <span className="bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-800">
                    Unsaved
                  </span>
                ) : (
                  <span className="bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                    Saved
                  </span>
                )}
              </div>
              <p className="truncate text-[11px] text-slate-500">
                {currentStep.hint}
                {publishedAt
                  ? ` · Published ${new Date(publishedAt).toLocaleDateString()}`
                  : ' · Not published'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex border border-slate-200 bg-white">
              <button
                type="button"
                title="Desktop preview"
                className={cn(
                  'px-2 py-1.5',
                  previewMode === 'desktop'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-50',
                )}
                onClick={() => setPreviewMode('desktop')}
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                title="Mobile preview"
                className={cn(
                  'px-2 py-1.5',
                  previewMode === 'mobile'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-50',
                )}
                onClick={() => setPreviewMode('mobile')}
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-none px-2.5 text-xs"
              asChild
            >
              <a href="/" target="_blank" rel="noreferrer">
                <Eye className="mr-1 h-3.5 w-3.5" />
                Live
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-none px-2.5 text-xs"
              onClick={handleRevert}
              disabled={
                !published ||
                JSON.stringify(published) === JSON.stringify(config)
              }
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-none px-2.5 text-xs"
              onClick={handleSave}
              disabled={saving || !dirty}
            >
              {saving ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="mr-1 h-3.5 w-3.5" />
              )}
              Save
            </Button>
            <Button
              size="sm"
              className="h-8 rounded-none bg-[#246a59] px-3 text-xs hover:bg-[#1a4c40]"
              onClick={handlePublish}
              disabled={publishing}
            >
              {publishing ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="mr-1 h-3.5 w-3.5" />
              )}
              Publish
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex max-h-[46vh] w-full shrink-0 flex-col border-b border-slate-200 bg-white lg:max-h-none lg:w-[340px] lg:border-b-0 lg:border-r xl:w-[360px]">
          <nav className="flex shrink-0 gap-0.5 border-b border-slate-100 bg-slate-50 p-1.5">
            {STUDIO_STEPS.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setTab(step.id)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 px-2 py-2 text-[11px] font-semibold transition',
                  tab === step.id
                    ? 'bg-white text-[#0a1f1a] shadow-sm ring-1 ring-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800',
                )}
              >
                <span
                  className={cn(
                    'flex h-4 w-4 items-center justify-center text-[9px] font-bold',
                    tab === step.id
                      ? 'bg-[#246a59] text-white'
                      : 'bg-slate-200 text-slate-600',
                  )}
                >
                  {step.step}
                </span>
                {step.short}
              </button>
            ))}
          </nav>

          <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
            {tab === 'look' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 bg-[#f3f7f5] px-2.5 py-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#246a59]">
                      Active look
                    </p>
                    <p className="truncate text-[13px] font-semibold text-[#0a1f1a]">
                      {activeLook.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-[#246a59] hover:underline"
                    onClick={() => setTab('brand')}
                  >
                    Brand
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <p className="px-0.5 text-[11px] text-slate-500">
                  Tap a look to apply — copy &amp; images stay.
                </p>
                <div className="flex flex-col gap-1">
                  {HOMEPAGE_TEMPLATES.map((t) => (
                    <TemplateThumb
                      key={t.id}
                      id={t.id}
                      active={config.templateId === t.id}
                      onSelect={() => applyLook(t.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {tab === 'brand' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-2">
                  <Paintbrush className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <p className="text-[11px] leading-snug text-slate-600">
                    Colors tint your look. Scroll for logo &amp; hero.
                  </p>
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  School colors
                </p>
                {(
                  [
                    ['primary', 'Primary'],
                    ['primaryDark', 'Primary dark'],
                    ['primaryLight', 'Primary light'],
                    ['accent', 'Accent'],
                    ['ink', 'Ink'],
                    ['paper', 'Paper'],
                  ] as const
                ).map(([key, label]) => (
                  <Field key={key} label={label}>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        className="h-10 w-14 cursor-pointer p-1"
                        value={theme[key]}
                        onChange={(e) =>
                          setDraft({
                            ...config,
                            theme: {
                              ...theme,
                              [key]: e.target.value,
                            } as HomepageTheme,
                          })
                        }
                      />
                      <Input
                        value={theme[key]}
                        onChange={(e) =>
                          setDraft({
                            ...config,
                            theme: {
                              ...theme,
                              [key]: e.target.value,
                            } as HomepageTheme,
                          })
                        }
                      />
                    </div>
                  </Field>
                ))}
                <Field label="Corner style">
                  <div className="flex gap-2">
                    {(['sharp', 'soft'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...config,
                            theme: { ...theme, radiusMode: mode },
                          })
                        }
                        className={cn(
                          'flex-1 border px-3 py-2 text-sm capitalize',
                          theme.radiusMode === mode
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-slate-200',
                        )}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </Field>

                <div className="border-t border-slate-100 pt-4">
                  <h3 className="mb-3 text-sm font-semibold">Logo</h3>
                  {config.logoUrl ? (
                    <div className="mb-3 flex items-center justify-between gap-3 rounded border border-slate-200 p-2">
                      <img
                        src={config.logoUrl}
                        alt="School logo"
                        className="h-12 w-12 object-contain"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDraft({ ...config, logoUrl: undefined })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <p className="mb-3 text-xs text-slate-400">
                      No logo set — the site shows an initials monogram.
                    </p>
                  )}
                  <Field label="Logo URL">
                    <Input
                      value={config.logoUrl || ''}
                      placeholder="https://…/logo.png"
                      onChange={(e) =>
                        setDraft({
                          ...config,
                          logoUrl: e.target.value.trim() || undefined,
                        })
                      }
                    />
                  </Field>
                  <div className="mt-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-primary">
                      <Upload className="h-4 w-4" />
                      {uploading ? 'Uploading…' : 'Upload logo'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          void handleUpload(file, (url) =>
                            setDraft({ ...config, logoUrl: url }),
                          )
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <h3 className="mb-3 text-sm font-semibold">Hero media</h3>
                  <Field label="Background image URL">
                    <Input
                      value={hero.backgroundImage || ''}
                      onChange={(e) =>
                        setDraft(
                          patchSlots(config, 'hero', {
                            backgroundImage: e.target.value,
                          }),
                        )
                      }
                    />
                  </Field>
                  <div className="mt-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-primary">
                      <Upload className="h-4 w-4" />
                      {uploading ? 'Uploading…' : 'Upload image (16:9)'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          void handleUpload(file, (url) =>
                            setDraft(
                              patchSlots(config, 'hero', {
                                backgroundImage: url,
                              }),
                            ),
                          )
                        }}
                      />
                    </label>
                  </div>
                  <Field label={`Overlay ${(hero.overlayStrength ?? 0.55).toFixed(2)}`}>
                    <input
                      type="range"
                      min={0.2}
                      max={0.9}
                      step={0.05}
                      className="w-full"
                      value={hero.overlayStrength ?? 0.55}
                      onChange={(e) =>
                        setDraft(
                          patchSlots(config, 'hero', {
                            overlayStrength: Number(e.target.value),
                          }),
                        )
                      }
                    />
                  </Field>
                  <Field label="Eyebrow">
                    <Input
                      value={hero.eyebrow || ''}
                      onChange={(e) =>
                        setDraft(
                          patchSlots(config, 'hero', {
                            eyebrow: e.target.value,
                          }),
                        )
                      }
                    />
                  </Field>
                  <Field label="Headline">
                    <Input
                      value={hero.headline || ''}
                      onChange={(e) =>
                        setDraft(
                          patchSlots(config, 'hero', {
                            headline: e.target.value,
                          }),
                        )
                      }
                    />
                  </Field>
                  <Field label="Subcopy">
                    <Textarea
                      rows={3}
                      value={hero.subcopy || ''}
                      onChange={(e) =>
                        setDraft(
                          patchSlots(config, 'hero', {
                            subcopy: e.target.value,
                          }),
                        )
                      }
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="Primary CTA label">
                      <Input
                        value={hero.primaryCta?.label || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'hero', {
                              primaryCta: {
                                ...(hero.primaryCta || {
                                  label: '',
                                  href: '/apply',
                                }),
                                label: e.target.value,
                              },
                            }),
                          )
                        }
                      />
                    </Field>
                    <Field label="Primary CTA href">
                      <Input
                        value={hero.primaryCta?.href || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'hero', {
                              primaryCta: {
                                ...(hero.primaryCta || {
                                  label: 'Apply',
                                  href: '',
                                }),
                                href: e.target.value,
                              },
                            }),
                          )
                        }
                      />
                    </Field>
                    <Field label="Secondary CTA label">
                      <Input
                        value={hero.secondaryCta?.label || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'hero', {
                              secondaryCta: {
                                ...(hero.secondaryCta || {
                                  label: '',
                                  href: '/login',
                                }),
                                label: e.target.value,
                              },
                            }),
                          )
                        }
                      />
                    </Field>
                    <Field label="Secondary CTA href">
                      <Input
                        value={hero.secondaryCta?.href || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'hero', {
                              secondaryCta: {
                                ...(hero.secondaryCta || {
                                  label: 'Login',
                                  href: '',
                                }),
                                href: e.target.value,
                              },
                            }),
                          )
                        }
                      />
                    </Field>
                  </div>
                </div>

                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#246a59] hover:underline"
                  onClick={() => setTab('sections')}
                >
                  Next: edit page sections
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}

            {tab === 'sections' && (
              <div className="space-y-3">
                <p className="text-[11px] leading-snug text-slate-500">
                  Toggle on/off, reorder middle sections, tap a name to edit.
                </p>
                <div className="space-y-1">
                  {config.sections.map((section) => {
                    const locked = LOCKED.includes(section.type)
                    return (
                      <div
                        key={section.id}
                        className={cn(
                          'flex items-center gap-1.5 border px-2 py-1.5',
                          activeSection === section.type
                            ? 'border-[#246a59] bg-[#246a59]/5'
                            : 'border-slate-200',
                        )}
                      >
                        <button
                          type="button"
                          className="min-w-0 flex-1 text-left text-[12px] font-medium text-slate-800"
                          onClick={() => setActiveSection(section.type)}
                        >
                          {SECTION_LABELS[section.type]}
                        </button>
                        {!locked && (
                          <>
                            <button
                              type="button"
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              onClick={() => moveSection(section.type, -1)}
                              aria-label="Move up"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              onClick={() => moveSection(section.type, 1)}
                              aria-label="Move down"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                          </>
                        )}
                        <Switch
                          checked={section.enabled}
                          disabled={locked}
                          onCheckedChange={(v) =>
                            toggleSection(section.type, v)
                          }
                        />
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                  <h3 className="text-[12px] font-semibold text-slate-900">
                    {SECTION_LABELS[activeSection]}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px]"
                    onClick={() => resetSection(activeSection)}
                  >
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Reset
                  </Button>
                </div>

                {activeSection === 'nav' && (
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={nav.showTagline !== false}
                        onCheckedChange={(v) =>
                          setDraft(
                            patchSlots(config, 'nav', { showTagline: v }),
                          )
                        }
                      />
                      Show tagline
                    </label>
                    <Field label="Portal label">
                      <Input
                        value={nav.portalLabel || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'nav', {
                              portalLabel: e.target.value,
                            }),
                          )
                        }
                      />
                    </Field>
                    <Field label="Apply label">
                      <Input
                        value={nav.applyLabel || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'nav', {
                              applyLabel: e.target.value,
                            }),
                          )
                        }
                      />
                    </Field>
                    {(nav.links || []).map((link, i) => (
                      <div key={i} className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Label"
                          value={link.label}
                          onChange={(e) => {
                            const links = [...(nav.links || [])]
                            links[i] = { ...links[i], label: e.target.value }
                            setDraft(patchSlots(config, 'nav', { links }))
                          }}
                        />
                        <Input
                          placeholder="Href"
                          value={link.href}
                          onChange={(e) => {
                            const links = [...(nav.links || [])]
                            links[i] = { ...links[i], href: e.target.value }
                            setDraft(patchSlots(config, 'nav', { links }))
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === 'hero' && (
                  <p className="text-xs text-slate-500">
                    Hero media and copy live under the Brand tab.
                  </p>
                )}

                {activeSection === 'stats' && (
                  <div className="space-y-3">
                    {(stats.items || []).map((item, i) => (
                      <div key={i} className="space-y-2 border border-slate-100 p-2">
                        <Input
                          placeholder="Value"
                          value={item.value}
                          onChange={(e) => {
                            const items = [...(stats.items || [])]
                            items[i] = { ...items[i], value: e.target.value }
                            setDraft(patchSlots(config, 'stats', { items }))
                          }}
                        />
                        <Input
                          placeholder="Label"
                          value={item.label}
                          onChange={(e) => {
                            const items = [...(stats.items || [])]
                            items[i] = { ...items[i], label: e.target.value }
                            setDraft(patchSlots(config, 'stats', { items }))
                          }}
                        />
                        <Input
                          placeholder="Hint"
                          value={item.hint || ''}
                          onChange={(e) => {
                            const items = [...(stats.items || [])]
                            items[i] = { ...items[i], hint: e.target.value }
                            setDraft(patchSlots(config, 'stats', { items }))
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === 'offerings' && (
                  <div className="space-y-3">
                    <Field label="Eyebrow">
                      <Input
                        value={offerings.eyebrow || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'offerings', {
                              eyebrow: e.target.value,
                            }),
                          )
                        }
                      />
                    </Field>
                    <Field label="Headline">
                      <Input
                        value={offerings.headline || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'offerings', {
                              headline: e.target.value,
                            }),
                          )
                        }
                      />
                    </Field>
                    <Field label="Subcopy">
                      <Textarea
                        rows={2}
                        value={offerings.subcopy || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'offerings', {
                              subcopy: e.target.value,
                            }),
                          )
                        }
                      />
                    </Field>
                    {(offerings.items || []).map((item, i) => (
                      <div key={i} className="space-y-2 border border-slate-100 p-2">
                        <Input
                          placeholder="Title"
                          value={item.title}
                          onChange={(e) => {
                            const items = [...(offerings.items || [])]
                            items[i] = { ...items[i], title: e.target.value }
                            setDraft(
                              patchSlots(config, 'offerings', { items }),
                            )
                          }}
                        />
                        <Textarea
                          rows={2}
                          placeholder="Body"
                          value={item.body}
                          onChange={(e) => {
                            const items = [...(offerings.items || [])]
                            items[i] = { ...items[i], body: e.target.value }
                            setDraft(
                              patchSlots(config, 'offerings', { items }),
                            )
                          }}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="CTA"
                            value={item.ctaLabel}
                            onChange={(e) => {
                              const items = [...(offerings.items || [])]
                              items[i] = {
                                ...items[i],
                                ctaLabel: e.target.value,
                              }
                              setDraft(
                                patchSlots(config, 'offerings', { items }),
                              )
                            }}
                          />
                          <Input
                            placeholder="Href"
                            value={item.href}
                            onChange={(e) => {
                              const items = [...(offerings.items || [])]
                              items[i] = { ...items[i], href: e.target.value }
                              setDraft(
                                patchSlots(config, 'offerings', { items }),
                              )
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === 'programs' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500">
                      Programs are pulled automatically from this school&apos;s
                      setup (levels &amp; grade groups).
                    </p>
                    <Field label="Eyebrow">
                      <Input
                        value={programs.eyebrow || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'programs', {
                              eyebrow: e.target.value,
                            }),
                          )
                        }
                      />
                    </Field>
                    <Field label="Headline">
                      <Input
                        value={programs.headline || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'programs', {
                              headline: e.target.value,
                            }),
                          )
                        }
                      />
                    </Field>
                    <Field label="Subcopy">
                      <Textarea
                        rows={2}
                        value={programs.subcopy || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'programs', {
                              subcopy: e.target.value,
                            }),
                          )
                        }
                      />
                    </Field>
                  </div>
                )}

                {activeSection === 'feeDownloads' && (
                  <div className="space-y-3">
                    <Field label="Eyebrow">
                      <Input
                        value={fees.eyebrow || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'feeDownloads', {
                              eyebrow: e.target.value,
                            }),
                          )
                        }
                      />
                    </Field>
                    <Field label="Headline">
                      <Input
                        value={fees.headline || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'feeDownloads', {
                              headline: e.target.value,
                            }),
                          )
                        }
                      />
                    </Field>
                    <Field label="Subcopy">
                      <Textarea
                        rows={2}
                        value={fees.subcopy || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'feeDownloads', {
                              subcopy: e.target.value,
                            }),
                          )
                        }
                      />
                    </Field>
                  </div>
                )}

                {activeSection === 'gallery' && (
                  <div className="space-y-3">
                    <Field label="Eyebrow">
                      <Input
                        value={gallery.eyebrow || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'gallery', {
                              eyebrow: e.target.value,
                            }),
                          )
                        }
                      />
                    </Field>
                    <Field label="Headline">
                      <Input
                        value={gallery.headline || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'gallery', {
                              headline: e.target.value,
                            }),
                          )
                        }
                      />
                    </Field>
                    {(gallery.images || []).map((img, i) => (
                      <div key={i} className="space-y-2 border border-slate-100 p-2">
                        <Input
                          placeholder="Image URL"
                          value={img.url}
                          onChange={(e) => {
                            const images = [...(gallery.images || [])]
                            images[i] = { ...images[i], url: e.target.value }
                            setDraft(patchSlots(config, 'gallery', { images }))
                          }}
                        />
                        <Input
                          placeholder="Caption"
                          value={img.caption || ''}
                          onChange={(e) => {
                            const images = [...(gallery.images || [])]
                            images[i] = {
                              ...images[i],
                              caption: e.target.value,
                            }
                            setDraft(patchSlots(config, 'gallery', { images }))
                          }}
                        />
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={(gallery.images || []).length >= 8}
                        onClick={() =>
                          setDraft(
                            patchSlots(config, 'gallery', {
                              images: [
                                ...(gallery.images || []),
                                { url: '/schooll.png', caption: '' },
                              ],
                            }),
                          )
                        }
                      >
                        Add image
                      </Button>
                      <label className="inline-flex cursor-pointer items-center gap-1 text-sm text-primary">
                        <Upload className="h-3.5 w-3.5" />
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            void handleUpload(file, (url) =>
                              setDraft(
                                patchSlots(config, 'gallery', {
                                  images: [
                                    ...(gallery.images || []),
                                    { url, caption: '' },
                                  ],
                                }),
                              ),
                            )
                          }}
                        />
                      </label>
                    </div>
                  </div>
                )}

                {activeSection === 'testimonials' && (
                  <div className="space-y-3">
                    <Field label="Eyebrow">
                      <Input
                        value={testimonials.eyebrow || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'testimonials', {
                              eyebrow: e.target.value,
                            }),
                          )
                        }
                      />
                    </Field>
                    <Field label="Headline">
                      <Input
                        value={testimonials.headline || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'testimonials', {
                              headline: e.target.value,
                            }),
                          )
                        }
                      />
                    </Field>
                    {(testimonials.items || []).map((item, i) => (
                      <div key={i} className="space-y-2 border border-slate-100 p-2">
                        <Textarea
                          rows={2}
                          placeholder="Quote"
                          value={item.quote}
                          onChange={(e) => {
                            const items = [...(testimonials.items || [])]
                            items[i] = { ...items[i], quote: e.target.value }
                            setDraft(
                              patchSlots(config, 'testimonials', { items }),
                            )
                          }}
                        />
                        <Input
                          placeholder="Name"
                          value={item.name}
                          onChange={(e) => {
                            const items = [...(testimonials.items || [])]
                            items[i] = { ...items[i], name: e.target.value }
                            setDraft(
                              patchSlots(config, 'testimonials', { items }),
                            )
                          }}
                        />
                        <Input
                          placeholder="Role"
                          value={item.role}
                          onChange={(e) => {
                            const items = [...(testimonials.items || [])]
                            items[i] = { ...items[i], role: e.target.value }
                            setDraft(
                              patchSlots(config, 'testimonials', { items }),
                            )
                          }}
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={(testimonials.items || []).length >= 4}
                      onClick={() =>
                        setDraft(
                          patchSlots(config, 'testimonials', {
                            items: [
                              ...(testimonials.items || []),
                              {
                                quote: 'A wonderful school community.',
                                name: 'Parent name',
                                role: 'Parent',
                              },
                            ],
                          }),
                        )
                      }
                    >
                      Add testimonial
                    </Button>
                  </div>
                )}

                {activeSection === 'cta' && (
                  <div className="space-y-3">
                    <Field label="Headline">
                      <Input
                        value={cta.headline || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'cta', {
                              headline: e.target.value,
                            }),
                          )
                        }
                      />
                    </Field>
                    <Field label="Body">
                      <Textarea
                        rows={2}
                        value={cta.body || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'cta', { body: e.target.value }),
                          )
                        }
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Primary label">
                        <Input
                          value={cta.primaryCta?.label || ''}
                          onChange={(e) =>
                            setDraft(
                              patchSlots(config, 'cta', {
                                primaryCta: {
                                  ...(cta.primaryCta || {
                                    label: '',
                                    href: '/apply',
                                  }),
                                  label: e.target.value,
                                },
                              }),
                            )
                          }
                        />
                      </Field>
                      <Field label="Primary href">
                        <Input
                          value={cta.primaryCta?.href || ''}
                          onChange={(e) =>
                            setDraft(
                              patchSlots(config, 'cta', {
                                primaryCta: {
                                  ...(cta.primaryCta || {
                                    label: 'Apply',
                                    href: '',
                                  }),
                                  href: e.target.value,
                                },
                              }),
                            )
                          }
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {activeSection === 'footer' && (
                  <div className="space-y-3">
                    <Field label="Blurb">
                      <Textarea
                        rows={3}
                        value={footer.blurb || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'footer', {
                              blurb: e.target.value,
                            }),
                          )
                        }
                      />
                    </Field>
                    <Field label="Email override">
                      <Input
                        value={footer.email || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'footer', {
                              email: e.target.value,
                            }),
                          )
                        }
                      />
                    </Field>
                    <Field label="Phone override">
                      <Input
                        value={footer.phone || ''}
                        onChange={(e) =>
                          setDraft(
                            patchSlots(config, 'footer', {
                              phone: e.target.value,
                            }),
                          )
                        }
                      />
                    </Field>
                    {(footer.quickLinks || []).map((link, i) => (
                      <div key={i} className="grid grid-cols-2 gap-2">
                        <Input
                          value={link.label}
                          onChange={(e) => {
                            const quickLinks = [...(footer.quickLinks || [])]
                            quickLinks[i] = {
                              ...quickLinks[i],
                              label: e.target.value,
                            }
                            setDraft(
                              patchSlots(config, 'footer', { quickLinks }),
                            )
                          }}
                        />
                        <Input
                          value={link.href}
                          onChange={(e) => {
                            const quickLinks = [...(footer.quickLinks || [])]
                            quickLinks[i] = {
                              ...quickLinks[i],
                              href: e.target.value,
                            }
                            setDraft(
                              patchSlots(config, 'footer', { quickLinks }),
                            )
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        <main className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-[#e8eeeb] p-3 sm:p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Preview · {activeLook.name}
              {dirty ? ' · unsaved' : ''}
            </p>
            <p className="text-[11px] text-slate-400">
              Draft only — Publish to update the live site
            </p>
          </div>
          <div
            className={cn(
              'relative mx-auto h-[calc(100%-1.5rem)] overflow-hidden border border-slate-300 bg-white shadow-md',
              previewMode === 'mobile' ? 'max-w-[390px]' : 'max-w-none',
            )}
          >
            <div className="h-full overflow-y-auto overflow-x-hidden">
              <SchoolHomepage
                previewConfig={config}
                levels={schoolConfig?.selectedLevels}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
