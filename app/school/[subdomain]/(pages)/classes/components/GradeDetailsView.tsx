"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Layers, 
  GraduationCap,
  DollarSign,
} from 'lucide-react'
import { useGradeLevelFeeSummary } from '@/lib/hooks/useGradeLevelFeeSummary'
import type { GradeLevel } from '@/lib/types/school-config'

interface GradeDetailsViewProps {
  grade: GradeLevel
  levelName: string
  selectedStreamId?: string
}

export function GradeDetailsView({ grade, levelName, selectedStreamId }: GradeDetailsViewProps) {
  // Fetch student data for this grade
  const { data: feeSummary, isLoading: studentsLoading } = useGradeLevelFeeSummary(grade.id)

  const selectedStream = selectedStreamId && grade.streams
    ? grade.streams.find(s => s.id === selectedStreamId)
    : null

  return (
    <div className="space-y-6">
      {/* Grade Header Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                {grade.name}
                {selectedStream && (
                  <>
                    <span className="text-slate-400">/</span>
                    <span className="text-lg">{selectedStream.name}</span>
                  </>
                )}
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {levelName} • {grade.streams?.length || 0} {(grade.streams?.length || 0) === 1 ? 'stream' : 'streams'}
              </p>
            </div>
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary px-3 py-1.5">
              Grade Level
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <Card className="border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-mono text-primary uppercase tracking-wide mb-1">
                  Total Students
                </p>
                {studentsLoading ? (
                  <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {feeSummary?.totalStudents || 0}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Streams Count */}
        <Card className="border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-3">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-mono text-primary uppercase tracking-wide mb-1">
                  Streams
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {grade.streams?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fees Owed */}
        <Card className="border-2 border-green-500/20 bg-green-500/5 hover:bg-green-500/10 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-500/10 border-2 border-green-500/20 rounded-lg p-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-mono text-green-600 uppercase tracking-wide mb-1">
                  Fees Owed
                </p>
                {studentsLoading ? (
                  <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    KES {feeSummary?.totalFeesOwed?.toLocaleString() || '0'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fees Paid */}
        <Card className="border-2 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/10 border-2 border-blue-500/20 rounded-lg p-3">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-mono text-blue-600 uppercase tracking-wide mb-1">
                  Fees Paid
                </p>
                {studentsLoading ? (
                  <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                ) : (
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    KES {feeSummary?.totalFeesPaid?.toLocaleString() || '0'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Streams List */}
      {grade.streams && Array.isArray(grade.streams) && grade.streams.length > 0 && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Streams ({grade.streams.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {grade.streams.map((stream) => (
                <div
                  key={stream.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedStreamId === stream.id
                      ? 'border-primary bg-primary/10'
                      : 'border-primary/20 bg-primary/5 hover:border-primary/40 hover:bg-primary/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {stream.name}
                      </span>
                    </div>
                    {selectedStreamId === stream.id && (
                      <Badge className="bg-primary text-white">Selected</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}

