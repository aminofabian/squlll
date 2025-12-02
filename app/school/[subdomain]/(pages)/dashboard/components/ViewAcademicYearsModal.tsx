'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, Plus, BookOpen, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { useAcademicYears, type AcademicYear } from '@/lib/hooks/useAcademicYears'
import { CreateAcademicYearModal } from './CreateAcademicYearModal'
import { format } from 'date-fns'

interface ViewAcademicYearsModalProps {
  trigger?: React.ReactNode
  onAcademicYearCreated?: () => void
}

export function ViewAcademicYearsModal({ trigger, onAcademicYearCreated }: ViewAcademicYearsModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { academicYears, loading, error, refetch } = useAcademicYears()

  const handleAcademicYearCreated = () => {
    refetch()
    if (onAcademicYearCreated) {
      onAcademicYearCreated()
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-row items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Academic Years
          </DialogTitle>
          <DialogDescription>
            View and manage all academic years for your school
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
                    <div className="flex items-start justify-between">
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

