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
import { useParams, useRouter } from 'next/navigation';

// TypeScript interfaces for the assignment detail data based on testById API response
interface AssignmentDetail {
  id: string;
  title: string;
  subject: string;
  gradeLevels: Array<{
    id: string;
    name: string;
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

// GraphQL query to get assignment details by ID - matches the testById query structure provided
const GET_ASSIGNMENT_BY_ID_QUERY = `
  query TestById($id: String!) {
    testById(id: $id) {
      id
      title
      subject
      gradeLevels {
        id
        name
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

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subdomain = typeof params.subdomain === 'string' ? params.subdomain : Array.isArray(params.subdomain) ? params.subdomain[0] : '';
  const assignmentId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  // State management
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
              <Button onClick={() => router.push(`/school/${subdomain}/teacher/assignments`)} variant="default">
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
                onClick={() => router.push(`/school/${subdomain}/teacher/assignments`)}
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
              <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" className="border-red-200 hover:bg-red-50 hover:text-red-600">
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
                        <p className="font-semibold text-foreground">{assignment.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Grade Levels</p>
                        <div className="flex flex-wrap gap-1">
                          {assignment.gradeLevels.map((grade) => (
                            <Badge key={grade.id} variant="outline" className="text-xs border-primary/30 text-primary">
                              {grade.name}
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
    </div>
  );
}
