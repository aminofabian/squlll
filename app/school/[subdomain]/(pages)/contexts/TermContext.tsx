'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface Term {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  academicYear: {
    name: string
  }
}

interface TermContextType {
  selectedTerm: Term | null
  setSelectedTerm: (term: Term | null) => void
}

const TermContext = createContext<TermContextType | undefined>(undefined)

export function TermProvider({ children }: { children: ReactNode }) {
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null)

  return (
    <TermContext.Provider value={{ selectedTerm, setSelectedTerm }}>
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
