'use client'

import type { RefObject } from 'react'
import { FeeStructurePDFPreview } from '../FeeStructurePDFPreview'
import type { FeeLetterTemplateId } from '../../lib/feeLetter/types'
import type { FeeStructureForm } from '../../types'

interface FeeStructureLetterPreviewProps {
    formData: FeeStructureForm
    schoolName?: string
    logoUrl?: string | null
    schoolLogoKey?: string
    schoolMotto?: string
    schoolWebsiteUrl?: string
    feeBuckets: Array<{ id: string; name: string; description?: string }>
    gradeLevels: Array<{ id: string; gradeLevel?: { name: string } }>
    termScopeLine?: string
    totalRowLabel?: string
    templateId?: FeeLetterTemplateId
    containerRef?: RefObject<HTMLDivElement | null>
}

/** Renders the printable fee-structure letter only */
export function FeeStructureLetterPreview({
    formData,
    schoolName,
    logoUrl,
    schoolLogoKey,
    schoolMotto,
    schoolWebsiteUrl,
    feeBuckets,
    gradeLevels,
    termScopeLine,
    totalRowLabel,
    templateId,
    containerRef,
}: FeeStructureLetterPreviewProps) {
    return (
        <div ref={containerRef} data-pdf-content>
            <FeeStructurePDFPreview
                formData={formData}
                schoolName={schoolName}
                logoUrl={logoUrl}
                schoolLogoKey={schoolLogoKey}
                schoolMotto={schoolMotto}
                schoolWebsiteUrl={schoolWebsiteUrl}
                feeBuckets={feeBuckets}
                gradeLevels={gradeLevels}
                termScopeLine={termScopeLine}
                totalRowLabel={totalRowLabel}
                templateId={templateId}
            />
        </div>
    )
}
