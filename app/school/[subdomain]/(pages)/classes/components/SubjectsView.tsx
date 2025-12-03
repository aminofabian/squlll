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
  Layers
} from 'lucide-react'
import { useTenantSubjects, TenantSubject } from '@/lib/hooks/useTenantSubjects'
import { EditSubjectDialog } from '../../components/EditSubjectDialog'

export function SubjectsView() {
  const { data: tenantSubjects = [], isLoading } = useTenantSubjects()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'core' | 'elective' | 'active' | 'inactive'>('all')
  const [editingSubject, setEditingSubject] = useState<TenantSubject | null>(null)

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
  }, [tenantSubjects, searchTerm, selectedFilter])

  const stats = useMemo(() => {
    const total = tenantSubjects.length
    const core = tenantSubjects.filter(s => s.subjectType === 'core').length
    const elective = tenantSubjects.filter(s => s.subjectType === 'elective').length
    const active = tenantSubjects.filter(s => s.isActive).length
    const inactive = tenantSubjects.filter(s => !s.isActive).length

    return { total, core, elective, active, inactive }
  }, [tenantSubjects])

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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-2">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-mono text-primary uppercase tracking-wide">Total</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-2">
                <BookMarked className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-mono text-primary uppercase tracking-wide">Core</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.core}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-mono text-primary uppercase tracking-wide">Elective</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.elective}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/20 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/10 border-2 border-green-500/20 rounded-lg p-2">
                <GraduationCap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-mono text-green-600 uppercase tracking-wide">Active</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-500/20 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/10 border-2 border-red-500/20 rounded-lg p-2">
                <X className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-mono text-red-600 uppercase tracking-wide">Inactive</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search subjects by name, code, category, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-primary/20"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
                className="border-primary/20"
              >
                All
              </Button>
              <Button
                variant={selectedFilter === 'core' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('core')}
                className="border-primary/20"
              >
                Core
              </Button>
              <Button
                variant={selectedFilter === 'elective' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('elective')}
                className="border-primary/20"
              >
                Elective
              </Button>
              <Button
                variant={selectedFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('active')}
                className="border-primary/20"
              >
                Active
              </Button>
              <Button
                variant={selectedFilter === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('inactive')}
                className="border-primary/20"
              >
                Inactive
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedFilter !== 'all') && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm font-semibold text-primary">Active Filters:</span>
              {searchTerm && (
                <Badge variant="outline" className="flex gap-2 items-center border-primary/20 bg-primary/5 text-primary px-3 py-1.5">
                  <span>Search: "{searchTerm}"</span>
                  <X className="h-4 w-4 cursor-pointer hover:text-red-500 transition-colors" onClick={() => setSearchTerm('')} />
                </Badge>
              )}
              {selectedFilter !== 'all' && (
                <Badge variant="outline" className="flex gap-2 items-center border-primary/20 bg-primary/5 text-primary px-3 py-1.5">
                  <span>Type: {selectedFilter}</span>
                  <X className="h-4 w-4 cursor-pointer hover:text-red-500 transition-colors" onClick={() => setSelectedFilter('all')} />
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedFilter('all')
                }}
                className="text-slate-600 dark:text-slate-400 hover:text-red-600 hover:border-red-500/20"
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subjects Grid */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((subject) => (
            <Card
              key={subject.id}
              className="border-2 border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => setEditingSubject(subject)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {subject.name}
                    </CardTitle>
                    {subject.code && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                        {subject.code}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={subject.subjectType === 'core' ? 'default' : 'outline'}
                    className={subject.subjectType === 'core' 
                      ? 'bg-primary text-white border-primary' 
                      : 'border-primary/20 text-primary bg-primary/5'
                    }
                  >
                    {subject.subjectType === 'core' ? 'Core' : 'Elective'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {subject.curriculum && (
                    <div className="flex items-center gap-2 text-sm">
                      <Layers className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">
                        {subject.curriculum.name}
                      </span>
                    </div>
                  )}
                  {subject.category && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">
                        {subject.category}
                      </span>
                    </div>
                  )}
                  {subject.department && (
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">
                        {subject.department}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      {subject.isCompulsory && (
                        <Badge variant="outline" className="text-xs border-green-500/20 text-green-600 bg-green-500/5">
                          Compulsory
                        </Badge>
                      )}
                      {subject.isActive ? (
                        <Badge variant="outline" className="text-xs border-green-500/20 text-green-600 bg-green-500/5">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs border-red-500/20 text-red-600 bg-red-500/5">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    {subject.totalMarks && (
                      <span className="text-xs text-slate-500">
                        {subject.totalMarks} marks
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Subject Dialog */}
      {editingSubject && (
        <EditSubjectDialog
          subject={editingSubject}
          open={!!editingSubject}
          onOpenChange={(open) => !open && setEditingSubject(null)}
        />
      )}
    </div>
  )
}

