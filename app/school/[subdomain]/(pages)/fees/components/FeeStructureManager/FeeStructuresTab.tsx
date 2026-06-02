'use client'

import { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { FeeStructure } from '../../types'
import { ProcessedFeeStructure } from './types'
import { Loader2, RefreshCw, Search, X } from 'lucide-react'
import { FeePlansTable } from './FeePlansTable'
import { FeePlansListNextSteps } from './FeePlansListNextSteps'
import { FeePlansListAlerts } from './FeePlansListAlerts'
import { FeePlansToolbar } from './FeePlansToolbar'
import { FeePlanDetailView } from './FeePlanDetailView'
import { FeePlanDetailSkeleton } from './FeePlanDetailSkeleton'
import { FeeStructureEmptyState } from '../FeeStructureEmptyState'
import { findFeePlanBySlug } from '../../lib/feePlanSlug'
import { computeFeePlansListStats } from '../../lib/feePlanStats'
import type { FeePlanCollectionStats } from '../../lib/feePlanCollection'
import type { LinkedClassEntry } from '../../lib/feePlanLinkage'
import type { FeeAssignmentGroup } from '../../types'
import type { SchoolGradeRef } from '../../lib/feePlanYearLinkage'
import { useAcademicYears } from '@/lib/hooks/useAcademicYears'
import { useQuery } from '@tanstack/react-query'

interface FeeStructuresTabProps {
  isLoading: boolean
  error: string | null
  structures: any[] | null
  graphQLStructures: ProcessedFeeStructure[]
  fallbackFeeStructures: FeeStructure[]
  onEdit: (feeStructure: FeeStructure) => void
  onAssignToGrade: (feeStructureId: string, name: string, academicYear?: string, academicYearId?: string, termId?: string) => void
  onGenerateInvoices: (feeStructureId: string, term: string) => void
  onDelete?: (id: string, name: string) => void
  onUpdateFeeItem: (itemId: string, amount: number, isMandatory: boolean, bucketName: string, feeStructureName: string, bucketId?: string) => void
  onCreateNew: () => void
  fetchFeeStructures: () => Promise<any>
  getLinkedClassCount: (feeStructureId: string) => number
  getLinkedClasses: (feeStructureId: string) => LinkedClassEntry[]
  getTotalStudents: (feeStructureId: string) => number
  onGuidedSetup?: () => void
  hasFetched?: boolean
  isDeleting?: boolean
  /** From URL ?plan= — when set, show single-plan detail */
  selectedPlanSlug?: string | null
  onBackToPlanList?: () => void
  collectionByPlanId?: Map<string, FeePlanCollectionStats>
  feeAssignments?: FeeAssignmentGroup[]
  schoolGrades?: SchoolGradeRef[]
  canManage?: boolean
  canBill?: boolean
}

export const FeeStructuresTab = ({
  isLoading,
  error,
  structures,
  graphQLStructures,
  fallbackFeeStructures,
  onEdit,
  onAssignToGrade,
  onGenerateInvoices,
  onDelete,
  onUpdateFeeItem,
  onCreateNew,
  fetchFeeStructures,
  getLinkedClassCount,
  getLinkedClasses,
  getTotalStudents,
  onGuidedSetup,
  hasFetched = false,
  isDeleting = false,
  selectedPlanSlug = null,
  onBackToPlanList,
  collectionByPlanId,
  feeAssignments,
  schoolGrades = [],
  canManage = true,
  canBill = true,
}: FeeStructuresTabProps) => {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [academicYearFilter, setAcademicYearFilter] = useState<string>('all')
  
  // Check prerequisites
  const { academicYears: allAcademicYears, loading: academicYearsLoading } = useAcademicYears()
  
  const { data: hasTerms, isLoading: checkingTerms } = useQuery({
    queryKey: ['checkTermsExistence', allAcademicYears.map(ay => ay.id).join(',')],
    queryFn: async () => {
      if (allAcademicYears.length === 0) return false
      
      const termChecks = await Promise.all(
        allAcademicYears.map(async (year) => {
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
    enabled: allAcademicYears.length > 0 && !academicYearsLoading
  })

  const hasAcademicYears = allAcademicYears.length > 0
  const hasAnyTerms = hasTerms === true
  const canCreateFeeStructure = hasAcademicYears && hasAnyTerms

  // Get unique academic years for filter
  const academicYearsForFilter = useMemo(() => {
    const years = new Set<string>()
    graphQLStructures.forEach(s => {
      if (s.academicYear) years.add(s.academicYear)
    })
    return Array.from(years).sort().reverse()
  }, [graphQLStructures])

  // Filter structures
  const filteredStructures = useMemo(() => {
    return graphQLStructures.filter(structure => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        structure.structureName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        structure.academicYear.toLowerCase().includes(searchQuery.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && structure.isActive) ||
        (statusFilter === 'inactive' && !structure.isActive)

      // Academic year filter
      const matchesYear = academicYearFilter === 'all' || 
        structure.academicYear === academicYearFilter

      return matchesSearch && matchesStatus && matchesYear
    })
  }, [graphQLStructures, searchQuery, statusFilter, academicYearFilter])

  const activePlan = useMemo(
    () => findFeePlanBySlug(graphQLStructures, selectedPlanSlug),
    [graphQLStructures, selectedPlanSlug],
  )

  // Use academicYearsForFilter for the filter dropdown
  const academicYears = academicYearsForFilter

  // Show loading if actively loading OR if we haven't fetched yet
  if (isLoading || (!hasFetched && !error && graphQLStructures.length === 0)) {
    return (
      <div className="flex flex-col justify-center items-center p-16 bg-gradient-to-br from-white to-primary/5 border-2 border-primary/10">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
        </div>
        <span className="mt-6 text-base font-medium text-slate-700">Loading fee structures...</span>
        <span className="mt-2 text-sm text-primary/70">Please wait while we fetch your data</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100/50">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 bg-red-200 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="flex-1">
            <h3 className="text-red-800 font-bold text-lg mb-2">Error Loading Fee Structures</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => fetchFeeStructures()}
                className="border-2 border-red-300 text-red-700 hover:bg-red-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check if we have structures from GraphQL but they're being processed
  if (structures && structures.length > 0 && graphQLStructures.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center p-16 bg-gradient-to-br from-white to-primary/5 border-2 border-primary/10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <span className="text-base font-medium text-slate-700">Processing fee structures...</span>
      </div>
    )
  }

  // Show real data if available
  if (graphQLStructures && graphQLStructures.length > 0) {
    if (selectedPlanSlug && !activePlan && hasFetched) {
      return (
        <div className="space-y-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-sm font-medium text-slate-800">Fee plan not found</p>
          <p className="mt-1 text-xs text-slate-500">
            It may have been deleted or renamed.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={onBackToPlanList}
          >
            Back to all plans
          </Button>
        </div>
      );
    }

    if (selectedPlanSlug && !activePlan) {
      return <FeePlanDetailSkeleton />;
    }

    if (selectedPlanSlug && activePlan) {
      const linkedClasses = getLinkedClasses(activePlan.structureId)
      const students = getTotalStudents(activePlan.structureId)
      const collection = collectionByPlanId?.get(activePlan.structureId)
      return (
        <FeePlanDetailView
          structure={activePlan}
          planSlug={selectedPlanSlug!}
          linkedClasses={linkedClasses}
          totalStudents={students}
          collection={collection}
          canManage={canManage}
          canBill={canBill}
          onEdit={onEdit}
          onAssignToGrade={onAssignToGrade}
          onGenerateInvoices={onGenerateInvoices}
          onDelete={canManage ? onDelete : undefined}
          onUpdateFeeItem={onUpdateFeeItem}
          isDeleting={isDeleting}
        />
      )
    }

    const listStats = computeFeePlansListStats(
      graphQLStructures,
      getLinkedClassCount,
    )

    return (
      <div className="space-y-3">
        <FeePlansListAlerts stats={listStats} />
        <FeePlansToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          academicYearFilter={academicYearFilter}
          onAcademicYearFilterChange={setAcademicYearFilter}
          academicYears={academicYears}
          filteredCount={filteredStructures.length}
          totalCount={graphQLStructures.length}
          onRefresh={() => fetchFeeStructures()}
          onCreateNew={onCreateNew}
          canCreate={canCreateFeeStructure}
        />

        {filteredStructures.length > 0 ? (
          <>
            <FeePlansTable
              structures={filteredStructures}
              getLinkedClassCount={getLinkedClassCount}
              collectionByPlanId={collectionByPlanId}
              assignments={feeAssignments}
              schoolGrades={schoolGrades}
            />
            <FeePlansListNextSteps
              planCount={filteredStructures.length}
              hasUnbilledPlans={filteredStructures.some(
                (s) => !collectionByPlanId?.get(s.structureId)?.hasBilling,
              )}
              onCreateNew={onCreateNew}
              canCreate={canCreateFeeStructure}
            />
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto max-w-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Search className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">
                No plans match your filters
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                Try a different search or clear filters to see all plans.
              </p>
              {(searchQuery || statusFilter !== 'all' || academicYearFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 h-8 text-xs"
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                    setAcademicYearFilter('all')
                  }}
                >
                  <X className="mr-1.5 h-3 w-3" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // No data available - show beautiful empty state
  return (
    <FeeStructureEmptyState
      onCreateNew={onCreateNew}
      onGuidedSetup={onGuidedSetup}
      onViewSample={() => {
        // Could implement a sample structure view
        console.log('Show sample structure')
      }}
    />
  )
}
