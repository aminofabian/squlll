'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeeStructureLetterPreview } from '../fees/components/FeeStructureWizard/FeeStructureLetterPreview'
import { printFeeStructureLetter } from '../fees/lib/feesPrint'
import { DEFAULT_FEE_LETTER_TEMPLATE } from '../fees/lib/feeLetter/templates'
import type { LetterSchoolDetailsPayload } from '../fees/lib/feeLetter/letterSchoolDetails'
import {
  buildFeeFormFromPlan,
  fetchPublicFeePlans,
  formatPlanGradeLabel,
  planTermTotal,
  type PublicFeePlan,
} from './publicFeeStructures'

function formatKes(amount: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function SchoolHomepageFeeDownloads({
  subdomain,
  schoolName,
  eyebrow,
  headline,
  subcopy,
}: {
  subdomain: string
  schoolName: string
  eyebrow?: string
  headline?: string
  subcopy?: string
}) {
  const [plans, setPlans] = useState<PublicFeePlan[]>([])
  const [letterDetails, setLetterDetails] =
    useState<LetterSchoolDetailsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activePlanId, setActivePlanId] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await fetchPublicFeePlans(subdomain)
        if (cancelled) return
        setPlans(result.plans)
        setLetterDetails(result.letterDetails)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Unable to load fee structures')
        setPlans([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [subdomain])

  const activePlan = useMemo(
    () => plans.find((p) => p.structureId === activePlanId) || null,
    [plans, activePlanId],
  )

  const formData = useMemo(() => {
    if (!activePlan || !letterDetails) return null
    return buildFeeFormFromPlan(activePlan, letterDetails)
  }, [activePlan, letterDetails])

  useEffect(() => {
    if (!downloadingId || !formData || activePlanId !== downloadingId) return
    const timer = window.setTimeout(() => {
      printFeeStructureLetter(printRef.current)
      setDownloadingId(null)
    }, 120)
    return () => window.clearTimeout(timer)
  }, [downloadingId, formData, activePlanId])

  const handleDownload = (plan: PublicFeePlan) => {
    setDownloadingId(plan.structureId)
    setActivePlanId(plan.structureId)
  }

  if (loading) {
    return (
      <section className="border-y border-black/10 bg-white py-16 sm:py-20">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 text-sm text-slate-500 sm:px-6 lg:px-8">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading fee structures…
        </div>
      </section>
    )
  }

  if (error || plans.length === 0) {
    return null
  }

  return (
    <section
      id="fee-structure"
      className="border-y border-black/10 bg-white py-20 sm:py-24 scroll-mt-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow || 'Fees & admissions'}
          </p>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-[var(--school-ink)] sm:text-5xl">
            {headline || 'Download fee structure'}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            {subcopy ||
              `Current fee plans for ${schoolName} — same letters parents receive from the school fees office.`}
          </p>
        </div>

        <div className="mt-10 divide-y divide-black/10 border border-black/10">
          {plans.map((plan) => {
            const total = planTermTotal(plan)
            const isDownloading = downloadingId === plan.structureId
            return (
              <div
                key={plan.structureId}
                className="flex flex-col gap-4 bg-[var(--school-paper)] px-5 py-5 transition-colors hover:bg-white sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="min-w-0 flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-xl tracking-tight text-[var(--school-ink)]">
                      {plan.structureName}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {plan.academicYear}
                      {plan.terms.length > 0
                        ? ` · ${plan.terms.map((t) => t.name).join(', ')}`
                        : ''}
                    </p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                      {formatPlanGradeLabel(plan)}
                      {total > 0 ? ` · from ${formatKes(total)} / term` : ''}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => handleDownload(plan)}
                  disabled={isDownloading}
                  className="h-11 shrink-0 rounded-none bg-primary px-5 text-sm font-semibold text-white shadow-none hover:bg-primary-dark"
                >
                  {isDownloading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Download PDF
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Off-screen letter used for print / Save as PDF */}
      {formData && letterDetails && activePlan && (
        <div
          aria-hidden
          className="pointer-events-none fixed left-[-10000px] top-0 w-[210mm] opacity-0"
        >
          <FeeStructureLetterPreview
            formData={formData}
            schoolName={letterDetails.schoolDetails.name || schoolName}
            logoUrl={letterDetails.logoUrl}
            schoolMotto={letterDetails.schoolMotto}
            feeBuckets={(activePlan.buckets || []).map((b) => ({
              id: b.feeBucketId,
              name: b.name,
            }))}
            gradeLevels={
              formData.grade
                ? [{ id: formData.grade, gradeLevel: { name: formData.grade } }]
                : []
            }
            termScopeLine={
              activePlan.terms.length > 1 ? 'ALL TERMS' : undefined
            }
            templateId={DEFAULT_FEE_LETTER_TEMPLATE}
            containerRef={printRef}
          />
        </div>
      )}
    </section>
  )
}
