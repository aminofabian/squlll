'use client'

import { FIGTREE_FONT_FAMILY } from '@/lib/fonts/figtree'
import { getSchoolColor } from '@/lib/schoolLogo'
import { cn } from '@/lib/utils'
import type { FeeLetterModel, FeeLetterTemplateId } from '../../lib/feeLetter/types'
import { LetterWebsiteFooter } from './FeeLetterParts'
import { FeeLetterTemplateView } from './FeeLetterTemplateView'

const DOC_STYLES: Record<
  FeeLetterTemplateId,
  { fontFamily: string; fontSize: string }
> = {
  classic: {
    fontFamily: FIGTREE_FONT_FAMILY,
    fontSize: '14px',
  },
  modern: {
    fontFamily: FIGTREE_FONT_FAMILY,
    fontSize: '13px',
  },
  formal: {
    fontFamily: FIGTREE_FONT_FAMILY,
    fontSize: '13px',
  },
  compact: {
    fontFamily: FIGTREE_FONT_FAMILY,
    fontSize: '10px',
  },
  banner: {
    fontFamily: FIGTREE_FONT_FAMILY,
    fontSize: '14px',
  },
  kenya: {
    fontFamily: FIGTREE_FONT_FAMILY,
    fontSize: '14px',
  },
}

export function FeeLetterDocument({
  model,
  templateId,
}: {
  model: FeeLetterModel
  templateId: FeeLetterTemplateId
}) {
  const docStyle = DOC_STYLES[templateId] ?? DOC_STYLES.classic
  const brandTint =
    templateId === 'banner' ? getSchoolColor(model.schoolLogoKey) : null
  const docPadding = templateId === 'compact' ? '1.25rem' : '2rem'

  return (
    <div
      data-fee-pdf-document
      data-fee-letter-template={templateId}
      className={cn(
        'fee-letter-doc bg-white mx-auto print:p-0 print:shadow-none print:m-0',
        templateId === 'compact' ? 'p-4 sm:p-5' : 'p-8',
      )}
      style={{
        fontFamily: docStyle.fontFamily,
        width: '210mm',
        maxWidth: '100%',
        fontSize: docStyle.fontSize,
        lineHeight: templateId === 'compact' ? 1.25 : 1.35,
        color: '#000',
        padding: docPadding,
        ...(brandTint
          ? {
              ['--fee-letter-brand' as string]: brandTint.from,
              ['--fee-letter-brand-to' as string]: brandTint.to,
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }
          : {}),
      }}
    >
      <FeeLetterTemplateView templateId={templateId} model={model} />
      {templateId !== 'formal' &&
      templateId !== 'banner' &&
      templateId !== 'kenya' &&
      templateId !== 'compact' ? (
        <LetterWebsiteFooter model={model} />
      ) : null}
    </div>
  )
}
