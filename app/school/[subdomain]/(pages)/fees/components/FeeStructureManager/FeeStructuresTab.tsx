'use client'

import { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FeeStructure } from '../../types'
import { ProcessedFeeStructure } from './types'
import { Loader2, Plus, RefreshCw, Grid3x3, List, Search, Filter, X } from 'lucide-react'
import { FeeStructureCard } from '../FeeStructureCard'
import { FeeStructureEmptyState } from '../FeeStructureEmptyState'
import { cn } from '@/lib/utils'
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
  getAssignedGrades: (feeStructureId: string) => any[]
  getTotalStudents: (feeStructureId: string) => number
  hasFetched?: boolean
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
  getAssignedGrades,
  getTotalStudents,
  hasFetched = false
}: FeeStructuresTabProps) => {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
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
    return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-primary/5 via-primary/3 to-transparent p-4 lg:p-6 border-2 border-primary/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1 truncate">Fee Structures</h2>
              <p className="text-sm text-slate-600">
                {filteredStructures.length} of {graphQLStructures.length} structure{graphQLStructures.length !== 1 ? 's' : ''} 
                {filteredStructures.length !== graphQLStructures.length && ' (filtered)'}
              </p>
            </div>

            <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 bg-white/80 backdrop-blur-sm border-2 border-primary/10 shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "h-8 px-2 lg:px-3 transition-all",
                    viewMode === 'grid' 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "h-8 px-2 lg:px-3 transition-all",
                    viewMode === 'list' 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={() => fetchFeeStructures()}
                variant="outline"
                size="sm"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all text-xs lg:text-sm"
              >
                <RefreshCw className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1.5 lg:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>

              <Button
                onClick={onCreateNew}
                disabled={!canCreateFeeStructure}
                className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-300 text-xs lg:text-sm px-3 lg:px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                title={!canCreateFeeStructure ? 'Please create an academic year and terms first' : 'Create new fee structure'}
              >
                <Plus className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1.5 lg:mr-2" />
                <span className="hidden sm:inline">Create Structure</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white border-2 border-primary/10 p-3 lg:p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
            {/* Search */}
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
              <Input
                type="text"
                placeholder="Search by name or academic year..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-10 border-slate-300 focus:border-primary focus:ring-primary focus-visible:ring-primary bg-white w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors z-10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter className="h-4 w-4 text-slate-500 flex-shrink-0" />
              <div className="flex gap-1.5 lg:gap-2 flex-wrap">
                {(['all', 'active', 'inactive'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "capitalize transition-all text-xs",
                      statusFilter === status 
                        ? 'bg-primary text-white' 
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>

            {/* Academic Year Filter */}
            {academicYears.length > 0 && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <select
                  value={academicYearFilter}
                  onChange={(e) => setAcademicYearFilter(e.target.value)}
                  className="h-10 px-3 border-2 border-primary/10 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all min-w-[120px]"
                >
                  <option value="all">All Years</option>
                  {academicYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Fee Structure Cards */}
        {filteredStructures.length > 0 ? (
          <div className={cn(
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6"
              : "space-y-4"
          )}>
            {filteredStructures.map((structure) => {
              const assignedGrades = getAssignedGrades(structure.structureId)
              const totalStudents = getTotalStudents(structure.structureId)

              return (
                <FeeStructureCard
                  key={structure.structureId}
                  structure={structure}
                  onEdit={() => {
                    onEdit({
                      id: structure.structureId,
                      name: structure.structureName,
                      isActive: structure.isActive,
                      academicYear: structure.academicYear,
                      grade: '',
                      boardingType: 'day',
                      createdDate: structure.createdAt || '',
                      lastModified: structure.updatedAt || '',
                      termStructures: []
                    })
                  }}
                  onDelete={() => {
                    if (onDelete) {
                      onDelete(structure.structureId, structure.structureName)
                    }
                  }}
                  onAssignToGrade={onAssignToGrade}
                  onGenerateInvoices={() => {
                    onGenerateInvoices(structure.structureId, structure.termName)
                  }}
                  assignedGrades={assignedGrades}
                  totalStudents={totalStudents}
                />
              )
            })}
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-primary/20 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No structures found</h3>
              <p className="text-sm text-slate-600 mb-4">
                Try adjusting your search or filter criteria
              </p>
              {(searchQuery || statusFilter !== 'all' || academicYearFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                    setAcademicYearFilter('all')
                  }}
                  className="border-slate-300 text-slate-700"
                >
                  <X className="h-4 w-4 mr-2" />
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
      onViewSample={() => {
        // Could implement a sample structure view
        console.log('Show sample structure')
      }}
    />
  )
}
