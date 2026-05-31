'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import {
  useEnsureSelectedTerm,
  type SelectedTerm,
} from '@/lib/hooks/useEnsureSelectedTerm'

export type Term = SelectedTerm

interface TermContextType {
  selectedTerm: Term | null
  setSelectedTerm: (term: Term | null) => void
  /** Terms for the current school year (from API or academic-year list). */
  availableTerms: Term[]
  termsLoading: boolean
  hasTerms: boolean
}

const TermContext = createContext<TermContextType | undefined>(undefined)

export function TermProvider({ children }: { children: ReactNode }) {
  const [selectedTerm, setSelectedTermState] = useState<Term | null>(null)
  const {
    availableTerms,
    termsLoading,
    hasTerms,
    setSelectedTerm,
  } = useEnsureSelectedTerm(selectedTerm, setSelectedTermState)

  return (
    <TermContext.Provider
      value={{
        selectedTerm,
        setSelectedTerm,
        availableTerms,
        termsLoading,
        hasTerms,
      }}
    >
      {children}
    </TermContext.Provider>
  )
}

export function useTerm() {
  const context = useContext(TermContext)
  if (context === undefined) {
    throw new Error('useTerm must be used within a TermProvider')
  }
  return context
}
