import { FeeStructureForm, Grade, TermFeeStructureForm, FeeBucketForm, FeeComponentForm } from '../../types'

// Fee templates used across components
export interface FeeTemplate {
  name: string
  amount: string
  icon: React.FC<{ className?: string }>
  description: string
}

// Structure for fee categories
export interface FeeCategory {
  id: string
  name: string
  icon: React.FC<{ className?: string }>
}

// Types for API data
export interface FeeBucket {
  id: string
  name: string
  description: string
  isActive: boolean
  createdAt?: string
}

export interface AcademicYear {
  id: string
  name: string
  isActive: boolean
  terms: Term[]
}

export interface Term {
  id: string
  name: string
}

// Step validation error
export interface ValidationError {
  message: string
  anchorId?: string
}
