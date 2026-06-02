"use client"

import { RefreshCw, Download, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FeeAssignmentsDataTable } from "./FeeAssignmentsDataTable"
import { useFeeAssignments } from "../hooks/useFeeAssignments"

export const FeeAssignmentsView = () => {
  const { data, loading, error, refetch } = useFeeAssignments()

  const handleRefresh = () => {
    refetch()
  }

  const handleExport = () => {
    if (!data) return
    
    // Convert data to CSV or Excel format
    console.log('Exporting fee assignments data:', data)
    // TODO: Implement actual export logic
  }

  return (
    <div className="space-y-6">
      <ViewHeader 
        onRefresh={handleRefresh} 
        onExport={handleExport}
        isLoading={loading}
      />

      {error && <ErrorAlert error={error} />}

      <FeeAssignmentsDataTable 
        data={data} 
        isLoading={loading} 
      />

      {data && <AssignmentsSummary data={data} />}
    </div>
  )
}

interface ViewHeaderProps {
  onRefresh: () => void
  onExport: () => void
  isLoading: boolean
}

const ViewHeader = ({ onRefresh, onExport, isLoading }: ViewHeaderProps) => (
  <div className="flex flex-wrap justify-between items-start gap-4">
    <div>
      <h2 className="text-lg font-semibold text-slate-900">
        Who is assigned
      </h2>
      <p className="text-sm text-slate-600 mt-1">
        See which fee plans are linked to students and verify wiring before
        billing.
      </p>
    </div>
    
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onExport}
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
      
      <Button
        variant="outline"
        size="sm"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filter
      </Button>
    </div>
  </div>
)

const ErrorAlert = ({ error }: { error: string }) => (
  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
    <h3 className="font-semibold text-red-800 mb-1">
      Could not load assignments
    </h3>
    <p className="text-sm text-red-700">{error}</p>
  </div>
)

interface AssignmentsSummaryProps {
  data: any
}

const AssignmentsSummary = ({ data }: AssignmentsSummaryProps) => {
  if (!data || !data.feeAssignments) return null

  const activeAssignments = data.feeAssignments.filter(
    (a: any) => a.feeAssignment?.isActive
  ).length

  const totalFeeItems = data.feeAssignments.reduce(
    (sum: number, group: any) => {
      if (!group.studentAssignments) return sum
      return sum + group.studentAssignments.reduce(
        (itemSum: number, assignment: any) => {
          return itemSum + (assignment.feeItems?.length || 0)
        },
        0
      )
    },
    0
  )

  return (
    <div className="grid grid-cols-4 gap-4">
      <SummaryCard
        label="Total Assignments"
        value={data.totalFeeAssignments || 0}
        color="blue"
      />
      <SummaryCard
        label="Active Assignments"
        value={activeAssignments || 0}
        color="green"
      />
      <SummaryCard
        label="Students with Fees"
        value={data.totalStudentsWithFees || 0}
        color="purple"
      />
      <SummaryCard
        label="Total Fee Items"
        value={totalFeeItems || 0}
        color="orange"
      />
    </div>
  )
}

interface SummaryCardProps {
  label: string
  value: number
  color: 'blue' | 'green' | 'purple' | 'orange'
}

const SummaryCard = ({ label, value, color }: SummaryCardProps) => {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    purple: 'border-purple-200 bg-purple-50',
    orange: 'border-orange-200 bg-orange-50',
  }

  const textColorClasses = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    purple: 'text-purple-700',
    orange: 'text-orange-700',
  }

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <p className="text-xs text-slate-600 mb-1">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${textColorClasses[color]}`}>
        {value}
      </p>
    </div>
  )
}

