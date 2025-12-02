'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus, Sparkles, ArrowRight, Zap, Calendar, BookOpen, AlertCircle } from 'lucide-react'
import { useAcademicYears } from '@/lib/hooks/useAcademicYears'
import { useQuery } from '@tanstack/react-query'
import { ViewAcademicYearsDrawer } from '@/app/school/[subdomain]/(pages)/dashboard/components/ViewAcademicYearsDrawer'

interface FeeStructureEmptyStateProps {
    onCreateNew: () => void
    onViewSample?: () => void
}

export const FeeStructureEmptyState = ({ onCreateNew, onViewSample }: FeeStructureEmptyStateProps) => {
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
                        Before creating fee structures, you need to set up your academic calendar.
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
                        Once you've created an academic year and at least one term, you'll be able to create fee structures.
                    </p>
                </div>
            </Card>
        )
    }

    // Original empty state if prerequisites are met
    return (
        <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-white via-primary/5 to-primary/10 overflow-hidden">
            <div className="relative p-12 text-center">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-light/5 rounded-full blur-3xl -z-10" />

                {/* Icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 mb-6 relative">
                    <FileText className="h-10 w-10 text-primary" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-primary mb-3">
                    No Fee Structures Yet
                </h3>
                <p className="text-slate-600 max-w-md mx-auto mb-8 leading-relaxed">
                    Get started by creating your first fee structure. Define fees for different grades,
                    terms, and boarding types to streamline your fee management.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        onClick={onCreateNew}
                        size="lg"
                        className="bg-primary hover:bg-primary-dark text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                    >
                        <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                        Create Your First Fee Structure
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>

                    {onViewSample && (
                        <Button
                            onClick={onViewSample}
                            variant="outline"
                            size="lg"
                            className="border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
                        >
                            <Zap className="h-4 w-4 mr-2" />
                            View Sample Structure
                        </Button>
                    )}
                </div>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-3xl mx-auto">
                    <div className="p-4 bg-white shadow-sm border-2 border-primary/10">
                        <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mb-3 mx-auto">
                            <span className="text-xl">📝</span>
                        </div>
                        <h4 className="font-semibold text-sm text-slate-900 mb-1">Easy Setup</h4>
                        <p className="text-xs text-primary/70">Simple wizard to create fee structures in minutes</p>
                    </div>

                    <div className="p-4 bg-white shadow-sm border-2 border-primary/10">
                        <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mb-3 mx-auto">
                            <span className="text-xl">🎯</span>
                        </div>
                        <h4 className="font-semibold text-sm text-slate-900 mb-1">Flexible</h4>
                        <p className="text-xs text-primary/70">Customize fees for different grades and terms</p>
                    </div>

                    <div className="p-4 bg-white shadow-sm border-2 border-primary/10">
                        <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mb-3 mx-auto">
                            <span className="text-xl">⚡</span>
                        </div>
                        <h4 className="font-semibold text-sm text-slate-900 mb-1">Automated</h4>
                        <p className="text-xs text-primary/70">Generate invoices automatically from structures</p>
                    </div>
                </div>
            </div>
        </Card>
    )
}
