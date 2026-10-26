import { FeeStructure, Grade, TermFeeStructure } from '../../types'

// Main props for the FeeStructureManager component
export interface FeeStructureManagerProps {
  onCreateNew: () => void
  onEdit: (feeStructure: FeeStructure) => void
  onGenerateInvoices: (feeStructureId: string, term: string) => void
  onAssignToGrade: (feeStructureId: string, name: string, academicYear?: string, academicYearId?: string, termId?: string) => void
  onDelete?: (feeStructureId: string) => void
}

// Fee structure item update state
export interface FeeItemToUpdate {
  id: string
  amount: number
  isMandatory: boolean
  feeBucket?: {
    id: string
    name: string
  }
  feeStructure?: {
    id: string
    name: string
    academicYear?: { name: string }
    term?: { name: string }
  }
}

// Fee structure assignment state
export interface FeeStructureToAssign {
  id: string
  name: string
  academicYear?: string
  academicYearId?: string
  termId?: string
  isActive?: boolean
  /** Grades already linked to this plan — shown separately in the drawer. */
  linkedGrades?: Array<{ id: string; name: string }>
  /** Assignment batches already linked to this plan, for unlinking. */
  linkedAssignments?: Array<{
    id: string
    gradeIds: string[]
    studentCount: number
    hasInvoice?: boolean
    description?: string
    createdAt?: string
  }>
  /** Grades already on another plan for overlapping terms. */
  conflictingGrades?: Array<{
    gradeId: string
    gradeName: string
    planNames: string[]
    termNames: string[]
  }>
  /** Term labels for the current plan, shown in the drawer summary. */
  planTermNames?: string[]
  /** Grade levels configured on the plan — used to scope the drawer list. */
  gradeLevelIds?: string[]
}

// Structure for delete confirmation
export interface StructureToDelete {
  id: string
  name: string
}

// Processed GraphQL structure for display
export interface ProcessedFeeStructure {
  structureId: string
  structureName: string
  academicYear: string
  academicYearId: string
  termName: string
  termId: string
  terms: Array<{ id: string; name: string; endDate?: string }>
  gradeLevels: Array<{
    id: string
    shortName: string | null
    gradeLevel?: { id: string; name: string }
    name?: string
  }>
  buckets: Array<{
    id: string;
    name: string;
    totalAmount: number;
    isOptional: boolean;
    firstItemId?: string;
    feeBucketId: string;
  }>
  termFeesMap?: Record<string, Array<{
    id: string;
    name: string;
    totalAmount: number;
    isOptional: boolean;
    firstItemId?: string;
    feeBucketId: string;
  }>>
  allStructures?: any[]
  isActive: boolean
  isExpired?: boolean
  validUntil?: string | null
  academicYearEndDate?: string | null
  createdAt: string
  updatedAt: string
}

