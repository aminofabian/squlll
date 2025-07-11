"use client"

import React, { useState, useEffect } from "react";
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
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SubmitAssignmentModal from './SubmitAssignmentModal';

interface Assignment {
  id: string;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'overdue' | 'submitted';
  teacher: string;
  maxScore: number;
  attachments?: string[];
}

// Mock assignments data
const mockAssignments: Assignment[] = [
  {
    id: "1",
    subject: "Mathematics",
    title: "Algebra Problem Set",
    description: "Complete problems 1-20 in Chapter 5. Show all work and solutions.",
    dueDate: "2024-01-25",
    status: "pending",
    teacher: "Mr. Johnson",
    maxScore: 100,
    attachments: ["algebra_chapter5.pdf"]
  },
  {
    id: "2",
    subject: "English Literature",
    title: "Essay on Shakespeare",
    description: "Write a 1000-word essay analyzing the themes in Hamlet.",
    dueDate: "2024-01-20",
    status: "overdue",
    teacher: "Ms. Smith",
    maxScore: 50,
    attachments: ["hamlet_analysis_guide.pdf"]
  },
  {
    id: "3",
    subject: "Science",
    title: "Lab Report - Chemical Reactions",
    description: "Complete the lab report for the chemical reactions experiment.",
    dueDate: "2024-01-28",
    status: "pending",
    teacher: "Dr. Brown",
    maxScore: 75,
    attachments: ["lab_manual.pdf", "safety_guidelines.pdf"]
  },
  {
    id: "4",
    subject: "History",
    title: "Research Paper - World War II",
    description: "Research and write a 1500-word paper on a specific aspect of WWII.",
    dueDate: "2024-01-30",
    status: "pending",
    teacher: "Mr. Davis",
    maxScore: 100,
    attachments: ["research_guidelines.pdf", "citation_guide.pdf"]
  }
];

interface PendingAssignmentsComponentProps {
  onBack: () => void;
}

export default function PendingAssignmentsComponent({ onBack }: PendingAssignmentsComponentProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch assignments
    setTimeout(() => {
      setAssignments(mockAssignments);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSubmitAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmitModal(true);
  };

  const handleSubmitAssignmentSubmit = async (assignmentId: string, files: File[], comments: string) => {
    // Simulate API call to submit assignment
    console.log('Submitting assignment:', { assignmentId, files, comments });
    
    // Update the assignment status in the local state
    setAssignments(prev => prev.map(assignment => 
      assignment.id === assignmentId 
        ? { ...assignment, status: 'submitted' as const }
        : assignment
    ));
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert('Assignment submitted successfully!');
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const isOverdue = due < today && status === 'pending';

    if (isOverdue) {
      return <Badge variant="destructive" className="bg-red-500">Overdue</Badge>;
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
              {assignments.length} assignments to complete
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
              {assignments.filter(a => a.status === 'pending' && new Date(a.dueDate) < new Date()).length}
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
              {assignments.filter(a => a.status === 'submitted').length}
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
                    
                    <p className="text-muted-foreground mb-4">{assignment.description}</p>
                    
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
                  </div>
                  
                  <div className="flex flex-col gap-2 min-w-[120px]">
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
                        Submitted
                      </Button>
                    )}
                    {assignment.status === 'pending' && new Date(assignment.dueDate) < new Date() && (
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