'use client'

import type { ComponentType, ReactNode } from 'react'
import type {
  HomepageConfig,
  HomepageSectionType,
  HomepageTemplateId,
  PublicSchoolLevel,
} from '@/lib/types/homepage-config'
import type { SchoolConfiguration } from '@/lib/types/school-config'
import {
  HomepageCtaBand,
  HomepageFeeSection,
  HomepageFooter,
  HomepageGallery,
  HomepageHero,
  HomepageNav,
  HomepageOfferings,
  HomepagePrograms,
  HomepageStats,
  HomepageTestimonials,
} from './sections'
import { cn } from '@/lib/utils'
import {
  HomepageRuntime,
  HomepageShellStyles,
  HorizonVinyl,
  StoryScrollVine,
  shellClass,
  themeStyle,
} from './shared'

export type TemplateProps = {
  config: HomepageConfig
  runtime: HomepageRuntime
  schoolConfig?: SchoolConfiguration
  /** School levels for the programs section (public SSR or studio preview) */
  levels?: PublicSchoolLevel[]
}

type VariantMap = Partial<Record<HomepageSectionType, string>>

const TEMPLATE_VARIANTS: Record<HomepageTemplateId, VariantMap> = {
  'campus-dawn': {
    hero: 'dawn',
    stats: 'band',
    offerings: 'grid',
    cta: 'primary',
  },
  'assembly-hall': {
    nav: 'notebook',
    hero: 'assembly',
    stats: 'chalk',
    offerings: 'periods',
    gallery: 'cork',
    testimonials: 'yearbook',
    cta: 'fees',
  },
  playfield: {
    nav: 'terminal',
    hero: 'boarding',
    stats: 'stamps',
    offerings: 'gates',
    gallery: 'tickets',
    testimonials: 'luggage',
    cta: 'checkin',
  },
  'garden-court': {
    nav: 'cloister',
    hero: 'courtyard',
    stats: 'planters',
    offerings: 'specimens',
    gallery: 'greenhouse',
    testimonials: 'bench',
    cta: 'gate',
  },
  'crest-motto': {
    nav: 'crest',
    hero: 'crest',
    stats: 'band',
    offerings: 'open',
    cta: 'ink',
  },
  'skyline-cbc': {
    nav: 'glass',
    hero: 'dawn',
    stats: 'band',
    offerings: 'numbered',
    cta: 'block',
  },
  'story-scroll': {
    nav: 'vine',
    hero: 'pane',
    stats: 'harvest',
    offerings: 'seasons',
    gallery: 'almanac',
    testimonials: 'pressed',
    cta: 'bench',
  },
  'horizon-board': {
    nav: 'disc',
    hero: 'label',
    stats: 'score',
    offerings: 'movements',
    gallery: 'programme',
    testimonials: 'liner',
    cta: 'boxoffice',
  },
  'studio-day': {
    hero: 'studio',
    stats: 'band',
    offerings: 'magazine',
    cta: 'block',
  },
  'night-lights': {
    hero: 'night',
    stats: 'plaques',
    offerings: 'grid',
    cta: 'ink',
  },
}

const SHELL_CLASS: Partial<Record<HomepageTemplateId, string>> = {
  'assembly-hall': 'assembly-hall-shell bg-[var(--school-paper)]',
  playfield: 'playfield-shell bg-[var(--school-paper)]',
  'garden-court': 'garden-court-shell bg-[var(--school-paper)]',
  'story-scroll': 'story-scroll-shell bg-[var(--school-paper)]',
  'horizon-board': 'horizon-board-shell bg-[var(--school-paper)]',
  'night-lights': 'bg-[#070f0c]',
}

function Shell({
  config,
  runtime,
  children,
  className,
}: {
  config: HomepageConfig
  runtime: HomepageRuntime
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={shellClass(
        config,
        cn(runtime.preview && 'relative isolate overflow-x-hidden', className),
      )}
      style={themeStyle(config.theme)}
    >
      <HomepageShellStyles
        assembly={config.templateId === 'assembly-hall'}
        playfield={config.templateId === 'playfield'}
        garden={config.templateId === 'garden-court'}
        story={config.templateId === 'story-scroll'}
        horizon={config.templateId === 'horizon-board'}
      />
      {config.templateId === 'story-scroll' && <StoryScrollVine />}
      {config.templateId === 'horizon-board' && <HorizonVinyl />}
      {children}
    </div>
  )
}

function TemplateBody({
  config,
  runtime,
  schoolConfig,
  levels,
  variants,
}: TemplateProps & { variants: VariantMap }) {
  return (
    <>
      {config.sections.map((section) => {
        if (!section.enabled) return null
        switch (section.type) {
          case 'nav':
            return (
              <HomepageNav
                key={section.id}
                config={config}
                runtime={runtime}
                variant={variants.nav}
              />
            )
          case 'hero':
            return (
              <HomepageHero
                key={section.id}
                config={config}
                runtime={runtime}
                variant={variants.hero}
              />
            )
          case 'stats':
            return (
              <HomepageStats
                key={section.id}
                config={config}
                variant={variants.stats}
              />
            )
          case 'offerings':
            return (
              <HomepageOfferings
                key={section.id}
                config={config}
                variant={variants.offerings}
              />
            )
          case 'programs':
            return (
              <HomepagePrograms
                key={section.id}
                config={config}
                schoolConfig={schoolConfig}
                levels={levels}
              />
            )
          case 'feeDownloads':
            return (
              <HomepageFeeSection
                key={section.id}
                config={config}
                runtime={runtime}
              />
            )
          case 'gallery':
            return (
              <HomepageGallery
                key={section.id}
                config={config}
                variant={variants.gallery}
              />
            )
          case 'testimonials':
            return (
              <HomepageTestimonials
                key={section.id}
                config={config}
                variant={variants.testimonials}
              />
            )
          case 'cta':
            return (
              <HomepageCtaBand
                key={section.id}
                config={config}
                runtime={runtime}
                variant={variants.cta}
              />
            )
          case 'footer':
            return (
              <HomepageFooter
                key={section.id}
                config={config}
                runtime={runtime}
              />
            )
          default:
            return null
        }
      })}
    </>
  )
}

function makeTemplate(id: HomepageTemplateId): ComponentType<TemplateProps> {
  const variants = TEMPLATE_VARIANTS[id]
  const extraClass = SHELL_CLASS[id]
  function Template({ config, runtime, schoolConfig, levels }: TemplateProps) {
    return (
      <Shell config={config} runtime={runtime} className={extraClass}>
        <TemplateBody
          config={config}
          runtime={runtime}
          schoolConfig={schoolConfig}
          levels={levels}
          variants={variants}
        />
      </Shell>
    )
  }
  Template.displayName = `HomepageTemplate_${id}`
  return Template
}

export const CampusDawnTemplate = makeTemplate('campus-dawn')
export const AssemblyHallTemplate = makeTemplate('assembly-hall')
export const PlayfieldTemplate = makeTemplate('playfield')
export const GardenCourtTemplate = makeTemplate('garden-court')
export const CrestMottoTemplate = makeTemplate('crest-motto')
export const SkylineCbcTemplate = makeTemplate('skyline-cbc')
export const StoryScrollTemplate = makeTemplate('story-scroll')
export const HorizonBoardTemplate = makeTemplate('horizon-board')
export const StudioDayTemplate = makeTemplate('studio-day')
export const NightLightsTemplate = makeTemplate('night-lights')

const REGISTRY: Record<HomepageTemplateId, ComponentType<TemplateProps>> = {
  'campus-dawn': CampusDawnTemplate,
  'assembly-hall': AssemblyHallTemplate,
  playfield: PlayfieldTemplate,
  'garden-court': GardenCourtTemplate,
  'crest-motto': CrestMottoTemplate,
  'skyline-cbc': SkylineCbcTemplate,
  'story-scroll': StoryScrollTemplate,
  'horizon-board': HorizonBoardTemplate,
  'studio-day': StudioDayTemplate,
  'night-lights': NightLightsTemplate,
}

export function HomepageRenderer({
  config,
  runtime,
  schoolConfig,
  levels,
}: TemplateProps) {
  const Template = REGISTRY[config.templateId] || CampusDawnTemplate
  return (
    <Template
      config={config}
      runtime={runtime}
      schoolConfig={schoolConfig}
      levels={levels}
    />
  )
}
