"use client"

import React, { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { 
  GraduationCap, 
  Layers, 
  BookOpen, 
  Users,
  School,
  Activity
} from 'lucide-react'
import type { SchoolConfiguration } from '@/lib/types/school-config'

interface ClassesStatsProps {
  config: SchoolConfiguration | null
  isLoading?: boolean
}

export function ClassesStats({ config, isLoading }: ClassesStatsProps) {
  const stats = useMemo(() => {
    if (!config?.selectedLevels) {
      return {
        totalLevels: 0,
        totalGrades: 0,
        totalStreams: 0,
        totalSubjects: 0,
        averageGradesPerLevel: 0,
        averageStreamsPerGrade: 0
      }
    }

    const levels = config.selectedLevels
    const totalLevels = levels.length
    
    // Calculate total grades across all levels
    const totalGrades = levels.reduce((sum, level) => {
      return sum + (level.gradeLevels?.length || 0)
    }, 0)

    // Calculate total streams across all grades
    const totalStreams = levels.reduce((sum, level) => {
      const streamsInLevel = level.gradeLevels?.reduce((gradeSum, grade) => {
        return gradeSum + (grade.streams?.length || 0)
      }, 0) || 0
      return sum + streamsInLevel
    }, 0)

    // Get unique subjects across all levels
    const subjectSet = new Set<string>()
    levels.forEach(level => {
      level.subjects.forEach(subject => {
        subjectSet.add(subject.id)
      })
    })
    const totalSubjects = subjectSet.size

    const averageGradesPerLevel = totalLevels > 0 ? Math.round((totalGrades / totalLevels) * 10) / 10 : 0
    const averageStreamsPerGrade = totalGrades > 0 ? Math.round((totalStreams / totalGrades) * 10) / 10 : 0

    return {
      totalLevels,
      totalGrades,
      totalStreams,
      totalSubjects,
      averageGradesPerLevel,
      averageStreamsPerGrade
    }
  }, [config])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-2">
                <span className="text-xs font-mono uppercase tracking-wide text-primary">
                  Loading...
                </span>
              </div>
              <h2 className="text-2xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
                Classes Overview
              </h2>
            </div>
            <div className="bg-primary/10 border-2 border-primary/20 rounded-xl p-3 animate-pulse">
              <Activity className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6 animate-pulse">
              <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-2">
              <span className="text-xs font-mono uppercase tracking-wide text-primary">
                Classes Overview
              </span>
            </div>
            <h2 className="text-2xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
              Real-time Statistics
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Comprehensive insights about your school's class structure
            </p>
          </div>
          <div className="bg-primary/10 border-2 border-primary/20 rounded-xl p-3">
            <Activity className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Levels */}
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-2">
              <School className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-medium text-primary uppercase tracking-wide">Total Levels</h3>
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-slate-900 dark:text-slate-100 mb-2">
            {stats.totalLevels.toLocaleString()}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Educational levels configured
          </p>
        </div>

        {/* Total Grades */}
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-2">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-medium text-primary uppercase tracking-wide">Total Grades</h3>
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-slate-900 dark:text-slate-100 mb-2">
            {stats.totalGrades.toLocaleString()}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Grade levels across all levels
          </p>
        </div>

        {/* Total Streams */}
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-2">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-medium text-primary uppercase tracking-wide">Total Streams</h3>
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-slate-900 dark:text-slate-100 mb-2">
            {stats.totalStreams.toLocaleString()}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Class streams available
          </p>
        </div>

        {/* Total Subjects */}
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-2">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-medium text-primary uppercase tracking-wide">Total Subjects</h3>
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-slate-900 dark:text-slate-100 mb-2">
            {stats.totalSubjects.toLocaleString()}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Unique subjects across all levels
          </p>
        </div>

        {/* Average Grades Per Level */}
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-medium text-primary uppercase tracking-wide">Avg Grades/Level</h3>
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-slate-900 dark:text-slate-100 mb-2">
            {stats.averageGradesPerLevel}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Average grades per educational level
          </p>
        </div>

        {/* Average Streams Per Grade */}
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-2">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-medium text-primary uppercase tracking-wide">Avg Streams/Grade</h3>
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-slate-900 dark:text-slate-100 mb-2">
            {stats.averageStreamsPerGrade}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Average streams per grade level
          </p>
        </div>
      </div>
    </div>
  )
}

