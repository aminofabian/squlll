'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { FeeStructure } from '../../types'
import { ProcessedFeeStructure } from './types'
import { Loader2, Plus, RefreshCw, Grid3x3, List } from 'lucide-react'
import { FeeStructureCard } from '../FeeStructureCard'
import { FeeStructureEmptyState } from '../FeeStructureEmptyState'

interface FeeStructuresTabProps {
  isLoading: boolean
  error: string | null
  structures: any[] | null
  graphQLStructures: ProcessedFeeStructure[]
  fallbackFeeStructures: FeeStructure[]
  onEdit: (feeStructure: FeeStructure) => void
  onAssignToGrade: (feeStructureId: string, name: string, academicYear?: string) => void
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Show loading if actively loading OR if we haven't fetched yet
  if (isLoading || (!hasFetched && !error && graphQLStructures.length === 0)) {
    return (
      <div className="flex flex-col justify-center items-center p-16 bg-gradient-to-br from-white to-primary/5 rounded-2xl border-2 border-primary/10">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
        </div>
        <span className="mt-6 text-base font-medium text-slate-700">Loading fee structures...</span>
        <span className="mt-2 text-sm text-slate-500">Please wait while we fetch your data</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 border-2 border-red-200 bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-red-200 flex items-center justify-center flex-shrink-0">
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
      <div className="flex flex-col justify-center items-center p-16 bg-gradient-to-br from-white to-primary/5 rounded-2xl border-2 border-primary/10">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <span className="text-base font-medium text-slate-700">Processing fee structures...</span>
      </div>
    )
  }

  // Show real data if available
  if (graphQLStructures && graphQLStructures.length > 0) {
    return (
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-primary">Fee Structures</h2>
            <p className="text-sm text-slate-600 mt-1">
              {graphQLStructures.length} structure{graphQLStructures.length !== 1 ? 's' : ''} configured
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-primary hover:bg-primary-dark' : ''}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-primary hover:bg-primary-dark' : ''}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={() => fetchFeeStructures()}
              variant="outline"
              size="sm"
              className="border-primary/30 text-primary hover:bg-primary/5"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <Button
              onClick={onCreateNew}
              className="bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Structure
            </Button>
          </div>
        </div>

        {/* Fee Structure Cards */}
        <div className={viewMode === 'grid'
          ? "grid grid-cols-1 lg:grid-cols-2 gap-6"
          : "space-y-4"
        }>
          {graphQLStructures.map((structure) => {
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
                onAssignToGrade={() => {
                  onAssignToGrade(
                    structure.structureId,
                    structure.structureName,
                    structure.academicYear
                  )
                }}
                onGenerateInvoices={() => {
                  onGenerateInvoices(structure.structureId, structure.termName)
                }}
                assignedGrades={assignedGrades}
                totalStudents={totalStudents}
              />
            )
          })}
        </div>
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
