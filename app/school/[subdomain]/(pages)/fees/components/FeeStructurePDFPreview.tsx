'use client'

import { useMemo } from 'react'
import { buildFeeLetterModel } from '../lib/feeLetter/buildFeeLetterModel'
import { DEFAULT_FEE_LETTER_TEMPLATE } from '../lib/feeLetter/templates'
import type { FeeLetterTemplateId } from '../lib/feeLetter/types'
import type { BuildFeeLetterModelInput } from '../lib/feeLetter/types'
import { FeeLetterDocument } from './feeLetter/FeeLetterDocument'

export type FeeStructurePDFPreviewProps = BuildFeeLetterModelInput & {
  templateId?: FeeLetterTemplateId
}

export const FeeStructurePDFPreview = ({
  templateId = DEFAULT_FEE_LETTER_TEMPLATE,
  formData,
  schoolName,
  schoolAddress,
  schoolContact,
  schoolEmail,
  logoUrl,
  schoolLogoKey,
  schoolMotto,
  schoolWebsiteUrl,
  feeBuckets,
  gradeLevels,
  termScopeLine,
  totalRowLabel,
}: FeeStructurePDFPreviewProps) => {
  const model = useMemo(
    () =>
      buildFeeLetterModel({
        formData,
        schoolName,
        schoolAddress,
        schoolContact,
        schoolEmail,
        logoUrl,
        schoolLogoKey,
        schoolMotto,
        schoolWebsiteUrl,
        feeBuckets,
        gradeLevels,
        termScopeLine,
        totalRowLabel,
      }),
    [
      formData,
      schoolName,
      schoolAddress,
      schoolContact,
      schoolEmail,
      logoUrl,
      schoolLogoKey,
      schoolMotto,
      schoolWebsiteUrl,
      feeBuckets,
      gradeLevels,
      termScopeLine,
      totalRowLabel,
    ],
  )

  return <FeeLetterDocument model={model} templateId={templateId} />
}
