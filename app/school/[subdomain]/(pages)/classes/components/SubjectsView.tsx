"use client"

import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  BookOpen, 
  Search, 
  Filter,
  GraduationCap,
  X,
  BookMarked,
  FileText,
  Layers,
  Edit,
  Trash2
} from 'lucide-react'
import { useTenantSubjects, TenantSubject } from '@/lib/hooks/useTenantSubjects'
import { EditSubjectDialog } from '../../components/EditSubjectDialog'
import { useSchoolConfigStore } from '@/lib/stores/useSchoolConfigStore'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface SubjectsViewProps {
  selectedGradeId?: string | null
}

export function SubjectsView({ selectedGradeId }: SubjectsViewProps = {}) {
  const { config, getAllGradeLevels } = useSchoolConfigStore()
  const { data: tenantSubjects = [], isLoading } = useTenantSubjects()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'core' | 'elective' | 'active' | 'inactive'>('all')
  const [editingSubject, setEditingSubject] = useState<TenantSubject | null>(null)
  const [filterByGradeId, setFilterByGradeId] = useState<string | null>(selectedGradeId || null)
  const [subjectToDelete, setSubjectToDelete] = useState<TenantSubject | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Get all grades sorted and abbreviated
  const allGradesSorted = useMemo(() => {
    const gradeLevels = getAllGradeLevels()
    
    // Helper to abbreviate grade names
    const abbreviateGrade = (gradeName: string): string => {
      const lower = gradeName.toLowerCase()
      
      // Pre-Primary
      if (lower.includes('baby') || lower.includes('playgroup') || lower === 'pg') return 'PG'
      if (lower.includes('pp1') || lower.includes('pre-primary 1')) return 'PP1'
      if (lower.includes('pp2') || lower.includes('pre-primary 2')) return 'PP2'
      
      // Grade format: "Grade 1" -> "G1", "Grade 7" -> "G7"
      const gradeMatch = gradeName.match(/grade\s*(\d+)/i)
      if (gradeMatch) {
        return `G${gradeMatch[1]}`
      }
      
      // Form format: "Form 1" -> "F1", "Form 2" -> "F2"
      const formMatch = gradeName.match(/form\s*(\d+)/i)
      if (formMatch) {
        return `F${formMatch[1]}`
      }
      
      // If already short (like PP1, PP2), return as is
      if (gradeName.length <= 4) return gradeName.toUpperCase()
      
      // Default: return first 3-4 characters
      return gradeName.substring(0, 4).toUpperCase()
    }

    // Helper to get grade priority for sorting
    const getGradePriority = (gradeName: string): number => {
      const lower = gradeName.toLowerCase()
      
      // Pre-Primary
      if (lower.includes('baby') || lower.includes('pg') || lower.includes('playgroup')) return 1
      if (lower.includes('pp1') || lower.includes('pre-primary 1')) return 2
      if (lower.includes('pp2') || lower.includes('pre-primary 2')) return 3
      
      // Primary
      const gradeMatch = gradeName.match(/grade\s*(\d+)/i)
      if (gradeMatch) {
        const num = parseInt(gradeMatch[1])
        if (num >= 1 && num <= 6) return 10 + num
      }
      
      // Secondary (Grade 7+ or Forms)
      if (gradeMatch) {
        const num = parseInt(gradeMatch[1])
        if (num >= 7) return 20 + num
      }
      
      const formMatch = gradeName.match(/form\s*(\d+)/i)
      if (formMatch) {
        const num = parseInt(formMatch[1])
        return 20 + num + 6 // Form 1 = Grade 7, etc.
      }
      
      return 999
    }

    // Flatten and sort all grades
    const allGrades = gradeLevels.flatMap(level => 
      level.grades.map(grade => ({
        id: grade.id,
        name: grade.name,
        abbreviated: abbreviateGrade(grade.name),
        levelName: level.levelName,
        levelId: level.levelId,
        priority: getGradePriority(grade.name)
      }))
    ).sort((a, b) => a.priority - b.priority)

    return allGrades
  }, [getAllGradeLevels])

  // Transform and filter subjects
  const filteredSubjects = useMemo(() => {
    let subjects = tenantSubjects.map(ts => ({
      ...ts,
      name: ts.subject?.name || ts.customSubject?.name || 'Unknown Subject',
      code: ts.subject?.code || ts.customSubject?.code || '',
      category: ts.subject?.category || ts.customSubject?.category || '',
      department: ts.subject?.department || ts.customSubject?.department || '',
      shortName: ts.subject?.shortName || ts.customSubject?.shortName || '',
    }))

    // Filter by grade if selected (use filterByGradeId which can be set from tabs)
    const gradeIdToFilter = filterByGradeId || selectedGradeId
    if (gradeIdToFilter && config?.selectedLevels) {
      // Find the level that contains the selected grade
      const levelWithGrade = config.selectedLevels.find(level =>
        level.gradeLevels?.some(grade => grade.id === gradeIdToFilter)
      )

      if (levelWithGrade) {
        // Match tenant subjects with level subjects by name or code
        const levelSubjectNames = new Set(
          levelWithGrade.subjects.map(s => s.name.toLowerCase().trim())
        )
        const levelSubjectCodes = new Set(
          levelWithGrade.subjects.map(s => s.code?.toLowerCase().trim()).filter(Boolean)
        )

        subjects = subjects.filter(subject => {
          const subjectName = subject.name.toLowerCase().trim()
          const subjectCode = subject.code?.toLowerCase().trim()
          
          // Match by name or code
          return levelSubjectNames.has(subjectName) || 
                 (subjectCode && levelSubjectCodes.has(subjectCode))
        })
      } else {
        // If grade not found, show no subjects
        subjects = []
      }
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      subjects = subjects.filter(subject => 
        subject.name.toLowerCase().includes(search) ||
        subject.code?.toLowerCase().includes(search) ||
        subject.category?.toLowerCase().includes(search) ||
        subject.department?.toLowerCase().includes(search)
      )
    }

    // Filter by type
    if (selectedFilter === 'core') {
      subjects = subjects.filter(s => s.subjectType === 'core')
    } else if (selectedFilter === 'elective') {
      subjects = subjects.filter(s => s.subjectType === 'elective')
    } else if (selectedFilter === 'active') {
      subjects = subjects.filter(s => s.isActive)
    } else if (selectedFilter === 'inactive') {
      subjects = subjects.filter(s => !s.isActive)
    }

    // Sort: core first, then by name
    return subjects.sort((a, b) => {
      if (a.subjectType === 'core' && b.subjectType !== 'core') return -1
      if (a.subjectType !== 'core' && b.subjectType === 'core') return 1
      return a.name.localeCompare(b.name)
    })
  }, [tenantSubjects, filterByGradeId, selectedGradeId, config, searchTerm, selectedFilter])

  // Calculate stats from filtered subjects
  const stats = useMemo(() => {
    const total = filteredSubjects.length
    const core = filteredSubjects.filter(s => s.subjectType === 'core').length
    const elective = filteredSubjects.filter(s => s.subjectType === 'elective').length
    const active = filteredSubjects.filter(s => s.isActive).length
    const inactive = filteredSubjects.filter(s => !s.isActive).length

    return { total, core, elective, active, inactive }
  }, [filteredSubjects])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Get grade name if grade is selected
  const activeGradeId = filterByGradeId || selectedGradeId
  const selectedGradeName = useMemo(() => {
    if (!activeGradeId || !config?.selectedLevels) return null
    for (const level of config.selectedLevels) {
      const grade = level.gradeLevels?.find(g => g.id === activeGradeId)
      if (grade) return grade.name
    }
    return null
  }, [activeGradeId, config])

  // Handle delete subject
  const handleDeleteSubject = async (subjectId: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation DeleteTenantSubject($tenantSubjectId: String!) {
              deleteTenantSubject(tenantSubjectId: $tenantSubjectId)
            }
          `,
          variables: {
            tenantSubjectId: subjectId
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to delete subject')
      }

      if (result.data?.deleteTenantSubject) {
        toast.success('Subject deleted successfully')
        setSubjectToDelete(null)
        // Invalidate and refetch subjects
        queryClient.invalidateQueries({ queryKey: ['tenantSubjects'] })
      } else {
        throw new Error('Delete operation returned false')
      }
    } catch (error) {
      console.error('Error deleting subject:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete subject')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Compact Filters Container */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-2">
          <div className="space-y-2">
            {/* Search Bar - Top */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-slate-400" />
              <Input
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 h-7 rounded-none border border-primary/20 text-xs"
              />
            </div>

            {/* All Filters in Compact Layout */}
            <div className="flex flex-wrap items-center gap-1">
              {/* All Grades Button */}
              <Button
                variant={filterByGradeId === null ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterByGradeId(null)}
                className="flex items-center gap-1 px-2 py-0.5 h-6 rounded-none border border-primary/20 text-[10px] font-medium"
              >
                <BookOpen className="h-3 w-3" />
                All
              </Button>

              {/* Grade Buttons - Compact */}
              {allGradesSorted.map((grade) => (
                <Button
                  key={grade.id}
                  variant={filterByGradeId === grade.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterByGradeId(grade.id)}
                  className="px-1.5 py-0.5 h-6 rounded-none border border-primary/20 text-[10px] font-medium min-w-[35px]"
                  title={grade.name}
                >
                  {grade.abbreviated}
                </Button>
              ))}

              {/* Divider */}
              <div className="h-4 w-px bg-primary/20 mx-0.5" />

              {/* Type Filter Buttons */}
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
                className="px-2 py-0.5 h-6 rounded-none border border-primary/20 text-[10px] font-medium"
              >
                All
              </Button>
              <Button
                variant={selectedFilter === 'core' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('core')}
                className="px-2 py-0.5 h-6 rounded-none border border-primary/20 text-[10px] font-medium"
              >
                Core
              </Button>
              <Button
                variant={selectedFilter === 'elective' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('elective')}
                className="px-2 py-0.5 h-6 rounded-none border border-primary/20 text-[10px] font-medium"
              >
                Elective
              </Button>
              <Button
                variant={selectedFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('active')}
                className="px-2 py-0.5 h-6 rounded-none border border-primary/20 text-[10px] font-medium"
              >
                Active
              </Button>
              <Button
                variant={selectedFilter === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('inactive')}
                className="px-2 py-0.5 h-6 rounded-none border border-primary/20 text-[10px] font-medium"
              >
                Inactive
              </Button>
            </div>

            {/* Active Filters - Compact */}
            {(searchTerm || selectedFilter !== 'all' || filterByGradeId) && (
              <div className="flex flex-wrap gap-1 items-center pt-1 border-t border-primary/10">
                <span className="text-[10px] font-semibold text-primary">Active:</span>
                {searchTerm && (
                  <Badge variant="outline" className="flex gap-0.5 items-center border-primary/20 bg-primary/5 text-primary px-1.5 py-0 rounded-none text-[10px] h-4">
                    <span>"{searchTerm}"</span>
                    <X className="h-2.5 w-2.5 cursor-pointer hover:text-red-500 transition-colors" onClick={() => setSearchTerm('')} />
                  </Badge>
                )}
                {selectedFilter !== 'all' && (
                  <Badge variant="outline" className="flex gap-0.5 items-center border-primary/20 bg-primary/5 text-primary px-1.5 py-0 rounded-none text-[10px] h-4">
                    <span>{selectedFilter}</span>
                    <X className="h-2.5 w-2.5 cursor-pointer hover:text-red-500 transition-colors" onClick={() => setSelectedFilter('all')} />
                  </Badge>
                )}
                {filterByGradeId && (
                  <Badge variant="outline" className="flex gap-0.5 items-center border-primary/20 bg-primary/5 text-primary px-1.5 py-0 rounded-none text-[10px] h-4">
                    <span>{allGradesSorted.find(g => g.id === filterByGradeId)?.abbreviated}</span>
                    <X className="h-2.5 w-2.5 cursor-pointer hover:text-red-500 transition-colors" onClick={() => setFilterByGradeId(null)} />
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedFilter('all')
                    setFilterByGradeId(null)
                  }}
                  className="text-[10px] h-4 px-1.5 py-0 hover:text-red-600 hover:border-red-500/20 rounded-none border border-primary/20"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 border border-primary/20 rounded p-1">
                <BookOpen className="h-3 w-3 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-primary uppercase tracking-wide">Total</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 border border-primary/20 rounded p-1">
                <BookMarked className="h-3 w-3 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-primary uppercase tracking-wide">Core</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{stats.core}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 border border-primary/20 rounded p-1">
                <FileText className="h-3 w-3 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-primary uppercase tracking-wide">Elective</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{stats.elective}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/20 bg-green-500/5">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <div className="bg-green-500/10 border border-green-500/20 rounded p-1">
                <GraduationCap className="h-3 w-3 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-green-600 uppercase tracking-wide">Active</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-500/20 bg-red-500/5">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <div className="bg-red-500/10 border border-red-500/20 rounded p-1">
                <X className="h-3 w-3 text-red-600" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-red-600 uppercase tracking-wide">Inactive</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Subjects Table */}
      {filteredSubjects.length === 0 ? (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No subjects found</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {searchTerm || selectedFilter !== 'all'
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'No subjects have been configured yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-primary/20">
          <div className="w-full">
            <table className="w-full table-fixed border-collapse">
              <thead className="bg-primary/5 border-b-2 border-primary/20">
                <tr>
                  <th className="px-1 py-1.5 text-left text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider w-[25%]">
                    Subject Name
                  </th>
                  <th className="px-1 py-1.5 text-left text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider w-[10%]">
                    Code
                  </th>
                  <th className="px-1 py-1.5 text-left text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider w-[20%]">
                    Department
                  </th>
                  <th className="px-1 py-1.5 text-left text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider w-[15%]">
                    Status
                  </th>
                  <th className="px-1 py-1.5 text-center text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider w-[10%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {filteredSubjects.map((subject) => (
                  <tr 
                    key={subject.id}
                    className="hover:bg-primary/5 transition-colors cursor-pointer"
                    onClick={() => setEditingSubject(subject)}
                  >
                    <td className="px-1 py-1.5 break-words">
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 break-words">
                        {subject.name}
                      </div>
                    </td>
                    <td className="px-1 py-1.5 break-words">
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                        {subject.code || '-'}
                      </span>
                    </td>
                    <td className="px-1 py-1.5 break-words">
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 break-words">
                        {subject.department || '-'}
                      </span>
                    </td>
                    <td className="px-1 py-1.5">
                      <div className="flex flex-wrap items-center gap-1">
                        {subject.isActive ? (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 border-green-500/20 text-green-600 bg-green-500/5">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 border-red-500/20 text-red-600 bg-red-500/5">
                            Inactive
                          </Badge>
                        )}
                        {subject.isCompulsory && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 border-blue-500/20 text-blue-600 bg-blue-500/5">
                            Comp
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-1 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingSubject(subject)
                          }}
                          className="h-6 w-6 p-0 hover:bg-primary/10"
                          title="Edit subject"
                        >
                          <Edit className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSubjectToDelete(subject)
                          }}
                          className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                          title="Delete subject"
                        >
                          <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit Subject Dialog */}
      {editingSubject && (
        <EditSubjectDialog
          subject={{
            id: editingSubject.id,
            name: editingSubject.subject?.name || editingSubject.customSubject?.name || 'Unknown Subject',
            code: editingSubject.subject?.code || editingSubject.customSubject?.code || '',
            subjectType: editingSubject.subjectType,
            category: editingSubject.subject?.category || editingSubject.customSubject?.category || null,
            department: editingSubject.subject?.department || editingSubject.customSubject?.department || null,
            shortName: editingSubject.subject?.shortName || editingSubject.customSubject?.shortName || null,
            isCompulsory: editingSubject.isCompulsory,
            totalMarks: editingSubject.totalMarks,
            passingMarks: editingSubject.passingMarks,
            creditHours: editingSubject.creditHours,
            curriculum: editingSubject.curriculum.name
          }}
          isOpen={!!editingSubject}
          onClose={() => setEditingSubject(null)}
          onSave={(updatedSubject) => {
            console.log('Subject updated:', updatedSubject)
            setEditingSubject(null)
          }}
          tenantSubjectId={editingSubject.id}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!subjectToDelete} onOpenChange={(open) => !open && setSubjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">
                {subjectToDelete?.subject?.name || subjectToDelete?.customSubject?.name || 'this subject'}
              </span>?
              <p className="mt-2 text-red-500">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (subjectToDelete) {
                  handleDeleteSubject(subjectToDelete.id)
                }
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Subject
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

