"use client"

import React, { useState } from "react";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  FileText, 
  Upload, 
  AlertCircle,
  CheckCircle,
  XCircle,
  BookOpen,
  User,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStudentTests } from '@/lib/student/useStudentTests';
import type { StudentAssignmentItem } from '@/lib/student/types';
import { submitMyTest } from '@/lib/student/studentTests';
import { uploadMultipleFiles } from '@/lib/services/upload';
import { toast } from 'sonner';
import SubmitAssignmentModal from './SubmitAssignmentModal';
import { StudentTestDetailModal } from './StudentTestDetailModal';

interface PendingAssignmentsComponentProps {
  subdomain: string;
  onBack: () => void;
}

export default function PendingAssignmentsComponent({ subdomain, onBack }: PendingAssignmentsComponentProps) {
  const { assignments, loading, error, refetch } = useStudentTests(subdomain);
  const [selectedAssignment, setSelectedAssignment] = useState<StudentAssignmentItem | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [detailTestId, setDetailTestId] = useState<string | null>(null);

  const handleSubmitAssignment = (assignment: StudentAssignmentItem) => {
    setSelectedAssignment(assignment);
    setShowSubmitModal(true);
  };

  const handleSubmitAssignmentSubmit = async (assignmentId: string, files: File[], comments: string) => {
    try {
      let fileUrl: string | undefined
      if (files.length > 0) {
        const uploads = await uploadMultipleFiles(files, 'submission', assignmentId, comments)
        fileUrl = uploads.map((u) => u.url).join(',')
      }

      await submitMyTest(subdomain, {
        testId: assignmentId,
        fileUrl,
        comments: comments.trim() || undefined,
      })

      await refetch()
      toast.success('Assignment submitted successfully!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit assignment')
      throw err
    }
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const isOverdue = due < today && status === 'pending';

    if (isOverdue || status === 'overdue') {
      return <Badge variant="destructive" className="bg-red-500">Overdue</Badge>;
    } else if (status === 'graded') {
      return <Badge variant="default" className="bg-purple-600">Graded</Badge>;
    } else if (status === 'submitted') {
      return <Badge variant="default" className="bg-green-500">Submitted</Badge>;
    } else {
      return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else {
      return `${diffDays} days remaining`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2 hover:bg-primary/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-bold">Pending Assignments</h2>
        </div>
        <Card className="bg-card border border-destructive/20">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground">{error}</p>
            <Button className="mt-4" onClick={() => void refetch()}>Try again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 hover:bg-primary/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-1">
            <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Pending Assignments
            </h2>
            <p className="text-sm text-muted-foreground/90 font-medium">
              {assignments.filter(a => a.status !== 'submitted').length} assignments to complete
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold">Total Assignments</span>
            </div>
            <div className="text-2xl font-bold mt-2">{assignments.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-semibold">Pending</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {assignments.filter(a => a.status === 'pending' && new Date(a.dueDate) >= new Date()).length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm font-semibold">Overdue</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {assignments.filter(a => a.status === 'overdue' || (a.status === 'pending' && new Date(a.dueDate) < new Date())).length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-semibold">Submitted</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {assignments.filter(a => a.status === 'submitted' || a.status === 'graded').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <Card className="bg-card border border-primary/20">
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Pending Assignments</h3>
              <p className="text-muted-foreground">You're all caught up! No assignments are currently pending.</p>
            </CardContent>
          </Card>
        ) : (
          assignments.map((assignment) => (
            <Card key={assignment.id} className="bg-card border border-primary/20 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{assignment.title}</h3>
                          <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                        </div>
                      </div>
                      {getStatusBadge(assignment.status, assignment.dueDate)}
                    </div>
                    
                    {assignment.description ? (
                      <p className="text-muted-foreground mb-4">{assignment.description}</p>
                    ) : null}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className={getDaysRemaining(assignment.dueDate).includes('overdue') ? 'text-red-500' : 'text-muted-foreground'}>
                          {getDaysRemaining(assignment.dueDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{assignment.teacher}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Max Score: {assignment.maxScore}</span>
                      </div>
                    </div>

                    {assignment.attachments && assignment.attachments.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Attachments:</p>
                        <div className="flex flex-wrap gap-2">
                          {assignment.attachments.map((attachment, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {attachment}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {assignment.status === 'graded' && assignment.grade != null && (
                      <div className="mt-4 rounded-lg border border-purple-200 bg-purple-50 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-purple-800 font-semibold">
                          <Award className="w-4 h-4" />
                          Score: {assignment.grade}/{assignment.maxScore}
                          {assignment.gradedAt ? (
                            <span className="text-xs font-normal text-purple-600">
                              · Graded {new Date(assignment.gradedAt).toLocaleDateString()}
                            </span>
                          ) : null}
                        </div>
                        {assignment.feedback ? (
                          <p className="text-sm text-purple-900">{assignment.feedback}</p>
                        ) : null}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 min-w-[120px]">
                    <Button
                      variant="outline"
                      onClick={() => setDetailTestId(assignment.id)}
                      className="w-full"
                    >
                      View details
                    </Button>
                    {assignment.status === 'pending' && (
                      <Button
                        onClick={() => handleSubmitAssignment(assignment)}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Submit
                      </Button>
                    )}
                    {assignment.status === 'submitted' && (
                      <Button variant="outline" className="w-full" disabled>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Awaiting grade
                      </Button>
                    )}
                    {assignment.status === 'graded' && (
                      <Button variant="outline" className="w-full" disabled>
                        <Award className="w-4 h-4 mr-2" />
                        {assignment.grade}/{assignment.maxScore}
                      </Button>
                    )}
                    {(assignment.status === 'overdue' || (assignment.status === 'pending' && new Date(assignment.dueDate) < new Date())) && (
                      <Button variant="destructive" className="w-full">
                        <XCircle className="w-4 h-4 mr-2" />
                        Overdue
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Test detail modal */}
      <StudentTestDetailModal
        subdomain={subdomain}
        testId={detailTestId}
        isOpen={Boolean(detailTestId)}
        onClose={() => setDetailTestId(null)}
        showSubmit={
          Boolean(
            detailTestId &&
              assignments.find((a) => a.id === detailTestId)?.status === 'pending',
          )
        }
        onSubmit={() => {
          const assignment = assignments.find((a) => a.id === detailTestId)
          if (assignment) {
            setDetailTestId(null)
            handleSubmitAssignment(assignment)
          }
        }}
      />

      {/* Submit Assignment Modal */}
      {selectedAssignment && (
        <SubmitAssignmentModal
          assignment={selectedAssignment}
          isOpen={showSubmitModal}
          onClose={() => {
            setShowSubmitModal(false);
            setSelectedAssignment(null);
          }}
          onSubmit={handleSubmitAssignmentSubmit}
        />
      )}
    </div>
  );
}
