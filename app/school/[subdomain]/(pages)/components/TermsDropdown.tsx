'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTerm } from '../contexts/TermContext'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronDown, Loader2, Plus } from 'lucide-react'
import { useCurrentAcademicYear } from '@/lib/hooks/useAcademicYears'
import { CreateAcademicYearModal } from '../dashboard/components/CreateAcademicYearModal'
import { CreateTermModal } from '../dashboard/components/CreateTermModal'
import { toast } from 'sonner'

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

interface AcademicYear {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
}

interface TermsDropdownProps {
  className?: string
}

export function TermsDropdown({ className }: TermsDropdownProps) {
  const { selectedTerm, setSelectedTerm } = useTerm()
  const [showCreateTermModal, setShowCreateTermModal] = useState(false)
  const [newAcademicYear, setNewAcademicYear] = useState<AcademicYear | null>(null)

  // Get current academic year
  const { academicYears, loading: currentAcademicYearLoading, getActiveAcademicYear } = useCurrentAcademicYear()
  const currentAcademicYear = getActiveAcademicYear()

  // Query to get all terms for the current academic year
  const { data: terms, isLoading: termsLoading, refetch: refetchTerms } = useQuery({
    queryKey: ['allTerms', currentAcademicYear?.id],
    queryFn: async () => {
      if (!currentAcademicYear?.id) return []

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetAllTermsForAcademicYear($academicYearId: ID!) {
              termsByAcademicYear(academicYearId: $academicYearId) {
                id
                name
                startDate
                endDate
                isActive
                academicYear {
                  name
                }
              }
            }
          `,
          variables: { academicYearId: currentAcademicYear.id }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch terms')
      }

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors.map((e: any) => e.message).join(', '))
      }

      return result.data.termsByAcademicYear as Term[]
    },
    enabled: !!currentAcademicYear?.id,
  })

  // Set the active term as selected by default
  useEffect(() => {
    if (terms && terms.length > 0 && !selectedTerm) {
      const activeTerm = terms.find(term => term.isActive) || terms[0]
      setSelectedTerm(activeTerm)
    }
  }, [terms, selectedTerm, setSelectedTerm])

  const handleTermSelect = (term: Term) => {
    setSelectedTerm(term)
  }

  const handleTermCreated = (newTerm: any) => {
    toast.success(`Term "${newTerm.name}" created successfully!`)
    refetchTerms()
    setShowCreateTermModal(false)
  }

  const handleAcademicYearCreated = (year: AcademicYear) => {
    toast.success('Academic year created successfully! Now create a term.')
    setNewAcademicYear(year)
    setShowCreateTermModal(true)
  }

  // Get the fallback term display (similar to the original hardcoded logic)
  const getFallbackTerm = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    if (month >= 1 && month <= 3) {
      return `Term 1, ${year}`
    } else if (month >= 5 && month <= 7) {
      return `Term 2, ${year}`
    } else if (month >= 9 && month <= 11) {
      return `Term 3, ${year}`
    } else {
      if (month === 4) return `Term 2, ${year}`
      if (month === 8) return `Term 3, ${year}`
      if (month === 12) return `Term 1, ${year + 1}`
    }
    return `Term 1, ${year}`
  }

  const displayTerm = selectedTerm ? selectedTerm.name : getFallbackTerm()

  const isLoading = currentAcademicYearLoading || termsLoading

  return (
    <>
      <div className={`hidden md:flex items-center space-x-2 min-w-[200px] ${className}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm">
              <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              {isLoading ? (
                <Loader2 className="h-4 w-4 text-slate-600 dark:text-slate-400 animate-spin" />
              ) : (
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{displayTerm}</span>
              )}
              <ChevronDown className="h-3 w-3 text-slate-500 dark:text-slate-400" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg rounded-xl p-2">
            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Select Term
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-700 my-1" />
            
            {/* Current Academic Year Terms */}
            {currentAcademicYear && (
              <>
                <DropdownMenuLabel className="px-2 py-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {currentAcademicYear.name}
                </DropdownMenuLabel>
                {terms && terms.length > 0 ? (
                  terms.map((term) => (
                    <DropdownMenuItem
                      key={term.id}
                      className="flex flex-col items-start px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer rounded-lg"
                      onClick={() => handleTermSelect(term)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {term.name}
                          {term.isActive && (
                            <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                        </span>
                        {selectedTerm?.id === term.id && (
                          <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {new Date(term.startDate).toLocaleDateString()} - {new Date(term.endDate).toLocaleDateString()}
                      </span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem
                    className="flex items-center space-x-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer rounded-lg"
                    onClick={() => setShowCreateTermModal(true)}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700">
                      <Plus className="h-4 w-4 text-slate-100 dark:text-slate-400 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Create First Term</span>
                  </DropdownMenuItem>
                )}
                
                {terms && terms.length > 0 && (
                  <>
                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-700 my-1" />
                    <DropdownMenuItem
                      className="flex items-center space-x-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer rounded-lg"
                      onClick={() => setShowCreateTermModal(true)}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700">
                        <Plus className="h-4 w-4 text-slate-100 dark:text-slate-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Add New Term</span>
                    </DropdownMenuItem>
                  </>
                )}
              </>
            )}

            {/* No Academic Year */}
            {!currentAcademicYear && !currentAcademicYearLoading && (
              <CreateAcademicYearModal
                onSuccess={handleAcademicYearCreated}
                trigger={
                  <DropdownMenuItem
                    className="flex items-center space-x-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer rounded-lg"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 ring-1 ring-primary/20 dark:ring-primary/30">
                      <Plus className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Create Academic Year</span>
                  </DropdownMenuItem>
                }
              />
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Create Term Modal */}
      {currentAcademicYear && (
        <CreateTermModal
          isOpen={showCreateTermModal}
          onClose={() => setShowCreateTermModal(false)}
          onSuccess={handleTermCreated}
          academicYear={newAcademicYear || currentAcademicYear}
        />
      )}

      {/* Create Academic Year Modal is triggered from the dropdown item above */}
    </>
  )
}
