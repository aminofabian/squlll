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
      {/* Professional Filters Container */}
      <Card className="border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
        <CardContent className="p-3">
          <div className="space-y-3">
            {/* Search Bar - Prominent */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Search subjects by name, code, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Grade Filters Section */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap gap-1.5">
                <Button
                  variant={filterByGradeId === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterByGradeId(null)}
                  className={`flex items-center gap-1 px-2.5 py-1 h-7 text-xs font-medium transition-all ${
                    filterByGradeId === null
                      ? 'bg-primary text-white shadow-sm hover:bg-primary/90'
                      : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <BookOpen className="h-3 w-3" />
                  All Grades
                </Button>
                {allGradesSorted.map((grade) => (
                  <Button
                    key={grade.id}
                    variant={filterByGradeId === grade.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterByGradeId(grade.id)}
                    className={`px-2.5 py-1 h-7 text-xs font-medium min-w-[40px] transition-all ${
                      filterByGradeId === grade.id
                        ? 'bg-primary text-white shadow-sm hover:bg-primary/90'
                        : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                    title={grade.name}
                  >
                    {grade.abbreviated}
                  </Button>
                ))}
              </div>
            </div>

            {/* Type & Status Filters Section */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap gap-1.5">
                <Button
                  variant={selectedFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('all')}
                  className={`px-2.5 py-1 h-7 text-xs font-medium transition-all ${
                    selectedFilter === 'all'
                      ? 'bg-primary text-white shadow-sm hover:bg-primary/90'
                      : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  All Types
                </Button>
                <Button
                  variant={selectedFilter === 'core' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('core')}
                  className={`px-2.5 py-1 h-7 text-xs font-medium transition-all ${
                    selectedFilter === 'core'
                      ? 'bg-primary text-white shadow-sm hover:bg-primary/90'
                      : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  Core
                </Button>
                <Button
                  variant={selectedFilter === 'elective' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('elective')}
                  className={`px-2.5 py-1 h-7 text-xs font-medium transition-all ${
                    selectedFilter === 'elective'
                      ? 'bg-primary text-white shadow-sm hover:bg-primary/90'
                      : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  Elective
                </Button>
                <Button
                  variant={selectedFilter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('active')}
                  className={`px-2.5 py-1 h-7 text-xs font-medium transition-all ${
                    selectedFilter === 'active'
                      ? 'bg-green-600 text-white shadow-sm hover:bg-green-700 border-green-600'
                      : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  Active
                </Button>
                <Button
                  variant={selectedFilter === 'inactive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('inactive')}
                  className={`px-2.5 py-1 h-7 text-xs font-medium transition-all ${
                    selectedFilter === 'inactive'
                      ? 'bg-red-600 text-white shadow-sm hover:bg-red-700 border-red-600'
                      : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  Inactive
                </Button>
              </div>
            </div>

            {/* Active Filters Display */}
            {(searchTerm || selectedFilter !== 'all' || filterByGradeId) && (
              <div className="flex flex-wrap gap-1.5 items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                {searchTerm && (
                  <Badge 
                    variant="outline" 
                    className="flex gap-1 items-center border-primary/30 bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium h-6"
                  >
                    <Search className="h-2.5 w-2.5" />
                    <span>"{searchTerm}"</span>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-0.5 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                )}
                {selectedFilter !== 'all' && (
                  <Badge 
                    variant="outline" 
                    className="flex gap-1 items-center border-primary/30 bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium h-6"
                  >
                    <Filter className="h-2.5 w-2.5" />
                    <span className="capitalize">{selectedFilter}</span>
                    <button
                      onClick={() => setSelectedFilter('all')}
                      className="ml-0.5 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                )}
                {filterByGradeId && (
                  <Badge 
                    variant="outline" 
                    className="flex gap-1 items-center border-primary/30 bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium h-6"
                  >
                    <GraduationCap className="h-2.5 w-2.5" />
                    <span>{allGradesSorted.find(g => g.id === filterByGradeId)?.name || allGradesSorted.find(g => g.id === filterByGradeId)?.abbreviated}</span>
                    <button
                      onClick={() => setFilterByGradeId(null)}
                      className="ml-0.5 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
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
                  className="h-6 px-2 text-xs font-medium border-slate-300 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700 transition-all"
                >
                  <X className="h-2.5 w-2.5 mr-1" />
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-1.5">
        <Card className="border border-primary/20 bg-primary/5">
          <CardContent className="p-1.5">
            <div className="flex items-center gap-1.5">
              <div className="bg-primary/10 border border-primary/20 rounded p-0.5">
                <BookOpen className="h-2.5 w-2.5 text-primary" />
              </div>
              <div>
                <p className="text-[9px] font-mono text-primary uppercase tracking-wide">Total</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-primary/20 bg-primary/5">
          <CardContent className="p-1.5">
            <div className="flex items-center gap-1.5">
              <div className="bg-primary/10 border border-primary/20 rounded p-0.5">
                <BookMarked className="h-2.5 w-2.5 text-primary" />
              </div>
              <div>
                <p className="text-[9px] font-mono text-primary uppercase tracking-wide">Core</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{stats.core}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-primary/20 bg-primary/5">
          <CardContent className="p-1.5">
            <div className="flex items-center gap-1.5">
              <div className="bg-primary/10 border border-primary/20 rounded p-0.5">
                <FileText className="h-2.5 w-2.5 text-primary" />
              </div>
              <div>
                <p className="text-[9px] font-mono text-primary uppercase tracking-wide">Elective</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{stats.elective}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-green-500/20 bg-green-500/5">
          <CardContent className="p-1.5">
            <div className="flex items-center gap-1.5">
              <div className="bg-green-500/10 border border-green-500/20 rounded p-0.5">
                <GraduationCap className="h-2.5 w-2.5 text-green-600" />
              </div>
              <div>
                <p className="text-[9px] font-mono text-green-600 uppercase tracking-wide">Active</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-red-500/20 bg-red-500/5">
          <CardContent className="p-1.5">
            <div className="flex items-center gap-1.5">
              <div className="bg-red-500/10 border border-red-500/20 rounded p-0.5">
                <X className="h-2.5 w-2.5 text-red-600" />
              </div>
              <div>
                <p className="text-[9px] font-mono text-red-600 uppercase tracking-wide">Inactive</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{stats.inactive}</p>
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
        <Card className="border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-primary/20">
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    Subject Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredSubjects.map((subject, index) => (
                  <tr 
                    key={subject.id}
                    className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all duration-150 cursor-pointer border-b border-slate-100 dark:border-slate-700/30 last:border-b-0"
                    onClick={() => setEditingSubject(subject)}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors"></div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                          {subject.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700/50 text-xs font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                        {subject.code || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {subject.department || <span className="text-slate-400 dark:text-slate-500 italic">Not assigned</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {subject.isActive ? (
                          <Badge 
                            variant="outline" 
                            className="text-xs px-2 py-0.5 border-green-500/30 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 font-medium"
                          >
                            Active
                          </Badge>
                        ) : (
                          <Badge 
                            variant="outline" 
                            className="text-xs px-2 py-0.5 border-red-500/30 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 font-medium"
                          >
                            Inactive
                          </Badge>
                        )}
                        {subject.isCompulsory && (
                          <Badge 
                            variant="outline" 
                            className="text-xs px-2 py-0.5 border-blue-500/30 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium"
                          >
                            Compulsory
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingSubject(subject)
                          }}
                          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary rounded-md transition-all"
                          title="Edit subject"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSubjectToDelete(subject)
                          }}
                          className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-all"
                          title="Delete subject"
                        >
                          <Trash2 className="h-4 w-4" />
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

