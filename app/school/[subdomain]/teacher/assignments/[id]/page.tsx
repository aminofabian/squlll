"use client"

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft,
  BookOpen, 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  Edit,
  Trash2,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileImage,
  File,
  ExternalLink,
  User,
  Mail,
  GraduationCap,
  Target,
  Timer,
  Hash
} from "lucide-react";
import { graphqlClient } from "@/lib/graphql-client";
import { DynamicLogo } from '../../../parent/components/DynamicLogo';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

// TypeScript interfaces for the assignment detail data - matching the actual API schema
interface AssignmentDetail {
  id: string;
  title: string;
  subject: {
    id: string;
    subject: {
      name: string;
    };
  };
  gradeLevels: Array<{
    id: string;
    gradeLevel: {
      name: string;
    };
  }>;
  date: string;
  startTime: string | null;
  endTime: string | null;
  duration: number;
  totalMarks: number;
  resourceUrl: string | null;
  instructions: string;
  status: 'draft' | 'published' | 'completed';
  questions: Array<{
    id: string;
    text: string;
    imageUrls: string[] | null;
    marks: number;
    order: number;
    type: 'multiple_choice' | 'short_answer' | 'true_false';
    aiPrompt: string | null;
    isAIGenerated: boolean;
    options: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
      imageUrl: string | null;
      order: number;
    }>;
  }>;
  referenceMaterials: Array<{
    id: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    createdAt: string;
  }>;
  teacher: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AssignmentDetailResponse {
  testById: AssignmentDetail;
}

interface DeleteAssignmentResponse {
  deleteExam: boolean;
}

// GraphQL query to get assignment details by ID - matching the actual API schema
const GET_ASSIGNMENT_BY_ID_QUERY = `
  query TestById($id: String!) {
    testById(id: $id) {
      id
      title
      subject {
        id
        subject {
          name
        }
      }
      gradeLevels {
        id
        gradeLevel {
          name
        }
      }
      date
      startTime
      endTime
      duration
      totalMarks
      resourceUrl
      instructions
      status
      questions {
        id
        text
        imageUrls
        marks
        order
        type
        aiPrompt
        isAIGenerated
        options {
          id
          text
          isCorrect
          imageUrl
          order
        }
      }
      referenceMaterials {
        id
        fileUrl
        fileType
        fileSize
        createdAt
      }
      teacher {
        id
        name
        email
      }
      createdAt
      updatedAt
    }
  }
`;

// GraphQL mutation to delete assignment
const DELETE_ASSIGNMENT_MUTATION = `
  mutation DeleteAssignment($id: String!) {
    deleteExam(id: $id)
  }
`;

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = typeof params.subdomain === 'string' ? params.subdomain : Array.isArray(params.subdomain) ? params.subdomain[0] : '';
  const assignmentId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  // State management
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showA4Preview, setShowA4Preview] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch assignment details on component mount
  useEffect(() => {
    const fetchAssignment = async () => {
      if (!assignmentId) {
        setError('Assignment ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await graphqlClient.request<AssignmentDetailResponse>(
          GET_ASSIGNMENT_BY_ID_QUERY,
          { id: assignmentId }
        );
        setAssignment(response.testById);
      } catch (err) {
        console.error('Error fetching assignment details:', err);
        setError('Failed to load assignment details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  // Delete assignment function
  const handleDeleteAssignment = async () => {
    if (!assignmentId || !assignment) return;

    try {
      setDeleting(true);
      const response = await graphqlClient.request<DeleteAssignmentResponse>(
        DELETE_ASSIGNMENT_MUTATION,
        { id: assignmentId }
      );

      if (response.deleteExam) {
        // Successfully deleted, show success message and navigate back
        toast.success('Assignment deleted successfully');
        router.back();
      } else {
        throw new Error('Failed to delete assignment');
      }
    } catch (err) {
      console.error('Error deleting assignment:', err);
      toast.error('Failed to delete assignment. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'short_answer':
        return <FileText className="w-4 h-4" />;
      case 'true_false':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'short_answer':
        return 'Short Answer';
      case 'true_false':
        return 'True/False';
      default:
        return 'Question';
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'image':
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-white to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading assignment details...</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-white to-primary/5 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Assignment</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => router.back()} variant="default">
                Back to Assignments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-primary/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-card/95 via-white/90 to-primary/10 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-primary/20 sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-6 lg:px-10 lg:py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Assignments
              </Button>
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <BookOpen className="w-6 h-6 text-primary-foreground text-white" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {assignment.title}
                </h1>
                <p className="text-sm text-muted-foreground/90 font-medium">
                  Assignment Details & Questions
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="border-gray-300 hover:bg-gray-50"
                onClick={() => setShowA4Preview(true)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Preview as A4
              </Button>
              <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                className="border-red-200 hover:bg-red-50 hover:text-red-600"
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 lg:px-8 lg:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="w-full flex justify-center py-6 mb-8">
            <DynamicLogo subdomain={subdomain} size="lg" showText={true} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Assignment Overview */}
              <Card className="border-primary/20 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-foreground">Assignment Overview</CardTitle>
                    <Badge className={`${getStatusBadgeColor(assignment.status)} border`}>
                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Subject</p>
                        <p className="font-semibold text-foreground">{assignment.subject.subject.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Grade Levels</p>
                        <div className="flex flex-wrap gap-1">
                          {assignment.gradeLevels.map((gradeLevel) => (
                            <Badge key={gradeLevel.id} variant="outline" className="text-xs border-primary/30 text-primary">
                              {gradeLevel.gradeLevel.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-semibold text-foreground">{formatDate(assignment.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Time & Duration</p>
                        <p className="font-semibold text-foreground">
                          {assignment.startTime && formatTime(assignment.startTime)} • {assignment.duration} mins
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Marks</p>
                        <p className="font-semibold text-foreground">{assignment.totalMarks} points</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Hash className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Questions</p>
                        <p className="font-semibold text-foreground">{assignment.questions.length} questions</p>
                      </div>
                    </div>
                  </div>
                  
                  {assignment.instructions && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Instructions</h4>
                        <p className="text-muted-foreground leading-relaxed">{assignment.instructions}</p>
                      </div>
                    </>
                  )}

                  {assignment.resourceUrl && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Resource URL</h4>
                        <a 
                          href={assignment.resourceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {assignment.resourceUrl}
                        </a>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Questions */}
              <Card className="border-primary/20 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-foreground">
                    Questions ({assignment.questions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {assignment.questions
                    .sort((a, b) => a.order - b.order)
                    .map((question, index) => (
                    <div key={question.id} className="border border-primary/10 p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-8 h-8 bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getQuestionTypeIcon(question.type)}
                              <Badge variant="secondary" className="text-xs">
                                {getQuestionTypeLabel(question.type)}
                              </Badge>
                              {question.isAIGenerated && (
                                <Badge variant="outline" className="text-xs border-purple-200 text-purple-600">
                                  AI Generated
                                </Badge>
                              )}
                            </div>
                            <p className="text-foreground leading-relaxed mb-3">{question.text}</p>
                            
                            {question.imageUrls && question.imageUrls.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                                {question.imageUrls.map((imageUrl, imgIndex) => (
                                  <img
                                    key={imgIndex}
                                    src={imageUrl}
                                    alt={`Question ${index + 1} image ${imgIndex + 1}`}
                                    className="w-full h-32 object-cover border border-primary/20"
                                  />
                                ))}
                              </div>
                            )}

                            {question.options.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Options:</p>
                                <div className="space-y-2">
                                  {question.options
                                    .sort((a, b) => a.order - b.order)
                                    .map((option) => (
                                    <div
                                      key={option.id}
                                      className={`flex items-center gap-3 p-2 border ${
                                        option.isCorrect
                                          ? 'border-green-200 bg-green-50'
                                          : 'border-primary/10 bg-background'
                                      }`}
                                    >
                                      <div className={`w-4 h-4 flex items-center justify-center text-xs ${
                                        option.isCorrect ? 'text-green-600' : 'text-muted-foreground'
                                      }`}>
                                        {option.isCorrect && <CheckCircle2 className="w-3 h-3" />}
                                      </div>
                                      <span className="text-foreground">{option.text}</span>
                                      {option.imageUrl && (
                                        <img
                                          src={option.imageUrl}
                                          alt="Option image"
                                          className="w-8 h-8 object-cover border border-primary/20"
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="border-primary/30 text-primary">
                            {question.marks} pts
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Teacher Info */}
              <Card className="border-primary/20 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">Teacher</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold">
                      {assignment.teacher.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{assignment.teacher.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {assignment.teacher.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reference Materials */}
              {assignment.referenceMaterials.length > 0 && (
                <Card className="border-primary/20 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-foreground">
                      Reference Materials ({assignment.referenceMaterials.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {assignment.referenceMaterials.map((material) => (
                      <div key={material.id} className="flex items-center justify-between p-3 border border-primary/10 hover:bg-primary/5 transition-colors">
                        <div className="flex items-center gap-3">
                          {getFileIcon(material.fileType)}
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {material.fileType.toUpperCase()} File
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(material.fileSize)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(material.fileUrl, '_blank')}
                          className="hover:bg-primary/10"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Assignment Metadata */}
              <Card className="border-primary/20 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium text-foreground">{formatDate(assignment.createdAt)}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-medium text-foreground">{formatDate(assignment.updatedAt)}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Assignment ID</p>
                    <p className="font-mono text-xs text-foreground">{assignment.id}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{assignment?.title}"? This action cannot be undone.
              This will permanently delete the assignment and all associated questions and materials.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAssignment}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Assignment
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* A4 Preview Modal */}
      {showA4Preview && assignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 print:bg-transparent">
          <div className="relative bg-white font-serif shadow-2xl border-0 w-[210mm] h-[297mm] max-w-full max-h-full overflow-auto p-12 print:w-full print:h-full print:shadow-none print:border-none">
            <div className="absolute top-4 right-4 flex gap-2 print:hidden">
              <button
                className="bg-blue-600 text-white px-4 py-2 font-bold shadow-lg hover:bg-blue-700"
                onClick={() => window.print()}
              >
                Print
              </button>
              <button
                className="bg-[#246a59] text-white px-4 py-2 font-bold shadow-lg hover:bg-[#1a4c40]"
                onClick={() => setShowA4Preview(false)}
              >
                Close
              </button>
            </div>
            
            <div className="flex flex-col items-center mb-6">
              <DynamicLogo subdomain={subdomain} size="lg" showText={true} />
            </div>

            {/* Header */}
            <div className="w-full flex flex-row items-start justify-between mb-2">
              <div>
                <div className="text-2xl font-extrabold text-black mb-1">{assignment.title}</div>
                <div className="text-lg italic text-gray-700">
                  {assignment.subject.subject.name} – {assignment.gradeLevels.map(g => g.gradeLevel.name).join(', ')}
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-semibold text-black">Assignment</div>
                <div className="text-sm text-gray-700">Date: {formatDate(assignment.date)}</div>
                {assignment.startTime && (
                  <div className="text-sm text-gray-700">Start: {formatTime(assignment.startTime)}</div>
                )}
                <div className="text-sm text-gray-700">Duration: {assignment.duration} min</div>
                <div className="text-sm text-gray-700">Total Marks: {assignment.totalMarks}</div>
                {assignment.resourceUrl && (
                  <div className="text-sm text-gray-700">
                    Resource: <a href={assignment.resourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#059669] underline">{assignment.resourceUrl}</a>
                  </div>
                )}
              </div>
            </div>

            <hr className="w-full border-t border-gray-300 my-4" />

            {/* Instructions */}
            <div className="w-full text-center text-sm italic text-gray-600 mb-6">
              Read all questions carefully before answering.
              {assignment.instructions && (
                <div className="mt-4 text-left">
                  <div className="font-semibold text-gray-800">Instructions:</div>
                  <div className="whitespace-pre-wrap text-gray-700 mt-2">{assignment.instructions}</div>
                </div>
              )}
            </div>

            {/* Reference Materials */}
            {assignment.referenceMaterials.length > 0 && (
              <div className="w-full mb-6 p-4 bg-gray-50 border border-gray-200">
                <div className="font-semibold text-gray-800 mb-2">Reference Materials:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {assignment.referenceMaterials.map((material) => (
                    <div key={material.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <File className="w-4 h-4 text-[#0d9488]" />
                      <span>{material.fileType.toUpperCase()} File ({formatFileSize(material.fileSize)})</span>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  These files are available as reference materials for this assignment
                </div>
              </div>
            )}

            {/* Questions */}
            <ol className="list-decimal pl-6 w-full space-y-6">
              {assignment.questions
                .sort((a, b) => a.order - b.order)
                .map((question, idx) => (
                <li key={question.id} className="text-black text-base mb-2">
                  <div className="mb-2 font-medium">{question.text}</div>
                  <div className="text-xs text-gray-500 mb-2">({question.marks} marks)</div>
                  
                  {question.imageUrls && question.imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {question.imageUrls.map((imageUrl, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={imageUrl}
                          alt={`Question ${idx + 1} image ${imgIndex + 1}`}
                          className="w-full h-32 object-cover border border-gray-300"
                        />
                      ))}
                    </div>
                  )}

                  {question.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                      {question.options
                        .sort((a, b) => a.order - b.order)
                        .map((option, oIdx) => (
                        <div key={option.id} className="flex items-start gap-2">
                          <span className="font-bold text-black w-6">
                            {question.type === 'true_false' 
                              ? (oIdx === 0 ? "T)" : "F)") 
                              : `${String.fromCharCode(65 + oIdx)})`
                            }
                          </span>
                          <span className="text-black">{option.text}</span>
                          {option.imageUrl && (
                            <img
                              src={option.imageUrl}
                              alt="Option image"
                              className="w-8 h-8 object-cover border border-gray-300 ml-2"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'short_answer' && (
                    <div className="mt-4">
                      <div className="border-b border-gray-300 pb-8"></div>
                    </div>
                  )}
                </li>
              ))}
            </ol>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-300 text-center text-xs text-gray-500">
              <div>Teacher: {assignment.teacher.name}</div>
              <div>Created: {formatDate(assignment.createdAt)}</div>
            </div>
          </div>
          
          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              .print\\:bg-transparent { background: transparent !important; }
              .print\\:w-full { width: 100% !important; }
              .print\\:h-full { height: 100% !important; }
              .print\\:shadow-none { box-shadow: none !important; }
              .print\\:border-none { border: none !important; }
              .print\\:hidden { display: none !important; }
              .print\\:block { display: block !important; }
              .print-area, .print-area * { visibility: visible !important; }
              .print-area { position: absolute !important; left: 0; top: 0; width: 100vw !important; height: 100vh !important; background: white !important; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
