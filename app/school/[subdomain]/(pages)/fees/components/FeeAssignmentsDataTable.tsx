"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, FileText, Users, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from '../utils'
import { 
  FeeAssignmentData, 
  FeeAssignmentGroup, 
  StudentAssignment, 
  FeeItemAssignment 
} from '../types'

interface FeeAssignmentsDataTableProps {
  data: FeeAssignmentData | null
  isLoading?: boolean
}

export const FeeAssignmentsDataTable = ({ 
  data, 
  isLoading = false 
}: FeeAssignmentsDataTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (assignmentId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(assignmentId)) {
        newSet.delete(assignmentId)
      } else {
        newSet.add(assignmentId)
      }
      return newSet
    })
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (!data || !data.feeAssignments || data.feeAssignments.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="border-2 border-primary/20 overflow-hidden">
      <TableHeaderComponent data={data} />
      <div className="overflow-x-auto">
        <Table>
          <TableColumnHeaders />
          <TableBody>
            {data.feeAssignments.map((group) => (
              <AssignmentRow
                key={group.feeAssignment.id}
                group={group}
                isExpanded={expandedRows.has(group.feeAssignment.id)}
                onToggle={() => toggleRow(group.feeAssignment.id)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

const TableHeaderComponent = ({ data }: { data: FeeAssignmentData | null }) => {
  if (!data) return null
  
  return (
    <div className="p-4 border-b-2 border-primary/20 bg-primary/5">
      <div className="flex justify-between items-center">
        <h3 className="font-mono font-bold">Fee Structure Assignments</h3>
        <div className="flex gap-4 text-sm font-mono text-slate-600">
          <span>{data.totalFeeAssignments || 0} assignments</span>
          <span>•</span>
          <span>{data.totalStudentsWithFees || 0} students</span>
        </div>
      </div>
    </div>
  )
}

const TableColumnHeaders = () => (
  <TableHeader>
    <TableRow className="border-primary/20">
      <TableHead className="w-12 font-mono"></TableHead>
      <TableHead className="font-mono">Fee Structure</TableHead>
      <TableHead className="font-mono">Description</TableHead>
      <TableHead className="font-mono">Students Assigned</TableHead>
      <TableHead className="font-mono">Status</TableHead>
      <TableHead className="font-mono">Assigned By</TableHead>
      <TableHead className="font-mono">Created Date</TableHead>
    </TableRow>
  </TableHeader>
)

interface AssignmentRowProps {
  group: FeeAssignmentGroup
  isExpanded: boolean
  onToggle: () => void
}

const AssignmentRow = ({ group, isExpanded, onToggle }: AssignmentRowProps) => {
  const { feeAssignment, studentAssignments, totalStudents } = group
  
  return (
    <>
      <TableRow className="border-primary/20 hover:bg-primary/5">
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            disabled={totalStudents === 0}
            className="h-8 w-8 p-0"
          >
            {totalStudents > 0 && (
              isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            )}
          </Button>
        </TableCell>
        <TableCell className="font-mono font-medium">
          {feeAssignment.feeStructure.name}
        </TableCell>
        <TableCell className="font-mono text-sm text-slate-600">
          {feeAssignment.description}
        </TableCell>
        <TableCell className="font-mono">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>{totalStudents}</span>
          </div>
        </TableCell>
        <TableCell>
          <StatusBadge isActive={feeAssignment.isActive} />
        </TableCell>
        <TableCell className="font-mono text-sm">
          {feeAssignment.assignedByUser.name}
        </TableCell>
        <TableCell className="font-mono text-sm">
          {formatDate(feeAssignment.createdAt)}
        </TableCell>
      </TableRow>
      
      {isExpanded && studentAssignments.length > 0 && (
        <TableRow>
          <TableCell colSpan={7} className="bg-slate-50/50 p-0">
            <StudentAssignmentsTable assignments={studentAssignments} />
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

const StudentAssignmentsTable = ({ 
  assignments 
}: { 
  assignments: StudentAssignment[] 
}) => (
  <div className="p-4">
    <h4 className="font-mono font-semibold text-sm mb-3 text-slate-700">
      Assigned Students ({assignments.length})
    </h4>
    <div className="border border-primary/20 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-primary/20 bg-primary/5">
            <TableHead className="font-mono text-xs">Student Name</TableHead>
            <TableHead className="font-mono text-xs">Grade</TableHead>
            <TableHead className="font-mono text-xs">Fee Items</TableHead>
            <TableHead className="font-mono text-xs">Total Amount</TableHead>
            <TableHead className="font-mono text-xs">Status</TableHead>
            <TableHead className="font-mono text-xs">Assigned Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment) => (
            <StudentRow key={assignment.id} assignment={assignment} />
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
)

const StudentRow = ({ assignment }: { assignment: StudentAssignment }) => {
  const totalAmount = calculateTotalAmount(assignment.feeItems)
  const mandatoryCount = assignment.feeItems.filter(item => item.isMandatory).length
  const optionalCount = assignment.feeItems.length - mandatoryCount

  return (
    <TableRow className="border-primary/20">
      <TableCell className="font-mono text-sm">
        {assignment.student.user.name}
      </TableCell>
      <TableCell className="font-mono text-sm">
        {assignment.student.grade.gradeLevel.name}
      </TableCell>
      <TableCell className="font-mono text-xs">
        <FeeItemsSummary 
          mandatoryCount={mandatoryCount} 
          optionalCount={optionalCount}
        />
      </TableCell>
      <TableCell className="font-mono font-medium">
        {formatCurrency(totalAmount)}
      </TableCell>
      <TableCell>
        <StatusBadge isActive={assignment.isActive} />
      </TableCell>
      <TableCell className="font-mono text-xs text-slate-600">
        {formatDate(assignment.createdAt)}
      </TableCell>
    </TableRow>
  )
}

const FeeItemsSummary = ({ 
  mandatoryCount, 
  optionalCount 
}: { 
  mandatoryCount: number
  optionalCount: number 
}) => (
  <div className="flex gap-2">
    {mandatoryCount > 0 && (
      <Badge 
        variant="outline" 
        className="text-xs font-mono bg-blue-50 text-blue-700 border-blue-200"
      >
        <CheckCircle2 className="h-3 w-3 mr-1" />
        {mandatoryCount} mandatory
      </Badge>
    )}
    {optionalCount > 0 && (
      <Badge 
        variant="outline" 
        className="text-xs font-mono bg-slate-50 text-slate-700 border-slate-200"
      >
        {optionalCount} optional
      </Badge>
    )}
  </div>
)

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <Badge 
    variant="outline" 
    className={`text-xs font-mono ${
      isActive 
        ? 'bg-green-50 text-green-700 border-green-200' 
        : 'bg-red-50 text-red-700 border-red-200'
    }`}
  >
    {isActive ? (
      <>
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Active
      </>
    ) : (
      <>
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </>
    )}
  </Badge>
)

const LoadingState = () => (
  <div className="border-2 border-primary/20 p-12 text-center">
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-primary/10 rounded w-1/3 mx-auto"></div>
      <div className="h-4 bg-primary/10 rounded w-1/4 mx-auto"></div>
    </div>
    <p className="mt-4 text-sm font-mono text-slate-600">
      Loading fee assignments...
    </p>
  </div>
)

const EmptyState = () => (
  <div className="border-2 border-primary/20 text-center py-12">
    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
    <h3 className="text-lg font-mono font-medium text-slate-600 mb-2">
      No Fee Assignments Found
    </h3>
    <p className="text-sm text-slate-500 font-mono">
      No fee structures have been assigned to students yet
    </p>
  </div>
)

// Utility functions
const calculateTotalAmount = (feeItems: FeeItemAssignment[]): number => {
  return feeItems.reduce((sum, item) => sum + item.amount, 0)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

