'use client'

import { useState } from 'react'
import { 
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, Plus, BookOpen, CheckCircle2, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { useAcademicYears, type AcademicYear } from '@/lib/hooks/useAcademicYears'
import { CreateAcademicYearModal } from './CreateAcademicYearModal'
import { EditAcademicYearDialog } from './EditAcademicYearDialog'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

interface ViewAcademicYearsDrawerProps {
  trigger?: React.ReactNode
  onAcademicYearCreated?: () => void
}

interface AcademicYearCardProps {
  year: AcademicYear
  isExpanded: boolean
  onToggleExpand: () => void
  onEdit: () => void
  onDelete: () => void
  formatDate: (dateString: string) => string
}

function AcademicYearCard({ 
  year, 
  isExpanded, 
  onToggleExpand, 
  onEdit, 
  onDelete, 
  formatDate 
}: AcademicYearCardProps) {
  // Fetch terms when expanded
  const { data: terms, isLoading: termsLoading, error: termsError } = useQuery<Term[]>({
    queryKey: ['termsByAcademicYear', year.id],
    queryFn: async () => {
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
          variables: { academicYearId: year.id }
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
    enabled: isExpanded, // Only fetch when expanded
  })

  return (
    <Card 
      className={`transition-all hover:shadow-md ${
        year.isActive 
          ? 'bg-primary/5 border-primary/30 border-2' 
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
      }`}
    >
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={onToggleExpand}
                className="flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded p-1 transition-colors"
                aria-label={isExpanded ? 'Collapse terms' : 'Expand terms'}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                )}
              </button>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                {year.name}
              </h3>
              {year.isActive && (
                <Badge className="bg-green-500 hover:bg-green-600 text-white border-0">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3 ml-6">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(year.startDate)}</span>
              </div>
              <span className="hidden sm:inline">-</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(year.endDate)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expandable Terms Section */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 ml-6">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Terms
              </h4>
            </div>

            {termsLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                <span className="text-sm text-slate-500">Loading terms...</span>
              </div>
            )}

            {termsError && (
              <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Error loading terms: {termsError instanceof Error ? termsError.message : 'Unknown error'}
                </p>
              </div>
            )}

            {!termsLoading && !termsError && terms && terms.length > 0 && (
              <div className="space-y-2">
                {terms.map((term) => (
                  <Card 
                    key={term.id}
                    className={`bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 ${
                      term.isActive ? 'border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-slate-900 dark:text-slate-100">
                              {term.name}
                            </span>
                            {term.isActive && (
                              <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(term.startDate)}</span>
                            </div>
                            <span className="hidden sm:inline">-</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(term.endDate)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!termsLoading && !termsError && terms && terms.length === 0 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No terms found for this academic year
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ViewAcademicYearsDrawer({ trigger, onAcademicYearCreated }: ViewAcademicYearsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null)
  const [deletingYear, setDeletingYear] = useState<AcademicYear | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set())
  const { academicYears, loading, error, refetch } = useAcademicYears()

  const toggleYearExpansion = (yearId: string) => {
    setExpandedYears(prev => {
      const newSet = new Set(prev)
      if (newSet.has(yearId)) {
        newSet.delete(yearId)
      } else {
        newSet.add(yearId)
      }
      return newSet
    })
  }

  const handleAcademicYearCreated = () => {
    refetch()
    if (onAcademicYearCreated) {
      onAcademicYearCreated()
    }
  }

  const handleEdit = (year: AcademicYear) => {
    setEditingYear(year)
  }

  const handleEditSuccess = () => {
    setEditingYear(null)
    refetch()
    if (onAcademicYearCreated) {
      onAcademicYearCreated()
    }
  }

  const handleDeleteClick = (year: AcademicYear) => {
    setDeletingYear(year)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingYear) return

    setIsDeleting(true)
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation DeleteAcademicYear($id: ID!) {
              deleteAcademicYear(id: $id)
            }
          `,
          variables: {
            id: deletingYear.id
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to delete academic year')
      }

      if (result.data?.deleteAcademicYear) {
        toast.success(`Academic year "${deletingYear.name}" deleted successfully!`)
        setDeletingYear(null)
        refetch()
        if (onAcademicYearCreated) {
          onAcademicYearCreated()
        }
      } else {
        throw new Error('Delete operation returned false')
      }
    } catch (error) {
      console.error('Error deleting academic year:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete academic year')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return dateString
    }
  }

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className="border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/40 transition-all duration-200"
    >
      Academic Year
    </Button>
  )

  return (
    <>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          {trigger || defaultTrigger}
        </DrawerTrigger>
        <DrawerContent className="max-h-[90vh] h-full w-full md:w-1/2 lg:w-1/2" data-vaul-drawer-direction="right">
          <DrawerHeader className="border-b">
            <DrawerTitle className="flex flex-row items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Academic Years
            </DrawerTitle>
            <DrawerDescription>
              View and manage all academic years for your school
            </DrawerDescription>
          </DrawerHeader>

          <div className="overflow-y-auto p-4 space-y-4">
            {/* Create New Button */}
            <div className="flex justify-end">
              <CreateAcademicYearModal
                onSuccess={handleAcademicYearCreated}
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/40"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Academic Year
                  </Button>
                }
              />
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Loading academic years...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                    <span className="text-sm font-medium">Error loading academic years:</span>
                    <span className="text-sm">{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!loading && !error && academicYears.length === 0 && (
              <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Calendar className="h-12 w-12 text-slate-400 mb-4" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      No academic years found
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                      Create your first academic year to get started
                    </p>
                    <CreateAcademicYearModal
                      onSuccess={handleAcademicYearCreated}
                      trigger={
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/40"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Academic Year
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Academic Years List */}
            {!loading && !error && academicYears.length > 0 && (
              <div className="space-y-3">
                {academicYears.map((year: AcademicYear) => (
                  <AcademicYearCard
                    key={year.id}
                    year={year}
                    isExpanded={expandedYears.has(year.id)}
                    onToggleExpand={() => toggleYearExpansion(year.id)}
                    onEdit={() => handleEdit(year)}
                    onDelete={() => handleDeleteClick(year)}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Edit Dialog */}
      {editingYear && (
        <EditAcademicYearDialog
          academicYear={editingYear}
          isOpen={!!editingYear}
          onClose={() => setEditingYear(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingYear} onOpenChange={(open) => !open && setDeletingYear(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Academic Year</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingYear?.name}"? This action cannot be undone.
              {deletingYear?.terms && deletingYear.terms.length > 0 && (
                <span className="block mt-2 text-amber-600 dark:text-amber-400">
                  Warning: This academic year has {deletingYear.terms.length} term(s) associated with it.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

