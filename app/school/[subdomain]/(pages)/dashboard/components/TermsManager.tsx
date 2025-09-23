'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, Plus, BookOpen, AlertCircle } from 'lucide-react'
import { CreateAcademicYearModal } from './CreateAcademicYearModal'
import { CreateTermModal } from './CreateTermModal'
import { toast } from 'sonner'
import { useCurrentAcademicYear } from '@/lib/hooks/useAcademicYears'

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

interface TermsManagerProps {
  academicYearId?: string
  className?: string
}

export function TermsManager({ academicYearId, className }: TermsManagerProps) {
  const [showCreateTermModal, setShowCreateTermModal] = useState(false)
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(null)

  // Get current academic year if no academicYearId is provided
  const { academicYears, loading: currentAcademicYearLoading, getActiveAcademicYear } = useCurrentAcademicYear()
  const currentAcademicYear = getActiveAcademicYear()
  
  // Use provided academicYearId or fall back to current academic year
  const effectiveAcademicYearId = academicYearId || currentAcademicYear?.id

  // Query to get terms for the academic year
  const { data: termsData, isLoading: termsLoading, error: termsError, refetch: refetchTerms } = useQuery({
    queryKey: ['termsByAcademicYear', effectiveAcademicYearId],
    queryFn: async () => {
      if (!effectiveAcademicYearId) return null

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
          variables: { academicYearId: effectiveAcademicYearId }
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
    enabled: !!effectiveAcademicYearId,
  })

  // Query to get academic year details (for the create term modal)
  const { data: academicYearData } = useQuery({
    queryKey: ['academicYear', effectiveAcademicYearId],
    queryFn: async () => {
      if (!effectiveAcademicYearId) return null

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetAcademicYear($academicYearId: ID!) {
              academicYear(id: $academicYearId) {
                id
                name
                startDate
                endDate
                isActive
              }
            }
          `,
          variables: { academicYearId: effectiveAcademicYearId }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch academic year')
      }

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors.map((e: any) => e.message).join(', '))
      }

      return result.data.academicYear as AcademicYear
    },
    enabled: !!effectiveAcademicYearId,
  })

  useEffect(() => {
    if (academicYearData) {
      setSelectedAcademicYear(academicYearData)
    } else if (currentAcademicYear) {
      setSelectedAcademicYear(currentAcademicYear)
    }
  }, [academicYearData, currentAcademicYear])

  const handleTermCreated = (newTerm: any) => {
    toast.success(`Term "${newTerm.name}" created successfully!`)
    refetchTerms()
    setShowCreateTermModal(false)
  }

  const handleAcademicYearCreated = () => {
    // Refresh the page or trigger a refetch of academic years
    window.location.reload()
  }

  // Loading state
  if (termsLoading || currentAcademicYearLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Loading terms...</span>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (termsError) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6">
          <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
          <span className="text-red-500">Failed to load terms</span>
        </CardContent>
      </Card>
    )
  }

  // No academic year available
  if (!effectiveAcademicYearId) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Academic Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Academic Year Found</h3>
            <p className="text-muted-foreground mb-4">
              Create an academic year first to organize your school calendar and terms.
            </p>
            <CreateAcademicYearModal 
              onSuccess={handleAcademicYearCreated}
              trigger={
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <Plus className="h-4 w-4 mr-2 text-white" />
                  Create Academic Year
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  // No terms found for the academic year
  if (!termsData || termsData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Terms Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Terms Found</h3>
            <p className="text-muted-foreground mb-4">
              Create terms for your academic year to organize your school calendar and activities.
            </p>
            <div className="space-y-3">
              {selectedAcademicYear ? (
                <Button 
                  onClick={() => setShowCreateTermModal(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Term
                </Button>
              ) : (
                <CreateAcademicYearModal 
                  onSuccess={handleAcademicYearCreated}
                  trigger={
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Academic Year & Terms
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        </CardContent>
        
        {/* Create Term Modal */}
        {selectedAcademicYear && (
          <CreateTermModal
            isOpen={showCreateTermModal}
            onClose={() => setShowCreateTermModal(false)}
            onSuccess={handleTermCreated}
            academicYear={selectedAcademicYear}
          />
        )}
      </Card>
    )
  }

  // Display terms
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Terms - {termsData[0]?.academicYear?.name}
          </CardTitle>
          {selectedAcademicYear && (
            <Button 
              onClick={() => setShowCreateTermModal(true)}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Term
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {termsData.map((term) => (
            <div
              key={term.id}
              className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{term.name}</h4>
                  {term.isActive && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(term.startDate).toLocaleDateString()} - {new Date(term.endDate).toLocaleDateString()}
                </p>
              </div>
              <Calendar className="h-4 w-4 text-primary" />
            </div>
          ))}
        </div>
      </CardContent>
      
      {/* Create Term Modal */}
      {selectedAcademicYear && (
        <CreateTermModal
          isOpen={showCreateTermModal}
          onClose={() => setShowCreateTermModal(false)}
          onSuccess={handleTermCreated}
          academicYear={selectedAcademicYear}
        />
      )}
    </Card>
  )
}
