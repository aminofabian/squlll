'use client'

import { Fragment } from 'react'
import type { FeeLetterModel, FeeLetterTemplateId } from '../../lib/feeLetter/types'
import {
  CLASSIC_TABLE,
  KesAmount,
  LogoBox,
  PaymentSection,
  LetterheadSchoolDetails,
  RefsAndDate,
  SignatureBlock,
  TermScheduleTable,
  TitleBlock,
  VoteHeadTable,
} from './FeeLetterParts'
import { ModernFeesMatrixTable } from './ModernFeesMatrixTable'
import { ModernLetterHeader } from './ModernLetterHeader'
import { FormalMinistryTemplate } from './formal/FormalMinistryTemplate'
import { BrandBannerTemplate } from './banner/BrandBannerTemplate'
import { KenyaCircularTemplate } from './kenya/KenyaCircularTemplate'
import { CompactFeeLetterTemplate } from './compact/CompactFeeLetterTemplate'

function ClassicTemplate({ model }: { model: FeeLetterModel }) {
  return (
    <>
      <header className="mb-6">
        <div className="flex items-center justify-center gap-5 mb-2">
          <LogoBox
            logoUrl={model.logoUrl}
            schoolLogoKey={model.schoolLogoKey}
          />
          <LetterheadSchoolDetails model={model} />
        </div>
      </header>
      <RefsAndDate model={model} />
      <TitleBlock model={model} />
      <VoteHeadTable model={model} style={CLASSIC_TABLE} />
      <TermScheduleTable
        model={model}
        style={CLASSIC_TABLE}
        headingClassName="text-center text-sm font-bold underline mb-2"
      />
      <PaymentSection model={model} />
      <SignatureBlock model={model} />
      <p className="mt-8 text-center text-xs italic">
        When replying please quote our reference
      </p>
    </>
  )
}

function ModernTemplate({ model }: { model: FeeLetterModel }) {
  return (
    <>
      <ModernLetterHeader model={model} />
      <TitleBlock
        model={model}
        className="text-center text-[17px] font-semibold tracking-tight text-slate-900 mb-1"
        scopeClassName="text-center text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500 mb-6"
      />
      <ModernFeesMatrixTable model={model} />
      <PaymentSection
        model={model}
        titleClassName="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-800 mb-3"
      />
      <SignatureBlock model={model} />
    </>
  )
}

function FormalTemplate({ model }: { model: FeeLetterModel }) {
  return <FormalMinistryTemplate model={model} />
}

function CompactTemplate({ model }: { model: FeeLetterModel }) {
  return <CompactFeeLetterTemplate model={model} />
}

function BannerTemplate({ model }: { model: FeeLetterModel }) {
  return <BrandBannerTemplate model={model} />
}

function KenyaTemplate({ model }: { model: FeeLetterModel }) {
  return <KenyaCircularTemplate model={model} />
}

export function FeeLetterTemplateView({
  templateId,
  model,
}: {
  templateId: FeeLetterTemplateId
  model: FeeLetterModel
}) {
  switch (templateId) {
    case 'modern':
      return <ModernTemplate model={model} />
    case 'formal':
      return <FormalTemplate model={model} />
    case 'compact':
      return <CompactTemplate model={model} />
    case 'banner':
      return <BannerTemplate model={model} />
    case 'kenya':
      return <KenyaTemplate model={model} />
    case 'classic':
    default:
      return <ClassicTemplate model={model} />
  }
}
