"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Users,
  FileText,
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
  Hash,
} from "lucide-react";
import { graphqlClient } from "@/lib/graphql-client";
import { DynamicLogo } from "../../../parent/components/DynamicLogo";
import { tp } from "../../styles/portal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { TeacherTestSubmissionsPanel } from "../../components/TeacherTestSubmissionsPanel";

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
  status: "draft" | "published" | "completed";
  questions: Array<{
    id: string;
    text: string;
    imageUrls: string[] | null;
    marks: number;
    order: number;
    type: "multiple_choice" | "short_answer" | "true_false";
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
  const subdomain =
    typeof params.subdomain === "string"
      ? params.subdomain
      : Array.isArray(params.subdomain)
        ? params.subdomain[0]
        : "";
  const assignmentId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

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
        setError("Assignment ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await graphqlClient.request<AssignmentDetailResponse>(
          GET_ASSIGNMENT_BY_ID_QUERY,
          { id: assignmentId },
        );
        setAssignment(response.testById);
      } catch (err) {
        console.error("Error fetching assignment details:", err);
        setError("Failed to load assignment details. Please try again.");
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
        { id: assignmentId },
      );

      if (response.deleteExam) {
        // Successfully deleted, show success message and navigate back
        toast.success("Assignment deleted successfully");
        router.back();
      } else {
        throw new Error("Failed to delete assignment");
      }
    } catch (err) {
      console.error("Error deleting assignment:", err);
      toast.error("Failed to delete assignment. Please try again.");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return <CheckCircle2 className="w-4 h-4" />;
      case "short_answer":
        return <FileText className="w-4 h-4" />;
      case "true_false":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return "Multiple Choice";
      case "short_answer":
        return "Short Answer";
      case "true_false":
        return "True/False";
      default:
        return "Question";
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "image":
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileImage className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className={tp.page}>
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="tp-skeleton h-8 w-56 rounded-lg" />
          <div className="tp-skeleton h-40 w-full rounded-2xl" />
          <div className="tp-skeleton h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className={tp.page}>
        <Card className="mx-auto w-full max-w-md border-border/90">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/30">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Error Loading Assignment
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => {
                  setError(null);
                }}
                variant="outline"
              >
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
    <div className={tp.page}>
      <div className={tp.stack}>
        <header className="tp-reveal flex flex-col gap-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="tp-focus inline-flex w-fit items-center gap-1.5 rounded-full text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Assignments
          </button>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div className="min-w-0">
              <p className={tp.eyebrow}>Assignment</p>
              <h1 className="mt-2 font-display text-[1.95rem] leading-[1.08] tracking-[-0.015em] text-foreground text-balance sm:text-[2.3rem]">
                {assignment.title}
              </h1>
              <p className="mt-2 text-[13px] text-muted-foreground">
                {assignment.subject.subject.name}
                {assignment.gradeLevels.length > 0
                  ? ` · ${assignment.gradeLevels.map((g) => g.gradeLevel.name).join(", ")}`
                  : ""}
                {" · "}
                {formatDate(assignment.date)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="outline"
                className="h-10 rounded-full border-border/80 px-4 text-[12.5px] font-semibold"
                onClick={() => setShowA4Preview(true)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Preview as A4
              </Button>
              <Button
                variant="outline"
                className="h-10 rounded-full border-border/80 px-4 text-[12.5px] font-semibold text-muted-foreground hover:border-rose-200 hover:bg-rose-50/60 hover:text-rose-600"
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Assignment Overview */}
              <Card className="border-border/90 shadow-[0_1px_2px_rgba(20,32,28,0.04),0_20px_44px_-34px_rgba(20,32,28,0.35)]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-foreground">
                      Assignment Overview
                    </CardTitle>
                    <Badge
                      className={`${getStatusBadgeColor(assignment.status)} border`}
                    >
                      {assignment.status.charAt(0).toUpperCase() +
                        assignment.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Subject</p>
                        <p className="font-semibold text-foreground">
                          {assignment.subject.subject.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Grade Levels
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {assignment.gradeLevels.map((gradeLevel) => (
                            <Badge
                              key={gradeLevel.id}
                              variant="outline"
                              className="text-xs border-primary/30 text-primary"
                            >
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
                        <p className="font-semibold text-foreground">
                          {formatDate(assignment.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Time & Duration
                        </p>
                        <p className="font-semibold text-foreground">
                          {assignment.startTime &&
                            formatTime(assignment.startTime)}{" "}
                          • {assignment.duration} mins
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Marks
                        </p>
                        <p className="font-semibold text-foreground">
                          {assignment.totalMarks} points
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Hash className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Questions
                        </p>
                        <p className="font-semibold text-foreground">
                          {assignment.questions.length} questions
                        </p>
                      </div>
                    </div>
                  </div>

                  {assignment.instructions && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">
                          Instructions
                        </h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {assignment.instructions}
                        </p>
                      </div>
                    </>
                  )}

                  {assignment.resourceUrl && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">
                          Resource URL
                        </h4>
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
              <Card className="border-border/90 shadow-[0_1px_2px_rgba(20,32,28,0.04),0_20px_44px_-34px_rgba(20,32,28,0.35)]">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-foreground">
                    Questions ({assignment.questions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {assignment.questions
                    .sort((a, b) => a.order - b.order)
                    .map((question, index) => (
                      <div
                        key={question.id}
                        className="rounded-xl border border-border/70 p-4 space-y-4"
                      >
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
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-purple-200 text-purple-600"
                                  >
                                    AI Generated
                                  </Badge>
                                )}
                              </div>
                              <p className="text-foreground leading-relaxed mb-3">
                                {question.text}
                              </p>

                              {question.imageUrls &&
                                question.imageUrls.length > 0 && (
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                                    {question.imageUrls.map(
                                      (imageUrl, imgIndex) => (
                                        <img
                                          key={imgIndex}
                                          src={imageUrl}
                                          alt={`Question ${index + 1} image ${imgIndex + 1}`}
                                          className="w-full h-32 object-cover border border-primary/20"
                                        />
                                      ),
                                    )}
                                  </div>
                                )}

                              {question.options.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-muted-foreground">
                                    Options:
                                  </p>
                                  <div className="space-y-2">
                                    {question.options
                                      .sort((a, b) => a.order - b.order)
                                      .map((option) => (
                                        <div
                                          key={option.id}
                                          className={`flex items-center gap-3 p-2 border ${
                                            option.isCorrect
                                              ? "border-green-200 bg-green-50"
                                              : "border-primary/10 bg-background"
                                          }`}
                                        >
                                          <div
                                            className={`w-4 h-4 flex items-center justify-center text-xs ${
                                              option.isCorrect
                                                ? "text-green-600"
                                                : "text-muted-foreground"
                                            }`}
                                          >
                                            {option.isCorrect && (
                                              <CheckCircle2 className="w-3 h-3" />
                                            )}
                                          </div>
                                          <span className="text-foreground">
                                            {option.text}
                                          </span>
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
                            <Badge
                              variant="outline"
                              className="border-primary/30 text-primary"
                            >
                              {question.marks} pts
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>

              <TeacherTestSubmissionsPanel
                testId={assignment.id}
                maxMarks={assignment.totalMarks}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Teacher Info */}
              <Card className="border-border/90 shadow-[0_1px_2px_rgba(20,32,28,0.04),0_20px_44px_-34px_rgba(20,32,28,0.35)]">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Teacher
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold">
                      {assignment.teacher.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {assignment.teacher.name}
                      </p>
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
                <Card className="border-border/90 shadow-[0_1px_2px_rgba(20,32,28,0.04),0_20px_44px_-34px_rgba(20,32,28,0.35)]">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-foreground">
                      Reference Materials (
                      {assignment.referenceMaterials.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {assignment.referenceMaterials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-3 border border-primary/10 hover:bg-primary/5 transition-colors"
                      >
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
                          onClick={() =>
                            window.open(material.fileUrl, "_blank")
                          }
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
              <Card className="border-border/90 shadow-[0_1px_2px_rgba(20,32,28,0.04),0_20px_44px_-34px_rgba(20,32,28,0.35)]">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Created</p>
                    <p className="font-medium text-foreground">
                      {formatDate(assignment.createdAt)}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-medium text-foreground">
                      {formatDate(assignment.updatedAt)}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Assignment ID</p>
                    <p className="font-mono text-xs text-foreground">
                      {assignment.id}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{assignment?.title}"? This action
              cannot be undone. This will permanently delete the assignment and
              all associated questions and materials.
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
                <div className="text-2xl font-extrabold text-black mb-1">
                  {assignment.title}
                </div>
                <div className="text-lg italic text-gray-700">
                  {assignment.subject.subject.name} –{" "}
                  {assignment.gradeLevels
                    .map((g) => g.gradeLevel.name)
                    .join(", ")}
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-semibold text-black">
                  Assignment
                </div>
                <div className="text-sm text-gray-700">
                  Date: {formatDate(assignment.date)}
                </div>
                {assignment.startTime && (
                  <div className="text-sm text-gray-700">
                    Start: {formatTime(assignment.startTime)}
                  </div>
                )}
                <div className="text-sm text-gray-700">
                  Duration: {assignment.duration} min
                </div>
                <div className="text-sm text-gray-700">
                  Total Marks: {assignment.totalMarks}
                </div>
                {assignment.resourceUrl && (
                  <div className="text-sm text-gray-700">
                    Resource:{" "}
                    <a
                      href={assignment.resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#059669] underline"
                    >
                      {assignment.resourceUrl}
                    </a>
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
                  <div className="font-semibold text-gray-800">
                    Instructions:
                  </div>
                  <div className="whitespace-pre-wrap text-gray-700 mt-2">
                    {assignment.instructions}
                  </div>
                </div>
              )}
            </div>

            {/* Reference Materials */}
            {assignment.referenceMaterials.length > 0 && (
              <div className="w-full mb-6 p-4 bg-gray-50 border border-gray-200">
                <div className="font-semibold text-gray-800 mb-2">
                  Reference Materials:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {assignment.referenceMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <File className="w-4 h-4 text-[#0d9488]" />
                      <span>
                        {material.fileType.toUpperCase()} File (
                        {formatFileSize(material.fileSize)})
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  These files are available as reference materials for this
                  assignment
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
                    <div className="text-xs text-gray-500 mb-2">
                      ({question.marks} marks)
                    </div>

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
                            <div
                              key={option.id}
                              className="flex items-start gap-2"
                            >
                              <span className="font-bold text-black w-6">
                                {question.type === "true_false"
                                  ? oIdx === 0
                                    ? "T)"
                                    : "F)"
                                  : `${String.fromCharCode(65 + oIdx)})`}
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

                    {question.type === "short_answer" && (
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
