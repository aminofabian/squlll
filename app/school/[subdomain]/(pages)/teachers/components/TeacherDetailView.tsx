"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  User, 
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Award,
  Calendar,
  School,
  BookOpen,
  Info,
  Copy,
  RefreshCw,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useTeacherDetailSummary } from "@/lib/hooks/useTeacherDetailSummary";

interface TeacherDetailViewProps {
  teacherId: string;
  onClose?: () => void;
}

export function TeacherDetailView({ teacherId, onClose }: TeacherDetailViewProps) {
  const { teacherDetail, loading, error, refetch } = useTeacherDetailSummary(teacherId);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)] mx-auto" />
          <p className="text-sm font-mono text-[var(--color-textSecondary)]">Loading teacher details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !teacherDetail) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-[var(--color-error)] mx-auto" />
          <p className="text-sm font-mono text-[var(--color-error)]">{error || 'Teacher not found'}</p>
          <Button onClick={refetch} variant="outline" size="sm" className="font-mono border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface)]">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const teacher = teacherDetail;

  return (
    <div className="space-y-6">
      {/* Back button and header */}
      {onClose && (
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex items-center gap-2 border-[var(--color-border)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/40 font-mono"
          >
            ← Back to Teachers
          </Button>
        
        </div>
      )}
      
      {/* Teacher profile header */}
      <div className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Teacher photo */}
          <div className="flex-shrink-0">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--color-primary)]/20">
              <div className="w-full h-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                <User className="h-12 w-12 text-[var(--color-primary)]" />
              </div>
              
              <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white ${
                teacher.isActive ? 'bg-[var(--color-success)]' : 'bg-[var(--color-textSecondary)]'
              }`} />
            </div>
          </div>
          
          {/* Teacher basic info */}
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-mono font-bold tracking-wide text-[var(--color-text)]">{teacher.fullName || teacher.user.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-[var(--color-textSecondary)] font-mono">
                {teacher.department && (
                  <div className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                    <span>{teacher.department}</span>
                  </div>
                )}
                {teacher.role && (
                  <div className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                    <span>{teacher.role}</span>
                  </div>
                )}
                {teacher.tenantGradeLevels.length > 0 && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                    <span>{teacher.tenantGradeLevels.map(g => g.gradeLevel?.name || 'Unknown').join(', ')}</span>
                  </div>
                )}
                {teacher.tenantSubjects.length > 0 && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                    <span>{teacher.tenantSubjects.length} Subject{teacher.tenantSubjects.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <Badge className={`font-mono text-xs capitalize border-2 ${
                teacher.isActive 
                  ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20' 
                  : 'bg-[var(--color-textSecondary)]/10 text-[var(--color-textSecondary)] border-[var(--color-textSecondary)]/20'
              }`}>
                {teacher.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      {/* Teacher details tabs */}
      <Tabs defaultValue="details">
        <TabsList className="grid grid-cols-3 mb-6 border-2 border-[var(--color-border)] bg-[var(--color-surface)] rounded-xl p-1">
          <TabsTrigger value="details" className="font-mono text-xs data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-white data-[state=active]:shadow-sm">Details</TabsTrigger>
          <TabsTrigger value="academic" className="font-mono text-xs data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-white data-[state=active]:shadow-sm">Academic</TabsTrigger>
          <TabsTrigger value="assignments" className="font-mono text-xs data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-white data-[state=active]:shadow-sm">Assignments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] rounded-xl shadow-sm">
            <CardHeader className="border-b-2 border-[var(--color-border)] bg-[var(--color-primary)]/5">
              <CardTitle className="font-mono font-bold tracking-wide text-[var(--color-text)]">Teacher Information</CardTitle>
              <CardDescription className="font-mono text-[var(--color-textSecondary)]">
                Detailed personal information about {teacher.fullName || teacher.user.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personal Information */}
                <div className="border-2 border-[var(--color-border)] bg-[var(--color-primary)]/5 rounded-xl p-6">
                  <div className="inline-block w-fit px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-md mb-4">
                    <h3 className="text-xs font-mono uppercase tracking-wide text-[var(--color-primary)] flex items-center gap-2">
                      <User className="h-3 w-3" />
                      Personal Information
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]/20">
                      <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)]">Full Name</div>
                      <div className="font-mono text-sm text-[var(--color-text)] text-right">{teacher.fullName || teacher.user.name}</div>
                    </div>
                    {teacher.gender && (
                      <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]/20">
                        <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)]">Gender</div>
                        <div className="font-mono text-sm text-[var(--color-text)] capitalize">{teacher.gender.toLowerCase()}</div>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2">
                      <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)]">Status</div>
                      <Badge className={`font-mono text-xs capitalize ${
                        teacher.isActive 
                          ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20' 
                          : 'bg-[var(--color-textSecondary)]/10 text-[var(--color-textSecondary)] border-[var(--color-textSecondary)]/20'
                      }`}>
                        {teacher.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="border-2 border-[var(--color-border)] bg-[var(--color-primary)]/5 rounded-xl p-6">
                  <div className="inline-block w-fit px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-md mb-4">
                    <h3 className="text-xs font-mono uppercase tracking-wide text-[var(--color-primary)] flex items-center gap-2">
                      <Award className="h-3 w-3" />
                      Professional Information
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {teacher.department && (
                      <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]/20">
                        <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)]">Department</div>
                        <div className="font-mono text-sm text-[var(--color-text)]">{teacher.department}</div>
                      </div>
                    )}
                    {teacher.role && (
                      <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]/20">
                        <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)]">Role</div>
                        <div className="font-mono text-sm text-[var(--color-text)] capitalize">{teacher.role}</div>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2">
                      <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)]">School</div>
                      <div className="font-mono text-sm text-[var(--color-text)]">{teacher.tenant.name}</div>
                    </div>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="border-2 border-[var(--color-border)] bg-[var(--color-primary)]/5 rounded-xl p-6">
                  <div className="inline-block w-fit px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-md mb-4">
                    <h3 className="text-xs font-mono uppercase tracking-wide text-[var(--color-primary)] flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      Contact Information
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start py-2 border-b border-[var(--color-border)]/20">
                      <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)] flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                      <div className="flex items-center gap-2 max-w-[60%]">
                        <div className="font-mono text-sm text-[var(--color-text)] text-right break-all">{teacher.email || teacher.user.email}</div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 hover:bg-[var(--color-primary)]/10 shrink-0"
                          onClick={() => navigator.clipboard.writeText(teacher.email || teacher.user.email)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {teacher.phoneNumber && (
                      <div className="flex justify-between items-center py-2">
                        <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)] flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="font-mono text-sm text-[var(--color-text)]">{teacher.phoneNumber}</div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 hover:bg-[var(--color-primary)]/10"
                            onClick={() => navigator.clipboard.writeText(teacher.phoneNumber || '')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {!teacher.phoneNumber && (
                      <div className="text-xs font-mono text-[var(--color-textSecondary)] italic py-2">
                        No phone number provided
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="academic">
          <Card className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] rounded-xl shadow-sm">
            <CardHeader className="border-b-2 border-[var(--color-border)] bg-[var(--color-primary)]/5">
              <CardTitle className="font-mono font-bold tracking-wide text-[var(--color-text)]">Academic Information</CardTitle>
              <CardDescription className="font-mono text-[var(--color-textSecondary)]">
                Subjects, grade levels, and streams assigned to {teacher.fullName || teacher.user.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Subjects Section */}
                {teacher.tenantSubjects.length > 0 && (
                  <div className="border-2 border-[var(--color-border)] bg-[var(--color-primary)]/5 rounded-xl p-6">
                    <div className="inline-block w-fit px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-md mb-4">
                      <h3 className="text-xs font-mono uppercase tracking-wide text-[var(--color-primary)] flex items-center">
                        <BookOpen className="h-3 w-3 mr-2" />
                        Subjects Taught
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {teacher.tenantSubjects.map((subject) => (
                        <Badge key={subject.id} variant="outline" className="bg-green-50 text-green-700 border-green-200 font-mono text-xs">
                          {subject.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grade Levels Section */}
                {teacher.tenantGradeLevels.length > 0 && (
                  <div className="border-2 border-[var(--color-border)] bg-[var(--color-primary)]/5 rounded-xl p-6">
                    <div className="inline-block w-fit px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-md mb-4">
                      <h3 className="text-xs font-mono uppercase tracking-wide text-[var(--color-primary)] flex items-center">
                        <GraduationCap className="h-3 w-3 mr-2" />
                        Grade Levels
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {teacher.tenantGradeLevels.map((gradeLevel) => (
                        <Badge key={gradeLevel.id} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-mono text-xs">
                          {gradeLevel.gradeLevel?.name || 'Unknown Grade Level'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Streams Section */}
                {teacher.tenantStreams.length > 0 && (
                  <div className="border-2 border-[var(--color-border)] bg-[var(--color-primary)]/5 rounded-xl p-6">
                    <div className="inline-block w-fit px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-md mb-4">
                      <h3 className="text-xs font-mono uppercase tracking-wide text-[var(--color-primary)] flex items-center">
                        <School className="h-3 w-3 mr-2" />
                        Streams
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {teacher.tenantStreams.map((stream) => (
                        <Badge key={stream.id} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-mono text-xs">
                          Stream {stream.id.slice(-4)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {teacher.tenantSubjects.length === 0 && teacher.tenantGradeLevels.length === 0 && teacher.tenantStreams.length === 0 && (
                  <div className="text-center p-8 text-[var(--color-textSecondary)] font-mono text-sm">
                    No academic information available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assignments">
          <Card className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] rounded-xl shadow-sm">
            <CardHeader className="border-b-2 border-[var(--color-border)] bg-[var(--color-primary)]/5">
              <CardTitle className="font-mono font-bold tracking-wide text-[var(--color-text)]">Class Teacher Assignments</CardTitle>
              <CardDescription className="font-mono text-[var(--color-textSecondary)]">
                Classes where {teacher.fullName || teacher.user.name} serves as class teacher
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {teacher.classTeacherAssignments.length > 0 ? (
                <div className="space-y-4">
                  {teacher.classTeacherAssignments.map((assignment) => (
                    <div key={assignment.id} className="border-2 border-[var(--color-border)] bg-[var(--color-primary)]/5 rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <School className="h-4 w-4 text-[var(--color-primary)]" />
                        <div className="font-mono text-sm text-[var(--color-text)]">
                          {assignment.gradeLevel?.gradeLevel?.name || 'Unknown Grade Level'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-[var(--color-textSecondary)] font-mono text-sm">
                  No class teacher assignments found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
