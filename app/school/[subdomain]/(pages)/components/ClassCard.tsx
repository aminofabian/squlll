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
    <Card className="w-full mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col">
          <CardTitle className="text-lg">
            {selectedGrade ? (
              <span>
                <span className="font-bold">{selectedGrade.name}</span>
                {selectedStream && <span> ({selectedStream.name})</span>} - {level.name}
              </span>
            ) : (
              <span>{level.name}</span>
            )}
          </CardTitle>
          <CardDescription>{level.description}</CardDescription>
          {selectedGrade && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Selected Grade: <strong>{selectedGrade.name}</strong>
                  {selectedStream && (
                    <> - Stream: <strong>{selectedStream.name}</strong></>
                  )}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 px-2 ml-2"
                        onClick={() => handleAddStream(selectedGrade.id)}
                      >
                        <Layers className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs">Add Stream</span>
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
                        className="h-7 px-2 ml-1"
                        onClick={() => handleAssignTeacherToGrade(selectedGrade.id, selectedGrade.name)}
                      >
                        <UserPlus className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs">Assign Teacher</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Assign a class teacher to this grade</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {/* Display streams for the selected grade */}
              {selectedGrade.streams && selectedGrade.streams.length > 0 && (
                <div className="ml-5 pl-4 border-l-2 border-gray-200">
                  <div className="text-xs font-medium text-gray-500 mb-2">STREAMS</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {selectedGrade.streams.map((stream) => (
                      <div
                        key={stream.id}
                        className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all duration-200 ${
                          selectedStream?.id === stream.id 
                            ? 'bg-primary/10 border-primary/30' 
                            : 'bg-gray-50 border-gray-200 hover:bg-primary/5 hover:border-primary/20'
                        }`}
                        onClick={() => handleStreamClick(stream.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="h-3 w-3 text-gray-400" />
                          <span className="text-sm font-medium">{stream.name}</span>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssignTeacherToStream(stream.id, stream.name);
                                }}
                              >
                                <UserPlus className="h-3 w-3" />
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
              )}
            </div>
          )}
        </div>

        {/* Fee Summary Section */}
        {selectedGrade && (
          <div className="mt-8 border-t-2 border-primary/20 pt-6">
            {feeSummaryLoading ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary animate-pulse" />
                  <h3 className="text-lg font-bold font-mono text-slate-700 dark:text-slate-300">
                    Loading Fee Summary...
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="border-2 border-primary/20 bg-slate-100 dark:bg-slate-700 p-6 space-y-3 animate-pulse">
                      <div className="h-4 bg-slate-300 dark:bg-slate-600 w-24"></div>
                      <div className="h-8 bg-slate-300 dark:bg-slate-600 w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : feeSummary ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200">
                      Financial Overview
                    </h3>
                  </div>
                  <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary font-mono">
                    {feeSummary.gradeLevelName}
                  </Badge>
                </div>

                {/* Summary Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="border-2 border-primary/20 bg-white dark:bg-slate-800 p-6 space-y-3 hover:border-primary/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-mono font-medium text-slate-600 dark:text-slate-400">
                        Total Students
                      </p>
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                      {feeSummary.totalStudents}
                    </p>
                  </div>

                  <div className="border-2 border-primary/20 bg-white dark:bg-slate-800 p-6 space-y-3 hover:border-orange-500/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-mono font-medium text-slate-600 dark:text-slate-400">
                        Total Owed
                      </p>
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                    </div>
                    <p className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                      {feeSummary.totalFeesOwed.toLocaleString()}
                    </p>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">KES</p>
                  </div>

                  <div className="border-2 border-primary/20 bg-white dark:bg-slate-800 p-6 space-y-3 hover:border-green-500/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-mono font-medium text-slate-600 dark:text-slate-400">
                        Total Paid
                      </p>
                      <TrendingDown className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {feeSummary.totalFeesPaid.toLocaleString()}
                    </p>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">KES</p>
                  </div>

                  <div className="border-2 border-primary/20 bg-white dark:bg-slate-800 p-6 space-y-3 hover:border-red-500/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-mono font-medium text-slate-600 dark:text-slate-400">
                        Outstanding
                      </p>
                      <DollarSign className="h-5 w-5 text-red-500" />
                    </div>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {feeSummary.totalBalance.toLocaleString()}
                    </p>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400">KES</p>
                  </div>
                </div>

                {/* Student Details Table */}
                {feeSummary.students.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-semibold font-mono text-slate-700 dark:text-slate-300">
                        Student Fee Breakdown
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFeeDetails(!showFeeDetails)}
                        className="border-primary/20 bg-white dark:bg-slate-800 text-primary hover:bg-primary/5 font-mono gap-2"
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
                        <div className="hidden lg:block border-2 border-primary/20 overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-primary/10 border-b-2 border-primary/20">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                  Admission
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                  Student Name
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                  Owed
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                  Paid
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                  Balance
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                  Fee Items
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-primary/20">
                              {feeSummary.students.map((student) => (
                                <tr key={student.admissionNumber} className="hover:bg-primary/5 transition-colors">
                                  <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-slate-700 dark:text-slate-300">
                                    {student.admissionNumber}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-slate-200">
                                    {student.studentName}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-mono text-slate-700 dark:text-slate-300">
                                    {student.feeSummary.totalOwed.toLocaleString()}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-mono text-green-600 dark:text-green-400">
                                    {student.feeSummary.totalPaid.toLocaleString()}
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-mono text-red-600 dark:text-red-400 font-semibold">
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
                                                className="text-xs font-mono cursor-help border-primary/20"
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

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-4">
                          {feeSummary.students.map((student) => (
                            <div 
                              key={student.admissionNumber} 
                              className="border-2 border-primary/20 bg-white dark:bg-slate-800 p-4 space-y-4"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-slate-800 dark:text-slate-200">
                                    {student.studentName}
                                  </p>
                                  <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
                                    {student.admissionNumber}
                                  </p>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`border-2 font-mono ${
                                    student.feeSummary.balance === 0 
                                      ? 'border-green-500 text-green-600 dark:text-green-400' 
                                      : 'border-red-500 text-red-600 dark:text-red-400'
                                  }`}
                                >
                                  {student.feeSummary.balance === 0 ? 'Paid' : 'Pending'}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <p className="text-xs font-mono text-slate-600 dark:text-slate-400">Owed</p>
                                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                                    {student.feeSummary.totalOwed.toLocaleString()}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-mono text-slate-600 dark:text-slate-400">Paid</p>
                                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                    {student.feeSummary.totalPaid.toLocaleString()}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-mono text-slate-600 dark:text-slate-400">Balance</p>
                                  <p className="text-lg font-bold text-red-600 dark:text-red-400">
                                    {student.feeSummary.balance.toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-primary/20">
                                <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mb-2">Fee Items</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {student.feeSummary.feeItems.map((item, itemIndex) => (
                                    <TooltipProvider key={itemIndex}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Badge 
                                            variant={item.isMandatory ? "default" : "outline"}
                                            className="text-xs font-mono cursor-help border-primary/20"
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
          </div>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsExpanded(!isExpanded)}
                className="relative group"
              >
                <div className="absolute -left-24 top-1/2 -translate-y-1/2 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {isExpanded ? 'Hide subjects' : 'Show subjects'}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{isExpanded ? 'Hide subjects list' : 'Show subjects list'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
              >
                All
              </Button>
              <Button
                variant={selectedFilter === 'core' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('core')}
              >
                Core
              </Button>
              <Button
                variant={selectedFilter === 'optional' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('optional')}
              >
                Optional
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleAddSubject}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubjects.map((subject) => (
              <div
                key={subject.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{subject.name}</div>
                  <div className="text-sm text-gray-500">{subject.code}</div>
                  <Badge variant="outline" className="mt-1">
                    {subject.subjectType}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditSubject(subject)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSubject(subject.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
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
    </Card>
  );
}