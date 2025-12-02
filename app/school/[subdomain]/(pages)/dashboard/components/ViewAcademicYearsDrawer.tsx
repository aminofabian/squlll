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
import { Loader2, Calendar, Plus, BookOpen, CheckCircle2, Edit2, Trash2 } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { useAcademicYears, type AcademicYear } from '@/lib/hooks/useAcademicYears'
import { CreateAcademicYearModal } from './CreateAcademicYearModal'
import { EditAcademicYearDialog } from './EditAcademicYearDialog'
import { format } from 'date-fns'
import { toast } from 'sonner'
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

interface ViewAcademicYearsDrawerProps {
  trigger?: React.ReactNode
  onAcademicYearCreated?: () => void
}

export function ViewAcademicYearsDrawer({ trigger, onAcademicYearCreated }: ViewAcademicYearsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null)
  const [deletingYear, setDeletingYear] = useState<AcademicYear | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { academicYears, loading, error, refetch } = useAcademicYears()

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
                  <Card 
                    key={year.id} 
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
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
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
                          {year.terms && year.terms.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                <BookOpen className="h-3 w-3" />
                                <span className="font-medium">Terms:</span>
                              </div>
                              {year.terms.map((term) => (
                                <Badge 
                                  key={term.id} 
                                  variant="outline"
                                  className="text-xs border-slate-300 dark:border-slate-600"
                                >
                                  {term.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {(!year.terms || year.terms.length === 0) && (
                            <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                              No terms created yet
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(year)}
                            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(year)}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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

