'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowRight, BookOpen, Calendar, Check, FileText, Link2, Sparkles } from 'lucide-react'
import { useAcademicYears } from '@/lib/hooks/useAcademicYears'
import { useQuery } from '@tanstack/react-query'
import { ViewAcademicYearsDrawer } from '@/app/school/[subdomain]/(pages)/dashboard/components/ViewAcademicYearsDrawer'
import { formatAcademicYearDisplay } from '../lib/feePlanStats'

interface FeeStructureEmptyStateProps {
    onCreateNew: () => void
    onGuidedSetup?: () => void
}

export const FeeStructureEmptyState = ({ onCreateNew, onGuidedSetup }: FeeStructureEmptyStateProps) => {
    const { academicYears, loading: academicYearsLoading } = useAcademicYears()
    
    // Check if any academic year has terms
    const { data: hasTerms, isLoading: checkingTerms } = useQuery({
        queryKey: ['checkTermsExistence', academicYears.map(ay => ay.id).join(',')],
        queryFn: async () => {
            if (academicYears.length === 0) return false
            
            // Check each academic year for terms
            const termChecks = await Promise.all(
                academicYears.map(async (year) => {
                    try {
                        const response = await fetch('/api/graphql', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                query: `
                                    query GetTermsForAcademicYear($academicYearId: ID!) {
                                        termsByAcademicYear(academicYearId: $academicYearId) {
                                            id
                                        }
                                    }
                                `,
                                variables: { academicYearId: year.id }
                            }),
                        })

                        if (!response.ok) return false
                        const result = await response.json()
                        return result.data?.termsByAcademicYear?.length > 0
                    } catch {
                        return false
                    }
                })
            )
            
            return termChecks.some(hasTerms => hasTerms)
        },
        enabled: academicYears.length > 0 && !academicYearsLoading
    })

    const hasAcademicYears = academicYears.length > 0
    const hasAnyTerms = hasTerms === true
    const isLoading = academicYearsLoading || checkingTerms

    // If no academic years or terms, show prerequisite message
    if (!isLoading && (!hasAcademicYears || !hasAnyTerms)) {
        return (
            <Card className="border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50 via-white to-amber-50/50 overflow-hidden">
                <div className="relative p-12 text-center">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/50 rounded-full blur-3xl -z-10" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-100/50 rounded-full blur-3xl -z-10" />

                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 mb-6 relative">
                        <AlertCircle className="h-10 w-10 text-amber-600" />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-amber-900 mb-3">
                        Setup Required
                    </h3>
                    <p className="text-slate-700 max-w-md mx-auto mb-6 leading-relaxed">
                        Before creating fee plans, you need to set up your academic calendar.
                    </p>

                    {/* Prerequisites List */}
                    <div className="max-w-md mx-auto mb-8 space-y-3 text-left">
                        {!hasAcademicYears && (
                            <div className="flex items-start gap-3 p-3 bg-white/80 rounded-lg border border-amber-200">
                                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                    <Calendar className="h-4 w-4 text-amber-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-sm text-slate-900 mb-1">Create Academic Year</h4>
                                    <p className="text-xs text-slate-600">Set up your academic year with start and end dates</p>
                                </div>
                            </div>
                        )}
                        
                        {hasAcademicYears && !hasAnyTerms && (
                            <div className="flex items-start gap-3 p-3 bg-white/80 rounded-lg border border-amber-200">
                                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                    <BookOpen className="h-4 w-4 text-amber-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-sm text-slate-900 mb-1">Create Terms</h4>
                                    <p className="text-xs text-slate-600">Add terms (e.g., Term 1, Term 2) to your academic year</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <ViewAcademicYearsDrawer
                            trigger={
                                <Button
                                    size="lg"
                                    className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                                >
                                    <Calendar className="h-5 w-5 mr-2" />
                                    {!hasAcademicYears ? 'Create Academic Year' : 'Manage Academic Years'}
                                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                                </Button>
                            }
                            onAcademicYearCreated={() => {
                                // Refresh will happen automatically via query invalidation
                                window.location.reload()
                            }}
                        />
                    </div>

                    {/* Info */}
                    <p className="text-xs text-slate-500 mt-6">
                        Once you&apos;ve created an academic year and at least one term, you&apos;ll be able to create fee plans.
                    </p>
                </div>
            </Card>
        )
    }

    // Empty state when the school is ready to create its first fee plan.
    const activeYear =
        academicYears.find((year) => year.isActive) ?? academicYears[0]
    const yearLabel = activeYear
        ? formatAcademicYearDisplay(activeYear.name)
        : "Academic year"
    const termCount = activeYear?.terms?.length ?? 0

    const steps = [
        {
            title: "Set the fee plan",
            description:
                "Choose the grades and the total each student pays in one term.",
        },
        {
            title: "Split into fee lines",
            description:
                "Break the total into tuition, lunch, transport and any other charges.",
        },
        {
            title: "Preview and save",
            description:
                "Check the term totals and the fee letter, then save the plan.",
        },
    ]

    return (
        <Card className="overflow-hidden border border-primary/15 bg-white shadow-sm">
            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="p-6 sm:p-8">
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary/[0.07] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                        <Sparkles className="h-3 w-3" />
                        Fee plans
                    </span>
                    <h3 className="mt-3 font-display text-2xl font-normal tracking-tight text-primary sm:text-3xl">
                        Set this year&apos;s fees
                    </h3>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
                        Three quick steps: set the term total, split it into fee
                        lines, then preview the letter and save.
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-800">
                            <Check className="h-3 w-3" />
                            {yearLabel}
                        </span>
                        {termCount > 0 ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-800">
                                <Check className="h-3 w-3" />
                                {termCount} term{termCount === 1 ? "" : "s"}
                            </span>
                        ) : null}
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                            No fee plans yet
                        </span>
                    </div>

                    <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Button
                            onClick={onGuidedSetup ?? onCreateNew}
                            size="lg"
                            className="h-10 bg-primary text-white shadow-none transition-colors hover:bg-primary-dark"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Start fee setup
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>

                    <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
                        You can change grades, terms and fee lines at any time before
                        you start billing.
                    </p>
                </div>

                <div className="border-t border-primary/10 bg-[#f7faf8] p-6 sm:p-8 lg:border-l lg:border-t-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        How it works
                    </p>
                    <ol className="mt-4 space-y-4">
                        {steps.map((step, index) => (
                            <li key={step.title} className="flex gap-3">
                                <span
                                    className={
                                        index === 0
                                            ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white"
                                            : "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-400"
                                    }
                                >
                                    {index + 1}
                                </span>
                                <div className="min-w-0">
                                    <p
                                        className={
                                            index === 0
                                                ? "flex flex-wrap items-center gap-1.5 text-sm font-semibold text-slate-900"
                                                : "text-sm font-semibold text-slate-600"
                                        }
                                    >
                                        {step.title}
                                        {index === 0 ? (
                                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">
                                                Start here
                                            </span>
                                        ) : null}
                                    </p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                                        {step.description}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ol>
                    <div className="mt-5 flex items-center gap-2 border-t border-slate-200/70 pt-4 text-[11px] text-slate-500">
                        <Link2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                        After saving, link the plan to classes and create student
                        invoices for the term.
                    </div>
                </div>
            </div>
        </Card>
    )
}
