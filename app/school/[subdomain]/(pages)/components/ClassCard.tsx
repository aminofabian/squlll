'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, ChevronDown, ChevronUp, Edit, Plus, Trash2, GraduationCap, Layers, UserPlus, DollarSign, Users, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react'
import type { Level, Subject, GradeLevel } from '@/lib/types/school-config'
import { useState, useMemo } from 'react'
import { EditSubjectDialog } from './EditSubjectDialog'
import { useTenantSubjects, TenantSubject } from '@/lib/hooks/useTenantSubjects'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import CreateClassDrawer from "@/app/school/components/CreateClassDrawer"
import { AddStreamModal } from './AddStreamModal'
import { AssignTeacherModal } from './AssignTeacherModal'
import { useGradeLevelFeeSummary } from '@/lib/hooks/useGradeLevelFeeSummary'

interface ClassCardProps {
  level: Level;
  selectedGradeId?: string;
  selectedStreamId?: string;
  onStreamSelect?: (streamId: string, gradeId: string, levelId: string) => void;
}

// Helper function to get component level color
function getComponentLevelColor(name: string) {
  switch(name.toLowerCase()) {
    case 'madrasa lower': return 'bg-purple-100 text-purple-800 border-purple-400';
    case 'madrasa beginners': return 'bg-custom-blue/10 text-custom-blue border-custom-blue/40';
    default: return 'bg-gray-100 text-gray-800 border-gray-400';
  }
}

export function ClassHeader() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Classes</h2>
        <p className="text-muted-foreground">
          Manage class information and subjects across all levels
        </p>
      </div>
      <div className="flex items-center gap-2">
        <CreateClassDrawer onClassCreated={() => {
          // Refresh class list or show success message
          console.log('Class created successfully');
        }} />
      </div>
    </div>
  )
}

export function ClassCard({ level, selectedGradeId, selectedStreamId, onStreamSelect }: ClassCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'core' | 'optional'>('all')
  const [editingSubject, setEditingSubject] = useState<TenantSubject | null>(null)
  const [showFeeDetails, setShowFeeDetails] = useState(true)
  
  // Load tenant subjects instead of using school config subjects
  const { data: tenantSubjects = [], isLoading: subjectsLoading } = useTenantSubjects()
  
  // Load fee summary for the selected grade
  const { data: feeSummary, isLoading: feeSummaryLoading } = useGradeLevelFeeSummary(selectedGradeId || null)
  
  const [showStreamModal, setShowStreamModal] = useState(false)
  const [selectedGradeForStream, setSelectedGradeForStream] = useState<GradeLevel | null>(null)
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false)
  const [assignTeacherData, setAssignTeacherData] = useState<{
    streamId?: string
    streamName?: string
    gradeLevelId?: string
    gradeName?: string
  }>({})  

  // Transform tenant subjects to match the Subject interface for compatibility
  const transformedSubjects = useMemo(() => {
    return tenantSubjects.map(ts => ({
      id: ts.id, // Use tenant subject ID
      name: ts.subject?.name || ts.customSubject?.name || 'Unknown Subject',
      code: ts.subject?.code || ts.customSubject?.code || '',
      subjectType: ts.subjectType === 'core' ? 'core' : 'optional',
      category: ts.subject?.category || ts.customSubject?.category,
      department: ts.subject?.department || ts.customSubject?.department,
      shortName: ts.subject?.shortName || ts.customSubject?.shortName,
      isCompulsory: ts.isCompulsory,
      totalMarks: ts.totalMarks,
      passingMarks: ts.passingMarks,
      creditHours: ts.creditHours,
      curriculum: ts.curriculum.name,
      // Store the original tenant subject for editing
      _tenantSubject: ts
    }));
  }, [tenantSubjects]);

  // Filter subjects based on selected grade, stream, and filter type
  const filteredSubjects = useMemo(() => {
    let subjects = transformedSubjects;

    // First filter based on selected type
    subjects = subjects.filter(subject => {
      if (selectedFilter === 'all') return true;
      return selectedFilter === 'core' ? subject.subjectType === 'core' : subject.subjectType !== 'core';
    });
    
    // If there's a selected stream, we could add stream-specific filtering here
    // For now, streams share the same subjects as their grades/levels
    // This is where you would add custom stream-subject filtering logic if needed
    
    // Then sort: core subjects first, then by name within each group
    return subjects.sort((a, b) => {
      // First sort by type (core comes first)
      if (a.subjectType === 'core' && b.subjectType !== 'core') return -1;
      if (a.subjectType !== 'core' && b.subjectType === 'core') return 1;
      
      // Then sort alphabetically by name within each group
      return a.name.localeCompare(b.name);
    });
  }, [transformedSubjects, selectedFilter]);

  // Get the selected grade and stream if any
  const selectedGrade = useMemo(() => {
    if (!selectedGradeId) return null;
    return level.gradeLevels?.find(grade => grade.id === selectedGradeId) || null;
  }, [level.gradeLevels, selectedGradeId]);
  
  const selectedStream = useMemo(() => {
    if (!selectedStreamId || !selectedGrade) return null;
    return selectedGrade.streams?.find(stream => stream.id === selectedStreamId) || null;
  }, [selectedGrade, selectedStreamId]);

  const handleDeleteSubject = (subjectId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete subject:', subjectId);
  };

  const handleAddSubject = () => {
    // TODO: Implement add subject functionality
    console.log('Add new subject to level:', level.id);
  };

  const handleEditSubject = (subject: any) => {
    // Extract the original tenant subject from our transformed subject
    const tenantSubject = subject._tenantSubject;
    setEditingSubject(tenantSubject);
  };

  const handleSaveSubject = (updatedSubject: Subject) => {
    // TODO: Implement save functionality
    console.log('Save updated subject:', updatedSubject);
  };

  const handleAddStream = (gradeId: string) => {
    const grade = level.gradeLevels?.find(g => g.id === gradeId);
    if (grade) {
      setSelectedGradeForStream(grade);
      setShowStreamModal(true);
    }
  };

  const handleAssignTeacherToStream = (streamId: string, streamName: string) => {
    setAssignTeacherData({
      streamId,
      streamName,
    });
    setShowAssignTeacherModal(true);
  };

  const handleAssignTeacherToGrade = (gradeLevelId: string, gradeName: string) => {
    setAssignTeacherData({
      gradeLevelId,
      gradeName,
    });
    setShowAssignTeacherModal(true);
  };

  const handleStreamClick = (streamId: string) => {
    if (onStreamSelect && selectedGrade) {
      onStreamSelect(streamId, selectedGrade.id, level.id);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Main Level Card */}
      <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary"></div>
                  <span>{level.name}</span>
                </div>
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {level.description}
              </CardDescription>
          </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                ) : (
                      <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                )}
              </Button>
            </TooltipTrigger>
                <TooltipContent>
              <p>{isExpanded ? 'Hide subjects list' : 'Show subjects list'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
          </div>
      </CardHeader>

      {isExpanded && (
          <CardContent className="pt-0">
            <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
                  className="h-8 px-3 text-xs font-medium"
              >
                All
              </Button>
              <Button
                variant={selectedFilter === 'core' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('core')}
                  className="h-8 px-3 text-xs font-medium"
              >
                Core
              </Button>
              <Button
                variant={selectedFilter === 'optional' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('optional')}
                  className="h-8 px-3 text-xs font-medium"
              >
                Optional
              </Button>
            </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddSubject}
                className="h-8 px-3 text-xs font-medium border-primary/20 hover:bg-primary/5"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Subject
            </Button>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSubjects.map((subject) => (
              <div
                key={subject.id}
                  className="group flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-primary/30 transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      {subject.name}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      {subject.code}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs font-medium ${
                        subject.subjectType === 'core' 
                          ? 'border-primary/30 text-primary bg-primary/5' 
                          : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                    {subject.subjectType}
                  </Badge>
                </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditSubject(subject)}
                      className="h-7 w-7 p-0 hover:bg-primary/10"
                  >
                      <Edit className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSubject(subject.id)}
                      className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                  >
                      <Trash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
      </Card>

      {/* Grade Information Card */}
      {selectedGrade && (
        <Card className="shadow-sm border-0 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {selectedGrade.name}
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    {selectedStream ? `Stream: ${selectedStream.name}` : 'Grade Level Information'}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-3 border-primary/30 hover:bg-primary/10"
                        onClick={() => handleAddStream(selectedGrade.id)}
                      >
                        <Layers className="h-3.5 w-3.5 mr-1.5" />
                        <span className="text-xs font-medium">Add Stream</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add a new stream to this grade</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-3 border-primary/30 hover:bg-primary/10"
                        onClick={() => handleAssignTeacherToGrade(selectedGrade.id, selectedGrade.name)}
                      >
                        <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                        <span className="text-xs font-medium">Assign Teacher</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Assign a class teacher to this grade</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardHeader>

          {/* Streams Section */}
          {selectedGrade.streams && selectedGrade.streams.length > 0 && (
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Available Streams
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedGrade.streams.map((stream) => (
                    <div
                      key={stream.id}
                      className={`group flex items-center justify-between p-3 border cursor-pointer transition-all duration-200 ${
                        selectedStream?.id === stream.id 
                          ? 'bg-primary/20 border-primary/50 shadow-sm' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:bg-primary/10 hover:border-primary/40 hover:shadow-sm'
                      }`}
                      onClick={() => handleStreamClick(stream.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 ${
                          selectedStream?.id === stream.id ? 'bg-primary' : 'bg-slate-400'
                        }`}></div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {stream.name}
                        </span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignTeacherToStream(stream.id, stream.name);
                              }}
                            >
                              <UserPlus className="h-3.5 w-3.5 text-slate-500 hover:text-primary" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Assign class teacher to {stream.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Fee Summary Card */}
      {selectedGrade && (
        <Card className="shadow-sm border-0 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-900/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    Financial Overview
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Fee summary for {selectedGrade.name}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary font-medium">
                {selectedGrade.name}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {feeSummaryLoading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-slate-100 dark:bg-slate-800 p-4 space-y-3 animate-pulse">
                      <div className="h-4 bg-slate-300 dark:bg-slate-600 w-24"></div>
                      <div className="h-8 bg-slate-300 dark:bg-slate-600 w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : feeSummary ? (
              <div className="space-y-6">
                {/* Summary Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 hover:border-primary/30 hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Total Students
                      </p>
                      <div className="p-1.5 bg-primary/10">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                      {feeSummary.totalStudents}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 hover:border-orange-400/50 hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Total Owed
                      </p>
                      <div className="p-1.5 bg-orange-100 dark:bg-orange-900/20">
                        <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                      {feeSummary.totalFeesOwed.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">KES</p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 hover:border-green-400/50 hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Total Paid
                      </p>
                      <div className="p-1.5 bg-green-100 dark:bg-green-900/20">
                        <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {feeSummary.totalFeesPaid.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">KES</p>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 hover:border-red-400/50 hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Outstanding
                      </p>
                      <div className="p-1.5 bg-red-100 dark:bg-red-900/20">
                        <DollarSign className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {feeSummary.totalBalance.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">KES</p>
                  </div>
                </div>

                {/* Student Details Table */}
                {feeSummary.students.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-semibold text-slate-700 dark:text-slate-300">
                        Student Fee Breakdown
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFeeDetails(!showFeeDetails)}
                        className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 gap-2"
                      >
                        {showFeeDetails ? (
                          <>
                            <EyeOff className="h-4 w-4" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            Show Details
                          </>
                        )}
                      </Button>
                    </div>

                    {showFeeDetails && (
                      <>
                        {/* Desktop Table View */}
                        <div className="hidden lg:block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                    Admission
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                    Student Name
                                  </th>
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                    Owed
                                  </th>
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                    Paid
                                  </th>
                                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                    Balance
                                  </th>
                                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                    Fee Items
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                {feeSummary.students.map((student) => (
                                  <tr key={student.admissionNumber} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-700 dark:text-slate-300">
                                      {student.admissionNumber}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-slate-200">
                                      {student.studentName}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-medium text-slate-700 dark:text-slate-300">
                                      {student.feeSummary.totalOwed.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600 dark:text-green-400">
                                      {student.feeSummary.totalPaid.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-semibold text-red-600 dark:text-red-400">
                                      {student.feeSummary.balance.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-4">
                                      <div className="flex flex-wrap gap-1.5 justify-center max-w-xs mx-auto">
                                        {student.feeSummary.feeItems.map((item, itemIndex) => (
                                          <TooltipProvider key={itemIndex}>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Badge 
                                                  variant={item.isMandatory ? "default" : "outline"}
                                                  className="text-xs font-medium cursor-help border-slate-200 dark:border-slate-600"
                                                >
                                                  {item.feeBucketName}
                                                </Badge>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <div className="space-y-1">
                                                  <p className="font-semibold">{item.feeBucketName}</p>
                                                  <p className="text-xs">Amount: KES {item.amount.toLocaleString()}</p>
                                                  <p className="text-xs">{item.isMandatory ? '✓ Mandatory' : '○ Optional'}</p>
                                                </div>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        ))}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-3">
                          {feeSummary.students.map((student) => (
                            <div 
                              key={student.admissionNumber} 
                              className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 space-y-4"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                                    {student.studentName}
                                  </p>
                                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {student.admissionNumber}
                                  </p>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`border-2 font-medium ${
                                    student.feeSummary.balance === 0 
                                      ? 'border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
                                      : 'border-red-500 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                                  }`}
                                >
                                  {student.feeSummary.balance === 0 ? 'Paid' : 'Pending'}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Owed</p>
                                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                                    {student.feeSummary.totalOwed.toLocaleString()}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Paid</p>
                                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                    {student.feeSummary.totalPaid.toLocaleString()}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Balance</p>
                                  <p className="text-lg font-bold text-red-600 dark:text-red-400">
                                    {student.feeSummary.balance.toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-slate-200 dark:border-slate-600">
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Fee Items</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {student.feeSummary.feeItems.map((item, itemIndex) => (
                                    <TooltipProvider key={itemIndex}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Badge 
                                            variant={item.isMandatory ? "default" : "outline"}
                                            className="text-xs font-medium cursor-help border-slate-200 dark:border-slate-600"
                                          >
                                            {item.feeBucketName}
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <div className="space-y-1">
                                            <p className="font-semibold">{item.feeBucketName}</p>
                                            <p className="text-xs">Amount: KES {item.amount.toLocaleString()}</p>
                                            <p className="text-xs">{item.isMandatory ? '✓ Mandatory' : '○ Optional'}</p>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

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
          onClose={() => setEditingSubject(null)}
          onSave={handleSaveSubject}
          isOpen={!!editingSubject}
          tenantSubjectId={editingSubject.id}
        />
      )}

      {selectedGradeForStream && (
        <AddStreamModal
          isOpen={showStreamModal}
          onClose={() => {
            setShowStreamModal(false);
            setSelectedGradeForStream(null);
          }}
          onSuccess={() => {
            // The modal now handles revalidation automatically
            console.log('Stream created successfully');
          }}
          gradeId={selectedGradeForStream.id}
          gradeName={selectedGradeForStream.name}
        />
      )}

      <AssignTeacherModal
        isOpen={showAssignTeacherModal}
        onClose={() => {
          setShowAssignTeacherModal(false);
          setAssignTeacherData({});
        }}
        onSuccess={() => {
          console.log('Teacher assigned successfully');
        }}
        streamId={assignTeacherData.streamId}
        streamName={assignTeacherData.streamName}
        gradeLevelId={assignTeacherData.gradeLevelId}
        gradeName={assignTeacherData.gradeName}
      />
    </div>
  );
}